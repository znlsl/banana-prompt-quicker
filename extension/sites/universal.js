window.BananaSites = window.BananaSites || {};

class UniversalSite extends window.BananaSites.Base {
    constructor() {
        super();
        this.lastFocusedElement = null;
        this.trackFocusedElement();
    }

    trackFocusedElement() {
        document.addEventListener('focusin', (e) => {
            if (this.isEditableElement(e.target)) {
                this.lastFocusedElement = e.target;
            }
        });
    }

    isEditableElement(el) {
        if (!el) return false;
        return el.tagName === 'TEXTAREA' ||
            (el.tagName === 'INPUT' && ['text', 'search', 'email', 'url'].includes(el.type)) ||
            el.isContentEditable;
    }

    async findPromptInput() {
        if (this.lastFocusedElement && this.isEditableElement(this.lastFocusedElement)) {
            return this.lastFocusedElement;
        }

        const active = document.activeElement;
        if (this.isEditableElement(active)) {
            return active;
        }
        return null;
    }

    async insertPrompt(promptText) {
        const el = await this.findPromptInput();
        if (!el || !this.isEditableElement(el)) {
            alert('🍌 请先点击输入框，然后再右键选择 Banana Prompts');
            return;
        }

        if (el.isContentEditable) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();

                const lines = promptText.split('\n');
                const fragment = document.createDocumentFragment();

                lines.forEach((line, index) => {
                    fragment.appendChild(document.createTextNode(line));
                    if (index < lines.length - 1) {
                        fragment.appendChild(document.createElement('br'));
                    }
                });

                range.insertNode(fragment);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                const htmlContent = promptText.split('\n').map(line => {
                    const escaped = line
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    return `<p>${escaped || '<br>'}</p>`;
                }).join('');
                el.innerHTML += htmlContent;
            }
            el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const currentValue = el.value;

            const newValue = currentValue.substring(0, start) + promptText + currentValue.substring(end);
            el.value = newValue;

            const newCursorPos = start + promptText.length;
            el.setSelectionRange(newCursorPos, newCursorPos);

            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.focus();
        }

        if (this.modal) {
            this.modal.hide();
        }
    }

    // Universal adapter doesn't need a button
    ensureButton() { return false; }
    waitForElements() { }
};

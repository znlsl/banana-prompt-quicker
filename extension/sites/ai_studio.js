window.BananaSites = window.BananaSites || {};

class AIStudioSite extends window.BananaSites.Base {
    async findPromptInput() {
        return this.findElement('aistudio', 'promptInput', 'ms-prompt-input-wrapper textarea');
    }

    async findTargetButton() {
        return this.findElement('aistudio', 'insertButton', 'ms-run-button button');
    }

    getCurrentTheme() {
        return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    }

    createButton() {
        const wrapper = document.createElement('div');
        wrapper.className = 'button-wrapper';

        const btn = document.createElement('button');
        btn.id = 'banana-btn';
        btn.className = 'mat-mdc-tooltip-trigger ms-button-borderless ms-button-icon';

        const updateButtonTheme = () => {
            const colors = this.getThemeColors();
            btn.style.cssText = `width: 40px; height: 40px; border-radius: 50%; border: none; background: ${colors.hover}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-right: 8px; transition: background-color 0.2s;`;
        };

        updateButtonTheme();
        btn.title = '快捷提示';
        btn.textContent = '🍌';

        btn.addEventListener('mouseenter', () => {
            btn.style.background = this.getThemeColors().border;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = this.getThemeColors().hover;
        });

        btn.addEventListener('click', () => {
            if (this.modal) this.modal.show();
        });

        wrapper.appendChild(btn);
        return wrapper;
    }

    insertButton(btn, target) {
        const p = target.parentElement
        p.parentElement.insertBefore(btn, p)
    }

    async insertPrompt(promptText) {
        const textarea = await this.findPromptInput();
        if (textarea) {
            textarea.value = promptText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
            const length = promptText.length;
            textarea.setSelectionRange(length, length);
            if (this.modal) this.modal.hide();
        }
    }
};

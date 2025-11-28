window.BananaSites = window.BananaSites || {};

class GeminiSite extends window.BananaSites.Base {
    async findPromptInput() {
        return this.findElement('gemini', 'promptInput', 'div.ql-editor[contenteditable="true"]');

    }

    async findTargetButton() {
        return this.findElement('gemini', 'insertButton', 'button.toolbox-drawer-item-deselect-button:has(img.img-icon)');
    }

    getCurrentTheme() {
        return document.body.classList.contains('dark-theme') ||
            document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    createButton() {
        const isMobile = window.innerWidth <= 768;
        const btn = document.createElement('button');
        btn.id = 'banana-btn';
        btn.className = 'mat-mdc-button mat-mdc-button-base mat-unthemed';

        const updateButtonTheme = () => {
            const colors = this.getThemeColors();
            const mobile = window.innerWidth <= 768;
            btn.style.cssText = `
                height: 40px;
                ${mobile ? 'width: 40px;' : ''}
                border-radius: ${mobile ? '50%' : '20px'};
                border: none;
                background: transparent;
                color: ${colors.text};
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
                margin-left: 4px;
                transition: background-color 0.2s;
                padding: ${mobile ? '0' : '0 16px'};
                gap: ${mobile ? '0' : '8px'};
            `;
        };

        updateButtonTheme();
        btn.title = '快捷提示';
        btn.innerHTML = isMobile
            ? '<span style="font-size: 18px;">🍌</span>'
            : '<span style="font-size: 16px;">🍌</span><span>Prompts</span>';

        btn.addEventListener('mouseenter', () => {
            btn.style.background = this.getThemeColors().hover;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
        });

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.modal) this.modal.show();
        });

        return btn;
    }

    async insertPrompt(promptText) {
        const textarea = await this.findPromptInput();
        if (textarea) {
            const lines = promptText.split('\n');
            const htmlContent = lines.map(line => {
                const escaped = line
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                return `<p>${escaped || '<br>'}</p>`;
            }).join('');

            textarea.innerHTML = htmlContent;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            textarea.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(textarea);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);

            if (this.modal) this.modal.hide();
        }
    }
};

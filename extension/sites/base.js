window.BananaSites = window.BananaSites || {};

window.BananaSites.Base = class BaseWebsite {
    constructor() {
        this.modal = null;
        this._buttonInserting = false;
        this._pollTimer = null;
    }

    getCurrentTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getThemeColors() {
        const theme = this.getCurrentTheme();
        if (theme === 'dark') {
            return {
                background: '#141414',
                surface: '#1c1c1e',
                border: '#38383a',
                text: '#f5f5f7',
                textSecondary: '#98989d',
                primary: '#0a84ff',
                hover: '#2c2c2e',
                inputBg: '#1c1c1e',
                inputBorder: '#38383a',
                shadow: 'rgba(0,0,0,0.5)'
            };
        }
        return {
            background: '#ffffff',
            surface: '#f5f5f7',
            border: '#d2d2d7',
            text: '#1d1d1f',
            textSecondary: '#6e6e73',
            primary: '#007aff',
            hover: '#e8e8ed',
            inputBg: '#ffffff',
            inputBorder: '#d2d2d7',
            shadow: 'rgba(0,0,0,0.1)'
        };
    }

    async getRemoteSelector(platform, type) {
        if (window.ConfigManager) {
            const c = await window.ConfigManager.get();
            return c?.selectors?.[platform]?.[type];
        }
        return null;
    }

    async findElement(platform, type, localSelector) {
        let el = document.querySelector(localSelector);
        if (el) return el;

        // Fallback.
        const s = await this.getRemoteSelector(platform, type);
        return document.querySelector(s);
    }

    async findPromptInput() { return null; }
    async findTargetButton() { return null; }
    createButton() { return null; }
    insertButton(btn, target) {
        target.insertAdjacentElement('afterend', btn)
    }

    async _insertButtonIfNotExists() {
        if (document.getElementById('banana-btn')) return true;

        try {
            const target = await this.findTargetButton();
            if (!target) return false;

            const btn = this.createButton();
            if (!btn) return false;

            this.insertButton(btn, target);
            return true;

        } catch (e) {
            console.error('Failed to init button:', e);
            return false;
        }
    }

    async _ensureButton() {
        if (this._buttonInserting) return;
        this._buttonInserting = true;

        if (document.getElementById('banana-btn')) {
            this._buttonInserting = false;
            return;
        }

        if (this._pollTimer) clearInterval(this._pollTimer);

        let attempts = 0;
        const maxAttempts = 20;
        this._pollTimer = setInterval(async () => {
            attempts++;
            const success = await this._insertButtonIfNotExists();
            if (success || attempts >= maxAttempts) {
                clearInterval(this._pollTimer);
                this._pollTimer = null;
                this._buttonInserting = false;
            }
        }, 500);
    }

    async ensureButtonByWatch() {
        const f = () => {
            this._ensureButton();
        };

        // Init
        f();

        // Handle changed.
        const observer = new MutationObserver((mutations) => {
            if (!document.getElementById('banana-btn')) {
                f();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Handle navigation.
        window.addEventListener('popstate', f);
        window.addEventListener('pushstate', f);
        window.addEventListener('replacestate', f);
    }

    async insertPrompt(prompt) {
        console.warn('insertPrompt not implemented');
    }
};

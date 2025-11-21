class AIStudioAdapter {
    constructor() {
        this.modal = null
    }

    findPromptInput() {
        return document.querySelector('ms-prompt-input-wrapper textarea')
    }

    findRunButton() {
        return document.querySelector('ms-run-button button')
    }

    getCurrentTheme() {
        return document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    }

    getThemeColors() {
        const theme = this.getCurrentTheme()

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
            }
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
        }
    }

    createButton() {
        const wrapper = document.createElement('div')
        wrapper.className = 'button-wrapper'

        const btn = document.createElement('button')
        btn.id = 'banana-btn'
        btn.className = 'mat-mdc-tooltip-trigger ms-button-borderless ms-button-icon'

        const updateButtonTheme = () => {
            const colors = this.getThemeColors()
            btn.style.cssText = `width: 40px; height: 40px; border-radius: 50%; border: none; background: ${colors.hover}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-right: 8px; transition: background-color 0.2s;`
        }

        updateButtonTheme()
        btn.title = '快捷提示'
        btn.textContent = '🍌'

        btn.addEventListener('mouseenter', () => {
            const colors = this.getThemeColors()
            btn.style.background = colors.border
        })
        btn.addEventListener('mouseleave', () => {
            const colors = this.getThemeColors()
            btn.style.background = colors.hover
        })

        btn.addEventListener('click', () => {
            if (this.modal) {
                this.modal.show()
            }
        })

        wrapper.appendChild(btn)
        return wrapper
    }

    initButton() {
        if (document.getElementById('banana-btn')) {
            return true
        }

        const runButton = this.findRunButton()
        if (!runButton) {
            return false
        }

        const bananaBtn = this.createButton()
        const buttonWrapper = runButton.parentElement

        try {
            buttonWrapper.parentElement.insertBefore(bananaBtn, buttonWrapper)
        } catch (error) {
            console.error('插入香蕉按钮失败:', error)
            buttonWrapper.insertAdjacentElement('beforebegin', bananaBtn)
        }

        return true
    }

    insertPrompt(promptText) {
        const textarea = this.findPromptInput()
        if (textarea) {
            textarea.value = promptText
            textarea.dispatchEvent(new Event('input', { bubbles: true }))
            if (this.modal) {
                this.modal.hide()
            }
        }
    }

    waitForElements() {
        const checkInterval = setInterval(() => {
            const input = this.findPromptInput()
            if (input) {
                const success = this.initButton()
                if (success) {
                    clearInterval(checkInterval)
                }
            }
        }, 1000)
    }

    startObserver() {
        const observer = new MutationObserver(() => {
            const existingBtn = document.getElementById('banana-btn')

            if (!existingBtn) {
                this.initButton()
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    }
}

class GeminiAdapter {
    constructor() {
        this.modal = null
    }

    findPromptInput() {
        return document.querySelector('div[contenteditable="true"][role="textbox"]') ||
            document.querySelector('rich-textarea div[contenteditable="true"]')
    }

    findImageButton() {
        const icon = document.querySelector('mat-icon[data-mat-icon-name="photo_prints"][fonticon="photo_prints"]')
        if (icon) {
            const btn = icon.closest('button.toolbox-drawer-item-deselect-button')
            return btn
        }
        return null
    }

    getCurrentTheme() {
        return document.body.classList.contains('dark-theme') ||
            document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    }

    getThemeColors() {
        const theme = this.getCurrentTheme()

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
            }
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
        }
    }

    createButton() {
        const btn = document.createElement('button')
        btn.id = 'banana-btn'
        btn.className = 'mat-mdc-button mat-mdc-button-base mat-unthemed'

        const updateButtonTheme = () => {
            const colors = this.getThemeColors()
            btn.style.cssText = `
                height: 40px;
                border-radius: 20px;
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
                padding: 0 16px;
                gap: 8px;
            `
        }

        updateButtonTheme()
        btn.title = '快捷提示'
        btn.innerHTML = '<span style="font-size: 16px;">🍌</span><span>Prompts</span>'

        btn.addEventListener('mouseenter', () => {
            const colors = this.getThemeColors()
            btn.style.background = colors.hover
        })
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent'
        })

        btn.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (this.modal) {
                this.modal.show()
            }
        })

        return btn
    }

    initButton() {
        if (document.getElementById('banana-btn')) {
            return true
        }

        const imageBtn = this.findImageButton()
        if (!imageBtn) {
            return false
        }

        const bananaBtn = this.createButton()
        try {
            imageBtn.insertAdjacentElement('afterend', bananaBtn)
        } catch (error) {
            console.error('插入香蕉按钮失败:', error)
            return false
        }

        return true
    }

    insertPrompt(promptText) {
        const textarea = this.findPromptInput()
        if (textarea) {
            textarea.focus()

            const lines = promptText.split('\n')
            const htmlContent = lines.map(line => {
                const escaped = line
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                return `<p>${escaped || '<br>'}</p>`
            }).join('')

            textarea.innerHTML = htmlContent
            textarea.dispatchEvent(new Event('input', { bubbles: true }))

            if (this.modal) {
                this.modal.hide()
            }
        }
    }

    waitForElements() {
    }

    startObserver() {
        const observer = new MutationObserver(() => {
            const existingBtn = document.getElementById('banana-btn')
            const imageBtn = this.findImageButton()

            if (imageBtn) {
                if (!existingBtn) {
                    this.initButton()
                }
            } else {
                if (existingBtn) {
                    existingBtn.remove()
                }
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    }
}

function init() {
    const hostname = window.location.hostname
    let adapter

    if (hostname.includes('aistudio')) {
        adapter = new AIStudioAdapter()
    } else if (hostname.includes('gemini')) {
        adapter = new GeminiAdapter()
    } else {
        console.warn('Banana Prompt: 未知平台', hostname)
        return
    }

    const modal = new BananaModal(adapter)
    adapter.modal = modal
    adapter.waitForElements()
    adapter.startObserver()

    const handleNavigationChange = () => {
        setTimeout(() => {
            adapter.initButton()
        }, 1000)
    }
    window.addEventListener('popstate', handleNavigationChange)
    window.addEventListener('pushstate', handleNavigationChange)
    window.addEventListener('replacestate', handleNavigationChange)
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init()
} else {
    window.addEventListener('load', init)
}
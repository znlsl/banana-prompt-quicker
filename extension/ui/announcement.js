window.BananaUI = window.BananaUI || {};

window.BananaUI.Announcement = class AnnouncementComponent {
    constructor(colors, mobile) {
        this.colors = colors;
        this.mobile = mobile;
        this.announcements = [];
        this.currentIndex = 0;
        this.rotationTimeout = null;
    }

    async load() {
        if (window.ConfigManager) {
            const config = await window.ConfigManager.get();
            if (config?.announcements?.length > 0) {
                this.announcements = config.announcements;
                this.currentIndex = 0;
                // Start rotation if we have a container
                const container = document.getElementById('announcement-container');
                if (container) {
                    this.updateContent(container);
                }
            }
        }
    }

    render() {
        const { h } = window.BananaDOM;
        const containerId = 'announcement-container';

        const container = h('div', {
            id: containerId,
            style: `
                display: none; 
                align-items: center; 
                background: ${this.colors.surface}; 
                border: 1px solid ${this.colors.border}; 
                border-radius: 20px; 
                padding: ${this.mobile ? '8px 12px' : '6px 12px'}; 
                font-size: ${this.mobile ? '13px' : '12px'}; 
                color: ${this.colors.text}; 
                max-width: ${this.mobile ? '100%' : '215px'}; 
                width: ${this.mobile ? '100%' : 'auto'}; 
                box-sizing: border-box; 
                overflow: hidden;
                transition: all 0.3s ease;
            `
        });

        // Initial update
        if (this.announcements.length > 0) {
            this.updateContent(container);
        }

        return container;
    }

    updateContent(container) {
        if (!this.announcements.length) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'flex';

        const item = this.announcements[this.currentIndex];
        const { h } = window.BananaDOM;

        container.innerHTML = ''; // Clear

        const icon = h('span', { style: 'margin-right: 8px;' }, '📢');

        const textStyle = 'display: inline-block; white-space: nowrap; transition: transform 0.3s;';
        const text = h('span', { style: textStyle }, item.content);

        if (item.link) {
            text.style.cursor = 'pointer';
            text.style.textDecoration = 'underline';
            text.onclick = () => window.open(item.link, '_blank');
        }

        const wrapper = h('div', {
            style: 'flex: 1; overflow: hidden; white-space: nowrap; position: relative; mask-image: linear-gradient(to right, black 90%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);'
        }, [text]);

        container.appendChild(icon);
        container.appendChild(wrapper);

        // Simple scroll logic
        setTimeout(() => {
            if (text.offsetWidth > wrapper.offsetWidth) {
                const diff = text.offsetWidth - wrapper.offsetWidth;
                // Scroll back and forth
                text.animate([
                    { transform: 'translateX(0)' },
                    { transform: `translateX(-${diff}px)` },
                    { transform: `translateX(-${diff}px)` }, // pause
                    { transform: 'translateX(0)' }
                ], {
                    duration: 8000,
                    iterations: Infinity
                });
            }
        }, 100);

        // Schedule next rotation
        if (this.rotationTimeout) clearTimeout(this.rotationTimeout);
        const duration = (item.duration || 5) * 1000;
        this.rotationTimeout = setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % this.announcements.length;
            const currentContainer = document.getElementById('announcement-container');
            if (currentContainer) {
                this.updateContent(currentContainer);
            }
        }, duration);
    }
};

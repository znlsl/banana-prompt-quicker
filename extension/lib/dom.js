window.BananaDOM = {
    h(tag, props = {}, children = []) {
        const el = document.createElement(tag);

        if (props) {
            Object.entries(props).forEach(([key, value]) => {
                if (key === 'style') {
                    if (typeof value === 'object') {
                        Object.assign(el.style, value);
                    } else {
                        el.style.cssText = value;
                    }
                } else if (key.startsWith('on') && typeof value === 'function') {
                    el.addEventListener(key.toLowerCase().substring(2), value);
                } else if (key === 'className') {
                    el.className = value;
                } else if (key === 'dataset' && typeof value === 'object') {
                    Object.assign(el.dataset, value);
                } else if (key === 'innerHTML') {
                    el.innerHTML = value;
                } else {
                    el.setAttribute(key, value);
                }
            });
        }

        if (children) {
            if (!Array.isArray(children)) {
                children = [children];
            }
            children.forEach(child => {
                if (child === null || child === undefined) return;
                if (typeof child === 'string' || typeof child === 'number') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    el.appendChild(child);
                }
            });
        }

        return el;
    }
};

window.BananaUI = window.BananaUI || {};

window.BananaUI.PromptForm = class PromptForm {
    constructor(options = {}) {
        this.categories = options.categories || new Set();
        this.colors = options.colors;
        this.mobile = options.mobile || false;
        this.onSave = options.onSave;
        this.onCancel = options.onCancel;

        this.state = {
            selectedCategory: '',
            selectedMode: 'generate',
            selectedFile: null,
            previewUrl: ''
        };

        this.overlay = null;
        this.cleanupFns = [];
    }

    show(existingPrompt = null) {
        const { h } = window.BananaDOM;
        const { colors, mobile } = this;

        // Initialize state
        const addCategories = Array.from(this.categories)
            .filter(c => c !== '全部')
            .sort((a, b) => a.localeCompare(b));

        this.state.selectedCategory = existingPrompt?.category || addCategories[0];
        this.state.selectedMode = existingPrompt?.mode || 'generate';
        this.state.selectedFile = null;
        this.state.previewUrl = existingPrompt?.preview || '';

        // Create overlay
        this.overlay = h('div', {
            style: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100;',
            onclick: (e) => {
                if (e.target === this.overlay) this.close();
            }
        });

        // Create dialog
        const dialog = h('div', {
            style: `background: ${colors.surface}; padding: ${mobile ? '28px' : '32px'}; border-radius: 20px; width: ${mobile ? '90%' : '500px'}; max-width: 90%; box-shadow: 0 20px 60px ${colors.shadow}; display: flex; flex-direction: column; gap: 20px; color: ${colors.text};`,
            onclick: (e) => e.stopPropagation()
        });

        // Title
        const title = h('h3', {
            style: 'margin: 0 0 8px 0; font-size: 20px; font-weight: 600;'
        }, existingPrompt ? '编辑自定义 Prompt' : '添加自定义 Prompt');

        // Title Input
        const titleInput = this.createInput('标题');
        if (existingPrompt) titleInput.value = existingPrompt.title;

        // Image Upload
        const imageContainer = this.createImageUpload(existingPrompt);

        // Category Dropdown
        const categoryContainer = this.createCategoryDropdown(addCategories);

        // Sub-Category Input
        const subCategoryInput = this.createInput('子分类 (可选)');
        if (existingPrompt?.sub_category) subCategoryInput.value = existingPrompt.sub_category;

        // Prompt Content
        const promptInput = this.createInput('Prompt 内容', true);
        if (existingPrompt) promptInput.value = existingPrompt.prompt;

        // Mode Selection
        const modeContainer = this.createModeSelection();

        // Buttons
        const btnContainer = this.createButtons(
            existingPrompt,
            titleInput,
            promptInput,
            subCategoryInput
        );

        dialog.appendChild(title);
        dialog.appendChild(titleInput);
        dialog.appendChild(imageContainer);
        dialog.appendChild(categoryContainer);
        dialog.appendChild(subCategoryInput);
        dialog.appendChild(promptInput);
        dialog.appendChild(modeContainer);
        dialog.appendChild(btnContainer);

        this.overlay.appendChild(dialog);
        document.body.appendChild(this.overlay);
    }

    createInput(placeholder, isTextarea = false) {
        const { h } = window.BananaDOM;
        const { colors, mobile } = this;

        const input = h(isTextarea ? 'textarea' : 'input', {
            placeholder,
            style: `width: 100%; padding: ${mobile ? '14px 16px' : '12px 16px'}; border: 1px solid ${colors.inputBorder}; border-radius: 12px; background: ${colors.inputBg}; color: ${colors.text}; font-size: 14px; outline: none; box-sizing: border-box; transition: all 0.2s; ${isTextarea ? 'min-height: 120px; resize: vertical; font-family: inherit;' : ''}`,
            onfocus: (e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary}15`;
            },
            onblur: (e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.boxShadow = 'none';
            }
        });

        return input;
    }

    createImageUpload(existingPrompt) {
        const { h } = window.BananaDOM;
        const { colors, mobile } = this;

        const imageContainer = h('div', {
            style: 'display: flex; align-items: center; gap: 12px; width: 100%;'
        });

        const fileInput = h('input', {
            type: 'file',
            accept: 'image/*',
            style: 'display: none;'
        });

        const placeholderIcon = h('span', {
            innerHTML: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${colors.textSecondary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
        });

        const previewImg = h('img', {
            style: 'width: 100%; height: 100%; object-fit: cover; display: none;'
        });

        const previewBtn = h('div', {
            style: `width: 60px; height: 60px; border-radius: 12px; border: 1px dashed ${colors.border}; background: ${colors.inputBg}; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; flex-shrink: 0; transition: all 0.2s;`,
            onclick: () => fileInput.click()
        }, [placeholderIcon, previewImg]);

        const uploadTip = h('span', {
            style: `font-size: 13px; color: ${colors.textSecondary};`
        }, '上传封面 (可选)');

        const clearImgBtn = h('button', {
            innerHTML: '×',
            style: `margin-left: auto; width: 24px; height: 24px; border-radius: 50%; background: ${colors.border}; color: ${colors.text}; border: none; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 16px; padding-bottom: 2px;`,
            onclick: () => {
                fileInput.value = '';
                this.state.selectedFile = null;
                previewImg.src = '';
                previewImg.style.display = 'none';
                placeholderIcon.style.display = 'block';
                previewBtn.style.borderStyle = 'dashed';
                clearImgBtn.style.display = 'none';
            }
        });

        // Load existing preview
        if (existingPrompt?.preview && !existingPrompt.preview.includes('gstatic.com')) {
            previewImg.src = existingPrompt.preview;
            previewImg.style.display = 'block';
            placeholderIcon.style.display = 'none';
            previewBtn.style.borderStyle = 'solid';
            clearImgBtn.style.display = 'flex';
        }

        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                this.state.selectedFile = file;

                const reader = new FileReader();
                reader.onload = (evt) => {
                    previewImg.src = evt.target.result;
                    previewImg.style.display = 'block';
                    placeholderIcon.style.display = 'none';
                    previewBtn.style.borderStyle = 'solid';
                    clearImgBtn.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        };

        imageContainer.appendChild(fileInput);
        imageContainer.appendChild(previewBtn);
        imageContainer.appendChild(uploadTip);
        imageContainer.appendChild(clearImgBtn);

        return imageContainer;
    }

    createCategoryDropdown(categories) {
        const { h } = window.BananaDOM;
        const { colors, mobile } = this;

        const categoryContainer = h('div', {
            style: 'position: relative; width: 100%; z-index: 10;'
        });

        const categoryTriggerText = h('span', {}, this.state.selectedCategory);

        const categoryArrow = h('span', {
            innerHTML: `<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1L5 5L9 1"/></svg>`,
            style: 'display: flex; align-items: center; transition: transform 0.2s; opacity: 0.6;'
        });

        const categoryTrigger = h('div', {
            style: `width: 100%; padding: ${mobile ? '14px 16px' : '12px 16px'}; border: 1px solid ${colors.inputBorder}; border-radius: 12px; background: ${colors.inputBg}; color: ${colors.text}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;`
        }, [categoryTriggerText, categoryArrow]);

        const categoryOptions = h('div', {
            style: `position: absolute; top: 100%; left: 0; margin-top: 8px; width: 100%; background: ${colors.surface}; border: 1px solid ${colors.border}; border-radius: 12px; box-shadow: 0 10px 40px ${colors.shadow}; display: none; flex-direction: column; overflow: hidden; backdrop-filter: blur(20px); max-height: 200px; overflow-y: auto; z-index: 100;`
        });

        const renderOptions = () => {
            categoryOptions.innerHTML = '';
            categories.forEach(cat => {
                const isSelected = cat === this.state.selectedCategory;
                const baseStyle = 'padding: 10px 16px; cursor: pointer; transition: all 0.2s; font-size: 14px;';
                const selectedStyle = isSelected
                    ? `background: ${colors.primary}15; color: ${colors.primary}; font-weight: 600;`
                    : `background: transparent; color: ${colors.text};`;

                const option = h('div', {
                    style: baseStyle + selectedStyle,
                    onmouseenter: (e) => {
                        if (!isSelected) e.target.style.background = colors.surfaceHover;
                        e.target.style.boxShadow = `0 2px 8px ${colors.shadow}`;
                    },
                    onmouseleave: (e) => {
                        if (!isSelected) {
                            e.target.style.background = 'transparent';
                        } else {
                            e.target.style.background = `${colors.primary}15`;
                        }
                        e.target.style.boxShadow = 'none';
                    },
                    onclick: (e) => {
                        e.stopPropagation();
                        this.state.selectedCategory = cat;
                        categoryTriggerText.textContent = cat;
                        categoryOptions.style.display = 'none';
                        categoryArrow.style.transform = 'rotate(0deg)';
                        renderOptions();
                    }
                }, cat);

                categoryOptions.appendChild(option);
            });
        };

        renderOptions();

        categoryTrigger.onclick = (e) => {
            e.stopPropagation();
            const isVisible = categoryOptions.style.display === 'flex';
            categoryOptions.style.display = isVisible ? 'none' : 'flex';
            categoryArrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        };

        const closeDropdown = (e) => {
            if (!categoryContainer.contains(e.target)) {
                categoryOptions.style.display = 'none';
                categoryArrow.style.transform = 'rotate(0deg)';
            }
        };
        document.addEventListener('click', closeDropdown);
        this.cleanupFns.push(() => document.removeEventListener('click', closeDropdown));

        categoryContainer.appendChild(categoryTrigger);
        categoryContainer.appendChild(categoryOptions);

        return categoryContainer;
    }

    createModeSelection() {
        const { h } = window.BananaDOM;

        const modeContainer = h('div', {
            style: 'display: flex; gap: 16px;'
        });

        const createRadio = (value, label) => {
            const radio = h('input', {
                type: 'radio',
                name: 'prompt-mode',
                value: value,
                onchange: () => this.state.selectedMode = value
            });
            radio.checked = value === this.state.selectedMode;

            const labelEl = h('label', {
                style: 'display: flex; align-items: center; gap: 6px; cursor: pointer;'
            }, [radio, document.createTextNode(label)]);

            return labelEl;
        };

        modeContainer.appendChild(createRadio('generate', '文生图'));
        modeContainer.appendChild(createRadio('edit', '编辑'));

        return modeContainer;
    }

    createButtons(existingPrompt, titleInput, promptInput, subCategoryInput) {
        const { h } = window.BananaDOM;
        const { colors, mobile } = this;

        const btnContainer = h('div', {
            style: 'display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;'
        });

        const cancelBtn = h('button', {
            style: `padding: ${mobile ? '12px 24px' : '10px 20px'}; border: 1px solid ${colors.border}; border-radius: 12px; background: transparent; color: ${colors.text}; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.25s ease;`,
            onclick: () => this.close()
        }, '取消');

        if (!mobile) {
            cancelBtn.onmouseenter = () => {
                cancelBtn.style.background = colors.hover;
                cancelBtn.style.transform = 'scale(1.05)';
            };
            cancelBtn.onmouseleave = () => {
                cancelBtn.style.background = 'transparent';
                cancelBtn.style.transform = 'scale(1)';
            };
        }

        const saveBtn = h('button', {
            style: `padding: ${mobile ? '12px 24px' : '10px 20px'}; border: none; border-radius: 12px; background: ${colors.primary}; color: white; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.25s ease; box-shadow: 0 2px 8px ${colors.shadow};`,
            onclick: async () => {
                const titleVal = titleInput.value.trim();
                const promptVal = promptInput.value.trim();

                if (!titleVal || !promptVal) {
                    alert('请填写标题和内容');
                    return;
                }

                let previewDataUrl = existingPrompt?.preview || 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg';

                if (this.state.selectedFile) {
                    try {
                        saveBtn.textContent = '处理中...';
                        saveBtn.disabled = true;
                        previewDataUrl = await window.BananaUtils.compressImage(this.state.selectedFile);
                    } catch (err) {
                        console.error('图片压缩失败', err);
                        alert('图片处理失败,将使用默认图标');
                    } finally {
                        saveBtn.textContent = '保存';
                        saveBtn.disabled = false;
                    }
                }

                const subCategoryVal = subCategoryInput.value.trim();

                const promptData = {
                    title: titleVal,
                    prompt: promptVal,
                    mode: this.state.selectedMode,
                    category: this.state.selectedCategory,
                    sub_category: subCategoryVal || undefined,
                    preview: previewDataUrl
                };

                if (this.onSave) {
                    await this.onSave(promptData, existingPrompt);
                }

                this.close();
            }
        }, '保存');

        if (!mobile) {
            saveBtn.onmouseenter = () => {
                saveBtn.style.transform = 'scale(1.05)';
                saveBtn.style.boxShadow = `0 4px 16px ${colors.shadow}`;
            };
            saveBtn.onmouseleave = () => {
                saveBtn.style.transform = 'scale(1)';
                saveBtn.style.boxShadow = `0 2px 8px ${colors.shadow}`;
            };
        }

        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(saveBtn);

        return btnContainer;
    }

    close() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];

        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;

        if (this.onCancel) {
            this.onCancel();
        }
    }
};

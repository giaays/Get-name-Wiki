// ==UserScript==
// @name         Upload Multiple Files for Wiki
// @namespace    http://tampermonkey.net/
// @version      2.0.9
// @author       giaays
// @updateURL    https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Upload_wiki.user.js
// @downloadURL  https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Upload_wiki.user.js
// @description  Tự động upload file txt và điền tên chương
// @match        *://*/nhung-file*
// @match        *://*/*chinh-sua*
// @icon         https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/icon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
  
    let isMinimized = true;

    const minimizedWidth = 56;
    const expandedMinWidth = 320;

    const initialTop = '150px';
    const initialRightPercent = '5%';

    const initialRightPixel = window.innerWidth * 0.05;
    const initialLeft = window.innerWidth - minimizedWidth - initialRightPixel;


    const controlPanel = document.createElement('div');
    controlPanel.style.cssText = `
        position: fixed;
        top: ${initialTop};
        right: auto;
        left: ${initialLeft}px;
        background: #2c3e50;
        padding: 0;
        border-radius: 50%;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.1);
        width: ${minimizedWidth}px;
        height: ${minimizedWidth}px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        border: none;
        transition: all 0.3s ease;
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const minimizeBtn = document.createElement('button');
    minimizeBtn.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
    `;
    minimizeBtn.style.cssText = `
        background: transparent;
        border: none;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        padding: 0;
        margin: 0;
    `;
    controlPanel.appendChild(minimizeBtn);
    const titleWrapper = document.createElement('div');
    titleWrapper.style.cssText = 'display: none; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e5e1da;' + 'width: 100%;';

    const titleLeft = document.createElement('div');
    titleLeft.style.cssText = 'display: flex; align-items: center; gap: 10px;';

    const titleIcon = document.createElement('div');
    titleIcon.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
    `;
    titleLeft.appendChild(titleIcon);

    const title = document.createElement('div');
    title.textContent = 'Auto Upload';
    title.style.cssText = 'color: #212529; font-size: 18px; font-weight: 600;';
    titleLeft.appendChild(title);
    const minimizeBtnExpanded = document.createElement('button');
    minimizeBtnExpanded.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    `;
    minimizeBtnExpanded.style.cssText = `
        background: transparent;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        padding: 0;
        margin: 0;
        flex-shrink: 0;
    `;
    minimizeBtnExpanded.onmouseover = () => { minimizeBtnExpanded.style.background = '#e5e1da'; };
    minimizeBtnExpanded.onmouseout = () => { minimizeBtnExpanded.style.background = 'transparent'; };

    titleWrapper.appendChild(titleLeft);
    titleWrapper.appendChild(minimizeBtnExpanded);
    controlPanel.appendChild(titleWrapper);

    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = 'display: none; width: 100%;';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'autoUploadFileInput';
    fileInput.multiple = true;
    fileInput.accept = '.txt';
    fileInput.style.display = 'none';
    contentWrapper.appendChild(fileInput);

    const fileLabel = document.createElement('label');
    fileLabel.setAttribute('for', 'autoUploadFileInput');
    fileLabel.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: #ffffff;
        color: #495057;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        margin-bottom: 0;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        border: 2px dashed #d6cfc4;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `;

    const fileIconLabel = document.createElement('span');
    fileIconLabel.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
        </svg>
    `;
    fileLabel.appendChild(fileIconLabel);

    const fileLabelText = document.createElement('span');
    fileLabelText.textContent = 'Chọn file';
    fileLabel.appendChild(fileLabelText);
    fileLabel.onmouseover = () => {
        fileLabel.style.background = '#fafaf8';
        fileLabel.style.borderColor = '#b8ad9f';
        fileLabel.style.transform = 'translateY(-1px)';
        fileLabel.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    };
    fileLabel.onmouseout = () => {
        fileLabel.style.background = '#ffffff';
        fileLabel.style.borderColor = '#d6cfc4';
        fileLabel.style.transform = 'translateY(0)';
        fileLabel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
    };
    contentWrapper.appendChild(fileLabel);

    const fileCountDiv = document.createElement('div');
    fileCountDiv.style.cssText = 'color: #6c757d; font-size: 13px; margin-top: 8px; margin-bottom: 12px; display: none; padding-left: 4px;';
    contentWrapper.appendChild(fileCountDiv);

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.style.cssText = `
        margin-top: 12px;
        margin-bottom: 16px;
        padding: 12px;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #d6cfc4;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        transition: all 0.2s;
    `;

    checkboxWrapper.onmouseover = () => {
        checkboxWrapper.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
        checkboxWrapper.style.borderColor = '#b8ad9f';
    };
    checkboxWrapper.onmouseout = () => {
        checkboxWrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        checkboxWrapper.style.borderColor = '#d6cfc4';
    };

    let isChecked = true;

    const customCheckbox = document.createElement('div');
    customCheckbox.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid #495057;
        border-radius: 4px;
        background: #495057;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
    const checkmark = document.createElement('div');
    checkmark.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 16 16" fill="white" stroke="white" stroke-width="1">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
        </svg>
    `;
    checkmark.style.cssText = 'display: flex; align-items: center; justify-content: center;';
    customCheckbox.appendChild(checkmark);

    const checkboxText = document.createElement('span');
    checkboxText.textContent = 'Xóa mô tả sau dấu (-)';
    checkboxText.style.cssText = 'color: #495057; font-size: 14px; flex: 1;';

    checkboxWrapper.appendChild(customCheckbox);
    checkboxWrapper.appendChild(checkboxText);
    checkboxWrapper.onclick = () => {
        isChecked = !isChecked;
        if (isChecked) {
            customCheckbox.style.background = '#495057';
            customCheckbox.style.borderColor = '#495057';
            checkmark.style.display = 'flex';
        } else {
            customCheckbox.style.background = '#ffffff';
            customCheckbox.style.borderColor = '#d6cfc4';
            checkmark.style.display = 'none';
        }
    };
    contentWrapper.appendChild(checkboxWrapper);

    const uploadBtn = document.createElement('button');
    uploadBtn.style.cssText = `
        background: #28a745;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        width: 100%;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(40,167,69,0.3), 0 4px 8px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    `;
    const uploadIconBtn = document.createElement('span');
    uploadIconBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
    `;
    uploadBtn.appendChild(uploadIconBtn);

    const uploadBtnText = document.createElement('span');
    uploadBtnText.textContent = 'Bắt đầu upload';
    uploadBtn.appendChild(uploadBtnText);
    uploadBtn.onmouseover = () => {
        uploadBtn.style.background = '#218838';
        uploadBtn.style.transform = 'translateY(-2px)';
        uploadBtn.style.boxShadow = '0 4px 8px rgba(40,167,69,0.4), 0 6px 12px rgba(0,0,0,0.15)';
    };
    uploadBtn.onmouseout = () => {
        uploadBtn.style.background = '#28a745';
        uploadBtn.style.transform = 'translateY(0)';
        uploadBtn.style.boxShadow = '0 2px 4px rgba(40,167,69,0.3), 0 4px 8px rgba(0,0,0,0.1)';
    };
    contentWrapper.appendChild(uploadBtn);

    const progressDiv = document.createElement('div');
    progressDiv.style.cssText = `
        margin-top: 16px;
        font-size: 13px;
        color: #495057;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #d6cfc4;
        display: none;
        padding: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
    `;
    contentWrapper.appendChild(progressDiv);
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        margin-top: 12px;
        font-size: 12px;
        color: #495057;
        max-height: 200px;
        overflow-y: auto;
        padding: 12px;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #d6cfc4;
        display: none;
        line-height: 1.6;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
    `;
    contentWrapper.appendChild(statusDiv);

    controlPanel.appendChild(contentWrapper);
    document.body.appendChild(controlPanel);

    let dragStartX, dragStartY, panelStartX, panelStartY, isDragging = false;
    let wasDragging = false;

    controlPanel.addEventListener('mousedown', (e) => {
        if (!isMinimized && (e.target.closest('input') || e.target.closest('label') || e.target.closest('button'))) {
            return;
        }

        isDragging = true;
        wasDragging = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        const rect = controlPanel.getBoundingClientRect();
        panelStartX = rect.left;
        panelStartY = rect.top;

        controlPanel.style.cursor = 'grabbing';
        controlPanel.style.transition = 'none';

        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            wasDragging = true;
        }

        let newX = panelStartX + deltaX;
        let newY = panelStartY + deltaY;

        const rect = controlPanel.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 20;
        const maxY = window.innerHeight - rect.height - 20;

        newX = Math.max(20, Math.min(newX, maxX));
        newY = Math.max(20, Math.min(newY, maxY));

        controlPanel.style.left = newX + 'px';
        controlPanel.style.top = newY + 'px';
        controlPanel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            controlPanel.style.cursor = 'move';
            controlPanel.style.transition = 'all 0.3s ease';
        }
    });
    window.addEventListener('resize', () => {
        if (isMinimized && !wasDragging) {
             const newRightPixel = window.innerWidth * 0.05;
             const newLeft = window.innerWidth - minimizedWidth - newRightPixel;
   
             controlPanel.style.left = newLeft + 'px';
        } else if (!isMinimized) {
            const rect = controlPanel.getBoundingClientRect();
            let left = rect.left;
            let top = rect.top;

            const maxX = window.innerWidth - rect.width - 20;
            const maxY = window.innerHeight - rect.height - 20;

            left = Math.max(20, Math.min(left, maxX));
            top = Math.max(20, Math.min(top, maxY));
            controlPanel.style.left = left + 'px';
            controlPanel.style.top = top + 'px';
        }
    });
    const togglePanel = () => {
        if (isMinimized && wasDragging) {
            wasDragging = false;
            return;
        }

        isMinimized = !isMinimized;

        const rect = controlPanel.getBoundingClientRect();
        let currentLeft = rect.left;
        let currentTop = rect.top;

        controlPanel.style.transition = 'none';

        if (isMinimized) {
            const oldWidth = rect.width;
            titleWrapper.style.display = 'none';
            contentWrapper.style.display = 'none';
            controlPanel.style.display = 'flex';
            controlPanel.style.flexDirection = 'row';

            controlPanel.style.minWidth = '56px';
            controlPanel.style.maxWidth = '56px';
            controlPanel.style.padding = '0';
            controlPanel.style.background = '#2c3e50';
            controlPanel.style.borderRadius = '50%';
            controlPanel.style.width = '56px';
            controlPanel.style.height = '56px';
            controlPanel.style.border = 'none';
            minimizeBtn.style.display = 'flex';

            const deltaX = (oldWidth - minimizedWidth);
            currentLeft = currentLeft + deltaX;
            const maxX = window.innerWidth - 56 - 20;
            const maxY = window.innerHeight - 56 - 20;
            currentLeft = Math.max(20, Math.min(currentLeft, maxX));
            currentTop = Math.max(20, Math.min(currentTop, maxY));
            controlPanel.style.left = currentLeft + 'px';
            controlPanel.style.top = currentTop + 'px';
            controlPanel.style.right = 'auto';

            setTimeout(() => {
                controlPanel.style.transition = 'all 0.3s ease';
            }, 50);
        } else {
            const currentLeftBeforeExpand = currentLeft;
            controlPanel.style.display = 'flex';
            controlPanel.style.flexDirection = 'column';

            controlPanel.style.minWidth = '320px';
            controlPanel.style.maxWidth = '360px';
            controlPanel.style.padding = '24px';
            controlPanel.style.background = '#ffffff';
            controlPanel.style.borderRadius = '12px';
            controlPanel.style.width = 'auto';
            controlPanel.style.height = 'auto';
            controlPanel.style.border = '1px solid rgba(0,0,0,0.08)';

            minimizeBtn.style.display = 'none';
            titleWrapper.style.display = 'flex';
            contentWrapper.style.display = 'block';
            const deltaX = (expandedMinWidth - minimizedWidth);
            currentLeft = currentLeftBeforeExpand - deltaX;
            setTimeout(() => {
                const newRect = controlPanel.getBoundingClientRect();
                const maxX = window.innerWidth - newRect.width - 20;
                const maxY = window.innerHeight - newRect.height - 20;

                currentLeft = Math.max(20, Math.min(currentLeft, maxX));
                currentTop = Math.max(20, Math.min(currentTop, maxY));

                controlPanel.style.left = currentLeft + 'px';
                controlPanel.style.top = currentTop + 'px';
                controlPanel.style.right = 'auto';
                controlPanel.style.transition = 'all 0.3s ease';
            }, 10);
        }
        if (wasDragging) wasDragging = false;
    };
    minimizeBtn.onclick = (e) => {
        e.stopPropagation();
        togglePanel();
    };
    minimizeBtnExpanded.onclick = (e) => {
        e.stopPropagation();
        togglePanel();
    };
    async function readFirstLine(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                let text = e.target.result;

                if (text.charCodeAt(0) === 0xFEFF) {
                    text = text.substring(1);
                }
                
                let firstLine = text.split('\n')[0].trim();

                if (isChecked) {
                    const dashIndex = firstLine.indexOf(' - ');
                    if (dashIndex !== -1) {
                        firstLine = firstLine.substring(0, dashIndex).trim();
                    }
                }

                resolve(firstLine);
            };
            reader.readAsText(file, 'UTF-8'); 
        });
    }

    function findChapterForms() {
        const forms = [];
        const wrappers = document.querySelectorAll('.chapter-info-wrapper');

        wrappers.forEach(wrapper => {
            const nameInput = wrapper.querySelector('input[name="name"][type="text"]');
            const fileInputElem = wrapper.querySelector('input[type="file"][name="file"]');

            if (nameInput && fileInputElem) {
                forms.push({ nameInput, fileInput: fileInputElem });
            }
        });
        return forms;
    }

    async function uploadToForm(form, file) {
        const chapterName = await readFirstLine(file);
        form.nameInput.value = chapterName;
        form.nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        form.nameInput.dispatchEvent(new Event('change', { bubbles: true }));

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        form.fileInput.files = dataTransfer.files;
        form.fileInput.dispatchEvent(new Event('change', { bubbles: true }));

        return chapterName;
    }

    fileInput.addEventListener('change', () => {
        const count = fileInput.files.length;
        if (count > 0) {
            fileCountDiv.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span style="color: #28a745; font-weight: 500;">Đã chọn ${count} file</span>
            `;
            fileCountDiv.style.display = 'block';
        } else {
            fileCountDiv.style.display = 'none';
        }
    });
    uploadBtn.addEventListener('click', async () => {
        const files = Array.from(fileInput.files);
        if (files.length === 0) {
            progressDiv.style.display = 'block';
            progressDiv.style.background = '#fff8f7';
            progressDiv.innerHTML = '<span style="color: #dc3545; font-weight: 500;">⚠ Vui lòng chọn file</span>';
            statusDiv.style.display = 'none';
            return;
        }

        files.sort((a, b) => a.name.localeCompare(b.name));

        const forms = findChapterForms();
        const maxUploads = Math.min(files.length, forms.length);

        if (forms.length === 0) {
            progressDiv.style.display = 'block';
            progressDiv.style.background = '#fff8f7';
            progressDiv.innerHTML = '<span style="color: #dc3545; font-weight: 500;">⚠ Không tìm thấy form</span>';
            statusDiv.style.display = 'none';
            return;
        }

        progressDiv.style.display = 'block';
        progressDiv.style.background = '#ffffff';
        progressDiv.innerHTML = `<strong>Đang upload 0/${maxUploads} file...</strong><div style="height: 8px; background-color: #e9ecef; border-radius: 4px; margin-top: 8px; margin-bottom: 0px;"><div id="uploadProgressBar" style="width: 0%; height: 100%; background-color: #28a745; border-radius: 4px; transition: width 0.3s ease;"></div></div>`;
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = '';
        
        const progressBar = document.getElementById('uploadProgressBar');
        const progressText = progressDiv.querySelector('strong');

        for (let i = 0; i < maxUploads; i++) {
            try {
                const chapterName = await uploadToForm(forms[i], files[i]);
                const displayName = chapterName.length > 40 ? chapterName.substring(0, 40) + '...' : chapterName;
                statusDiv.innerHTML += `<span style="color: #28a745;">✓</span> ${i + 1}. ${displayName}<br>`;
            } catch (error) {
                statusDiv.innerHTML += `<span style="color: #dc3545;">✗</span> ${i + 1}. Lỗi (${files[i].name})<br>`;
            }

            const percent = ((i + 1) / maxUploads) * 100;
            progressBar.style.width = percent + '%';
            progressText.textContent = `Đang upload ${i + 1}/${maxUploads} file...`;

            await new Promise(resolve => setTimeout(resolve, 300));
        }

        progressDiv.innerHTML = `<strong style="color: #28a745;">✓ Hoàn tất upload ${maxUploads} file</strong>`;
        progressDiv.style.background = '#e9f8f4';
    });
})();

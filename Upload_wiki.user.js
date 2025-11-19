// ==UserScript==
// @name         Upload Multiple Files for Wiki
// @namespace    http://tampermonkey.net/
// @version      2.1.1
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
    let selectedFiles = [];

    let wasProgressDivVisible = 'none';
    let wasCompletionSummaryDivVisible = 'none';
    let wasStatusDivVisible = 'none';


    const initialTop = '100px';
    const minimizedWidth = 56;
    const fixedExpandedWidth = 340;


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

    const innerPanelContent = document.createElement('div');
    innerPanelContent.style.cssText = 'width: 100%; height: 100%;';
    controlPanel.appendChild(innerPanelContent);


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
    innerPanelContent.appendChild(minimizeBtn);

    const titleWrapper = document.createElement('div');
    titleWrapper.style.cssText = 'display: none; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e5e1da; width: 100%;';

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
    innerPanelContent.appendChild(titleWrapper);

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

    fileInput.onchange = (event) => {
        selectedFiles = Array.from(event.target.files);

        if (selectedFiles.length > 0) {
            fileCountDiv.textContent = `Đã chọn ${selectedFiles.length} file`;

            fileCountDiv.style.cssText = `
                color: #155724;
                font-size: 13px;
                margin-top: 8px;
                margin-bottom: 12px;
                display: block;
                font-weight: 600;
                padding-left: 4px;
            `;

        } else {
            fileCountDiv.textContent = '';

            fileCountDiv.style.cssText = 'color: #6c757d; font-size: 13px; margin-top: 8px; margin-bottom: 12px; display: none; padding-left: 4px;';
        }
    };

    let isSettingsExpanded = false;

    const settingsGearIcon = `
        <svg id="settingsGearIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
        </svg>
    `;
    const settingsChevronIcon = `
        <svg id="settingsChevronIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s ease; transform: rotate(0deg);">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `;

    const settingsToggle = document.createElement('div');
    settingsToggle.style.cssText = 'color: #495057; font-size: 14px; font-weight: 600; margin-top: 15px; margin-bottom: 5px; cursor: pointer; padding: 10px 12px; background: #e5e1da; border-radius: 8px; transition: background 0.2s; display: flex; align-items: center; justify-content: space-between;';

    settingsToggle.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            ${settingsGearIcon}
            <span>Cài đặt</span>
        </div>
        ${settingsChevronIcon}
    `;

    settingsToggle.onmouseover = () => { settingsToggle.style.background = '#d6cfc4'; };
    settingsToggle.onmouseout = () => {
        if (!isSettingsExpanded) {
            settingsToggle.style.background = '#e5e1da';
        }
    };
    contentWrapper.appendChild(settingsToggle);

    const settingsContainer = document.createElement('div');
    settingsContainer.style.cssText = `
        padding-top: 5px;
        border-top: 1px dashed #d6cfc4;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box;
        display: none;
    `;
    contentWrapper.appendChild(settingsContainer);

    const setSettingsExpanded = (expanded) => {
        isSettingsExpanded = expanded;
        const chevron = document.getElementById('settingsChevronIcon');

        if (isSettingsExpanded) {
            wasProgressDivVisible = progressDiv.style.display;
            wasCompletionSummaryDivVisible = completionSummaryDiv.style.display;
            wasStatusDivVisible = statusDiv.style.display;

            settingsContainer.style.display = 'block';
            settingsToggle.style.background = '#d6cfc4';
            if (chevron) {
                chevron.style.transform = 'rotate(180deg)';
            }

            progressDiv.style.display = 'none';
            completionSummaryDiv.style.display = 'none';
            statusDiv.style.display = 'none';

        } else {
            progressDiv.style.display = wasProgressDivVisible;
            completionSummaryDiv.style.display = wasCompletionSummaryDivVisible;
            statusDiv.style.display = wasStatusDivVisible;

            settingsContainer.style.display = 'none';
            settingsToggle.style.background = '#e5e1da';
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
        }
    };

    const toggleSettings = () => {
        setSettingsExpanded(!isSettingsExpanded);
    };

    const collapseSettings = () => {
        setSettingsExpanded(false);
    }

    settingsToggle.onclick = toggleSettings;

    const STORAGE_KEY = 'WIKI_UPLOAD_SETTINGS_V2';

    const saveSettings = () => {
        const settings = {
            filterWords: filterInput.value.trim(),
            dashFilter: isDashFilterChecked,
            duplicateFilter: isDuplicateFilterChecked
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Lỗi khi lưu cài đặt:", e);
        }
    };


    const createCustomCheckbox = (initialChecked, textContent, onClickHandler, note = null) => {
        let isCheckedState = initialChecked;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            padding: 10px 12px;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #d6cfc4;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: all 0.2s;
            box-sizing: border-box;
        `;

        wrapper.onmouseover = () => {
            wrapper.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
            wrapper.style.borderColor = '#b8ad9f';
        };
        wrapper.onmouseout = () => {
            wrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            wrapper.style.borderColor = '#d6cfc4';
        };

        const contentRow = document.createElement('div');
        contentRow.style.cssText = 'display: flex; align-items: center; gap: 10px; width: 100%;';

        const customBox = document.createElement('div');
        customBox.style.cssText = `
            width: 20px;
            height: 20px;
            border: 2px solid ${isCheckedState ? '#495057' : '#d6cfc4'};
            border-radius: 4px;
            background: ${isCheckedState ? '#495057' : '#ffffff'};
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
        checkmark.style.cssText = `display: ${isCheckedState ? 'flex' : 'none'}; align-items: center; justify-content: center;`;
        customBox.appendChild(checkmark);

        const text = document.createElement('span');
        text.textContent = textContent;
        text.style.cssText = 'color: #495057; font-size: 14px; flex: 1;';

        contentRow.appendChild(customBox);
        contentRow.appendChild(text);
        wrapper.appendChild(contentRow);

        if (note) {
            const noteDiv = document.createElement('div');
            noteDiv.textContent = note;
            noteDiv.style.cssText = 'color: #6c757d; font-size: 11px; margin-top: 2px; padding-left: 30px; line-height: 1.3;';
            wrapper.appendChild(noteDiv);
        }

        const updateUI = (checked) => {
            if (checked) {
                customBox.style.background = '#495057';
                customBox.style.borderColor = '#495057';
                checkmark.style.display = 'flex';
            } else {
                customBox.style.background = '#ffffff';
                customBox.style.borderColor = '#d6cfc4';
                checkmark.style.display = 'none';
            }
        };

        const setState = (checked) => {
            isCheckedState = checked;
            updateUI(isCheckedState);
            onClickHandler(isCheckedState);
        };

        wrapper.onclick = () => {
            isCheckedState = !isCheckedState;
            updateUI(isCheckedState);
            onClickHandler(isCheckedState);
            saveSettings();
        };

        return { wrapper, isChecked: () => isCheckedState, setState };
    };

    let isDashFilterChecked = true;
    const dashFilter = createCustomCheckbox(true, 'Xóa mô tả sau dấu (-)', (checked) => {
        isDashFilterChecked = checked;
    });
    dashFilter.wrapper.style.marginTop = '12px';
    dashFilter.wrapper.style.marginBottom = '8px';
    settingsContainer.appendChild(dashFilter.wrapper);

    let isDuplicateFilterChecked = true;
    const duplicateFilter = createCustomCheckbox(true, 'Xóa tên chương lặp', (checked) => {
        isDuplicateFilterChecked = checked;
    }, '(Ví dụ: 第1章 第1章 thành 第1章)');
    duplicateFilter.wrapper.style.marginTop = '8px';
    duplicateFilter.wrapper.style.marginBottom = '12px';
    settingsContainer.appendChild(duplicateFilter.wrapper);


    const filterExtraWordsDescription = document.createElement('div');
    filterExtraWordsDescription.textContent = 'Xóa Từ/Cụm từ thừa trong tên chương (cách nhau bằng dấu phẩy):';
    filterExtraWordsDescription.style.cssText = 'color: #495057; font-size: 13px; margin-bottom: 8px; padding-left: 4px; margin-top: 12px;';
    settingsContainer.appendChild(filterExtraWordsDescription);

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Ví dụ: [VIP], C1';
    filterInput.id = 'chapterFilterInput';
    filterInput.style.cssText = `
        width: 100%;
        padding: 10px;
        margin-bottom: 4px;
        border: 1px solid #d6cfc4;
        border-radius: 6px;
        font-size: 14px;
        color: #495057;
        box-sizing: border-box;
    `;
    filterInput.value = '[VIP]';
    settingsContainer.appendChild(filterInput);

    const filterNote = document.createElement('div');
    filterNote.textContent = '(Có phân biệt chữ hoa/thường)';
    filterNote.style.cssText = 'color: #6c757d; font-size: 11px; margin-bottom: 12px; padding-left: 5px;';
    settingsContainer.appendChild(filterNote);

    filterInput.oninput = saveSettings;

    const loadSettings = () => {
        const settingsJson = localStorage.getItem(STORAGE_KEY);
        if (!settingsJson) return;

        try {
            const settings = JSON.parse(settingsJson);

            if (settings.dashFilter !== undefined) {
                dashFilter.setState(settings.dashFilter);
            }

            if (settings.duplicateFilter !== undefined) {
                duplicateFilter.setState(settings.duplicateFilter);
            }

            if (settings.filterWords !== undefined) {
                filterInput.value = settings.filterWords;
            }
        } catch (e) {
            console.error("Lỗi khi đọc cài đặt từ localStorage:", e);
        }
    };


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
    uploadIconBtn.style.verticalAlign = 'middle';
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

    const progressText = document.createElement('div');
    progressDiv.appendChild(progressText);

    const progressBarWrapper = document.createElement('div');
    progressBarWrapper.style.cssText = 'height: 8px; background: #e9ecef; border-radius: 4px; margin-top: 8px; overflow: hidden;';
    progressDiv.appendChild(progressBarWrapper);

    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'height: 100%; width: 0%; background: #28a745; transition: width 0.3s ease; border-radius: 4px;';
    progressBarWrapper.appendChild(progressBar);

    const completionSummaryDiv = document.createElement('div');
    completionSummaryDiv.style.cssText = `
        margin-top: 12px;
        margin-bottom: 12px;
        font-size: 14px;
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        padding: 10px 12px;
        border-radius: 8px;
        font-weight: 600;
        display: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        text-align: center;
    `;
    contentWrapper.appendChild(completionSummaryDiv);


    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        font-size: 13px;
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

    innerPanelContent.appendChild(contentWrapper);
    document.body.appendChild(controlPanel);

    let dragStartX, dragStartY, panelStartX, panelStartY, isDragging = false;
    let wasDragging = false;

    controlPanel.addEventListener('mousedown', (e) => {
        if (!isMinimized && (e.target.closest('input') || e.target.closest('label') || e.target.closest('button') || e.target.closest('#chapterFilterInput') || e.target.closest('.checkbox-wrapper'))) {
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
        if (isDragging) return;

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

            controlPanel.style.minWidth = `${fixedExpandedWidth}px`;
            controlPanel.style.maxWidth = `${fixedExpandedWidth}px`;
            controlPanel.style.padding = '24px';
            controlPanel.style.background = '#ffffff';
            controlPanel.style.borderRadius = '12px';
            controlPanel.style.width = 'auto';
            controlPanel.style.height = 'auto';
            controlPanel.style.border = '1px solid rgba(0,0,0,0.08)';

            minimizeBtn.style.display = 'none';
            titleWrapper.style.display = 'flex';
            contentWrapper.style.display = 'block';

            const deltaX = (fixedExpandedWidth - minimizedWidth);
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

                let lines = text.split('\n');
                let firstLine = '';

                for (let line of lines) {
                    let trimmedLine = line.trim();
                    if (trimmedLine.length > 0) {
                        firstLine = trimmedLine;
                        break;
                    }
                }

                if (firstLine.length === 0) {
                    resolve(file.name.replace(/\.txt$/i, ''));
                    return;
                }


                const arNumberAndSeparatorPattern = /^(\d+\s*[^a-zA-Z0-9\s]+\s*)/;
                firstLine = firstLine.replace(arNumberAndSeparatorPattern, '').trim();


                const doublePipeIndex = firstLine.indexOf('||');
                if (doublePipeIndex !== -1) {
                    firstLine = firstLine.substring(doublePipeIndex + 2).trim();
                }


                const redundantNumberPattern = /(第\s*[一二三四五六七八九十百千万\d]+\s*章)\s+([一二三四五六七八九十百千万\d]+)[\s、.]*/i;
                firstLine = firstLine.replace(redundantNumberPattern, (match, p1, p2) => {
                    return p1;
                });


                firstLine = firstLine.replace(/\s+/g, ' ').trim();


                const hanChapterMatch = firstLine.match(/(第\s*[一二三四五六七八九十百千万\d]+\s*章)/i);
                const nonHanChapterRegex = /(chapter\s*\d+|chương\s*\d+|c\s*\d+)/i;
                const nonHanChapterMatch = firstLine.match(nonHanChapterRegex);

                if (hanChapterMatch && nonHanChapterMatch) {
                    let nonHanPart = nonHanChapterMatch[0];
                    const cleanNonHanRegex = new RegExp(nonHanPart.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
                    firstLine = firstLine.replace(cleanNonHanRegex, '').trim();
                }




                const filterWords = filterInput.value.trim()
                    .split(',')
                    .map(word => word.trim())
                    .filter(word => word.length > 0);

                if (filterWords.length > 0) {
                    let filteredLine = firstLine;
                    filterWords.forEach(word => {

                        const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        const regex = new RegExp(`\\s*${escapedWord}\\s*`, 'g');
                        filteredLine = filteredLine.replace(regex, ' ').trim();
                    });
                    firstLine = filteredLine.replace(/\s+/g, ' ').trim();
                }

                if (isDashFilterChecked) {
                    const dashIndex = firstLine.indexOf(' - ');
                    if (dashIndex !== -1) {
                        firstLine = firstLine.substring(0, dashIndex).trim();
                    }
                }

                if (isDuplicateFilterChecked) {


                    const aggressiveChapterDuplicatePattern = /(第\s*\S+?\s*章)\s+(第\s*\S+?\s*章)/g;
                    firstLine = firstLine.replace(aggressiveChapterDuplicatePattern, '$1');


                    const parts = firstLine.split(/\s+/).filter(p => p.length > 0);
                    const uniqueParts = [];
                    for(const part of parts) {
                        if (uniqueParts.length === 0 || uniqueParts[uniqueParts.length - 1] !== part) {
                            uniqueParts.push(part);
                        }
                    }
                    firstLine = uniqueParts.join(' ');
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

    let isUploading = false;
    let uploadProcessRunning = false;
    let forms;
    let uploadQueue = [];
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    let totalFiles = 0;

    function updateProgress(index, total) {
        progressText.textContent = `Đang upload ${index}/${totalFiles} file...`;
        const percent = (index / totalFiles) * 100;
        progressBar.style.width = `${percent}%`;
    }

    function showStatus(isFinal = false) {
        statusDiv.style.display = 'block';
        if (isFinal) {
            progressDiv.style.display = 'none';

            completionSummaryDiv.innerHTML = `Hoàn thành!`;
            completionSummaryDiv.style.display = 'block';

            uploadBtnText.textContent = 'Bắt đầu upload';
            uploadBtn.style.background = '#28a745';
            uploadBtn.style.boxShadow = '0 2px 4px rgba(40,167,69,0.3), 0 4px 8px rgba(0,0,0,0.1)';
            isUploading = false;
        } else {
            progressDiv.style.display = 'block';
            completionSummaryDiv.style.display = 'none';
        }
    }

    async function uploadNextFile() {
        if (uploadQueue.length === 0 || !uploadProcessRunning) {
            uploadProcessRunning = false;
            showStatus(true);
            return;
        }

        const { form, file } = uploadQueue.shift();
        const chapterName = await readFirstLine(file);
        const fileName = file.name;

        processedCount++;
        updateProgress(processedCount, totalFiles);

        try {
            form.nameInput.value = chapterName;
            form.nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            form.nameInput.dispatchEvent(new Event('change', { bubbles: true }));

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            form.fileInput.files = dataTransfer.files;

            form.fileInput.dispatchEvent(new Event('change', { bubbles: true }));

            successCount++;

            const statusEntry = document.createElement('div');
            statusEntry.style.cssText = 'color: #495057;';
            statusEntry.innerHTML = `
                <span style="color: #28a745; font-weight: 700; margin-right: 5px;">\u2714</span>
                ${chapterName}
            `;

            if (statusDiv.firstChild) {
                statusDiv.insertBefore(statusEntry, statusDiv.firstChild);
            } else {
                statusDiv.appendChild(statusEntry);
             }

        } catch (error) {
            failCount++;
            console.error(`Lỗi khi xử lý file ${fileName}:`, error);

            const statusEntry = document.createElement('div');
            statusEntry.style.cssText = 'color: #721c24;';
            statusEntry.innerHTML = `
                <span style="color: #dc3545; font-weight: 700; margin-right: 5px;">\u2718</span>
                Lỗi xử lý file: ${fileName}
            `;
             if (statusDiv.firstChild) {
                 statusDiv.insertBefore(statusEntry, statusDiv.firstChild);
             } else {
                 statusDiv.appendChild(statusDiv);
             }
        }

        setTimeout(uploadNextFile, 50);
    }

    uploadBtn.onclick = () => {
        if (isUploading) return;

        forms = findChapterForms();

        if (selectedFiles.length === 0) {
            alert('Vui lòng chọn file TXT để upload.');
            return;
        }

        if (selectedFiles.length > forms.length) {
            const confirmUpload = confirm(`Bạn đã chọn ${selectedFiles.length} file nhưng chỉ có ${forms.length} ô nhập liệu chương. Chỉ có ${forms.length} file đầu tiên được xử lý. Bạn có muốn tiếp tục không?`);
            if (!confirmUpload) return;
        }

        collapseSettings();

        isUploading = true;
        uploadProcessRunning = true;
        successCount = 0;
        failCount = 0;
        processedCount = 0;

        totalFiles = Math.min(selectedFiles.length, forms.length);
        uploadQueue = [];
        statusDiv.innerHTML = '';

        for (let i = 0; i < totalFiles; i++) {
            uploadQueue.push({
                form: forms[i],
                file: selectedFiles[i],
                index: i + 1
            });
        }

        uploadBtnText.textContent = 'Đang xử lý...';
        uploadBtn.style.background = '#007bff';
        uploadBtn.style.boxShadow = '0 2px 4px rgba(0,123,255,0.3), 0 4px 8px rgba(0,0,0,0.1)';
        showStatus();

        uploadNextFile();
    };

    loadSettings();
})();

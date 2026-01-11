// ==UserScript==
// @name         Wiki Tools - Upload File & Download Name
// @namespace    http://tampermonkey.net/
// @version      2.1.3
// @author       giaays
// @updateURL    https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Upload_wiki.user.js
// @downloadURL  https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Upload_wiki.user.js
// @description  Tự động upload file txt và điền tên chương khi nhúng file + Tải danh sách Name
// @match        *://*/nhung-file*
// @match        *://*/*chinh-sua*
// @match        */truyen/*
// @icon         https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/icon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Phần 1: Upload Multiple Files for Wiki
    if (window.location.pathname.includes('nhung-file') || window.location.pathname.includes('chinh-sua')) {
        let isMinimized = true;
        let selectedFiles = [];
        let wasProgressDivVisible = 'none';
        let wasCompletionSummaryDivVisible = 'none';
        let wasStatusDivVisible = 'none';
        let numFileInput;
        let autoNumberCheckbox;
        let currentVolumeElement = null;
        let allVolumeElements = [];
        const volumeListeners = new WeakMap();
        let isDashFilterChecked = true;
        let isDuplicateFilterChecked = true;
        const STORAGE_KEY = 'WIKI_UPLOAD_SETTINGS_V2';
        let filterInput;
        let dragStartX, dragStartY, panelStartX, panelStartY, isDragging = false;
        let wasDragging = false;
        const initialTop = '100px';
        const minimizedWidth = 56;
        const fixedExpandedWidth = 340;
        const initialRightPixel = window.innerWidth * 0.05;
        const initialLeft = window.innerWidth - minimizedWidth - initialRightPixel;

        function debounce(func, delay) {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        }

        function findPageElements() {
            if (currentVolumeElement) {
                numFileInput = currentVolumeElement.querySelector('input[name="numFile"][type="number"]');
                autoNumberCheckbox = currentVolumeElement.querySelector('input[name="autoNumber"][type="checkbox"]');
            } else {
                numFileInput = document.querySelector('input[name="numFile"][type="number"]');
                autoNumberCheckbox = document.querySelector('input[name="autoNumber"][type="checkbox"]');
            }

            if (!numFileInput || !autoNumberCheckbox) {
                numFileInput = null;
                autoNumberCheckbox = null;
            }
        }

        const debouncedRebuild = debounce(rebuildVolumeOptions, 200);

        function rebuildVolumeOptions() {
            const wrappers = Array.from(document.querySelectorAll('.volume-info-wrapper'));
            const currentSelectedVolumeId = currentVolumeElement ? currentVolumeElement.getAttribute('data-volume-id') : null;
            let selectedIndexToSet = -1;

            volumeSelect.innerHTML = '<option value="-1" disabled selected>-- Chọn quyển để thêm chương --</option>';

            let lastAppendableIndex = -1;
            let availableVolumes = [];

            wrappers.forEach((wrapper, index) => {
                let nameEl = wrapper.querySelector('input[name="nameCn"]');
                if (!nameEl) nameEl = wrapper.querySelector('input[name="name"]');

                const hasUploadFields = wrapper.querySelector('input[name="numFile"][type="number"]') &&
                                        wrapper.querySelector('input[name="autoNumber"][type="checkbox"]');

                if (!hasUploadFields) return;

                if (!nameEl && wrappers.length > 1 && index === wrappers.length - 1) return;

                let name = nameEl && nameEl.value.trim() !== '' ? nameEl.value.trim() : `Quyển ${index + 1}`;
                wrapper.setAttribute('data-volume-id', `volume-${index}`);
                const isNamed = nameEl && nameEl.value.trim() !== '';

                availableVolumes.push({
                    wrapper: wrapper,
                    name: name,
                    isNamed: isNamed,
                    originalIndex: index
                });

                if (nameEl && !volumeListeners.has(nameEl)) {
                    nameEl.addEventListener('input', debouncedRebuild);
                    volumeListeners.set(nameEl, debouncedRebuild);
                }
            });

            if (availableVolumes.length === 0) {
                volumeSelectWrapper.style.display = 'none';
                currentVolumeElement = null;
                return;
            }

            volumeSelectWrapper.style.display = 'block';
            const selectableVolumes = availableVolumes.filter(v =>
                v.isNamed ||
                v.wrapper.querySelector('.volume-wrapper')?.getAttribute('data-append') === 'true'
            );

            if (selectableVolumes.length === 0) {
                 currentVolumeElement = null;
                 volumeSelect.value = "-1";
                 findPageElements();
                 return;
            }

            allVolumeElements = [];
            let defaultSelectionIndex = -1;

            selectableVolumes.forEach((volumeInfo, newIndex) => {
                 const { wrapper, name } = volumeInfo;
                allVolumeElements.push(wrapper);

                const trueWrapper = wrapper.querySelector('.volume-wrapper');
                const isAppendable = !!(trueWrapper && trueWrapper.getAttribute('data-append') === 'true');
                let displayName = name;

                if (isAppendable) {
                    displayName += ' (Bổ sung)';
                    lastAppendableIndex = newIndex;
                }
                if (defaultSelectionIndex === -1) defaultSelectionIndex = newIndex;

                const opt = document.createElement('option');
                opt.value = String(newIndex);
                opt.textContent = `${newIndex + 1}. ${displayName}`;
                volumeSelect.appendChild(opt);

                if (currentSelectedVolumeId === wrapper.getAttribute('data-volume-id')) {
                    selectedIndexToSet = newIndex;
                }
            });

            if (selectedIndexToSet !== -1) {
                 volumeSelect.value = String(selectedIndexToSet);
                 currentVolumeElement = allVolumeElements[selectedIndexToSet];
            } else {
                 let finalSelectionIndex = lastAppendableIndex !== -1 ? lastAppendableIndex : (defaultSelectionIndex !== -1 ? defaultSelectionIndex : 0);

                 if (allVolumeElements[finalSelectionIndex]) {
                     volumeSelect.value = String(finalSelectionIndex);
                     currentVolumeElement = allVolumeElements[finalSelectionIndex];
                 } else {
                     currentVolumeElement = allVolumeElements[0] || null;
                     volumeSelect.value = currentVolumeElement ? "0" : "-1";
                 }
            }

            findPageElements();
        }

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
        titleWrapper.style.cssText = 'display: none; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 16px; border-bottom: 2px solid #e5e1da; width: 100%;';

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

        const volumeSelectWrapper = document.createElement('div');
        volumeSelectWrapper.style.cssText = 'margin-bottom: 12px; display: none; padding: 0 4px;';

        const volumeLabel = document.createElement('div');
        volumeLabel.textContent = 'Chọn Quyển Upload:';
        volumeLabel.style.cssText = 'color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;';
        volumeSelectWrapper.appendChild(volumeLabel);

        const volumeSelect = document.createElement('select');
        volumeSelect.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            appearance: auto !important;
            -webkit-appearance: auto !important;
            width: 100%;
            padding: 8px;
            border: 1px solid #d6cfc4;
            border-radius: 6px;
            font-size: 14px;
            color: #333;
            box-sizing: border-box;
            background-color: #ffffff;
            min-height: 38px;
            z-index: 10001;
        `;
        volumeSelect.onchange = (event) => {
            const selectedIndex = parseInt(event.target.value);
            const selectedVolumeWrapper = allVolumeElements[selectedIndex];
            currentVolumeElement = selectedVolumeWrapper;
            findPageElements();

            const volumeWrapper = selectedVolumeWrapper.querySelector('.volume-wrapper');
            const isAppendable = !!(volumeWrapper && volumeWrapper.getAttribute('data-append') === 'true');

            if (isAppendable) {
                const addButton = selectedVolumeWrapper.querySelector('.btn-add-volume[data-action="appendLastVolume"]');
                const appendSection = selectedVolumeWrapper.querySelector('.append-last-volume');

                if (addButton && appendSection && appendSection.classList.contains('hide')) {
                    addButton.click();
                }
            }
        };
        volumeSelectWrapper.appendChild(volumeSelect);
        contentWrapper.appendChild(volumeSelectWrapper);

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
            border: 1px solid #d6cfc4;
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
        fileCountDiv.style.cssText = 'color: #6c757d; font-size: 13px; margin-top: 6px; margin-bottom: 10px; display: none; padding-left: 4px;';
        contentWrapper.appendChild(fileCountDiv);

        fileInput.onchange = (event) => {
            selectedFiles = Array.from(event.target.files);
            const numFiles = selectedFiles.length;
            findPageElements();

            if (numFiles > 0) {
                if (numFileInput) {
                    numFileInput.value = numFiles;
                    numFileInput.dispatchEvent(new Event('input', { bubbles: true }));
                    numFileInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                if (autoNumberCheckbox && autoNumberCheckbox.checked) {
                    autoNumberCheckbox.checked = false;
                    autoNumberCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                }

                fileCountDiv.textContent = `Đã chọn ${numFiles} file`;
                fileCountDiv.style.cssText = `
                    color: #155724;
                    font-size: 13px;
                    margin-top: 6px;
                    margin-bottom: 10px;
                    display: block;
                    font-weight: 600;
                    padding-left: 4px;
                `;
            } else {
                fileCountDiv.textContent = '';
                fileCountDiv.style.cssText = 'color: #6c757d; font-size: 13px; margin-top: 6px; margin-bottom: 10px; display: none; padding-left: 4px;';
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
        settingsToggle.style.cssText = 'color: #495057; font-size: 14px; font-weight: 600; margin-top: 12px; margin-bottom: 10px; cursor: pointer; padding: 10px 12px; background: #e5e1da; border-radius: 8px; transition: background 0.2s; display: flex; align-items: center; justify-content: space-between;';
        settingsToggle.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                ${settingsGearIcon}
                <span>Cài đặt</span>
            </div>
            ${settingsChevronIcon}
        `;
        settingsToggle.onmouseover = () => { settingsToggle.style.background = '#d6cfc4'; };
        settingsToggle.onmouseout = () => {
            if (!isSettingsExpanded) settingsToggle.style.background = '#e5e1da';
        };
        contentWrapper.appendChild(settingsToggle);

        const settingsContainer = document.createElement('div');
        settingsContainer.style.cssText = `
            padding-top: 0;
            border-top: 1px solid #d6cfc4;
            margin-bottom: 8px;
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
                if (chevron) chevron.style.transform = 'rotate(180deg)';

                uploadBtn.style.display = 'none';
                progressDiv.style.display = 'none';
                completionSummaryDiv.style.display = 'none';
                statusDiv.style.display = 'none';
            } else {
                uploadBtn.style.display = 'flex';
                progressDiv.style.display = wasProgressDivVisible;
                completionSummaryDiv.style.display = wasCompletionSummaryDivVisible;
                statusDiv.style.display = wasStatusDivVisible;

                settingsContainer.style.display = 'none';
                settingsToggle.style.background = '#e5e1da';
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
        };

        const toggleSettings = () => setSettingsExpanded(!isSettingsExpanded);
        const collapseSettings = () => setSettingsExpanded(false);
        settingsToggle.onclick = toggleSettings;

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
                border-radius: 6px;
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
                width: 18px;
                height: 18px;
                border: 2px solid ${isCheckedState ? '#28a745' : '#d6cfc4'};
                border-radius: 4px;
                background: ${isCheckedState ? '#28a745' : '#ffffff'};
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease-out;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            `;
            const checkmark = document.createElement('div');
            checkmark.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 16 16" fill="white" stroke="white" stroke-width="1">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
                </svg>
            `;
            checkmark.style.cssText = `
                opacity: ${isCheckedState ? '1' : '0'};
                transform: scale(${isCheckedState ? '1' : '0.5'});
                transition: opacity 0.2s ease-out, transform 0.2s ease-out;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
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
                noteDiv.style.cssText = 'color: #6c757d; font-size: 11px; margin-top: 2px; padding-left: 28px; line-height: 1.3;';
                wrapper.appendChild(noteDiv);
            }

            const updateUI = (checked) => {
                if (checked) {
                    customBox.style.background = '#28a745';
                    customBox.style.borderColor = '#28a745';
                    checkmark.style.opacity = '1';
                    checkmark.style.transform = 'scale(1)';
                } else {
                    customBox.style.background = '#ffffff';
                    customBox.style.borderColor = '#d6cfc4';
                    checkmark.style.opacity = '0';
                    checkmark.style.transform = 'scale(0.5)';
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

        const dashFilter = createCustomCheckbox(true, 'Xóa mô tả sau dấu (-)', (checked) => {
            isDashFilterChecked = checked;
        });
        dashFilter.wrapper.style.marginTop = '10px';
        dashFilter.wrapper.style.marginBottom = '8px';
        settingsContainer.appendChild(dashFilter.wrapper);

        const duplicateFilter = createCustomCheckbox(true, 'Xóa tên chương lặp', (checked) => {
            isDuplicateFilterChecked = checked;
        }, '(Ví dụ: 第1章 第1章 thành 第1章)');
        duplicateFilter.wrapper.style.marginTop = '0px';
        duplicateFilter.wrapper.style.marginBottom = '10px';
        settingsContainer.appendChild(duplicateFilter.wrapper);

        const filterExtraWordsDescription = document.createElement('div');
        filterExtraWordsDescription.textContent = 'Xóa Từ/Cụm từ thừa trong tên chương (cách nhau bằng dấu phẩy):';
        filterExtraWordsDescription.style.cssText = 'color: #495057; font-size: 13px; margin-bottom: 6px; padding-left: 4px; margin-top: 5px;';
        settingsContainer.appendChild(filterExtraWordsDescription);

        filterInput = document.createElement('input');
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
            background-color: #ffffff;
        `;
        filterInput.value = '[VIP]';
        settingsContainer.appendChild(filterInput);

        const filterNote = document.createElement('div');
        filterNote.textContent = '(Có phân biệt chữ hoa/thường)';
        filterNote.style.cssText = 'color: #6c757d; font-size: 11px; margin-bottom: 10px; padding-left: 5px;';
        settingsContainer.appendChild(filterNote);
        filterInput.oninput = saveSettings;

        const loadSettings = () => {
            const settingsJson = localStorage.getItem(STORAGE_KEY);
            if (!settingsJson) return;

            try {
                const settings = JSON.parse(settingsJson);
                if (settings.dashFilter !== undefined) dashFilter.setState(settings.dashFilter);
                if (settings.duplicateFilter !== undefined) duplicateFilter.setState(settings.duplicateFilter);
                if (settings.filterWords !== undefined) filterInput.value = settings.filterWords;
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
            margin-top: 12px;
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
            margin-top: 10px;
            margin-bottom: 10px;
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

        controlPanel.addEventListener('mousedown', (e) => {
            if (!isMinimized && (e.target.closest('input') || e.target.closest('label') || e.target.closest('button') || e.target.closest('select') || e.target.closest('#chapterFilterInput') || e.target.closest('.checkbox-wrapper'))) {
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

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) wasDragging = true;

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
                controlPanel.style.right = 'auto';
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

                    if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);

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

                    const doublePipeIndex = firstLine.indexOf('||');
                    if (doublePipeIndex !== -1) firstLine = firstLine.substring(doublePipeIndex + 2).trim();

                    firstLine = firstLine.replace(/\s+/g, ' ').trim();

                    const hanChapterMatch = firstLine.match(/(第\s*[一二三四五六七八九十百千万\d]+\s*章)/i);
                    const nonHanChapterRegex = /(chapter\s*\d+|part\s*\d+|c\s*\d+)/i;
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
                        if (dashIndex !== -1) firstLine = firstLine.substring(0, dashIndex).trim();
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
            if (!currentVolumeElement) return [];

            return Array.from(currentVolumeElement.querySelectorAll('.chapter-info-wrapper')).map(wrapper => {
                const nameInput = wrapper.querySelector('input[name="name"][type="text"]');
                const fileInputElem = wrapper.querySelector('input[type="file"][name="file"]');

                if (nameInput && fileInputElem && wrapper.offsetParent !== null) {
                    return { nameInput, fileInput: fileInputElem };
                }
                return null;
            }).filter(form => form !== null);
        }

        let isUploading = false;
        let uploadProcessRunning = false;
        let forms;
        let uploadQueue = [];
        let processedCount = 0;
        let successCount = 0;
        let failCount = 0;
        let totalFiles = 0;

        function updateProgress(index) {
            const percentage = totalFiles > 0 ? Math.floor((index / totalFiles) * 100) : 0;
            progressText.textContent = `Đang xử lý: ${index}/${totalFiles} file (${percentage}%)`;
            progressBar.style.width = `${percentage}%`;
        }

        function showStatus(isFinal = false) {
            statusDiv.style.display = 'block';
            if (isFinal) {
                progressDiv.style.display = 'none';
                completionSummaryDiv.textContent = `✅ Xử lý Hoàn tất.`;
                completionSummaryDiv.style.display = 'block';

                uploadBtnText.textContent = 'Bắt đầu upload';
                uploadBtn.style.background = '#28a745';
                uploadBtn.style.boxShadow = '0 2px 4px rgba(40,167,69,0.3), 0 4px 8px rgba(0,0,0,0.1)';
                isUploading = false;

                setTimeout(() => {
                    completionSummaryDiv.style.display = 'none';
                }, 5000);
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

            const task = uploadQueue.shift();
            const { form, file, index } = task;

            let chapterName = '';
            const fileName = file.name;

            try {
                chapterName = await readFirstLine(file);
            } catch (error) {
                chapterName = fileName.replace(/\.txt$/i, '');
                console.error(`[Wiki Upload ERROR] Lỗi khi đọc file ${fileName}:`, error);
            }

            processedCount++;
            updateProgress(processedCount);

            const fileInput = form.fileInput;
            const nameInput = form.nameInput;

            try {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;

                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                fileInput.dispatchEvent(new Event('input', { bubbles: true }));

                nameInput.value = chapterName;
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                nameInput.dispatchEvent(new Event('change', { bubbles: true }));

                await new Promise(resolve => setTimeout(resolve, 50));
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
                console.error(`[Wiki Upload CRITICAL ERROR] File ${index} (${fileName}): ${error.message}`, error);

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

            if (statusDiv.style.display === 'none') statusDiv.style.display = 'block';
            statusDiv.scrollTop = statusDiv.scrollHeight;
            setTimeout(uploadNextFile, 50);
        }

        uploadBtn.onclick = () => {
            if (isUploading) return;

            forms = findChapterForms();

            if (selectedFiles.length === 0) {
                alert('Vui lòng chọn file TXT để upload.');
                return;
            }

            if (!currentVolumeElement || volumeSelect.value === "-1") {
                alert('Vui lòng chọn một Quyển hợp lệ để upload chương.');
                return;
            }

            if (forms.length === 0) {
                alert('Không tìm thấy ô nhập liệu chương trong Quyển đã chọn. Vui lòng đảm bảo Quyển này đã được bật chức năng Thêm chương hoặc Bổ sung.');
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
            statusDiv.scrollTop = 0;

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
            updateProgress(0);
            uploadNextFile();
        };

        loadSettings();

        function setupMutationObserver() {
            const targetNode = document.body;
            const config = { childList: true, subtree: true };

            const callback = (mutationsList, observer) => {
                let volumeChanged = false;
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        if (Array.from(mutation.addedNodes).some(n => n.nodeType === 1 && (n.matches('.volume-info-wrapper') || n.querySelector('.volume-info-wrapper')))) {
                            volumeChanged = true;
                            break;
                        }
                        if (Array.from(mutation.removedNodes).some(n => n.nodeType === 1 && (n.matches('.volume-info-wrapper') || n.querySelector('.volume-info-wrapper')))) {
                            volumeChanged = true;
                            break;
                        }
                    }
                }
                if (volumeChanged) {
                     if (window.rebuildTimer) clearTimeout(window.rebuildTimer);
                     window.rebuildTimer = setTimeout(rebuildVolumeOptions, 100);
                }
            };

            const observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
            setTimeout(rebuildVolumeOptions, 500);
        }

        setupMutationObserver();
    }

    // Phần 2: Tải Danh Sách Name Truyện
    if (window.location.pathname.includes('truyen')) {
        function getTenTruyen() {
            const urlParts = window.location.pathname.split('/');
            let tenTruyen = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];

            tenTruyen = tenTruyen.split('#')[0].split('?')[0];

            if (!tenTruyen || tenTruyen.length < 3) {
                const titleElement = document.querySelector('h1, .title, .story-title');
                if (titleElement) {
                    tenTruyen = titleElement.textContent.trim();
                } else {
                    tenTruyen = document.title.split('-')[0].trim();
                }
            }

            tenTruyen = tenTruyen.replace(/[<>:"/\\|?*]/g, '_');
            return tenTruyen || 'truyen';
        }

        function downloadFile(content, filename) {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }

        function taiDanhSachName() {
            const listName = document.getElementById('listName');
            if (!listName) {
                alert('Không tìm thấy danh sách name!');
                return;
            }

            const items = listName.querySelectorAll('li');
            if (items.length === 0) {
                alert('Danh sách name trống!');
                return;
            }

            let content = '';
            items.forEach(item => {
                const text = item.textContent.trim();
                if (text) content += text + '\n';
            });

            const tenTruyen = getTenTruyen();
            const filename = `name2_${tenTruyen}.txt`;
            downloadFile(content, filename);
        }

        function taoNutTai() {
            if (document.getElementById('btn-tai-name')) return;

            const hasNameList = document.getElementById('listName');
            if (!hasNameList) return;

            const nameButton = Array.from(document.querySelectorAll('button, .btn, a')).find(
                el => el.textContent.trim() === 'Name'
            );
            if (!nameButton) return;

            const btnContainer = document.createElement('div');
            btnContainer.style.cssText = 'display: block; margin-top: 10px;';

            const downloadBtn = document.createElement('button');
            downloadBtn.id = 'btn-tai-name';
            downloadBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span style="vertical-align: middle;">Tải Name</span>
            `;

            downloadBtn.style.cssText = `
                margin: 0;
                padding: 10px 20px;
                background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3),
                            0 1px 3px rgba(0, 0, 0, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateY(0);
                position: relative;
                overflow: hidden;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                vertical-align: middle;
            `;

            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const ripple = document.createElement('span');
                const rect = downloadBtn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;

                downloadBtn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
                taiDanhSachName();
            });

            downloadBtn.addEventListener('mouseenter', () => {
                downloadBtn.style.background = 'linear-gradient(145deg, #3a3a3a, #2c2c2c)';
                downloadBtn.style.boxShadow = `
                    0 4px 8px rgba(0, 0, 0, 0.4),
                    0 2px 4px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                `;
                downloadBtn.style.transform = 'translateY(-2px)';
            });

            downloadBtn.addEventListener('mouseleave', () => {
                downloadBtn.style.background = 'linear-gradient(145deg, #2c2c2c, #1a1a1a)';
                downloadBtn.style.boxShadow = `
                    0 3px 6px rgba(0, 0, 0, 0.3),
                    0 1px 3px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `;
                downloadBtn.style.transform = 'translateY(0)';
            });

            downloadBtn.addEventListener('mousedown', () => {
                downloadBtn.style.transform = 'translateY(0) scale(0.96)';
                downloadBtn.style.boxShadow = `
                    0 1px 3px rgba(0, 0, 0, 0.3),
                    0 1px 2px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.08)
                `;
            });

            downloadBtn.addEventListener('mouseup', () => {
                downloadBtn.style.transform = 'translateY(-2px) scale(1)';
            });

            if (!document.getElementById('ripple-animation')) {
                const style = document.createElement('style');
                style.id = 'ripple-animation';
                style.textContent = `
                    @keyframes ripple {
                        0% { transform: scale(0); opacity: 1; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            btnContainer.appendChild(downloadBtn);
            const isMobile = window.innerWidth <= 768;
            const parentContainer = nameButton.parentElement;

            if (isMobile) {
                const docButton = Array.from(document.querySelectorAll('button, .btn, a')).find(
                    el => el.textContent.trim() === 'Đọc' || el.textContent.trim() === 'Doc'
                );

                if (docButton && docButton.parentElement) {
                    docButton.parentElement.insertBefore(btnContainer, docButton);
                    btnContainer.style.display = 'inline-block';
                    btnContainer.style.marginRight = '8px';
                    btnContainer.style.marginTop = '0';
                } else if (parentContainer) {
                    parentContainer.parentElement.insertBefore(btnContainer, parentContainer.nextSibling);
                }
            } else {
                if (parentContainer) {
                    parentContainer.parentElement.insertBefore(btnContainer, parentContainer.nextSibling);
                } else {
                    nameButton.after(btnContainer);
                }
            }
        }

        function init() {
            setTimeout(() => {
                taoNutTai();
            }, 1000);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

        const observer = new MutationObserver(() => {
            if (document.getElementById('listName') && !document.getElementById('btn-tai-name')) {
                taoNutTai();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();

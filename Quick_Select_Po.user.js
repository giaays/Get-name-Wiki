// ==UserScript==
// @name         PO18 / POPO Quick Select Button
// @namespace    po18-popo-quick-select
// @author       giaays
// @updateURL    https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Quick_Select_Po.user.js
// @downloadURL  https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Quick_Select_Po.user.js
// @version      1.0
// @description  One floating button to auto select chapters
// @match        https://*.po18.tw/*
// @match        https://*.popo.tw/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function getItems() {
    return Array.prototype.slice.call(
      document.querySelectorAll('div[data-key]')
    ).filter(function (d) {
      return d.querySelector('input.checkItem[type="checkbox"]');
    });
  }

  // style
  var style = document.createElement('style');
  style.textContent =
    '.qs-btn{' +
    'position:fixed;right:18px;bottom:88px;width:46px;height:46px;' +
    'border-radius:50%;border:none;cursor:pointer;' +
    'background:#000;display:flex;align-items:center;justify-content:center;' +
    'box-shadow:0 10px 22px rgba(0,0,0,.35);' +
    'transition:transform .15s ease,box-shadow .15s ease;}' +
    '.qs-btn:hover{' +
    'transform:translateY(-2px) scale(1.04);' +
    'box-shadow:0 14px 28px rgba(0,0,0,.45);}' +
    '.qs-btn:active{' +
    'transform:scale(.95);' +
    'box-shadow:0 6px 14px rgba(0,0,0,.35);}';
  document.head.appendChild(style);

  // button
  var btn = document.createElement('button');
  btn.className = 'qs-btn';
  btn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M5 12H19" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M9 8L5 12L9 16" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M15 8L19 12L15 16" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';
  document.body.appendChild(btn);

  // logic
  btn.onclick = function () {
    var items = getItems();
    var checked = [];

    for (var i = 0; i < items.length; i++) {
      var cb = items[i].querySelector('input.checkItem');
      if (cb && cb.checked) checked.push(i);
    }

    if (checked.length < 2) return;

    var from = Math.min(checked[0], checked[checked.length - 1]);
    var to = Math.max(checked[0], checked[checked.length - 1]);

    for (var j = from; j <= to; j++) {
      var c = items[j].querySelector('input.checkItem');
      if (c && !c.checked && !c.disabled) c.click();
    }
  };
})();

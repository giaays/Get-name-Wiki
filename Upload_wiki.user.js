// ==UserScript==
// @name         Wiki Tools - Upload File & Download Name
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @author       giaays
// @updateURL    https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Upload_wiki.user.js
// @downloadURL  https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/Upload_wiki.user.js
// @description  Tự động upload file txt và điền tên chương khi nhúng file + Tải danh sách Name
// @match        *://*/nhung-file*
// @match        *://*/*chinh-sua*
// @match        */truyen/*
// @icon         https://raw.githubusercontent.com/giaays/Get-name-Wiki/main/icon.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @grant        none
// ==/UserScript==

!function(){"use strict";if(window.location.pathname.includes("nhung-file")||window.location.pathname.includes("chinh-sua")){console.log("[Wiki Tool] Script started! URL:",window.location.pathname);let i=!0,n=[],t="none",o="none",l="none",a,r,p=null,c=[];const Se=new WeakMap;let x=!0,m=!0;const ze="WIKI_UPLOAD_SETTINGS_V2";let u="UTF-8",d=[],h=null,s="upload",g,y,f,b,v,w=!1,C=!1;const Le=56;var A=.05*window.innerWidth,A=window.innerWidth-Le-A;function ge(){r=(p?(a=p.querySelector('input[name="numFile"][type="number"]'),p):(a=document.querySelector('input[name="numFile"][type="number"]'),document)).querySelector('input[name="autoNumber"][type="checkbox"]'),a&&r||(a=null,r=null)}function ye(){const l=Array.from(document.querySelectorAll(".volume-info-wrapper")),a=p?p.getAttribute("data-volume-id"):null;let r=-1,s=(P.innerHTML='<option value="-1" disabled selected>-- Chọn quyển để thêm chương --</option>',-1),d=[];if(l.forEach((e,t)=>{let n=e.querySelector('input[name="nameCn"]');var o,i;n=n||e.querySelector('input[name="name"]'),!e.querySelector('input[name="numFile"][type="number"]')||!e.querySelector('input[name="autoNumber"][type="checkbox"]')||!n&&1<l.length&&t===l.length-1||(o=n&&""!==n.value.trim()?n.value.trim():"Quyển "+(t+1),e.setAttribute("data-volume-id","volume-"+t),i=n&&""!==n.value.trim(),d.push({wrapper:e,name:o,isNamed:i,originalIndex:t}),n&&!Se.has(n)&&(n.addEventListener("input",Me),Se.set(n,Me)))}),0===d.length)Ae.style.display="none",p=null;else{Ae.style.display="block";var e=d.filter(e=>e.isNamed||"true"===e.wrapper.querySelector(".volume-wrapper")?.getAttribute("data-append"));if(0===e.length)p=null,P.value="-1";else{c=[];let l=-1;e.forEach((e,t)=>{var{wrapper:e,name:n}=e,o=(c.push(e),e.querySelector(".volume-wrapper"));let i=n;o&&"true"===o.getAttribute("data-append")&&(i+=" (Bổ sung)",s=t),-1===l&&(l=t);n=document.createElement("option");n.value=String(t),n.textContent=t+1+". "+i,P.appendChild(n),a===e.getAttribute("data-volume-id")&&(r=t)}),-1!==r?(P.value=String(r),p=c[r]):(e=-1!==s?s:-1!==l?l:0,c[e]?(P.value=String(e),p=c[e]):(p=c[0]||null,P.value=p?"0":"-1"))}ge()}}console.log("[Wiki Tool] Functions defined");const Me=function(t,n){let o;return function(...e){clearTimeout(o),o=setTimeout(()=>{t.apply(this,e)},n)}}(ye,200),j=(console.log("[Wiki Tool] debouncedRebuild created"),document.createElement("div"));j.style.cssText=`
            position: fixed;
            top: 100px;
            right: auto;
            left: ${A}px;
            background: #2c3e50;
            padding: 0;
            border-radius: 50%;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.1);
            width: 56px;
            height: 56px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            border: none;
            transition: all 0.3s ease;
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
        `;A=document.createElement("div");A.style.cssText="width: 100%; height: 100%; position: relative;",j.appendChild(A);const Be=document.createElement("button"),Ie=(Be.innerHTML=`
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
        `,Be.style.cssText=`
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
        `,A.appendChild(Be),document.createElement("div"));Ie.style.cssText="display: none; justify-content: space-between; align-items: center; margin: 0 -24px 0 -24px; padding: 24px 24px 16px 24px; border-bottom: 2px solid #e5e1da; width: calc(100% + 48px); position: sticky; top: 0; background: #ffffff; z-index: 10; border-radius: 12px 12px 0 0;";var F=document.createElement("div"),H=(F.style.cssText="display: flex; align-items: center; gap: 10px;",document.createElement("div")),H=(H.innerHTML=`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
        `,F.appendChild(H),document.createElement("div"));H.textContent="Wiki Tools",H.style.cssText="color: #212529; font-size: 18px; font-weight: 600;",F.appendChild(H);const O=document.createElement("button"),Re=(O.innerHTML=`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `,O.style.cssText=`
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
        `,O.onmouseover=()=>{O.style.background="#e5e1da"},O.onmouseout=()=>{O.style.background="transparent"},Ie.appendChild(F),Ie.appendChild(O),A.appendChild(Ie),document.createElement("div"));Re.style.cssText="display: none; margin: 0 -24px 0 -24px; padding: 0 24px 16px 24px; border-bottom: 2px solid #e5e1da; width: calc(100% + 48px); position: sticky; top: 66px; background: #ffffff; z-index: 9;";H=document.createElement("div");H.style.cssText="display: flex; gap: 0; width: 100%;";const V=document.createElement("button"),_=(V.textContent="Upload",V.style.cssText=`
    flex: 1 1 50%;
    max-width: 50%;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-bottom: 3px solid #28a745;
    color: #28a745;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
`,document.createElement("button")),$e=(_.textContent="Chia Chương",_.style.cssText=`
    flex: 1 1 50%;
    max-width: 50%;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: #6c757d;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
`,H.appendChild(V),H.appendChild(_),Re.appendChild(H),A.appendChild(Re),document.createElement("div")),D=($e.style.cssText="overflow-y: auto; overflow-x: hidden; flex: 1; min-height: 0; padding-bottom: 20px;",A.appendChild($e),document.createElement("div")),Ae=(D.style.cssText="display: none; width: 100%; padding-bottom: 16px;",document.createElement("div"));Ae.style.cssText="margin-bottom: 12px; display: none; padding: 0 4px;";F=document.createElement("div");F.textContent="Chọn Quyển Upload:",F.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",Ae.appendChild(F);const P=document.createElement("select");P.style.cssText=`
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
        `,P.onchange=e=>{var e=parseInt(e.target.value),e=c[e],t=(p=e,ge(),e.querySelector(".volume-wrapper"));!(!t||"true"!==t.getAttribute("data-append"))&&(t=e.querySelector('.btn-add-volume[data-action="appendLastVolume"]'),e=e.querySelector(".append-last-volume"),t)&&e&&e.classList.contains("hide")&&t.click()},Ae.appendChild(P),D.appendChild(Ae);H=document.createElement("div"),A=(H.style.cssText="margin-bottom: 12px; display: block; padding: 0 4px;",document.createElement("div"));A.textContent="Chọn Bảng Mã File:",A.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",H.appendChild(A);const Fe=document.createElement("select");Fe.style.cssText=`
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
`;[{value:"UTF-8",label:"UTF-8 (Mặc định)"},{value:"UTF-16LE",label:"UTF-16 LE"},{value:"UTF-16BE",label:"UTF-16 BE"},{value:"Shift_JIS",label:"Shift JIS (日本語)"},{value:"GBK",label:"GBK (简体中文)"},{value:"Big5",label:"Big5 (繁體中文)"},{value:"Windows-1252",label:"Windows-1252"},{value:"ISO-8859-1",label:"ISO-8859-1"}].forEach(e=>{var t=document.createElement("option");t.value=e.value,t.textContent=e.label,Fe.appendChild(t)}),Fe.onchange=e=>{u=e.target.value,console.log("Đã chọn encoding:",u)},H.appendChild(Fe),D.appendChild(H);F=document.createElement("input");F.type="file",F.id="autoUploadFileInput",F.multiple=!0,F.accept=".txt",F.style.display="none",D.appendChild(F);const Y=document.createElement("label");Y.setAttribute("for","autoUploadFileInput"),Y.style.cssText=`
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
        `;A=document.createElement("span"),H=(A.innerHTML=`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
            </svg>
        `,Y.appendChild(A),document.createElement("span"));H.textContent="Chọn file",Y.appendChild(H),Y.onmouseover=()=>{Y.style.background="#fafaf8",Y.style.borderColor="#b8ad9f",Y.style.transform="translateY(-1px)",Y.style.boxShadow="0 4px 8px rgba(0,0,0,0.1)"},Y.onmouseout=()=>{Y.style.background="#ffffff",Y.style.borderColor="#d6cfc4",Y.style.transform="translateY(0)",Y.style.boxShadow="0 2px 4px rgba(0,0,0,0.05)"},D.appendChild(Y);const K=document.createElement("div"),He=(K.style.cssText="color: #6c757d; font-size: 13px; margin-top: 6px; margin-bottom: 10px; display: none; padding-left: 4px;",D.appendChild(K),document.createElement("div"));He.style.cssText="display: none; max-height: 150px; overflow-y: auto; background: #f8f9fa; border: 1px solid #d6cfc4; border-radius: 4px; padding: 8px; margin-bottom: 10px; font-size: 12px;",D.appendChild(He);let k=!(F.onchange=e=>{e=(n=Array.from(e.target.files)).length;ge(),0<e?(a&&(a.value=e,a.dispatchEvent(new Event("input",{bubbles:!0})),a.dispatchEvent(new Event("change",{bubbles:!0}))),r&&r.checked&&(r.checked=!1,r.dispatchEvent(new Event("change",{bubbles:!0}))),K.textContent=`Đã chọn ${e} file`,K.style.cssText=`
                    color: #155724;
                    font-size: 13px;
                    margin-top: 6px;
                    margin-bottom: 10px;
                    display: block;
                    font-weight: 600;
                    padding-left: 4px;
                `):(K.textContent="",K.style.cssText="color: #6c757d; font-size: 13px; margin-top: 6px; margin-bottom: 10px; display: none; padding-left: 4px;"),He.style.display="none"});const J=document.createElement("div"),G=(J.style.cssText="color: #495057; font-size: 14px; font-weight: 600; margin-top: 12px; margin-bottom: 10px; cursor: pointer; padding: 10px 12px; background: #e5e1da; border-radius: 8px; transition: background 0.2s; display: flex; align-items: center; justify-content: space-between;",J.innerHTML=`
            <div style="display: flex; align-items: center; gap: 8px;">
                
            <svg id="settingsGearIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
            </svg>
        
                <span>Cài đặt</span>
            </div>
            
            <svg id="settingsChevronIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#495057" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s ease; transform: rotate(0deg);">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        
        `,J.onmouseover=()=>{J.style.background="#d6cfc4"},J.onmouseout=()=>{k||(J.style.background="#e5e1da")},D.appendChild(J),document.createElement("div")),Ue=(G.style.cssText=`
            padding-top: 0;
            border-top: 1px solid #d6cfc4;
            margin-bottom: 8px;
            width: 100%;
            box-sizing: border-box;
            display: none;
        `,D.appendChild(G),e=>{k=e;e=document.getElementById("settingsChevronIcon");k?(t=Q.style.display,o=ee.style.display,l=te.style.display,G.style.display="block",J.style.background="#d6cfc4",e&&(e.style.transform="rotate(180deg)"),X.style.display="none",Z.style.display="none",Q.style.display="none",ee.style.display="none",te.style.display="none"):(X.style.display="flex",Z.style.display=S?"flex":"none",Q.style.display=t,ee.style.display=o,te.style.display=l,G.style.display="none",J.style.background="#e5e1da",e&&(e.style.transform="rotate(0deg)"))});J.onclick=()=>Ue(!k);const We=()=>{var e={filterWords:g.value.trim(),dashFilter:x,duplicateFilter:m};try{localStorage.setItem(ze,JSON.stringify(e))}catch(e){console.error("Lỗi khi lưu cài đặt:",e)}};A=(e,t,n,o=null)=>{let i=e;const l=document.createElement("div");l.style.cssText=`
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
            `,l.onmouseover=()=>{l.style.boxShadow="0 2px 6px rgba(0,0,0,0.08)",l.style.borderColor="#b8ad9f"},l.onmouseout=()=>{l.style.boxShadow="0 1px 3px rgba(0,0,0,0.05)",l.style.borderColor="#d6cfc4"};e=document.createElement("div");e.style.cssText="display: flex; align-items: center; gap: 10px; width: 100%;";const a=document.createElement("div"),r=(a.style.cssText=`
                width: 18px;
                height: 18px;
                border: 2px solid ${i?"#28a745":"#d6cfc4"};
                border-radius: 4px;
                background: ${i?"#28a745":"#ffffff"};
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease-out;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            `,document.createElement("div"));r.innerHTML=`
                <svg width="14" height="14" viewBox="0 0 16 16" fill="white" stroke="white" stroke-width="1">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
                </svg>
            `,r.style.cssText=`
                opacity: ${i?"1":"0"};
                transform: scale(${i?"1":"0.5"});
                transition: opacity 0.2s ease-out, transform 0.2s ease-out;
                display: flex;
                align-items: center;
                justify-content: center;
            `,a.appendChild(r);var s=document.createElement("span");s.textContent=t,s.style.cssText="color: #495057; font-size: 14px; flex: 1;",e.appendChild(a),e.appendChild(s),l.appendChild(e),o&&((t=document.createElement("div")).textContent=o,t.style.cssText="color: #6c757d; font-size: 11px; margin-top: 2px; padding-left: 28px; line-height: 1.3;",l.appendChild(t));const d=e=>{e?(a.style.background="#28a745",a.style.borderColor="#28a745",r.style.opacity="1",r.style.transform="scale(1)"):(a.style.background="#ffffff",a.style.borderColor="#d6cfc4",r.style.opacity="0",r.style.transform="scale(0.5)")};return l.onclick=()=>{i=!i,d(i),n(i),We()},{wrapper:l,isChecked:()=>i,setState:e=>{i=e,d(i),n(i)}}};const qe=A(!0,"Xóa mô tả sau dấu (-)",e=>{x=e}),Ne=(qe.wrapper.style.marginTop="10px",qe.wrapper.style.marginBottom="8px",G.appendChild(qe.wrapper),A(!0,"Xóa tên chương lặp",e=>{m=e},"(Ví dụ: 第1章 第1章 thành 第1章)"));Ne.wrapper.style.marginTop="0px",Ne.wrapper.style.marginBottom="10px",G.appendChild(Ne.wrapper);H=document.createElement("div"),F=(H.textContent="Xóa Từ/Cụm từ thừa trong tên chương (cách nhau bằng dấu phẩy):",H.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; padding-left: 4px; margin-top: 5px;",G.appendChild(H),(g=document.createElement("input")).type="text",g.placeholder="Ví dụ: [VIP], C1",g.id="chapterFilterInput",g.style.cssText=`
            width: 100%;
            padding: 10px;
            margin-bottom: 4px;
            border: 1px solid #d6cfc4;
            border-radius: 6px;
            font-size: 14px;
            color: #495057;
            box-sizing: border-box;
            background-color: #ffffff;
        `,g.value="[VIP]",G.appendChild(g),document.createElement("div"));F.textContent="(Có phân biệt chữ hoa/thường)",F.style.cssText="color: #6c757d; font-size: 11px; margin-bottom: 10px; padding-left: 5px;",G.appendChild(F),g.oninput=We;const X=document.createElement("button");X.style.cssText=`
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
        `;A=document.createElement("span");A.innerHTML=`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
        `,A.style.verticalAlign="middle",X.appendChild(A);const je=document.createElement("span"),Z=(je.textContent="Bắt đầu upload",X.appendChild(je),X.onmouseover=()=>{X.style.background="#218838",X.style.transform="translateY(-2px)",X.style.boxShadow="0 4px 8px rgba(40,167,69,0.4), 0 6px 12px rgba(0,0,0,0.15)"},X.onmouseout=()=>{X.style.background="#28a745",X.style.transform="translateY(0)",X.style.boxShadow="0 2px 4px rgba(40,167,69,0.3), 0 4px 8px rgba(0,0,0,0.1)"},D.appendChild(X),document.createElement("button")),Q=(Z.style.cssText=`
            background: #dc3545;
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(220,53,69,0.3), 0 4px 8px rgba(0,0,0,0.1);
            display: none;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 8px;
        `,Z.innerHTML=`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
            </svg>
            <span>Dừng upload</span>
        `,Z.onmouseover=()=>{Z.style.background="#c82333",Z.style.transform="translateY(-2px)",Z.style.boxShadow="0 4px 8px rgba(220,53,69,0.4), 0 6px 12px rgba(0,0,0,0.15)"},Z.onmouseout=()=>{Z.style.background="#dc3545",Z.style.transform="translateY(0)",Z.style.boxShadow="0 2px 4px rgba(220,53,69,0.3), 0 4px 8px rgba(0,0,0,0.1)"},Z.onclick=()=>{z=!1,S=!1,Z.style.display="none",je.textContent="Bắt đầu upload",X.style.background="#28a745",X.style.boxShadow="0 2px 4px rgba(40,167,69,0.3), 0 4px 8px rgba(0,0,0,0.1)",Q.style.display="none";const e=document.createElement("div");e.style.cssText="margin-top:10px; margin-bottom:10px; font-size:14px; background:#fff3cd; color:#856404; border:1px solid #ffeeba; padding:10px 12px; border-radius:8px; font-weight:600; text-align:center;",e.textContent=`⛔ Đã dừng. Đã xử lý ${B}/${$} file.`,D.insertBefore(e,Q),setTimeout(()=>e.remove(),5e3)},D.appendChild(Z),document.createElement("div")),Oe=(Q.style.cssText=`
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
        `,D.appendChild(Q),document.createElement("div"));Q.appendChild(Oe);H=document.createElement("div");H.style.cssText="height: 8px; background: #e9ecef; border-radius: 4px; margin-top: 8px; overflow: hidden;",Q.appendChild(H);const Ve=document.createElement("div"),ee=(Ve.style.cssText="height: 100%; width: 0%; background: #28a745; transition: width 0.3s ease; border-radius: 4px;",H.appendChild(Ve),document.createElement("div")),te=(ee.style.cssText=`
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
        `,D.appendChild(ee),document.createElement("div")),ne=(te.style.cssText=`
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
        `,D.appendChild(te),$e.appendChild(D),document.createElement("div"));ne.style.cssText="display: none; width: 100%; padding-bottom: 16px;";F=document.createElement("div"),A=(F.style.cssText="margin-top: 12px; margin-bottom: 12px;",document.createElement("input")),H=(A.type="file",A.id="splitFileInput",A.accept=".txt",A.style.display="none",document.createElement("label"));H.setAttribute("for","splitFileInput"),H.style.cssText=`
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
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    border: 1px solid #d6cfc4;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`,H.innerHTML=`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
    </svg>
    <span>Chọn file</span>
`,F.appendChild(A),F.appendChild(H),ne.appendChild(F);const _e=document.createElement("div");_e.style.cssText="color: #6c757d; font-size: 13px; margin-bottom: 12px; display: none; padding: 0 4px;",ne.appendChild(_e);H=document.createElement("div"),F=(H.style.cssText="margin-bottom: 12px; padding: 0 4px;",document.createElement("div"));F.textContent="Chọn Rule Chia:",F.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",H.appendChild(F);const oe=document.createElement("select"),ie=(oe.style.cssText=`
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
            background-color: #ffffff;
            min-height: 38px;
        `,oe.innerHTML=`
    <option value="regex1">Rule 1: Chương/Hồi (第.*章)</option>
    <option value="blankLines">Rule 2: Theo số dòng trắng</option>
    <option value="novelDownloader">Rule 3: Novel Downloader (======)</option>
`,H.appendChild(oe),ne.appendChild(H),document.createElement("div"));ie.style.cssText="margin-bottom: 12px; padding: 0 4px; display: none;";F=document.createElement("div");F.textContent="Số dòng trắng giữa các chương:",F.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",ie.appendChild(F);const le=document.createElement("input");le.type="number",le.min="1",le.value="2",le.style.cssText=`
    width: 100%;
    padding: 8px;
    border: 1px solid #d6cfc4;
    border-radius: 6px;
    font-size: 14px;
`,ie.appendChild(le),ne.appendChild(ie);H=document.createElement("div"),F=(H.style.cssText="margin-bottom: 6px; padding: 0 4px;",document.createElement("div"));F.textContent="Số file bắt đầu:",F.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",H.appendChild(F);const ae=document.createElement("input");ae.type="number",ae.min="0",ae.value="0",ae.style.cssText=`
    width: 100%;
    padding: 8px;
    border: 1px solid #d6cfc4;
    border-radius: 6px;
    font-size: 14px;
`,H.appendChild(ae),ne.appendChild(H);F=document.createElement("div"),H=(F.style.cssText="margin-bottom: 12px; padding: 0 4px;",document.createElement("div"));H.textContent="Bảng mã file:",H.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",F.appendChild(H);const De=document.createElement("select"),re=(De.style.cssText=`
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
            background-color: #ffffff;
            min-height: 38px;
        `,De.innerHTML=`
    <option value="UTF-8">UTF-8 (Mặc định)</option>
    <option value="UTF-16LE">UTF-16 LE</option>
    <option value="UTF-16BE">UTF-16 BE</option>
    <option value="GBK">GBK (简体中文)</option>
    <option value="Big5">Big5 (繁體中文)</option>
    <option value="Shift_JIS">Shift JIS (日本語)</option>
`,F.appendChild(De),ne.appendChild(F),document.createElement("button")),Pe=(re.innerHTML=`
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                <circle cx="6" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
            </svg>
            Chia Chương
        `,re.style.cssText=`
    width: 100%;
    padding: 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 12px;
`,re.onmouseover=()=>{re.style.background="#0056b3"},re.onmouseout=()=>{re.style.background="#007bff"},ne.appendChild(re),"WIKI_SIGNATURE_V1");let e={};try{e=JSON.parse(localStorage.getItem(Pe)||"{}")}catch(e){}function fe(){try{localStorage.setItem(Pe,JSON.stringify({text:de.value,pos:E,enabled:se.checked}))}catch(e){}}H=document.createElement("div"),F=(H.style.cssText="margin-bottom: 12px; padding: 10px 12px; background: #f8f9fa; border: 1px solid #d6cfc4; border-radius: 8px; box-sizing: border-box; width: 100%;",document.createElement("div"));F.style.cssText="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;";const se=document.createElement("input");se.type="checkbox",se.id="signatureCheckbox",se.checked=!!e.enabled,se.style.cssText="width: 16px; height: 16px; cursor: pointer; accent-color: #6f42c1;";var U=document.createElement("label");U.setAttribute("for","signatureCheckbox"),U.textContent="Chèn chữ ký vào chương",U.style.cssText="font-size: 13px; font-weight: 600; color: #495057; cursor: pointer;",F.appendChild(se),F.appendChild(U),H.appendChild(F);const Ye=document.createElement("div");Ye.style.cssText=`display: ${e.enabled?"block":"none"}; margin-top: 10px; width: 100%; box-sizing: border-box;`;U=document.createElement("div");U.textContent="Nội dung chữ ký:",U.style.cssText="color: #495057; font-size: 12px; font-weight: 600; margin-bottom: 5px;",Ye.appendChild(U),document.getElementById("wiki-sig-style")||((F=document.createElement("style")).id="wiki-sig-style",F.textContent="#wikiSigTextarea { display: block !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }",document.head.appendChild(F));const de=document.createElement("textarea");de.id="wikiSigTextarea",de.placeholder="Nhập chữ ký của bạn ở đây...",de.rows=3,de.value=e.text||"",de.style.cssText="display: block !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; padding: 8px; border: 1px solid #d6cfc4; border-radius: 6px; font-size: 13px; resize: vertical; box-sizing: border-box !important; font-family: inherit;",de.addEventListener("input",fe);U=document.createElement("div"),F=(U.style.cssText="overflow: hidden; width: 100%;",U.appendChild(de),Ye.appendChild(U),document.createElement("div"));F.textContent="Vị trí chữ ký:",F.style.cssText="color: #495057; font-size: 12px; font-weight: 600; margin-top: 8px; margin-bottom: 5px;",Ye.appendChild(F);const Ke=document.createElement("div");Ke.style.cssText="display: flex; flex-direction: column; gap: 6px;";let E=e.pos||"sig_bottom";function be(e){if(!se.checked)return e;const i=de.value;if(!i.trim())return e;const l=E||"sig_bottom";return e.map(e=>{let t;if("sig_top"===l)t=i+"\n\n"+e.content;else if("sig_bottom"===l)t=e.content+"\n\n"+i;else{const o=e.content.split("\n");var n=o.map((e,t)=>t).filter(e=>0<e&&e<o.length-1&&""!==o[e].trim());t=0===n.length?e.content+"\n\n"+i:(n=n[Math.floor(Math.random()*n.length)],o.splice(n,0,"",i,""),o.join("\n"))}return Object.assign({},e,{content:t})})}[["sig_top","Đầu chương"],["sig_bottom","Cuối chương"],["sig_random","Random"]].forEach(([n,e])=>{var t=document.createElement("div"),o=n===E;t.dataset.sigpos=n,t.textContent=e,t.style.cssText=`
                padding: 7px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                border: 2px solid ${o?"#6f42c1":"#d6cfc4"};
                background: ${o?"#6f42c1":"#ffffff"};
                color: ${o?"#ffffff":"#495057"};
                transition: all 0.15s;
                user-select: none;
                text-align: center;
            `,t.onclick=()=>{E=n,Ke.querySelectorAll("[data-sigpos]").forEach(e=>{var t=e.dataset.sigpos===n;e.style.background=t?"#6f42c1":"#ffffff",e.style.borderColor=t?"#6f42c1":"#d6cfc4",e.style.color=t?"#ffffff":"#495057"}),fe()},Ke.appendChild(t)}),Ye.appendChild(Ke),H.appendChild(Ye),ne.appendChild(H),se.onchange=()=>{Ye.style.display=se.checked?"block":"none",fe()};const pe=document.createElement("div");pe.style.cssText="display: none;",ne.appendChild(pe);U=document.createElement("div"),F=(U.style.cssText="padding: 12px 4px 8px 4px; border-top: 2px solid #e5e1da; margin-top: 12px;",document.createElement("div"));F.style.cssText="color: #495057; font-size: 13px; font-weight: 600; margin-bottom: 8px;",F.textContent="Kết quả:",U.appendChild(F);const Je=document.createElement("div");Je.style.cssText="color: #6c757d; font-size: 12px; margin-bottom: 8px;",U.appendChild(Je);H=document.createElement("div");H.style.cssText="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;";const Ge=document.createElement("input");Ge.type="checkbox",Ge.id="selectAllCheckbox",Ge.checked=!0,Ge.style.cssText="width: 16px; height: 16px; cursor: pointer; accent-color: #007bff;";var F=document.createElement("label"),F=(F.setAttribute("for","selectAllCheckbox"),F.textContent="Chọn tất cả",F.style.cssText="font-size: 13px; font-weight: 600; color: #495057; cursor: pointer; user-select: none;",H.appendChild(Ge),H.appendChild(F),U.appendChild(H),document.createElement("div")),H=(F.style.cssText="display: flex; gap: 12px; margin-bottom: 8px; align-items: center;",document.createElement("div")),W=(H.style.cssText="display: flex; flex-direction: column; gap: 8px; flex: 1;",document.createElement("div")),q=(W.style.cssText="display: flex; align-items: center; gap: 8px;",document.createElement("span"));q.textContent="Từ:",q.style.cssText="color: #495057; font-weight: 500; font-size: 13px; width: 40px;";const Xe=document.createElement("input");Xe.type="number",Xe.min="0",Xe.placeholder="0",Xe.style.cssText="flex: 1; padding: 8px; border: 1px solid #d6cfc4; border-radius: 4px; font-size: 13px; height: 36px; box-sizing: border-box;",W.appendChild(q),W.appendChild(Xe);var q=document.createElement("div"),N=(q.style.cssText="display: flex; align-items: center; gap: 8px;",document.createElement("span"));N.textContent="Đến:",N.style.cssText="color: #495057; font-weight: 500; font-size: 13px; width: 40px;";const Ze=document.createElement("input"),ce=(Ze.type="number",Ze.min="0",Ze.placeholder="Cuối",Ze.style.cssText="flex: 1; padding: 8px; border: 1px solid #d6cfc4; border-radius: 4px; font-size: 13px; height: 36px; box-sizing: border-box;",q.appendChild(N),q.appendChild(Ze),H.appendChild(W),H.appendChild(q),document.createElement("button")),xe=(ce.textContent="Áp dụng",ce.style.cssText="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.2s; height: 82px; min-width: 80px;",ce.onmouseover=()=>{ce.style.background="#0056b3"},ce.onmouseout=()=>{ce.style.background="#007bff"},F.appendChild(H),F.appendChild(ce),U.appendChild(F),pe.appendChild(U),document.createElement("div")),Qe=(xe.style.cssText=`
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #d6cfc4;
            border-radius: 6px;
            padding: 8px;
            background: #fafaf8;
            margin-bottom: 12px;
        `,pe.appendChild(xe),document.createElement("div"));Qe.style.cssText="color: #495057; font-size: 13px; font-weight: 600; margin-bottom: 12px; padding: 0 4px;",pe.appendChild(Qe);N=document.createElement("div");N.style.cssText="display: flex; gap: 8px; margin-bottom: 12px;";const me=document.createElement("button"),et=(me.innerHTML="Tải ZIP",me.style.cssText=`
    flex: 1;
    padding: 12px;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
`,me.onmouseover=()=>{me.style.background="#138496"},me.onmouseout=()=>{me.style.background="#17a2b8"},document.createElement("button")),tt=(et.innerHTML="Upload",et.style.cssText=`
    flex: 1;
    padding: 12px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
`,et.onmouseover=()=>{et.style.background="#218838"},et.onmouseout=()=>{et.style.background="#28a745"},N.appendChild(me),N.appendChild(et),pe.appendChild(N),"WIKI_SPLIT_SETTINGS_V1");let T={};try{T=JSON.parse(localStorage.getItem(tt)||"{}")}catch(e){}function ve(){try{localStorage.setItem(tt,JSON.stringify({rule:oe.value,encoding:De.value,startNumber:ae.value,blankLines:le.value,customRegex:ue?ue.value:"",minChars:he?he.value:"100"}))}catch(e){}}T.rule&&(oe.value=T.rule),T.encoding&&(De.value=T.encoding),void 0!==T.startNumber&&(ae.value=T.startNumber),T.blankLines&&(le.value=T.blankLines),oe.addEventListener("change",ve),De.addEventListener("change",ve),ae.addEventListener("change",ve),le.addEventListener("change",ve),"blankLines"===oe.value&&(ie.style.display="block");W=document.createElement("option");W.value="customRegex",W.textContent="Rule 4: Regex tùy chỉnh",oe.appendChild(W);const nt=document.createElement("div");nt.style.cssText="margin-bottom: 12px; padding: 0 4px; display: none;";q=document.createElement("div");q.textContent="Nhập regex (mỗi match = đầu chương mới):",q.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",nt.appendChild(q);const ue=document.createElement("input");ue.type="text",ue.placeholder="VD: ^Chapter\\s+\\d+",ue.style.cssText="width: 100%; padding: 8px; border: 1px solid #d6cfc4; border-radius: 6px; font-size: 13px; box-sizing: border-box; font-family: monospace;",nt.appendChild(ue);H=document.createElement("div"),F=(H.textContent="Không cần thêm / / hay flag, script tự dùng gm",H.style.cssText="color: #6c757d; font-size: 11px; margin-top: 4px;",nt.appendChild(H),ie.parentNode.insertBefore(nt,ie.nextSibling),T.customRegex&&(ue.value=T.customRegex),ue.addEventListener("input",ve),oe.onchange=()=>{ie.style.display="blankLines"===oe.value?"block":"none",nt.style.display="customRegex"===oe.value?"block":"none",ve()},"customRegex"===oe.value&&(nt.style.display="block"),document.createElement("div")),U=(F.style.cssText="margin-bottom: 6px; padding: 0 4px;",document.createElement("div"));U.textContent="Cảnh báo nếu chương có ít hơn (ký tự):",U.style.cssText="color: #495057; font-size: 13px; margin-bottom: 6px; font-weight: 600;",F.appendChild(U);const he=document.createElement("input");he.type="number",he.min="0",he.value=T.minChars||"100",he.placeholder="100",he.style.cssText="width: 100%; padding: 8px; border: 1px solid #d6cfc4; border-radius: 6px; font-size: 14px; box-sizing: border-box;",F.appendChild(he);N=document.createElement("div");function we(){var e=xe.querySelectorAll('input[type="checkbox"]'),t=Array.from(e).filter(e=>e.checked).length;Qe.textContent=`Đã chọn: ${t}/${e.length} chương`}function Ce(){var e=xe.querySelectorAll('input[type="checkbox"]:checked');return Array.from(e).map(e=>{e=parseInt(e.dataset.chapterIndex);return d[e]})}N.textContent="Đặt 0 để tắt cảnh báo",N.style.cssText="color: #6c757d; font-size: 11px; margin-top: 4px;",F.appendChild(N),re.parentNode.insertBefore(F,re),he.addEventListener("change",ve),$e.appendChild(ne),V.onclick=()=>{s="upload",V.style.borderBottomColor="#28a745",V.style.color="#28a745",_.style.borderBottomColor="transparent",_.style.color="#6c757d",D.style.display="block",ne.style.display="none"},_.onclick=()=>{s="split",_.style.borderBottomColor="#007bff",_.style.color="#007bff",V.style.borderBottomColor="transparent",V.style.color="#6c757d",ne.style.display="block",D.style.display="none"},A.onchange=e=>{(h=e.target.files[0])&&(_e.textContent="📄 "+h.name,_e.style.display="block",pe.style.display="none")},document.body.appendChild(j),re.onclick=async()=>{if(h){re.disabled=!0,re.textContent="⏳ Đang chia...";try{var t=await new Promise((t,e)=>{var n=new FileReader;n.onload=e=>t(e.target.result),n.onerror=e,n.readAsText(h,De.value)}),n=oe.value,o=parseInt(ae.value)||0;let e=[];if("regex1"===n)e=await async function(t,n){for(var e,o,i,l=/^\s*(?:番外|第\s{0,4}[\d〇零一二两三四五六七八九十百千万壹贰叁肆伍陆柒捌玖拾佰仟]+\s{0,4}[章节回]).*$/gm,a=[],r=[];null!==(e=l.exec(t));)r.push({index:e.index,title:e[0].trim()});0<r.length&&0<r[0].index&&0<(o=t.substring(0,r[0].index).trim()).length&&(i=o.split("\n")[0].trim()||"Giới thiệu",a.push({number:n,title:i,content:o}));var s=0<r.length&&0<r[0].index&&0<t.substring(0,r[0].index).trim().length?1:0;for(let e=0;e<r.length;e++){var d=r[e].index,p=e<r.length-1?r[e+1].index:t.length,d=t.substring(d,p).trim(),p=d.split("\n")[0].trim();a.push({number:n+s+e,title:p,content:d})}return a}(t,o);else if("blankLines"===n){var i=parseInt(le.value)||2;e=await async function(e,t,n){var o=[],i=e.split("\n");let l=[],a=0,r=n;for(let e=0;e<i.length;e++){var s,d,p=i[e];""===p.trim()?a++:(a>=t&&l.length>t&&(0<(s=l.join("\n").trim()).length&&(d=s.split("\n")[0].trim()||"Chương "+r,o.push({number:r,title:d,content:s}),r++),l=[]),a=0),l.push(p)}return 0<l.length&&0<(e=l.join("\n").trim()).length&&(n=e.split("\n")[0].trim()||"Chương "+r,o.push({number:r,title:n,content:e})),o}(t,i,o)}else if("novelDownloader"===n)e=await async function(e,t){var n=[],o=e.split(/\n={5,}\n/g);for(let e=0;e<o.length;e++){var i,l=o[e].trim();0!==l.length&&(i=l.split("\n")[0].trim()||"Chương "+(t+e),n.push({number:t+e,title:i,content:l}))}return n}(t,o);else if("customRegex"===n){var l=ue.value.trim();if(!l)return void alert("Vui lòng nhập regex!");e=await async function(t,e,n){let o;try{o=new RegExp(e,"gm")}catch(e){throw new Error("Regex không hợp lệ: "+e.message)}for(var i,l=[],a=[];null!==(i=o.exec(t));)a.push({index:i.index,title:i[0].trim()});if(0!==a.length){0<a[0].index&&0<(e=t.substring(0,a[0].index).trim()).length&&l.push({number:n,title:e.split("\n")[0].trim()||"Mở đầu",content:e});var r=0<l.length?1:0;for(let e=0;e<a.length;e++){var s=a[e].index,d=e<a.length-1?a[e+1].index:t.length,s=t.substring(s,d).trim();l.push({number:n+r+e,title:s.split("\n")[0].trim(),content:s})}}return l}(t,l,o)}if(0===e.length)alert("Không tìm thấy chương nào! Vui lòng kiểm tra lại rule.");else{d=e;const s=parseInt(he.value)||0;var a=0<s?e.filter(e=>e.content.length<s).length:0;Je.textContent=`Tổng: ${e.length} chương`+(0<a?` · ⚠️ ${a} chương ít ký tự`:""),xe.innerHTML="",e.forEach((e,t)=>{var n=e.content.length,o=0<s&&n<s,i=document.createElement("div");i.style.cssText="display: flex; align-items: center; gap: 8px; padding: 6px; border-bottom: 1px solid #e5e1da; "+(o?"background: #fff8e1;":"");const l=document.createElement("input");l.type="checkbox",l.checked=!0,l.dataset.chapterIndex=t,l.style.cssText="cursor: pointer; accent-color: #007bff; flex-shrink: 0;";var t=document.createElement("label"),a=35<e.title.length?e.title.substring(0,35)+"...":e.title,r=(t.style.cssText="flex: 1; font-size: 13px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;",t.title=e.number+`. ${e.title} (${n} ký tự)`,t.onclick=()=>{l.checked=!l.checked,we()},document.createElement("span")),a=(r.textContent=e.number+". "+a,t.appendChild(r),o&&((e=document.createElement("span")).textContent=" ⚠️",e.title=`Chỉ có ${n} ký tự`,e.style.cssText="flex-shrink: 0;",t.appendChild(e)),document.createElement("span"));a.textContent=1e3<=n?(n/1e3).toFixed(1)+"k":""+n,a.style.cssText=`font-size: 10px; color: ${o?"#e65100":"#adb5bd"}; flex-shrink: 0; font-weight: ${o?"700":"400"};`,a.title=n+" ký tự",i.appendChild(l),i.appendChild(t),i.appendChild(a),xe.appendChild(i)}),pe.style.display="block",we()}}catch(e){alert("Lỗi khi chia chương: "+e.message),console.error(e)}finally{re.disabled=!1,re.innerHTML=`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                        <circle cx="6" cy="6" r="3"></circle>
                        <circle cx="6" cy="18" r="3"></circle>
                        <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                        <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                        <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
                    </svg>
                    Chia Chương
                `}}else alert("Vui lòng chọn file gốc!")},Ge.onchange=()=>{const t=Ge.checked;xe.querySelectorAll('input[type="checkbox"]').forEach(e=>e.checked=t),we()},ce.onclick=()=>{const n=parseInt(Xe.value)||0,o=parseInt(Ze.value)||d.length-1;xe.querySelectorAll('input[type="checkbox"]').forEach((e,t)=>{t=d[t].number;e.checked=t>=n&&t<=o}),we()},me.onclick=async()=>{var e=Ce();if(0===e.length)alert("Vui lòng chọn ít nhất 1 chương!");else try{me.disabled=!0,me.textContent="⏳ Đang nén...";const l=new JSZip;be(e).forEach(e=>{var t=String(e.number).padStart(5,"0")+".txt";l.file(t,e.content)});var t=await l.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}}),n=h?h.name.replace(/\.txt$/i,"_chapters.zip"):"chapters.zip",o=URL.createObjectURL(t),i=document.createElement("a");i.href=o,i.download=n,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(o),me.disabled=!1,me.textContent="Tải ZIP"}catch(e){console.error("Lỗi khi tạo ZIP:",e),alert("Lỗi khi tạo file ZIP: "+e.message),me.disabled=!1,me.textContent="Tải ZIP"}},et.onclick=()=>{var e,t=Ce();0===t.length?alert("Vui lòng chọn ít nhất 1 chương!"):(e=be(t),n=e.map(e=>{var t=new Blob([e.content],{type:"text/plain"});return new File([t],e.number+".txt",{type:"text/plain"})}),V.click(),ge(),a&&(a.value=n.length,a.dispatchEvent(new Event("input",{bubbles:!0})),a.dispatchEvent(new Event("change",{bubbles:!0}))),r&&r.checked&&(r.checked=!1,r.dispatchEvent(new Event("change",{bubbles:!0}))),K.textContent=`Đã chọn ${n.length} file từ Chia Chương`,K.style.cssText=`
        color: #155724;
        font-size: 13px;
        margin-top: 6px;
        margin-bottom: 10px;
        display: block;
        font-weight: 600;
        padding-left: 4px;
        background: #d4edda;
        padding: 8px;
        border-radius: 4px;
    `,He.innerHTML="<strong>Danh sách chương:</strong><br>"+t.map((e,t)=>t+1+". "+e.title).join("<br>"),He.style.display="block")},console.log("[Wiki Tool] Control panel added to body"),console.log("[Wiki Tool] minimizeBtn display:",Be.style.display),console.log("[Wiki Tool] controlPanel position:",j.style.left,j.style.top),console.log("[Wiki Tool] isMinimized:",i),j.addEventListener("mousedown",e=>{var t;!i&&(e.target.closest("input")||e.target.closest("label")||e.target.closest("button")||e.target.closest("select")||e.target.closest("textarea")||e.target.closest("#chapterFilterInput")||e.target.closest(".checkbox-wrapper"))||(w=!0,C=!1,y=e.clientX,f=e.clientY,t=j.getBoundingClientRect(),b=t.left,v=t.top,j.style.cursor="grabbing",j.style.transition="none",e.preventDefault())}),document.addEventListener("mousemove",e=>{var t,n,o;w&&(o=e.clientX-y,e=e.clientY-f,(5<Math.abs(o)||5<Math.abs(e))&&(C=!0),o=b+o,e=v+e,n=j.getBoundingClientRect(),t=window.innerWidth-n.width-20,n=window.innerHeight-n.height-20,o=Math.max(20,Math.min(o,t)),e=Math.max(20,Math.min(e,n)),j.style.left=o+"px",j.style.top=e+"px",j.style.right="auto")}),document.addEventListener("mouseup",()=>{w&&(w=!1,j.style.cursor="move",j.style.transition="all 0.3s ease")}),window.addEventListener("resize",()=>{var e,t,n,o;i&&!C?(t=.05*window.innerWidth,t=window.innerWidth-Le-t,j.style.left=t+"px"):i||(n=(t=j.getBoundingClientRect()).left,o=t.top,e=window.innerWidth-t.width-20,t=window.innerHeight-t.height-20,n=Math.max(20,Math.min(n,e)),o=Math.max(20,Math.min(o,t)),j.style.left=n+"px",j.style.top=o+"px",j.style.right="auto")});const ot=()=>{if(!w)if(i&&C)C=!1;else{i=!i;var e,t=j.getBoundingClientRect();let n=t.left,o=t.top;j.style.transition="none",i?(t=t.width,Ie.style.display="none",Re.style.display="none",D.style.display="none",ne.style.display="none",j.style.display="flex",j.style.flexDirection="row",j.style.minWidth="56px",j.style.maxWidth="56px",j.style.padding="0",j.style.background="#2c3e50",j.style.borderRadius="50%",j.style.width="56px",j.style.height="56px",j.style.border="none",Be.style.display="flex",t=t-Le,n+=t,t=window.innerWidth-56-20,e=window.innerHeight-56-20,n=Math.max(20,Math.min(n,t)),o=Math.max(20,Math.min(o,e)),j.style.left=n+"px",j.style.top=o+"px",j.style.right="auto",setTimeout(()=>{j.style.transition="all 0.3s ease"},50)):(t=n,j.style.display="flex",j.style.flexDirection="column",j.style.minWidth="340px",j.style.maxWidth="340px",j.style.padding="24px",j.style.background="#ffffff",j.style.borderRadius="12px",j.style.width="auto",j.style.height="auto",j.style.display="flex",j.style.flexDirection="column",j.style.border="1px solid rgba(0,0,0,0.08)",Be.style.display="none",Ie.style.display="flex",Re.style.display="flex","upload"===s?(D.style.display="block",ne.style.display="none"):(D.style.display="none",ne.style.display="block"),n=t-284,setTimeout(()=>{var e=j.getBoundingClientRect(),t=window.innerWidth-e.width-20,e=window.innerHeight-e.height-20,t=(n=Math.max(20,Math.min(n,t)),o=Math.max(20,Math.min(o,e)),j.style.left=n+"px",j.style.top=o+"px",j.style.right="auto",parseInt(j.style.top)),e=window.innerHeight-t-40,t=Math.max(300,Math.min(e,600));j.style.maxHeight=t+"px",$e.style.maxHeight=t-140+"px",j.style.transition="all 0.3s ease"},10)),C=C&&!1}};Be.onclick=e=>{e.stopPropagation(),ot()};let S=!(O.onclick=e=>{e.stopPropagation(),ot()}),z=!1,L,M=[],B=0,I=0,R=0,$=0;function ke(e){var t=0<$?Math.floor(e/$*100):0;Oe.textContent=`Đang xử lý: ${e}/${$} file (${t}%)`,Ve.style.width=t+"%"}function Ee(e=!1){te.style.display="block",e?(Q.style.display="none",ee.textContent="✅ Xử lý Hoàn tất.",ee.style.display="block",je.textContent="Bắt đầu upload",X.style.background="#28a745",X.style.boxShadow="0 2px 4px rgba(40,167,69,0.3), 0 4px 8px rgba(0,0,0,0.1)",S=!1,Z.style.display="none",setTimeout(()=>{ee.style.display="none"},5e3)):(Q.style.display="block",ee.style.display="none",Z.style.display="flex")}async function Te(){if(0!==M.length&&z){var{form:e,file:n,index:o}=M.shift();let t="";var d,i=n.name;try{t=(d=n,await new Promise(s=>{var e=new FileReader;e.onload=e=>{let t=e.target.result;var n;let o="";for(n of(t=65279===t.charCodeAt(0)?t.substring(1):t).split("\n")){var i=n.trim();if(0<i.length){o=i;break}}if(0===o.length)s(d.name.replace(/\.txt$/i,""));else{var e=o.indexOf("||"),e=(o=(o=-1!==e?o.substring(e+2).trim():o).replace(/\s+/g," ").trim()).match(/(第\s*[一二三四五六七八九十百千万\d]+\s*章)/i),l=o.match(/(chapter\s*\d+|part\s*\d+|c\s*\d+)/i),e=(e&&l&&(e=l[0],l=new RegExp(e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),"i"),o=o.replace(l,"").trim()),g.value.trim().split(",").map(e=>e.trim()).filter(e=>0<e.length));if(0<e.length){let t=o;e.forEach(e=>{e=e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),e=new RegExp(`\\s*${e}\\s*`,"g");t=t.replace(e," ").trim()}),o=t.replace(/\s+/g," ").trim()}if(x&&-1!==(l=o.indexOf(" - "))&&(o=o.substring(0,l).trim()),m){var a=[];for(const r of(o=o.replace(/(第\s*\S+?\s*章)\s+(第\s*\S+?\s*章)/g,"$1")).split(/\s+/).filter(e=>0<e.length))0!==a.length&&a[a.length-1]===r||a.push(r);o=a.join(" ")}s(o)}},e.readAsText(d,u)}))}catch(e){t=i.replace(/\.txt$/i,""),console.error(`[Wiki Upload ERROR] Lỗi khi đọc file ${i}:`,e)}ke(++B);var l=e.fileInput,e=e.nameInput;try{var a=new DataTransfer,r=(a.items.add(n),l.files=a.files,l.dispatchEvent(new Event("change",{bubbles:!0})),l.dispatchEvent(new Event("input",{bubbles:!0})),e.value=t,e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0})),await new Promise(e=>setTimeout(e,50)),I++,document.createElement("div"));r.style.cssText="color: #495057;",r.innerHTML=`
                    <span style="color: #28a745; font-weight: 700; margin-right: 5px;">✔</span>
                    ${t}
                `,te.firstChild?te.insertBefore(r,te.firstChild):te.appendChild(r)}catch(e){R++,console.error(`[Wiki Upload CRITICAL ERROR] File ${o} (${i}): `+e.message,e);n=document.createElement("div");n.style.cssText="color: #721c24;",n.innerHTML=`
                    <span style="color: #dc3545; font-weight: 700; margin-right: 5px;">✘</span>
                    Lỗi xử lý file: ${i}
                `,te.firstChild?te.insertBefore(n,te.firstChild):te.appendChild(te)}"none"===te.style.display&&(te.style.display="block"),te.scrollTop=te.scrollHeight,setTimeout(Te,50)}else Ee(!(z=!1))}X.onclick=()=>{if(!S)if(L=p?Array.from(p.querySelectorAll(".chapter-info-wrapper")).map(e=>{var t=e.querySelector('input[name="name"][type="text"]'),n=e.querySelector('input[type="file"][name="file"]');return t&&n&&null!==e.offsetParent?{nameInput:t,fileInput:n}:null}).filter(e=>null!==e):[],0===n.length)alert("Vui lòng chọn file TXT để upload.");else if(p&&"-1"!==P.value)if(0===L.length)alert("Không tìm thấy ô nhập liệu chương trong Quyển đã chọn. Vui lòng đảm bảo Quyển này đã được bật chức năng Thêm chương hoặc Bổ sung.");else{if(n.length>L.length)if(!confirm(`Bạn đã chọn ${n.length} file nhưng chỉ có ${L.length} ô nhập liệu chương. Chỉ có ${L.length} file đầu tiên được xử lý. Bạn có muốn tiếp tục không?`))return;Ue(!1),S=!0,z=!0,I=0,R=0,B=0,$=Math.min(n.length,L.length),M=[],te.innerHTML="";for(let e=te.scrollTop=0;e<$;e++)M.push({form:L[e],file:n[e],index:e+1});je.textContent="Đang xử lý...",X.style.background="#007bff",X.style.boxShadow="0 2px 4px rgba(0,123,255,0.3), 0 4px 8px rgba(0,0,0,0.1)",Ee(),ke(0),Te()}else alert("Vui lòng chọn một Quyển hợp lệ để upload chương.")},(()=>{var e=localStorage.getItem(ze);if(e)try{var t=JSON.parse(e);void 0!==t.dashFilter&&qe.setState(t.dashFilter),void 0!==t.duplicateFilter&&Ne.setState(t.duplicateFilter),void 0!==t.filterWords&&(g.value=t.filterWords)}catch(e){console.error("Lỗi khi đọc cài đặt từ localStorage:",e)}})(),W=document.body,new MutationObserver((e,t)=>{let n=!1;for(const o of e)if("childList"===o.type){if(Array.from(o.addedNodes).some(e=>1===e.nodeType&&(e.matches(".volume-info-wrapper")||e.querySelector(".volume-info-wrapper")))){n=!0;break}if(Array.from(o.removedNodes).some(e=>1===e.nodeType&&(e.matches(".volume-info-wrapper")||e.querySelector(".volume-info-wrapper")))){n=!0;break}}n&&(window.rebuildTimer&&clearTimeout(window.rebuildTimer),window.rebuildTimer=setTimeout(ye,100))}).observe(W,{childList:!0,subtree:!0}),setTimeout(ye,500)}function a(){var e=document.getElementById("listName");if(e){e=e.querySelectorAll("li");if(0===e.length)alert("Danh sách name trống!");else{let t="";e.forEach(e=>{e=e.textContent.trim();e&&(t+=e+"\n")});var n,o,e=function(){var e=window.location.pathname.split("/");let t=e[e.length-1]||e[e.length-2];return(!(t=t.split("#")[0].split("?")[0])||t.length<3)&&(e=document.querySelector("h1, .title, .story-title"),t=(e?e.textContent:document.title.split("-")[0]).trim()),(t=t.replace(/[<>:"/\\|?*]/g,"_"))||"truyen"}();n=t,e=`name2_${e}.txt`,n=new Blob([n],{type:"text/plain;charset=utf-8"}),(o=document.createElement("a")).href=URL.createObjectURL(n),o.download=e,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(o.href)}}else alert("Không tìm thấy danh sách name!")}function e(){if(!document.getElementById("btn-tai-name")&&document.getElementById("listName")){var e=Array.from(document.querySelectorAll("button, .btn, a")).find(e=>"Name"===e.textContent.trim());if(e){var t=document.createElement("div");t.style.cssText="display: block; margin-top: 10px;";const l=document.createElement("button");l.id="btn-tai-name",l.innerHTML=`
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span style="vertical-align: middle;">Tải Name</span>
            `,l.style.cssText=`
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
            `,l.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();const t=document.createElement("span");var n=l.getBoundingClientRect(),o=Math.max(n.width,n.height),i=e.clientX-n.left-o/2,e=e.clientY-n.top-o/2;t.style.cssText=`
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    width: ${o}px;
                    height: ${o}px;
                    left: ${i}px;
                    top: ${e}px;
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `,l.appendChild(t),setTimeout(()=>t.remove(),600),a()}),l.addEventListener("mouseenter",()=>{l.style.background="linear-gradient(145deg, #3a3a3a, #2c2c2c)",l.style.boxShadow=`
                    0 4px 8px rgba(0, 0, 0, 0.4),
                    0 2px 4px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                `,l.style.transform="translateY(-2px)"}),l.addEventListener("mouseleave",()=>{l.style.background="linear-gradient(145deg, #2c2c2c, #1a1a1a)",l.style.boxShadow=`
                    0 3px 6px rgba(0, 0, 0, 0.3),
                    0 1px 3px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,l.style.transform="translateY(0)"}),l.addEventListener("mousedown",()=>{l.style.transform="translateY(0) scale(0.96)",l.style.boxShadow=`
                    0 1px 3px rgba(0, 0, 0, 0.3),
                    0 1px 2px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.08)
                `}),l.addEventListener("mouseup",()=>{l.style.transform="translateY(-2px) scale(1)"}),document.getElementById("ripple-animation")||((n=document.createElement("style")).id="ripple-animation",n.textContent=`
                    @keyframes ripple {
                        0% { transform: scale(0); opacity: 1; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                `,document.head.appendChild(n)),t.appendChild(l);var n=window.innerWidth<=768,o=e.parentElement;n?(n=Array.from(document.querySelectorAll("button, .btn, a")).find(e=>"Đọc"===e.textContent.trim()||"Doc"===e.textContent.trim()))&&n.parentElement?(n.parentElement.insertBefore(t,n),t.style.display="inline-block",t.style.marginRight="8px",t.style.marginTop="0"):o&&o.parentElement.insertBefore(t,o.nextSibling):o?o.parentElement.insertBefore(t,o.nextSibling):e.after(t)}}}function t(){setTimeout(()=>{e()},1e3)}window.location.pathname.includes("truyen")&&("loading"===document.readyState?document.addEventListener("DOMContentLoaded",t):t(),new MutationObserver(()=>{document.getElementById("listName")&&!document.getElementById("btn-tai-name")&&e()}).observe(document.body,{childList:!0,subtree:!0}))}();

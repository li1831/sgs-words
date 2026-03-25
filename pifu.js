// ==UserScript==
// @name         三国杀静态改动态注入器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  将1502静态图替换为1503动态Spine
// @author       Gemini
// @match        *://web.sanguosha.com/*
// @match        http://kuaiwan.com/*
// @run-at       document-end
// @require      https://unpkg.com/@esotericsoftware/spine-player@4.1/dist/iife/spine-player.js
// ==/UserScript==

(function() {
    'use strict';

    // 注入 Spine 播放器所需的样式
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'https://unpkg.com/@esotericsoftware/spine-player@4.1/dist/iife/spine-player.css';
    document.head.appendChild(style);

    const BASE_URL = "https://web.sanguosha.com/220/h5_2/res/runtime/pc/general/big/dynamic/1503/";

    function replaceWithSpine() {
        // 寻找目标图片（1502被GoRes换成了1503的png，所以我们找1503）
        const targetImg = document.querySelector('img[src*="1503/xingxiang.png"]');

        if (targetImg && !targetImg.dataset.injected) {
            targetImg.dataset.injected = "true";

            // 创建一个容器存放动态皮肤
            const container = document.createElement('div');
            container.style.width = targetImg.clientWidth + 'px';
            container.style.height = targetImg.clientHeight + 'px';
            container.style.position = 'absolute';
            container.style.zIndex = '10';

            // 替换节点
            targetImg.style.opacity = '0'; // 隐藏原图但保留占位
            targetImg.parentNode.insertBefore(container, targetImg);

            // 初始化背景 (beijing)
            const bgDiv = document.createElement('div');
            bgDiv.style.width = '100%';
            bgDiv.style.height = '100%';
            container.appendChild(bgDiv);

            new spine.SpinePlayer(bgDiv, {
                jsonUrl: BASE_URL + "beijing.json",
                atlasUrl: BASE_URL + "beijing.atlas",
                animation: "idle", // 三国杀通用的待机动作名通常是 idle
                alpha: true,
                showControls: false
            });

            // 初始化形象 (xingxiang)
            const roleDiv = document.createElement('div');
            roleDiv.style.width = '100%';
            roleDiv.style.height = '100%';
            roleDiv.style.position = 'absolute';
            roleDiv.style.top = '0';
            container.appendChild(roleDiv);

            new spine.SpinePlayer(roleDiv, {
                jsonUrl: BASE_URL + "xingxiang.json",
                atlasUrl: BASE_URL + "xingxiang.atlas",
                animation: "idle",
                alpha: true,
                showControls: false
            });
        }
    }

    // 循环检查，因为三国杀的 DOM 是动态生成的
    setInterval(replaceWithSpine, 1000);
})();
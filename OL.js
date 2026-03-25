// ==UserScript==
// @name         三国杀OL皮肤替换器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动替换三国杀OL网页版武将皮肤图片
// @author       You
// @match        https://web.sanguosha.com/*
// @match        http://kuaiwan.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ==================== 配置区域 ====================
    // 在这里定义你的皮肤替换规则
    // key: 原始皮肤文件名, value: 替换后的皮肤文件名
    const skinRules = {
        // 示例：将 2207.png 替换为 2206.png
        '2207.png': '2206.png',

        // 你可以添加更多规则，例如：
        // '1001.png': '1002.png',
        // '3005.png': '3006.png',
    };

    // 是否启用控制台日志（调试时用）
    const DEBUG = true;

    // ==================== 核心代码 ====================

    const log = (...args) => {
        if (DEBUG) {
            console.log('[皮肤替换器]', ...args);
        }
    };

    // 1. 拦截 XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        const newUrl = replaceSkinUrl(url);
        if (newUrl !== url) {
            log('XHR 拦截:', url, '->', newUrl);
        }
        return originalXHROpen.call(this, method, newUrl, ...rest);
    };

    // 2. 拦截 Fetch API
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        const newUrl = replaceSkinUrl(url);
        if (newUrl !== url) {
            log('Fetch 拦截:', url, '->', newUrl);
        }
        return originalFetch.call(this, newUrl, options);
    };

    // 3. 拦截 Image 加载
    const originalImageSrc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
    Object.defineProperty(Image.prototype, 'src', {
        set: function(url) {
            const newUrl = replaceSkinUrl(url);
            if (newUrl !== url) {
                log('Image 拦截:', url, '->', newUrl);
            }
            return originalImageSrc.set.call(this, newUrl);
        },
        get: originalImageSrc.get
    });

    // 4. 拦截 createElement 创建的 img 标签
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'img') {
            // 监听 src 属性变化
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'src') {
                    const newValue = replaceSkinUrl(value);
                    if (newValue !== value) {
                        log('setAttribute 拦截:', value, '->', newValue);
                    }
                    return originalSetAttribute.call(this, name, newValue);
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        return element;
    };

    // ==================== URL 替换函数 ====================

    function replaceSkinUrl(url) {
        if (typeof url !== 'string') return url;

        // 检查是否匹配任何规则
        for (const [original, replacement] of Object.entries(skinRules)) {
            if (url.includes(original)) {
                return url.replace(original, replacement);
            }
        }
        return url;
    }

    // ==================== 高级功能：动态添加规则 ====================

    // 暴露全局接口，方便在控制台动态修改
    window.SkinReplacer = {
        // 添加新规则
        addRule: (original, replacement) => {
            skinRules[original] = replacement;
            log(`添加规则: ${original} -> ${replacement}`);
        },

        // 删除规则
        removeRule: (original) => {
            delete skinRules[original];
            log(`删除规则: ${original}`);
        },

        // 查看当前规则
        getRules: () => ({...skinRules}),

        // 开关调试模式
        setDebug: (enabled) => {
            // 注意：这里只是示例，实际DEBUG是const，如需动态控制需改为let
            console.log('调试模式:', enabled);
        }
    };

    log('三国杀OL皮肤替换器已加载！');
    log('当前规则:', skinRules);
    log('提示：在控制台使用 SkinReplacer 对象可以动态管理规则');

})();
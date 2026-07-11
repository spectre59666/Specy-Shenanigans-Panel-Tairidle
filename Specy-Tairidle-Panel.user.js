// ==UserScript==
// @name         Specy Tairidle Shenanigans Panel
// @namespace    http://tampermonkey.net/
// @version      1.5.2
// @description  Specy Tairidle Panel with multiple shenanigans and a fancy UI
// @author       5p3c7r3
// @match        https://tairidle.com/*
// @downloadURL  https://raw.githubusercontent.com/spectre59666/Specy-Shenanigans-Panel-Tairidle/main/Specy-Shenanigans-Panel-Tairidle.user.js
// @updateURL    https://raw.githubusercontent.com/spectre59666/Specy-Shenanigans-Panel-Tairidle/main/Specy-Shenanigans-Panel-Tairidle.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // =========================
    // Configuration, State, Themes, Translations
    // =========================
    const CONFIG = {
        sectionsCollapsed: {
            title: false,
            combat: false,
            hatchery: false,
            cheats: false,
            settings: false

        },
        autoE4Active: localStorage.getItem("specy-auto-e4") === "true",
        autoHealActive: localStorage.getItem("specy-auto-heal") === "true",
        autoHealMinutes: parseInt(localStorage.getItem('specy-qol-heal-minutes') || '3', 10),
        autoHatchActive: localStorage.getItem("specy-auto-hatch") === "true",
    };
    CONFIG.panelVisible = true;

    const FIGHT_BUTTON_SELECTOR = '.col-span-2.py-3.px-3.text-white.text-sm.font-bold.rounded-lg.transition-all.border.bg-purple-700.hover\\:bg-purple-600.active\\:scale-95.border-purple-400';
    const HEAL_BUTTON_SELECTOR = '.flex.flex-col.items-center.justify-center.w-12.h-10.rounded-lg.transition-all.active\\:scale-95.border.border-red-400\\/40.bg-white\\/5.hover\\:bg-white\\/10';
    const FIGHT_ACTIVE_SELECTOR = '.absolute.inset-0.bg-black\\/25.pointer-events-none.z-0';

    const THEMES = {
        oled: {
            name: 'OLED (Économie écran)',
            background: '#000000',
            panel: '#0a0a0a',
            section: '#1a1a1a',
            sectionContent: '#0f0f0f',
            sectionText: '#e0e0e0',
            text: '#ffffff',
            border: '#333333',
            button: '#1a1a1a',
            buttonHover: '#2a2a2a'
        },
        dark: {
            name: 'Sombre',
            background: '#1a1a1a',
            panel: '#242424',
            section: '#2d2d2d',
            sectionContent: '#222222',
            sectionText: '#e0e0e0',
            text: '#ffffff',
            border: '#404040',
            button: '#2d2d2d',
            buttonHover: '#3d3d3d'
        },
        blue: {
            name: 'Bleu Nuit',
            background: '#0f1419',
            panel: '#1a2332',
            section: '#253142',
            sectionContent: '#1a2332',
            sectionText: '#a8c5e0',
            text: '#e1e8ed',
            border: '#38444d',
            button: '#253142',
            buttonHover: '#2d3e52'
        },
        purple: {
            name: 'Violet Profond',
            background: '#160f1f',
            panel: '#211a2d',
            section: '#2d2438',
            sectionContent: '#211a2d',
            sectionText: '#d4b5e8',
            text: '#e8dff5',
            border: '#3d2f52',
            button: '#2d2438',
            buttonHover: '#3d2f52'
        }
    };

    let currentTheme = localStorage.getItem('specy-qol-theme') || 'oled';
    let currentLanguage = localStorage.getItem('specy-qol-language') || 'fr';

    // =========================
    // TRANSLATIONS
    // =========================

    const TRANSLATIONS = {
        fr: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            autoCombat: '⚔️ Combat ',
            autoE4: 'Recombattre automatiquement le conseil des 4',
            autoHeal: 'Soin automatique',
            healInterval: 'Intervalle de soin',
            settings: '⚙️ Paramètres',
            theme: 'Thème',
            language: 'Langue',
            themeOled: 'OLED (Économie écran)',
            themeDark: 'Sombre',
            themeBlue: 'Bleu Nuit',
            themePurple: 'Violet Profond'
        },
        en: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            autoCombat: '⚔️ Combat',
            autoE4: 'Auto E4 Rebattle',
            autoHeal: 'Auto Heal',
            healInterval: 'Heal Interval',
            settings: '⚙️ Settings',
            theme: 'Theme',
            language: 'Language',
            themeOled: 'OLED (Screen Save)',
            themeDark: 'Dark',
            themeBlue: 'Night Blue',
            themePurple: 'Deep Purple'
        },
        es: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            autoCombat: '⚔️ Combate',
            autoE4: 'Recombate automático de E4',
            autoHeal: 'Curación automática',
            healInterval: 'Intervalo de curación',
            settings: '⚙️ Configuración',
            theme: 'Tema',
            language: 'Idioma',
            themeOled: 'OLED (Ahorro de pantalla)',
            themeDark: 'Oscuro',
            themeBlue: 'Azul noche',
            themePurple: 'Púrpura profundo'
        },
        de: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            autoCombat: '⚔️ Kampf',
            autoE4: 'Automatischer E4-Neukampf',
            autoHeal: 'Automatische Heilung',
            healInterval: 'Heilungsintervall',
            settings: '⚙️ Einstellungen',
            theme: 'Design',
            language: 'Sprache',
            themeOled: 'OLED (Bildschirm sparen)',
            themeDark: 'Dunkel',
            themeBlue: 'Nachtblau',
            themePurple: 'Tiefes Violett'
        },
        pt: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            autoCombat: '⚔️ Combate',
            autoE4: 'Recombate automático da E4',
            autoHeal: 'Cura automática',
            healInterval: 'Intervalo de cura',
            settings: '⚙️ Configurações',
            theme: 'Tema',
            language: 'Idioma',
            themeOled: 'OLED (Economia de tela)',
            themeDark: 'Escuro',
            themeBlue: 'Azul noturno',
            themePurple: 'Roxo profundo'
        }
    };

    // =========================
    // HTML PANEL CONTENT
    // =========================

    function createPanelContent() {
        const theme = THEMES[currentTheme];
        const isRTL = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        return `
        <style>
            #specy-qol-panel * {
                box-sizing: border-box;
            }
            #specy-qol-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${theme.panel};
                border: 2px solid ${theme.border};
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                z-index: 999999;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: ${theme.text};
                width: 320px;
                backdrop-filter: blur(10px);
                max-height: 95vh;
                display: flex;
                flex-direction: column;
                direction: ${isRTL};
            }
            .title-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 12px;
                border-radius: 8px 8px 0 0;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                border-bottom: 2px solid ${theme.border};
                margin: 0;
                flex-shrink: 0;
            }
            .drag-handle {
                cursor: grab;
                user-select: none;
                padding: 0 8px;
                font-size: 14px;
                opacity: 0.85;
            }
              
            .drag-handle:active {
                cursor: grabbing;
            }
            .specy-qol-content {
                padding: 15px;
                overflow-y: auto;
                flex: 1;
            }
            .specy-qol-content::-webkit-scrollbar {
                width: 8px;
            }
            .specy-qol-content::-webkit-scrollbar-track {
                background: ${theme.background};
                border-radius: 10px;
            }
            .specy-qol-content::-webkit-scrollbar-thumb {
                background: ${theme.border};
                border-radius: 10px;
            }
            .specy-qol-content::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
            .section-header {
                background: ${theme.section};
                padding: 8px 10px;
                border-radius: 5px 5px 0 0;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border: 1px solid ${theme.border};
                border-bottom: none;
                transition: background 0.2s;
                min-height: 35px;
                max-height: 35px;
                height: 35px;
            }
            .section-header:hover {
                background: ${theme.buttonHover};
            }
            .section-header > span:first-child {
                font-weight: bold;
                font-size: 13px;
                color: ${theme.sectionText};
                display: flex;
                align-items: center;
                flex: 1;
                line-height: 1;
            }
            .section-arrow {
                font-size: 12px !important;
                color: ${theme.sectionText} !important;
                line-height: 1 !important;
                flex-shrink: 0 !important;
                width: 16px !important;
                text-align: center !important;
                background: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                outline: none !important;
            }
            .section-content {
                background: ${theme.sectionContent};
                border: 1px solid ${theme.border};
                border-top: none;
                border-radius: 0 0 5px 5px;
                padding: 10px;
                margin-bottom: 12px;
            }
            .speed-button {
                background: ${theme.button};
                color: ${theme.text};
                border: 1px solid ${theme.border};
                padding: 8px;
                margin: 4px 0;
                border-radius: 5px;
                cursor: pointer;
                width: 100%;
                font-size: 12px;
                transition: all 0.2s;
            }
            .speed-button:hover {
                background: ${theme.buttonHover};
                transform: translateX(5px);
            }
            .speed-button.active {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border-color: #f5576c;
                font-weight: bold;
            }
            .toggle-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: ${theme.button};
                border-radius: 5px;
                border: 1px solid ${theme.border};
                transition: opacity 0.3s, cursor 0.3s;
            }
            .toggle-switch {
                position: relative;
                width: 50px;
                height: 24px;
                background: #4a4a4a;
                border-radius: 12px;
                cursor: pointer;
                transition: background 0.3s;
                flex-shrink: 0;
            }
            .toggle-switch.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .toggle-slider {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .toggle-switch.active .toggle-slider {
                transform: translateX(26px);
            }
            #specy-qol-panel select {
                width: 100%;
                padding: 8px;
                margin: 8px 0;
                background: ${theme.button};
                color: ${theme.text};
                border: 1px solid ${theme.border};
                border-radius: 5px;
                font-size: 12px;
                cursor: pointer;
            }
            #specy-qol-panel select option {
                background: ${theme.panel};
                color: ${theme.text};
            }
            #specy-qol-panel input[type="range"] {
                width: 100%;
                margin-top: 6px;
            }
            .setting-label {
                font-size: 12px;
                display: block;
                margin-bottom: 4px;
                margin-top: 8px;
                color: ${theme.sectionText};
                font-weight: 500;
            }
            .specy-qol-toast {
                min-width: 220px;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 13px;
                color: white;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
            .specy-qol-toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            .specy-qol-toast.success {
                background: linear-gradient(135deg, #00c853, #009624);
            }
            .specy-qol-toast.error {
                background: linear-gradient(135deg, #d50000, #9b0000);
            }
            .specy-qol-toast.info {
                background: linear-gradient(135deg, #2962ff, #0039cb);
            }
            .cheat-content {
                max-height: 500px;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }
            .cheat-section.collapsed .cheat-content {
                max-height: 0;
            }
            .cheat-header {
                font-size: 12px;
                display: block;
                margin-bottom: 4px;
                margin-top: 8px;
                color: ${theme.sectionText};
                font-weight: 500;
                cursor: pointer;
                font-weight: bold;
            }
            .cheat-header:hover {
                font-weight: bold;
                text-decoration: underline overline;
                transition: 0.3s ease-in-out;
            }
        </style>

        <div class="title-header" id="title-header">
        <span class="drag-handle" id="drag-handle">⋮⋮</span>
            ${t('title')}
            <span class="section-arrow" id="header-arrow">
            ${CONFIG.sectionsCollapsed.title ? '▶' : '▼'}
            </span>
        </div>

        <div class="specy-qol-content">
            <!-- Section Combat Automatique -->
            <div>
                <div class="section-header" id="combat-header">
                    <span>${t('autoCombat')}</span>
                    <span class="section-arrow" id="combat-arrow">${CONFIG.sectionsCollapsed.combat ? '▶' : '▼'}</span>
                </div>
                <div class="section-content" id="combat-content" style="display: ${CONFIG.sectionsCollapsed.combat ? 'none' : 'block'};">
                    <div class="toggle-container">
                    <span style="font-size: 12px;">${t('autoE4')}</span>
                    <div class="toggle-switch ${CONFIG.autoE4Active ? 'active' : ''}" id="auto-e4-toggle">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                        <div class="toggle-container">
                            <span style="font-size: 12px;">${t('autoHeal')}</span>
                            <div class="toggle-switch ${CONFIG.autoHealActive ? 'active' : ''}" id="auto-heal-toggle">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>

                        <div style="margin-top: 8px;">
                            <label class="setting-label" for="heal-interval-slider">Heal interval: <span id="heal-interval-label">${CONFIG.autoHealMinutes}</span> min</label>
                                <input id="heal-interval-slider" type="range" min="1" max="10" step="1" value="${CONFIG.autoHealMinutes}"/>
                        </div>
                </div>
            </div>

            <!-- Hatchery -->
            <div>
                <div class="section-header" id="hatchery-header">
                    <span>🥚 Hatchery</span>
                    <span class="section-arrow" id="hatchery-arrow">
                        ${CONFIG.sectionsCollapsed.hatchery ? '▶' : '▼'}
                    </span>
                </div>

                <div class="section-content" id="hatchery-content" style="display:${CONFIG.sectionsCollapsed.hatchery ? 'none':'block'};">

                    <div class="toggle-container">
                        <span style="font-size:12px;">Auto Hatch Eggs
                        </span>

                        <div class="toggle-switch ${CONFIG.autoHatchActive ? 'active' : ''}" id="auto-hatch-toggle">

                            <div class="toggle-slider"></div>

                        </div>
                    </div>

                </div>
            </div>

            <!-- Section Cheat -->
            <div>
                    <div class="section-header" id="cheats-header">
                    <span>🧪 Cheats(TBD)</span>
                    <span class="section-arrow" id="cheats-arrow">
                    ${CONFIG.sectionsCollapsed.cheats ? '▶' : '▼'}
                    </span>
            </div>


            <!-- Section Paramètres -->
            <div>
                <div class="section-header" id="settings-header">
                    <span>${t('settings')}</span>
                    <span class="section-arrow" id="settings-arrow">${CONFIG.sectionsCollapsed.settings ? '▶' : '▼'}</span>
                </div>
                <div class="section-content" id="settings-content" style="display: ${CONFIG.sectionsCollapsed.settings ? 'none' : 'block'};">
                    <label class="setting-label">${t('theme')}</label>
                    <select id="theme-select">
                        <option value="oled" ${currentTheme === 'oled' ? 'selected' : ''}>${t('themeOled')}</option>
                        <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>${t('themeDark')}</option>
                        <option value="blue" ${currentTheme === 'blue' ? 'selected' : ''}>${t('themeBlue')}</option>
                        <option value="purple" ${currentTheme === 'purple' ? 'selected' : ''}>${t('themePurple')}</option>
                    </select>

                    <label class="setting-label">${t('language')}</label>
                    <select id="language-select">
                        <option value="fr" ${currentLanguage === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
                        <option value="en" ${currentLanguage === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                        <option value="es" ${currentLanguage === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                        <option value="de" ${currentLanguage === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
                        <option value="pt" ${currentLanguage === 'pt' ? 'selected' : ''}>🇵🇹 Português</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    }

    // =========================
    // PANEL VISIBILITY TOGGLE
    // =========================

    function togglePanelVisibility() {
        const panel = document.getElementById('specy-qol-panel');
        if (!panel) return;

        CONFIG.panelVisible = !CONFIG.panelVisible;
        panel.style.display = CONFIG.panelVisible ? 'flex' : 'none';

        localStorage.setItem('specy-qol-panel-visible', CONFIG.panelVisible);

        console.log(`📦 QoL Panel ${CONFIG.panelVisible ? 'shown' : 'hidden'}`);
    }

    // =========================
    // TRANSLATION & SETTINGS
    // =========================

    function t(key) {
        return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS.fr[key];
    }

    function changeLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('specy-qol-language', lang);
        updatePanelContent();
    }

    function changeTheme(themeName) {
        currentTheme = themeName;
        localStorage.setItem('specy-qol-theme', themeName);
        updatePanelContent();
    }

    function updatePanelContent() {
        const panel = document.getElementById('specy-qol-panel');
        if (panel) {
            panel.innerHTML = createPanelContent();
            attachEventListeners();
        }
    }

    // =========================
    // DRAGGABLE OVERLAY
    // =========================

    function initCollapsibleSections() {

        const sections = document.querySelectorAll(".cheat-section");

        sections.forEach(section => {

            const header = section.querySelector(".cheat-header");
            const key = "section_" + section.dataset.section;

            // Restore state
            const saved = localStorage.getItem(key);
            if (saved === "collapsed") {
                section.classList.add("collapsed");
            }

            header.addEventListener("click", () => {

                section.classList.toggle("collapsed");

                localStorage.setItem(
                    key,
                    section.classList.contains("collapsed") ? "collapsed" : "open"
                );

            });

        });
    }

    function makePanelDraggable() {
        const panel = document.getElementById('specy-qol-panel');
        const handle = document.getElementById('drag-handle');
        if (!panel || !handle) return;

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;

            const rect = panel.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            panel.style.right = 'auto';
            panel.style.left = `${rect.left}px`;
            panel.style.top = `${rect.top}px`;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            panel.style.left = `${Math.max(0, x)}px`;
            panel.style.top = `${Math.max(0, y)}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // =========================
    // TOAST NOTIFICATIONS
    // =========================

    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('specy-qol-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `specy-qol-toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function updateToggles() {

        document.getElementById("auto-e4-toggle") ?.classList.toggle("active", CONFIG.autoE4Active);

        document.getElementById("auto-heal-toggle") ?.classList.toggle("active", CONFIG.autoHealActive);

        document.getElementById("auto-hatch-toggle") ?.classList.toggle("active", CONFIG.autoHatchActive);

    }

    function toggleSetting(key, enabledMessage, disabledMessage) {

        CONFIG[key] = !CONFIG[key];

        const storageKeys = {
            autoE4Active: "specy-auto-e4",
            autoHealActive: "specy-auto-heal",
            autoHatchActive: "specy-auto-hatch"
        };

        localStorage.setItem(storageKeys[key], CONFIG[key]);

        updateToggles();

        showToast(
            CONFIG[key] ? enabledMessage : disabledMessage,
            CONFIG[key] ? "success" : "info"
        );

    }

    // =========================
    // AUTO E4 FIGHT & HEAL LOGIC
    // =========================

    const CHECK_INTERVAL = 1000;
    let autoE4Interval = null;
    let autoHealInterval = null;
    let busy = false;

    function clickElite4Rematch() {
        const btn = document.querySelector(FIGHT_BUTTON_SELECTOR);
        const active = document.querySelector(FIGHT_ACTIVE_SELECTOR);

        if (busy) return;
        if (!btn || active) return;

        busy = true;
        btn.click();
        showToast(
            "⚔️ Elite Four Started",
            "success",
            1200
        );
        setTimeout(() => { busy = false; }, 1000);
    }

    // Auto E4 Logic

    function startAutoE4() {
        if (autoE4Interval) return;
        autoE4Interval = setInterval(clickElite4Rematch, CHECK_INTERVAL);
    }

    function stopAutoE4() {
        clearInterval(autoE4Interval);
        autoE4Interval = null;
    }

    // Auto Heal Logic

    function clickAutoHeal() {

        const healBtn = document.querySelector(
            HEAL_BUTTON_SELECTOR
        );

        if (!healBtn)
            return;

        healBtn.click();

        showToast(
            "❤️ Pokémon healed",
            "success",
            1200
        );

    }

    function restartAutoHealInterval() {
        if (autoHealInterval) clearInterval(autoHealInterval);

        if (!CONFIG.autoHealActive) return;

        const ms = CONFIG.autoHealMinutes * 60 * 1000;
        autoHealInterval = setInterval(clickAutoHeal, ms);
    }


    // =========================
    // Auto Hatch Logic
    // =========================

    function getHatchButton() {

        return [...document.querySelectorAll("*")].find(el =>
            el.textContent?.trim().startsWith("Hatch all")
        );

    }

    const hatchObserver = new MutationObserver(() => {

        if (!CONFIG.autoHatchActive)
            return;

        const btn = getHatchButton();

        if (!btn)
            return;

        btn.click();

        showToast(
            "🥚 Eggs Hatched",
            "success",
            1200
        );

    });


    // =========================
    // Event Listeners
    // =========================

    function attachEventListeners() {
        const titleHeader = document.getElementById('title-header');
        const content = document.querySelector('.specy-qol-content');
        const titleArrow = document.getElementById('header-arrow');

        if (titleHeader) {
            titleHeader.style.cursor = 'pointer';
            titleHeader.addEventListener('click', () => {
                CONFIG.sectionsCollapsed.title = !CONFIG.sectionsCollapsed.title;
                if (content) content.style.display = CONFIG.sectionsCollapsed.title ? 'none' : 'block';
                if (titleArrow) titleArrow.textContent = CONFIG.sectionsCollapsed.title ? '▶' : '▼';
            });
        }

        ['combat', 'cheats', 'hatchery', 'settings'].forEach(section => {
            const header = document.getElementById(`${section}-header`);
            if (header) {
                header.addEventListener('click', () => {
                    CONFIG.sectionsCollapsed[section] = !CONFIG.sectionsCollapsed[section];
                    const content = document.getElementById(`${section}-content`);
                    const arrow = document.getElementById(`${section}-arrow`);
                    if (content) content.style.display = CONFIG.sectionsCollapsed[section] ? 'none' : 'block';
                    if (arrow) arrow.textContent = CONFIG.sectionsCollapsed[section] ? '▶' : '▼';
                });
            }
        });

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.addEventListener('change', function () {
            changeTheme(this.value); 
            showToast(
                `🎨 Theme changed`,
                "info"
            );
        });

        const languageSelect = document.getElementById('language-select');
        if (languageSelect) languageSelect.addEventListener('change', function () {
            changeLanguage(this.value);

            showToast(
                "🌍 Language changed",
                "info"
            );
         });

        if (e4Toggle) {

            updateToggles();

            e4Toggle.addEventListener("click", () => {

                toggleSetting(
                    "autoE4Active",
                    "⚔️ Auto E4 Enabled",
                    "⚔️ Auto E4 Disabled"
                );

                if (CONFIG.autoE4Active)
                    startAutoE4();
                else
                    stopAutoE4();

            });

        }

        if (healToggle) {

            updateToggles();

            healToggle.addEventListener("click", () => {

                toggleSetting(
                    "autoHealActive",
                    "❤️ Auto Heal Enabled",
                    "❤️ Auto Heal Disabled"
                );

                restartAutoHealInterval();

            });

        }

        if (slider && label) {

            slider.value = CONFIG.autoHealMinutes;
            label.textContent = CONFIG.autoHealMinutes;

            slider.addEventListener("input", function() {

                CONFIG.autoHealMinutes = Number(this.value);

                label.textContent = this.value;

            });

            slider.addEventListener("change", function() {

                localStorage.setItem(
                    "specy-qol-heal-minutes",
                    this.value
                );

                restartAutoHealInterval();

                showToast(
                    `❤️ Heal every ${this.value} minute(s)`,
                    "info"
                );

            });

        }

        const hatchToggle =
            document.getElementById("auto-hatch-toggle");

        if (hatchToggle) {

            updateToggles();

            hatchToggle.addEventListener("click", () => {

                toggleSetting(
                    "autoHatchActive",
                    "🥚 Auto Hatch Enabled",
                    "🥚 Auto Hatch Disabled"
                );

            });

        }



    }

    // =========================
    // Init
    // =========================

    function init() {
        const panel = document.createElement('div');
        panel.id = 'specy-qol-panel';
        panel.innerHTML = createPanelContent();
        document.body.appendChild(panel);
        makePanelDraggable();
        if (!document.getElementById('specy-qol-toast-container')) {
            const container = document.createElement('div');
            container.id = 'specy-qol-toast-container';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '999999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }
        panel.style.display = CONFIG.panelVisible ? 'flex' : 'none';

        initCollapsibleSections();
        attachEventListeners();

        hatchObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // =========================
    // Start Script
    // =========================

    function startScript() {
        init();
        document.addEventListener('keydown', (e) => {

            // Press H to toggle panel
            if (e.key.toLowerCase() === 'h') {
                togglePanelVisibility();
            }
        });
    }

    startScript();

})();

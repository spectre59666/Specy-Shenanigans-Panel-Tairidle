// ==UserScript==
// @name         Specy Tairidle Shenanigans Panel
// @namespace    http://tampermonkey.net/
// @version      1.6.1
// @description  Specy Tairidle Panel with multiple shenanigans and a fancy UI
// @author       5p3c7r3
// @match        https://tairidle.com/*
// @downloadURL  https://raw.githubusercontent.com/spectre59666/Specy-Shenanigans-Panel-Tairidle/main/Specy-Tairidle-Panel.user.js
// @updateURL    https://raw.githubusercontent.com/spectre59666/Specy-Shenanigans-Panel-Tairidle/main/Specy-Tairidle-Panel.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
    'use strict';

    // =====================================================================
    // 1. CONSTANTS
    // =====================================================================

    const APP = Object.freeze({
        panelId: 'specy-qol-panel',
        styleId: 'specy-qol-style',
        toastContainerId: 'specy-qol-toast-container',
        keyboardShortcut: 'h',
        autoE4CheckMs: 1000,
        hatchScanDelayMs: 100,
        hatchClickCooldownMs: 3000,
        lastHealDisplayRefreshMs: 1000
    });

    const STORAGE_KEYS = Object.freeze({
        theme: 'specy-qol-theme',
        language: 'specy-qol-language',
        panelVisible: 'specy-qol-panel-visible',
        panelPosition: 'specy-qol-panel-position',
        autoE4: 'specy-auto-e4',
        autoHeal: 'specy-auto-heal',
        autoHealMinutes: 'specy-qol-heal-minutes',
        lastAutoHealAt: 'specy-qol-last-auto-heal-at',
        autoHatch: 'specy-auto-hatch',
        sectionPrefix: 'specy-qol-section-'
    });

    const GAME_SELECTORS = Object.freeze({
        fightButton: '.col-span-2.py-3.px-3.text-white.text-sm.font-bold.rounded-lg.transition-all.border.bg-purple-700.hover\\:bg-purple-600.active\\:scale-95.border-purple-400',
        healButton: '.flex.flex-col.items-center.justify-center.w-12.h-10.rounded-lg.transition-all.active\\:scale-95.border.border-red-400\\/40.bg-white\\/5.hover\\:bg-white\\/10',
        fightActiveOverlay: '.absolute.inset-0.bg-black\\/25.pointer-events-none.z-0',
        clickableElements: 'button, [role="button"]'
    });

    const SECTION_NAMES = Object.freeze([
        'title',
        'combat',
        'hatchery',
        'cheats',
        'settings'
    ]);

    const DEFAULT_STATE = Object.freeze({
        theme: 'blue',
        language: 'en',
        panelVisible: true,
        panelPosition: null,
        autoE4Active: false,
        autoHealActive: false,
        autoHealMinutes: 3,
        lastAutoHealAt: null,
        autoHatchActive: false,
        sectionsCollapsed: Object.freeze({
            title: false,
            combat: false,
            hatchery: false,
            cheats: false,
            settings: false
        })
    });

    // =====================================================================
    // 2. THEMES AND TRANSLATIONS
    // =====================================================================

    const THEMES = Object.freeze({
        oled: {
            panel: '#0a0a0a',
            background: '#000000',
            section: '#1a1a1a',
            sectionContent: '#0f0f0f',
            sectionText: '#e0e0e0',
            text: '#ffffff',
            border: '#333333',
            button: '#1a1a1a',
            buttonHover: '#2a2a2a'
        },
        dark: {
            panel: '#242424',
            background: '#1a1a1a',
            section: '#2d2d2d',
            sectionContent: '#222222',
            sectionText: '#e0e0e0',
            text: '#ffffff',
            border: '#404040',
            button: '#2d2d2d',
            buttonHover: '#3d3d3d'
        },
        blue: {
            panel: '#1a2332',
            background: '#0f1419',
            section: '#253142',
            sectionContent: '#1a2332',
            sectionText: '#a8c5e0',
            text: '#e1e8ed',
            border: '#38444d',
            button: '#253142',
            buttonHover: '#2d3e52'
        },
        purple: {
            panel: '#211a2d',
            background: '#160f1f',
            section: '#2d2438',
            sectionContent: '#211a2d',
            sectionText: '#d4b5e8',
            text: '#e8dff5',
            border: '#3d2f52',
            button: '#2d2438',
            buttonHover: '#3d2f52'
        }
    });

    const TRANSLATIONS = Object.freeze({
        fr: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            combat: '⚔️ Combat',
            autoE4: 'Recombattre automatiquement le Conseil des 4',
            autoHeal: 'Soin automatique',
            healInterval: 'Intervalle de soin',
            hatchery: '🥚 Couveuse',
            autoHatch: 'Faire éclore automatiquement tous les œufs',
            cheats: '🧪 Cheats (à venir)',
            cheatsPlaceholder: 'Les futurs outils seront ajoutés ici.',
            settings: '⚙️ Paramètres',
            theme: 'Thème',
            language: 'Langue',
            themeOled: 'OLED (économie d’écran)',
            themeDark: 'Sombre',
            themeBlue: 'Bleu nuit',
            themePurple: 'Violet profond',
            autoE4Enabled: '⚔️ Auto E4 activé',
            autoE4Disabled: '⚔️ Auto E4 désactivé',
            autoHealEnabled: '❤️ Soin automatique activé',
            autoHealDisabled: '❤️ Soin automatique désactivé',
            autoHatchEnabled: '🥚 Éclosion automatique activée',
            autoHatchDisabled: '🥚 Éclosion automatique désactivée',
            eliteFourStarted: '⚔️ Conseil des 4 lancé',
            pokemonHealed: '❤️ Pokémon soignés',
            eggsHatched: '🥚 Œufs éclos',
            healEvery: '❤️ Soin toutes les {minutes} minute(s)',
            themeChanged: '🎨 Thème modifié',
            languageChanged: '🌍 Langue modifiée',
            panelShown: '📦 Panneau affiché',
            panelHidden: '📦 Panneau masqué'
        },
        en: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            combat: '⚔️ Combat',
            autoE4: 'Auto E4 rebattle',
            autoHeal: 'Auto Heal',
            healInterval: 'Heal interval',
            hatchery: '🥚 Hatchery',
            autoHatch: 'Auto hatch eggs',
            cheats: '🧪 Cheats (TBD)',
            cheatsPlaceholder: 'Future tools will be added here.',
            settings: '⚙️ Settings',
            theme: 'Theme',
            language: 'Language',
            themeOled: 'OLED (screen saving)',
            themeDark: 'Dark',
            themeBlue: 'Night blue',
            themePurple: 'Deep purple',
            autoE4Enabled: '⚔️ Auto E4 enabled',
            autoE4Disabled: '⚔️ Auto E4 disabled',
            autoHealEnabled: '❤️ Auto Heal enabled',
            autoHealDisabled: '❤️ Auto Heal disabled',
            autoHatchEnabled: '🥚 Auto Hatch enabled',
            autoHatchDisabled: '🥚 Auto Hatch disabled',
            eliteFourStarted: '⚔️ Elite Four started',
            pokemonHealed: '❤️ Pokémon healed',
            eggsHatched: '🥚 Eggs hatched',
            healEvery: '❤️ Heal every {minutes} minute(s)',
            themeChanged: '🎨 Theme changed',
            languageChanged: '🌍 Language changed',
            panelShown: '📦 Panel shown',
            panelHidden: '📦 Panel hidden'
        },
        es: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            combat: '⚔️ Combate',
            autoE4: 'Volver a combatir automáticamente contra el Alto Mando',
            autoHeal: 'Curación automática',
            healInterval: 'Intervalo de curación',
            hatchery: '🥚 Incubadora',
            autoHatch: 'Eclosionar automáticamente todos los huevos',
            cheats: '🧪 Trucos (próximamente)',
            cheatsPlaceholder: 'Las futuras herramientas aparecerán aquí.',
            settings: '⚙️ Configuración',
            theme: 'Tema',
            language: 'Idioma',
            themeOled: 'OLED (ahorro de pantalla)',
            themeDark: 'Oscuro',
            themeBlue: 'Azul noche',
            themePurple: 'Púrpura profundo',
            autoE4Enabled: '⚔️ Auto E4 activado',
            autoE4Disabled: '⚔️ Auto E4 desactivado',
            autoHealEnabled: '❤️ Curación automática activada',
            autoHealDisabled: '❤️ Curación automática desactivada',
            autoHatchEnabled: '🥚 Eclosión automática activada',
            autoHatchDisabled: '🥚 Eclosión automática desactivada',
            eliteFourStarted: '⚔️ Alto Mando iniciado',
            pokemonHealed: '❤️ Pokémon curados',
            eggsHatched: '🥚 Huevos eclosionados',
            healEvery: '❤️ Curación cada {minutes} minuto(s)',
            themeChanged: '🎨 Tema cambiado',
            languageChanged: '🌍 Idioma cambiado',
            panelShown: '📦 Panel mostrado',
            panelHidden: '📦 Panel ocultado'
        },
        de: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            combat: '⚔️ Kampf',
            autoE4: 'Top Vier automatisch erneut bekämpfen',
            autoHeal: 'Automatische Heilung',
            healInterval: 'Heilungsintervall',
            hatchery: '🥚 Brutstation',
            autoHatch: 'Alle Eier automatisch ausbrüten',
            cheats: '🧪 Cheats (demnächst)',
            cheatsPlaceholder: 'Zukünftige Werkzeuge werden hier ergänzt.',
            settings: '⚙️ Einstellungen',
            theme: 'Design',
            language: 'Sprache',
            themeOled: 'OLED (Bildschirm sparen)',
            themeDark: 'Dunkel',
            themeBlue: 'Nachtblau',
            themePurple: 'Tiefes Violett',
            autoE4Enabled: '⚔️ Auto E4 aktiviert',
            autoE4Disabled: '⚔️ Auto E4 deaktiviert',
            autoHealEnabled: '❤️ Automatische Heilung aktiviert',
            autoHealDisabled: '❤️ Automatische Heilung deaktiviert',
            autoHatchEnabled: '🥚 Automatisches Ausbrüten aktiviert',
            autoHatchDisabled: '🥚 Automatisches Ausbrüten deaktiviert',
            eliteFourStarted: '⚔️ Top Vier gestartet',
            pokemonHealed: '❤️ Pokémon geheilt',
            eggsHatched: '🥚 Eier ausgebrütet',
            healEvery: '❤️ Heilung alle {minutes} Minute(n)',
            themeChanged: '🎨 Design geändert',
            languageChanged: '🌍 Sprache geändert',
            panelShown: '📦 Panel angezeigt',
            panelHidden: '📦 Panel ausgeblendet'
        },
        pt: {
            title: '⚡ Specy Shenanigans Panel ⚡',
            combat: '⚔️ Combate',
            autoE4: 'Lutar automaticamente contra a Elite dos Quatro',
            autoHeal: 'Cura automática',
            healInterval: 'Intervalo de cura',
            hatchery: '🥚 Incubadora',
            autoHatch: 'Chocar automaticamente todos os ovos',
            cheats: '🧪 Cheats (em breve)',
            cheatsPlaceholder: 'As futuras ferramentas serão adicionadas aqui.',
            settings: '⚙️ Configurações',
            theme: 'Tema',
            language: 'Idioma',
            themeOled: 'OLED (economia de tela)',
            themeDark: 'Escuro',
            themeBlue: 'Azul noturno',
            themePurple: 'Roxo profundo',
            autoE4Enabled: '⚔️ Auto E4 ativado',
            autoE4Disabled: '⚔️ Auto E4 desativado',
            autoHealEnabled: '❤️ Cura automática ativada',
            autoHealDisabled: '❤️ Cura automática desativada',
            autoHatchEnabled: '🥚 Eclosão automática ativada',
            autoHatchDisabled: '🥚 Eclosão automática desativada',
            eliteFourStarted: '⚔️ Elite dos Quatro iniciada',
            pokemonHealed: '❤️ Pokémon curados',
            eggsHatched: '🥚 Ovos chocados',
            healEvery: '❤️ Cura a cada {minutes} minuto(s)',
            themeChanged: '🎨 Tema alterado',
            languageChanged: '🌍 Idioma alterado',
            panelShown: '📦 Painel exibido',
            panelHidden: '📦 Painel ocultado'
        }
    });

    // =====================================================================
    // 3. STORAGE HELPERS AND STATE
    // =====================================================================

    function readStoredBoolean(key, fallback) {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value === 'true';
    }

    function readStoredNumber(key, fallback, min, max) {
        const rawValue = localStorage.getItem(key);
        if (rawValue === null) return fallback;

        const value = Number(rawValue);
        if (!Number.isFinite(value)) return fallback;
        return Math.min(max, Math.max(min, value));
    }

    function readStoredTimestamp(key, fallback = null) {
        const rawValue = localStorage.getItem(key);
        if (rawValue === null) {
            return fallback;
        }

        const timestamp = Number(rawValue);
        if (!Number.isFinite(timestamp) || timestamp <= 0) {
            return fallback;
        }
        return timestamp;
    }

    function readStoredJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (error) {
            console.warn(`[Specy Panel] Invalid stored JSON for ${key}.`, error);
            return fallback;
        }
    }

    function loadSectionStates() {
        return SECTION_NAMES.reduce((sections, sectionName) => {
            sections[sectionName] = readStoredBoolean(
                `${STORAGE_KEYS.sectionPrefix}${sectionName}`,
                DEFAULT_STATE.sectionsCollapsed[sectionName]
            );
            return sections;
        }, {});
    }

    function getValidTheme(value) {
        return Object.hasOwn(THEMES, value) ? value : DEFAULT_STATE.theme;
    }

    function getValidLanguage(value) {
        return Object.hasOwn(TRANSLATIONS, value) ? value : DEFAULT_STATE.language;
    }

    const STATE = {
        theme: getValidTheme(localStorage.getItem(STORAGE_KEYS.theme)),
        language: getValidLanguage(localStorage.getItem(STORAGE_KEYS.language)),
        panelVisible: readStoredBoolean(STORAGE_KEYS.panelVisible, DEFAULT_STATE.panelVisible),
        panelPosition: readStoredJson(STORAGE_KEYS.panelPosition, DEFAULT_STATE.panelPosition),
        autoE4Active: readStoredBoolean(STORAGE_KEYS.autoE4, DEFAULT_STATE.autoE4Active),
        autoHealActive: readStoredBoolean(STORAGE_KEYS.autoHeal, DEFAULT_STATE.autoHealActive),
        autoHealMinutes: readStoredNumber(
            STORAGE_KEYS.autoHealMinutes,
            DEFAULT_STATE.autoHealMinutes,
            1,
            10
        ),
        lastAutoHealAt: readStoredTimestamp(
            STORAGE_KEYS.lastAutoHealAt,
            DEFAULT_STATE.lastAutoHealAt
        ),
        autoHatchActive: readStoredBoolean(STORAGE_KEYS.autoHatch, DEFAULT_STATE.autoHatchActive),
        sectionsCollapsed: loadSectionStates()
    };

    const RUNTIME = {
        autoE4IntervalId: null,
        autoHealIntervalId: null,
        lastHealDisplayIntervalId: null,
        hatchObserver: null,
        hatchScanTimeoutId: null,
        lastHatchButton: null,
        lastHatchClickAt: 0,
        fightClickLocked: false,
        drag: {
            active: false,
            pointerId: null,
            offsetX: 0,
            offsetY: 0
        }
    };

    const DOM = {
        panel: null,
        content: null,
        toastContainer: null,
        healIntervalSlider: null,
        healIntervalValue: null,
        lastHealAgo: null
    };

    // =====================================================================
    // 4. GENERAL UTILITIES
    // =====================================================================

    function t(key, replacements = {}) {
        const languageTable = TRANSLATIONS[STATE.language] ?? TRANSLATIONS.fr;
        const template = languageTable[key] ?? TRANSLATIONS.fr[key] ?? key;

        return Object.entries(replacements).reduce(
            (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
            template
        );
    }

    function isElementVisible(element) {
        if (!(element instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(style.opacity) !== 0
            && rect.width > 0
            && rect.height > 0;
    }

    function isElementDisabled(element) {
        return element.matches(':disabled, [aria-disabled="true"], [data-disabled="true"]');
    }

    function isEditableTarget(target) {
        return target instanceof HTMLElement
            && (target.isContentEditable
                || target.matches('input, textarea, select, [role="textbox"]'));
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    // =====================================================================
    // 5. STATIC CSS AND PANEL MARKUP
    // =====================================================================

    function injectStyles() {
        if (document.getElementById(APP.styleId)) return;

        const style = document.createElement('style');
        style.id = APP.styleId;
        style.textContent = `
            #${APP.panelId},
            #${APP.panelId} * {
                box-sizing: border-box;
            }

            #${APP.panelId} {
                --specy-panel: #0a0a0a;
                --specy-background: #000000;
                --specy-section: #1a1a1a;
                --specy-section-content: #0f0f0f;
                --specy-section-text: #e0e0e0;
                --specy-text: #ffffff;
                --specy-border: #333333;
                --specy-button: #1a1a1a;
                --specy-button-hover: #2a2a2a;

                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 999999;
                display: flex;
                width: 320px;
                max-height: 95vh;
                flex-direction: column;
                overflow: hidden;
                color: var(--specy-text);
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                background: var(--specy-panel);
                border: 2px solid var(--specy-border);
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
            }

            #${APP.panelId}[hidden] {
                display: none !important;
            }

            #${APP.panelId} button,
            #${APP.panelId} select,
            #${APP.panelId} input {
                font: inherit;
            }

            #${APP.panelId} .title-header {
                display: flex;
                min-height: 48px;
                flex-shrink: 0;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                color: #ffffff;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-bottom: 2px solid var(--specy-border);
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }

            #${APP.panelId} .drag-handle {
                display: inline-flex;
                width: 28px;
                height: 28px;
                flex-shrink: 0;
                align-items: center;
                justify-content: center;
                padding: 0;
                color: inherit;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.18);
                border-radius: 6px;
                cursor: grab;
                touch-action: none;
                user-select: none;
            }

            #${APP.panelId} .drag-handle:active {
                cursor: grabbing;
            }

            #${APP.panelId} .title-toggle {
                display: flex;
                min-width: 0;
                flex: 1;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 0;
                color: inherit;
                font-size: 16px;
                font-weight: 700;
                text-align: left;
                background: none;
                border: 0;
                cursor: pointer;
            }

            #${APP.panelId} .title-text {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            #${APP.panelId} .specy-qol-content {
                min-height: 0;
                flex: 1;
                padding: 15px;
                overflow-y: auto;
            }

            #${APP.panelId} .specy-qol-content::-webkit-scrollbar {
                width: 8px;
            }

            #${APP.panelId} .specy-qol-content::-webkit-scrollbar-track {
                background: var(--specy-background);
                border-radius: 10px;
            }

            #${APP.panelId} .specy-qol-content::-webkit-scrollbar-thumb {
                background: var(--specy-border);
                border-radius: 10px;
            }

            #${APP.panelId} .panel-section + .panel-section {
                margin-top: 12px;
            }

            #${APP.panelId} .section-header {
                display: flex;
                width: 100%;
                min-height: 35px;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 8px 10px;
                color: var(--specy-section-text);
                font-size: 13px;
                font-weight: 700;
                text-align: left;
                background: var(--specy-section);
                border: 1px solid var(--specy-border);
                border-radius: 5px 5px 0 0;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            #${APP.panelId} .section-header:hover {
                background: var(--specy-button-hover);
            }

            #${APP.panelId} .section-arrow {
                width: 16px;
                flex-shrink: 0;
                color: inherit;
                font-size: 12px;
                text-align: center;
            }

            #${APP.panelId} .section-content {
                padding: 10px;
                background: var(--specy-section-content);
                border: 1px solid var(--specy-border);
                border-top: 0;
                border-radius: 0 0 5px 5px;
            }

            #${APP.panelId} .section-content[hidden] {
                display: none !important;
            }

            #${APP.panelId} .toggle-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 10px;
                background: var(--specy-button);
                border: 1px solid var(--specy-border);
                border-radius: 5px;
            }

            #${APP.panelId} .toggle-container + .toggle-container {
                margin-top: 8px;
            }

            #${APP.panelId} .toggle-label {
                font-size: 12px;
                line-height: 1.35;
            }

            #${APP.panelId} .toggle-switch {
                position: relative;
                width: 50px;
                height: 24px;
                flex-shrink: 0;
                padding: 0;
                background: #4a4a4a;
                border: 0;
                border-radius: 12px;
                cursor: pointer;
                transition: background 0.3s ease;
            }

            #${APP.panelId} .toggle-switch.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            #${APP.panelId} .toggle-slider {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s ease;
            }

            #${APP.panelId} .toggle-switch.active .toggle-slider {
                transform: translateX(26px);
            }

            #${APP.panelId} .setting-group {
                margin-top: 10px;
            }

            #${APP.panelId} .setting-label {
                display: block;
                margin: 0 0 4px;
                color: var(--specy-section-text);
                font-size: 12px;
                font-weight: 500;
            }

            #${APP.panelId} .heal-interval-label {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }
            
            #${APP.panelId} #last-heal-ago {
                flex-shrink: 0;
                opacity: 0.7;
                font-size: 11px;
                font-weight: 400;
                white-space: nowrap;
            }

            #${APP.panelId} select {
                width: 100%;
                padding: 8px;
                color: var(--specy-text);
                font-size: 12px;
                background: var(--specy-button);
                border: 1px solid var(--specy-border);
                border-radius: 5px;
                cursor: pointer;
            }

            #${APP.panelId} select option {
                color: var(--specy-text);
                background: var(--specy-panel);
            }

            #${APP.panelId} input[type="range"] {
                width: 100%;
                margin: 6px 0 0;
            }

            #${APP.panelId} .placeholder-text {
                margin: 0;
                color: var(--specy-section-text);
                font-size: 12px;
                line-height: 1.45;
            }

            #${APP.toastContainerId} {
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 1000000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }

            #${APP.toastContainerId} .specy-qol-toast {
                min-width: 220px;
                max-width: min(360px, calc(100vw - 40px));
                padding: 10px 14px;
                color: #ffffff;
                font: 13px/1.4 "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #2962ff, #0039cb);
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                opacity: 0;
                transform: translateX(100%);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }

            #${APP.toastContainerId} .specy-qol-toast.show {
                opacity: 1;
                transform: translateX(0);
            }

            #${APP.toastContainerId} .specy-qol-toast.success {
                background: linear-gradient(135deg, #00c853, #009624);
            }

            #${APP.toastContainerId} .specy-qol-toast.error {
                background: linear-gradient(135deg, #d50000, #9b0000);
            }

            @media (max-width: 420px) {
                #${APP.panelId} {
                    right: 10px;
                    left: 10px;
                    width: auto;
                    max-height: calc(100vh - 20px);
                }
            }
        `;

        document.head.appendChild(style);
    }

    function createPanelMarkup() {
        return `
            <header class="title-header">
                <button
                    class="drag-handle"
                    id="specy-drag-handle"
                    type="button"
                    aria-label="Move panel"
                    title="Move panel"
                >⋮⋮</button>

                <button
                    class="title-toggle"
                    type="button"
                    data-action="toggle-section"
                    data-section="title"
                >
                    <span class="title-text" data-i18n="title"></span>
                    <span class="section-arrow" data-section-arrow="title"></span>
                </button>
            </header>

            <div class="specy-qol-content" id="specy-panel-content">
                <section class="panel-section" data-panel-section="combat">
                    <button
                        class="section-header"
                        type="button"
                        data-action="toggle-section"
                        data-section="combat"
                    >
                        <span data-i18n="combat"></span>
                        <span class="section-arrow" data-section-arrow="combat"></span>
                    </button>

                    <div class="section-content" data-section-content="combat">
                        <div class="toggle-container">
                            <span class="toggle-label" data-i18n="autoE4"></span>
                            <button
                                class="toggle-switch"
                                id="auto-e4-toggle"
                                type="button"
                                role="switch"
                                data-action="toggle-feature"
                                data-feature="autoE4"
                            >
                                <span class="toggle-slider"></span>
                            </button>
                        </div>

                        <div class="toggle-container">
                            <span class="toggle-label" data-i18n="autoHeal"></span>
                            <button
                                class="toggle-switch"
                                id="auto-heal-toggle"
                                type="button"
                                role="switch"
                                data-action="toggle-feature"
                                data-feature="autoHeal"
                            >
                                <span class="toggle-slider"></span>
                            </button>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label" for="heal-interval-slider">
                            <span>
                                <span data-i18n="healInterval"></span>:
                                <span id="heal-interval-value"></span> min
                            </span>
                        <span id="last-heal-ago">(—)</span>
                            </label>
                            <input
                                id="heal-interval-slider"
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                            >
                        </div>
                    </div>
                </section>

                <section class="panel-section" data-panel-section="hatchery">
                    <button
                        class="section-header"
                        type="button"
                        data-action="toggle-section"
                        data-section="hatchery"
                    >
                        <span data-i18n="hatchery"></span>
                        <span class="section-arrow" data-section-arrow="hatchery"></span>
                    </button>

                    <div class="section-content" data-section-content="hatchery">
                        <div class="toggle-container">
                            <span class="toggle-label" data-i18n="autoHatch"></span>
                            <button
                                class="toggle-switch"
                                id="auto-hatch-toggle"
                                type="button"
                                role="switch"
                                data-action="toggle-feature"
                                data-feature="autoHatch"
                            >
                                <span class="toggle-slider"></span>
                            </button>
                        </div>
                    </div>
                </section>

                <section class="panel-section" data-panel-section="cheats">
                    <button
                        class="section-header"
                        type="button"
                        data-action="toggle-section"
                        data-section="cheats"
                    >
                        <span data-i18n="cheats"></span>
                        <span class="section-arrow" data-section-arrow="cheats"></span>
                    </button>

                    <div class="section-content" data-section-content="cheats">
                        <p class="placeholder-text" data-i18n="cheatsPlaceholder"></p>
                    </div>
                </section>

                <section class="panel-section" data-panel-section="settings">
                    <button
                        class="section-header"
                        type="button"
                        data-action="toggle-section"
                        data-section="settings"
                    >
                        <span data-i18n="settings"></span>
                        <span class="section-arrow" data-section-arrow="settings"></span>
                    </button>

                    <div class="section-content" data-section-content="settings">
                        <div class="setting-group">
                            <label class="setting-label" for="theme-select" data-i18n="theme"></label>
                            <select id="theme-select">
                                <option value="oled" data-i18n="themeOled"></option>
                                <option value="dark" data-i18n="themeDark"></option>
                                <option value="blue" data-i18n="themeBlue"></option>
                                <option value="purple" data-i18n="themePurple"></option>
                            </select>
                        </div>

                        <div class="setting-group">
                            <label class="setting-label" for="language-select" data-i18n="language"></label>
                            <select id="language-select">
                                <option value="fr">🇫🇷 Français</option>
                                <option value="en">🇬🇧 English</option>
                                <option value="es">🇪🇸 Español</option>
                                <option value="de">🇩🇪 Deutsch</option>
                                <option value="pt">🇵🇹 Português</option>
                            </select>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    // =====================================================================
    // 6. PANEL RENDERING AND UI UPDATES
    // =====================================================================

    function createToastContainer() {
        let container = document.getElementById(APP.toastContainerId);

        if (!container) {
            container = document.createElement('div');
            container.id = APP.toastContainerId;
            document.body.appendChild(container);
        }

        DOM.toastContainer = container;
    }

    function createPanel() {
        const existingPanel = document.getElementById(APP.panelId);
        if (existingPanel) existingPanel.remove();

        const panel = document.createElement('aside');
        panel.id = APP.panelId;
        panel.innerHTML = createPanelMarkup();
        panel.hidden = !STATE.panelVisible;
        document.body.appendChild(panel);

        DOM.panel = panel;
        DOM.content = panel.querySelector('#specy-panel-content');
        DOM.healIntervalSlider = panel.querySelector('#heal-interval-slider');
        DOM.healIntervalValue = panel.querySelector('#heal-interval-value');
        DOM.lastHealAgo = panel.querySelector('#last-heal-ago');
    }

    function applyTheme() {
        const theme = THEMES[STATE.theme] ?? THEMES[DEFAULT_STATE.theme];
        if (!DOM.panel) return;

        Object.entries(theme).forEach(([property, value]) => {
            const cssProperty = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            DOM.panel.style.setProperty(`--specy-${cssProperty}`, value);
        });

        const themeSelect = DOM.panel.querySelector('#theme-select');
        if (themeSelect) themeSelect.value = STATE.theme;
    }

    function applyTranslations() {
        if (!DOM.panel) return;

        DOM.panel.dir = STATE.language === 'ar' ? 'rtl' : 'ltr';

        DOM.panel.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = t(element.dataset.i18n);
        });

        const languageSelect = DOM.panel.querySelector('#language-select');
        if (languageSelect) languageSelect.value = STATE.language;
    }

    function applyPanelPosition() {
        if (!DOM.panel || !STATE.panelPosition) return;

        const { x, y } = STATE.panelPosition;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        DOM.panel.style.right = 'auto';
        DOM.panel.style.left = `${x}px`;
        DOM.panel.style.top = `${y}px`;

        clampPanelToViewport();
    }

    function clampPanelToViewport() {
        if (!DOM.panel || DOM.panel.hidden) return;

        const rect = DOM.panel.getBoundingClientRect();
        const maxX = Math.max(0, window.innerWidth - rect.width);
        const maxY = Math.max(0, window.innerHeight - Math.min(rect.height, window.innerHeight));
        const x = clamp(rect.left, 0, maxX);
        const y = clamp(rect.top, 0, maxY);

        DOM.panel.style.right = 'auto';
        DOM.panel.style.left = `${x}px`;
        DOM.panel.style.top = `${y}px`;
    }

    function updateSectionUI(sectionName) {
        if (!DOM.panel) return;

        const collapsed = STATE.sectionsCollapsed[sectionName];
        const arrow = DOM.panel.querySelector(`[data-section-arrow="${sectionName}"]`);

        if (arrow) arrow.textContent = collapsed ? '▶' : '▼';

        if (sectionName === 'title') {
            if (DOM.content) DOM.content.hidden = collapsed;
            return;
        }

        const content = DOM.panel.querySelector(`[data-section-content="${sectionName}"]`);
        if (content) content.hidden = collapsed;
    }

    function updateAllSectionUI() {
        SECTION_NAMES.forEach(updateSectionUI);
    }

    function updateFeatureToggle(featureName) {
        if (!DOM.panel) return;

        const featureMap = {
            autoE4: {
                selector: '#auto-e4-toggle',
                enabled: STATE.autoE4Active
            },
            autoHeal: {
                selector: '#auto-heal-toggle',
                enabled: STATE.autoHealActive
            },
            autoHatch: {
                selector: '#auto-hatch-toggle',
                enabled: STATE.autoHatchActive
            }
        };

        const feature = featureMap[featureName];
        if (!feature) return;

        const toggle = DOM.panel.querySelector(feature.selector);
        if (!toggle) return;

        toggle.classList.toggle('active', feature.enabled);
        toggle.setAttribute('aria-checked', String(feature.enabled));
    }

    function updateAllFeatureToggles() {
        ['autoE4', 'autoHeal', 'autoHatch'].forEach(updateFeatureToggle);
    }

    function updateHealIntervalUI() {
        if (DOM.healIntervalSlider) {
            DOM.healIntervalSlider.value = String(STATE.autoHealMinutes);
        }

        if (DOM.healIntervalValue) {
            DOM.healIntervalValue.textContent = String(STATE.autoHealMinutes);
        }
    }

    function formatTimeAgo(timestamp) {
        if (!timestamp) {
            return '—';
        }
        const elapsedSeconds = Math.max(0,Math.floor((Date.now() - timestamp) / 1000));
        const formatter = new Intl.RelativeTimeFormat(STATE.language,{numeric: 'auto',style: 'short'});
        if (elapsedSeconds < 60) {
            return formatter.format(-elapsedSeconds, 'second');
        }
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
        if (elapsedMinutes < 60) {
            return formatter.format(-elapsedMinutes, 'minute');
        }
        const elapsedHours = Math.floor(elapsedMinutes / 60);
        if (elapsedHours < 24) {
            return formatter.format(-elapsedHours, 'hour');
        }
        const elapsedDays = Math.floor(elapsedHours / 24);
        return formatter.format(-elapsedDays, 'day');
    }

    function updateLastHealAgoUI() {
        if (!DOM.lastHealAgo) {
            return;
        }

        const timeAgo = formatTimeAgo(STATE.lastAutoHealAt);

        DOM.lastHealAgo.textContent = `(${timeAgo})`;
    }

    function startLastHealDisplayClock() {
        if (RUNTIME.lastHealDisplayIntervalId !== null) {
            window.clearInterval(
                RUNTIME.lastHealDisplayIntervalId
            );
        }

        updateLastHealAgoUI();

        RUNTIME.lastHealDisplayIntervalId =
            window.setInterval(
                updateLastHealAgoUI,
                APP.lastHealDisplayRefreshMs
            );
    }

    function updateEntireUI() {
        applyTheme();
        applyTranslations();
        updateAllSectionUI();
        updateAllFeatureToggles();
        updateHealIntervalUI();
        updateLastHealAgoUI();
    }

    // =====================================================================
    // 7. TOAST NOTIFICATIONS
    // =====================================================================

    function showToast(message, type = 'info', duration = 3000) {
        if (!DOM.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `specy-qol-toast ${type}`;
        toast.textContent = message;
        DOM.toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        window.setTimeout(() => {
            toast.classList.remove('show');
            window.setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // =====================================================================
    // 8. PANEL INTERACTIONS
    // =====================================================================

    function setSectionCollapsed(sectionName, collapsed) {
        if (!SECTION_NAMES.includes(sectionName)) return;

        STATE.sectionsCollapsed[sectionName] = collapsed;
        localStorage.setItem(
            `${STORAGE_KEYS.sectionPrefix}${sectionName}`,
            String(collapsed)
        );
        updateSectionUI(sectionName);
    }

    function toggleSection(sectionName) {
        setSectionCollapsed(sectionName, !STATE.sectionsCollapsed[sectionName]);
    }

    function setPanelVisible(visible, notify = true) {
        STATE.panelVisible = visible;
        localStorage.setItem(STORAGE_KEYS.panelVisible, String(visible));

        if (DOM.panel) {
            DOM.panel.hidden = !visible;
            if (visible) {
                requestAnimationFrame(clampPanelToViewport);
            }
        }

        if (notify) {
            showToast(t(visible ? 'panelShown' : 'panelHidden'), 'info', 1600);
        }
    }

    function togglePanelVisibility() {
        setPanelVisible(!STATE.panelVisible);
    }

    function setTheme(themeName) {
        STATE.theme = getValidTheme(themeName);
        localStorage.setItem(STORAGE_KEYS.theme, STATE.theme);
        applyTheme();
        showToast(t('themeChanged'), 'info');
    }

    function setLanguage(languageName) {
        STATE.language = getValidLanguage(languageName);
        localStorage.setItem(STORAGE_KEYS.language, STATE.language);
        applyTranslations();
        updateHealIntervalUI();
        updateLastHealAgoUI();
        showToast(t('languageChanged'), 'info');
    }

    function setHealInterval(minutes, persist = true) {
        const nextMinutes = clamp(Number(minutes) || DEFAULT_STATE.autoHealMinutes, 1, 10);
        STATE.autoHealMinutes = nextMinutes;
        updateHealIntervalUI();

        if (!persist) return;

        localStorage.setItem(STORAGE_KEYS.autoHealMinutes, String(nextMinutes));
        restartAutoHeal();
        showToast(t('healEvery', { minutes: nextMinutes }), 'info');
    }

    function setFeatureEnabled(featureName, enabled, notify = true) {
        const featureMap = {
            autoE4: {
                stateKey: 'autoE4Active',
                storageKey: STORAGE_KEYS.autoE4,
                enabledMessage: 'autoE4Enabled',
                disabledMessage: 'autoE4Disabled',
                start: startAutoE4,
                stop: stopAutoE4
            },
            autoHeal: {
                stateKey: 'autoHealActive',
                storageKey: STORAGE_KEYS.autoHeal,
                enabledMessage: 'autoHealEnabled',
                disabledMessage: 'autoHealDisabled',
                start: restartAutoHeal,
                stop: stopAutoHeal
            },
            autoHatch: {
                stateKey: 'autoHatchActive',
                storageKey: STORAGE_KEYS.autoHatch,
                enabledMessage: 'autoHatchEnabled',
                disabledMessage: 'autoHatchDisabled',
                start: startAutoHatch,
                stop: stopAutoHatch
            }
        };

        const feature = featureMap[featureName];
        if (!feature) return;

        STATE[feature.stateKey] = enabled;
        localStorage.setItem(feature.storageKey, String(enabled));
        updateFeatureToggle(featureName);

        if (enabled) feature.start();
        else feature.stop();

        if (notify) {
            showToast(
                t(enabled ? feature.enabledMessage : feature.disabledMessage),
                enabled ? 'success' : 'info'
            );
        }
    }

    function toggleFeature(featureName) {
        const stateKeyMap = {
            autoE4: 'autoE4Active',
            autoHeal: 'autoHealActive',
            autoHatch: 'autoHatchActive'
        };

        const stateKey = stateKeyMap[featureName];
        if (!stateKey) return;

        setFeatureEnabled(featureName, !STATE[stateKey]);
    }

    function handlePanelClick(event) {
        const actionElement = event.target.closest('[data-action]');
        if (!actionElement || !DOM.panel?.contains(actionElement)) return;

        const { action } = actionElement.dataset;

        if (action === 'toggle-section') {
            toggleSection(actionElement.dataset.section);
        }

        if (action === 'toggle-feature') {
            toggleFeature(actionElement.dataset.feature);
        }
    }

    function handlePanelInput(event) {
        if (event.target.id === 'heal-interval-slider') {
            setHealInterval(event.target.value, false);
        }
    }

    function handlePanelChange(event) {
        if (event.target.id === 'theme-select') {
            setTheme(event.target.value);
        }

        if (event.target.id === 'language-select') {
            setLanguage(event.target.value);
        }

        if (event.target.id === 'heal-interval-slider') {
            setHealInterval(event.target.value, true);
        }
    }

    function attachPanelEvents() {
        DOM.panel.addEventListener('click', handlePanelClick);
        DOM.panel.addEventListener('input', handlePanelInput);
        DOM.panel.addEventListener('change', handlePanelChange);
    }

    // =====================================================================
    // 9. DRAGGING
    // =====================================================================

    function beginPanelDrag(event) {
        if (!DOM.panel || event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        const rect = DOM.panel.getBoundingClientRect();
        RUNTIME.drag.active = true;
        RUNTIME.drag.pointerId = event.pointerId;
        RUNTIME.drag.offsetX = event.clientX - rect.left;
        RUNTIME.drag.offsetY = event.clientY - rect.top;

        DOM.panel.style.right = 'auto';
        DOM.panel.style.left = `${rect.left}px`;
        DOM.panel.style.top = `${rect.top}px`;
    }

    function movePanel(event) {
        if (!RUNTIME.drag.active || !DOM.panel) return;
        if (event.pointerId !== RUNTIME.drag.pointerId) return;

        const rect = DOM.panel.getBoundingClientRect();
        const maxX = Math.max(0, window.innerWidth - rect.width);
        const maxY = Math.max(0, window.innerHeight - Math.min(rect.height, window.innerHeight));
        const x = clamp(event.clientX - RUNTIME.drag.offsetX, 0, maxX);
        const y = clamp(event.clientY - RUNTIME.drag.offsetY, 0, maxY);

        DOM.panel.style.left = `${x}px`;
        DOM.panel.style.top = `${y}px`;
    }

    function endPanelDrag(event) {
        if (!RUNTIME.drag.active || !DOM.panel) return;
        if (event.pointerId !== RUNTIME.drag.pointerId) return;

        RUNTIME.drag.active = false;
        RUNTIME.drag.pointerId = null;

        const rect = DOM.panel.getBoundingClientRect();
        STATE.panelPosition = {
            x: Math.round(rect.left),
            y: Math.round(rect.top)
        };
        localStorage.setItem(
            STORAGE_KEYS.panelPosition,
            JSON.stringify(STATE.panelPosition)
        );
    }

    function attachDragEvents() {
        const handle = DOM.panel.querySelector('#specy-drag-handle');
        if (!handle) return;

        handle.addEventListener('pointerdown', beginPanelDrag);
        window.addEventListener('pointermove', movePanel);
        window.addEventListener('pointerup', endPanelDrag);
        window.addEventListener('pointercancel', endPanelDrag);
        window.addEventListener('resize', clampPanelToViewport);
    }

    // =====================================================================
    // 10. AUTO ELITE FOUR
    // =====================================================================

    function findEliteFourButton() {
        const button = document.querySelector(GAME_SELECTORS.fightButton);
        return button instanceof HTMLElement ? button : null;
    }

    function isEliteFourFightActive() {
        return Boolean(document.querySelector(GAME_SELECTORS.fightActiveOverlay));
    }

    function clickEliteFourRematch() {
        if (!STATE.autoE4Active || RUNTIME.fightClickLocked) return;

        const button = findEliteFourButton();
        if (!button || isEliteFourFightActive()) return;
        if (!isElementVisible(button) || isElementDisabled(button)) return;

        RUNTIME.fightClickLocked = true;
        button.click();
        showToast(t('eliteFourStarted'), 'success', 1200);

        window.setTimeout(() => {
            RUNTIME.fightClickLocked = false;
        }, APP.autoE4CheckMs);
    }

    function startAutoE4() {
        stopAutoE4();
        if (!STATE.autoE4Active) return;

        clickEliteFourRematch();
        RUNTIME.autoE4IntervalId = window.setInterval(
            clickEliteFourRematch,
            APP.autoE4CheckMs
        );
    }

    function stopAutoE4() {
        if (RUNTIME.autoE4IntervalId !== null) {
            window.clearInterval(RUNTIME.autoE4IntervalId);
            RUNTIME.autoE4IntervalId = null;
        }
    }

    // =====================================================================
    // 11. AUTO HEAL
    // =====================================================================

    function findHealButton() {
        const button = document.querySelector(GAME_SELECTORS.healButton);
        return button instanceof HTMLElement ? button : null;
    }

    function clickAutoHeal() {
        if (!STATE.autoHealActive) {return;}
        const button = findHealButton();
        if (!button || !isElementVisible(button) || isElementDisabled(button)) {return;}
        button.click();
        STATE.lastAutoHealAt = Date.now();
        localStorage.setItem(STORAGE_KEYS.lastAutoHealAt,String(STATE.lastAutoHealAt));
        updateLastHealAgoUI();
        showToast(
            t('pokemonHealed'),
            'success',
            1200
        );
    }

    function restartAutoHeal() {
        stopAutoHeal();
        if (!STATE.autoHealActive) return;

        const intervalMs = STATE.autoHealMinutes * 60 * 1000;
        RUNTIME.autoHealIntervalId = window.setInterval(clickAutoHeal, intervalMs);
    }

    function stopAutoHeal() {
        if (RUNTIME.autoHealIntervalId !== null) {
            window.clearInterval(RUNTIME.autoHealIntervalId);
            RUNTIME.autoHealIntervalId = null;
        }
    }

    // =====================================================================
    // 12. AUTO HATCH
    // =====================================================================

    function hasHatchAllText(element) {
        const text = element.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';
        return text.startsWith('hatch all');
    }

    function findHatchButton() {
        return [...document.querySelectorAll(GAME_SELECTORS.clickableElements)].find(element => {
            return hasHatchAllText(element)
                && isElementVisible(element)
                && !isElementDisabled(element);
        }) ?? null;
    }

    function scanAndHatch() {
        RUNTIME.hatchScanTimeoutId = null;
        if (!STATE.autoHatchActive) return;

        const button = findHatchButton();
        if (!button) return;

        const now = Date.now();
        const sameButtonWithinCooldown = button === RUNTIME.lastHatchButton
            && now - RUNTIME.lastHatchClickAt < APP.hatchClickCooldownMs;

        if (sameButtonWithinCooldown) return;

        RUNTIME.lastHatchButton = button;
        RUNTIME.lastHatchClickAt = now;
        button.click();
        showToast(t('eggsHatched'), 'success', 1200);
    }

    function scheduleHatchScan() {
        if (!STATE.autoHatchActive) return;
        if (RUNTIME.hatchScanTimeoutId !== null) return;

        RUNTIME.hatchScanTimeoutId = window.setTimeout(
            scanAndHatch,
            APP.hatchScanDelayMs
        );
    }

    function startAutoHatch() {
        stopAutoHatch();
        if (!STATE.autoHatchActive) return;

        RUNTIME.hatchObserver = new MutationObserver(scheduleHatchScan);
        RUNTIME.hatchObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        scheduleHatchScan();
    }

    function stopAutoHatch() {
        RUNTIME.hatchObserver?.disconnect();
        RUNTIME.hatchObserver = null;

        if (RUNTIME.hatchScanTimeoutId !== null) {
            window.clearTimeout(RUNTIME.hatchScanTimeoutId);
            RUNTIME.hatchScanTimeoutId = null;
        }

        RUNTIME.lastHatchButton = null;
        RUNTIME.lastHatchClickAt = 0;
    }

    // =====================================================================
    // 13. GLOBAL EVENTS AND STARTUP
    // =====================================================================

    function handleKeyboardShortcut(event) {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        if (isEditableTarget(event.target)) return;
        if (event.key.toLowerCase() !== APP.keyboardShortcut) return;

        togglePanelVisibility();
    }

    function startSavedAutomations() {
        if (STATE.autoE4Active) startAutoE4();
        if (STATE.autoHealActive) restartAutoHeal();
        if (STATE.autoHatchActive) startAutoHatch();
    }

    function init() {
        injectStyles();
        createToastContainer();
        createPanel();
        attachPanelEvents();
        attachDragEvents();
        updateEntireUI();
        applyPanelPosition();
        startSavedAutomations();
        startLastHealDisplayClock();

        document.addEventListener('keydown', handleKeyboardShortcut);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();

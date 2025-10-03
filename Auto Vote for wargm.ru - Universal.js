// ==UserScript==
// @name         Auto Vote for wargm.ru - Universal
// @namespace    https://github.com/MrDrAgZz
// @version      1.7
// @description  Универсальный скрипт для голосования на wargm.ru
// @author       DrAgZz(MrDrAgZz)
// @match        https://wargm.ru/server*
// @match        http://wargm.ru/server*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let scriptActive = true;
    let observer = null;
    let interval = null;

    // Функция проверки наличия таймера обратного отсчета
    function checkForCooldownTimer() {
        const cooldownSelectors = [
            '.card-footer .btn.btn-blue.disabled',
            '.btn.btn-blue.disabled',
            '[class*="disabled"][class*="btn"]',
            '.disabled:contains("ч.")',
            '.disabled:contains("м.")'
        ];

        for (let selector of cooldownSelectors) {
            try {
                if (selector.includes('contains')) {
                    const elements = document.querySelectorAll('.disabled, [disabled]');
                    for (let el of elements) {
                        if (el.textContent && (el.textContent.includes('ч.') || el.textContent.includes('м.'))) {
                            return el;
                        }
                    }
                } else {
                    const element = document.querySelector(selector);
                    if (element && element.offsetParent !== null) {
                        // Дополнительная проверка текста таймера
                        if (element.textContent && (element.textContent.includes('ч.') || element.textContent.includes('м.'))) {
                            return element;
                        }
                    }
                }
            } catch (e) {
                console.log('Ошибка в селекторе таймера:', selector, e);
            }
        }

        // Дополнительный поиск по всему документу
        const allDisabledElements = document.querySelectorAll('[class*="disabled"], [disabled]');
        for (let el of allDisabledElements) {
            if (el.textContent && (el.textContent.includes('ч.') || el.textContent.includes('м.'))) {
                return el;
            }
        }

        return null;
    }

    // Функция для остановки скрипта
    function stopScript() {
        scriptActive = false;

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

        console.log('Скрипт остановлен: обнаружен таймер обратного отсчета');
    }

    // Проверяем наличие таймера при загрузке
    if (checkForCooldownTimer()) {
        stopScript();
        return; // Полностью прекращаем выполнение
    }

    // Функция для поиска кнопки голосования по различным критериям
    function findVoteButton() {
        if (!scriptActive) return null;

        // Возможные селекторы для кнопки голосования
        const selectors = [
            // По ID (если он меняется)
            '[id*="vote"]',
            '[id*="VOTE"]',
            '[id*="Vote"]',

            // По классам
            '.voting.btn',
            '.btn.voting',
            '.voting',
            '[class*="voting"]',
            '[class*="vote"]',

            // По тексту
            'div:contains("ГОЛОСОВАТЬ")',
            'button:contains("ГОЛОСОВАТЬ")',
            'a:contains("ГОЛОСОВАТЬ")',
            '*:contains("ГОЛОСОВАТЬ")',

            // По data-атрибутам
            '[data-send*="vote"]',
            '[onclick*="vote"]',
            '[href*="vote"]',

            // По сочетанию классов
            '.btn-blue.wp-100',
            '.btn.btn-blue',
            '.wp-100.btn'
        ];

        // Пробуем каждый селектор
        for (let selector of selectors) {
            try {
                if (selector.includes('contains')) {
                    // Для текстовых селекторов
                    const elements = document.querySelectorAll('div, button, a, span');
                    for (let el of elements) {
                        if (el.textContent && el.textContent.trim() === 'ГОЛОСОВАТЬ') {
                            return el;
                        }
                    }
                } else {
                    // Для CSS селекторов
                    const element = document.querySelector(selector);
                    if (element && element.offsetParent !== null) {
                        return element;
                    }
                }
            } catch (e) {
                console.log('Ошибка в селекторе:', selector, e);
            }
        }

        return null;
    }

    // Функция для нажатия кнопки
    function clickVoteButton() {
        if (!scriptActive) return false;

        const voteButton = findVoteButton();

        if (voteButton && voteButton.offsetParent !== null) {
            console.log('Кнопка голосования найдена:', voteButton);

            // Проверяем, не заблокирована ли кнопка
            if (voteButton.disabled || voteButton.classList.contains('disabled')) {
                console.log('Кнопка заблокирована');
                return false;
            }

            // Создаем событие клика
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            // Отправляем событие
            voteButton.dispatchEvent(clickEvent);
            voteButton.click();

            console.log('Клик по кнопке выполнен');
            return true;
        }

        console.log('Кнопка голосования не найдена');
        return false;
    }

    // Функция для поиска по XPath (дополнительный метод)
    function findButtonByXPath() {
        if (!scriptActive) return null;

        const xpaths = [
            "//div[contains(text(), 'ГОЛОСОВАТЬ')]",
            "//button[contains(text(), 'ГОЛОСОВАТЬ')]",
            "//a[contains(text(), 'ГОЛОСОВАТЬ')]",
            "//*[contains(@class, 'voting') and contains(text(), 'ГОЛОСОВАТЬ')]",
            "//*[contains(@onclick, 'vote')]",
            "//*[contains(@data-send, 'vote')]"
        ];

        for (let xpath of xpaths) {
            try {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                if (result.singleNodeValue) {
                    return result.singleNodeValue;
                }
            } catch (e) {
                console.log('Ошибка в XPath:', xpath, e);
            }
        }
        return null;
    }

    // Улучшенная функция поиска
    function advancedFindVoteButton() {
        if (!scriptActive) return null;

        // Сначала пробуем CSS селекторы
        let button = findVoteButton();

        // Если не нашли, пробуем XPath
        if (!button) {
            button = findButtonByXPath();
        }

        // Если все еще не нашли, ищем по точному тексту
        if (!button) {
            const allElements = document.querySelectorAll('*');
            for (let el of allElements) {
                if (el.textContent && el.textContent.trim() === 'ГОЛОСОВАТЬ') {
                    return el;
                }
            }
        }

        return button;
    }

    // Основная функция с улучшенным поиском
    function universalClickVoteButton() {
        if (!scriptActive) return false;

        // Проверяем наличие таймера перед каждым действием
        if (checkForCooldownTimer()) {
            stopScript();
            return false;
        }

        const voteButton = advancedFindVoteButton();

        if (voteButton && voteButton.offsetParent !== null) {
            console.log('Универсальная кнопка найдена:', voteButton);

            // Дополнительная проверка видимости
            const style = window.getComputedStyle(voteButton);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                console.log('Кнопка скрыта');
                return false;
            }

            // Проверяем возможность клика
            if (voteButton.disabled || voteButton.classList.contains('disabled') || voteButton.style.pointerEvents === 'none') {
                console.log('Кнопка недоступна для клика');
                return false;
            }

            // Выполняем клик
            voteButton.click();
            console.log('Универсальный клик выполнен');
            return true;
        }

        console.log('Кнопка не найдена универсальным методом');
        return false;
    }

    // Запускаем поиск кнопки
    if (!universalClickVoteButton()) {
        // Если не нашли сразу, ждем загрузки
        document.addEventListener('DOMContentLoaded', function() {
            if (!scriptActive) return;
            setTimeout(universalClickVoteButton, 1000);
        });

        window.addEventListener('load', function() {
            if (!scriptActive) return;
            setTimeout(universalClickVoteButton, 2000);
        });
    }

    // Наблюдатель за изменениями DOM
    observer = new MutationObserver(function(mutations) {
        if (!scriptActive) return;

        // Проверяем наличие таймера при изменениях DOM
        if (checkForCooldownTimer()) {
            stopScript();
            return;
        }

        for (let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                setTimeout(universalClickVoteButton, 500);
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Резервный интервал
    let attempts = 0;
    const maxAttempts = 15;
    interval = setInterval(function() {
        if (!scriptActive) {
            clearInterval(interval);
            return;
        }

        // Проверяем таймер перед каждой попыткой
        if (checkForCooldownTimer()) {
            stopScript();
            return;
        }

        if (universalClickVoteButton() || attempts >= maxAttempts) {
            clearInterval(interval);
        }
        attempts++;
    }, 1000);

    // Дополнительно: логируем все клики для отладки
    document.addEventListener('click', function(e) {
        if (!scriptActive) return;

        if (e.target.textContent && e.target.textContent.includes('ГОЛОСОВАТЬ')) {
            console.log('Обнаружен клик по кнопке голосования:', e.target);
        }
    }, true);

})();
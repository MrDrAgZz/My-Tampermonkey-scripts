// ==UserScript==
// @name         Kinopoisk to SSPoisk Redirector (Slide Button)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Выдвижная кнопка для открытия текущей страницы на sspoisk.ru
// @author       DrAgZz
// @match        https://www.kinopoisk.ru/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Функция для создания выдвижной кнопки
    function createSlideButton() {
        // Создаем контейнер для кнопки
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'sspoisk-slide-button';
        buttonContainer.style.cssText = `
            position: fixed;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            z-index: 10000;
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0.5;
        `;

        // Создаем саму кнопку
        const button = document.createElement('button');
        button.innerHTML = '📺<br>SSPoisk';
        button.style.cssText = `
            padding: 15px 8px;
            background: linear-gradient(135deg, #ff9e00, #ff6b00);
            color: white;
            border: none;
            border-radius: 10px 0 0 10px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            box-shadow: -2px 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            line-height: 1.2;
            text-align: center;
            min-width: 50px;
        `;

        // Добавляем кнопку в контейнер
        buttonContainer.appendChild(button);

        // Обработчики событий для контейнера
        buttonContainer.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-50%) translateX(-10px)';
            this.style.opacity = '1';
            button.style.padding = '15px 12px';
        });

        buttonContainer.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-50%)';
            this.style.opacity = '0.5';
            button.style.padding = '15px 8px';
        });

        // Обработчик клика
        button.addEventListener('click', function(e) {
            e.stopPropagation();

            // Получаем текущий URL
            const currentUrl = window.location.href;

            // Заменяем домен kinopoisk.ru на sspoisk.ru
            const newUrl = currentUrl.replace(
                'https://www.kinopoisk.ru',
                'https://www.sspoisk.ru'
            );

            // Открываем новую вкладку с измененным URL
            window.open(newUrl, '_blank');
        });

        // Добавляем контейнер на страницу
        document.body.appendChild(buttonContainer);

        // Добавляем обработчик для правого края экрана
        addEdgeTrigger();
    }

    // Функция для активации кнопки при касании правого края
    function addEdgeTrigger() {
        const edgeTrigger = document.createElement('div');
        edgeTrigger.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 20px;
            height: 100%;
            z-index: 9999;
            cursor: pointer;
        `;

        edgeTrigger.addEventListener('mouseenter', function() {
            const button = document.getElementById('sspoisk-slide-button');
            if (button) {
                button.style.transform = 'translateY(-50%) translateX(-10px)';
                button.style.opacity = '1';

                // Временно увеличиваем непрозрачность
                setTimeout(() => {
                    if (document.querySelector('#sspoisk-slide-button:hover') !== button) {
                        button.style.opacity = '0.5';
                        button.style.transform = 'translateY(-50%)';
                    }
                }, 2000);
            }
        });

        document.body.appendChild(edgeTrigger);
    }

    // Функция для добавления стилей анимации
    function addStyles() {
        const styles = `
            #sspoisk-slide-button button:hover {
                background: linear-gradient(135deg, #ff6b00, #ff3d00) !important;
                box-shadow: -3px 3px 15px rgba(0,0,0,0.4) !important;
                transform: scale(1.05) !important;
            }

            #sspoisk-slide-button:hover button {
                border-radius: 10px 0 0 10px !important;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Инициализация
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                createSlideButton();
                addStyles();
            });
        } else {
            createSlideButton();
            addStyles();
        }
    }

    // Запускаем скрипт
    init();

})();
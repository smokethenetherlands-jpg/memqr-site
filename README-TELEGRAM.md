# Telegram интеграция для формы (Netlify)

Готово-из-коробки: заявки с последней формы на странице улетают в Telegram через Netlify Functions.

## Что сделали
- Добавили `public/js/telegram-submit.js` — скрипт перехватывает submit последней формы на странице и отправляет её данные в `/.netlify/functions/telegram`.
- Добавили `netlify/functions/telegram.js` — серверлес‑функция вызывает Telegram Bot API и шлёт все поля в виде списка.
- Добавили `netlify.toml` — конфиг функций.

## Настройка (1 раз)
1) Создайте бота у @BotFather и получите токен.
2) Узнайте свой chat_id (через @userinfobot или getUpdates).
3) В Netlify: Site settings → Environment variables → добавьте:
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID

## Как это работает на странице
- Если на странице несколько форм — скрипт возьмёт **последнюю**. Можно пометить нужную форму атрибутом `data-telegram="true"`.
- Отправляются **все поля** (`input`, `textarea`, `select`) за исключением honeypot `website`.

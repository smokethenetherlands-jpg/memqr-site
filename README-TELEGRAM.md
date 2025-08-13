Интеграция формы с Telegram на Netlify.
- index.html — твой лендинг (кнопка: «Пример страницы памяти»).
- public/js/telegram-submit.js — отправка в /.netlify/functions/telegram.
- netlify/functions/telegram.js — отправляет в Telegram Bot API.
- _redirects — не даёт SPA перехватывать вызовы функций.

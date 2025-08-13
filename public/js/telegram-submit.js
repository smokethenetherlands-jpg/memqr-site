// Auto-bind to the LAST form on the page and send all fields to Netlify -> Telegram.
(function () {
  function serializeForm(form) {
    const data = {};
    const fields = form.querySelectorAll("input, textarea, select");
    fields.forEach(el => {
      const name = el.name || el.id || el.getAttribute("placeholder") || ("field_" + Math.random().toString(36).slice(2));
      const type = (el.type || "").toLowerCase();
      if ((type === "checkbox" || type === "radio")) {
        if (!el.checked) return;
      }
      data[name] = (el.value || "").toString();
    });
    // Honeypot
    data.website = "";
    return data;
  }

  function findTargetForm() {
    // User can optionally mark form with data-telegram="true". If not, pick the last form on page.
    const marked = document.querySelector('form[data-telegram="true"]');
    if (marked) return marked;
    const forms = document.querySelectorAll("form");
    if (!forms || !forms.length) return null;
    return forms[forms.length - 1];
  }

  async function send(payload) {
    const res = await fetch("/.netlify/functions/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || ("HTTP " + res.status));
    }
    return res.json();
  }

  function ensureStatusEl(form) {
    let st = form.querySelector(".telegram-status");
    if (!st) {
      st = document.createElement("p");
      st.className = "telegram-status";
      st.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif";
      st.style.fontSize = "14px";
      st.style.color = "#666";
      st.setAttribute("role", "status");
      form.appendChild(st);
    }
    return st;
  }

  function bind() {
    const form = findTargetForm();
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = ensureStatusEl(form);
      statusEl.textContent = "Отправляем…";

      // Prefer conventional fields if present, else serialize all
      const fd = new FormData(form);
      let payload = Object.fromEntries(fd.entries());
      if (!payload || Object.keys(payload).length === 0) {
        payload = serializeForm(form);
      }

      // Basic honeypot
      if (payload.website && payload.website.trim() !== "") {
        statusEl.textContent = "Спасибо!";
        form.reset?.();
        return;
      }
      try {
        await send(payload);
        statusEl.textContent = "Успешно отправлено! Проверьте Telegram.";
        statusEl.style.color = "green";
        const successUrl = form.getAttribute('data-success');
        if (successUrl) window.location.href = successUrl;
        form.reset?.();
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Ошибка отправки. Подробности в консоли.";
        try { const t = await res.text(); console.error('Function response:', t); } catch(_) {}
        statusEl.style.color = "#b00020";
      }
    }, { once: false });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();

;(() => {
  // augment: redirect to success page if data-success specified
  const form = document.querySelector('form[data-telegram="true"]') || document.querySelector('form:last-of-type');
  if (!form) return;
  const origListener = form.__tgBound;
})();

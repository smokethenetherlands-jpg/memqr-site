// Submit handler: sends form JSON to Netlify Function and handles success/error.
(function () {
  function findForm() {
    const marked = document.querySelector('form[data-telegram="true"]');
    if (marked) return marked;
    const forms = document.querySelectorAll("form");
    return forms[forms.length - 1] || null;
  }
  function successUrl(form) {
    return form?.getAttribute("data-success") || "/success.html";
  }
  async function post(payload) {
    const res = await fetch("/.netlify/functions/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    if (!res.ok) {
      throw new Error("telegram function error: " + text);
    }
    return json;
  }
  function ensureStatusEl(form) {
    let st = document.getElementById("form-ok");
    if (!st) {
      st = document.createElement("div");
      st.id = "form-ok";
      st.style.cssText="margin:10px 0;padding:10px;border-radius:8px;background:#0e1b12;color:#cfe9d1;border:1px solid #244a2a";
      form.parentNode.insertBefore(st, form);
    }
    return st;
  }
  function bind() {
    const form = findForm();
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = ensureStatusEl(form);
      statusEl.style.display = "block";
      statusEl.textContent = "Отправляем…";

      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      if (payload.website && payload.website.trim() !== "") {
        statusEl.textContent = "Спасибо!";
        form.reset?.();
        return;
      }
      try {
        await post(payload);
        statusEl.textContent = "Успешно отправлено!";
        setTimeout(() => { window.location.href = successUrl(form); }, 400);
        form.reset?.();
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Ошибка отправки. Проверьте консоль.";
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else { bind(); }
})();
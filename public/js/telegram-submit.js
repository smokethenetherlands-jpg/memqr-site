(function () {
  const form = document.getElementById("leadForm");
  if (!form) return;
  const ok = document.getElementById("form-ok");
  async function send(payload) {
    const res = await fetch("/.netlify/functions/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    try {
      await send(payload);
      if (ok) { ok.style.display = "block"; }
      const successUrl = form.getAttribute("data-success");
      if (successUrl) location.href = successUrl;
      form.reset();
    } catch (err) {
      console.error("telegram submit error:", err);
      alert("Ошибка отправки. Попробуйте ещё раз.");
    }
  });
})();
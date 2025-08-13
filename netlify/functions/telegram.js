export async function handler(event) {
  if (event.httpMethod === "GET") {
    return json(405, { error: "Method Not Allowed", hint: "Use POST", ping: true });
  }
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors(), body: "ok" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(), body: "Method Not Allowed" };
  }
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return json(500, { error: "TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set" });
    const data = JSON.parse(event.body || "{}");
    const entries = Object.entries(data);
    const lines = entries.map(([k,v]) => `• <b>${escapeHtml(k)}</b>: ${escapeHtml(String(v || ""))}`);
    const text = `🆕 <b>Новая заявка с сайта</b>\n` + lines.join("\n") + `\n⏰ ${new Date().toLocaleString("ru-RU")}`;
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true })
    });
    const out = await tg.json();
    if (!tg.ok || !out.ok) return json(502, { error: "Telegram API error", detail: out });
    return json(200, { ok: true });
  } catch (e) {
    console.error(e);
    return json(500, { error: "Server error" });
  }
}
function cors(){return {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type"}}
function json(status,obj){return {statusCode:status,headers:{ "Content-Type":"application/json",...cors() },body:JSON.stringify(obj)}}
function escapeHtml(str){return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}

export async function handler(event, context){
  if(event.httpMethod === 'OPTIONS'){
    return resp(200, {ok:true}, true);
  }
  if(event.httpMethod === 'GET'){
    return resp(405, {error:'Method Not Allowed', hint:'Use POST', ping:true}, true);
  }
  if(event.httpMethod !== 'POST'){
    return resp(405, {error:'Method Not Allowed', hint:'Use POST'});
  }
  try{
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if(!token || !chatId) return resp(500, {error:'TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set'});

    const data = JSON.parse(event.body || '{}');
    const entries = Object.entries(data || {}).filter(([k]) => k.toLowerCase()!=='website');
    if(entries.length===0) return resp(400, {error:'Нет данных формы'});

    const lines = entries.map(([k,v]) => `• <b>${esc(k)}</b>: ${esc(String(v||''))}`);
    const text = `🆕 <b>Новая заявка</b>\n${lines.join('\n')}\n⏰ ${new Date().toLocaleString('ru-RU')}`;

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: chatId, text, parse_mode:'HTML', disable_web_page_preview:true})
    });
    const tj = await tg.json().catch(()=>null);
    if(!tg.ok || !(tj && tj.ok)){
      return resp(502, {error:'Telegram API error', detail:tj});
    }
    return resp(200, {ok:true});
  }catch(e){
    return resp(500, {error:'Server error'});
  }
}

function resp(status, body, cors=false){
  const h = {'Content-Type':'application/json'};
  if(cors){ h['Access-Control-Allow-Origin']='*'; h['Access-Control-Allow-Methods']='POST, GET, OPTIONS'; h['Access-Control-Allow-Headers']='Content-Type';}
  return {statusCode: status, headers: h, body: JSON.stringify(body)};
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

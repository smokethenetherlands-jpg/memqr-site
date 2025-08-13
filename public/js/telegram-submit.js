(function(){
  const form = document.querySelector('form[data-telegram="true"]') || document.getElementById('leadForm');
  if(!form){ console.warn('Telegram form not found'); return; }
  const statusEl = document.getElementById('formStatus') || (function(){let p=document.createElement('p');p.id='formStatus';p.className='status';form.appendChild(p);return p;})();

  async function postJSON(url, data){
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const text = await res.text();
    let json; try{ json = JSON.parse(text); }catch(_){}
    if(!res.ok){ const err = new Error('HTTP '+res.status); err.detail = json||text; throw err; }
    return json||text;
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    statusEl.className='status'; statusEl.textContent='Отправляем…';

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    if(payload.website && payload.website.trim()!==''){
      statusEl.textContent='Спасибо!'; form.reset(); return;
    }

    try{
      const r = await postJSON('/.netlify/functions/telegram', payload);
      console.debug('telegram function response:', r);
      statusEl.className='status ok'; statusEl.textContent='Успешно отправлено!';
      setTimeout(()=>{ window.location.href='/success.html'; }, 500);
    }catch(err){
      console.error('telegram function error:', err, err.detail);
      statusEl.className='status err'; 
      statusEl.textContent='Ошибка отправки. '+ (err.detail && err.detail.error ? err.detail.error : 'Проверьте токен/chat_id в Netlify.');
    }
  });
})();
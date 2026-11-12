function quickTrackHTML(){return `<form class="card" onsubmit="return quickTrack(event)"><h3>Quick order tracking</h3>
<div class="row"><input id="qt" placeholder="Order ID, e.g. 3F9A21BC" required style="flex:1"><button class="red" style="margin:0">Track</button></div></form><div id="qtr"></div>`}
async function quickTrack(e){e.preventDefault();if(!user){location.hash='login';return false}
  const k=$('#qt').value.trim().toLowerCase();
  const {data,error}=await sb.from('orders').select('*').eq('user_id',user.id);
  $('#qtr').innerHTML=error?'<p class="err">'+esc(error.message)+'</p>':((data||[]).filter(o=>String(o.id).toLowerCase().startsWith(k)).map(ocard).join('')||'<p>'+t('nofound')+'</p>');return false}

function home(){$('#app').innerHTML=`
<input id="hq" type="search" placeholder="🔍 Search products…" oninput="homeSearch(this.value)" style="margin-bottom:10px"><div id="hres"></div>
<div class="banner"><h1>${t('h1')}</h1><p>${t('bp')}</p><a class="btn gold" href="#shop">${t('shopnow')}</a> <a class="btn ghost" style="color:#fff;border-color:#fff" href="#track">${t('trackorder')}</a></div>
<div class="feat">
<a class="card" href="#shop"><i>🛍️</i><span><b>${t('store')}</b><br><span class="muted">${t('stored')}</span></span></a>
<a class="card" href="#request" onclick="document.getElementById('request').scrollIntoView();return false"><i>🔗</i><span><b>${t('req')}</b><br><span class="muted">${t('reqd')}</span></span></a>
<a class="card" href="#track"><i>📍</i><span><b>${t('trk')}</b><br><span class="muted">${t('trkd')}</span></span></a></div>
${quickTrackHTML()}
<div id="feat"></div>
<div class="card"><h2>Order from any Indian store</h2><p class="muted">Paste the product link and we deliver it to your door in Nepal.</p>
<div class="stores">${['Amazon','Flipkart','Myntra','Meesho','Ajio','Nykaa'].map(s=>`<span>${s}</span>`).join('')}</div></div>
<form class="card" id="request" onsubmit="return submitOrder(event)" style="margin-top:16px">
<h2>Request a product</h2>
<label>Product link</label><input name="url" type="url" required placeholder="https://www.amazon.in/…">
<label>Product name (optional)</label><input name="name">
<div class="row"><div style="flex:1"><label>Quantity</label><input name="qty" type="number" min="1" max="20" value="1"></div>
<div style="flex:2"><label>Phone / WhatsApp</label><input name="phone" required value="${esc(profile?.phone)}" placeholder="98XXXXXXXX"></div></div>
<label>Delivery address</label><textarea name="addr" rows="2" required>${esc(profile?.address)}</textarea>
<label>Size, colour or notes</label><textarea name="notes" rows="2"></textarea>
<p class="muted">Payment: Cash on Delivery. We review your link and send the price in NPR before you pay anything.</p>
<button class="red">${user?'Send order request':'Login to send request'}</button><div class="err" id="e"></div></form>
<div class="card"><h2>How it works</h2><ol class="how">
<li>Choose a product from our store or paste an Indian product link.</li>
<li>Enter your phone number and delivery address in Nepal.</li>
<li>We check the link and send you the price in NPR.</li>
<li>You confirm the order.</li>
<li>We order the product from India.</li>
<li>It reaches your door. Pay with Cash on Delivery.</li></ol></div>`;
  loadFeatured()}

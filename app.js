
async function googleLogin(){const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/'}});if(error){const e=document.getElementById('e');if(e)e.textContent=error.message}}
setInterval(()=>{const f=document.querySelector('form[onsubmit^="return auth("]');if(f&&!f.querySelector('.gbtn')){const b=document.createElement('button');b.type='button';b.className='ghost gbtn';b.textContent='Continue with Google';b.onclick=googleLogin;f.appendChild(b)}},500);
if(!window.supabase){document.getElementById('app').innerHTML='<div class="card"><h2>No connection</h2><p>The page could not load fully. Please check your internet and try again.</p><button class="red" onclick="location.reload()">Retry</button></div>';throw new Error('supabase not loaded')}
const SB_URL='https://dgmcsadmhbwibhcbhksf.supabase.co', SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbWNzYWRtaGJ3aWJoY2Joa3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMzc0MzIsImV4cCI6MjEwOTYxMzQzMn0.ReE33H21g3YHQmTFN45Mw_eRrOYpp4cBBLrv_rteJc4', WA_NUMBER='9779713952940';
const sb=supabase.createClient(SB_URL,SB_KEY);
const STATUSES=['Requested','Quoted','Confirmed','Ordered','Shipped','Delivered','Cancelled'];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let user=null,profile=null,isAdmin=false;
let lang='en';try{lang=localStorage.getItem('lang')||'en'}catch{}
const t=k=>(L[lang]&&L[lang][k])||L.en[k]||k;
function setLang(l){lang=l;try{localStorage.setItem('lang',l)}catch{}render()}
let installEv=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEv=e;nav()});
async function installApp(){if(!installEv)return;installEv.prompt();await installEv.userChoice;installEv=null;nav()}
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

const PROD={};
let cart=[];try{cart=JSON.parse(localStorage.getItem('cart')||'[]')}catch{cart=[]}
function saveCart(){try{localStorage.setItem('cart',JSON.stringify(cart))}catch{}nav()}
$('#wa').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent('Hello myCart, I need help.');

async function setUser(u){user=u||null;profile=null;isAdmin=false;
  if(user){try{const {data}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle();profile=data;isAdmin=!!data?.is_admin}catch{}}
  render()}
sb.auth.getSession().then(({data})=>setUser(data.session?.user)).catch(()=>render());
sb.auth.onAuthStateChange((e,s)=>{if(e!=='TOKEN_REFRESHED')setUser(s?.user)});
addEventListener('hashchange',render);
render();

function nav(){const n=cart.reduce((x,i)=>x+i.qty,0),v=(location.hash||'#home').slice(1);
  $('#sale').textContent=t('sale');document.documentElement.lang=lang==='hi'?'hi':lang==='ne'?'ne':'en';
  $('#hdr').innerHTML=(installEv?`<a class="chip" href="#" onclick="installApp();return false">⬇ ${t('install')}</a> `:'')+`<a class="chip" href="#cart">${t('cart')} (${n})</a> `+(isAdmin?'<a class="chip" href="#admin">Admin</a> <a class="chip" href="#products">Products</a> ':'')+(user?'':`<a class="chip" href="#login">${t('login')}</a>`);
  const k=(h,i)=>`<a href="#${h}" class="${v===h?'on':''}"><b>${i}</b>${t(h)}</a>`;
  $('#bn').innerHTML=k('home','🏠')+k('shop','🛍️')+k('orders','📦')+k('track','📍')+k('settings','⚙️')}
function storeOf(u){try{const h=new URL(u).hostname;return /amazon\./.test(h)||/amzn\./.test(h)?'Amazon':/flipkart\.|fkrt\./.test(h)?'Flipkart':h.replace('www.','')}catch{return null}}
function render(){nav();const v=(location.hash||'#home').slice(1);
  const f={home,login:()=>authView(0),register:()=>authView(1),orders,admin,shop,cart:cartView,products:prodAdmin,track,settings}[v]||home;f();scrollTo(0,0)}

const img=u=>/^https?:\/\//.test(u||'')?`<img src="${esc(u)}" alt="" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:#eee">`:'';
const SEL={};
function chipsInner(p){return (p.sizes||[]).map(x=>`<button type="button" class="${x.in&&SEL[p.id]===x.s?'red':'ghost'}" ${x.in?'':'disabled'} data-s="${esc(x.s)}" onclick="pickSize('${p.id}',this.dataset.s)" style="margin:2px;padding:6px 12px;${x.in?'':'text-decoration:line-through;opacity:.45'}">${esc(x.s)}</button>`).join('')}
function sizeChips(p){return (p.sizes&&p.sizes.length)?`<div class="muted" style="margin-top:6px">Size</div><div data-sz="${p.id}">${chipsInner(p)}</div>`:''}
function pickSize(id,s){SEL[id]=s;document.querySelectorAll('[data-sz="'+id+'"]').forEach(el=>el.innerHTML=chipsInner(PROD[id]))}
function pcard(p){return `<div class="card">${img(p.image_url)}<b>${esc(p.name)}</b><div class="muted">${esc(p.description)}</div><div class="price">NPR ${Number(p.price_npr).toLocaleString()}</div>${sizeChips(p)}${p.in_stock?`<span class="tag ok">${t('instock')}</span><button class="gold" style="margin:0" onclick="buyNow('${p.id}')">${t('buy')}</button>`:`<span class="tag">${t('oos')}</span>`}</div>`}
function addCart(id){const p=PROD[id];if(!p)return false;const has=(p.sizes||[]).length,s=SEL[id]||'';
  if(has&&!s){alert('Please choose a size first');return false}
  const x=cart.find(i=>i.id===id&&(i.size||'')===s);
  if(x)x.qty++;else cart.push({id,name:p.name,price:Number(p.price_npr),qty:1,size:s});saveCart();return true}
function buyNow(id){if(addCart(id))location.hash='cart'}

async function loadFeatured(){const {data}=await sb.from('products').select('*').eq('featured',true).eq('in_stock',true).limit(6);
  if(data&&data.length&&$('#feat')){data.forEach(p=>PROD[p.id]=p);$('#feat').innerHTML=`<div class="row"><h2>${t('latest')}</h2><a href="#shop">${t('viewall')}</a></div><div class="grid" style="margin-top:10px">${data.map(pcard).join('')}</div>`}}

let shopData=[];
function drawShop(q){const s=(q||'').trim().toLowerCase();
  const list=shopData.filter(p=>!s||(p.name||'').toLowerCase().includes(s)||(p.description||'').toLowerCase().includes(s));
  $('#pl').innerHTML=list.length?`<div class="grid">${list.map(pcard).join('')}</div>`:(shopData.length?'<p>No products found. You can <a href="#home">request any product link</a>.</p>':'<p>No products yet. You can still <a href="#home">request any product link</a>.</p>')}
async function shop(){$('#app').innerHTML='<h2>'+t('shop')+'</h2><input id="sq" type="search" placeholder="🔍 Search products…" oninput="drawShop(this.value)" style="margin-bottom:10px"><div id="pl">…</div>';
  const {data,error}=await sb.from('products').select('*').order('created_at',{ascending:false});
  if(error){$('#pl').innerHTML='<p class="err">'+esc(error.message)+'</p>';return}
  data.forEach(p=>PROD[p.id]=p);
  shopData=data;drawShop($('#sq').value)}

function chg(k,d){cart[k].qty+=d;if(cart[k].qty<=0)cart.splice(k,1);saveCart();cartView()}
function cartView(){const tot=cart.reduce((s,i)=>s+i.price*i.qty,0);
  $('#app').innerHTML='<h2>'+t('yourcart')+'</h2>'+(!cart.length?'<p>Your cart is empty. <a href="#shop">Go to the shop</a></p>':cart.map((i,k)=>`
<div class="card"><div class="row"><b>${esc(i.name)}${i.size?' (Size '+esc(i.size)+')':''}</b><span>NPR ${(i.price*i.qty).toLocaleString()}</span></div>
<div class="row"><span class="muted">NPR ${i.price.toLocaleString()} each</span><span><button class="ghost" style="margin:0" onclick="chg(${k},-1)">−</button> &nbsp;${i.qty}&nbsp; <button class="ghost" style="margin:0" onclick="chg(${k},1)">+</button></span></div></div>`).join('')+`
<form class="card" onsubmit="return checkout(event)"><div class="row"><b>${t('total')}</b><b>NPR ${tot.toLocaleString()}</b></div>
<label>Phone / WhatsApp</label><input name="phone" required value="${esc(profile?.phone)}" placeholder="98XXXXXXXX">
<label>Delivery address</label><textarea name="addr" rows="2" required>${esc(profile?.address)}</textarea>
<label>Notes</label><textarea name="notes" rows="2"></textarea>
<p class="muted">${t('cod')}</p>
<button class="red">${user?t('place'):t('login')}</button><div class="err" id="e"></div></form>`)}

async function checkout(e){e.preventDefault();if(!user){location.hash='login';return false}
  const f=new FormData(e.target);
  const rows=cart.map(i=>({user_id:user.id,store:'myCart shop',product_url:location.origin+'/#shop',product_name:i.name+(i.size?' - Size '+i.size:''),qty:i.qty,quote_npr:i.price*i.qty,status:'Confirmed',phone:f.get('phone'),address:f.get('addr'),notes:f.get('notes')}));
  const {error}=await sb.from('orders').insert(rows);
  if(error){$('#e').textContent='Could not place order: '+error.message;return false}
  cart=[];saveCart();location.hash='orders';return false}

function filterP(s){return shopData.filter(p=>(p.name||'').toLowerCase().includes(s)||(p.description||'').toLowerCase().includes(s))}
async function ensureShop(){if(shopData.length)return;const {data}=await sb.from('products').select('*').order('created_at',{ascending:false});shopData=data||[];shopData.forEach(p=>PROD[p.id]=p)}
async function homeSearch(q){const s=(q||'').trim().toLowerCase(),r=$('#hres'),f=$('#feat');if(!r)return;
  if(!s){r.innerHTML='';if(f)f.style.display='';return}
  await ensureShop();const h=$('#hq');if(!h||h.value.trim().toLowerCase()!==s)return;
  if(f)f.style.display='none';const list=filterP(s);
  r.innerHTML=list.length?`<div class="grid" style="margin-top:10px">${list.map(pcard).join('')}</div>`:'<p>No products found. You can request any product link below.</p>'}
function home(){$('#app').innerHTML=`
<input id="hq" type="search" placeholder="🔍 Search products…" oninput="homeSearch(this.value)" style="margin-bottom:10px"><div id="hres"></div>
<div class="banner"><h1>${t('h1')}</h1><p>${t('bp')}</p><a class="btn gold" href="#shop">${t('shopnow')}</a> <a class="btn ghost" style="color:#fff;border-color:#fff" href="#track">${t('trackorder')}</a></div>
<div class="feat">
<a class="card" href="#shop"><i>🛍️</i><span><b>${t('store')}</b><br><span class="muted">${t('stored')}</span></span></a>
<a class="card" href="#request" onclick="document.getElementById('request').scrollIntoView();return false"><i>🔗</i><span><b>${t('req')}</b><br><span class="muted">${t('reqd')}</span></span></a>
<a class="card" href="#track"><i>📍</i><span><b>${t('trk')}</b><br><span class="muted">${t('trkd')}</span></span></a></div>
<div id="feat"></div>
<form class="card" id="request" onsubmit="return submitOrder(event)" style="margin-top:16px">
<h2>Request a product</h2>
<label>Product link</label><input name="url" type="url" required placeholder="https://www.amazon.in/…">
<label>Product name (optional)</label><input name="name">
<div class="row"><div style="flex:1"><label>Quantity</label><input name="qty" type="number" min="1" max="20" value="1"></div>
<div style="flex:2"><label>Phone / WhatsApp</label><input name="phone" required value="${esc(profile?.phone)}" placeholder="98XXXXXXXX"></div></div>
<label>Delivery address</label><textarea name="addr" rows="2" required>${esc(profile?.address)}</textarea>
<label>Size, colour or notes</label><textarea name="notes" rows="2"></textarea>
<p class="muted">Payment: Cash on Delivery. We review your link and send the price in NPR before you pay anything.</p>
<button class="red">${user?'Send order request':'Login to send request'}</button><div class="err" id="e"></div></form>`;
  loadFeatured()}

async function submitOrder(e){e.preventDefault();if(!user){location.hash='login';return false}
  const f=new FormData(e.target),u=f.get('url');
  const {error}=await sb.from('orders').insert({user_id:user.id,store:storeOf(u),product_url:u,product_name:f.get('name'),qty:+f.get('qty'),phone:f.get('phone'),address:f.get('addr'),notes:f.get('notes')});
  if(error){$('#e').textContent='Could not send: '+error.message}else{location.hash='orders'}return false}

  function authView(reg){$('#app').innerHTML=`<form class="card" onsubmit="return auth(event,${reg})"><h2>${reg?'Create account':'Login'}</h2>
${reg?`<label>Full name</label><input name="name" required><label>Phone</label><input name="phone" required><label>Address</label><input name="addr" required>`:''}
<label>Email</label><input name="email" type="email" required><label>Password</label><input name="pw" type="password" minlength="6" required>
<button class="red">${reg?'Register':'Login'}</button><div class="err" id="e"></div>
<p class="muted">${reg?'Have an account? <a href="#login">Login</a>':'New here? <a href="#register">Register</a>'}</p></form>`}

async function auth(e,reg){e.preventDefault();const f=new FormData(e.target);
  const r=reg?await sb.auth.signUp({email:f.get('email'),password:f.get('pw'),options:{data:{full_name:f.get('name'),phone:f.get('phone'),address:f.get('addr')}}}):await sb.auth.signInWithPassword({email:f.get('email'),password:f.get('pw')});
  if(r.error){$('#e').textContent=r.error.message;return false}
  if(reg&&!r.data.session){$('#e').textContent='Check your email to confirm, then login.';return false}
  location.hash='home';return false}

function steps(s){if(s==='Cancelled')return '';const i=STATUSES.indexOf(s);return `<div class="steps">${STATUSES.slice(0,6).map((x,j)=>`<span class="${j<=i?'on':''}">${x}</span>`).join('')}</div>`}
const oid=o=>String(o.id).slice(0,8).toUpperCase();
function ocard(o){return `<div class="card"><div class="row"><b>${esc(o.product_name||o.store||'Product')}</b><span class="tag st ${o.status}">${o.status}</span></div>
<div class="muted">${t('orderid')}: <b>${oid(o)}</b> · ${esc(o.store)} · Qty ${o.qty} · ${new Date(o.created_at).toLocaleDateString()}</div>
<a href="${esc(o.product_url)}" target="_blank" rel="noopener">View product</a>
<p>${o.quote_npr!=null?`Price: <b>NPR ${Number(o.quote_npr).toLocaleString()}</b> (pay on delivery)`:'Waiting for our price quote.'}</p>${steps(o.status)}</div>`}

async function orders(){if(!user){location.hash='login';return}
  const {data,error}=await sb.from('orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
  $('#app').innerHTML=`<h2>${t('myorders')}</h2>`+(error?`<p class="err">${esc(error.message)}</p>`:!data.length?`<p>No orders yet. <a href="#shop">Visit the shop</a> or <a href="#home">request a product link</a>.</p>`:data.map(ocard).join(''))}

function track(){
  $('#app').innerHTML=`<h2>${t('track')}</h2><form class="card" onsubmit="return doTrack(event)"><label>${t('orderid')}</label><input id="tid" placeholder="3F9A21BC" required><button class="red">${t('trackbtn')}</button></form><div id="tr"></div>`}
async function doTrack(e){e.preventDefault();if(!user){location.hash='login';return false}
  const k=$('#tid').value.trim().toLowerCase();
  const {data,error}=await sb.from('orders').select('*').eq('user_id',user.id);
  if(error){$('#tr').innerHTML='<p class="err">'+esc(error.message)+'</p>';return false}
  const m=(data||[]).filter(o=>String(o.id).toLowerCase().startsWith(k));
  $('#tr').innerHTML=m.length?m.map(ocard).join(''):'<p>'+t('nofound')+'</p>';return false}

function settings(){const lb=(c,n)=>`<button class="${lang===c?'red':'ghost'}" style="margin:4px 4px 0 0" onclick="setLang('${c}')">${n}</button>`;
  $('#app').innerHTML=`<h2>${t('settings')}</h2><div class="card"><b>${t('account')}</b><br>${user?`<div class="muted">${esc(profile?.full_name||'')} ${esc(user.email)}</div><button class="ghost" onclick="sb.auth.signOut();location.hash='home'">${t('logout')}</button>`:`<a class="btn red" href="#login">${t('login')}</a> <a class="btn ghost" href="#register">${t('register')}</a>`}</div>
<div class="card"><b>${t('lang')}</b><br>${lb('en','English')}${lb('hg','Hinglish')}${lb('ne','नेपाली')}${lb('hi','हिंदी')}</div>
${installEv?`<div class="card"><button class="gold" style="margin:0" onclick="installApp()">⬇ ${t('install')}</button></div>`:''}
<div class="card"><a href="#orders">${t('myorders')}</a><br><a href="#track">${t('trackorder')}</a><br><a target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}">WhatsApp</a></div>`}

async function admin(){if(!isAdmin){location.hash='home';return}
  const {data,error}=await sb.from('orders').select('*').order('created_at',{ascending:false});
  $('#app').innerHTML=`<h2>All orders</h2>`+(error?`<p class="err">${esc(error.message)}</p>`:data.map(o=>`
<div class="card"><div class="row"><b>${esc(o.product_name||o.store)} ×${o.qty}</b><span class="muted">${oid(o)} · ${new Date(o.created_at).toLocaleString()}</span></div>
<a href="${esc(o.product_url)}" target="_blank" rel="noopener">${esc(o.store)} link</a>
<div class="muted">${esc(o.phone)} · ${esc(o.address)}</div><div>${esc(o.notes)}</div>
<div class="row"><select id="s${o.id}">${STATUSES.map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select>
<input id="q${o.id}" type="number" placeholder="Quote NPR" value="${o.quote_npr??''}" style="max-width:150px"></div>
<button onclick="save('${o.id}')">Save</button>
<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${String(o.phone||'').replace(/\D/g,'').replace(/^(?=\d{10}$)/,'977')}">WhatsApp customer</a></div>`).join(''))}
async function save(id){const q=$('#q'+id).value;
  const {error}=await sb.from('orders').update({status:$('#s'+id).value,quote_npr:q===''?null:+q}).eq('id',id);
  alert(error?error.message:'Saved')}

/* ---------- PRODUCTS (admin) with photo upload from gallery ---------- */
function shrink(file,max=1000){return new Promise((res,rej)=>{const im=new Image(),u=URL.createObjectURL(file);
  im.onload=()=>{const r=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*r);c.height=Math.round(im.height*r);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?res(b):rej(new Error('Could not read photo')),'image/jpeg',0.82)};
  im.onerror=()=>rej(new Error('Could not read this photo. Try another one.'));im.src=u})}

let bulk=[],done=new Set();
function rowHTML(i,f){return `<div class="card" id="r${i}">${f?`<img src="${URL.createObjectURL(f)}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:8px">`:'<div class="muted">No photo</div>'}
<label>Name</label><input id="bn${i}"><label>Price (NPR)</label><input id="bp${i}" type="number" min="0">
<label>Sizes (example: S,M,L,XL). Leave empty if no sizes</label><input id="bs${i}" placeholder="S,M,L,XL"></div>`}
function pickFiles(inp){[...inp.files].forEach(f=>{bulk.push(f);$('#rows').insertAdjacentHTML('beforeend',rowHTML(bulk.length-1,f))});inp.value=''}
function addBlank(){bulk.push(null);$('#rows').insertAdjacentHTML('beforeend',rowHTML(bulk.length-1,null))}

async function prodAdmin(){if(!isAdmin){location.hash='home';return}
  shopData=[];bulk=[];done=new Set();
  const {data,error}=await sb.from('products').select('*').order('created_at',{ascending:false});
  if(data)data.forEach(p=>PROD[p.id]=p);
  $('#app').innerHTML=`<h2>Products</h2>
<div class="card"><h3>Add products (many at once)</h3>
<p class="muted">Choose many photos from your gallery. For each photo, type the name, price and sizes. Then tap "Add all products".</p>
<label>Choose photos</label><input type="file" accept="image/*" multiple onchange="pickFiles(this)">
<button class="ghost" type="button" onclick="addBlank()">+ Add a product without photo</button>
<div id="rows"></div>
<label><input type="checkbox" id="bf" style="width:auto"> Show all these on home page (featured)</label>
<button class="red" id="ab" onclick="addAll()">Add all products</button><div class="err" id="e"></div></div>`+(error?`<p class="err">${esc(error.message)}</p>`:data.map(p=>`
<div class="card">${p.image_url?`<img src="${esc(p.image_url)}" alt="" style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin-bottom:6px">`:''}<div class="row"><b>${esc(p.name)}</b><span>NPR ${Number(p.price_npr).toLocaleString()}</span></div>
${(p.sizes&&p.sizes.length)?`<div class="muted">Tap a size to mark it out of stock (✕) or back in stock</div><div>${p.sizes.map((z,k)=>`<button class="${z.in?'':'ghost'}" style="margi

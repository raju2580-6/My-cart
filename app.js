if(!window.supabase){document.getElementById('app').innerHTML='';throw new Error('supabase not loaded')}
const SB_URL='https://dgmcsadmhbwibhcbhksf.supabase.co',SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbWNzYWRtaGJ3aWJoY2Joa3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMzc0MzIsImV4cCI6MjEwOTYxMzQzMn0.ReE33H21g3YHQmTFN45Mw_eRrOYpp4cBBLrv_rteJc4',WA_NUMBER='9779713952940';
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
const PROD={};
let cart=[];try{cart=JSON.parse(localStorage.getItem('cart')||'[]')}catch{cart=[]}
function saveCart(){try{localStorage.setItem('cart',JSON.stringify(cart))}catch{}nav()}
$('#wa').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent('Hello myCart, I need help.');
async function googleLogin(){const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/'}});if(error){const e=document.getElementById('e');if(e)e.textContent=error.message}}

async function setUser(u){user=u||null;profile=null;isAdmin=false;
  if(user){try{const {data}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle();profile=data;isAdmin=!!data?.is_admin}catch{}}
  render()}
sb.auth.getSession().then(({data})=>setUser(data.session?.user)).catch(()=>render());
sb.auth.onAuthStateChange((e,s)=>{if(e!=='TOKEN_REFRESHED')setUser(s?.user)});
addEventListener('hashchange',render);

function nav(){const n=cart.reduce((x,i)=>x+i.qty,0),v=(location.hash||'#home').slice(1);
  $('#sale').textContent=t('sale');document.documentElement.lang=lang==='hi'?'hi':lang==='ne'?'ne':'en';
  $('#hdr').innerHTML=(installEv?`⬇ ${t('install')} `:'')+`${t('cart')} (${n}) `+(isAdmin?'Admin Products ':'')+(user?'':`${t('login')}`);
  const k=(h,i)=>`${i}${t(h)}`;
  $('#bn').innerHTML=k('home','🏠')+k('shop','🛍️')+k('orders','📦')+k('track','📍')+k('settings','⚙️')}
function storeOf(u){try{const h=new URL(u).hostname;return /amazon\./.test(h)||/amzn\./.test(h)?'Amazon':/flipkart\.|fkrt\./.test(h)?'Flipkart':h.replace('www.','')}catch{return null}}
function render(){nav();const v=(location.hash||'#home').slice(1);
  const f={home,login:()=>authView(0),register:()=>authView(1),orders,admin,shop,cart:cartView,products:prodAdmin,track,settings}[v]||home;f();scrollTo(0,0)}

const img=u=>/^https?:\/\//.test(u||'')?``:'';
const SEL={};
function chipsInner(p){return (p.sizes||[]).map(x=>``).join('')}
function sizeChips(p){return (p.sizes&&p.sizes.length)?` Size ${chipsInner(p)} `:''}
function pickSize(id,s){SEL[id]=s;document.querySelectorAll('[data-sz="'+id+'"]').forEach(el=>el.innerHTML=chipsInner(PROD[id]))}
function pcard(p){return ` ${img(p.image_url)}${esc(p.name)} ${esc(p.description)} NPR ${Number(p.price_npr).toLocaleString()} ${sizeChips(p)}${p.in_stock?`${t('instock')}`:`${t('oos')}`} `}
function addCart(id){const p=PROD[id];if(!p)return false;const has=(p.sizes||[]).length,s=SEL[id]||'';
  if(has&&!s){alert('Please choose a size first');return false}
  const x=cart.find(i=>i.id===id&&(i.size||'')===s);
  if(x)x.qty++;else cart.push({id,name:p.name,price:Number(p.price_npr),qty:1,size:s});saveCart();return true}
function buyNow(id){if(addCart(id))location.hash='cart'}

async function loadFeatured(){const {data}=await sb.from('products').select('*').eq('featured',true).eq('in_stock',true).limit(6);
  if(data&&data.length&&$('#feat')){data.forEach(p=>PROD[p.id]=p);$('#feat').innerHTML=` ${t('latest')} ${t('viewall')} ${data.map(pcard).join('')} `}}

let shopData=[];
function drawShop(q){const s=(q||'').trim().toLowerCase();
  const list=shopData.filter(p=>!s||(p.name||'').toLowerCase().includes(s)||(p.description||'').toLowerCase().includes(s));
  $('#pl').innerHTML=list.length?` ${list.map(pcard).join('')} `:(shopData.length?' No products found. You can request any product link.':' No products yet. You can still request any product link.')}
async function shop(){$('#app').innerHTML=''+t('shop')+' <input id="sq" type="search" placeholder="🔍 Search products…" oninput="drawShop(this.value)" style="margin-bottom:10px">…';
  const {data,error}=await sb.from('products').select('*').order('created_at',{ascending:false});
  if(error){$('#pl').innerHTML=''+esc(error.message)+'';return}
  data.forEach(p=>PROD[p.id]=p);shopData=data;drawShop($('#sq').value)}

function chg(k,d){cart[k].qty+=d;if(cart[k].qty<=0)cart.splice(k,1);saveCart();cartView()}
function cartView(){const tot=cart.reduce((s,i)=>s+i.price*i.qty,0);
  $('#app').innerHTML=''+t('yourcart')+''+(!cart.length?' Your cart is empty. Go to the shop':cart.map((i,k)=>`
${esc(i.name)}${i.size?' (Size '+esc(i.size)+')':''}NPR ${(i.price*i.qty).toLocaleString()}
`).join('')+`
`)}

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
  r.innerHTML=list.length?` ${list.map(pcard).join('')} `:' No products found. You can request any product link below.'}function home(){$('#app').innerHTML=`
<input id="hq" type="search" placeholder="🔍 Search products…" oninput="home...const EXPRESS_OPEN=false;
function home(){$('#app').innerHTML=`
<input id="hq" type="search" placeholder="🔍 Search products…" oninput="homeSearch(this.value)" style="margin-bottom:10px">
${t('h1')} ${t('bp')} ${t('shopnow')} ${t('trackorder')}

🛍️${t('store')} ${t('stored')}
🔗${t('req')} ${t('reqd')}
📍${t('trk')} ${t('trkd')}
🚚 Express Delivery${EXPRESS_OPEN?'Open':'Closed'} ${EXPRESS_OPEN?'Order now for fast delivery.':'Opening soon.'}



How it works
Choose a product or paste a link Enter your delivery address We send the price in NPR We order from India Delivery to your doorstep, pay on delivery `;
  loadFeatured()}
function quickTrack(e){e.preventDefault();sessionStorage.setItem('qt',$('#qt').value.trim());location.hash='track';return false}

async function submitOrder(e){e.preventDefault();if(!user){location.hash='login';return false}
  const f=new FormData(e.target),u=f.get('url');
  const {error}=await sb.from('orders').insert({user_id:user.id,store:storeOf(u),product_url:u,product_name:f.get('name'),qty:+f.get('qty'),phone:f.get('phone'),address:f.get('addr'),notes:f.get('notes')});
  if(error){$('#e').textContent='Could not send: '+error.message}else{location.hash='orders'}return false}

function authView(reg){$('#app').innerHTML=` `}

async function auth(e,reg){e.preventDefault();const f=new FormData(e.target);
  const r=reg?await sb.auth.signUp({email:f.get('email'),password:f.get('pw'),options:{data:{full_name:f.get('name'),phone:f.get('phone'),address:f.get('addr')}}}):await sb.auth.signInWithPassword({email:f.get('email'),password:f.get('pw')});
  if(r.error){$('#e').textContent=r.error.message;return false}
  if(reg&&!r.data.session){$('#e').textContent='Check your email to confirm, then login.';return false}
  location.hash='home';return false}

function steps(s){if(s==='Cancelled')return '';const i=STATUSES.indexOf(s);return ` ${STATUSES.slice(0,6).map((x,j)=>``).join('')} `}
const oid=o=>String(o.id).slice(0,8).toUpperCase();
function ocard(o){return ` ${esc(o.product_name||o.store||'Product')}${o.status}
${t('orderid')}: ${oid(o)} · ${esc(o.store)} · Qty ${o.qty} · ${new Date(o.created_at).toLocaleDateString()}
View product
${o.quote_npr!=null?`Price: NPR ${Number(o.quote_npr).toLocaleString()} (pay on delivery)`:'Waiting for our price quote.'} ${steps(o.status)} `}

async function orders(){if(!user){location.hash='login';return}
  const {data,error}=await sb.from('orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
  $('#app').innerHTML=` ${t('myorders')} `+(error?` ${esc(error.message)} `:!data.length?` No orders yet. Visit the shop or request a product link. `:data.map(ocard).join(''))}

function track(){
  $('#app').innerHTML=` ${t('track')} `;
  const q=sessionStorage.getItem('qt');if(q){sessionStorage.removeItem('qt');$('#tid').value=q;doTrack({preventDefault(){}})}}
async function doTrack(e){e.preventDefault();if(!user){location.hash='login';return false}
  const k=$('#tid').value.trim().toLowerCase();
  const {data,error}=await sb.from('orders').select('*').eq('user_id',user.id);
  if(error){$('#tr').innerHTML=''+esc(error.message)+'';return false}
  const m=(data||[]).filter(o=>String(o.id).toLowerCase().startsWith(k));
  $('#tr').innerHTML=m.length?m.map(ocard).join(''):''+t('nofound')+'';return false}

function settings(){const lb=(c,n)=>``;
  $('#app').innerHTML=` ${t('settings')} ${t('account')} ${user?` ${esc(profile?.full_name||'')} ${esc(user.email)} `:`${t('login')} ${t('register')}`}
${t('lang')} ${lb('en','English')}${lb('hg','Hinglish')}${lb('ne','नेपाली')}${lb('hi','हिंदी')}
${installEv?` `:''}
${t('myorders')} ${t('trackorder')} WhatsApp `}

async function admin(){if(!isAdmin){location.hash='home';return}
  const {data,error}=await sb.from('orders').select('*').order('created_at',{ascending:false});
  $('#app').innerHTML=` All orders `+(error?` ${esc(error.message)} `:data.map(o=>`
${esc(o.product_name||o.store)} ×${o.qty}${oid(o)} · ${new Date(o.created_at).toLocaleString()}
${esc(o.store)} link
${esc(o.phone)} · ${esc(o.address)} ${esc(o.notes)}


WhatsApp customer `).join(''))}
async function save(id){const q=$('#q'+id).value;
  const {error}=await sb.from('orders').update({status:$('#s'+id).value,quote_npr:q===''?null:+q}).eq('id',id);
  alert(error?error.message:'Saved')}

render();

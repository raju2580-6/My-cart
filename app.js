/* ===== EDIT THESE (copy URL and key from your old app.js) ===== */
const CFG = {
  SUPABASE_URL: 'PASTE_YOUR_SUPABASE_URL',
  SUPABASE_KEY: 'PASTE_YOUR_SUPABASE_ANON_KEY',
  WHATSAPP: '977XXXXXXXXXX',   // your WhatsApp number with country code
  RATE: 1.6, FEE: 10, DELIVERY: 100,   // INR to NPR, service fee %, delivery NPR
  OPEN: [15, 30], CLOSE: [19, 0]       // express delivery hours (Nepal time)
};
/* =============================================================== */
const db = supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let user = null, products = [];

$('#wa').href = 'https://wa.me/' + CFG.WHATSAPP + '?text=' + encodeURIComponent('Namaste myCart! I have a question about an order.');

/* ---------- pages ---------- */
function route() {
  const h = (location.hash || '#home').slice(1);
  document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== h);
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.hash === '#' + h));
  if (h === 'shop') loadShop();
  if (h === 'orders') loadOrders();
  scrollTo(0, 0);
}
addEventListener('hashchange', route);

/* ---------- sign in ---------- */
const signIn = () => db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
async function authUI() {
  const { data } = await db.auth.getSession();
  user = data.session ? data.session.user : null;
  $('#auth').textContent = user ? 'Sign out' : 'Sign in';
  $('#sauth').textContent = user ? 'Sign out' : 'Sign in with Google';
  $('#sinfo').textContent = user ? 'Signed in as ' + user.email : 'You are not signed in.';
}
const authClick = async () => { if (user) { await db.auth.signOut(); await authUI(); route(); } else signIn(); };
$('#auth').onclick = authClick; $('#sauth').onclick = authClick;
db.auth.onAuthStateChange(authUI);

/* ---------- express delivery ---------- */
(function () {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).split(':');
  const n = +p[0] * 60 + +p[1], a = CFG.OPEN[0] * 60 + CFG.OPEN[1], b = CFG.CLOSE[0] * 60 + CFG.CLOSE[1];
  const open = n >= a && n < b, f = t => { const h = t[0]; return ((h + 11) % 12 + 1) + ':' + String(t[1]).padStart(2, '0') + (h >= 12 ? ' PM' : ' AM'); };
  $('#xstat').textContent = open ? 'Open' : 'Closed'; $('#xstat').className = 'pill ' + (open ? 'o' : 'c');
  $('#xtext').textContent = open ? 'Delivering now until ' + f(CFG.CLOSE) + '.' : 'Opens daily at ' + f(CFG.OPEN) + ' (Nepal time).';
})();

/* ---------- shop ---------- */
async function loadShop() {
  if (!products.length) { const { data } = await db.from('products').select('*').order('created_at', { ascending: false }); products = data || []; }
  drawShop();
}
function drawShop() {
  const q = $('#q').value.toLowerCase();
  const list = products.filter(p => (p.name || p.title || '').toLowerCase().includes(q));
  $('#grid').innerHTML = list.length ? list.map(p => {
    const price = p.price_npr ?? p.price;
    return '<div class="p"><img loading="lazy" src="' + esc(p.image_url) + '" alt=""><b>' + esc(p.name || p.title) + '</b><span>NPR ' + esc(price) + '</span><button data-id="' + esc(p.id) + '">Buy now</button></div>';
  }).join('') : '<p>No products found.</p>';
}
$('#q').oninput = drawShop;
$('#grid').onclick = async e => {
  const id = e.target.dataset.id; if (!id) return;
  if (!user) return signIn();
  const p = products.find(x => String(x.id) === id), phone = prompt('Your phone number?'), addr = phone && prompt('Delivery address (Cash on Delivery)?');
  if (!phone || !addr) return;
  const { data, error } = await db.from('store_orders').insert({ user_id: user.id, product_id: p.id, product_name: p.name || p.title, total: p.price_npr ?? p.price, phone, address: addr }).select('code').single();
  alert(error ? 'Could not place order: ' + error.message : 'Order placed! Your Order ID is ' + data.code);
};

/* ---------- request from India ---------- */
function estimate() {
  const p = parseFloat($('#rprice').value), q = parseInt($('#rqty').value, 10) || 1;
  if (!(p > 0)) { $('#est').innerHTML = ''; return null; }
  const base = Math.round(p * q * CFG.RATE), fee = Math.round(base * CFG.FEE / 100), total = base + fee + CFG.DELIVERY;
  $('#est').innerHTML = 'Product NPR ' + base + ' + service NPR ' + fee + ' + delivery NPR ' + CFG.DELIVERY + '<br><b>Estimated total: NPR ' + total + '</b>';
  return total;
}
$('#rprice').oninput = estimate; $('#rqty').oninput = estimate;
$('#rgo').onclick = async () => {
  const link = $('#rlink').value.trim(), msg = $('#rmsg');
  if (!user) return signIn();
  if (!/^https?:\/\//i.test(link) || !$('#rphone').value.trim() || !$('#raddr').value.trim()) { msg.textContent = 'Enter a product link, phone number and address.'; return; }
  const { data, error } = await db.from('link_requests').insert({ user_id: user.id, link, qty: parseInt($('#rqty').value, 10) || 1, est_npr: estimate(), phone: $('#rphone').value.trim(), address: $('#raddr').value.trim(), note: $('#rnote').value.trim() }).select('code').single();
  msg.textContent = error ? 'Could not send: ' + error.message : 'Request sent! Your Request ID is ' + data.code + '. Pay the NPR 35–60 confirmation amount on WhatsApp.';
};

/* ---------- tracking ---------- */
async function track(code, out) {
  code = code.trim(); if (!code) return;
  const { data, error } = await db.rpc('track_code', { c: code });
  out.textContent = error ? 'Could not check: ' + error.message : (data && data.length) ? data[0].kind + ' ' + code.toUpperCase() + ': ' + data[0].status + (data[0].quote_npr ? ' (NPR ' + data[0].quote_npr + ')' : '') : 'No order found with that ID.';
}
$('#tgo').onclick = () => track($('#tid').value, $('#tres'));
$('#hgo').onclick = () => { $('#tid').value = $('#hid').value; location.hash = '#track'; track($('#hid').value, $('#tres')); };

/* ---------- my orders ---------- */
async function loadOrders() {
  const box = $('#olist');
  if (!user) { box.innerHTML = '<div class="card"><p>Sign in to see your orders.</p></div>'; return; }
  const [r, o] = await Promise.all([db.from('link_requests').select('code,link,status,created_at').order('created_at', { ascending: false }), db.from('store_orders').select('code,product_name,status,created_at').order('created_at', { ascending: false })]);
  const rows = [...(o.data || []).map(x => ({ code: x.code, t: x.product_name, s: x.status })), ...(r.data || []).map(x => ({ code: x.code, t: x.link, s: x.status }))];
  box.innerHTML = rows.length ? rows.map(x => '<div class="card"><b>' + esc(x.code) + '</b> · ' + esc(x.s) + '<p class="small">' + esc(x.t) + '</p></div>').join('') : '<div class="card"><p>No orders yet.</p></div>';
}

authUI().then(route);
                                                    

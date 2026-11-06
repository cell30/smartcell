/* SmartCell — catálogo + panel de administración (localStorage) */
const ADMIN_PIN = '1234';                 // ← cambia aquí tu PIN
const WA_NUMBER = '59173176238';
const KEY = 'smartcell-products', THEME_KEY = 'smartcell-theme';
const CATS = { basico: 'Básico', media: 'Gama Media', gaming: 'Gaming', premium: 'Premium' };

const P = (id, name, cat, price, img, screen, ram, storage, battery, extra) =>
  ({ id, name, cat, price, img, screen, ram, storage, battery, extra });
const DEFAULTS = [
  P('d1','Samsung Galaxy A05','basico',1800,'imagenes/Samsung.jpg','6.7"','4GB','64GB','5000mAh','Android 14'),
  P('d2','Tecno SPARK','basico',3200,'imagenes/TecnoSpark.jpg','6.5"','8GB','256GB','6700mAh','Android 15'),
  P('d3','Redmi Note 14','basico',2799,'imagenes/redmi14.jpg','6.74"','8GB','256GB','5500mAh','120Hz'),
  P('d4','Infinix Zero','media',3309,'imagenes/Infinix zero.jpg','6.6" AMOLED','8GB','256GB','5000mAh','50MP'),
  P('d5','HONOR','media',6200,'imagenes/Honor.jpg','6.67" AMOLED','8GB','256GB','5000mAh','108MP'),
  P('d6','ZTE Blade A56','media',1499,'imagenes/ZTEBlade.jpg','6.55" pOLED','8GB','128GB','5000mAh','8MP'),
  P('d7','POCO X8 Pro','gaming',2750,'imagenes/PocoX8.jpg','6.67" 120Hz','12GB','512GB','6500mAh','Dimensity 8500'),
  P('d8','Samsung Galaxy S26 Ultra','gaming',5280,'imagenes/Samsungs26.jpg','6.6" 120Hz','12GB','256GB','5000mAh','200MP'),
  P('d9','RedMagic','gaming',4900,'imagenes/RedMagic.jpg','6.67" 144Hz','24GB','256GB','7500mAh','Dimensity 9300'),
  P('d10','iPhone 16 Pro Max','premium',15199,'imagenes/iphone16max.jpg','','8GB','256GB','4685mAh','12MP · 60fps'),
  P('d11','HONOR Magic V6','premium',18423,'imagenes/honormagic.jpg','6.1" 120Hz','16GB','512GB','6660mAh','50MP'),
  P('d12','Xiaomi 17 Ultra','premium',7500,'imagenes/Xiaomi17.jpg','6.73" LTPO','16GB','512GB','','Snapdragon 8 Gen 3 · Leica'),
];

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => 'Bs. ' + Number(n).toLocaleString('es-BO', { maximumFractionDigits: 0 });
const specsOf = p => [p.screen, p.ram && p.ram + ' RAM', p.storage, p.battery, p.extra].filter(Boolean).join(' · ');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Almacenamiento ── */
let products = load(), filter = 'todos';
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s)) return s; } catch {}
  return structuredClone(DEFAULTS);
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(products)); return true; }
  catch { toast('No hay espacio: usa una imagen más pequeña o una URL'); return false; }
}

/* ── Tema ── */
const body = document.body, themeBtn = $('#themeToggle');
function applyTheme(t, animate) {
  if (animate && !reduced) {
    body.classList.add('theme-anim'); themeBtn.classList.add('spin');
    setTimeout(() => { body.classList.remove('theme-anim'); themeBtn.classList.remove('spin'); }, 600);
  }
  body.dataset.theme = t;
  const dark = t === 'dark';
  $('.theme-icon', themeBtn).textContent = dark ? '🌙' : '☀️';
  $('.theme-label', themeBtn).textContent = dark ? 'Oscuro' : 'Claro';
  themeBtn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  localStorage.setItem(THEME_KEY, t);
}
applyTheme(localStorage.getItem(THEME_KEY) || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
themeBtn.addEventListener('click', () => applyTheme(body.dataset.theme === 'dark' ? 'light' : 'dark', true));

/* ── Reveal con IntersectionObserver ── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.setProperty('--d', (i % 4) * 70 + 'ms'); io.observe(el); });

/* ── Catálogo ── */
const grid = $('#grid');
function render() {
  const list = products.filter(p => filter === 'todos' || p.cat === filter);
  grid.innerHTML = list.map((p, i) => `
    <article class="product-card" style="--d:${Math.min(i, 8) * 55}ms">
      <div class="card-img">${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" onerror="this.replaceWith('📱')">` : '📱'}</div>
      <div class="card-body">
        <div class="badge-garantia">✅ Garantía</div>
        <div class="card-cat">${CATS[p.cat] || ''}</div>
        <div class="card-name">${esc(p.name)}</div>
        <div class="card-specs">${esc(specsOf(p))}</div>
        <div class="card-footer">
          <span class="card-price">${fmt(p.price)}</span>
          <a class="card-wa" target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola! Me interesa el ' + p.name)}">WhatsApp</a>
        </div>
      </div>
    </article>`).join('');
  $('#empty').hidden = list.length > 0;
  grid.querySelectorAll('.product-card').forEach(c => io.observe(c));
  $('#statModels').textContent = products.length;
}

$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === b));
  filter = b.dataset.cat; render();
});

/* Spotlight que sigue al cursor (delegado + rAF) */
let raf;
grid.addEventListener('pointermove', e => {
  const c = e.target.closest('.product-card'); if (!c) return;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  });
});

/* ── Toast ── */
let tt; function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── Admin: PIN ── */
const pinDlg = $('#pinDlg'), adminDlg = $('#adminDlg'), pinInput = $('#pinInput');
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
[pinDlg, adminDlg].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); })); // clic en el fondo
$('#adminOpen').addEventListener('click', () => { pinInput.value = ''; $('#pinErr').hidden = true; pinDlg.showModal(); pinInput.focus(); });
$('#pinForm').addEventListener('submit', e => {
  e.preventDefault();
  if (pinInput.value === ADMIN_PIN) { pinDlg.close(); openAdmin(); }
  else { $('#pinErr').hidden = false; pinInput.select(); pinDlg.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}], { duration: 260 }); }
});

/* ── Admin: CRUD ── */
const F = id => $('#' + id), form = $('#pForm');
const fields = ['Name','Cat','Price','Img','Screen','Ram','Storage','Battery','Extra'];
function openAdmin() { renderList(); resetForm(); adminDlg.showModal(); }

function renderList() {
  $('#countAdmin').textContent = products.length;
  $('#alist').innerHTML = products.map(p => `
    <li data-id="${p.id}">
      ${p.img ? `<img src="${esc(p.img)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ph',textContent:'📱'}))">` : '<span class="ph">📱</span>'}
      <div class="info"><b>${esc(p.name)}</b><small>${CATS[p.cat]} · ${fmt(p.price)}</small></div>
      <button class="mini" data-act="edit">Editar</button>
      <button class="mini del" data-act="del">Eliminar</button>
    </li>`).join('');
}

$('#alist').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const id = btn.closest('li').dataset.id, p = products.find(x => x.id === id);
  if (btn.dataset.act === 'edit') {
    fields.forEach(f => F('f' + f).value = p[f.toLowerCase()] ?? '');
    F('fId').value = id; F('fFile').value = ''; showPrev(p.img);
    $('#formTitle').textContent = 'Editar producto'; $('#saveBtn').textContent = 'Guardar cambios'; $('#cancelEdit').hidden = false;
    form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  } else if (btn.classList.contains('confirm')) {            // segundo toque = confirmar
    products = products.filter(x => x.id !== id);
    if (save()) { render(); renderList(); toast('Producto eliminado'); }
  } else {
    btn.classList.add('confirm'); btn.textContent = '¿Seguro?';
    setTimeout(() => { btn.classList.remove('confirm'); btn.textContent = 'Eliminar'; }, 2500);
  }
});

function resetForm() {
  form.reset(); F('fId').value = ''; showPrev('');
  $('#formTitle').textContent = 'Nuevo producto'; $('#saveBtn').textContent = 'Guardar producto'; $('#cancelEdit').hidden = true;
}
$('#cancelEdit').addEventListener('click', resetForm);

function showPrev(src) { const i = F('fPrev'); i.hidden = !src; if (src) i.src = src; }
F('fImg').addEventListener('input', e => showPrev(e.target.value.trim()));

/* Subida de imagen: se redimensiona (máx. 640px) para no llenar localStorage */
F('fFile').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const k = Math.min(1, 640 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = img.width * k; c.height = img.height * k;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const data = c.toDataURL('image/jpeg', .8); F('fImg').value = data; showPrev(data); URL.revokeObjectURL(url);
  };
  img.src = url;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const id = F('fId').value, item = { id: id || 'p' + Date.now() };
  fields.forEach(f => item[f.toLowerCase()] = F('f' + f).value.trim());
  item.price = Number(item.price);
  const i = products.findIndex(x => x.id === id);
  const prev = [...products];
  i >= 0 ? products[i] = item : products.push(item);
  if (!save()) { products = prev; return; }
  render(); renderList(); resetForm(); toast(i >= 0 ? 'Cambios guardados' : 'Producto creado');
});

$('#resetBtn').addEventListener('click', e => {
  const b = e.currentTarget;
  if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = '¿Seguro?'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'Restaurar catálogo'; }, 2500); return; }
  localStorage.removeItem(KEY); products = structuredClone(DEFAULTS);
  delete b.dataset.sure; b.textContent = 'Restaurar catálogo';
  render(); renderList(); resetForm(); toast('Catálogo restaurado');
});

render();

/* ── Hero: video de fondo + animación (se pausa fuera de pantalla) ── */
const hero = $('#hero'), heroVid = $('#heroVideo'), heroCtrl = $('#heroCtrl');
let heroPaused = false;
if (hero && heroVid) {
  const saveData = navigator.connection && navigator.connection.saveData;
  const canVideo = !reduced && !saveData;
  if (!canVideo) heroVid.remove();                         // ahorro de datos / movimiento reducido: solo aurora
  else {
    heroVid.muted = true;
    heroVid.addEventListener('playing', () => hero.classList.add('video-on'));   // si no hay archivo, queda la aurora
  }
  if (!reduced) new IntersectionObserver(([e]) => {
    hero.classList.toggle('is-idle', !e.isIntersecting);
    if (canVideo && !heroPaused) e.isIntersecting ? heroVid.play().catch(() => {}) : heroVid.pause();
  }, { threshold: .05 }).observe(hero);
  heroCtrl.addEventListener('click', () => {
    heroPaused = !heroPaused;
    hero.classList.toggle('is-paused', heroPaused);
    heroCtrl.setAttribute('aria-pressed', heroPaused);
    heroCtrl.setAttribute('aria-label', heroPaused ? 'Reanudar animación de fondo' : 'Pausar animación de fondo');
    if (canVideo) heroPaused ? heroVid.pause() : heroVid.play().catch(() => {});
  });
}

/* ── Mapa: no secuestra el scroll hasta que se toca/hace clic ── */
const mapWrap = $('#mapWrap');
if (mapWrap) {
  mapWrap.addEventListener('click', () => mapWrap.classList.add('active'));
  mapWrap.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') mapWrap.classList.remove('active'); });
  document.addEventListener('pointerdown', e => { if (!mapWrap.contains(e.target)) mapWrap.classList.remove('active'); });
}

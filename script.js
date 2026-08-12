// ================= JARA 99 STORE — script.js =================
let STORE_DATA = null;
let fbApp=null, fbDB=null;

function initFirebaseIfConfigured(){
  if(typeof FIREBASE_CONFIGURED === 'undefined' || !FIREBASE_CONFIGURED) return false;
  try{
    if(!firebase.apps.length){ fbApp = firebase.initializeApp(firebaseConfig); }
    else{ fbApp = firebase.app(); }
    fbDB = firebase.firestore();
    return true;
  }catch(e){
    console.error('Firebase init failed', e);
    return false;
  }
}

async function loadFromFirestore(){
  const out = {categories:[],products:[],combos:[],store:{}};
  const [catSnap, prodSnap, comboSnap, storeSnap] = await Promise.all([
    fbDB.collection('categories').get(),
    fbDB.collection('products').get(),
    fbDB.collection('combos').get(),
    fbDB.collection('store').doc('info').get()
  ]);
  catSnap.forEach(d=> out.categories.push({id:d.id, ...d.data()}));
  prodSnap.forEach(d=> out.products.push({id:d.id, ...d.data()}));
  comboSnap.forEach(d=> out.combos.push({id:d.id, ...d.data()}));
  out.store = storeSnap.exists ? storeSnap.data() : {};
  return out;
}

async function loadData(){
  const useFirebase = initFirebaseIfConfigured();
  if(useFirebase){
    try{
      const fsData = await loadFromFirestore();
      if(fsData.products.length || fsData.categories.length){
        STORE_DATA = fsData;
        renderAll();
        return;
      }
    }catch(e){
      console.error('Firestore load failed, falling back to data.json', e);
    }
  }
  try{
    const res = await fetch('data.json', {cache:'no-store'});
    STORE_DATA = await res.json();
  }catch(e){
    console.error('data.json load failed', e);
    STORE_DATA = {categories:[],products:[],combos:[],store:{}};
  }
  renderAll();
}

function waLink(number, message){
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function renderAll(){
  const s = STORE_DATA.store || {};
  const waNum = s.whatsapp || '';

  // Header / hero / footer WhatsApp buttons
  const generalMsg = `হ্যালো JARA 99 STORE! আমি আপনাদের প্রোডাক্ট সম্পর্কে জানতে চাই।`;
  ['navWaBtn','heroWaBtn','floatWaBtn'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.href = waLink(waNum, generalMsg);
  });
  const loyaltyBtn = document.getElementById('loyaltyWaBtn');
  if(loyaltyBtn) loyaltyBtn.href = waLink(waNum, 'হ্যালো JARA 99 STORE! আমি লয়ালটি কার্ড সম্পর্কে জানতে চাই।');
  const contactWa = document.getElementById('contactWaLink');
  if(contactWa) contactWa.href = waLink(waNum, generalMsg);

  // Contact info dynamic bits
  const payWrap = document.getElementById('payBadges');
  if(payWrap && s.payments){
    payWrap.innerHTML = s.payments.map(p=>`<span>${p}</span>`).join('');
  }
  const mapFrame = document.querySelector('.map-frame iframe');
  if(mapFrame && s.mapEmbed) mapFrame.src = s.mapEmbed;

  ['socialRow','socialRowFooter'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = `
      <a class="social-btn" href="${s.facebook||'#'}" target="_blank" rel="noopener" aria-label="Facebook">f</a>
      <a class="social-btn" href="${s.instagram||'#'}" target="_blank" rel="noopener" aria-label="Instagram">📷</a>
      <a class="social-btn" href="${waLink(waNum, generalMsg)}" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>
    `;
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  renderCategories();
  renderFilters();
  renderProducts('all');
  renderCombos();
  renderStamps();
  renderGallery();
}

function renderCategories(){
  const grid = document.getElementById('catGrid');
  if(!grid) return;
  grid.innerHTML = STORE_DATA.categories.map(c=>`
    <div class="cat-card" data-cat="${c.id}">
      <div class="icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
    </div>
  `).join('');
  grid.querySelectorAll('.cat-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      document.getElementById('products').scrollIntoView({behavior:'smooth'});
      setTimeout(()=>setActiveFilter(card.dataset.cat), 300);
    });
  });
}

function renderFilters(){
  const bar = document.getElementById('filterBar');
  if(!bar) return;
  const cats = STORE_DATA.categories;
  bar.innerHTML = `<button class="filter-btn active" data-cat="all">সব প্রোডাক্ট</button>` +
    cats.map(c=>`<button class="filter-btn" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join('');
  bar.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>setActiveFilter(btn.dataset.cat));
  });
}

function setActiveFilter(cat){
  document.querySelectorAll('.filter-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  renderProducts(cat);
}

function renderProducts(filterCat){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  const s = STORE_DATA.store || {};
  let items = STORE_DATA.products;
  if(filterCat && filterCat !== 'all') items = items.filter(p=>p.category === filterCat);

  if(items.length === 0){
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#6b7280;">এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>`;
    return;
  }

  grid.innerHTML = items.map(p=>`
    <div class="product-card">
      <div class="thumb">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.showPrice !== false ? `<div class="price-tag">₹${p.price}${p.oldPrice ? `<del>₹${p.oldPrice}</del>`:''}</div>` : ''}
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.desc || ''}</p>
        <a href="${waLink(s.whatsapp, `হ্যালো JARA 99 STORE! আমি "${p.name}" প্রোডাক্টটি সম্পর্কে জানতে চাই / অর্ডার করতে চাই।`)}"
           class="btn btn-wa" target="_blank" rel="noopener">💬 WhatsApp Order</a>
      </div>
    </div>
  `).join('');
}

function renderCombos(){
  const grid = document.getElementById('comboGrid');
  if(!grid) return;
  const s = STORE_DATA.store || {};
  grid.innerHTML = STORE_DATA.combos.map(c=>`
    <div class="combo-card">
      <div class="icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <p>${c.items}</p>
      <div class="combo-price">₹${c.price} <span>/ combo</span></div>
      <a href="${waLink(s.whatsapp, `হ্যালো JARA 99 STORE! আমি "${c.name}" (₹${c.price}) কম্বো অফারটি সম্পর্কে জানতে চাই।`)}"
         class="btn btn-gold btn-sm" target="_blank" rel="noopener">💬 Order Combo</a>
    </div>
  `).join('');
}

function renderStamps(){
  const row = document.getElementById('stampRow');
  if(!row) return;
  let html = '';
  for(let i=1;i<=10;i++){
    html += `<div class="stamp">${i}</div>`;
  }
  row.innerHTML = html;
}

function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  if(!grid) return;
  const images = [
    {src:'assets/store-front.jpg', big:true},
    {src:'assets/store-interior.jpg'},
    {src:'assets/loyalty-card.jpg'},
    {src:'assets/promo-categories.jpg'},
    {src:'assets/promo-trending.jpg'},
    {src:'assets/banner-shop.jpg'},
    {src:'assets/promo-area.jpg'},
  ];
  grid.innerHTML = images.map(img=>`<img src="${img.src}" class="${img.big?'span-2':''}" alt="JARA 99 STORE Gallery" loading="lazy">`).join('');
}

// ===== Nav toggle =====
document.addEventListener('DOMContentLoaded', ()=>{
  loadData();

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', ()=> navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> navLinks.classList.remove('open'));
  });

  // Modal (kept for future use, e.g. "Quick Order" trigger)
  const modal = document.getElementById('orderModal');
  const modalClose = document.getElementById('modalClose');
  if(modalClose) modalClose.addEventListener('click', ()=> modal.classList.remove('open'));
  if(modal) modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('open'); });
});

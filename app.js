// Demo listings use real venues, fictional hosts and illustrative photos. Prices are estimates.
const foodPhoto = id => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=640&q=80';
const samplePlans = [
  { id: 'cheesecake-pasta', host: 'Michelle', posted: '12 min ago', name: 'Pasta + cheesecake. Who’s in?', shop: 'The Cheesecake Factory · Harbour City', area: 'Tsim Sha Tsui', location: 'Outside The Cheesecake Factory, G102 Harbour City', day: 'Today', time: '19:00', portion: 'Half the pasta + half a slice', price: 150, currency: 'HKD', category: 'Restaurant', total: 'Around $300 for two, confirm with menu', note: 'Been craving pasta and a slice all week, but I never finish both on my own. Anyone around TST after work? Let’s order together and split the bill.', image: foodPhoto('photo-1473093295043-cdd812d0e601'), imageAlt: 'Illustrative photo of a pasta dish' },
  { id: 'costco-croissants', host: 'Jason', posted: '25 min ago', name: 'Costco croissants — half the box?', shop: 'Costco · Shenzhen Longhua', area: 'Shenzhen · Longhua', location: 'Costco Shenzhen, 68 Minda Road, warehouse entrance', day: 'This weekend', time: '11:00', portion: 'Half a box of croissants', price: 30, currency: 'CNY', category: 'Groceries', total: 'Around $60 per box; check pack and price in store', note: 'Heading to Longhua this weekend. Love their croissants, just don’t have the freezer space for a whole box. Meet at the warehouse and split a fresh pack? I have a membership; please check your own entry eligibility.', image: foodPhoto('photo-1555507036-ab1f4038808a'), imageAlt: 'Illustrative photo of croissants and pastries' },
  { id: 'pizza-express', host: 'Anson', posted: '38 min ago', name: 'Pizza after class? Just need one more', shop: 'PizzaExpress · Hang Hau', area: 'Hang Hau', location: 'PizzaExpress entrance, Hang Hau; confirm exact meeting point', day: 'Today', time: '18:30', portion: 'Half a pizza', price: 95, currency: 'HKD', category: 'Restaurant', total: 'Around $190, confirm final bill before ordering', note: 'Finishing class at 6 and fancy pizza. Looking for one person to share a pizza and a proper chat. Happy to agree toppings before we go.', image: foodPhoto('photo-1513104890138-7c749659a591'), imageAlt: 'Illustrative photo of pizza' },
  { id: 'costco-blueberries', host: 'Chloe', posted: '47 min ago', name: 'Blueberries for two small fridges', shop: 'Costco · Shenzhen Longhua', area: 'Shenzhen · Longhua', location: 'Costco Shenzhen, warehouse entrance on Minda Road', day: 'Tomorrow', time: '14:00', portion: 'Half a large punnet', price: 40, currency: 'CNY', category: 'Groceries', total: 'Around $80; confirm weight and shelf price in store', note: 'Doing a grocery run tomorrow. Anyone want to split blueberries? We’ll choose the pack together before buying. Bring a clean container. Meet in Shenzhen, no delivery.', image: foodPhoto('photo-1498557850523-fd3d118b962e'), imageAlt: 'Illustrative photo of fresh blueberries' },
  { id: 'bakehouse', host: 'Nat', posted: '1 hr ago', name: 'One pastry each, coffee together?', shop: 'Bakehouse · Wan Chai', area: 'Wan Chai', location: 'Outside Bakehouse, 14 Tai Wong Street East', day: 'Tomorrow', time: '15:30', portion: 'One pastry each from our order', price: 35, currency: 'HKD', category: 'Restaurant', total: 'Around $70 for two pastries; drinks separate', note: 'Free for a late afternoon break. Would love to try two pastries and split them so we each get a taste. We can find a public spot nearby if it’s busy.', image: foodPhoto('photo-1509365465985-25d11c17e812'), imageAlt: 'Illustrative photo of bakery pastries' },
  { id: 'citysuper-fruit', host: 'Adrian', posted: '2 hrs ago', name: 'A big box of strawberries is too much', shop: 'city’super · Harbour City', area: 'Tsim Sha Tsui', location: 'Outside city’super, Harbour City', day: 'Tomorrow', time: '17:30', portion: 'Half a box of strawberries', price: 60, currency: 'HKD', category: 'Groceries', total: 'Around $120; choose and confirm price together', note: 'Passing through Harbour City after work. Want to split a box of strawberries instead of watching half go soft in my fridge? Bring a container and we’ll divide them at pickup.', image: foodPhoto('photo-1464965911861-746a04b4bca6'), imageAlt: 'Illustrative photo of strawberries' }
];
const mapAreas = ['Tsim Sha Tsui', 'Shenzhen · Longhua', 'Hang Hau', 'Wan Chai', 'HKUST', 'Tseung Kwan O', 'Central', 'Mong Kok'].map(name => ({name}));
const state = { posted: [], bookings: new Map(), refunded: new Set(), saved: new Set(), query: '', day: '', area: '', category: '', savedOnly: false };
try {
  const stored = JSON.parse(localStorage.getItem('split-meet-market-v1') || 'null');
  if (stored) {
    state.posted = (Array.isArray(stored.posted) ? stored.posted : []).filter(p => typeof p.id === 'string' && p.id.startsWith('posted-') && typeof p.name === 'string' && Number.isFinite(p.price));
    state.bookings = new Map(Array.isArray(stored.bookings) ? stored.bookings : []);
    state.refunded = new Set(Array.isArray(stored.refunded) ? stored.refunded : []);
    state.saved = new Set(Array.isArray(stored.saved) ? stored.saved : []);
  }
} catch { /* The demo also works when browser storage is unavailable. */ }
const persist = () => {
  try { localStorage.setItem('split-meet-market-v1', JSON.stringify({posted: state.posted, bookings: [...state.bookings], refunded: [...state.refunded], saved: [...state.saved]})); } catch { /* Storage is optional. */ }
};
const hiddenPlans = new Set();
const main = document.querySelector('main');
const screenScroll = document.querySelector('.screen-scroll');
const html = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const money = (value) => '$' + Number(value).toLocaleString('en-HK', { maximumFractionDigits: 2 });
const ATTENDANCE_DEPOSIT = 20;
const tenPercent = (foodPrice) => Math.round(Math.round(foodPrice * 100) / 10) / 100;
const cost = (plan, value = plan.price) => money(value);
const allPlans = () => [...state.posted, ...samplePlans];
const meeting = (plan) => plan.day + ' · ' + plan.time;
const button = (label, target) => '<a class="button" href="#' + target + '">' + label + '</a>';
const back = (route, label) => '<a class="back" href="#' + route + '">← ' + label + '</a>';

function summary(rows) {
  return '<dl class="summary">' + rows.map(([label, value]) =>
    '<div><dt>' + html(label) + '</dt><dd>' + html(value) + '</dd></div>').join('') + '</dl>';
}

function host(plan) {
  return `<div class="host"><span class="avatar" aria-hidden="true">${html((plan.host || 'You').slice(0, 1))}</span><span><strong>${html(plan.host || 'You')}</strong><small>${html(plan.posted || 'Just posted')} · ${html(plan.area)}</small></span></div>`;
}
function photo(plan, cls = '') {
  return plan.image ? `<img class="food-image ${cls}" src="${html(plan.image)}" alt="${html(plan.imageAlt || plan.name)}" loading="lazy" referrerpolicy="no-referrer">` : `<div class="food-image photo-placeholder ${cls}"><span>${plan.category === 'Groceries' ? '◒' : '◉'}</span><small>No photo added</small></div>`;
}
function card(plan) {
  const own = plan.id.startsWith('posted-');
  const saved = state.saved.has(plan.id);
  return `<article class="market-card">
    <div class="photo-wrap"><a class="photo-link" href="#detail/${html(plan.id)}" aria-label="View ${html(plan.name)}">${photo(plan)}</a><span class="photo-tag">${html(plan.category || 'Groceries')}</span><button class="save-button" type="button" data-save="${html(plan.id)}" aria-label="${saved ? 'Unsave' : 'Save'} ${html(plan.name)}" aria-pressed="${saved}">${saved ? '♥' : '♡'}</button></div>
    <div class="market-body">${host(plan)}<a class="listing-title" href="#detail/${html(plan.id)}">${html(plan.name)}</a>
    <p class="caption">${html(plan.note)}</p><p class="shop">${html(plan.shop || plan.location)}</p>
    <div class="price-row"><strong>${cost(plan)}</strong><span>/ your share</span></div>
    <p class="portion">${html(plan.portion)}</p><div class="listing-bottom"><span>${html(meeting(plan))}</span><span>${own ? 'Your post' : '1 spot'}</span></div></div>
  </article>`;
}
function updateListings() {
  const term = state.query.trim().toLowerCase();
  const results = allPlans().filter(plan => {
    const haystack = [plan.name, plan.host, plan.area, plan.shop, plan.location, plan.category, plan.note].join(' ').toLowerCase();
    return !hiddenPlans.has(plan.id) && haystack.includes(term) && (!state.day || state.day === plan.day) && (!state.area || state.area === plan.area) && (!state.category || state.category === plan.category) && (!state.savedOnly || state.saved.has(plan.id)) && !state.bookings.has(plan.id);
  });
  document.querySelector('#listing-count').textContent = results.length + (results.length === 1 ? ' plan' : ' plans');
  document.querySelector('#listing-grid').innerHTML = results.map(card).join('') || '<div class="empty-state"><h3>No plans here yet</h3><p>Try another district, day or food. You can also start a plan yourself.</p><button class="text-button" id="clear-filters" type="button">Clear filters</button><a class="button" href="#post">Post a plan</a></div>';
  document.querySelector('#clear-filters')?.addEventListener('click', () => { state.query = ''; state.day = ''; state.area = ''; state.category = ''; state.savedOnly = false; explore(); });
}
function explore() {
  main.innerHTML = `<section class="market-hero"><div class="hero-heading"><div><span class="eyebrow">Hong Kong + Shenzhen</span><h1>Find your other half.</h1></div><a class="post-round" href="#post" aria-label="Post a food plan">＋</a></div><p>Someone nearby wants the other half.</p>
  <input id="query" type="search" aria-label="Search food, shops or people" placeholder="Search food, shops or people" value="${html(state.query)}">
  <div class="market-filters"><select id="area" aria-label="Filter by district"><option value="">All districts</option>${mapAreas.map(a => `<option>${html(a.name)}</option>`).join('')}</select><select id="day" aria-label="Filter by day"><option value="">Any day</option><option>Today</option><option>Tomorrow</option><option>This weekend</option></select></div>
  <div class="category-tabs" role="group" aria-label="Type of food plan">${[['', 'All plans'], ['Restaurant', 'Eat together'], ['Groceries', 'Split groceries']].map(([v, label]) => `<button type="button" data-category="${v}" aria-pressed="${state.category === v}">${label}</button>`).join('')}</div></section>
  <section class="market-browse" aria-labelledby="nearby"><div class="section-row"><div><h2 id="nearby">${state.savedOnly ? 'Saved plans' : 'Around the neighbourhood'}</h2><span id="listing-count" class="muted" aria-live="polite"></span></div><button class="saved-toggle" type="button" id="saved-filter" aria-pressed="${state.savedOnly}">♡ Saved</button></div><p class="demo-note">Example posts · illustrative photos · estimated prices</p><div class="market-grid" id="listing-grid"></div><div class="end-feed"><h3>Got something in mind?</h3><p>Post the food. Find your other half.</p><a class="button" href="#post">Start a food plan</a></div></section>`;
  document.querySelector('#area').value = state.area;
  document.querySelector('#day').value = state.day;
  document.querySelector('#query').addEventListener('input', e => { state.query = e.target.value; updateListings(); });
  for (const key of ['day', 'area']) document.querySelector('#' + key).addEventListener('change', e => { state[key] = e.target.value; updateListings(); });
  document.querySelector('.category-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-category]'); if (!tab) return;
    state.category = tab.dataset.category;
    document.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', b.dataset.category === state.category)); updateListings();
  });
  document.querySelector('#saved-filter').addEventListener('click', () => { state.savedOnly = !state.savedOnly; explore(); });
  updateListings();
}

function panel(content) {
  main.innerHTML = '<section class="panel">' + content + '</section>';
}

function detail(plan) {
  const own = plan.id.startsWith('posted-');
  const stage = state.bookings.get(plan.id);
  panel(`${back('explore', 'Explore')}<div class="detail-photo">${photo(plan)}</div><p class="eyebrow">${own ? 'Your listing' : html(plan.category) + ' · 1 spot available'}</p><h1>${html(plan.name)}</h1>${host(plan)}<p class="host-caption">${html(plan.note)}</p><div class="agreement-heading"><h2>The plan</h2><span class="tag">Buy after confirming</span></div>
    ${summary([['Shop / restaurant', plan.shop || plan.location], ['Full order estimate', plan.total], ['Your share estimate', plan.portion + ' · ' + cost(plan)], ['Meet at', plan.location], ['When', meeting(plan)]])}
    ${plan.currency === 'CNY' ? '<p class="small-note">Shenzhen plan · all amounts on this plan are in CNY. Meet at the store; no cross-border delivery. Store membership and entry rules apply.</p>' : '<p class="small-note">Amounts are in HKD and food prices are estimates. Agree the final bill, including service charges, before ordering. Restaurant seating is subject to availability.</p>'}
    <details class="plan-details"><summary>How sharing works</summary><p>Agree your portions before purchase. Meet at the public location above, buy together, and divide the food using clean containers or serving utensils. Confirm ingredients and allergens with the shop. Use the report option if a plan feels wrong.</p></details>
    <details class="plan-details"><summary>Report this listing</summary><p>This is a prototype. For this demo, you can hide the example from your feed.</p><button class="text-button" id="hide-plan" type="button">Hide this listing</button></details>
    <div class="actions">${own ? button('Back to My plans', 'plans') : stage ? button('View in My plans', 'plans') : button('Review split & deposit →', 'confirm/' + plan.id)}</div><p class="demo-note">${own ? 'Your post is saved on this browser.' : 'Demo host and listing · no real reservation or payment.'}</p>`);
  document.querySelector('#hide-plan')?.addEventListener('click', () => { hiddenPlans.add(plan.id); location.hash = '#explore'; });
}

function confirm(plan) {
  panel(`${back('detail/' + plan.id, 'Plan details')}<p class="eyebrow">Pre-purchase agreement</p>
    <h1>Confirm your plan</h1><p class="muted">Review the proposed split and meetup before confirming. This prototype simulates the host accepting; it does not contact a real person.</p>
    ${summary([['Plan', plan.name], ['Your share', plan.portion + ' · ' + cost(plan)], ['Meetup', plan.location + ' · ' + meeting(plan)], ['Attendance deposit', cost(plan, ATTENDANCE_DEPOSIT)]])}
    <p class="muted">The demo simulates both participants’ deposits. After check-in, only the platform fee (10% of the food price) is refundable. Pay the merchant separately after you receive your share.</p>
    <div class="actions"><button class="button" id="confirm-plan" type="button">Confirm plan · simulate deposit</button></div>`);
  document.querySelector('#confirm-plan').addEventListener('click', () => {
    state.bookings.set(plan.id, 'check-in'); persist();
    location.hash = '#plans';
  });
}

function checkIn(plan) {
  panel(`${back('plans', 'My plans')}<p class="eyebrow">Confirmed meetup</p>
    <h1>Collect your share</h1><p class="muted">Check in once you’ve received your food. Pay the merchant separately at pickup.</p>
    ${summary([['Plan', plan.name], ['Meetup', plan.location + ' · ' + meeting(plan)], ['Your portion', plan.portion], ['Other participant', 'Checked in (simulated)']])}
    <div class="actions"><button class="button" id="check-in" type="button">Check in and confirm receipt</button></div>`);
  document.querySelector('#check-in').addEventListener('click', () => {
    state.bookings.set(plan.id, 'pay'); persist();
    location.hash = '#pay/' + plan.id;
  });
}

function pay(plan) {
  const fee = tenPercent(plan.price);
  panel(`${back('plans', 'My plans')}<p class="eyebrow">Food received</p>
    <h1>Review your deposit</h1>
    ${summary([['Deposit', cost(plan, ATTENDANCE_DEPOSIT)], ['Platform Fee (10%, refundable)', cost(plan, fee)], ['Amount to Receive', cost(plan, fee)]])}
    <div class="actions"><button class="button" id="review-deposit" type="button">View share receipt</button></div>`);
  document.querySelector('#review-deposit').addEventListener('click', () => {
    state.bookings.set(plan.id, 'complete'); persist();
    location.hash = '#complete/' + plan.id;
  });
}

function complete(plan) {
  const refunded = state.refunded.has(plan.id);
  panel(`${back('plans', 'My plans')}<p class="eyebrow">Completed share</p>
    <h1>Share receipt</h1><p>You received your share of <strong>${html(plan.name)}</strong> and both participants checked in.</p>
    ${summary([['Food payment to merchant', cost(plan)], ['Platform Fee (10%, refundable)', cost(plan, tenPercent(plan.price))]])}
    <p class="muted">This receipt uses simulated payments.</p>
    <div class="actions">${refunded ? button('Back to My plans', 'plans')
      : '<button class="button" id="return-deposit" type="button">Return Deposit and Go Back</button>'}</div>`);
  document.querySelector('#return-deposit')?.addEventListener('click', () => {
    state.refunded.add(plan.id); persist();
    location.hash = '#plans';
  });
}

function myPlans() {
  const booked = [...state.bookings].map(([id, stage]) => {
    const plan = allPlans().find((item) => item.id === id);
    const status = { 'check-in': 'Deposit confirmed', pay: 'Food received · Deposit ready to review', complete: 'Completed' };
    const action = { 'check-in': 'Open meetup', pay: 'Review your deposit', complete: 'View receipt' };
    return `<article class="card"><span class="tag">${status[stage]}</span>
      <h3>${html(plan.name)}</h3><p class="muted">${html(plan.area)} · ${html(meeting(plan))}</p>
      ${state.refunded.has(id) ? `<p class="muted">Deposit refund: ${cost(plan, tenPercent(plan.price))} returned (simulated)</p>` : ''}
      <a href="#${stage}/${id}">${action[stage]} →</a></article>`;
  });
  panel(`<h1>My plans</h1><p class="muted">Your upcoming meetups, completed shares and posts. Saved on this browser.</p>
    <div class="plan-list">${[...booked, ...state.posted.map(card)].join('') ||
      '<p>You have no plans yet. Browse a listing to request a share or post your own plan.</p>'}</div>
    <div class="actions">${button('Explore nearby plans', 'explore')}<a class="button secondary" href="#post">Post a plan</a></div>`);
}

function post() {
  panel(`${back('explore', 'Explore')}<p class="eyebrow">Your food, your plan</p><h1>Find your other half.</h1><p class="muted">Say what you want to split and where you want to meet. Buy only after both people confirm.</p>
  <form id="post-form" class="form-grid">
    <label>Your first name<input name="host" required maxlength="25" placeholder="e.g. Michelle"></label>
    <label>Plan type<select name="category"><option>Restaurant</option><option>Groceries</option></select></label>
    <label>Give your plan a title<input name="name" required maxlength="70" placeholder="Anyone up for pasta at Cheesecake Factory?"></label>
    <label>Restaurant or shop<input name="shop" required maxlength="80" placeholder="The Cheesecake Factory, Harbour City"></label>
    <label>Food photo (optional)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG or WebP, up to 2 MB.</small></label><p id="post-error" role="alert" class="small-note"></p>
    <label>Your caption<textarea name="note" required maxlength="450" rows="4" placeholder="What are you craving? How will you split it? Tell people a little about the plan."></textarea></label>
    <label>Portion offered<input name="portion" required maxlength="45" placeholder="Half a pasta and half a slice"></label>
    <label>Estimated price per person<input name="price" required type="number" min="1" max="1000" step="0.01" placeholder="120"></label>
    <label>District<select name="area">${mapAreas.map(a => `<option>${html(a.name)}</option>`).join('')}</select></label>
    <label>Currency<select name="currency"><option value="HKD">HKD · Hong Kong dollar</option><option value="CNY">CNY · Chinese yuan</option></select></label>
    <label>Public meeting point<input name="location" required maxlength="100" placeholder="Outside the restaurant entrance"></label>
    <label>Day<select name="day"><option>Today</option><option>Tomorrow</option><option>This weekend</option></select></label>
    <label>Time<input name="time" required type="time"></label>
    <p class="small-note">Prototype listings stay on this browser. Payments and host responses are simulated.</p>
    <button class="button" type="submit">Publish my plan</button>
  </form>`);
  document.querySelector('#post-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const file = data.photo; delete data.photo;
    let image = '';
    if (file && file.size) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { document.querySelector('#post-error').textContent = 'Choose a JPG, PNG or WebP smaller than 2 MB.'; return; }
      try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
        image = canvas.toDataURL('image/jpeg', .75);
      } catch { document.querySelector('#post-error').textContent = 'This photo could not be opened. Choose another photo.'; return; }
    }
    if (['host', 'name', 'shop', 'note', 'portion', 'location'].some(k => !data[k].trim())) { document.querySelector('#post-error').textContent = 'Please fill in each field with more than spaces.'; return; }
    if ((data.area === 'Shenzhen · Longhua') !== (data.currency === 'CNY')) { document.querySelector('[name="currency"]').setCustomValidity('Use CNY for the Shenzhen district and HKD for Hong Kong districts.'); document.querySelector('[name="currency"]').reportValidity(); return; }
    state.posted.unshift({ ...data, image, id: 'posted-' + Date.now().toString(36), host: data.host.trim(), name: data.name.trim(), shop: data.shop.trim(), note: data.note.trim(), portion: data.portion.trim(), location: data.location.trim(), price: Number(data.price), tag: 'Your listing', posted: 'Just posted', total: 'Agree the full order together' });
    persist(); location.hash = '#explore';
  });
  document.querySelector('[name="currency"]').addEventListener('change', e => e.target.setCustomValidity(''));
  document.querySelector('[name="area"]').addEventListener('change', e => { const currency = document.querySelector('[name="currency"]'); currency.value = e.target.value === 'Shenzhen · Longhua' ? 'CNY' : 'HKD'; currency.setCustomValidity(''); });
}

function render() {
  const [route, id] = location.hash.slice(1).split('/');
  const plan = allPlans().find((item) => item.id === id);
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const activeTab = route === 'post' ? 'post' : ['plans', 'complete', 'check-in', 'pay'].includes(route) ? 'plans' : 'explore';
    if (link.dataset.nav === activeTab) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const stage = state.bookings.get(id);
  if (route === 'post') post();
  else if (route === 'plans') myPlans();
  else if (route === 'detail' && plan) detail(plan);
  else if (route === 'confirm' && plan && !id.startsWith('posted-') && !stage) confirm(plan);
  else if (route === 'check-in' && plan && stage === 'check-in') checkIn(plan);
  else if (route === 'pay' && plan && stage === 'pay') pay(plan);
  else if (route === 'complete' && plan && stage === 'complete') complete(plan);
  else if (plan) detail(plan);
  else explore();
  screenScroll.scrollTop = 0;
}

document.querySelector('.skip').addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
});

window.addEventListener('hashchange', () => {
  render();
  main.focus({ preventScroll: true });
});

document.querySelector('#reset').addEventListener('click', () => {
  state.bookings.clear();
  state.refunded.clear();
  state.posted = [];
  state.query = '';
  state.day = '';
  state.area = ''; state.category = ''; state.savedOnly = false; state.saved.clear(); hiddenPlans.clear(); persist();
  if (location.hash === '#explore') render();
  else location.hash = '#explore';
});

main.addEventListener('error', event => { if (event.target.matches('img.food-image')) { const fallback = document.createElement('div'); fallback.className = 'food-image photo-placeholder'; fallback.textContent = 'Food photo unavailable'; event.target.replaceWith(fallback); } }, true);
main.addEventListener('click', event => {
  const save = event.target.closest('[data-save]'); if (!save) return;
  const id = save.dataset.save;
  if (state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
  persist(); updateListings();
  document.querySelectorAll('[data-save]').forEach(b => { if (b.dataset.save === id) b.focus({preventScroll:true}); });
});
/* Self-contained marketplace presentation so this update only needs app.js. */
const marketStyles = document.createElement('style');
marketStyles.textContent = `
:root{--paper:#f7f8f5;--green:#214a3c}
main{padding:0 13px 24px} .site-header{background:#fffefa;color:var(--ink);border-bottom:1px solid var(--line)} .demo-label{color:var(--muted);border-color:var(--line)}
.site-header::before{background:#dce2d8} .topbar{min-height:61px} .wordmark{font-family:'Avenir Next','Segoe UI',sans-serif;font-size:19px;letter-spacing:-.7px} .mark{background:#d9e9d8}
.market-hero{padding:16px 2px 10px}.hero-heading{display:flex;justify-content:space-between;align-items:center}.hero-heading h1{font-size:29px;line-height:1.08;letter-spacing:-1.3px;margin-top:8px;font-weight:550}.hero-heading .eyebrow{letter-spacing:1.5px;font-size:9px}.market-hero>p{font-size:13px;margin:8px 0 12px;color:var(--muted)}.post-round{width:43px;height:43px;display:grid;place-items:center;border-radius:50%;background:#214a3c;color:white;text-decoration:none;font-size:27px}
#query{width:100%;border-radius:12px;background:white;padding:12px 13px;font-size:14px;border-color:#d6dfd5;box-shadow:0 2px 6px #173c2410}.market-filters{display:flex;gap:8px;margin-top:8px}.market-filters select{flex:1;min-width:0;border-radius:9px;border-color:#d6dfd5;font-size:12px;padding:8px;background:transparent}.category-tabs{display:flex;gap:6px;margin-top:14px}.category-tabs button{border:1px solid #d7dfd5;background:white;border-radius:30px;padding:9px 10px;font-size:11px;min-height:39px;font-weight:650;white-space:nowrap;color:#314b40}.category-tabs button[aria-pressed=true]{background:#214a3c;color:white;border-color:#214a3c}
.market-browse>.section-row{margin-top:7px;align-items:center}.market-browse h2{font-family:'Avenir Next','Segoe UI',sans-serif;font-size:16px;letter-spacing:-.5px;font-weight:750}#listing-count{display:block;margin-top:4px;font-size:11px}.saved-toggle{border:1px solid #d7dfd5;background:transparent;min-height:38px;padding:5px 10px;border-radius:25px;font-size:11px;color:#214a3c}.saved-toggle[aria-pressed=true]{background:#d9e9d8}.demo-note{font-size:10px!important;line-height:1.45;color:#66726b;margin:10px 0!important}
.market-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 10px}.market-card{border:1px solid #dde3d9;border-radius:13px;background:white;overflow:hidden;min-width:0}.photo-wrap{position:relative;background:#e6eadd}.photo-link{display:block}.food-image{width:100%;aspect-ratio:1.18;object-fit:cover;display:block;background:#e6eadd}.photo-tag{position:absolute;left:7px;top:8px;background:#fffefaed;color:#214a3c;font-size:9px;font-weight:750;padding:5px 7px;border-radius:30px;pointer-events:none}.save-button{position:absolute;right:6px;bottom:6px;background:#fffefaf2;color:#214a3c;border:0;border-radius:50%;width:36px;height:36px;font-size:23px;display:grid;place-items:center;box-shadow:0 1px 7px #12273218}.save-button[aria-pressed=true]{color:#a54431}
.market-body{padding:10px 9px 0}.host{display:flex;gap:6px;align-items:center;min-width:0;margin-bottom:9px}.avatar{width:26px;height:26px;flex-shrink:0;display:grid;place-items:center;font-family:Georgia,serif;background:#e6ecdf;color:#214a3c;border-radius:50%;font-size:14px}.host strong{display:block;font-size:10px;line-height:1.3}.host small{display:block;font-size:9px;line-height:1.4;color:#6b756d}.listing-title{font-family:'Avenir Next','Segoe UI',sans-serif;font-size:13px;font-weight:750;line-height:1.4;display:block;text-decoration:none;min-height:36px;letter-spacing:-.2px}.listing-title:hover{text-decoration:underline}.caption{font-size:11px;line-height:1.55;color:#536258;margin:7px 0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:51px}.shop{font-size:10px;line-height:1.45;color:#385442;margin:8px 0;min-height:28px}.price-row{display:flex;gap:4px;flex-wrap:wrap;align-items:baseline}.price-row strong{font-size:17px;letter-spacing:-.5px}.price-row span{font-size:9px;color:#66726b}.portion{font-size:10px;line-height:1.4;margin:4px 0 9px;color:#536258;min-height:28px}.listing-bottom{border-top:1px solid #edf0e9;padding:9px 0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:3px;font-size:9px;color:#4e625e}.listing-bottom span:last-child{color:#214a3c;font-weight:750}.end-feed{text-align:center;padding:27px 5px 12px}.end-feed h3{font-size:22px}.end-feed p{font-size:12px;color:var(--muted);margin:7px 0 15px}
.panel{margin-top:16px}.panel h1{font-size:30px;line-height:1.15;margin-bottom:15px}.detail-photo{margin:8px 0 18px;border-radius:12px;overflow:hidden}.detail-photo .food-image{aspect-ratio:1.7}.panel .host{margin:14px 0}.panel .host strong{font-size:13px}.panel .host small{font-size:11px}.panel .avatar{width:35px;height:35px;font-size:19px}.host-caption{color:#364f42;line-height:1.7}.agreement-heading{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:23px}.agreement-heading h2{font-size:23px}.small-note{font-size:12px!important;color:#536258;line-height:1.6}.plan-details{border-bottom:1px solid var(--line);font-size:13px;padding:13px 0}.plan-details summary{cursor:pointer;font-weight:650}.plan-details p{font-size:12px}.form-grid textarea{font:inherit;border:1px solid #bac9bd;border-radius:8px;padding:10px;resize:vertical;width:100%;min-height:105px;color:var(--ink);background:var(--white)}.photo-placeholder{display:grid;place-content:center;text-align:center;gap:8px;color:#617355;background:linear-gradient(145deg,#dce8d6,#f4eddd)}.photo-placeholder span{font-size:40px}.photo-placeholder small{font-size:11px}.empty-state{grid-column:1/-1;background:#eaf0e5;border-radius:14px;padding:22px;display:grid;gap:10px}.empty-state p{font-size:13px}.empty-state h3{font-size:22px}.empty-state .text-button{justify-self:start}
@media(max-width:350px){.market-grid{gap:8px}.market-body{padding:8px 7px 0}.category-tabs{gap:4px}.category-tabs button{font-size:10px;padding:8px}.hero-heading h1{font-size:30px}}
`;
document.head.appendChild(marketStyles);

render();

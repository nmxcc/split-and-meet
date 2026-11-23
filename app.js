const samplePlans = [
  { id: 'dim-sum', name: 'Dim sum for two', area: 'Hang Hau', location: 'Restaurant entrance, Hang Hau', day: 'Today', time: '12:30', portion: '3 of 6 pieces', price: 36, tag: 'Lunch', total: 'HK$72 for 6 pieces', note: 'The host plans to order a six-piece dim sum set. Meet at the restaurant entrance and share the order after you both agree.' },
  { id: 'pineapple-buns', name: 'Pineapple bun box', area: 'HKUST', location: 'HKUST campus concourse', day: 'Today', time: '15:00', portion: '2 of 4 buns', price: 18, tag: 'Snack', total: 'HK$36 for 4 buns', note: 'Split a box of four freshly baked pineapple buns.' },
  { id: 'fruit-box', name: 'Seasonal fruit box', area: 'Tseung Kwan O', location: 'Tseung Kwan O MTR Exit A', day: 'Tomorrow', time: '16:30', portion: 'Half a box', price: 24, tag: 'Groceries', total: 'HK$48 for one box', note: 'Share a fruit box and pick it up together.' }
];

const mapAreas = [
  { name: 'HKUST', x: 72, y: 24 },
  { name: 'Hang Hau', x: 53, y: 53 },
  { name: 'Tseung Kwan O', x: 28, y: 81 }
];
const state = { posted: [], bookings: new Map(), query: '', day: '', mapArea: '' };
const main = document.querySelector('main');
const screenScroll = document.querySelector('.screen-scroll');
const html = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const money = (value) => 'HK$' + Number(value).toLocaleString('en-HK', { maximumFractionDigits: 2 });
const allPlans = () => [...state.posted, ...samplePlans];
const meeting = (plan) => plan.day + ' · ' + plan.time;
const button = (label, target) => '<a class="button" href="#' + target + '">' + label + '</a>';
const back = (route, label) => '<a class="back" href="#' + route + '">← ' + label + '</a>';

function summary(rows) {
  return '<dl class="summary">' + rows.map(([label, value]) =>
    '<div><dt>' + html(label) + '</dt><dd>' + html(value) + '</dd></div>').join('') + '</dl>';
}

function card(plan) {
  const own = plan.id.startsWith('posted-');
  return `<article class="card">
    <span class="tag">${html(plan.tag)}</span>
    <h3>${html(plan.name)}</h3>
    <p class="muted">${html(plan.area)} · ${html(meeting(plan))}</p>
    <div class="card-meta"><span>${html(plan.portion)}</span><strong>${money(plan.price)}</strong></div>
    <a href="#detail/${plan.id}" aria-label="View plan for ${html(plan.name)}">${own ? 'View your listing' : 'View plan'} →</a>
  </article>`;
}

function drawMap() {
  const canvas = document.querySelector('#map-art');
  const ctx = canvas.getContext('2d');
  const path = (points, fill, stroke, width) => {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  };
  ctx.scale(2, 2);
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.fillStyle = '#b7d8dd';
  ctx.fillRect(0, 0, 360, 240);
  path([[0,0],[310,0],[318,18],[296,42],[284,65],[268,80],[295,98],[279,132],[253,155],[211,170],[164,191],[141,219],[132,240],[0,240]], '#e9eee0');
  path([[0,0],[192,0],[163,37],[102,63],[86,100],[32,109],[0,86]], '#d1e2ca');
  path([[360,163],[330,172],[305,193],[313,214],[276,240],[360,240]], '#d1e2ca');
  const roads = [
    [[-8,172],[55,166],[110,146],[165,128],[198,110],[213,79],[254,58],[282,17]],
    [[57,240],[80,216],[88,190],[92,165],[71,131],[51,118],[0,111]],
    [[138,228],[124,203],[141,163],[162,140],[180,102],[168,79],[155,58],[189,24],[200,0]],
    [[13,222],[48,198],[82,199],[111,204],[141,196],[163,174],[200,154],[255,145]],
    [[0,146],[52,147],[75,118],[105,99],[153,96],[168,79]]
  ];
  roads.forEach((road) => path(road, null, '#c5d3c5', 8));
  roads.forEach((road) => path(road, null, '#fffefa', 5));
}

function updateListings() {
  const term = state.query.trim().toLowerCase();
  const results = allPlans().filter((plan) => {
    const haystack = [plan.name, plan.area, plan.location, plan.tag].join(' ').toLowerCase();
    return haystack.includes(term) && (!state.day || state.day === plan.day) && !state.bookings.has(plan.id);
  });
  document.querySelector('#listing-count').textContent = results.length + (results.length === 1 ? ' plan' : ' plans');
  document.querySelector('#listing-grid').innerHTML = results.map(card).join('') ||
    '<p class="muted">No plans match. Try another search or select any day.</p>';
  const groups = mapAreas.map((area) => ({
    ...area, plans: results.filter((plan) => plan.area === area.name)
  }));
  const selected = groups.find((area) => area.name === state.mapArea && area.plans.length);
  state.mapArea = selected?.name ?? '';
  document.querySelector('#map-pins').innerHTML = groups.filter((area) => area.plans.length).map((area) => `
    <button type="button" class="map-pin" data-area="${area.name}" style="--x:${area.x}%;--y:${area.y}%"
      aria-pressed="${area === selected}" aria-controls="map-results">
      <b>${area.plans.length}</b> ${area.name}
    </button>`).join('');
  document.querySelector('#map-results').innerHTML = selected
    ? `<h2>${selected.name}</h2>` + selected.plans.map((plan) => `
      <a class="map-plan" href="#detail/${plan.id}">
        <span><strong>${html(plan.name)}</strong><small>${html(meeting(plan))}</small></span>
        <b>${money(plan.price)}</b>
      </a>`).join('')
    : `<p>${results.length ? 'Tap a pin to see what’s available in that area.' : 'No available shares match your filters.'}</p>`;
}

function explore() {
  main.innerHTML = `<section class="hero">
    <div class="hero-copy"><span class="eyebrow">Food sharing near HKUST</span>
      <h1>Find a food share</h1>
    </div>
    <div class="share-map" role="group" aria-label="Illustrated map of food shares near HKUST">
      <canvas id="map-art" width="720" height="480" aria-hidden="true"></canvas>
      <div id="map-pins"></div>
      <span class="map-caption" aria-hidden="true">Approximate areas</span>
    </div>
    <div class="map-results" id="map-results" aria-live="polite"></div>
  </section>
  <section class="browse" aria-labelledby="nearby">
    <div class="section-row"><h2 id="nearby">Nearby plans</h2><span id="listing-count" class="muted" aria-live="polite"></span></div>
    <div class="filters">
      <input id="query" type="search" aria-label="Search nearby plans" placeholder="Search food or area" value="${html(state.query)}">
      <select id="day" aria-label="Filter by day"><option value="">Any day</option><option>Today</option><option>Tomorrow</option></select>
    </div>
    <div class="grid" id="listing-grid"></div>
  </section>`;
  drawMap();
  document.querySelector('#map-pins').addEventListener('click', (event) => {
    const pin = event.target.closest('[data-area]');
    if (!pin) return;
    state.mapArea = pin.dataset.area;
    updateListings();
    [...document.querySelectorAll('.map-pin')].find((item) => item.dataset.area === state.mapArea)?.focus();
  });
  document.querySelector('#day').value = state.day;
  document.querySelector('#query').addEventListener('input', (event) => {
    state.query = event.target.value;
    updateListings();
  });
  document.querySelector('#day').addEventListener('change', (event) => {
    state.day = event.target.value;
    updateListings();
  });
  updateListings();
}

function panel(content) {
  main.innerHTML = '<section class="panel">' + content + '</section>';
}

function detail(plan) {
  const own = plan.id.startsWith('posted-');
  const stage = state.bookings.get(plan.id);
  panel(`${back('explore', 'Explore')}
    <p class="eyebrow">${own ? 'Your listing' : 'Plan details'}</p>
    <h1>${html(plan.name)}</h1>
    <p class="muted">${html(plan.note)}</p>
    ${plan.id === 'dim-sum' ? '<div class="meal-photo" role="img" aria-label="Hong Kong dim sum in bamboo steamers"></div>' : ''}
    ${summary([['Full order', plan.total], ['Your share', plan.portion + ' · ' + money(plan.price)], ['Meet at', plan.location], ['Time', meeting(plan)]])}
    <div class="actions">${own ? button('Back to My plans', 'plans') : stage
      ? button('View in My plans', 'plans')
      : button('Request this share →', 'confirm/' + plan.id)}</div>`);
}

function confirm(plan) {
  panel(`${back('detail/' + plan.id, 'Plan details')}<p class="eyebrow">Pre-purchase agreement</p>
    <h1>Confirm your plan</h1><p class="muted">The host has agreed to the split. Confirm your portion and meetup details before buying.</p>
    ${summary([['Plan', plan.name], ['Your share', plan.portion + ' · ' + money(plan.price)], ['Meetup', plan.location + ' · ' + meeting(plan)], ['Attendance deposit', 'HK$10']])}
    <p class="muted">The demo simulates both participants’ deposits. After both check in, HK$9 of your deposit is returned and HK$1 is the platform fee. Pay the merchant separately after you receive your share.</p>
    <div class="actions"><button class="button" id="confirm-plan" type="button">Confirm &amp; simulate deposit</button></div>`);
  document.querySelector('#confirm-plan').addEventListener('click', () => {
    state.bookings.set(plan.id, 'check-in');
    location.hash = '#plans';
  });
}

function checkIn(plan) {
  panel(`${back('plans', 'My plans')}<p class="eyebrow">Confirmed meetup</p>
    <h1>Collect your share</h1><p class="muted">Check in once you’ve received your food. Then pay the merchant for your share.</p>
    ${summary([['Plan', plan.name], ['Meetup', plan.location + ' · ' + meeting(plan)], ['Your portion', plan.portion], ['Other participant', 'Checked in']])}
    <div class="actions"><button class="button" id="check-in" type="button">Check in and confirm receipt</button></div>`);
  document.querySelector('#check-in').addEventListener('click', () => {
    state.bookings.set(plan.id, 'pay');
    location.hash = '#pay/' + plan.id;
  });
}

function pay(plan) {
  panel(`${back('plans', 'My plans')}<p class="eyebrow">Food received</p>
    <h1>Pay for your share</h1>
    ${summary([['Plan', plan.name], ['Food payment to merchant', money(plan.price)]])}
    <p class="muted">This demo simulates the food payment. Your attendance deposit is handled separately.</p>
    <div class="actions"><button class="button" id="pay-for-share" type="button">Simulate payment of ${money(plan.price)}</button></div>`);
  document.querySelector('#pay-for-share').addEventListener('click', () => {
    state.bookings.set(plan.id, 'complete');
    location.hash = '#complete/' + plan.id;
  });
}

function complete(plan) {
  panel(`${back('plans', 'My plans')}<p class="eyebrow">Completed share</p>
    <h1>Share receipt</h1><p>You received your share of <strong>${html(plan.name)}</strong> and both participants checked in.</p>
    ${summary([['Food payment to merchant', money(plan.price)], ['Your attendance deposit', 'HK$10'], ['Platform fee', 'HK$1'], ['Returned to you', 'HK$9']])}
    <p class="muted">This receipt uses simulated payments.</p>
    <div class="actions">${button('Back to My plans', 'plans')}</div>`);
}

function myPlans() {
  const booked = [...state.bookings].map(([id, stage]) => {
    const plan = allPlans().find((item) => item.id === id);
    const status = { 'check-in': 'Deposit confirmed', pay: 'Food received · Payment due', complete: 'Completed' };
    const action = { 'check-in': 'Open meetup', pay: 'Pay for your share', complete: 'View receipt' };
    return `<article class="card"><span class="tag">${status[stage]}</span>
      <h3>${html(plan.name)}</h3><p class="muted">${html(plan.area)} · ${html(meeting(plan))}</p>
      <a href="#${stage}/${id}">${action[stage]} →</a></article>`;
  });
  panel(`<h1>My plans</h1><p class="muted">Your demo bookings and posted shares.</p>
    <div class="plan-list">${[...booked, ...state.posted.map(card)].join('') ||
      '<p>You have no plans yet. Browse a listing to request a share or post your own plan.</p>'}</div>
    <div class="actions">${button('Explore nearby plans', 'explore')}<a class="button secondary" href="#post">Post a plan</a></div>`);
}

function post() {
  panel(`${back('explore', 'Explore')}<h1>Post a plan</h1>
    <p class="muted">Tell nearby students what you want to buy and how much you can share.</p>
    <form id="post-form" class="form-grid">
      <label class="full">Food item<input name="name" required maxlength="70" placeholder="e.g. Egg tart box"></label>
      <label>Portion offered<input name="portion" required maxlength="45" placeholder="e.g. 2 of 4 pieces"></label>
      <label>Price per share (HK$)<input name="price" required type="number" min="0" max="1000" step="0.01" placeholder="18"></label>
      <label class="full">Meeting place<input name="location" required maxlength="80" placeholder="e.g. HKUST campus concourse"></label>
      <label class="full">Map area<select name="area">${mapAreas.map((area) => `<option>${area.name}</option>`).join('')}</select></label>
      <label>Day<select name="day"><option>Today</option><option>Tomorrow</option></select></label>
      <label>Time<input name="time" required type="time"></label>
      <div class="full actions"><button class="button" type="submit">Post demo listing</button></div>
    </form>`);
  document.querySelector('#post-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    state.posted.unshift({
      id: 'posted-' + (state.posted.length + 1),
      name: data.name.trim(), portion: data.portion.trim(), price: Number(data.price),
      location: data.location.trim(), area: data.area, day: data.day, time: data.time,
      tag: 'Your listing', total: 'Set by the host', note: 'This listing was posted during the demo.'
    });
    location.hash = '#plans';
  });
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
  state.posted = [];
  state.query = '';
  state.day = '';
  state.mapArea = '';
  if (location.hash === '#explore') render();
  else location.hash = '#explore';
});

render();

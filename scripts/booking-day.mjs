// Glasgow Salon Booking — "a day in the salon".
// The lower half of the case reads as the shop's paper diary:
//  • a timeline in the left margin runs from 08:00 to 19:00; as you read, the time of day moves on
//  • each main part opens with a clock that rolls to its time (08:30, 10:00, 12:10 …) and one line about that moment
//  • cards are appointment slips: they are written into the diary from the timeline side, and on hover their
//    duration bar stretches and the detail opens
const zh = () => document.documentElement.lang.startsWith('zh');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;

export function mount() {
  const root = document.querySelector('.bk-day'); if (!root) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const moments = [...root.querySelectorAll('.bk-moment')];
  clocks(moments, calm);
  spread(root);
  notes(root, calm);
  timetable(root);
  checklist(root, calm);
  slips(root, calm);
  if (matchMedia('(min-width: 900px)').matches && !calm) timeline(root, moments);
  if (matchMedia('(min-width: 1000px)').matches) traveller(root, calm);
  paper(root);
  parallax(root, calm);
}

// the clock digits roll to the moment's time once it is well in view, starting from the previous moment's time
function clocks(moments, calm) {
  let prev = '08:00';
  moments.forEach(m => { m.dataset.from = prev; prev = m.dataset.time; set(m, m.dataset.from); });
  function set(m, t) { const ds = [...t.replace(':', '')]; m.querySelectorAll('.bk-digit').forEach((d, i) => d.style.setProperty('--n', ds[i])); }
  if (calm || !('IntersectionObserver' in window)) { moments.forEach(m => { set(m, m.dataset.time); m.classList.add('is-in'); }); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; const m = en.target; m.classList.add('is-in'); requestAnimationFrame(() => set(m, m.dataset.time)); io.unobserve(m); }), { rootMargin: '0px 0px -35% 0px' });
  moments.forEach(m => io.observe(m));
}

// cards become appointment slips written into the diary
function slips(root, calm) {
  const cards = [...root.querySelectorAll('.ux-challenge-grid>div, .ux-build>li, .ux-research-plan>div, .ux-journey>li, .ux-audience>div')];
  cards.forEach((c, i) => {
    c.classList.add('bk-slip'); c.style.setProperty('--d', (i % 4) * 90 + 'ms');
    // keep the first line, open the rest on hover / focus / tap
    const extra = [...c.children].filter((x, k) => k > 0 && !x.matches('span:first-child'));
    const body = [...c.querySelectorAll(':scope > p')]; if (body.length) { c.classList.add('bk-has-more'); body.forEach(b => b.classList.add('bk-more')); c.tabIndex = 0; c.addEventListener('click', () => c.classList.toggle('is-open')); }
  });
  if (calm || !('IntersectionObserver' in window)) { cards.forEach(c => c.classList.add('is-in')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -12% 0px' });
  cards.forEach(c => io.observe(c));
}

// the margin timeline: the time of day follows your reading, and is exactly each moment's time when you reach it
function timeline(root, moments) {
  if (!moments.length) return;
  const rail = document.createElement('div'); rail.className = 'bk-rail'; rail.setAttribute('aria-hidden', 'true');
  const H0 = 8 * 60, H1 = 19 * 60;
  rail.innerHTML = `<div class="bk-rail-track">${Array.from({ length: 12 }, (_, k) => `<i style="--y:${k / 11}"><b>${String(8 + k).padStart(2, '0')}</b></i>`).join('')}<span class="bk-rail-fill"></span><span class="bk-now"><em></em></span></div>`;
  document.body.append(rail);
  const fill = rail.querySelector('.bk-rail-fill'), now = rail.querySelector('.bk-now'), lab = now.querySelector('em');
  const stops = () => moments.map(m => ({ y: m.getBoundingClientRect().top + scrollY + m.offsetHeight * .5, t: mins(m.dataset.time) }));
  const place = () => { const sec = root.querySelector('.v3-product-section.ux-section'); if (sec) rail.style.setProperty('--rail-x', Math.max(30, sec.getBoundingClientRect().left + 18) + 'px'); }; place(); addEventListener('resize', place);
  let S = stops(); addEventListener('resize', () => { S = stops(); }); setInterval(() => { S = stops(); }, 1200);
  let q = false;
  const run = () => {
    q = false; const y = scrollY + innerHeight * .5;
    const first = moments[0].getBoundingClientRect(), last = moments[moments.length - 1].getBoundingClientRect();
    const on = first.top < innerHeight * .8 && last.bottom > innerHeight * .2; document.body.classList.toggle('bk-rail-on', on);
    let t = S[0].t; if (y <= S[0].y) t = H0 + (S[0].t - H0) * clamp(1 - (S[0].y - y) / innerHeight);
    else if (y >= S[S.length - 1].y) t = S[S.length - 1].t;
    else for (let k = 0; k < S.length - 1; k++) if (y < S[k + 1].y) { const f = (y - S[k].y) / (S[k + 1].y - S[k].y); t = S[k].t + (S[k + 1].t - S[k].t) * f; break; }
    const p = clamp((t - H0) / (H1 - H0));
    rail.style.setProperty('--p', p.toFixed(4)); lab.textContent = fmt(t);
  };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); addEventListener('resize', run); run();
}

// paper starts where the diary starts: the dark opening hands over to the page as the first moment arrives
function paper(root) {
  const first = root.querySelector('.bk-moment'); if (!first) return;
  let q = false;
  const run = () => { q = false; const r = first.getBoundingClientRect(); const p = clamp(1 - (r.top - innerHeight * .2) / (innerHeight * .6)); document.body.style.setProperty('--bk-paper', p.toFixed(3)); const mix = (a, b2) => Math.round(a + (b2 - a) * p); document.body.style.setProperty('background-color', `rgb(${mix(20, 243)},${mix(21, 238)},${mix(24, 227)})`, 'important'); document.body.classList.toggle('bk-on-paper', p > .5); };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); addEventListener('resize', run); run();
}

// each section is a diary spread: the left page holds the section label and its story line (it stays while you read),
// the right page holds the content
function spread(root) {
  root.querySelectorAll('.v3-product-section.ux-section').forEach(sec => {
    if (sec.querySelector('.bk-left')) return;
    const h = sec.querySelector(':scope>h2'), body = sec.querySelector(':scope>.ux-section-body'), note = body?.querySelector(':scope>.bk-note');
    if (!h || !body) return;
    const left = document.createElement('div'); left.className = 'bk-left'; const inner = document.createElement('div'); inner.className = 'bk-left-in';
    inner.append(h); if (note) inner.append(note); left.append(inner); sec.prepend(left); sec.classList.add('bk-spread');
  });
  // the story line gets a highlighter stroke when it arrives
  if (!('IntersectionObserver' in window)) return root.querySelectorAll('.bk-note').forEach(n => n.classList.add('is-in'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -30% 0px' });
  root.querySelectorAll('.bk-note').forEach(n => io.observe(n));
}

// the problems are sticky notes stuck on the page
function notes(root) {
  root.querySelectorAll('.ux-pains>div').forEach((n, i) => { n.classList.add('bk-sticky'); n.style.setProperty('--r', [-2.5, 1.8, -1.2, 2.6][i % 4] + 'deg'); n.style.setProperty('--c', ['#fff4b8', '#d8f3e4', '#ffe1d6', '#e6ecff'][i % 4]); });
}

// the booking rules sit on a day timetable: each rule is an appointment of its own length
function timetable(root) {
  const box = root.querySelector('.ux-principles'); if (!box || box.classList.contains('bk-table')) return;
  box.classList.add('bk-table');
  const len = [2, 3, 2, 2, 3, 2, 3, 2]; let start = 9 * 60;
  [...box.children].forEach((r, i) => {
    const d = len[i % len.length] * 30, t0 = start, t1 = start + d; start = t1;
    r.classList.add('bk-appt'); r.style.setProperty('--rows', len[i % len.length]);
    const tm = document.createElement('time'); tm.className = 'bk-appt-time'; tm.textContent = `${fmt(t0)}–${fmt(t1)}`; r.prepend(tm);
  });
}

// how success is measured: a checklist that ticks itself off as you reach it
function checklist(root, calm) {
  const list = root.querySelector('.ux-success'); if (!list) return; list.classList.add('bk-check');
  const items = [...list.children]; items.forEach((li, i) => { li.style.setProperty('--d', (i * 380) + 'ms'); const b = document.createElement('i'); b.className = 'bk-box'; b.innerHTML = '<svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg>'; li.prepend(b); });
  if (calm || !('IntersectionObserver' in window)) return list.classList.add('is-in');
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { list.classList.add('is-in'); io.disconnect(); } }, { rootMargin: '0px 0px -30% 0px' }); io.observe(list);
}

// One phone travels with the story. It stands beside the text it illustrates, crosses to the other side when the
// text does, turning as it goes, and its screen always shows the screen the words are talking about.
const B = 'assets/v3/screens/booking/';
const BEATS = [
  ['#overview .ux-pains', 'schedule', ['Owner · the whole diary in her head', '店主 · 整本预约都记在脑子里']],
  ['#overview .ux-persona', 'today', ['Owner · what she needs at a glance', '店主 · 一眼要看到的']],
  ['#system .ux-blueprint', 'book', ['Customer · picks a service first', '顾客 · 先选服务']],
  ['#system .ux-needs', 'today', ['Owner · her day, not a chat', '店主 · 她的一天，不是聊天记录']],
  ['#system .ux-lanes', 'mine', ['Customer · my bookings', '顾客 · 我的预约']],
  ['#strategy .ux-principles', 'day', ['Customer · only times that fit', '顾客 · 只给放得下的时间']],
  ['#strategy .ux-chips', 'services', ['Owner · services and lengths', '店主 · 服务和时长']],
  ['#iteration', 'confirm', ['Customer · one check, then book', '顾客 · 核对一次就约好']],
  ['#flow', 'by-time', ['Customer · find a time', '顾客 · 找一个时间']],
  ['#flow .ux-journey', 'booked', ['Customer · booked', '顾客 · 约好了']],
  ['#interfaces', 'time-off-hours', ['Owner · close a few hours', '店主 · 临时关几个小时']],
  ['#interfaces .ux-details', 'kept', ['Customer · nobody is deleted', '顾客 · 没有人被删掉']],
  ['#build', 'add', ['Owner · add a regular by name', '店主 · 填名字加老顾客']],
  ['#challenges', 'reschedule', ['Customer · pick a new time', '顾客 · 重新选个时间']],
  ['#research', 'today', ['Owner · her day, live', '店主 · 她今天的真实日程']],
  ['#release', 'booked', ['Customer · booked, in English or Chinese', '顾客 · 中英文都能约']]
];
function traveller(root, calm) {
  // the interface close-ups and the screen map become text: the phone shows the screens
  const DETAIL = ['book', 'today', 'time-off-hours', 'kept'];
  root.querySelectorAll('#interfaces .ux-details figure').forEach((f, i) => { f.classList.add('bk-textonly'); f.dataset.screen = DETAIL[i % DETAIL.length]; });
  root.querySelectorAll('#structure .ux-shot').forEach(b => { const src = b.dataset.shot || b.querySelector('img')?.getAttribute('src') || ''; const m = src.match(/booking\/(?:zh\/)?([\w-]+)\.webp/); if (m) { b.dataset.screen = m[1]; b.classList.add('bk-textonly'); } });
  root.querySelector('#structure')?.classList.add('bk-map-text');
  const beats = BEATS.map(([sel, file, label]) => ({ el: root.querySelector(sel), file, label })).filter(b => b.el);
  root.querySelectorAll('#interfaces .ux-details figure').forEach(f => beats.push({ el: f, file: f.dataset.screen, label: [f.querySelector('h4')?.textContent || '', f.querySelector('h4')?.textContent || ''] }));
  beats.sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
  const hoverScreens = [...root.querySelectorAll('#structure [data-screen]')].map(b => b.dataset.screen);
  const files = [...new Set([...beats.map(b => b.file), ...hoverScreens])];
  const wrap = document.createElement('div'); wrap.className = 'bk-phone'; wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `<div class="bk-phone-3d" data-screens=""><div class="bk-dev">${Array.from({ length: 8 }, (_, k) => `<i class="bk-side" style="--k:${k + 1}"></i>`).join('')}<div class="bk-front"><div class="bk-screen"><div class="bk-shots"></div><i class="bk-dim"></i><div class="bk-lift"><i class="bk-lift-img"></i></div></div><i class="bk-island"></i><i class="bk-glare"></i></div></div></div><p class="bk-phone-label"><i></i><span></span></p><p class="bk-phone-hint"></p>`;
  document.body.append(wrap);
  const host = wrap.querySelector('.bk-phone-3d'), lab = wrap.querySelector('.bk-phone-label span'), hint = wrap.querySelector('.bk-phone-hint');
  hint.textContent = zh() ? '拖动它试试' : 'Drag to turn it';
  // chapters (between clock moments) keep the phone on one side; it crosses during the clock moments
  const CH = { overview: 'right', system: 'left', strategy: 'left', iteration: 'left', structure: 'right', flow: 'right', interfaces: 'right', build: 'left', challenges: 'left', research: 'left', release: 'left' };
  const secs = [...root.querySelectorAll('.v3-product-section.ux-section')].filter(x => CH[x.id]);
  secs.forEach(sec => { sec.classList.add('bk-with-phone'); sec.dataset.phone = CH[sec.id]; });
  document.body.classList.add('bk-has-phone');
  const XS = { right: .84, left: .16 };
  // keyframes along the page: where the phone is (x across the screen, y in the screen, size, visibility) at each point
  let keys = [];
  const docY = e => e.getBoundingClientRect().top + scrollY;
  const build = () => {
    const vh = innerHeight, K = [];
    const first = root.querySelector('.bk-moment'), heroEl = document.querySelector('.op-phone [data-phone3d]') || document.querySelector('.op-phone');
    if (heroEl) {
      // it IS the opening phone: starts exactly where that one stands, then drifts up slower than the page (parallax)
      const hr = heroEl.getBoundingClientRect(), hy = hr.top + scrollY, op = document.querySelector('[data-opening]'), opH = op ? op.offsetHeight : vh;
      const s0 = Math.max(.6, Math.min(1.1, hr.height * .8 / (wrap.offsetHeight || 540)));
      const x0 = (hr.left + hr.width / 2) / innerWidth, y0 = (hy + hr.height / 2) / vh;
      K.push({ at: vh * .5, x: x0, y: y0, s: s0, o: 1 });
      K.push({ at: vh * .5 + opH, x: x0, y: y0 - opH * .45 / vh, s: s0 * .92, o: 1 });
      if (first) K.push({ at: docY(first) - vh * .25, x: .85, y: .55, s: .9, o: 1 });
    } else if (first) { K.push({ at: docY(first) - vh * .2, x: .85, y: 1.25, s: .6, o: 0 }); }
    root.querySelectorAll('.v3-product-section.ux-section, .bk-moment, .st, .xp').forEach(e => {
      const top = docY(e), h = e.offsetHeight;
      if (e.matches('.bk-moment')) { const next = e.nextElementSibling?.closest?.('*'); let n = e.nextElementSibling; while (n && !CH[n.id]) n = n.nextElementSibling; const prevSide = K.length ? (K[K.length - 1].x < .5 ? 'left' : 'right') : 'right'; const to = n ? CH[n.id] : prevSide;
        K.push({ at: top + h * .2, x: XS[prevSide], y: .55, s: .9, o: 1 }); K.push({ at: top + h * .5, x: .5, y: 1.22, s: .5, o: 1 }); K.push({ at: top + h * .85, x: XS[to], y: .55, s: .9, o: 1 }); return; }
      if (e.matches('.st, .xp')) { const side = K.length ? (K[K.length - 1].x < .5 ? 'left' : 'right') : 'right'; K.push({ at: top - vh * .75, x: XS[side], y: .55, s: .9, o: 1 }); K.push({ at: top - vh * .05, x: XS[side] < .5 ? -.1 : 1.1, y: .55, s: .7, o: 0 }); K.push({ at: top + h + vh * .05, x: XS[side] < .5 ? -.1 : 1.1, y: .55, s: .7, o: 0 }); K.push({ at: top + h + vh * .7, x: XS[side], y: .55, s: .9, o: 1 }); return; }
      const side = CH[e.id]; if (!side) return; K.push({ at: top + vh * .1, x: XS[side], y: .52, s: 1, o: 1 }); K.push({ at: top + h - vh * .2, x: XS[side], y: .52, s: 1, o: 1 });
    });
    K.sort((a, b) => a.at - b.at); keys = K;
  };
  build(); addEventListener('resize', build); setInterval(build, 1500);
  const ss = t => t * t * (3 - 2 * t);
  const at = y => { if (!keys.length) return null; if (y <= keys[0].at) return keys[0]; for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (y < b.at) { const t = ss((y - a.at) / Math.max(1, b.at - a.at)); const o = {}; for (const k of ['x', 'y', 's', 'o']) o[k] = a[k] + (b[k] - a[k]) * t; return o; } } return keys[keys.length - 1]; };
  let cur = -1, px = .85, override = null;
  const SPOT = { today: [2, 22, 96, 28], book: [2, 19, 96, 13], day: [2, 31, 96, 28], confirm: [2, 27, 96, 24], schedule: [4, 52, 94, 34], 'time-off-hours': [2, 35, 96, 27], kept: [2, 33, 96, 28], add: [2, 24, 96, 30], mine: [2, 18, 96, 30], services: [2, 16, 96, 42], 'by-time': [2, 22, 96, 40], booked: [2, 14, 96, 34], reschedule: [2, 22, 96, 36], window: [2, 22, 96, 36] };
  const HOVER = [
    ['#overview .ux-pains>div', ['schedule', 'day', 'time-off-hours', 'book']],
    ['#overview .ux-persona', ['today']],
    ['#system .ux-bp-row, #system .ux-needs>div, #system .ux-lanes>div', ['book', 'today', 'mine', 'add']],
    ['#strategy .ux-principles>div', ['today', 'services', 'day', 'by-time', 'window', 'day', 'kept', 'schedule']],
    ['#iteration .ux-process>li, #iteration .ux-before-after>*', ['confirm', 'today', 'book']],
    ['#flow .ux-journey>li', ['book', 'day', 'confirm', 'mine', 'reschedule']],
    ['#interfaces .bk-textonly', ['book', 'today', 'time-off-hours', 'kept']],
    ['#build .ux-build>li', ['book', 'add', 'confirm', 'today', 'book']],
    ['#challenges .ux-challenge-grid>div, #challenges .ux-success>li', ['add', 'services', 'book', 'today', 'mine', 'reschedule', 'today']],
    ['#research .ux-research-plan>div', ['booked', 'services', 'time-off-hours']]
  ];
  HOVER.forEach(([sel, list]) => root.querySelectorAll(sel).forEach((el, i) => {
    const scr = list[i % list.length]; if (!files.includes(scr)) files.push(scr);
    el.classList.add('bk-points');
    el.addEventListener('pointerenter', () => {
      if (!wrap.classList.contains('is-on')) return;
      override = scr; const head = (el.querySelector('h3,h4,strong,b')?.textContent || el.textContent || '').trim().replace(/\s+/g, ' ');
      const r = SPOT[scr] || [2, 20, 96, 30];
      host._phone?.show(files.indexOf(scr)); host._phone?.spot({ x: r[0], y: r[1], w: r[2], h: r[3], label: head.length > 34 ? head.slice(0, 32) + '…' : head });
      el.classList.add('is-pointed'); wrap.classList.add('is-pointing');
    });
    el.addEventListener('pointerleave', () => { override = null; cur = -1; host._phone?.spot(null); el.classList.remove('is-pointed'); wrap.classList.remove('is-pointing'); });
  }));
  // reload the phone's screen list if hover added screens
  host.dataset.screens = files.map(f => B + f + '.webp').join(',');
  // hovering a screen name in the screen map shows it on the phone
  root.querySelectorAll('#structure [data-screen]').forEach(b => { b.addEventListener('pointerenter', () => { override = b.dataset.screen; host._phone?.spot(null); host._phone?.show(files.indexOf(override)); lab.textContent = (b.querySelector('strong')?.textContent || override); }); b.addEventListener('pointerleave', () => { override = null; cur = -1; }); });
  const tick = () => {
    requestAnimationFrame(tick);
    const vh = innerHeight, y = scrollY + vh * .5, k = at(y); if (!k) return;
    document.body.classList.toggle('bk-hero-handover', true);
    const W = innerWidth, w = wrap.offsetWidth;
    const vx = k.x - px; px = k.x;
    wrap.style.opacity = k.o.toFixed(3); wrap.classList.toggle('is-on', k.o > .5);
    wrap.style.transform = `translate3d(${(k.x * W - w / 2).toFixed(1)}px,${(k.y * vh - wrap.offsetHeight / 2).toFixed(1)}px,0) scale(${k.s.toFixed(3)})`;
    // it faces the text it stands beside, and swings round as it travels
    const face = k.x > .5 ? .38 : -.38;
    host._phone?.lean(face + Math.max(-1.2, Math.min(1.2, vx * 160)));
    if (override) return;
    const mid = vh * .55; let b = -1; beats.forEach((bt, i) => { if (bt.el.getBoundingClientRect().top < mid) b = i; });
    if (b >= 0 && b !== cur) { cur = b; host._phone?.show(files.indexOf(beats[b].file)); lab.textContent = beats[b].label[zh() ? 1 : 0]; wrap.dataset.who = /Owner|店主/.test(lab.textContent) ? 'owner' : 'customer'; wrap.classList.remove('is-swap'); void wrap.offsetWidth; wrap.classList.add('is-swap'); }
  };
  host._phone = cssPhone(host, files, calm);
  host.addEventListener('pointerdown', () => wrap.classList.add('was-dragged'), { once: true });
  document.addEventListener('portfolio:language', () => { cur = -1; hint.textContent = zh() ? '拖动它试试' : 'Drag to turn it'; });
  requestAnimationFrame(tick);
}

// parallax: the opening's big words sink slower than the page, and pieces of each page float at their own speed
function parallax(root, calm) {
  if (calm) return;
  const type = document.querySelector('[data-opening] .op-type');
  const items = [...root.querySelectorAll('.bk-moment-line, .bk-moment-cap, .ux-persona, .ux-blueprint, .bk-check')];
  items.forEach((e, i) => e.style.setProperty('--ps', [.12, -.08, .18, -.05, .1][i % 5]));
  let q = false;
  const run = () => { q = false; const vh = innerHeight;
    if (type) type.style.transform = `translate3d(0,${(scrollY * .38).toFixed(1)}px,0)`;
    items.forEach(e => { const r = e.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return; const p = (r.top + r.height / 2 - vh / 2); e.style.translate = `0 ${(p * -+e.style.getPropertyValue('--ps')).toFixed(1)}px`; }); };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); run();
}

// A phone built in CSS 3D (like the anatomy view): a screen you can see, and the part being talked about physically
// lifts out of it towards you with a pink glow while the rest dims. Pose and lift are eased every frame, never snapped.
function cssPhone(host, files, calm) {
  const dev = host.querySelector('.bk-dev'), shots = host.querySelector('.bk-shots'), lift = host.querySelector('.bk-lift'), limg = host.querySelector('.bk-lift-img');
  const src = f => B + (zh() ? 'zh/' : '') + f + '.webp';
  const imgs = {};
  const img = f => { if (!imgs[f]) { const i = document.createElement('img'); i.alt = ''; i.decoding = 'async'; i.src = src(f); shots.append(i); imgs[f] = i; } return imgs[f]; };
  document.addEventListener('portfolio:language', () => Object.entries(imgs).forEach(([f, i]) => { i.src = src(f); }));
  let curF = null, face = .38, lifted = 0, liftT = 0, zoom = 1, oy = 50, spotCy = 50, rx = 16, ry = -18, rz = -6, mx = 0, my = 0, dragX = 0, dragY = 0, drag = null;
  const show = i => { const f = files[i]; if (!f || f === curF) return; curF = f; const n = img(f); Object.values(imgs).forEach(x => x.classList.toggle('is-on', x === n)); if (lift.classList.contains('is-on')) limg.style.backgroundImage = `url("${src(f)}")`; };
  const spot = r => {
    if (!r) { lift.classList.remove('is-on'); host.classList.remove('is-lifted'); liftT = 0; return; }
    const [x, y, w, h] = [r.x, r.y, r.w, r.h];
    lift.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
    limg.style.backgroundImage = `url("${src(curF)}")`; limg.style.backgroundSize = `${(1e4 / w).toFixed(2)}% ${(1e4 / h).toFixed(2)}%`;
    limg.style.backgroundPosition = `${w >= 100 ? 0 : (x / (100 - w) * 100).toFixed(2)}% ${h >= 100 ? 0 : (y / (100 - h) * 100).toFixed(2)}%`;
    spotCy = y + h / 2; lift.classList.remove('is-on'); void lift.offsetWidth; lift.classList.add('is-on'); host.classList.add('is-lifted'); liftT = 1;
  };
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; if (drag) { dragY += (e.clientX - drag.x) * .35; dragX -= (e.clientY - drag.y) * .25; drag = { x: e.clientX, y: e.clientY }; } }, { passive: true });
  host.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; host.setPointerCapture?.(e.pointerId); });
  addEventListener('pointerup', () => { drag = null; });
  const tick = () => {
    requestAnimationFrame(tick);
    if (!drag) { dragX *= .92; dragY *= .92; }
    lifted += (liftT - lifted) * .08;
    // facing the text it stands beside; when something is lifted, the camera swings round to show the depth
    const side = Math.sign(face) || 1, swing = Math.max(-1.2, Math.min(1.2, face - .38 * side));
    // readable angles (like LOOK's anatomy): a gentle turn towards the text; when a part lifts, the camera moves in on it and straightens
    const tY = -side * (14 - lifted * 7) + swing * -40 + mx * 8 + dragY, tX = 8 + lifted * 6 + my * -6 + dragX, tZ = -side * (3 - lifted * 2);
    const k = calm ? 1 : .07; ry += (tY - ry) * k; rx += (tX - rx) * k; rz += (tZ - rz) * k;
    zoom += ((liftT ? 1.55 : 1) - zoom) * k; oy += (spotCy - oy) * k;
    dev.style.transformOrigin = `50% ${oy.toFixed(1)}%`;
    dev.style.transform = `translateY(${((50 - oy) * (zoom - 1) * .9).toFixed(1)}%) scale(${zoom.toFixed(3)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
    dev.style.setProperty('--gl', (50 + ry * 1.5).toFixed(1) + '%');
  };
  requestAnimationFrame(tick);
  show(0);
  return { show, spot, lean: y => { face = y; } };
}

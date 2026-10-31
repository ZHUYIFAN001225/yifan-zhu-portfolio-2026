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
  const beats = BEATS.map(([sel, file, label]) => ({ el: root.querySelector(sel), file, label })).filter(b => b.el);
  if (!beats.length) return;
  const files = [...new Set(beats.map(b => b.file))];
  const wrap = document.createElement('div'); wrap.className = 'bk-phone'; wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `<div class="bk-phone-3d" data-phone3d data-mode="manual" data-follow="1" data-status="1" data-zoom=".62" data-tilt-y="0" data-screens="${files.map(f => B + f + '.webp').join(',')}"></div><p class="bk-phone-label"><i></i><span></span></p>`;
  document.body.append(wrap);
  const host = wrap.querySelector('[data-phone3d]'), lab = wrap.querySelector('.bk-phone-label span');
  import('./phone3d.mjs').then(m => m.mountPhone(host)).catch(() => {});
  // sections alternate: text on one side, phone on the other
  const secs = [...root.querySelectorAll('.v3-product-section.ux-section')].filter(sec => beats.some(b => sec.contains(b.el)));
  secs.forEach((sec, i) => { sec.classList.add('bk-with-phone'); sec.dataset.phone = i % 2 ? 'left' : 'right'; });
  document.body.classList.add('bk-has-phone');
  let x = innerWidth * .78, vx = 0, side = 'right', cur = -1, shown = false, raf = 0;
  const pick = () => {
    const mid = innerHeight * .55; let k = -1;
    beats.forEach((b, i) => { if (b.el.getBoundingClientRect().top < mid) k = i; });
    if (k < 0) return null;
    const sec = beats[k].el.closest('.bk-with-phone'), r = sec?.getBoundingClientRect();
    // only while its section is on screen, and never over the story phone, the anatomy, the screen map or a clock moment
    const blocked = [...root.querySelectorAll('.st, .xp, #structure, .bk-moment')].some(e => { const q = e.getBoundingClientRect(); return q.top < innerHeight * .7 && q.bottom > innerHeight * .3; });
    // and never while text from a section on the other side is still where the phone would stand
    const clash = root.querySelectorAll('.bk-with-phone'); let busy = false;
    clash.forEach(o => { if (o === sec || o.dataset.phone === sec.dataset.phone) return; const q = o.getBoundingClientRect(); if (q.top < innerHeight * .82 && q.bottom > innerHeight * .18) busy = true; });
    if (!sec || r.bottom < innerHeight * .35 || r.top > innerHeight * .65 || blocked || busy) return null;
    return { k, side: sec.dataset.phone };
  };
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const p = pick();
    const on = !!p; if (on !== shown) { shown = on; wrap.classList.toggle('is-on', on); }
    if (!p) return;
    if (p.side !== side) { side = p.side; host._phone?.lean(side === 'right' ? .9 : -.9); setTimeout(() => host._phone?.lean(side === 'right' ? .38 : -.38), 700); }
    if (p.k !== cur) {
      const turn = cur >= 0 && beats[cur].file !== beats[p.k].file && !calm;
      cur = p.k; host._phone?.show(files.indexOf(beats[cur].file), { turn: false });
      lab.textContent = beats[cur].label[zh() ? 1 : 0]; wrap.dataset.who = /Owner|店主/.test(lab.textContent) ? 'owner' : 'customer';
      wrap.classList.remove('is-swap'); void wrap.offsetWidth; wrap.classList.add('is-swap');
    }
    const tx = side === 'right' ? innerWidth * .78 : innerWidth * .22;
    vx += (tx - x) * .045; vx *= .78; x += vx;
    const lean = Math.max(-1, Math.min(1, vx / 30));
    wrap.style.transform = `translate3d(${(x - wrap.offsetWidth / 2).toFixed(1)}px,-50%,0) rotate(${(lean * 6).toFixed(2)}deg)`;
  };
  host.addEventListener('phone-ready', () => { host._phone.lean(.38); }, { once: true });
  document.addEventListener('portfolio:language', () => { if (cur >= 0) lab.textContent = beats[cur].label[zh() ? 1 : 0]; });
  raf = requestAnimationFrame(tick);
}

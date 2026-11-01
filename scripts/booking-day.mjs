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
  // (the margin time line is gone: the clock chapters already carry the time of day, and it ran over wide content)
  Promise.all([import('./booking-hand.mjs'), import('./booking-domino.mjs'), import('./booking-chair.mjs')]).then(([h, d, c]) => { h.mountHand(root, d.CHARS() + c.CHARS()); d.mountDomino(root); c.mountChair(root); }).catch(e => console.error(e));
  stage(root, calm);
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
    const sc = root.querySelector('.bk-story')?.getBoundingClientRect(), inScene = sc && sc.top < innerHeight * .5 && sc.bottom > innerHeight * .5;
    const on = !inScene && first.top < innerHeight * .8 && last.bottom > innerHeight * .2; document.body.classList.toggle('bk-rail-on', on);
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

// One 3D stage for the whole case (see booking-stage.mjs). The 12:10 story becomes scroll steps the phones act out.
function stage(root, calm) {
  const st = root.querySelector('.st'), mq = matchMedia('(min-width: 1000px)');
  // on wide screens the phone shows the screens, so close-ups become text and each chapter leaves room on its phone
  // side. This follows the window size live (a window can be opened narrow and widened later).
  let S = null;
  const DETAIL = ['book', 'today', 'time-off-hours', 'kept'];
  const layout = on => {
    root.querySelectorAll('#interfaces .ux-details figure').forEach((f, i) => { f.dataset.screen = DETAIL[i % DETAIL.length]; f.classList.toggle('bk-textonly', on); });
    root.querySelectorAll('#structure .ux-shot').forEach(b => { const src = b.dataset.shot || b.querySelector('img')?.getAttribute('src') || ''; const m = src.match(/booking\/(?:zh\/)?([\w-]+)\.webp/); if (m) { b.dataset.screen = m[1]; b.classList.toggle('bk-textonly', on); } });
    root.querySelector('#structure')?.classList.toggle('bk-map-text', on);
    if (S) root.querySelectorAll('.v3-product-section.ux-section').forEach(sec => { const side = S.SIDE[sec.id]; if (side) { sec.dataset.phone = side; sec.classList.toggle('bk-with-phone', on); } });
    document.body.classList.toggle('bk-has-phone', on && !!S);
  };
  const undo = [() => { S = null; layout(false); }];
  if (calm) return;
  import('./booking-stage.mjs').then(async mod => {
    S = mod; layout(mq.matches); mq.addEventListener('change', e => { if (S) layout(e.matches); });
    // 12:10: the booking as a two-lane flow of the real screens (no scroll-jacking, no 3D here)
    const flowMod = await import('./booking-flow.mjs');
    let story = null;
    if (st) { story = flowMod.mountFlow(root, st); st.classList.add('bk-st-hidden'); }
    if (!mod.mountStage(root)) throw new Error('WebGL unavailable');
    document.body.classList.add('bk-staged');
  }).catch(e => { console.error(e); root.querySelector('.bk-story')?.remove(); st?.classList.remove('bk-st-hidden'); undo.forEach(f => f()); });
}

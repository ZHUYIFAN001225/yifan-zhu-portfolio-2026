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
  mobileLite(root);
  // the cover holds still (sticky) while the phone introduces the product; on phones it just scrolls
  { const op = document.querySelector('[data-opening]');
    if (op && !op.parentElement.matches('.bk-cover-pin') && matchMedia('(min-width: 1000px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const pin = document.createElement('div'); pin.className = 'bk-cover-pin'; op.before(pin); pin.append(op); } }
  Promise.all([import('./booking-hand.mjs'), import('./booking-domino.mjs'), import('./booking-chair.mjs'), import('./booking-map.mjs'), import('./booking-try.mjs')]).then(([h, d, c, mp, tr]) => { tr.mountTry(root); h.mountHand(root, d.CHARS() + c.CHARS() + mp.CHARS() + tr.CHARS()); d.mountDomino(root); c.mountChair(root); mp.mountMap(root); }).catch(e => console.error(e));
  stage(root, calm);
  regionTags(root);
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
    // (cards show their full text: hiding it behind a click only made readers guess)
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
  const run = () => { q = false; const r = first.getBoundingClientRect(); const p = 1; /* one material for the whole case: paper from the cover down */ document.body.style.setProperty('--bk-paper', p.toFixed(3)); const mix = (a, b2) => Math.round(a + (b2 - a) * p); document.body.style.setProperty('background-color', `rgb(${mix(20, 243)},${mix(21, 238)},${mix(24, 227)})`, 'important'); document.body.classList.toggle('bk-on-paper', p > .5); };
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
  script(root);
  // the story line gets a highlighter stroke when it arrives
  if (!('IntersectionObserver' in window)) return root.querySelectorAll('.bk-note').forEach(n => n.classList.add('is-in'));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -30% 0px' });
  root.querySelectorAll('.bk-note').forEach(n => io.observe(n));
}

// the left page reads like a film script: the time of day and the chapter's place in the day, then the beats of this
// chapter in order. The beat being shown on the right is lit and a line fills down the timeline, so the left side
// always says what the right side is showing.
function script(root) {
  const secs = [...root.querySelectorAll('.bk-spread')], all = [];
  secs.forEach((sec, si) => {
    const inner = sec.querySelector('.bk-left-in'), body = sec.querySelector(':scope>.ux-section-body'); if (!inner || !body || inner.querySelector('.bk-script')) return;
    let prev = sec.previousElementSibling; while (prev && !prev.matches('.bk-moment, .v3-product-section')) prev = prev.previousElementSibling;
    const time = prev?.matches('.bk-moment') ? prev.dataset.time : '';
    const k = document.createElement('p'); k.className = 'bk-script-k'; k.textContent = `${time ? time + ' · ' : ''}${String(si + 1).padStart(2, '0')} / ${String(secs.length).padStart(2, '0')}`;
    inner.prepend(k);
    const heads = [...body.querySelectorAll('h3')].filter(h => !h.closest('.bk-left, [hidden], .ux-iterations, .ux-decisions article') && h.textContent.trim());
    if (heads.length < 2) return;
    const ol = document.createElement('ol'); ol.className = 'bk-script';
    heads.forEach((h, i) => {
      const li = document.createElement('li'); const a = document.createElement('a'); a.href = '#'; a.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span><b></b>`;
      const sync = () => { a.querySelector('b').textContent = h.textContent.trim(); }; sync(); document.addEventListener('portfolio:language', () => setTimeout(sync, 40));
      a.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: h.getBoundingClientRect().top + scrollY - innerHeight * .25, behavior: 'smooth' }); });
      li.append(a); ol.append(li);
    });
    inner.append(ol); all.push({ sec, ol, heads });
  });
  if (!all.length) return;
  let q = false;
  const run = () => {
    q = false; const line = innerHeight * .45;
    all.forEach(({ sec, ol, heads }) => {
      const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      let cur = -1; heads.forEach((h, i) => { if (h.getBoundingClientRect().top < line) cur = i; });
      [...ol.children].forEach((li, i) => { li.classList.toggle('is-on', i === cur); li.classList.toggle('is-past', i < cur); });
      const last = heads[heads.length - 1].getBoundingClientRect(), first = heads[0].getBoundingClientRect();
      ol.style.setProperty('--fill', clamp((line - first.top) / Math.max(1, last.top - first.top)).toFixed(3));
    });
  };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); run();
}

// glass light: the pane under the pointer catches a soft highlight where the pointer is, like light on frosted glass
function glassLight(root) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const SEL = '.bk-dom-card,.bk-receipt,.bk-owner,.bk-ask,.bk-entry>li,.bk-results-card,.ux-blueprint,.ux-scenario>li,.ux-persona,.ux-lanes>div,.ux-evidence-note,.ux-principles>div,.ux-process>li,.ux-decisions article,.ux-details figure,.ux-research-plan>div,.ux-hard>*,.ux-opps>*,.ux-build>li,.ux-roadmap li,.ux-taps,.ux-bp-row>span,.ux-success>li,.bk-slip,.ux-chips li,.ux-section ol:not(.bk-script)>li';
  let cur = null, q = null;
  const off = el => { el.style.removeProperty('--gx'); el.style.removeProperty('--gy'); };
  root.addEventListener('pointermove', e => {
    q = e; requestAnimationFrame(() => {
      if (!q) return; const ev = q; q = null;
      const el = ev.target.closest?.(SEL); if (cur && cur !== el) off(cur); cur = el && root.contains(el) ? el : null; if (!cur) return;
      const r = cur.getBoundingClientRect(); cur.style.setProperty('--gx', (ev.clientX - r.left).toFixed(0) + 'px'); cur.style.setProperty('--gy', (ev.clientY - r.top).toFixed(0) + 'px');
    });
  }, { passive: true });
  root.addEventListener('pointerleave', () => { if (cur) off(cur); cur = null; });
}

// phones: fewer words at once. Card groups become swipeable rails (one card in view, a counter under it), long
// paragraphs show two lines and open on tap. The classes only take effect under the mobile media query.
function mobileLite(root) {
  const zh = () => document.documentElement.lang.startsWith('zh');
  root.querySelectorAll('.ux-principles:not(.bk-table), .ux-build, .ux-hard, .ux-opps, .ux-research-plan, .ux-iterations, .ux-details').forEach(g => {
    if (g.classList.contains('bk-swipe') || g.children.length < 2) return;
    g.classList.add('bk-swipe');
    const n = g.children.length, c = document.createElement('p'); c.className = 'bk-swipe-n'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = `<span>${[...Array(n)].map((_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span><em>1 / ${n}</em><b></b>`;
    const hint = () => c.querySelector('b').textContent = zh() ? '左右滑动' : 'swipe'; hint(); document.addEventListener('portfolio:language', hint);
    g.after(c);
    let q = false; g.addEventListener('scroll', () => { if (q) return; q = true; requestAnimationFrame(() => { q = false;
      const w = g.children[0].getBoundingClientRect().width + 12, i = Math.min(n - 1, Math.round(g.scrollLeft / w));
      c.querySelector('em').textContent = `${i + 1} / ${n}`; c.querySelectorAll('i').forEach((d, k) => d.classList.toggle('is-on', k === i)); }); }, { passive: true });
  });
  root.querySelectorAll('.ux-section-body > p:not(.bk-note):not(.ux-research-status), .ux-section-body > .ux-flow-note, .ux-evidence-note p, .bk-entry-note, .bk-swipe > * p, .bk-swipe figcaption p').forEach(p => {
    if (p.textContent.trim().length < 70) return;
    p.classList.add('bk-clamp'); p.addEventListener('click', () => p.classList.toggle('is-open'));
  });
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
  const items = []; // content blocks no longer drift: they ran into their neighbours
  items.forEach((e, i) => e.style.setProperty('--ps', [.12, -.08, .18, -.05, .1][i % 5]));
  let q = false;
  const run = () => { q = false; const vh = innerHeight;
    if (type) { type.style.transform = type.closest('.bk-cover-pin') ? '' : `translate3d(0,${(scrollY * .38).toFixed(1)}px,0)`; const op = type.closest('[data-opening]'); op.style.setProperty('--sp', clamp(scrollY / Math.max(1, (op.parentElement.matches('.bk-cover-pin') ? op.parentElement.offsetHeight - innerHeight : op.offsetHeight * .8) * .35)).toFixed(3)); }
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
  // the phone no longer stands beside the chapters, so screens stay screens (no text-only close-ups) and nothing makes room
  const layout = on => {
    if (S) root.querySelectorAll('.v3-product-section.ux-section').forEach(sec => { const side = S.SIDE[sec.id]; if (side) { sec.dataset.phone = side; sec.classList.toggle('bk-with-phone', on); } });
    document.body.classList.toggle('bk-has-phone', on && !!S && Object.keys(S.SIDE).length > 0);
  };
  const undo = [() => { S = null; layout(false); }];
  if (calm) return;
  import('./booking-stage.mjs').then(async mod => {
    S = mod; layout(mq.matches); mq.addEventListener('change', e => { if (S) layout(e.matches); });
    if (!mod.mountStage(root)) throw new Error('WebGL unavailable');
    document.body.classList.add('bk-staged');
  }).catch(e => { console.error(e); root.querySelector('.bk-story')?.remove(); st?.classList.remove('bk-st-hidden'); undo.forEach(f => f()); });
}

// Like LOOK: pointing at a part of the page shows a small tag that says what kind of thing it is
// (a hard part, an opportunity, a rule…), so a reader knows where they are without reading the headings.
function regionTags(root) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const pill = document.createElement('div'); pill.className = 'bk-pill'; pill.setAttribute('aria-hidden', 'true'); document.body.append(pill);
  const W = [
    ['.ux-hard>*', 'Still hard', '还难的地方', 'hard'],
    ['#challenges .ux-chips li', 'Not done yet', '还没做完', 'todo'],
    ['.ux-opps>*', 'Opportunity', '机会', 'opp'],
    ['.ux-success li', 'How we’d measure it', '怎么衡量', 'measure'],
    ['.ux-principles>div', 'A design rule', '一条设计规则', 'rule'],
    ['#strategy .ux-chips li', 'Left out on purpose', '刻意不做', 'out'],
    ['.ux-blueprint', 'Who does what', '谁做什么', 'map'],
    ['.ux-iterations article', 'Before → after', '改之前 → 改之后', 'iter'],
    ['.ux-build>li', 'How it was built', '怎么做出来的', 'build'],
    ['.ux-research-plan>div', 'Still to validate', '还要验证', 'todo'],
    ['.bk-results-card:not(.is-next)', 'Proven', '已经证实', 'real'],
    ['.bk-results-card.is-next', 'Not proven yet', '尚未证实', 'todo'],
    ['.bk-ask', 'Two sides, one diary', '两端，一本日程', 'map'],
    ['.ux-roadmap li', 'What’s next', '接下来', 'opp']
  ];
  let cur = null;
  addEventListener('pointermove', e => {
    const w = e.target.closest ? W.find(([sel]) => e.target.closest(sel) && root.contains(e.target)) : null;
    if (w !== cur) { cur = w; pill.classList.toggle('is-on', !!w); if (w) { pill.textContent = document.documentElement.lang.startsWith('zh') ? w[2] : w[1]; pill.dataset.kind = w[3]; } }
    if (w) { pill.style.left = e.clientX + 'px'; pill.style.top = e.clientY + 'px'; }
  }, { passive: true });
}

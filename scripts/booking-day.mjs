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
  slips(root, calm);
  if (matchMedia('(min-width: 900px)').matches && !calm) timeline(root, moments);
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
  const cards = [...root.querySelectorAll('.ux-pains>div, .ux-challenge-grid>div, .ux-build>li, .ux-research-plan>div, .ux-journey>li, .ux-audience>div')];
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
  const place = () => { const sec = root.querySelector('.v3-product-section.ux-section'); if (sec) rail.style.setProperty('--rail-x', Math.max(74, sec.getBoundingClientRect().left - 28) + 'px'); }; place(); addEventListener('resize', place);
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

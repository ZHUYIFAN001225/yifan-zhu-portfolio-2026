// LOOK case, below the film.
//  • Acts: full-screen type that opens each main part. Every act moves differently (letters gather, a sentence splits in two,
//    a phone passes behind the words, a line turns hollow, the closing line).
//  • Two lines run down the page: pink for the user, lilac for the Creator. They stay in the side margins next to the text and
//    lean towards each other in every act: far apart, touching once at the picture, closer, side by side, and finally tied
//    together at the end. Click a line's tip and it twangs like a string; the words around it shake.
//  • The growth loop turns as you scroll past it.
//  • Each section takes a colour, so the page changes colour block by block.

const zh = () => document.documentElement.lang.startsWith('zh');
const TOOLS = ['polish', 'dryer', 'scissors', 'comb'];
const PAINT = [['#f6c6d8', '#7a1f4a'], ['#e7cdf3', '#4b1f6e'], ['#ffd6c4', '#7a3418'], ['#cbe9df', '#1d5a4a'], ['#f8e6a6', '#6b4d00']];
const BASE = { polish: PAINT[0], dryer: ['#f2e6d5', '#5a3a1c'], scissors: ['#e4d6ec', '#2a1d30'], comb: ['#d9e3f5', '#1f2f5a'] };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// Split text into letters while keeping the original text nodes, so the language switch keeps working.
function split(el) {
  if (!el) return null; if (el._lk) return el._lk;
  const saved = [], chars = [];
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3 && c.nodeValue.trim()) {
      const spans = [...c.nodeValue].map(ch => { const s = document.createElement('span'); s.className = 'lk-ch'; s.textContent = ch; if (ch.trim()) chars.push(s); return s; });
      const holder = document.createElement('span'); holder.className = 'lk-word'; holder.append(...spans);
      c.replaceWith(holder); saved.push([holder, c]);
    } else if (c.nodeType === 1 && getComputedStyle(c).display !== 'none') walk(c);
  });
  walk(el);
  const st = { chars, restore: () => { saved.forEach(([h, t]) => h.replaceWith(t)); el._lk = null; } };
  el._lk = st; return st;
}

export function mount() {
  const root = document.querySelector('[data-product-case=beauty]'); if (!root) return;
  const desktop = matchMedia('(min-width: 761px)').matches, calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // section colours
  const secs = [...root.querySelectorAll('.v3-product-section.ux-section')].filter(s => s.querySelector(':scope>h2'));
  secs.forEach((s, k) => { const [bg, ink] = BASE[TOOLS[k % 4]]; s.dataset.lkBg = bg; s.dataset.lkInk = ink; });
  const applyInk = () => secs.forEach(s => { s.querySelector(':scope>h2').style.color = s.dataset.lkInk; });
  applyInk(); document.addEventListener('portfolio:language', () => setTimeout(applyInk, 60));
  if (desktop) { try { mountLoop(); } catch {} }
  const acts = mountActs(root, calm);
  if (desktop && !calm) mountThreads(root, acts);
}

// ---------- acts ----------
function mountActs(root, calm) {
  const acts = [...root.querySelectorAll('.lk-act')].map(el => ({ el, style: el.dataset.act, p: 0 }));
  // each act takes the colour of the block it opens, so the big words and what follows read as one page
  const tone = () => acts.forEach(a => {
    let n = a.el.nextElementSibling; while (n && !(n.matches('.ux-section, .xp'))) n = n.nextElementSibling;
    if (n?.matches('.xp')) { a.el.dataset.tone = 'dark'; a.el.dataset.lkBg = '#120d13'; n.dataset.lkBg = '#120d13'; }
    else if (n) { a.el.dataset.lkBg = n.dataset.lkBg || '#e4d6ec'; a.el.style.setProperty('--act-accent', n.dataset.lkInk || '#c2457a'); }
    else { a.el.dataset.tone = 'dark'; a.el.dataset.lkBg = '#120d13'; } // the closing act sits on the footer's dark
  });
  tone();
  // the words rise once, as soon as the act comes into view, and stay; scrolling back does not replay them
  if (calm || !('IntersectionObserver' in window)) acts.forEach(a => a.el.classList.add('is-in'));
  else { const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { threshold: .3 }); acts.forEach(a => io.observe(a.el)); }
  // scroll progress through each act, used only by the two lines
  let q = false;
  const run = () => { q = false; const vh = innerHeight; acts.forEach(a => { const r = a.el.getBoundingClientRect(); a.p = clamp((vh - r.top) / (r.height + vh)); }); };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); addEventListener('resize', run); run();
  return acts;
}

// ---------- the two lines ----------
// Two quiet lines behind the content: the user (pink) starts at the left edge, the Creator (lilac) at the right.
// The further you read, the closer they come; under the closing words they meet and tie a knot.
// Bring the pointer near a line and it gives way like a string, then springs back.
function mountThreads(root, acts) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'lk-threads'); svg.setAttribute('aria-hidden', 'true');
  const mk = (tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); svg.append(e); return e; };
  const pathU = mk('path', 'lk-th lk-th--u'), pathC = mk('path', 'lk-th lk-th--c'), pathJ = mk('path', 'lk-th lk-th--j'), knot = mk('path', 'lk-th-knot');
  const dotU = mk('circle', 'lk-dot lk-dot--u'), dotC = mk('circle', 'lk-dot lk-dot--c'); [dotU, dotC].forEach(d => d.setAttribute('r', 5));
  // behind everything on the page, just above the coloured backdrop
  const bg = document.querySelector('.lk-bg'); bg ? bg.after(svg) : document.body.prepend(svg);
  const mkLabel = cls => { const p = document.createElement('p'); p.className = 'lk-th-label ' + cls; p.setAttribute('aria-hidden', 'true'); document.body.append(p); return p; };
  const labU = mkLabel('lk-th-label--u'), labC = mkLabel('lk-th-label--c'), knotSay = mkLabel('lk-knot-say');
  const words = () => { labU.textContent = zh() ? '用户' : 'User'; labC.textContent = 'Creator'; knotSay.textContent = zh() ? '用户和 Creator，连上了。' : 'User and Creator, connected.'; };
  words(); document.addEventListener('portfolio:language', words);

  let startY = 0, knotDoc = 1e9, endY = 1e9;
  const measure = () => {
    const first = acts[0]?.el, last = acts[acts.length - 1]?.el; if (!first || !last) return;
    startY = first.getBoundingClientRect().top + scrollY + innerHeight * .1;
    knotDoc = last.querySelector('.lk-act-cap').getBoundingClientRect().bottom + scrollY + 46;
    endY = last.getBoundingClientRect().bottom + scrollY;
  };
  measure(); addEventListener('resize', measure); addEventListener('load', measure); setInterval(measure, 1000);

  // where each line is at a point of the page: apart at the start, together at the knot
  const ease = t => t * t * (3 - 2 * t);
  const base = docY => {
    const W = innerWidth, P = clamp((docY - startY) / Math.max(1, knotDoc - startY)), e = ease(Math.pow(P, 1.15));
    const wave = Math.sin(docY / 520) * W * .022 * (1 - e);
    return { u: W * .045 + (W * .5 - W * .045) * e + wave, c: W * .955 - (W * .955 - W * .5) * e - Math.sin(docY / 520 + 1.3) * W * .022 * (1 - e) };
  };
  // the pointer pushes a line aside like a string
  let mx = -1e4, my = -1e4; const spring = { u: { a: 0, v: 0 }, c: { a: 0, v: 0 } };
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -1e4; });

  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const vh = innerHeight, sy = scrollY;
    const on = sy + vh > startY && sy < endY;
    document.body.classList.toggle('lk-th-on', on); if (!on) return;
    // springs
    const at = base(sy + my);
    for (const k of ['u', 'c']) { const s = spring[k], d = mx - at[k], T = Math.abs(d) < 150 && my > 0 ? -Math.sign(d) * (150 - Math.abs(d)) * .4 : 0; s.v += (T - s.a) * .12; s.v *= .8; s.a += s.v; }
    const y0 = Math.max(0, startY - sy), y1 = Math.min(vh, endY - sy), yk = knotDoc - sy;
    let dU = '', dC = '', dJ = '';
    for (let vy = y0, i = 0; vy <= y1 + 1; vy += 10, i++) {
      const y = Math.min(vy, y1), b = base(sy + y), g = Math.exp(-Math.pow((y - my) / 110, 2));
      if (y <= yk) {
        const u = b.u + spring.u.a * g, c = b.c + spring.c.a * g;
        dU += (dU ? 'L' : 'M') + u.toFixed(1) + ' ' + y.toFixed(1); dC += (dC ? 'L' : 'M') + c.toFixed(1) + ' ' + y.toFixed(1);
      } else { const x = innerWidth / 2; if (!dJ) dJ = `M${x} ${Math.max(yk, 0).toFixed(1)}`; dJ += `L${x} ${y.toFixed(1)}`; }
    }
    pathU.setAttribute('d', dU); pathC.setAttribute('d', dC); pathJ.setAttribute('d', dJ);
    // a dot rides each line in the middle of the screen
    const mid = vh * .5, bm = base(sy + mid), gm = Math.exp(-Math.pow((mid - my) / 110, 2));
    const showDots = mid >= y0 && mid <= Math.min(y1, yk);
    [[dotU, bm.u + spring.u.a * gm], [dotC, bm.c + spring.c.a * gm]].forEach(([d, x]) => { d.setAttribute('cx', x.toFixed(1)); d.setAttribute('cy', mid); d.style.opacity = showDots ? 1 : 0; });
    // labels once, where the lines begin
    const ls = startY - sy + 34, bl = base(startY + 34);
    labU.style.transform = `translate3d(${(bl.u + 14).toFixed(1)}px,${ls.toFixed(1)}px,0)`; labC.style.transform = `translate3d(${(bl.c - 14).toFixed(1)}px,${ls.toFixed(1)}px,0)`;
    const lv = ls > 40 && ls < vh - 40; labU.classList.toggle('is-on', lv); labC.classList.toggle('is-on', lv);
    // the knot where they meet
    const kx = innerWidth / 2, kv = yk > -30 && yk < vh + 30;
    if (kv) { const r = 13; knot.setAttribute('d', `M${kx - r} ${yk}c0-${r * 1.2} ${r * 2}-${r * 1.2} ${r * 2} 0s-${r * 2} ${r * 1.2}-${r * 2} 0z`); }
    knot.style.opacity = kv ? 1 : 0;
    knotSay.style.transform = `translate3d(${kx}px,${(yk + 24).toFixed(1)}px,0)`; knotSay.classList.toggle('is-on', kv && yk < vh - 40);
  };
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
}

// "The loop that makes it grow": the ring turns as you scroll past it. The step at the top lights up and the phone in the
// middle shows that step's real screen.
export function mountLoop() {
  const ol = document.querySelector('[data-product-case=beauty] .ux-flywheel'); if (!ol || ol.closest('.lk-loop')) return;
  const SHOTS = ['c-upload', 'discover', 'saved', 'detail', 'availability', 'booked', 'c-portfolio', 'similar'];
  const items = [...ol.children]; const N = items.length; if (N < 3) return;
  const wrap = document.createElement('div'); wrap.className = 'lk-loop'; wrap.style.setProperty('--n', N);
  wrap.innerHTML = `<svg class="lk-loop-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" class="lk-loop-track"/><circle cx="50" cy="50" r="40" class="lk-loop-arc" pathLength="100"/></svg>
    <div class="lk-loop-phone" aria-hidden="true"><span class="lk-loop-screen">${items.map((_, k) => `<img data-i18n-img src="assets/v3/screens/look/${SHOTS[k % SHOTS.length]}.webp" alt="" loading="lazy" decoding="async"${k ? '' : ' class="is-on"'}/>`).join('')}</span></div>
    <ol class="lk-loop-nodes"></ol>`;
  const list = wrap.querySelector('.lk-loop-nodes');
  items.forEach((li, k) => { li.style.setProperty('--k', k); li.classList.add('lk-node'); list.append(li); });
  ol.replaceWith(wrap); wrap.append(ol); ol.hidden = true;
  const imgs = [...wrap.querySelectorAll('.lk-loop-screen img')], arc = wrap.querySelector('.lk-loop-arc');
  const zhSrc = s => s.replace(/\/([^/]+)$/, '/zh/$1');
  const lang = () => imgs.forEach(i => { const en = i.dataset.enSrc || (i.dataset.enSrc = i.getAttribute('src')); const want = zh() ? zhSrc(en) : en; if (i.getAttribute('src') !== want) i.setAttribute('src', want); });
  lang(); document.addEventListener('portfolio:language', () => setTimeout(lang, 30));
  const step = 360 / N; let th = 0, target = 0, cur = -1, raf = 0;
  const calc = () => { const r = wrap.getBoundingClientRect(), vh = innerHeight; const p = clamp((vh * .75 - r.top) / (r.height + vh * .2)); target = -p * step * (N - 1); };
  const tick = () => {
    raf = 0; th += (target - th) * .12; wrap.style.setProperty('--th', th.toFixed(2));
    const a = Math.round(-th / step); const k = ((a % N) + N) % N;
    arc.style.strokeDashoffset = (100 - (-th / (step * (N - 1))) * 100).toFixed(2);
    if (k !== cur) { cur = k; items.forEach((li, j) => li.classList.toggle('is-on', j === k)); imgs.forEach((im, j) => im.classList.toggle('is-on', j === k)); }
    if (Math.abs(target - th) > .05) raf = requestAnimationFrame(tick);
  };
  const go = () => { calc(); if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', go, { passive: true }); addEventListener('resize', go); go();
}

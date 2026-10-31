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
  fold(root);
  const acts = mountActs(root, calm);
  if (desktop && !calm) mountThreads(root, acts);
}


// Long text stays one step away: each card shows its title and first line; the rest opens on hover, focus or tap.
function fold(root) {
  const sets = [
    ['.ux-decisions article', 'dl'],
    ['.ux-challenge-grid>div', 'p'],
    ['.ux-build>li', 'p'],
    ['.ux-research-plan>div', 'p'],
    ['.ux-evidence-note', 'p'],
    ['.ux-audience>div', 'p']
  ];
  sets.forEach(([sel, body]) => root.querySelectorAll(sel).forEach(card => {
    const parts = [...card.querySelectorAll(':scope ' + body + ', :scope > div > ' + body)]; if (!parts.length) return;
    card.classList.add('lk-fold'); parts.forEach(x => x.classList.add('lk-fold-body'));
    card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-expanded', 'false');
    const toggle = () => { const o = card.classList.toggle('is-open'); card.setAttribute('aria-expanded', o); };
    card.addEventListener('click', e => { if (e.target.closest('a')) return; toggle(); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }));
  // long paragraphs at the top of a section: two lines, then "more"
  root.querySelectorAll('#release .ux-section-body>p:first-child, #research .ux-section-body>p:not([class]), #build .ux-section-body>p:first-child').forEach(pp => { pp.classList.add('lk-clamp'); pp.tabIndex = 0; pp.addEventListener('click', () => pp.classList.toggle('is-open')); pp.addEventListener('keydown', e => { if (e.key === 'Enter') pp.classList.toggle('is-open'); }); });
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
  const note = mkLabel('lk-th-note');
  const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'lk-chip'; chip.innerHTML = '<i class="u"></i><b><s></s></b><i class="c"></i><span></span>'; document.body.append(chip);
  chip.addEventListener('click', () => { const last = acts[acts.length - 1]?.el; last && last.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  const words = () => {
    labU.innerHTML = zh() ? '<strong>用户</strong>想找到做这个造型的人' : '<strong>User</strong>looking for who made a look';
    labC.innerHTML = zh() ? '<strong>Creator</strong>想让作品带来客人' : '<strong>Creator</strong>wants their work to bring customers';
    note.textContent = zh() ? '往下看，平台会把他们连起来 ↓' : 'Keep scrolling: the platform brings them together ↓';
    knotSay.textContent = zh() ? '用户和 Creator，连上了。' : 'User and Creator, connected.';
    chip.setAttribute('aria-label', zh() ? '用户和 Creator 之间的距离；点一下跳到他们连上的地方' : 'How far apart the user and the Creator are; click to jump to where they meet');
  };
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
  let mx = -1e4, my = -1e4, pmx = -1e4; const spring = { u: { a: 0, v: 0 }, c: { a: 0, v: 0 } };
  // sweep across a line and it twangs: a ripple runs up and down the string from where you crossed it
  const ripples = [];
  const wave = (side, y, now) => { let d = 0; for (const r of ripples) { if (r.side !== side) continue; const t = (now - r.t) / 1000, dy = Math.abs(y - r.y); d += r.amp * Math.sin(dy / 24 - t * 16) * Math.exp(-dy / 320) * Math.exp(-t * 1.6) * (dy < t * 900 ? 1 : 0); } return d; };
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
    const now = performance.now();
    for (const k of ['u', 'c']) { const s = spring[k], d = mx - at[k], T = Math.abs(d) < 190 && my > 0 ? -Math.sign(d) * (190 - Math.abs(d)) * .55 : 0; s.v += (T - s.a) * .14; s.v *= .78; s.a += s.v;
      if (pmx > -1e3 && Math.sign(pmx - at[k]) !== Math.sign(mx - at[k]) && Math.abs(mx - pmx) > 3) { ripples.push({ side: k, y: my, t: now, amp: Math.min(30, 6 + Math.abs(mx - pmx) * 1.2) }); s.v += Math.sign(mx - pmx) * 6; } }
    pmx = mx; while (ripples.length && now - ripples[0].t > 2600) ripples.shift();
    const y0 = Math.max(0, startY - sy), y1 = Math.min(vh, endY - sy), yk = knotDoc - sy;
    let dU = '', dC = '', dJ = '';
    for (let vy = y0, i = 0; vy <= y1 + 1; vy += 10, i++) {
      const y = Math.min(vy, y1), b = base(sy + y), g = Math.exp(-Math.pow((y - my) / 110, 2));
      if (y <= yk) {
        const u = b.u + spring.u.a * g + wave('u', y, now), c = b.c + spring.c.a * g + wave('c', y, now);
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
    const lv = ls > 40 && ls < vh - 60; labU.classList.toggle('is-on', lv); labC.classList.toggle('is-on', lv);
    note.style.transform = `translate3d(${innerWidth / 2}px,${(ls + 6).toFixed(1)}px,0)`; note.classList.toggle('is-on', lv);
    // the chip: how far apart they still are
    const P = clamp((sy + vh * .5 - startY) / Math.max(1, knotDoc - startY)), left = Math.round((1 - ease(Math.pow(P, 1.15))) * 100);
    chip.style.setProperty('--gap', (left / 100).toFixed(2)); chip.classList.toggle('is-done', left <= 0);
    chip.querySelector('span').textContent = left <= 0 ? (zh() ? '已连接' : 'Connected') : (zh() ? `距离连接还有 ${left}%` : `${left}% apart`);
    // the knot where they meet
    const kx = innerWidth / 2, kv = yk > -30 && yk < vh + 30;
    if (kv) { const r = 13; knot.setAttribute('d', `M${kx - r} ${yk}c0-${r * 1.2} ${r * 2}-${r * 1.2} ${r * 2} 0s-${r * 2} ${r * 1.2}-${r * 2} 0z`); }
    knot.style.opacity = kv ? 1 : 0;
    knotSay.style.transform = `translate3d(${kx}px,${(yk + 24).toFixed(1)}px,0)`; knotSay.classList.toggle('is-on', kv && yk < vh - 40);
  };
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
}

// "The loop that makes it grow": a dial that turns as you scroll past it. The arc runs from user pink to Creator lilac,
// the step reaching the top lights up, and a real-feeling phone in the middle (thickness, metal rim, tilts with the pointer)
// shows that step's actual screen.
export function mountLoop() {
  const ol = document.querySelector('[data-product-case=beauty] .ux-flywheel'); if (!ol || ol.closest('.lk-loop')) return;
  const SHOTS = ['c-upload', 'discover', 'saved', 'detail', 'availability', 'booked', 'c-portfolio', 'similar'];
  const items = [...ol.children]; const N = items.length; if (N < 3) return;
  const ticks = Array.from({ length: 96 }, (_, k) => { const a = k / 96 * Math.PI * 2, r1 = 44.2, r2 = k % 12 === 0 ? 46.2 : 45.2; return `<line x1="${(50 + r1 * Math.cos(a)).toFixed(2)}" y1="${(50 + r1 * Math.sin(a)).toFixed(2)}" x2="${(50 + r2 * Math.cos(a)).toFixed(2)}" y2="${(50 + r2 * Math.sin(a)).toFixed(2)}"/>`; }).join('');
  const wrap = document.createElement('div'); wrap.className = 'lk-loop'; wrap.style.setProperty('--n', N);
  wrap.innerHTML = `<svg class="lk-loop-ring" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="lkArc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0457f"/><stop offset="1" stop-color="#8a5fd6"/></linearGradient><filter id="lkGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter></defs>
      <g class="lk-loop-ticks">${ticks}</g><circle cx="50" cy="50" r="40" class="lk-loop-track"/><circle cx="50" cy="50" r="40" class="lk-loop-arc" pathLength="100"/><circle r="1.6" class="lk-loop-head-glow" filter="url(#lkGlow)"/><circle r=".9" class="lk-loop-head"/></svg>
    <div class="lk-loop-phone" aria-hidden="true"><div class="lk-phone3d">${Array.from({ length: 9 }, (_, k) => `<i class="lk-ph-side" style="--z:${k + 1}"></i>`).join('')}<div class="lk-ph-front"><span class="lk-ph-screen">${items.map((_, k) => `<img src="assets/v3/screens/look/${SHOTS[k % SHOTS.length]}.webp" alt="" loading="lazy" decoding="async"${k ? '' : ' class="is-on"'}/>`).join('')}</span><i class="lk-ph-island"></i><i class="lk-ph-glare"></i></div></div><i class="lk-ph-shadow"></i></div>
    <ol class="lk-loop-nodes"></ol>`;
  const list = wrap.querySelector('.lk-loop-nodes');
  items.forEach((li, k) => {
    li.style.setProperty('--k', k); li.classList.add('lk-node');
    // keep the original text node (so translation still works), just give it its own box outside the ring
    const txt = [...li.childNodes].filter(n => n.nodeType === 3 && n.nodeValue.trim()); const lab = document.createElement('b'); lab.className = 'lk-node-label'; txt.forEach(n => lab.append(n)); li.append(lab);
    list.append(li);
  });
  ol.replaceWith(wrap); wrap.append(ol); ol.hidden = true;
  const imgs = [...wrap.querySelectorAll('.lk-ph-screen img')], arc = wrap.querySelector('.lk-loop-arc'), head = wrap.querySelector('.lk-loop-head'), glow = wrap.querySelector('.lk-loop-head-glow'), ph = wrap.querySelector('.lk-phone3d');
  const zhSrc = s => s.replace(/\/([^/]+)$/, '/zh/$1');
  const lang = () => imgs.forEach(i => { const en = i.dataset.enSrc || (i.dataset.enSrc = i.getAttribute('src')); const want = zh() ? zhSrc(en) : en; if (i.getAttribute('src') !== want) i.setAttribute('src', want); });
  lang(); document.addEventListener('portfolio:language', () => setTimeout(lang, 30));
  const step = 360 / N; let th = 0, target = 0, cur = -1, raf = 0, rx = 0, ry = 0, trx = 0, tryy = 0, swing = 0;
  const calc = () => { const r = wrap.getBoundingClientRect(), vh = innerHeight; const p = clamp((vh * .75 - r.top) / (r.height + vh * .2)); target = -p * step * (N - 1); };
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine) { wrap.addEventListener('pointermove', e => { const r = wrap.getBoundingClientRect(); tryy = ((e.clientX - r.left) / r.width - .5) * 30; trx = -((e.clientY - r.top) / r.height - .5) * 22; go(); }); wrap.addEventListener('pointerleave', () => { trx = tryy = 0; go(); }); }
  const tick = now => {
    raf = 0; th += (target - th) * .12; rx += (trx - rx) * .1; ry += (tryy - ry) * .1; swing *= .9;
    wrap.style.setProperty('--th', th.toFixed(2));
    // the arc is the trail of the steps already passed: it starts at step 01 and ends at the step now on top
    const passed = clamp(-th / 360);
    arc.style.transform = `rotate(${(th - 90).toFixed(2)}deg)`; arc.style.strokeDashoffset = (100 - passed * 100).toFixed(2);
    [head, glow].forEach(c => { c.setAttribute('cx', 50); c.setAttribute('cy', 10); });
    const k = ((Math.round(-th / step) % N) + N) % N;
    if (k !== cur) { if (cur >= 0) swing = 1; cur = k; items.forEach((li, j) => li.classList.toggle('is-on', j === k)); imgs.forEach((im, j) => im.classList.toggle('is-on', j === k)); }
    const t = (now || performance.now()) / 1000;
    ph.style.transform = `rotateX(${(8 + rx + Math.sin(t * .8) * 2).toFixed(2)}deg) rotateY(${(-14 + ry + Math.sin(t * .6) * 3 + swing * 18).toFixed(2)}deg) rotateZ(${(-3 + swing * -4).toFixed(2)}deg)`;
    ph.style.setProperty('--gl', ((ry + 15) / 30 * 100).toFixed(1) + '%');
    raf = requestAnimationFrame(tick);
  };
  const go = () => { calc(); if (!raf) raf = requestAnimationFrame(tick); };
  // keep it moving only while it is on screen
  new IntersectionObserver(es => { if (es[0].isIntersecting) go(); else { cancelAnimationFrame(raf); raf = 0; } }).observe(wrap);
  addEventListener('scroll', calc, { passive: true }); addEventListener('resize', calc); go();
}

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
  // the scattered letters are a visual copy of each line; the real text stays in place (hidden) so translation keeps working
  const gatherSetup = a => {
    a.el.querySelectorAll('.lk-act-words').forEach(src => {
      src.classList.add('lk-src'); src.nextElementSibling?.classList.contains('lk-vis') && src.nextElementSibling.remove();
      const vis = document.createElement('span'); vis.className = 'lk-vis'; vis.setAttribute('aria-hidden', 'true');
      [...src.textContent].forEach(ch => { const c = document.createElement('span'); c.className = 'lk-ch'; c.textContent = ch; if (ch.trim()) { c.style.setProperty('--dx', ((Math.random() - .5) * 900).toFixed(0)); c.style.setProperty('--dy', ((Math.random() - .5) * 600).toFixed(0)); c.style.setProperty('--dr', ((Math.random() - .5) * 120).toFixed(0)); } vis.append(c); });
      src.after(vis);
    });
  };
  acts.filter(a => a.style === 'gather').forEach(gatherSetup);
  document.addEventListener('portfolio:language', () => setTimeout(() => acts.filter(a => a.style === 'gather').forEach(gatherSetup), 60));
  if (calm) { acts.forEach(a => a.el.style.setProperty('--p', .5)); return acts; }
  let q = false;
  const run = () => {
    q = false; const vh = innerHeight;
    acts.forEach(a => {
      const r = a.el.getBoundingClientRect();
      // 0 when the act's top enters at the bottom of the screen, 1 when its bottom leaves at the top
      a.p = clamp((vh - r.top) / (r.height + vh)); a.top = r.top; a.h = r.height;
      a.el.style.setProperty('--p', a.p.toFixed(4));
    });
  };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); addEventListener('resize', run); run();
  return acts;
}

// ---------- the two lines ----------
function mountThreads(root, acts) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'lk-threads'); svg.setAttribute('aria-hidden', 'true');
  const mk = (tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); svg.append(e); return e; };
  const bridge = mk('path', 'lk-th-bridge'), pathU = mk('path', 'lk-th lk-th--u'), pathC = mk('path', 'lk-th lk-th--c'), knot = mk('path', 'lk-th-knot');
  document.body.append(svg);
  const tip = (side, label) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'lk-tip lk-tip--' + side; b.dataset.cursor = 'pluck'; b.innerHTML = `<i></i><span>${label()}</span>`; document.body.append(b); return b; };
  const lab = { u: () => zh() ? '用户' : 'User', c: () => 'Creator' };
  const tipU = tip('u', lab.u), tipC = tip('c', lab.c);
  document.addEventListener('portfolio:language', () => { tipU.querySelector('span').textContent = lab.u(); tipC.querySelector('span').textContent = lab.c(); tipU.setAttribute('aria-label', zh() ? '用户这条线：拨一下' : 'The user line: pluck it'); tipC.setAttribute('aria-label', zh() ? 'Creator 这条线：拨一下' : 'The Creator line: pluck it'); });
  tipU.setAttribute('aria-label', zh() ? '用户这条线：拨一下' : 'The user line: pluck it'); tipC.setAttribute('aria-label', zh() ? 'Creator 这条线：拨一下' : 'The Creator line: pluck it');

  // where the lines live: the margin beside the text
  let gutL = 40, gutR = innerWidth - 40, startY = 0, endY = 1e9;
  const measure = () => {
    const body = root.querySelector('.ux-section .ux-section-body') || root;
    const r = body.getBoundingClientRect(), h = root.querySelector('.ux-section>h2')?.getBoundingClientRect();
    const left = Math.min(r.left, h?.left ?? r.left), right = Math.max(r.right, h?.right ?? r.right);
    gutL = Math.max(14, left / 2); gutR = innerWidth - Math.max(14, (innerWidth - right) / 2);
    const first = acts[0]?.el.getBoundingClientRect(); startY = first ? first.top + scrollY : 0;
    const last = acts[acts.length - 1]?.el.getBoundingClientRect(); endY = last ? last.bottom + scrollY : 1e9;
  };
  measure(); addEventListener('resize', measure); setInterval(measure, 1000);

  // what each act does to the lines: where they lean to, how wide the bend is
  const W = () => innerWidth;
  const shape = {
    gather: a => ({ u: 10, c: W() - 10, amp: Math.sin(Math.PI * a.p) }),            // as far apart as they can be
    split: a => ({ u: W() / 2 - 3, c: W() / 2 + 3, amp: Math.pow(Math.sin(Math.PI * a.p), 2), touch: true }), // they touch once, at the picture
    pass: a => ({ u: W() * .4, c: W() * .6, amp: Math.sin(Math.PI * a.p) }),         // closer
    hollow: a => ({ u: W() / 2 - 16, c: W() / 2 + 16, amp: Math.sin(Math.PI * a.p), gap: true }), // side by side, not yet joined
    meet: a => ({ u: W() / 2, c: W() / 2, amp: ss(.18, .5, a.p), knot: true })      // tied together
  };
  let pluckU = 0, pluckC = 0, pluckT = 0;
  let boxes = [];
  const xAt = (vy, now) => {
    // which act covers this screen height?
    let u = gutL, c = gutR, gap = 0, knotAmp = 0;
    for (const { a, top, h } of boxes) {
      if (vy < top || vy > top + h) continue;
      const s = shape[a.style](a);
      // the bend is centred on the middle of the screen while the act is pinned, and fades out above and below the act
      // only inside the act's own dark area, so the lines never cross the text of the sections around it
      const inAct = ss(top, top + innerHeight * .3, vy) * (a.style === 'meet' ? 1 : 1 - ss(top + h - innerHeight * .3, top + h, vy));
      // once they meet at the end they stay together below the knot
      // the meeting point sits under the closing words, and moves up with them once the act scrolls away
      const cy = a.style === 'meet' ? Math.min(innerHeight * .84, top + h - innerHeight * .16) : innerHeight * .5;
      const g = a.style === 'meet' ? (vy >= cy ? 1 : Math.exp(-Math.pow((vy - cy) / (innerHeight * .12), 2))) : Math.exp(-Math.pow((vy - cy) / (innerHeight * .32), 2));
      const f = s.amp * g * inAct;
      u += (s.u - u) * f; c += (s.c - c) * f;
      if (s.gap) gap = Math.max(gap, f); if (s.knot) knotAmp = Math.max(knotAmp, s.amp * inAct);
    }
    const t = (now - pluckT) / 1000;
    if (t < 1.4) { const w = Math.sin(vy / 26 - t * 30) * 14 * Math.exp(-t * 3); u += w * pluckU; c -= w * pluckC; }
    return { u, c, gap, knotAmp };
  };
  const pluck = side => {
    pluckT = performance.now(); pluckU = side === 'u' ? 1 : .25; pluckC = side === 'c' ? 1 : .25;
    const b = side === 'u' ? tipU : tipC; b.classList.remove('is-pluck'); void b.offsetWidth; b.classList.add('is-pluck');
    // the words near the line shake
    const x = side === 'u' ? gutL : gutR, y = innerHeight * .45;
    document.querySelectorAll('.ux-section h2, .ux-section h3, .ux-section h4, .ux-section p, .ux-section li, .lk-act-line').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || !r.width) return;
      const d = Math.hypot((side === 'u' ? r.left : r.right) - x, (r.top + r.height / 2) - y); if (d > 520) return;
      el.style.setProperty('--gd', side === 'u' ? 1 : -1); el.style.setProperty('--gk', (1 - d / 520).toFixed(2)); el.style.animationDelay = Math.round(d / 3) + 'ms';
      el.classList.remove('lk-twang'); void el.offsetWidth; el.classList.add('lk-twang'); setTimeout(() => el.classList.remove('lk-twang'), 1200 + d / 3);
    });
  };
  tipU.addEventListener('click', () => pluck('u')); tipC.addEventListener('click', () => pluck('c'));
  // at the end, the knot: click it and the colour of the two lines floods the page
  knot.addEventListener('click', () => {
    const r = knot.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, R = Math.hypot(innerWidth, innerHeight) * 1.2;
    const sp = document.createElement('i'); sp.className = 'lk-splash lk-splash--front'; sp.style.left = x + 'px'; sp.style.top = y + 'px'; sp.style.width = sp.style.height = R * 2 + 'px'; document.body.append(sp);
    sp.animate([{ transform: 'translate(-50%,-50%) scale(0)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 1400, easing: 'cubic-bezier(.3,0,.2,1)' }).onfinish = () => sp.remove();
  });

  let raf = 0;
  const frame = now => {
    raf = requestAnimationFrame(frame);
    const vh = innerHeight, sy = scrollY;
    boxes = acts.map(a => ({ a, top: a.el.getBoundingClientRect().top, h: a.el.offsetHeight }));
    const on = sy + vh > startY + vh * .3 && sy < endY;
    document.body.classList.toggle('lk-th-on', on); if (!on) return;
    // draw only the part of the page that is on screen, from where the lines start to where they end
    const y0 = Math.max(0, startY - sy), y1 = Math.min(vh, endY - sy);
    let dU = '', dC = '', dB = '', knotAmp = 0, kx = 0;
    for (let vy = y0, i = 0; vy <= y1 + 1; vy += 12, i++) {
      const p = xAt(Math.min(vy, y1), now);
      dU += (i ? 'L' : 'M') + p.u.toFixed(1) + ' ' + Math.min(vy, y1).toFixed(1);
      dC += (i ? 'L' : 'M') + p.c.toFixed(1) + ' ' + Math.min(vy, y1).toFixed(1);
      if (p.gap > .4 && i % 3 === 0) dB += `M${(p.u + 4).toFixed(1)} ${vy.toFixed(1)}L${(p.c - 4).toFixed(1)} ${vy.toFixed(1)}`;
      if (p.knotAmp > knotAmp) { knotAmp = p.knotAmp; kx = (p.u + p.c) / 2; }
    }
    pathU.setAttribute('d', dU); pathC.setAttribute('d', dC); bridge.setAttribute('d', dB);
    // the knot sits where the lines meet, in the middle of the screen
    const mb = boxes.find(b => b.a.style === 'meet'), ky = mb ? Math.min(vh * .84, mb.top + mb.h - vh * .16) : vh * .84;
    { const pk = xAt(ky, now); knotAmp = (ky >= 0 && ky <= y1) ? pk.knotAmp : 0; kx = (pk.u + pk.c) / 2; }
    if (knotAmp > .55) { const k = ky, r = 16 * knotAmp; knot.setAttribute('d', `M${kx - r} ${k}c0-${r * 1.2} ${r * 2}-${r * 1.2} ${r * 2} 0s-${r * 2} ${r * 1.2}-${r * 2} 0z`); knot.style.opacity = ss(.55, .9, knotAmp); }
    else knot.style.opacity = 0;
    // tips ride the lines at 45% of the screen
    const ty = vh * .45; document.body.classList.toggle('lk-in-act', boxes.some(b => b.top <= ty && b.top + b.h >= ty));
    if (ty >= y0 && ty <= y1) { const p = xAt(ty, now); tipU.style.transform = `translate3d(${p.u.toFixed(1)}px,${ty}px,0)`; tipC.style.transform = `translate3d(${p.c.toFixed(1)}px,${ty}px,0)`; tipU.classList.add('is-on'); tipC.classList.add('is-on'); tipU.classList.toggle('is-meet', Math.abs(p.c - p.u) < 20); tipU.classList.toggle('is-side', p.u < gutL + 30); tipC.classList.toggle('is-side', p.c > gutR - 30); }
    else { tipU.classList.remove('is-on'); tipC.classList.remove('is-on'); }
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

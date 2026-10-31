// LOOK case: the beauty tools from the opening live inside the section titles, like the flowers in Léo Parpeix's headlines.
// Each title ends with its tool (nail polish, hair dryer, scissors, comb) in the same frosted tile as the opening.
//   • point at the tool: it spins
//   • move over the title: the letters react to that tool — no click needed
//       polish   – letters you touch get painted, then dry back
//       dryer    – letters are blown away from the pointer and spring back
//       scissors – the letter you touch is snipped and hangs, then heals
//       comb     – the letters near the pointer lift like hair being combed
//   • click the tool for the big version (flood the page with a new colour, a gust, a cut letter that falls, a full comb)
// Each tool's sections also take its colour, so the page changes colour block by block.

const zh = () => document.documentElement.lang.startsWith('zh');
const TOOLS = ['polish', 'dryer', 'scissors', 'comb'];
const NAMES = { polish: ['Nail polish', '指甲油'], dryer: ['Hair dryer', '吹风机'], scissors: ['Scissors', '剪刀'], comb: ['Comb', '梳子'] };
const PAINT = [['#f6c6d8', '#7a1f4a'], ['#e7cdf3', '#4b1f6e'], ['#ffd6c4', '#7a3418'], ['#cbe9df', '#1d5a4a'], ['#f8e6a6', '#6b4d00']];
const BASE = { polish: PAINT[0], dryer: ['#f2e6d5', '#5a3a1c'], scissors: ['#e4d6ec', '#2a1d30'], comb: ['#d9e3f5', '#1f2f5a'] };
const PEN = ['#e0457f', '#8b4fd1', '#e0742f', '#2f9a7a', '#c99a00'];

// Split a title into letters while keeping the original text nodes, so the language switch keeps working afterwards.
function split(el) {
  if (!el) return null; if (el._lk) return el._lk;
  const saved = [], chars = [];
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3 && c.nodeValue.trim()) {
      const spans = [...c.nodeValue].map(ch => { const s = document.createElement('span'); s.className = 'lk-ch'; s.textContent = ch; if (ch.trim()) chars.push(s); return s; });
      const holder = document.createElement('span'); holder.className = 'lk-word'; holder.append(...spans);
      c.replaceWith(holder); saved.push([holder, c]);
    } else if (c.nodeType === 1 && !c.classList.contains('lk-ico') && getComputedStyle(c).display !== 'none') walk(c);
  });
  walk(el);
  const st = { chars, restore: () => { saved.forEach(([h, t]) => h.replaceWith(t)); el._lk = null; } };
  el._lk = st; return st;
}

export function mount() {
  const secs = [...document.querySelectorAll('.ux-case .v3-product-section.ux-section')].filter(s => s.querySelector(':scope>h2'));
  if (!secs.length) return;
  try { mountLoop(); } catch {}
  const toolOf = k => TOOLS[k % TOOLS.length];
  secs.forEach((s, k) => { const [bg, ink] = BASE[toolOf(k)]; s.dataset.lkBg = bg; s.dataset.lkInk = ink; s.dataset.lkTool = toolOf(k); });
  const applyInk = () => secs.forEach(s => { s.querySelector(':scope>h2').style.color = s.dataset.lkInk; });
  applyInk();
  const svgOf = t => document.querySelector(`.fm-prop[data-prop="${t}"] svg`)?.outerHTML || '';
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const visible = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };

  // ---- click: the big version ----
  const big = {
    polish(s, b) {
      const k = (+(s.dataset.lkPaint || 0) + 1) % PAINT.length, [bg, ink] = PAINT[k], r = b.getBoundingClientRect();
      const R = Math.hypot(innerWidth, innerHeight) * 1.2, x = r.left + r.width / 2, y = r.top + r.height / 2;
      const sp = document.createElement('i'); sp.className = 'lk-splash'; sp.style.background = bg; sp.style.left = x + 'px'; sp.style.top = y + 'px'; sp.style.width = sp.style.height = R * 2 + 'px'; document.body.append(sp);
      sp.animate([{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 800, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' }).onfinish = () => {
        s.dataset.lkPaint = k; s.dataset.lkBg = bg; s.dataset.lkInk = ink; applyInk(); b.style.setProperty('--polish', PEN[k]);
        const el = document.querySelector('.lk-bg'); if (el) { el.style.transition = 'none'; el.style.backgroundColor = bg; void el.offsetWidth; el.style.transition = ''; }
        sp.remove();
      };
    },
    dryer(s, b) {
      const r = b.getBoundingClientRect(), dir = r.left > innerWidth / 2 ? -1 : 1;
      s.querySelectorAll('.v3-par, .lk-mask').forEach((c, i) => { if (!visible(c)) return; c.style.setProperty('--gd', dir); c.style.animationDelay = (i * 40) + 'ms'; c.classList.remove('lk-gust'); void c.offsetWidth; c.classList.add('lk-gust'); setTimeout(() => c.classList.remove('lk-gust'), 1400); });
      const h = s.querySelector(':scope>h2'), st = split(h); if (!st) return;
      st.chars.forEach((c, i) => { c.style.transform = ''; c.style.setProperty('--d', (dir < 0 ? st.chars.length - i : i) * 16 + 'ms'); c.style.setProperty('--w', -dir * (.6 + Math.random() * .8)); c.classList.remove('lk-flutter'); void c.offsetWidth; c.classList.add('lk-flutter'); });
      later(h);
    },
    scissors(s) {
      const h = s.querySelector(':scope>h2'), st = split(h); if (!st?.chars.length) return;
      const c = st.chars[Math.floor(Math.random() * st.chars.length)]; c.style.setProperty('--cx', Math.random() > .5 ? 1 : -1); c.classList.remove('lk-cut'); void c.offsetWidth; c.classList.add('lk-cut'); setTimeout(() => c.classList.remove('lk-cut'), 1700);
      later(h);
    },
    comb(s) {
      const els = [s.querySelector(':scope>h2'), ...[...s.querySelectorAll('h3')].filter(visible).slice(0, 2)];
      els.forEach((el, n) => { const st = split(el); if (!st) return; st.chars.forEach((c, i) => { c.style.transform = ''; c.style.setProperty('--d', (n * 120 + i * 22) + 'ms'); c.classList.remove('lk-wave'); void c.offsetWidth; c.classList.add('lk-wave'); }); later(el, 1000 + n * 120 + st.chars.length * 22); });
    }
  };
  // put the original text back once an effect is over and the pointer has left
  const later = (el, ms = 2000) => { clearTimeout(el._lkT); el._lkT = setTimeout(function tryRestore() { if (el.matches(':hover')) { el._lkT = setTimeout(tryRestore, 1000); return; } el._lk?.restore(); el.classList.remove('lk-live'); }, ms); };

  // the tool tile at the end of every title
  const addIcon = s => {
    const h = s.querySelector(':scope>h2'); if (h.querySelector('.lk-ico')) return;
    const t = s.dataset.lkTool, b = document.createElement('button');
    b.type = 'button'; b.className = 'lk-ico'; b.dataset.tool = t; b.dataset.cursor = t; b.setAttribute('aria-label', NAMES[t][zh() ? 1 : 0]);
    b.innerHTML = `<span class="lk-ico-in">${svgOf(t)}</span>`;
    let turn = 0; const spin = () => { turn += 1; b.style.setProperty('--turn', turn); };
    b.addEventListener('pointerenter', spin);
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); spin(); big[t](s, b); });
    h.append(b);
  };
  secs.forEach(addIcon);
  document.addEventListener('portfolio:language', () => setTimeout(() => { secs.forEach(s => { const h = s.querySelector(':scope>h2'); h._lk?.restore(); addIcon(s); const b = h.querySelector('.lk-ico'); if (b) b.setAttribute('aria-label', NAMES[b.dataset.tool][zh() ? 1 : 0]); }); applyInk(); }, 60));

  // ---- hover: the letters react to the tool, no click needed ----
  if (!fine) return;
  secs.forEach(s => {
    const h = s.querySelector(':scope>h2'), t = s.dataset.lkTool;
    let raf = 0, px = 0, py = 0;
    const snipped = new WeakMap();
    const run = () => {
      raf = 0; const st = h._lk; if (!st) return; const now = performance.now();
      st.chars.forEach(c => {
        const r = c.getBoundingClientRect(), dx = r.left + r.width / 2 - px, dy = r.top + r.height / 2 - py, d = Math.hypot(dx, dy);
        if (t === 'dryer') { const f = Math.max(0, 1 - d / 170); c.style.transform = f ? `translate(${(Math.sign(dx) * f * 18).toFixed(1)}px,${(-f * 6).toFixed(1)}px) rotate(${(Math.sign(dx) * f * 14).toFixed(1)}deg)` : ''; }
        else if (t === 'comb') { const f = Math.max(0, 1 - Math.abs(dx) / 150) * (d < 220 ? 1 : 0); c.style.transform = f ? `translateY(${(-f * f * .2).toFixed(3)}em) rotate(${(dx / 150 * -6 * f).toFixed(1)}deg)` : ''; }
        else if (t === 'polish') { if (d < 48 && !c.dataset.wet) { c.dataset.wet = 1; c.style.setProperty('--wet', PEN[+(s.dataset.lkPaint || 0)]); c.classList.add('is-wet'); setTimeout(() => { c.classList.remove('is-wet'); delete c.dataset.wet; }, 2600); } }
        else if (t === 'scissors') { if (d < 32 && !(snipped.get(c) > now)) { snipped.set(c, now + 1600); c.style.setProperty('--sd', Math.random() > .5 ? 1 : -1); c.classList.remove('is-snip'); void c.offsetWidth; c.classList.add('is-snip'); } }
      });
    };
    h.addEventListener('pointerenter', () => { clearTimeout(h._lkT); split(h); h.classList.add('lk-live'); h.dataset.lkLive = t; });
    h.addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(run); });
    h.addEventListener('pointerleave', () => { h._lk?.chars.forEach(c => { if (t === 'dryer' || t === 'comb') c.style.transform = ''; }); later(h, 2800); });
  });
}

// "The loop that makes it grow": the ring turns as you scroll past it. The step at the top lights up and the phone in the
// middle shows that step's real screen, so the loop reads as the product actually moving, not eight circles on a page.
export function mountLoop() {
  const ol = document.querySelector('[data-product-case=beauty] .ux-flywheel'); if (!ol || ol.closest('.lk-loop') || matchMedia('(max-width: 760px)').matches) return;
  const SHOTS = ['c-upload', 'discover', 'saved', 'detail', 'availability', 'booked', 'c-portfolio', 'similar'];
  const items = [...ol.children]; const N = items.length; if (N < 3) return;
  const wrap = document.createElement('div'); wrap.className = 'lk-loop';
  wrap.innerHTML = `<svg class="lk-loop-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" class="lk-loop-track"/><circle cx="50" cy="50" r="40" class="lk-loop-arc" pathLength="100"/></svg>
    <div class="lk-loop-phone" aria-hidden="true"><span class="lk-loop-screen">${items.map((_, k) => `<img data-i18n-img src="assets/v3/screens/look/${SHOTS[k % SHOTS.length]}.webp" alt="" loading="lazy" decoding="async"${k ? '' : ' class="is-on"'}/>`).join('')}</span></div>
    <ol class="lk-loop-nodes"></ol>`;
  const list = wrap.querySelector('.lk-loop-nodes');
  items.forEach((li, k) => { li.style.setProperty('--k', k); li.classList.add('lk-node'); list.append(li); });
  ol.replaceWith(wrap); wrap.append(ol); ol.hidden = true; // keep the empty original for print styles
  // swap in the right language for the new images now
  document.dispatchEvent(new CustomEvent('portfolio:language-images'));
  if (document.documentElement.lang.startsWith('zh')) wrap.querySelectorAll('img').forEach(i => { i.dataset.enSrc = i.getAttribute('src'); i.src = i.getAttribute('src').replace(/\/([^/]+)$/, '/zh/$1'); });
  const imgs = [...wrap.querySelectorAll('.lk-loop-screen img')], arc = wrap.querySelector('.lk-loop-arc');
  const step = 360 / N; let th = 0, target = 0, cur = -1, raf = 0;
  const calc = () => { const r = wrap.getBoundingClientRect(), vh = innerHeight; const p = Math.min(1, Math.max(0, (vh * .75 - r.top) / (r.height + vh * .2))); target = -p * step * (N - 1); };
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

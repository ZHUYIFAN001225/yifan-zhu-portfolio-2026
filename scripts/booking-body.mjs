// Glasgow Salon Booking — the body of the case, in the opening's language (trial: ?body=a or ?body=b).
//   A: it stays night — warm dark, frosted glass, lamp-amber accents.
//   B: the night ends — out of the black into warm paper, like the pages of her book.
// Both: the opening's type (Inter Tight) and its motion — every heading is lettered in and out with the scroll, as
// on oryzo.ai (headings lead with their last letter and drift from the right; lines of copy go in reading order).
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = t => 1 - (1 - t) ** 3, easeIn = t => t * t * t;

export function mountBody() {
  const v = new URLSearchParams(location.search).get('body');
  if (!/^[ab]$/.test(v || '')) return;
  const html = document.documentElement; html.dataset.body = v;
  const day = document.querySelector('.bk-day'); if (!day) return;

  // a small switch, so the two can be compared on the same page
  const sw = document.createElement('div'); sw.className = 'bk-body-switch';
  sw.innerHTML = ['a', 'b'].map(k => `<a href="?body=${k}${location.hash}" class="${k === v ? 'is-on' : ''}">${k.toUpperCase()}</a>`).join('');
  document.body.append(sw);

  if (v === 'a') glassLight(day);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const HEAD = '.v3-product-section.ux-section>h2, .ux-question, .ux-subhead, .bk-moment-kicker, .bk-moment-line, .bk-receipt-t, .bk-minute h3, .bk-minute .bk-receipt-k, .bk-receipt>.bk-receipt-k';
  const COPY = '.bk-moment-cap';
  // the sweep is drawn as a mask across each line — the text nodes are left alone, so the language switch still works
  let items = [];
  function build() { items = [...day.querySelectorAll(HEAD)].map(el => ({ el, h: true, last: '' })).concat([...day.querySelectorAll(COPY)].map(el => ({ el, h: false, last: '' }))); tick(); }
  function tick() {
    raf = 0; const H = innerHeight, D = innerWidth * .06;
    for (const it of items) {
      const r = it.el.getBoundingClientRect(); if (r.bottom < -40 || r.top > H + 40) continue;
      const tin = clamp((H - r.top) / (H * .45)), tout = clamp((H * .16 - r.bottom) / (H * .3));
      const key = tin.toFixed(3) + tout.toFixed(3); if (key === it.last) continue; it.last = key;
      const S = it.h ? .5 : .35, stops = [];
      for (let j = 0; j <= 8; j++) { const f = j / 8, k = it.h ? 1 - f : f; const a = clamp(tin * (1 + S) - S * k) * (1 - clamp(tout * (1 + S) - S * k)); stops.push(`rgba(0,0,0,${a.toFixed(3)}) ${(f * 100).toFixed(1)}%`); }
      const m = `linear-gradient(90deg, ${stops.join(', ')})`; it.el.style.maskImage = it.el.style.webkitMaskImage = m;
      const x = it.h ? D * (.6 * (1 - easeOut(tin)) - .6 * easeIn(tout)) : D * (-.35 * (1 - easeOut(tin)) + .35 * easeIn(tout));
      it.el.style.translate = `${x.toFixed(1)}px 0`;
    }
  }
  let raf = 0; const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask);
  build();
}

// A: every pane of frosted glass has a thickness, and its edge catches the light from the side the pointer is on —
// the pointer is a lamp held beside the glass; the nearer it is, the brighter the rim and the faint sheen inside
function glassLight(day) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const GLASS = '.bk-sheet, .bk-receipt, .bk-minute li, .bk-ask, .bk-entry li, .bk-results-card, .bk-slip, .bk-textonly, .bk-owner, nav.bk-map, .bk-ledger-list>li, .ux-section .ux-persona, .ux-section .ux-principles>div, .ux-section .ux-process>li, .ux-section .ux-success>li, .ux-iterations .ux-before-after p, .bk-dom-slip, .ux-pains>div.bk-sticky, .bk-ledger.is-after';
  const els = [];
  const scan = () => day.querySelectorAll(GLASS).forEach(el => {   // the drawn parts of the page arrive later; look again
    if (el.querySelector(':scope>.bk-glint')) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const sheen = document.createElement('i'); sheen.className = 'bk-glow'; sheen.setAttribute('aria-hidden', 'true');
    const rim = document.createElement('i'); rim.className = 'bk-glint'; rim.setAttribute('aria-hidden', 'true');
    el.append(sheen, rim); el.classList.add('is-glass'); els.push(el);
  });
  scan(); [800, 2000, 4500].forEach(t => setTimeout(scan, t));
  let mx = -1e4, my = -1e4, raf = 0;
  const paint = () => { raf = 0;
    for (const el of els) { const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) continue;
      const dx = Math.max(r.left - mx, 0, mx - r.right), dy = Math.max(r.top - my, 0, my - r.bottom), d = Math.hypot(dx, dy);
      el.style.setProperty('--mx', `${(mx - r.left).toFixed(0)}px`); el.style.setProperty('--my', `${(my - r.top).toFixed(0)}px`);
      el.style.setProperty('--mi', Math.max(0, 1 - d / 420).toFixed(3)); } };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; ask(); }, { passive: true });
  addEventListener('scroll', ask, { passive: true });
}

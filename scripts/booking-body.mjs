// Glasgow Salon Booking — the body of the case, in the opening's language (trial: ?body=a or ?body=b).
//   A: it stays night — warm dark, frosted glass, lamp-amber accents.
//   B: the night ends — out of the black into warm paper, like the pages of her book.
// Both: the opening's type (Inter Tight) and its motion — every heading is lettered in and out with the scroll, as
// on oryzo.ai (headings lead with their last letter and drift from the right; lines of copy go in reading order).
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = t => 1 - (1 - t) ** 3, easeIn = t => t * t * t;

export function mountBody() {
  const v = new URLSearchParams(location.search).get('body') === 'b' ? 'b' : 'a';   // the dark case is the case now (b kept only as a reference)
  const html = document.documentElement; html.dataset.body = v;
  const day = document.querySelector('.bk-day'); if (!day) return;

  if (v === 'a') { glassLight(day); lumen(day); }
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

// A: every pane takes the glass material — lit by its own thick rim; the pointer only lights the edge it is near
function glassLight(day) {
  const GLASS = '.bk-sheet, .bk-receipt, .bk-minute li, .bk-ask, .bk-entry li, .bk-results-card, .bk-slip, .bk-textonly, .bk-owner, nav.bk-map, .bk-ledger-list>li, .ux-section .ux-persona, .ux-section .ux-principles>div, .ux-section .ux-process>li, .ux-section .ux-success>li, .ux-iterations .ux-before-after p, .bk-dom-slip, .ux-pains>div.bk-sticky, .bk-ledger.is-after, .bk-dom-card';
  // each pane gets its own lit rim (an element, so it can be a gradient ring): that rim is what gives the glass its thickness
  const scan = () => day.querySelectorAll(GLASS).forEach(el => {   // the drawn parts arrive later; look again
    el.classList.add('is-glass'); if (el.querySelector(':scope>.bk-rim')) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const rim = document.createElement('i'); rim.className = 'bk-rim'; rim.setAttribute('aria-hidden', 'true');
    rim.innerHTML = '<b class="v"></b><b class="i"></b><b class="o"></b><b class="h"></b><s><b></b></s>'; el.append(rim);
    // only while the pointer is over the pane: a light runs along its edge, following the pointer
    if (hover) {
      el.addEventListener('pointerenter', () => el.classList.add('is-lit'));
      el.addEventListener('pointerleave', () => el.classList.remove('is-lit'));
      el.addEventListener('pointermove', e => { const r = rim.getBoundingClientRect(); rim.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px'); rim.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px'); }, { passive: true });
    }
  });
  const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  scan(); [800, 2000, 4500].forEach(t => setTimeout(scan, t));
}

// A: the chapter list's rail as a lit slider — the part already read glows lamp-amber, and the line bends away around the
// current chapter, where a small glass knob sits with the light spilling out behind it
function lumen(day) {
  const NS = 'http://www.w3.org/2000/svg', X = 21, B = 14, W2 = 24;
  const rails = [];
  const add = () => day.querySelectorAll('.bk-script').forEach(ol => {
    if (ol.querySelector(':scope>.bk-lumen')) return;
    ol.classList.add('has-lumen');
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'bk-lumen'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<defs><filter id="bkl-b" x="-2" y="-1" width="5" height="3"><feGaussianBlur stdDeviation="5"/></filter></defs><path class="t"/><path class="g"/><path class="l"/><circle class="halo" r="16"/>';
    const knob = document.createElement('i'); knob.className = 'bk-knob'; knob.setAttribute('aria-hidden', 'true');
    ol.prepend(svg); ol.append(knob);
    rails.push({ ol, svg, knob, t: svg.querySelector('.t'), g: svg.querySelector('.g'), l: svg.querySelector('.l'), halo: svg.querySelector('.halo'), ky: null, kf: 0 });
  });
  add(); [900, 2500].forEach(t => setTimeout(add, t));
  const path = (y0, y1, ky, amt) => { // a vertical line with a smooth bend at ky
    let d = ''; const st = 3;
    for (let y = y0; y <= y1 + .01; y += st) { const u = (y - ky) / W2, x = X - B * amt * Math.exp(-u * u * 2.2); d += (d ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(1); }
    return d;
  };
  let last = performance.now();
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.06, (now - last) / 1000); last = now; const E = r => 1 - Math.exp(-dt * r);
    for (const R of rails) {
      const r = R.ol.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50 || !r.height) continue;
      const lis = [...R.ol.children].filter(n => n.tagName === 'LI'); if (!lis.length) continue;
      const on = lis.find(li => li.classList.contains('is-on'));
      const mid = li => li.offsetTop + Math.min(li.offsetHeight / 2, 15);
      const want = on ? mid(on) : mid(lis[0]);
      R.ky = R.ky == null ? want : R.ky + (want - R.ky) * E(7);
      R.kf += ((on ? 1 : 0) - R.kf) * E(5);
      const sig = `${R.ky.toFixed(1)}|${R.kf.toFixed(3)}|${R.ol.offsetHeight}`; if (sig === R.sig) continue; R.sig = sig;   // nothing moved: leave the page alone
      const H = R.ol.offsetHeight, y0 = mid(lis[0]) - 8, y1 = mid(lis[lis.length - 1]) + 8;
      R.svg.setAttribute('viewBox', `0 0 44 ${H}`); R.svg.style.height = H + 'px';
      R.t.setAttribute('d', path(y0, y1, R.ky, R.kf));
      const ly = Math.max(y0, R.ky); R.l.setAttribute('d', path(y0, ly, R.ky, R.kf)); R.g.setAttribute('d', path(Math.max(y0, R.ky - 40), ly, R.ky, R.kf));
      R.g.style.opacity = R.kf.toFixed(3);
      const kx = X - B * R.kf; R.halo.setAttribute('cx', (kx + 2).toFixed(1)); R.halo.setAttribute('cy', R.ky.toFixed(1)); R.halo.style.opacity = (R.kf * .9).toFixed(3);
      R.knob.style.transform = `translate3d(${(X + 5 * R.kf).toFixed(1)}px,${R.ky.toFixed(1)}px,0) translate(-50%,-50%) scale(${(.6 + .4 * R.kf).toFixed(3)})`;
      R.knob.style.opacity = (.25 + .75 * R.kf).toFixed(3);
    }
  };
  requestAnimationFrame(tick);
}

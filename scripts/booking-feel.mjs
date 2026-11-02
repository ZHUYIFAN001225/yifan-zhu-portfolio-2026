// Glasgow Salon Booking — how the page scrolls (gentle inertia) and the ruler down the right edge.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ---------- the rest of the page: inertia scrolling (Lenis-like, lerp .1) and the edge ruler ----------
export function mountFeel() {
  if (window.__bkFeel || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.__bkFeel = true;
  let target = scrollY, cur = scrollY, running = false, ours = false;
  const canScroll = (el, dy) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1) { if (dy > 0 ? e.scrollTop + e.clientHeight < e.scrollHeight - 1 : e.scrollTop > 0) return true; } } return false; };
  addEventListener('wheel', e => {
    if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || canScroll(e.target, e.deltaY)) return;
    e.preventDefault();
    if (!running) { cur = scrollY; target = scrollY; }
    const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    target = clamp(target + d, 0, document.documentElement.scrollHeight - innerHeight);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(step); }
  }, { passive: false });
  let last = performance.now();
  function step(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    cur += (target - cur) * (1 - Math.exp(-dt * 6)); // Lenis' default: lerp .1 at 60 fps
    if (Math.abs(target - cur) < .3) { cur = target; running = false; }
    ours = true; scrollTo(0, cur); ours = false;
    if (running) requestAnimationFrame(step);
  }
  addEventListener('scroll', () => { if (!ours && !running) cur = target = scrollY; }, { passive: true });
  addEventListener('pointerdown', () => { running = false; target = cur = scrollY; }, { passive: true });
  // the edge ruler
  const c = document.createElement('canvas'); c.className = 'bk-ruler'; c.setAttribute('aria-hidden', 'true'); document.body.append(c);
  const x = c.getContext('2d'); let my = -999, raf = 0;
  const draw = () => { raf = 0; const d = Math.min(devicePixelRatio || 1, 2), w = 22, h = innerHeight; if (c.width !== w * d || c.height !== h * d) { c.width = w * d; c.height = h * d; }
    x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, h); const gap = 9, off = -(scrollY % gap);
    for (let y = off; y < h; y += gap) { const k = clamp(1 - Math.abs(y - my) / 90), len = 4 + k * 12 + ((Math.round((y - off + scrollY) / gap)) % 10 === 0 ? 4 : 0);
      x.fillStyle = `rgba(16,32,26,${.22 + k * .6})`; x.fillRect(w - len, y, len, 1); }
    const p = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); x.fillStyle = '#1f9e6c'; x.fillRect(w - 2, p * (h - 40), 2, 40); };
  const ask = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask);
  addEventListener('pointermove', e => { my = e.clientX > innerWidth - 160 ? e.clientY : -999; ask(); }, { passive: true });
  draw();
}

// One piece of music across the whole site. It carries on from page to page (position is remembered for the
// session), fades out whenever a site video with sound starts playing, and comes back when the video stops.
// The track lives at assets/audio/theme.mp3; until that file exists, nothing plays and the button stays hidden.
(() => {
  const SRC = 'assets/audio/theme.mp3', LEVEL = 0.35;
  const K = { on: 'portfolio-music', t: 'portfolio-music-t' };
  const zh = () => document.documentElement.lang.startsWith('zh');
  let on = true; try { on = localStorage.getItem(K.on) !== 'off'; } catch {}
  const a = new Audio(); a.loop = true; a.preload = 'auto'; a.volume = 0; a.src = SRC;
  let ok = false, ducked = false, fadeT = null, started = false;
  const fadeTo = (v, ms = 900) => { clearInterval(fadeT); const from = a.volume, t0 = performance.now(); fadeT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (v - from) * k; if (k >= 1) { clearInterval(fadeT); if (v === 0 && !on) a.pause(); } }, 40); };
  const want = () => on && !ducked && !document.hidden;
  const update = () => { if (!ok) return; if (want()) { if (a.paused) a.play().then(() => { started = true; fadeTo(LEVEL); }).catch(() => {}); else fadeTo(LEVEL); } else fadeTo(0, 600); btn?.setAttribute('aria-pressed', on); };
  a.addEventListener('canplay', () => { ok = true; try { const t = +sessionStorage.getItem(K.t); if (t > 0 && t < a.duration - 2) a.currentTime = t; } catch {} if (btn?.classList.contains('site-music')) btn.removeAttribute('hidden'); update(); }, { once: true });
  a.addEventListener('error', () => { ok = false; if (btn?.classList.contains('site-music')) btn.setAttribute('hidden', ''); });
  // remember where we are, so the next page carries on from here
  setInterval(() => { if (started && !a.paused) try { sessionStorage.setItem(K.t, a.currentTime); } catch {} }, 1000);
  addEventListener('pagehide', () => { try { sessionStorage.setItem(K.t, a.currentTime); } catch {} });
  // browsers only let sound start after a gesture: the first click anywhere is enough
  ['pointerdown', 'keydown', 'touchend'].forEach(t => addEventListener(t, () => { if (ok && want() && a.paused) update(); }, { passive: true }));
  document.addEventListener('visibilitychange', update);
  // any site video with sound takes over; muted loops (backgrounds, previews) don't count
  const watch = v => { if (v.dataset.musicWatched) return; v.dataset.musicWatched = '1';
    const check = () => { const loud = [...document.querySelectorAll('video')].some(x => !x.paused && !x.ended && !x.muted && x.volume > 0); if (loud !== ducked) { ducked = loud; update(); } };
    ['play', 'playing', 'pause', 'ended', 'volumechange'].forEach(e => v.addEventListener(e, check)); };
  const scan = () => document.querySelectorAll('video').forEach(watch);
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  // the button: explore page has its own; other pages get a small one
  let btn = document.querySelector('[data-sound]');
  if (!btn) {
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'site-music'; btn.hidden = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path class="on" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.6a7.6 7.6 0 0 1 0 10.8"/><path class="off" d="m16 9.5 5 5m0-5-5 5"/></svg><i></i>';
    const st = document.createElement('style'); st.textContent = '.site-music{position:fixed;left:18px;bottom:18px;z-index:60;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(243,242,238,.16);background:rgba(16,17,19,.6);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);cursor:pointer;color:#f3f2ee}.site-music svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.site-music[aria-pressed=true] .off,.site-music[aria-pressed=false] .on{display:none}.site-music i{position:absolute;inset:-1px;border-radius:50%;border:1px solid rgba(121,199,255,.6);opacity:0}.site-music[aria-pressed=true]:not(.is-quiet) i{animation:sm-pulse 2.8s ease-out infinite}@keyframes sm-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.7);opacity:0}}html[data-theme=light] .site-music{background:rgba(255,255,255,.7);color:#111;border-color:rgba(0,0,0,.12)}@media print{.site-music{display:none}}';
    document.head.append(st); document.body.append(btn);
  }
  const label = () => btn.setAttribute('aria-label', zh() ? '背景音乐' : 'Background music');
  label(); document.addEventListener('portfolio:language', label);
  btn.setAttribute('aria-pressed', on);
  btn.addEventListener('click', () => { on = !on; try { localStorage.setItem(K.on, on ? 'on' : 'off'); } catch {} update(); window.dispatchEvent(new CustomEvent('portfolio:music', { detail: { on } })); });
  window.siteMusic = { get ready() { return ok; }, get on() { return on; }, get volume() { return a.volume; } };
})();

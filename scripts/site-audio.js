// One piece of music across the whole site. It carries on from page to page (position is remembered for the
// session), fades out whenever a site video with sound starts playing, and comes back when the video stops.
// The track lives at assets/audio/theme.mp3; until that file exists, nothing plays and the button stays hidden.
(() => {
  const SRC = 'assets/audio/theme.mp3', LEVEL = 0.35;
  const K = { on: 'portfolio-music', t: 'portfolio-music-t' };
  const zh = () => document.documentElement.lang.startsWith('zh');
  let on = true; try { on = localStorage.getItem(K.on) !== 'off'; } catch {}
  const a = new Audio(); a.loop = true; a.preload = 'auto'; a.volume = 0; a.src = SRC;
  let ok = false, failed = false, ducked = false, fadeT = null, started = false;
  const fadeTo = (v, ms = 900) => { clearInterval(fadeT); const from = a.volume, t0 = performance.now(); fadeT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (v - from) * k; if (k >= 1) { clearInterval(fadeT); if (v === 0 && !on) a.pause(); } }, 40); };
  const want = () => on && !ducked && !document.hidden;
  const update = () => { if (!ok) return; if (want()) { if (a.paused) a.play().then(() => { started = true; fadeTo(LEVEL); analyse(); }).catch(() => {}); else fadeTo(LEVEL); } else fadeTo(0, 600); btn?.setAttribute('aria-pressed', on); };
  a.addEventListener('canplay', () => { ok = true; try { const t = +sessionStorage.getItem(K.t); if (t > 0 && t < a.duration - 2) a.currentTime = t; } catch {} if (btn?.classList.contains('site-music')) btn.removeAttribute('hidden'); update(); }, { once: true });
  a.addEventListener('error', () => { ok = false; failed = true; if (btn?.classList.contains('site-music')) btn.setAttribute('hidden', ''); window.dispatchEvent(new Event('portfolio:music-missing')); });
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
  const BARS = '<span class="sm-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  let btn = document.querySelector('[data-sound]');
  if (!btn) {
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'site-music'; btn.hidden = true;
    document.body.append(btn);
  }
  btn.innerHTML = BARS; btn.classList.add('sm');
  const st = document.createElement('style'); st.textContent = `
.site-music{position:fixed;left:18px;bottom:18px;z-index:60;width:44px;height:44px;border-radius:50%;border:1px solid rgba(243,242,238,.16);background:rgba(16,17,19,.6);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);cursor:pointer;color:#f3f2ee}
.sm{display:grid;place-items:center;padding:0}
.sm-bars{display:flex;align-items:flex-end;gap:2.5px;height:14px}
.sm-bars i{display:block;width:2.5px;height:3px;border-radius:2px;background:currentColor;transform-origin:50% 100%;transition:height .18s ease,opacity .3s}
.sm[aria-pressed=false] .sm-bars i{height:2px!important;opacity:.45}
.sm[aria-pressed=false]{color:rgba(243,242,238,.6)}
.sm.is-idle[aria-pressed=true] .sm-bars i{height:3px!important}
.sm.is-css[aria-pressed=true]:not(.is-idle) .sm-bars i{animation:sm-eq 1.1s ease-in-out infinite alternate}
.sm.is-css .sm-bars i:nth-child(2){animation-duration:.9s;animation-delay:-.3s}.sm.is-css .sm-bars i:nth-child(3){animation-duration:1.3s;animation-delay:-.6s}.sm.is-css .sm-bars i:nth-child(4){animation-duration:.8s;animation-delay:-.2s}.sm.is-css .sm-bars i:nth-child(5){animation-duration:1.2s;animation-delay:-.8s}
@keyframes sm-eq{from{height:3px}to{height:14px}}
html[data-theme=light] .site-music{background:rgba(255,255,255,.7);color:#111;border-color:rgba(0,0,0,.12)}
@media print{.site-music{display:none}}
@media (max-width:760px){.site-music{left:auto;right:14px;bottom:calc(env(safe-area-inset-bottom) + 18px)}}
@media (prefers-reduced-motion:reduce){.sm.is-css .sm-bars i{animation:none;height:7px!important}}`;
  document.head.append(st);
  const bars = [...btn.querySelectorAll('.sm-bars i')];
  // the bars follow the music itself; if the browser won't let us analyse it, a CSS animation stands in
  let an = null, data = null, vis = 0;
  function analyse() {
    if (an || !started) return;
    try { const C = window.AudioContext || window.webkitAudioContext; const ctx = new C(); const src = ctx.createMediaElementSource(a); an = ctx.createAnalyser(); an.fftSize = 64; an.smoothingTimeConstant = .7; src.connect(an); an.connect(ctx.destination); data = new Uint8Array(an.frequencyBinCount); if (ctx.state === 'suspended') ctx.resume(); btn.classList.remove('is-css'); }
    catch { an = null; btn.classList.add('is-css'); }
  }
  btn.classList.add('is-css');
  const bins = [0, 1, 2, 3, 5];
  function draw() {
    vis = requestAnimationFrame(draw);
    const playing = !a.paused && a.volume > 0.02 && on;
    btn.classList.toggle('is-idle', !playing);
    if (!an || !playing) return;
    an.getByteFrequencyData(data);
    bars.forEach((b, i) => { const v = data[bins[i]] / 255; b.style.height = (3 + Math.pow(v, 1.8) * 12 * Math.min(1, a.volume / LEVEL + .2)).toFixed(1) + 'px'; });
  }
  draw();
  a.addEventListener('playing', analyse);
  const label = () => btn.setAttribute('aria-label', zh() ? '背景音乐' : 'Background music');
  label(); document.addEventListener('portfolio:language', label);
  btn.setAttribute('aria-pressed', on);
  btn.addEventListener('click', () => { on = !on; try { localStorage.setItem(K.on, on ? 'on' : 'off'); } catch {} update(); window.dispatchEvent(new CustomEvent('portfolio:music', { detail: { on } })); });
  window.siteMusic = { get ready() { return ok; }, get failed() { return failed; }, get on() { return on; }, get volume() { return a.volume; } };
})();

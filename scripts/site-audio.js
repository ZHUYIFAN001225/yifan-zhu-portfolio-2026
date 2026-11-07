// One piece of music across the whole site. It carries on from page to page (position is remembered for the
// session), fades out whenever a site video with sound starts playing, and comes back when the video stops.
// Works on phones too: iOS ignores <audio>.volume and won't load audio before a tap, so the first tap builds a
// small Web Audio graph (element → gain → analyser → speakers) and every fade goes through that gain.
(() => {
  const SRC = 'assets/audio/theme.mp3?v=2', LEVEL = 0.35;
  const K = { on: 'portfolio-music', t: 'portfolio-music-t' };
  const zh = () => document.documentElement.lang.startsWith('zh');
  let on = true; try { on = localStorage.getItem(K.on) !== 'off'; } catch {}
  const a = new Audio(); a.loop = true; a.preload = 'auto'; a.src = SRC; a.setAttribute('playsinline', '');
  let ctx = null, gain = null, an = null, data = null;
  let failed = false, ducked = false, started = false, level = 0, fadeT = null;

  // ---- volume: through the gain node when we have one, otherwise the element (desktop before the first tap)
  const setVol = v => { level = v; if (gain) gain.gain.setTargetAtTime(v, ctx.currentTime, 0.05); else try { a.volume = v; } catch {} };
  const fadeTo = (v, ms = 900) => {
    clearInterval(fadeT); const from = level, t0 = performance.now();
    fadeT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); setVol(from + (v - from) * k); if (k >= 1) { clearInterval(fadeT); if (v === 0) a.pause(); } }, 40);
  };
  setVol(0);
  const want = () => on && !ducked && !document.hidden && !failed;

  function graph() { // must run inside a user gesture on iOS
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; ctx = new C();
      const src = ctx.createMediaElementSource(a); gain = ctx.createGain(); gain.gain.value = level;
      an = ctx.createAnalyser(); an.fftSize = 64; an.smoothingTimeConstant = 0.7; data = new Uint8Array(an.frequencyBinCount);
      src.connect(gain); gain.connect(an); an.connect(ctx.destination);
      try { a.volume = 1; } catch {}
      if (ctx.state === 'suspended') ctx.resume();
    } catch { ctx = null; gain = null; an = null; }
  }
  function resumeAt() { try { const t = +sessionStorage.getItem(K.t); if (t > 0 && isFinite(a.duration) && t < a.duration - 2) a.currentTime = t; } catch {} }
  a.addEventListener('loadedmetadata', resumeAt, { once: true });
  function update(fromGesture) {
    if (fromGesture) graph();
    if (want()) {
      if (a.paused) { const p = a.play(); if (p) p.then(() => { started = true; fadeTo(LEVEL); }).catch(() => {}); }
      else fadeTo(LEVEL);
    } else if (!a.paused) fadeTo(0, 600);
    paint();
  }
  a.addEventListener('error', () => { failed = true; paint(); window.dispatchEvent(new Event('portfolio:music-missing')); });
  // remember where we are, so the next page carries on from here
  setInterval(() => { if (started && !a.paused) try { sessionStorage.setItem(K.t, a.currentTime); } catch {} }, 1000);
  addEventListener('pagehide', () => { try { sessionStorage.setItem(K.t, a.currentTime); } catch {} });
  // browsers (iOS above all) only let sound start inside a tap or click
  const gesture = e => { if (e.target.closest?.('.sm')) return; if (want() && a.paused) update(true); };
  ['pointerdown', 'click', 'touchend', 'keydown'].forEach(t => addEventListener(t, gesture, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', () => update(false));
  // any site video with sound takes over; muted loops (backgrounds, previews) don't count
  const check = () => { const loud = [...document.querySelectorAll('video')].some(x => !x.paused && !x.ended && !x.muted && x.volume > 0); if (loud !== ducked) { ducked = loud; update(false); } };
  const watch = v => { if (v.dataset.musicWatched) return; v.dataset.musicWatched = '1'; ['play', 'playing', 'pause', 'ended', 'volumechange'].forEach(e => v.addEventListener(e, check)); };
  const scan = () => document.querySelectorAll('video').forEach(watch);
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });

  // ---- the button: five bars. Still and varied when ready, dancing with the music when it plays, flat when off.
  const BARS = '<span class="sm-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  let btn = document.querySelector('[data-sound]');
  if (!btn) { btn = document.createElement('button'); btn.type = 'button'; btn.className = 'site-music'; document.body.append(btn); }
  btn.innerHTML = BARS; btn.classList.add('sm');
  const st = document.createElement('style'); st.textContent = `
.site-music{position:fixed;left:18px;bottom:18px;z-index:60;width:44px;height:44px;border-radius:50%;border:1px solid rgba(243,242,238,.18);background:rgba(16,17,19,.62);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);cursor:pointer;color:#f3f2ee}
.sm{display:grid;place-items:center;padding:0;-webkit-tap-highlight-color:transparent}
.sm-bars{display:flex;align-items:flex-end;gap:2.5px;height:15px}
.sm-bars i{display:block;width:2.5px;border-radius:2px;background:currentColor;transition:height .16s ease,opacity .3s}
.sm-bars i:nth-child(1){height:6px}.sm-bars i:nth-child(2){height:11px}.sm-bars i:nth-child(3){height:8px}.sm-bars i:nth-child(4){height:14px}.sm-bars i:nth-child(5){height:7px}
.sm[aria-pressed=false] .sm-bars i{height:2px!important;opacity:.5}
.sm.is-dance .sm-bars i{animation:sm-eq 1s ease-in-out infinite alternate}
.sm.is-dance .sm-bars i:nth-child(2){animation-duration:.8s;animation-delay:-.3s}.sm.is-dance .sm-bars i:nth-child(3){animation-duration:1.2s;animation-delay:-.6s}.sm.is-dance .sm-bars i:nth-child(4){animation-duration:.7s;animation-delay:-.2s}.sm.is-dance .sm-bars i:nth-child(5){animation-duration:1.1s;animation-delay:-.8s}
.sm.is-live .sm-bars i{animation:none}
@keyframes sm-eq{from{height:3px}to{height:15px}}
html[data-theme=light] .site-music{background:rgba(255,255,255,.75);color:#111;border-color:rgba(0,0,0,.12)}
@media (max-width:760px){.site-music{left:auto;right:14px;bottom:calc(env(safe-area-inset-bottom) + 84px)}}
@media print{.site-music{display:none}}
@media (prefers-reduced-motion:reduce){.sm.is-dance .sm-bars i{animation:none}}`;
  document.head.append(st);
  const bars = [...btn.querySelectorAll('.sm-bars i')], bins = [0, 1, 2, 3, 5];
  function paint() { btn.setAttribute('aria-pressed', on && !failed); btn.hidden = failed && btn.classList.contains('site-music'); }
  (function draw() {
    requestAnimationFrame(draw);
    const playing = on && !a.paused && level > 0.02;
    btn.classList.toggle('is-dance', playing && !an);
    btn.classList.toggle('is-live', playing && !!an);
    if (playing && an) { an.getByteFrequencyData(data); bars.forEach((b, i) => { b.style.height = (3 + Math.pow(data[bins[i]] / 255, 1.8) * 12).toFixed(1) + 'px'; }); }
    else if (bars[0].style.height) bars.forEach(b => { b.style.height = ''; });
  })();
  const label = () => btn.setAttribute('aria-label', on ? (zh() ? '背景音乐：开（点击关闭）' : 'Background music: on (tap to turn off)') : (zh() ? '背景音乐：关（点击打开）' : 'Background music: off (tap to turn on)'));
  label(); document.addEventListener('portfolio:language', label);
  btn.addEventListener('click', () => {
    // Music is "on" but the browser hasn't let it start yet (no tap so far): this tap starts it, it doesn't turn it off.
    if (on && !failed && (a.paused || level < 0.02) && !ducked) { update(true); return; }
    on = !on; try { localStorage.setItem(K.on, on ? 'on' : 'off'); } catch {}
    if (on) update(true); else fadeTo(0, 500);
    paint(); label(); window.dispatchEvent(new CustomEvent('portfolio:music', { detail: { on } }));
  });
  paint();
  // carry straight on when the page opens; browsers that need a tap first start on the first tap instead
  if (want()) update(false);
  window.siteMusic = { get ready() { return !failed; }, get failed() { return failed; }, get on() { return on; }, get volume() { return level; } };
})();

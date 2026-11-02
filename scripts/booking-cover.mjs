// Glasgow Salon Booking — opening, rebuilt after premotio.com (Three.js scene + smooth scroll + pointer details).
// • A WebGL scene of poster cards made from the real screens. Each card is drawn with a shader that smears it along
//   its own screen-space motion and splits the colour channels (the reference's streaky "light-leak" motion blur), and
//   blurs it with a chromatic halo when it is far from the focal plane (depth of field).
// • Sequence on scroll: swarm → drawn into a turning drum → the drum peels off card by card into a tilted table that
//   fills the left half (hard edge) → a second statement arrives on the right → release.
// • Pointer: the whole scene leans toward it; cards near it drift away; letters of the headline under it light up.
// • A thin ruler on the right edge ticks past with the scroll and stretches toward the pointer.
// • The page scrolls with inertia (a small Lenis-like smoother; wheel only, desktop).
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => t * t * t * (t * (t * 6 - 15) + 10);
const lerpA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const rnd = j => { const h = Math.sin(j * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };

const POSTERS = 12, COUNT = 48, COLS = 8;
const T = {
  l1: ['One shared', '一本共享'], l2: ['diary', '预约本'], r1: ['Two clear', '两边都'],
  words: [['customers', '顾客'], ['the owner', '店主'], ['regulars', '老顾客'], ['walk-ins', '临时客']],
  f1: ['A booking system for a small salon in Glasgow, run by one owner.', '为格拉斯哥一家只有一位店主的小理发店做的预约系统。'],
  f2: ['Customers book themselves. She sees her whole day.', '顾客自己约，店主一眼看完一天。'],
  f3: ['Live since 21 Oct 2026', '2026 年 10 月 21 日上线'],
  s1: ['Every screen', '每一屏'], s2: ['is real', '都是真的'],
  s3: ['The screens customers and the owner use every day.', '顾客和店主每天在用的就是这些界面。'],
  s4: ['Service first, only times that fit, nobody deleted.', '先选服务，只给放得下的时间，没有人被删掉。'],
  try: ['Try the demo', '试用演示版'], live: ['Open the real site ↗', '打开真实网站 ↗']
};
export const CHARS = () => [...Object.values(T).flat(2)].join('');

const VERT = `
uniform vec2 uStreak; uniform float uDof;
varying vec2 vUv;
void main(){
  vec2 grow = 1.0 + abs(uStreak) * 1.1 + uDof * 0.6;
  vec3 p = position; p.xy *= grow;
  vUv = (uv - 0.5) * grow + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const FRAG = `
uniform sampler2D uMap; uniform vec2 uStreak; uniform float uDof, uAlpha, uClipX, uAspect;
varying vec2 vUv;
float box(vec2 uv){ vec2 q = abs(uv - 0.5) - vec2(0.5 - 0.02, 0.5 - 0.02 * uAspect); float d = length(max(q, 0.0)) - 0.02; return 1.0 - smoothstep(-0.004, 0.004, d); }
vec4 tap(vec2 uv){ float m = box(uv); return vec4(texture2D(uMap, clamp(uv, 0.0, 1.0)).rgb * m, m); }
void main(){
  if (gl_FragCoord.x > uClipX) discard;
  vec4 acc = vec4(0.0); const int N = 10;
  float sl = length(uStreak), split = 0.18 + uDof * 0.6;
  for (int i = 0; i < N; i++){
    float t = float(i) / float(N - 1) - 0.5;
    float a = float(i) * 2.39996;
    vec2 j = vec2(cos(a), sin(a)) * uDof * 0.09 * (0.3 + float(i) / float(N));
    vec2 o = uStreak * t + j;
    vec2 cs = (uStreak + j * 2.0) * split * (0.6 + sl);
    vec4 r = tap(vUv + o + cs), g = tap(vUv + o), b = tap(vUv + o - cs);
    acc += vec4(r.r, g.g, b.b, (r.a + g.a + b.a) / 3.0);
  }
  acc /= float(N);
  if (acc.a < 0.003) discard;
  gl_FragColor = vec4(acc.rgb / max(acc.a, 0.001), acc.a * uAlpha);
}`;

export function mountCover(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-ov')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 }; // the 3D phone stays out of the opening
  document.documentElement.dataset.cover = 'swirl';
  if (!document.querySelector('link[data-inter-tight]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.interTight = ''; l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&display=swap'; document.head.append(l); }
  const liveA = op.querySelector('.op-actions a[target]');

  const ov = document.createElement('div'); ov.className = 'bk-ov';
  ov.innerHTML = `<h1 class="bk-ov-h"><span class="bk-ov-l"><b class="l1"></b><b class="l2"></b></span><span class="bk-ov-r"><b class="r1"></b><b class="r2">(<em></em>)</b></span></h1>
    <canvas class="bk-ov-gl" aria-hidden="true"></canvas>
    <div class="bk-ov-foot"><p class="f1"></p><p class="f2"></p><p class="f3"><i></i><span></span></p></div>
    <div class="bk-ov-s"><h2 class="bk-ov-s-h"><b class="s1"></b><b class="s2"></b></h2><div class="bk-ov-s-t"><p class="s3"></p><p class="s4"></p></div>
      <p class="bk-ov-btns"><a class="bk-ov-try" href="#interactive-demo"></a><a class="bk-ov-live" target="_blank" rel="noopener"></a></p></div>`;
  op.append(ov);
  const $ = s => ov.querySelector(s);
  // headline letters as spans, so the pointer can light them up
  const splitChars = el => { const s = el.textContent; el.innerHTML = [...s].map(ch => ch === ' ' ? ' ' : `<i class="bk-ch">${ch}</i>`).join(''); };
  let wi = 1;
  const text = () => {
    $('.l1').textContent = L(T.l1); $('.l2').textContent = L(T.l2); $('.r1').textContent = L(T.r1); $('.r2 em').textContent = L(T.words[wi]);
    ['.l1', '.l2', '.r1'].forEach(s => splitChars($(s)));
    $('.f1').textContent = L(T.f1); $('.f2').textContent = L(T.f2); $('.f3 span').textContent = L(T.f3);
    $('.s1').textContent = L(T.s1); $('.s2').textContent = L(T.s2); $('.s3').textContent = L(T.s3); $('.s4').textContent = L(T.s4);
    $('.bk-ov-try').textContent = L(T.try) + ' ↓'; const lv = $('.bk-ov-live');
    if (liveA && lv) { lv.textContent = L(T.live); lv.href = zh() ? (liveA.dataset.hrefZh || liveA.href) : liveA.href; } else lv?.remove();
    loadTex();
  };
  if (!calm) setInterval(() => { // the bracketed word deletes and retypes itself
    const em = $('.r2 em'), next = L(T.words[(wi + 1) % T.words.length]); let s = em.textContent;
    const del = setInterval(() => { s = s.slice(0, -1); em.textContent = s; if (!s) { clearInterval(del); wi = (wi + 1) % T.words.length; let k = 0; const add = setInterval(() => { em.textContent = next.slice(0, ++k); if (k >= next.length) clearInterval(add); }, 55); } }, 35);
  }, 2600);

  // ---------- WebGL ----------
  const cv = $('.bk-ov-gl');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { renderer = null; }
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 10, 6000), group = new THREE.Group(); scene.add(group);
  const geo = new THREE.PlaneGeometry(1, 1), loader = new THREE.TextureLoader(), texCache = {};
  const tex = n => { const k = (zh() ? 'zh' : 'en') + n; if (!texCache[k]) { const t = loader.load(`assets/v3/cover-posters/${zh() ? 'zh' : 'en'}/p${n}.webp`); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.minFilter = THREE.LinearMipmapLinearFilter; texCache[k] = t; } return texCache[k]; };
  const cards = Array.from({ length: COUNT }, (_, j) => {
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      uniforms: { uMap: { value: null }, uStreak: { value: new THREE.Vector2() }, uDof: { value: 0 }, uAlpha: { value: 1 }, uClipX: { value: 1e6 }, uAspect: { value: .75 } } });
    const m = new THREE.Mesh(geo, mat); group.add(m);
    return { m, n: (j * 5) % POSTERS, prev: null, vel: new THREE.Vector2() };
  });
  function loadTex() { cards.forEach(c => { c.m.material.uniforms.uMap.value = tex(c.n); }); }
  text(); document.addEventListener('portfolio:language', () => setTimeout(text, 40));

  let vw = 0, vh = 0, dpr = 1;
  const resize = () => { vw = op.clientWidth; vh = op.clientHeight; dpr = Math.min(devicePixelRatio || 1, 2); if (!renderer) return; renderer.setPixelRatio(dpr); renderer.setSize(vw, vh, false);
    cam.aspect = vw / vh; cam.position.set(0, 0, (vh / 2) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))); cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);

  const cw = () => Math.min(220, vw * .145);
  // arrangements in px (1 world unit = 1 px at z = 0): [x, y(down), z, rx, ry, rz, scale]
  const swarm = (j, t) => { const a = rnd(j) * 6.283 + t * (.16 + rnd(j + 9) * .2), depth = (rnd(j + 3) + t * .05) % 1, z = -1700 + depth * 1950;
    const rr = 220 + Math.sqrt(rnd(j + 5)) * Math.min(vw, 1500) * .44;
    return [Math.cos(a) * rr, Math.sin(a) * rr * .6, z, (rnd(j + 1) - .5) * 70, (rnd(j + 2) - .5) * 90 + Math.cos(a) * 25, (rnd(j + 4) - .5) * 50, .6]; };
  const drum = (j, t) => { const a = (j / COUNT) * 6.283 + t * .35, R = Math.min(vw * .22, 340); return [Math.sin(a) * R, (rnd(j + 7) - .5) * 14, Math.cos(a) * R - R * .55, 0, a * 57.3, 0, 1.08]; };
  const table = j => { const c = j % COLS, r = Math.floor(j / COLS), w = cw() * 1.1; return [-vw * .27 + (c - COLS / 2 + .5) * w + (r - 2.5) * w * .32, (r - 2.5) * w * 1.2, -40, 46, 0, -26, 1]; };

  // pointer
  let px = vw / 2, py = vh / 2, tpx = 0, tpy = 0, lean = { x: 0, y: 0 };
  addEventListener('pointermove', e => { const r = op.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; tpx = px / vw - .5; tpy = py / vh - .5; litChars(e.clientX, e.clientY); }, { passive: true });
  function litChars(x, y) {
    ov.querySelectorAll('.bk-ch').forEach(ch => { const r = ch.getBoundingClientRect(), d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)), k = clamp(1 - d / 140);
      ch.style.setProperty('--lit', k.toFixed(3)); });
  }

  const v3 = new THREE.Vector3();
  let t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100 || !renderer) return;
    const t = calm ? 0 : (now - t0) / 1000, pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    const kA = sm(clamp((pr - .05) / .25)), kOut = sm(clamp((pr - .9) / .12));
    ov.style.setProperty('--kA', kA.toFixed(3)); ov.style.setProperty('--kT', sm(clamp((pr - .6) / .12)).toFixed(3)); ov.style.setProperty('--kO', kOut.toFixed(3));
    const clipX = (1 - sm(clamp((pr - .5) / .2)) * .48) * vw * dpr;
    lean.x += (tpx - lean.x) * .06; lean.y += (tpy - lean.y) * .06;
    group.rotation.set(lean.y * .12, lean.x * .18, 0);
    const size = cw();
    cards.forEach((c, j) => {
      let p = lerpA(swarm(j, t), drum(j, t), kA);
      const order = ((j % COLS) * 6 + Math.floor(j / COLS)) / COUNT, kT = sm(clamp((pr - .42 - order * .16) / .14));
      if (kT > 0) { const mid = lerpA(p, table(j), kT); mid[1] -= Math.sin(kT * Math.PI) * 180; mid[2] += Math.sin(kT * Math.PI) * 240; p = mid; }
      if (kOut > 0) p[1] -= kOut * vh * 1.15;
      // cards near the pointer drift away from it (mostly while they swarm)
      const sx = vw / 2 + p[0], sy = vh / 2 + p[1], dx = sx - px, dy = sy - py, d = Math.hypot(dx, dy) || 1, push = (1 - kA * .8) * 70 * clamp(1 - d / 320);
      p[0] += dx / d * push; p[1] += dy / d * push;
      const m = c.m; m.position.set(p[0], -p[1], p[2]); m.rotation.set(THREE.MathUtils.degToRad(-p[3]), THREE.MathUtils.degToRad(p[4]), THREE.MathUtils.degToRad(-p[5]));
      m.scale.set(size * p[6], size * p[6] * 4 / 3, 1); m.renderOrder = Math.round(p[2] + 3000);
      // screen-space velocity → streak; distance from the focal plane → depth of field
      m.updateMatrixWorld(); v3.setFromMatrixPosition(m.matrixWorld).project(cam);
      const scr = [v3.x * vw / 2, v3.y * vh / 2];
      if (c.prev) { c.vel.x += ((scr[0] - c.prev[0]) - c.vel.x) * .35; c.vel.y += ((scr[1] - c.prev[1]) - c.vel.y) * .35; }
      c.prev = scr;
      const u = m.material.uniforms, px2uv = 1 / (size * p[6]);
      u.uStreak.value.set(clamp(c.vel.x * px2uv * 2.2, -1.2, 1.2), clamp(c.vel.y * px2uv * 2.2, -1.2, 1.2));
      u.uDof.value = clamp((Math.abs(p[2] + 120) - 260) / 900) * (1 - kA * .85);
      u.uAlpha.value = 1 - clamp((-p[2] - 900) / 700) * .5;
      u.uClipX.value = clipX;
    });
    renderer.render(scene, cam);
  }
  if (renderer) requestAnimationFrame(frame); else ov.classList.add('no-gl');
}

// ---------- the rest of the page: inertia scrolling and the edge ruler (desktop) ----------
export function mountFeel() {
  if (window.__bkFeel || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.__bkFeel = true;
  // a small Lenis-like smoother: the wheel sets a target, the page eases toward it
  let target = scrollY, cur = scrollY, running = false, ours = false;
  const canScroll = (el, dy) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1) { if (dy > 0 ? e.scrollTop + e.clientHeight < e.scrollHeight - 1 : e.scrollTop > 0) return true; } } return false; };
  addEventListener('wheel', e => {
    if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || canScroll(e.target, e.deltaY)) return;
    e.preventDefault();
    if (!running) { cur = scrollY; target = scrollY; }
    const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    target = clamp(target + d, 0, document.documentElement.scrollHeight - innerHeight);
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: false });
  let last = performance.now();
  function step(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    cur += (target - cur) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - cur) < .4) { cur = target; running = false; }
    ours = true; scrollTo(0, cur); ours = false;
    if (running) requestAnimationFrame(step);
  }
  addEventListener('scroll', () => { if (!ours && !running) { cur = target = scrollY; } }, { passive: true });
  // keyboard, links and the scrollbar keep working natively; a click anywhere stops the glide
  addEventListener('pointerdown', () => { running = false; target = cur = scrollY; }, { passive: true });

  // the edge ruler: ticks move with the page; the ones near the pointer stretch toward it
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

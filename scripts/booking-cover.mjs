// Glasgow Salon Booking — the opening. An independent build of the motion ideas on premotio.com, measured from the
// live site: a flow of paper cards across the screen that a pointer can push, gathered by the scroll into a turning
// drum, then laid down into a tilted wall on the left while a statement arrives on the right. Our screens, our words.
//
//  • 20 cards (12 under 700px), picture aspect 720:1053, card height 325px × clamp(min(w,h)/900, .55, 1.15)
//  • pointer: a field of radius max(190, .42·min(w,h)) with quartic falloff, pushing with 1950 + 4.4·speed, through a
//    spring (ω = 2π/1.15, ζ = .56); the push also turns the card (tanh-limited) and, when hard, "throws" it (flutter)
//  • scroll (pinned for 3 screens): freeze 0–.04 · gather into the ring .04–.34 · ring turns · lay down .42–.94 ·
//    right-hand text .7–.97 · headline parts .03–.17
//  • ring: radius min(.4w, .32h, V/2.6), seen from 22° above · wall: twist 35°, tilt 53°, roll −6°, gap .14
//  • post-pass: each card smeared along its own screen velocity with the colour channels split, a radial prism, and
//    a soft lens that follows the pointer and bends the headline too (the headline is drawn into the GL frame)
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const sm5 = t => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const seed = s => { let t = (s * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
const TAU = Math.PI * 2;

const V = 1000, ASPECT = 720 / 1053, POSTERS = 12;
const ST = { freeze: [0, .04], gather: [.04, .34], land: [.42, .94], mask: [.7, .97], hero: [.03, .17], scroll: 3 };
const RING = { above: 22 * Math.PI / 180, wide: .4, high: .32, nearest: 2.6, speed: .32 };
const WALL = { twist: 35 * Math.PI / 180, tilt: 53 * Math.PI / 180, roll: -6 * Math.PI / 180, gap: .14, size: .56 };
const SPRING = { w: TAU / 1.15, z: .56 }, TURN = { w: TAU / 1.5, z: .45 };
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

const CARD_VERT = `
uniform mat4 uPrevMVP; uniform float uBend, uFlutter, uTime, uPhase, uW;
out vec2 vUv; out vec4 vNow, vPrev;
void main(){
  vec3 p = position; float x = uv.x - .5, y = uv.y - .5;
  p.z += (uBend * x * x * .22 + uFlutter * sin(uTime * 7.0 + uPhase + x * 5.0 + y * 3.0) * .025) * uW;
  vUv = uv; vNow = projectionMatrix * modelViewMatrix * vec4(p, 1.0); vPrev = uPrevMVP * vec4(p, 1.0);
  gl_Position = vNow;
}`;
const CARD_FRAG = `
precision highp float;
uniform sampler2D uMap; uniform vec2 uRes; uniform float uCorner, uAspect, uDof, uShow, uClipX;
in vec2 vUv; in vec4 vNow, vPrev;
layout(location = 0) out vec4 o0; layout(location = 1) out vec4 o1;
void main(){
  if (gl_FragCoord.x > uClipX) discard;
  vec2 vUv = vUv; if (!gl_FrontFacing) vUv.x = 1.0 - vUv.x;
  vec2 q = abs(vUv - .5) - vec2(.5 - uCorner, .5 - uCorner / uAspect);
  float d = length(max(q, 0.0)) - uCorner; float m = 1.0 - smoothstep(-.004, .004, d);
  if (m < .5) discard;
  vec2 vel = (vNow.xy / vNow.w - vPrev.xy / vPrev.w) * .5 * uRes;
  vec3 c = texture(uMap, vUv).rgb;
  o0 = vec4(c * uShow, uShow); o1 = vec4(clamp(vel / 96.0, -1.0, 1.0) * .5 + .5, uDof, 1.0);
}`;
const POST_FRAG = `
precision highp float;
uniform sampler2D tCol, tVel, tText; uniform vec2 uRes, uNose; uniform float uNoseR, uNoseK, uPrism, uTextA;
uniform vec3 uBg;
in vec2 vUv; out vec4 o;
vec2 lens(vec2 uv){ vec2 p = (uv - uNose / uRes) * uRes; float r = length(p); if (r >= uNoseR || uNoseK <= 0.0) return uv;
  float k = 1.0 - r / uNoseR; float f = k * k * (3.0 - 2.0 * k); return uv - (p / uRes) * .34 * f * uNoseK; }
void main(){
  vec2 uv = lens(vUv);
  vec4 tx = texture(tText, uv);
  // nearby letters under the lens get a thin colour edge
  vec2 pl = (vUv - uNose / uRes) * uRes; float rl = length(pl) / max(uNoseR, 1.0);
  float ring = uNoseK * smoothstep(.55, 1.0, rl) * (1.0 - smoothstep(1.0, 1.05, rl));
  vec2 ro = normalize(pl + 1e-4) * ring * 2.2 / uRes;
  tx.r = texture(tText, uv + ro).r; tx.b = texture(tText, uv - ro).b;
  vec4 v = texture(tVel, uv); vec2 vel = (v.rg * 2.0 - 1.0) * 96.0 * v.a; float dof = v.b;
  vec2 radial = (uv - .5) * uPrism * .011;
  vec4 acc = vec4(0.0); const int N = 12;
  for (int i = 0; i < N; i++){
    float t = float(i) / float(N - 1) - .5; float a = float(i) * 2.39996;
    vec2 j = vec2(cos(a), sin(a)) * dof * 9.0 / uRes * (.35 + float(i) / float(N));
    vec2 off = vel * t * .9 / uRes + j;
    vec2 split = (vel * .28 / uRes + radial + j * .7) * (.5 + dof);
    vec4 r = texture(tCol, uv + off + split), g = texture(tCol, uv + off), b = texture(tCol, uv + off - split);
    acc += vec4(r.r, g.g, b.b, (r.a + g.a + b.a) / 3.0);
  }
  acc /= float(N);
  vec3 col = mix(uBg, tx.rgb, tx.a * uTextA);
  col = mix(col, acc.rgb / max(acc.a, 1e-3), acc.a);
  o = vec4(col, 1.0);
}`;
const POST_VERT = `out vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export function mountCover(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-ov')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 }; // the 3D phone stays out of the opening
  document.documentElement.dataset.cover = 'swirl';
  if (!document.querySelector('link[data-inter-tight]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.interTight = ''; l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&display=swap'; document.head.append(l); }
  const liveA = op.querySelector('.op-actions a[target]');

  // ---------- DOM ----------
  const ov = document.createElement('div'); ov.className = 'bk-ov';
  ov.innerHTML = `<h1 class="bk-ov-h"><span class="bk-ov-l"><b class="l1"></b><b class="l2"></b></span><span class="bk-ov-r"><b class="r1"></b><b class="r2"><i class="bk-ch">(</i><em></em><i class="bk-ch">)</i></b></span></h1>
    <canvas class="bk-ov-gl" aria-hidden="true"></canvas>
    <div class="bk-ov-foot"><p class="f1"></p><p class="f2"></p><p class="f3"><i></i><span></span></p></div>
    <div class="bk-ov-s"><h2 class="bk-ov-s-h"><b class="s1"></b><b class="s2"></b></h2><div class="bk-ov-s-t"><p class="s3"></p><p class="s4"></p></div>
      <p class="bk-ov-btns"><a class="bk-ov-try" href="#interactive-demo"></a><a class="bk-ov-live" target="_blank" rel="noopener"></a></p></div>`;
  op.append(ov);
  const $ = s => ov.querySelector(s);
  const splitChars = el => { const s = el.textContent; el.innerHTML = [...s].map(ch => ch === ' ' ? '<i class="bk-sp"> </i>' : `<i class="bk-ch">${ch}</i>`).join(''); };
  let wi = 1, textDirty = true;
  const setWord = w => { const em = $('.r2 em'); em.innerHTML = [...w].map(ch => `<i class="bk-ch">${ch}</i>`).join(''); textDirty = true; };
  const text = () => {
    $('.l1').textContent = L(T.l1); $('.l2').textContent = L(T.l2); $('.r1').textContent = L(T.r1);
    ['.l1', '.l2', '.r1'].forEach(s => splitChars($(s))); setWord(L(T.words[wi]));
    $('.f1').textContent = L(T.f1); $('.f2').textContent = L(T.f2); $('.f3 span').textContent = L(T.f3);
    $('.s1').textContent = L(T.s1); $('.s2').textContent = L(T.s2); $('.s3').textContent = L(T.s3); $('.s4').textContent = L(T.s4);
    $('.bk-ov-try').textContent = L(T.try) + ' ↓'; const lv = $('.bk-ov-live');
    if (liveA && lv) { lv.textContent = L(T.live); lv.href = zh() ? (liveA.dataset.hrefZh || liveA.href) : liveA.href; } else lv?.remove();
    loadTex();
  };
  if (!calm) setInterval(() => { // the bracketed word deletes and retypes itself
    const next = L(T.words[(wi + 1) % T.words.length]); let s = L(T.words[wi]);
    const del = setInterval(() => { s = s.slice(0, -1); setWord(s); if (!s) { clearInterval(del); wi = (wi + 1) % T.words.length; let k = 0; const add = setInterval(() => { setWord(next.slice(0, ++k)); if (k >= next.length) clearInterval(add); }, 55); } }, 35);
  }, 2800);

  // ---------- GL ----------
  const cv = $('.bk-ov-gl'); let renderer = null;
  try { const gl = cv.getContext('webgl2', { antialias: false, alpha: true, powerPreference: 'high-performance' }); if (gl) renderer = new THREE.WebGLRenderer({ canvas: cv, context: gl, antialias: false, alpha: true }); } catch { renderer = null; }
  if (!renderer) { ov.classList.add('no-gl'); text(); return; }
  renderer.autoClear = false; renderer.setClearColor(0, 0);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, 10, 8000);
  const loader = new THREE.TextureLoader(), texCache = {};
  const tex = n => { const k = (zh() ? 'zh' : 'en') + n; if (!texCache[k]) { const t = loader.load(`assets/v3/cover-posters/${zh() ? 'zh' : 'en'}/p${n}.webp`); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; texCache[k] = t; } return texCache[k]; };
  const geo = new THREE.PlaneGeometry(1, 1, 12, 16);
  const N = innerWidth < 700 ? 12 : 20;
  const cards = Array.from({ length: N }, (_, i) => {
    const u = { uMap: { value: null }, uPrevMVP: { value: new THREE.Matrix4() }, uBend: { value: 0 }, uFlutter: { value: 0 }, uTime: { value: 0 }, uPhase: { value: i * 1.7 }, uW: { value: 200 }, uRes: { value: new THREE.Vector2() }, uCorner: { value: .05 }, uAspect: { value: ASPECT }, uDof: { value: 0 }, uShow: { value: 1 }, uClipX: { value: 1e6 } };
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, uniforms: u, side: THREE.DoubleSide }));
    scene.add(m); const r = seed(i + 11);
    return { i, m, u, n: (i * 5) % POSTERS, r, born: -1, life: 0, rail: null, ox: { x: 0, v: 0 }, oy: { x: 0, v: 0 }, fx: 0, fy: 0, tx: { x: 0, v: 0 }, ty: { x: 0, v: 0 }, tz: { x: 0, v: 0 }, thrown: 0, frozen: null, pos: [0, 0, 0], q: new THREE.Quaternion(), scr: [0, 0], ringSlot: 0, wallSlot: 0 };
  });
  function loadTex() { cards.forEach(c => { c.u.uMap.value = tex(c.n); }); }
  // render targets and the post pass
  let rt = null, vw = 0, vh = 0, dpr = 1;
  const textCv = document.createElement('canvas'), textTex = new THREE.CanvasTexture(textCv); textTex.colorSpace = THREE.NoColorSpace;
  const post = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: POST_VERT, fragmentShader: POST_FRAG, depthTest: false, depthWrite: false, uniforms: {
    tCol: { value: null }, tVel: { value: null }, tText: { value: textTex }, uRes: { value: new THREE.Vector2() }, uNose: { value: new THREE.Vector2(-9999, -9999) }, uNoseR: { value: 200 }, uNoseK: { value: 0 }, uPrism: { value: 1 }, uTextA: { value: 1 }, uBg: { value: new THREE.Vector3(0xf3 / 255, 0xf1 / 255, 0xec / 255) } } });
  const postScene = new THREE.Scene(); postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post)); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const resize = () => {
    vw = op.clientWidth; vh = op.clientHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(vw, vh, false);
    cam.aspect = vw / vh; cam.fov = 2 * Math.atan(vh / 2 / V) * 180 / Math.PI; cam.position.set(0, 0, V); cam.updateProjectionMatrix();
    rt?.dispose(); rt = new THREE.WebGLRenderTarget(Math.round(vw * dpr), Math.round(vh * dpr), { count: 2, type: THREE.UnsignedByteType, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    post.uniforms.tCol.value = rt.textures[0]; post.uniforms.tVel.value = rt.textures[1];
    post.uniforms.uRes.value.set(vw * dpr, vh * dpr); cards.forEach(c => c.u.uRes.value.set(vw * dpr, vh * dpr));
    textCv.width = Math.round(vw * dpr); textCv.height = Math.round(vh * dpr); textDirty = true;
    cards.forEach(c => { c.rail = null; });
  };
  resize(); addEventListener('resize', resize);
  text(); document.addEventListener('portfolio:language', () => setTimeout(text, 40));

  // ---------- the headline, drawn into the frame ----------
  const chars = () => [...ov.querySelectorAll('.bk-ov-h .bk-ch')];
  let revealT0 = performance.now(), lastTextKey = '';
  function drawText(now, part, lit) {
    const cs = chars(), key = cs.map(c => c.textContent).join('') + '|' + vw + '|' + part.toFixed(3);
    const rv = Math.min(1, (now - revealT0) / 1400); if (key === lastTextKey && rv >= 1 && !lit.moved) return; lastTextKey = key; lit.moved = false;
    const x = textCv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, vw, vh);
    const orc = op.getBoundingClientRect(), st = getComputedStyle($('.bk-ov-h')); x.font = `${st.fontWeight} ${st.fontSize} ${st.fontFamily}`; x.textBaseline = 'alphabetic';
    cs.forEach((c, i) => {
      const r = c.getBoundingClientRect(); if (!r.width) return;
      const side = c.closest('.bk-ov-l') ? -1 : 1, dx = side * part * vw * .55;
      const k = sm5((rv * 1400 - i * 22) / 650), rise = (1 - k) * r.height * .6;
      const cx = r.left - orc.left + r.width / 2 + dx, cy = r.bottom - orc.top - r.height * .22 + rise;
      const d = Math.hypot(lit.x - (r.left - orc.left + r.width / 2), lit.y - (r.top - orc.top + r.height / 2)), g = fine ? clamp(1 - d / 150) : 0;
      x.globalAlpha = k * (1 - part * 1.3); x.fillStyle = c.closest('.r2') ? (g ? mixHex('#1f9e6c', '#3fe2a0', g) : '#1f9e6c') : mixHex('#10201a', '#1f9e6c', g);
      x.textAlign = 'center'; x.fillText(c.textContent, cx, cy);
    });
    x.globalAlpha = 1; textTex.needsUpdate = true;
  }
  const mixHex = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };

  // ---------- the flow of cards ----------
  const scale = () => clamp(Math.min(vw, vh) / 900, .55, 1.15), cardH = () => 325 * scale(), cardW = () => cardH() * ASPECT;
  const P = { x: -9999, y: -9999, vx: 0, vy: 0, on: false, lx: 0, ly: 0 }, nose = { x: -9999, y: -9999, k: 0 };
  addEventListener('pointermove', e => { const r = op.getBoundingClientRect(); P.x = e.clientX - r.left; P.y = e.clientY - r.top; P.on = e.pointerType === 'mouse' || e.buttons > 0; lit.x = P.x; lit.y = P.y; lit.moved = true; }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { P.on = false; });
  const lit = { x: -9999, y: -9999, moved: false };
  const spring = (s, target, dt, w = SPRING.w, z = SPRING.z) => { const a = (s.v + (target - w * w * s.x) * dt) / (1 + 2 * z * w * dt); return { x: s.x + a * dt, v: a }; };
  const diag = () => Math.hypot(vw, vh) / 2 + cardH() * .8;
  function newRail(c, late) {
    const r = c.r, a = r() * TAU, cross = a + Math.PI + (r() - .5) * 1.3, R = diag();
    const lat = (r() - .5) * .9 * Math.min(vw, vh);
    const from = [Math.cos(a) * R, Math.sin(a) * R], to = [Math.cos(cross) * R, Math.sin(cross) * R];
    const nx = -(to[1] - from[1]), ny = to[0] - from[0], nl = Math.hypot(nx, ny) || 1;
    c.rail = { from, to, lat: [nx / nl * lat, ny / nl * lat], z0: -520 + r() * 640, zAmp: 60 + r() * 120, g: [40 + r() * 70, 40 + r() * 70, 2.6 + r() * 2.4, 3.1 + r() * 2.2, r() * TAU, r() * TAU],
      roll: (r() - .5) * .9, tumble: [(r() - .5) * .9, (r() - .5) * .9, .25 + r() * .3, .2 + r() * .3, r() * TAU, r() * TAU] };
    c.life = 8 + r() * 5; c.born = late;
  }
  const flightPose = (c, age) => {
    const R = c.rail, t = clamp(age / c.life), e = t; // steady crossing
    const x = lerp(R.from[0], R.to[0], e) + R.lat[0] * Math.sin(Math.PI * t) + R.g[0] * Math.sin(age / R.g[2] * TAU + R.g[4]);
    const y = lerp(R.from[1], R.to[1], e) + R.lat[1] * Math.sin(Math.PI * t) + R.g[1] * Math.sin(age / R.g[3] * TAU + R.g[5]);
    const z = R.z0 + R.zAmp * Math.sin(age * .5 + R.g[4]);
    const rx = R.tumble[0] * Math.sin(age * R.tumble[2] + R.tumble[4]), ry = R.tumble[1] * Math.sin(age * R.tumble[3] + R.tumble[5]), rz = R.roll + .18 * Math.sin(age * .4 + R.g[5]);
    return { p: [x, y, z], e: [rx, ry, rz] };
  };
  // the ring (seen from above) and the wall (left half, tilted) — targets for a given slot
  const ringPose = (slot, turn) => {
    const R = Math.min(RING.wide * vw, RING.high * vh, V / RING.nearest), a = slot / N * TAU + turn;
    const p = new THREE.Vector3(Math.sin(a) * R, 0, Math.cos(a) * R - R * .4), tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -RING.above);
    p.applyQuaternion(tilt);
    const q = tilt.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a));
    return { p: [p.x, p.y, p.z], q, s: 1 };
  };
  const wallPose = slot => {
    const cols = N > 12 ? 5 : 4, rows = Math.ceil(N / cols), cw = cardW() * WALL.size, ch = cardH() * WALL.size, gx = cw * (1 + WALL.gap), gy = ch * (1 + WALL.gap);
    const c = slot % cols, r = Math.floor(slot / cols);
    const local = new THREE.Vector3((c - (cols - 1) / 2) * gx, -(r - (rows - 1) / 2) * gy, 0);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-WALL.tilt * .8, WALL.twist * .6, WALL.roll, 'YXZ'));
    local.applyQuaternion(q); local.x += -vw * .28; local.y += vh * .05; local.z -= 100;
    return { p: [local.x, local.y, local.z], q, s: WALL.size };
  };
  cards.forEach(c => { newRail(c, 0); c.born = -c.r() * c.life * .9; });
  let simT = 0, born = N, lastNow = performance.now(), nextBirth = 0, lastPr = -1, ringTurn = 0, dragLag = 0;
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), QT = new THREE.Quaternion(), M = new THREE.Matrix4(), v3 = new THREE.Vector3();
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const dt = Math.min(.05, (now - lastNow) / 1000); lastNow = now;
    const pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    // pointer velocity and the lens that trails it
    if (P.on) { P.vx += (((P.x - P.lx) / Math.max(dt, 1e-3)) - P.vx) * .35; P.vy += (((P.y - P.ly) / Math.max(dt, 1e-3)) - P.vy) * .35; } else { P.vx *= .8; P.vy *= .8; }
    P.lx = P.x; P.ly = P.y;
    const lag = 1 - Math.exp(-dt * 7); if (nose.x < -999) { nose.x = P.x; nose.y = P.y; } nose.x += (P.x - nose.x) * lag; nose.y += (P.y - nose.y) * lag; nose.k += ((P.on && fine && pr < .5 ? 1 : 0) - nose.k) * (1 - Math.exp(-dt * 4));
    const minS = Math.min(vw, vh), fieldR = Math.max(190, .42 * minS), speed = Math.hypot(P.vx, P.vy), sc = Math.min(speed, 2000);
    // stages
    const kG = sm5((pr - ST.gather[0]) / (ST.gather[1] - ST.gather[0])), kL = clamp((pr - ST.land[0]) / (ST.land[1] - ST.land[0])), part = sm((pr - ST.hero[0]) / (ST.hero[1] - ST.hero[0]));
    const flowing = pr < ST.freeze[1] && !calm; if (flowing) simT += dt;
    ringTurn += dt * RING.speed * (1 - kL * .9) * (calm ? 0 : 1) + (pr - lastPr) * 1.6 * (kG > 0 ? 1 : 0); lastPr = pr;
    // births: quick at first, then at a steady pace, so the screen fills and stays full
    if (flowing && simT >= nextBirth && born < N) { newRail(cards[born], simT); born++; nextBirth = simT + (born < N * .6 ? .28 : .55); }
    const clipX = kL > .45 ? (lerp(1, .5, sm((kL - .45) / .3))) * vw * dpr : 1e6;
    const W = cardW(), H = cardH();
    cards.forEach((c, i) => {
      const u = c.u; u.uPrevMVP.value.copy(cam.projectionMatrix).multiply(cam.matrixWorldInverse).multiply(c.m.matrixWorld);
      if (!c.rail) { c.m.visible = false; return; }
      let age = simT - c.born; if (flowing && age > c.life) { newRail(c, simT); age = 0; }
      c.m.visible = true;
      const fp = flightPose(c, age);
      // the pointer: a field that pushes the card away, harder when the pointer moves fast
      let F = [0, 0];
      if (P.on && fine) { const dx = c.scr[0] - P.x, dy = c.scr[1] - P.y, d = Math.hypot(dx, dy); if (d < fieldR) { const o = (1 - (d / fieldR) ** 2) ** 2, ux = d > 1 ? dx / d : 0, uy = d > 1 ? dy / d : 0, al = speed > 0 ? sc / speed * 4.8 : 0; F = [o * (ux * (1950 + 4.4 * sc) + P.vx * al), o * (uy * (1950 + 4.4 * sc) + P.vy * al)]; } }
      const fl = 1 - Math.exp(-dt * 8); c.fx += (F[0] - c.fx) * fl; c.fy += (F[1] - c.fy) * fl;
      c.ox = spring(c.ox, c.fx, dt); c.oy = spring(c.oy, c.fy, dt);
      const ov2 = Math.hypot(c.ox.v, c.oy.v), thrownTarget = sm((ov2 - 200) / 320); c.thrown += (thrownTarget - c.thrown) * (1 - Math.exp(-dt * (thrownTarget > c.thrown ? 6 : 2.5)));
      const tanh = v => .6 * Math.tanh(v / .6), S2 = TURN.w * TURN.w;
      const cx = (c.scr[0] - P.x), cy = (c.scr[1] - P.y), twist = (cx * c.fy - cy * c.fx) * 9e-6;
      c.tx = spring(c.tx, S2 * tanh(-(c.oy.v * .003 + c.fy * 8e-4)), dt, TURN.w, TURN.z); c.ty = spring(c.ty, S2 * tanh(c.ox.v * .003 + c.fx * 8e-4), dt, TURN.w, TURN.z); c.tz = spring(c.tz, S2 * tanh(-twist), dt, TURN.w, TURN.z);
      // flight pose (+ pointer offset and turn)
      let px = fp.p[0] + c.ox.x, py = fp.p[1] + c.ox.x * 0 + c.oy.x, pz = fp.p[2];
      E.set(fp.e[0] + c.tx.x, fp.e[1] + c.ty.x, fp.e[2] + c.tz.x, 'XYZ'); Q.setFromEuler(E);
      let sz = 1, show = 1, dof = clamp((Math.abs(pz + 60) - 300) / 900) * .7;
      // gather into the ring, each card a little after the one before it
      if (kG > 0) {
        if (!c.frozen) c.frozen = { p: [px, py, pz], q: Q.clone() };
        const g = sm5((kG - (i / N) * .62) / .38), rp = ringPose(c.ringSlot = i, ringTurn);
        px = lerp(c.frozen.p[0], rp.p[0], g); py = lerp(c.frozen.p[1], rp.p[1], g); pz = lerp(c.frozen.p[2], rp.p[2], g) + Math.sin(g * Math.PI) * 160;
        Q.copy(c.frozen.q).slerp(rp.q, g); dof = (1 - g) * dof;
        if (kL > 0) { // lay down into the wall, peeling off the ring in order
          const order = ((i % 5) * 4 + Math.floor(i / 5)) / N, l = sm5((kL - order * .55) / .4), wp = wallPose(i);
          px = lerp(px, wp.p[0], l); py = lerp(py, wp.p[1], l) + Math.sin(l * Math.PI) * 140; pz = lerp(pz, wp.p[2], l) + Math.sin(l * Math.PI) * 200; Q.slerp(wp.q, l); sz = lerp(1, wp.s, l);
        }
      } else c.frozen = null;
      c.pos = [px, py, pz]; c.q.copy(Q);
      c.m.position.set(px, -py, pz); c.m.quaternion.copy(Q); c.m.scale.set(W * sz, H * sz, 1);
      c.m.updateMatrixWorld();
      v3.set(0, 0, 0).applyMatrix4(c.m.matrixWorld).project(cam); c.scr = [(v3.x + 1) / 2 * vw, (1 - v3.y) / 2 * vh];
      u.uTime.value = now / 1000; u.uW.value = W; u.uBend.value = .35 + c.thrown * 1.3 * (1 - kG); u.uFlutter.value = (.25 + c.thrown * 1.2) * (1 - kG);
      u.uDof.value = dof; u.uShow.value = show; u.uClipX.value = clipX;
    });
    // headline and the frame
    drawText(now, part, lit);
    const pu = post.uniforms; pu.uNose.value.set(nose.x * dpr, (vh - nose.y) * dpr); pu.uNoseR.value = clamp(.312 * minS, 110, 350) * dpr; pu.uNoseK.value = nose.k;
    pu.uPrism.value = kG > 0 ? lerp(1, .45, kG) * (1 - kL * .25) : 1; pu.uTextA.value = 1;
    renderer.setRenderTarget(rt); renderer.setClearColor(0, 0); renderer.clear(true, true, false); renderer.render(scene, cam);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    ov.style.setProperty('--kA', part.toFixed(3)); ov.style.setProperty('--kT', sm((pr - ST.mask[0]) / (ST.mask[1] - ST.mask[0])).toFixed(3));
  }
  requestAnimationFrame(frame);
}

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

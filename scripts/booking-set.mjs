// Glasgow Salon Booking — the counter, for real: the set built and lit in Blender (blender/desk_scene.py), exported as
// glb and rebuilt here as live 3D. The phone is live (asleep → messages with the scroll), the handwriting grows on the
// page, everything on the counter gives way a little under the pointer, and one camera does the whole opening:
// the counter by day → the set goes dark and the phone rises alone → back to the counter → the lamp comes on and
// the camera pushes in on the book, then the phone → hand over to paper. Units are metres, like the Blender file.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, SCREEN } from './phone3d.mjs';
import { loadGLB } from './glb-lite.mjs';
import { T } from './booking-desk.mjs';
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => sm((p - a) / (b - a));
const seed = s => { let t = (s * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
const HAND = '"Segoe Print","Bradley Hand","Comic Sans MS","Noto Sans CJK SC",cursive';
export const CHARS = () => '';
const MODELS = 'assets/v3/desk/models/';
const PROPS = { notebook: .05, pencil: .9, pen: .9, eraser: .8, comb: .7, scissors: .4, clips: 1, binder: .7, mat: 0 }; // how far each thing gives way (× 1 cm)

export function mountDesk(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-dk')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 };
  document.documentElement.dataset.cover = 'desk';
  if (!document.querySelector('link[data-inter-tight]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.interTight = ''; l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&display=swap'; document.head.append(l); }
  const liveA = op.querySelector('.op-actions a[target]');

  const ov = document.createElement('div'); ov.className = 'bk-dk bk-set';
  ov.innerHTML = `<canvas class="bk-dk-gl" aria-hidden="true"></canvas><div class="bk-dk-grain" aria-hidden="true"></div><div class="bk-dk-out" aria-hidden="true"></div>
    <div class="bk-dk-hero"><p class="bk-dk-tag"></p><h1 class="bk-dk-h"><b class="t1"></b><b class="t2"></b><b class="t3"></b></h1><p class="bk-dk-copy"></p>
      <div class="bk-dk-card"><p class="bk-dk-ck"></p><hr><p class="bk-dk-cd"></p><a class="bk-dk-live" target="_blank" rel="noopener"></a></div>
      <p class="bk-dk-scroll"><i></i><span></span></p></div>
    <div class="bk-dk-eve"><p class="bk-dk-eve-k"></p><p class="bk-dk-eve-p"></p></div>
    <div class="bk-dk-pw"><h2 class="bk-dk-pw-h"><b class="p1"></b><b class="p2"></b></h2><p class="bk-dk-pw-k"></p><p class="bk-dk-pw-p"></p><p class="bk-dk-pw-q"></p></div>`;
  op.append(ov);
  const $ = s => ov.querySelector(s);
  const text = () => {
    $('.bk-dk-tag').textContent = L(T.tag); $('.t1').textContent = L(T.t1); $('.t2').textContent = L(T.t2); $('.t3').textContent = L(T.t3);
    $('.bk-dk-copy').textContent = L(T.copy); $('.bk-dk-ck').textContent = L(T.ck); $('.bk-dk-cd').textContent = L(T.cd); $('.bk-dk-scroll span').textContent = L(T.scroll);
    const lv = $('.bk-dk-live'); if (liveA) { lv.textContent = L(T.live); lv.href = zh() ? (liveA.dataset.hrefZh || liveA.href) : liveA.href; } else lv.remove();
    $('.p1').textContent = L(T.p1); $('.p2').textContent = L(T.p2); $('.bk-dk-pw-k').textContent = L(T.p3); $('.bk-dk-pw-p').textContent = L(T.pp); $('.bk-dk-pw-q').textContent = L(T.pq);
    $('.bk-dk-eve-k').textContent = L(T.ek); $('.bk-dk-eve-p').textContent = L(T.ep);
  };
  text(); document.addEventListener('portfolio:language', () => setTimeout(() => { text(); inkNow = -1; screens.load(); }, 40));

  // ---------- GL ----------
  const cv = $('.bk-dk-gl'); let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch { ov.classList.add('no-gl'); return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .85;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0e0c0a);
  const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(42, 1, .05, 20);
  // ---- light, as in the Blender file: a warm sun from the upper left carrying a leafy, irregular pattern over the left half;
  //      the room from the front, low and cool; in the evening a desk lamp over the book and the phone
  const cookie = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'), r = seed(5);
    const img = x.createImageData(512, 512), d = img.data;
    const grid = (cells) => { const g = Array.from({ length: cells + 1 }, () => Array.from({ length: cells + 1 }, () => r())); return (u, v) => { const X = Math.min(u * cells, cells - 1e-6), Y = Math.min(v * cells, cells - 1e-6), x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0, s = t => t * t * (3 - 2 * t); const a = g[y0][x0], b = g[y0][x0 + 1], cc = g[y0 + 1][x0], dd = g[y0 + 1][x0 + 1]; return lerp(lerp(a, b, s(fx)), lerp(cc, dd, s(fx)), s(fy)); }; };
    const n1 = grid(13), n2 = grid(34), n3 = grid(4);
    for (let y = 0; y < 512; y++) for (let X = 0; X < 512; X++) { const u = X / 511, v = y / 511;
      const leaf = sm((n1(u, v) * .55 + n2(u, v) * .3 + n3(u, v) * .15 - .36) / .06);           // gaps between leaves
      const side = sm((.74 - u + (v - .5) * .3) / .2);                                            // the right side is in shade
      const pass = leaf * side; const i = (y * 512 + X) * 4; d[i] = d[i + 1] = d[i + 2] = Math.round(255 * (1 - pass)); d[i + 3] = 255; }
    x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t; })();
  // the sun: parallel warm light from the upper left; a gobo hangs between it and the counter with the leaf pattern cut
  // out of it (and the right-hand part solid), so the dapple and the shade are real shadows
  const sun = new THREE.DirectionalLight(0xffcc8f, 0); sun.position.set(-1.45, 1.6, -1.15); sun.target.position.set(-.18, 0, .05);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.00005; sun.shadow.normalBias = .0005; sun.shadow.radius = 7;
  Object.assign(sun.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: .2, far: 5 }); scene.add(sun, sun.target);
  const gobo = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ alphaMap: cookie, transparent: true, alphaTest: .5, colorWrite: false, depthWrite: false, side: THREE.DoubleSide }));
  gobo.rotation.x = -Math.PI / 2; gobo.position.set(-.42, .34, .3); gobo.castShadow = true; gobo.receiveShadow = false; gobo.renderOrder = -10; scene.add(gobo);
  const room = new THREE.DirectionalLight(0xdfe6ff, 0); room.position.set(.5, .35, 1.6); room.castShadow = false; scene.add(room);
  const sky = new THREE.HemisphereLight(0xb9c4d8, 0x3a2a1c, 0); scene.add(sky);
  const lamp = new THREE.PointLight(0xffc27a, 0, 2.2, 1.6); lamp.position.set(-.45, .55, -.25); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.0002; lamp.shadow.normalBias = .0005; scene.add(lamp);
  window.__bkSet = { get sun() { return sun; }, get scene() { return scene; }, get renderer() { return renderer; }, get props() { return props; } };
  const rim = new THREE.SpotLight(0xffc98a, 0, 4, .6, .8, 1.2); rim.position.set(-.8, 1.4, .9); scene.add(rim); rim.target.position.set(0, .7, 0); scene.add(rim.target);

  // ---------- the set, from Blender ----------
  const set = new THREE.Group(); scene.add(set); const props = {}; let ready = false;
  const onMaterial = m => { if (/steel|chrome|ferrule/.test(m.name)) { m.envMapIntensity = .5; m.roughness = Math.max(m.roughness, .18); } if (/paper$/.test(m.name)) { m.roughness = 1; } if (m.name === 'wood') { m.roughness = .5; m.envMapIntensity = .25; } };
  Promise.all(['desk', 'mat', 'notebook', 'pencil', 'pen', 'eraser', 'comb', 'scissors', 'clips', 'binder'].map(n => loadGLB(`${MODELS}${n}.glb`, { envMap: envTex, envMapIntensity: .35, onMaterial }).then(o => { props[n] = o; set.add(o); if (n === 'desk') o.traverse(m => { if (m.isMesh) m.castShadow = false; }); }).catch(e => console.warn('glb', n, e))))
    .then(() => { ready = true; setupPage(); setupNudges(); });
  // the right page carries the handwriting: lines + ink drawn here, mapped onto the page from the model
  const pageCv = document.createElement('canvas'); pageCv.width = 900; pageCv.height = 1240; const px = pageCv.getContext('2d');
  const pageTex = new THREE.CanvasTexture(pageCv); pageTex.colorSpace = THREE.SRGBColorSpace; pageTex.flipY = false; pageTex.anisotropy = 8;
  function setupPage() { props.notebook?.traverse(o => { if (o.isMesh && o.name === 'nb_page_r') { o.material = o.material.clone(); o.material.map = pageTex; o.material.needsUpdate = true; } }); drawInk(0, true); }
  const EV = [
    [0, .22, ['TOMORROW ↓', '明天 ↓'], '#15171c'], [1, .22, ['9:30 Emma? ring back', '9:30 Emma? 回电'], '#15171c'], [3, .22, ['11:00 He (moved)', '11:00 何先生（挪过来）'], '#15171c'],
    ['strike', 3, .2, .72], ['fix', 3.55, .3, ['→ 11:30, he rang', '→ 11:30，他来电话了'], '#b3261e'], [6, .5, ['Zhou → 12:30?', '周先生 → 12:30?'], '#15171c'],
    [9, .22, ['2:00 colour — 2h!! block it', '2:00 染发 — 2 小时!! 留住'], '#15171c'], ['strike', 1, .2, .62], ['fix', 1.55, .3, ['Emma: Fri instead', 'Emma：改周五'], '#b3261e'],
    [12, .22, ['Sunday? ask everyone', '周日开不开? 问一圈'], '#15171c'], [15, .22, ['bed. 23:40', '睡觉。23:40'], '#6b6f7a']];
  let inkNow = -1;
  function drawInk(k, force) {
    k = Math.round(clamp(k) * 24) / 24; if (k === inkNow && !force) return; inkNow = k;
    const w = pageCv.width, h = pageCv.height, r = seed(5); px.fillStyle = '#efe9da'; px.fillRect(0, 0, w, h);
    px.fillStyle = '#17362b'; px.font = `700 ${Math.round(h * .03)}px "Inter Tight", Inter, system-ui, sans-serif`; px.fillText(zh() ? '周五 6 日' : 'FRIDAY 6', w * .09, h * .085);
    const rowY = row => h * (.13 + row * .048);
    for (let i = 0; i < 17; i++) { px.strokeStyle = 'rgba(23,54,43,.35)'; px.lineWidth = 2; px.beginPath(); px.moveTo(w * .08, rowY(i)); px.lineTo(w * .92, rowY(i)); px.stroke(); px.fillStyle = 'rgba(23,54,43,.55)'; px.font = `500 ${Math.round(h * .017)}px Inter, system-ui, sans-serif`; px.fillText(['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00'][i], w * .09, rowY(i) - h * .008); }
    EV.forEach((e, i) => { const k0 = i / EV.length, k1 = (i + 1) / EV.length; if (k <= k0) return; const part = clamp((k - k0) / (k1 - k0));
      if (e[0] === 'strike') { const [, row, x0, x1] = e; px.strokeStyle = '#b3261e'; px.lineWidth = h * .004; px.beginPath(); px.moveTo(w * x0, rowY(row) - h * .012); px.lineTo(w * lerp(x0, x1, part), rowY(row) - h * .016); px.stroke(); return; }
      const fix = e[0] === 'fix'; const [row, fx, txt, col] = fix ? e.slice(1) : e, y = rowY(row) - h * .006, X = w * fx;
      px.save(); px.beginPath(); px.rect(0, y - h * .045, X + part * w * .75, h * .06); px.clip(); px.translate(X, y); px.rotate((r() - .5) * .04); px.fillStyle = col; px.font = `italic 600 ${Math.round(h * (fix ? .024 : .031) + r() * 2)}px ${HAND}`; px.fillText(L(txt), 0, 0); px.restore(); });
    pageTex.needsUpdate = true;
  }

  // ---------- the phone (live) ----------
  const SW = SCREEN.w, SH = SCREEN.h, sc = document.createElement('canvas'); sc.width = 780; sc.height = Math.round(780 * SH / SW); const sx = sc.getContext('2d');
  const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); phone.traverse(o => { if (o.isMesh) { o.castShadow = true; [].concat(o.material).forEach(m => { if (m.isMeshStandardMaterial) { m.envMap = envTex; m.envMapIntensity = .8; m.needsUpdate = true; } }); } });
  const flat = new THREE.Group(); flat.rotation.x = -Math.PI / 2; flat.add(phone);
  const pv = new THREE.Group(); pv.add(flat); scene.add(pv);
  const PH_SCALE = .0715 / .76, SPOT = new THREE.Vector3(.13, .0085, .04), SPOT_ROT = THREE.MathUtils.degToRad(4);
  const shotSrc = n => `assets/v3/screens/booking/${zh() ? 'zh/' : ''}${n}.webp`;
  const screens = { imgs: {}, cur: 'lock', prev: null, fade: 1, async load() { for (const n of ['cover-book', 'today']) this.imgs[n] = await load(shotSrc(n)); dirty = true; } };
  screens.load();
  // the messages arrive with the scroll, not on a timer: the phone is asleep until the first one, then wakes and keeps stacking
  const banners = []; let dirty = true, wake = 0, wantCount = 0, eveAmt = 0, unread = 0;
  const wxList = () => { const o = []; for (let i = 0; i < T.wx.length; i += 2) o.push([L(T.wx[i]), L(T.wx[i + 1])]); return o; };
  function syncBanners(now, count) {
    count = Math.max(0, Math.min(count, 60)); if (count === wantCount) return; const list = wxList();
    while (banners.length < Math.min(count, 7) && wantCount < count) { const n = wantCount % list.length; banners.push({ who: list[n][0], what: list[n][1], t: now, n }); wantCount++; buzz = now; if (banners.length > (eveAmt > .5 ? 7 : 4)) banners.shift(); }
    if (wantCount < count) { wantCount = count; buzz = now; }
    while (wantCount > count) { wantCount--; if (banners.length > 1) banners.pop(); }
    if (count === 0) banners.length = 0;
    unread = wantCount; dirty = true;
  }
  function drawScreen(now, lit) {
    const W = sc.width, H = sc.height;
    if (screens.cur === 'lock') {
      // lock screen: a dark, slightly blue glass; the clock; banners stacking
      const g = sx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2230'); g.addColorStop(1, '#0a0d12'); sx.fillStyle = g; sx.fillRect(0, 0, W, H);
      sx.fillStyle = 'rgba(255,255,255,.9)'; sx.textAlign = 'center'; sx.font = `500 ${Math.round(W * .055)}px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(zh() ? (eveAmt > .5 ? '11月5日 周四' : '11月5日 周四') : 'Thursday 5 November', W / 2, W * .33);
      sx.font = `300 ${Math.round(W * .22)}px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(eveAmt > .5 ? '22:47' : '9:41', W / 2, W * .56); sx.textAlign = 'left';
      sx.fillStyle = 'rgba(255,255,255,.35)'; sx.beginPath(); sx.roundRect(W / 2 - 110, H - 40, 220, 8, 4); sx.fill();
      paintIsland();
    } else { const im = screens.imgs[screens.cur]; if (!im) return; paint(sx, im, true); if (screens.prev && screens.fade < 1) { sx.globalAlpha = 1 - screens.fade; paint(sx, screens.prev, true); sx.globalAlpha = 1; } }
    const top = Math.round(W * .62);
    banners.forEach((b, i) => {
      const age = (now - b.t) / 1000, kin = sm(age / .45), y = (screens.cur === 'lock' ? top : Math.round(W * .118) + 10) + i * 118 - (1 - kin) * 60;
      sx.save(); sx.globalAlpha = kin; sx.shadowColor = 'rgba(0,0,0,.25)'; sx.shadowBlur = 18; sx.shadowOffsetY = 6;
      sx.fillStyle = screens.cur === 'lock' ? 'rgba(236,238,244,.92)' : 'rgba(248,247,243,.96)'; sx.beginPath(); sx.roundRect(22, y, W - 44, 104, 26); sx.fill(); sx.shadowColor = 'transparent';
      sx.fillStyle = '#2dc100'; sx.beginPath(); sx.roundRect(40, y + 20, 64, 64, 16); sx.fill();
      sx.fillStyle = '#fff'; sx.beginPath(); sx.ellipse(66, y + 48, 16, 13, 0, 0, Math.PI * 2); sx.fill(); sx.beginPath(); sx.ellipse(82, y + 58, 13, 11, 0, 0, Math.PI * 2); sx.fill();
      sx.fillStyle = '#6b6b70'; sx.font = `500 22px -apple-system, Inter, system-ui, sans-serif`; sx.textBaseline = 'alphabetic'; sx.fillText(L(T.wxk).toUpperCase(), 124, y + 36); sx.textAlign = 'right'; sx.fillText(L(T.now), W - 44, y + 36); sx.textAlign = 'left';
      sx.fillStyle = '#111'; sx.font = `600 28px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(b.who, 124, y + 66);
      sx.fillStyle = '#333'; sx.font = `400 26px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(b.what, 124, y + 94); sx.restore();
    });
    if (unread > banners.length) { const y = (screens.cur === 'lock' ? top : Math.round(W * .118) + 10) + banners.length * 118 + 6; sx.save(); sx.fillStyle = 'rgba(236,238,244,.9)'; sx.beginPath(); sx.roundRect(W / 2 - 150, y, 300, 52, 26); sx.fill(); sx.fillStyle = '#d9483c'; sx.beginPath(); sx.arc(W / 2 - 112, y + 26, 11, 0, Math.PI * 2); sx.fill(); sx.fillStyle = '#111'; sx.font = `600 24px -apple-system, Inter, system-ui, sans-serif`; sx.textAlign = 'center'; sx.fillText(`${unread - banners.length} ${zh() ? '条更早的未读' : 'more unread'}`, W / 2 + 10, y + 34); sx.restore(); }
    // asleep: the glass goes black until the first message wakes it
    if (lit < 1) { sx.fillStyle = `rgba(0,0,0,${1 - lit})`; sx.fillRect(0, 0, W, H); }
    tex.needsUpdate = true;
  }
  function paintIsland() { const W = sc.width; sx.fillStyle = '#050506'; const iw = W * .3, ih = W * .085; sx.beginPath(); sx.roundRect((W - iw) / 2, W * .028, iw, ih, ih / 2); sx.fill(); }
  let buzz = -1e9;
  const showScreen = n => { if (screens.cur === n || (n !== 'lock' && !screens.imgs[n])) return; screens.prev = screens.cur === 'lock' ? null : screens.imgs[screens.cur]; screens.cur = n; screens.fade = 0; dirty = true; };

  // ---------- camera, pointer, nudges ----------
  let vw = 0, vh = 0, rt = null;
  const dpr = () => Math.min(devicePixelRatio || 1, 1.75);
  const post = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tCol: { value: null }, tDep: { value: null }, uRes: { value: new THREE.Vector2() }, uNear: { value: cam.near }, uFar: { value: cam.far }, uFocus: { value: 13 }, uRange: { value: 4 }, uMax: { value: 12 }, uVig: { value: .55 }, uFringe: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D tCol, tDep; uniform vec2 uRes; uniform float uNear, uFar, uFocus, uRange, uMax, uVig, uFringe;
      float dist(vec2 uv){ float z = texture2D(tDep, uv).r * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear)); }
      float coc(vec2 uv){ return clamp(abs(dist(uv) - uFocus) / uRange, 0.0, 1.0) * uMax; }
      void main(){
        float c0 = coc(vUv); float r = max(c0, .45);
        vec3 acc = vec3(0.0); float wsum = 0.0; float a0 = fract(sin(dot(vUv * uRes, vec2(12.9898, 78.233))) * 43758.5453) * 6.2832;
        for (int i = 0; i < 20; i++){ float fi = float(i); float ang = fi * 2.39996 + a0; float rad = sqrt((fi + .5) / 20.0);
          vec2 o = vec2(cos(ang), sin(ang)) * rad * r / uRes; float ct = coc(vUv + o); float w = (ct >= c0 * .7) ? 1.0 : .03; // a sharp, bright thing in front never bleeds a halo into the soft background
          acc += texture2D(tCol, vUv + o).rgb * w; wsum += w; }
        vec3 col = acc / wsum;
        vec2 q = (vUv - .5) * vec2(uRes.x / uRes.y, 1.0); float rr = length(q);
        if (uFringe > 0.0) { vec2 d = (vUv - .5) * uFringe * rr; col.r = mix(col.r, texture2D(tCol, vUv + d).r, .6); col.b = mix(col.b, texture2D(tCol, vUv - d).b, .6); }
        col *= 1.0 - uVig * smoothstep(.45, 1.25, rr);
        col = pow(max(col, 0.0), vec3(1.0 / 2.2));
        gl_FragColor = vec4(col, 1.0); }` });
  post.toneMapped = false;
  const postScene = new THREE.Scene(); postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post)); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const resize = () => { vw = op.clientWidth; vh = op.clientHeight; const d = dpr(); renderer.setPixelRatio(d); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix();
    rt?.dispose(); const W = Math.round(vw * d), H = Math.round(vh * d); const dt = new THREE.DepthTexture(W, H, THREE.UnsignedIntType);
    rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: dt, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    post.uniforms.tCol.value = rt.texture; post.uniforms.tDep.value = dt; post.uniforms.uRes.value.set(W, H); };
  resize(); addEventListener('resize', resize);
  const P = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { if (!fine) return; const r = op.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * 2 - 1; P.ty = (e.clientY - r.top) / r.height * 2 - 1; }, { passive: true });
  // views (metres, y up): the Blender camera, the phone alone, the book, the phone close-up
  const V = {
    hero: { pos: new THREE.Vector3(-.02, .86, .47), look: new THREE.Vector3(.0, 0, -.03), roll: -4 },
    dark: { pos: new THREE.Vector3(0, .9, .001), look: new THREE.Vector3(0, 0, 0), roll: 0 },
    book: { pos: new THREE.Vector3(-.18, .42, .22), look: new THREE.Vector3(-.12, 0, -.02), roll: -6 },
    phone: { pos: new THREE.Vector3(.1, .36, .2), look: new THREE.Vector3(.13, 0, .02), roll: 3 }
  };
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), E = new THREE.Euler();
  const mix = (a, b, t, out) => out.lerpVectors(a, b, t);
  const nudged = []; const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
  function setupNudges() { for (const [k, amt] of Object.entries(PROPS)) { const g = props[k]; if (!g || !amt) continue; const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3()); nudged.push({ g, cx: c.x, cz: c.z, rad: Math.max(sz.x, sz.z) * .55 + .04, amt: amt * .01, ox: 0, oz: 0, vx: 0, vz: 0, ro: 0, rv: 0 }); } }
  function nudge(dt, on) {
    ndc.set(P.x, -P.y); ray.setFromCamera(ndc, cam); const hit = ray.ray.intersectPlane(floor, hitP);
    nudged.forEach(n => { let fx = 0, fz = 0; if (hit && on > .5 && fine) { const dx = n.cx - hit.x, dz = n.cz - hit.z, d = Math.hypot(dx, dz); if (d < n.rad && d > 1e-4) { const k = (1 - d / n.rad) ** 2 * n.amt; fx = dx / d * k; fz = dz / d * k; } }
      const w = 9, z = .85; n.vx += ((fx - n.ox) * w * w - 2 * z * w * n.vx) * dt; n.vz += ((fz - n.oz) * w * w - 2 * z * w * n.vz) * dt; n.ox += n.vx * dt; n.oz += n.vz * dt;
      const tr = (fx - fz) * 2.2; n.rv += ((tr - n.ro) * w * w - 2 * z * w * n.rv) * dt; n.ro += n.rv * dt;
      n.g.position.set(n.ox, 0, n.oz); n.g.rotation.y = n.ro; });
  }
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    const lag = 1 - Math.exp(-dt * 5); P.x += (P.tx - P.x) * lag; P.y += (P.ty - P.y) * lag;
    // ---- timeline ----
    const kText = seg(pr, 0, .07), kDark = seg(pr, .09, .22), kUp = seg(pr, .1, .26);
    const kPw = seg(pr, .24, .32) * (1 - seg(pr, .4, .46));
    const kBack = seg(pr, .44, .56), kEve = seg(pr, .58, .7), kBook = seg(pr, .6, .72), kInk = seg(pr, .64, .86), kPhone = seg(pr, .8, .9);
    const kEveT = seg(pr, .62, .68) * (1 - seg(pr, .9, .94)), kOut = seg(pr, .93, 1);
    eveAmt = kEve; drawInk(kInk);
    const up = kUp * (1 - kBack), onDesk = 1 - up, dayAmt = (1 - kDark * (1 - kBack)) * (1 - kEve), nightAmt = kEve * kBack, blackout = kDark * (1 - kBack);
    // ---- camera ----
    mix(V.hero.pos, V.dark.pos, up, camPos); mix(V.hero.look, V.dark.look, up, camLook); let roll = lerp(V.hero.roll, V.dark.roll, up);
    mix(camPos, V.book.pos, kBook * kBack, camPos); mix(camLook, V.book.look, kBook * kBack, camLook); roll = lerp(roll, V.book.roll, kBook * kBack);
    mix(camPos, V.phone.pos, kPhone * kBack, camPos); mix(camLook, V.phone.look, kPhone * kBack, camLook); roll = lerp(roll, V.phone.roll, kPhone * kBack);
    camPos.x += P.x * .03 * (1 - up); camPos.z += P.y * .02 * (1 - up);
    cam.position.copy(camPos); cam.up.set(0, 1, 0); cam.lookAt(camLook); cam.rotateZ(THREE.MathUtils.degToRad(roll));
    // ---- light ----
    sun.intensity = 3.4 * dayAmt; room.intensity = .55 * (1 - blackout) * (1 - nightAmt * .6); sky.intensity = .22 * (1 - blackout) * (1 - nightAmt * .5);
    lamp.intensity = 7 * nightAmt; rim.intensity = 3.5 * up * (1 - kOut);
    set.visible = blackout < .995;
    nudge(dt, onDesk);
    // ---- the phone ----
    pv.position.set(lerp(SPOT.x, 0, up), lerp(SPOT.y, .5, up), lerp(SPOT.z, 0, up));
    pv.scale.setScalar(PH_SCALE * lerp(1, 1.0, up));
    E.set(up * (P.y * .16 + Math.sin(now / 2600) * .04), SPOT_ROT * (1 - up) + up * P.x * .2, up * Math.sin(now / 3100) * .03, 'XYZ'); pv.rotation.copy(E);
    // when it floats it faces the camera: tilt the flat phone up
    const bz = (now - buzz) / 1000; if (bz < .35 && onDesk > .5) pv.position.x += Math.sin(bz * 90) * .0012 * (1 - bz / .35);
    rim.target.position.copy(pv.position);
    // ---- the screen ----
    const heroMsgs = Math.floor(clamp(pr, 0, .085) / .0107), eveMsgs = Math.floor(clamp(pr - .6, 0, .3) / .022);
    syncBanners(now, up > .05 ? 0 : heroMsgs + eveMsgs); showScreen(up > .05 ? 'cover-book' : 'lock');
    const litTarget = (up > .05 || wantCount > 0) ? 1 : 0; wake += (litTarget - wake) * (1 - Math.exp(-dt * 6)); if (Math.abs(litTarget - wake) > .002) dirty = true;
    if (screens.fade < 1) { screens.fade = Math.min(1, screens.fade + dt * 3); dirty = true; }
    if (dirty) { drawScreen(now, wake); dirty = banners.some(b => now - b.t < 600) || screens.fade < 1; }
    // ---- focus ----
    const dPhone = cam.position.distanceTo(pv.position), dLook = cam.position.distanceTo(camLook), fu = post.uniforms;
    fu.uFocus.value = lerp(dLook, dPhone, up + kPhone * kBack); fu.uRange.value = lerp(.5, .12, up) - (kBook * kBack) * .22; fu.uMax.value = (6 + 10 * up + 6 * kBook * kBack) * dpr();
    fu.uVig.value = .35 + .3 * nightAmt - .3 * kOut; fu.uFringe.value = 0;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x0e0c0a, 1); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    const S = (k, v) => ov.style.setProperty(k, (+v).toFixed(3));
    S('--kText', kText); S('--kDark', kDark); S('--kUp', kUp); S('--kPw', kPw); S('--kEve', kEve); S('--kEveT', kEveT); S('--kOut', kOut);
  }
  requestAnimationFrame(frame);
}

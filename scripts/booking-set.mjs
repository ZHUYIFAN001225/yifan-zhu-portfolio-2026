// Glasgow Salon Booking — the counter, for real: the set built and lit in Blender (blender/desk_scene.py), exported as
// glb and rebuilt here as live 3D. The phone is live (asleep → messages with the scroll), the handwriting grows on the
// page, everything on the counter gives way a little under the pointer, and one camera does the whole opening:
// the counter by day → the set goes dark and the phone rises alone → back to the counter → the lamp comes on and
// the camera pushes in on the book, then the phone → hand over to paper. Units are metres, like the Blender file.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, SCREEN } from './phone3d.mjs';
import { loadGLB } from './glb-lite.mjs';
import { T } from './booking-copy.mjs';
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => sm((p - a) / (b - a));
const seed = s => { let t = (s * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
const HAND = '"Segoe Print","Bradley Hand","Comic Sans MS","Noto Sans CJK SC",cursive';
export const CHARS = () => '';
const MODELS = 'assets/v3/desk/baked/';   // the Blender bake: every surface carries its Cycles lighting (day + night) in its texture
const PROPS = { notebook: .05, pencil: .9, pen: .9, eraser: .8, comb: .7, scissors: .4, clips: 1, binder: .7, mat: 0 }; // how far each thing gives way (× 1 cm)

export function mountDesk(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-dk')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02, keep: true };   // hidden through the opening; the phone stands beside the story after it
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
  text(); document.addEventListener('portfolio:language', () => setTimeout(() => { text(); splitAll(); inkNow = -1; drawLeft(); screens.load(); }, 40));

  // ---------- the words: letter by letter, tied to the scroll (measured on oryzo.ai) ----------
  // Headings arrive from their LAST letter and leave from their last letter, sliding in from the right (easing out),
  // creeping while they hold, then sliding off to the left (easing in) — about a tenth of the screen each way.
  // Paragraphs go in reading order, first letter first both ways, and drift slowly the other way. Opacity follows the
  // scroll linearly; along a line it is a soft ramp (a heading spans about half the opacity range from end to end).
  function splitLetters(el) {
    const txt = el.textContent; el.setAttribute('aria-label', txt); el.textContent = ''; const out = [];
    for (const tok of txt.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+|\s+/g) || []) {
      if (/^\s+$/.test(tok)) { el.append(' '); continue; }
      const w = document.createElement('span'); w.className = 'sx-w'; w.setAttribute('aria-hidden', 'true');
      for (const ch of tok) { const c = document.createElement('span'); c.className = 'sx-c'; c.textContent = ch; c.style.opacity = '0'; w.append(c); out.push(c); }
      el.append(w);
    }
    return out;
  }
  const GROUPS = [
    { root: '.bk-dk-hero', box: '.bk-dk-card', blocks: [['h', '.bk-dk-h', ['.t1', '.t2', '.t3']], ['p', '.bk-dk-tag'], ['p', '.bk-dk-copy'], ['p', '.bk-dk-card', ['.bk-dk-ck', '.bk-dk-cd', '.bk-dk-live']], ['p', '.bk-dk-scroll', ['.bk-dk-scroll span']]] },
    { root: '.bk-dk-pw', blocks: [['h', '.bk-dk-pw-h', ['.p1', '.p2']], ['p', '.bk-dk-pw-k'], ['p', '.bk-dk-pw-p'], ['p', '.bk-dk-pw-q']] },
    { root: '.bk-dk-eve', blocks: [['p', '.bk-dk-eve-k'], ['p', '.bk-dk-eve-p']] }];
  function splitAll() {
    GROUPS.forEach(g => {
      g.el = $(g.root); g.boxEl = g.box ? $(g.box) : null; g.el.style.filter = 'none'; g.el.style.opacity = '1'; g.el.style.transform = 'none'; g.last = '';
      g.items = g.blocks.map(([kind, sel, parts]) => { const el = $(sel); if (!el) return null; const chars = (parts || [sel]).flatMap(s => [...ov.querySelectorAll(s)]).flatMap(splitLetters); return { kind, el, chars }; }).filter(Boolean);
    });
  }
  const easeOut = t => 1 - (1 - t) ** 3, easeIn = t => t * t * t;
  function sweep(g, tin, tout) {
    tin = clamp(tin); tout = clamp(tout); const key = `${tin.toFixed(3)}|${tout.toFixed(3)}|${vw}`; if (key === g.last) return; g.last = key;
    const D = (vw || innerWidth) * .1;
    g.items.forEach(it => {
      const h = it.kind === 'h', n = it.chars.length, S = h ? .5 : .35;
      it.chars.forEach((c, i) => {
        const f = n > 1 ? i / (n - 1) : 0, k = h ? 1 - f : f;   // a heading leads with its end, a paragraph with its start
        const a = clamp(tin * (1 + S) - S * k) * (1 - clamp(tout * (1 + S) - S * k)), v = a.toFixed(2);
        if (c._v !== v) { c.style.opacity = v; c._v = v; }
      });
      const x = h ? D * (.72 * (1 - easeOut(tin)) - .72 * easeIn(tout)) - D * .03 * (tin - tout)   // in from the right, off to the left
                  : D * (-.45 * (1 - easeOut(tin)) + .45 * easeIn(tout)) + D * .03 * (tin - tout);  // the other way, slower
      it.el.style.translate = `${x.toFixed(1)}px 0`;
    });
    const life = Math.min(tin, 1 - tout); g.el.style.pointerEvents = life > .7 ? '' : 'none';
    if (g.boxEl) { const b = g.boxEl, l = clamp(life * 1.4); b.style.background = `rgba(20,30,24,${(.42 * l).toFixed(3)})`; b.style.borderColor = `rgba(255,255,255,${(.12 * l).toFixed(3)})`; b.style.backdropFilter = b.style.webkitBackdropFilter = l > .02 ? `blur(${(10 * l).toFixed(1)}px)` : 'none'; const hr = b.querySelector('hr'); if (hr) hr.style.opacity = l; }
    const ic = g.el.querySelector('.bk-dk-scroll i'); if (ic) ic.style.opacity = life;
  }
  const lin = (p, a, b) => clamp((p - a) / (b - a));
  const bornAt = performance.now();

  splitAll();
  // ---------- GL ----------
  const cv = $('.bk-dk-gl'); let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch { ov.classList.add('no-gl'); return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;   // the scene renders linear into a target; AgX (as in Blender) is applied in the post pass
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0e0c0a);
  const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(42, 1, .05, 20);
  // ---- light, as in the Blender file: a warm sun from the upper left carrying a leafy, irregular pattern over the left half;
  //      the room from the front, low and cool; in the evening a desk lamp over the book and the phone
  // the counter itself is lit by the bake; these lights exist for the live phone (and its shadow on the mat)
  const sun = new THREE.DirectionalLight(0xffcc8f, 0); sun.position.set(-1.5, 1.7, -1.2); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.00005; sun.shadow.normalBias = .0005; sun.shadow.radius = 5;
  Object.assign(sun.shadow.camera, { left: -.5, right: .5, top: .5, bottom: -.5, near: .5, far: 5 }); scene.add(sun, sun.target);
  const room = new THREE.DirectionalLight(0xdfe6ff, 0); room.position.set(.5, .35, 1.6); room.castShadow = false; scene.add(room);
  const sky = new THREE.HemisphereLight(0xb9c4d8, 0x3a2a1c, 0); scene.add(sky);
  const lamp = new THREE.PointLight(0xffc27a, 0, 2.2, 1.8); lamp.position.set(-.46, .58, -.3); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.0002; lamp.shadow.normalBias = .0005; scene.add(lamp);
  const edge = new THREE.PointLight(0xfff4e6, 0, .35, 2); scene.add(edge);
  const rim = new THREE.SpotLight(0xffc98a, 0, 4, .6, .8, 1.2); rim.position.set(-.8, 1.4, .9); scene.add(rim); rim.target.position.set(0, .7, 0); scene.add(rim.target);

  // ---------- the set, from Blender ----------
  // Every surface carries its Cycles lighting, baked in three layers on its last UV set: the room (amb, in the glb), the
  // sun alone with no leaves (sun), and the desk lamp at night (night). The leaves are cast here, live: each point is
  // traced towards the sun onto a virtual canopy above the desk, and the canopy moves a little in the wind.
  const set = new THREE.Group(); scene.add(set); const props = {}; let ready = false;
  const baked = []; const U = { uMix: { value: 0 }, uLit: { value: 1 }, uTime: { value: 0 }, uWind: { value: 1 } };
  const tex2 = (n, tag) => new Promise(res => { const t = new THREE.TextureLoader().load(`${MODELS}bake_${n}_${tag}.jpg`, () => res(t), undefined, () => res(null)); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; });
  const GAIN = 3.0;   // the bake was made at 0.4× the Blender exposure so sunlit paper fits in 8 bits; put it back here
  const LIGHT_GLSL = `
    uniform sampler2D uAmb, uSun, uNight; uniform float uMix, uLit, uTime, uWind;
    varying vec2 vBUv; varying vec3 vWP;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
    vec3 bakedLight(){
      // uAmb: the day as baked (the approved light); uSun: the same with the leaves moved a touch by a breeze.
      // The light drifts slowly between them, patch by patch, so the leaf shadows only stir.
      float ph = vn(vWP.xz * 7.) * 6.2832;
      float w = (.5 - .5 * cos(uTime * .95 + ph + sin(uTime * .4 + ph) * 1.2)) * uWind;
      vec3 day = mix(texture2D(uAmb, vBUv).rgb, texture2D(uSun, vBUv).rgb, w);
      // night: darker than the day, and only the lamp's pool over the book really lit — the rest of the desk falls away
      float pool = mix(.14, 1., smoothstep(.3, .05, distance(vWP.xz, vec2(-.09, .02))));
      vec3 night = texture2D(uNight, vBUv).rgb * .4 * pool;
      return mix(day, night, uMix) * ${GAIN.toFixed(2)} * uLit;
    }`;
  function bakedMaterial({ amb, sun, night }, page) {
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, map: page || null, side: THREE.DoubleSide });
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U, { uAmb: { value: amb }, uSun: { value: sun }, uNight: { value: night } });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 bakeUv; varying vec2 vBUv; varying vec3 vWP;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvBUv = bakeUv; vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      // the bake already holds the colour of everything except the pages (baked white, written on here)
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + LIGHT_GLSL)
        .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= bakedLight();');
    };
    return m;
  }
  Promise.all(['desk', 'mat', 'notebook', 'pencil', 'pen', 'eraser', 'comb', 'scissors', 'clips', 'binder'].map(n => Promise.all([loadGLB(`${MODELS}${n}.glb`), tex2(n, 'day2'), tex2(n, 'night')]).then(([o, sun, night]) => {
    props[n] = o; set.add(o); let amb = null;
    o.traverse(m => { if (!m.isMesh) return; if (!amb && m.material.map) amb = m.material.map; const a = m.geometry.attributes, k = ['uv3', 'uv2', 'uv1'].find(x => a[x]); m.geometry.setAttribute('bakeUv', a[k] || a.uv); });
    const L3 = { amb, sun, night }, mat = bakedMaterial(L3);
    const pages = { nb_page_r: bakedMaterial(L3, pageTex), nb_page_l: bakedMaterial(L3, pageTexL) };
    o.traverse(m => { if (!m.isMesh) return; m.castShadow = false; m.receiveShadow = false; const pg = Object.keys(pages).find(k => m.name === k || m.parent?.name === k); m.material = pg ? pages[pg] : mat; });
  }).catch(e => console.warn('glb', n, e)))).then(() => { ready = true; setupNudges(); drawInk(0, true); drawLeft(); });
  // the live phone's shadow lands on the mat through this catcher (the bake has no phone in it)
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(.7, .55), new THREE.ShadowMaterial({ opacity: .55 })); catcher.rotation.x = -Math.PI / 2; catcher.rotation.z = THREE.MathUtils.degToRad(5); catcher.position.set(.09, .0036, .05); catcher.receiveShadow = true; scene.add(catcher);
  // the pages: lines + ink drawn here, mapped onto the page planes of the model (portrait, like the paper)
  const pageCv = document.createElement('canvas'); pageCv.width = 900; pageCv.height = 1240; const px = pageCv.getContext('2d');
  const pageTex = new THREE.CanvasTexture(pageCv); pageTex.colorSpace = THREE.SRGBColorSpace; pageTex.flipY = false; pageTex.anisotropy = 8;
  const pageCvL = document.createElement('canvas'); pageCvL.width = 900; pageCvL.height = 1240; const pl = pageCvL.getContext('2d');
  const pageTexL = new THREE.CanvasTexture(pageCvL); pageTexL.colorSpace = THREE.SRGBColorSpace; pageTexL.flipY = false; pageTexL.anisotropy = 8;
  const TIMES = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00'];
  const rowY = (h, row) => h * (.13 + row * .048);
  function ruled(x, title) {
    const w = 900, h = 1240; x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#fbf7ee'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#17362b'; x.font = `700 ${Math.round(h * .03)}px "Inter Tight", Inter, system-ui, sans-serif`; x.fillText(title, w * .09, h * .085);
    for (let i = 0; i < 17; i++) { x.strokeStyle = 'rgba(23,54,43,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(w * .08, rowY(h, i)); x.lineTo(w * .92, rowY(h, i)); x.stroke(); x.fillStyle = 'rgba(23,54,43,.55)'; x.font = `500 ${Math.round(h * .017)}px Inter, system-ui, sans-serif`; x.fillText(TIMES[i], w * .09, rowY(h, i) - h * .008); }
  }
  const hand = (x, txt, X, y, size, col, rot) => { x.save(); x.translate(X, y); x.rotate(rot); x.fillStyle = col; x.font = `italic 600 ${Math.round(size)}px ${HAND}`; x.fillText(txt, 0, 0); x.restore(); };
  // the left page: yesterday, already done — ticked off, one no-show, a cash note
  const LEFT = [[0, ['9:00 Mrs Li — trim ✓', '9:00 李太太 — 修剪 ✓']], [2, ['10:00 Sun — cut + wash ✓', '10:00 孙先生 — 剪+洗 ✓']], [4, ['11:00 Emma ✓', '11:00 Emma ✓']], [7, ['12:30 Zhou — no show', '12:30 周先生 — 没来']], [10, ['2:00 colour (Anna) ✓', '2:00 染发（Anna）✓']], [13, ['3:30 walk-in, paid cash', '3:30 散客，现金']], [15, ['£ count: 6', '今天：6 位']]];
  function drawLeft() {
    const w = 900, h = 1240, r = seed(11); ruled(pl, zh() ? '周四 5 日' : 'THURSDAY 5');
    LEFT.forEach(([row, t], i) => hand(pl, L(t), w * .22, rowY(h, row) - h * .006, h * .029 + r() * 2, i === 3 ? '#6b6f7a' : '#15171c', (r() - .5) * .035));
    pl.strokeStyle = '#6b6f7a'; pl.lineWidth = h * .0035; pl.beginPath(); pl.moveTo(w * .21, rowY(h, 7) - h * .014); pl.lineTo(w * .78, rowY(h, 7) - h * .018); pl.stroke();
    pageTexL.needsUpdate = true;
  }
  const EV = [
    [0, .22, ['TOMORROW ↓', '明天 ↓'], '#15171c'], [1, .22, ['9:30 Emma? ring back', '9:30 Emma? 回电'], '#15171c'], [3, .22, ['11:00 He (moved)', '11:00 何先生（挪过来）'], '#15171c'],
    ['strike', 3, .2, .72], ['fix', 3.55, .3, ['→ 11:30, he rang', '→ 11:30，他来电话了'], '#b3261e'], [6, .5, ['Zhou → 12:30?', '周先生 → 12:30?'], '#15171c'],
    [9, .22, ['2:00 colour — 2h!! block it', '2:00 染发 — 2 小时!! 留住'], '#15171c'], ['strike', 1, .2, .62], ['fix', 1.55, .3, ['Emma: Fri instead', 'Emma：改周五'], '#b3261e'],
    [12, .22, ['Sunday? ask everyone', '周日开不开? 问一圈'], '#15171c'], [15, .22, ['bed. 23:40', '睡觉。23:40'], '#6b6f7a']];
  let inkNow = -1;
  function drawInk(k, force) {
    k = Math.round(clamp(k) * 24) / 24; if (k === inkNow && !force) return; inkNow = k;
    const w = 900, h = 1240, r = seed(5); ruled(px, zh() ? '周五 6 日' : 'FRIDAY 6');
    EV.forEach((e, i) => { const k0 = i / EV.length, k1 = (i + 1) / EV.length; if (k <= k0) return; const part = clamp((k - k0) / (k1 - k0));
      if (e[0] === 'strike') { const [, row, x0, x1] = e; px.strokeStyle = '#b3261e'; px.lineWidth = h * .004; px.beginPath(); px.moveTo(w * x0, rowY(h, row) - h * .012); px.lineTo(w * lerp(x0, x1, part), rowY(h, row) - h * .016); px.stroke(); return; }
      const fix = e[0] === 'fix'; const [row, fx, txt, col] = fix ? e.slice(1) : e, y = rowY(h, row) - h * .006, X = w * fx;
      px.save(); px.beginPath(); px.rect(0, y - h * .045, X + part * w * .75, h * .06); px.clip(); hand(px, L(txt), X, y, h * (fix ? .024 : .031) + r() * 2, col, (r() - .5) * .04); px.restore(); });
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
    if (screens.cur === 'lock') drawLock(W, H);
    else { const im = screens.imgs[screens.cur]; if (!im) return; paint(sx, im, true); if (screens.prev && screens.fade < 1) { sx.globalAlpha = 1 - screens.fade; paint(sx, screens.prev, true); sx.globalAlpha = 1; } }
    // asleep: the glass goes black until the first message wakes it
    if (lit < 1) { sx.fillStyle = `rgba(0,0,0,${1 - lit})`; sx.fillRect(0, 0, W, H); }
    tex.needsUpdate = true;
  }
  // the iPhone lock screen, as it is out of the box: near-black glass with a faint blue bloom, the date, a big clock,
  // the alarm pill, the two corner buttons. Thursday 5 November — 8:47 in the morning, 22:47 at night (alarm set for 7:30).
  // The messages are not on the glass: they rise out of it (below).
  const SYS = '-apple-system, "SF Pro Display", "Inter Tight", Inter, system-ui, sans-serif';
  function drawLock(W, H) {
    const night = eveAmt > .5;
    sx.fillStyle = '#040507'; sx.fillRect(0, 0, W, H);
    let g = sx.createRadialGradient(W * .62, H * .45, 0, W * .62, H * .45, W * 1.05); g.addColorStop(0, 'rgba(16,26,58,.95)'); g.addColorStop(1, 'rgba(4,5,7,0)'); sx.fillStyle = g; sx.fillRect(0, 0, W, H);
    g = sx.createRadialGradient(-W * .1, H * .62, 0, -W * .1, H * .62, W * .8); g.addColorStop(0, 'rgba(46,46,44,.7)'); g.addColorStop(1, 'rgba(4,5,7,0)'); sx.fillStyle = g; sx.fillRect(0, 0, W, H);
    paintIsland();
    sx.textAlign = 'center'; sx.textBaseline = 'alphabetic'; sx.fillStyle = 'rgba(236,238,245,.92)';
    sx.font = `600 ${Math.round(W * .062)}px ${SYS}`; sx.fillText(zh() ? '11月5日 星期四' : 'Thursday, 5 November', W / 2, W * .25);
    sx.font = `600 ${Math.round(W * .27)}px "SF Pro Rounded", ${SYS}`; sx.fillStyle = 'rgba(226,229,240,.96)';
    try { sx.letterSpacing = `${-Math.round(W * .006)}px`; } catch {}
    sx.fillText(night ? '22:47' : '8:47', W / 2, W * .53); try { sx.letterSpacing = '0px'; } catch {}
    // the alarm pill
    const pill = night ? (zh() ? '早上 7:30' : '7:30 AM') : (zh() ? '无闹钟' : 'No Alarm');
    sx.font = `500 ${Math.round(W * .05)}px ${SYS}`; const tw = sx.measureText(pill).width, pw = tw + W * .17, ph = W * .105, py = W * .6;
    sx.fillStyle = 'rgba(255,255,255,.07)'; sx.beginPath(); sx.roundRect((W - pw) / 2, py, pw, ph, ph / 2); sx.fill();
    const ix = (W - pw) / 2 + W * .07, iy = py + ph / 2; sx.strokeStyle = 'rgba(236,238,245,.9)'; sx.lineWidth = W * .006;
    sx.beginPath(); sx.arc(ix, iy + W * .002, W * .018, 0, Math.PI * 2); sx.stroke(); sx.beginPath(); sx.moveTo(ix, iy - W * .008); sx.lineTo(ix, iy + W * .002); sx.lineTo(ix + W * .008, iy + W * .008); sx.stroke();
    sx.fillStyle = 'rgba(236,238,245,.92)'; sx.textAlign = 'left'; sx.fillText(pill, ix + W * .04, iy + W * .017);
    // the notifications, gathered into one stack near the bottom, the way iOS keeps them: the newest on top, the edges
    // of the older ones showing beneath, and the count under it. The messages themselves float above the phone.
    const last = banners[banners.length - 1];
    if (last && unread > 0) {
      const age = (performance.now() - last.t) / 1000, kin = sm(age / .45), cw = W * .9, cx = (W - cw) / 2, chh = W * .2, cy = H * .63 + (1 - kin) * W * .05;
      for (let k = Math.min(unread - 1, 2); k >= 1; k--) { sx.fillStyle = `rgba(150,156,170,${.32 - k * .08})`; sx.beginPath(); sx.roundRect(cx + k * W * .035, cy + chh - W * .02 + k * W * .022, cw - k * W * .07, W * .05, W * .03); sx.fill(); }
      sx.save(); sx.globalAlpha = .55 + .45 * kin; sx.fillStyle = 'rgba(205,210,222,.93)'; sx.beginPath(); sx.roundRect(cx, cy, cw, chh, W * .055); sx.fill(); sx.restore();
      const ic = W * .1, ix2 = cx + W * .04, iy2 = cy + (chh - ic) / 2; sx.fillStyle = '#2dc100'; sx.beginPath(); sx.roundRect(ix2, iy2, ic, ic, ic * .26); sx.fill();
      sx.fillStyle = '#fff'; sx.beginPath(); sx.ellipse(ix2 + ic * .4, iy2 + ic * .45, ic * .24, ic * .2, 0, 0, Math.PI * 2); sx.fill(); sx.beginPath(); sx.ellipse(ix2 + ic * .63, iy2 + ic * .62, ic * .2, ic * .17, 0, 0, Math.PI * 2); sx.fill();
      const tx2 = ix2 + ic + W * .035; sx.textAlign = 'left'; sx.fillStyle = '#111'; sx.font = `600 ${Math.round(W * .042)}px ${SYS}`; sx.fillText(last.who, tx2, cy + chh * .42);
      sx.fillStyle = '#6e6e74'; sx.font = `500 ${Math.round(W * .034)}px ${SYS}`; sx.textAlign = 'right'; sx.fillText(L(T.now), cx + cw - W * .045, cy + chh * .42); sx.textAlign = 'left';
      sx.fillStyle = '#2a2a2e'; sx.font = `400 ${Math.round(W * .038)}px ${SYS}`; let t2 = last.what; while (sx.measureText(t2).width > cx + cw - tx2 - W * .05 && t2.length > 4) t2 = t2.slice(0, -2); sx.fillText(t2 === last.what ? t2 : t2 + '…', tx2, cy + chh * .76);
      if (unread > 1) { sx.textAlign = 'center'; sx.fillStyle = 'rgba(236,238,245,.75)'; sx.font = `500 ${Math.round(W * .036)}px ${SYS}`; sx.fillText(zh() ? `${unread} 条通知` : `${unread} notifications`, W / 2, cy + chh + W * .12); sx.textAlign = 'left'; }
    }
    // flashlight and camera, and at night the sleep focus between them
    const by = H - W * .16, br = W * .072;
    for (const bx of [W * .17, W * .83]) { sx.fillStyle = 'rgba(255,255,255,.12)'; sx.beginPath(); sx.arc(bx, by, br, 0, Math.PI * 2); sx.fill(); }
    sx.fillStyle = 'rgba(240,240,245,.95)'; sx.beginPath(); sx.roundRect(W * .17 - W * .014, by - W * .028, W * .028, W * .056, W * .006); sx.fill(); sx.fillStyle = 'rgba(30,30,34,1)'; sx.fillRect(W * .17 - W * .006, by - W * .012, W * .012, W * .004);
    sx.fillStyle = 'rgba(240,240,245,.95)'; sx.beginPath(); sx.roundRect(W * .83 - W * .03, by - W * .02, W * .06, W * .042, W * .008); sx.fill(); sx.fillStyle = 'rgba(30,30,34,1)'; sx.beginPath(); sx.arc(W * .83, by + W * .001, W * .011, 0, Math.PI * 2); sx.fill();
    if (night) { sx.textAlign = 'center'; sx.fillStyle = 'rgba(236,238,245,.9)'; sx.font = `600 ${Math.round(W * .046)}px ${SYS}`; sx.fillText(zh() ? '睡眠' : 'Sleep', W / 2, by + W * .016); }
    sx.fillStyle = 'rgba(255,255,255,.55)'; sx.beginPath(); sx.roundRect(W / 2 - W * .17, H - W * .03, W * .34, W * .012, W * .006); sx.fill();
    sx.textAlign = 'left';
  }
  document.fonts?.ready.then(() => { dirty = true; });
  function paintIsland() { const W = sc.width; sx.fillStyle = '#000'; const iw = W * .3, ih = W * .085; sx.beginPath(); sx.roundRect((W - iw) / 2, W * .028, iw, ih, ih / 2); sx.fill(); }
  let buzz = -1e9;
  const showScreen = n => { if (screens.cur === n || (n !== 'lock' && !screens.imgs[n])) return; screens.prev = screens.cur === 'lock' ? null : screens.imgs[screens.cur]; screens.cur = n; screens.fade = 0; dirty = true; };

  // ---------- the messages, in the air ----------
  // each new message wakes the glass and rises out of it, to stand above the phone like a headset overlay: upright
  // panes of glass with a little thickness, in the scene (so they take the depth of field and pass behind/in front of
  // things), each throwing a soft shadow on the mat. The newest stays lowest; older ones are pushed up and fade.
  const HOLO_N = 3, CW = .1, CHh = CW * 250 / 900, holo = new THREE.Group(); scene.add(holo);
  const easeBack = t => { const c = 1.4; t = clamp(t) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };
  const shCv = document.createElement('canvas'); shCv.width = 256; shCv.height = 96; { const x = shCv.getContext('2d'); x.filter = 'blur(14px)'; x.fillStyle = 'rgba(0,0,0,.8)'; x.beginPath(); x.roundRect(36, 30, 184, 36, 18); x.fill(); }
  const shTex = new THREE.CanvasTexture(shCv);
  const cards = Array.from({ length: HOLO_N + 1 }, () => {
    const c = document.createElement('canvas'); c.width = 900; c.height = 250; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const g = new THREE.Group();
    const face = new THREE.Mesh(new THREE.PlaneGeometry(CW, CHh), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide }));
    face.material.color.setScalar(1.3);   // the grade pulls white down; a lit pane should stay bright
    const back = new THREE.Mesh(face.geometry, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0, color: 0x9fb4c8 }));
    back.position.z = -.0022; face.renderOrder = 7; back.renderOrder = 6;   // the glass has a back: at an angle the two read as a thickness
    g.add(back, face); g.visible = false; holo.add(g);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0 }));
    sh.rotation.x = -Math.PI / 2; sh.renderOrder = 2; scene.add(sh);
    return { c, t, g, face, back, sh, b: null, pos: new THREE.Vector3(), a: 0 };
  });
  function paintCard(cd) {
    const x = cd.c.getContext('2d'), W = 900, H = 250, b = cd.b, p = 18; x.clearRect(0, 0, W, H);
    const gr = x.createLinearGradient(0, p, 0, H - p); gr.addColorStop(0, 'rgba(250,251,253,.93)'); gr.addColorStop(1, 'rgba(232,237,243,.88)');
    x.fillStyle = gr; x.beginPath(); x.roundRect(p, p, W - 2 * p, H - 2 * p, 48); x.fill();
    x.strokeStyle = 'rgba(255,255,255,1)'; x.lineWidth = 4; x.beginPath(); x.roundRect(p + 2, p + 2, W - 2 * p - 4, H - 2 * p - 4, 46); x.stroke();   // the lit edge of the glass
    x.fillStyle = '#2dc100'; x.beginPath(); x.roundRect(p + 34, H / 2 - 48, 96, 96, 26); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.ellipse(p + 72, H / 2 - 6, 23, 19, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(p + 96, H / 2 + 11, 19, 16, 0, 0, Math.PI * 2); x.fill();
    const tx = p + 160; x.textBaseline = 'alphabetic';
    x.fillStyle = '#111'; x.font = `600 42px ${SYS}`; x.fillText(`${L(T.wxk)} · ${b.who}`, tx, H / 2 - 8);
    x.fillStyle = '#7a7a80'; x.font = `500 32px ${SYS}`; x.textAlign = 'right'; x.fillText(L(T.now), W - p - 36, H / 2 - 8); x.textAlign = 'left';
    x.fillStyle = '#333'; x.font = `400 38px ${SYS}`; let s = b.what; while (x.measureText(s).width > W - tx - p - 36 && s.length > 4) s = s.slice(0, -2); x.fillText(s === b.what ? s : s + '…', tx, H / 2 + 44);
    cd.t.needsUpdate = true;
  }
  const hv = { base: new THREE.Vector3(), tgt: new THREE.Vector3(), show: 0 };
  function updateHolo(now, dt, want) {
    hv.show += (want - hv.show) * (1 - Math.exp(-dt * 5));
    const list = banners.slice(-HOLO_N);
    hv.base.copy(pv.position);
    cards.forEach(cd => { if (cd.b && !list.includes(cd.b)) cd.b = cd.a < .02 ? null : cd.b; });
    list.forEach(b => { if (cards.some(cd => cd.b === b)) return; const cd = cards.find(cd => !cd.b) || cards.reduce((m, cd) => (cd.a < m.a ? cd : m)); cd.b = b; cd.a = 0; cd.pos.copy(hv.base).y += .004; paintCard(cd); });
    cards.forEach(cd => {
      if (!cd.b) { cd.g.visible = false; cd.sh.visible = false; return; }
      const i = list.indexOf(cd.b), live = i >= 0, slot = live ? list.length - 1 - i : HOLO_N, age = (now - cd.b.t) / 1000, e = easeBack(age / .8);
      // standing over the phone, each higher one a little further back and to the side
      hv.tgt.set(hv.base.x - .004 + slot * .011, hv.base.y + .042 + slot * .03 + Math.sin(now / 1600 + slot * 1.9) * .0018, hv.base.z - .006 - slot * .014);
      cd.pos.lerp(hv.tgt, 1 - Math.exp(-dt * (live ? 6 : 3)));
      const aim = (live ? (slot === 0 ? 1 : slot === 1 ? .82 : .6) : 0) * hv.show; cd.a += (aim - cd.a) * (1 - Math.exp(-dt * 7));
      const op = cd.a * clamp(age / .3); cd.g.visible = op > .01; cd.face.material.opacity = op; cd.back.material.opacity = op * .45;
      // upright, turned towards the camera and leaning back a little, so the shot looks down onto them in perspective
      cd.g.position.copy(cd.pos); cd.g.rotation.set(-.32, Math.atan2(cam.position.x - cd.pos.x, cam.position.z - cd.pos.z) + .12 - slot * .06, 0, 'YXZ');
      cd.g.scale.setScalar(lerp(.3, 1, e));
      // the shadow on the mat: offset away from the light, softer and fainter the higher the pane floats
      const h = cd.pos.y - .002; cd.sh.visible = op > .01; cd.sh.position.set(cd.pos.x + h * .35, .0102, cd.pos.z + h * .5);
      cd.sh.scale.set(CW * 1.15 * lerp(.3, 1, e), CW * .36, 1); cd.sh.material.opacity = op * clamp(.7 - h * 5, .15, .6);
    });
  }

  // ---------- camera, pointer, nudges ----------
  let vw = 0, vh = 0, rt = null;
  const dpr = () => inBody ? .34 : Math.min(devicePixelRatio || 1, 1.75);   // behind the text: a small image, blurred, then scaled up — a smooth defocus, and cheap
  const post = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { toneMappingExposure: { value: 1 }, tCol: { value: null }, tDep: { value: null }, uRes: { value: new THREE.Vector2() }, uNear: { value: cam.near }, uFar: { value: cam.far }, uFocus: { value: 13 }, uJit: { value: 1 }, uRange: { value: 4 }, uMax: { value: 12 }, uVig: { value: .55 }, uFringe: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `precision highp float;
      #include <tonemapping_pars_fragment>
      varying vec2 vUv; uniform sampler2D tCol, tDep; uniform vec2 uRes; uniform float uNear, uFar, uFocus, uRange, uMax, uVig, uFringe, uJit;
      float dist(vec2 uv){ float z = texture2D(tDep, uv).r * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear)); }
      float coc(vec2 uv){ return clamp(abs(dist(uv) - uFocus) / uRange, 0.0, 1.0) * uMax; }
      void main(){
        float c0 = coc(vUv); float r = c0;
        vec3 acc = vec3(0.0); float wsum = 0.0; float a0 = fract(sin(dot(vUv * uRes, vec2(12.9898, 78.233))) * 43758.5453) * 6.2832 * uJit;
        for (int i = 0; i < 20; i++){ float fi = float(i); float ang = fi * 2.39996 + a0; float rad = sqrt((fi + .5) / 20.0);
          vec2 o = vec2(cos(ang), sin(ang)) * rad * r / uRes; float ct = coc(vUv + o); float w = (ct >= c0 * .7) ? 1.0 : .03; // a sharp, bright thing in front never bleeds a halo into the soft background
          acc += texture2D(tCol, vUv + o).rgb * w; wsum += w; }
        vec3 col;
        if (c0 < .5) {   // in focus: the pixel itself, with a light unsharp mask so the grain of the wood reads
          vec2 px = 1.0 / uRes; vec3 c = texture2D(tCol, vUv).rgb;
          vec3 nb = (texture2D(tCol, vUv + vec2(px.x, 0.)).rgb + texture2D(tCol, vUv - vec2(px.x, 0.)).rgb + texture2D(tCol, vUv + vec2(0., px.y)).rgb + texture2D(tCol, vUv - vec2(0., px.y)).rgb) * .25;
          col = max(c + (c - nb) * .45, 0.0);
        } else col = acc / wsum;
        vec2 q = (vUv - .5) * vec2(uRes.x / uRes.y, 1.0); float rr = length(q);
        if (uFringe > 0.0) { vec2 d = (vUv - .5) * uFringe * rr; col.r = mix(col.r, texture2D(tCol, vUv + d).r, .6); col.b = mix(col.b, texture2D(tCol, vUv - d).b, .6); }
        col *= 1.0 - uVig * smoothstep(.45, 1.25, rr);
        col = AgXToneMapping(col);
        col = pow(max(col, 0.0), vec3(1.0 / 2.2));
        float lum = dot(col, vec3(.2126, .7152, .0722)); col = mix(vec3(lum), col, 1.12);
        col = clamp((col - .5) * 1.2 + .5 - .015, 0.0, 1.0);
        gl_FragColor = vec4(col, 1.0); }` });
  post.toneMapped = false;
  const postScene = new THREE.Scene(); postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post)); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let inBody = false;
  const resize = () => { vw = inBody ? innerWidth : op.clientWidth; vh = inBody ? innerHeight : op.clientHeight; const d = dpr(); renderer.setPixelRatio(d); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(.5 / clamp(cam.aspect, 1.15, 2.2))); cam.updateProjectionMatrix();
    rt?.dispose(); const W = Math.round(vw * d), H = Math.round(vh * d); const dt = new THREE.DepthTexture(W, H, THREE.UnsignedIntType);
    rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: dt, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    post.uniforms.tCol.value = rt.texture; post.uniforms.tDep.value = dt; post.uniforms.uRes.value.set(W, H); };
  resize(); addEventListener('resize', resize);
  const P = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { if (!fine) return; const r = inBody ? { left: 0, top: 0, width: innerWidth, height: innerHeight } : op.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * 2 - 1; P.ty = (e.clientY - r.top) / r.height * 2 - 1; }, { passive: true });
  // views (metres, y up): the Blender camera, the phone alone, the book, the phone close-up
  const V = {
    hero: { pos: new THREE.Vector3(.025, .69, .375), look: new THREE.Vector3(.025, 0, .05), roll: 0 },
    dip: { pos: new THREE.Vector3(.06, .56, .5), look: new THREE.Vector3(.06, .02, .03), roll: 0 },   // while the messages float: lower, so they stand up   // every prop in frame; the props were pulled in around the phone, so it is bigger than in the Blender still
    dark: { pos: new THREE.Vector3(0, .9, .001), look: new THREE.Vector3(0, 0, 0), roll: 0 },
    book: { pos: new THREE.Vector3(-.135, .36, .25), look: new THREE.Vector3(-.105, 0, .03), roll: -6 },
    phone: { pos: new THREE.Vector3(.11, .3, .2), look: new THREE.Vector3(.13, .02, .02), roll: 3 }
  };
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), E = new THREE.Euler(); let dipAmt = 0;
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
  // ---------- after the opening: the same desk, at night, out of focus behind the case (trial: ?body=a) ----------
  // The canvas moves out of the opening into a fixed layer behind the page; the camera rests on a different thing on
  // the desk for each chapter and drifts between them as you read. Everything is lamp-lit and far out of focus.
  const backdrop = document.createElement('div'); backdrop.className = 'bk-backdrop'; backdrop.setAttribute('aria-hidden', 'true');
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const SHOTS = [
    ['.bk-quick', v3(-.05, .4, .42), v3(-.04, 0, .03)],      // the whole desk under the lamp
    ['#overview', v3(-.17, .22, .29), v3(-.1, 0, .02)],      // the book
    ['#system', v3(.21, .19, .29), v3(.13, 0, .04)],         // the phone
    ['#strategy', v3(.04, .34, .43), v3(.04, 0, .02)],       // the mat, wide
    ['#interfaces', v3(.16, .14, .17), v3(.13, 0, .04)],     // the phone, close
    ['#build', v3(-.02, .19, .12), v3(-.03, 0, -.14)],       // the pen and pencil
    ['#iteration', v3(-.27, .19, .23), v3(-.16, 0, .02)],    // yesterday's page
    ['#challenges', v3(.35, .15, .31), v3(.245, 0, .115)],   // the shears
    ['#research', v3(-.02, .15, .43), v3(-.06, 0, .215)],    // the comb
    ['#release', v3(.13, .3, .24), v3(.13, 0, .04)]];        // the phone again, lit
  const shotEls = () => SHOTS.map(([sel, p, l]) => ({ el: root.querySelector(sel), p, l })).filter(s => s.el);
  let shots = null; const bPos = v3(-.05, .4, .42), bLook = v3(-.04, 0, .03), tPos = v3(0, 0, 0), tLook = v3(0, 0, 0);
  const bodyA = () => document.documentElement.dataset.body === 'a';
  function moveCanvas(toBody) {
    if (toBody === inBody) return; inBody = toBody; ov.classList.toggle('is-through', toBody);   // the opening turns see-through: the same desk carries on behind it
    if (toBody) { if (!backdrop.isConnected) document.body.prepend(backdrop); backdrop.append(cv); bPos.copy(cam.position); bLook.copy(camLook); }
    else ov.prepend(cv);
    resize();
  }
  function bodyFrame(now, dt, fade) {
    shots ||= shotEls(); if (!shots.length) return;
    // where we are in the reading: between the chapter whose top has passed the middle of the screen and the next
    const H = innerHeight * .5; let i = 0, t = 0;
    for (let k = 0; k < shots.length; k++) { const y = shots[k].el.getBoundingClientRect().top - H; if (y <= 0) i = k; }
    const y0 = shots[i].el.getBoundingClientRect().top - H, n = shots[i + 1];
    if (n) { const y1 = n.el.getBoundingClientRect().top - H; t = clamp(-y0 / Math.max(1, y1 - y0)); t = t * t * t * (t * (t * 6 - 15) + 10); }
    tPos.lerpVectors(shots[i].p, (n || shots[i]).p, t); tLook.lerpVectors(shots[i].l, (n || shots[i]).l, t);
    tPos.x += Math.sin(now * .00013) * .008 + P.x * .012; tPos.y += Math.sin(now * .0001 + 1) * .005 - P.y * .008;   // it breathes, and leans a little with the pointer
    const k = 1 - Math.exp(-dt * 1.6); bPos.lerp(tPos, k); bLook.lerp(tLook, k);
    cam.position.copy(bPos); cam.up.set(0, 1, 0); cam.lookAt(bLook);
    sun.intensity = 0; room.intensity = .06; sky.intensity = .03; lamp.intensity = .5; rim.intensity = 0; edge.intensity = 0;
    U.uMix.value = 1; U.uLit.value = 1; U.uTime.value = now / 1000; catcher.visible = true; catcher.material.opacity = .4; set.visible = true;
    nudge(dt, 0);
    pv.position.copy(SPOT); pv.scale.setScalar(PH_SCALE); pv.rotation.set(0, SPOT_ROT, 0);
    eveAmt = 1; drawInk(1);
    syncBanners(now, 14); showScreen('lock'); updateHolo(now, dt, 0);
    wake += (1 - wake) * (1 - Math.exp(-dt * 6)); if (screens.fade < 1) { screens.fade = Math.min(1, screens.fade + dt * 3); dirty = true; }
    if (dirty) { drawScreen(now, wake); dirty = false; }
    const fu = post.uniforms; fu.uFocus.value = cam.position.distanceTo(bLook) * .55; fu.uRange.value = .06; fu.uMax.value = 4.5; fu.uJit.value = 0; fu.uVig.value = .85; fu.uFringe.value = 0;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x0e0c0a, 1); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    backdrop.style.opacity = fade.toFixed(3);
  }
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect();
    const dt = clamp((now - last) / 1000, 0, .05); last = now;
    // the case body under way (and the trial is on): the desk goes behind the page, fading in out of the black
    if (bodyA() && ready && r.bottom < innerHeight * .995) { moveCanvas(true); bodyFrame(now, dt, 1); return; }
    moveCanvas(false);
    if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    const lag = 1 - Math.exp(-dt * 5); P.x += (P.tx - P.x) * lag; P.y += (P.ty - P.y) * lag;
    // ---- timeline ----
    const kText = seg(pr, 0, .07), kDark = seg(pr, .09, .22), kUp = seg(pr, .1, .26);
    const kPw = seg(pr, .24, .32) * (1 - seg(pr, .4, .46));
    const kBack = seg(pr, .44, .56), kEve = seg(pr, .58, .7), kBook = seg(pr, .6, .72), kInk = seg(pr, .64, .86), kPhone = seg(pr, .8, .9);
    const kEveT = seg(pr, .62, .68) * (1 - seg(pr, .9, .94)), kOut = seg(pr, .885, .985);   // a slow fade to black
    eveAmt = kEve; drawInk(kInk);
    const up = kUp * (1 - kBack), onDesk = 1 - up, dayAmt = (1 - kDark * (1 - kBack)) * (1 - kEve), nightAmt = kEve * kBack, blackout = kDark * (1 - kBack);
    // ---- camera ----
    mix(V.hero.pos, V.dark.pos, up, camPos); mix(V.hero.look, V.dark.look, up, camLook); let roll = lerp(V.hero.roll, V.dark.roll, up);
    // when the messages start to rise, the camera settles a little lower and stays there until the counter goes dark
    dipAmt += ((banners.length && up < .02 && pr < .1 ? 1 : 0) - dipAmt) * (1 - Math.exp(-dt * 1.3));
    mix(camPos, V.dip.pos, dipAmt * .55 * (1 - up), camPos); mix(camLook, V.dip.look, dipAmt * .55 * (1 - up), camLook);
    mix(camPos, V.book.pos, kBook * kBack, camPos); mix(camLook, V.book.look, kBook * kBack, camLook); roll = lerp(roll, V.book.roll, kBook * kBack);
    mix(camPos, V.phone.pos, kPhone * kBack, camPos); mix(camLook, V.phone.look, kPhone * kBack, camLook); roll = lerp(roll, V.phone.roll, kPhone * kBack);
    camPos.x += P.x * .018 * (1 - up);   // left/right: a little parallax
    { // up/down: orbit about what the camera looks at — pointer at the top ≈ straight down, at the bottom a good deal lower
      const k = (1 - up) * (1 - .6 * kBook * kBack), d = THREE.MathUtils.degToRad(lerp(-17, 15, clamp((P.y + 1) / 2))) * k;   // top: nearly plan view; bottom: ~15° lower
      const vx = camPos.x - camLook.x, vy = camPos.y - camLook.y, vz = camPos.z - camLook.z, hz = Math.hypot(vx, vz) || 1e-6, r = Math.hypot(hz, vy), el = Math.min(Math.atan2(vy, hz) - d, THREE.MathUtils.degToRad(84));
      camPos.set(camLook.x + vx / hz * r * Math.cos(el), camLook.y + r * Math.sin(el), camLook.z + vz / hz * r * Math.cos(el)); }
    cam.position.copy(camPos); cam.up.set(0, 1, 0); cam.lookAt(camLook); cam.rotateZ(THREE.MathUtils.degToRad(roll));
    // ---- light ----
    sun.intensity = 2.2 * dayAmt; room.intensity = .45 * (1 - blackout) * (1 - nightAmt * .85); sky.intensity = .2 * (1 - blackout) * (1 - nightAmt * .8);
    lamp.intensity = .5 * nightAmt; rim.intensity = 3.5 * up * (1 - kOut);
    U.uMix.value = nightAmt; U.uLit.value = 1 - blackout; U.uTime.value = now / 1000; catcher.visible = onDesk > .5; catcher.material.opacity = .55 * dayAmt + .4 * nightAmt;
    set.visible = blackout < .995;
    nudge(dt, onDesk);
    // ---- the phone ----
    pv.position.set(lerp(SPOT.x, .015, up), lerp(SPOT.y, .47, up), lerp(SPOT.z, .05, up));   // risen: centred a little low, clear of the header and the heading
    pv.scale.setScalar(PH_SCALE * lerp(1, 1.0, up));
    E.set(up * (P.y * .16 + Math.sin(now / 2600) * .04), SPOT_ROT * (1 - up) + up * P.x * .2, up * Math.sin(now / 3100) * .03, 'XYZ'); pv.rotation.copy(E);
    // when it floats it faces the camera: tilt the flat phone up
    const bz = (now - buzz) / 1000; if (bz < .35 && onDesk > .5) pv.position.x += Math.sin(bz * 90) * .0012 * (1 - bz / .35);
    rim.target.position.copy(pv.position);
    edge.position.set(pv.position.x + P.x * .075, pv.position.y + .012 + up * .02, pv.position.z + P.y * .13 * (1 - up) + P.y * .1 * up);
    edge.intensity = fine ? (.08 * (1 - up) * (1 - kOut) + .5 * up) : 0;
    // ---- the screen ----
    const heroMsgs = Math.floor(clamp(pr, 0, .085) / .0107), eveMsgs = Math.floor(clamp(pr - .6, 0, .3) / .022);
    syncBanners(now, up > .05 ? 0 : heroMsgs + eveMsgs); showScreen(up > .05 ? 'cover-book' : 'lock');
    updateHolo(now, dt, (up < .05 && kOut < .3 && kBook * kBack < .6 + kPhone) ? 1 : 0);
    const litTarget = (up > .05 || wantCount > 0) ? 1 : 0; wake += (litTarget - wake) * (1 - Math.exp(-dt * 6)); if (Math.abs(litTarget - wake) > .002) dirty = true;
    if (screens.fade < 1) { screens.fade = Math.min(1, screens.fade + dt * 3); dirty = true; }
    if (dirty) { drawScreen(now, wake); dirty = banners.some(b => now - b.t < 600) || screens.fade < 1; }
    // ---- focus ----
    const dPhone = cam.position.distanceTo(pv.position), dLook = cam.position.distanceTo(camLook), fu = post.uniforms;
    fu.uFocus.value = lerp(dLook, dPhone, up + kPhone * kBack); fu.uRange.value = lerp(1.1, .12, up) - (kBook * kBack) * .8; fu.uMax.value = (2.2 * (1 - up) + 7 * kBook * kBack) * dpr();
    fu.uVig.value = .25 + .55 * nightAmt - .25 * kOut; fu.uFringe.value = 0; fu.uJit.value = 1;
    if (bodyA()) {   // the dark case: no fade to black — the close-up drifts out of focus into the same defocus the page sits on
      fu.uMax.value = lerp(fu.uMax.value, 13 * dpr(), kOut); fu.uRange.value = lerp(fu.uRange.value, .06, kOut); fu.uFocus.value = lerp(fu.uFocus.value, cam.position.distanceTo(camLook) * .55, kOut);
      fu.uVig.value = lerp(fu.uVig.value, .85, kOut); fu.uJit.value = 1 - kOut;
    }
    renderer.setRenderTarget(rt); renderer.setClearColor(0x0e0c0a, 1); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    // the words
    const tHero = clamp((now - bornAt - 300) / 1900);   // the first heading arrives on load, the rest with the scroll
    sweep(GROUPS[0], calm ? 1 : tHero, lin(pr, .004, .085));
    sweep(GROUPS[1], lin(pr, .235, .325), lin(pr, .395, .465));
    sweep(GROUPS[2], lin(pr, .6, .685), lin(pr, .87, .935));
    const S = (k, v) => ov.style.setProperty(k, (+v).toFixed(3));
    S('--kText', kText); S('--kDark', kDark); S('--kUp', kUp); S('--kPw', kPw); S('--kEve', kEve); S('--kEveT', kEveT); S('--kOut', kOut);
  }
  requestAnimationFrame(frame);
}

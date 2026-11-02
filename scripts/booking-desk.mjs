// Glasgow Salon Booking — the "desk" opening (the Oryzo-style one, built from scratch for our story).
// Seen from above: the salon's reception counter — a dark-green desk pad, the paper appointment book, a pencil, a comb,
// a sticky note, and the phone with the booking site on it. The title sits over the scene like a product page.
// Scroll: the copy blurs away, the counter dims to black, and the phone rises into the light and turns slowly in the
// dark while the first statement arrives beside it. Then it lets go and the page continues on paper.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, roundedRect, planeUV, SCREEN } from './phone3d.mjs';
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const seed = s => { let t = (s * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };

const T = {
  tag: ['MADE FOR ONE OWNER. BUILT FOR HER WHOLE DAY.', '为一位店主而做。为她的一整天而建。'],
  t1: ['GLASGOW', '格拉斯哥'], t2: ['SALON', '理发店'], t3: ['BOOKING', '预约系统'],
  copy: ['Customers book themselves. The owner sees her whole day. Nobody is deleted when plans change.', '顾客自己预约，店主一眼看完一天，计划变了也没有人被删掉。'],
  ck: ['DESIGNED AND BUILT FOR A ONE-CHAIR SALON IN GLASGOW.', '为格拉斯哥一家只有一把椅子的理发店设计并实现。'],
  cd: ['The smallest booking system that still has rules.', '最小的预约系统，但规则一条不少。'],
  live: ['Live since 21 Oct 2026 ↗', '2026 年 10 月 21 日上线 ↗'],
  scroll: ['SCROLL TO CONTINUE', '向下滚动'],
  s1: ['ISN’T JUST', '不只是'], s2: ['A BOOKING PAGE.', '一个预约页面。'],
  sp: ['It is the paper diary, the WeChat messages and the missed calls — folded into one screen both sides can trust.', '它是那本纸质预约本、微信里的消息和没接到的电话——折进一块两边都信得过的屏幕里。'],
  sq: ['The screens are the real product.', '界面就是真实产品。'],
  try: ['Try the demo ↓', '试用演示版 ↓']
};
export const CHARS = () => [...Object.values(T).flat()].join('') + '09:30 10:00 10:30 11:00 11:30 12:00 Mrs Li 3pm? Emma colour Zhou cut Ann';

export function mountDesk(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-dk')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 };
  document.documentElement.dataset.cover = 'desk';
  if (!document.querySelector('link[data-inter-tight]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.interTight = ''; l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&display=swap'; document.head.append(l); }
  const liveA = op.querySelector('.op-actions a[target]');

  const ov = document.createElement('div'); ov.className = 'bk-dk';
  ov.innerHTML = `<canvas class="bk-dk-gl" aria-hidden="true"></canvas><div class="bk-dk-grain" aria-hidden="true"></div>
    <div class="bk-dk-hero"><p class="bk-dk-tag"></p><h1 class="bk-dk-h"><b class="t1"></b><b class="t2"></b><b class="t3"></b></h1>
      <p class="bk-dk-copy"></p>
      <div class="bk-dk-card"><p class="bk-dk-ck"></p><hr><p class="bk-dk-cd"></p><a class="bk-dk-live" target="_blank" rel="noopener"></a></div>
      <p class="bk-dk-scroll"><i></i><span></span></p></div>
    <div class="bk-dk-stage"><h2 class="bk-dk-s"><b class="s1"></b><b class="s2"></b></h2><div class="bk-dk-sp"><p class="sp"></p><p class="sq"></p><a class="bk-dk-try" href="#interactive-demo"></a></div></div>`;
  op.append(ov);
  const $ = s => ov.querySelector(s);
  const text = () => {
    $('.bk-dk-tag').textContent = L(T.tag); $('.t1').textContent = L(T.t1); $('.t2').textContent = L(T.t2); $('.t3').textContent = L(T.t3);
    $('.bk-dk-copy').textContent = L(T.copy); $('.bk-dk-ck').textContent = L(T.ck); $('.bk-dk-cd').textContent = L(T.cd); $('.bk-dk-scroll span').textContent = L(T.scroll);
    const lv = $('.bk-dk-live'); if (liveA) { lv.textContent = L(T.live); lv.href = zh() ? (liveA.dataset.hrefZh || liveA.href) : liveA.href; } else lv.remove();
    $('.s1').textContent = L(T.s1); $('.s2').textContent = L(T.s2); $('.sp').textContent = L(T.sp); $('.sq').textContent = L(T.sq); $('.bk-dk-try').textContent = L(T.try);
  };
  text(); document.addEventListener('portfolio:language', () => setTimeout(() => { text(); screen(); props(); }, 40));

  // ---------- GL ----------
  const cv = $('.bk-dk-gl'); let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { ov.classList.add('no-gl'); return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture; // only the phone reflects the room: the counter is lit by the lamps alone, so it can go fully dark
  const cam = new THREE.PerspectiveCamera(34, 1, .1, 100); cam.up.set(0, 0, -1);
  const key = new THREE.DirectionalLight(0xffe2bd, 2.6); key.position.set(5, 11, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); key.shadow.bias = -.0005; key.shadow.radius = 4; scene.add(key);
  const fill = new THREE.HemisphereLight(0xf4f1ea, 0x3a2f24, .9); scene.add(fill);
  const rim = new THREE.SpotLight(0xffc98a, 0, 30, .6, .8, 1.2); rim.position.set(-4, 9, -5); scene.add(rim); rim.target.position.set(0, 6, 0); scene.add(rim.target);

  // ---------- canvas textures (everything on the counter is drawn, not photographed) ----------
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const wood = ctex(1024, 1024, (x, w, h) => {
    const r = seed(7); x.fillStyle = '#c9a070'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const y = r() * h, a = .05 + r() * .18, k = r(); x.strokeStyle = `rgba(${k > .5 ? '110,70,35' : '235,205,160'},${a})`; x.lineWidth = .5 + r() * 2.5; x.beginPath(); x.moveTo(-20, y); for (let X = 0; X <= w + 40; X += 64) x.lineTo(X, y + Math.sin(X / 180 + i) * 6 * r()); x.stroke(); }
    for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(90,55,25,${r() * .08})`; x.fillRect(r() * w, r() * h, 1, 1 + r() * 3); }
  }); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 2);
  const mat = ctex(2048, 1448, (x, w, h) => { // the desk pad: brand green with a faint grid and rulers, like a studio cutting mat
    x.fillStyle = '#1b3b2e'; x.fillRect(0, 0, w, h); const r = seed(3);
    for (let i = 0; i < 14000; i++) { x.fillStyle = `rgba(255,255,255,${r() * .035})`; x.fillRect(r() * w, r() * h, 1.2, 1.2); }
    const m = 110; x.strokeStyle = 'rgba(214,236,222,.26)'; x.lineWidth = 1.2;
    for (let X = m; X <= w - m; X += 70) { x.beginPath(); x.moveTo(X, m); x.lineTo(X, h - m); x.stroke(); }
    for (let Y = m; Y <= h - m; Y += 70) { x.beginPath(); x.moveTo(m, Y); x.lineTo(w - m, Y); x.stroke(); }
    x.strokeStyle = 'rgba(214,236,222,.55)'; x.lineWidth = 2.4; x.strokeRect(m, m, w - 2 * m, h - 2 * m);
    x.fillStyle = 'rgba(214,236,222,.7)'; x.font = '600 22px Inter, system-ui, sans-serif'; x.textAlign = 'center';
    for (let X = m, n = 0; X <= w - m; X += 70, n++) { x.fillRect(X - 1, m - 18, 2, 18); x.fillRect(X - 1, h - m, 2, 18); if (n % 2 === 0) x.fillText(String(n * 10), X, m - 26); }
    for (let Y = m, n = 0; Y <= h - m; Y += 70, n++) { x.fillRect(m - 18, Y - 1, 18, 2); x.fillRect(w - m, Y - 1, 18, 2); if (n % 2 === 0) { x.textAlign = 'right'; x.fillText(String(n * 10), m - 24, Y + 8); x.textAlign = 'center'; } }
    x.fillStyle = 'rgba(214,236,222,.5)'; x.font = '600 26px "Inter Tight", Inter, system-ui, sans-serif'; x.textAlign = 'left'; x.fillText('GLASGOW SALON BOOKING  ·  RECEPTION', m, h - m + 52);
  });
  const page = (side) => ctex(1024, 1400, (x, w, h) => { // the paper diary, a day per page, the old way
    x.fillStyle = '#f6f1e4'; x.fillRect(0, 0, w, h); const r = seed(side === 'l' ? 11 : 12);
    for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(120,100,70,${r() * .05})`; x.fillRect(r() * w, r() * h, 1, 1); }
    x.fillStyle = '#17362b'; x.font = '700 44px "Inter Tight", Inter, system-ui, sans-serif'; x.fillText(side === 'l' ? (zh() ? '周四 5 日' : 'THURSDAY 5') : (zh() ? '周五 6 日' : 'FRIDAY 6'), 96, 120);
    x.strokeStyle = 'rgba(23,54,43,.4)'; x.lineWidth = 2.5;
    const times = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00'];
    const notes = side === 'l' ? { 1: 'Emma — colour', 3: 'Mrs Li  cut', 4: '→ 3pm??', 6: 'Zhou', 9: 'Ann ✗ (cancelled)', 10: 'walk-in?', 12: 'Mrs Li', 14: 'Sun — Sunday?' } : { 2: 'Emma', 5: 'He  10:30 → 11?', 8: '— — —', 11: 'colour 2h', 13: '✆ ring back' };
    times.forEach((t, i) => { const y = 190 + i * 68; x.beginPath(); x.moveTo(80, y); x.lineTo(w - 80, y); x.stroke(); x.fillStyle = 'rgba(23,54,43,.6)'; x.font = '500 26px Inter, system-ui, sans-serif'; x.fillText(t, 96, y - 14);
      if (notes[i]) { x.save(); x.translate(230, y - 12); x.rotate((r() - .5) * .04); x.fillStyle = '#1d2f7a'; x.font = `italic 600 ${36 + r() * 6}px "Segoe Print","Bradley Hand","Comic Sans MS",cursive`; x.fillText(notes[i], 0, 0); x.restore(); } });
    x.strokeStyle = '#d9483c'; x.lineWidth = 4; x.beginPath(); x.moveTo(230, 190 + 4 * 68 - 20); x.lineTo(470, 190 + 4 * 68 - 30); x.stroke();
  });
  const note = ctex(512, 512, (x, w, h) => { x.fillStyle = '#ffe27a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, h - 40, w, 40); x.fillStyle = '#1f2a24'; x.font = 'italic 500 58px "Segoe Print","Bradley Hand","Comic Sans MS",cursive'; x.fillText(zh() ? '李阿姨 3点?' : 'Mrs Li 3pm?', 50, 180); x.fillText(zh() ? '回电!!' : 'ring back!!', 50, 300); });

  // ---------- the counter ----------
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: wood, roughness: .72, metalness: 0 })); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const pad = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(roundedRect(15.5, 10.4, .3), 12)), new THREE.MeshStandardMaterial({ map: mat, roughness: .9 })); pad.rotation.set(-Math.PI / 2, 0, .02); pad.position.set(0, .012, 0); pad.receiveShadow = true; scene.add(pad);
  const propsG = new THREE.Group(); scene.add(propsG);
  const paper = (side, x, z, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.9), new THREE.MeshStandardMaterial({ map: page(side), roughness: .95 })); m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, .06, z); m.receiveShadow = true; m.castShadow = true; return m; };
  const diary = new THREE.Group(); diary.add(paper('l', -1.07, 0, 0), paper('r', 1.07, 0, 0));
  const cover = new THREE.Mesh(new THREE.BoxGeometry(4.45, .1, 3.1), new THREE.MeshStandardMaterial({ color: 0x1d2d26, roughness: .55 })); cover.position.y = .0; cover.castShadow = true; cover.receiveShadow = true; diary.add(cover);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(.08, .07, 2.95), new THREE.MeshStandardMaterial({ color: 0x0f1a15, roughness: .6 })); spine.position.y = .07; diary.add(spine);
  diary.position.set(-3.1, .05, .3); diary.rotation.y = .1; propsG.add(diary);
  const pencil = new THREE.Group(); { const body = new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0xe8b134, roughness: .5 })); body.rotation.z = Math.PI / 2; body.castShadow = true;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.065, .35, 12), new THREE.MeshStandardMaterial({ color: 0xd9bf98, roughness: .8 })); tip.rotation.z = -Math.PI / 2; tip.position.x = 1.77;
    const lead = new THREE.Mesh(new THREE.ConeGeometry(.022, .12, 8), new THREE.MeshStandardMaterial({ color: 0x222 })); lead.rotation.z = -Math.PI / 2; lead.position.x = 1.9;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .22, 12), new THREE.MeshStandardMaterial({ color: 0xc7c9cc, metalness: .8, roughness: .3 })); band.rotation.z = Math.PI / 2; band.position.x = -1.6;
    const eraser = new THREE.Mesh(new THREE.CylinderGeometry(.066, .066, .18, 12), new THREE.MeshStandardMaterial({ color: 0xe88a8a, roughness: .9 })); eraser.rotation.z = Math.PI / 2; eraser.position.x = -1.78;
    pencil.add(body, tip, lead, band, eraser); pencil.position.set(4.3, .07, -1.3); pencil.rotation.y = -1.15; propsG.add(pencil); }
  const comb = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: 0x101416, roughness: .35, metalness: .1 }); const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, .05, .22), m); back.position.z = -.1; back.castShadow = true; comb.add(back);
    for (let i = 0; i < 34; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(.028, .045, .38), m); t.position.set(-1.14 + i * .069, 0, .2); comb.add(t); }
    comb.position.set(-1.2, .05, 3.1); comb.rotation.y = .12; propsG.add(comb); }
  const sticky = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), new THREE.MeshStandardMaterial({ map: note, roughness: .95 })); sticky.rotation.set(-Math.PI / 2, 0, -.2); sticky.position.set(4.7, .04, 2.4); sticky.castShadow = true; propsG.add(sticky);
  const clip = (x, z, r) => { const m = new THREE.Mesh(new THREE.TorusGeometry(.14, .018, 8, 24, Math.PI * 1.7), new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: .9, roughness: .25 })); m.rotation.set(-Math.PI / 2, 0, r); m.position.set(x, .03, z); propsG.add(m); };
  clip(-5.9, 2.9, .4); clip(-5.75, 3.25, 1.9); clip(5.2, -3.4, 2.4);

  // the phone: our screen on it, lying on the pad at first
  const SW = SCREEN.w, SH = SCREEN.h, sc = document.createElement('canvas'); sc.width = 780; sc.height = Math.round(780 * SH / SW);
  const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); phone.traverse(o => { if (o.isMesh) { o.castShadow = true; [].concat(o.material).forEach(m => { if (m.isMeshStandardMaterial) { m.envMap = envTex; m.envMapIntensity = 1; m.needsUpdate = true; } }); } });
  const flat = new THREE.Group(); flat.rotation.x = -Math.PI / 2; flat.add(phone); // front faces up
  const pv = new THREE.Group(); pv.add(flat); pv.scale.setScalar(1.85); scene.add(pv);
  const SPOT = new THREE.Vector3(.55, .09, .35); pv.position.copy(SPOT); pv.rotation.y = -.18;
  const screen = async () => { const im = await load(`assets/v3/screens/booking/${zh() ? 'zh/' : ''}cover-book.webp`); paint(sc.getContext('2d'), im, true); tex.needsUpdate = true; };
  screen();
  function props() { /* language swap repaints the page and the note */ diary.children.slice(0, 2).forEach((m, i) => { m.material.map?.dispose(); m.material.map = page(i ? 'r' : 'l'); m.material.needsUpdate = true; }); sticky.material.map?.dispose(); sticky.material.map = note; }

  // ---------- camera, pointer, scroll ----------
  let vw = 0, vh = 0; const resize = () => { vw = op.clientWidth; vh = op.clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  const P = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { if (!fine) return; const r = op.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * 2 - 1; P.ty = (e.clientY - r.top) / r.height * 2 - 1; }, { passive: true });
  const HERO = { pos: new THREE.Vector3(0, 12.5, 3.2), look: new THREE.Vector3(.3, 0, -.4) }, DARK = { pos: new THREE.Vector3(0, 12.5, .001), look: new THREE.Vector3(0, 0, 0) };
  const look = new THREE.Vector3(), tmp = new THREE.Vector3(), E = new THREE.Euler();
  let last = performance.now(), spin = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    const lag = 1 - Math.exp(-dt * 5); P.x += (P.tx - P.x) * lag; P.y += (P.ty - P.y) * lag;
    // stages: hero copy out 0–.14 · lights down .04–.3 · phone up .1–.34 · turn .34–.9 · statement .3–.46 · release .92–1
    const kText = sm(pr / .12), kDark = sm((pr - .05) / .2), kUp = sm((pr - .1) / .24), kTurn = sm((pr - .44) / .48), kOut = sm((pr - .93) / .07);
    // camera: a slow push in, following the pointer a little
    cam.position.lerpVectors(HERO.pos, DARK.pos, kUp); look.lerpVectors(HERO.look, DARK.look, kUp);
    cam.position.x += P.x * .5 * (1 - kUp * .6); cam.position.z += P.y * .35 * (1 - kUp);
    cam.lookAt(look);
    // lights and the counter
    key.intensity = 2.6 * (1 - kDark) ** 2; fill.intensity = .9 * (1 - kDark) ** 2; rim.intensity = lerp(0, 60, kUp) * (1 - kOut);
    key.position.set(lerp(5, 2, kUp), 11, lerp(4, -3, kUp));
    desk.visible = pad.visible = propsG.visible = kDark < .995;
    // the phone rises, faces the light and turns
    const rise = kUp; pv.position.set(lerp(SPOT.x, 0, rise), lerp(SPOT.y, 7.2, rise), lerp(SPOT.z, 0, rise));
    pv.scale.setScalar(lerp(1.85, 1.25, rise));
    if (!calm) spin = Math.sin(now / 3100) * .06 * rise;
    const turn = kTurn * Math.PI * 2.0, wob = Math.sin(now / 2600) * .05 * rise;
    // flips over slowly with the scroll (around the screen's horizontal axis), swaying a little, following the pointer a touch
    E.set(turn + P.y * .2 * rise + wob + spin, -.18 * (1 - rise) + P.x * .25 * rise, Math.sin(turn) * .35 * rise, 'XYZ'); pv.rotation.copy(E);
    rim.target.position.copy(pv.position);
    renderer.render(scene, cam);
    ov.style.setProperty('--kText', kText.toFixed(3)); ov.style.setProperty('--kDark', kDark.toFixed(3)); ov.style.setProperty('--kUp', kUp.toFixed(3));
    ov.style.setProperty('--kS', sm((pr - .3) / .14).toFixed(3)); ov.style.setProperty('--kOut', kOut.toFixed(3));
  }
  requestAnimationFrame(frame);
}

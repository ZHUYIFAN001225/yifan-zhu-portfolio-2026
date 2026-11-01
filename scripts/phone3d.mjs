// A real-feeling 3D phone: rounded titanium frame, glass back with a camera bump, and the product's real screens on the display.
// Drag to turn it in any direction; it keeps a little momentum and then sways gently. A click without dragging follows the link.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';

const zh = () => document.documentElement.lang.startsWith('zh');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const zhSrc = s => s.replace(/\/([^/]+)$/, '/zh/$1');
export const load = src => new Promise(res => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

export function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
export function planeUV(geo) {
  geo.computeBoundingBox(); const b = geo.boundingBox, p = geo.attributes.position, uv = [];
  for (let i = 0; i < p.count; i++) uv.push((p.getX(i) - b.min.x) / (b.max.x - b.min.x), (p.getY(i) - b.min.y) / (b.max.y - b.min.y));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return geo;
}

// a thin bezel, like a current phone; the screen fills almost the whole front
const PW = .76, PH = 1.62, INSET = .034;
export const SCREEN = { w: PW - INSET, h: PH - INSET };
// a soft diagonal reflection that slides across the glass as the phone turns
let streak = null;
const streakTex = () => {
  if (streak) return streak;
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 256, 512);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.34, 'rgba(255,255,255,0)'); g.addColorStop(.42, 'rgba(255,255,255,.55)'); g.addColorStop(.5, 'rgba(255,255,255,.12)'); g.addColorStop(.62, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 512);
  streak = new THREE.CanvasTexture(c); streak.colorSpace = THREE.SRGBColorSpace; return streak;
};
export function buildPhone(screenTex) {
  const W = PW, H = PH, D = .07, R = .12, bevel = .018;
  const g = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({ color: 0x9a9da4, metalness: 1, roughness: .2, clearcoat: .6, clearcoatRoughness: .12 }); // brushed titanium
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x2a2d33, metalness: .15, roughness: .3, clearcoat: 1, clearcoatRoughness: .08 });
  const body = new THREE.ExtrudeGeometry(roundedRect(W - bevel * 2, H - bevel * 2, R - bevel), { depth: D, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 24 });
  body.translate(0, 0, -D / 2);
  g.add(new THREE.Mesh(body, [glass, metal]));
  const front = D / 2 + bevel;
  const bezel = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(W - .014, H - .014, R - .008), 24), new THREE.MeshBasicMaterial({ color: 0x050506 }));
  bezel.position.z = front + .0006; g.add(bezel);
  const sw = SCREEN.w, sh = SCREEN.h;
  const screen = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(roundedRect(sw, sh, R - .02), 24)), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.position.z = front + .0012; g.add(screen);
  // a faint reflection layer so the glass catches the light as it turns
  const sheen = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(roundedRect(sw, sh, R - .02), 24)), new THREE.MeshBasicMaterial({ map: streakTex(), transparent: true, opacity: .22, depthWrite: false, toneMapped: false }));
  sheen.position.z = front + .0018; // kept off: a reflection over the screen reads like a screen protector
  // camera plateau and lenses on the back
  const back = -D / 2 - bevel;
  const bump = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(.3, .3, .07), { depth: .014, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 4, curveSegments: 16 }), [glass, metal]);
  bump.rotation.y = Math.PI; bump.position.set(W / 2 - .2, H / 2 - .2, back - .002); g.add(bump);
  const lensRing = new THREE.MeshPhysicalMaterial({ color: 0x8a8d94, metalness: 1, roughness: .2 });
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0x07080b, metalness: .3, roughness: .05, clearcoat: 1 });
  [[-.06, .06], [-.06, -.06], [.07, 0]].forEach(([x, y]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(.052, .052, .03, 32), lensRing); ring.rotation.x = Math.PI / 2;
    ring.position.set(W / 2 - .2 - x, H / 2 - .2 + y, back - .03); g.add(ring);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.038, .038, .032, 32), lensGlass); lens.rotation.x = Math.PI / 2;
    lens.position.set(W / 2 - .2 - x, H / 2 - .2 + y, back - .033); g.add(lens);
  });
  // side buttons
  const btn = (x, y, h) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.012, h, .03), metal); m.position.set(x, y, 0); g.add(m); };
  btn(W / 2 + .004, .28, .2); btn(-W / 2 - .004, .42, .08); btn(-W / 2 - .004, .26, .14); btn(-W / 2 - .004, .08, .14);
  return g;
}

// Draws one real screen into the display texture, with an iPhone status bar and island above it.
export function paint(ctx, img, status, tap, spot) {
  const c = ctx.canvas, W = c.width, H = c.height, top = status ? Math.round(W * .118) : 0;
  ctx.fillStyle = status ? '#fbfafc' : '#000'; ctx.fillRect(0, 0, W, H);
  if (img) ctx.drawImage(img, 0, top, W, H - top);
  if (status) {
    ctx.fillStyle = '#1d1d1f'; ctx.font = `600 ${Math.round(W * .042)}px -apple-system, "SF Pro Text", Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'middle'; ctx.fillText('9:41', W * .12, top * .56);
    const bx = W * .79, by = top * .56; // battery and signal, simplified
    ctx.fillRect(bx - W * .13, by - 2, W * .012, 7); ctx.fillRect(bx - W * .112, by - 5, W * .012, 10); ctx.fillRect(bx - W * .094, by - 8, W * .012, 13);
    ctx.strokeStyle = 'rgba(29,29,31,.5)'; ctx.lineWidth = 3; ctx.strokeRect(bx, by - 11, W * .07, 22); ctx.fillRect(bx + 4, by - 7, W * .05, 14);
  }
  if (tap && tap.a > 0) { // a finger-tap ripple drawn into the screen itself
    const x = tap.x / 100 * W, y = top + tap.y / 100 * (H - top), r = W * (.05 + tap.k * .07);
    ctx.save(); ctx.globalAlpha = tap.a; ctx.fillStyle = 'rgba(92,102,155,.28)'; ctx.strokeStyle = 'rgba(92,102,155,.75)'; ctx.lineWidth = W * .006;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  if (spot) { // like the anatomy view: the rest of the screen dims, the part being talked about lifts out of it and glows
    const sx = spot.x / 100 * W, sy = top + spot.y / 100 * (H - top), sw = spot.w / 100 * W, sh = spot.h / 100 * (H - top), r = W * .03;
    ctx.save(); ctx.fillStyle = 'rgba(30,30,36,.42)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (img) {
      const g = 1.07, lw = sw * g, lh = sh * g, lx = sx + sw / 2 - lw / 2, ly = sy + sh / 2 - lh / 2 - W * .02;
      const iy = (sy - top) / (H - top) * img.height, ih = sh / (H - top) * img.height, ix = sx / W * img.width, iw = sw / W * img.width;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = W * .06; ctx.shadowOffsetY = W * .03;
      ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, r); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, r); ctx.clip(); ctx.drawImage(img, ix, iy, iw, ih, lx, ly, lw, lh); ctx.restore();
      ctx.save(); ctx.shadowColor = 'rgba(245,154,184,.8)'; ctx.shadowBlur = W * .04; ctx.strokeStyle = '#f59ab8'; ctx.lineWidth = W * .01; ctx.beginPath(); ctx.roundRect(lx - W * .008, ly - W * .008, lw + W * .016, lh + W * .016, r * 1.3); ctx.stroke(); ctx.restore();
    }
  }
  // dynamic island
  ctx.fillStyle = '#050506'; const iw = W * .3, ih = W * .085, ix = (W - iw) / 2, iy = W * .028;
  ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, ih / 2); ctx.fill();
}

export function mountPhone(host) {
  if (host.dataset.phoneReady) return; host.dataset.phoneReady = '1';
  const list = host.dataset.screens.split(',').map(s => s.trim()).filter(Boolean), status = host.dataset.status === '1', interval = +(host.dataset.interval || 2800);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  host.append(renderer.domElement); renderer.domElement.className = 'phone3d-canvas';
  const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(2, 3, 4); scene.add(key);
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 50); camera.position.set(0, 0, 4.4);
  const canvas = document.createElement('canvas'); canvas.width = 780; canvas.height = Math.round(780 * SCREEN.h / SCREEN.w);
  const ctx = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); scene.add(phone);
  const base = { x: +(host.dataset.tiltX || -.08), y: +(host.dataset.tiltY || -.42) };
  let rx = base.x, ry = base.y, vx = 0, vy = 0, dragging = false, moved = 0, lastX = 0, lastY = 0, idle = 0, t0 = performance.now();
  let imgs = [], k = 0, visible = false;
  const loadAll = async () => { imgs = await Promise.all(list.map(s => load(zh() ? zhSrc(s) : s))); paint(ctx, imgs[k], status); tex.needsUpdate = true; };
  loadAll(); document.addEventListener('portfolio:language', loadAll);
  const manual = host.dataset.mode === 'manual';
  const cycle = setInterval(() => { if (manual || !visible || !imgs.length || list.length < 2) return; k = (k + 1) % imgs.length; paint(ctx, imgs[k], status); tex.needsUpdate = true; }, interval);
  let spin = null, tapAnim = null, pending = -1, spotR = null;
  const draw = () => { paint(ctx, imgs[k], status, tapAnim && tapAnim.state, spotR); tex.needsUpdate = true; };
  const ctl = {
    show(i, { turn = false, tap = null } = {}) {
      if (!imgs.length) { k = i; return; }
      tapAnim = null;
      if (turn && !calm) { pending = i; spin = { from: ry, start: performance.now(), dur: 1100, swapped: false, tap }; }
      else { k = i; draw(); if (tap) ctl.tap(tap); }
    },
    tap([x, y]) { if (calm) return; tapAnim = { x, y, start: performance.now() + 450, state: null }; },
    // turn to face a side (radians around the vertical axis); used by the booking case's travelling phone
    spot(r) { spotR = r; if (imgs.length) draw(); },
    lean(y, x) { base.y = y; if (x !== undefined) base.x = x; idle = 2; },
  };
  host._phone = ctl; host.dispatchEvent(new CustomEvent('phone-ready'));
  const resize = () => { const r = host.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); const fit = Math.max(1, 1.9 / (r.width / r.height)); camera.position.z = 4.4 * Math.min(fit, 1.6) * (+(host.dataset.zoom || 1)); };
  new ResizeObserver(resize).observe(host); resize();
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; vx = vy = 0; el.setPointerCapture(e.pointerId); host.classList.add('is-grabbing'); });
  el.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy); vy = dx * .0105; vx = dy * .0075; ry += vy; rx += vx; idle = 0; });
  const up = () => { if (!dragging) return; dragging = false; host.classList.remove('is-grabbing'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  // a drag must not count as a click on a surrounding link
  host.closest('a')?.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .05 }); io.observe(host);
  const tick = now => {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = (now - t0) / 1000;
    if (spin) { // a full turn; the screen swaps while the back faces you
      const q = Math.min(1, (now - spin.start) / spin.dur), e = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      ry = spin.from + e * Math.PI * 2; idle = 0;
      if (!spin.swapped && q > .5) { spin.swapped = true; k = pending; draw(); }
      if (q >= 1) { const tp = spin.tap; spin = null; if (tp) ctl.tap(tp); }
    }
    if (tapAnim) { const q = (now - tapAnim.start) / 700; if (q >= 0) { tapAnim.state = { x: tapAnim.x, y: tapAnim.y, k: Math.min(1, q), a: q < .25 ? q / .25 : Math.max(0, 1 - (q - .25) / .75) }; draw(); if (q >= 1) { tapAnim = null; draw(); } } }
    if (!dragging && !spin) {
      ry += vy; rx += vx; vy *= .94; vx *= .94; idle += 1 / 60;
      if (idle > 1.6) { // drift back toward a flattering angle and sway
        const ease = host.dataset.follow ? .06 : .02;
        rx += ((base.x + Math.sin(t * .6) * .05) - rx) * ease;
        const target = base.y + Math.sin(t * .45) * .18, turns = Math.round((ry - target) / (Math.PI * 2)) * Math.PI * 2;
        ry += (target + turns - ry) * (host.dataset.follow ? .06 : .02);
      }
    }
    rx = Math.max(-1.1, Math.min(1.1, rx));
    phone.rotation.set(rx, ry, 0); phone.position.y = Math.sin(t * 1.1) * .025;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(tick);
  host.classList.add('is-3d');
  return () => clearInterval(cycle);
}

export function mountAll(root = document) {
  root.querySelectorAll('[data-phone3d]').forEach(h => mountPhone(h));
}

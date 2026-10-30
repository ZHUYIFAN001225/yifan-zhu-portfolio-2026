// A real-feeling 3D phone: rounded titanium frame, glass back with a camera bump, and the product's real screens on the display.
// Drag to turn it in any direction; it keeps a little momentum and then sways gently. A click without dragging follows the link.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';

const zh = () => document.documentElement.lang.startsWith('zh');
const zhSrc = s => s.replace(/\/([^/]+)$/, '/zh/$1');
const load = src => new Promise(res => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function planeUV(geo) {
  geo.computeBoundingBox(); const b = geo.boundingBox, p = geo.attributes.position, uv = [];
  for (let i = 0; i < p.count; i++) uv.push((p.getX(i) - b.min.x) / (b.max.x - b.min.x), (p.getY(i) - b.min.y) / (b.max.y - b.min.y));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return geo;
}

function buildPhone(screenTex) {
  const W = .76, H = 1.62, D = .07, R = .13, bevel = .016;
  const g = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({ color: 0x5b5e66, metalness: 1, roughness: .28, clearcoat: .4, clearcoatRoughness: .25 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x1e2026, metalness: .1, roughness: .38, clearcoat: 1, clearcoatRoughness: .15 });
  const body = new THREE.ExtrudeGeometry(roundedRect(W - bevel * 2, H - bevel * 2, R - bevel), { depth: D, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 24 });
  body.translate(0, 0, -D / 2);
  g.add(new THREE.Mesh(body, [glass, metal]));
  const front = D / 2 + bevel;
  const bezel = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(W - .022, H - .022, R - .012), 24), new THREE.MeshBasicMaterial({ color: 0x050506 }));
  bezel.position.z = front + .0006; g.add(bezel);
  const sw = W - .062, sh = H - .062;
  const screen = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(roundedRect(sw, sh, R - .035), 24)), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.position.z = front + .0012; g.add(screen);
  // a faint reflection layer so the glass catches the light as it turns
  const sheen = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(sw, sh, R - .035), 24), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .06, roughness: .05, metalness: 0, clearcoat: 1 }));
  sheen.position.z = front + .0018; g.add(sheen);
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
function paint(ctx, img, status) {
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
  const canvas = document.createElement('canvas'); canvas.width = 780; canvas.height = Math.round(780 * ((1.62 - .062) / (.76 - .062)));
  const ctx = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); scene.add(phone);
  const base = { x: +(host.dataset.tiltX || -.08), y: +(host.dataset.tiltY || -.42) };
  let rx = base.x, ry = base.y, vx = 0, vy = 0, dragging = false, moved = 0, lastX = 0, lastY = 0, idle = 0, t0 = performance.now();
  let imgs = [], k = 0, visible = false;
  const loadAll = async () => { imgs = await Promise.all(list.map(s => load(zh() ? zhSrc(s) : s))); paint(ctx, imgs[k], status); tex.needsUpdate = true; };
  loadAll(); document.addEventListener('portfolio:language', loadAll);
  const cycle = setInterval(() => { if (!visible || !imgs.length || list.length < 2) return; k = (k + 1) % imgs.length; paint(ctx, imgs[k], status); tex.needsUpdate = true; }, interval);
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
    if (!dragging) {
      ry += vy; rx += vx; vy *= .94; vx *= .94; idle += 1 / 60;
      if (idle > 1.6) { // drift back toward a flattering angle and sway
        rx += ((base.x + Math.sin(t * .6) * .05) - rx) * .02;
        const target = base.y + Math.sin(t * .45) * .18, turns = Math.round((ry - target) / (Math.PI * 2)) * Math.PI * 2;
        ry += (target + turns - ry) * .02;
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

// My own little object for the big words: the scissors from my Blender desk (with their Cycles bake), flying after the
// pointer with a soft shadow under them; a click sends them darting to that spot with a spin and a snip.
// Phones: they wander on their own, and a tap calls them over. Built only while the section is near the screen.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { loadGLB } from './glb-lite.mjs';

const small = matchMedia('(max-width: 760px)').matches;
let modelP = null;
const model = () => modelP || (modelP = (async () => {
  const [o, tex] = await Promise.all([loadGLB('assets/v3/desk/baked/scissors.glb', { maxTex: 512 }), new Promise(r => new THREE.TextureLoader().load('assets/v3/desk/baked/bake_scissors_day2_m.jpg', r, undefined, () => r(null)))]);
  if (tex) { tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; }
  o.traverse(m => { if (!m.isMesh) return; const a = m.geometry.attributes, k = ['uv3', 'uv2', 'uv1'].find(x => a[x]); if (k && tex) m.geometry.setAttribute('uv', a[k]); m.material = new THREE.MeshBasicMaterial({ map: tex || null, color: tex ? 0xffffff : 0xdddddd }); });
  const box = new THREE.Box3().setFromObject(o), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  o.position.sub(c); const g = new THREE.Group(); g.add(o); g.userData.size = Math.max(size.x, size.y, size.z); return g;
})());

export function mountToy(sec, { fine, calm }) {
  const cv = sec.querySelector('.hv-toy-gl'); if (!cv) return;
  let renderer = null, scene, cam, toy, shadow, raf = 0, W = 0, H = 0;
  const pos = new THREE.Vector2(), vel = new THREE.Vector2(), target = new THREE.Vector2(); let spin = 0, snip = 0, dart = 0, have = false;
  const build = async () => {
    renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: !small });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene(); cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000); cam.position.z = 500;
    const sc = document.createElement('canvas'); sc.width = sc.height = 128; const x = sc.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })); scene.add(shadow);
    const m = await model(); toy = m.clone(); scene.add(toy);
    resize(); pos.set(-W * .32, H * .12); target.copy(pos); loop();
  };
  const resize = () => { if (!renderer) return; W = cv.clientWidth; H = cv.clientHeight; renderer.setSize(W, H, false); Object.assign(cam, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 }); cam.updateProjectionMatrix(); if (toy) { const s = Math.min(230, W * .2) / toy.userData.size; toy.scale.setScalar(s); } };
  addEventListener('resize', resize);
  const toLocal = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, -(e.clientY - r.top - r.height / 2)]; };
  sec.addEventListener('pointermove', e => { if (!fine) return; have = true; const [x, y] = toLocal(e); target.set(x, y + 40); });
  sec.addEventListener('pointerleave', () => { have = false; });
  sec.addEventListener('click', e => { if (e.target.closest('a,button')) return; const [x, y] = toLocal(e); target.set(x, y); dart = 1; spin += Math.PI * 2; snip = 1; });
  let last = performance.now(), t0 = performance.now();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
    if (!toy) return;
    // without a pointer (or when it leaves) the scissors wander in a slow loop round the words
    if (!have && dart < .05) target.set(Math.cos(t * .45) * W * .34, Math.sin(t * .9) * H * .2 + H * .05);
    // a spring towards the target: lazy when following, quick when darting
    const k = dart > .05 ? 60 : 14, d = 2 * Math.sqrt(k) * (dart > .05 ? .7 : .9);
    vel.x += ((target.x - pos.x) * k - vel.x * d) * dt; vel.y += ((target.y - pos.y) * k - vel.y * d) * dt;
    pos.addScaledVector(vel, dt); dart *= Math.exp(-dt * 2.5); snip *= Math.exp(-dt * 5);
    const bob = calm ? 0 : Math.sin(t * 3.2) * 6;
    toy.position.set(pos.x, pos.y + bob, 0);
    // lean into the flight, a spin on a click, and a slow turn so the bake catches the eye
    toy.rotation.z = THREE.MathUtils.clamp(-vel.x * .0009, -.7, .7) + Math.sin(t * .8) * .08;
    toy.rotation.y += ((spin + Math.sin(t * .6) * .5) - toy.rotation.y) * (1 - Math.exp(-dt * 5));
    toy.rotation.x = .9 + THREE.MathUtils.clamp(vel.y * .0006, -.4, .4) + snip * .5;
    const sz = Math.min(230, W * .2); shadow.position.set(pos.x + 20, pos.y - sz * .75, -50); shadow.scale.set(sz * 1.1 * (1 - snip * .2), sz * .4, 1);
    renderer.render(scene, cam);
  };
  // built the first time the section comes near, and paused whenever it is away
  new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !renderer) build(); else if (on && renderer && !raf) loop(); else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } }, { rootMargin: '30% 0px' }).observe(sec);
}

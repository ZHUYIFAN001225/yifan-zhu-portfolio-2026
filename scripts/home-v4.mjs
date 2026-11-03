// Home (preview v4): walk into my studio, then through an arch into a gallery of the work.
//  • The studio: warm plaster, arched windows with sun coming through, and in the middle one plaster piece built from the four
//    things I make — a phone (products), a film reel (3D & motion), a circuit (creative technology), a sprout (service &
//    ecology). A short line about how I work sits in the room, like a wall text.
//  • Scrolling walks the camera: a step closer (who I am, the facts a recruiter needs), past the piece and through the arch,
//    then hall by hall along the gallery. Each work hangs in a frame; the camera turns to face it and a museum label gives
//    its name, discipline and one line. Click the frame or the label to open the case.
//  • Phones walk the same rooms with a lighter build: no shadows, small pictures, only the frames near the camera loaded.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { projects, categories } from './portfolio-catalog.mjs';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
const ss = t => t * t * (3 - 2 * t);
const small = matchMedia('(max-width: 760px)').matches || (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- words ----------
const T = {
  name: ['Yifan Zhu', '朱异凡'],
  role: ['Research-led multidisciplinary designer', '研究驱动的跨领域设计师'],
  nav_work: ['Work', '作品'], nav_about: ['About', '关于'], nav_contact: ['Contact', '联系'],
  statement: ['Research first.\nThen built in whatever\nmedium it needs.', '先把问题研究透，\n再用它需要的媒介\n把它做出来。'],
  scroll: ['Scroll to walk in', '往下滑，走进来'],
  role_long: ['UX, service design, creative technology, 3D and AI — from field research to things people can try.', 'UX、服务设计、创意科技、3D 与 AI——从实地研究，到人们能亲手试的东西。'],
  email_label: ['Email me', '给我发邮件'], about_link: ['About me', '关于我'], all_work: ['All work at once', '一次看全部作品'],
  talk: ['Let’s talk.', '聊聊吧。'],
  talk_s: ['For roles in UX, service design and creative technology, I can share the CV that fits the role.', '如果你在招 UX、服务设计或创意科技方向的人，我可以发一份最对口的简历。'],
  loading: ['Opening the studio…', '正在打开工作室……'],
  view: ['Open the case →', '查看案例 →'], watch: ['Watch →', '观看 →'],
  hall: ['Hall', '展厅'], works: ['works', '件作品'], of: ['of', '/'],
  todo: ['to fill in', '待补充']
};
// facts a recruiter looks for first; the ones I do not know yet show as "to fill in"
const FACTS = [
  { k: ['Based', '所在地'], todo: ['City, UK · open to relocation?', '城市 · 是否接受搬家？'] },
  { k: ['Studied', '学历'], todo: ['School · degree · BA', '学校 · 学位 · 本科'] },
  { k: ['Looking for', '在找'], todo: ['Graduate / junior roles in …', '……方向的 graduate / junior 岗位'] },
  { k: ['Proof', '证明'], v: ['A live product with real customers: Glasgow Salon Booking, since Oct 2026', '一个有真实顾客在用的上线产品：格拉斯哥理发店预约，2026 年 10 月起'] }
];
const getLang = () => { const q = new URLSearchParams(location.search).get('lang'); if (q === 'zh' || q === 'en') return q; try { return localStorage.getItem('portfolio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } };
let lang = getLang();
const L = v => Array.isArray(v) ? v[lang === 'zh' ? 1 : 0] : v ? (v[lang] || v.en) : '';

// ---------- the halls and what hangs in them ----------
const ORDER = ['digital-products-ux', 'service-transformation', 'creative-technology', '3d-ai-motion'];
const HALL_TINT = { 'digital-products-ux': 0xeadbd3, 'service-transformation': 0xe9dfcc, 'creative-technology': 0xdde3d6, '3d-ai-motion': 0xd9dee3 };
const halls = ORDER.map(id => ({ id, cat: categories.find(c => c.id === id), works: projects.filter(p => (p.categories || [])[0] === id) }));

// ---------- page text ----------
function words() {
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  $$('[data-t]').forEach(el => { el.textContent = L(T[el.dataset.t]); });
  $('.hv-facts').innerHTML = FACTS.map(f => `<li class="${f.v ? '' : 'is-todo'}"><b>${L(f.k)}</b>${f.v ? L(f.v) : `<span>${L(T.todo)}: ${L(f.todo)}</span>`}</li>`).join('');
  $('.hv-halls').innerHTML = halls.map((h, i) => `<button type="button" data-hall="${i}"><span>${String(i + 1).padStart(2, '0')} · ${L(h.cat.label)}</span><i></i></button>`).join('');
  $('.hv-halls').setAttribute('aria-label', lang === 'zh' ? '展厅' : 'Gallery halls');
  $('.hv-lang').setAttribute('aria-label', lang === 'zh' ? '切换语言' : 'Language');
  $('.hv-all-x').setAttribute('aria-label', lang === 'zh' ? '关闭' : 'Close');
  $('.hv-all-grid').innerHTML = halls.map((h, i) => `<h3>${String(i + 1).padStart(2, '0')} · ${L(h.cat.label)}</h3><div class="g">${h.works.map(w => `<a href="${w.href}"><img src="${w.cover}" alt="" loading="lazy"><b>${L(w.title)}</b><small>${L(w.kind)}</small></a>`).join('')}</div>`).join('');
  hallTitles.forEach(fn => fn());
  lastLabel = -1;
}
$('.hv-lang').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; try { localStorage.setItem('portfolio-language', lang); } catch {} words(); });
document.addEventListener('click', e => { if (e.target.closest('[data-all]')) { e.preventDefault(); $('.hv-all').showModal(); } });
$('.hv-all-x').addEventListener('click', () => $('.hv-all').close());
$('.hv-all').addEventListener('click', e => { if (e.target === $('.hv-all')) $('.hv-all').close(); });

// film grain, drawn once
{ const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'), d = x.createImageData(160, 160); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); document.body.style.setProperty('--grain', `url(${c.toDataURL()})`); }

// ---------- renderer ----------
const cv = $('.hv-gl');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !small, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = !small; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe8ded0);
scene.fog = new THREE.Fog(0xe6dccd, 26, 70);
const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = small ? .55 : .32; pm.dispose();
const cam = new THREE.PerspectiveCamera(42, 1, .05, 200);

// ---------- materials ----------
const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = small ? 2 : 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };
// plaster: a soft mottle so the walls are not flat paint
const plasterTex = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#ece3d6'; x.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const r = Math.random() * 18 + 2; x.fillStyle = `rgba(${Math.random() < .5 ? '255,250,240' : '196,180,160'},${Math.random() * .05})`; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, r, 0, 7); x.fill(); } }, [3, 2]);
const wallMat = tint => new THREE.MeshStandardMaterial({ color: tint || 0xf3ebdf, map: plasterTex, roughness: .95, metalness: 0 });
// herringbone oak
const floorTex = canvasTex(1024, 1024, (x, w, h) => {
  x.fillStyle = '#b48a62'; x.fillRect(0, 0, w, h);
  const L2 = 128, W2 = 32;
  for (let gy = -2; gy < 14; gy++) for (let gx = -2; gx < 14; gx++) for (const a of [0, 1]) {
    x.save(); x.translate(gx * 2 * W2 * 2 + gy * W2 * 2, gy * W2 * 2 * 2 + (a ? W2 * 2 : 0)); x.rotate(a ? -Math.PI / 4 : Math.PI / 4);
    const tone = 150 + Math.random() * 40; x.fillStyle = `rgb(${tone + 40},${tone + 6},${tone - 40})`; x.fillRect(0, 0, L2, W2);
    x.strokeStyle = 'rgba(80,50,25,.35)'; x.lineWidth = 1.5; x.strokeRect(0, 0, L2, W2);
    for (let k = 0; k < 5; k++) { x.strokeStyle = `rgba(90,60,30,${Math.random() * .12})`; x.beginPath(); const yy = Math.random() * W2; x.moveTo(0, yy); x.lineTo(L2, yy + (Math.random() - .5) * 4); x.stroke(); }
    x.restore();
  }
}, [6, 6]);
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: .62, metalness: 0, color: 0xf0e2d0 });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4c, roughness: .7 });
const plaster = new THREE.MeshStandardMaterial({ color: 0xf1ebe2, roughness: .9, metalness: 0 });
const plinthMat = new THREE.MeshStandardMaterial({ color: 0xf2ece3, roughness: .85 });
const skyTex = canvasTex(1024, 1024, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#a9c6dd'); g.addColorStop(.6, '#cfdfe8'); g.addColorStop(1, '#efe6da'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { const cx = Math.random() * w, cy = h * (.25 + Math.random() * .6), r = 60 + Math.random() * 140; const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, 'rgba(255,255,255,.85)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.beginPath(); x.ellipse(cx, cy, r * 1.6, r * .7, 0, 0, 7); x.fill(); }
});
const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, fog: false, toneMapped: false });

// ---------- building blocks ----------
const box = (w, h, d, m, x, y, z, cast = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = cast && !small; o.receiveShadow = !small; scene.add(o); return o; };
const archPath = (p, cx, w, spring, reverse) => { const r = w / 2; if (!reverse) { p.lineTo(cx - r, spring); p.absarc(cx, spring, r, Math.PI, 0, true); } else { p.lineTo(cx + r, spring); p.absarc(cx, spring, r, 0, Math.PI, false); } };
// a wall across the room (facing +z), with a doorway arch to walk through and arched windows
function wallWithArches({ x0, x1, h, z, door, windows = [], mat, depth = .45 }) {
  const s = new THREE.Shape(); s.moveTo(x0, 0);
  if (door) { s.lineTo(door.cx - door.w / 2, 0); archPath(s, door.cx, door.w, door.h - door.w / 2); s.lineTo(door.cx + door.w / 2, 0); }
  s.lineTo(x1, 0); s.lineTo(x1, h); s.lineTo(x0, h); s.lineTo(x0, 0);
  windows.forEach(wd => { const p = new THREE.Path(); p.moveTo(wd.cx - wd.w / 2, wd.y0); archPath(p, wd.cx, wd.w, wd.h - wd.w / 2); p.lineTo(wd.cx + wd.w / 2, wd.y0); p.lineTo(wd.cx - wd.w / 2, wd.y0); s.holes.push(p); });
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, -depth);
  const m = new THREE.Mesh(g, mat); m.position.z = z; m.castShadow = !small; m.receiveShadow = !small; scene.add(m);
  // window bars: a ring round the arch, a few uprights and transoms that stop at the curve
  windows.forEach(wd => {
    const r = wd.w / 2, spring = wd.h - r, bar = .07;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r - .02, .045, 6, 40, Math.PI), woodMat); ring.position.set(wd.cx, spring, z - depth / 2); scene.add(ring);
    [-1, 0, 1].forEach(k => { const x = wd.cx + k * r * .5, top = spring + Math.sqrt(Math.max(0, r * r - (x - wd.cx) ** 2)) - .03; box(bar, top - wd.y0, bar, woodMat, x, wd.y0 + (top - wd.y0) / 2, z - depth / 2, false); });
    for (let y = wd.y0 + .9; y < spring + r * .6; y += 1.15) { const half = y <= spring ? r : Math.sqrt(Math.max(0, r * r - (y - spring) ** 2)); box(half * 2 - .04, bar, bar, woodMat, wd.cx, y, z - depth / 2, false); }
    box(wd.w + .24, .08, depth + .2, woodMat, wd.cx, wd.y0, z - depth / 2, false);
  });
  return m;
}

// ---------- the studio ----------
const STUDIO = { x0: -7.5, x1: 7.5, zBack: 0, zFront: 16, h: 7.6 };
const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 140), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -54); floor.receiveShadow = !small; scene.add(floor);
floorTex.repeat.set(4, 36);
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(15, 16), wallMat(0xf2ece4)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, STUDIO.h, 8); scene.add(ceil);
wallWithArches({ x0: STUDIO.x0, x1: STUDIO.x1, h: STUDIO.h, z: 0, mat: wallMat(), door: { cx: 0, w: 3.4, h: 5.9 }, windows: [{ cx: -4.9, w: 2.9, y0: .9, h: 6.3 }, { cx: 4.9, w: 2.9, y0: .9, h: 6.3 }] });
[-1, 1].forEach(sx => { const w = new THREE.Mesh(new THREE.PlaneGeometry(16, STUDIO.h), wallMat()); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * 7.5, STUDIO.h / 2, 8); w.receiveShadow = !small; scene.add(w); });
{ const w = new THREE.Mesh(new THREE.PlaneGeometry(15, STUDIO.h), wallMat()); w.rotation.y = Math.PI; w.position.set(0, STUDIO.h / 2, 16); scene.add(w); }
// sky beyond the windows
[-1, 1].forEach(sx => { const s = new THREE.Mesh(new THREE.PlaneGeometry(6, 9), skyMat); s.position.set(sx * 6.4, 4, -2.6); scene.add(s); });
// skirting and a cornice line, the small things that make a room
box(15, .14, .04, woodMat, 0, .07, .02, false);
// props: plinths with plaster shapes, a stool, a trestle table, a ladder
box(1.1, 1.3, 1.1, plinthMat, -5.2, .65, 7.4); { const o = new THREE.Mesh(new THREE.OctahedronGeometry(.42, 0), plaster); o.position.set(-5.2, 1.75, 7.4); o.rotation.set(.4, .6, .2); o.castShadow = !small; scene.add(o); }
box(1, 1.7, 1, plinthMat, 4.4, .85, 6.2); { const o = new THREE.Mesh(new THREE.DodecahedronGeometry(.38, 0), plaster); o.position.set(4.4, 2.05, 6.2); o.castShadow = !small; scene.add(o); }
{ const g = new THREE.Group(); const seat = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .07, 24), woodMat); seat.position.y = .78; g.add(seat); [0, 1, 2, 3].forEach(k => { const a = k * Math.PI / 2 + .4, leg = new THREE.Mesh(new THREE.CylinderGeometry(.03, .035, .8, 8), woodMat); leg.position.set(Math.cos(a) * .24, .39, Math.sin(a) * .24); leg.rotation.set(Math.sin(a) * .12, 0, -Math.cos(a) * .12); g.add(leg); }); g.position.set(-5.4, 0, 9.6); g.traverse(o => { o.castShadow = !small; }); scene.add(g); }
{ const g = new THREE.Group(); [[-.65, .3], [.65, .3], [-.65, -.3], [.65, -.3]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(.07, .95, .07), woodMat); l.position.set(x, .47, z); g.add(l); }); const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, .06, .8), woodMat); top.position.y = .97; g.add(top); [[-.3, .15, .5], [.25, .22, .12], [.55, .09, .3]].forEach(([x, h, w]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .22), plaster); b.position.set(x, 1 + h / 2, 0); g.add(b); }); g.position.set(5.6, 0, 10); g.rotation.y = -.25; g.traverse(o => { o.castShadow = !small; o.receiveShadow = !small; }); scene.add(g); }
{ const g = new THREE.Group(); [-.32, .32].forEach(x => { const r = new THREE.Mesh(new THREE.BoxGeometry(.07, 4.6, .07), woodMat); r.position.set(x, 2.3, 0); g.add(r); }); for (let y = .4; y < 4.5; y += .48) { const s = new THREE.Mesh(new THREE.BoxGeometry(.64, .05, .06), woodMat); s.position.y = y; g.add(s); } g.position.set(-6.6, 0, 4.2); g.rotation.set(-.2, .5, 0); g.traverse(o => { o.castShadow = !small; }); scene.add(g); }

// the centre piece: four plaster parts, one for each thing I make, stacked on a faceted rock — they part a little when
// the pointer comes near, and spread as you step closer
const piece = new THREE.Group(); piece.position.set(0, 0, 6); piece.scale.setScalar(.78); scene.add(piece);
const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), plaster); rock.scale.set(1.4, .7, 1.15); rock.position.y = .5; rock.castShadow = rock.receiveShadow = !small; piece.add(rock);
const parts = [];
const part = (obj, y, spread) => { obj.traverse(o => { if (o.isMesh) { o.castShadow = !small; o.receiveShadow = !small; } }); obj.position.y = y; obj.userData = { y, spread }; piece.add(obj); parts.push(obj); return obj; };
{ // a phone: digital products & UX
  const s = new THREE.Shape(), w = 1.08, h = 2.05, r = .2; s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: .1, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 3, curveSegments: 10 }); g.center();
  const m = new THREE.Mesh(g, plaster); const grp = new THREE.Group(); grp.add(m); m.rotation.set(-.15, .5, .08);
  part(grp, 2.45, [-.5, 0, .25]);
}
{ // a film reel: 3D, AI & motion
  const grp = new THREE.Group(); const disc = new THREE.Mesh(new THREE.CylinderGeometry(.78, .78, .16, 48), plaster); disc.rotation.x = Math.PI / 2; grp.add(disc);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, hole = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .14, 18), new THREE.MeshStandardMaterial({ color: 0xd8cfc2, roughness: 1 })); hole.rotation.x = Math.PI / 2; hole.position.set(Math.cos(a) * .44, Math.sin(a) * .44, .005); hole.scale.setScalar(1.4); grp.add(hole); }
  grp.rotation.set(.2, -.7, .1); part(grp, 3.95, [.6, .15, -.15]);
}
{ // a circuit: creative technology
  const grp = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, .18, .95), plaster); grp.add(b); grp.scale.setScalar(1.25);
  [[-.25, .08, -.12, .24, .1, .24], [.18, .07, .15, .3, .08, .16], [.28, .06, -.18, .12, .06, .12], [-.2, .05, .2, .14, .05, .1]].forEach(([x, y, z, w, h, d]) => { const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plaster); c.position.set(x, y + .02, z); grp.add(c); });
  grp.rotation.set(.12, .4, -.06); part(grp, 4.7, [-.45, .2, .2]);
}
{ // a sprout: service, ecology and the people it serves
  const grp = new THREE.Group(); const stem = new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, .9, 10), plaster); stem.position.y = .45; grp.add(stem);
  [[-1, .62, .55], [1, .8, .48]].forEach(([sx, y, s]) => { const leaf = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), plaster); leaf.scale.set(1, .22, .55); leaf.position.set(sx * .26 * s / .5, y, 0); leaf.rotation.z = sx * .45; grp.add(leaf); });
  const bud = new THREE.Mesh(new THREE.SphereGeometry(.14, 18, 14), plaster); bud.scale.y = 1.3; bud.position.y = .98; grp.add(bud);
  grp.scale.setScalar(1.45); part(grp, 4.84, [.2, .4, 0]);
}
let spread = 0, spreadT = 0, hoverPiece = 0;
// dust in the sunlight
const motes = (() => { const n = small ? 140 : 320, g = new THREE.BufferGeometry(), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * 13; a[i * 3 + 1] = Math.random() * 6.5 + .3; a[i * 3 + 2] = Math.random() * 14 + 1; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff6e8, size: .022, map: canvasTex(32, 32, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); }), transparent: true, opacity: .8, depthWrite: false })); scene.add(m); return m; })();

// ---------- light ----------
scene.add(new THREE.HemisphereLight(0xfff4e6, 0xa68866, small ? 1.0 : .42));
const sun = new THREE.DirectionalLight(0xffe7c8, small ? 1.4 : 3.6); sun.position.set(-7, 11, -12); sun.target.position.set(0, 0, 8); scene.add(sun, sun.target);
if (!small) { sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 4; }
const fill = new THREE.DirectionalLight(0xffe9d2, .45); fill.position.set(4, 6, 16); scene.add(fill);

// ---------- the gallery ----------
const glowTex = canvasTex(256, 256, (x, w, h) => { const g = x.createRadialGradient(w / 2, h * .2, 0, w / 2, h * .35, w * .55); g.addColorStop(0, 'rgba(255,236,205,.55)'); g.addColorStop(1, 'rgba(255,236,205,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
// the short passage from the studio's arch to the first hall
[-1, 1].forEach(sx => { const w = new THREE.Mesh(new THREE.PlaneGeometry(8, 6.6), wallMat()); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * 3.6, 3.3, -4.4); scene.add(w); });
{ const c = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 8), wallMat(0xf4eee6)); c.rotation.x = Math.PI / 2; c.position.set(0, 6.6, -4.4); scene.add(c); }
const G = { w: 7.2, h: 6.6, hallLen: 0, gap: 4.6, intro: 6 };
const stops = [], hallStop = [];
const frames = [];   // { w, mesh, pic, video, z, side, loaded }
let z = 0;
// stop 0: the studio, stop 1: closer (who I am), stop 2: through the arch
stops.push({ kind: 'hello', pos: [0, 2.2, 15.2], look: [0, 3.05, 5.6] });
stops.push({ kind: 'me', pos: [3.1, 2.1, 12.4], look: [-1.2, 3.1, 5.8] });
stops.push({ kind: 'arch', pos: [.8, 2.0, 4.2], look: [0, 3.0, -8] });
z = -6;
const hallTitles = [];
halls.forEach((hall, hi) => {
  const zStart = z - 2.2, n = hall.works.length, len = G.intro + Math.ceil(n / 2) * G.gap * 1.15 + 3;
  const tint = HALL_TINT[hall.id];
  // the hall: two long walls, a ceiling with a skylight strip, and a partition with an arch and the hall's name over it
  [-1, 1].forEach(sx => { const w = new THREE.Mesh(new THREE.PlaneGeometry(len + 2.2, G.h), wallMat(tint)); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * G.w / 2, G.h / 2, zStart - len / 2 + 1.1); w.receiveShadow = !small; scene.add(w); });
  const c = new THREE.Mesh(new THREE.PlaneGeometry(G.w, len + 2.2), wallMat(0xf4eee6)); c.rotation.x = Math.PI / 2; c.position.set(0, G.h, zStart - len / 2 + 1.1); scene.add(c);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.6, len), new THREE.MeshBasicMaterial({ color: 0xfffaf2, toneMapped: false })); sky.rotation.x = Math.PI / 2; sky.position.set(0, G.h - .01, zStart - len / 2 + 1.1); scene.add(sky);
  wallWithArches({ x0: -G.w / 2, x1: G.w / 2, h: G.h, z: zStart, mat: wallMat(tint), door: { cx: 0, w: 2.8, h: 4.5 }, depth: .3 });
  // the name over the arch
  const titleCv = document.createElement('canvas'); titleCv.width = 1600; titleCv.height = 400; const tx = titleCv.getContext('2d');
  const titleTex = new THREE.CanvasTexture(titleCv); titleTex.colorSpace = THREE.SRGBColorSpace; titleTex.anisotropy = 8;
  const draw = () => { tx.clearRect(0, 0, 1600, 400); tx.fillStyle = '#2a2622'; tx.textAlign = 'center'; tx.font = '500 46px Inter, sans-serif'; tx.fillText(`${String(hi + 1).padStart(2, '0')}  ·  ${L(T.hall).toUpperCase()}`, 800, 92); tx.font = `600 ${lang === 'zh' ? 150 : 140}px Inter, "PingFang SC", sans-serif`; tx.fillText(L(hall.cat.label), 800, 250, 1540); tx.font = '400 44px Inter, "PingFang SC", sans-serif'; tx.fillStyle = '#5b544d'; tx.fillText(`${L(hall.cat.description)}  ·  ${n} ${L(T.works)}`, 800, 340, 1500); titleTex.needsUpdate = true; };
  draw(); hallTitles.push(draw);
  const title = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, toneMapped: false })); title.position.set(0, 5.45, zStart + .02); scene.add(title);
  hallStop[hi] = stops.length;
  stops.push({ kind: 'hall', hall: hi, pos: [0, 2.0, zStart + 6.6], look: [0, 3.9, zStart] });
  // the works, alternating left and right
  hall.works.forEach((w, k) => {
    const side = k % 2 ? 1 : -1, zw = zStart - G.intro - Math.floor(k / 2) * G.gap * 1.15 - (side > 0 ? G.gap * .55 : 0);
    const f = makeFrame(w, side, zw, tint); frames.push(f);
    const xw = side * (G.w / 2 - .05);
    stops.push({ kind: 'work', hall: hi, frame: frames.length - 1, side, pos: [-side * 1.75, 2.0, zw + .9], look: [xw, 2.3, zw - .1] });
  });
  z = zStart - len;
});
// the end wall: let's talk
{ const zEnd = z - 1; const w = new THREE.Mesh(new THREE.PlaneGeometry(G.w, G.h), wallMat(0xf1e7da)); w.position.set(0, G.h / 2, zEnd); scene.add(w); stops.push({ kind: 'contact', pos: [0, 2.2, zEnd + 8], look: [0, 2.6, zEnd] }); }

function makeFrame(w, side, zw, tint) {
  const shape = w.shape || 'landscape', aspect = shape === 'portrait' ? .56 : shape === 'square' ? 1 : 1.62;
  const H = shape === 'portrait' ? 2.35 : 1.75, W = H * aspect;
  const grp = new THREE.Group(); grp.position.set(side * (G.w / 2 - .05), 2.35, zw); grp.rotation.y = -side * Math.PI / 2; scene.add(grp);
  const border = .09, mat = .16;
  const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(W + 2 * (border + mat), H + 2 * (border + mat), .08), new THREE.MeshStandardMaterial({ color: 0x2b2622, roughness: .45, metalness: .1 })); frameMesh.position.z = .04; frameMesh.castShadow = !small; grp.add(frameMesh);
  const matte = new THREE.Mesh(new THREE.PlaneGeometry(W + 2 * mat, H + 2 * mat), new THREE.MeshStandardMaterial({ color: 0xf6f2ea, roughness: 1 })); matte.position.z = .081; grp.add(matte);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: 0xd9cfc2, toneMapped: false })); pic.position.z = .083; grp.add(pic);
  // a pool of light on the wall above the frame, as from a picture lamp
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.2, H * 1.9), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55, toneMapped: false })); glow.position.set(0, .25, .01); grp.add(glow);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, W * .55, 10), new THREE.MeshStandardMaterial({ color: 0x2b2622, roughness: .4, metalness: .6 })); lamp.rotation.z = Math.PI / 2; lamp.position.set(0, H / 2 + mat + .38, .32); grp.add(lamp);
  // a small plinth label beside it
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(.36, .22, .02), new THREE.MeshStandardMaterial({ color: 0xf4efe7, roughness: .9 })); plaque.position.set(W / 2 + mat + .45, -H / 2 + .2, .02); grp.add(plaque);
  pic.userData.href = w.href; frameMesh.userData.href = w.href; matte.userData.href = w.href;
  return { w, grp, pic, z: zw, side, W, H, loaded: false, video: null, hit: [pic, frameMesh, matte] };
}

// pictures: only the frames near the camera are loaded (small ones on phones); the far ones stay blank card
const loader = new THREE.TextureLoader();
function loadFrame(f) {
  if (f.loaded) return; f.loaded = true;
  loader.load(f.w.cover, t => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = small ? 2 : 8;
    // cover the frame, keeping the picture's own proportions
    const ia = t.image.width / t.image.height, fa = f.W / f.H;
    if (ia > fa) { t.repeat.set(fa / ia, 1); t.offset.set((1 - fa / ia) / 2, 0); } else { t.repeat.set(1, ia / fa); t.offset.set(0, (1 - ia / fa) / 2); }
    f.pic.material.map = t; f.pic.material.color.set(0xffffff); f.pic.material.needsUpdate = true;
  });
}
function freeFrame(f) { if (!f.loaded || !small) return; const t = f.pic.material.map; if (t) { t.dispose(); f.pic.material.map = null; f.pic.material.color.set(0xd9cfc2); f.pic.material.needsUpdate = true; } f.loaded = false; }
// moving work plays in its frame while you stand in front of it (computers only)
let playing = null;
function playFrame(f) {
  if (small || calm || playing === f) return; stopVideo();
  const src = f.w.preview || f.w.video; if (!src) return;
  const v = document.createElement('video'); v.src = src; v.muted = true; v.loop = true; v.playsInline = true; v.crossOrigin = 'anonymous'; v.play().catch(() => {});
  v.addEventListener('playing', () => { if (playing !== f) return; const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace; const ia = (v.videoWidth || 16) / (v.videoHeight || 9), fa = f.W / f.H; if (ia > fa) { t.repeat.set(fa / ia, 1); t.offset.set((1 - fa / ia) / 2, 0); } else { t.repeat.set(1, ia / fa); t.offset.set(0, (1 - ia / fa) / 2); } f.still = f.pic.material.map; f.pic.material.map = t; f.pic.material.needsUpdate = true; }, { once: true });
  playing = f; f.video = v;
}
function stopVideo() { const f = playing; if (!f) return; playing = null; if (f.video) { f.video.pause(); f.video.removeAttribute('src'); f.video.load(); f.video = null; } if (f.still) { const vt = f.pic.material.map; f.pic.material.map = f.still; f.still = null; f.pic.material.needsUpdate = true; vt?.dispose(); } }

// ---------- scroll → walk ----------
const S = stops.length;
const STEP = .95;   // screens of scrolling per stop
const track = $('.hv-track'); track.style.setProperty('--track', `${(S - 1) * STEP * 100 + 100}vh`);
const scrollMax = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
const uNow = () => clamp(scrollY / scrollMax()) * (S - 1);
const stopY = i => i / (S - 1) * scrollMax();
let jumping = 0;
function goStop(i, smooth) { const y = stopY(i); if (!smooth || calm) { scrollTo(0, y); return; } const y0 = scrollY, t0 = performance.now(), ms = Math.min(2400, 700 + Math.abs(y - y0) * .12); cancelAnimationFrame(jumping); const go = now => { const t = clamp((now - t0) / ms), e = t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; scrollTo(0, y0 + (y - y0) * e); jumping = t < 1 ? requestAnimationFrame(go) : 0; }; jumping = requestAnimationFrame(go); }
$$('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); goStop(a.dataset.jump === 'contact' ? S - 1 : hallStop[0], true); }));
document.addEventListener('click', e => { const b = e.target.closest('.hv-halls button'); if (b) goStop(hallStop[+b.dataset.hall], true); });

// the camera eases from stop to stop and lingers at each one
const vA = new THREE.Vector3(), vB = new THREE.Vector3(), lA = new THREE.Vector3(), lB = new THREE.Vector3();
const camPos = new THREE.Vector3(...stops[0].pos), camLook = new THREE.Vector3(...stops[0].look);
const wantPos = new THREE.Vector3(), wantLook = new THREE.Vector3();
function poseAt(u) {
  const i = Math.min(S - 2, Math.floor(u)), t = u - i;
  const e = ss(clamp((t - .12) / .76));   // a pause at each stop, then a smooth walk to the next
  vA.set(...stops[i].pos); vB.set(...stops[i + 1].pos); lA.set(...stops[i].look); lB.set(...stops[i + 1].look);
  wantPos.lerpVectors(vA, vB, e);
  // walking past a work: rise a touch mid-step, like a stride, and keep looking where we are going between frames
  wantPos.y += Math.sin(e * Math.PI) * .08;
  wantLook.lerpVectors(lA, lB, e);
}

// ---------- the label ----------
const label = $('.hv-label'); let lastLabel = -1;
function showLabel(fi) {
  if (fi === lastLabel) return; lastLabel = fi;
  if (fi < 0) { label.classList.remove('is-on'); return; }
  const f = frames[fi], w = f.w, hall = halls.findIndex(h => h.works.includes(w)), idx = halls[hall].works.indexOf(w);
  label.querySelector('.hv-label-k').innerHTML = `<span>${String(hall + 1).padStart(2, '0')} · ${L(halls[hall].cat.label)}</span><span>${idx + 1} ${L(T.of)} ${halls[hall].works.length}</span>`;
  label.querySelector('.hv-label-t').textContent = L(w.title);
  label.querySelector('.hv-label-s').textContent = L(w.subtitle);
  label.querySelector('.hv-label-m').innerHTML = [L(w.kind), ...(w.tags || []).slice(0, 2).map(L)].filter(Boolean).map(t => `<span>${t}</span>`).join('');
  const a = label.querySelector('.hv-label-a'); a.href = w.href; a.textContent = (w.video && !w.href.startsWith('project-')) ? L(T.watch) : L(T.view);
  label.classList.toggle('is-right', f.side < 0); label.classList.add('is-on');
}

// ---------- pointer ----------
let mx = 0, my = 0, pmx = 0, pmy = 0;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let hoverHref = null;
addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; ndc.set(mx, -my); }, { passive: true });
cv.style.pointerEvents = 'auto';
addEventListener('click', e => { if (e.target !== cv && e.target !== document.body && !e.target.closest('main')) return; if (e.target.closest('a,button,dialog,.hv-card,.hv-label')) return; if (hoverHref) location.href = hoverHref; });

// ---------- loop ----------
let vw = 0, vh = 0;
function resize() { vw = innerWidth; vh = innerHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.3 : 1.75)); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.fov = vw / vh < .8 ? 60 : 42; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
let last = performance.now(), visible = true;
document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) { last = performance.now(); requestAnimationFrame(frame); } });
function frame(now) {
  if (!visible) return; requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now; const k = r => 1 - Math.exp(-dt * r);
  const u = uNow(); poseAt(u);
  // phones: a slow drift instead of the pointer
  if (small) { mx = Math.sin(now / 2600) * .35; my = Math.cos(now / 3400) * .2; }
  pmx += (mx - pmx) * k(3); pmy += (my - pmy) * k(3);
  camPos.lerp(wantPos, k(calm ? 30 : 6)); camLook.lerp(wantLook, k(calm ? 30 : 6));
  cam.position.copy(camPos); cam.position.x += pmx * .18; cam.position.y -= pmy * .1;
  cam.lookAt(camLook.x + pmx * .25, camLook.y - pmy * .15, camLook.z);
  // the piece: turns slowly, parts as you come close or point at it
  const near = clamp(1 - Math.abs(u - 1) * 1.2); spreadT = Math.max(near * .8, hoverPiece);
  spread += (spreadT - spread) * k(3);
  piece.rotation.y = calm ? 0 : Math.sin(now / 7000) * .55;
  if (!calm) { motes.rotation.y = Math.sin(now / 20000) * .05; motes.position.y = Math.sin(now / 5000) * .12; }
  parts.forEach((p, i) => { const [sx, sy, sz] = p.userData.spread; p.position.set(sx * spread, p.userData.y + sy * spread + (calm ? 0 : Math.sin(now / 1400 + i) * .025), sz * spread); p.rotation.y = (calm ? 0 : Math.sin(now / 3000 + i * 2) * .15) + spread * (i % 2 ? .4 : -.4); });
  // which beat is on screen
  const at = Math.round(u), st = stops[at], dist = Math.abs(u - at);
  $('.hv-hello').classList.toggle('is-on', u < .45);
  $('.hv-me').classList.toggle('is-on', at === 1 && dist < .38);
  $('.hv-exit').classList.toggle('is-on', st.kind === 'contact' && dist < .4);
  $('.hv-halls').classList.toggle('is-on', u > hallStop[0] - .6 && u < S - 1.5);
  const hi = st.hall ?? -1; $$('.hv-halls button').forEach((b, i) => b.classList.toggle('is-on', i === hi));
  const fi = st.kind === 'work' && dist < .3 ? st.frame : -1; showLabel(fi);
  if (fi >= 0) playFrame(frames[fi]); else if (playing && dist > .45) stopVideo();
  // load what is near, let go of what is far (phones)
  const curF = st.kind === 'work' ? st.frame : st.kind === 'hall' ? frames.findIndex(f => halls[st.hall].works[0] === f.w) : st.kind === 'contact' ? frames.length - 1 : -10;
  frames.forEach((f, i) => { const d = Math.abs(i - curF); if (d <= (small ? 2 : 4)) loadFrame(f); else if (d > 5) freeFrame(f); });
  // pointer over a frame or the piece
  if (!small) {
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects([...frames.flatMap(f => f.hit), ...parts, rock], true)[0];
    hoverHref = hit?.object.userData.href || null;
    hoverPiece = hit && (parts.some(p => p === hit.object || p.children.includes(hit.object)) || hit.object === rock) ? 1 : 0;
    cv.style.cursor = hoverHref ? 'pointer' : '';
  }
  renderer.render(scene, cam);
}

words();
document.fonts?.ready.then(() => hallTitles.forEach(fn => fn()));
// first frame, then show the page
requestAnimationFrame(t => { last = t; frame(t); document.body.classList.add('is-ready'); });

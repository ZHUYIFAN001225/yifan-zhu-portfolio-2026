// LOOK case: a 3D beauty tool travels down the page with you, like Léo Parpeix's bee.
// Its position is a function of scroll: it swings from one side to the other between sections, leaning and growing mid-swing,
// with a soft shadow on the page under it. Each section hands over to the next tool (nail polish → hair dryer → scissors → comb),
// and each tool has its own power over the page when clicked:
//   polish   – a drop falls and floods the page with a new colour; the headline takes a matching ink
//   dryer    – a blast of air: the cards near it sway and the headline letters flutter
//   scissors – snip: one letter of the headline is cut off, falls, and grows back
//   comb     – combs through the headline: the letters wave one after another
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';

const zh = () => document.documentElement.lang.startsWith('zh');
const TOOLS = ['polish', 'dryer', 'scissors', 'comb'];
const HINT = {
  polish: ['Tap me — I repaint the page.', '点我，给整页换个颜色。'],
  dryer: ['Tap me for a blast of air.', '点我，吹一阵风。'],
  scissors: ['Tap me — I snip letters.', '点我，剪掉一个字母。'],
  comb: ['Tap me to comb the words.', '点我，梳一梳文字。']
};
const POKE = {
  polish: [['New coat!', '换一层新颜色！'], ['Two coats look better.', '涂两层更好看。'], ['Glossy.', '亮晶晶。']],
  dryer: [['Whoosh!', '呼——'], ['Warm air, coming through.', '热风来了。'], ['Volume!', '蓬松！']],
  scissors: [['Snip!', '咔嚓！'], ['Just a trim.', '就修一点点。'], ['It grows back, promise.', '会长回来的，放心。']],
  comb: [['All tidy.', '梳顺了。'], ['No tangles.', '一点都不打结。'], ['Smooth.', '顺滑。']]
};
// background colour + headline ink for each tool's sections; nail polish cycles through its shades
const PAINT = [['#f6c6d8', '#7a1f4a'], ['#e7cdf3', '#4b1f6e'], ['#ffd6c4', '#7a3418'], ['#cbe9df', '#1d5a4a'], ['#f8e6a6', '#6b4d00']];
const BASE = { polish: PAINT[0], dryer: ['#f2e6d5', '#5a3a1c'], scissors: ['#e4d6ec', '#2a1d30'], comb: ['#d9e3f5', '#1f2f5a'] };

// ---------- models ----------
const glossy = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .08, ...o });
const metal = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: .18, ...o });

function polish() {
  const g = new THREE.Group();
  const prof = [[0, -.72], [.5, -.72], [.6, -.66], [.63, -.55], [.63, .12], [.56, .3], [.36, .4], [.2, .44], [.2, .52], [0, .52]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: .5, roughness: .04, ior: 1.45, clearcoat: 1, transparent: true }));
  const liqProf = [[0, -.64], [.5, -.64], [.56, -.58], [.57, -.5], [.57, .06], [0, .06]].map(([x, y]) => new THREE.Vector2(x, y));
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(liqProf, 48), glossy(0xf0629a, { roughness: .15 }));
  const liqWrap = new THREE.Group(); liqWrap.add(liquid);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.21, .23, .78, 40), glossy(0x1d1519, { roughness: .12 })); cap.position.y = .93;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(.245, .245, .07, 40), metal(0xd9b27a)); ring.position.y = .55;
  g.add(liqWrap, glass, cap, ring);
  g.userData = { liqWrap, liquid };
  return g;
}

function dryer() {
  const g = new THREE.Group(), pink = glossy(0xf28cb4), dark = glossy(0x2a1d30, { roughness: .3 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, 1.25, 48), pink); barrel.rotation.z = Math.PI / 2; barrel.position.x = -.05;
  const back = new THREE.Mesh(new THREE.SphereGeometry(.4, 40, 24), pink); back.scale.set(.45, 1, 1); back.position.x = -.68;
  const grille = new THREE.Mesh(new THREE.CircleGeometry(.26, 40), dark); grille.position.x = -.865; grille.rotation.y = -Math.PI / 2;
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(.24, .33, .42, 40), dark); nozzle.rotation.z = -Math.PI / 2; nozzle.position.x = .76;
  const band = new THREE.Mesh(new THREE.TorusGeometry(.405, .025, 12, 48), metal(0xd9b27a)); band.rotation.y = Math.PI / 2; band.position.x = .5;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.16, .19, 1, 32), pink); handle.position.set(-.18, -.7, 0); handle.rotation.z = .28;
  const foot = new THREE.Mesh(new THREE.SphereGeometry(.19, 24, 16), pink); foot.position.set(-.32, -1.18, 0);
  const btn = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), glossy(0xffffff)); btn.position.set(-.06, -.5, .16);
  // air: three soft streaks in front of the nozzle
  const airMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  const air = []; for (let k = 0; k < 3; k++) { const a = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .7, 8), airMat.clone()); a.rotation.z = Math.PI / 2; a.position.set(1.35, (k - 1) * .14, (k - 1) * .05); air.push(a); g.add(a); }
  g.add(barrel, back, grille, nozzle, band, handle, foot, btn);
  g.position.y = .25; g.scale.setScalar(.95);
  g.userData = { air };
  return g;
}

function scissors() {
  const g = new THREE.Group(), steel = metal(0xdfe0e6, { roughness: .14 }), pink = glossy(0xf28cb4);
  const blade = () => {
    const s = new THREE.Shape(); s.moveTo(-.05, .08); s.quadraticCurveTo(.6, .13, 1.25, .015); s.lineTo(1.25, -.01); s.quadraticCurveTo(.6, -.03, -.05, -.07); s.lineTo(-.05, .08);
    const geo = new THREE.ExtrudeGeometry(s, { depth: .04, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 3, curveSegments: 24 }); geo.translate(0, 0, -.02);
    return new THREE.Mesh(geo, steel);
  };
  const half = up => {
    const h = new THREE.Group(); const b = blade(); if (!up) b.scale.y = -1; h.add(b);
    const shank = new THREE.Mesh(new THREE.BoxGeometry(.5, .07, .05), steel); shank.position.set(-.27, up ? -.08 : .08, 0); shank.rotation.z = up ? .32 : -.32; h.add(shank);
    const ringM = new THREE.Mesh(new THREE.TorusGeometry(.2, .065, 20, 44), pink); ringM.position.set(-.66, up ? -.24 : .24, 0); h.add(ringM);
    h.position.z = up ? .03 : -.03; return h;
  };
  const a = half(true), b = half(false);
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .14, 24), metal(0xd9b27a)); screw.rotation.x = Math.PI / 2;
  g.add(a, b, screw); g.position.x = -.25; g.rotation.z = .5;
  g.userData = { a, b };
  return g;
}

function comb() {
  const g = new THREE.Group(), mat = new THREE.MeshPhysicalMaterial({ color: 0xc9a2ef, roughness: .12, clearcoat: 1, transmission: .45, thickness: .4, ior: 1.4 });
  const s = new THREE.Shape(), w = 1.9, h = .34, r = .14; s.moveTo(-w / 2 + r, 0); s.lineTo(w / 2 - r, 0); s.quadraticCurveTo(w / 2, 0, w / 2, r); s.lineTo(w / 2, h - r); s.quadraticCurveTo(w / 2, h, w / 2 - r, h); s.lineTo(-w / 2 + r, h); s.quadraticCurveTo(-w / 2, h, -w / 2, h - r); s.lineTo(-w / 2, r); s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  const spine = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .09, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 3 }), mat); spine.position.z = -.045;
  g.add(spine);
  const teeth = [];
  for (let k = 0; k < 19; k++) { const fine = k > 8, len = fine ? .52 : .6; const t = new THREE.Mesh(new THREE.BoxGeometry(fine ? .04 : .06, len, .08), mat); t.position.set(-.86 + k * .096, -len / 2 + .01, 0); g.add(t); teeth.push(t); }
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), metal(0xd9b27a)); dot.position.set(.78, .17, .06); g.add(dot);
  g.position.y = .1; g.rotation.z = -.12;
  g.userData = { teeth };
  return g;
}

// ---------- DOM effects ----------
function split(el) {
  if (!el || el._lkBusy) return null; el._lkBusy = true; const html = el.innerHTML;
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) { const f = document.createDocumentFragment(); for (const ch of c.textContent) { const s = document.createElement('span'); s.className = 'lk-ch'; s.textContent = ch; f.append(s); } c.replaceWith(f); }
    else if (c.nodeType === 1 && getComputedStyle(c).display !== 'none') walk(c);
  });
  walk(el);
  return { chars: [...el.querySelectorAll('.lk-ch')].filter(s => s.textContent.trim()), restore: () => { el.innerHTML = html; el._lkBusy = false; } };
}
const visible = el => { const r = el.getBoundingClientRect(); return r.bottom > 60 && r.top < innerHeight - 40 && r.width > 0; };

export function mount({ lines = {} } = {}) {
  const secs = [...document.querySelectorAll('.ux-case .v3-product-section.ux-section')].filter(s => lines[s.id]);
  if (!secs.length) return;
  const toolOf = k => TOOLS[k % TOOLS.length];
  // each section takes the colours of its tool
  secs.forEach((s, k) => { const [bg, ink] = BASE[toolOf(k)]; s.dataset.lkBg = bg; s.dataset.lkInk = ink; });
  const applyInk = () => secs.forEach(s => { const h = s.querySelector(':scope>h2'); if (h) h.style.color = s.dataset.lkInk; });
  applyInk();

  // renderer in a small canvas that travels; the shadow is a separate element on the page
  const S = 280, dpr = Math.min(2, devicePixelRatio || 1);
  const canvas = document.createElement('canvas'); canvas.className = 'lk-tool'; canvas.width = S * dpr; canvas.height = S * dpr; canvas.setAttribute('aria-hidden', 'true');
  const shadow = document.createElement('div'); shadow.className = 'lk-shadow'; shadow.setAttribute('aria-hidden', 'true');
  const hit = document.createElement('button'); hit.type = 'button'; hit.className = 'lk-hit';
  const say = document.createElement('div'); say.className = 'lk-say'; say.setAttribute('aria-live', 'polite');
  document.body.append(shadow, canvas, hit, say);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { canvas.remove(); shadow.remove(); hit.remove(); say.remove(); return; }
  renderer.setPixelRatio(1); renderer.setSize(S * dpr, S * dpr, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2, 3, 4); scene.add(key);
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 50); cam.position.set(0, 0, 7.4);
  const rig = new THREE.Group(); scene.add(rig);
  const models = { polish: polish(), dryer: dryer(), scissors: scissors(), comb: comb() };
  const holders = {}; for (const t of TOOLS) { const h = new THREE.Group(); h.add(models[t]); h.visible = false; h.scale.setScalar(0); rig.add(h); holders[t] = h; }

  // state
  let pts = [], cx = innerWidth * .1, cy = innerHeight * .4, sc = 1, lean = 0, spin = 0, lastY = scrollY, vel = 0;
  let cur = null, swapT = 0, prev = null, landed = -1, talkT = 0, pokeK = 0, mx = 0, my = 0, flash = 0, act = 0, actT = 0;
  const measure = () => { pts = secs.map((s, k) => { const r = s.getBoundingClientRect(); return { x: k % 2 ? innerWidth - 150 : 150, y: r.top + scrollY + 40 }; }); };
  const talk = (t, ms = 2600) => { say.textContent = t; say.classList.add('is-on'); clearTimeout(talkT); talkT = setTimeout(() => say.classList.remove('is-on'), ms); };
  const where = () => {
    const mid = scrollY + innerHeight * .42; if (!pts.length) return { k: 0, t: 0 };
    if (mid <= pts[0].y) return { k: 0, t: 0 };
    for (let k = 0; k < pts.length - 1; k++) if (mid < pts[k + 1].y) return { k, t: (mid - pts[k].y) / (pts[k + 1].y - pts[k].y) };
    return { k: pts.length - 1, t: 0 };
  };
  const current = () => { const mid = innerHeight * .55; return secs.findIndex(s => { const r = s.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }); };
  const setTool = t => { if (t === cur) return; prev = cur; cur = t; swapT = performance.now(); holders[t].visible = true; hit.dataset.cursor = t; hit.setAttribute('aria-label', { polish: zh() ? '指甲油' : 'Nail polish', dryer: zh() ? '吹风机' : 'Hair dryer', scissors: zh() ? '剪刀' : 'Scissors', comb: zh() ? '梳子' : 'Comb' }[t]); poof(); };
  const poof = () => { const p = document.createElement('i'); p.className = 'lk-poof'; p.style.left = cx + 'px'; p.style.top = cy + 'px'; document.body.append(p); setTimeout(() => p.remove(), 800); };
  const ss = t => t * t * (3 - 2 * t), back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  // ---- clicks: each tool's power ----
  const targetSec = () => { const k = current(); return k >= 0 ? secs[k] : null; };
  const headline = sec => { if (!sec) return null; const hs = [...sec.querySelectorAll('h2,h3')].filter(visible); if (!hs.length) return null; return hs.sort((a, b) => Math.abs(a.getBoundingClientRect().top - cy) - Math.abs(b.getBoundingClientRect().top - cy))[0]; };
  const powers = {
    polish() {
      const sec = targetSec(); const k = (+(sec?.dataset.lkPaint || 0) + 1) % PAINT.length; const [bg, ink] = PAINT[k];
      const drop = document.createElement('i'); drop.className = 'lk-drop'; drop.style.background = bg; drop.style.left = cx + 'px'; drop.style.top = (cy + 60) + 'px'; document.body.append(drop);
      const fall = Math.min(240, innerHeight - cy - 80);
      drop.animate([{ transform: 'translate(-50%,0) scale(.4,.6)', opacity: 1 }, { transform: `translate(-50%,${fall}px) scale(1,1.2)`, opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.5,0,1,1)', fill: 'forwards' }).onfinish = () => {
        drop.remove();
        const R = Math.hypot(innerWidth, innerHeight) * 1.1, x = cx, y = cy + 60 + fall;
        const sp = document.createElement('i'); sp.className = 'lk-splash'; sp.style.background = bg; sp.style.left = x + 'px'; sp.style.top = y + 'px'; sp.style.width = sp.style.height = R * 2 + 'px'; document.body.append(sp);
        sp.animate([{ transform: 'translate(-50%,-50%) scale(0)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 750, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' }).onfinish = () => {
          if (sec) { sec.dataset.lkPaint = k; sec.dataset.lkBg = bg; sec.dataset.lkInk = ink; applyInk(); }
          const bgEl = document.querySelector('.lk-bg'); if (bgEl) { bgEl.style.transition = 'none'; bgEl.style.backgroundColor = bg; void bgEl.offsetWidth; bgEl.style.transition = ''; }
          sp.remove();
        };
      };
    },
    dryer() {
      const sec = targetSec(); if (!sec) return; flash = 1;
      const dir = cx < innerWidth / 2 ? 1 : -1;
      sec.querySelectorAll('.v3-par, .lk-mask').forEach((c, i) => { if (!visible(c)) return; c.style.setProperty('--gd', dir); c.style.animationDelay = (i * 40) + 'ms'; c.classList.remove('lk-gust'); void c.offsetWidth; c.classList.add('lk-gust'); setTimeout(() => c.classList.remove('lk-gust'), 1300); });
      const sp = split(headline(sec)); if (!sp) return;
      sp.chars.forEach((c, i) => { c.style.setProperty('--d', (dir > 0 ? i : sp.chars.length - i) * 18 + 'ms'); c.style.setProperty('--w', dir * (.6 + Math.random() * .8)); c.classList.add('lk-flutter'); });
      setTimeout(sp.restore, 1300 + sp.chars.length * 18);
    },
    scissors() {
      act = 1; actT = performance.now();
      const sp = split(headline(targetSec())); if (!sp || !sp.chars.length) return;
      const pick = sp.chars.filter(c => /\S/.test(c.textContent)); const c = pick[Math.floor(Math.random() * pick.length)];
      c.style.setProperty('--cx', (Math.random() > .5 ? 1 : -1)); c.classList.add('lk-cut'); setTimeout(sp.restore, 1700);
    },
    comb() {
      act = 1; actT = performance.now();
      const sec = targetSec(); const els = sec ? [...sec.querySelectorAll('h2,h3')].filter(visible).slice(0, 3) : [];
      els.forEach((el, n) => { const sp = split(el); if (!sp) return; const dir = cx < innerWidth / 2; sp.chars.forEach((c, i) => { c.style.setProperty('--d', (n * 120 + (dir ? i : sp.chars.length - i) * 22) + 'ms'); c.classList.add('lk-wave'); }); setTimeout(sp.restore, 900 + n * 120 + sp.chars.length * 22); });
    }
  };
  hit.addEventListener('click', () => { if (!cur) return; powers[cur](); const l = POKE[cur][pokeK++ % POKE[cur].length]; talk(zh() ? l[1] : l[0], 1800); flash = Math.max(flash, .6); });
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  // ---- frame ----
  let on = false, raf = 0;
  const frame = now => {
    raf = requestAnimationFrame(frame);
    const g = where(), t = Math.min(1, Math.max(0, g.t)), k = ss(t), swing = Math.sin(k * Math.PI);
    const a = pts[g.k], b = pts[Math.min(g.k + 1, pts.length - 1)];
    if (!a) return;
    const tx = a.x + (b.x - a.x) * k, ty = innerHeight * (.4 + .12 * Math.sin(t * Math.PI * 2)) - swing * 70;
    vel = scrollY - lastY; lastY = scrollY; spin += vel * .006;
    cx += (tx - cx) * .14; cy += (ty - cy) * .14;
    const dir = Math.sign(b.x - a.x) || 1;
    lean += ((dir * swing * .55) - lean) * .12;
    sc += ((.88 + swing * .55) - sc) * .12;
    // which tool: the one of the section you are reading
    const ci = current(), xr = document.querySelector('[data-explode]')?.getBoundingClientRect();
    const overXp = xr && xr.top < innerHeight * .7 && xr.bottom > innerHeight * .3;
    const vis = !overXp && pts.length && scrollY + innerHeight * .6 > pts[0].y && scrollY < pts[pts.length - 1].y + 500;
    if (vis !== on) { on = vis; document.body.classList.toggle('lk-tool-on', vis); }
    if (ci >= 0) {
      setTool(toolOf(ci));
      if (ci !== landed && swing < .25) { landed = ci; const first = !secs.slice(0, ci).some((_, j) => toolOf(j) === toolOf(ci)); const l = first ? HINT[toolOf(ci)] : lines[secs[ci].id]; talk(zh() ? l[1] : l[0]); }
    }
    // swap: the old tool spins away, the new one pops in
    const st = Math.min(1, (now - swapT) / 650);
    for (const tname of TOOLS) {
      const h = holders[tname];
      if (tname === cur) { const p = Math.max(0, (st - .3) / .7); h.scale.setScalar(p >= 1 ? 1 : Math.max(0, back(p))); h.rotation.y = (1 - p) * -3.2; h.visible = true; }
      else if (tname === prev && st < .45) { const p = st / .45; h.scale.setScalar(1 - ss(p)); h.rotation.y = p * 3.2; h.visible = true; }
      else { h.visible = false; h.scale.setScalar(0); }
    }
    // pose: lean into the swing, turn with scroll, look a little toward the pointer
    const px = (mx - cx) / innerWidth, py = (my - cy) / innerHeight;
    rig.rotation.z = -lean * .8 + Math.sin(now / 1100) * .05;
    rig.rotation.y = Math.sin(spin) * .7 + px * .6;
    rig.rotation.x = .18 + py * .4 + Math.sin(now / 1500) * .04;
    rig.position.y = Math.sin(now / 900) * .08;
    // tool-specific life
    const moving = Math.min(1, Math.abs(vel) / 18 + swing * .8);
    const m = models;
    m.polish.userData.liqWrap.rotation.z += ((-vel * .02 - lean * .4) - m.polish.userData.liqWrap.rotation.z) * .08;
    m.dryer.userData.air.forEach((s, i) => { const ph = (now / 260 + i * .33) % 1; s.position.x = 1.15 + ph * .8; s.material.opacity = (moving * .5 + flash) * Math.sin(ph * Math.PI) * .6; s.scale.y = .6 + ph; });
    const snapping = act && now - actT < 700 && cur === 'scissors';
    const open = snapping ? Math.abs(Math.sin((now - actT) / 700 * Math.PI * 3)) * .45 : .08 + moving * Math.abs(Math.sin(now / 160)) * .3;
    m.scissors.userData.a.rotation.z = open; m.scissors.userData.b.rotation.z = -open;
    const combing = act && now - actT < 900 && cur === 'comb';
    m.comb.rotation.z = -.12 + (combing ? Math.sin((now - actT) / 900 * Math.PI * 2) * .35 : 0);
    flash *= .94;
    if (on) renderer.render(scene, cam);
    // place canvas, hit area, shadow and bubble
    const s = sc;
    canvas.style.transform = `translate3d(${(cx - S / 2).toFixed(1)}px,${(cy - S / 2).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
    hit.style.transform = `translate3d(${(cx - 60).toFixed(1)}px,${(cy - 60).toFixed(1)}px,0)`;
    const lift = rig.position.y * 40 + swing * 40;
    shadow.style.transform = `translate3d(${(cx - 70).toFixed(1)}px,${(cy + 88 * s + 18).toFixed(1)}px,0) scale(${(s * (1 - lift / 260)).toFixed(3)},${(s * .9).toFixed(3)})`;
    shadow.style.setProperty('--so', (1 - swing * .45).toFixed(2));
    const right = cx > innerWidth / 2; say.classList.toggle('is-right', right);
    say.style.transform = `translate3d(${(right ? cx - 90 * s : cx + 90 * s).toFixed(1)}px,${(cy - 110 * s).toFixed(1)}px,0)`;
  };
  measure(); addEventListener('resize', measure); addEventListener('load', measure); setInterval(measure, 800);
  document.addEventListener('portfolio:language', () => { setTimeout(() => { measure(); applyInk(); }, 120); });
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
}

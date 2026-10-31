// Glasgow Salon Booking — "one booking, in 3D".
// In the spirit of Silencio's store: the page holds still and the wheel moves a camera through a small studio scene.
// Two phones float in soft light — the customer's and the owner's. Each part of the story is a camera shot:
// the camera dollies in, the part of the screen being talked about lifts out towards you, and the booking card
// physically travels from the customer's phone into the owner's diary. Every move is damped, so nothing snaps.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, roundedRect, planeUV } from './phone3d.mjs';

const zh = () => document.documentElement.lang.startsWith('zh');
const B = 'assets/v3/screens/booking/';
const src = f => B + (zh() ? 'zh/' : '') + f + '.webp';
const ss = t => t * t * (3 - 2 * t);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// the story, shot by shot: which screen each phone shows, which part lifts, and where the camera stands
const SHOTS = [
  { c: 'book', o: 'schedule', cam: [0, .05, 5.2], look: [0, 0, 0], kicker: ['12:10 · Lunch break', '12:10 · 午休'], title: ['One booking, from both sides.', '一笔预约，两端同时发生。'], body: ['Scroll: the camera follows a single booking from the customer’s phone into the owner’s diary.', '往下滚：镜头跟着一笔预约，从顾客的手机走进店主的日程。'] },
  { c: 'book', o: 'schedule', lift: ['c', 2, 19, 96, 13], cam: [-1.05, .45, 2.5], look: [-.85, .3, 0], kicker: ['Customer · 12:10', '顾客 · 12:10'], title: ['The service comes first.', '先选服务。'], body: ['Its length is known before any time is shown, so only times that fit can appear.', '服务时长先确定，后面才可能只出现放得下的时间。'] },
  { c: 'day', o: 'schedule', lift: ['c', 2, 31, 96, 28], cam: [-.55, .1, 2.4], look: [-.85, .02, 0], kicker: ['Customer · 12:11', '顾客 · 12:11'], title: ['Only times that fit.', '只给放得下的时间。'], body: ['No “are you free at 2?” messages. Every time on offer is one the diary can actually hold.', '不用再发“两点有空吗？”。给出的每个时间，日程都真的放得下。'] },
  { c: 'confirm', o: 'schedule', lift: ['c', 2, 27, 96, 24], travel: true, cam: [-.2, -.05, 2.9], look: [-.6, -.05, 0], kicker: ['Customer · 12:12', '顾客 · 12:12'], title: ['One check, then book.', '核对一次，就约好了。'], body: ['Date, time and length in one card. Watch it leave her phone.', '日期、时间、时长都在一张卡里。看它离开她的手机。'] },
  { c: 'booked', o: 'schedule', lift: ['o', 4, 52, 94, 34], cam: [1.1, .1, 2.5], look: [.85, -.15, 0], kicker: ['Owner · 12:12', '店主 · 12:12'], title: ['It lands in her diary by itself.', '它自己落进了店主的日程。'], body: ['The owner does nothing. The booking is already in her week, at the right length.', '店主什么都不用做。预约已经按正确的时长，出现在她这一周里。'] },
  { c: 'kept', o: 'time-off-hours', lift: ['o', 2, 35, 96, 27], cam: [.35, .35, 3.4], look: [.3, .05, 0], kicker: ['Owner · 17:40', '店主 · 17:40'], title: ['She closes two hours. Nobody is deleted.', '她临时关掉两小时，没有人被删掉。'], body: ['The affected customer keeps her service and picks a new time.', '受影响的顾客保留原来的服务，重新选个时间就好。'] },
  { c: 'kept', o: 'today', cam: [0, .1, 5.4], look: [0, 0, 0], kicker: ['18:30 · Closed', '18:30 · 打烊'], title: ['The routine runs itself.', '日常，自己运转。'], body: ['Keep scrolling for the screens, the rules and how it was built.', '继续往下，是界面、规则和它是怎么做出来的。'] }
];

export function mountScene(host) {
  if (host.dataset.ready) return; host.dataset.ready = '1';
  const pin = host.querySelector('.bk-scene-pin'), cv = host.querySelector('canvas');
  const kick = host.querySelector('.bk-scene-k'), tit = host.querySelector('.bk-scene-t'), bod = host.querySelector('.bk-scene-b'), num = host.querySelector('.bk-scene-n'), bar = host.querySelector('.bk-scene-bar i');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { host.classList.add('is-static'); return; }
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(2, 4, 5); scene.add(key);
  const cam = new THREE.PerspectiveCamera(30, 1, .05, 60);

  // phones with live screen textures
  const mkScreen = () => { const c = document.createElement('canvas'); c.width = 780; c.height = Math.round(780 * ((1.62 - .062) / (.76 - .062))); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, ctx: c.getContext('2d'), t, file: '' }; };
  const scr = { c: mkScreen(), o: mkScreen() };
  const phones = { c: buildPhone(scr.c.t), o: buildPhone(scr.o.t) };
  phones.c.position.set(-.85, 0, 0); phones.o.position.set(.85, -.08, -.25);
  scene.add(phones.c, phones.o);
  const imgs = {};
  const getImg = async f => { const k = (zh() ? 'zh/' : '') + f; if (!imgs[k]) imgs[k] = load(src(f)); return imgs[k]; };
  const setScreen = async (side, f) => { const s = scr[side]; if (s.file === f) return; s.file = f; const im = await getImg(f); if (s.file !== f) return; paint(s.ctx, im, true); s.t.needsUpdate = true; };
  document.addEventListener('portfolio:language', () => { scr.c.file = scr.o.file = ''; lastShot = -1; liftKey = ''; });

  // a lifted part: the same slice of the screen, on its own card that rises towards the camera
  const SW = .698, SH = 1.558, TF = 92 / 1741;
  const liftMat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xf59ab8, transparent: true, opacity: 0 });
  const lift = new THREE.Group(); const liftGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat); const liftCard = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), liftMat);
  liftGlow.position.z = -.002; lift.add(liftGlow, liftCard); scene.add(lift);
  // under the lifted part: the rest of the screen dims, and the hole it left is dark (like LOOK's anatomy)
  const SW0 = .698, SH0 = 1.558;
  const dims = {}; for (const k of ['c', 'o']) { const m = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(SW0, SH0, .095), 16), new THREE.MeshBasicMaterial({ color: 0x15161a, transparent: true, opacity: 0, depthWrite: false })); m.position.z = .0545; phones[k].add(m); dims[k] = m; }
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x0c0d10, transparent: true, opacity: 0, depthWrite: false }); const hole = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), holeMat);
  let liftKey = '', liftSide = 'c', liftRect = [0, 0, 1, 1], liftTex = null;
  const setLift = async (L) => {
    const k = L ? L.join(',') + (zh() ? 'zh' : '') : ''; if (k === liftKey) return; liftKey = k; if (!L) return;
    const [side, x, y, w, h] = L; liftSide = side; liftRect = [x, y, w, h];
    const f = SHOTS.find(s => s.lift === L)?.[side] || scr[side].file; const im = await getImg(f); if (liftKey !== k || !im) return;
    const c = document.createElement('canvas'); const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    const sx = x / 100 * iw, sy = y / 100 * ih, sw = w / 100 * iw, sh = h / 100 * ih; c.width = Math.round(sw); c.height = Math.round(sh);
    const cx = c.getContext('2d'); cx.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
    liftTex?.dispose(); liftTex = new THREE.CanvasTexture(c); liftTex.colorSpace = THREE.SRGBColorSpace; liftTex.anisotropy = 8; liftMat.map = liftTex; liftMat.needsUpdate = true;
    const pw = w / 100 * SW, ph = h / 100 * (1 - TF) * SH; liftCard.scale.set(pw, ph, 1); liftGlow.scale.set(pw + .025, ph + .025, 1); hole.scale.set(pw, ph, 1); if (hole.parent !== phones[side]) phones[side].add(hole);
    const [x2, y2, w2, h2] = liftRect; hole.position.set(-SW / 2 + (x2 + w2 / 2) / 100 * SW, SH / 2 - (TF + (1 - TF) * (y2 + h2 / 2) / 100) * SH, .0555);
  };
  const slotPos = (side, out) => {
    const [x, y, w, h] = liftRect, p = phones[side];
    const lx = -SW / 2 + (x + w / 2) / 100 * SW, ly = SH / 2 - (TF + (1 - TF) * (y + h / 2) / 100) * SH;
    const v = new THREE.Vector3(lx, ly, .06 + out * .24); return p.localToWorld(v);
  };

  // camera and progress, damped
  let target = 0, prog = 0, lastShot = -1, mx = 0, my = 0, liftAmt = 0, raf = 0, on = false;
  const N = SHOTS.length;
  const measure = () => { const r = host.getBoundingClientRect(); target = clamp(-r.top / Math.max(1, r.height - innerHeight)) * (N - 1); };
  addEventListener('scroll', measure, { passive: true }); addEventListener('resize', () => { resize(); measure(); });
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const resize = () => { const w = pin.clientWidth, h = pin.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  resize(); measure(); prog = target;
  new IntersectionObserver(es => { on = es[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(tick); }).observe(host);
  const v3 = a => new THREE.Vector3(...a), tmp = new THREE.Vector3(), lookV = new THREE.Vector3();
  const caption = i => {
    const s = SHOTS[i], l = zh() ? 1 : 0; host.classList.remove('is-cap'); void host.offsetWidth; host.classList.add('is-cap');
    kick.textContent = s.kicker[l]; tit.textContent = s.title[l]; bod.textContent = s.body[l]; num.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  };
  const t0 = performance.now();
  let last = performance.now();
  function tick(now) { try { tick2(now); } catch (e) { console.error('scene', e); } }
  function tick2(now) {
    raf = 0; if (!on) return; raf = requestAnimationFrame(tick);
    const dt = Math.min(.1, (now - last) / 1000); last = now; const E = r => 1 - Math.exp(-dt * r);
    prog += (target - prog) * E(4.2); // the dolly: always easing towards where the wheel says
    const i = Math.min(N - 2, Math.floor(prog)), f = ss(prog - i), a = SHOTS[i], b = SHOTS[i + 1];
    const near = Math.round(prog);
    if (near !== lastShot) { lastShot = near; const s = SHOTS[near]; setScreen('c', s.c); setScreen('o', s.o); setLift(s.lift || null); caption(near); }
    // camera
    tmp.copy(v3(a.cam)).lerp(v3(b.cam), f); lookV.copy(v3(a.look)).lerp(v3(b.look), f);
    tmp.x += mx * .25; tmp.y -= my * .18;
    cam.position.copy(tmp); cam.lookAt(lookV);
    // phones float and turn slowly, like objects in a studio
    const t = (now - t0) / 1000;
    phones.c.rotation.set(.06 + Math.sin(t * .5) * .05, .32 + Math.sin(t * .37) * .08 - (near >= 4 ? .12 : 0), -.04 + Math.sin(t * .29) * .03);
    phones.o.rotation.set(.04 + Math.sin(t * .43 + 1) * .05, -.32 + Math.sin(t * .31 + 2) * .08 + (near <= 3 ? -.1 : 0), .05 + Math.sin(t * .33) * .03);
    phones.c.position.y = Math.sin(t * .9) * .04; phones.o.position.y = -.08 + Math.sin(t * .8 + 1.4) * .04;
    // the lifted part rises out of its screen at each shot; on the "book" shot it flies across into the owner's phone
    const s = SHOTS[near], here = 1 - Math.abs(prog - near) * 2.2;
    const want = s.lift ? clamp(here) : 0; liftAmt += (want - liftAmt) * E(6);
    liftMat.opacity = Math.min(1, liftAmt * 1.6); glowMat.opacity = Math.min(.9, liftAmt * 1.4); holeMat.opacity = liftAmt * .85;
    dims.c.material.opacity = liftSide === 'c' ? liftAmt * .42 : 0; dims.o.material.opacity = liftSide === 'o' ? liftAmt * .42 : 0;
    let pos = slotPos(liftSide, ss(liftAmt));
    if (s.travel) { const k = clamp((prog - near) * 2.2 + .0); if (k > 0) { const to = phones.o.localToWorld(new THREE.Vector3(-SW / 2 + .5 * SW, SH / 2 - (TF + (1 - TF) * .69) * SH, .06)); pos = pos.clone().lerp(to, ss(k)); pos.y += Math.sin(ss(k) * Math.PI) * .35; pos.z += Math.sin(ss(k) * Math.PI) * .5; liftMat.opacity = glowMat.opacity = Math.max(liftAmt, 1 - k * .2); } }
    lift.position.copy(pos); lift.quaternion.copy(phones[liftSide].quaternion);
    // progress bar
    bar.style.transform = `scaleX(${(prog / (N - 1)).toFixed(4)})`;
    renderer.render(scene, cam);
  }
  caption(0); setScreen('c', SHOTS[0].c); setScreen('o', SHOTS[0].o);
}

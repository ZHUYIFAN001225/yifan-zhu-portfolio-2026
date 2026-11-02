// Glasgow Salon Booking — the "plate" opening: two rendered photographs of the counter (from above, and from the front)
// as the set, with the only things that have to move built live on top — the phone (3D, with its screen), the
// handwriting that grows on the page, the light that turns from afternoon to lamp-light, the focus, the push-in.
//   from above, day → the set goes dark and the phone rises alone (two big words) → the front view, day →
//   evening under the lamp, pushed in on the book and the phone → hand over to paper
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, SCREEN } from './phone3d.mjs';
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

// the two plates, 1296×768, and where things are in them (plate pixels)
const PLATES = {
  top: { src: 'assets/v3/desk/plate-top.jpg', w: 1296, h: 768, phone: [[779, 211], [932, 220], [930, 514], [770, 505]], pageR: [[440, 192], [660, 165], [725, 475], [485, 540]], origin: [.62, .5] },
  front: { src: 'assets/v3/desk/plate-front.jpg', w: 1296, h: 768, phone: [[785, 258], [918, 258], [910, 480], [780, 476]], pageR: [[575, 425], [725, 425], [780, 510], [605, 530]], origin: [.58, .6] }
};
// a projective map from the unit square to a quad, as a CSS matrix3d
function homography(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / det, h = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
}

export function mountDesk(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-dk')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 };
  document.documentElement.dataset.cover = 'desk'; document.documentElement.dataset.plate = '1';
  if (!document.querySelector('link[data-inter-tight]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.interTight = ''; l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&display=swap'; document.head.append(l); }
  const liveA = op.querySelector('.op-actions a[target]');

  const ov = document.createElement('div'); ov.className = 'bk-dk bk-plate';
  ov.innerHTML = `<div class="bk-pl" data-p="top"><img src="${PLATES.top.src}" alt="" decoding="async"><canvas class="bk-ink" width="900" height="1300"></canvas></div>
    <div class="bk-pl" data-p="front"><img src="${PLATES.front.src}" alt="" decoding="async"><canvas class="bk-ink" width="900" height="1300"></canvas><div class="bk-pl-night"></div><div class="bk-pl-lamp"></div><div class="bk-pl-glow"></div></div>
    <div class="bk-pl-dim"></div><div class="bk-ph"><canvas></canvas></div><div class="bk-dk-grain" aria-hidden="true"></div><div class="bk-dk-out" aria-hidden="true"></div>
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

  // ---------- the handwriting that grows on the right page (drawn in page space, mapped onto the plate) ----------
  const inks = [...ov.querySelectorAll('.bk-ink')];
  const EV = [[0, .22, ['TOMORROW ↓', '明天 ↓'], '#15171c'], [1, .22, ['9:30 Emma? ring back', '9:30 Emma? 回电'], '#15171c'], [3, .22, ['11:00 He (moved)', '11:00 何先生（挪过来）'], '#15171c'], [6, .5, ['Zhou → 12:30?', '周先生 → 12:30?'], '#15171c'], [9, .22, ['2:00 colour — 2h!! block it', '2:00 染发 — 2 小时!! 留住'], '#15171c'], [12, .22, ['Sunday? ask everyone', '周日开不开? 问一圈'], '#15171c'], [15, .22, ['bed. 23:40', '睡觉。23:40'], '#6b6f7a']];
  let inkNow = -1;
  function drawInk(k) {
    k = Math.round(clamp(k) * 14) / 14; if (k === inkNow) return; inkNow = k;
    inks.forEach(c => { const x = c.getContext('2d'), w = c.width, h = c.height; x.clearRect(0, 0, w, h); const r = seed(5);
      EV.forEach((e, i) => { const k0 = i / EV.length, k1 = (i + 1) / EV.length; if (k <= k0) return; const part = clamp((k - k0) / (k1 - k0));
        const [row, fx, txt, col] = e, y = h * (.175 + row * .0415), X = w * fx; x.save(); x.beginPath(); x.rect(0, y - h * .035, X + part * w * .75, h * .05); x.clip(); x.translate(X, y); x.rotate((r() - .5) * .04); x.fillStyle = col; x.font = `italic 600 ${Math.round(h * .026 + r() * 3)}px ${HAND}`; x.fillText(L(txt), 0, 0); x.restore(); }); });
  }

  // ---------- the phone: real 3D, small, placed exactly over the plate's phone; its own light ----------
  const cv = $('.bk-ph canvas'), phEl = $('.bk-ph'); let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { ov.classList.add('no-gl'); return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.setClearColor(0, 0);
  const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(18, .62, .1, 50);
  const key = new THREE.DirectionalLight(0xffe0bf, 1.6); key.position.set(-2, 4, 5); scene.add(key);
  const fill = new THREE.HemisphereLight(0xdfe6ff, 0x3a2e24, .5); scene.add(fill);
  const SW = SCREEN.w, SH = SCREEN.h, sc = document.createElement('canvas'); sc.width = 780; sc.height = Math.round(780 * SH / SW); const sx = sc.getContext('2d');
  const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); scene.add(phone);
  const PW = 600, PH = 1080; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(PW, PH, false); cam.aspect = PW / PH; cam.updateProjectionMatrix(); cam.position.set(0, 0, 5.6);
  const shotSrc = n => `assets/v3/screens/booking/${zh() ? 'zh/' : ''}${n}.webp`;
  const screens = { imgs: {}, cur: 'lock', prev: null, fade: 1, async load() { for (const n of ['cover-book']) this.imgs[n] = await load(shotSrc(n)); dirty = true; } };
  screens.load();
  const banners = []; let dirty = true, wake = 0, wantCount = 0, eveAmt = 0, unread = 0, buzz = -1e9;
  const wxList = () => { const o = []; for (let i = 0; i < T.wx.length; i += 2) o.push([L(T.wx[i]), L(T.wx[i + 1])]); return o; };
  function syncBanners(now, count) {
    count = Math.max(0, Math.min(count, 60)); if (count === wantCount) return; const list = wxList();
    while (wantCount < count) { const n = wantCount % list.length; banners.push({ who: list[n][0], what: list[n][1], t: now, n }); wantCount++; buzz = now; if (banners.length > (eveAmt > .5 ? 7 : 4)) banners.shift(); }
    while (wantCount > count) { wantCount--; if (banners.length > 1) banners.pop(); }
    if (count === 0) banners.length = 0; unread = wantCount; dirty = true;
  }
  function drawScreen(now, lit) {
    const W = sc.width, H = sc.height;
    if (screens.cur === 'lock') {
      const g = sx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2230'); g.addColorStop(1, '#0a0d12'); sx.fillStyle = g; sx.fillRect(0, 0, W, H);
      sx.fillStyle = 'rgba(255,255,255,.9)'; sx.textAlign = 'center'; sx.font = `500 ${Math.round(W * .055)}px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(zh() ? '11月5日 周四' : 'Thursday 5 November', W / 2, W * .33);
      sx.font = `300 ${Math.round(W * .22)}px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(eveAmt > .5 ? '22:47' : '9:41', W / 2, W * .56); sx.textAlign = 'left';
      sx.fillStyle = 'rgba(255,255,255,.35)'; sx.beginPath(); sx.roundRect(W / 2 - 110, H - 40, 220, 8, 4); sx.fill();
      sx.fillStyle = '#050506'; const iw = W * .3, ih = W * .085; sx.beginPath(); sx.roundRect((W - iw) / 2, W * .028, iw, ih, ih / 2); sx.fill();
    } else { const im = screens.imgs[screens.cur]; if (!im) return; paint(sx, im, true); if (screens.prev && screens.fade < 1) { sx.globalAlpha = 1 - screens.fade; paint(sx, screens.prev, true); sx.globalAlpha = 1; } }
    const top = screens.cur === 'lock' ? Math.round(W * .62) : Math.round(W * .118) + 10;
    banners.forEach((b, i) => {
      const age = (now - b.t) / 1000, kin = sm(age / .45), y = top + i * 118 - (1 - kin) * 60;
      sx.save(); sx.globalAlpha = kin; sx.shadowColor = 'rgba(0,0,0,.25)'; sx.shadowBlur = 18; sx.shadowOffsetY = 6;
      sx.fillStyle = 'rgba(236,238,244,.93)'; sx.beginPath(); sx.roundRect(22, y, W - 44, 104, 26); sx.fill(); sx.shadowColor = 'transparent';
      sx.fillStyle = '#2dc100'; sx.beginPath(); sx.roundRect(40, y + 20, 64, 64, 16); sx.fill();
      sx.fillStyle = '#fff'; sx.beginPath(); sx.ellipse(66, y + 48, 16, 13, 0, 0, Math.PI * 2); sx.fill(); sx.beginPath(); sx.ellipse(82, y + 58, 13, 11, 0, 0, Math.PI * 2); sx.fill();
      sx.fillStyle = '#6b6b70'; sx.font = `500 22px -apple-system, Inter, system-ui, sans-serif`; sx.textBaseline = 'alphabetic'; sx.fillText(L(T.wxk).toUpperCase(), 124, y + 36); sx.textAlign = 'right'; sx.fillText(L(T.now), W - 44, y + 36); sx.textAlign = 'left';
      sx.fillStyle = '#111'; sx.font = `600 28px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(b.who, 124, y + 66);
      sx.fillStyle = '#333'; sx.font = `400 26px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(b.what, 124, y + 94); sx.restore();
    });
    if (unread > banners.length) { const y = top + banners.length * 118 + 6; sx.save(); sx.fillStyle = 'rgba(236,238,244,.9)'; sx.beginPath(); sx.roundRect(W / 2 - 150, y, 300, 52, 26); sx.fill(); sx.fillStyle = '#d9483c'; sx.beginPath(); sx.arc(W / 2 - 112, y + 26, 11, 0, Math.PI * 2); sx.fill(); sx.fillStyle = '#111'; sx.font = `600 24px -apple-system, Inter, system-ui, sans-serif`; sx.textAlign = 'center'; sx.fillText(`${unread - banners.length} ${zh() ? '条更早的未读' : 'more unread'}`, W / 2 + 10, y + 34); sx.restore(); }
    if (lit < 1) { sx.fillStyle = `rgba(0,0,0,${1 - lit})`; sx.fillRect(0, 0, W, H); }
    tex.needsUpdate = true;
  }
  const showScreen = n => { if (screens.cur === n || (n !== 'lock' && !screens.imgs[n])) return; screens.prev = screens.cur === 'lock' ? null : screens.imgs[screens.cur]; screens.cur = n; screens.fade = 0; dirty = true; };

  // ---------- geometry of the plates on screen ----------
  const plates = { top: $('.bk-pl[data-p="top"]'), front: $('.bk-pl[data-p="front"]') };
  let vw = 0, vh = 0, fit = { s: 1, ox: 0, oy: 0 };
  const resize = () => { vw = op.clientWidth; vh = op.clientHeight; const s = Math.max(vw / 1296, vh / 768); fit = { s, ox: (vw - 1296 * s) / 2, oy: (vh - 768 * s) / 2 }; placeInk(); };
  const toScreen = ([x, y]) => [fit.ox + x * fit.s, fit.oy + y * fit.s];
  function placeInk() { for (const k of ['top', 'front']) { const q = PLATES[k].pageR.map(toScreen); const c = plates[k].querySelector('.bk-ink'); c.style.transform = `${homography(q)} scale(${1 / 900}, ${1 / 1300})`; } }
  resize(); addEventListener('resize', resize);
  const P = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { if (!fine) return; const r = op.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * 2 - 1; P.ty = (e.clientY - r.top) / r.height * 2 - 1; }, { passive: true });
  // the phone's rectangle in a plate (centre, width, height, roll) after the plate's own push-in transform
  const phoneRect = (k, push) => { const q = PLATES[k].phone.map(toScreen), cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2, w = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]), h = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]), roll = Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]);
    const [ox, oy] = PLATES[k].origin, OX = vw * ox, OY = vh * oy, s = 1 + .3 * push; return { cx: OX + (cx - OX) * s, cy: OY + (cy - OY) * s, w: w * s, h: h * s, roll }; };
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    const lag = 1 - Math.exp(-dt * 5); P.x += (P.tx - P.x) * lag; P.y += (P.ty - P.y) * lag;
    // timeline
    const kText = seg(pr, 0, .07), kDark = seg(pr, .09, .22), kUp = seg(pr, .1, .26);
    const kPw = seg(pr, .24, .32) * (1 - seg(pr, .4, .46));
    const kDown = seg(pr, .44, .56), kEve = seg(pr, .6, .74), kPush = seg(pr, .62, .86), kInk = seg(pr, .66, .9);
    const kEveT = seg(pr, .7, .76) * (1 - seg(pr, .9, .94)), kOut = seg(pr, .93, 1);
    eveAmt = kEve; drawInk(kInk);
    const up = kUp * (1 - kDown), onDesk = 1 - up;
    // plates: the top one dims to black, the front one comes up; the front pushes in through the evening
    const tp = plates.top, fp = plates.front;
    tp.style.opacity = (1 - kDown).toFixed(3); tp.style.filter = `brightness(${(1 - kDark).toFixed(3)})`;
    tp.style.transform = `scale(${(1 + .06 * kDark + P.x * 0).toFixed(4)}) translate(${(P.x * -6).toFixed(1)}px, ${(P.y * -4).toFixed(1)}px)`;
    fp.style.opacity = kDown.toFixed(3); fp.style.transform = `scale(${(1 + .3 * kPush).toFixed(4)}) translate(${(P.x * -5).toFixed(1)}px, ${(P.y * -3).toFixed(1)}px)`;
    fp.style.setProperty('--eve', kEve.toFixed(3));
    $('.bk-pl-dim').style.opacity = (kUp * (1 - kDown)).toFixed(3);
    // the phone: over the plate's phone, then centre stage, then over the standing phone in the front plate
    const a = phoneRect('top', 0), b = phoneRect('front', kPush);
    const big = { cx: vw / 2, cy: vh * .5, w: Math.min(vh * .62, vw * .34) * .62, h: Math.min(vh * .62, vw * .34), roll: 0 };
    const m1 = up, m2 = kDown;
    const cx = lerp(lerp(a.cx, big.cx, m1), b.cx, m2), cy = lerp(lerp(a.cy, big.cy, m1), b.cy, m2), w = lerp(lerp(a.w, big.w, m1), b.w, m2), h = lerp(lerp(a.h, big.h, m1), b.h, m2), roll = lerp(lerp(a.roll, 0, m1), b.roll, m2);
    const scale = h / PH * 1.18; // the render has a little air around the phone
    phEl.style.transform = `translate(${(cx - PW * scale / 2).toFixed(1)}px, ${(cy - PH * scale / 2).toFixed(1)}px) rotate(${roll.toFixed(4)}rad) scale(${scale.toFixed(4)})`;
    // pose inside the render: flat/frontal on the counter; a little turn with the pointer while it floats; standing in the front view
    phone.rotation.set(up * (P.y * .18 + Math.sin(now / 2600) * .05) - kDown * .07, up * P.x * .22, 0);
    key.intensity = 1.6 * (1 - kEve * .5); fill.intensity = .5 * (1 - kEve * .6); key.color.setHex(kEve > .5 ? 0xffc27a : 0xffe0bf);
    // the screen
    const heroMsgs = Math.floor(clamp(pr, 0, .085) / .0107), eveMsgs = Math.floor(clamp(pr - .6, 0, .3) / .022);
    syncBanners(now, up > .05 ? 0 : heroMsgs + eveMsgs); showScreen(up > .05 ? 'cover-book' : 'lock');
    const litTarget = (up > .05 || wantCount > 0) ? 1 : 0; wake += (litTarget - wake) * (1 - Math.exp(-dt * 6)); if (Math.abs(litTarget - wake) > .002) dirty = true;
    if (screens.fade < 1) { screens.fade = Math.min(1, screens.fade + dt * 3); dirty = true; }
    if (dirty) { drawScreen(now, wake); dirty = banners.some(x => now - x.t < 600) || screens.fade < 1; }
    const bz = (now - buzz) / 1000; phEl.style.marginLeft = bz < .35 && onDesk > .5 ? `${(Math.sin(bz * 90) * 3 * (1 - bz / .35)).toFixed(1)}px` : '0px';
    renderer.render(scene, cam);
    const S = (k, v) => ov.style.setProperty(k, (+v).toFixed(3));
    S('--kText', kText); S('--kDark', kDark); S('--kUp', kUp); S('--kPw', kPw); S('--kEve', kEve); S('--kEveT', kEveT); S('--kOut', kOut); S('--kDown', kDown);
  }
  requestAnimationFrame(frame);
}

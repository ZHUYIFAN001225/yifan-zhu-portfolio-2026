// Glasgow Salon Booking: one 3D stage for the whole case, built the way Silencio builds its store.
//  • The page scrolls normally. A fixed WebGL canvas sits behind the text, with ONE real 3D phone in it.
//  • Every part of the page is a "station": where the phone stands, how it turns, which screen it shows and which
//    part of that screen lifts out. Between stations it flies with an ease-in-out curve (fast in the middle,
//    settling at the end), and it turns a full circle when it changes side or role; the screen swaps while its back faces you.
//  • Scroll is followed with a short, frame-rate-independent smoothing. Scroll speed tilts the phone a little and
//    it floats in place when the page is still.
//  • The lifted part looks like LOOK's anatomy: the rest of the screen turns to frosted glass, the part rises a little
//    with a soft shadow and a thin glowing pink outline.
//  • Hovering text (desktop) or tapping it (phone) brings the phone closer and lifts the matching part.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, roundedRect, planeUV, SCREEN } from './phone3d.mjs';

const zh = () => document.documentElement.lang.startsWith('zh');
const B = 'assets/v3/screens/booking/';
const src = f => B + (zh() ? 'zh/' : '') + f + '.webp';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2; // power4.inOut (lifts)
const glide = t => (1 - Math.cos(Math.PI * t)) / 2; // the phone's journeys: unhurried, no stop-and-snap
const TAU = Math.PI * 2;

// which part of each screen lifts out (x, y, w, h in % of the screen image)
export const SPOT = { today: [2, 21.3, 96, 30.6], book: [2, 19, 96, 15], day: [2, 30.9, 96, 29.1], confirm: [3, 28.5, 94, 15.6], schedule: [4, 52.3, 94, 33.2], 'time-off-hours': [2, 34.8, 96, 25.6], kept: [2, 33, 96, 30.8], add: [2, 21.5, 96, 32.5], mine: [2, 16.5, 96, 31.5], services: [2, 16, 96, 38.5], 'by-time': [2, 22.7, 96, 39.2], booked: [2, 13.9, 96, 34.1], reschedule: [2, 22.4, 96, 36.5], window: [2, 22, 96, 36] }; // edges sit in the gaps between elements, so nothing is cut

// the 12:10 story, one booking step by step. Pose: [x, y, size, rx, ry, rz]; x/y are screen fractions, size is phone height / screen height
export const STEPS = [
  { f: 'book', spot: SPOT.book, tap: [22, 27], kicker: ['Customer · 12:10', '顾客 · 12:10'], title: ['The service comes first.', '先选服务。'], body: ['Its length is known before any time is shown, so only times that fit can appear.', '服务时长先确定，后面才可能只出现放得下的时间。'], d: [0.62, 0.52, 0.74, 0.03, 0.08, 0], m: [.5, .35, .46, .02, .1, 0] },
  { f: 'day', spot: SPOT.day, tap: [50, 45], kicker: ['Customer · 12:11', '顾客 · 12:11'], title: ['Only times that fit.', '只给放得下的时间。'], body: ['No “are you free at 2?” messages. Every time on offer is one the diary can actually hold.', '不用再发“两点有空吗？”。给出的每个时间，日程都真的放得下。'], d: [0.62, 0.52, 0.74, 0.02, -0.08, 0], m: [.5, .35, .46, .02, -.1, 0] },
  { f: 'confirm', spot: SPOT.confirm, travel: true, kicker: ['Customer · 12:12', '顾客 · 12:12'], title: ['One check, then book.', '核对一次，就约好了。'], body: ['Date, time and length in one card. Keep scrolling and watch it move into the owner’s diary.', '日期、时间、时长都在一张卡里。继续滚，看它走进店主的日程。'], d: [0.6, 0.52, 0.74, 0.03, 0.08, 0], m: [.5, .35, .46, .03, .14, 0] },
  { f: 'schedule', spot: SPOT.schedule, kicker: ['Owner · 12:12', '店主 · 12:12'], title: ['It lands in her diary by itself.', '它自己落进了店主的日程。'], body: ['The owner does nothing. The booking is already in her week, at the right length.', '店主什么都不用做。预约已经按正确的时长，出现在她这一周里。'], d: [0.62, 0.52, 0.74, 0.03, -0.08, 0], m: [.5, .35, .46, .02, -.1, 0] },
  { f: 'time-off-hours', spot: SPOT['time-off-hours'], tap: [62, 48], kicker: ['Owner · 17:40', '店主 · 17:40'], title: ['She closes two hours. Nobody is deleted.', '她临时关掉两小时，没有人被删掉。'], body: ['The affected customer keeps her service and picks a new time.', '受影响的顾客保留原来的服务，重新选个时间就好。'], d: [0.62, 0.52, 0.74, 0.03, 0.08, 0], m: [.5, .35, .46, .02, .1, 0] }
];

// one beat per piece of the long page: which element, which screen, and who is holding the phone
const BEATS = [
  ['#system .ux-blueprint', 'book', ['Customer · picks a service first', '顾客 · 先选服务']],
  ['#system .ux-needs', 'today', ['Owner · her day, not a chat', '店主 · 她的一天，不是聊天记录']],
  ['#system .ux-lanes', 'mine', ['Customer · my bookings', '顾客 · 我的预约']],
  ['#strategy .ux-principles', 'day', ['Customer · only times that fit', '顾客 · 只给放得下的时间']],
  ['#strategy .ux-chips', 'services', ['Owner · services and lengths', '店主 · 服务和时长']],
  ['#iteration', 'confirm', ['Customer · one check, then book', '顾客 · 核对一次就约好']],
  ['#structure', 'by-time', ['Customer · find a time', '顾客 · 找一个时间']],
  ['#flow', 'by-time', ['Customer · find a time', '顾客 · 找一个时间']],
  ['#flow .ux-journey', 'booked', ['Customer · booked', '顾客 · 约好了']],
  ['#interfaces', 'time-off-hours', ['Owner · close a few hours', '店主 · 临时关几个小时']],
  ['#interfaces .ux-details', 'kept', ['Customer · nobody is deleted', '顾客 · 没有人被删掉']],
  ['#build', 'add', ['Owner · add a regular by name', '店主 · 填名字加老顾客']],
  ['#challenges', 'reschedule', ['Customer · pick a new time', '顾客 · 重新选个时间']],
  ['#research', 'today', ['Owner · her day, live', '店主 · 她今天的真实日程']],
  ['#release', 'booked', ['Customer · booked, in English or Chinese', '顾客 · 中英文都能约']]
];
// text you can point at, and the screen each piece of it is about
const HOVER = [
  ['#overview .ux-pains>div', ['schedule', 'day', 'time-off-hours', 'book']],
  ['#overview .ux-persona', ['today']],
  ['#system .ux-bp-row, #system .ux-needs>div, #system .ux-lanes>div', ['book', 'today', 'mine', 'add']],
  ['#strategy .ux-principles>div', ['today', 'services', 'day', 'by-time', 'window', 'day', 'kept', 'schedule']],
  ['#iteration .ux-process>li, #iteration .ux-before-after>*', ['confirm', 'today', 'book']],
  ['#flow .ux-journey>li', ['book', 'day', 'confirm', 'mine', 'reschedule']],
  ['#interfaces .bk-textonly', ['book', 'today', 'time-off-hours', 'kept']],
  ['#build .ux-build>li', ['book', 'add', 'confirm', 'today', 'book']],
  ['#challenges .ux-challenge-grid>div, #challenges .ux-success>li', ['add', 'services', 'book', 'today', 'mine', 'reschedule', 'today']],
  ['#research .ux-research-plan>div', ['booked', 'services', 'time-off-hours']]
];
// which side of the page each chapter keeps its phone on (desktop)
// the phone always stands on the right and the text always reads on the left: it never has to cross the text
// the phone appears only where it carries the story (the opening, and when it takes over from the paper diary);
// the long chapters get the full width and no phone
export const SIDE = {};

const P6 = a => ({ x: a[0], y: a[1], s: a[2], rx: a[3], ry: a[4], rz: a[5] });

export function mountStage(root) {
  const isMobile = () => innerWidth < 1000;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cv = document.createElement('canvas'); cv.className = 'bk-stage'; cv.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return false; }
  if (!renderer.getContext()) return false;
  root.prepend(cv);
  const tag = document.createElement('p'); tag.className = 'bk-tag'; tag.setAttribute('aria-hidden', 'true'); tag.innerHTML = '<i></i><span></span>'; document.body.append(tag);
  const tagTxt = tag.querySelector('span');
  const NS = 'http://www.w3.org/2000/svg', ink = document.createElementNS(NS, 'svg'); ink.setAttribute('class', 'bk-link'); ink.setAttribute('aria-hidden', 'true');
  ink.innerHTML = '<path class="bk-link-line"/><path class="bk-link-head"/><path class="bk-link-ring"/><circle class="bk-link-tap" r="10"/><circle class="bk-link-tap is-2" r="10"/>';
  cv.after(ink); // above the phone, below the text: the line passes behind cards instead of over words
  const [lLine, lHead, lRing] = ink.querySelectorAll('path'), lTaps = ink.querySelectorAll('circle');
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(2, 4, 5); scene.add(key);
  const FOV = 28, D = 7, TAN = Math.tan(FOV / 2 * Math.PI / 180);
  const cam = new THREE.PerspectiveCamera(FOV, 1, .1, 60); cam.position.set(0, 0, D);

  // ---------- the phone and its screen ----------
  const SW = SCREEN.w, SH = SCREEN.h, CH = Math.round(780 * SH / SW), TF = Math.round(780 * .118) / CH; // screen size in phone units; the status bar takes the top TF of it
  const imgs = {}, frosts = new Map();
  const getImg = f => { const k = (zh() ? 'zh/' : '') + f; if (!imgs[k]) imgs[k] = load(src(f)); return imgs[k]; };
  // frosted glass version of a screen: softened, paler, a little blurred (like the translucent layers in LOOK's anatomy)
  const frost = im => {
    if (frosts.has(im)) return frosts.get(im);
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d');
    x.filter = 'blur(2.5px) saturate(.5)'; x.drawImage(im, 0, 0); x.filter = 'none';
    x.fillStyle = 'rgba(236,237,242,.5)'; x.fillRect(0, 0, c.width, c.height);
    frosts.set(im, c); return c;
  };
  const sc = document.createElement('canvas'); sc.width = 780; sc.height = CH;
  const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); scene.add(phone);
  const P = { g: phone, ctx: sc.getContext('2d'), file: '', img: null, prev: null, fade: 1, drawnAmt: -1, spotKey: '', rect: null, amt: 0, focus: 0, pw: 0, ph: 0 };
  const draw = () => {
    const p = P; if (!p.img) return; const x = p.ctx; x.imageSmoothingQuality = 'high';
    if (p.fade < 1 && p.prev) { paint(x, p.prev, true); x.globalAlpha = ease(p.fade); paint(x, p.img, true); x.globalAlpha = 1; } else paint(x, p.img, true);
    if (p.amt > .004 && p.fade >= 1 && p.rect) {
      const W = x.canvas.width, H = x.canvas.height, top = Math.round(W * .118), [rx, ry, rw, rh] = p.rect;
      const X = rx / 100 * W, Y = top + ry / 100 * (H - top), Wd = rw / 100 * W, Hd = rh / 100 * (H - top);
      x.save(); x.globalAlpha = clamp(p.amt); x.fillStyle = 'rgba(16,20,32,.18)'; x.beginPath(); x.rect(0, top, W, H - top); x.roundRect(X - 6, Y - 6, Wd + 12, Hd + 12, 18); x.fill('evenodd'); x.restore();
    }
    p.drawnAmt = p.amt; tex.needsUpdate = true;
  };
  async function show(f) {
    if (!f || P.file === f) return; P.file = f; const im = await getImg(f); if (P.file !== f || !im) return;
    P.prev = P.img; P.img = im; P.fade = P.prev ? 0 : 1; P.spotKey = ''; draw();
  }

  // ---------- the lifted part: a rounded glass card, a soft shadow and a thin glowing outline ----------
  const PX = 900; // texture pixels per phone unit
  const glowTex = (w, h) => {
    const m = .07, c = document.createElement('canvas'); c.width = Math.round((w + 2 * m) * PX); c.height = Math.round((h + 2 * m) * PX); const x = c.getContext('2d');
    const r = .03 * PX, o = .006 * PX;
    x.shadowColor = 'rgba(245,154,184,.85)'; x.shadowBlur = .035 * PX; x.strokeStyle = 'rgba(245,154,184,.95)'; x.lineWidth = .0048 * PX;
    x.beginPath(); x.roundRect(m * PX - o, m * PX - o, w * PX + 2 * o, h * PX + 2 * o, r + o); x.stroke(); x.shadowBlur = .012 * PX; x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { t, w: w + 2 * m, h: h + 2 * m };
  };
  const shadowTex = (w, h) => {
    const m = .09, c = document.createElement('canvas'); c.width = Math.round((w + 2 * m) * PX * .5); c.height = Math.round((h + 2 * m) * PX * .5); const x = c.getContext('2d'), k = PX * .5;
    x.shadowColor = 'rgba(25,24,40,.9)'; x.shadowBlur = .045 * k; x.shadowOffsetY = .018 * k; x.fillStyle = 'rgba(25,24,40,.5)';
    x.beginPath(); x.roundRect(m * k, m * k, w * k, h * k, .03 * k); x.fill();
    const t = new THREE.CanvasTexture(c); return { t, w: w + 2 * m, h: h + 2 * m };
  };
  function makeLift(parent) {
    const g = new THREE.Group();
    const mat = o => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false, ...o });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat()), glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat()), card = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({ depthWrite: true }));
    g.add(shadow, card, glow); shadow.renderOrder = 1; card.renderOrder = 2; glow.renderOrder = 3; g.visible = false; parent.add(g);
    const L = { g, shadow, card, glow, w: 0, h: 0,
      set(crop, w, h) {
        L.w = w; L.h = h;
        card.geometry.dispose(); card.geometry = planeUV(new THREE.ShapeGeometry(roundedRect(w, h, .028), 12));
        card.material.map?.dispose(); const t = new THREE.CanvasTexture(crop); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; card.material.map = t; card.material.needsUpdate = true;
        const gl = glowTex(w, h); glow.material.map?.dispose(); glow.material.map = gl.t; glow.material.needsUpdate = true; L.gw = gl.w; L.gh = gl.h;
        const sh = shadowTex(w, h); shadow.material.map?.dispose(); shadow.material.map = sh.t; shadow.material.needsUpdate = true; shadow.scale.set(sh.w, sh.h, 1);
      },
      // a: 0 → resting in the screen, 1 → lifted
      pose(a) {
        g.visible = a > .004; if (!g.visible) return; const k = ease(clamp(a));
        card.position.z = .002 + k * .055; glow.position.z = card.position.z + .001; shadow.position.set(0, -k * .012, .001);
        const sc = 1 + k * .035; card.scale.setScalar(sc); glow.scale.set(L.gw * sc, L.gh * sc, 1); card.material.opacity = clamp(a * 4); glow.material.opacity = clamp(a * 1.6) * .45; shadow.material.opacity = k * .55;
      }
    };
    return L;
  }
  const crop = (im, r) => { const [x, y, w, h] = r, iw = im.naturalWidth, ih = im.naturalHeight, c = document.createElement('canvas'); c.width = Math.round(w / 100 * iw); c.height = Math.round(h / 100 * ih); c.getContext('2d').drawImage(im, x / 100 * iw, y / 100 * ih, w / 100 * iw, h / 100 * ih, 0, 0, c.width, c.height); return c; };
  const slot = r => [-SW / 2 + (r[0] + r[2] / 2) / 100 * SW, SH / 2 - (TF + (1 - TF) * (r[1] + r[3] / 2) / 100) * SH];
  const size = r => [r[2] / 100 * SW, r[3] / 100 * (1 - TF) * SH];
  const lift = makeLift(phone); lift.g.position.z = .0535;
  function setSpot(r) {
    const k = r && P.img ? P.file + r.join(',') + zh() : ''; if (k === P.spotKey) return; P.spotKey = k; P.rect = k ? r : null; if (!k) return;
    const [w, h] = size(r), [lx, ly] = slot(r); lift.set(crop(P.img, r), w, h); lift.g.position.x = lx; lift.g.position.y = ly;
  }
  // the booking card that leaves the customer's screen and lands in the owner's diary as the phone turns over
  const fly = makeLift(scene);
  const flyReady = async () => { const im = await getImg('confirm'); if (im) { const [w, h] = size(SPOT.confirm); fly.set(crop(im, SPOT.confirm), w, h); } };
  flyReady(); document.addEventListener('portfolio:language', flyReady);

  // ---------- stations along the page ----------
  const docY = e => e.getBoundingClientRect().top + scrollY;
  let keys = [];
  function build() {
    const vh = innerHeight, m = isMobile(), S = [];
    let turns = 0, last = null;
    const push = (at, st) => {
      // a full turn when the phone changes side, role or kind of place, like the objects in Silencio
      if (last) {
        const side = q => q.x < .5 ? -1 : 1;
        // no full turns: the phone only moves and leans where that helps you read it
      }
      st.q = { ...st.q, ry: st.q.ry + turns * TAU };
      if (S.length && at <= S[S.length - 1].at + 4) at = S[S.length - 1].at + 4;
      st.at = at; S.push(st); last = st;
    };
    let f = 'book';
    const off = (dir = 1, x = .5) => P6([x, dir > 0 ? 1.65 : -.65, .5, .2, .6, .1]);
    // the opening: the stage's phone IS the opening phone (desktop); it drifts with the page, then lands in the live prototype
    const op = document.querySelector('[data-opening]'), heroEl = document.querySelector('.op-phone');
    if (!m && heroEl && op) {
      const r = heroEl.getBoundingClientRect(), x0 = (r.left + r.width / 2) / innerWidth, y0 = (r.top + scrollY + r.height / 2) / vh;
      const s0 = Math.min(.95, r.height * .69 / vh), opH = op.offsetHeight;
      const first = (heroEl.dataset.screens || '').split(',')[0].match(/([\w-]+)\.webp/); if (first) f = first[1];
      push(vh * .5, { kind: 'hero', q: P6([x0, y0, s0, -.06, -.45, 0]), f });
      push(vh * .5 + opH * .5, { kind: 'hero', q: P6([x0, y0 - opH * .5 / vh * .55, s0 * .96, -.02, -.3, 0]), f });
      // the cover's phone rises up and away as the cover scrolls off (the try-it block has its own live prototype)
      push(vh * .5 + opH * 1.05, { kind: 'off', q: P6([x0, -.7, s0 * .8, .35, -.1, .08]), f });
    } else push(0, { kind: 'off', q: off(1), f });
    const els = [...root.querySelectorAll('.bk-moment, .v3-product-section.ux-section, .bk-step, .xp, .bk-hand, .bk-dom, .bk-story-board, .bk-chair, .bk-results, .bk-end')];
    let story = false, phoneOn = !root.querySelector('.bk-hand[data-act="3"]'); // before act 3 the shop has no phone yet
    els.forEach((e, idx) => {
      const top = docY(e), h = e.offsetHeight;
      if (e.matches('.bk-hand')) {
        if (e.dataset.act !== '3') return;
        // act 3: the phone takes over from the paper diary
        phoneOn = true; f = 'schedule';
        if (m) { const sp = e.querySelector('.bk-hand-space') || e, t2 = docY(sp), h2 = sp.offsetHeight; push(t2 - vh * .45, { kind: 'off', q: off(1), f }); push(t2 + h2 * .5, { kind: 'hand', q: P6([.5, .5, .5, .03, -.2, 0]), f, spot: SPOT.schedule }); story = true; return; }
        // it rises in from below on its own side with a small turn, settles, then stays put while the page reads
        // (the pointer tilts it); when the page moves on it lifts away upward
        const rest = P6([.78, .52, .64, .04, -.12, 0]), lab = ['Owner · the diary keeps itself', '店主 · 预约本自己记'];
        push(top - vh * .35, { kind: 'off', q: P6([.8, 1.7, .6, -.5, -.7, .14]), f });
        push(top + h * .18, { kind: 'section', q: rest, f, spot: null, label: lab, who: 'o', still: true });
        push(top + h * .62, { kind: 'section', q: rest, f, spot: null, label: lab, who: 'o', still: true });
        return;
      }
      if (!phoneOn && !m) return;
      if (!m && phoneOn && !S.some(x => x.gone)) { push(top - vh * .38, { kind: 'off', gone: true, q: P6([.8, -.75, .6, .5, .5, -.12]), f }); return; }
      if (!m) return;
      if (e.matches('.bk-step')) {
        const s = STEPS[+e.dataset.i];
        if (!story && m) push(top - vh * .45, { kind: 'off', q: off(1), f });
        story = true; f = s.f;
        push(top + h * .5, { kind: 'story', q: P6(m ? s.m : s.d), f, spot: s.spot || null, travel: s.travel, spin: s.spin, el: e.querySelector('.bk-step-card'), tap: s.tap });
        return;
      }
      if (story && m) push(top - vh * .2, { kind: 'off', q: off(-1), f });
      story = false;
      // the pinned day boards and the storyboard get the whole width: the phone steps out to the side
      if (e.matches('.bk-dom, .bk-story-board, .bk-chair, .bk-results, .bk-end')) { if (!phoneOn || m) return;
        // step out on the side the phone will come back on, so it never crosses the text on the way
        let n = els[idx + 1]; while (n && !SIDE[n.id] && !n.matches('.bk-step')) n = els[els.indexOf(n) + 1];
        const back = n ? (n.matches('.bk-step') || SIDE[n.id] === 'right' ? 1 : -1) : 1;
        const q = P6([back > 0 ? 1.35 : -.35, .5, .5, .1, back > 0 ? -1.2 : 1.2, 0]); push(top - vh * .3, { kind: 'off', q, f }); push(top + h - vh * .7, { kind: 'off', q, f }); return; }
      if (m) return; // on phones the text gets the whole width: the 3D lives in the story steps (and in tapped previews)
      if (e.matches('.bk-moment')) {
        // beside the clock, on the side the next chapter will use
        let n = els[idx + 1]; while (n && !SIDE[n.id] && !n.matches('.bk-step')) n = els[els.indexOf(n) + 1];
        const R = n ? (n.matches('.bk-step') ? true : SIDE[n.id] === 'right') : true;
        push(top + h * .5, { kind: 'moment', q: P6([R ? .86 : .14, .56, .52, .05, R ? -.5 : .5, R ? .04 : -.04]), f });
        return;
      }
      if (e.matches('.xp')) {
        const q = P6([last0(S) < .5 ? -.3 : 1.3, .5, .5, .1, 1.2, 0]);
        push(top - vh * .1, { kind: 'off', q, f }); push(top + h - vh * .4, { kind: 'off', q, f });
        return;
      }
      const side = SIDE[e.id]; if (!side) return;
      const beats = BEATS.map(([sel, file, label]) => ({ el: document.querySelector(sel), file, label })).filter(b => b.el && e.contains(b.el));
      if (!beats.length) beats.push({ el: e, file: f, label: null });
      beats.sort((a, b) => docY(a.el) - docY(b.el));
      beats.forEach((b, j) => {
        const R = side === 'right'; f = b.file;
        const at = j === 0 ? top + vh * .1 : Math.max(docY(b.el) - vh * .05, top + vh * .1);
        push(at, { kind: 'section', el: b.el, q: P6([R ? .84 : .16, .53, .62, .04, R ? -.3 : .3, 0]), f, spot: SPOT[b.file] || [2, 20, 96, 30], label: b.label, who: b.label ? (/Owner|店主/.test(b.label[0]) ? 'o' : 'c') : null });
      });
    });
    const end = els.length ? docY(els[els.length - 1]) + els[els.length - 1].offsetHeight : document.documentElement.scrollHeight;
    if (!m) push(end + vh * .2, { kind: 'off', q: P6([1.35, .5, .5, .1, -1.2, 0]), f }); // leaves to the side, never across the last words
    // keys: hold each station, then fly to the next one within the last part of the gap
    const K = [];
    S.forEach((st, i) => { const nx = S[i + 1]; K.push({ at: st.at, st }); if (nx) K.push({ at: nx.at - Math.min(vh * (m ? .9 : 1.3), (nx.at - st.at) * .78), st }); });
    keys = K;
  }
  const last0 = S => S.length ? S[S.length - 1].q.x : .5;

  // ---------- pointing at text ----------
  let hover = null, peek = null, peekAmt = 0, peekY = 0;
  [].forEach(([sel, list]) => root.querySelectorAll(sel).forEach((el, i) => {
    const file = list[i % list.length]; el.classList.add('bk-points');
    if (canHover) {
      el.addEventListener('pointerenter', () => { hover = { file, rect: SPOT[file] || [2, 20, 96, 30], el }; el.classList.add('is-pointed'); });
      el.addEventListener('pointerleave', () => { if (hover?.el === el) hover = null; el.classList.remove('is-pointed'); });
    } else el.addEventListener('click', () => { const r = el.getBoundingClientRect(); peek = { file, rect: SPOT[file] || [2, 20, 96, 30], y: (r.top + r.height / 2) > innerHeight * .5 ? .3 : .7, sy: scrollY, t: performance.now() }; });
  }));
  [].forEach(b => {
    if (canHover) { b.addEventListener('pointerenter', () => { hover = { file: b.dataset.screen, rect: null, el: b }; }); b.addEventListener('pointerleave', () => { if (hover?.el === b) hover = null; }); }
    else b.addEventListener('click', () => { peek = { file: b.dataset.screen, rect: null, y: .32, sy: scrollY, t: performance.now() }; });
  });
  if (!canHover) document.addEventListener('click', e => { if (peek && !e.target.closest('.bk-points, #structure [data-screen]')) peek = null; });

  // ---------- the loop ----------
  let idleDrawn = false, sideVal = -1, vw = 0, vh = 0, mx = 0, my = 0, pmx = 0, pmy = 0, sy = scrollY, last = performance.now(), t0 = last, fadeAmt = 1;
  const resize = () => { vw = innerWidth; vh = innerHeight; renderer.setPixelRatio(Math.min(vw < 1000 ? 1.5 : 2, devicePixelRatio || 1)); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix(); build(); };
  addEventListener('resize', resize); resize(); setInterval(build, 1600);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  document.addEventListener('portfolio:language', () => { P.file = ''; P.spotKey = ''; });
  const tmpV = new THREE.Vector3(), qa = new THREE.Quaternion(), qc = new THREE.Quaternion(), va = new THREE.Vector3(), vb = new THREE.Vector3();
  const place = q => { // screen fraction → world position
    const h = 2 * D * TAN, w = h * cam.aspect;
    phone.position.set((q.x - .5) * w, (.5 - q.y) * h, 0); phone.scale.setScalar(q.s * h / 1.62); phone.rotation.set(q.rx, q.ry, q.rz);
  };
  // a docked phone follows its element with the real scroll position, so it sits exactly on it
  const poseOf = st => st.track ? { ...st.q, y: (st.track.mid - scrollY) / vh } : st.q;
  const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t), rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t), rz: lerp(a.rz, b.rz, t) });
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || !keys.length) return;
    const dt = Math.min(.08, (now - last) / 1000); last = now; const E = r => 1 - Math.exp(-dt * r);
    // follow the scroll with a short smoothing (frame-rate independent); jump when far away (links, reloads)
    if (Math.abs(scrollY - sy) > vh * 2.5) sy = scrollY; sy += (scrollY - sy) * E(4.2); // a little inertia, like a camera on a dolly
    const y = sy + vh * .5, vel = clamp((scrollY - sy) / vh, -.6, .6);
    let a = keys[0], b = keys[0], t = 0;
    if (y >= keys[keys.length - 1].at) a = b = keys[keys.length - 1];
    else if (y > keys[0].at) for (let i = 0; i < keys.length - 1; i++) if (y < keys[i + 1].at) { a = keys[i]; b = keys[i + 1]; t = (y - a.at) / Math.max(1, b.at - a.at); break; }
    // nothing to draw while the phone is parked off screen: render one last frame, then sleep (keeps scrolling and
    // the pointer smooth on long text stretches)
    if (a.st.kind === 'off' && b.st.kind === 'off' && !peek) { if (idleDrawn) return; idleDrawn = true; } else idleDrawn = false;
    const moving = a.st !== b.st, e = moving ? glide(t) : 0, st = e < .5 ? a.st : b.st, same = moving && a.st.q.x === b.st.q.x && a.st.q.y === b.st.q.y && a.st.q.ry === b.st.q.ry && a.st.q.s === b.st.q.s, hold = same ? Math.abs(e - .5) > .1 : (e < .05 || e > .95);
    const time = (now - t0) / 1000, m = isMobile();
    if (peek && (Math.abs(scrollY - peek.sy) > 160 || now - peek.t > 6000)) peek = null;
    const pk = peek && m ? peek : null; peekAmt += ((pk ? 1 : 0) - peekAmt) * E(pk ? 5 : 7); if (pk) peekY = pk.y;
    const hv = !m && hover && st.kind === 'section' ? hover : null;
    // screen and lifted part
    let file = st.f, rect = hold ? st.spot : null;
    if (hv) { file = hv.file; rect = hv.rect; }
    if (pk) { file = pk.file; rect = peekAmt > .7 ? pk.rect : null; }
    show(file);
    setSpot(rect);
    const travelling = a.st.travel && moving && e > .001 && e < .999;
    const want = rect && P.rect && !travelling ? 1 : 0;
    P.amt += (want - P.amt) * E(want ? 4.5 : 8); if (!want && P.amt < .004) P.amt = 0;
    if (P.fade < 1) { P.fade = Math.min(1, P.fade + dt / .35); draw(); } else if (Math.abs(P.amt - P.drawnAmt) > .01 || (P.amt === 0 && P.drawnAmt !== 0)) draw();
    lift.pose(0); // the pen points; the screen itself stays real and sharp
    P.focus += ((hv ? 1 : 0) - P.focus) * E(5);
    // pose: station → station, plus hover focus, float and a lean from scroll speed
    let q = mix(poseOf(a.st), poseOf(b.st), e);
    // crossing to the other side: it goes a little smaller and further away while it passes behind the text
    if (moving && (poseOf(a.st).x - .5) * (poseOf(b.st).x - .5) < 0) q.s *= 1 - .3 * Math.sin(Math.PI * e);
    // the text moves out of its way, in step with it
    if (!m && st.kind !== 'off' && a.st.kind !== 'off' && b.st.kind !== 'off') { const side = clamp((.84 - q.x) / .68); if (Math.abs(side - sideVal) > .001) { sideVal = side; document.body.style.setProperty('--bk-side', side.toFixed(4)); } }
    const front = Math.round(q.ry / TAU) * TAU;
    if (P.focus > .001) q = { ...q, s: q.s * (1 + .14 * P.focus), ry: lerp(q.ry, front, .75 * P.focus), rx: q.rx * (1 - .7 * P.focus) };
    if (peekAmt > .001) q = mix(q, { x: .5, y: peekY, s: .42, rx: .02, ry: front, rz: 0 }, ease(peekAmt));
    // mouse-follow: where the phone stands still, it turns a little toward the pointer and the light moves with it
    pmx += (mx - pmx) * E(4); pmy += (my - pmy) * E(4);
    const stillAmt = a.st.still && b.st.still ? 1 : a.st.still ? 1 - e : b.st.still ? e : 0;
    if (!m && stillAmt > 0) q = { ...q, ry: q.ry + pmx * .55 * stillAmt, rx: q.rx + pmy * .32 * stillAmt };
    key.position.set(2 + pmx * 10 * stillAmt, 4 - pmy * 8 * stillAmt, 5);
    const calm = (1 - P.focus * .7) * (a.st.kind === 'dock' || b.st.kind === 'dock' ? 0 : 1) * (1 - stillAmt * .85);
    q = { ...q, y: q.y + Math.sin(time * 1.05) * .006 * calm, rx: q.rx + Math.sin(time * .7) * .035 * calm + vel * .5 * calm, ry: q.ry + Math.sin(time * .5) * .05 * calm, rz: q.rz + Math.sin(time * .43) * .02 * calm - vel * .35 * calm };
    place(q);
    // the booking card: it rises out of the customer's screen, hangs in the air facing you while the phone turns over,
    // then settles into the owner's diary
    if (travelling) {
      const k = e, [ax, ay] = slot(SPOT.confirm), [bx, by] = slot(SPOT.schedule);
      phone.updateMatrixWorld(); va.set(lerp(ax, bx, k), lerp(ay, by, k), .06); phone.localToWorld(va);
      const up = Math.sin(k * Math.PI); vb.set(0, up * .25, up * 1.6);
      fly.g.position.copy(va).add(vb);
      phone.getWorldQuaternion(qa); qc.identity(); fly.g.quaternion.copy(qa).slerp(qc, clamp(up * 1.6)); fly.g.rotateZ(up * .12);
      fly.g.scale.setScalar(phone.scale.x * (1 + up * .25)); fly.pose(1);
    } else fly.pose(0);
    // camera: a slight drift with the pointer; none while the phone is landing on the prototype, so it lines up exactly
    const landing = a.st.kind === 'dock' || b.st.kind === 'dock' || a.st.kind === 'hero';
    cam.position.x += ((landing ? 0 : mx * .22) - cam.position.x) * E(3); cam.position.y += ((landing ? 0 : -my * .14) - cam.position.y) * E(3);
    cam.lookAt(0, 0, 0);
    // once it has landed, the 3D phone fades and the live prototype takes over; it reappears for the story
    const gone = !m && (a.st.kind === 'dock' || (b.st.kind === 'dock' && e > .97));
    fadeAmt += ((gone ? 0 : 1) - fadeAmt) * E(gone ? 9 : 6); cv.style.opacity = fadeAmt > .995 ? '' : fadeAmt.toFixed(3);
    // the canvas comes in front of the dark opening and of a tapped preview; otherwise it stays behind the text
    cv.classList.toggle('is-front', (!m && (a.st.kind === 'hero' || b.st.kind === 'dock' || a.st.kind === 'dock')) || peekAmt > .03);
    document.body.classList.toggle('bk-hero-handover', !m);
    // the live prototype's frame waits empty until the phone has landed in it
    document.body.classList.toggle('bk-awaiting-phone', !m && !gone && (a.st.kind === 'hero' || b.st.kind === 'dock'));
    // a small tag under the phone: whose phone this is right now
    const lab = st.label && !pk ? st.label[zh() ? 1 : 0] : '';
    if (!m && lab && hold) {
      tmpV.set(0, -.92, 0); phone.localToWorld(tmpV); tmpV.project(cam);
      tag.style.transform = `translate3d(${((tmpV.x + 1) / 2 * vw).toFixed(1)}px,${((1 - tmpV.y) / 2 * vh + 14).toFixed(1)}px,0) translateX(-50%)`;
      if (tagTxt.textContent !== lab) { tagTxt.textContent = lab; tag.dataset.who = st.who === 'o' ? 'owner' : 'customer'; }
      tag.classList.toggle('is-on', !hv);
    } else tag.classList.remove('is-on');
    link(st, hold, hv, now, m);
    renderer.render(scene, cam);
  }
  // ---------- the pen: words → the part of the screen they talk about ----------
  let linkKey = '', linkT0 = 0;
  const pv = new THREE.Vector3();
  const toScreen = (x, y) => { pv.set(x, y, .07); phone.localToWorld(pv); pv.project(cam); return [(pv.x + 1) / 2 * vw, (1 - pv.y) / 2 * vh]; };
  const wob = (k, a) => Math.sin(k * 12.9898 + a) * 2.2;
  function link(st, hold, hv, now, m) {
    // in the story the pen draws by itself; in the long chapters only when you point at something (so reading stays calm)
    const auto = st.kind === 'story' || st.el?.classList.contains('bk-sheet');
    const src = hv?.el || (auto ? st.el : null), on = (m ? hold : (hv || hold) && src) && P.rect && P.amt > .6 && cv.style.opacity !== '0'; // on phones: the ring only
    const key = on ? (P.spotKey + '|' + (hv ? 'h' : st.at)) : '';
    if (key !== linkKey) { linkKey = key; linkT0 = now; }
    ink.classList.toggle('is-on', !!on);
    if (!on) return;
    phone.updateMatrixWorld();
    const r = P.rect, [w, h] = size(r), [cx, cy] = slot(r);
    const pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx - w / 2, cy + h / 2], [cx + w / 2, cy + h / 2]].map(([x, y]) => toScreen(x, y));
    const bx0 = Math.min(...pts.map(p => p[0])), bx1 = Math.max(...pts.map(p => p[0])), by0 = Math.min(...pts.map(p => p[1])), by1 = Math.max(...pts.map(p => p[1]));
    const ecx0 = (bx0 + bx1) / 2, ecy0 = (by0 + by1) / 2;
    if (m) { lLine.setAttribute('d', ''); lHead.setAttribute('d', ''); }
    const sr = m ? { right: 0, top: 0, bottom: vh, left: 0 } : src.getBoundingClientRect();
    const tx = bx0 - 14, ty = (by0 + by1) / 2, sx = Math.min(sr.right + 16, tx - 60), sy = clamp(ty, Math.max(sr.top + 24, 90), Math.min(sr.bottom - 24, vh - 60));
    if (!m && (sr.bottom < 60 || sr.top > vh - 60 || tx - sx < 40)) { ink.classList.remove('is-on'); return; }
    const mx = (sx + tx) / 2, my = Math.min(sy, ty) - 40 - Math.abs(tx - sx) * .08;
    if (!m) lLine.setAttribute('d', `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`);
    const ang = Math.atan2(ty - my, tx - mx), A = 13;
    if (!m) lHead.setAttribute('d', `M${(tx - Math.cos(ang - .45) * A).toFixed(1)} ${(ty - Math.sin(ang - .45) * A).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${(tx - Math.cos(ang + .45) * A).toFixed(1)} ${(ty - Math.sin(ang + .45) * A).toFixed(1)}`);
    const ecx = (bx0 + bx1) / 2, ecy = (by0 + by1) / 2, erx = (bx1 - bx0) / 2 + 12, ery = (by1 - by0) / 2 + 10; let d = '';
    for (let i = 0; i <= 40; i++) { const a = -2.6 + i / 40 * (Math.PI * 2 + .45), k = 1 + i / 40 * .05; d += (i ? ' L' : 'M') + (ecx + Math.cos(a) * erx * k + wob(i, 1)).toFixed(1) + ' ' + (ecy + Math.sin(a) * ery * k + wob(i, 2)).toFixed(1); }
    lRing.setAttribute('d', d);
    // draw it like a pen: the line first, then the ring
    const k = clamp((now - linkT0) / 900);
    [[lLine, 0, .45], [lHead, .45, .55], [lRing, .5, 1]].forEach(([el, a, b]) => { const L = el.getTotalLength() || 1, kk = clamp((k - a) / (b - a)); el.style.strokeDasharray = `${L} ${L}`; el.style.strokeDashoffset = (L * (1 - kk)).toFixed(1); });
    // a finger tap where she acts
    const tp = !hv && st.tap;
    lTaps.forEach((c, i) => { c.style.display = tp && k >= 1 ? '' : 'none'; });
    if (tp && k >= 1) { const [x, y] = tp, px = -SW / 2 + x / 100 * SW, py = SH / 2 - (TF + (1 - TF) * y / 100) * SH, [qx, qy] = toScreen(px, py); lTaps.forEach(c => { c.setAttribute('cx', qx.toFixed(1)); c.setAttribute('cy', qy.toFixed(1)); }); }
  }
  requestAnimationFrame(frame);
  return true;
}

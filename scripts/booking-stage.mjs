// Glasgow Salon Booking: one 3D stage for the whole case, built the way Silencio builds its store.
//  • The page scrolls normally. A fixed WebGL canvas sits behind the text, and two real 3D phones live in it:
//    the customer's and the owner's.
//  • Every part of the page is a "station": where each phone stands, how it turns, which screen it shows and
//    which part of that screen lifts out. Between stations the phones fly with an ease-in-out curve (fast in the
//    middle, settling at the end), and often spin a full turn. The screen swaps while the back faces you.
//  • Scroll is followed with a short, frame-rate-independent smoothing, so motion is equally soft at 60 Hz and 144 Hz.
//    Scroll speed tilts the phones a little, and they float in place when the page is still.
//  • Hovering text (desktop) or tapping it (phone) brings the phone closer and lifts the matching part of its screen.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, roundedRect } from './phone3d.mjs';

const zh = () => document.documentElement.lang.startsWith('zh');
const B = 'assets/v3/screens/booking/';
const src = f => B + (zh() ? 'zh/' : '') + f + '.webp';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2; // power4.inOut, like Silencio
const TAU = Math.PI * 2;

// which part of each screen lifts out (x, y, w, h in % of the screen image)
export const SPOT = { today: [2, 22, 96, 28], book: [2, 19, 96, 13], day: [2, 31, 96, 28], confirm: [2, 27, 96, 24], schedule: [4, 52, 94, 34], 'time-off-hours': [2, 35, 96, 27], kept: [2, 33, 96, 28], add: [2, 24, 96, 30], mine: [2, 18, 96, 30], services: [2, 16, 96, 42], 'by-time': [2, 22, 96, 40], booked: [2, 14, 96, 34], reschedule: [2, 22, 96, 36], window: [2, 22, 96, 36] };
const OWNER = new Set(['schedule', 'today', 'time-off-hours', 'services', 'add', 'window']);

// the 12:10 story — one booking, step by step. Poses: [x, y, size, rx, ry, rz, depth]; x/y are screen fractions, size is phone height / screen height
export const STEPS = [
  { c: 'book', o: 'schedule', kicker: ['12:10 · Lunch break', '12:10 · 午休'], title: ['One booking, from both sides.', '一笔预约，两端同时发生。'], body: ['Keep scrolling: follow a single booking from the customer’s phone into the owner’s diary.', '往下滚：跟着一笔预约，从顾客的手机走进店主的日程。'],
    d: { c: [.58, .52, .62, .05, .42, 0, 0], o: [.82, .55, .62, .05, -.42, 0, 0] }, m: { c: [0.3, 0.34, 0.38, 0.05, 0.4, 0, 0], o: [0.7, 0.35, 0.38, 0.05, -0.4, 0, 0] } },
  { c: 'book', o: 'schedule', fg: 'c', spot: SPOT.book, spin: { c: 1 }, kicker: ['Customer · 12:10', '顾客 · 12:10'], title: ['The service comes first.', '先选服务。'], body: ['Its length is known before any time is shown, so only times that fit can appear.', '服务时长先确定，后面才可能只出现放得下的时间。'],
    d: { c: [.64, .52, .78, .03, .14, 0, 0], o: [.9, .3, .36, .12, -.9, .12, -2.2] }, m: { c: [0.5, 0.35, 0.46, 0.02, 0.1, 0, 0], o: [0.84, 0.2, 0.22, 0.1, -0.9, 0.1, -2] } },
  { c: 'day', o: 'schedule', fg: 'c', spot: SPOT.day, kicker: ['Customer · 12:11', '顾客 · 12:11'], title: ['Only times that fit.', '只给放得下的时间。'], body: ['No “are you free at 2?” messages. Every time on offer is one the diary can actually hold.', '不用再发“两点有空吗？”。给出的每个时间，日程都真的放得下。'],
    d: { c: [.62, .52, .78, .02, -.14, 0, 0], o: [.9, .32, .36, .12, -.9, .12, -2.2] }, m: { c: [0.5, 0.35, 0.46, 0.02, -0.1, 0, 0], o: [0.84, 0.2, 0.22, 0.1, -0.9, 0.1, -2] } },
  { c: 'confirm', o: 'schedule', fg: 'c', spot: SPOT.confirm, travel: true, kicker: ['Customer · 12:12', '顾客 · 12:12'], title: ['One check, then book.', '核对一次，就约好了。'], body: ['Date, time and length in one card. Keep scrolling and watch it leave her phone.', '日期、时间、时长都在一张卡里。继续滚，看它离开她的手机。'],
    d: { c: [.57, .52, .74, .03, .22, 0, 0], o: [.84, .55, .6, .05, -.36, 0, -.4] }, m: { c: [0.36, 0.35, 0.44, 0.03, 0.18, 0, 0], o: [0.76, 0.37, 0.36, 0.05, -0.3, 0, -0.4] } },
  { c: 'booked', o: 'schedule', fg: 'o', spot: SPOT.schedule, kicker: ['Owner · 12:12', '店主 · 12:12'], title: ['It lands in her diary by itself.', '它自己落进了店主的日程。'], body: ['The owner does nothing. The booking is already in her week, at the right length.', '店主什么都不用做。预约已经按正确的时长，出现在她这一周里。'],
    d: { o: [.7, .52, .78, .03, -.14, 0, 0], c: [.47, .3, .36, .12, .9, -.1, -2.4] }, m: { o: [0.5, 0.35, 0.46, 0.02, -0.1, 0, 0], c: [0.16, 0.2, 0.22, 0.1, 0.9, -0.1, -2] } },
  { c: 'kept', o: 'time-off-hours', fg: 'o', spot: SPOT['time-off-hours'], spin: { o: -1 }, kicker: ['Owner · 17:40', '店主 · 17:40'], title: ['She closes two hours. Nobody is deleted.', '她临时关掉两小时，没有人被删掉。'], body: ['The affected customer keeps her service and picks a new time.', '受影响的顾客保留原来的服务，重新选个时间就好。'],
    d: { o: [.68, .52, .78, .03, .14, 0, 0], c: [.47, .32, .36, .12, .9, -.1, -2.4] }, m: { o: [0.5, 0.35, 0.46, 0.02, 0.1, 0, 0], c: [0.16, 0.2, 0.22, 0.1, 0.9, -0.1, -2] } },
  { c: 'kept', o: 'today', spin: { c: 1, o: -1 }, kicker: ['18:30 · Closed', '18:30 · 打烊'], title: ['The routine runs itself.', '日常，自己运转。'], body: ['Next: the screens, the rules and how it was built.', '接下来是界面、规则，以及它是怎么做出来的。'],
    d: { c: [.58, .52, .6, .05, .42, 0, 0], o: [.82, .55, .6, .05, -.42, 0, 0] }, m: { c: [0.3, 0.34, 0.38, 0.05, 0.4, 0, 0], o: [0.7, 0.35, 0.38, 0.05, -0.4, 0, 0] } }
];

// one beat per piece of the long page: which element, which screen, and who is holding the phone
const BEATS = [
  ['#overview .ux-pains', 'schedule', ['Owner · the whole diary in her head', '店主 · 整本预约都记在脑子里']],
  ['#overview .ux-persona', 'today', ['Owner · what she needs at a glance', '店主 · 一眼要看到的']],
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
export const SIDE = { overview: 'right', system: 'left', strategy: 'left', iteration: 'left', structure: 'right', flow: 'right', interfaces: 'right', build: 'left', challenges: 'left', research: 'left', release: 'left' };

const P7 = a => ({ x: a[0], y: a[1], s: a[2], rx: a[3], ry: a[4], rz: a[5], z: a[6] });

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
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(2, 4, 5); scene.add(key);
  const FOV = 28, D = 7, TAN = Math.tan(FOV / 2 * Math.PI / 180);
  const cam = new THREE.PerspectiveCamera(FOV, 1, .1, 60); cam.position.set(0, 0, D);

  // ---------- phones, screens and the lifting part ----------
  const SW = .698, SH = 1.558, TF = 92 / 1741; // screen size in phone units; the status bar takes the top TF of it
  const imgs = {};
  const getImg = f => { const k = (zh() ? 'zh/' : '') + f; if (!imgs[k]) imgs[k] = load(src(f)); return imgs[k]; };
  function makePhone(name) {
    const c = document.createElement('canvas'); c.width = 780; c.height = 1741;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const g = buildPhone(t); scene.add(g);
    const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, ...extra });
    const dim = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(SW, SH, .095), 16), basic(0x15161a)); dim.position.z = .0545;
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), basic(0x0c0d10)); hole.position.z = .0552;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), basic(0xf59ab8));
    const card = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false }));
    glow.position.z = -.002; const lift = new THREE.Group(); lift.add(glow, card);
    g.add(dim, hole, lift);
    return { name, g, ctx: c.getContext('2d'), t, file: '', img: null, prev: null, fade: 1, spotKey: '', rect: null, amt: 0, focus: 0, dim, hole, glow, card, lift, tex: null, pw: 0, ph: 0 };
  }
  const P = { c: makePhone('c'), o: makePhone('o') };
  const draw = p => { if (!p.img) return; if (p.fade < 1 && p.prev) { paint(p.ctx, p.prev, true); p.ctx.globalAlpha = ease(p.fade); paint(p.ctx, p.img, true); p.ctx.globalAlpha = 1; } else paint(p.ctx, p.img, true); p.t.needsUpdate = true; };
  async function show(p, f, instant) {
    if (!f || p.file === f) return; p.file = f; const im = await getImg(f); if (p.file !== f || !im) return;
    p.prev = p.img; p.img = im; p.fade = p.prev && !instant ? 0 : 1; p.spotKey = ''; draw(p);
  }
  function setSpot(p, r) {
    const k = r && p.img ? p.file + r.join(',') + zh() : ''; if (k === p.spotKey) return; p.spotKey = k; p.rect = k ? r : null; if (!k) return;
    const [x, y, w, h] = r, im = p.img, iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    const c = document.createElement('canvas'); c.width = Math.round(w / 100 * iw); c.height = Math.round(h / 100 * ih);
    c.getContext('2d').drawImage(im, x / 100 * iw, y / 100 * ih, w / 100 * iw, h / 100 * ih, 0, 0, c.width, c.height);
    p.tex?.dispose(); p.tex = new THREE.CanvasTexture(c); p.tex.colorSpace = THREE.SRGBColorSpace; p.tex.anisotropy = 8; p.card.material.map = p.tex; p.card.material.needsUpdate = true;
    p.pw = w / 100 * SW; p.ph = h / 100 * (1 - TF) * SH;
    p.card.scale.set(p.pw, p.ph, 1); p.glow.scale.set(p.pw + .03, p.ph + .03, 1); p.hole.scale.set(p.pw, p.ph, 1);
    const lx = -SW / 2 + (x + w / 2) / 100 * SW, ly = SH / 2 - (TF + (1 - TF) * (y + h / 2) / 100) * SH;
    p.hole.position.x = p.lift.position.x = lx; p.hole.position.y = p.lift.position.y = ly;
  }
  // the card that travels from the customer's phone into the owner's diary
  const flyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false }), flyGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59ab8, transparent: true, opacity: 0, depthWrite: false });
  const fly = new THREE.Group(), flyGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flyGlowMat), flyCard = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flyMat);
  flyGlow.position.z = -.003; fly.add(flyGlow, flyCard); fly.visible = false; scene.add(fly);
  const FR = SPOT.confirm, FW = FR[2] / 100 * SW, FH = FR[3] / 100 * (1 - TF) * SH, slot = r => [-SW / 2 + (r[0] + r[2] / 2) / 100 * SW, SH / 2 - (TF + (1 - TF) * (r[1] + r[3] / 2) / 100) * SH];
  const flyTex = async () => { const im = await getImg('confirm'); if (!im) return; const [x, y, w, h] = FR, iw = im.naturalWidth, ih = im.naturalHeight, c = document.createElement('canvas'); c.width = Math.round(w / 100 * iw); c.height = Math.round(h / 100 * ih); c.getContext('2d').drawImage(im, x / 100 * iw, y / 100 * ih, w / 100 * iw, h / 100 * ih, 0, 0, c.width, c.height); flyMat.map?.dispose(); flyMat.map = new THREE.CanvasTexture(c); flyMat.map.colorSpace = THREE.SRGBColorSpace; flyMat.needsUpdate = true; };
  flyTex(); document.addEventListener('portfolio:language', flyTex);

  // ---------- stations along the page ----------
  const docY = e => e.getBoundingClientRect().top + scrollY;
  let keys = [], heroEnd = 0;
  function build() {
    const vh = innerHeight, m = isMobile(), S = [];
    let tc = 0, to = 0, last = null;
    const push = (at, st) => {
      // spin a full turn when the phone changes role, side or kind of place, like the objects in Silencio
      if (last && !last.travel) {
        const sideOf = q => q.x < .5 ? -1 : 1;
        const swap = st.fg !== last.fg && st.fg && last.fg;
        if (st.spin) { tc += st.spin.c || 0; to += st.spin.o || 0; }
        else if (swap || st.kind !== last.kind) { tc += sideOf(st.c) >= sideOf(last.c) ? 1 : -1; to += sideOf(st.o) >= sideOf(last.o) ? -1 : 1; }
        else if (sideOf(st.c) !== sideOf(last.c)) { tc += sideOf(st.c) > sideOf(last.c) ? 1 : -1; to += sideOf(st.o) > sideOf(last.o) ? 1 : -1; }
      }
      st.c = { ...st.c, ry: st.c.ry + tc * TAU }; st.o = { ...st.o, ry: st.o.ry + to * TAU };
      if (S.length && at <= S[S.length - 1].at + 4) at = S[S.length - 1].at + 4;
      st.at = at; S.push(st); last = st;
    };
    let cf = 'book', of = 'schedule';
    const hidden = (dir = 1) => ({ c: P7([.3, dir > 0 ? 1.6 : -.6, .5, .2, .6, .1, -1]), o: P7([.7, dir > 0 ? 1.7 : -.7, .5, .2, -.6, -.1, -1]) });
    // the opening: the stage's customer phone IS the opening phone (desktop), then flies down into the story
    const op = document.querySelector('[data-opening]'), heroEl = document.querySelector('.op-phone');
    heroEnd = op ? docY(op) + op.offsetHeight : 0;
    if (!m && heroEl && op) {
      const r = heroEl.getBoundingClientRect(), hy = r.top + scrollY, x0 = (r.left + r.width / 2) / innerWidth, y0 = (hy + r.height / 2 - scrollY * 0) / vh;
      const s0 = Math.min(.95, r.height * .69 / vh), opH = op.offsetHeight;
      const first = (heroEl.dataset.screens || '').split(',')[0].match(/([\w-]+)\.webp/); if (first) cf = first[1];
      push(vh * .5, { kind: 'hero', c: P7([x0, y0, s0, -.06, -.45, 0, 0]), o: P7([x0 + .04, y0 + 1.1, s0 * .8, .2, -.8, 0, -2]), cf, of, fg: 'c', front: true });
      push(vh * .5 + opH * .5, { kind: 'hero', c: P7([x0, y0 - opH * .5 / vh * .55, s0 * .96, -.02, -.3, 0, 0]), o: P7([x0 + .04, y0 + 1.1, s0 * .8, .2, -.8, 0, -2]), cf, of, fg: 'c', front: true });
    } else push(0, { kind: 'off', ...hidden(1), cf, of });
    const els = [...root.querySelectorAll('.bk-moment, .v3-product-section.ux-section, .bk-step, .xp')];
    let story = false;
    for (const e of els) {
      const top = docY(e), h = e.offsetHeight;
      if (e.matches('.bk-step')) {
        const i = +e.dataset.i, s = STEPS[i], L = m ? s.m : s.d;
        if (!story && m) push(top - vh * .45, { kind: 'off', ...hidden(1), cf, of });
        story = true; cf = s.c; of = s.o;
        push(top + h * .5 - (m ? 0 : 0), { kind: 'story', c: P7(L.c), o: P7(L.o), cf, of, fg: s.fg || null, spot: s.spot || null, travel: s.travel, spin: s.spin, step: i });
        continue;
      }
      if (story && m) { push(top - vh * .2, { kind: 'off', ...hidden(-1), cf, of }); story = false; }
      if (m) continue; // on phones the text gets the whole width: the 3D story lives in its own steps
      story = false;
      if (e.matches('.bk-moment')) {
        push(top + h * .5, { kind: 'moment', c: P7([.15, .56, .5, .05, .55, -.05, 0]), o: P7([.85, .56, .5, .05, -.55, .05, 0]), cf, of, fg: null });
        continue;
      }
      if (e.matches('.xp')) {
        const off = { c: P7([-.3, .5, .5, .1, 1.2, 0, -1]), o: P7([1.3, .5, .5, .1, -1.2, 0, -1]) };
        push(top - vh * .1, { kind: 'off', ...off, cf, of }); push(top + h - vh * .4, { kind: 'off', ...off, cf, of });
        continue;
      }
      const side = SIDE[e.id]; if (!side) continue;
      const beats = BEATS.map(([sel, file, label]) => ({ el: document.querySelector(sel), file, label })).filter(b => b.el && e.contains(b.el));
      if (!beats.length) beats.push({ el: e, file: cf, label: null });
      beats.sort((a, b) => docY(a.el) - docY(b.el));
      beats.forEach((b, j) => {
        const who = b.label ? (/Owner|店主/.test(b.label[0]) ? 'o' : 'c') : 'c';
        if (who === 'c') cf = b.file; else of = b.file;
        const R = side === 'right', X = R ? .84 : .16;
        const fg = P7([X, .53, .62, .04, R ? -.3 : .3, 0, 0]);
        const bg = P7([R ? .93 : .07, .27, .34, .12, R ? -.95 : .95, R ? .14 : -.14, -2.2]);
        const at = j === 0 ? top + vh * .1 : Math.max(docY(b.el) - vh * .05, top + vh * .1);
        push(at, { kind: 'section', c: who === 'c' ? fg : bg, o: who === 'c' ? bg : fg, cf, of, fg: who, spot: SPOT[b.file] || [2, 20, 96, 30], label: b.label });
      });
    }
    const end = els.length ? docY(els[els.length - 1]) + els[els.length - 1].offsetHeight : document.documentElement.scrollHeight;
    if (!m || story) push(m ? end : end + vh * .2, { kind: 'off', ...hidden(-1), cf, of });
    // keys: hold each station, then fly to the next one within the last part of the gap
    const K = [];
    S.forEach((st, i) => {
      const nx = S[i + 1]; K.push({ at: st.at, st });
      if (nx) { const T = Math.min(vh * (m ? .55 : .8), (nx.at - st.at) * .55); K.push({ at: nx.at - T, st }); }
    });
    keys = K;
  }

  // ---------- pointing at text ----------
  let hover = null, peek = null, peekAmt = 0, peekY = 0;
  HOVER.forEach(([sel, list]) => root.querySelectorAll(sel).forEach((el, i) => {
    const file = list[i % list.length]; el.classList.add('bk-points');
    if (canHover) {
      el.addEventListener('pointerenter', () => { hover = { file, rect: SPOT[file] || [2, 20, 96, 30], el }; el.classList.add('is-pointed'); });
      el.addEventListener('pointerleave', () => { if (hover?.el === el) hover = null; el.classList.remove('is-pointed'); });
    } else {
      el.addEventListener('click', () => { const r = el.getBoundingClientRect(); peek = { file, rect: SPOT[file] || [2, 20, 96, 30], who: OWNER.has(file) ? 'o' : 'c', y: (r.top + r.height / 2) > innerHeight * .5 ? .3 : .7, sy: scrollY, t: performance.now() }; });
    }
  }));
  root.querySelectorAll('#structure [data-screen]').forEach(b => {
    if (canHover) { b.addEventListener('pointerenter', () => { hover = { file: b.dataset.screen, rect: null, el: b }; }); b.addEventListener('pointerleave', () => { if (hover?.el === b) hover = null; }); }
    else b.addEventListener('click', () => { peek = { file: b.dataset.screen, rect: null, who: OWNER.has(b.dataset.screen) ? 'o' : 'c', y: .32, sy: scrollY, t: performance.now() }; });
  });

  // a tap anywhere else closes the preview
  if (!canHover) document.addEventListener('click', e => { if (peek && !e.target.closest('.bk-points, #structure [data-screen]')) peek = null; });
  // ---------- the loop ----------
  let vw = 0, vh = 0, mx = 0, my = 0, sy = scrollY, last = performance.now(), t0 = last;
  const resize = () => { vw = innerWidth; vh = innerHeight; renderer.setPixelRatio(Math.min(vw < 1000 ? 1.5 : 2, devicePixelRatio || 1)); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix(); build(); };
  addEventListener('resize', resize); resize(); setInterval(build, 1600);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  document.addEventListener('portfolio:language', () => { P.c.file = P.o.file = ''; P.c.spotKey = P.o.spotKey = ''; });
  const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), va = new THREE.Vector3(), vb = new THREE.Vector3();
  // screen fraction → world position at a given depth
  const place = (p, q) => {
    const z = q.z, h = 2 * (D - z) * TAN, w = h * cam.aspect;
    p.g.position.set((q.x - .5) * w + cam.position.x * (-z / D), (.5 - q.y) * h + cam.position.y * (-z / D), z);
    p.g.scale.setScalar(q.s * h / 1.62);
    p.g.rotation.set(q.rx, q.ry, q.rz);
  };
  const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t), rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t), rz: lerp(a.rz, b.rz, t), z: lerp(a.z, b.z, t) });
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || !keys.length) return;
    const dt = Math.min(.08, (now - last) / 1000); last = now; const E = r => 1 - Math.exp(-dt * r);
    // follow the scroll with a short smoothing (frame-rate independent); jump when far away (links, reloads)
    if (Math.abs(scrollY - sy) > vh * 2.5) sy = scrollY; sy += (scrollY - sy) * E(7.5);
    const y = sy + vh * .5, vel = clamp((scrollY - sy) / vh, -.6, .6);
    let a = keys[0], b = keys[0], t = 0;
    if (y >= keys[keys.length - 1].at) a = b = keys[keys.length - 1];
    else if (y > keys[0].at) for (let i = 0; i < keys.length - 1; i++) if (y < keys[i + 1].at) { a = keys[i]; b = keys[i + 1]; t = (y - a.at) / Math.max(1, b.at - a.at); break; }
    const e = a.st === b.st ? 0 : ease(t), st = e < .5 ? a.st : b.st, hold = e < .04 || e > .96; // "hold": the phone is (nearly) at rest
    const time = (now - t0) / 1000;
    // the screens follow the station; the change happens mid-flight (behind the spin when there is one)
    const m = isMobile();
    if (peek) { if (Math.abs(scrollY - peek.sy) > 160 || now - peek.t > 6000) peek = null; }
    const pk = peek && m ? peek : null; peekAmt += ((pk ? 1 : 0) - peekAmt) * E(pk ? 5 : 7); if (pk) peekY = pk.y;
    const hv = !m && hover && st.fg ? hover : null;
    for (const k of ['c', 'o']) {
      const p = P[k];
      const isFg = st.fg === k;
      let file = k === 'c' ? st.cf : st.of, rect = isFg && hold ? st.spot : null;
      if (hv && isFg) { file = hv.file; rect = hv.rect; }
      if (pk && pk.who === k) { file = pk.file; rect = peekAmt > .7 ? pk.rect : null; }
      show(p, file);
      if (p.fade < 1) { p.fade = Math.min(1, p.fade + dt / .35); draw(p); }
      setSpot(p, rect);
      const liftWant = rect && p.rect && !(a.st.travel && a.st !== b.st && e > .001 && k === 'c') ? 1 : 0;
      p.amt += (liftWant - p.amt) * E(liftWant ? 4.5 : 8);
      p.focus += ((hv && isFg ? 1 : 0) - p.focus) * E(5);
      // pose: station → station, plus hover focus, float and a lean from scroll speed
      let q = mix(a.st[k], b.st[k], e);
      if (p.focus > .001) q = { ...q, s: q.s * (1 + .14 * p.focus), ry: q.ry - (q.ry - Math.round(q.ry / TAU) * TAU) * .75 * p.focus, rx: q.rx * (1 - .7 * p.focus), z: q.z + .5 * p.focus };
      if (peekAmt > .001 && pk && pk.who === k) q = mix(q, { x: .5, y: peekY, s: .42, rx: .02, ry: Math.round(q.ry / TAU) * TAU, rz: 0, z: .3 }, ease(peekAmt));
      const ph = k === 'c' ? 0 : 1.7, calm = 1 - p.focus * .7;
      q = { ...q, y: q.y + Math.sin(time * 1.05 + ph) * .006 * calm, rx: q.rx + Math.sin(time * .7 + ph) * .035 * calm + vel * .5, ry: q.ry + Math.sin(time * .5 + ph) * .05 * calm, rz: q.rz + Math.sin(time * .43 + ph) * .02 * calm - vel * (k === 'c' ? .35 : -.35) };
      place(p, q);
      // the lifted part: rises out of the screen with a glow; the rest of the screen dims and the slot goes dark
      const L = p.amt, on = L > .005;
      p.lift.visible = p.hole.visible = p.dim.visible = on;
      if (on) {
        p.card.material.opacity = clamp(L * 3); p.glow.material.opacity = clamp(L * 2) * .85; p.hole.material.opacity = L * .85; p.dim.material.opacity = L * .42;
        p.lift.position.z = .058 + ease(clamp(L)) * .2; p.lift.scale.setScalar(1 + L * .05);
      }
    }
    // the booking card flies from her phone into the owner's diary (story step "one check" → "lands in her diary")
    const flying = a.st.travel && a.st !== b.st && e > .001 && e < .999 && flyMat.map;
    fly.visible = !!flying;
    if (flying) {
      const k = e, c = P.c, o = P.o, [ax, ay] = slot(FR), [bx, by] = slot(SPOT.schedule);
      va.set(ax, ay, .26); c.g.localToWorld(va); vb.set(bx, by, .26); o.g.localToWorld(vb);
      fly.position.copy(va).lerp(vb, k); fly.position.y += Math.sin(k * Math.PI) * .45; fly.position.z += Math.sin(k * Math.PI) * 1.1;
      c.g.getWorldQuaternion(qa); o.g.getWorldQuaternion(qb); fly.quaternion.copy(qa).slerp(qb, k); fly.rotateZ(Math.sin(k * Math.PI) * .22);
      const sc = lerp(c.g.scale.x, o.g.scale.x, k) * (1 + Math.sin(k * Math.PI) * .3);
      flyCard.scale.set(FW * sc, FH * sc, 1); flyGlow.scale.set((FW + .03) * sc, (FH + .03) * sc, 1);
      flyMat.opacity = 1; flyGlowMat.opacity = .85;
    }
    // camera: a slight drift with the pointer, more depth while the page moves
    cam.position.x += (mx * .22 - cam.position.x) * E(3); cam.position.y += (-my * .14 - cam.position.y) * E(3);
    cam.lookAt(0, 0, 0);
    // the canvas comes in front of the dark opening and of a tapped preview; otherwise it stays behind the text
    cv.classList.toggle('is-front', (!m && sy < heroEnd - vh * .35) || peekAmt > .03);
    document.body.classList.toggle('bk-hero-handover', !m);
    // a small name tag under the phone that is talking
    const fgK = pk ? pk.who : st.fg, lab = st.label && !pk ? st.label[zh() ? 1 : 0] : '';
    if (!m && fgK && lab && hold) {
      tmpV.set(0, -.92, 0); P[fgK].g.localToWorld(tmpV); tmpV.project(cam);
      tag.style.transform = `translate3d(${((tmpV.x + 1) / 2 * vw).toFixed(1)}px,${((1 - tmpV.y) / 2 * vh + 14).toFixed(1)}px,0) translateX(-50%)`;
      if (tagTxt.textContent !== lab) { tagTxt.textContent = lab; tag.dataset.who = fgK === 'o' ? 'owner' : 'customer'; }
      tag.classList.toggle('is-on', !hv);
    } else tag.classList.remove('is-on');
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
  return true;
}

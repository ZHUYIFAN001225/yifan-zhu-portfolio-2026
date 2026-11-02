// Glasgow Salon Booking — the "desk" opening. One camera, one counter, one phone; the story in five moves.
//   1  The salon's reception counter from above: the paper appointment book (the old way), the phone buzzing with
//      WeChat messages (the problem), scissors, clippers, comb, pencil. The title sits over it like a product page.
//   2  Scroll: the copy blurs away, the room goes dark, the phone rises alone into a warm light with two huge words
//      behind it — ONE SHARED / DIARY.
//   3  Feature: the counter at night, lit only by the phone. A scale on the right runs through the three services;
//      the screen shows the times that still fit each one.
//   4  Feature: back to the top view, dark, with drafting guides around the paper book — the booking that moved,
//      and nothing deleted.
//   5  Record: the phone turns slowly in the centre; the three rules on the left, real screens on the right.
// Then it lets go and the case continues on paper.
import * as THREE from '../assets/v3/lib/three/three.module.min.js';
import { RoomEnvironment } from '../assets/v3/lib/three/RoomEnvironment.js';
import { buildPhone, paint, load, roundedRect, planeUV, SCREEN } from './phone3d.mjs';
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => sm((p - a) / (b - a));
const seed = s => { let t = (s * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
const HAND = '"Segoe Print","Bradley Hand","Comic Sans MS","Noto Sans CJK SC",cursive';

const T = {
  tag: ['MADE FOR ONE OWNER. BUILT FOR HER WHOLE DAY.', '为一位店主而做。为她的一整天而建。'],
  t1: ['GLASGOW', '格拉斯哥'], t2: ['SALON', '理发店'], t3: ['BOOKING', '预约系统'],
  copy: ['Customers book themselves. The owner sees her whole day. Nobody is deleted when plans change.', '顾客自己预约，店主一眼看完一天，计划变了也没有人被删掉。'],
  ck: ['DESIGNED AND BUILT FOR A ONE-CHAIR SALON IN GLASGOW.', '为格拉斯哥一家只有一把椅子的理发店设计并实现。'],
  cd: ['The smallest booking system that still has rules.', '最小的预约系统，但规则一条不少。'],
  live: ['Live since 21 Oct 2026 ↗', '2026 年 10 月 21 日上线 ↗'], scroll: ['SCROLL TO CONTINUE', '向下滚动'],
  // 2 — the phone alone
  p1: ['One shared', '一本共享的'], p2: ['diary', '预约本'], p3: ['GLASGOW SALON BOOKING · v1', '格拉斯哥理发店预约 · v1'],
  pp: ['The paper book, the WeChat messages and the missed calls — folded into one screen both sides can trust.', '那本纸质预约本、微信里的消息和没接到的电话——折进一块两边都信得过的屏幕里。'],
  pq: ['* Every screen here is the real product.', '* 这里的每一屏都是真实产品。'],
  // 3 — fits
  a_k: ['ONLY TIMES THAT FIT', '只给放得下的时间'],
  a_p: ['Pick the service first. Its length decides which times are offered — a colour never gets squeezed into a 30-minute gap.', '先选服务。时长决定给出哪些时间——染发永远不会被塞进 30 分钟的空档。'],
  a_big1: ['NO IMPOSSIBLE', '没有一个'], a_big2: ['BOOKINGS', '排不下的预约'],
  a_s: [['COLOUR & BLEACH', '染发漂发'], ['LONG HAIRCUT', '长发剪发'], ['SHORT HAIRCUT', '短发剪发']], a_d: ['180′', '60′', '30′'],
  a_f: ['SLOT FIT MODEL (SFM)', '时段匹配模型'], a_f2: ['A visualization, not a warranty', '示意，不是承诺'],
  // 4 — moved, not lost
  b_k: ['MOVED, NEVER DELETED', '只会挪动，不会删除'],
  b_p: ['When she closes a few hours, the bookings inside them are lifted out and parked, not erased. Every customer keeps a place.', '她临时关掉几个小时，里面的预约会被整个抬出来放在一边，而不是被抹掉。每位顾客都还有位置。'],
  b_big1: ['NOW 0 BOOKINGS', '现在 0 个预约'], b_big2: ['LOST', '丢失'],
  b_f: ['RE-SLOTTING (circle = kept)', '重新排位（圈住 = 保留）'], b_f2: ['move(t) → t′, never delete(t)', 'move(t) → t′，而不是 delete(t)'],
  // 5 — record
  c_k: ['RULES & RECORD', '规则与记录'], c_m: ['LIVE SINCE 21 OCT 2026', '2026 年 10 月 21 日上线'], c_r: ['REAL SCREENS', '真实界面'],
  c: [
    [['RULE 01', '规则 01'], ['“Service first, then time. The length is the rule, not the customer’s guess.”', '“先选服务，再选时间。时长说了算，不靠顾客猜。”'], ['Customer side · booking flow', '顾客端 · 预约流程']],
    [['RULE 02', '规则 02'], ['“Only days the shop is open, only times the service fits.”', '“只显示开门的日子，只给放得下的时间。”'], ['Customer side · calendar', '顾客端 · 日历']],
    [['RULE 03', '规则 03'], ['“Closing hours moves bookings to a parking list. Nobody is deleted.”', '“临时关店会把预约移到待处理列表，没有人被删掉。”'], ['Owner side · time off', '店主端 · 临时关店']]
  ],
  shots: [['Book', '预约'], ['Today', '今天'], ['Time off', '临时关店']],
  try: ['Try the demo ↓', '试用演示版 ↓'],
  wx: [['Emma', 'Emma'], ['Running 20 min late, sorry!!', '我要晚 20 分钟，不好意思！！'], ['Mrs Li', '李阿姨'], ['Can I move to 3 o’clock?', '能改到三点吗？'], ['Zhou', '周先生'], ['Are you open Sunday?', '周日开门吗？'], ['Mr He', '何先生'], ['What time was I booked again?', '我约的是几点来着？'], ['+44 7700 900…', '+44 7700 900…'], ['Missed call', '未接来电'], ['Sun', '孙小姐'], ['Still have 11:30?', '11:30 还有吗？']],
  now: ['now', '现在'], wxk: ['WeChat', '微信']
};
export const CHARS = () => [...Object.values(T).flat(3)].join('') + '0123456789:′→✗✆';

export function mountDesk(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-dk')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 };
  document.documentElement.dataset.cover = 'desk';
  if (!document.querySelector('link[data-inter-tight]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.interTight = ''; l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&display=swap'; document.head.append(l); }
  const liveA = op.querySelector('.op-actions a[target]');
  const shotSrc = n => `assets/v3/screens/booking/${zh() ? 'zh/' : ''}${n}.webp`;

  // ---------- DOM ----------
  const ov = document.createElement('div'); ov.className = 'bk-dk';
  ov.innerHTML = `<canvas class="bk-dk-gl" aria-hidden="true"></canvas><div class="bk-dk-glow" aria-hidden="true"></div><div class="bk-dk-grain" aria-hidden="true"></div>
    <div class="bk-dk-hero"><p class="bk-dk-tag"></p><h1 class="bk-dk-h"><b class="t1"></b><b class="t2"></b><b class="t3"></b></h1><p class="bk-dk-copy"></p>
      <div class="bk-dk-card"><p class="bk-dk-ck"></p><hr><p class="bk-dk-cd"></p><a class="bk-dk-live" target="_blank" rel="noopener"></a></div>
      <p class="bk-dk-scroll"><i></i><span></span></p></div>
    <div class="bk-dk-pw"><h2 class="bk-dk-pw-h"><b class="p1"></b><b class="p2"></b></h2><p class="bk-dk-pw-k"></p><p class="bk-dk-pw-p"></p><p class="bk-dk-pw-q"></p></div>
    <aside class="bk-dk-panel" data-f="a"><i class="bk-dk-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></i><h3></h3><p></p><hr><p class="bk-dk-big"><b></b><b></b></p></aside>
    <aside class="bk-dk-panel" data-f="b"><i class="bk-dk-ic"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 3v4M16 3v4M4 10h16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></i><h3></h3><p></p><hr><p class="bk-dk-big"><b></b><b></b></p></aside>
    <div class="bk-dk-scale" aria-hidden="true"><i class="bk-dk-bar"><b></b></i><span class="s0"><b></b><em></em></span><span class="s1"><b></b><em></em></span><span class="s2"><b></b><em></em></span></div>
    <p class="bk-dk-formula" data-f="a"><span class="f1"></span><span class="f2"></span><code>fit(t) = free(t … t + d)</code></p>
    <p class="bk-dk-formula" data-f="b"><span class="f1"></span><span class="f2"></span><code>move(t) → t′</code></p>
    <svg class="bk-dk-guides" aria-hidden="true"><g class="g1"><rect/><circle/><circle/><circle/><circle/></g><g class="g2"><rect/><circle/><circle/><circle/><circle/></g><path class="arrow"/></svg>
    <section class="bk-dk-rec"><header><span class="rk"></span><span class="rm"></span><span class="rr"></span></header><ol class="bk-dk-rules"></ol><div class="bk-dk-shots"></div><a class="bk-dk-try" href="#interactive-demo"></a></section>`;
  op.append(ov);
  const $ = s => ov.querySelector(s), $$ = s => [...ov.querySelectorAll(s)];
  const text = () => {
    $('.bk-dk-tag').textContent = L(T.tag); $('.t1').textContent = L(T.t1); $('.t2').textContent = L(T.t2); $('.t3').textContent = L(T.t3);
    $('.bk-dk-copy').textContent = L(T.copy); $('.bk-dk-ck').textContent = L(T.ck); $('.bk-dk-cd').textContent = L(T.cd); $('.bk-dk-scroll span').textContent = L(T.scroll);
    const lv = $('.bk-dk-live'); if (liveA) { lv.textContent = L(T.live); lv.href = zh() ? (liveA.dataset.hrefZh || liveA.href) : liveA.href; } else lv.remove();
    $('.p1').textContent = L(T.p1); $('.p2').textContent = L(T.p2); $('.bk-dk-pw-k').textContent = L(T.p3); $('.bk-dk-pw-p').textContent = L(T.pp); $('.bk-dk-pw-q').textContent = L(T.pq);
    const pa = $('.bk-dk-panel[data-f="a"]'), pb = $('.bk-dk-panel[data-f="b"]');
    pa.querySelector('h3').textContent = L(T.a_k); pa.querySelector('p').textContent = L(T.a_p); pa.querySelectorAll('.bk-dk-big b')[0].textContent = L(T.a_big1); pa.querySelectorAll('.bk-dk-big b')[1].textContent = L(T.a_big2);
    pb.querySelector('h3').textContent = L(T.b_k); pb.querySelector('p').textContent = L(T.b_p); pb.querySelectorAll('.bk-dk-big b')[0].textContent = L(T.b_big1); pb.querySelectorAll('.bk-dk-big b')[1].textContent = L(T.b_big2);
    T.a_s.forEach((s, i) => { const el = $(`.bk-dk-scale .s${i}`); el.querySelector('b').textContent = L(s); el.querySelector('em').textContent = T.a_d[i]; });
    const fa = $('.bk-dk-formula[data-f="a"]'), fb = $('.bk-dk-formula[data-f="b"]');
    fa.querySelector('.f1').textContent = L(T.a_f); fa.querySelector('.f2').textContent = L(T.a_f2); fb.querySelector('.f1').textContent = L(T.b_f); fb.querySelector('.f2').textContent = L(T.b_f2);
    $('.rk').textContent = L(T.c_k); $('.rm').textContent = L(T.c_m); $('.rr').textContent = L(T.c_r);
    $('.bk-dk-rules').innerHTML = T.c.map(([k, q, w]) => `<li><small>${L(k)}</small><blockquote>${L(q)}</blockquote><span>${L(w)}</span></li>`).join('');
    $('.bk-dk-shots').innerHTML = ['book', 'today', 'time-off'].map((n, i) => `<figure><img src="${shotSrc(n)}" alt="" loading="lazy" decoding="async"><figcaption>${L(T.shots[i])}</figcaption></figure>`).join('');
    $('.bk-dk-try').textContent = L(T.try);
  };
  text(); document.addEventListener('portfolio:language', () => setTimeout(() => { text(); repaintProps(); screens.load(); }, 40));

  // ---------- GL ----------
  const cv = $('.bk-dk-gl'); let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { ov.classList.add('no-gl'); return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(34, 1, .1, 100); cam.up.set(0, 0, -1);
  const key = new THREE.DirectionalLight(0xffe2bd, 2.6); key.position.set(5, 11, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); key.shadow.bias = -.0005; key.shadow.radius = 4; scene.add(key);
  const fill = new THREE.HemisphereLight(0xf4f1ea, 0x3a2f24, .9); scene.add(fill);
  const rim = new THREE.SpotLight(0xffc98a, 0, 30, .6, .8, 1.2); rim.position.set(-4, 9, -5); scene.add(rim); rim.target.position.set(0, 6, 0); scene.add(rim.target);
  const night = new THREE.HemisphereLight(0x4a56c8, 0x1a0f26, 0); scene.add(night);
  const glow = new THREE.PointLight(0xffb36b, 0, 9, 1.6); glow.castShadow = true; glow.shadow.mapSize.set(1024, 1024); glow.shadow.bias = -.002; scene.add(glow);

  // ---------- drawn textures ----------
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const wood = ctex(1024, 1024, (x, w, h) => {
    const r = seed(7); x.fillStyle = '#b8895a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { const y = r() * h, a = .05 + r() * .2, k = r(); x.strokeStyle = `rgba(${k > .5 ? '95,58,28' : '228,196,150'},${a})`; x.lineWidth = .5 + r() * 3; x.beginPath(); x.moveTo(-20, y); for (let X = 0; X <= w + 40; X += 64) x.lineTo(X, y + Math.sin(X / 160 + i) * 7 * r()); x.stroke(); }
    for (let i = 0; i < 12000; i++) { x.fillStyle = `rgba(80,45,20,${r() * .09})`; x.fillRect(r() * w, r() * h, 1, 1 + r() * 3); }
    for (let i = 0; i < 5; i++) { const X = r() * w; x.fillStyle = 'rgba(70,40,18,.18)'; x.fillRect(X, 0, 2, h); }
  }); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 2);
  const times = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00'];
  const page = side => ctex(1024, 1400, (x, w, h) => {
    x.fillStyle = '#f7f2e6'; x.fillRect(0, 0, w, h); const r = seed(side === 'l' ? 11 : 12);
    for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(120,100,70,${r() * .05})`; x.fillRect(r() * w, r() * h, 1, 1); }
    x.fillStyle = '#17362b'; x.font = '700 46px "Inter Tight", Inter, system-ui, sans-serif'; x.fillText(side === 'l' ? (zh() ? '周四 5 日' : 'THURSDAY 5') : (zh() ? '周五 6 日' : 'FRIDAY 6'), 96, 120);
    const notes = side === 'l' ? { 1: ['Emma — colour', 'Emma 染发'], 3: ['Mrs Li  cut', '李阿姨 剪发'], 4: ['→ 3pm??', '→ 三点??'], 6: ['Zhou', '周先生'], 9: ['Ann ✗ cancelled', 'Ann ✗ 取消'], 10: ['walk-in?', '临时客?'], 12: ['Mrs Li', '李阿姨'], 14: ['Sun — Sunday?', '孙小姐 周日?'] } : { 2: ['Emma', 'Emma'], 5: ['He  10:30 → 11?', '何先生 10:30 → 11?'], 8: ['— — —', '— — —'], 11: ['colour 2h', '染发 2h'], 13: ['✆ ring back', '✆ 回电'] };
    times.forEach((t, i) => { const y = 190 + i * 68; x.strokeStyle = 'rgba(23,54,43,.4)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(80, y); x.lineTo(w - 80, y); x.stroke(); x.fillStyle = 'rgba(23,54,43,.6)'; x.font = '500 26px Inter, system-ui, sans-serif'; x.fillText(t, 96, y - 14);
      if (notes[i]) { x.save(); x.translate(230, y - 12); x.rotate((r() - .5) * .04); x.fillStyle = '#1d2f7a'; x.font = `italic 600 ${36 + r() * 6}px ${HAND}`; x.fillText(L(notes[i]), 0, 0); x.restore(); } });
    if (side === 'l') { x.strokeStyle = '#d9483c'; x.lineWidth = 4; x.beginPath(); x.moveTo(230, 190 + 3 * 68 - 22); x.lineTo(430, 190 + 3 * 68 - 30); x.stroke(); }
  });
  const note = () => ctex(512, 512, (x, w, h) => { x.fillStyle = '#ffe27a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, h - 40, w, 40); x.fillStyle = '#1f2a24'; x.font = `italic 500 58px ${HAND}`; x.fillText(zh() ? '李阿姨 3点?' : 'Mrs Li 3pm?', 50, 180); x.fillText(zh() ? '回电!!' : 'ring back!!', 50, 300); });

  // ---------- the counter ----------
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshStandardMaterial({ map: wood, roughness: .62, metalness: 0 })); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const propsG = new THREE.Group(); scene.add(propsG);
  const std = o => new THREE.MeshStandardMaterial(o);
  const shadowy = m => { m.castShadow = true; m.receiveShadow = true; return m; };
  // the paper book — the thing the whole case is about
  const paper = (side, x) => { const m = shadowy(new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.15), std({ map: page(side), roughness: .95 }))); m.rotation.x = -Math.PI / 2; m.position.set(x, .13, 0); return m; };
  const diary = new THREE.Group(); const pl = paper('l', -1.17), prg = paper('r', 1.17); diary.add(pl, prg);
  diary.add(shadowy(new THREE.Mesh(new THREE.BoxGeometry(4.85, .12, 3.35), std({ color: 0x17362b, roughness: .5 }))).translateY(.06));
  diary.add(new THREE.Mesh(new THREE.BoxGeometry(.06, .05, 3.2), std({ color: 0x0c1a14 })).translateY(.14));
  const ribbon = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.12, .01, 1.6), std({ color: 0xd9483c, roughness: .8 }))); ribbon.position.set(1.9, .15, 1.2); ribbon.rotation.y = .3; diary.add(ribbon);
  diary.position.set(-2.1, 0, .2); diary.rotation.y = .09; propsG.add(diary);
  // pencil with an eraser
  const pencil = new THREE.Group(); {
    const body = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, 3.2, 6), std({ color: 0xe8b134, roughness: .5 }))); body.rotation.z = Math.PI / 2;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.065, .36, 12), std({ color: 0xd9bf98, roughness: .8 })); tip.rotation.z = -Math.PI / 2; tip.position.x = 1.78;
    const lead = new THREE.Mesh(new THREE.ConeGeometry(.022, .12, 8), std({ color: 0x222222 })); lead.rotation.z = -Math.PI / 2; lead.position.x = 1.91;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .22, 12), std({ color: 0xc7c9cc, metalness: .8, roughness: .3 })); band.rotation.z = Math.PI / 2; band.position.x = -1.6;
    const eraser = new THREE.Mesh(new THREE.CylinderGeometry(.066, .066, .2, 12), std({ color: 0xe88a8a, roughness: .9 })); eraser.rotation.z = Math.PI / 2; eraser.position.x = -1.8;
    pencil.add(body, tip, lead, band, eraser); pencil.position.set(-1.0, .07, -2.35); pencil.rotation.y = .2; propsG.add(pencil); }
  // scissors — two blades crossed, ring handles
  const scissors = new THREE.Group(); {
    const steel = std({ color: 0xcfd3d8, metalness: 1, roughness: .22 });
    const half = sgn => { const g = new THREE.Group(); const blade = shadowy(new THREE.Mesh(new THREE.BoxGeometry(1.7, .035, .13), steel)); blade.position.x = .95; blade.scale.z = 1; const shank = new THREE.Mesh(new THREE.BoxGeometry(.9, .035, .09), steel); shank.position.x = -.5; const ring = shadowy(new THREE.Mesh(new THREE.TorusGeometry(.19, .035, 10, 32), steel)); ring.rotation.x = Math.PI / 2; ring.position.set(-1.1, 0, sgn * .12); g.add(blade, shank, ring); g.rotation.y = sgn * .16; return g; };
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .09, 16), steel);
    scissors.add(half(1), half(-1), screw); scissors.position.set(3.6, .06, 2.7); scissors.rotation.y = -.5; propsG.add(scissors); }
  // hair clippers
  const clippers = new THREE.Group(); {
    const body = shadowy(new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(.62, 1.7, .18), { depth: .34, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 4 }), std({ color: 0x1b1d20, roughness: .45, metalness: .2 }))); body.rotation.x = -Math.PI / 2; body.position.y = .04;
    const head = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.66, .14, .3), std({ color: 0xb8bcc4, metalness: 1, roughness: .25 }))); head.position.set(0, .12, -1.0);
    for (let i = 0; i < 14; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(.026, .05, .14), std({ color: 0xdfe3e8, metalness: 1, roughness: .2 })); t.position.set(-.3 + i * .046, .2, -1.1); clippers.add(t); }
    const sw = new THREE.Mesh(new THREE.BoxGeometry(.12, .03, .34), std({ color: 0xd9483c, roughness: .5 })); sw.position.set(0, .43, .15);
    const cord = new THREE.Mesh(new THREE.TorusGeometry(.9, .025, 8, 60, Math.PI * .9), std({ color: 0x111214, roughness: .6 })); cord.rotation.x = -Math.PI / 2; cord.position.set(.4, .02, 1.6); cord.rotation.z = .3;
    clippers.add(body, head, sw, cord); clippers.position.set(4.6, 0, -.3); clippers.rotation.y = .95; propsG.add(clippers); }
  // comb
  const comb = new THREE.Group(); { const m = std({ color: 0x101416, roughness: .35, metalness: .1 }); const back = shadowy(new THREE.Mesh(new THREE.BoxGeometry(2.4, .05, .22), m)); back.position.z = -.1; comb.add(back);
    for (let i = 0; i < 34; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(.028, .045, .38), m); t.position.set(-1.14 + i * .069, 0, .2); comb.add(t); }
    comb.position.set(-2.4, .05, 2.75); comb.rotation.y = .08; propsG.add(comb); }
  // sticky note, hair clip, a couple of pins
  const sticky = shadowy(new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), std({ map: note(), roughness: .95 }))); sticky.rotation.set(-Math.PI / 2, 0, -.22); sticky.position.set(-4.6, .04, -1.55); propsG.add(sticky);
  const clip = (x, z, r) => { const m = new THREE.Mesh(new THREE.TorusGeometry(.14, .018, 8, 24, Math.PI * 1.7), std({ color: 0xb8bcc2, metalness: .9, roughness: .25 })); m.rotation.set(-Math.PI / 2, 0, r); m.position.set(x, .03, z); propsG.add(m); };
  clip(-5.4, 2.6, .4); clip(-5.2, 2.95, 1.9);
  const hclip = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.9, .06, .09), std({ color: 0x17362b, roughness: .4 }))); hclip.rotation.y = -.4; hclip.position.set(1.0, .03, 2.9); propsG.add(hclip);
  const propMats = []; propsG.traverse(o => { if (o.isMesh) propMats.push(o.material); });
  function repaintProps() { pl.material.map?.dispose(); pl.material.map = page('l'); prg.material.map?.dispose(); prg.material.map = page('r'); sticky.material.map?.dispose(); sticky.material.map = note(); [pl, prg, sticky].forEach(m => { m.material.needsUpdate = true; }); }

  // ---------- the phone and its screen (with the messages that keep coming) ----------
  const SW = SCREEN.w, SH = SCREEN.h, sc = document.createElement('canvas'); sc.width = 780; sc.height = Math.round(780 * SH / SW); const sx = sc.getContext('2d');
  const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); phone.traverse(o => { if (o.isMesh) { o.castShadow = true; [].concat(o.material).forEach(m => { if (m.isMeshStandardMaterial) { m.envMap = envTex; m.envMapIntensity = 1; m.needsUpdate = true; } }); } });
  const flat = new THREE.Group(); flat.rotation.x = -Math.PI / 2; flat.add(phone);
  const pv = new THREE.Group(); pv.add(flat); scene.add(pv);
  const SPOT = new THREE.Vector3(1.75, .09, .55), SPOT_ROT = -.12, HERO_SCALE = 1.75;
  const screens = { imgs: {}, cur: 'cover-book', prev: null, fade: 1, async load() { for (const n of ['cover-book', 'book', 'window', 'zoom-durations', 'today']) this.imgs[n] = await load(shotSrc(n)); dirty = true; } };
  screens.load();
  const banners = []; let lastBanner = 0, dirty = true;
  const wxList = () => { const o = []; for (let i = 0; i < T.wx.length; i += 2) o.push([L(T.wx[i]), L(T.wx[i + 1])]); return o; };
  function drawScreen(now, heroAmt) {
    const im = screens.imgs[screens.cur]; if (!im) return;
    paint(sx, im, true);
    if (screens.prev && screens.fade < 1) { sx.globalAlpha = 1 - screens.fade; paint(sx, screens.prev, true); sx.globalAlpha = 1; }
    // WeChat banners stacking from the top while the counter is in view
    const W = sc.width, top = Math.round(W * .118) + 10;
    banners.forEach((b, i) => {
      const age = (now - b.t) / 1000, kin = sm(age / .45), y = top + i * 118 - (1 - kin) * 60;
      sx.save(); sx.globalAlpha = kin * heroAmt; sx.shadowColor = 'rgba(0,0,0,.25)'; sx.shadowBlur = 18; sx.shadowOffsetY = 6;
      sx.fillStyle = 'rgba(248,247,243,.96)'; sx.beginPath(); sx.roundRect(22, y, W - 44, 104, 26); sx.fill(); sx.shadowColor = 'transparent';
      sx.fillStyle = '#2dc100'; sx.beginPath(); sx.roundRect(40, y + 20, 64, 64, 16); sx.fill();
      sx.fillStyle = '#fff'; sx.beginPath(); sx.ellipse(66, y + 48, 16, 13, 0, 0, Math.PI * 2); sx.fill(); sx.beginPath(); sx.ellipse(82, y + 58, 13, 11, 0, 0, Math.PI * 2); sx.fill();
      sx.fillStyle = '#6b6b70'; sx.font = `500 22px -apple-system, Inter, system-ui, sans-serif`; sx.textBaseline = 'alphabetic'; sx.fillText(L(T.wxk).toUpperCase(), 124, y + 36); sx.textAlign = 'right'; sx.fillText(L(T.now), W - 44, y + 36); sx.textAlign = 'left';
      sx.fillStyle = '#111'; sx.font = `600 28px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(b.who, 124, y + 66);
      sx.fillStyle = '#333'; sx.font = `400 26px -apple-system, Inter, system-ui, sans-serif`; sx.fillText(b.what, 124, y + 94); sx.restore();
    });
    tex.needsUpdate = true;
  }
  function tickBanners(now, hero) {
    if (hero < .5 || calm) { if (banners.length && hero < .5) { banners.length = 0; dirty = true; } return; }
    if (now - lastBanner > (banners.length ? 1700 : 900)) { const list = wxList(); const n = banners.length ? (banners[banners.length - 1].n + 1) % list.length : 0; banners.push({ who: list[n][0], what: list[n][1], t: now, n }); if (banners.length > 4) banners.shift(); lastBanner = now; buzz = now; }
    dirty = true; // banners animate in
  }
  let buzz = -1e9;
  const showScreen = n => { if (screens.cur === n || !screens.imgs[n]) return; screens.prev = screens.imgs[screens.cur]; screens.cur = n; screens.fade = 0; dirty = true; };

  // ---------- camera, pointer, scroll ----------
  let vw = 0, vh = 0; const resize = () => { vw = op.clientWidth; vh = op.clientHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  const P = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { if (!fine) return; const r = op.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * 2 - 1; P.ty = (e.clientY - r.top) / r.height * 2 - 1; }, { passive: true });
  const V = {
    hero: { pos: new THREE.Vector3(0, 13.2, 3.2), look: new THREE.Vector3(.2, 0, -.3) },
    dark: { pos: new THREE.Vector3(0, 12.2, .001), look: new THREE.Vector3(0, 0, 0) },
    night: { pos: new THREE.Vector3(3.4, 4.6, 7.4), look: new THREE.Vector3(.4, .2, -.2) },
    top: { pos: new THREE.Vector3(-1.6, 11.5, .6), look: new THREE.Vector3(-1.6, 0, .2) }
  };
  const look = new THREE.Vector3(), E = new THREE.Euler(), tmp = new THREE.Vector3();
  const mix = (a, b, t, out) => out.lerpVectors(a, b, t);
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3();
  const proj = (v, out) => { tmp.copy(v).project(cam); out.x = (tmp.x + 1) / 2 * vw; out.y = (1 - tmp.y) / 2 * vh; return out; };
  const guides = $('.bk-dk-guides'), gA = { x: 0, y: 0 }, gB = { x: 0, y: 0 };
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    const lag = 1 - Math.exp(-dt * 5); P.x += (P.tx - P.x) * lag; P.y += (P.ty - P.y) * lag;
    // ---- the timeline (fractions of the pinned scroll) ----
    const kText = seg(pr, 0, .07), kDark = seg(pr, .04, .16), kUp = seg(pr, .07, .2);           // 1 → 2
    const kPw = seg(pr, .17, .25) * (1 - seg(pr, .36, .41));                                     // the two big words
    const kDown = seg(pr, .38, .47);                                                               // 2 → 3 (back to the counter, at night)
    const kA = seg(pr, .45, .5) * (1 - seg(pr, .62, .66)), kScale = seg(pr, .48, .62);            // feature: fits
    const kTop = seg(pr, .63, .7);                                                                 // 3 → 4
    const kB = seg(pr, .68, .73) * (1 - seg(pr, .8, .84)), kGuide = seg(pr, .7, .78);              // feature: moved, not lost
    const kRise = seg(pr, .82, .9), kC = seg(pr, .86, .91) * (1 - seg(pr, .96, .99)), kTurn = clamp((pr - .86) / .14); // record
    const kOut = seg(pr, .95, 1);
    const heroAmt = 1 - kDark;
    // ---- camera ----
    mix(V.hero.pos, V.dark.pos, kUp, camPos); mix(V.hero.look, V.dark.look, kUp, camLook);
    mix(camPos, V.night.pos, kDown, camPos); mix(camLook, V.night.look, kDown, camLook);
    mix(camPos, V.top.pos, kTop, camPos); mix(camLook, V.top.look, kTop, camLook);
    mix(camPos, V.dark.pos, kRise, camPos); mix(camLook, V.dark.look, kRise, camLook);
    camPos.x += P.x * .5 * (1 - kUp * .6); camPos.z += P.y * .35 * (1 - kUp);
    cam.position.copy(camPos); cam.lookAt(camLook);
    // ---- lights: day → black → night (lit by the phone) → dark top view → black ----
    const nightAmt = kDown * (1 - kTop), dayAmt = (1 - kDark) ** 2;
    key.intensity = 2.6 * dayAmt; fill.intensity = .9 * dayAmt;
    night.intensity = .55 * nightAmt + .18 * kTop * (1 - kRise); glow.intensity = 14 * nightAmt + 3 * kTop * (1 - kRise);
    rim.intensity = (60 * kUp * (1 - kDown) + 26 * kRise) * (1 - kOut);
    desk.visible = propsG.visible = (dayAmt > .003 || nightAmt > .01 || kTop > .01) && kRise < .98;
    // ---- the phone ----
    const up = kUp * (1 - kDown) + kRise; // 0 on the counter, 1 alone in the dark
    const spotY = .09 + nightAmt * .02;
    pv.position.set(lerp(SPOT.x, 0, up), lerp(spotY, 7.0, up), lerp(SPOT.z, 0, up));
    pv.scale.setScalar(HERO_SCALE * (1 - up) + 1.45 * kUp * (1 - kDown) + 1.08 * kRise);
    const pwTurn = kUp * (1 - kDown) * (Math.sin(now / 2600) * .06 + P.y * .18), pwY = P.x * .22 * kUp * (1 - kDown);
    const turn = kTurn * Math.PI * 2;
    E.set(pwTurn + turn * kRise + (nightAmt > 0 ? -.08 * nightAmt : 0), SPOT_ROT * (1 - up) + pwY + kRise * P.x * .2, Math.sin(turn) * .3 * kRise, 'XYZ'); pv.rotation.copy(E);
    rim.target.position.copy(pv.position); glow.position.set(pv.position.x, 1.1, pv.position.z + .2);
    // buzz: a quick shiver when a message lands
    const bz = (now - buzz) / 1000; if (bz < .35 && heroAmt > .5) pv.position.x += Math.sin(bz * 90) * .012 * (1 - bz / .35);
    // ---- screens ----
    tickBanners(now, heroAmt);
    const svc = kA > 0 ? (kScale < .33 ? 'window' : kScale < .66 ? 'book' : 'zoom-durations') : (kTop > .3 || kRise > 0) ? 'today' : 'cover-book';
    if (kA > 0 || kTop > .3 || kRise > 0) showScreen(svc); else showScreen('cover-book');
    if (screens.fade < 1) { screens.fade = Math.min(1, screens.fade + dt * 3); dirty = true; }
    if (dirty) { drawScreen(now, heroAmt); dirty = banners.some(b => now - b.t < 600) || screens.fade < 1; }
    // ---- drafting guides over the paper book (feature 4) ----
    if (kB > .01) {
      diary.updateMatrixWorld();
      const a = proj(A.set(-1.35, .16, -.25).applyMatrix4(diary.matrixWorld), gA), b = proj(B.set(1.4, .16, .4).applyMatrix4(diary.matrixWorld), gB);
      const box = (g, c, w, h, k) => { const rr = g.querySelector('rect'); rr.setAttribute('x', c.x - w / 2); rr.setAttribute('y', c.y - h / 2); rr.setAttribute('width', w * k); rr.setAttribute('height', h * k); rr.setAttribute('x', c.x - w * k / 2); rr.setAttribute('y', c.y - h * k / 2);
        [...g.querySelectorAll('circle')].forEach((ci, i) => { ci.setAttribute('cx', c.x + (i % 2 ? 1 : -1) * w * k / 2); ci.setAttribute('cy', c.y + (i < 2 ? -1 : 1) * h * k / 2); ci.setAttribute('r', 4); }); };
      const u = Math.min(vw, vh) / 900;
      box(guides.querySelector('.g1'), a, 230 * u, 80 * u, sm(kGuide * 2)); box(guides.querySelector('.g2'), b, 230 * u, 80 * u, sm(kGuide * 2 - .6));
      const ar = guides.querySelector('.arrow'), mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 90 * u;
      ar.setAttribute('d', `M${a.x + 115 * u} ${a.y} Q ${mx} ${my} ${b.x - 115 * u} ${b.y}`); const len = 600 * u; ar.style.strokeDasharray = `${len}`; ar.style.strokeDashoffset = `${len * (1 - sm(kGuide * 1.6 - .5))}`;
    }
    renderer.render(scene, cam);
    const S = (k, v) => ov.style.setProperty(k, (+v).toFixed(3));
    S('--kText', kText); S('--kDark', kDark); S('--kUp', kUp); S('--kPw', kPw); S('--kA', kA); S('--kScale', kScale); S('--kB', kB); S('--kGuide', kGuide); S('--kC', kC); S('--kOut', kOut); S('--night', nightAmt); S('--kRise', kRise);
    ov.dataset.scale = kScale < .33 ? 0 : kScale < .66 ? 1 : 2;
  }
  requestAnimationFrame(frame);
}

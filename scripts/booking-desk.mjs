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
  ov.innerHTML = `<canvas class="bk-dk-gl" aria-hidden="true"></canvas><div class="bk-dk-glow" aria-hidden="true"></div><div class="bk-dk-grain" aria-hidden="true"></div><div class="bk-dk-top" aria-hidden="true"></div><div class="bk-dk-out" aria-hidden="true"></div>
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
  // late-afternoon window light: a warm key from low on the right (long shadows), a cool sky fill from the left
  const key = new THREE.DirectionalLight(0xffd9a8, 3.3); key.position.set(9, 8.5, 6.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); key.shadow.bias = -.0004; key.shadow.normalBias = .02; key.shadow.radius = 7; scene.add(key);
  const fill = new THREE.HemisphereLight(0xcfdcff, 0x5a3f28, .6); scene.add(fill);
  const cool = new THREE.DirectionalLight(0x9fb4ff, .55); cool.position.set(-7, 7, -5); scene.add(cool);
  // light through leaves: a slow dappled mask multiplied into every counter material, moving as if the tree outside were in a breeze
  const DAP = { uTime: { value: 0 }, uDap: { value: 1 } };
  const dapple = m => { m.onBeforeCompile = sh => { sh.uniforms.uTime = DAP.uTime; sh.uniforms.uDap = DAP.uDap;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vDp;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvDp = (modelMatrix * vec4(position, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vDp; uniform float uTime, uDap;
      float dh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float dn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(dh(i), dh(i + vec2(1, 0)), f.x), mix(dh(i + vec2(0, 1)), dh(i + vec2(1, 1)), f.x), f.y); }
      float dfbm(vec2 p){ float v = 0.0, a = .5; for (int i = 0; i < 4; i++){ v += a * dn(p); p = p * 2.03 + 7.1; a *= .5; } return v; }
      float dappleAt(vec3 w){ float t = uTime * .09; vec2 p = w.xz * .3 + vec2(t * .5, -t * .25); vec2 q = vec2(dfbm(p + vec2(0.0, t)), dfbm(p + vec2(5.2, 1.3 - t * .6)));
        float n = dfbm(p + 1.4 * q); float leaves = smoothstep(.3, .8, n);
        // sun through a window: wide soft diagonal bands that drift, with the leaf shadows faint inside them
        float d = (w.x * .8 + w.z * .6) * .55 + dfbm(w.xz * .12 + t * .2) * 1.6 + t * .15; float bands = .5 + .5 * sin(d); bands = smoothstep(.15, .95, bands);
        float windowGrad = .82 + .22 * smoothstep(-9.0, 7.0, w.x + w.z * .4); return (.72 + .26 * bands + .1 * leaves * bands) * windowGrad; }`)
      .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= mix(1.0, dappleAt(vDp), uDap);'); }; return m; };
  const rim = new THREE.SpotLight(0xffc98a, 0, 30, .6, .8, 1.2); rim.position.set(-4, 9, -5); scene.add(rim); rim.target.position.set(0, 6, 0); scene.add(rim.target);
  const night = new THREE.HemisphereLight(0x4a56c8, 0x1a0f26, 0); scene.add(night);
  // the desk lamp, top-left, for the evening: a warm pool over the book and the phone, the rest of the room blue-dark
  const lamp = new THREE.SpotLight(0xffc27a, 0, 26, .5, .7, 1.3); lamp.position.set(-6.5, 7.5, -4); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -.0006; lamp.shadow.normalBias = .02; lamp.shadow.radius = 5; scene.add(lamp); lamp.target.position.set(-.5, 0, .4); scene.add(lamp.target);
  const eveSky = new THREE.HemisphereLight(0x2a3a7a, 0x120c0a, 0); scene.add(eveSky);
  const glow = new THREE.PointLight(0xffb36b, 0, 9, 1.6); glow.castShadow = true; glow.shadow.mapSize.set(1024, 1024); glow.shadow.bias = -.002; scene.add(glow);

  // ---------- drawn textures ----------
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const woodCanvas = (() => { const c = document.createElement('canvas'); c.width = c.height = 2048; const x = c.getContext('2d'), w = 2048, h = 2048, r = seed(7);
    x.fillStyle = '#cfae7c'; x.fillRect(0, 0, w, h);
    for (let pl = 0; pl < 4; pl++) { const y0 = pl * h / 4, tone = ['#d4b483', '#c9a775', '#d8b98a', '#cdab79'][pl]; x.fillStyle = tone; x.fillRect(0, y0, w, h / 4);
      for (let i = 0; i < 150; i++) { const y = y0 + r() * h / 4, k = r(), a = .05 + r() * .18; x.strokeStyle = `rgba(${k > .55 ? '120,80,40' : '240,220,180'},${a})`; x.lineWidth = .6 + r() * 2.4; x.beginPath(); x.moveTo(-20, y); const ph = r() * 9; for (let X = 0; X <= w + 40; X += 48) x.lineTo(X, y + Math.sin(X / 230 + ph) * 9 + Math.sin(X / 61 + ph * 3) * 2); x.stroke(); }
      x.fillStyle = 'rgba(90,60,30,.4)'; x.fillRect(0, y0, w, 3); x.fillStyle = 'rgba(255,240,210,.18)'; x.fillRect(0, y0 + 3, w, 2); }
    for (let i = 0; i < 30000; i++) { x.fillStyle = `rgba(100,65,30,${r() * .1})`; x.fillRect(r() * w, r() * h, 1, 1 + r() * 4); }
    return c; })();
  const wood = new THREE.CanvasTexture(woodCanvas); wood.colorSpace = THREE.SRGBColorSpace; wood.anisotropy = 16; wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(1.6, 1.6);
  const woodBump = new THREE.CanvasTexture(woodCanvas); woodBump.wrapS = woodBump.wrapT = THREE.RepeatWrapping; woodBump.repeat.set(1.6, 1.6); woodBump.anisotropy = 16;
  // the self-healing cutting mat: deep green, fine 10 mm grid, bold 50 mm grid, rulers along the edges
  const MATW = 9.4, MATH = 6.5, matCanvas = (() => { const W = 3280, H = 2200, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), r = seed(3);
    x.fillStyle = '#226b53'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 60000; i++) { x.fillStyle = `rgba(${r() > .5 ? '255,255,255' : '0,20,10'},${r() * .06})`; x.fillRect(r() * W, r() * H, 1.5, 1.5); }
    const m = 150, g = 20 /* px per mm → 10 mm = 200 px? no: 1 unit = 100 px, 10 mm grid = 100 px */, cell = 100;
    x.strokeStyle = 'rgba(190,225,205,.28)'; x.lineWidth = 1.3;
    for (let X = m; X <= W - m; X += cell) { x.beginPath(); x.moveTo(X, m); x.lineTo(X, H - m); x.stroke(); }
    for (let Y = m; Y <= H - m; Y += cell) { x.beginPath(); x.moveTo(m, Y); x.lineTo(W - m, Y); x.stroke(); }
    x.strokeStyle = 'rgba(205,235,215,.6)'; x.lineWidth = 3;
    for (let X = m; X <= W - m; X += cell * 5) { x.beginPath(); x.moveTo(X, m); x.lineTo(X, H - m); x.stroke(); }
    for (let Y = m; Y <= H - m; Y += cell * 5) { x.beginPath(); x.moveTo(m, Y); x.lineTo(W - m, Y); x.stroke(); }
    x.strokeRect(m, m, W - 2 * m, H - 2 * m);
    x.fillStyle = 'rgba(215,240,225,.85)'; x.font = '600 30px Inter, system-ui, sans-serif'; x.textAlign = 'center';
    for (let X = m, n = 0; X <= W - m; X += cell, n++) { const big = n % 5 === 0; x.fillRect(X - 1.5, m - (big ? 34 : 18), 3, big ? 34 : 18); x.fillRect(X - 1.5, H - m, 3, big ? 34 : 18); if (big) { x.fillText(String(n * 10), X, m - 44); x.fillText(String(n * 10), X, H - m + 70); } }
    x.textAlign = 'right'; for (let Y = m, n = 0; Y <= H - m; Y += cell, n++) { const big = n % 5 === 0; x.fillRect(m - (big ? 34 : 18), Y - 1.5, big ? 34 : 18, 3); x.fillRect(W - m, Y - 1.5, big ? 34 : 18, 3); if (big && n) { x.fillText(String(n * 10), m - 44, Y + 10); x.textAlign = 'left'; x.fillText(String(n * 10), W - m + 44, Y + 10); x.textAlign = 'right'; } }
    x.textAlign = 'left'; x.fillStyle = 'rgba(215,240,225,.55)'; x.font = '700 34px "Inter Tight", Inter, system-ui, sans-serif'; x.fillText('A2  ·  SELF-HEALING  ·  GLASGOW SALON BOOKING', m + 20, H - 46);
    return c; })();
  const matTex = new THREE.CanvasTexture(matCanvas); matTex.colorSpace = THREE.SRGBColorSpace; matTex.anisotropy = 16;
  const times = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00'];
  const page = (side, ink = 0) => ctex(1024, 1400, (x, w, h) => {
    x.fillStyle = '#f7f2e6'; x.fillRect(0, 0, w, h); const r = seed(side === 'l' ? 11 : 12);
    for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(120,100,70,${r() * .05})`; x.fillRect(r() * w, r() * h, 1, 1); }
    x.fillStyle = '#17362b'; x.font = '700 46px "Inter Tight", Inter, system-ui, sans-serif'; x.fillText(side === 'l' ? (zh() ? '周四 5 日' : 'THURSDAY 5') : (zh() ? '周五 6 日' : 'FRIDAY 6'), 96, 120);
    const notes = side === 'l' ? { 1: ['Emma — colour', 'Emma 染发'], 3: ['Mrs Li  cut', '李阿姨 剪发'], 4: ['→ 3pm??', '→ 三点??'], 6: ['Zhou', '周先生'], 9: ['Ann ✗ cancelled', 'Ann ✗ 取消'], 10: ['walk-in?', '临时客?'], 12: ['Mrs Li', '李阿姨'], 14: ['Sun — Sunday?', '孙小姐 周日?'] } : { 2: ['Emma', 'Emma'], 5: ['He  10:30 → 11?', '何先生 10:30 → 11?'], 8: ['— — —', '— — —'], 11: ['colour 2h', '染发 2h'], 13: ['✆ ring back', '✆ 回电'] };
    times.forEach((t, i) => { const y = 190 + i * 68; x.strokeStyle = 'rgba(23,54,43,.4)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(80, y); x.lineTo(w - 80, y); x.stroke(); x.fillStyle = 'rgba(23,54,43,.6)'; x.font = '500 26px Inter, system-ui, sans-serif'; x.fillText(t, 96, y - 14);
      if (notes[i]) { x.save(); x.translate(230, y - 12); x.rotate((r() - .5) * .04); x.fillStyle = '#1d2f7a'; x.font = `italic 600 ${36 + r() * 6}px ${HAND}`; x.fillText(L(notes[i]), 0, 0); x.restore(); } });
    if (side === 'l') { x.strokeStyle = '#d9483c'; x.lineWidth = 4; x.beginPath(); x.moveTo(230, 190 + 3 * 68 - 22); x.lineTo(430, 190 + 3 * 68 - 30); x.stroke(); }
    // the evening: she sits down after closing and writes up the day — who didn't come, what moved, and tomorrow's list
    if (ink > 0) {
      const EV = side === 'l'
        ? [[6, 560, ['✗ didn’t come', '✗ 没来'], '#15171c'], [3, 560, ['→ Fri 11:00', '→ 周五 11:00'], '#15171c'], [12, 560, ['✓ came 3:10', '✓ 3:10 到'], '#15171c'], [16, 230, ['☎ 3 missed · ring Sun, He, Zhou', '☎ 3 个未接 · 回孙、何、周'], '#b3261e']]
        : [[0, 560, ['TOMORROW ↓', '明天 ↓'], '#15171c'], [1, 230, ['9:30 Emma? ring back', '9:30 Emma? 回电'], '#15171c'], [3, 230, ['11:00 He (moved)', '11:00 何先生（挪过来）'], '#15171c'], [6, 560, ['Zhou → 12:30?', '周先生 → 12:30?'], '#15171c'], [9, 230, ['2:00 colour — 2h!! block it', '2:00 染发 — 2 小时!! 留住'], '#15171c'], [12, 230, ['Sunday? ask everyone', '周日开不开? 问一圈'], '#15171c'], [15, 230, ['bed. 23:40', '睡觉。23:40'], '#6b6f7a']];
      EV.forEach((e, i) => { const k0 = i / EV.length, k1 = (i + 1) / EV.length; if (ink <= k0) return; const part = clamp((ink - k0) / (k1 - k0));
        const [row, X, txt, col] = e, y = 190 + row * 68 - 12; x.save(); x.beginPath(); x.rect(0, y - 50, X + part * 560, 70); x.clip(); x.translate(X, y); x.rotate((r() - .5) * .05); x.fillStyle = col; x.font = `italic 600 ${34 + r() * 5}px ${HAND}`; x.fillText(L(txt), 0, 0); x.restore(); });
    }
  });
  const note = () => ctex(512, 512, (x, w, h) => { x.fillStyle = '#ffe27a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, h - 40, w, 40); x.fillStyle = '#1f2a24'; x.font = `italic 500 58px ${HAND}`; x.fillText(zh() ? '李阿姨 3点?' : 'Mrs Li 3pm?', 50, 180); x.fillText(zh() ? '回电!!' : 'ring back!!', 50, 300); });

  // ---------- the counter ----------
  const SPOT = new THREE.Vector3(1.75, .09, .55), SPOT_ROT = -.12, HERO_SCALE = 1.75;
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), dapple(new THREE.MeshStandardMaterial({ map: wood, bumpMap: woodBump, bumpScale: .006, roughness: .55, metalness: 0 }))); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const mat = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(roundedRect(MATW, MATH, .35), 12)), dapple(new THREE.MeshStandardMaterial({ map: matTex, roughness: .86, metalness: 0 }))); mat.rotation.set(-Math.PI / 2, 0, .05); mat.position.set(1.3, .02, .3); mat.receiveShadow = true; mat.visible = new URLSearchParams(location.search).get('mat') !== '0'; scene.add(mat);
  const propsG = new THREE.Group(); scene.add(propsG);
  const std = o => dapple(new THREE.MeshStandardMaterial(o));
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
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .22, 12), dapple(new THREE.MeshPhysicalMaterial({ color: 0xc7c9cc, metalness: 1, roughness: .3, envMap: envTex, envMapIntensity: .4 }))); band.rotation.z = Math.PI / 2; band.position.x = -1.6;
    const eraser = new THREE.Mesh(new THREE.CylinderGeometry(.066, .066, .2, 12), std({ color: 0xe88a8a, roughness: .9 })); eraser.rotation.z = Math.PI / 2; eraser.position.x = -1.8;
    pencil.add(body, tip, lead, band, eraser); pencil.position.set(-1.0, .07, -2.35); pencil.rotation.y = .2; propsG.add(pencil); }
  // materials with a room to reflect: steel, chrome, glossy plastic
  const phys = o => dapple(new THREE.MeshPhysicalMaterial(o));
  const steel = phys({ color: 0xaab0b8, metalness: 1, roughness: .28, envMap: envTex, envMapIntensity: .45 });
  const chrome = phys({ color: 0xc9cdd3, metalness: 1, roughness: .12, envMap: envTex, envMapIntensity: .6 });
  const graphite = phys({ color: 0x1c1f24, metalness: .2, roughness: .38, clearcoat: .7, clearcoatRoughness: .3, envMap: envTex, envMapIntensity: .22 });
  const rubber = std({ color: 0x15171a, roughness: .92 });
  const tube = (pts, r, m, closed = false) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)), closed, 'centripetal'), 96, r, 10, closed), m);
  // hairdressing shears (closed): two slender blades, a knurled pivot screw, offset rounded shanks, finger rings and a tang
  const scissors = new THREE.Group(); {
    const blade = (len, w0, flip) => { const sh = new THREE.Shape(); sh.moveTo(0, -w0 / 2); sh.lineTo(0, w0 / 2); sh.quadraticCurveTo(len * .55, w0 / 2 * .9, len, flip ? .005 : -.005); sh.quadraticCurveTo(len * .6, flip ? -w0 * .15 : -w0 / 2 * .95, 0, -w0 / 2);
      const m = shadowy(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .03, bevelEnabled: true, bevelThickness: .01, bevelSize: .008, bevelSegments: 3, curveSegments: 24 }), steel)); m.rotation.x = -Math.PI / 2; return m; };
    const b1 = blade(2.15, .17, false); b1.position.set(0, .05, .0); const b2 = blade(2.05, .17, true); b2.position.set(0, .085, .025); b2.rotation.z = 0;
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .05, 32), chrome); pivot.position.set(0, .11, 0);
    for (let i = 0; i < 28; i++) { const k = new THREE.Mesh(new THREE.BoxGeometry(.012, .05, .03), chrome); const a = i / 28 * Math.PI * 2; k.position.set(Math.cos(a) * .11, .11, Math.sin(a) * .11); k.rotation.y = -a; scissors.add(k); }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, .03, 24), steel); cap.position.set(0, .15, 0);
    // shanks: rounded, each curving to its own ring
    const shankA = tube([[-.05, .05, .03], [-.6, .05, .12], [-1.15, .05, .22], [-1.45, .05, .3]], .042, steel);          // finger side
    const shankB = tube([[-.05, .08, -.03], [-.5, .08, -.2], [-.95, .08, -.5], [-1.2, .08, -.68]], .042, steel);          // thumb side
    const ringA = shadowy(new THREE.Mesh(new THREE.TorusGeometry(.21, .045, 14, 48), steel)); ringA.rotation.x = Math.PI / 2; ringA.position.set(-1.66, .05, .36); ringA.scale.set(1, 1.1, 1);
    const ringB = shadowy(new THREE.Mesh(new THREE.TorusGeometry(.2, .045, 14, 48), steel)); ringB.rotation.x = Math.PI / 2; ringB.position.set(-1.4, .08, -.82);
    const tang = tube([[-1.6, .08, -.9], [-1.82, .08, -1.02], [-2.02, .08, -1.0], [-2.1, .08, -.86]], .035, steel);
    const bumper = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .08, 10), rubber); bumper.position.set(-1.1, .07, -.42);
    scissors.add(b1, b2, pivot, cap, shankA, shankB, ringA, ringB, tang, bumper);
    scissors.position.set(4.1, .0, 2.0); scissors.rotation.y = 2.25; scissors.scale.setScalar(.88); propsG.add(scissors); }
  // comb
  const comb = new THREE.Group(); { const m = phys({ color: 0x15181c, roughness: .3, metalness: .05, clearcoat: .5, clearcoatRoughness: .3, envMap: envTex, envMapIntensity: .12 }); const back = shadowy(new THREE.Mesh(new THREE.BoxGeometry(2.4, .05, .22), m)); back.position.z = -.1; comb.add(back);
    for (let i = 0; i < 34; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(.028, .045, .38), m); t.position.set(-1.14 + i * .069, 0, .2); comb.add(t); }
    comb.position.set(-1.5, .05, 3.0); comb.rotation.y = .08; propsG.add(comb); }
  // the writing things: a pen, an eraser, paper clips and a binder clip (she writes everything down)
  const pen = new THREE.Group(); {
    const barrel = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(.052, .048, 2.3, 24), phys({ color: 0x17362b, roughness: .25, clearcoat: 1, clearcoatRoughness: .15, envMap: envTex, envMapIntensity: .25 }))); barrel.rotation.z = Math.PI / 2;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.058, .056, .7, 24), chrome); cap.rotation.z = Math.PI / 2; cap.position.x = -1.1;
    const clipM = new THREE.Mesh(new THREE.BoxGeometry(.5, .02, .05), chrome); clipM.position.set(-1.1, .075, 0);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.048, .3, 20), chrome); tip.rotation.z = -Math.PI / 2; tip.position.x = 1.3;
    pen.add(barrel, cap, clipM, tip); pen.position.set(-3.4, .06, -2.7); pen.rotation.y = .22; propsG.add(pen); }
  const eraser = new THREE.Group(); {
    const block = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.72, .2, .3), std({ color: 0xf1eee6, roughness: .85 }))); block.position.y = .1;
    const sleeve = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.4, .215, .32), std({ color: 0x2e4ea8, roughness: .6 }))); sleeve.position.set(.12, .1, 0);
    eraser.add(block, sleeve); eraser.position.set(-5.3, 0, -.9); eraser.rotation.y = .5; propsG.add(eraser); }
  const paperclip = (x, z, r) => { const m = tube([[-.42, 0, -.12], [.36, 0, -.12], [.44, 0, -.04], [.44, 0, .04], [.36, 0, .12], [-.3, 0, .12], [-.38, 0, .06], [-.38, 0, -.03], [-.3, 0, -.08], [.2, 0, -.08], [.26, 0, -.02], [.26, 0, .03], [.2, 0, .07], [-.2, 0, .07]], .014, steel); m.position.set(x, .02, z); m.rotation.y = r; propsG.add(m); return m; };
  paperclip(-5.4, 2.6, .4); paperclip(-5.1, 2.95, 1.9); paperclip(1.3, .03, -2.95);
  const binder = new THREE.Group(); {
    const b = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.6, .26, .26), phys({ color: 0x111316, roughness: .35, clearcoat: .6, envMap: envTex, envMapIntensity: .15 }))); b.position.y = .13;
    [1, -1].forEach(sg => { const w = tube([[-.2, .26, sg * .1], [-.2, .42, sg * .3], [.2, .42, sg * .3], [.2, .26, sg * .1]], .012, chrome); binder.add(w); });
    binder.add(b); binder.position.set(-5.6, 0, 2.2); binder.rotation.y = -.6; propsG.add(binder); }
  const hclip = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.9, .06, .09), std({ color: 0x17362b, roughness: .4 }))); hclip.rotation.y = -.4; hclip.position.set(1.0, .03, 2.9); propsG.add(hclip);
  const sticky = null;
  // soft contact shadows under everything that sits on the counter (the shadow map alone leaves things floating)
  const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, 'rgba(20,10,4,.8)'); g.addColorStop(.5, 'rgba(20,10,4,.35)'); g.addColorStop(1, 'rgba(20,10,4,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
  const blob = (parent, w, d, x, z, rot = 0, y = .006) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: .8 })); m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, y, z); m.renderOrder = -1; parent.add(m); return m; };
  blob(diary, 5.6, 4.1, 0, .05); blob(pencil, 3.6, .5, 0, .02); blob(scissors, 4.6, 1.6, -.1, -.2, 0); blob(comb, 2.8, .9, 0, .05); blob(pen, 2.7, .5, 0, 0); blob(eraser, 1.1, .7, 0, 0); blob(binder, .9, .7, 0, 0);
  const phoneBlob = blob(scene, 2.3, 3.8, SPOT.x, SPOT.z, SPOT_ROT);
  const propMats = []; propsG.traverse(o => { if (o.isMesh) propMats.push(o.material); });
  // things on the counter give way a little when the pointer brushes them, and settle back
  const nudged = [[diary, 2.6, .05], [pencil, 1.5, .18], [scissors, 1.8, .14], [comb, 1.4, .14], [pen, 1.4, .2], [eraser, .9, .22], [binder, .8, .16]].map(([g, rad, amt]) => ({ g, rad, amt, rest: g.position.clone(), rrot: g.rotation.y, ox: 0, oz: 0, vx: 0, vz: 0, rv: 0, ro: 0 }));
  const pointerOnDesk = new THREE.Vector3(), ray = new THREE.Ray(), ndc = new THREE.Vector3(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function nudge(dt, amtAll) {
    ndc.set(P.x, -P.y, .5).unproject(cam); ray.origin.copy(cam.position); ray.direction.copy(ndc).sub(cam.position).normalize(); const hit = ray.intersectPlane(floor, pointerOnDesk);
    nudged.forEach(n => { let fx = 0, fz = 0; if (hit && amtAll > .5) { const dx = n.rest.x - hit.x, dz = n.rest.z - hit.z, d = Math.hypot(dx, dz); if (d < n.rad && d > 1e-3) { const k = (1 - d / n.rad) ** 2 * n.amt; fx = dx / d * k; fz = dz / d * k; } }
      const w = 9, z = .9; n.vx += ((fx - n.ox) * w * w - 2 * z * w * n.vx) * dt; n.vz += ((fz - n.oz) * w * w - 2 * z * w * n.vz) * dt; n.ox += n.vx * dt; n.oz += n.vz * dt;
      const tr = (fx - fz) * .6; n.rv += ((tr - n.ro) * w * w - 2 * z * w * n.rv) * dt; n.ro += n.rv * dt;
      n.g.position.set(n.rest.x + n.ox, n.rest.y, n.rest.z + n.oz); n.g.rotation.y = n.rrot + n.ro; });
  }
  let inkNow = -1; function setInk(k) { k = Math.round(clamp(k) * 14) / 14; if (k === inkNow) return; inkNow = k; pl.material.map?.dispose(); pl.material.map = page('l', k); prg.material.map?.dispose(); prg.material.map = page('r', k); pl.material.needsUpdate = prg.material.needsUpdate = true; }
  function repaintProps() { inkNow = -1; setInk(Math.max(0, inkNow)); }

  // ---------- the phone and its screen (with the messages that keep coming) ----------
  const SW = SCREEN.w, SH = SCREEN.h, sc = document.createElement('canvas'); sc.width = 780; sc.height = Math.round(780 * SH / SW); const sx = sc.getContext('2d');
  const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const phone = buildPhone(tex); phone.traverse(o => { if (o.isMesh) { o.castShadow = true; [].concat(o.material).forEach(m => { if (m.isMeshStandardMaterial) { m.envMap = envTex; m.envMapIntensity = 1; m.needsUpdate = true; } }); } });
  const flat = new THREE.Group(); flat.rotation.x = -Math.PI / 2; flat.add(phone);
  const pv = new THREE.Group(); pv.add(flat); scene.add(pv);
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
    if (eveAmt > .3 && unread > 2) { const y = top + banners.length * 118 + 6; sx.save(); sx.globalAlpha = eveAmt * heroAmt; sx.fillStyle = 'rgba(248,247,243,.92)'; sx.beginPath(); sx.roundRect(W / 2 - 150, y, 300, 52, 26); sx.fill(); sx.fillStyle = '#d9483c'; sx.beginPath(); sx.arc(W / 2 - 112, y + 26, 11, 0, Math.PI * 2); sx.fill(); sx.fillStyle = '#111'; sx.font = `600 24px -apple-system, Inter, system-ui, sans-serif`; sx.textAlign = 'center'; sx.fillText(`${unread + 9} ${zh() ? '条未读' : 'unread'}`, W / 2 + 10, y + 34); sx.restore(); }
    tex.needsUpdate = true;
  }
  let unread = 0, eveAmt = 0;
  function tickBanners(now, hero) {
    if (hero < .5 || calm) { if (banners.length && hero < .5) { banners.length = 0; dirty = true; } return; }
    if (now - lastBanner > (banners.length ? lerp(1700, 650, eveAmt) : 900)) { unread++; const list = wxList(); const n = banners.length ? (banners[banners.length - 1].n + 1) % list.length : 0; banners.push({ who: list[n][0], what: list[n][1], t: now, n }); if (banners.length > (eveAmt > .5 ? 6 : 4)) banners.shift(); lastBanner = now; buzz = now; }
    dirty = true; // banners animate in
  }
  let buzz = -1e9;
  const showScreen = n => { if (screens.cur === n || !screens.imgs[n]) return; screens.prev = screens.imgs[screens.cur]; screens.cur = n; screens.fade = 0; dirty = true; };

  // ---------- camera, pointer, scroll ----------
  // ---------- post: depth of field, vignette, a little colour fringe ----------
  const dpr = () => Math.min(devicePixelRatio || 1, 1.75);
  let rt = null, vw = 0, vh = 0;
  const post = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tCol: { value: null }, tDep: { value: null }, uRes: { value: new THREE.Vector2() }, uNear: { value: cam.near }, uFar: { value: cam.far }, uFocus: { value: 13 }, uRange: { value: 4 }, uMax: { value: 12 }, uVig: { value: .55 }, uFringe: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D tCol, tDep; uniform vec2 uRes; uniform float uNear, uFar, uFocus, uRange, uMax, uVig, uFringe;
      float dist(vec2 uv){ float z = texture2D(tDep, uv).r * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear)); }
      float coc(vec2 uv){ return clamp(abs(dist(uv) - uFocus) / uRange, 0.0, 1.0) * uMax; }
      void main(){
        float c0 = coc(vUv); float r = max(c0, .45);
        vec3 acc = vec3(0.0); float wsum = 0.0; float a0 = fract(sin(dot(vUv * uRes, vec2(12.9898, 78.233))) * 43758.5453) * 6.2832;
        for (int i = 0; i < 20; i++){ float fi = float(i); float ang = fi * 2.39996 + a0; float rad = sqrt((fi + .5) / 20.0);
          vec2 o = vec2(cos(ang), sin(ang)) * rad * r / uRes; float ct = coc(vUv + o); float w = (ct >= c0 * .7) ? 1.0 : .25; // out-of-focus things don't bleed over sharp ones in front
          acc += texture2D(tCol, vUv + o).rgb * w; wsum += w; }
        vec3 col = acc / wsum;
        vec2 q = (vUv - .5) * vec2(uRes.x / uRes.y, 1.0); float rr = length(q);
        if (uFringe > 0.0) { vec2 d = (vUv - .5) * uFringe * rr; col.r = mix(col.r, texture2D(tCol, vUv + d).r, .6); col.b = mix(col.b, texture2D(tCol, vUv - d).b, .6); }
        col *= 1.0 - uVig * smoothstep(.45, 1.25, rr);
        col = pow(max(col, 0.0), vec3(1.0 / 2.2));
        gl_FragColor = vec4(col, 1.0); }` });
  post.toneMapped = false;
  const postScene = new THREE.Scene(); postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post)); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const resize = () => { vw = op.clientWidth; vh = op.clientHeight; const d = dpr(); renderer.setPixelRatio(d); renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix();
    rt?.dispose(); const W = Math.round(vw * d), H = Math.round(vh * d); const dt = new THREE.DepthTexture(W, H, THREE.UnsignedIntType);
    rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: dt, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    post.uniforms.tCol.value = rt.texture; post.uniforms.tDep.value = dt; post.uniforms.uRes.value.set(W, H); };
  resize(); addEventListener('resize', resize);
  const P = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { if (!fine) return; const r = op.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * 2 - 1; P.ty = (e.clientY - r.top) / r.height * 2 - 1; }, { passive: true });
  const V = {
    hero: { pos: new THREE.Vector3(0, 14.8, 3.4), look: new THREE.Vector3(.2, 0, -.3) },
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
    const kText = seg(pr, 0, .07);                                                                  // copy out
    const kEve = seg(pr, .05, .2), kInk = seg(pr, .13, .3);                                         // day → evening: lamp on, the book fills up
    const kDark = seg(pr, .3, .42), kUp = seg(pr, .32, .47);                                        // lamp off, the phone rises alone
    const kPw = seg(pr, .44, .52) * (1 - seg(pr, .56, .6));                                        // the two big words
    const kDown = seg(pr, .58, .65);                                                                 // back to the counter, at night
    const kA = seg(pr, .63, .68) * (1 - seg(pr, .76, .79)), kScale = seg(pr, .66, .76);             // feature: fits
    const kTop = seg(pr, .77, .82);                                                                  // → top view
    const kB = seg(pr, .81, .85) * (1 - seg(pr, .9, .92)), kGuide = seg(pr, .83, .89);               // feature: moved, not lost
    const kRise = seg(pr, .9, .95), kC = seg(pr, .93, .97) * (1 - seg(pr, .985, 1)), kTurn = clamp((pr - .93) / .07); // record
    const kOut = seg(pr, .965, 1);                                                                   // hand over to the paper page
    const heroAmt = 1 - kDark, lampAmt = kEve * (1 - kDark); eveAmt = lampAmt;
    setInk(kInk);
    // ---- camera ----
    mix(V.hero.pos, V.dark.pos, kUp, camPos); mix(V.hero.look, V.dark.look, kUp, camLook);
    mix(camPos, V.night.pos, kDown, camPos); mix(camLook, V.night.look, kDown, camLook);
    mix(camPos, V.top.pos, kTop, camPos); mix(camLook, V.top.look, kTop, camLook);
    mix(camPos, V.dark.pos, kRise, camPos); mix(camLook, V.dark.look, kRise, camLook);
    camPos.y -= 1.6 * kEve * (1 - kUp); camPos.z -= .6 * kEve * (1 - kUp);
    camPos.x += P.x * .5 * (1 - kUp * .6); camPos.z += P.y * .35 * (1 - kUp);
    cam.position.copy(camPos); cam.lookAt(camLook);
    // ---- lights: day → black → night (lit by the phone) → dark top view → black ----
    const nightAmt = kDown * (1 - kTop), dayAmt = (1 - kEve) ** 1.4, up0 = kUp * (1 - kDown) + kRise;
    key.intensity = 3.3 * dayAmt; fill.intensity = .6 * dayAmt + .12 * lampAmt; cool.intensity = .55 * dayAmt; DAP.uTime.value = now / 1000; DAP.uDap.value = dayAmt * .95;
    lamp.intensity = 80 * lampAmt; eveSky.intensity = .3 * lampAmt; glow.intensity = 14 * nightAmt + 3 * kTop * (1 - kRise) + 2.5 * lampAmt;
    nudge(dt, heroAmt); phoneBlob.material.opacity = .8 * (1 - up0) * Math.max(dayAmt, lampAmt * .6);
    night.intensity = .55 * nightAmt + .18 * kTop * (1 - kRise);
    rim.intensity = (60 * kUp * (1 - kDown) + 26 * kRise) * (1 - kOut);
    desk.visible = propsG.visible = (dayAmt > .003 || lampAmt > .003 || nightAmt > .01 || kTop > .01) && kRise < .98;
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
    // focus: on the counter at first, pulled onto the phone as the room darkens, back to the counter at night, onto the book, then the phone
    const dPhone = cam.position.distanceTo(pv.position), dDesk = cam.position.distanceTo(camLook);
    const focusOnPhone = clamp(kUp * (1 - kDown) + kRise + nightAmt * .6), fu = post.uniforms;
    fu.uFocus.value = lerp(dDesk, dPhone, focusOnPhone); fu.uRange.value = lerp(10.0, 1.6, kUp * (1 - kDown) + kRise) - nightAmt * 6.0; fu.uMax.value = (7 + 11 * (kUp * (1 - kDown) + kRise)) * dpr();
    fu.uVig.value = .38 + .4 * (1 - dayAmt) - .25 * kOut; fu.uFringe.value = .006 * (kUp * (1 - kDown) + kRise);
    renderer.setRenderTarget(rt); renderer.setClearColor(0x0e0c0a, 1); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    const S = (k, v) => ov.style.setProperty(k, (+v).toFixed(3));
    S('--kEve', kEve); S('--kText', kText); S('--kDark', kDark); S('--kUp', kUp); S('--kPw', kPw); S('--kA', kA); S('--kScale', kScale); S('--kB', kB); S('--kGuide', kGuide); S('--kC', kC); S('--kOut', kOut); S('--night', nightAmt); S('--kRise', kRise);
    ov.dataset.scale = kScale < .33 ? 0 : kScale < .66 ? 1 : 2;
  }
  requestAnimationFrame(frame);
}

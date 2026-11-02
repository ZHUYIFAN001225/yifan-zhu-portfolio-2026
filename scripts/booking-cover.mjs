// Glasgow Salon Booking — opening, after premotio.com (the site the portfolio owner pointed to).
// A split headline with a changing word in brackets; between its halves a swarm of poster cards (made from the real
// screens) swirls past the camera with depth blur and colour fringing. Scrolling: the headline parts, the swarm is
// drawn into a turning drum, the drum peels off card by card into a tilted table that fills the left half, and a
// second statement arrives on the right. No phone. Driven by the pinned cover's real scroll position.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => t * t * t * (t * (t * 6 - 15) + 10);
const lerpA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const rnd = j => { const h = Math.sin(j * 127.1 + 311.7) * 43758.5453; return h - Math.floor(h); };

const POSTERS = 12, COUNT = 48, COLS = 8;
const T = {
  l1: ['One shared', '一本共享'], l2: ['diary', '预约本'],
  r1: ['Two clear', '两边都'], r2a: ['sides', '清楚'],
  words: [['customers', '顾客'], ['the owner', '店主'], ['regulars', '老顾客'], ['walk-ins', '临时客']],
  f1: ['A booking system for a small salon in Glasgow, run by one owner.', '为格拉斯哥一家只有一位店主的小理发店做的预约系统。'],
  f2: ['Customers book themselves. She sees her whole day.', '顾客自己约，店主一眼看完一天。'],
  f3: ['Live since 21 Oct 2026', '2026 年 10 月 21 日上线'],
  s1: ['Every screen', '每一屏'], s2: ['is real', '都是真的'],
  s3: ['The screens customers and the owner use every day.', '顾客和店主每天在用的就是这些界面。'],
  s4: ['Service first, only times that fit, nobody deleted.', '先选服务，只给放得下的时间，没有人被删掉。'],
  try: ['Try the demo', '试用演示版'], live: ['Open the real site ↗', '打开真实网站 ↗']
};
export const CHARS = () => [...Object.values(T).flat(2)].join('');

export function mountCover(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-ov')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 }; // keeps the 3D phone out of the opening
  document.documentElement.dataset.cover = 'swirl';
  if (!document.querySelector('link[data-inter-tight]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.interTight = ''; l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&display=swap'; document.head.append(l); }
  const liveA = op.querySelector('.op-actions a[target]');

  const ov = document.createElement('div'); ov.className = 'bk-ov';
  ov.innerHTML = `<div class="bk-ov-3d">${Array.from({ length: COUNT }, (_, j) => `<i class="bk-ov-card"><img alt="" decoding="async" data-n="${(j * 5) % POSTERS}"></i>`).join('')}</div>
    <h1 class="bk-ov-h"><span class="bk-ov-l"><b class="l1"></b><b class="l2"></b></span><span class="bk-ov-r"><b class="r1"></b><b class="r2">(<em></em>)</b></span></h1>
    <div class="bk-ov-foot"><p class="f1"></p><p class="f2"></p><p class="f3"><i></i><span></span></p></div>
    <div class="bk-ov-s"><h2 class="bk-ov-s-h"><b class="s1"></b><b class="s2"></b></h2><div class="bk-ov-s-t"><p class="s3"></p><p class="s4"></p></div>
      <p class="bk-ov-btns"><a class="bk-ov-try" href="#interactive-demo"></a><a class="bk-ov-live" target="_blank" rel="noopener"></a></p></div>`;
  op.append(ov);
  const stage = ov.firstElementChild, cards = [...ov.querySelectorAll('.bk-ov-card')], $ = s => ov.querySelector(s);
  let wi = 1;
  const text = () => {
    cards.forEach(c => { const im = c.firstChild; im.src = `assets/v3/cover-posters/${zh() ? 'zh' : 'en'}/p${im.dataset.n}.webp`; });
    $('.l1').textContent = L(T.l1); $('.l2').textContent = L(T.l2); $('.r1').textContent = L(T.r1); $('.r2 em').textContent = L(T.words[wi]);
    $('.f1').textContent = L(T.f1); $('.f2').textContent = L(T.f2); $('.f3 span').textContent = L(T.f3);
    $('.s1').textContent = L(T.s1); $('.s2').textContent = L(T.s2); $('.s3').textContent = L(T.s3); $('.s4').textContent = L(T.s4);
    $('.bk-ov-try').textContent = L(T.try) + ' ↓'; const lv = $('.bk-ov-live');
    if (liveA && lv) { lv.textContent = L(T.live); lv.href = zh() ? (liveA.dataset.hrefZh || liveA.href) : liveA.href; } else lv?.remove();
  };
  text(); document.addEventListener('portfolio:language', () => setTimeout(text, 40));
  // the word in brackets types itself out, letter by letter, like the reference's "(move)"
  if (!calm) setInterval(() => {
    const em = $('.r2 em'), next = L(T.words[(wi + 1) % T.words.length]); let s = em.textContent;
    const del = setInterval(() => { s = s.slice(0, -1); em.textContent = s; if (!s) { clearInterval(del); wi = (wi + 1) % T.words.length; let k = 0; const add = setInterval(() => { em.textContent = next.slice(0, ++k); if (k >= next.length) clearInterval(add); }, 55); } }, 35);
  }, 2600);

  const W = () => innerWidth, H = () => op.offsetHeight, cw = () => Math.min(210, W() * .14);
  // [x, y, z, rx, ry, rz, scale] in px from the centre of the cover
  const swarm = (j, t) => { // a swirl around the middle: cards orbit at different depths and come past the camera
    const a = rnd(j) * 6.283 + t * (.18 + rnd(j + 9) * .22), depth = ((rnd(j + 3) + t * .045) % 1), z = -1300 + depth * 1700;
    const rr = 240 + Math.sqrt(rnd(j + 5)) * Math.min(W(), 1500) * .42;
    return [Math.cos(a) * rr, Math.sin(a) * rr * .62, z, (rnd(j + 1) - .5) * 70, (rnd(j + 2) - .5) * 90 + Math.cos(a) * 25, (rnd(j + 4) - .5) * 50, .66];
  };
  const drum = (j, t) => { // a turning drum of upright cards, one ring, packed like the reference
    const a = (j / COUNT) * 6.283 + t * .35, R = Math.min(W() * .22, 340);
    return [Math.sin(a) * R, (rnd(j + 7) - .5) * 14, Math.cos(a) * R - R * .55, 0, a * 57.3, 0, 1.05];
  };
  const table = j => { // a tilted table of cards filling the left half
    const c = j % COLS, r = Math.floor(j / COLS), w = cw() * 1.08;
    return [-W() * .26 + (c - COLS / 2 + .5) * w + (r - 2.5) * w * .32, (r - 2.5) * w * 1.18, -40, 46, 0, -26, 1];
  };
  const prev = cards.map(() => [0, 0]);
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const t = calm ? 0 : now / 1000, pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    // 0–.06 swarm · .06–.3 drawn into the drum · .3–.44 the drum turns · .44–.7 peels off into the table · .7–.92 hold · .92– release
    const kA = sm(clamp((pr - .05) / .25)), kOut = sm(clamp((pr - .9) / .12));
    ov.style.setProperty('--kA', kA.toFixed(3));
    ov.style.setProperty('--kT', sm(clamp((pr - .6) / .12)).toFixed(3));
    ov.style.setProperty('--kO', kOut.toFixed(3));
    stage.style.setProperty('--clip', (sm(clamp((pr - .5) / .2)) * 48).toFixed(2) + '%');
    const sw = cw();
    cards.forEach((c, j) => {
      let p = lerpA(swarm(j, t), drum(j, t), kA);
      // the peel: each card leaves the drum a little after the one before it, so the drum unwinds like a ribbon
      const order = ((j % COLS) * 6 + Math.floor(j / COLS)) / COUNT, kT = sm(clamp((pr - .42 - order * .16) / .14));
      if (kT > 0) { const mid = lerpA(p, table(j), kT); mid[1] -= Math.sin(kT * Math.PI) * 180; mid[2] += Math.sin(kT * Math.PI) * 220; p = mid; }
      if (kOut > 0) p[1] -= kOut * H() * 1.1;
      const x = p[0], y = p[1];
      c.style.width = sw + 'px';
      c.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${p[2].toFixed(1)}px) rotateX(${p[3].toFixed(1)}deg) rotateY(${p[4].toFixed(1)}deg) rotateZ(${p[5].toFixed(1)}deg) scale(${p[6].toFixed(3)})`;
      // depth of field and colour fringing on cards that are close or moving fast, like the reference's motion blur
      const vx = x - prev[j][0], vy = y - prev[j][1]; prev[j] = [x, y];
      const near = clamp((p[2] - 120) / 380), far = clamp((-p[2] - 700) / 600), speed = Math.min(14, Math.hypot(vx, vy) * .5);
      const blur = (near * 7 + far * 2.5) * (1 - kA * .8) + speed * .12, fr = (speed + near * 6) * (1 - kA * .6);
      c.style.filter = blur > .3 || fr > .8 ? `blur(${blur.toFixed(1)}px) drop-shadow(${fr.toFixed(1)}px 0 0 rgba(255,40,90,.45)) drop-shadow(${(-fr).toFixed(1)}px 0 0 rgba(0,170,255,.45))` : '';
      c.style.opacity = (1 - far * .4).toFixed(2);
      c.style.zIndex = Math.round(2000 + p[2]);
    });
  }
  requestAnimationFrame(frame);
}

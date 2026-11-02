// Glasgow Salon Booking — opening, after the motion-preset site the owner of this portfolio pointed to.
// No phone. A headline split in two halves ("One shared / diary." · "Two clear / (sides)") with a word in brackets that
// keeps changing; between them dozens of real screens of the product swirl in a 3D vortex. Scrolling winds the vortex
// into a carousel ring, then lays the ring down as a tilted table of screens on the left while a second statement
// arrives on the right; then the page carries on. Driven by the pinned cover's real scroll position.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => t * t * t * (t * (t * 6 - 15) + 10);
const lerpA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const SCR = ['c1', 'a1', 'c2', 'a2', 'c3', 'a3', 'c4', 'a4', 'c5', 'c6'];
const COUNT = 36;
const T = {
  l1: ['One shared', '一本共享'], l2: ['diary.', '预约本。'],
  r1: ['Two clear', '两边都'], r2: ['sides', '清楚'],
  words: [['customers', '顾客'], ['the owner', '店主'], ['regulars', '老顾客'], ['walk-ins', '临时进店的人']],
  lead: ['A booking system for a small Glasgow salon: customers book themselves, the owner sees her whole day.', '为格拉斯哥一家小理发店做的预约系统：顾客自己约，店主一眼看完她的一天。'],
  s1: ['Every screen', '每一屏'], s2: ['is real.', '都是真的。'],
  s3: ['These are the screens customers and the owner use — live since 21 Oct 2026.', '这些就是顾客和店主每天在用的界面——2026 年 10 月 21 日上线。'],
  try: ['Try the demo ↓', '试用演示版 ↓'], live: ['Open the real site ↗', '打开真实网站 ↗']
};
export const CHARS = () => [...Object.values(T).flat(2)].join('');

export function mountCover(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-ov')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the 3D phone stays out of the opening (booking-stage reads this)
  window.__bkCoverMap = { V: 'cards', S: 0, E: 1, DOCK: 1.02 };
  document.documentElement.dataset.cover = 'swirl';
  const liveA = op.querySelector('.op-actions a[target]');

  const ov = document.createElement('div'); ov.className = 'bk-ov';
  ov.innerHTML = `<div class="bk-ov-3d">${Array.from({ length: COUNT }, (_, j) => `<i class="bk-ov-card"><img alt="" decoding="async" data-n="${SCR[j % SCR.length]}"></i>`).join('')}</div>
    <h1 class="bk-ov-h"><span class="bk-ov-l"><b class="l1"></b><b class="l2"></b></span><span class="bk-ov-r"><b class="r1"></b><b class="r2">(<em></em>)</b></span></h1>
    <div class="bk-ov-foot"><p class="bk-ov-lead"></p><p class="bk-ov-btns"><a class="bk-ov-live" target="_blank" rel="noopener"></a><a class="bk-ov-try" href="#interactive-demo"></a></p></div>
    <div class="bk-ov-s"><p class="bk-ov-s-h"><b class="s1"></b><b class="s2"></b></p><p class="bk-ov-s-t"></p><a class="bk-ov-try2" href="#interactive-demo"></a></div>`;
  op.append(ov);
  const cards = [...ov.querySelectorAll('.bk-ov-card')], $ = s => ov.querySelector(s);
  let wi = 0;
  const text = () => {
    cards.forEach(c => { const im = c.firstChild; im.src = `assets/v3/cover-cards/${zh() ? 'zh' : 'en'}/${im.dataset.n}.webp`; });
    $('.l1').textContent = L(T.l1); $('.l2').textContent = L(T.l2); $('.r1').textContent = L(T.r1);
    $('.r2 em').textContent = L(T.words[wi]);
    $('.bk-ov-lead').textContent = L(T.lead); $('.s1').textContent = L(T.s1); $('.s2').textContent = L(T.s2); $('.bk-ov-s-t').textContent = L(T.s3);
    $('.bk-ov-try').textContent = L(T.try); $('.bk-ov-try2').textContent = L(T.try); $('.bk-ov-live').textContent = L(T.live);
    if (liveA) $('.bk-ov-live').href = zh() ? (liveA.dataset.hrefZh || liveA.href) : liveA.href; else $('.bk-ov-live').remove();
  };
  text(); document.addEventListener('portfolio:language', () => setTimeout(text, 40));
  // the word in brackets keeps changing, like the reference's "(move)"
  if (!calm) setInterval(() => { const em = $('.r2 em'); em.classList.add('is-out'); setTimeout(() => { wi = (wi + 1) % T.words.length; em.textContent = L(T.words[wi]); em.classList.remove('is-out'); }, 260); }, 2200);

  // three arrangements of the same screens: [x, y, z, rx, ry, rz, scale, opacity] in px from the centre
  const vortex = (j, t) => { // a swirl around the middle: screens orbit, come close and fall back
    const k = j / COUNT, a = k * Math.PI * 2 * 3 + t * .35, rr = 170 + (j % 6) * 52, z = Math.sin(k * 23 + t * .8) * 420 - 80;
    return [Math.cos(a) * rr, Math.sin(a) * rr * .78, z, Math.sin(a) * 18, -Math.cos(a) * 32, (a * 57.3) % 360 * .12, .62, 1];
  };
  const ring = (j, t) => { // a tight carousel: screens stand on a turning drum
    const a = (j / COUNT) * Math.PI * 2 + t * .45, R = 300;
    return [Math.sin(a) * R, (j % 2 ? 1 : -1) * 6, Math.cos(a) * R - 140, -6, a * 57.3, 0, .74, 1];
  };
  const table = j => { // laid down: a tilted table of screens filling the left half
    const c = j % 8, r = Math.floor(j / 8), w = innerWidth, h = op.offsetHeight;
    return [-w * .28 + (c - 3.5) * 126 + r * 34, -h * .3 + r * 210, -r * 30, 48, 0, -24, .9, 1];
  };

  let last = -1;
  function frame(now) {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const t = calm ? 0 : now / 1000, pr = clamp(-r.top / Math.max(1, r.height - op.offsetHeight), -.2, 1.2);
    // 0–.12 vortex · .12–.42 winds into the ring · .5–.78 the ring lays down as a table · .86+ the page carries on
    const k1 = sm(clamp((pr - .1) / .32)), k2 = sm(clamp((pr - .5) / .28)), k3 = sm(clamp((pr - .86) / .14));
    ov.style.setProperty('--k1', k1.toFixed(3)); ov.style.setProperty('--k2', k2.toFixed(3)); ov.style.setProperty('--k3', k3.toFixed(3));
    cards.forEach((c, j) => {
      let p = lerpA(vortex(j, t), ring(j, t), k1);
      if (k2 > 0) p = lerpA(p, table(j), k2);
      if (k3 > 0) p = [p[0], p[1] - k3 * op.offsetHeight * .9, p[2], p[3], p[4], p[5], p[6], p[7] * (1 - k3)];
      c.style.transform = `translate(-50%,-50%) translate3d(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px,${p[2].toFixed(1)}px) rotateX(${p[3].toFixed(1)}deg) rotateY(${p[4].toFixed(1)}deg) rotateZ(${p[5].toFixed(1)}deg) scale(${p[6].toFixed(3)})`;
      // depth: near screens are larger and softly blurred (like the reference's motion blur), far ones paler
      const near = clamp((p[2] - 140) / 260), far = clamp((-p[2] - 300) / 300);
      c.style.opacity = (p[7] * (1 - far * .55)).toFixed(3);
      c.style.filter = near > .02 && k1 < .9 ? `blur(${(near * 5 * (1 - k1)).toFixed(1)}px)` : '';
      c.style.zIndex = Math.round(1000 + p[2]);
    });
  }
  requestAnimationFrame(frame);
}

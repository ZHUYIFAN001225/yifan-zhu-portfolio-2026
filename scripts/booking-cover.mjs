// Glasgow Salon Booking — the cover, after two references:
//  • the motion-preset site: a field of real screens on the floor that rises and regroups, and a list of big words on
//    the left whose current line drives the arrangement on the right;
//  • Oryzo (Lusion): one object, text beside it and never on it, a camera move per statement, and at the end the 3D
//    object lands in a 2D spot on the page instead of flying away.
// ?cover=mix (default) — screens on the floor gather into the phone, then the phone tells the six points.
// ?cover=cards — only the screens: each point is a new arrangement of them.
// ?cover=phone — only the phone (Oryzo).
// The pinned cover's progress (0–1) is measured live; the 3D phone (booking-stage.mjs) reads the same map.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = t => t * t * t * (t * (t * 6 - 15) + 10);

const SCR = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'a1', 'a2', 'a3', 'a4'];
const ITEMS = [
  { t: ['Pick a service first', '先选服务'], n: ['Its length decides which times can fit.', '时长决定了哪些时间放得下。'], hero: 1 },
  { t: ['The soonest time, one tap', '最早的时间，点一下'], n: ['Most people never open the calendar.', '大多数人不用翻日历。'], hero: 0 },
  { t: ['Only times that fit', '只给放得下的时间'], n: ['No more “are you free at 2?”', '不用再问“两点有空吗？”'], hero: 3 },
  { t: ['Her side: the whole day', '店主这边：一眼看完今天'], n: ['The booking is already in her diary.', '刚约的那单，已经在她的日程里。'], hero: 6 },
  { t: ['Regulars add by name', '老顾客填名字就行'], n: ['A phone call becomes a booking in a few taps.', '电话来约，点几下就记上。'], hero: 7 },
  { t: ['Close early, nobody lost', '临时关门，没人被删掉'], n: ['Bookings move out; customers pick a new time.', '预约被移出来，顾客自己重选时间。'], hero: 8 }
];
const N = ITEMS.length, COUNT = 20;
export const CHARS = () => [...ITEMS.flatMap(i => [...i.t, ...i.n]), '顾客这边店主这边两边，同一本预约本。'].join('');

export function mountCover(root) {
  const op = document.querySelector('[data-opening]'), holder = op?.parentElement;
  if (!op || !holder?.matches('.bk-cover-pin') || op.querySelector('.bk-cv')) return;
  const V = ['cards', 'phone'].includes(new URLSearchParams(location.search).get('cover')) ? new URLSearchParams(location.search).get('cover') : 'mix';
  const S = V === 'phone' ? .04 : .2, E = .84, DOCK = .93;
  window.__bkCoverMap = { V, S, E, DOCK };
  document.documentElement.dataset.cover = V;

  const wrap = document.createElement('div'); wrap.className = 'bk-cv'; wrap.setAttribute('aria-hidden', 'true');
  const src = n => `assets/v3/cover-cards/${zh() ? 'zh' : 'en'}/${n}.webp`;
  wrap.innerHTML = `<div class="bk-cv-stage">${Array.from({ length: COUNT }, (_, j) => `<i class="bk-cv-card"><img alt="" decoding="async" data-n="${SCR[j % SCR.length]}"></i>`).join('')}</div>
    <div class="bk-cv-list"><p class="bk-cv-k"><span></span><b></b></p><ol>${ITEMS.map(() => '<li><b></b><span></span></li>').join('')}</ol><p class="bk-cv-end"></p></div>
    <figure class="bk-cv-dock"><i><img alt="" decoding="async"></i></figure>`;
  op.append(wrap);
  const cards = [...wrap.querySelectorAll('.bk-cv-card')], lis = [...wrap.querySelectorAll('.bk-cv-list li')];
  const text = () => {
    cards.forEach(c => { const im = c.firstChild; im.src = src(im.dataset.n); });
    wrap.querySelector('.bk-cv-dock img').src = `assets/v3/screens/booking/${zh() ? 'zh/' : ''}cover-today.webp`;
    lis.forEach((li, i) => { li.querySelector('b').textContent = L(ITEMS[i].t); li.querySelector('span').textContent = L(ITEMS[i].n); });
    wrap.querySelector('.bk-cv-end').innerHTML = zh() ? '两边，<br>同一本预约本。' : 'Two sides.<br>One diary.';
    last = -9;
  };

  // arrangements, in px from the centre of the right-hand stage; each returns [x, y, z, rx, ry, rz, scale, opacity]
  const W = () => innerWidth, H = () => op.offsetHeight;
  // like the reference's opening: the screens lie on a tilted table filling the right half of the first screen
  const floor = j => { const c = j % 5, r = Math.floor(j / 5), w = W(), h = H(); return [w * .2 + (c - 2) * w * .075 + r * w * .03, -h * .2 + r * h * .16, -r * 40, 50, 0, -22, .82, 1]; };
  const ARR = [
    j => { const a = (j / COUNT) * Math.PI * 2, R = 420; return [Math.sin(a) * R * .9, 0, Math.cos(a) * R - R, 0, a * 57.3, 0, .95, 1]; },                     // carousel
    j => { const c = j % 5, r = Math.floor(j / 5); return [(c - 2) * 128, (r - 1.5) * 250, 0, 38, 0, -16, .78, 1]; },                                           // grid on a tilt
    j => { const k = j - COUNT / 2, a = k * .32; return [0, Math.sin(a) * 520, Math.cos(a) * 520 - 520, -a * 57.3, 0, 0, .9, Math.cos(a) > 0 ? 1 : 0]; },          // roll
    j => { const a = (j / COUNT) * Math.PI * 2; return [Math.cos(a) * 330, Math.sin(a) * 330, -120, 0, 0, a * 57.3 + 90, .6, 1]; },                              // ring
    j => { const h = Math.sin(j * 12.9898) * 43758.5, rnd = h - Math.floor(h), h2 = Math.sin(j * 78.233) * 12345.6, rn2 = h2 - Math.floor(h2); return [(rnd - .5) * 760, (rn2 - .5) * 620, -200 - rnd * 700, 0, (rn2 - .5) * 30, (rnd - .5) * 20, .7, 1]; }, // field
    j => [(j - COUNT / 2) * 7, (j - COUNT / 2) * -5, -j * 6, 8, -22, -6 + j * .9, .95, 1]                                                                         // stack
  ];
  const hero = [0, 0, 160, 0, 0, 0, 1.35, 1];
  const lerpA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  let last = -9, cx = 0, cy = 0;

  function frame() {
    requestAnimationFrame(frame);
    const r = holder.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight) return;
    const pr = -r.top / Math.max(1, r.height - op.offsetHeight);
    if (Math.abs(pr - last) < .0004) return; last = pr;
    const u = pr < S ? -1 + clamp(pr / S) : pr < E ? (pr - S) / (E - S) * N : N - 1 + clamp((pr - E) / (DOCK - E));
    const cur = Math.max(0, Math.min(N - 1, Math.round(u - .25)));
    wrap.style.setProperty('--pr', pr.toFixed(4));
    wrap.dataset.phase = pr < S ? 'floor' : pr < E ? 'tell' : pr < DOCK ? 'land' : 'done';
    lis.forEach((li, i) => { li.classList.toggle('is-on', pr >= S * .8 && pr < E + .02 && i === cur); li.classList.toggle('is-past', i < cur); });
    wrap.querySelector('.bk-cv-k span').textContent = cur < 3 ? (zh() ? '顾客这边' : 'Customer side') : (zh() ? '店主这边' : 'Owner side');
    wrap.querySelector('.bk-cv-k b').textContent = `${String(cur + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    // the stage on the right: centre of the cards
    const stageX = W() * .66 - W() / 2, dock = wrap.querySelector('.bk-cv-dock i').getBoundingClientRect(), orc = op.getBoundingClientRect();
    const dockX = dock.left + dock.width / 2 - orc.left - W() / 2, dockY = dock.top + dock.height / 2 - orc.top - H() / 2;
    const stageEl = wrap.firstElementChild, showCards = V === 'cards' || u < 0; stageEl.style.display = showCards ? '' : 'none';
    if (showCards) cards.forEach((c, j) => {
      let p;
      if (u < 0) { // on the floor, rising and gathering (mix: into the phone; cards: into the first arrangement)
        const t = sm(clamp(u + 1)), f = floor(j);
        const target = V === 'cards' ? lerpA(ARR[0](j), j === ITEMS[0].hero ? hero : ARR[0](j), 1) : [0, 0, 0, 0, 0, 0, .55, 0];
        const lift = Math.sin(t * Math.PI) * (80 + (j % 5) * 40);
        p = lerpA(f, target, t); p[2] += lift; p[0] += stageX * t; p[4] += (j % 2 ? 1 : -1) * 40 * Math.sin(t * Math.PI);
      } else if (V === 'cards') {
        const i = Math.min(N - 1, Math.floor(u)), fr = u - i, k = fr < .45 ? 0 : sm((fr - .45) / .55);
        const A = ARR[i](j), B = ARR[Math.min(N - 1, i + 1)](j);
        const hA = j === ITEMS[i].hero ? 1 : 0, hB = i + 1 < N && j === ITEMS[i + 1].hero ? 1 : 0;
        p = lerpA(lerpA(A, hero, hA * (1 - k)), lerpA(B, hero, hB), k); p[0] += stageX;
        if (pr >= E) { const t = sm(clamp((pr - E) / (DOCK - E))); p = lerpA(p, [dockX, dockY, 0, 0, 0, 0, .5, j === ITEMS[N - 1].hero ? 1 : 0], t); }
      } else p = [stageX, 0, 0, 0, 0, 0, .55, 0];
      c.style.transform = `translate(-50%,-50%) translate3d(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px,${p[2].toFixed(1)}px) rotateX(${p[3].toFixed(2)}deg) rotateY(${p[4].toFixed(2)}deg) rotateZ(${p[5].toFixed(2)}deg) scale(${p[6].toFixed(3)})`;
      c.style.opacity = p[7].toFixed(3); c.style.zIndex = Math.round(1000 + p[2]); c.style.visibility = p[7] < .02 ? 'hidden' : '';
    });
  }
  text(); document.addEventListener('portfolio:language', () => setTimeout(text, 40));
  requestAnimationFrame(frame);
}

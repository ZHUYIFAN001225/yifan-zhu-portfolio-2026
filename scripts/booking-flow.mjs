// Glasgow Salon Booking — "One booking, from both sides" as a two-lane flow of the real screens.
// Customer lane on top, the owner's diary below. Each real screen is shown sharp at its own size, the part that matters
// is ringed in pen, and pen arrows show where the booking goes: from the customer's last check straight into the
// owner's diary, and back to the customer when the owner closes two hours. Click any screen to see it large.
// Everything is drawn in order as the board comes into view; nothing pins the page.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const B = 'assets/v3/screens/booking/';
const src = f => B + (zh() ? 'zh/' : '') + f + '.webp';

// col, row (0 customer, 1 owner), screen, ring (x, y, w, h in % of the screen), copy
const CARDS = [
  { c: 0, r: 0, f: 'book', ring: [2, 19, 96, 15], n: ['12:10', '12:10'], t: ['The service comes first', '先选服务'], b: ['Its length is known before any time is shown.', '先知道时长，才会出现时间。'] },
  { c: 1, r: 0, f: 'day', ring: [2, 30.9, 96, 29.1], n: ['12:11', '12:11'], t: ['Only times that fit', '只给放得下的时间'], b: ['Every time on offer is one the diary can hold.', '给出的每个时间，日程都放得下。'] },
  { c: 2, r: 0, f: 'confirm', ring: [3, 28.5, 94, 15.6], n: ['12:12', '12:12'], t: ['One check, then book', '核对一次就约好'], b: ['Date, time and length in one card.', '日期、时间、时长都在一张卡里。'] },
  { c: 2, r: 1, f: 'schedule', ring: [4, 52.3, 94, 33.2], n: ['12:12', '12:12'], t: ['In her diary, by itself', '自己进了店主的日程'], b: ['The owner does nothing. It is already there, at the right length.', '店主什么都不用做，预约已按正确时长出现。'] },
  { c: 3, r: 1, f: 'time-off-hours', ring: [2, 34.8, 96, 25.6], n: ['17:40', '17:40'], t: ['She closes two hours', '她临时关掉两小时'], b: ['She sees who is affected before anything closes.', '关之前就能看到会影响谁。'] },
  { c: 3, r: 0, f: 'kept', ring: [2, 33, 96, 30.8], n: ['17:41', '17:41'], t: ['Nobody is deleted', '没有人被删掉'], b: ['The customer keeps her service and picks a new time.', '顾客保留服务，重新选个时间。'] }
];
const HEAD = { k: ['12:10 · One booking, from both sides', '12:10 · 一笔预约，两端同时发生'], t: ['Same diary. Two views. Nothing passed on by message.', '同一本日程，两种视图，中间不再传话。'], lc: ['Customer', '顾客'], lo: ['Owner’s diary', '店主的日程'], idle: ['She is cutting hair. Nothing to do here.', '她在剪头发，这里什么都不用做。'], a1: ['the booking goes straight in', '预约直接进日程'], a2: ['moved, not deleted', '是改期，不是删除'], hint: ['Real screens from the public demo · click any screen to enlarge', '公开演示版的真实界面 · 点任意界面放大'] };
export const CHARS = () => [...Object.values(HEAD).flat(), ...CARDS.flatMap(c => [...c.t, ...c.n])].join('');

export function mountFlow(root, before) {
  const sec = document.createElement('section'); sec.className = 'bk-flow';
  sec.innerHTML = `<div class="bk-flow-in"><div class="bk-hand-head"><p class="bk-hand-k"></p><p class="bk-hand-t" role="heading" aria-level="2"></p></div>
    <div class="bk-flow-board"><p class="bk-flow-lane is-c"><i></i><span></span></p><p class="bk-flow-lane is-o"><i></i><span></span></p><p class="bk-flow-idle bk-w"></p>
    ${CARDS.map((k, i) => `<figure class="bk-flow-card" data-i="${i}" style="--c:${k.c};--r:${k.r}"><button type="button" class="bk-flow-shot" data-shot="${B + k.f}.webp" aria-label=""><img data-i18n-img src="${B + k.f}.webp" alt="" width="540" height="1170" loading="lazy" decoding="async"></button><figcaption><b class="bk-flow-n"></b><strong></strong><span></span></figcaption></figure>`).join('')}
    <svg class="bk-flow-ink" aria-hidden="true"><path class="bk-flow-a1"/><path class="bk-flow-a1h"/><path class="bk-flow-a2"/><path class="bk-flow-a2h"/></svg><span class="bk-flow-note n1 bk-w"></span><span class="bk-flow-note n2 bk-w is-red"></span>
    <span class="bk-flow-ticket" aria-hidden="true"></span></div><p class="bk-flow-hint"></p></div>`;
  before.before(sec);
  const $ = s => sec.querySelector(s), cards = [...sec.querySelectorAll('.bk-flow-card')];
  const text = () => {
    $('.bk-hand-k').textContent = L(HEAD.k); $('.bk-hand-t').textContent = L(HEAD.t);
    $('.bk-flow-lane.is-c span').textContent = L(HEAD.lc); $('.bk-flow-lane.is-o span').textContent = L(HEAD.lo); $('.bk-flow-idle').textContent = L(HEAD.idle);
    $('.n1').textContent = L(HEAD.a1); $('.n2').textContent = L(HEAD.a2); $('.bk-flow-hint').textContent = L(HEAD.hint);
    cards.forEach((el, i) => { const k = CARDS[i]; el.querySelector('.bk-flow-n').textContent = L(k.n); el.querySelector('strong').textContent = L(k.t); el.querySelector('figcaption span').textContent = L(k.b); const img = el.querySelector('img'); img.src = src(k.f); el.querySelector('button').dataset.shot = src(k.f); el.querySelector('button').setAttribute('aria-label', L(k.t)); el.querySelector('button').dataset.caption = L(k.t); });
  };
  text(); document.addEventListener('portfolio:language', text);
  // the arrows between the lanes depend on the layout, so they are measured
  const ink = $('.bk-flow-ink'), board = $('.bk-flow-board');
  const P = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const head = (x2, y2, mx, my) => { const a = Math.atan2(y2 - my, x2 - mx), A = 12; return `M${P(x2 - Math.cos(a - .45) * A, y2 - Math.sin(a - .45) * A)} L${P(x2, y2)} L${P(x2 - Math.cos(a + .45) * A, y2 - Math.sin(a + .45) * A)}`; };
  function layoutInk() {
    const br = board.getBoundingClientRect(); ink.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
    const box = i => { const r = cards[i].querySelector('button').getBoundingClientRect(); return { l: r.left - br.left, r: r.right - br.left, t: r.top - br.top, b: r.bottom - br.top, cx: (r.left + r.right) / 2 - br.left, cy: (r.top + r.bottom) / 2 - br.top }; };
    const a = box(2), b = box(3), c = box(4), d = box(5);
        // confirm (customer) → diary (owner): straight down; closing (owner) → the customer picks again: straight up
    const x1 = a.cx, y1 = a.b + 10, y2 = b.t - 10;
    $('.bk-flow-a1').setAttribute('d', `M${P(x1, y1)} L${P(x1, y2)}`); $('.bk-flow-a1h').setAttribute('d', head(x1, y2, x1, y1));
    const n1 = $('.n1'); n1.style.left = (x1 + 12) + 'px'; n1.style.top = ((y1 + y2) / 2 - 14) + 'px';
    sec._ticket = { x1, y1, x2: x1, y2, mx: x1, my: (y1 + y2) / 2 };
    const down = d.t > c.b, x3 = c.cx, y3 = down ? c.b + 10 : c.t - 10, y4 = down ? d.t - 10 : d.b + 10; // on phones the lanes stack, so it points down
    $('.bk-flow-a2').setAttribute('d', `M${P(x3, y3)} L${P(x3, y4)}`); $('.bk-flow-a2h').setAttribute('d', head(x3, y4, x3, y3));
    const n2 = $('.n2'); n2.style.left = (x3 + 12) + 'px'; n2.style.top = ((y3 + y4) / 2 - 14) + 'px';
    ink.querySelectorAll('path').forEach(p => { const len = p.getTotalLength(); p._L = len; p.style.strokeDasharray = `${len} ${len}`; });
    drawn = -1;
  }
  // draw everything in order as the board comes into view (and undraw on the way back)
  let p = 0, drawn = -1, last = performance.now();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const order = [0, 1, 2, 'a1', 3, 4, 'a2', 5];
  function draw() {
    order.forEach((o, i) => {
      const k = clamp((p - i * .1) / .14);
      if (typeof o === 'number') { const el = cards[o]; el.style.setProperty('--k', k.toFixed(3)); el.classList.toggle('is-in', k > .02);  }
      else { const ln = $('.bk-flow-' + o), hd = $('.bk-flow-' + o + 'h'); ln.style.strokeDashoffset = ((ln._L || 0) * (1 - clamp(k * 1.3))).toFixed(1); hd.style.strokeDashoffset = ((hd._L || 0) * (1 - clamp(k * 3 - 2))).toFixed(1); sec.querySelector(o === 'a1' ? '.n1' : '.n2').style.opacity = clamp(k * 2 - 1); }
    });
    // the booking itself travels along the first arrow
    const t = sec._ticket, kt = clamp((p - .3) / .12), tk = $('.bk-flow-ticket');
    if (t && kt > 0 && kt < 1) { const u = kt, x = (1 - u) * (1 - u) * t.x1 + 2 * (1 - u) * u * t.mx + u * u * t.x2, y = (1 - u) * (1 - u) * t.y1 + 2 * (1 - u) * u * t.my + u * u * t.y2; tk.style.opacity = 1; tk.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) `; }
    else tk.style.opacity = 0;
    sec.classList.toggle('is-done', p > .95);
  }
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.08, (now - last) / 1000); last = now;
    const r = board.getBoundingClientRect(), vh = innerHeight; if (r.bottom < -200 || r.top > vh + 200) return;
    const target = calm ? 1 : clamp((vh * .9 - r.top) / (Math.min(r.height, vh) * .95));
    p += (target - p) * (1 - Math.exp(-dt * 3.5));
    if (Math.abs(p - drawn) > .0005) { drawn = p; draw(); }
  };
  addEventListener('resize', layoutInk); setTimeout(layoutInk, 50); setTimeout(layoutInk, 1200);
  cards.forEach(c => c.querySelector('img').addEventListener('load', layoutInk, { once: true }));
  document.fonts?.ready.then(layoutInk);
  requestAnimationFrame(tick);
  return sec;
}

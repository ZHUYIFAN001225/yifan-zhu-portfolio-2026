// Glasgow Salon Booking — 12:10 · "One diary, two views", as a scene you can read in seconds.
// The shared diary stands in the middle as the one source of truth: a day from 10:00 to 18:30, each booking a block
// as long as its service. The customer's phone is on the left, the owner's on the right. As you scroll:
//   1 she picks a 30-minute service: only the gaps that fit light up in the diary
//   2 she taps 11:30: the booking flies from her phone into the diary, at its real length
//   3 the owner does nothing: it is already in her day
//   4 the owner closes 16:00–18:00: Li's booking is lifted out of the diary, not deleted
//   5 Li picks a new time on her own phone
// The screens are simplified on purpose; the real screens are in the screen map below.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const hm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const T0 = 600, T1 = 1110; // 10:00 – 18:30

const DAY = [
  { id: 'chen', n: ['Chen', '陈'], s: ['men’s cut', '男士'], a: 600, l: 30 },
  { id: 'emma', n: ['Emma', 'Emma'], s: ['women’s cut', '女士'], a: 630, l: 60 },
  { id: 'wang', n: ['Wang', '王阿姨'], s: ['women’s cut ×2', '女士 ×2'], a: 720, l: 120 },
  { id: 'gao', n: ['Gao', '高'], s: ['women’s cut', '女士'], a: 900, l: 60 },
  { id: 'li', n: ['Li', '李'], s: ['women’s cut', '女士'], a: 990, l: 60 }
];
const GAPS = [690, 840, 960, 1050]; // free starts that fit 30 minutes
const STEPS = [
  { t: ['She picks a service first.', '她先选服务。'], b: ['Only the gaps that fit 30 minutes light up in the diary.', '日程里只有放得下 30 分钟的空档会亮起来。'] },
  { t: ['She taps 11:30.', '她点了 11:30。'], b: ['The booking goes straight into the shared diary, at its real length.', '预约直接进入共享日程，按真实时长占位。'] },
  { t: ['The owner does nothing.', '店主什么都不用做。'], b: ['It is already in her day. No message, nothing to copy into a book.', '它已经在她的一天里了。不用回消息，也不用抄进本子。'] },
  { t: ['She closes 16:00–18:00.', '她临时关掉 16:00–18:00。'], b: ['Li’s booking is lifted out of the diary, not deleted.', '李的预约被移出日程，而不是删除。'] },
  { t: ['Li picks a new time herself.', '李自己选了新时间。'], b: ['Same service, a new slot. Nobody had to chase anyone.', '服务不变，换个时段。谁也不用追着谁问。'] }
];
const TX = {
  k: ['12:10 · One diary, two views', '12:10 · 一本日程，两种视图'], t: ['Everyone looks at the same diary.', '所有人看的，是同一本日程。'],
  stamp: ['Simplified screens · the real ones are in the screen map', '简化示意 · 真实界面见下方界面地图'],
  cust: ['Customer’s phone', '顾客的手机'], diary: ['The shared diary', '共享日程'], owner: ['Owner’s phone', '店主的手机'],
  book: ['Book', '预约'], choose: ['Choose a service', '选择服务'], svc: [['Men’s cut', '男士'], ['Women’s cut', '女士']],
  times: ['Times that fit', '放得下的时间'], booked: ['Booked', '已约好'], today: ['Today', '今天'],
  closed: ['Closed', '已关闭'], resched: ['needs a new time', '需要重选时间'], mine: ['My bookings', '我的预约'], pick: ['New time', '新时间'], tue: ['Tue 10:00 · women’s cut', '周二 10:00 · 女士'],
  mia: ['Mia', 'Mia'], short: ['men’s cut', '男士'], skip: ['Skip ↓', '跳过 ↓'], newb: ['new', '新']
};
export const CHARS = () => [...Object.values(TX).flat(2), ...STEPS.flatMap(s => [...s.t, ...s.b])].join('');

export function mountFlow(root, before) {
  const sec = document.createElement('section'); sec.className = 'bk-flow2';
  const pct = m => ((m - T0) / (T1 - T0) * 100).toFixed(3) + '%';
  const len = l => (l / (T1 - T0) * 100).toFixed(3) + '%';
  const rows = [...DAY.slice(0, 2), { id: 'mia', a: 690 }, ...DAY.slice(2)];
  sec.innerHTML = `<div class="bk-f2-pin">
    <div class="bk-f2-top"><div class="bk-f2-head"><p class="bk-hand-k"></p><p class="bk-hand-t" role="heading" aria-level="2"></p></div>
      <div class="bk-f2-cap" aria-live="polite"><p class="bk-f2-n"></p><p class="bk-f2-t"></p><p class="bk-f2-b"></p><ol class="bk-f2-dots">${STEPS.map(() => '<li></li>').join('')}</ol></div></div>
    <div class="bk-f2-stage">
      <div class="bk-f2-col"><p class="bk-f2-who"><i class="is-c"></i><span class="l-cust"></span></p>
        <div class="bk-f2-phone">
          <div class="bk-f2-view v-book"><p class="bk-f2-bar l-book"></p><p class="bk-f2-lab l-choose"></p>
            <div class="bk-f2-svc">${[0, 1].map(i => `<span class="${i ? '' : 'is-pick'}"><b class="l-svc${i}"></b><em>${[30, 60][i]}′</em></span>`).join('')}</div>
            <p class="bk-f2-lab l-times"></p><div class="bk-f2-times">${GAPS.map(g => `<span data-t="${g}">${hm(g)}</span>`).join('')}</div>
            <div class="bk-f2-ok"><b class="l-booked"></b><span>${hm(690)}–${hm(720)} · <i class="l-short"></i></span></div></div>
          <div class="bk-f2-view v-li"><p class="bk-f2-bar l-mine"></p><div class="bk-f2-card is-amber"><b>16:30 · <i class="l-li"></i></b><span class="l-resched"></span></div><p class="bk-f2-lab l-pick"></p><div class="bk-f2-card is-ok"><b class="l-tue"></b></div></div>
        </div></div>
      <div class="bk-f2-col is-mid"><p class="bk-f2-who"><i class="is-d"></i><span class="l-diary"></span></p>
        <div class="bk-f2-diary">${Array.from({ length: 9 }, (_, i) => `<i class="bk-f2-h" style="top:${pct(600 + i * 60)}"><b>${10 + i}:00</b></i>`).join('')}
          ${GAPS.map(g => `<i class="bk-f2-gap" style="top:${pct(g)};height:${len(30)}"></i>`).join('')}
          ${DAY.map(d => `<div class="bk-f2-blk" data-id="${d.id}" style="top:${pct(d.a)};height:${len(d.l)}"><b class="l-n-${d.id}"></b><span class="l-s-${d.id}"></span></div>`).join('')}
          <div class="bk-f2-blk is-new" style="top:${pct(690)};height:${len(30)}"><b class="l-mia"></b><span class="l-short"></span></div>
          <div class="bk-f2-close" style="top:${pct(960)};height:${len(120)}"><b class="l-closed"></b><span>16:00–18:00</span></div>
        </div></div>
      <div class="bk-f2-col"><p class="bk-f2-who"><i class="is-o"></i><span class="l-owner"></span></p>
        <div class="bk-f2-phone"><p class="bk-f2-bar l-today"></p>
          <ul class="bk-f2-list">${rows.map(d => `<li data-id="${d.id}"><time>${hm(d.a)}</time><b class="l-n-${d.id}"></b><em class="l-tag-${d.id}"></em></li>`).join('')}<li data-id="closed" class="is-closed"><time>16:00</time><b class="l-closed"></b><em>–18:00</em></li></ul>
        </div></div>
      <div class="bk-f2-fly" aria-hidden="true"><b class="l-mia"></b><span>${hm(690)}–${hm(720)}</span></div>
      <div class="bk-f2-fly is-li" aria-hidden="true"><b class="l-li"></b><span>16:30–17:30</span></div>
    </div>
    <p class="bk-f2-foot"><span class="bk-stamp"></span><a class="bk-skip bk-f2-skip" href="#"></a></p></div>`;
  before.before(sec);
  const $ = s => sec.querySelector(s), $$ = s => [...sec.querySelectorAll(s)];
  const set = (cls, v) => $$('.' + cls).forEach(e => { e.textContent = v; });
  let p = 0, shown = -1, lastStep = -1, last = performance.now();
  const text = () => {
    $('.bk-hand-k').textContent = L(TX.k); $('.bk-hand-t').textContent = L(TX.t); $('.bk-stamp').textContent = L(TX.stamp);
    set('l-cust', L(TX.cust)); set('l-diary', L(TX.diary)); set('l-owner', L(TX.owner)); set('l-book', L(TX.book)); set('l-today', L(TX.today)); set('l-choose', L(TX.choose));
    TX.svc.forEach((v, i) => set('l-svc' + i, L(v)));
    set('l-times', L(TX.times)); set('l-booked', L(TX.booked)); set('l-short', L(TX.short)); set('l-mia', L(TX.mia)); set('l-closed', L(TX.closed));
    set('l-mine', L(TX.mine)); set('l-resched', L(TX.resched)); set('l-pick', L(TX.pick)); set('l-tue', L(TX.tue)); set('l-li', L(DAY[4].n));
    DAY.forEach(d => { set('l-n-' + d.id, L(d.n)); set('l-s-' + d.id, L(d.s)); }); set('l-n-mia', L(TX.mia)); set('l-tag-mia', L(TX.newb)); set('l-tag-li', L(TX.resched));
    $('.bk-f2-skip').textContent = L(TX.skip); shown = -1; lastStep = -1;
  };
  $('.bk-f2-skip').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: sec.getBoundingClientRect().bottom + scrollY - innerHeight * .1, behavior: 'smooth' }); });
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches; if (calm) p = 1;
  text(); document.addEventListener('portfolio:language', text);
  const stage = $('.bk-f2-stage'), fly = $('.bk-f2-fly'), flyLi = $('.bk-f2-fly.is-li');
  const rel = el => { const a = el.getBoundingClientRect(), b = stage.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
  const move = (el, A, B, k, lift) => { el.style.opacity = 1; el.style.width = (A.w + (B.w - A.w) * k).toFixed(1) + 'px'; el.style.height = (A.h + (B.h - A.h) * k).toFixed(1) + 'px'; el.style.transform = `translate(${(A.x + (B.x - A.x) * k).toFixed(1)}px,${(A.y + (B.y - A.y) * k - Math.sin(k * Math.PI) * lift).toFixed(1)}px)`; };
  function draw() {
    const s = clamp(p * 5, 0, 4.999), i = Math.floor(s), k = s - i;
    if (i !== lastStep) {
      lastStep = i; const st = STEPS[i];
      $('.bk-f2-n').textContent = `0${i + 1} / 05`; $('.bk-f2-t').textContent = L(st.t); $('.bk-f2-b').textContent = L(st.b);
      const cap = $('.bk-f2-cap'); cap.classList.remove('is-swap'); void cap.offsetWidth; cap.classList.add('is-swap');
      $$('.bk-f2-dots li').forEach((d, j) => d.classList.toggle('is-on', j <= i));
    }
    sec.classList.toggle('s-fit', i === 0 || (i === 1 && k < .5));
    sec.classList.toggle('s-tap', i === 1 && k < .2);
    sec.classList.toggle('s-booked', i > 1 || (i === 1 && k > .62));
    sec.classList.toggle('s-owner', i >= 2);
    sec.classList.toggle('s-closed', i >= 3);
    sec.classList.toggle('s-lifted', i > 3 || (i === 3 && k > .45));
    sec.classList.toggle('s-li', i >= 4);
    sec.classList.toggle('s-moved', i >= 4 && k > .62);
    if (i === 1 && k > .15 && k < .66) move(fly, rel($('.bk-f2-times [data-t="690"]')), rel($('.bk-f2-blk.is-new')), ease((k - .15) / .51), 60); else fly.style.opacity = 0;
    if (i === 4 && k < .62) move(flyLi, rel($('.bk-f2-blk[data-id="li"]')), rel($('.bk-f2-card.is-amber')), ease(clamp(k / .6)), 50); else flyLi.style.opacity = 0;
  }
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.08, (now - last) / 1000); last = now;
    const r = sec.getBoundingClientRect(), vh = innerHeight; if (r.bottom < -vh || r.top > vh * 2) return;
    const target = calm ? 1 : clamp(-r.top / Math.max(1, r.height - vh));
    p += (target - p) * (1 - Math.exp(-dt * 5));
    if (Math.abs(p - shown) > .0004) { shown = p; draw(); }
  };
  requestAnimationFrame(tick);
  return sec;
}

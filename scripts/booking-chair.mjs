// Glasgow Salon Booking — "You're in the chair."
// The reader is the customer. Scrolling is the haircut. At four points her phone goes off: a call or a message drops
// over the page, the scene buzzes and blurs, and the haircut stops moving while you keep scrolling. Each interruption
// adds a red slice to the time bar, the clock jumps, and the next customer's start slips. Light, on the paper —
// the interruption is the event, not the frame.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// at = scroll progress where it fires; mins = time she spends on it
const HITS = [
  { at: .18, kind: 'call', who: ['Emma', 'Emma'], what: ['WeChat voice call', '微信语音通话'], she: ['Hello? …OK, twenty minutes late, fine.', '喂？……好，晚二十分钟是吧。'], mins: 3 },
  { at: .38, kind: 'msg', who: ['Mrs Li', '李阿姨'], what: ['Can I move to 3 o’clock?', '能改到三点吗？'], she: ['Three… let me check the book…', '三点……我翻翻本子……'], mins: 4 },
  { at: .58, kind: 'call', who: ['Unknown number', '陌生号码'], what: ['Incoming call', '来电'], she: ['Sunday? I’ll let you know later.', '周日？我回头告诉你。'], mins: 3 },
  { at: .78, kind: 'msg', who: ['Mr He', '何先生'], what: ['What time was I booked again?', '我约的是几点来着？'], she: ['You were… hold on…', '你是……等一下……'], mins: 4 }
];
const T = {
  k: ['What the time line can’t show', '时间轴画不出来的'], t: ['You’re in the chair.', '现在，你坐在这把椅子上。'],
  lead: ['Scroll to get your haircut. Her phone is on the counter.', '往下滚，开始剪头发。她的手机就放在台面上。'],
  stamp: ['Illustrative · not a real customer', '示意 · 非真实顾客'],
  you: ['You', '你'], svc: ['Haircut · booked 14:00–14:30', '剪发 · 预约 14:00–14:30'],
  done: ['haircut done', '已剪完'], next: ['Next: Ella, booked 14:30', '下一位：Ella，约了 14:30'],
  ontime: ['on time', '准时'], bookedEnd: ['booked end', '原定结束'],
  sorry: ['Sorry, one sec —', '不好意思，我接一下——'],
  onPhone: ['She’s on the phone', '她在接电话'], replying: ['She’s typing a reply', '她在回消息'],
  sum1: ['Your 30-minute haircut took', '你 30 分钟的剪发，坐了'],
  sum2: ['on other people’s bookings', '花在别人的预约上'],
  sum3: ['late start for Ella', 'Ella 晚开始'],
  sum4: ['None of these were about your haircut. Every one was a booking question a shared calendar could answer.', '这些事没有一件是关于你的头发，每一件都是一本共享预约表就能回答的问题。'],
  skip: ['Skip ↓', '跳过 ↓'], min: ['min', '分钟']
};
export const CHARS = () => [...Object.values(T).flat(), ...HITS.flatMap(h => [...h.who, ...h.what, ...h.she]), '0123456789:%…?!—+'].join('');

export function mountChair(root) {
  const board = root.querySelector('.bk-dom[data-mode="old"]'); if (!board || root.querySelector('.bk-chair')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.createElement('section'); sec.className = 'bk-chair bk-ch2';
  sec.innerHTML = `<div class="bk-ch2-pin">
    <div class="bk-hand-head"><p class="bk-hand-k"></p><p class="bk-hand-t" role="heading" aria-level="3"></p><p class="bk-ch2-lead"></p><span class="bk-stamp"></span></div>
    <div class="bk-ch2-card">
      <div class="bk-ch2-top">
        <p class="bk-ch2-me"><i class="bk-ch2-av is-you" aria-hidden="true"></i><span><b class="bk-ch2-you"></b><small class="bk-ch2-svc"></small></span></p>
        <p class="bk-ch2-clock"><b>14:00</b></p>
      </div>
      <div class="bk-ch2-bar" aria-hidden="true"><div class="bk-ch2-fill"></div><i class="bk-ch2-mark"><span class="bk-ch2-mark-l"></span></i></div>
      <div class="bk-ch2-meta"><span><b class="bk-ch2-pct">0%</b> <span class="bk-ch2-done"></span></span><span class="bk-ch2-next"><span class="bk-ch2-next-t"></span> · <b class="bk-ch2-late"></b></span></div>
      <div class="bk-ch2-owner"><i class="bk-ch2-av is-owner" aria-hidden="true"></i><p class="bk-ch2-say"></p></div>
      <ol class="bk-ch2-log" aria-live="polite"></ol>
      <div class="bk-ch2-sum"><p class="bk-ch2-sum-a"></p><p class="bk-ch2-sum-big"><b></b> <span></span></p>
        <div class="bk-ch2-sum-row"><p><b class="r1"></b> <span></span></p><p><b class="r2"></b> <span></span></p></div><p class="bk-ch2-sum-t"></p></div>
    </div>
    <a class="bk-ch2-skip" href="#"></a>
  </div>
  <div class="bk-ch2-pop" aria-hidden="true" hidden>
    <div class="bk-ch2-note"><i class="bk-ch2-app" aria-hidden="true"></i><div><small class="bk-ch2-what"></small><b class="bk-ch2-who"></b><span class="bk-ch2-msg"></span></div><span class="bk-ch2-ring" aria-hidden="true"></span></div>
    <div class="bk-ch2-busy"><i></i><span class="bk-ch2-busy-t"></span><b class="bk-ch2-busy-m"></b></div>
  </div>`;
  board.after(sec);
  root.querySelector('.bk-story-board')?.remove();
  const $ = s => sec.querySelector(s), pop = $('.bk-ch2-pop');

  // scroll is time. Cutting windows move the haircut on; interruption windows freeze it while the red slice grows.
  // Nothing has to be clicked: the page rings, shakes and blurs as you scroll through, then lets you go.
  const W = [];
  { let x = 0; const cut = .1, hit = .1; HITS.forEach((h, i) => { W.push({ cut: [x, x + cut], from: i ? HITS[i - 1].at : 0, to: h.at }); x += cut; W.push({ hit: i, w: [x, x + hit] }); x += hit; }); W.push({ cut: [x, .95], from: HITS[HITS.length - 1].at, to: 1 }); }
  let p = calm ? 1 : 0, active = -1, logged = -1;
  const total = HITS.reduce((a, h) => a + h.mins, 0);
  const state = () => {
    let cut = 0; const hk = HITS.map(() => 0); let act = -1, ak = 0;
    W.forEach(w => {
      if (w.cut) { const k = clamp((p - w.cut[0]) / (w.cut[1] - w.cut[0])); if (k > 0) cut = w.from + (w.to - w.from) * k; }
      else { const k = clamp((p - w.w[0]) / (w.w[1] - w.w[0])); hk[w.hit] = k; if (k > 0 && k < 1) { act = w.hit; ak = k; } }
    });
    return { cut, hk, act, ak };
  };

  const fill = i => {
    const h = HITS[i];
    pop.dataset.kind = h.kind;
    $('.bk-ch2-what').textContent = h.kind === 'msg' ? 'WeChat' : L(h.what);
    $('.bk-ch2-who').textContent = L(h.who);
    $('.bk-ch2-msg').textContent = h.kind === 'msg' ? L(h.what) : '';
    $('.bk-ch2-app').textContent = L(h.who).slice(0, 1);
    $('.bk-ch2-busy-t').textContent = h.kind === 'msg' ? L(T.replying) : L(T.onPhone);
  };
  const text = () => {
    $('.bk-hand-k').textContent = L(T.k); $('.bk-hand-t').textContent = L(T.t); $('.bk-ch2-lead').textContent = L(T.lead); $('.bk-stamp').textContent = L(T.stamp);
    $('.bk-ch2-you').textContent = L(T.you); $('.bk-ch2-svc').textContent = L(T.svc); $('.bk-ch2-done').textContent = L(T.done);
    $('.bk-ch2-next-t').textContent = L(T.next); $('.bk-ch2-mark-l').textContent = L(T.bookedEnd) + ' 14:30';
    $('.bk-ch2-skip').textContent = L(T.skip);
    $('.bk-ch2-sum-a').textContent = L(T.sum1); $('.bk-ch2-sum-big b').textContent = 30 + total; $('.bk-ch2-sum-big span').textContent = L(T.min);
    $('.bk-ch2-sum-row .r1').textContent = total + ' ' + L(T.min); $('.bk-ch2-sum-row .r1 + span').textContent = L(T.sum2);
    $('.bk-ch2-sum-row .r2').textContent = '+' + total + ' ' + L(T.min); $('.bk-ch2-sum-row .r2 + span').textContent = L(T.sum3);
    $('.bk-ch2-sum-t').textContent = L(T.sum4);
    if (active >= 0) fill(active);
    logged = -1; active = -2; draw();
  };

  const logRow = i => {
    const h = HITS[i], at = Math.floor(h.at * 30 + HITS.slice(0, i).reduce((a, x) => a + x.mins, 0));
    return `<li class="is-${h.kind}"><time>14:${String(at).padStart(2, '0')}</time><span>${L(h.who)} · ${L(h.what)}</span><b>+${h.mins} ${L(T.min)}</b></li>`;
  };

  // the bar spans 48 minutes; cutting slices are green, interruptions red, in the order they happened
  const SCALE = 48;
  function draw() {
    const S = state(), cutDone = S.cut * 30, segs = []; let prev = 0, extra = 0;
    HITS.forEach((h, i) => {
      if (S.hk[i] <= 0) return;
      const c = h.at * 30; segs.push(['cut', Math.max(0, c - prev)]); prev = c;
      const m = h.mins * clamp((S.hk[i] - .15) / .8); segs.push(['call', m]); extra += m;
    });
    segs.push(['cut', Math.max(0, cutDone - prev)]);
    const f = $('.bk-ch2-fill');
    if (f.children.length !== segs.length) f.innerHTML = segs.map(s => `<i class="is-${s[0]}"></i>`).join('');
    segs.forEach((s, i) => { f.children[i].style.width = (s[1] / SCALE * 100) + '%'; });
    const mm = Math.floor(cutDone + extra);
    $('.bk-ch2-clock b').textContent = `${14 + Math.floor(mm / 60)}:${String(mm % 60).padStart(2, '0')}`;
    $('.bk-ch2-pct').textContent = Math.round(S.cut * 100) + '%';
    const late = Math.round(extra);
    $('.bk-ch2-late').textContent = late ? `+${late} ${L(T.min)}` : L(T.ontime);
    $('.bk-ch2-next').classList.toggle('is-late', late > 0);
    $('.bk-ch2-mark').style.left = (30 / SCALE * 100) + '%';
    // the interruption: rings (whole scene buzzes), then she's busy (blur, timer), then it slides away
    const act = S.act, k = S.ak;
    if (act !== active) {
      active = act;
      if (act >= 0) { fill(act); pop.hidden = false; void pop.offsetWidth; pop.classList.add('is-in'); $('.bk-ch2-say').textContent = L(T.sorry); }
      else { pop.classList.remove('is-in', 'is-busy'); }
      $('.bk-ch2-owner').classList.toggle('is-on', act >= 0);
    }
    const on = act >= 0 && k < .92;
    pop.classList.toggle('is-in', on);
    sec.classList.toggle('is-hit', on);
    sec.classList.toggle('is-ring', act >= 0 && k < .3);
    if (act >= 0) {
      const busy = k >= .3; pop.classList.toggle('is-busy', busy);
      if (busy) { $('.bk-ch2-say').textContent = '“' + L(HITS[act].she) + '”'; const s2 = Math.round(clamp((k - .3) / .62) * HITS[act].mins * 60); $('.bk-ch2-busy-m').textContent = `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, '0')}`; }
      else $('.bk-ch2-say').textContent = L(T.sorry);
    }
    const done = S.hk.filter(v => v >= .92).length;
    if (done !== logged) { logged = done; $('.bk-ch2-log').innerHTML = HITS.slice(0, done).map((_, i) => logRow(i)).join(''); }
    sec.classList.toggle('is-end', p > .96);
  }
  $('.bk-ch2-skip').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: sec.getBoundingClientRect().bottom + scrollY - innerHeight * .2, behavior: 'smooth' }); });

  text();
  document.addEventListener('portfolio:language', text);
  if (calm) { p = 1; draw(); return; }

  let last = performance.now();
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.08, (now - last) / 1000); last = now;
    const r = sec.getBoundingClientRect(), vh = innerHeight; if (r.bottom < -vh || r.top > vh * 2) return;
    const target = clamp(-r.top / Math.max(1, r.height - vh));
    const np = p + (target - p) * (1 - Math.exp(-dt * 7));
    if (Math.abs(np - p) > .0003) { p = np; draw(); }
  };
  requestAnimationFrame(tick);
}

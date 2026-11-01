// Glasgow Salon Booking — "You're in the chair."
// A first-person scene that replaces the four-panel storyboard: you sit in front of the salon mirror and scroll is the
// time of your haircut. Your hair gets cut while you scroll… until the phone rings. Then nothing moves: the progress bar
// freezes, the minutes keep counting, she talks to someone else, and your face changes. Four calls, then the bill of
// minutes. The reader feels the interruption by scrolling and getting nowhere.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t * t * (3 - 2 * t);

// the haircut as segments of scroll: cutting (progress moves) and calls (progress frozen)
const SEG = [
  { cut: [0, 25], w: [0, .13] },
  { call: 0, w: [.13, .27] },
  { cut: [25, 45], w: [.27, .37] },
  { call: 1, w: [.37, .52] },
  { cut: [45, 60], w: [.52, .61] },
  { call: 2, w: [.61, .76] },
  { cut: [60, 72], w: [.76, .83] },
  { call: 3, w: [.83, .95] },
  { cut: [72, 100], w: [.95, 1], end: true }
];
const CALLS = [
  { who: ['Emma', 'Emma'], what: ['running 20 min late!', '我要晚 20 分钟！'], she: ['Hello? …OK, twenty minutes.', '喂？……好，晚二十分钟。'], you: ['…', '……'], mins: 3 },
  { who: ['Mrs Li', '李阿姨'], what: ['can I move to 3?', '能改到三点吗？'], she: ['Three? Let me check the book…', '三点？我翻翻本子……'], you: ['again?', '又来？'], mins: 4 },
  { who: ['Unknown number', '陌生号码'], what: ['are you open Sunday?', '周日开门吗？'], she: ['Sunday… I’ll let you know.', '周日……我回头告诉你。'], you: ['my hair is drying like this', '头发都快这样干了'], mins: 3 },
  { who: ['Mr He', '何先生'], what: ['what time was I booked?', '我约的是几点来着？'], she: ['You were… hold on…', '你是……等一下……'], you: ['I need to be back at work by 2', '我两点前得回去上班'], mins: 4 }
];
const T = {
  k: ['What the time line can’t show', '时间轴画不出来的'], t: ['You’re in the chair.', '现在，你坐在这把椅子上。'],
  lead: ['Scroll to get your haircut.', '往下滚，开始剪头发。'],
  stamp: ['Illustrative · not a real customer', '示意 · 非真实顾客'],
  cut: ['Your haircut', '你的头发'], chair: ['In the chair', '你已经坐了'], planned: ['booked for 30 min', '原定 30 分钟'],
  call: ['WeChat voice call…', '微信语音通话……'], paused: ['Paused · she’s on the phone', '暂停 · 她在接电话'],
  sumT: ['Your 30-minute haircut took', '你的 30 分钟理发，用了'], sumCalls: ['calls answered mid-cut', '次剪到一半接电话'], sumMins: ['minutes of your haircut spent on other people’s bookings', '分钟，花在别人的预约上'],
  min: ['min', '分钟']
};
export const CHARS = () => [...Object.values(T).flat(), ...CALLS.flatMap(c => [...c.she, ...c.you, ...c.what, ...c.who]), '0123456789%…?!'].join('');

const ink = '#27408f', red = '#d0453b';
const strands = [0, 1, 2, 3, 4, 5].map(i => { const x0 = 352 + i * 5, y0 = 250 + i * 4; return `M${x0} ${y0} Q${x0 - 34 + i * 3} ${y0 + 80} ${x0 - 14 + i * 5} ${y0 + 165 - i * 6}`; });

export function mountChair(root) {
  const board = root.querySelector('.bk-dom[data-mode="old"]'); if (!board || root.querySelector('.bk-chair')) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.createElement('section'); sec.className = 'bk-chair';
  sec.innerHTML = `<div class="bk-chair-pin">
    <div class="bk-hand-head"><p class="bk-hand-k"></p><p class="bk-hand-t" role="heading" aria-level="3"></p><p class="bk-chair-lead"></p><span class="bk-stamp"></span></div>
    <div class="bk-chair-stage">
      <div class="bk-c-frame" aria-hidden="true"><i class="bk-c-glow"></i>
        <svg class="bk-c-dial" viewBox="0 0 600 600">
          <circle class="bk-c-track" cx="300" cy="300" r="250"/><circle class="bk-c-track is-in" cx="300" cy="300" r="214"/>
          <g class="bk-c-ticks">${Array.from({ length: 45 }, (_, i) => { const a = (i / 45) * Math.PI * 2 - Math.PI / 2, r0 = i % 5 ? 262 : 258, r1 = 270; return `<path d="M${(300 + Math.cos(a) * r0).toFixed(1)} ${(300 + Math.sin(a) * r0).toFixed(1)} L${(300 + Math.cos(a) * r1).toFixed(1)} ${(300 + Math.sin(a) * r1).toFixed(1)}"/>`; }).join('')}</g>
          <g class="bk-c-arcs"></g><path class="bk-c-cut"/>
          <path class="bk-c-booked" d="M300 22 L300 50"/><text class="bk-c-booked-t" x="0" y="0"></text>
        </svg>
        <div class="bk-c-center"><p class="bk-c-state"></p><p class="bk-c-big"><b class="bk-c-min">0</b><span class="bk-c-unit"></span></p><p class="bk-c-sub"></p></div>
        <p class="bk-c-booked-l"></p>
      </div>
      <div class="bk-chair-hud"><p><span class="bk-c-l1"></span><b class="bk-c-pct">0%</b></p><i class="bk-c-bar"><b></b></i><p class="bk-c-time"><span class="bk-c-l2"></span><b class="bk-c-min">0</b> <span class="bk-c-l3"></span></p><p class="bk-c-paused"></p></div>
      <div class="bk-call" role="status"><i class="bk-call-av" aria-hidden="true"></i><div><b class="bk-call-who"></b><span class="bk-call-what"></span><small class="bk-call-tag"></small></div><span class="bk-call-btns" aria-hidden="true"><i></i><i></i></span></div>
      <p class="bk-c-she bk-w is-red"></p><p class="bk-c-you-say bk-w"></p>
      <div class="bk-c-sum"><p class="bk-c-sum-t"></p><p class="bk-c-sum-big"><b class="bk-c-sum-min">44</b> <span></span></p><p class="bk-c-sum-row"><b>4</b> <span class="bk-c-sum-calls"></span></p><p class="bk-c-sum-row"><b>14</b> <span class="bk-c-sum-mins"></span></p></div>
    </div></div>`;
  board.after(sec);
  // the old storyboard is replaced by this scene
  root.querySelector('.bk-story-board')?.remove();
  const $ = s => sec.querySelector(s);
  const text = () => {
    $('.bk-hand-k').textContent = L(T.k); $('.bk-hand-t').textContent = L(T.t); $('.bk-chair-lead').textContent = L(T.lead); $('.bk-stamp').textContent = L(T.stamp);
    $('.bk-c-l1').textContent = L(T.cut) + ' '; $('.bk-c-l2').textContent = L(T.chair) + ' '; $('.bk-c-l3').textContent = L(T.min) + ' · ' + L(T.planned); $('.bk-c-unit').textContent = ' ' + L(T.min); $('.bk-c-booked-l').textContent = ''; $('.bk-c-booked-t').textContent = L(T.planned); $('.bk-c-paused').textContent = L(T.paused);
    $('.bk-call-tag').textContent = L(T.call); $('.bk-c-sum-t').textContent = L(T.sumT); $('.bk-c-sum-big span').textContent = L(T.min); $('.bk-c-sum-calls').textContent = L(T.sumCalls); $('.bk-c-sum-mins').textContent = L(T.sumMins);
    lastCall = -2;
  };
  let lastCall = -2, p = calm ? 1 : 0, shown = -1, last = performance.now();
  text(); document.addEventListener('portfolio:language', text);
  // the dial: outer ring = minutes in the chair (45 around; the cut in white, each phone call in red),
  // inner ring = how much of your haircut is done. The booked 30 minutes are marked at the top.
  const NSs = 'http://www.w3.org/2000/svg', arcsG = $('.bk-c-arcs'), arcs = SEG.map(sg => { const e = document.createElementNS(NSs, 'path'); e.setAttribute('class', sg.call !== undefined ? 'is-call' : 'is-cut'); arcsG.append(e); return e; });
  const arc = (r, m0, m1) => { if (m1 - m0 < .02) return ''; const a0 = m0 / 45 * Math.PI * 2 - Math.PI / 2, a1 = m1 / 45 * Math.PI * 2 - Math.PI / 2, big = m1 - m0 > 22.5 ? 1 : 0; return `M${(300 + Math.cos(a0) * r).toFixed(2)} ${(300 + Math.sin(a0) * r).toFixed(2)} A${r} ${r} 0 ${big} 1 ${(300 + Math.cos(a1) * r).toFixed(2)} ${(300 + Math.sin(a1) * r).toFixed(2)}`; };
  const bp = 30 / 45 * Math.PI * 2 - Math.PI / 2; { const tt = $('.bk-c-booked-t'); tt.setAttribute('x', (300 + Math.cos(bp) * 300).toFixed(1)); tt.setAttribute('y', (300 + Math.sin(bp) * 300 + 4).toFixed(1)); tt.setAttribute('text-anchor', 'end'); } $('.bk-c-booked').setAttribute('d', `M${(300 + Math.cos(bp) * 236).toFixed(1)} ${(300 + Math.sin(bp) * 236).toFixed(1)} L${(300 + Math.cos(bp) * 282).toFixed(1)} ${(300 + Math.sin(bp) * 282).toFixed(1)}`);
  function draw() {
    const seg = SEG.find(s => p >= s.w[0] && p < s.w[1]) || SEG[SEG.length - 1], k = clamp((p - seg.w[0]) / (seg.w[1] - seg.w[0]));
    let progress = 0, calls = 0, t = 0;
    SEG.forEach((s, i) => {
      const kk = p >= s.w[1] ? 1 : p < s.w[0] ? 0 : k;
      const len = s.cut ? 30 * (s.cut[1] - s.cut[0]) / 100 : CALLS[s.call].mins;
      arcs[i].setAttribute('d', arc(250, t, t + len * kk)); t += len * kk;
      if (s.cut && kk > 0) progress = s.cut[0] + (s.cut[1] - s.cut[0]) * kk;
      if (s.call !== undefined && kk > .2) calls++;
    });
    const onCall = seg.call !== undefined && k > .06 && k < .94 ? seg.call : -1;
    sec.classList.toggle('is-call', onCall >= 0);
    sec.classList.toggle('is-ring', onCall >= 0 && k < .3);
    sec.classList.toggle('is-end', !!seg.end && k > .5);
    $('.bk-c-cut').setAttribute('d', arc(214, 0, progress / 100 * 45));
    $('.bk-c-min').textContent = Math.round(t);
    $('.bk-c-state').textContent = onCall >= 0 ? L(T.paused) : L(T.chair);
    $('.bk-c-sub').textContent = `${L(T.cut)} ${Math.round(progress)}%`;
    $('.bk-c-pct').textContent = Math.round(progress) + '%'; $('.bk-c-bar b').style.width = progress + '%';
    if (onCall !== lastCall) {
      lastCall = onCall;
      if (onCall >= 0) { const cl = CALLS[onCall]; $('.bk-call-who').textContent = L(cl.who); $('.bk-call-what').textContent = L(cl.what); $('.bk-c-she').textContent = '— ' + L(cl.she); $('.bk-c-you-say').textContent = L(cl.you); $('.bk-call-av').textContent = L(cl.who).slice(0, 1); }
    }
    const total = CALLS.reduce((a, c) => a + c.mins, 0);
    $('.bk-c-sum-min').textContent = 30 + total; const rows = sec.querySelectorAll('.bk-c-sum-row b'); rows[0].textContent = CALLS.length; rows[1].textContent = total;
  }
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.08, (now - last) / 1000); last = now;
    const r = sec.getBoundingClientRect(), vh = innerHeight; if (r.bottom < -vh || r.top > vh * 2) return;
    const target = calm ? 1 : clamp(-r.top / Math.max(1, r.height - vh));
    p += (target - p) * (1 - Math.exp(-dt * 6));
    if (Math.abs(p - shown) > .0004) { shown = p; draw(); }
  };
  requestAnimationFrame(tick);
}

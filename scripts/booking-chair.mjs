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
  cut: ['Your haircut', '你的头发'], chair: ['In the chair', '已经坐了'], planned: ['booked for 30 min', '原定 30 分钟'],
  call: ['WeChat voice call…', '微信语音通话……'], paused: ['Paused: she’s on the phone', '暂停：她在接电话'],
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
      <svg viewBox="0 0 800 520" aria-hidden="true">
        <rect class="bk-c-mirror" x="170" y="22" width="460" height="470" rx="34"/>
        <path class="bk-c-glint" d="M205 70 L250 40 M205 100 L285 45"/>
        <g class="bk-c-you">
          <path class="bk-c-cape" d="M290 492 Q300 400 352 382 Q400 372 448 382 Q500 400 510 492"/>
          <circle cx="400" cy="300" r="60"/>
          <path d="M342 284 Q350 232 400 230 Q452 232 462 284"/>
          <path class="bk-c-short" d="M430 236 Q458 250 462 290 M446 244 Q460 262 458 300"/>
          ${strands.map((d, i) => `<path class="bk-c-strand" data-i="${i}" d="${d}"/>`).join('')}
          <path class="bk-c-brow bk-c-brow-l" d="M372 288 L392 286"/><path class="bk-c-brow bk-c-brow-r" d="M408 286 L428 288"/>
          <circle class="bk-c-eye" cx="382" cy="302" r="3"/><circle class="bk-c-eye" cx="418" cy="302" r="3"/>
          <path class="bk-c-mouth" d="M386 334 Q400 340 414 334"/>
        </g>
        <g class="bk-c-owner bk-c-cutting">
          <circle cx="548" cy="166" r="36"/><circle cx="568" cy="136" r="12"/>
          <path d="M548 202 L548 330 M508 226 Q548 210 588 226"/>
          <path d="M512 230 Q488 262 466 268"/>
          <path class="bk-c-scissors" d="M452 262 a6 6 0 1 0 .1 0 M452 280 a6 6 0 1 0 .1 0 M458 266 L478 250 M458 278 L480 256"/>
        </g>
        <g class="bk-c-owner bk-c-calling">
          <circle cx="560" cy="170" r="36"/><circle cx="584" cy="142" r="12"/>
          <path d="M556 206 L556 330 M516 230 Q556 214 596 230"/>
          <path d="M594 232 Q622 206 600 176"/><rect class="bk-c-phone" x="590" y="150" width="16" height="30" rx="4"/>
          <path d="M518 234 L508 322"/>
          <path class="bk-c-ring" d="M616 150 q8 10 0 20 M626 144 q12 16 0 32"/>
        </g>
        <path class="bk-c-shelf" d="M190 510 L610 510"/>
        <path class="bk-c-scissors bk-c-down" d="M236 503 a5 5 0 1 0 .1 0 M236 493 a5 5 0 1 0 .1 0 M241 501 L262 494 M241 495 L262 491"/>
      </svg>
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
    $('.bk-c-l1').textContent = L(T.cut) + ' '; $('.bk-c-l2').textContent = L(T.chair) + ' '; $('.bk-c-l3').textContent = L(T.min) + ' · ' + L(T.planned); $('.bk-c-paused').textContent = L(T.paused);
    $('.bk-call-tag').textContent = L(T.call); $('.bk-c-sum-t').textContent = L(T.sumT); $('.bk-c-sum-big span').textContent = L(T.min); $('.bk-c-sum-calls').textContent = L(T.sumCalls); $('.bk-c-sum-mins').textContent = L(T.sumMins);
    lastCall = -2;
  };
  let lastCall = -2, p = calm ? 1 : 0, shown = -1, last = performance.now();
  text(); document.addEventListener('portfolio:language', text);
  const strandEls = [...sec.querySelectorAll('.bk-c-strand')];
  const mouth = $('.bk-c-mouth'), browL = $('.bk-c-brow-l'), browR = $('.bk-c-brow-r');
  function draw() {
    // where in the haircut are we?
    const seg = SEG.find(s => p >= s.w[0] && p < s.w[1]) || SEG[SEG.length - 1], k = clamp((p - seg.w[0]) / (seg.w[1] - seg.w[0]));
    let progress = 0, calls = 0, callMins = 0;
    for (const s of SEG) {
      const kk = p >= s.w[1] ? 1 : p < s.w[0] ? 0 : k;
      if (s.cut && kk > 0) progress = s.cut[0] + (s.cut[1] - s.cut[0]) * kk;
      if (s.call !== undefined) { if (kk > .2) calls++; callMins += CALLS[s.call].mins * kk; }
    }
    const mins = 30 * progress / 100 + callMins; // the cut itself takes 30 minutes; every call adds to the time in the chair
    const onCall = seg.call !== undefined ? seg.call : -1;
    sec.classList.toggle('is-call', onCall >= 0 && k > .06 && k < .94);
    sec.classList.toggle('is-ring', onCall >= 0 && k > .06 && k < .3);
    sec.classList.toggle('is-end', !!seg.end);
    $('.bk-c-pct').textContent = Math.round(progress) + '%'; $('.bk-c-bar b').style.width = progress + '%';
    $('.bk-c-min').textContent = Math.round(mins);
    // the long strands on one side fall as the cut goes on
    strandEls.forEach((s, i) => { const gone = clamp((progress - (8 + i * 11)) / 6); s.style.opacity = 1 - gone; s.style.transform = `translateY(${(gone * 40).toFixed(1)}px)`; });
    // your face: patient, then less so
    const mood = clamp(calls / 4 + (onCall >= 0 ? k * .2 : 0));
    const c = 6 - mood * 14; mouth.setAttribute('d', `M386 ${334 + mood * 2} Q400 ${(334 + c).toFixed(1)} 414 ${334 + mood * 2}`);
    browL.setAttribute('d', `M372 ${288 + mood * 4} L392 ${286 - mood * 2}`); browR.setAttribute('d', `M408 ${286 - mood * 2} L428 ${288 + mood * 4}`);
    // the call itself
    if (onCall !== lastCall) {
      lastCall = onCall;
      if (onCall >= 0) { const cl = CALLS[onCall]; $('.bk-call-who').textContent = L(cl.who); $('.bk-call-what').textContent = L(cl.what); $('.bk-c-she').textContent = L(cl.she); $('.bk-c-you-say').textContent = L(cl.you); $('.bk-call-av').textContent = L(cl.who).slice(0, 1); }
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

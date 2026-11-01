// Glasgow Salon Booking — "her phone, while you read".
// While the reader goes through the problem half of the case, ordinary phone notifications turn up now and then —
// a message here, a call there, on either side of the page. Nothing explains them. The card being read gives a
// short buzz, like a phone vibrating on a counter, and the banner slides away by itself. Only when the case reaches
// the shared diary (10:00) do they come back, lined up: every one of them was someone asking about a time.
// The point lands late, on purpose. Nothing has to be clicked and scrolling is never held.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];

// at: [element, how far into it] — rings when that point crosses the middle of the screen
const HITS = [
  { at: ['.bk-hand[data-act="1"]', .18], side: 'r', kind: 'msg', who: ['Emma', 'Emma'], what: ['Running 20 min late, sorry!!', '我要晚 20 分钟，不好意思！！'], mins: 3 },
  { at: ['.bk-hand[data-act="1"]', .5], side: 'l', kind: 'call', who: ['Mrs Li', '李阿姨'], what: ['WeChat voice call', '微信语音通话'], mins: 4 },
  { at: ['.bk-hand[data-act="1"]', .8], side: 'r', kind: 'msg', who: ['Mrs Li', '李阿姨'], what: ['Can I move to 3 o’clock?', '能改到三点吗？'], mins: 3 },
  { at: ['.bk-dom[data-mode="old"]', .3], side: 'r', kind: 'missed', who: ['+44 7700 900…', '+44 7700 900…'], what: ['Missed call', '未接来电'], mins: 2 },
  { at: ['.bk-dom[data-mode="old"]', .62], side: 'l', kind: 'msg', who: ['Sun', '孙小姐'], what: ['Are you open Sunday?', '周日开门吗？'], mins: 3 },
  { at: ['#overview', .2], side: 'r', kind: 'msg', who: ['Mr He', '何先生'], what: ['What time was I booked again?', '我约的是几点来着？'], mins: 4 },
  { at: ['#overview', .55], side: 'l', kind: 'call', who: ['Zhou', '周先生'], what: ['Incoming call', '来电'], mins: 4 }
];
const STOP = ['.bk-moment[data-moment="system"]', .25];
const T = {
  sim: ['Illustrative', '示意'],
  k: ['Remember the messages that kept popping up?', '还记得刚才左右两边弹出来的消息吗？'],
  k0: ['A normal morning on her phone', '她平常的一个上午，手机会这样响'],
  a: ['While you read this page, her phone went off', '你读这一页的时候，她的手机响了'],
  a0: ['Her phone goes off', '手机响了'],
  times: [' times', ' 次'], cost: ['each one stops the haircut —', '每一次都让手上的剪发停下来，一共约'], min: ['min', '分钟'],
  after: ['With the shared diary', '有了共享预约本之后'],
  zero: ['calls or messages mid-cut', '次剪到一半去回消息'],
  c: ['Customers scan the QR code and book or change it themselves. Every one of those questions is answered on the site.', '顾客扫码自己约、自己改。刚才那些问题，网站上都有答案。'],
  close: ['Close', '关闭'], now: ['now', '现在']
};
export const CHARS = () => [...Object.values(T).flat(), ...HITS.flatMap(h => [...h.who, ...h.what]), '0123456789:×—…+'].join('');

export function mountChair(root) {
  if (document.querySelector('.bk-calls')) return;
  root.querySelector('.bk-story-board')?.remove();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The reckoning lives on the replay board ("the same day, with the diary"): the messages that popped up on the
  // left and right fly back in from those same sides and land here, next to what the shared diary does with them.
  const board = root.querySelector('.bk-dom[data-mode="new"] .bk-dom-card');
  const ui = document.createElement('div'); ui.className = 'bk-ledger';
  ui.innerHTML = `<div class="bk-ledger-before"><p class="bk-ledger-k"></p><p class="bk-ledger-t"></p><ol class="bk-ledger-list"></ol></div>
    <i class="bk-ledger-arrow" aria-hidden="true">→</i>
    <div class="bk-ledger-after"><p class="bk-ledger-k"></p><p class="bk-ledger-zero"><b>0</b><span></span></p><small></small></div>`;
  // on narrow screens the pinned card has no room for it: it follows the board instead
  const place = () => { if (!board) return; if (matchMedia('(max-width: 899px)').matches) { ui.classList.add('is-after'); board.closest('.bk-dom').after(ui); } else { ui.classList.remove('is-after'); board.querySelector('.bk-dom-stats')?.before(ui); } };
  place(); matchMedia('(max-width: 899px)').addEventListener('change', place);
  const $ = s => ui.querySelector(s);
  const seen = [], fired = new Set(); let done = false, live = 0;

  const icon = h => h.kind === 'msg' ? `<i class="bk-n-app is-wx" aria-hidden="true"></i>` : `<i class="bk-n-app is-ph" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg></i>`;
  // one notification banner: slides in on its side, stays a few seconds, slides away
  function banner(i) {
    const h = HITS[i], el = document.createElement('div');
    el.className = `bk-n is-${h.side} is-${h.kind}`; el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--slot', live);
    el.innerHTML = `${icon(h)}<div><small>${h.kind === 'msg' ? 'WeChat' : L(h.what)}<em>${L(T.now)}</em></small><b>${L(h.who)}</b>${h.kind === 'msg' ? `<span>${L(h.what)}</span>` : ''}</div>${h.kind === 'call' ? '<span class="bk-n-ring"></span>' : ''}<em class="bk-n-sim">${L(T.sim)}</em>`;
    document.body.append(el); live++;
    requestAnimationFrame(() => el.classList.add('is-in'));
    buzz(h.kind === 'call' ? 2 : 1);
    const stay = h.kind === 'call' ? 4200 : 3200;
    setTimeout(() => { el.classList.remove('is-in'); el.classList.add('is-out'); setTimeout(() => { el.remove(); live--; }, 500); }, stay);
    seen.push(i); fillSum();
  }
  // the card (or paper) in the middle of the screen gives a short phone-on-the-counter buzz
  const CARDS = '.bk-sheet,.bk-dom-card,.bk-receipt,.bk-owner,.bk-ask,.ux-blueprint,.ux-section-body>*';
  function buzz(times) {
    if (calm) return;
    const mid = innerHeight / 2; let best = null, bd = 1e9;
    for (const el of root.querySelectorAll(CARDS)) {
      const r = el.getBoundingClientRect(); if (r.bottom < 80 || r.top > innerHeight - 40 || r.height < 40) continue;
      const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bd) { bd = d; best = el; }
    }
    if (!best) return;
    best.classList.remove('bk-buzz', 'bk-buzz2'); void best.offsetWidth; best.classList.add(times > 1 ? 'bk-buzz2' : 'bk-buzz');
    setTimeout(() => best.classList.remove('bk-buzz', 'bk-buzz2'), 1400);
  }

  // filled in as the messages arrive; if the reader jumped past them, it shows a normal morning's messages instead
  function fillSum() {
    const real = seen.length >= 2, list = real ? seen : HITS.map((_, i) => i), m = list.reduce((a, i) => a + HITS[i].mins, 0);
    const [kb, ka] = ui.querySelectorAll('.bk-ledger-k');
    kb.textContent = real ? L(T.k) : L(T.k0); ka.textContent = L(T.after);
    $('.bk-ledger-t').innerHTML = `${real ? L(T.a) : L(T.a0)} <b>${list.length}${L(T.times)}</b> · ${L(T.cost)} <b>${m} ${L(T.min)}</b>`;
    $('.bk-ledger-list').innerHTML = list.map((i, k) => { const h = HITS[i]; return `<li class="is-${h.side}" style="--k:${k}">${icon(h)}<b>${L(h.who)}</b><span>${L(h.what)}</span><em>+${h.mins}′</em></li>`; }).join('');
    $('.bk-ledger-zero span').textContent = L(T.zero); $('.bk-ledger-after small').textContent = L(T.c);
  }
  fillSum(); document.addEventListener('portfolio:language', fillSum);
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ui.classList.add('is-in'); io.disconnect(); } }), { threshold: .4 }); io.observe(ui); } else ui.classList.add('is-in');

  const yOf = ([sel, f]) => { const el = document.querySelector(sel); if (!el) return Infinity; const r = el.getBoundingClientRect(); return r.top + scrollY + f * r.height; };
  // jumps from any in-page link (top nav, case map, skip) scroll smoothly through the triggers: don't ring on those
  let navAt = 0; document.addEventListener('click', e => { if (e.target.closest?.('a[href^="#"]')) navAt = performance.now(); }, true);
  let lastLine = scrollY + innerHeight * .5;
  const onScroll = () => {
    const line = scrollY + innerHeight * .5, down = line > lastLine, jump = line - lastLine > innerHeight * 1.2 || performance.now() - navAt < 2500;
    if (down && !done) {
      HITS.forEach((h, i) => {
        if (fired.has(i)) return; const y = yOf(h.at);
        if (y > lastLine && y <= line) { fired.add(i); if (!jump) banner(i); }
        else if (y <= lastLine) fired.add(i); // already past (reload, jump): never ring late
      });
      const ys = yOf(STOP);
      if (ys > lastLine && ys <= line) { done = true; }
      else if (ys <= lastLine) done = true;
    }
    lastLine = line;
  };
  requestAnimationFrame(() => { lastLine = scrollY + innerHeight * .5; onScroll(); addEventListener('scroll', onScroll, { passive: true }); });
}

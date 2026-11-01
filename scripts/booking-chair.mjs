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
  { at: ['.bk-hand[data-act="1"]', .18], side: 'r', kind: 'msg', who: ['Emma', 'Emma'], what: ['Running 20 min late, sorry!!', '我要晚 20 分钟，不好意思！！'] },
  { at: ['.bk-hand[data-act="1"]', .5], side: 'l', kind: 'call', who: ['Mrs Li', '李阿姨'], what: ['WeChat voice call', '微信语音通话'] },
  { at: ['.bk-hand[data-act="1"]', .8], side: 'r', kind: 'msg', who: ['Mrs Li', '李阿姨'], what: ['Can I move to 3 o’clock?', '能改到三点吗？'] },
  { at: ['.bk-dom[data-mode="old"]', .3], side: 'r', kind: 'missed', who: ['+44 7700 900…', '+44 7700 900…'], what: ['Missed call', '未接来电'] },
  { at: ['.bk-dom[data-mode="old"]', .62], side: 'l', kind: 'msg', who: ['Sun', '孙小姐'], what: ['Are you open Sunday?', '周日开门吗？'] },
  { at: ['#overview', .2], side: 'r', kind: 'msg', who: ['Mr He', '何先生'], what: ['What time was I booked again?', '我约的是几点来着？'] },
  { at: ['#overview', .55], side: 'l', kind: 'call', who: ['Zhou', '周先生'], what: ['Incoming call', '来电'] }
];
const STOP = ['.bk-moment[data-moment="system"]', .25];
const T = {
  sim: ['Illustrative', '示意'],
  k: ['Did you notice?', '你注意到了吗？'],
  a: ['While you read, her phone went off', '你读到这里，她的手机响了'],
  a0: ['A normal morning on her phone:', '她手机上，一个普通的上午：'],
  times: [' times', ' 次'],
  b: ['Every one was someone asking about a time — and she reads them with scissors in her hand, mid-cut.', '每一条都是有人在问时间。而她看到它们的时候，手里正拿着剪刀，剪到一半。'],
  c: ['From here on, customers scan a QR code and book themselves. These stop.', '从这里开始，顾客扫码自己预约。这些消息就不会再来了。'],
  close: ['Close', '关闭'], now: ['now', '现在']
};
export const CHARS = () => [...Object.values(T).flat(), ...HITS.flatMap(h => [...h.who, ...h.what]), '0123456789:×—…+'].join('');

export function mountChair(root) {
  if (document.querySelector('.bk-calls')) return;
  root.querySelector('.bk-story-board')?.remove();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the reveal is part of the page, right after 10:00 — it never floats over the text and needs no closing
  const ui = document.createElement('section'); ui.className = 'bk-calls bk-reveal'; ui.setAttribute('aria-label', '');
  ui.innerHTML = `<div class="bk-call-sum"><p class="bk-call-sum-k"></p><p class="bk-call-sum-a"></p><ol class="bk-call-sum-list"></ol><p class="bk-call-sum-b"></p><p class="bk-call-sum-c"></p></div>`;
  const anchor = root.querySelector('.bk-moment[data-moment="system"]'); if (anchor) anchor.after(ui); else return;
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

  // filled in as the messages arrive; if the reader skipped them, it shows the day's messages instead
  function fillSum() {
    const list = seen.length >= 2 ? seen : HITS.map((_, i) => i);
    $('.bk-call-sum-k').textContent = L(T.k);
    $('.bk-call-sum-a').innerHTML = seen.length >= 2 ? `${L(T.a)} <b>${seen.length}${L(T.times)}</b>` : L(T.a0);
    $('.bk-call-sum-list').innerHTML = list.map((i, k) => { const h = HITS[i]; return `<li class="is-${h.kind}" style="--k:${k}">${icon(h)}<b>${L(h.who)}</b><span>${L(h.what)}</span></li>`; }).join('');
    $('.bk-call-sum-b').textContent = L(T.b); $('.bk-call-sum-c').textContent = L(T.c);
  }
  function showSum() { fillSum(); ui.classList.add('is-sum'); }
  fillSum(); document.addEventListener('portfolio:language', fillSum);
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { showSum(); io.disconnect(); } }), { rootMargin: '0px 0px -25% 0px' }); io.observe(ui); } else showSum();

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
      if (ys > lastLine && ys <= line) { done = true; fillSum(); }
      else if (ys <= lastLine) done = true;
    }
    lastLine = line;
  };
  requestAnimationFrame(() => { lastLine = scrollY + innerHeight * .5; onScroll(); addEventListener('scroll', onScroll, { passive: true }); });
}

// Glasgow Salon Booking — "Her phone, while you read."
// The reader stands in for the customer in the chair. While they read the problem half of the case, her phone
// rings now and then: a notification drops into the corner and, like LOOK's hair dryer, every character on screen
// shakes loose for a moment and settles back. A small counter keeps the tally. When the case reaches the shared
// diary (10:00), the calls stop and a card shows how long the reading was interrupted — the booking site now
// answers those questions. Nothing has to be clicked; scrolling is never held.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];

// where each call rings: element + how far into it (the read line is the middle of the screen)
const HITS = [
  { at: ['.bk-hand[data-act="1"]', .22], kind: 'call', who: ['Emma', 'Emma'], what: ['WeChat voice call', '微信语音通话'], she: ['“Hello? …twenty minutes late, fine.”', '“喂？……晚二十分钟是吧，好。”'], mins: 3 },
  { at: ['.bk-hand[data-act="1"]', .7], kind: 'msg', who: ['Mrs Li', '李阿姨'], what: ['Can I move to 3 o’clock?', '能改到三点吗？'], she: ['“Three… let me check the book…”', '“三点……我翻翻本子……”'], mins: 4 },
  { at: ['.bk-dom[data-mode="old"]', .45], kind: 'call', who: ['Unknown number', '陌生号码'], what: ['Incoming call', '来电'], she: ['“Sunday? I’ll let you know later.”', '“周日？我回头告诉你。”'], mins: 3 },
  { at: ['#overview', .35], kind: 'msg', who: ['Mr He', '何先生'], what: ['What time was I booked again?', '我约的是几点来着？'], she: ['“You were… hold on…”', '“你是……等一下……”'], mins: 4 }
];
const STOP = ['.bk-moment[data-moment="system"]', .3];
const T = {
  sorry: ['Sorry, one sec —', '不好意思，我接一下——'],
  onPhone: ['She’s on the phone', '她在接电话'], replying: ['She’s replying', '她在回消息'],
  sim: ['Illustrative', '示意'],
  count: ['Interrupted', '被打断'], times: ['×', '次'], min: ['min', '分钟'], mute: ['Mute', '静音'], muted: ['Muted', '已静音'],
  sumK: ['While you read this far', '你读到这里'],
  sumA: ['her phone interrupted you', '她的手机打断了你'],
  sumB: ['If you were the customer in her chair, you would have waited', '如果你是坐在她椅子上的顾客，你就多等了'],
  sumC: ['From here on, customers scan a QR code and book themselves. The calls stop.', '从这里开始，顾客扫码自己预约。电话不再来。'],
  close: ['Close', '关闭']
};
export const CHARS = () => [...Object.values(T).flat(), ...HITS.flatMap(h => [...h.who, ...h.what, ...h.she]), '0123456789:×—'].join('');

export function mountChair(root) {
  if (document.querySelector('.bk-calls')) return;
  root.querySelector('.bk-story-board')?.remove();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ui = document.createElement('div'); ui.className = 'bk-calls'; ui.setAttribute('aria-live', 'polite');
  ui.innerHTML = `
    <div class="bk-call-n" hidden><i class="bk-call-app" aria-hidden="true"></i><div><small class="bk-call-what"></small><b class="bk-call-who"></b><span class="bk-call-msg"></span></div><span class="bk-call-ring" aria-hidden="true"></span><em class="bk-call-sim"></em></div>
    <div class="bk-call-busy" hidden><i></i><span class="bk-call-busy-t"></span><b class="bk-call-busy-m">0:00</b><p class="bk-call-she"></p></div>
    <div class="bk-call-tally" hidden><span class="bk-call-dot" aria-hidden="true"></span><span class="bk-call-count"></span><button type="button" class="bk-call-mute"></button></div>
    <div class="bk-call-sum" role="status" hidden><button type="button" class="bk-call-x" aria-label=""></button><p class="bk-call-sum-k"></p><p class="bk-call-sum-a"><b class="n"></b> <span></span></p><p class="bk-call-sum-b"><span></span> <b class="m"></b></p><p class="bk-call-sum-c"></p></div>`;
  document.body.append(ui);
  const $ = s => ui.querySelector(s);
  const note = $('.bk-call-n'), busy = $('.bk-call-busy'), tally = $('.bk-call-tally'), sum = $('.bk-call-sum');
  let n = 0, mins = 0, muted = false, done = false, pendingSum = false, cur = -1, busyUntil = 0;
  const fired = new Set(), queue = [];

  const text = () => {
    $('.bk-call-sim').textContent = L(T.sim);
    $('.bk-call-count').textContent = `${L(T.count)} ${n} ${L(T.times)} · ${mins} ${L(T.min)}`;
    $('.bk-call-mute').textContent = muted ? L(T.muted) : L(T.mute);
    $('.bk-call-sum-k').textContent = L(T.sumK);
    if (zh()) { $('.bk-call-sum-a').innerHTML = `${L(T.sumA)} <b class="n">${n} 次</b>`; }
    else { $('.bk-call-sum-a').innerHTML = `<span>${L(T.sumA)}</span> <b class="n">${n} times</b>`; }
    $('.bk-call-sum-b span').textContent = L(T.sumB); $('.bk-call-sum-b .m').textContent = `${mins} ${L(T.min)}`;
    $('.bk-call-sum-c').textContent = L(T.sumC); $('.bk-call-x').setAttribute('aria-label', L(T.close)); $('.bk-call-x').textContent = '×';
    if (cur >= 0) fill(cur);
  };
  const fill = i => {
    const h = HITS[i];
    note.dataset.kind = h.kind;
    $('.bk-call-what').textContent = h.kind === 'msg' ? 'WeChat' : L(h.what);
    $('.bk-call-who').textContent = L(h.who);
    $('.bk-call-msg').textContent = h.kind === 'msg' ? L(h.what) : '';
    $('.bk-call-app').textContent = L(h.who).slice(0, 1);
    $('.bk-call-busy-t').textContent = h.kind === 'msg' ? L(T.replying) : L(T.onPhone);
    $('.bk-call-she').textContent = L(h.she);
  };

  // Like LOOK's hair dryer: the words on screen come apart letter by letter, shake, and settle back.
  const SHAKE = 'h1,h2,h3,.bk-moment-line,.bk-moment-cap,.bk-hand-t,.bk-hand-k,.ux-question,.bk-note,p,li,dt,dd,figcaption';
  function shake(ms) {
    if (calm) return;
    const vh = innerHeight, picked = [];
    for (const el of root.querySelectorAll(SHAKE)) {
      if (picked.length > 18) break;
      if (el.closest('.bk-calls') || picked.some(p => p.contains(el) || el.contains(p))) continue;
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh || !r.width) continue;
      const txt = el.textContent; if (!txt.trim() || txt.length > 260 || [...el.querySelectorAll('*')].some(c => !/^(B|STRONG|EM|I|SMALL|BR)$/.test(c.tagName) || c.className)) continue; // plain text only, so nothing a script holds is replaced
      picked.push(el);
    }
    const saved = picked.map(el => [el, el.innerHTML]);
    picked.forEach(el => {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
      nodes.forEach(t => {
        const f = document.createDocumentFragment();
        // words stay whole (so lines don't re-wrap mid-word); each letter inside shakes on its own
        t.textContent.split(/(\s+)/).forEach(word => {
          if (!word) return; if (!word.trim()) { f.append(word); return; }
          const w = document.createElement('span'); w.className = /[\u3000-\u9fff\uff00-\uffef]/.test(word) ? 'bk-shkc' : 'bk-shkw';
          [...word].forEach(ch => {
            const s = document.createElement('span'); s.className = 'bk-shk'; s.textContent = ch;
            s.style.cssText = `--x:${((Math.random() - .5) * 7).toFixed(1)}px;--y:${((Math.random() - .5) * 6).toFixed(1)}px;--r:${((Math.random() - .5) * 14).toFixed(0)}deg;--d:${(Math.random() * -.12).toFixed(2)}s`;
            w.append(s);
          });
          f.append(w);
        });
        t.replaceWith(f);
      });
      el.classList.add('bk-shaking');
    });
    document.body.classList.add('bk-ringing');
    setTimeout(() => {
      picked.forEach(el => el.classList.add('bk-settle'));
      setTimeout(() => { saved.forEach(([el, html]) => { if (el.querySelector('.bk-shk')) el.innerHTML = html; el.classList.remove('bk-shaking', 'bk-settle'); }); document.body.classList.remove('bk-ringing'); }, 380);
    }, ms);
  }

  function ring(i) {
    cur = i; fill(i);
    note.hidden = false; busy.hidden = true; void note.offsetWidth; ui.classList.add('is-in'); ui.classList.remove('is-busy');
    shake(1500);
    const h = HITS[i];
    setTimeout(() => {
      ui.classList.add('is-busy'); busy.hidden = false;
      const t0 = performance.now(), dur = 2600;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur), s = Math.round(k * h.mins * 60);
        $('.bk-call-busy-m').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        if (k < 1) requestAnimationFrame(step);
        else {
          n++; mins += h.mins; tally.hidden = false; text();
          tally.classList.remove('is-bump'); void tally.offsetWidth; tally.classList.add('is-bump');
          ui.classList.remove('is-in', 'is-busy');
          setTimeout(() => { note.hidden = true; busy.hidden = true; cur = -1; if (queue.length) ring(queue.shift()); else maybeSum(); }, 450);
        }
      };
      requestAnimationFrame(step);
    }, 1500);
  }

  const yOf = ([sel, f]) => { const el = document.querySelector(sel); if (!el) return Infinity; const r = el.getBoundingClientRect(); return r.top + scrollY + f * r.height; };
  let lastLine = scrollY + innerHeight * .5;
  const onScroll = () => {
    const line = scrollY + innerHeight * .5, down = line > lastLine;
    const jump = line - lastLine > innerHeight * 1.2;
    if (down && !done) {
      HITS.forEach((h, i) => {
        if (fired.has(i)) return; const y = yOf(h.at);
        if (y > lastLine && y <= line) { fired.add(i); if (muted || jump) return; if (cur >= 0) queue.push(i); else ring(i); }
        else if (y <= lastLine) fired.add(i); // already past when the page loaded or after a jump: don't ring late
      });
      const ys = yOf(STOP);
      if (ys > lastLine && ys <= line) { done = true; pendingSum = true; if (cur < 0) maybeSum(); }
      else if (ys <= lastLine) done = true;
    }
    lastLine = line;
  };
  function maybeSum() { if (pendingSum && n > 0) { pendingSum = false; setTimeout(showSum, 300); } }
  function showSum() {
    text(); tally.hidden = true; sum.hidden = false; void sum.offsetWidth; ui.classList.add('is-sum');
    clearTimeout(showSum.t); showSum.t = setTimeout(hideSum, 12000);
  }
  function hideSum() { ui.classList.remove('is-sum'); setTimeout(() => { sum.hidden = true; }, 400); }
  $('.bk-call-x').addEventListener('click', hideSum);
  $('.bk-call-mute').addEventListener('click', () => { muted = !muted; queue.length = 0; text(); });
  // first measurement: anything already above the read line counts as passed
  requestAnimationFrame(() => { lastLine = scrollY + innerHeight * .5; onScroll(); addEventListener('scroll', onScroll, { passive: true }); });
  text(); document.addEventListener('portfolio:language', text);
}

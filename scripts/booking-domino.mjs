// Glasgow Salon Booking — feel the problem, then watch it go away.
//  • "One late arrival": the shop's day as paper slips on a time line. As you scroll, things happen (a no-show, a late
//    customer, calls in the middle of cuts, a colour that takes longer than anyone wrote down) and every slip after it
//    slides like a domino. Counters add up the waiting. Tap a slip to make that person late, or not come at all.
//  • A four-panel hand-drawn storyboard: the phone rings in the middle of a cut.
//  • "The same day, with the diary": the same events replayed on a day the system booked, with the same counters.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hm = m => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, '0')}`;
const dur = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return zh() ? (h ? `${h} 小时${r ? ` ${r} 分` : ''}` : `${r} 分钟`) : (h ? `${h} h${r ? ` ${r} min` : ''}` : `${r} min`); };
const T0 = 570, T1 = 1170, CLOSE = 1110; // the track runs 9:30–19:30, the shop closes at 18:30

const NAMES = { chen: ['Chen', '陈'], mia: ['Mia', 'Mia'], emma: ['Emma', 'Emma'], sun: ['Sun', '孙'], wang: ['Wang', '王阿姨'], li: ['Li', '李'], zhou: ['Zhou', '周'], gao: ['Gao', '高'], lin: ['Lin', '林'], he: ['He', '何'] };
const SV = { short: ['short cut', '短发'], long: ['long cut', '长发'], colour: ['colour + bleach', '染 + 漂'] };
// the day as it was written in the paper diary (lengths are guesses)
const OLD = [
  { id: 'chen', sv: 'short', at: 600, len: 30 }, { id: 'emma', sv: 'long', at: 630, len: 60 }, { id: 'sun', sv: 'short', at: 690, len: 30 },
  { id: 'wang', sv: 'colour', at: 720, len: 90 }, { id: 'li', sv: 'long', at: 810, len: 60 }, { id: 'zhou', sv: 'short', at: 870, len: 30 },
  { id: 'gao', sv: 'long', at: 900, len: 60 }, { id: 'lin', sv: 'short', at: 960, len: 30 }, { id: 'he', sv: 'long', at: 1020, len: 60 }
];
const OLD_EVENTS = [
  { w: [.08, .2], fx: { chen: { ns: 1 } }, t: ['10:00 · Chen doesn’t come. The chair sits empty for half an hour.', '10:00 · 陈没来。椅子空了半个小时。'] },
  { w: [.24, .4], fx: { emma: { late: 20 } }, t: ['10:50 · Emma is 20 minutes late, and everyone after her slides.', '10:50 · Emma 晚到 20 分钟，后面的人全跟着往后滑。'] },
  { w: [.44, .56], fx: { sun: { call: 6 }, zhou: { call: 6 }, gao: { call: 6 } }, t: ['WeChat calls in the middle of cuts: a few minutes each, three times.', '剪到一半接微信电话：每次几分钟，一天三次。'] },
  { w: [.6, .76], fx: { wang: { len: 150 } }, t: ['12:25 · The colour really takes 2½ hours. Nobody wrote that down.', '12:25 · 染发其实要两个半小时，本子上没人写过。'] },
  { w: [.8, .92], fx: {}, t: ['18:30 · Closing time, and two customers are still waiting.', '18:30 · 该打烊了，店里还有客人在等。'] }
];
// the same day, booked through the shared diary: real lengths, only times that fit, a break closed in the diary,
// cancelling in My bookings reopens the slot (no reminders: they are not released yet)
const NEW = [
  { id: 'chen', sv: 'short', at: 600, len: 30 }, { id: 'emma', sv: 'long', at: 630, len: 60 }, { id: 'sun', sv: 'short', at: 690, len: 30 },
  { id: 'wang', sv: 'colour', at: 720, len: 150 }, { id: 'break', at: 870, len: 30, brk: true }, { id: 'li', sv: 'long', at: 900, len: 60 },
  { id: 'zhou', sv: 'short', at: 960, len: 30 }, { id: 'gao', sv: 'long', at: 990, len: 60 }, { id: 'lin', sv: 'short', at: 1050, len: 30 }
];
const NEW_EVENTS = [
  { w: [.08, .22], fx: { chen: { re: 1 } }, t: ['Chen cancels in My bookings the night before. Her slot reopens, and Mia books it.', '陈前一晚在“我的预约”里取消了。时段空出来，Mia 约上了。'] },
  { w: [.26, .44], fx: { emma: { late: 20 } }, t: ['Emma is still 20 minutes late. Two people wait a little, then the break absorbs it.', 'Emma 还是晚了 20 分钟：后面两位稍等一下，到午休就消化掉了。'] },
  { w: [.48, .62], fx: {}, t: ['No calls in the middle of a cut: customers book and change on their own.', '剪发时不用接电话：顾客自己约、自己改。'] },
  { w: [.66, .8], fx: {}, t: ['The colour was booked at its real length, 2½ hours, from the start.', '染发一开始就按真实时长约好：两个半小时。'] },
  { w: [.84, .94], fx: {}, t: ['He’s long cut didn’t fit today, so she picked tomorrow herself. Closed at 18:30.', '何的长发今天放不下，她自己选了明天。18:30 准时打烊。'] }
];

const TEXT = {
  oldK: ['Try it · one ordinary day', '动手试试 · 普通的一天'], oldT: ['One person is late, and the whole day slides.', '一个人一晚，后面全乱。'],
  newK: ['The same day, with the diary', '同样的一天，换成共享预约本'], newT: ['Same people, same lateness. The day holds.', '同样的人，同样会迟到。这一天稳住了。'],
  wait: ['Everyone waited', '大家一共多等了'], idle: ['Chair sat empty', '椅子空着'], end: ['Last customer done', '最后一位结束'],
  over: ['after closing', '超过打烊'], ontime: ['before closing', '打烊前'],
  hint: ['Red +′ = minutes a customer waited in the shop. Tap a slip: make them late, or not come at all.', '红色 +′ = 客人在店里干等的分钟。点一张纸条：让 TA 迟到，或者干脆不来。'], reset: ['Replay', '重放'],
  closing: ['closing 18:30', '打烊 18:30'], brk: ['break, closed in the diary', '午休（已在日程里关掉）'], nsh: ['didn’t come', '没来'], reo: ['reopened → Mia', '空出来 → Mia'], tom: ['He · tomorrow 10:00, chosen by her', '何 · 改到明天 10:00（她自己选的）'],
  stampOld: ['Illustrative day', '示意 · 演示场景'], stampNew: ['Illustrative · follows the rules, not measured', '示意 · 按规则推演，非实测'], skip: ['Skip ↓', '跳过 ↓'],
  waitTag: ['wait', '等'], lateTag: ['late', '晚到']
};
const STORY = [
  { t: ['1 · Halfway through a cut', '1 · 剪到一半'] },
  { t: ['2 · The phone rings. She puts the scissors down.', '2 · 电话响了，她放下剪刀'] },
  { t: ['3 · The customer waits, half done.', '3 · 客人顶着半个头在等'], say: ['…how much longer?', '……还要多久？'], timer: ['paused', '暂停'] },
  { t: ['4 · And the next one is already at the door.', '4 · 下一位已经在门口等了'] }
];
const STORY_HEAD = { k: ['What the time line can’t show', '时间轴画不出来的'], t: ['A phone call in the middle of a haircut.', '剪到一半，接个电话。'] };

export const CHARS = () => [...Object.values(TEXT).flat(), ...OLD_EVENTS.flatMap(e => e.t), ...NEW_EVENTS.flatMap(e => e.t), ...STORY.flatMap(s => [...s.t, ...(s.say || []), ...(s.timer || [])]), ...Object.values(NAMES).flat(), ...Object.values(SV).flat(), '0123456789:′″+–·h min小时分钟'].join('');

// one chair, one day: who starts when, who waits, how long the chair sits empty, when the day ends
function simulate(plan, st) {
  let t = 0, wait = 0, idle = 0, end = 0; const out = {};
  for (const s of plan) {
    const x = st[s.id] || {};
    if (s.brk) { const start = Math.max(t, s.at); out[s.id] = { start, end: start + s.len, wait: 0 }; t = Math.max(t, s.at + s.len); continue; }
    const ns = x.ns || 0, late = x.late || 0, len = x.len ?? s.len, call = x.call || 0;
    const arrive = s.at + late, start = Math.max(t, arrive), w = Math.max(0, start - arrive);
    if (ns >= .5) { idle += Math.max(0, (s.at + s.len) - Math.max(t, s.at)); out[s.id] = { start: s.at, end: s.at + s.len, wait: 0, ns }; continue; }
    const e = start + len + call; out[s.id] = { start, end: e, wait: w, late, call, ns }; wait += w; t = e; end = e;
  }
  return { out, wait, idle, end };
}

export function mountDomino(root) {
  const act2 = root.querySelector('.bk-hand[data-act="2"]'), act3 = root.querySelector('.bk-hand[data-act="3"]');
  if (!act2 || !act3) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const boards = [makeBoard('old', OLD, OLD_EVENTS), makeBoard('new', NEW, NEW_EVENTS)];
  const story = makeStory();
  act2.after(boards[0].sec); boards[0].sec.after(story.sec);
  // the replay belongs to the results: right after the 18:30 clock
  (root.querySelector('.bk-moment[data-moment="end"]') || act3).after(boards[1].sec); story.init();

  function makeBoard(mode, plan, events) {
    const sec = document.createElement('section'); sec.className = 'bk-dom'; sec.dataset.mode = mode;
    sec.innerHTML = `<div class="bk-dom-pin"><div class="bk-dom-head"><p class="bk-hand-k"></p><p class="bk-hand-t" role="heading" aria-level="3"></p></div>
      <div class="bk-dom-card"><span class="bk-stamp"></span><p class="bk-dom-event bk-w"></p><div class="bk-dom-track"><div class="bk-dom-hours"></div><i class="bk-dom-close"><em></em></i><i class="bk-dom-over"></i></div>
      <div class="bk-dom-stats"><div><span class="bk-dom-sk"></span><b class="bk-dom-wait"></b></div><div><span class="bk-dom-sk"></span><b class="bk-dom-idle"></b></div><div><span class="bk-dom-sk"></span><b class="bk-dom-end"></b><small></small></div></div>
      <p class="bk-dom-hint"><span></span><button type="button"></button><a class="bk-skip" href="#"></a></p>${mode === 'new' ? '<p class="bk-dom-tom bk-w is-green"></p>' : ''}</div></div>`;
    const track = sec.querySelector('.bk-dom-track'), hours = sec.querySelector('.bk-dom-hours');
    for (let h = 10; h <= 19; h++) { const i = document.createElement('i'); i.style.setProperty('--s', ((h * 60 - T0) / (T1 - T0)).toFixed(4)); i.innerHTML = `<b>${h}:00</b>`; hours.append(i); }
    const fr = m => ((m - T0) / (T1 - T0));
    sec.querySelector('.bk-dom-close').style.setProperty('--s', fr(CLOSE)); sec.querySelector('.bk-dom-over').style.setProperty('--s', fr(CLOSE));
    const slips = plan.map((s, i) => {
      const ghost = document.createElement('i'); ghost.className = 'bk-dom-ghost'; ghost.style.setProperty('--s', fr(s.at)); ghost.style.setProperty('--l', s.len / (T1 - T0));
      const el = document.createElement(s.brk ? 'div' : 'button'); el.className = 'bk-dom-slip' + (s.brk ? ' is-break' : ''); if (!s.brk) el.type = 'button';
      el.innerHTML = `<span class="bk-dom-name"></span><span class="bk-dom-sv"></span><em class="bk-dom-tag bk-w"></em><i class="bk-dom-call" aria-hidden="true">☎</i>`;
      track.append(ghost, el);
      return { s, i, el, ghost, x: fr(s.at), l: s.len / (T1 - T0), tx: 0, tl: 0, moved: 0 };
    });
    const b = { mode, plan, events, sec, track, slips, p: calm ? 1 : 0, user: null, last: null };
    // tap a slip: on time → late → didn't come → on time
    slips.forEach(sl => { if (sl.s.brk) return; sl.el.addEventListener('click', () => {
      if (!b.user) b.user = JSON.parse(JSON.stringify(stateAt(b, 1)));
      const x = b.user[sl.s.id] = b.user[sl.s.id] || {};
      if (x.ns) { x.ns = 0; x.late = 0; } else if (x.late) { x.late = 0; x.ns = 1; } else x.late = 20;
      b.sec.classList.add('is-user');
    }); });
    sec.querySelector('.bk-dom-hint button').addEventListener('click', () => { b.user = null; b.sec.classList.remove('is-user'); });
    // never trapped: one tap jumps past the pinned board
    sec.querySelector('.bk-skip').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: sec.getBoundingClientRect().bottom + scrollY - innerHeight * .1, behavior: 'smooth' }); });
    b.text = () => {
      const k = mode === 'old' ? [TEXT.oldK, TEXT.oldT] : [TEXT.newK, TEXT.newT];
      sec.querySelector('.bk-hand-k').textContent = L(k[0]); sec.querySelector('.bk-hand-t').textContent = L(k[1]);
      const sk = sec.querySelectorAll('.bk-dom-sk'); sk[0].textContent = L(TEXT.wait); sk[1].textContent = L(TEXT.idle); sk[2].textContent = L(TEXT.end);
      sec.querySelector('.bk-dom-hint span').textContent = L(TEXT.hint); sec.querySelector('.bk-dom-hint button').textContent = L(TEXT.reset);
      sec.querySelector('.bk-dom-close em').textContent = L(TEXT.closing);
      sec.querySelector('.bk-stamp').textContent = L(mode === 'old' ? TEXT.stampOld : TEXT.stampNew); sec.querySelector('.bk-skip').textContent = L(TEXT.skip);
      const tom = sec.querySelector('.bk-dom-tom'); if (tom) tom.textContent = L(TEXT.tom);
      slips.forEach(sl => { const s = sl.s; sl.el.querySelector('.bk-dom-name').textContent = s.brk ? L(TEXT.brk) : L(NAMES[s.id]); sl.el.querySelector('.bk-dom-sv').textContent = s.brk ? '' : L(SV[s.sv]); sl.el.setAttribute('aria-label', s.brk ? L(TEXT.brk) : `${hm(s.at)} ${L(NAMES[s.id])}, ${L(SV[s.sv])}`); });
      b.last = null;
    };
    b.text();
    return b;
  }
  // the events, applied as far as the scroll has got
  function stateAt(b, p) {
    const st = {};
    b.events.forEach(ev => { const a = clamp((p - ev.w[0]) / (ev.w[1] - ev.w[0])); for (const [id, fx] of Object.entries(ev.fx)) { const x = st[id] = st[id] || {}; const base = b.plan.find(s => s.id === id); if (fx.ns) x.ns = a; if (fx.late) x.late = fx.late * a; if (fx.call) x.call = fx.call * a; if (fx.len) x.len = base.len + (fx.len - base.len) * a; if (fx.ok) x.ok = a; if (fx.re) x.re = a; } });
    return st;
  }
  function drawBoard(b, now, dt) {
    const st = b.user || stateAt(b, b.p), r = simulate(b.plan, st), fr = m => (m - T0) / (T1 - T0);
    // which event is happening
    const ev = b.user ? null : [...b.events].reverse().find(e => b.p >= e.w[0] - .02);
    const evT = ev ? L(ev.t) : '';
    const evEl = b.sec.querySelector('.bk-dom-event'); if (evEl.dataset.t !== evT) { evEl.dataset.t = evT; evEl.textContent = evT; evEl.classList.remove('is-in'); void evEl.offsetWidth; if (evT) evEl.classList.add('is-in'); }
    b.slips.forEach(sl => {
      const o = r.out[sl.s.id], x = st[sl.s.id] || {};
      const tx = fr(o.start), tl = (o.end - o.start) / (T1 - T0);
      // the domino: each slip follows a moment after the one before it
      if (Math.abs(tx - sl.tx) > .0005 || Math.abs(tl - sl.tl) > .0005) { sl.tx = tx; sl.tl = tl; sl.moved = now; }
      const go = calm || now - sl.moved > sl.i * 55 ? 1 - Math.exp(-dt * 9) : 0;
      sl.x += (sl.tx - sl.x) * go; sl.l += (sl.tl - sl.l) * go;
      sl.el.style.setProperty('--s', sl.x.toFixed(4)); sl.el.style.setProperty('--l', sl.l.toFixed(4));
      const shift = Math.abs(sl.x - fr(sl.s.at)) * (T1 - T0);
      sl.ghost.style.opacity = sl.s.brk ? 0 : clamp(shift / 8);
      sl.el.classList.toggle('is-ns', (x.ns || 0) >= .5); sl.el.classList.toggle('is-ok', (x.ok || 0) > .5 || (x.re || 0) > .5);
      const nm = (x.re || 0) > .5 ? L(NAMES.mia) : sl.s.brk ? L(TEXT.brk) : L(NAMES[sl.s.id]); const ne = sl.el.querySelector('.bk-dom-name'); if (ne.textContent !== nm) ne.textContent = nm;
      sl.el.classList.toggle('is-over', o.end > CLOSE + 1 && !(x.ns >= .5));
      sl.el.classList.toggle('has-call', (x.call || 0) > 1);
      sl.el.style.setProperty('--ns', (x.ns || 0).toFixed(3));
      const tag = sl.el.querySelector('.bk-dom-tag');
      const txt = (x.re || 0) > .5 ? L(TEXT.reo) : (x.ns || 0) >= .5 ? L(TEXT.nsh) : (x.late || 0) >= 2 ? `${L(TEXT.lateTag)} ${Math.round(x.late)}′` : o.wait >= 2 ? `+${Math.round(o.wait)}′` : '';
      sl.el.classList.toggle('is-low', sl.i % 2 === 1);
      if (tag.textContent !== txt) tag.textContent = txt;
    });
    // counters
    const set = (sel, v) => { const e = b.sec.querySelector(sel); if (e.textContent !== v) e.textContent = v; };
    set('.bk-dom-wait', dur(r.wait)); set('.bk-dom-idle', dur(r.idle)); set('.bk-dom-end', hm(r.end));
    const over = r.end - CLOSE; set('.bk-dom-stats small', over > 0 ? `+${dur(over)} ${L(TEXT.over)}` : L(TEXT.ontime));
    b.sec.classList.toggle('is-late', over > 0);
    const tom = b.sec.querySelector('.bk-dom-tom'); if (tom) tom.classList.toggle('is-in', b.p > .86 || !!b.user);
  }

  // ---------- storyboard ----------
  function makeStory() {
    const sec = document.createElement('section'); sec.className = 'bk-story-board';
    const svgs = [
      // 1 · halfway through a cut
      `<path d="M70 176 L70 150 Q70 140 80 140 L160 140 Q170 140 170 150 L170 176 M120 176 L120 188 M95 188 L145 188"/><path d="M88 140 Q90 100 120 98 Q150 100 152 140"/><path d="M120 50 a22 22 0 1 0 .1 0"/><path d="M100 64 Q104 44 120 46 Q134 46 140 58 M101 64 Q92 82 97 102 M106 58 Q99 78 104 98"/><path d="M190 74 a7 7 0 1 0 .1 0 M190 96 a7 7 0 1 0 .1 0 M196 78 L224 60 M196 92 L224 66"/><path class="is-green" d="M214 16 A14 14 0 0 1 214 44"/><path class="is-faint" d="M214 44 A14 14 0 0 1 214 16"/>`,
      // 2 · the phone rings
      `<path d="M105 40 h50 a8 8 0 0 1 8 8 v104 a8 8 0 0 1 -8 8 h-50 a8 8 0 0 1 -8 -8 v-104 a8 8 0 0 1 8 -8 z"/><path class="is-green" d="M130 78 a14 14 0 1 0 .1 0 M124 86 q6 8 12 0"/><path class="is-red" d="M86 72 q-6 10 0 20 M77 66 q-9 16 0 32 M174 72 q6 10 0 20 M183 66 q9 16 0 32"/><path d="M20 182 L240 182 M44 174 a5 5 0 1 0 .1 0 M44 162 a5 5 0 1 0 .1 0 M49 172 L74 160 M49 164 L74 157"/>`,
      // 3 · waiting, half done
      `<path d="M70 72 a32 32 0 1 0 .1 0 M70 44 L70 48 M98 72 L94 72 M70 100 L70 96 M42 72 L46 72"/><path class="bk-sb-hand" d="M70 72 L70 52"/><path class="bk-sb-hand2" d="M70 72 L84 72"/><path d="M180 112 a18 18 0 1 0 .1 0 M166 120 Q170 104 180 106 Q190 106 194 116 M167 121 Q161 134 165 146"/><path d="M158 150 Q180 138 202 150 L208 188 L152 188 Z"/><path d="M158 98 a3 3 0 1 0 .1 0 M150 86 a5 5 0 1 0 .1 0"/>`,
      // 4 · the next one at the door
      `<path d="M176 38 L236 38 L236 188 L176 188 Z M186 118 a3 3 0 1 0 .1 0"/><path class="is-red" d="M206 70 a11 11 0 1 0 .1 0 M206 82 L206 132 M206 96 L194 116 M206 96 L218 116 M206 132 L197 168 M206 132 L215 168"/><path d="M78 92 a18 18 0 1 0 .1 0 M64 100 Q68 84 78 86 Q88 86 92 96"/><path d="M56 128 Q78 114 100 128 L106 170 L50 170 Z"/><path d="M104 80 a5 5 0 1 0 .1 0 M104 92 a5 5 0 1 0 .1 0 M109 82 L130 70 M109 90 L130 76"/>`
    ];
    sec.innerHTML = `<div class="bk-hand-head"><p class="bk-hand-k"></p><p class="bk-hand-t" role="heading" aria-level="3"></p><span class="bk-stamp"></span></div><div class="bk-sb-row">${svgs.map((g, i) => `<figure class="bk-sb" data-i="${i}"><div class="bk-sb-pic"><svg viewBox="0 0 260 200" aria-hidden="true">${g}</svg>${i === 0 ? '<b class="bk-sb-pct">50%</b>' : ''}${i === 2 ? '<span class="bk-w bk-sb-say"></span><b class="bk-sb-timer"></b>' : ''}</div><figcaption class="bk-w"></figcaption></figure>`).join('')}</div>`;
    const figs = [...sec.querySelectorAll('.bk-sb')].map(f => ({ f, paths: [...f.querySelectorAll('path')], cap: f.querySelector('figcaption') }));
    const s = { sec, figs, p: calm ? 1 : 0, drawn: -1 };
    // stroke lengths can only be measured once the drawings are on the page
    s.init = () => figs.forEach(g => g.paths.forEach(p => { const len = p.getTotalLength() || 300; p._L = len; p.style.strokeDasharray = `${len} ${len}`; p.style.strokeDashoffset = len; }));
    s.text = () => { sec.querySelector('.bk-stamp').textContent = L(TEXT.stampOld); sec.querySelector('.bk-hand-k').textContent = L(STORY_HEAD.k); sec.querySelector('.bk-hand-t').textContent = L(STORY_HEAD.t); figs.forEach((g, i) => { g.cap.textContent = L(STORY[i].t); }); const say = sec.querySelector('.bk-sb-say'); say.textContent = L(STORY[2].say); s.drawn = -1; };
    s.text();
    return s;
  }
  function drawStory(s) {
    const p = s.p;
    s.figs.forEach((g, i) => {
      const k = clamp((p - i * .2) / .3);
      g.f.classList.toggle('is-on', k > .02);
      const n = g.paths.length; g.paths.forEach((pa, j) => { if (pa.matches('.bk-sb-hand, .bk-sb-hand2')) { pa.style.strokeDashoffset = k > .3 ? 0 : pa._L; return; } const kk = clamp(k * n * .8 - j * .8); pa.style.strokeDashoffset = (pa._L * (1 - kk)).toFixed(1); });
      g.cap.style.clipPath = k >= 1 ? 'none' : `inset(-30% ${(100 - clamp(k * 1.4 - .3) * 100).toFixed(1)}% -30% -4%)`;
      if (i === 2) {
        // the clock keeps going while she is on the phone
        const secs = Math.round(clamp((k - .3) / .7) * 200), mm = Math.floor(secs / 60), ss = secs % 60;
        g.f.querySelector('.bk-sb-timer').textContent = k > .3 ? `${L(STORY[2].timer)} ${mm}′${String(ss).padStart(2, '0')}″` : '';
        g.f.querySelector('.bk-sb-hand2').setAttribute('transform', `rotate(${(secs * 6 * .25).toFixed(1)} 70 72)`);
        const say = g.f.querySelector('.bk-sb-say'); say.style.clipPath = k >= 1 ? 'none' : `inset(-30% ${(100 - clamp(k * 1.6 - .5) * 100).toFixed(1)}% -30% -4%)`;
      }
      if (i === 1) g.f.classList.toggle('is-ringing', k > .55 && k < 1.01);
    });
  }

  // ---------- the loop ----------
  let last = performance.now();
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.08, (now - last) / 1000); last = now; const vh = innerHeight;
    boards.forEach(b => {
      const r = b.sec.getBoundingClientRect(); if (r.bottom < -vh || r.top > vh * 2) return;
      // the board is pinned while the day plays out; the scroll is the clock
      const target = calm ? 1 : clamp((-r.top + vh * .05) / Math.max(1, r.height - vh * 1.05));
      b.p += (target - b.p) * (1 - Math.exp(-dt * 4));
      drawBoard(b, now, dt);
    });
    const r = story.sec.getBoundingClientRect();
    if (r.bottom > -100 && r.top < vh + 100) { const target = calm ? 1 : clamp((vh * .82 - r.top) / (r.height * .9 + vh * .1)); story.p += (target - story.p) * (1 - Math.exp(-dt * 3.2)); if (Math.abs(story.p - story.drawn) > .0005) { drawStory(story); story.drawn = story.p; } }
  };
  document.addEventListener('portfolio:language', () => { boards.forEach(b => b.text()); story.text(); });
  requestAnimationFrame(tick);
}

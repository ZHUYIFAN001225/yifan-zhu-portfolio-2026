// Glasgow Salon Booking — three handwritten acts on the shop's paper diary, written as you scroll.
//  Act 1 · the old way: appointments are written into the paper diary, a WeChat message waits for a reply.
//  Act 2 · things change: a no-show is struck out, a long colour overruns, a time is scribbled over, messages pile up.
//  Act 3 · the phone takes over: an arrow leaves the messy page and points at the phone, which now keeps the diary.
// The pen follows the scroll (scroll back and the ink lifts off again), smoothed so it moves like a hand, not a jump.
const zh = () => document.documentElement.lang.startsWith('zh');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const W = 560, ROW = 40, TOP = 64, LEFT = 78;

// the diary page: rows of handwriting (row, x, text)
const ROWS = [
  { id: 'date', row: -1, x: LEFT, big: true, t: ['Sat 24 Oct', '10月24日 周六'] },
  { id: 'r1', row: 0, x: LEFT, t: ['10:00  Chen · short cut', '10:00  陈 · 短发'] },
  { id: 'r2', row: 1, x: LEFT, t: ['11:00  Emma · long cut', '11:00  Emma · 长发'] },
  { id: 'r3', row: 2, x: LEFT, t: ['14:00  Wang · colour + bleach', '14:00  王 · 染 + 漂'] },
  { id: 'r4', row: 3, x: LEFT + 70, t: ['how long?? 3h?', '要多久？？3 小时？'] },
  { id: 'r5', row: 4, x: LEFT, t: ['16:00  Li (booked on WeChat)', '16:00  李（微信上约的）'] }
];
const BUBBLE1 = { id: 'b1', row: 5.4, t: ['Free at 2 on Friday?', '周五两点有空吗？'], note: ['reply later…', '晚点回…'] };
// act 2: what goes wrong, in red pen
const ACT2 = [
  { id: 'n2', kind: 'write', row: 1, x: 372, red: true, t: ['didn’t come', '没来'] },
  { id: 's2', kind: 'strike', on: 'r2' },
  { id: 'c4', kind: 'circle', on: 'r4' },
  { id: 'a45', kind: 'arrow', from: 'r4', to: 'r5', note: ['everyone after waits', '后面全被拖'] },
  { id: 'x5', kind: 'scribble', on: 'r5' },
  { id: 'n6', kind: 'write', row: 5, x: LEFT, red: true, t: ['→ Thu?? must tell her!', '→ 改周四？？要通知她！'] }
];
const BUBBLES2 = [{ id: 'b2', t: ['Can I move to 3?', '能改到三点吗？'] }, { id: 'b3', t: ['Are you open Sunday?', '周日开门吗？'] }, { id: 'b4', t: ['Running late, sorry!', '晚到一会儿，抱歉！'] }];

const ACTS = [
  { n: 1, k: ['Act 1 · The old way', '第一幕 · 旧方式'], t: ['A paper diary, WeChat and her memory.', '一本纸质预约本、微信，和她的记忆。'] },
  { n: 2, k: ['Act 2 · Things change', '第二幕 · 计划总在变'], t: ['Every change is a crossing-out and another message.', '每一次变动，都是一道划线，和又一条消息。'] },
  { n: 3, k: ['Act 3 · The phone takes over', '第三幕 · 交给手机'], t: ['The same day, kept by one shared diary.', '同样的一天，交给一本共享的预约本。'] }
];

// all the characters the handwriting fonts need (Google Fonts can send just these)
const CHARS = () => {
  const all = [...ROWS.flatMap(r => r.t), ...BUBBLE1.note, ...ACT2.flatMap(a => [...(a.t || []), ...(a.note || [])]), 'let the diary keep itself', '让预约本自己记', '0123456789:·?!→()'].join('');
  return [...new Set(all)].join('');
};
function loadFonts() {
  if (document.querySelector('link[data-bk-hand]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.bkHand = '1';
  l.href = `https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Long+Cang&display=swap&text=${encodeURIComponent(CHARS())}`;
  document.head.append(l);
}

// a little seeded wobble, so the same mark is drawn the same way every time
const rnd = s => () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296;
const box = el => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
const P = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const strikeD = (b, r) => `M${P(b.x - 6, b.y + b.h * .58)} Q${P(b.x + b.w / 2, b.y + b.h * (.48 + (r() - .5) * .1))} ${P(b.x + b.w + 8, b.y + b.h * .52)}`;
const scribbleD = (b, r) => { let d = `M${P(b.x - 4, b.y + b.h * .5)}`; const n = Math.max(8, Math.round(b.w / 14)); for (let i = 1; i <= n; i++) d += ` L${P(b.x - 4 + (b.w + 8) * i / n, b.y + (i % 2 ? b.h * (.15 + r() * .1) : b.h * (.85 - r() * .1)))}`; return d; };
const circleD = (b, r) => { const cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = b.w / 2 + 14, ry = b.h / 2 + 10; let d = ''; for (let i = 0; i <= 48; i++) { const a = -2.4 + i / 48 * (Math.PI * 2 + .5), k = 1 + (r() - .5) * .05 + i / 48 * .06; d += (i ? ' L' : 'M') + P(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k); } return d; };
const arrowD = (x1, y1, x2, y2, bend = 40) => { const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2; const ang = Math.atan2(y2 - my, x2 - mx), L = 14; return [`M${P(x1, y1)} Q${P(mx, my)} ${P(x2, y2)}`, `M${P(x2 - Math.cos(ang - .45) * L, y2 - Math.sin(ang - .45) * L)} L${P(x2, y2)} L${P(x2 - Math.cos(ang + .45) * L, y2 - Math.sin(ang + .45) * L)}`]; };

export function mountHand(root) {
  const m1 = root.querySelector('.bk-moment[data-moment="overview"]'), m2 = root.querySelector('.bk-moment[data-moment="system"]'), ov = root.querySelector('#overview');
  if (!m1 || !m2) return [];
  loadFonts();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const acts = ACTS.map(a => {
    const sec = document.createElement('section'); sec.className = 'bk-hand'; sec.dataset.act = a.n;
    sec.innerHTML = `<div class="bk-hand-head"><p class="bk-hand-k"></p><p class="bk-hand-t" role="heading" aria-level="3"></p></div><div class="bk-hand-fit"><div class="bk-sheet"><i class="bk-tape"></i><svg class="bk-ink" aria-hidden="true"></svg></div></div>${a.n === 3 ? '<div class="bk-hand-space" aria-hidden="true"></div>' : ''}`;
    return { ...a, sec, sheet: sec.querySelector('.bk-sheet'), svg: sec.querySelector('svg'), items: [], p: calm ? 1 : 0 };
  });
  m1.after(acts[0].sec); if (ov) ov.after(acts[1].sec); else m2.before(acts[1].sec); m2.after(acts[2].sec);

  const rowY = row => TOP + row * ROW;
  // build each page: what is already on it from the earlier acts, and what this act writes
  function render() {
    const l = zh() ? 1 : 0;
    acts.forEach(a => {
      a.sec.querySelector('.bk-hand-k').textContent = a.k[l]; a.sec.querySelector('.bk-hand-t').textContent = a.t[l];
      a.sheet.querySelectorAll('.bk-w, .bk-bubble').forEach(e => e.remove()); a.svg.innerHTML = ''; a.items = [];
      const add = (it, from, to, pre) => { a.items.push({ ...it, from, to, pre }); };
      // handwriting
      const write = (it, from, to, pre) => {
        const s = document.createElement('span'); s.className = 'bk-w' + (it.big ? ' is-big' : '') + (it.red ? ' is-red' : ''); s.textContent = it.t[l];
        s.style.left = it.x + 'px'; s.style.top = (rowY(it.row) - (it.big ? 34 : 30)) + 'px'; s.dataset.id = it.id; a.sheet.append(s);
        add({ kind: 'write', el: s, id: it.id }, from, to, pre);
      };
      const bubble = (b, i, from, to, pre, note) => {
        const d = document.createElement('div'); d.className = 'bk-bubble'; d.style.setProperty('--i', i); d.innerHTML = `<span></span>${note ? '<em class="bk-w is-note"></em>' : ''}`;
        d.querySelector('span').textContent = b.t[l]; if (note) d.querySelector('em').textContent = note[l];
        a.sheet.append(d); add({ kind: 'bubble', el: d }, from, to, pre);
      };
      const n = a.n;
      // rows: act 1 writes them one by one; later acts start with them on the page
      ROWS.forEach((r, i) => write(r, .02 + i * .1, .1 + i * .1, n > 1));
      bubble(BUBBLE1, 0, .66, .74, n > 1, BUBBLE1.note);
      if (n >= 2) {
        const step = .6 / ACT2.length;
        ACT2.forEach((it, i) => { if (it.kind === 'write') write(it, .05 + i * step, .05 + (i + 1) * step, n > 2); else add({ ...it }, .05 + i * step, .05 + (i + 1) * step, n > 2); });
        BUBBLES2.forEach((b, i) => bubble(b, i + 1, .7 + i * .07, .76 + i * .07, n > 2));
      }
      if (n === 3) { add({ kind: 'handoff' }, .1, .55, false); add({ kind: 'handnote' }, .45, .7, false); add({ kind: 'tick' }, .7, .85, false); }
    });
    requestAnimationFrame(geometry);
  }
  // marks need the real size of the handwriting, so they are drawn once the fonts are in
  const NS = 'http://www.w3.org/2000/svg';
  const path = (svg, d, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); svg.append(p); const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L; p._L = L; return p; };
  function geometry() {
    acts.forEach(a => {
      a.svg.innerHTML = ''; const H = a.sheet.offsetHeight; a.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const byId = id => a.sheet.querySelector(`.bk-w[data-id="${id}"]`);
      let seed = 7 + a.n;
      a.items.forEach(it => {
        const r = rnd(seed += 13);
        if (it.kind === 'strike') it.paths = [path(a.svg, strikeD(box(byId(it.on)), r), 'is-red')];
        if (it.kind === 'scribble') it.paths = [path(a.svg, scribbleD(box(byId(it.on)), r), 'is-red')];
        if (it.kind === 'circle') { const e = byId(it.on), b = box(e); const w2 = b.w * .3; it.paths = [path(a.svg, circleD({ x: b.x + b.w - w2, y: b.y, w: w2, h: b.h }, r), 'is-red')]; }
        if (it.kind === 'arrow') {
          const f = box(byId(it.from)), t = box(byId(it.to)); const [d1, d2] = arrowD(f.x + f.w + 22, f.y + f.h * .5, f.x + f.w + 30, t.y + t.h * .2, 34);
          it.paths = [path(a.svg, d1, 'is-red'), path(a.svg, d2, 'is-red')];
          if (!it.noteEl) { it.noteEl = document.createElement('span'); it.noteEl.className = 'bk-w is-red is-small'; a.sheet.append(it.noteEl); }
          it.noteEl.textContent = it.note[zh() ? 1 : 0]; it.noteEl.style.left = (f.x + f.w + 62) + 'px'; it.noteEl.style.top = (f.y + f.h * .9) + 'px';
        }
        if (it.kind === 'handoff') {
          // from the right edge of the page towards where the phone stands
          const sr = a.sheet.getBoundingClientRect(), k = sr.width / W || 1, wide = innerWidth >= 1000;
          const tx = wide ? (innerWidth * .66 - sr.left) / k : W * .5, ty = wide ? H * .45 : H + 120 / k;
          const [d1, d2] = wide ? arrowD(W - 70, rowY(2) - 6, tx, ty, -10) : arrowD(W * .62, H - 30, W * .5, ty, -60);
          it.paths = [path(a.svg, d1, 'is-green is-thick'), path(a.svg, d2, 'is-green is-thick')];
        }
        if (it.kind === 'handnote') {
          if (!it.el) { it.el = document.createElement('span'); it.el.className = 'bk-w is-green is-note2'; a.sheet.append(it.el); }
          it.el.textContent = zh() ? '让预约本自己记' : 'let the diary keep itself';
          const wide = innerWidth >= 1000; it.el.style.left = (wide ? W - 30 : W * .58) + 'px'; it.el.style.top = (wide ? rowY(1) - 6 : H - 10) + 'px';
        }
        if (it.kind === 'tick') it.paths = [path(a.svg, `M${P(W - 150, rowY(4.4))} L${P(W - 128, rowY(4.4) + 22)} L${P(W - 84, rowY(4.4) - 34)}`, 'is-green is-thick')];
      });
      a.drawn = -1;
    });
  }
  // a gentle fit on narrow screens: the page keeps its proportions and scales down
  const fit = () => acts.forEach(a => { const box2 = a.sec.querySelector('.bk-hand-fit'), k = Math.min(1, (box2.clientWidth - 8) / (W + (innerWidth >= 1000 ? 140 : 0))); a.sheet.style.setProperty('--k', k.toFixed(3)); box2.style.height = (a.sheet.offsetHeight * k) + 'px'; });

  // the pen follows the scroll
  const apply = a => {
    const p = a.p;
    a.items.forEach(it => {
      const k = it.pre ? 1 : clamp((p - it.from) / Math.max(.001, it.to - it.from));
      if (it.kind === 'write' || it.kind === 'handnote') { const el = it.el; if (el) el.style.clipPath = k >= 1 ? 'none' : `inset(-30% ${(100 - k * 100).toFixed(2)}% -30% -4%)`; }
      if (it.kind === 'bubble') { it.el.style.opacity = k > 0 ? Math.min(1, k * 2.5) : 0; it.el.style.transform = `translateY(${(1 - k) * 14}px) scale(${.92 + k * .08})`; const em = it.el.querySelector('em'); if (em) em.style.clipPath = k >= 1 ? 'none' : `inset(-30% ${(100 - clamp(k * 1.6 - .6) * 100).toFixed(2)}% -30% -4%)`; }
      if (it.paths) { const n = it.paths.length; it.paths.forEach((pa, i) => { const kk = clamp(k * n - i); pa.style.strokeDashoffset = (pa._L * (1 - kk)).toFixed(2); }); }
      if (it.noteEl) it.noteEl.style.clipPath = k >= 1 ? 'none' : `inset(-30% ${(100 - clamp(k * 2 - 1) * 100).toFixed(2)}% -30% -4%)`;
    });
    a.sec.classList.toggle('is-done', p > .98);
  };
  let last = performance.now();
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.08, (now - last) / 1000); last = now; const vh = innerHeight;
    acts.forEach(a => {
      const r = a.sheet.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) { if (a.drawn !== a.p) { apply(a); a.drawn = a.p; } return; }
      // starts when the page is low on the screen, finished once it is well up in view
      const target = calm ? 1 : clamp((vh * .86 - r.top) / (vh * .62));
      a.p += (target - a.p) * (1 - Math.exp(-dt * 3.2)); // a hand, not a jump
      if (Math.abs(a.p - a.drawn) > .0005) { apply(a); a.drawn = a.p; }
    });
  };
  render(); fit(); addEventListener('resize', () => { fit(); geometry(); });
  document.fonts?.ready.then(() => { geometry(); fit(); });
  setTimeout(() => { geometry(); fit(); }, 1500);
  document.addEventListener('portfolio:language', () => { render(); fit(); setTimeout(geometry, 300); });
  requestAnimationFrame(tick);
  return acts.map(a => a.sec);
}

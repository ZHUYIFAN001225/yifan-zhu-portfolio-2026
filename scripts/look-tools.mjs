// LOOK case, below the film.
//  • Acts: full-screen type that opens each main part. Every act moves differently (letters gather, a sentence splits in two,
//    a phone passes behind the words, a line turns hollow, the closing line).
//  • Two lines run down the page: pink for the user, lilac for the Creator. They stay in the side margins next to the text and
//    lean towards each other in every act: far apart, touching once at the picture, closer, side by side, and finally tied
//    together at the end. Click a line's tip and it twangs like a string; the words around it shake.
//  • The growth loop turns as you scroll past it.
//  • Each section takes a colour, so the page changes colour block by block.

const zh = () => document.documentElement.lang.startsWith('zh');
const TOOLS = ['polish', 'dryer', 'scissors', 'comb'];
const PAINT = [['#f6c6d8', '#7a1f4a'], ['#e7cdf3', '#4b1f6e'], ['#ffd6c4', '#7a3418'], ['#cbe9df', '#1d5a4a'], ['#f8e6a6', '#6b4d00']];
const BASE = { polish: PAINT[0], dryer: ['#f2e6d5', '#5a3a1c'], scissors: ['#e4d6ec', '#2a1d30'], comb: ['#d9e3f5', '#1f2f5a'] };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// Split text into letters while keeping the original text nodes, so the language switch keeps working.
function split(el) {
  if (!el) return null; if (el._lk) return el._lk;
  const saved = [], chars = [];
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3 && c.nodeValue.trim()) {
      const spans = [...c.nodeValue].map(ch => { const s = document.createElement('span'); s.className = 'lk-ch'; s.textContent = ch; if (ch.trim()) chars.push(s); return s; });
      const holder = document.createElement('span'); holder.className = 'lk-word'; holder.append(...spans);
      c.replaceWith(holder); saved.push([holder, c]);
    } else if (c.nodeType === 1 && getComputedStyle(c).display !== 'none') walk(c);
  });
  walk(el);
  const st = { chars, restore: () => { saved.forEach(([h, t]) => h.replaceWith(t)); el._lk = null; } };
  el._lk = st; return st;
}

export function mount() {
  const root = document.querySelector('[data-product-case=beauty]'); if (!root) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // section colours
  const secs = [...root.querySelectorAll('.v3-product-section.ux-section')].filter(s => s.querySelector(':scope>h2'));
  secs.forEach((s, k) => { const [bg, ink] = BASE[TOOLS[k % 4]]; s.dataset.lkBg = bg; s.dataset.lkInk = ink; });
  const applyInk = () => secs.forEach(s => { s.querySelector(':scope>h2').style.color = s.dataset.lkInk; });
  applyInk(); document.addEventListener('portfolio:language', () => setTimeout(applyInk, 60));
  fold(root);
  lumenNav(root);
  bridge(root);
  rail(root);
  const acts = mountActs(root, calm);
  // the dial and the ropes need a wide window; if the page opened narrow (a new tab or window still sizing up), add them as soon as it is wide
  let loopOn = false, ropesOn = false;
  const wide = matchMedia('(min-width: 761px)');
  // phones too (each lays itself out for a narrow screen)
  const up = () => {
    if (!loopOn) { try { mountLoop(); loopOn = true; } catch (e) { console.error(e); } }
    if (!ropesOn && !calm) { try { mountThreads(root, acts); ropesOn = true; } catch (e) { console.error(e); } }
  };
  up(); wide.addEventListener('change', up); addEventListener('resize', up); addEventListener('load', up);
}


// Long text stays one step away: each card shows its title and first line; the rest opens on hover, focus or tap.
function fold(root) {
  const sets = [
    ['.ux-decisions article', 'dl'],
    ['.ux-challenge-grid>div', 'p'],
    ['.ux-build>li', 'p'],
    ['.ux-research-plan>div', 'p'],
    ['.ux-evidence-note', 'p'],
    ['.ux-audience>div', 'p'],
    ['.ux-pains>div', 'p'],
    ['.ux-phases>li', 'p'],
    ['.ux-journey>li', 'p']
  ];
  // the journey becomes a row of polaroids, each showing the real screen of that step
  const SHOT = ['discover', 'detail', 'matches', 'availability', 'c-portfolio'];
  root.querySelectorAll('.ux-journey>li').forEach((li, i) => { if (li.querySelector('.lk-pol')) return; const f = document.createElement('span'); f.className = 'lk-pol'; f.innerHTML = `<img src="assets/v3/screens/look/${zh() ? 'zh/' : ''}${SHOT[i % SHOT.length]}.webp" alt="" loading="lazy" decoding="async">`; li.prepend(f); li.style.setProperty('--tilt', [-5, 4, -2, 5, -4][i % 5] + 'deg'); });
  root.querySelector('.ux-journey')?.classList.add('lk-polaroids');
  document.addEventListener('portfolio:language', () => root.querySelectorAll('.lk-pol img').forEach((im, i) => { im.src = `assets/v3/screens/look/${zh() ? 'zh/' : ''}${SHOT[i % SHOT.length]}.webp`; }));
  // every small card leans towards the pointer, like a card picked up off the table
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) root.querySelectorAll('.ux-pains>div, .ux-build>li, .ux-phases>li, .ux-challenge-grid>div, .ux-research-plan>div, .ux-decisions article').forEach(c => {
    c.classList.add('lk-tilt');
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.setProperty('--tx', (-y).toFixed(3)); c.style.setProperty('--ty', x.toFixed(3)); c.style.setProperty('--ta', (Math.hypot(x, y) * 14).toFixed(2) + 'deg'); c.style.setProperty('--gx', ((x + .5) * 100).toFixed(1) + '%'); c.style.setProperty('--gy', ((y + .5) * 100).toFixed(1) + '%'); });
    c.addEventListener('pointerleave', () => c.style.setProperty('--ta', '0deg'));
  });
  // the research plan: each step gets a little symbol of what happens in it
  const ICON = ['<svg viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z"/></svg>', '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>', '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8 12 3 3 5-6"/></svg>'];
  root.querySelectorAll('.ux-research-plan>div').forEach((d, i) => { if (d.querySelector('.lk-ico2')) return; const s = document.createElement('i'); s.className = 'lk-ico2'; s.innerHTML = ICON[i % 3]; d.prepend(s); });
  sets.forEach(([sel, body]) => root.querySelectorAll(sel).forEach(card => {
    const parts = [...card.querySelectorAll(':scope ' + body + ', :scope > div > ' + body)]; if (!parts.length) return;
    card.classList.add('lk-fold'); parts.forEach(x => x.classList.add('lk-fold-body'));
    card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-expanded', 'false');
    const toggle = () => { const o = card.classList.toggle('is-open'); card.setAttribute('aria-expanded', o); };
    card.addEventListener('click', e => { if (e.target.closest('a')) return; toggle(); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }));
  // long paragraphs at the top of a section: two lines, then "more"
  root.querySelectorAll('#release .ux-section-body>p:first-child, #research .ux-section-body>p:not([class]), #build .ux-section-body>p:first-child').forEach(pp => { pp.classList.add('lk-clamp'); pp.tabIndex = 0; pp.addEventListener('click', () => pp.classList.toggle('is-open')); pp.addEventListener('keydown', e => { if (e.key === 'Enter') pp.classList.toggle('is-open'); }); });
}

// "Real work" between the two sides: one real picture that flips — inspiration for the user, portfolio for the Creator.
function bridge(root) {
  const link = root.querySelector('.ux-bridge-link'); if (!link || link.querySelector('.lk-flip')) return;
  const src = 'assets/v3/look-film/w1.webp';
  const el = document.createElement('div'); el.className = 'lk-flip'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<i class="lk-flip-wire lk-flip-wire--l"></i><div class="lk-flip-card"><div class="lk-flip-face lk-flip-u"><img src="${src}" alt="" loading="lazy" decoding="async"><b></b></div><div class="lk-flip-face lk-flip-c"><img src="${src}" alt="" loading="lazy" decoding="async"><span class="lk-flip-who"><i></i><em>Amy</em></span><b></b></div></div><i class="lk-flip-wire lk-flip-wire--r"></i>`;
  link.append(el); link.classList.add('has-flip');
  const words = () => { el.querySelector('.lk-flip-u b').textContent = zh() ? '对用户：灵感' : 'For the user: inspiration'; el.querySelector('.lk-flip-c b').textContent = zh() ? '对 Creator：作品集' : 'For the Creator: portfolio'; };
  words(); document.addEventListener('portfolio:language', words);
}

// Business model: price tags on a clothes rail. A hair dryer holds the left end of the rail; click it and the tags blow about.
function rail(root) {
  const box = root.querySelector('.ux-principles--4'); if (!box || box.querySelector('.lk-dryer')) return;
  box.classList.add('lk-rail');
  const tags = [...box.children]; tags.forEach((t, i) => { t.classList.add('lk-tag'); t.style.setProperty('--i', i); });
  const svg = document.querySelector('.fm-prop[data-prop="dryer"] svg')?.outerHTML || '';
  const d = document.createElement('button'); d.type = 'button'; d.className = 'lk-dryer'; d.dataset.cursor = 'dryer';
  d.innerHTML = `${svg}<span class="lk-wind"><i></i><i></i><i></i></span>`;
  const lab = () => d.setAttribute('aria-label', zh() ? '吹风机：吹一下这些价格牌' : 'Hair dryer: blow the price tags'); lab(); document.addEventListener('portfolio:language', lab);
  // (the hair dryer was tried and removed: touching a tag is enough)
  // each tag swings like a pendulum hanging from its string
  const st = tags.map(() => ({ a: 0, v: 0, lift: 0 })); let raf = 0;
  const step = () => { raf = 0; let moving = false;
    st.forEach((s, i) => { s.v += -s.a * .0045 + (Math.random() - .5) * .012 * breeze; s.v *= .988; s.a += s.v; s.lift *= .94; tags[i].style.setProperty('--sw', s.a.toFixed(2) + 'deg'); tags[i].style.setProperty('--lift', s.lift.toFixed(1) + 'px'); if (Math.abs(s.a) > .05 || Math.abs(s.v) > .05 || s.lift > .3) moving = true; });
    if (moving || breeze) raf = requestAnimationFrame(step); };
  // a soft breeze keeps them drifting a little while they are on screen
  let breeze = 0; new IntersectionObserver(es => { breeze = es[0].isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0; if (breeze && !raf) raf = requestAnimationFrame(step); }).observe(box);
  const kick = (i, f) => { st[i].v += f; if (!raf) raf = requestAnimationFrame(step); };
  let gusts = 0, gustT = 0;
  d.addEventListener('click', () => {
    const now = performance.now(); gusts = now - gustT < 1600 ? gusts + 1 : 1; gustT = now;
    d.classList.remove('is-blow'); void d.offsetWidth; d.classList.add('is-blow');
    tags.forEach((t, i) => setTimeout(() => { kick(i, -(5 + gusts * 2.4) * (1 - i * .12)); st[i].lift += 8 + gusts * 3; }, 90 + i * 110));
  });
  // brushing past a tag sets it swinging like fabric in the air: the faster the pointer, the bigger the swing, and it spreads a little to its neighbours
  let lx = 0, lt = 0; addEventListener('pointermove', e => { lx = e.clientX; lt = performance.now(); }, { passive: true });
  tags.forEach((t, i) => t.addEventListener('pointerenter', e => { const dt = Math.max(16, performance.now() - lt), vx = (e.clientX - lx) / dt; const f = Math.max(-1.1, Math.min(1.1, vx * .6 || (e.clientX < t.getBoundingClientRect().left + t.offsetWidth / 2 ? .6 : -.6))); kick(i, f); if (st[i - 1]) kick(i - 1, f * .3); if (st[i + 1]) kick(i + 1, f * .3); }));
}

// ---------- acts ----------
function mountActs(root, calm) {
  const acts = [...root.querySelectorAll('.lk-act')].map(el => ({ el, style: el.dataset.act, p: 0 }));
  // each act takes the colour of the block it opens, so the big words and what follows read as one page
  const tone = () => acts.forEach(a => {
    let n = a.el.nextElementSibling; while (n && !(n.matches('.ux-section, .xp'))) n = n.nextElementSibling;
    if (n?.matches('.xp')) { a.el.dataset.tone = 'dark'; a.el.dataset.lkBg = '#120d13'; n.dataset.lkBg = '#120d13'; }
    else if (n) { a.el.dataset.lkBg = n.dataset.lkBg || '#e4d6ec'; a.el.style.setProperty('--act-accent', n.dataset.lkInk || '#c2457a'); }
    else { a.el.dataset.tone = 'dark'; a.el.dataset.lkBg = '#120d13'; } // the closing act sits on the footer's dark
  });
  tone();
  // the words rise once, as soon as the act comes into view, and stay; scrolling back does not replay them
  if (calm || !('IntersectionObserver' in window)) acts.forEach(a => a.el.classList.add('is-in'));
  else { const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { threshold: 0, rootMargin: '0px 0px -38% 0px' }); acts.forEach(a => io.observe(a.el)); } // starts only once the words are well into view
  // scroll progress through each act, used only by the two lines
  let q = false;
  const run = () => { q = false; const vh = innerHeight; acts.forEach(a => { const r = a.el.getBoundingClientRect(); a.p = clamp((vh - r.top) / (r.height + vh)); }); };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); addEventListener('resize', run); run();
  return acts;
}

// ---------- the two lines ----------
// Two quiet lines behind the content: the user (pink) starts at the left edge, the Creator (lilac) at the right.
// The further you read, the closer they come; under the closing words they meet and tie a knot.
// Bring the pointer near a line and it gives way like a string, then springs back.
function mountThreads(root, acts) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'lk-threads'); svg.setAttribute('aria-hidden', 'true');
  const mk = (tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); svg.append(e); return e; };
  // each rope: a soft shadow on the page, the rope itself, and a twisted highlight so it reads as braided cord
  const shU = mk('path', 'lk-rope-sh'), shC = mk('path', 'lk-rope-sh'), shJ = mk('path', 'lk-rope-sh');
  const pathU = mk('path', 'lk-th lk-th--u'), pathC = mk('path', 'lk-th lk-th--c'), pathJ = mk('path', 'lk-th lk-th--j');
  const twU = mk('path', 'lk-rope-tw'), twC = mk('path', 'lk-rope-tw'), twJ = mk('path', 'lk-rope-tw');
  // the knot: the pink rope and the lilac rope wrap round each other in a tight overhand knot, then carry on as one cord
  const knotSh = mk('path', 'lk-rope-sh lk-knot-sh'), knotC = mk('path', 'lk-knot lk-knot--c'), knotU = mk('path', 'lk-knot lk-knot--u'), knotUt = mk('path', 'lk-rope-tw'), knotCt = mk('path', 'lk-knot lk-knot--c lk-knot--over'), knot = knotU;
  const dotU = mk('circle', 'lk-dot lk-dot--u'), dotC = mk('circle', 'lk-dot lk-dot--c'); [dotU, dotC].forEach(d => d.setAttribute('r', 5));
  // behind everything on the page, just above the coloured backdrop
  const bg = document.querySelector('.lk-glow') || document.querySelector('.lk-bg'); bg ? bg.after(svg) : document.body.prepend(svg);
  const mkLabel = cls => { const p = document.createElement('p'); p.className = 'lk-th-label ' + cls; p.setAttribute('aria-hidden', 'true'); document.body.append(p); return p; };
  const labU = mkLabel('lk-th-label--u'), labC = mkLabel('lk-th-label--c'), knotSay = mkLabel('lk-knot-say');
  const note = mkLabel('lk-th-note');
  // touch a rope and it says what that side is going through
  const say = document.createElement('div'); say.className = 'lk-rope-say'; say.setAttribute('aria-live', 'polite'); document.body.append(say);
  // what each side says depends on where on the rope you pluck: pains at the top, finding each other in the middle,
  // and near the knot what it is like once they are connected — the rope is also a timeline
  const SAY = {
    u: [
      [['“I love it, but I don’t know what it’s called.”', '“我觉得好看，但不知道它叫什么。”'], ['“Pinterest shows me looks, not who can do them.”', '“Pinterest 给我看造型，却不告诉我谁能做。”'], ['“I have to pick a salon before I see the work.”', '“我得先选店，才能看到作品。”']],
      [['“I saved the picture, and it showed me who made it.”', '“我收藏了这张图，它告诉了我是谁做的。”'], ['“Three people nearby can do this look.”', '“附近有三个人能做这个造型。”'], ['“Her own work looks just like my picture.”', '“她自己的作品和我那张图几乎一样。”']],
      [['“Found her. Booked for Wednesday, 2pm.”', '“找到她了，约在周三下午两点。”'], ['“She already had my picture when I sat down.”', '“我一坐下，她已经看过我的参考图了。”'], ['“It came out exactly like the photo.”', '“做出来和照片一模一样。”']]
    ],
    c: [
      [['“Instagram gives me likes, not bookings.”', '“Instagram 给我点赞，不给我预约。”'], ['“I post real work every day, but few new customers find me.”', '“我每天发真实作品，却很少带来新客户。”'], ['“My work should be my shop window.”', '“我的作品，就该是我的橱窗。”']],
      [['“My work is tagged by style now.”', '“我的作品按风格被标好了。”'], ['“Someone nearby asked: can you do this?”', '“附近有人问我：这个你能做吗？”'], ['“I answered with my own picture, not a promise.”', '“我用自己的作品回答，而不是一句保证。”']],
      [['“A new customer, from one picture.”', '“一张图，带来一位新客人。”'], ['“The booking came with her reference attached.”', '“预约里直接附上了她的参考图。”'], ['“Her result is now in my portfolio too.”', '“她的成品也进了我的作品集。”']]
    ]
  };
  const sayK = { u: [0, 0, 0], c: [0, 0, 0] }; let sayT = 0, touching = '';
  // the bubble grows out of the point that was plucked, points back at it, and rides along with the rope
  let sayAt = null;
  const pageText = (root.textContent || '').replace(/[“”"’']/g, '').toLowerCase();
  const shown = l => { const q = l[zh() ? 1 : 0].replace(/[“”"’'。.]/g, '').toLowerCase().trim(); return pageText.includes(q.slice(0, 28)); };
  const speak = (side, docY) => { const P = clamp((docY - startY) / Math.max(1, knotDoc - startY)), stg = P < .38 ? 0 : P < .72 ? 1 : 2, all = SAY[side][stg], fresh = innerWidth < 761 ? all.filter(x => !shown(x)) : all; if (!fresh.length) return; const list = fresh, l = list[sayK[side][stg]++ % list.length]; say.innerHTML = `<b>${side === 'u' ? (zh() ? '用户' : 'User') : 'Creator'}</b>${l[zh() ? 1 : 0]}`; say.dataset.side = side; sayAt = { side, docY }; say.classList.remove('is-on'); void say.offsetWidth; say.classList.add('is-on'); clearTimeout(sayT); sayT = setTimeout(() => { say.classList.remove('is-on'); setTimeout(() => { if (!say.classList.contains('is-on')) sayAt = null; }, 400); }, 3400); };
  const words = () => {
    labU.innerHTML = zh() ? '<strong>用户</strong>想找到做这个造型的人' : '<strong>User</strong>looking for who made a look';
    labC.innerHTML = zh() ? '<strong>Creator</strong>想让作品带来客人' : '<strong>Creator</strong>wants their work to bring customers';
    note.textContent = zh() ? '往下看，平台会把他们连起来 ↓' : 'Keep scrolling: the platform brings them together ↓';
    knotSay.textContent = zh() ? '用户和 Creator，连上了。' : 'User and Creator, connected.';
  };
  words(); document.addEventListener('portfolio:language', words);

  let startY = 0, knotDoc = 1e9, endY = 1e9;
  const measure = () => {
    const first = acts[0]?.el, last = acts[acts.length - 1]?.el; if (!first || !last) return;
    startY = first.getBoundingClientRect().top + scrollY + innerHeight * .1;
    knotDoc = last.querySelector('.lk-act-cap').getBoundingClientRect().bottom + scrollY + 46;
    endY = last.getBoundingClientRect().bottom + scrollY;
  };
  // the big words of every act, in page coordinates: the ropes go round them, never through them
  let boxesT = [];
  const measureType = () => { boxesT = acts.map(a => { const r = a.el.querySelector('.lk-act-type').getBoundingClientRect(), k = a.el.querySelector('.lk-act-kicker').getBoundingClientRect(); return { t: k.top + scrollY - 24, b: r.bottom + scrollY + 24, l: r.left - 34, r: r.right + 34 }; }); };
  measureType(); addEventListener('resize', measureType); setInterval(measureType, 1000);
  const avoid = (docY, p) => { for (const q of boxesT) { const f = Math.min(ss(q.t - 80, q.t, docY), 1 - ss(q.b, q.b + 80, docY)); if (f <= 0) continue; p.u = Math.min(p.u, p.u + (q.l - p.u) * f); p.c = Math.max(p.c, p.c + (q.r - p.c) * f); } return p; };
  measure(); addEventListener('resize', measure); addEventListener('load', measure); setInterval(measure, 1000);

  // where each line is at a point of the page: apart at the start, together at the knot
  const ease = t => t * t * (3 - 2 * t);
  const base = docY => {
    const W = innerWidth;
    if (W < 761) {   // phones: no side margins — the ropes keep to the screen edges, clear of the text, and meet only at the end
      const from = boxesT.length ? boxesT[boxesT.length - 1].b : knotDoc - innerHeight * .5;   // below the closing words, never across them
      const e2 = ease(clamp((docY - from) / Math.max(40, knotDoc - from)));
      return { u: 6 + (W * .5 - 6) * e2, c: W - 6 - (W * .5 - 6) * e2 };
    }
    const P = clamp((docY - startY) / Math.max(1, knotDoc - startY)), e = ease(Math.pow(P, 1.15));
    const wave = Math.sin(docY / 520) * W * .022 * (1 - e);
    return avoid(docY, { u: W * .045 + (W * .5 - W * .045) * e + wave, c: W * .955 - (W * .955 - W * .5) * e - Math.sin(docY / 520 + 1.3) * W * .022 * (1 - e) });
  };
  // the pointer pushes a line aside like a string
  let mx = -1e4, my = -1e4, pmx = -1e4; const spring = { u: { a: 0, v: 0 }, c: { a: 0, v: 0 } };
  // sweep across a line and it twangs: a ripple runs up and down the string from where you crossed it
  const ripples = [];
  const wave = (side, y, now) => { let d = 0; for (const r of ripples) { if (r.side !== side) continue; const t = (now - r.t) / 1000, dy = Math.abs(y - r.y); d += r.amp * Math.sin(dy / 24 - t * 16) * Math.exp(-dy / 320) * Math.exp(-t * 1.6) * (dy < t * 900 ? 1 : 0); } return d; };
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -1e4; });

  const BUSY = 'p,h1,h2,h3,h4,li,img,figure,dl,blockquote,a,button,article:not(.v3-product-page),.lk-fold,svg:not(.lk-threads),.lk-tag,.lk-pol,.lk-flip,.lk-loop,[class*=card],[class*=shot]';
  const clearY = (side, vh) => {
    const w = Math.min(250, innerWidth * .7), x0 = side === 'u' ? 22 : innerWidth - 22 - w;
    for (const f of [.42, .3, .55, .66, .24]) { const y = vh * f; let free = true;
      for (let dy = -34; dy <= 34 && free; dy += 17) for (let dx = 8; dx < w && free; dx += 40) { const el = document.elementFromPoint(x0 + dx, y + dy); if (!el || el.closest(BUSY) || el.closest('.ux-case-index,.v3-mobile-dock,.lk-rope-say')) free = false; }
      if (free) return y; }
    return null;
  };
  let raf = 0, autoY = -1e9, autoSide = 'c';
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const vh = innerHeight, sy = scrollY;
    const on = sy + vh > startY && sy < endY;
    document.body.classList.toggle('lk-th-on', on); if (!on) return;
    // springs
    const at = base(sy + my);
    const now = performance.now();
    for (const k of ['u', 'c']) { const s = spring[k], d = mx - at[k], T = Math.abs(d) < 190 && my > 0 ? -Math.sign(d) * (190 - Math.abs(d)) * .55 : 0; s.v += (T - s.a) * .14; s.v *= .78; s.a += s.v;
      if (pmx > -1e3 && Math.sign(pmx - at[k]) !== Math.sign(mx - at[k]) && Math.abs(mx - pmx) > 3) { ripples.push({ side: k, y: my, t: now, amp: Math.min(30, 6 + Math.abs(mx - pmx) * 1.2) }); s.v += Math.sign(mx - pmx) * 6; if (my > startY - sy && my < knotDoc - sy - 140 && (!sayAt || now - (sayAt.t || 0) > 700)) { speak(k, sy + my); sayAt.t = now; } } }
    pmx = mx; while (ripples.length && now - ripples[0].t > 2600) ripples.shift();
    const y0 = Math.max(0, startY - sy), y1 = Math.min(vh, endY - sy), yk = knotDoc - sy;
    let dU = '', dC = '', dJ = '';
    for (let vy = y0, i = 0; vy <= y1 + 1; vy += 10, i++) {
      const y = Math.min(vy, y1), b = base(sy + y), g = Math.exp(-Math.pow((y - my) / 110, 2));
      if (y <= yk) {
        // the knot holds the ropes: the closer to it, the less they can swing
        const hold = clamp((yk - y) / 160), gh = g * hold;
        const u = b.u + (spring.u.a * gh + wave('u', y, now) * hold), c = b.c + (spring.c.a * gh + wave('c', y, now) * hold);
        dU += (dU ? 'L' : 'M') + u.toFixed(1) + ' ' + y.toFixed(1); dC += (dC ? 'L' : 'M') + c.toFixed(1) + ' ' + y.toFixed(1);
      } else { const x = innerWidth / 2; if (!dJ) dJ = `M${x} ${Math.max(yk + 22, 0).toFixed(1)}`; dJ += `L${x} ${y.toFixed(1)}`; }
    }
    if (sayAt) { const y = sayAt.docY - sy, b = base(sayAt.docY), g = Math.exp(-Math.pow((y - my) / 110, 2)), side = sayAt.side, x = b[side] + spring[side].a * g + wave(side, y, now);
      say.style.left = (side === 'u' ? x + 16 : x - 16).toFixed(1) + 'px'; say.style.top = y.toFixed(1) + 'px'; }
    [[pathU, shU, twU, dU], [pathC, shC, twC, dC], [pathJ, shJ, twJ, dJ]].forEach(([a, b, c, d]) => { a.setAttribute('d', d); b.setAttribute('d', d); c.setAttribute('d', d); });
    // phones have no pointer to pluck the ropes with, so the ropes speak by themselves as you scroll past:
    // one side, then the other, a line from what that person is going through at that point of the story
    // only into a clear stretch of page (never over a card or a line of text), never a line the page already shows nearby,
    // and only every couple of screens
    if (innerWidth < 761 && !sayAt) { const midD = sy + vh * .5; if (midD > startY + vh * .6 && midD < knotDoc - vh * .5 && Math.abs(sy - autoY) > vh * 2) { const side = autoSide === 'u' ? 'c' : 'u', y = clearY(side, vh); if (y != null) { autoY = sy; autoSide = side; speak(side, sy + y); } } }
    // a dot rides each line in the middle of the screen
    const mid = vh * .5, bm = base(sy + mid), gm = Math.exp(-Math.pow((mid - my) / 110, 2));
    const showDots = mid >= y0 && mid <= Math.min(y1, yk);
    [[dotU, bm.u + spring.u.a * gm], [dotC, bm.c + spring.c.a * gm]].forEach(([d, x]) => { d.setAttribute('cx', x.toFixed(1)); d.setAttribute('cy', mid); d.style.opacity = 0; });
    // labels once, where the lines begin
    const ls = startY - sy + 34, bl = base(startY + 34);
    labU.style.transform = `translate3d(${(bl.u + 14).toFixed(1)}px,${ls.toFixed(1)}px,0)`; labC.style.transform = `translate3d(${(bl.c - 14).toFixed(1)}px,${ls.toFixed(1)}px,0)`;
    const lv = ls > 40 && ls < vh - 60; labU.classList.toggle('is-on', lv); labC.classList.toggle('is-on', lv);
    note.style.transform = `translate3d(${innerWidth / 2}px,${(ls + (innerWidth < 761 ? 58 : 6)).toFixed(1)}px,0)`; note.classList.toggle('is-on', lv);
    // the knot where they meet
    const kx = innerWidth / 2, kv = yk > -30 && yk < vh + 30;
    // a real knot: two loops crossing, with the two colours twisting into one
    if (kv) {
      const x = kx, y = yk, k = 1.7, P = (a, b) => `${(x + a * k).toFixed(1)} ${(y + b * k).toFixed(1)}`;
      // overhand knot woven from both ropes: lilac loop underneath, pink loop crossing over it, then lilac crosses back on top
      const dc = `M${P(3, -1)}C${P(13, -2)} ${P(12, 10)} ${P(3, 11)}C${P(-6, 12)} ${P(-9, 3)} ${P(-3, -3)}C${P(1, -7)} ${P(4, -3)} ${P(2, 3)}L${P(1, 14)}`;
      const du = `M${P(-3, -1)}C${P(-13, -2)} ${P(-12, 10)} ${P(-3, 11)}C${P(6, 12)} ${P(9, 3)} ${P(3, -3)}C${P(-1, -7)} ${P(-4, -3)} ${P(-2, 3)}L${P(-1, 14)}`;
      const over = `M${P(-6, 9)}C${P(-2, 12)} ${P(4, 12)} ${P(7, 8)}`; // the lilac strand passing over the pink at the front
      knotC.setAttribute('d', dc); knotU.setAttribute('d', du); knotCt.setAttribute('d', over); knotUt.setAttribute('d', ''); knotSh.setAttribute('d', dc + du);
    }
    [knotC, knotCt, knotU, knotUt, knotSh].forEach(e => e.style.opacity = kv ? 1 : 0);
    knotSay.style.transform = innerWidth < 761 ? `translate3d(${innerWidth - 20}px,${(yk + 44).toFixed(1)}px,0)` : `translate3d(${kx + 34}px,${(yk + 30).toFixed(1)}px,0)`; knotSay.classList.toggle('is-on', kv && yk < vh - 40);
  };
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
}

// "The loop that makes it grow": a dial that turns as you scroll past it. The arc runs from user pink to Creator lilac,
// the step reaching the top lights up, and a real-feeling phone in the middle (thickness, metal rim, tilts with the pointer)
// shows that step's actual screen.
export function mountLoop() {
  const ol = document.querySelector('[data-product-case=beauty] .ux-flywheel'); if (!ol || ol.closest('.lk-loop')) return;
  const SHOTS = ['c-upload', 'discover', 'saved', 'detail', 'availability', 'booked', 'c-portfolio', 'similar'];
  const items = [...ol.children]; const N = items.length; if (N < 3) return;
  const ticks = Array.from({ length: 96 }, (_, k) => { const a = k / 96 * Math.PI * 2, r1 = 44.2, r2 = k % 12 === 0 ? 46.2 : 45.2; return `<line x1="${(50 + r1 * Math.cos(a)).toFixed(2)}" y1="${(50 + r1 * Math.sin(a)).toFixed(2)}" x2="${(50 + r2 * Math.cos(a)).toFixed(2)}" y2="${(50 + r2 * Math.sin(a)).toFixed(2)}"/>`; }).join('');
  const wrap = document.createElement('div'); wrap.className = 'lk-loop'; wrap.style.setProperty('--n', N);
  wrap.innerHTML = `<svg class="lk-loop-ring" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="lkArc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0457f"/><stop offset="1" stop-color="#8a5fd6"/></linearGradient><filter id="lkGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter></defs>
      <g class="lk-loop-ticks">${ticks}</g><circle cx="50" cy="50" r="40" class="lk-loop-track"/><circle cx="50" cy="50" r="40" class="lk-loop-arc" pathLength="100"/><circle r="1.6" class="lk-loop-head-glow" filter="url(#lkGlow)"/><circle r=".9" class="lk-loop-head"/></svg>
    <div class="lk-loop-phone" aria-hidden="true"><span class="dev lk-phone3d">${Array.from({ length: 7 }, (_, k) => `<i class="dev-side" style="--k:${7 - k}"></i>`).join('')}<span class="dev-screen"><span class="dev-view lk-ph-screen">${items.map((_, k) => `<img src="assets/v3/screens/look/${SHOTS[k % SHOTS.length]}.webp" alt="" loading="lazy" decoding="async"${k ? '' : ' class="is-on"'}/>`).join('')}</span></span><i class="dev-shine"></i></span><i class="lk-ph-shadow"></i></div>
    <ol class="lk-loop-nodes"></ol>`;
  const list = wrap.querySelector('.lk-loop-nodes');
  items.forEach((li, k) => {
    li.style.setProperty('--k', k); li.classList.add('lk-node');
    // keep the original text node (so translation still works), just give it its own box outside the ring
    const txt = [...li.childNodes].filter(n => n.nodeType === 3 && n.nodeValue.trim()); const lab = document.createElement('b'); lab.className = 'lk-node-label'; txt.forEach(n => lab.append(n)); li.append(lab);
    list.append(li);
  });
  ol.replaceWith(wrap); wrap.append(ol); ol.hidden = true;
  const cap = document.createElement('p'); cap.className = 'lk-loop-cap'; cap.setAttribute('aria-hidden', 'true'); wrap.append(cap);   // phones: the step on top, in words, under the dial
  const imgs = [...wrap.querySelectorAll('.lk-ph-screen img')], arc = wrap.querySelector('.lk-loop-arc'), head = wrap.querySelector('.lk-loop-head'), glow = wrap.querySelector('.lk-loop-head-glow'), ph = wrap.querySelector('.lk-phone3d');
  const zhSrc = s => s.replace(/\/([^/]+)$/, '/zh/$1');
  const lang = () => imgs.forEach(i => { const en = i.dataset.enSrc || (i.dataset.enSrc = i.getAttribute('src')); const want = zh() ? zhSrc(en) : en; if (i.getAttribute('src') !== want) i.setAttribute('src', want); });
  lang(); document.addEventListener('portfolio:language', () => setTimeout(lang, 30));
  const step = 360 / N; let th = 0, target = 0, cur = -1, raf = 0, rx = 0, ry = 0, trx = 0, tryy = 0, swing = 0;
  const calc = () => { const r = wrap.getBoundingClientRect(), vh = innerHeight; const p = clamp((vh * .75 - r.top) / (r.height + vh * .2)); target = -p * step * (N - 1); };
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine) { wrap.addEventListener('pointermove', e => { const r = wrap.getBoundingClientRect(); tryy = ((e.clientX - r.left) / r.width - .5) * 30; trx = -((e.clientY - r.top) / r.height - .5) * 22; go(); }); wrap.addEventListener('pointerleave', () => { trx = tryy = 0; go(); }); }
  const tick = now => {
    raf = 0; th += (target - th) * .12; rx += (trx - rx) * .1; ry += (tryy - ry) * .1; swing *= .9;
    wrap.style.setProperty('--th', th.toFixed(2));
    // the arc is the trail of the steps already passed: it starts at step 01 and ends at the step now on top
    const passed = clamp(-th / 360);
    arc.style.transform = `rotate(${(th - 90).toFixed(2)}deg)`; arc.style.strokeDashoffset = (100 - passed * 100).toFixed(2);
    [head, glow].forEach(c => { c.setAttribute('cx', 50); c.setAttribute('cy', 10); });
    const k = ((Math.round(-th / step) % N) + N) % N;
    if (k !== cur) { if (cur >= 0) swing = 1; cur = k; items.forEach((li, j) => li.classList.toggle('is-on', j === k)); imgs.forEach((im, j) => im.classList.toggle('is-on', j === k)); cap.innerHTML = `<b>${String(k + 1).padStart(2, '0')}</b>${items[k].querySelector('.lk-node-label')?.textContent || ''}`; }
    const t = (now || performance.now()) / 1000;
    // stands almost upright so the screen reads; leans a little towards the pointer, just enough to show the metal edge
    ph.style.transform = `rotateX(${(2 + rx * 1.3 + Math.sin(t * .8) * 1).toFixed(2)}deg) rotateY(${(ry * 1.7 + Math.sin(t * .6) * 1.5 + swing * 10).toFixed(2)}deg)`; // symmetric: straight on at rest, leans the same amount either way
    ph.style.setProperty('--mrx2', (ry / 15).toFixed(3));
    raf = requestAnimationFrame(tick);
  };
  const go = () => { calc(); if (!raf) raf = requestAnimationFrame(tick); };
  // keep it moving only while it is on screen
  new IntersectionObserver(es => { if (es[0].isIntersecting) go(); else { cancelAnimationFrame(raf); raf = 0; } }).observe(wrap);
  addEventListener('scroll', calc, { passive: true }); addEventListener('resize', calc); go();
  document.addEventListener('portfolio:language', () => setTimeout(() => { cur = -1; go(); }, 60));
}

// Phones: the chapter bar along the top becomes a lit rail, the same as the salon case's but in LOOK pink — the chapters
// already read glow along the bottom edge, and under the current one the line dips round a glass knob that slides along.
// It only draws on a narrow screen; on a computer the bar stays exactly as it was.
function lumenNav(root) {
  const nav = root.querySelector('.ux-case-index'); if (!nav || nav.querySelector('.lk-lumen-h')) return;
  const narrow = matchMedia('(max-width: 760px)'), NS = 'http://www.w3.org/2000/svg', B = 9, W2 = 34;
  nav.classList.add('lk-lumen');
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'lk-lumen-h'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><filter id="lklh-b" x="-1" y="-3" width="3" height="7"><feGaussianBlur stdDeviation="4.5"/></filter></defs><path class="t"/><path class="g"/><path class="l"/><ellipse class="halo" rx="26" ry="11"/>';
  const knob = document.createElement('i'); knob.className = 'lk-knob-h'; knob.setAttribute('aria-hidden', 'true');
  nav.prepend(svg); nav.append(knob);
  const T = svg.querySelector('.t'), G = svg.querySelector('.g'), Lp = svg.querySelector('.l'), halo = svg.querySelector('.halo');
  const links = () => [...nav.querySelectorAll('a')].filter(a => !a.matches('.ux-index-try, .ux-index-top') && a.offsetWidth);
  let kx = null, kf = 0, sig = '', last = performance.now();
  const path = (x0, x1, y, k, amt) => { let d = ''; for (let x = x0; x <= x1 + .01; x += 4) { const u = (x - k) / W2; d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + B * amt * Math.exp(-u * u * 2.2)).toFixed(2); } return d; };
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.06, (now - last) / 1000); last = now; const E = r => 1 - Math.exp(-dt * r);
    if (!narrow.matches) return;
    const r = nav.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const ls = links(); if (!ls.length) return;
    const on = ls.find(a => a.getAttribute('aria-current') === 'location');
    const mid = a => a.offsetLeft + a.offsetWidth / 2;
    const want = on ? mid(on) : ls[0].offsetLeft;
    kx = kx == null ? want : kx + (want - kx) * E(6.5); kf += ((on ? 1 : 0) - kf) * E(5);
    const W = nav.scrollWidth, H = nav.clientHeight, y = H - 13;
    const s2 = `${kx.toFixed(1)}|${kf.toFixed(3)}|${W}|${H}`; if (s2 === sig) return; sig = s2;   // nothing moved: leave the page alone
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.style.width = W + 'px'; svg.style.height = H + 'px';
    const x0 = ls[0].offsetLeft, x1 = ls[ls.length - 1].offsetLeft + ls[ls.length - 1].offsetWidth;
    T.setAttribute('d', path(x0, x1, y, kx, kf));
    const lx = Math.max(x0, kx); Lp.setAttribute('d', path(x0, lx, y, kx, kf)); G.setAttribute('d', path(Math.max(x0, kx - 70), lx, y, kx, kf));
    G.style.opacity = kf.toFixed(3);
    halo.setAttribute('cx', kx.toFixed(1)); halo.setAttribute('cy', (y + B * kf - 1).toFixed(1)); halo.style.opacity = (kf * .85).toFixed(3);
    knob.style.transform = `translate3d(${kx.toFixed(1)}px,${(y - 1).toFixed(1)}px,0) translate(-50%,-50%) scale(${(.55 + .45 * kf).toFixed(3)})`;
    knob.style.opacity = (.2 + .8 * kf).toFixed(3);
  };
  requestAnimationFrame(tick);
  // keep the current chapter in view inside the bar
  let lastOn = null; setInterval(() => { if (!narrow.matches) return; const on = nav.querySelector('a[aria-current="location"]'); if (on && on !== lastOn) { lastOn = on; const l = on.offsetLeft - nav.clientWidth * .35; nav.scrollTo({ left: Math.max(0, l), behavior: 'smooth' }); } }, 400);
}

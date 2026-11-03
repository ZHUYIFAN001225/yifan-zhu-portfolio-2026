// Home (preview v5), in four layers:
//  1. Who I am — a scene from my own Blender film, letterboxed like a cinema; my name and one line about what I do.
//     The bars open and the scene settles as you scroll.
//  2. How I make things — one way of working, four kinds of output. The section holds still while you scroll through
//     four steps; each step changes the shot beside it (my own research, notes, product and 3D work), graded into the
//     film's light so it reads as one sequence.
//  3. The work — everything, filtered by the four kinds of role it is evidence for.
//  4. More about me — About, CV and email, set like end credits.
import { projects, categories, featured } from './portfolio-catalog.mjs';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const getLang = () => { const q = new URLSearchParams(location.search).get('lang'); if (q === 'zh' || q === 'en') return q; try { return localStorage.getItem('portfolio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } };
let lang = getLang();
const L = v => Array.isArray(v) ? v[lang === 'zh' ? 1 : 0] : v ? (v[lang] || v.en) : '';

const T = {
  name: ['Yifan Zhu', '朱异凡'], role: ['Research-led multidisciplinary designer', '研究驱动的跨领域设计师'],
  nav_work: ['Work', '作品'], nav_about: ['About', '关于'], nav_contact: ['Contact', '联系'],
  line: ['I design products, services, tools and films, starting from the people they are for.', '我做产品、服务、工具和影像，出发点始终是用它的人。'],
  credit: ['A scene from Living in the Shadows, a film I made in Blender.', '画面来自我用 Blender 做的短片 Living in the Shadows。'],
  how: ['How I work', '我怎么做设计'], how_end: ['One way of working, four kinds of output.', '同一种工作方式，四种产出。'],
  work: ['Work', '作品'], all: ['All work', '全部'],
  about_h: ['About me', '关于我'], about_s: ['How I work, what I care about and where I come from.', '我怎么工作、在意什么、从哪里来。'],
  cv_h: ['CV', '简历'], cv_s: ['A version for the role you are hiring for, on request.', '按你在招的岗位，发一份对口的简历。'],
  mail_h: ['Email', '邮件'], top: ['Back to top', '回到顶部']
};
// one way of working, four kinds of output — each with a real piece of my work
const STEPS = [
  { t: ['Start with people', '从人开始'], p: ['I watch, listen and map what is really going on before deciding what to make.', '先观察、倾听，把真实发生的事情梳理清楚，再决定要做什么。'], from: ['From The Anxiety Market', '出自 The Anxiety Market'], img: 'assets/v3/anxiety-wall-guided.webp', href: 'project-anxiety-market.html' },
  { t: ['Find the structure', '找到结构'], p: ['Notes turn into journeys, rules and systems that hold a service together.', '笔记变成旅程、规则和系统，把一项服务撑起来。'], from: ['From The Anxiety Market', '出自 The Anxiety Market'], img: 'assets/v3/anxiety-notebook.webp', href: 'project-anxiety-market.html' },
  { t: ['Make something people can use', '做成能用的东西'], p: ['An app, a tool or an object that people can actually try, test and change.', '一个应用、一个工具或一个装置，让人真的能用、能测、能改。'], from: ['From LOOK, a two-sided marketplace', '出自 LOOK 双边平台'], img: 'assets/v3/screens/look/discover.webp', phone: true, href: 'project-beauty-marketplace.html' },
  { t: ['Give it a world', '给它一个世界'], p: ['When an idea needs to be felt, not just understood, I build it in 3D and film.', '当一个想法需要被感受，而不只是被理解，我就用 3D 和影像把它做出来。'], from: ['From Floating Worlds, made in Blender', '出自 Blender 作品 Floating Worlds'], video: 'assets/v3/modeling-02-preview.mp4', img: 'assets/v3/modeling-02.jpg', href: 'practice.html#floating-worlds' }
];
const ORDER = ['salon-booking', 'beauty-marketplace', 'cyber-toolkit', 'biodiversity-clock', 'ear-shield', 'blender-reel'];
const work = [...ORDER.map(id => projects.find(p => p.id === id)), ...projects.filter(p => !ORDER.includes(p.id))].filter(Boolean);
const wide = new Set(featured.length ? featured : ORDER);
let filter = 'all';

function render() {
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  $$('[data-t]').forEach(el => { el.textContent = L(T[el.dataset.t]); });
  $('.h5-lang').setAttribute('aria-label', lang === 'zh' ? '切换语言' : 'Language');
  $('.h5-filters').setAttribute('aria-label', lang === 'zh' ? '按方向筛选' : 'Filter by discipline');
  // 2 · the steps and their shots
  $('.h5-how').style.setProperty('--n', STEPS.length);
  $('.h5-shots').innerHTML = STEPS.map((s, i) => `<figure class="h5-shot${s.phone ? ' is-phone' : ''}${i === cur ? ' is-on' : ''}" data-i="${i}">${s.video ? `<video src="${s.video}" poster="${s.img}" muted loop playsinline preload="none"></video>` : `<img src="${s.img}" alt="" loading="lazy">`}</figure>`).join('');
  $('.h5-steps').innerHTML = STEPS.map((s, i) => `<li class="${i === cur ? 'is-on' : ''}"><b>${L(s.t)}</b><p>${L(s.p)}</p><small><a href="${s.href}">${L(s.from)}</a></small><img class="h5-step-img${s.phone ? ' is-phone' : ''}" src="${s.img}" alt="" loading="lazy"></li>`).join('');
  // 3 · filters and work
  const cats = [{ id: 'all', label: T.all }, ...categories.filter(c => c.id !== 'all')];
  $('.h5-filters').innerHTML = cats.map(c => { const n = c.id === 'all' ? work.length : work.filter(p => (p.categories || []).includes(c.id)).length; return `<button type="button" role="tab" data-f="${c.id}" aria-selected="${c.id === filter}">${L(c.label)}<sup>${n}</sup></button>`; }).join('');
  $('.h5-grid').innerHTML = work.map(p => `<a class="h5-card${wide.has(p.id) ? ' is-wide' : ''}" href="${p.href}" data-cats="${(p.categories || []).join(' ')}"><div class="h5-media"><img src="${p.cover}" alt="" loading="lazy">${p.preview ? `<video data-src="${p.preview}" muted loop playsinline preload="none"></video>` : ''}</div><div class="h5-cap"><b>${L(p.title)}</b><span>${L(p.kind)}</span></div><p>${L(p.subtitle)}</p></a>`).join('');
  applyFilter(); wireCards(); shots = $$('.h5-shot'); steps = $$('.h5-steps li');
  cutName();
}
function applyFilter() {
  $$('.h5-filters button').forEach(b => b.setAttribute('aria-selected', b.dataset.f === filter));
  $$('.h5-card').forEach(c => c.classList.toggle('is-hidden', filter !== 'all' && !c.dataset.cats.split(' ').includes(filter)));
}
document.addEventListener('click', e => { const b = e.target.closest('.h5-filters button'); if (!b) return; filter = b.dataset.f; applyFilter(); });
$('.h5-lang').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; try { localStorage.setItem('portfolio-language', lang); } catch {} render(); });
// moving work plays in its card while the pointer rests on it
function wireCards() {
  if (!fine) return;
  $$('.h5-card').forEach(c => { const v = $('video', c); if (!v) return;
    c.addEventListener('pointerenter', () => { if (!v.src) v.src = v.dataset.src; v.play().then(() => c.classList.add('is-playing')).catch(() => {}); });
    c.addEventListener('pointerleave', () => { v.pause(); c.classList.remove('is-playing'); }); });
}

// ---------- the opening: my name, dark, then the film fades up inside the letters ----------
const plateV = $('.h5-plate-v');
let opened = false; const open = () => { if (opened) return; opened = true; document.body.classList.remove('is-opening'); };
plateV.addEventListener('canplay', () => setTimeout(open, 500), { once: true }); setTimeout(open, 2600);
if (calm) open();

// ---------- the name, cut out of the dark ----------
// The letters are holes in a dark sheet over the film. To fly through one, the sheet scales up around a point
// that sits deep inside a letter's stroke, so that stroke grows until it is the whole screen.
const FONT = '800 {s}px Inter, "PingFang SC", "Noto Sans CJK SC", sans-serif';
let cut = { ox: 0, oy: 0, max: 60 };
function cutName() {
  const W = innerWidth, H = innerHeight, svg = $('.h5-cut'), g = $('.h5-m-t');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  $$('.h5-m-r, .h5-cut-r').forEach(r => { r.setAttribute('width', W); r.setAttribute('height', H); });
  const name = L(T.name), lines = lang === 'zh' ? [name] : W / H < 1.1 ? name.split(' ') : [name];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d', { willReadFrequently: true });
  c.font = FONT.replace('{s}', 100); const widest = Math.max(...lines.map(l => c.measureText(l).width));
  const lh = .86, size = Math.min((W - 2 * Math.min(72, W * .045)) / widest * 100, H * (lines.length > 1 ? .36 : .5));
  c.font = FONT.replace('{s}', size); c.textBaseline = 'alphabetic';
  const x = Math.min(72, W * .045), block = size * lh * lines.length, top = (H - block) / 2 - H * .03;
  g.innerHTML = lines.map((l, i) => `<text x="${x}" y="${top + size * lh * (i + 1) - size * .1}" font-size="${size}">${l}</text>`).join('');
  lines.forEach((l, i) => c.fillText(l, x, top + size * lh * (i + 1) - size * .1));
  // find the point inside a stroke that is deepest (furthest from any edge) and still near the middle
  const d = c.getImageData(0, 0, W, H).data, on = (px, py) => px >= 0 && py >= 0 && px < W && py < H && d[(py * W + px) * 4 + 3] > 128;
  let best = null;
  for (let py = 0; py < H; py += 4) for (let px = 0; px < W; px += 4) {
    if (!on(px, py)) continue;
    let r = 1; while (r < 200 && on(px + r, py) && on(px - r, py) && on(px, py + r) && on(px, py - r) && on(px + r * .7 | 0, py + r * .7 | 0) && on(px - r * .7 | 0, py - r * .7 | 0)) r++;
    const score = r * 3 - Math.hypot(px - W / 2, py - H / 2) * .06;
    if (!best || score > best.score) best = { px, py, r, score };
  }
  if (!best) return;
  const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([a, b]) => Math.hypot(a - best.px, b - best.py)));
  cut = { ox: best.px, oy: best.py, max: far / Math.max(2, best.r - 1) * 1.15 };
  const s = $('.h5-cut').style; s.setProperty('--ox', cut.ox + 'px'); s.setProperty('--oy', cut.oy + 'px');
  onScroll();
}
const smooth = t => t * t * (3 - 2 * t);

// ---------- scroll ----------
let cur = 0, shots = [], steps = [];
const who = $('.h5-who'), how = $('.h5-how'), head = $('.h5-head');
function onScroll() {
  const vh = innerHeight;
  // 1 · through the letter and into the film
  const wr = who.getBoundingClientRect(), wp = clamp(-wr.top / (wr.height - vh)), a = clamp(wp / .6), ws = who.style;
  if (!calm) {
    ws.setProperty('--s', Math.pow(cut.max, smooth(a) ** 1.4).toFixed(4));
    ws.setProperty('--co', (1 - clamp((a - .9) / .1)).toFixed(3));
    ws.setProperty('--vs', (1.28 - .28 * smooth(a)).toFixed(4));
    ws.setProperty('--io', (1 - clamp(a * 6)).toFixed(3));
    ws.setProperty('--lo', clamp((wp - .62) / .14).toFixed(3));
    ws.setProperty('--fo', clamp((wp - .9) / .1).toFixed(3));
  }
  head.classList.toggle('is-solid', wp >= 1);
  // 2 · which step is on, how far through it, and the shot follows
  if (getComputedStyle($('.h5-how-pin')).position === 'sticky') {
    const r = how.getBoundingClientRect(), span = r.height - vh, p = clamp(-r.top / span) * STEPS.length, i = Math.min(STEPS.length - 1, Math.floor(p)), f = p - i;
    if (i !== cur) { cur = i; shots.forEach((s, k) => { s.classList.toggle('is-on', k === i); const v = $('video', s); if (v) { if (k === i) v.play().catch(() => {}); else v.pause(); } }); steps.forEach((s, k) => s.classList.toggle('is-on', k === i)); }
    shots[i]?.style.setProperty('--sp', f.toFixed(3));
    steps.forEach((s, k) => s.style.setProperty('--f', k < i ? 1 : k === i ? f.toFixed(3) : 0));
  }
}
addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(cutName, 150); });

document.fonts.load('800 100px Inter').then(cutName, cutName); render(); onScroll();

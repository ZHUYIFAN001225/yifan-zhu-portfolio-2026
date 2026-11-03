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

// ---------- the opening: black, the bars part, the scene, then the name ----------
const plateV = $('.h5-plate-v');
let opened = false; const open = () => { if (opened) return; opened = true; document.body.classList.remove('is-opening'); };
plateV.addEventListener('canplay', () => setTimeout(open, 300), { once: true }); setTimeout(open, 2400);
if (calm) open();

// ---------- scroll ----------
let cur = 0, shots = [], steps = [];
const who = $('.h5-who'), how = $('.h5-how'), head = $('.h5-head');
function onScroll() {
  const vh = innerHeight;
  who.style.setProperty('--wp', clamp(scrollY / vh).toFixed(3));
  head.classList.toggle('is-solid', scrollY > vh * .7);
  // 2 · which step is on, how far through it, and the shot follows
  if (getComputedStyle($('.h5-how-pin')).position === 'sticky') {
    const r = how.getBoundingClientRect(), span = r.height - vh, p = clamp(-r.top / span) * STEPS.length, i = Math.min(STEPS.length - 1, Math.floor(p)), f = p - i;
    if (i !== cur) { cur = i; shots.forEach((s, k) => { s.classList.toggle('is-on', k === i); const v = $('video', s); if (v) { if (k === i) v.play().catch(() => {}); else v.pause(); } }); steps.forEach((s, k) => s.classList.toggle('is-on', k === i)); }
    shots[i]?.style.setProperty('--sp', f.toFixed(3));
    steps.forEach((s, k) => s.style.setProperty('--f', k < i ? 1 : k === i ? f.toFixed(3) : 0));
  }
}
addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
addEventListener('resize', onScroll);

render(); onScroll();

// Home (preview v4): Léo Parpeix's structure and motion, filled with my own things.
//  • A loader, then the opening card (my own desk, rendered in Blender, in afternoon light) grows to the whole screen
//    and stays pinned while the page slides up over it.
//  • Lines rise into place; the page scrolls with a little inertia on a computer.
//  • Big words whose first line keeps changing, with my own Blender object (the scissors from my salon desk) flying after
//    the pointer — click and it darts there and spins.
//  • Each selected project is a strip of its own pictures that slides sideways as you scroll and can be dragged, with a
//    yellow DRAG pill as the cursor; the rest as an archive whose rows open. Who I am, then straight into the work.
import { projects, categories } from './portfolio-catalog.mjs';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches, calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const getLang = () => { const q = new URLSearchParams(location.search).get('lang'); if (q === 'zh' || q === 'en') return q; try { return localStorage.getItem('portfolio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } };
let lang = getLang();
const L = v => Array.isArray(v) ? v[lang === 'zh' ? 1 : 0] : v ? (v[lang] || v.en) : '';

const T = {
  name: ['Yifan Zhu', '朱异凡'], role: ['Research-led multidisciplinary designer', '研究驱动的跨领域设计师'],
  nav_work: ['Work', '作品'], nav_about: ['About', '关于'], nav_contact: ['Contact', '联系'], all_work: ['All work', '全部作品'],
  statement: ['Research first.\nThen built in whatever\nmedium it needs.', '先把问题研究透，\n再用它需要的媒介\n把它做出来。'],
  scroll: ['Scroll down', '往下滑'],
  raised: ['Raised in', '成长于'], designing: ['Designing in', '现在在'], todo: ['[to fill in]', '[待补充]'],
  now1: ['Currently running the bookings of', '目前在做'], now_at: ['@a Glasgow salon', '@格拉斯哥一家理发店'], now2: ['live since October 2026', '每天在用的预约系统，2026 年 10 月上线'],
  former: ['Studied:', '学历：'],
  type2: ['UX & service', 'UX 与服务'], type3: ['designer', '设计师'],
  toy_hint: ['(Click to make a cut)', '（点一下，剪一刀）'],
  hello: ['Hello,\nI care about who a design is for,\na clear structure, and things\nthat actually work.', '你好，\n我在意设计是为谁做的、\n结构是不是清楚，\n以及它是不是真的能用。'],
  hi1: ['Hi there, it looks like you have found my portfolio.', '你好，看起来你找到了我的作品集。'],
  hi2: ['Whether you are hiring, curious or just looking around, these are the things I research, make and ship.', '不管你是在招人、好奇，还是随便逛逛，下面是我研究过、做出来、交出去的东西。'],
  reel_w1: ['Show', '作品'], reel_w2: ['reel', '集锦'], watch_reel: ['Watch reel', '观看集锦'],
  selected: ['Selected projects', '精选作品'], archives: ['Archives', '更多作品'],
  inter1: ['Research', '和人一起'], inter2: ['with people,', '研究，'], inter3: ['build for them.', '为人而做。'],
  end1: ['Let’s make', '一起做点'], end2: ['something people', '大家能亲手'], end3: ['can try', '试的东西'],
  drag: ['Drag', '拖动'], open: ['Project link', '查看案例'], watch: ['Watch the film', '观看短片']
};
const CYCLE = [['Research-led', '研究驱动的'], ['Multidisciplinary', '跨领域的'], ['Hands-on', '动手型'], ['Curious', '好奇的']];

// the selected work: each strip is that project's own pictures (phone screens shown as phones)
const P = id => projects.find(p => p.id === id);
const SEL = [
  { id: 'salon-booking', pics: ['assets/v3/products/booking-customer.jpg', '@assets/v3/screens/booking/book.webp', 'assets/v3/products/booking-admin.jpg', '@assets/v3/screens/booking/today.webp', 'assets/v3/screens/booking/zoom-durations.webp', 'assets/v3/screens/booking/zoom-time-off.webp'] },
  { id: 'beauty-marketplace', pics: ['assets/v3/look-film/w1.webp', '@assets/v3/screens/look/discover.webp', '@assets/v3/screens/look/detail.webp', '@assets/v3/screens/look/matches.webp', '@assets/v3/screens/look/booked.webp', '@assets/v3/screens/look/c-portfolio.webp'] },
  { id: 'cyber-toolkit', pics: ['>assets/v3/toolkit-preview.mp4', 'assets/cyber-projection-toolkit/toolkit-interface-cyan.png', 'assets/cyber-projection-toolkit/projection-source-frame.png', 'assets/cyber-projection-toolkit/toolkit-interface-amber.png', 'assets/cyber-projection-toolkit/video-frames/05-art-direction-controls.png'] },
  { id: 'biodiversity-clock', pics: ['assets/biodiversity-clock/final-clock.jpg', 'assets/biodiversity-clock/pollok-country-park.jpg', 'assets/biodiversity-clock/storyboard.jpg', 'assets/biodiversity-clock/burrell-collection-exterior.jpg', 'assets/biodiversity-clock/interactive-receipt.jpg'] },
  { id: 'ear-shield', pics: ['01', '02', '03', '04', '05', '06'].map(n => `assets/portfolio-pages/page-${n}.jpg`) },
  { id: 'blender-reel', film: true, pics: ['>assets/v3/blender-reel-preview.mp4', 'assets/v3/blender-reel.jpg', '>assets/v3/modeling-03-preview.mp4', 'assets/v3/modeling-03.jpg', 'assets/v3/modeling-01.jpg'] }
];
const archive = projects.filter(p => !SEL.some(s => s.id === p.id));
const REEL = ['assets/v3/blender-reel-preview.mp4', 'assets/v3/toolkit-preview.mp4', 'assets/v3/ai-video-restyle-preview.mp4', 'assets/v3/modeling-02-preview.mp4', 'assets/v3/web-prototype-preview.mp4', 'assets/v3/modeling-01-preview.mp4'];

// ---------- words ----------
const lines = (el, text) => { el.innerHTML = text.split('\n').map((l, i) => `<span class="hv-l" style="--i:${i}"><span>${l}</span></span>`).join(''); };
function render() {
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  $$('[data-t]').forEach(el => { const v = L(T[el.dataset.t]); if (el.hasAttribute('data-lines')) lines(el, v); else el.textContent = v; });
  // big words: each line rises on its own
  $$('[data-big]').forEach(h => [...h.children].forEach((s, i) => { if (s.classList.contains('hv-cycle')) return; const t = s.textContent; s.className = 'hv-l'; s.style.setProperty('--i', i); s.innerHTML = `<span>${t}</span>`; }));
  $('.hv-cycle>span').textContent = L(CYCLE[ci]);
  $('.hv-lang').setAttribute('aria-label', lang === 'zh' ? '切换语言' : 'Language');
  const row = (s, i) => {
    const p = P(s.id);
    const pics = s.pics.map(src => src.startsWith('>') ? `<div><video src="${src.slice(1)}" muted loop playsinline preload="none" data-play></video></div>` : src.startsWith('@') ? `<div class="is-phone"><img src="${src.slice(1)}" alt="" loading="lazy" draggable="false"></div>` : `<div><img src="${src}" alt="" loading="lazy" draggable="false"></div>`).join('');
    return `<article class="hv-proj"><div class="hv-strip" data-strip><div class="hv-track">${pics}${pics}</div></div><div class="hv-meta" data-reveal><span class="n">${i + 1}</span><span class="t">${L(p.title)}<i>${L(categories.find(c => c.id === (p.categories || [])[0])?.label)}</i></span><span class="lk"><a href="${p.href}">${L(s.film ? T.watch : T.open)}</a></span><span class="info"><span>${L(p.kind)}</span><span>${L(p.status)}</span></span></div></article>`;
  };
  $('[data-set="0"]').innerHTML = SEL.slice(0, 3).map(row).join('');
  $('[data-set="1"]').innerHTML = SEL.slice(3).map((s, i) => row(s, i + 3)).join('');
  $('.hv-archive').innerHTML = archive.map((p, i) => `<li><button type="button" aria-expanded="false"><span>${SEL.length + i + 1}</span><span>${L(p.title)}<i>${L(p.kind)}</i></span></button><div class="hv-arch-body"><div><div class="hv-arch-in"><span></span><img src="${p.cover}" alt="" loading="lazy"><div><p>${L(p.subtitle)}</p><a href="${p.href}">${L(T.open)} ↗</a></div></div></div></div></li>`).join('');
  $$('.hv-archive button').forEach(b => b.addEventListener('click', () => { const li = b.parentElement, o = li.classList.toggle('is-open'); b.setAttribute('aria-expanded', o); }));
  strips = $$('[data-strip]').map(el => ({ el, track: $('.hv-track', el), off: 0, vel: 0, x: 0 }));
  watch();
}
$('.hv-lang').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; try { localStorage.setItem('portfolio-language', lang); } catch {} render(); });

// the first line of the big words keeps changing
let ci = 0;
setInterval(() => {
  if (document.hidden || calm) return; const box = $('.hv-cycle'), old = box.firstElementChild; ci = (ci + 1) % CYCLE.length;
  const nw = document.createElement('span'); nw.className = 'is-pre'; nw.textContent = L(CYCLE[ci]); box.append(nw);
  old.style.position = 'absolute'; old.style.left = old.style.right = '0'; old.classList.add('is-out');
  requestAnimationFrame(() => requestAnimationFrame(() => nw.classList.remove('is-pre')));
  setTimeout(() => old.remove(), 900);
}, 2400);

// ---------- reveals ----------
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .2 });
function watch() {
  $$('[data-reveal],[data-lines],[data-big]').forEach(el => io.observe(el));
  $$('video[data-play]').forEach(v => vio.observe(v));
}

// ---------- loader → the opening card opens to the whole screen ----------
const heroV = $('.hv-hero-v');
const open = () => { document.body.classList.remove('is-loading'); setTimeout(() => $('.hv-hero-t').classList.add('is-in'), 900); };
let opened = false; const go = () => { if (opened) return; opened = true; setTimeout(open, 500); };
heroV.complete ? go() : heroV.addEventListener('load', go, { once: true }); setTimeout(go, 2200);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; scrollTo(0, 0);

// ---------- scrolling with a little inertia (computers), and everything tied to it ----------
let sy = scrollY, ty = scrollY, mine = false;
if (fine && !calm) {
  addEventListener('wheel', e => { if (e.ctrlKey || document.body.classList.contains('is-loading')) return; e.preventDefault(); ty = clamp(ty + e.deltaY * (e.deltaMode === 1 ? 40 : 1), 0, document.documentElement.scrollHeight - innerHeight); }, { passive: false });
  addEventListener('scroll', () => { if (!mine) { ty = sy = scrollY; } mine = false; }, { passive: true });
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); ty = t.getBoundingClientRect().top + scrollY; });
}
let strips = [];
const head = $('.hv-head'), hero = $('.hv-hero'), end = $('.hv-end'), sunEl = $('.hv-sun');
let last = performance.now(), mx = 0, my = 0, pmx = 0, pmy = 0;
if (fine) addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (fine && !calm && Math.abs(ty - sy) > .3) { sy += (ty - sy) * (1 - Math.exp(-dt * 9)); mine = true; scrollTo(0, sy); } else sy = scrollY;
  const vh = innerHeight;
  // the opening: darker and pushed down as the page covers it
  const hp = clamp(sy / vh); hero.style.setProperty('--hp', hp.toFixed(3)); pmx += (mx - pmx) * (1 - Math.exp(-dt * 3)); pmy += (my - pmy) * (1 - Math.exp(-dt * 3)); hero.style.setProperty('--mx', pmx.toFixed(3)); hero.style.setProperty('--my', pmy.toFixed(3));
  // header turns white over dark parts
  const er = end.getBoundingClientRect(); head.classList.toggle('on-dark', hp < .55 || (er.top < 40 && er.bottom > 40));
  // the patch of sun drifts slowly, and a little with the scroll
  sunEl.style.setProperty('--sx', (innerWidth * (.2 + .25 * Math.sin(now / 9000))).toFixed(0) + 'px'); sunEl.style.setProperty('--sy2', (innerHeight * (.15 + .3 * Math.cos(now / 11000)) - (sy * .05) % (innerHeight * .4)).toFixed(0) + 'px');
  // strips: slide with the scroll, plus whatever was dragged, plus a little drift after a throw
  strips.forEach(s => {
    const r = s.el.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
    const half = s.track.scrollWidth / 2;
    if (!s.down) { s.off += s.vel * dt; s.vel *= Math.exp(-dt * 3.5); }
    const p = (vh - r.top) / (vh + r.height);   // 0 entering, 1 leaving
    let x = -(p * vh * .45) + s.off - (innerWidth * .07);
    x = ((x % half) - half) % half;   // loops round: the strip holds its pictures twice
    s.track.style.setProperty('--tx', x.toFixed(1) + 'px');
  });
}
requestAnimationFrame(tick);

// dragging a strip, with the yellow DRAG pill as the cursor
const pill = $('.hv-drag');
addEventListener('pointermove', e => { pill.style.left = e.clientX + 'px'; pill.style.top = e.clientY + 'px'; }, { passive: true });
document.addEventListener('pointerover', e => { pill.classList.toggle('is-on', fine && !!e.target.closest('[data-strip]')); });
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-strip]'); if (!el) return; const s = strips.find(q => q.el === el); if (!s) return;
  s.down = true; s.vel = 0; let lx = e.clientX, lt = performance.now(); el.setPointerCapture(e.pointerId);
  const mv = ev => { const t = performance.now(), dx = ev.clientX - lx; s.off += dx; s.vel = dx / Math.max(1, t - lt) * 1000; lx = ev.clientX; lt = t; };
  const up = () => { s.down = false; el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
});

// ---------- my own object: the scissors from my Blender desk, flying after the pointer ----------
import('./home-v4-toy.mjs').then(m => $$('[data-toy]').forEach(sec => m.mountToy(sec, { fine, calm }))).catch(e => console.warn('toy', e));

render();

// Case-page shell: gives every case study the same opening and atmosphere as LOOK and Glasgow Salon Booking.
// A full-screen cover made from the project's own scene, the title set large over it, one accent colour per
// project, and a quiet blurred wash of the scene behind the reading column.
import { SCENE, ACCENT } from './scenes.mjs';

const zh = () => document.documentElement.lang.startsWith('zh');
const L = v => (v ? (zh() ? v.zh : v.en) || v.en || '' : '');

export function mount(project) {
  const scene = SCENE[project.id] || { img: project.cover };
  const accent = ACCENT[project.id] || '#9fb7ff';
  const still = scene.poster || scene.img || project.cover;
  document.body.classList.add('cs');
  document.documentElement.style.setProperty('--cs-accent', accent);
  document.documentElement.style.setProperty('--cs-still', `url("${still}")`);
  if (!document.querySelector('link[href="case-shell.css"]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'case-shell.css'; document.head.append(l);
  }
  const atmo = document.createElement('div'); atmo.className = 'cs-atmo'; atmo.setAttribute('aria-hidden', 'true');
  document.body.prepend(atmo);

  const cover = document.createElement('section'); cover.className = 'cs-cover';
  const media = scene.video
    ? `<video class="cs-media" muted loop playsinline autoplay preload="metadata" poster="${scene.poster}" src="${scene.video}"></video>`
    : `<img class="cs-media" src="${scene.img || project.cover}" alt="" decoding="async">`;
  cover.innerHTML = `${media}<div class="cs-shade" aria-hidden="true"></div>${scene.grain ? '<div class="cs-grain" aria-hidden="true"></div>' : ''}
    <div class="cs-cover-in">
      <p class="cs-kicker"><span class="cs-dot" aria-hidden="true"></span><span data-cs="kind"></span><span class="cs-tool" data-cs="tools"></span></p>
      <h1 class="cs-title" data-cs="title"></h1>
      <p class="cs-sub" data-cs="sub"></p>
      <p class="cs-status" data-cs="status"></p>
    </div>
    <a class="cs-down" href="#main"><span data-cs="down"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5"/></svg></a>`;
  const main = document.querySelector('main');
  // the cover comes straight after the site header; the case tools and category strip sit below it
  const hdr = document.querySelector('.site-header'); (hdr || main).after(cover); if (!hdr) main.before(cover);
  // the cover now carries the title; the page's own first heading steps aside
  const firstH1 = main.querySelector('h1'); if (firstH1) firstH1.classList.add('cs-hidden-title');

  const render = () => {
    const set = (k, v) => { const el = cover.querySelector(`[data-cs="${k}"]`); if (el) { el.textContent = v; el.hidden = !v; } };
    set('kind', L(project.group) || L(project.kind));
    set('tools', project.tools ? (zh() ? `制作工具：${project.tools.zh}` : `Made with ${project.tools.en}`) : '');
    set('title', L(project.title)); set('sub', L(project.subtitle)); set('status', L(project.status));
    set('down', zh() ? '向下阅读' : 'Read the case');
  };
  render(); document.addEventListener('portfolio:language', render);
  cover.querySelector('.cs-down').addEventListener('click', e => { e.preventDefault(); main.scrollIntoView({ behavior: 'smooth' }); });
  const v = cover.querySelector('video'); if (v) { v.play?.().catch(() => {}); new IntersectionObserver(([en]) => en.isIntersecting ? v.play().catch(() => {}) : v.pause()).observe(cover); }
  requestAnimationFrame(() => setTimeout(() => { glassAll(); chapterBar(main, accent); }, 300));
}

// Glass: every picture and panel sits in a frosted frame. Under the pointer the frame's edge lights up,
// a soft blue glow that follows the cursor around the border.
function glassAll() {
  if (matchMedia('(hover: none)').matches) return;
  const main = document.querySelector('main');
  const pics = [...main.querySelectorAll('img, video')].filter(el => !el.closest('.gl,.v3-card,.lb') && el.getBoundingClientRect().width > 200);
  pics.forEach(el => {
    const host = el.closest('figure, picture, a') || el;
    if (host.closest('.gl')) return;
    const box = document.createElement('div'); box.className = 'gl';
    host.replaceWith(box); box.append(host);
  });
  [...main.querySelectorAll('.am-tldr, .case-support, .v3-deep-dive, .am-scope > div')].forEach(p => p.classList.add('gl', 'gl--panel'));
  main.addEventListener('pointermove', e => {
    const g = e.target.closest?.('.gl'); if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
    g.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
  }, { passive: true });
}

// Chapter bar: one sticky strip of chapters for every case, the way Glasgow Salon Booking has one.
// A lit line runs under the chapters already read; a small glass knob sits under the current one and slides as you read.
function chapterBar(main, accent) {
  const zhNow = zh();
  // chapters: the page's own index when it has one, otherwise every section that carries a heading
  let items = [];
  const own = main.querySelector('.ux-case-index, .case-map nav');
  if (own) items = [...own.querySelectorAll('a[href^="#"]')].filter(a => !a.matches('.ux-index-top,.ux-index-try') && document.querySelector(a.getAttribute('href'))).map(a => ({ id: a.getAttribute('href').slice(1), label: a.textContent.replace(/^\d+\s*/, '').trim() }));
  if (items.length < 2) {
    items = [];
    main.querySelectorAll('section, article').forEach((sec, i) => {
      if (sec.closest('.gl') || sec.querySelector(':scope section h2') && !sec.querySelector(':scope > h2, :scope > * > h2')) return;
      const h = sec.querySelector(':scope > h2, :scope > * > h2, :scope > * > * > h2'); if (!h || sec.getBoundingClientRect().height < 120) return;
      if (!sec.id) sec.id = 'chapter-' + (i + 1);
      const k = sec.querySelector('.section-kicker, .eyebrow, .case-label, [class*="kicker"]');
      let label = (k && k.textContent.trim().length <= 30 ? k.textContent : h.textContent).replace(/\s+/g, ' ').trim().replace(/[.。:：]$/, '');
      if (label.length > 34) label = label.slice(0, 32).replace(/\s\S*$/, '') + '…';
      items.push({ id: sec.id, label });
    });
  }
  if (items[0] && items[0].label.endsWith('…')) items[0].label = zhNow ? '概览' : 'Overview';
  items = items.filter((it, i, a) => a.findIndex(x => x.id === it.id) === i);
  if (items.length < 2) return;
  if (own) (own.closest('.case-map') || own).classList.add('cs-hidden-nav');

  const bar = document.createElement('nav'); bar.className = 'cn'; bar.setAttribute('aria-label', zhNow ? '章节' : 'Chapters');
  bar.innerHTML = `<div class="cn-in"><div class="cn-track"><i class="cn-line"></i><i class="cn-knob"></i></div>${items.map(it => `<a href="#${it.id}">${it.label}</a>`).join('')}<a class="cn-top" href="#top" aria-label="${zhNow ? '回到顶部' : 'Back to top'}">↑</a></div>`;
  const cover = document.querySelector('.cs-cover'); (cover || main).after(bar);
  bar.style.setProperty('--cn-accent', accent);
  const links = [...bar.querySelectorAll('a:not(.cn-top)')], line = bar.querySelector('.cn-line'), knob = bar.querySelector('.cn-knob'), inner = bar.querySelector('.cn-in');
  const secs = items.map(it => document.getElementById(it.id));
  let cur = -1;
  function place(i, animate = true) {
    const a = links[i]; if (!a) return;
    const x = a.offsetLeft + a.offsetWidth / 2;
    knob.style.transform = `translateX(${x}px)`; line.style.width = x + 'px';
    if (!animate) { knob.style.transition = 'none'; line.style.transition = 'none'; requestAnimationFrame(() => { knob.style.transition = ''; line.style.transition = ''; }); }
    // keep the current chapter in view when the bar scrolls sideways
    const il = inner.scrollLeft, iw = inner.clientWidth; if (a.offsetLeft < il + 24 || a.offsetLeft + a.offsetWidth > il + iw - 24) inner.scrollTo({ left: a.offsetLeft - iw / 2 + a.offsetWidth / 2, behavior: 'smooth' });
  }
  function spy() {
    const y = innerHeight * 0.38; let i = 0;
    secs.forEach((s, k) => { if (s && s.getBoundingClientRect().top <= y) i = k; });
    if (i !== cur) { cur = i; links.forEach((a, k) => a.toggleAttribute('aria-current', k === i)); place(i); }
    bar.classList.toggle('is-stuck', bar.getBoundingClientRect().top <= 0.5);
  }
  links.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); const t = secs[i]; if (!t) return; const top = t.getBoundingClientRect().top + scrollY - bar.offsetHeight - 8; scrollTo({ top, behavior: 'smooth' }); history.replaceState(null, '', '#' + t.id); }));
  bar.querySelector('.cn-top').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
  addEventListener('scroll', spy, { passive: true }); addEventListener('resize', () => { place(cur, false); }, { passive: true });
  spy(); requestAnimationFrame(() => place(Math.max(0, cur), false));
}

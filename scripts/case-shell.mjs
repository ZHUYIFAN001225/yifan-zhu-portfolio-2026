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
  main.before(cover);
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
  requestAnimationFrame(() => setTimeout(glassAll, 300));
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

// Explore: the portfolio as one scene you scroll through.
// Two concentric arcs on the left: the inner one holds the disciplines, the outer one that discipline's projects.
// The wheel (or a swipe, or the arrow keys) slides the projects along the arc; the one resting by the glowing dot is
// the current project, and its own picture or film fills the screen. Click it again, or click the picture, to open it.
import { projects, categories, orderedProjects } from './portfolio-catalog.mjs';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const getLang = () => { const q = new URLSearchParams(location.search).get('lang'); if (q === 'zh' || q === 'en') return q; try { return localStorage.getItem('portfolio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } };
let lang = getLang();
const L = v => Array.isArray(v) ? v[lang === 'zh' ? 1 : 0] : v ? (v[lang] || v.en || '') : '';

const T = {
  name: ['Yifan Zhu', '朱异凡'], role: ['Research-led Multidisciplinary Designer', '研究驱动的跨领域设计师'],
  index: ['All work', '全部作品'], about: ['About', '关于我'], contact: ['Contact', '联系我'], open: ['View the case', '查看案例'],
  hint: ['Scroll to browse. Click the picture to open the case.', '滚动浏览，点击画面进入案例。'],
  domains: ['Disciplines', '设计领域'], works: ['Projects', '项目'], lang: ['Language', '切换语言'],
  intro: ['I turn research into products, tools and films people actually use.', '把调研做成人真正会用的产品、工具和影像。'],
  sound: ['Sound', '音效'], close: ['Close', '关闭']
};
const MAIL = 'zhuyifan001225@gmail.com';
const SOCIAL = [[['Bilibili', 'B 站'], 'https://b23.tv/DQqusXX'], [['RED', '小红书'], 'https://xhslink.com/m/AZhAMj7fpc7'], [['Douyin', '抖音'], 'https://www.douyin.com/user/MS4wLjABAAAA_lHmWTuM_a1k_09EF1ewxBH9vU3K2tYWuNJe-Mk7H_0']];
const linksHTML = () => `<a class="ex-icon" href="mailto:${MAIL}" aria-label="${L(['Email', '邮件'])}: ${MAIL}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></svg><span class="ex-tip">${MAIL}</span></a>` +
  SOCIAL.map(([n, u]) => `<a class="ex-icon" href="${u}" target="_blank" rel="noopener">${L(n)}</a>`).join('');
const aboutHTML = () => `<figure class="ex-me"><img src="assets/v3/me.webp" alt="${L(['Yifan Zhu in the studio', '朱异凡在工作室'])}" width="880" height="1100" decoding="async"></figure><div class="ex-about-text">` + L([
  `<p><b>Research-led multidisciplinary designer</b>, turning messy problems, real users and new tools into products, services and films people actually use.</p>
   <p>Trained at <b>Glasgow (MDes)</b>, I have shipped <b>a booking system a salon runs on</b>, released <b>a Blender add-on</b>, tested <b>a service study</b> over two rounds, and made <b>AI × Video</b> pieces with ComfyUI and agent workflows.</p>
   <p>I work in <b>Figma, Blender, ComfyUI, Unity and TouchDesigner</b>, and pick whichever makes an idea testable fastest.</p>`,
  `<p><b>研究驱动的跨领域设计师</b>，把复杂的问题、真实的用户和新的工具，变成人真正会用的产品、服务和影像。</p>
   <p>我在<b>格拉斯哥读 MDes</b>，做过<b>一家理发店正在用的预约系统</b>，发布过<b>一个 Blender 插件</b>，做过<b>两轮测试的服务设计研究</b>，也用 ComfyUI 和 Agent 工作流做了 <b>AI × 视频</b>作品。</p>
   <p>常用 <b>Figma、Blender、ComfyUI、Unity、TouchDesigner</b>，哪个能最快把想法做成可测试的东西，就用哪个。</p>`]) +
  `<ul><li><a href="about.html"><span>${L(['Full profile, skills and CV', '完整介绍、技能与简历'])}</span><span aria-hidden="true">↗</span></a></li><li><a href="mailto:${MAIL}?subject=${encodeURIComponent('CV request')}"><span>${L(['Request my CV', '索取简历'])}</span><span>${MAIL}</span></a></li><li><a href="work.html"><span>${L(['All work as a list', '以列表查看全部作品'])}</span><span aria-hidden="true">↗</span></a></li><li><a href="https://boywithdoughnut.huotan.net/" target="_blank" rel="noopener"><span>${L(['Resource website', '资源网站'])}</span><span aria-hidden="true">↗</span></a></li></ul></div>`;

// Each project's own scene: a film loop where there is one, otherwise its strongest real photograph.
const S = 'assets/v3/scenes/';
// Sources big enough to fill a screen sharply run full-bleed. Smaller or upright ones sit crisp in a frame,
// over a blurred wash of themselves, so nothing is ever stretched past its own resolution.
const SCENE = {
  'salon-booking': { video: 'assets/v3/desk/salon-counter.mp4', poster: 'assets/v3/desk/salon-counter.jpg' },
  'beauty-marketplace': { img: 'assets/v3/look-film/wall.webp', soft: true, phone: 'assets/v3/screens/look/discover.webp' },
  'idea-to-edit': { video: S + 'idea-to-edit.mp4', poster: S + 'idea-to-edit.jpg' },
  'doodle-to-real': { video: 'assets/projects/doodle-to-real/a-05-landscape.mp4', poster: 'assets/projects/doodle-to-real/a-05-landscape.jpg' },
  'storyboard-skill': { img: 'assets/projects/storyboard-skill/sketch-brand-s04.webp', frame: true },
  'cyber-toolkit': { video: S + 'cyber-toolkit.mp4', poster: S + 'cyber-toolkit.jpg', scan: true },
  'blender-reel': { video: 'assets/v3/blender-reel-web.mp4', poster: 'assets/v3/blender-reel.jpg' },
  'ai-video-restyle': { video: S + 'ai-video-restyle.mp4', poster: 'assets/v3/ai-video-restyle.jpg' },
  'web-prototype': { video: S + 'web-prototype.mp4', poster: 'assets/v3/web-prototype.jpg' },
  'ai-motion': { video: S + 'ai-motion.mp4', poster: S + 'ai-motion.jpg', frame: true },
  'modeling-01': { video: S + 'modeling-01.mp4', poster: S + 'modeling-01.jpg' },
  'modeling-02': { video: S + 'modeling-02.mp4', poster: S + 'modeling-02.jpg', frame: true },
  'modeling-03': { video: S + 'modeling-03.mp4', poster: S + 'modeling-03.jpg' },
  'ear-shield': { img: S + 'ear-shield.webp', frame: true },
  'anxiety-market': { img: S + 'anxiety-market.webp', frame: true },
  'biodiversity-clock': { img: S + 'biodiversity-clock-hd.webp' },
  'seedwalkers': { img: S + 'seedwalkers.webp', frame: true },
  'machine-mapping': { img: S + 'machine-mapping.webp' },
  'scone': { img: S + 'scone-hd.webp' },
  'cross-culture': { img: S + 'cross-culture.webp', frame: true }
};
const sceneOf = p => SCENE[p.id] || { img: p.cover };

const DOMAINS = categories.filter(c => c.id !== 'all');
const listOf = id => orderedProjects(id);

// ---------- state ----------
const qs = new URLSearchParams(location.search);
let dIdx = Math.max(0, DOMAINS.findIndex(d => d.id === qs.get('d')));
let list = listOf(DOMAINS[dIdx].id);
let target = Math.max(0, list.findIndex(p => p.id === qs.get('p')));
let pos = target, dpos = dIdx, active = -1;

const domEl = $('[data-domains]'), projEl = $('[data-projects]'), bg = $('.ex-bg');
const arcD = $('.ex-arc--d'), arcP = $('.ex-arc--p'), tie = $('.ex-tie'), dotD = $('.ex-dot--d'), dotP = $('.ex-dot--p');
let G = {}; // geometry
let projLis = [], panelTab = null, isAbout = false;

// ---------- text ----------
function renderText() {
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  $$('[data-t]').forEach(el => { el.textContent = L(T[el.dataset.t]); });
  $('[data-hint]').textContent = L(T.hint);
  $('[data-lang-toggle]').setAttribute('aria-label', L(T.lang));
  $('[data-sound]').setAttribute('aria-label', L(T.sound));
  $('[data-links]').innerHTML = linksHTML(); $('[data-about-body]').innerHTML = aboutHTML();
  $('[data-about]').setAttribute('aria-label', L(isAbout ? ['Back to the work', '返回作品'] : T.about));
  $('[data-contact]').setAttribute('aria-label', L(T.contact));
  domEl.setAttribute('aria-label', L(T.domains)); projEl.setAttribute('aria-label', L(T.works));
  renderDomains(); renderProjects(); renderInfo(true);
}
function renderDomains() {
  domEl.innerHTML = DOMAINS.map((d, j) => `<button type="button" class="ex-dom${j === dIdx ? ' is-on' : ''}" data-j="${j}" aria-pressed="${j === dIdx}">${L(d.label)}<small>${String(listOf(d.id).length).padStart(2, '0')}</small></button>`).join('');
  chipIntoView();
}
function renderProjects() {
  projEl.innerHTML = list.map((p, i) => `<li class="ex-proj" data-i="${i}"><a href="${p.href}">${L(p.title)}</a></li>`).join('');
  projLis = $$('.ex-proj', projEl);
  $('[data-total]').textContent = String(list.length).padStart(2, '0');
  layout(); frame(true);
}
function renderInfo(force) {
  const p = list[active]; if (!p) return;
  $('[data-current]').textContent = String(active + 1).padStart(2, '0');
  const kind = $('[data-kind]'), line = $('[data-line]'), open = $('[data-open]');
  kind.textContent = L(p.kind); line.textContent = L(p.subtitle); open.href = p.href;
  open.setAttribute('aria-label', `${L(T.open)}: ${L(p.title)}`);
  if (!force) [kind, line, open].forEach(el => { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); });
}

// ---------- the scene behind ----------
const scenes = new Map();
function sceneEl(p) {
  if (scenes.has(p.id)) return scenes.get(p.id);
  const s = sceneOf(p), el = document.createElement('div');
  el.className = 'ex-scene' + (s.soft ? ' ex-scene--soft' : '') + (s.frame ? ' ex-scene--frame' : '') + (s.scan ? ' ex-scene--scan' : '');
  const still = lang === 'zh' && s.zh ? s.zh : s.img;
  const media = s.video ? `<video muted loop playsinline preload="none" poster="${s.poster}" data-src="${s.video}"></video>` : `<img src="${still}" alt="" decoding="async">`;
  el.innerHTML = s.frame ? `<img class="ex-wash" src="${s.poster || still}" alt="" decoding="async"><div class="ex-frame">${media}</div>` : media;
  if (s.phone) el.insertAdjacentHTML('beforeend', `<div class="ex-phone"><img src="${s.phone}" alt="" decoding="async"></div>`);
  bg.append(el); scenes.set(p.id, el); return el;
}
let swapT;
function showScene(i) {
  const p = list[i]; if (!p) return;
  const el = sceneEl(p);
  requestAnimationFrame(() => {
    scenes.forEach((s, id) => { if (s !== el) s.classList.remove('is-on'); });
    el.classList.add('is-on');
    const v = el.querySelector('video');
    if (v) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
  });
  clearTimeout(swapT);
  swapT = setTimeout(() => scenes.forEach(s => { if (!s.classList.contains('is-on')) s.querySelector('video')?.pause(); }), 1100);
  // warm the neighbours' first frames
  [list[i - 1], list[i + 1]].forEach(n => { if (!n) return; const s = sceneOf(n); const u = s.poster || s.img; if (u) { const im = new Image(); im.src = u; } });
}

// ---------- geometry ----------
function layout() {
  const vw = innerWidth, vh = innerHeight, m = vw <= 760;
  const cb = $('.ex-card').getBoundingClientRect().bottom;
  domEl.style.top = m ? (cb + 12) + 'px' : '';
  document.documentElement.style.setProperty('--cb', cb + 'px');
  const cy = m ? vh * 0.4 : clamp(cb + (vh - cb) * 0.44, vh * 0.5, vh * 0.62);
  const R = m ? Math.max(380, vh * 0.6) : Math.max(560, vh * 0.82);
  const Ad = m ? 0 : clamp(vw * 0.19, 230, 330);
  const Ax = m ? 30 : Ad + 70;
  const cx = Ax - R, Rd = R - (Ax - Ad);
  const info = $('.ex-info').getBoundingClientRect();
  G = { m, cy, R, Rd, cx, Ax, Ad, row: m ? 48 : 60, rowD: 46, big: m ? 26 : 38, small: m ? 16 : 20, floor: m ? info.top - 14 : vh - 40, ceil: m ? $('.ex-domains').getBoundingClientRect().bottom + 20 : cb + 26, info: $('.ex-info') };
  const svg = $('.ex-arcs'); svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  const arc = (r, a) => { const p = t => `${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`; return `M ${p(-a)} A ${r} ${r} 0 0 1 ${p(a)}`; };
  const span = Math.min(m ? 1.05 : 0.95, Math.asin(clamp((cy - G.ceil + 10) / R, 0, 1)), Math.asin(clamp((vh - cy - 30) / R, 0, 1)));
  arcP.setAttribute('d', arc(R, span)); arcD.setAttribute('d', m ? '' : arc(Rd, 0.5));
  tie.setAttribute('x1', Ad + 6); tie.setAttribute('x2', Ax - 9); tie.setAttribute('y1', cy); tie.setAttribute('y2', cy);
  dotP.style.transform = `translate(${Ax}px,${cy}px)`; dotD.style.transform = `translate(${Ad}px,${cy}px)`;
  $$('.ex-proj a', projEl).forEach(a => { a.style.fontSize = G.big + 'px'; });
}
function frame(force) {
  if (G.m) G.floor = G.info.offsetTop - 44;
  const { cx, cy, R, Rd, row, rowD, big, small, m } = G;
  const step = row / R, stepD = rowD / Rd;
  projLis.forEach((li, i) => {
    const d = i - pos, t = d * step, ad = Math.abs(d);
    if (Math.abs(t) > 1.1) { li.style.opacity = 0; li.style.visibility = 'hidden'; return; }
    li.style.visibility = '';
    const x = cx + R * Math.cos(t) + (m ? 16 : 22), y = cy + R * Math.sin(t);
    const k = Math.max(0, 1 - ad), s = (small + (big - small) * k) / big;
    li.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translateY(-50%)`;
    li.firstChild.style.transform = `scale(${s.toFixed(3)})`;
    const edge = Math.min(1, Math.max(0, (G.floor - y) / 40), Math.max(0, (y - G.ceil) / 40));
    li.style.opacity = ((ad < .5 ? 1 : clamp(0.82 - (ad - .5) * 0.2, 0, 0.82)) * edge).toFixed(3);
    li.style.pointerEvents = edge < .3 ? 'none' : '';
  });
  if (!m) $$('.ex-dom', domEl).forEach((b, j) => {
    const d = j - dpos, t = d * stepD, x = cx + Rd * Math.cos(t) - 18, y = cy + Rd * Math.sin(t);
    b.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-100%,-50%)`;
    b.style.opacity = clamp(1 - Math.abs(d) * 0.22, 0.25, 1).toFixed(3);
  });
  const now = clamp(Math.round(pos), 0, list.length - 1);
  if (now !== active || force) {
    active = now;
    $$('.ex-proj', projEl).forEach((li, i) => { li.classList.toggle('is-on', i === active); li.firstChild.toggleAttribute('aria-current', i === active); });
    if (!force) tickSound();
    renderInfo(force); saveState();
    clearTimeout(sceneT); if (force) showScene(active); else sceneT = setTimeout(() => showScene(active), 90);
  }
}
let saveT, sceneT;
function saveState() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { const u = new URL(location.href); u.searchParams.set('d', DOMAINS[dIdx].id); u.searchParams.set('p', list[active]?.id || ''); history.replaceState(null, '', u); }, 300);
}

// ---------- motion ----------
let last = performance.now();
function tick(now) {
  const dt = Math.min(64, now - last) / 16.7; last = now;
  const a = calm ? 1 : 1 - Math.pow(1 - 0.13, dt);
  const before = pos + dpos * 100;
  pos += (target - pos) * a; dpos += (dIdx - dpos) * a;
  if (Math.abs(target - pos) < 0.0005) pos = target;
  if (Math.abs(dIdx - dpos) < 0.001) dpos = dIdx;
  if (pos + dpos * 100 !== before) frame();
  requestAnimationFrame(tick);
}
const go = i => { target = clamp(i, 0, list.length - 1); hideHint(); };
function setDomain(j) {
  if (j === dIdx || j < 0 || j >= DOMAINS.length) return;
  const keep = list[active]?.id;
  dIdx = j; list = listOf(DOMAINS[j].id); domSound();
  const k = list.findIndex(p => p.id === keep);
  target = pos = k >= 0 ? k : 0; active = -1;
  $$('.ex-dom', domEl).forEach((b, n) => { b.classList.toggle('is-on', n === j); b.setAttribute('aria-pressed', n === j); });
  chipIntoView();
  renderProjects();
  if (G.m) domEl.children[j]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
}
const openActive = () => { const p = list[active]; if (!p) return; openSound(); setTimeout(() => { location.href = p.href; }, soundOn && ac ? 140 : 0); };

// wheel: the arc follows the wheel continuously, then settles on the nearest project.
// Over the inner arc (the disciplines) the wheel steps through disciplines instead.
let snapT, dAcc = 0, dLock = 0;
const inDomainZone = e => !G.m && (e.target.closest?.('.ex-domains') || (e.clientX < G.Ad + 30 && e.clientY > G.ceil));
addEventListener('mousemove', e => { document.body.classList.toggle('in-domains', !!inDomainZone(e)); }, { passive: true });
addEventListener('wheel', e => {
  if (panelTab) return;
  e.preventDefault();
  const px = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? innerHeight : 1;
  const dy = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * px;
  if (inDomainZone(e)) {
    const now = performance.now(); if (now < dLock) return;
    dAcc += dy; if (Math.abs(dAcc) >= 50) { setDomain(dIdx + Math.sign(dAcc)); dAcc = 0; dLock = now + 420; }
    return;
  }
  target = clamp(target + dy / 105, -0.35, list.length - 0.65); hideHint();
  clearTimeout(snapT); snapT = setTimeout(() => go(Math.round(target)), 110);
}, { passive: false });
// touch: the arc follows the finger, then settles on the nearest project
let ty = null, tStart = 0, tMoved = false;
addEventListener('touchstart', e => { if (panelTab || e.target.closest?.('.ex-domains,.ex-about')) return; ty = e.touches[0].clientY; tStart = target; tMoved = false; }, { passive: true });
addEventListener('touchmove', e => { if (ty === null) return; const dy = e.touches[0].clientY - ty; if (Math.abs(dy) > 6) tMoved = true; target = clamp(tStart - dy / G.row, -0.4, list.length - 0.6); }, { passive: true });
addEventListener('touchend', () => { if (ty === null) return; ty = null; go(Math.round(target)); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && (panelTab || dock.classList.contains('is-open'))) return closePanel();
  if (panelTab || e.target.closest?.('input,textarea')) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(target + 1); }
  else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(target - 1); }
  else if (e.key === 'ArrowRight') setDomain(dIdx + 1);
  else if (e.key === 'ArrowLeft') setDomain(dIdx - 1);
  else if (e.key === 'Enter' && document.activeElement === document.body) openActive();
});
// clicks: a name that isn't current slides to the dot; the current one (or the picture) opens the case
projEl.addEventListener('click', e => {
  const li = e.target.closest('.ex-proj'); if (!li) return;
  const i = +li.dataset.i; if (i !== active || tMoved) { e.preventDefault(); go(i); }
});
domEl.addEventListener('click', e => { const b = e.target.closest('.ex-dom'); if (b) setDomain(+b.dataset.j); });
bg.addEventListener('click', () => { if (!tMoved) openActive(); });

// ---------- About (a page of type) and Contact (the dock opens in place) ----------
const dock = $('[data-dock]'), aboutBtn = $('[data-about]'), contactBtn = $('[data-contact]'), aboutView = $('[data-about-view]');
function setContact(on) {
  dock.classList.toggle('is-open', on); document.body.classList.toggle('is-contact', on);
  contactBtn.classList.toggle('is-active', on); contactBtn.setAttribute('aria-expanded', on);
}
function setAbout(on, push = true) {
  if (on === isAbout) return; isAbout = on; panelTab = on ? 'about' : null;
  setContact(false);
  document.body.classList.toggle('is-about', on); dock.classList.toggle('is-about', on);
  aboutBtn.classList.toggle('is-active', on); aboutView.setAttribute('aria-hidden', !on);
  aboutBtn.setAttribute('aria-label', L(on ? ['Back to the work', '返回作品'] : T.about));
  if (on) $('[data-about-scroll]').scrollTop = 0;
  if (push) { const u = new URL(location.href); on ? u.searchParams.set('view', 'about') : u.searchParams.delete('view'); history.pushState({ about: on }, '', u); }
  panelSound();
}
aboutBtn.addEventListener('click', () => setAbout(!isAbout));
contactBtn.addEventListener('click', () => { setContact(!dock.classList.contains('is-open')); panelSound(); });
addEventListener('popstate', () => setAbout(new URLSearchParams(location.search).get('view') === 'about', false));
addEventListener('click', e => { if (dock.classList.contains('is-open') && !e.target.closest?.('.ex-dock')) { e.stopPropagation(); e.preventDefault(); setContact(false); } }, true);
const closePanel = () => { if (isAbout) setAbout(false); else setContact(false); };

// ---------- sound: tiny synthesised ticks, no files to load ----------
let ac = null, soundOn = (() => { try { return localStorage.getItem('explore-sound') !== 'off'; } catch { return true; } })();
const soundBtn = $('[data-sound]');
soundBtn.setAttribute('aria-pressed', soundOn);
function wake() { if (!soundOn) return; try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch {} }
['pointerdown', 'keydown', 'touchend'].forEach(t => addEventListener(t, wake, { passive: true }));
function tone(f, dur, vol, type = 'sine', to = 0.62, delay = 0) {
  if (!soundOn || !ac || ac.state !== 'running') return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * to, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.03);
}
let lastTick = 0;
function tickSound() { const n = performance.now(); if (n - lastTick < 40) return; lastTick = n; tone(2100, 0.03, 0.03, 'triangle'); tone(320, 0.05, 0.035); }
function domSound() { tone(520, 0.09, 0.04); tone(780, 0.12, 0.03, 'sine', 0.9, 0.06); }
function openSound() { tone(440, 0.22, 0.04, 'sine', 2); }
function panelSound() { tone(660, 0.1, 0.03, 'sine', 0.8); }
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn; soundBtn.setAttribute('aria-pressed', soundOn);
  try { localStorage.setItem('explore-sound', soundOn ? 'on' : 'off'); } catch {}
  if (soundOn) { wake(); setTimeout(() => tone(1200, 0.06, 0.03), 30); }
});
$('[data-lang-toggle]').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh'; try { localStorage.setItem('portfolio-language', lang); } catch {}
  scenes.forEach(s => s.remove()); scenes.clear(); active = -1; renderText();
});
let hintGone = false; const hideHint = () => { if (hintGone) return; hintGone = true; setTimeout(() => $('[data-hint]').classList.add('is-gone'), 1200); };
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layout(); frame(true); }, 120); });

renderText();
if (qs.get('view') === 'about') setAbout(true, false);
requestAnimationFrame(tick);

function chipIntoView() {
  const b = domEl.querySelector('.ex-dom.is-on');
  if (b && matchMedia('(max-width:760px)').matches) domEl.scrollTo({ left: b.offsetLeft - 16, behavior: 'smooth' });
}

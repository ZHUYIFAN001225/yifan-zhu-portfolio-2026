// Explore: the portfolio as one scene you scroll through.
// Two concentric arcs on the left: the inner one holds the disciplines, the outer one that discipline's projects.
// The wheel (or a swipe, or the arrow keys) slides the projects along the arc; the one resting by the glowing dot is
// the current project, and its own picture or film fills the screen. Click it again, or click the picture, to open it.
import { projects, categories, orderedProjects } from './portfolio-catalog.mjs';
import { startMusic } from './explore-music.mjs';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const getLang = () => { const q = new URLSearchParams(location.search).get('lang'); if (q === 'zh' || q === 'en') return q; try { return localStorage.getItem('portfolio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } };
let lang = getLang();
const L = v => Array.isArray(v) ? v[lang === 'zh' ? 1 : 0] : v ? (v[lang] || v.en || '') : '';

const T = {
  name: ['Yifan Zhu', '朱异凡'], role: ['AI Product Designer · From research to launch', 'AI 产品设计 · 从调研到上线'],
  index: ['All work', '全部作品'], about: ['About', '关于我'], contact: ['Contact', '联系我'], open: ['View the case', '查看案例'],
  hint: ['Scroll to browse. Click the picture to open the case.', '滚动浏览，点击画面进入案例。'],
  domains: ['Disciplines', '设计领域'], works: ['Projects', '项目'], lang: ['Language', '切换语言'],
  intro: ['I turn research into products, tools and films people actually use.', '把调研做成人真正会用的产品、工具和影像。'],
  sound: ['Sound', '音效'], close: ['Close', '关闭'], tools: ['Made with', '制作工具：']
};
const MAIL = 'zhuyifan001225@gmail.com';
const SOCIAL = [[['Bilibili', 'B 站'], 'https://b23.tv/DQqusXX'], [['RED', '小红书'], 'https://xhslink.com/m/AZhAMj7fpc7'], [['Douyin', '抖音'], 'https://www.douyin.com/user/MS4wLjABAAAA_lHmWTuM_a1k_09EF1ewxBH9vU3K2tYWuNJe-Mk7H_0']];
const linksHTML = () => `<a class="ex-icon" href="mailto:${MAIL}" aria-label="${L(['Email', '邮件'])}: ${MAIL}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></svg><span class="ex-tip">${MAIL}</span></a>` +
  SOCIAL.map(([n, u]) => `<a class="ex-icon" href="${u}" target="_blank" rel="noopener">${L(n)}</a>`).join('');
const CV = 'assets/cv/Yifan_Zhu_AI_Product_Designer_CV.pdf';
const aboutHTML = () => `<figure class="ex-me"><img src="assets/v3/me.webp" alt="${L(['Yifan Zhu in the studio', '朱异凡在工作室'])}" width="880" height="1100" decoding="async"></figure><div class="ex-about-text">` + L([
  `<p><b>I design AI products, build them myself with AI, and put them in front of real people.</b></p>
   <ul class="ex-wins">
     <li>Took a booking system from research to launch with AI coding. <b>A local barbershop in Glasgow, UK runs on it</b>; the shop handles 90–120 appointments a week.</li>
     <li>Designed <b>Idea to Edit</b>, an AI feature concept for CapCut, and built a <b>storyboard skill</b> that AI agents can call.</li>
     <li>Developed and released <b>a Blender add-on</b>; my resource catalogue reaches <b>600+ users and 2,000+ downloads</b>.</li>
   </ul>
   <dl class="ex-facts">
     <dt>Based</dt><dd>UK · Open to relocation</dd>
     <dt>Study</dt><dd>MDes Design Innovation and Transformation, The Glasgow School of Art</dd>
     <dt>Focus</dt><dd>AI product design · AI experience design · Design engineering</dd>
     <dt>Tools</dt><dd>AI coding (Codex, Claude Code) · Figma · ComfyUI · Blender</dd>
   </dl>`,
  `<p><b>我设计 AI 产品，并用 AI 把它亲手做出来，交给真实的人去用。</b></p>
   <ul class="ex-wins">
     <li>用 AI 编程把一套预约系统从调研做到上线，<b>英国格拉斯哥一家本地理发店正在使用</b>，这家店每周约有 90–120 个预约。</li>
     <li>为剪映策划 AI 新功能<b>「灵感成片」</b>，并做了一个能让 AI Agent 调用的<b>分镜 Skill</b>。</li>
     <li>开发并发布了<b>一个 Blender 插件</b>；我的数字资源覆盖 <b>600+ 位用户、2,000+ 次下载</b>。</li>
   </ul>
   <dl class="ex-facts">
     <dt>现居</dt><dd>英国 · 可前往其他国家工作</dd>
     <dt>学历</dt><dd>格拉斯哥艺术学院 MDes 设计创新与转型</dd>
     <dt>方向</dt><dd>AI 产品设计 · AI 体验设计 · 设计工程</dd>
     <dt>工具</dt><dd>AI 编程（Codex、Claude Code）· Figma · ComfyUI · Blender</dd>
   </dl>`]) +
  `<ul><li><a href="${CV}" target="_blank" rel="noopener"><span>${L(['Download CV (PDF)', '下载简历（PDF）'])}</span><span aria-hidden="true">↓</span></a></li><li><a href="mailto:${MAIL}"><span>${L(['Email', '邮箱'])}</span><span>${MAIL}</span></a></li><li><a href="about.html"><span>${L(['Full profile and skills', '完整介绍与技能'])}</span><span aria-hidden="true">↗</span></a></li><li><a href="https://boywithdoughnut.huotan.net/" target="_blank" rel="noopener"><span>${L(['Resource website', '资源网站'])}</span><span aria-hidden="true">↗</span></a></li></ul></div>`;

// Each project's own scene: a film loop where there is one, otherwise its strongest real photograph.
import { SCENE } from './scenes.mjs';
const caseURL = p => { const [path, hash] = p.href.split('#'); return `${path}${path.includes('?') ? '&' : '?'}from=${DOMAINS[dIdx].id}&lang=${lang}${hash ? '#' + hash : ''}`; };
const sceneOf = p => SCENE[p.id] || { img: p.cover };

const DOMAINS = categories.filter(c => c.id !== 'all');
const listOf = id => orderedProjects(id);

// ---------- state ----------
const qs = new URLSearchParams(location.search);
let dIdx = Math.max(0, DOMAINS.findIndex(d => d.id === qs.get('d')));
let list = listOf(DOMAINS[dIdx].id);
let target = Math.max(0, list.findIndex(p => p.id === qs.get('p')));
let pos = target, dpos = dIdx, dTarget = dIdx, active = -1;
const isM = () => innerWidth <= 760;

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
  // the info block's height decides where the arc must stop on phones, so lay out again once it has its text
  requestAnimationFrame(() => { layout(); frame(true); });
}
function renderDomains() {
  domEl.innerHTML = DOMAINS.map((d, j) => `<button type="button" class="ex-dom${j === dIdx ? ' is-on' : ''}" data-j="${j}" aria-pressed="${j === dIdx}">${L(d.label)}<small>${String(listOf(d.id).length).padStart(2, '0')}</small></button>`).join('');
  chipIntoView();
}
// On phones the arc becomes a feed: every project as a card with its own picture, read by normal scrolling.
const thumbOf = p => { const s = sceneOf(p); const src = s.wall ? p.cover : (s.poster || s.img || p.cover); const portrait = s.wall || (!s.poster && !s.img); return { src: lang === 'zh' && s.zh ? s.zh : src, portrait, video: s.video || '' }; };
function renderFeed() {
  projEl.innerHTML = list.map((p, i) => { const t = thumbOf(p); return `<li class="ex-proj ex-feed-item" data-i="${i}"><a href="${caseURL(p)}" class="ex-feed-link"><span class="ex-thumb${t.portrait ? ' is-portrait' : ''}">${t.portrait ? `<img class="ex-thumb-wash" src="${t.src}" alt="" aria-hidden="true" decoding="async" loading="lazy">` : ''}<img src="${t.src}" alt="" decoding="async" loading="${i < 2 ? 'eager' : 'lazy'}">${t.video ? `<video muted loop playsinline preload="none" poster="${t.src}" data-src="${t.video}"></video>` : ''}</span><span class="ex-feed-meta"><span class="ex-feed-kind">${L(p.kind)}${p.tools ? ` · ${L(p.tools)}` : ''}</span><span class="ex-feed-title">${L(p.title)}</span><span class="ex-feed-line">${L(p.subtitle)}</span><span class="ex-feed-open">${L(T.open)} <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6"/></svg></span></span></a></li>`; }).join('');
  projLis = []; $('[data-total]').textContent = String(list.length).padStart(2, '0');
  watchFeedVideos();
}
// Cards with a film loop play it while they are on screen (muted), and pause when they scroll away.
let feedIO;
function watchFeedVideos() {
  feedIO?.disconnect();
  if (calm) return;
  feedIO = new IntersectionObserver(entries => { for (const en of entries) { const v = en.target; if (en.isIntersecting) { if (!v.src) { v.src = v.dataset.src; v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true }); } v.play().catch(() => {}); } else v.pause(); } }, { rootMargin: '120px 0px', threshold: 0.2 });
  $$('.ex-thumb video', projEl).forEach(v => feedIO.observe(v));
}
function renderProjects() {
  if (isM()) { renderFeed(); layout(); return; }
  projEl.innerHTML = list.map((p, i) => `<li class="ex-proj" data-i="${i}"><a href="${caseURL(p)}">${L(p.title)}</a></li>`).join('');
  projLis = $$('.ex-proj', projEl);
  $('[data-total]').textContent = String(list.length).padStart(2, '0');
  layout(); frame(true);
}
function renderInfo(force) {
  const p = list[active]; if (!p) return;
  $('[data-current]').textContent = String(active + 1).padStart(2, '0');
  const kind = $('[data-kind]'), line = $('[data-line]'), open = $('[data-open]');
  kind.innerHTML = '';
  kind.append(L(p.kind));
  if (p.tools) { const t = document.createElement('span'); t.className = 'ex-tool'; t.textContent = `${L(T.tools)} ${L(p.tools)}`; kind.append(t); }
  line.textContent = L(p.subtitle); open.href = caseURL(p);
  open.setAttribute('aria-label', `${L(T.open)}: ${L(p.title)}`);
  if (!force) [kind, line, open].forEach(el => { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); });
  if (G.m) requestAnimationFrame(() => frame());
}

// ---------- the scene behind ----------
const scenes = new Map();
function sceneEl(p) {
  if (scenes.has(p.id)) return scenes.get(p.id);
  const s = sceneOf(p), el = document.createElement('div');
  el.className = 'ex-scene' + (s.soft ? ' ex-scene--soft' : '') + (s.frame ? ' ex-scene--frame' : '') + (s.scan ? ' ex-scene--scan' : '') + (s.video ? '' : ' ex-scene--still') + (s.grain ? ' ex-scene--grain' : '') + (s.pan ? ' ex-scene--pan' : '');
  const still = lang === 'zh' && s.zh ? s.zh : s.img;
  if (s.wall) {
    const dir = lang === 'zh' ? 'assets/v3/screens/look/zh/' : 'assets/v3/screens/look/';
    el.className += ' ex-scene--wall';
    el.innerHTML = `<div class="ex-wall">${s.wall.map((col, c) => `<div class="ex-wall-col" style="--d:${44 + c * 7}s;--o:${c % 2 ? -1 : 1}">${[...col, ...col].map(n => `<img src="${dir}${n}.webp" alt="" decoding="async" loading="lazy">`).join('')}</div>`).join('')}</div>`;
    bg.append(el); scenes.set(p.id, el); return el;
  }
  const media = s.video ? `<video muted loop playsinline preload="none" poster="${s.poster}" data-src="${s.video}"></video>` : `<img src="${still}" alt="" decoding="async">`;
  el.innerHTML = s.frame ? `<img class="ex-wash" src="${s.poster || still}" alt="" decoding="async"><div class="ex-frame">${media}</div>` : media;
  if (s.phone) el.insertAdjacentHTML('beforeend', `<div class="ex-phone">${[].concat(s.phone).map((u, i) => `<img src="${u}" alt="" decoding="async" style="animation-delay:${i * 3}s">`).join('')}</div>`);
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
  G = { m, cy, R, Rd, cx, Ax, Ad, row: m ? 48 : 60, rowD: 46, big: m ? 26 : 34, small: m ? 16 : 20, floor: m ? info.top - 14 : vh - 40, ceil: m ? $('.ex-domains').getBoundingClientRect().bottom + 20 : cb + 26, info: $('.ex-info') };
  const svg = $('.ex-arcs'); svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  const arc = (r, a) => { const p = t => `${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`; return `M ${p(-a)} A ${r} ${r} 0 0 1 ${p(a)}`; };
  const span = Math.min(m ? 1.05 : 0.95, Math.asin(clamp((cy - G.ceil + 10) / R, 0, 1)), Math.asin(clamp((vh - cy - 30) / R, 0, 1)));
  arcP.setAttribute('d', arc(R, span)); arcD.setAttribute('d', m ? '' : arc(Rd, 0.5));
  tie.setAttribute('x1', Ad + 6); tie.setAttribute('x2', Ax - 9); tie.setAttribute('y1', cy); tie.setAttribute('y2', cy);
  dotP.style.transform = `translate(${Ax}px,${cy}px)`; dotD.style.transform = `translate(${Ad}px,${cy}px)`;
  if (!m) $$('.ex-proj a', projEl).forEach(a => { a.style.fontSize = G.big + 'px'; });
  G.dw = $$('.ex-dom', domEl).map(b => b.offsetWidth);
}
function frame(force) {
  if (G.m) return; // phones: the feed is laid out by CSS and scrolls natively
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
    const edge = Math.min(1, Math.max(0, (G.floor - y) / 50), Math.max(0, (y - G.ceil) / 40));
    li.style.opacity = ((ad < .5 ? 1 : clamp(0.82 - (ad - .5) * 0.2, 0, 0.82)) * edge).toFixed(3);
    li.style.pointerEvents = edge < .3 ? 'none' : '';
  });
  if (!m) $$('.ex-dom', domEl).forEach((b, j) => {
    const d = j - dpos, t = d * stepD, y = cy + Rd * Math.sin(t), x = Math.max(cx + Rd * Math.cos(t) - 18, (G.dw?.[j] || 0) + 20); // never past the left edge
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
  pos += (target - pos) * a; dpos += (dTarget - dpos) * a;
  if (Math.abs(target - pos) < 0.0005) pos = target;
  if (Math.abs(dTarget - dpos) < 0.001) dpos = dTarget;
  if (pos + dpos * 100 !== before) frame();
  requestAnimationFrame(tick);
}
const go = i => { target = clamp(i, 0, list.length - 1); hideHint(); };
function setDomain(j, gliding = false) {
  if (j === dIdx || j < 0 || j >= DOMAINS.length) return;
  const keep = list[active]?.id;
  dIdx = j; if (!gliding) dTarget = j; list = listOf(DOMAINS[j].id); domSound();
  const k = list.findIndex(p => p.id === keep);
  target = pos = k >= 0 ? k : 0; active = -1;
  $$('.ex-dom', domEl).forEach((b, n) => { b.classList.toggle('is-on', n === j); b.setAttribute('aria-pressed', n === j); });
  chipIntoView();
  renderProjects();
  if (G.m) { domEl.children[j]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: calm ? 'auto' : 'smooth' }); scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }); }
}
const openActive = () => { const p = list[active]; if (!p) return; openSound(); setTimeout(() => { location.href = caseURL(p); }, ac ? 140 : 0); };

// wheel: the arc follows the wheel continuously, then settles on the nearest project.
// Over the inner arc the disciplines glide the same way: the arc turns with the wheel, the discipline under the dot
// becomes current as it passes, and it settles on the nearest one when the wheel stops.
let snapT, dSnapT;
const inDomainZone = e => !G.m && (e.target.closest?.('.ex-domains') || (e.clientX < G.Ad + 30 && e.clientY > G.ceil));
addEventListener('mousemove', e => { document.body.classList.toggle('in-domains', !!inDomainZone(e)); }, { passive: true });
addEventListener('wheel', e => {
  if (panelTab || G.m) return;
  e.preventDefault();
  const px = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? innerHeight : 1;
  const dy = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * px;
  if (inDomainZone(e)) {
    dTarget = clamp(dTarget + dy / 140, -0.3, DOMAINS.length - 0.7);
    const j = clamp(Math.round(dTarget), 0, DOMAINS.length - 1); if (j !== dIdx) setDomain(j, true);
    clearTimeout(dSnapT); dSnapT = setTimeout(() => { dTarget = dIdx; }, 200);
    return;
  }
  target = clamp(target + dy / 105, -0.35, list.length - 0.65); hideHint();
  clearTimeout(snapT); snapT = setTimeout(() => go(Math.round(target)), 110);
}, { passive: false });
// touch: the arc follows the finger, then settles on the nearest project
let ty = null, tStart = 0, tMoved = false;
addEventListener('touchstart', e => { if (panelTab || G.m || e.target.closest?.('.ex-domains,.ex-about')) return; ty = e.touches[0].clientY; tStart = target; tMoved = false; }, { passive: true });
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
  if (G.m) return; // feed cards are plain links
  const li = e.target.closest('.ex-proj'); if (!li) return;
  const i = +li.dataset.i; if (i !== active || tMoved) { e.preventDefault(); go(i); }
});
domEl.addEventListener('click', e => { const b = e.target.closest('.ex-dom'); if (b) setDomain(+b.dataset.j); });
bg.addEventListener('click', () => { if (!tMoved && !G.m) openActive(); });

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
  music?.duck(on);
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

// ---------- sound ----------
// Two separate things: the small interface ticks (always on; they are part of the controls) and the background
// music (the visitor's choice, driven by site-audio.js through the same button). musicOn only governs the music.
let ac = null, musicOn = (() => { try { return localStorage.getItem('portfolio-music') !== 'off'; } catch { return true; } })();
const soundBtn = $('[data-sound]');
soundBtn.setAttribute('aria-pressed', musicOn);
let music = null;
function wake() {
  try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch { return; }
  // the synthesised score only stands in when the real track is missing
  if (!music && musicOn && window.siteMusic?.failed) music = startMusic(ac, new URLSearchParams(location.search).get('music') || 'deep');
}
['pointerdown', 'keydown', 'touchend'].forEach(t => addEventListener(t, wake, { passive: true }));
addEventListener('portfolio:music-missing', () => { if (musicOn && ac && !music) music = startMusic(ac, 'deep'); });
addEventListener('portfolio:music', e => { musicOn = e.detail.on; if (!musicOn && music) { music.stop(); music = null; } else if (musicOn && ac && !music && window.siteMusic?.failed) music = startMusic(ac, 'deep'); });
document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else ac.resume(); });
function tone(f, dur, vol, type = 'sine', to = 0.62, delay = 0) {
  if (!ac || ac.state !== 'running') return;
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
$('[data-lang-toggle]').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh'; try { localStorage.setItem('portfolio-language', lang); } catch {}
  scenes.forEach(s => s.remove()); scenes.clear(); active = -1; renderText();
});
let hintGone = false; const hideHint = () => { if (hintGone) return; hintGone = true; setTimeout(() => $('[data-hint]').classList.add('is-gone'), 1200); };
let rz, wasM = isM(); addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (isM() !== wasM) { wasM = isM(); active = -1; renderProjects(); } layout(); frame(true); }, 120); });

renderText();
if (qs.get('view') === 'about') setAbout(true, false);
requestAnimationFrame(tick);

function chipIntoView() {
  const b = domEl.querySelector('.ex-dom.is-on');
  if (b && matchMedia('(max-width:760px)').matches) domEl.scrollTo({ left: b.offsetLeft - 16, behavior: 'smooth' });
}

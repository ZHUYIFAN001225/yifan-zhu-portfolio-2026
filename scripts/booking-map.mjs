// Glasgow Salon Booking — case map.
// For a reader with five minutes (a recruiter, a reviewer): the case laid out the way a product / service design
// process runs — Discover → Define → Design & build → Deliver & validate — with every chapter one click away.
// It appears twice: as a card right after the one-minute summary, and as a small "Case map" pill that follows the
// reader, shows where they are, and opens the same map from anywhere on the page.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];

const PHASES = [
  { n: '01', t: ['Discover', '发现问题'], d: ['What her day looked like', '她以前的一天是什么样'], items: [
    { sel: '.bk-hand[data-act="1"]', id: 'day-before', t: ['A day on paper and WeChat', '纸本和微信里的一天'], s: ['the old way, reconstructed', '还原以前的做法'] },
    { sel: '.bk-dom[data-mode="old"]', id: 'domino', t: ['How one late customer spreads', '一个人迟到，后面全被拖'], s: ['interactive day board', '可以点的一天日程'] },
    { sel: '#overview', t: null, s: ['who she is · what both sides need', '店主是谁 · 双方要什么'] }
  ] },
  { n: '02', t: ['Define', '定义方案'], d: ['What the system must do, and the rules', '系统要做什么，守哪些规则'], items: [
    { sel: '#system', t: null, s: ['service blueprint · who does what', '服务蓝图 · 谁做什么'] },
    { sel: '#strategy', t: null, s: ['rules that protect her day', '保护她这一天的规则'] },
    { sel: '#logic', t: null, s: ['key decisions', '关键决策'] }
  ] },
  { n: '03', t: ['Design & build', '设计与实现'], d: ['The real screens and how it was made', '真实界面，以及怎么做出来的'], items: [
    { sel: '#interfaces', t: null, s: ['real screens, customer + owner', '顾客端 + 店主端真实界面'] },
    { sel: '#build', t: null, s: ['stack · AI within rules', '技术栈 · AI 在规则内协作'] },
    { sel: '#iteration', t: null, s: ['before → after', '改之前 → 改之后'] }
  ] },
  { n: '04', t: ['Deliver & validate', '上线与验证'], d: ['What is live, what is not proven yet', '上线了什么，还有什么没证实'], items: [
    { sel: '.bk-dom[data-mode="new"]', id: 'day-after', t: ['The same day, with the diary', '同一天，有了预约本'], s: ['before vs after · the calls you saw', '前后对比 · 你刚才看到的消息'] },
    { sel: '.bk-results', id: 'launch', t: ['Launch record', '上线记录'], s: ['live since Oct 2026', '2026 年 10 月上线'] },
    { sel: '#challenges', t: null, s: ['hard parts · gaps · opportunities', '难点 · 不足 · 机会'] },
    { sel: '#research', t: null, s: ['what still needs real users', '还需要真实用户验证的'] },
    { sel: '#release', t: null, s: ['what comes next', '接下来做什么'] }
  ] }
];
const T = {
  k: ['Case map', '案例导航'],
  h: ['Jump to what you want to see', '想看哪部分，直接跳过去'],
  lead: ['Laid out the way a product and service design process runs.', '按产品与服务设计的流程排列。'],
  pill: ['Case map', '导航'], close: ['Close', '关闭'],
  live: ['Live site ↗', '真实网站 ↗'], proto: ['Try the prototype', '试用原型'], top: ['Back to top', '回到顶部']
};
export const CHARS = () => [...Object.values(T).flat(), ...PHASES.flatMap(p => [...p.t, ...p.d, ...p.items.flatMap(i => [...(i.t || []), ...i.s])])].join('');

export function mountMap(root) {
  if (root.querySelector('.bk-map')) return;
  // give the runtime-built chapters an anchor
  PHASES.forEach(p => p.items.forEach(it => { const el = root.querySelector(it.sel); if (el && it.id && !el.id) el.id = it.id; it.el = el; }));
  PHASES.forEach(p => { p.items = p.items.filter(it => it.el); });
  const phases = PHASES.filter(p => p.items.length);
  const title = it => it.t ? L(it.t) : (it.el.querySelector(':scope h2, .bk-left h2')?.textContent.trim() || '');
  const live = root.querySelector('.ux-live a')?.getAttribute(zh() ? 'data-href-zh' : 'href') || '';

  const grid = () => phases.map(p => `<section class="bk-map-ph"><p class="bk-map-n">${p.n}</p><h3>${L(p.t)}</h3><p class="bk-map-d">${L(p.d)}</p>
    <ol>${p.items.map(it => `<li><a href="#${it.el.id}"><b>${title(it)}</b><span>${L(it.s)}</span></a></li>`).join('')}</ol></section>`).join('');

  // 1) the card after the one-minute summary
  const card = document.createElement('nav'); card.className = 'bk-map'; card.setAttribute('aria-labelledby', 'bk-map-h');
  const quick = root.querySelector('.bk-quick');
  (quick || root.querySelector('.bk-moment'))?.[quick ? 'after' : 'before'](card);

  // 2) the pill that follows the reader, and its panel
  const pill = document.createElement('div'); pill.className = 'bk-map-pill';
  pill.innerHTML = `<button type="button" class="bk-map-btn" aria-expanded="false"><span class="bk-map-btn-t"></span><span class="bk-map-segs" aria-hidden="true"></span><em class="bk-map-btn-now"></em></button>
    <div class="bk-map-panel" hidden><div class="bk-map-panel-top"><p class="bk-map-k"></p><button type="button" class="bk-map-x"></button></div><div class="bk-map-grid"></div><p class="bk-map-links"></p></div>`;
  document.body.append(pill);
  const btn = pill.querySelector('.bk-map-btn'), panel = pill.querySelector('.bk-map-panel');

  const render = () => {
    card.innerHTML = `<div class="bk-map-head"><p class="bk-map-k">${L(T.k)}</p><h2 id="bk-map-h">${L(T.h)}</h2><p class="bk-map-lead">${L(T.lead)}</p></div><div class="bk-map-grid">${grid()}</div>`;
    pill.querySelector('.bk-map-btn-t').textContent = L(T.pill);
    pill.querySelector('.bk-map-segs').innerHTML = phases.map(p => `<i data-n="${p.n}" title="${L(p.t)}"></i>`).join('');
    pill.querySelector('.bk-map-k').textContent = L(T.k);
    pill.querySelector('.bk-map-x').textContent = '×'; pill.querySelector('.bk-map-x').setAttribute('aria-label', L(T.close));
    pill.querySelector('.bk-map-grid').innerHTML = grid();
    pill.querySelector('.bk-map-links').innerHTML = `${live ? `<a href="${live}" target="_blank" rel="noopener">${L(T.live)}</a>` : ''}<a href="#interactive-demo">${L(T.proto)}</a><a href="#main">${L(T.top)}</a>`;
    mark();
  };
  const open = on => { panel.hidden = !on; btn.setAttribute('aria-expanded', on); pill.classList.toggle('is-open', on); };
  btn.addEventListener('click', () => open(panel.hidden));
  pill.querySelector('.bk-map-x').addEventListener('click', () => open(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  document.addEventListener('click', e => { if (!pill.contains(e.target)) open(false); });
  // smooth jumps, landing a little below the sticky bar
  const jump = e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return; const el = document.getElementById(a.getAttribute('href').slice(1)); if (!el) return;
    e.preventDefault(); open(false); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' });
  };
  card.addEventListener('click', jump); panel.addEventListener('click', jump);

  // where am I: the pill names the phase and chapter being read; the matching link is lit
  let curKey = '';
  function mark() {
    const line = innerHeight * .4; let cur = null;
    phases.forEach(p => p.items.forEach(it => { if (it.el.getBoundingClientRect().top < line) cur = { p, it }; }));
    const startY = card.getBoundingClientRect().bottom;
    pill.classList.toggle('is-on', startY < 0);
    const key = cur ? cur.it.el.id : '';
    if (key === curKey) return; curKey = key;
    pill.querySelector('.bk-map-btn-now').innerHTML = cur ? `<b>${cur.p.n} ${L(cur.p.t)}</b><span>${title(cur.it)}</span>` : '';
    const pi = cur ? phases.indexOf(cur.p) : -1;
    pill.querySelectorAll('.bk-map-segs i').forEach((i, k) => { i.classList.toggle('is-past', k < pi); i.classList.toggle('is-on', k === pi); });
    pill.querySelectorAll('.bk-map-ph').forEach((ph, k) => ph.classList.toggle('is-here', k === pi));
    pill.querySelectorAll('.bk-map-grid a').forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === '#' + key));
  }
  let q = false; addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; mark(); }); } }, { passive: true });
  render(); document.addEventListener('portfolio:language', () => setTimeout(() => { curKey = '-'; render(); }, 40));
}

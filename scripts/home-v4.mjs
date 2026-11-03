// Home (preview v4): the structure and motion of Léo Parpeix's portfolio, filled only with my own things.
// A clip from my own Blender film and one line about how I work; where I come from; big words ("who is this curious
// designer"); a photo with its story; what I make, with small pictures of my own work set into the words; what I have
// shipped; how I work — then the work as galleries: each selected project is a row with a strip of its own pictures to
// drag through, a full-screen pause in the middle, and the rest as a numbered archive. The little objects that jump
// around the big words are pieces of my own projects.
import { projects } from './portfolio-catalog.mjs';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const getLang = () => { const q = new URLSearchParams(location.search).get('lang'); if (q === 'zh' || q === 'en') return q; try { return localStorage.getItem('portfolio-language') === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } };
let lang = getLang();
const L = v => Array.isArray(v) ? v[lang === 'zh' ? 1 : 0] : v ? (v[lang] || v.en) : '';

const T = {
  name: ['Yifan Zhu', '朱异凡'], role: ['Research-led multidisciplinary designer', '研究驱动的跨领域设计师'],
  nav_work: ['Work', '作品'], nav_about: ['About', '关于'], nav_contact: ['Contact', '联系'], all_work: ['All work', '全部作品'],
  statement: ['Research first.\nThen built in whatever\nmedium it needs.', '先把问题研究透，\n再用它需要的媒介\n把它做出来。'],
  scroll: ['Scroll down', '往下滑'],
  hero_credit: ['From Living in the Shadows, my Blender film', '画面来自我的 Blender 短片 Living in the Shadows'],
  raised: ['Raised in', '成长于'], designing: ['Designing in', '现在在'],
  todo_place: ['[to fill in]', '[待补充]'], todo_city: ['[to fill in]', '[待补充]'],
  where_p: ['Products, services, research, films and the odd Blender add-on. What each one taught me is in the work below.', '产品、服务、研究、短片，偶尔还有一个 Blender 插件。每一件教会了我什么，都在下面的作品里。'],
  who1: ['Who is this', '这位'], who2: ['curious', '好奇的'], who3: ['designer', '设计师是谁'], who_s: ['(Want to know?)', '（想知道吗？）'],
  photo_slot: ['Your photo goes here', '这里放你的照片'], todo_photo_place: ['Place — to fill in', '地点 · 待补充'], todo_photo_date: ['Date', '日期'],
  photo_story: ['The story behind the photo — to fill in. One or two sentences: where it was taken, and why it matters to you.', '照片背后的小故事 · 待补充。一两句话：在哪拍的，为什么对你有意义。'],
  make_lead: ['Starting from the people involved, and ending with something they can try,', '从相关的人出发，最后交出他们能亲手试的东西，'],
  make_s: ['and sometimes the diary a real salon runs on.', '有时，还是一家真实理发店每天在用的预约本。'],
  shipped_k: ['Things I have made and shipped', '我做出来、交出去的东西'],
  how_big: ['How I work', '我怎么工作'],
  how_p1: ['I use desk research, field observation, stakeholder mapping and synthesis to turn broad topics into focused design opportunities.', '我用案头研究、实地观察、利益相关者梳理和归纳，把宽泛的话题收成具体的设计机会。'],
  how_p2: ['Then I build tangible, visual and interactive prototypes that make abstract systems easier to test, explain and discuss.', '然后做出看得见、摸得着、能操作的原型，让抽象的系统更容易被测试、解释和讨论。'],
  type1: ['Research-led', '研究驱动的'], type2: ['multidisciplinary', '跨领域'], type3: ['designer', '设计师'],
  toy_hint: ['(Click to shuffle my work)', '（点一下，把我的作品打乱）'],
  selected: ['Selected work', '精选作品'], archives: ['Archives', '更多作品'],
  inter: ['Research with people. Build for them.', '和人一起研究，为人而做。'],
  end1: ['Let’s make', '一起做点'], end2: ['something people', '大家能亲手'], end3: ['can try', '试的东西'],
  open: ['Open the case', '查看案例'], watch: ['Watch the film', '观看短片'], live: ['Live', '已上线']
};

// my own things: a small piece of each kind of work (they sit inside the big words, and jump around the type)
const MINE = {
  product: 'assets/v3/screens/look/discover.webp',
  service: 'assets/biodiversity-clock/final-clock.jpg',
  tool: 'assets/cyber-projection-toolkit/toolkit-interface-cyan.png',
  film: 'assets/v3/blender-reel.jpg',
  object: 'assets/v3/ear-shield-cover.webp',
  research: 'assets/v3/anxiety-cover.webp'
};
const pic = k => `<span class="ico"><img src="${MINE[k]}" alt=""></span>`;
const MAKE = [
  ['I research,', '我先研究，'], ['then build', '再做出'], [`${pic('product')}products,`, `${pic('product')}产品、`], [`${pic('service')}services,`, `${pic('service')}服务、`], [`${pic('tool')}tools and`, `${pic('tool')}工具和`], [`${pic('film')}films.`, `${pic('film')}影像。`]
];

// the selected work, each with a strip of its own pictures (phone screens framed as phones)
const P = id => projects.find(p => p.id === id);
const SEL = [
  { id: 'salon-booking', pics: ['assets/v3/products/booking-customer.jpg', 'assets/v3/products/booking-admin.jpg', '@assets/v3/screens/booking/book.webp', '@assets/v3/screens/booking/today.webp', 'assets/v3/screens/booking/zoom-durations.webp', 'assets/v3/screens/booking/zoom-day.webp', 'assets/v3/screens/booking/zoom-time-off.webp'] },
  { id: 'beauty-marketplace', pics: ['discover', 'detail', 'make-it-real', 'matches', 'creator', 'availability', 'booked', 'c-portfolio'].map(f => `@assets/v3/screens/look/${f}.webp`) },
  { id: 'cyber-toolkit', pics: ['>assets/v3/toolkit-preview.mp4', 'assets/cyber-projection-toolkit/toolkit-interface-cyan.png', 'assets/cyber-projection-toolkit/toolkit-interface-amber.png', 'assets/cyber-projection-toolkit/projection-source-frame.png', 'assets/cyber-projection-toolkit/video-frames/03-projection-presets.png', 'assets/cyber-projection-toolkit/video-frames/05-art-direction-controls.png'] },
  { id: 'biodiversity-clock', pics: ['assets/biodiversity-clock/final-clock.jpg', 'assets/biodiversity-clock/burrell-collection-exterior.jpg', 'assets/biodiversity-clock/pollok-country-park.jpg', 'assets/biodiversity-clock/storyboard.jpg', 'assets/biodiversity-clock/interactive-receipt.jpg', 'assets/biodiversity-clock/seasonal-historical-time.jpg'] },
  { id: 'ear-shield', pics: ['01', '02', '03', '04', '05', '06', '07'].map(n => `assets/portfolio-pages/page-${n}.jpg`) },
  { id: 'blender-reel', film: true, pics: ['>assets/v3/blender-reel-preview.mp4', 'assets/v3/blender-reel.jpg', '>assets/v3/modeling-03-preview.mp4', 'assets/v3/modeling-03.jpg'] }
];
const archive = projects.filter(p => !SEL.some(s => s.id === p.id));

function render() {
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  $$('[data-t]').forEach(el => { el.textContent = L(T[el.dataset.t]); });
  $('.hv-lang').setAttribute('aria-label', lang === 'zh' ? '切换语言' : 'Language');
  $('.hv-make').innerHTML = MAKE.map(l => `<span>${L(l)}</span>`).join('');
  // shipped: only things that really are out in the world, plus the education line to fill in
  const shipped = [['salon-booking', 1], ['cyber-toolkit'], ['beauty-marketplace'], ['blender-reel']].map(([id, live]) => { const p = P(id); return `<li><small>${L(p.status)}</small><div><b>${live ? `<em>${L(T.live)}</em>` : ''}${L(p.title)}</b><span>${L(p.subtitle)}</span></div></li>`; });
  shipped.push(`<li><small class="hv-todo">${lang === 'zh' ? '待补充' : 'To fill in'}</small><div><b class="hv-todo">${lang === 'zh' ? '学历：学校 · 学位' : 'Education: school · degree'}</b></div></li>`);
  $('.hv-list').innerHTML = shipped.join(''); $('.hv-count').textContent = `(${shipped.length})`;
  const cols = [[['Methods', '方法'], [['Desk research', '案头研究'], ['Field observation', '实地观察'], ['Stakeholder mapping', '利益相关者梳理'], ['Service blueprinting', '服务蓝图'], ['Systems framing', '系统框架'], ['Insight synthesis', '洞察归纳'], ['Prototyping & testing', '原型与测试']]], [['Tools', '工具'], [['Blender', 'Blender'], ['Unity', 'Unity'], ['Arduino', 'Arduino'], ['TouchDesigner', 'TouchDesigner'], ['Python', 'Python'], ['AI-assisted coding', 'AI 辅助开发'], ['Web prototypes', '网页原型']]]];
  $('.hv-cols').innerHTML = cols.map(([h, items]) => `<div><h3>${L(h)}</h3><ul>${items.map(i => `<li>${L(i)}</li>`).join('')}</ul></div>`).join('');
  const row = (s, i) => {
    const p = P(s.id);
    const pics = s.pics.map(src => src.startsWith('>') ? `<div><video src="${src.slice(1)}" muted loop playsinline preload="none" data-play></video></div>` : src.startsWith('@') ? `<div class="is-phone"><img src="${src.slice(1)}" alt="" loading="lazy" draggable="false"></div>` : `<div><img src="${src}" alt="" loading="lazy" draggable="false"></div>`).join('');
    return `<article class="hv-proj hv-rise"><div class="hv-strip">${pics}</div><div class="hv-meta"><span class="n">${i + 1}</span><span><b>${L(p.title)}</b><i>${L(p.kind)}</i></span><span class="s">${L(p.subtitle)}</span><a href="${p.href}">${L(s.film ? T.watch : T.open)} →</a></div></article>`;
  };
  $('.hv-projects').innerHTML = SEL.slice(0, 3).map(row).join('');
  $('.hv-projects-2').innerHTML = SEL.slice(3).map((s, i) => row(s, i + 3)).join('');
  $('.hv-archive').innerHTML = archive.map((p, i) => `<li><a href="${p.href}"><span>${String(SEL.length + i + 1).padStart(2, '0')}</span><span><b>${L(p.title)}</b><i>${L(p.kind)}</i></span><img src="${p.cover}" alt="" loading="lazy"></a></li>`).join('');
  wire();
}
$('.hv-lang').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; try { localStorage.setItem('portfolio-language', lang); } catch {} render(); });

// big words and rows rise into place as they come into view
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
// videos in the strips play only while on screen
const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .3 });
function wire() {
  $$('.hv-rise').forEach(el => io.observe(el));
  $$('video[data-play]').forEach(v => vio.observe(v));
  // drag a strip with the mouse (touch scrolls natively)
  $$('.hv-strip').forEach(s => {
    let down = false, x0 = 0, l0 = 0;
    s.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); s.setPointerCapture(e.pointerId); });
    s.addEventListener('pointermove', e => { if (down) s.scrollLeft = l0 - (e.clientX - x0); });
    const up = () => { down = false; s.classList.remove('is-drag'); }; s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
  });
  // archive: the cover follows the pointer
  $$('.hv-archive a').forEach(a => { const im = a.querySelector('img'); a.addEventListener('pointermove', e => { im.style.left = e.clientX + 24 + 'px'; im.style.top = e.clientY - 100 + 'px'; }); });
}

// the toys: small pieces of my own work around the big words; click the words and they jump somewhere else
function toys(box, keys, around) {
  box.innerHTML = keys.map(k => `<span class="hv-toy"><img src="${MINE[k]}" alt=""></span>`).join('');
  const n = keys.length;
  const place = () => box.querySelectorAll('.hv-toy').forEach((t, i) => {
    const a = (i / n) * Math.PI * 2 + Math.random() * .7;
    const x = around ? 50 + Math.cos(a) * (34 + Math.random() * 8) : 4 + Math.random() * 86, y = around ? 50 + Math.sin(a) * (32 + Math.random() * 6) : 4 + Math.random() * 72;
    t.style.left = x + '%'; t.style.top = y + '%'; t.style.transform = `rotate(${(Math.random() - .5) * 40}deg)`;
  });
  place(); return place;
}
const shuffle = toys($('.hv-type .hv-toys'), ['product', 'service', 'tool', 'film', 'object', 'research'], false);
$('.hv-type').addEventListener('click', shuffle);
const endToys = toys($('.hv-toys-end'), ['product', 'service', 'tool', 'film', 'object', 'research'], true);
setInterval(() => { if (!document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) endToys(); }, 3400);

render();

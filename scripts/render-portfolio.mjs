import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { categories, projects, forthcoming, caseHighlights, orderedProjects, featured } from './portfolio-catalog.mjs';
import {renderProductDemos} from './product-demos.mjs';
import {productCases} from './product-case-data.mjs';
import {renderVisualWork,resourceCopy} from './render-visual-work.mjs';

const dictionary = {};
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const t = (en, zh) => { dictionary[en.replace(/\s+/g,' ').trim()] = zh; return esc(en); };
const pair = value => t(value.en,value.zh);
export const header = () => `<a class="v3-skip" href="#main">${t('Skip to content','跳转至内容')}</a>
  <header class="site-header v3-header"><a class="brand" href="index.html">Yifan Zhu<span class="v3-brand-dot" aria-hidden="true"></span></a>
    <nav aria-label="Primary navigation"><a href="work.html">${t('All Work','全部作品')}</a><a href="practice.html">${t('Films & Tools','影像与工具')}</a><a href="about.html">About</a><a class="v3-contact-link" href="mailto:zhuyifan001225@gmail.com" aria-label="${t('Email Yifan Zhu','发邮件给朱异凡')}"><span class="v3-contact-label">${t('Let’s talk','聊聊合作')}</span><svg class="v3-mail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.5"/></svg></a><button class="v3-theme-toggle" type="button" data-theme-toggle aria-label="${t('Switch to dark mode','切换到深色模式')}"><span class="v3-theme-label">${t('Dark','深色')}</span></button></nav></header>`;
const footer = () => `<footer class="site-footer v3-footer"><div><a href="index.html">Yifan Zhu</a><p>${t('Research-led Multidisciplinary Designer','研究驱动的跨领域设计师')}</p></div><a href="mailto:zhuyifan001225@gmail.com">zhuyifan001225@gmail.com</a><div class="v3-footer-social"><a href="https://www.douyin.com/user/MS4wLjABAAAA_lHmWTuM_a1k_09EF1ewxBH9vU3K2tYWuNJe-Mk7H_0" target="_blank" rel="noopener noreferrer">Douyin</a><a href="https://xhslink.com/m/AZhAMj7fpc7" target="_blank" rel="noopener noreferrer">${t('Xiaohongshu / RED','小红书 / RED')}</a><a href="https://b23.tv/DQqusXX" target="_blank" rel="noopener noreferrer">Bilibili</a><a href="https://boywithdoughnut.huotan.net/" target="_blank" rel="noopener noreferrer">${t('Resource Website','资源网站')}</a></div></footer>`;
function card(project,index) {
  const tones={'beauty-marketplace':['#ddd3e2','#3e3047'],'salon-booking':['#cedbd2','#263e32'],'ear-shield':['#cbdde7','#243d50'],'anxiety-market':['#dce3ed','#35445a'],'biodiversity-clock':['#dfe5be','#414b2f'],seedwalkers:['#d2dfc7','#354a30'],'machine-mapping':['#d8cce9','#433157'],scone:['#ead9bd','#57412c'],'cross-culture':['#ead3c2','#54382b'],'resource-platform':['#d0d9e1','#324654']};
  const tone=tones[project.id]||['#ddd9d0','#34363b'];
  return `<article class="v3-card${project.video?' v3-card--video':' v3-card--still'}${project.demo?' v3-card--product':''}" style="--project-tone:${tone[0]};--project-ink:${tone[1]}" data-project="${project.id}" data-categories="${project.categories.join(' ')}"><div class="v3-card-inner">
    <div class="v3-media-wrap"><a class="v3-media v3-media--${project.shape}" data-case-link href="${project.href}" aria-label="${pair(project.title)}">
      ${project.demo?'<span class="v3-product-cover-stack">':''}<img${project.demo?' data-i18n-img':''} src="${project.cover}" alt="${pair(project.title)}" ${index<3?'fetchpriority="high"':'loading="lazy"'} decoding="async" />${project.demo?`<img data-i18n-img src="assets/v3/products/${project.demo==='beauty'?'beauty-creator':'booking-admin'}.jpg" alt="${t(project.demo==='beauty'?'Creator view':'Shared shop diary',project.demo==='beauty'?'创作者视角':'店铺共享排期')}" loading="lazy" decoding="async" /></span>`:''}
      ${project.preview ? `<video class="v3-hover-video" data-preview="${project.preview}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>`:''}
      ${!project.video?`<span class="v3-hover-summary" aria-hidden="true">${pair(project.subtitle)}</span>`:''}
      <span class="v3-media-label">${pair(project.kind)}</span><span class="v3-media-arrow" aria-hidden="true">↗</span></a>
      ${project.demo?`<a class="v3-play v3-try" data-case-link href="${project.href}#interactive-demo"><span aria-hidden="true">▶</span> ${t('Try the prototype','试用原型')}</a>`:''}
      ${project.video?`<button class="v3-play" type="button" data-play="${project.id}" aria-label="${t('Play video: '+project.title.en,'播放视频：'+project.title.zh)}">${t('Play','播放')} <span translate="no">${project.duration}</span></button>`:''}</div>
    <div class="v3-card-info"><div class="v3-card-status ${project.status.en==='Released product'?'v3-card-status--live':''}">${pair(project.status)}</div>
      <h3><a data-case-link href="${project.href}">${pair(project.title)}</a></h3><p>${pair(project.subtitle)}</p>
      ${project.demo?`<a class="v3-demo-card-link" data-case-link href="${project.href}#interactive-demo">${t('Open the live prototype','打开可操作原型')} ↗</a>`:''}<div class="v3-card-tags">${project.tags.map(pair).map(s=>`<span>${s}</span>`).join('')}</div>
      ${project.external?`<a class="v3-demo-card-link v3-release-link" href="${project.external}" target="_blank" rel="noopener noreferrer">${pair(project.externalLabel)} ↗</a>`:''}
    </div>
  </div></article>`;
}
function gallery() {
  return `<section class="v3-workspace" id="work" aria-label="${t('Explore the portfolio','浏览作品集')}">
    <aside class="v3-sidebar"><p class="v3-nav-label">${t('Explore by discipline','按职业方向浏览')}</p><nav class="v3-filters" aria-label="${t('Work categories','作品分类')}">
      ${categories.map((c,i)=>`<a class="v3-filter${i===0?' is-active':''}" data-filter="${c.id}" href="work.html?filter=${c.id}"${i===0?' aria-current="page"':''}><span class="v3-filter-index" aria-hidden="true">0${i}</span><span>${pair(c.label)}</span><span class="v3-filter-count" aria-hidden="true">${c.id==='all'?projects.length:projects.filter(p=>p.categories.includes(c.id)).length}</span></a>`).join('')}
    </nav><div class="v3-sidebar-note"><p>${t('One practice. Different perspectives.','一种设计实践，多种观察视角。')}</p><span>${t('Projects can belong to more than one discipline.','同一项目可以属于多个方向。')}</span><a href="about.html">${t('A little about my approach','了解我的设计方法')} ↗</a></div></aside>
    <div class="v3-gallery-content"><div class="v3-gallery-top"><div><h2 data-gallery-title>${pair(categories[0].label)}</h2><p data-gallery-description>${pair(categories[0].description)}</p></div><button type="button" class="v3-share" data-share>${t('Copy collection link','复制分类链接')} ↗</button></div>
      <p class="v3-result-count" data-result-count role="status" aria-live="polite"><span data-visible-count>${projects.length}</span> <span>${t('works','件作品')}</span><span class="v3-result-note">${t('Films, tools, prototypes & research','影像、工具、原型与研究')}</span></p>
      <div class="v3-gallery">${orderedProjects('all').map(card).join('\n')}</div>
      <div class="v3-next"><div><span class="v3-nav-label">${t('Next in the studio','后续作品')}</span><h2>${t('More questions. New possibilities.','新的问题，更多可能。')}</h2><p>${t('Case studies forthcoming. These are not presented as launched products.','案例整理中，以下项目未作为已发布产品展示。')}</p></div><ul>${forthcoming.map(p=>`<li>${pair(p.title)}<span>${pair(p.status)}</span></li>`).join('')}</ul></div>
    </div></section>`;
}
function selected() {
  const picks=featured.map(id=>projects.find(p=>p.id===id));
  const disciplines=categories.filter(c=>c.id!=='all');
  return `<section class="v3-workspace v3-featured" id="work" aria-labelledby="v3-selected-title">
    <div class="v3-featured-head"><div><p class="v3-nav-label">${t('Selected work','精选作品')}</p><h2 id="v3-selected-title">${t('Six projects across four disciplines.','六个项目，四个方向。')}</h2></div><a class="v3-all-link" href="work.html?filter=all">${t('View all','查看全部')} <span translate="no">${projects.length}</span> ${t('works','件作品')}<span aria-hidden="true">→</span></a></div>
    <div class="v3-gallery" data-collection="all">${picks.map(card).join('\n')}</div>
    <nav class="v3-discipline-strip" aria-label="${t('Explore by discipline','按职业方向浏览')}">${disciplines.map(c=>`<a href="work.html?filter=${c.id}"><span class="v3-discipline-count" translate="no">${String(projects.filter(p=>p.categories.includes(c.id)).length).padStart(2,'0')}</span><strong>${pair(c.label)}</strong><small>${pair(c.description)}</small><span class="v3-discipline-arrow" aria-hidden="true">→</span></a>`).join('')}</nav>
  </section>`;
}
function approach() {
  return `<section class="v3-approach"><div><p class="v3-nav-label">${t('The thread through my work','贯穿作品的方法')}</p><h2>${t('Start with people.','从人出发。')}<br><span>${t('Make the idea tangible.','让想法变得可体验。')}</span></h2><a href="about.html">${t('About my practice','关于我的实践')} ↗</a></div><div><p>${t('I connect research, systems thinking and experience design, using AI-assisted rapid prototyping to make ideas tangible, testable and open to iteration.','我连接调研、系统思维与体验设计，通过 AI 辅助快速原型，让想法变得可体验、可测试，并在反馈中迭代。')}</p><ol>${[['User Research','用户研究'],['Problem Framing','问题定义'],['Systems Thinking','系统思维'],['Experience Design','体验设计'],['AI-assisted Rapid Prototyping','AI 辅助快速原型'],['Testing & Iteration','测试与迭代']].map(([en,zh],i)=>`<li><span>0${i+1}</span>${t(en,zh)}</li>`).join('')}</ol></div></section>
  <section class="v3-public"><div><p class="v3-nav-label">${t('A public creative practice','面向公众的创作实践')}</p><h2>${t('Made to be shared.','让创作被分享。')}</h2><a href="resource-platform.html">${t('View the platform evidence','查看平台实践证据')} ↗</a></div><div class="v3-public-metrics"><a href="https://www.douyin.com/user/MS4wLjABAAAA_lHmWTuM_a1k_09EF1ewxBH9vU3K2tYWuNJe-Mk7H_0" target="_blank" rel="noopener noreferrer"><strong>381K+</strong><span>${t('views on one original Blender reel','单条原创 Blender 短片播放量')}</span><small>${t('54K+ likes · Douyin','5.4 万+点赞 · 抖音')}</small></a><a href="https://b23.tv/DQqusXX" target="_blank" rel="noopener noreferrer"><strong>141K+</strong><span>${t('Bilibili views','Bilibili 播放量')}</span></a><a href="https://xhslink.com/m/AZhAMj7fpc7" target="_blank" rel="noopener noreferrer"><strong>11.6K</strong><span>${t('likes & collects on RED','小红书点赞与收藏')}</span></a><a href="resource-platform.html"><strong>1.1K+</strong><span>${t('resource downloads / claims','资源下载 / 领取')}</span><small>${t('460+ resource users','460+ 资源用户')}</small></a></div></section>`;
}
function document(title,body,pageClass='') { return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="description" content="Yifan Zhu — Research-led Multidisciplinary Designer. Explore digital products, UX, 3D, AI, motion, creative technology and service design." /><title>${title}</title><meta name="theme-color" content="#f6f5f1" /><script src="scripts/theme.js"></script><link rel="stylesheet" href="styles.css" /><link rel="stylesheet" href="v3.css" /><link rel="stylesheet" href="themes.css" /></head><body class="${pageClass}">${header()}<main id="main">${body}</main>${footer()}<script src="scripts/language.js" defer></script><script src="scripts/v3-site.js" defer></script>${pageClass?'\n<script type="module" src="scripts/gallery.mjs"></script>':''}</body></html>\n`.replace(/[ \t]+$/gm,''); }
function anxiety() {
  // A short research case: three findings with the real evidence, two test rounds, and an honest claim boundary.
  const stages={discover:['Discover','发现'],define:['Define','定义'],develop:['Develop','开发'],test:['Test','测试'],reflect:['Reflect','反思']};
  const sec = (id,label,title,body,stage) => `<section class="case-section" id="${id}"><div class="case-label">${stage?`<span class="am-stage">${t(...stages[stage])}</span>`:''}${t(...label)}</div><div class="case-content"><h2>${t(...title)}</h2>${body}</div></section>`;
  const img = (file,alt,cls='') => `<img${cls?` class="${cls}"`:''} src="assets/v3/${file}.webp" alt="${t(...alt)}" loading="lazy" decoding="async" />`;
  const steps=[
    ['anxiety-access-1',['01 · Search','01 · 搜索'],['A friend pointed me to Jobs & Business Glasgow. Searching social media turned up nothing relevant.','朋友推荐了 Jobs & Business Glasgow（JBG），但在社交媒体上搜不到任何相关指引。'],['Chat message and social-media search results for JBG','聊天记录与社交媒体上的 JBG 搜索结果']],
    ['anxiety-access-2',['02 · Official site','02 · 官网'],['The website said anyone aged 16+ living in Glasgow could get help.','官网写着：住在格拉斯哥、16 岁以上的人都可以获得帮助。'],['JBG website and contact details','JBG 官网与联系方式']],
    ['anxiety-access-3',['03 · Route','03 · 路线'],['Many locations on the map, a phone line that gave no clear answer. I worked the route out myself.','地图上有很多网点，电话也没得到明确答复，只能自己摸索路线。'],['Map showing many JBG locations','显示多个 JBG 网点的地图']],
    ['anxiety-access-4',['04 · On site','04 · 现场'],['Several rounds of waiting, then: our student-visa status was not eligible.','排了几轮队之后被告知：我们的学生签证身份不符合条件。'],['Reception, registration form and eligibility screen on site','现场的接待处、登记表与资格审核界面']],
  ];
  const quads=[[['Practical constraints','现实约束'],['Housing · Money · Visa','住房 · 钱 · 签证']],[['Transition tasks','过渡任务'],['Graduation · CV · Internship','毕业 · 简历 · 实习']],[['Social pressures','社会压力'],['Family · Peer comparison','家庭 · 同辈比较']],[['Direction choices','方向选择'],['Job search · Return or stay','求职 · 回国还是留下']]];
  const responses=[['Act','行动'],['Compare','比较'],['Seek support','求助'],['Wait','等待'],['Let go','放下']];
  const patterns=[
    [['Uncertainty becomes emotional','不确定变成情绪'],['when the outcome feels high-stakes','当结果显得事关重大'],'P1 · P2 · P4 · P5 · P6'],
    [['Time pressure creates urgency','时间压力制造紧迫'],['overlapping tasks and fixed deadlines make people feel late','任务叠加、截止日期固定，让人觉得自己晚了'],'P1 · P2 · P3 · P5'],
    [['Comparison creates self-doubt','比较带来自我怀疑'],['people question themselves before anything has failed','还没失败，就先怀疑自己'],'P2 · P4 · P6'],
    [['Information needs context','信息需要语境'],['more volume doesn’t help if source, fit or motive is unclear','来源、适用性、动机不清时，信息越多越没用'],'P1 · P2 · P4 · P6'],
    [['Practical feedback is missing','缺少具体反馈'],['general encouragement isn’t enough at key moments','关键节点上，泛泛的鼓励不够'],'P1 · P3 · P5'],
    [['Trusted lived experience helps','可信的过来人经验有用'],['peers, alumni and structured guidance reduce uncertainty','同辈、校友和有结构的引导能降低不确定'],'P2 · P5 · P6'],
  ];
  const vol=[['anxiety-vol-1',['Behind','落后感'],['A careers talk made me feel I was already falling behind.','一场就业讲座让我觉得自己已经落后了。'],['Careers talk slide listing recruitment requirements','就业讲座上列出招聘要求的幻灯片']],['anxiety-vol-2',['A place to start','有个起点'],['Charity-shop volunteering gave me routine, English practice and local contact.','在慈善商店做志愿者，给了我规律的生活、练英语的机会和本地联系。'],['Volunteering at a charity shop counter','在慈善商店柜台做志愿者']],['anxiety-vol-3',['Trusted','被信任'],['Being asked to help reduced some of the anxiety. Then a manager recommended JBG.','被需要、被信任，焦虑减轻了一些。后来是店长推荐了 JBG。'],['Chat message asking me to cover a shift','请我帮忙顶班的聊天消息']]];
  const trace=[[['Several pressures competed at once (6 stories)','多种压力同时挤压（6 个故事）'],['Write everything down and prioritise before acting','先全部写下来、排好优先级，再行动']],[['Support was visible but hard to judge or enter (JBG visit)','支持看得见，但难以判断、难以进入（JBG 走访）'],['Comparison asks: can I actually access this?','比较时先问：我真的能用上吗？']],[['Agencies sold speed and certainty (platform research)','中介卖的是速度和确定性（平台调研）'],['Comparison asks for source, evidence and limits','比较时追问来源、证据和局限']]];
  const changes=[[['Abstract labels → plain questions','抽象标签 → 直白提问'],['“Recognise” became “What feels clear already?”','“识别”改成“哪些事你已经想清楚了？”']],[['Response before comparison','先选回应，再比较'],['Act, compare, seek support, wait or let go','行动、比较、求助、等待或放下']],[['Decision before options','先定决定，再列选项'],['State the decision, then pick and rank your own criteria','先写清要做什么决定，再自己挑选并排序标准']],[['Thinking and feeling, measured apart','想法和感受分开记录'],['The closing reflection no longer assumes clear means calm','结尾反思不再默认“想清楚 = 平静”']]];
  const sysGroups=[
    [['Formal support','正式支持'],'formal',[[['University careers & wellbeing','学校就业与心理服务'],['official guidance, learning','官方指导、学习支持']],[['Public employment services','公共就业服务'],['free, but eligibility unclear','免费，但资格条件不清']],[['Official sources & visa rules','官方信息与签证规定'],['what is allowed, what is required','什么能做、需要什么']]]],
    [['People around them','身边的人'],'people',[[['Family & parents','家人与父母'],['funding, expectations, pressure to return','经济支持、期望、回国压力']],[['Friends & peers','朋友与同学'],['empathy, but also comparison','共情，也带来比较']],[['Alumni & mentors','校友与导师'],['real experience, industry feedback','真实经验、行业反馈']]]],
    [['Information & commercial','信息与商业'],'market',[[['Job platforms','求职平台'],['LinkedIn, Chinese job apps','LinkedIn、国内招聘 App']],[['Social communities','社交社区'],['Xiaohongshu posts, group chats','小红书帖子、群聊']],[['Paid career agencies','付费求职中介'],['speed and “certainty”, for a fee','付费买速度和“确定性”']]]],
    [['Outcome','结果方'],'outcome',[[['Employers','雇主'],['job ads, screening, results','招聘信息、筛选、结果']],[['Recruiters & application systems','猎头与申请系统'],['filters, status emails, silence','筛选、状态邮件、石沉大海']]]],
  ];
  const idx=[['research',['Research','调研']],['system',['System','系统']],['access',['Findings','发现']],['reframe',['Reframing','重新定义']],['prototype',['Prototype','原型']],['testing',['Testing','测试']],['claim',['Outcome','结论']]];
  return document('Yifan Zhu | The Anxiety Market',`<article class="full-case single-project v3-anxiety am-case"><a class="back-link" href="work.html">${t('Back to All Work','返回全部作品')}</a>
    <section class="case-head am-head"><div><p class="eyebrow">${t('Service design · UX research · MDes graduation project','服务设计 · 用户研究 · 硕士毕业设计')}</p><h1>${t('The Anxiety Market','The Anxiety Market 焦虑市场')}</h1><p>${t('Field research into why Chinese international graduates in the UK struggle to use the support around them as they move from study to work, and a paper decision practice I tested in two rounds with students.','在英中国留学生从学习走向工作时，身边明明有支持，为什么还是用不上？这是一次实地研究，以及一套和同学们一起测试了两轮的纸质决策练习。')}</p><span class="v3-research-status">${t('Completed · exploratory research, not a launched service','已完成 · 探索性研究，非已上线服务')}</span></div>
      <figure class="am-hero">${img('anxiety-cover',['Two sticky-note walls from the first round of prototype testing','第一轮原型测试留下的两面便利贴墙'])}<figcaption>${t('Round 1 testing: the same practice, used by one participant with guidance (left) and one mostly alone (right).','第一轮测试：同一套练习，一位参与者需要引导（左），另一位基本独立完成（右）。')}</figcaption></figure></section>
    <section class="am-tldr" aria-label="${t('In 30 seconds','30 秒速读')}"><p class="am-tldr-title">${t('In 30 seconds','30 秒速读')}</p><dl>
      <div><dt>${t('My role','我的角色')}</dt><dd>${t('Solo project: research, synthesis, prototype design and testing','独立完成：调研、分析、原型设计与测试')}</dd></div>
      <div><dt>${t('What I did','我做了什么')}</dt><dd>${t('Collected 6 student stories, compared Chinese and UK job platforms, visited 2 public employment services myself, then tested a paper prototype in 2 rounds','收集 6 个学生故事，对比中英文求职平台，亲自走访 2 家公共就业服务机构，再做了两轮纸质原型测试')}</dd></div>
      <div><dt>${t('What I found','我发现了什么')}</dt><dd>${t('Help exists, but students can’t easily reach or judge it, so paid agencies selling “certainty” fill the gap','帮助是有的，但学生很难找到入口、也很难判断该信谁，于是卖“确定性”的付费中介趁机填补了空白')}</dd></div>
      <div><dt>${t('Result','结果')}</dt><dd>${t('Students turned a pile of pressures into one clear next step. Anxiety didn’t disappear, and I say so.','学生能把一堆压力收敛成一个清楚的下一步。焦虑并没有消失，我也如实写出来。')}</dd></div></dl>
      <ul class="am-skills" aria-label="${t('Skills shown','体现的能力')}">${[['Field research','实地调研'],['User interviews','用户访谈'],['Research synthesis','研究分析'],['Stakeholder mapping','利益相关者地图'],['Prototyping','原型设计'],['Usability testing','可用性测试']].map(k=>`<li>${t(...k)}</li>`).join('')}</ul></section>
    <nav class="ux-case-index" aria-label="${t('Case contents','案例目录')}" data-case-index>${idx.map(([id,l])=>`<a href="#${id}">${t(...l)}</a>`).join('')}<a class="ux-index-top" href="#main">${t('↑ Top','↑ 顶部')}</a></nav>
    ${sec('research',['Starting point','起点'],['Was this only my experience?','这只是我一个人的经历吗？'],`<p>${t('As I approached graduation, job applications ran into housing, visa, money and family pressure at the same time. Everything got called “job-search anxiety”. I wanted to know whether others felt the same, and why support that clearly exists was so hard to act on.','临近毕业，求职和住房、签证、钱、家里的压力挤在同一时间，最后都被叫作“求职焦虑”。我想知道别人是不是也这样，以及明明有支持，为什么还是很难用上。')}</p>
      <div class="am-lenses"><div><b>${t('Lived experience','亲身经历')}</b><span>${t('What pressures were students actually carrying?','学生们实际在扛哪些压力？')}</span><small>${t('Autoethnography · 6 anonymised stories','自我民族志 · 6 个匿名故事')}</small></div><div><b>${t('Information environment','信息环境')}</b><span>${t('What were they seeing and being told?','他们看到、听到的是什么？')}</span><small>${t('Chinese and UK platforms · agency marketing','中英文平台 · 中介营销')}</small></div><div><b>${t('Service access','服务可达性')}</b><span>${t('What happened when they actually tried to get help?','真的去求助时发生了什么？')}</span><small>${t('Visits to 2 public employment services · volunteering','走访 2 家公共就业服务 · 志愿经历')}</small></div></div>
      <h3 class="am-sub">${t('Six stories, six repeating patterns','6 个故事，6 个反复出现的模式')}</h3>
      <p>${t('I compared six anonymised open-narrative stories (P1–P6), then checked each pattern against the platform, desk and field evidence. It was not only me.','我对比了 6 个匿名开放叙事故事（P1–P6），再用平台、文献和实地证据去核对每个模式。结论是：不只是我。')}</p>
      <ol class="am-patterns">${patterns.map(([h,b,ps])=>`<li><b>${t(...h)}</b><span>${t(...b)}</span><small>${ps}</small></li>`).join('')}</ol>`,'discover')}
    ${sec('system',['Who is involved','涉及哪些人'],['The student sits in the middle of a crowded system.','学生被夹在一个拥挤的系统中间。'],`<p>${t('I mapped who the student deals with during graduation and job search, and what each side gives or asks for.','我画出了学生在毕业和求职阶段要打交道的各方，以及每一方给了什么、要什么。')}</p>
      <div class="am-system"><div class="am-sys-center"><b>${t('Chinese international student','中国留学生')}</b><span>${t('graduation + job search','毕业 + 求职阶段')}</span></div>${sysGroups.map(([h,c,items])=>`<div class="am-sys-group am-sys--${c}"><b>${t(...h)}</b><ul>${items.map(([n,d])=>`<li><span>${t(...n)}</span><small>${t(...d)}</small></li>`).join('')}</ul></div>`).join('')}
      <p class="am-sys-ext"><span>${t('Pressure from outside','外部条件')}</span>${[['Visa rules','签证规定'],['Recruitment calendar','招聘季节'],['Labour market','就业市场'],['Family finances','家庭经济'],['Graduation deadline','毕业期限']].map(k=>`<i>${t(...k)}</i>`).join('')}</p></div>
      <p><a class="am-link" href="assets/v3/anxiety-stakeholder-map.webp" target="_blank" rel="noopener">${t('See the full stakeholder map ↗','查看完整利益相关者地图 ↗')}</a></p>
      <div class="am-scope"><div><small>${t('Where this project steps in','这个项目介入的位置')}</small><p>${t('The moment before acting: when several pressures compete and the student has to judge which support to trust and what to do first. A first-touch practice, run with a facilitator today, aiming for a version students can use on their own.','行动之前的那一刻：几种压力同时压过来，学生要判断该信哪种支持、先做什么。这是一个“第一次接触”时用的练习，目前需要引导者陪着做，目标是让学生以后能自己用。')}</p></div><div><small>${t('In scope','做什么')}</small><p>${t('Seeing what is creating pressure · picking what matters now · choosing a fitting next response','看清压力来自哪里 · 选出现在最要紧的 · 选择合适的下一步')}</p></div><div><small>${t('Out of scope','不做什么')}</small><p>${t('Finding jobs · CV or interview coaching · guaranteeing outcomes · clinical mental-health care','找工作 · 简历或面试辅导 · 保证结果 · 临床心理治疗')}</p></div></div>`,'discover')}
    ${sec('access',['Finding 01','发现 01'],['Visible is not the same as usable.','看得见，不等于用得上。'],`<p>${t('I went through the route to Jobs & Business Glasgow, a free public employability service, as a student would.','我以一个普通学生的身份，完整走了一遍去 Jobs & Business Glasgow（免费的公共就业服务）的路线。')}</p>
      <ol class="am-steps">${steps.map(([f,h,b,a])=>`<li>${img(f,a)}<b>${t(...h)}</b><span>${t(...b)}</span></li>`).join('')}</ol>
      <p class="am-take">${t('The barrier was not missing support. It was the invisible work before support could begin: searching, decoding, calling, finding the door. Under pressure, each step is a place to give up.','问题不是没有支持，而是在支持开始之前那些看不见的功夫：搜索、看懂、打电话、找到门。人在压力下，每一步都可能就此放弃。')}</p>
      <div class="am-aside"><h3 class="am-sub">${t('What did work: help that came through people','反而起作用的：通过人传过来的帮助')}</h3><p>${t('The route into JBG didn’t start with a website. It started with volunteering, which was never meant as career support.','我知道 JBG 并不是从网站开始的，而是从做志愿者开始的，而那本来就不是什么就业服务。')}</p>
      <ol class="am-vol">${vol.map(([f,h,b,a])=>`<li>${img(f,a)}<b>${t(...h)}</b><span>${t(...b)}</span></li>`).join('')}</ol>
      <p class="am-note">${t('Routine, reassurance and connection changed what felt manageable before any formal service did. This came back later, when my framing lost its emotional side.','规律、安慰和人际联系，比任何正式服务更早地让事情变得“可以应付”。后来当我的框架丢掉情绪这一面时，正是这点把我拉了回来。')}</p></div>`,'discover')}
    ${sec('certainty',['Finding 02','发现 02'],['When nothing feels certain, certainty sells.','当什么都不确定时，“确定性”本身就能卖钱。'],`<div class="am-pair"><figure>${img('anxiety-certainty-1',['Agency talk slides listing internship requirements and a success story','中介讲座上的实习要求与成功案例幻灯片'])}<figcaption>${t('Agency talks: “3–4 internships in total” creates urgency; success stories make the outcome feel within reach.','中介讲座：“总共要 3–4 段实习”制造紧迫感，成功案例让结果显得触手可及。')}</figcaption></figure><figure>${img('anxiety-certainty-2',['Social-media posts selling paid portfolio and career guidance','社交媒体上售卖付费作品集与求职辅导的帖子'])}<figcaption>${t('Feeds: pressure-framed posts lead straight to paid guidance.','信息流：以压力为切入点的帖子，直接导向付费辅导。')}</figcaption></figure></div>
      <p class="am-take">${t('Public routes were free but fragmented. Commercial routes sold speed, insider access and “guaranteed” outcomes, and for students who already felt late, that clarity itself was the product.','公共渠道免费但零散；商业渠道卖的是速度、内部资源和“保证结果”。对已经觉得自己落后的学生来说，这份“清晰”本身就是商品。')}</p>`,'discover')}
    ${sec('cluster',['Finding 03','发现 03'],['One label was hiding four kinds of pressure.','一个标签下面藏着四种压力。'],`<div class="am-quads">${quads.map(([h,b])=>`<div><b>${t(...h)}</b><span>${t(...b)}</span></div>`).join('')}<p class="am-quads-label">${t('“Job-search anxiety”','“求职焦虑”')}</p></div>
      <p class="am-take">${t('Each pressure has its own urgency and degree of control. So the design job was not “reduce anxiety” but: separate the pressures first, then decide what kind of response each one needs.','每种压力的紧急程度、可控程度都不一样。所以设计要做的不是“消除焦虑”，而是先把压力拆开，再判断每一种需要什么样的回应。')}</p>`,'define')}
    ${sec('reframe',['Reframing','重新定义'],['I got the scope right by cutting out the point.','我把范围收窄了，却把重点也剪掉了。'],`<p>${t('How the design question (“How might we…?”) changed over the project, including one wrong turn.','设计问题（“我们如何……？”）在项目中是怎么变的，包括一次走偏。')}</p><ol class="am-hmw"><li><small>${t('Start','起点')}</small><b>${t('Emotion was visible, but the scope was too broad.','情绪很明显，但范围太大。')}</b><span>${t('The whole international-student journey, with no clear place to intervene.','覆盖整个留学生旅程，找不到明确的介入点。')}</span></li><li class="is-wrong"><small>${t('Mid-stage','中期')}</small><b>${t('Specific, but too functional.','具体了，但太功能化。')}</b><span>${t('“How might we make applications, materials, status and feedback visible and manageable?” It was turning into an admin tool. My tutor pointed out the emotional core had disappeared.','“如何让申请、材料、进度和反馈变得可见、可管理？”它正在变成一个事务管理工具。导师指出：最初的情绪内核不见了。')}</span></li><li><small>${t('Final','最终')}</small><b>${t('Reconnect emotion and decision.','把情绪和决策重新连起来。')}</b><span>${t('“How might we connect emotional support and decision support so Chinese international graduates can make confident, evidence-informed decisions in the move from study to work?”','“如何把情绪支持与决策支持连接起来，让中国留学生在从学习走向工作时，做出有信心、有依据的决定？”')}</span></li></ol>
      <figure class="am-notebook">${img('anxiety-notebook',['Notebook page asking which study changed which design decision','笔记本上写着“哪项研究改变了哪个设计决定”的一页'])}<figcaption>${t('My notebook check before prototyping: “Which study changed which design decision?” Every interaction had to trace back to evidence.','做原型前在笔记本上的自查：“哪项研究改变了哪个设计决定？”每个交互都必须能追溯到证据。')}</figcaption></figure>`,'define')}
    ${sec('prototype',['Prototype','原型'],['Every step traces back to a finding.','每一步都能追溯到一个发现。'],`<p>${t('I designed the experience before the format: a three-step paper practice used with a participant’s own, current situation.','我先设计体验，再决定形式：一套三步的纸质练习，用参与者自己当下的真实处境来做。')}</p>
      <ol class="am-flow"><li>${t('Make the pressures visible','把压力写出来')}</li><li>${t('Pick what matters now','选出现在最要紧的')}</li><li>${t('Choose a response that fits','选一个合适的回应')}</li></ol>
      <div class="am-trace">${trace.map(([f,d])=>`<div><span>${t(...f)}</span><i aria-hidden="true">→</i><b>${t(...d)}</b></div>`).join('')}</div>
      <div class="am-proto"><figure>${img('anxiety-proto2-designed',['Prototype 2 worksheet: choose a response, and compare only if needed','原型 2 工作表：选择回应方式，必要时才比较'])}<figcaption>${t('Prototype 2 as designed: choose a response first; compare only if the situation needs it.','原型 2 设计稿：先选回应方式，只有需要时才进入比较。')}</figcaption></figure><figure>${img('anxiety-proto2-filled',['Prototype 2 worksheet filled in by a participant','参与者填写过的原型 2 工作表'])}<figcaption>${t('The same sheet filled in during round 2: rent, job, city, money and CV narrow to “Solve my contract first”.','第二轮测试中填写过的同一张表：房租、工作、城市、钱、简历，最后收敛到“先解决合同”。')}</figcaption></figure></div>`,'develop')}
    ${sec('testing',['Testing','测试'],['Testing changed the logic, not just the wording.','测试改变的是逻辑，不只是措辞。'],`<div class="am-shift"><div><small>${t('I expected','我原以为')}</small><b>${t('Clarity → Confidence → Action','清晰 → 自信 → 行动')}</b></div><div><small>${t('Round 1 showed','第一轮测试发现')}</small><b>${t('Clarity ≠ Confidence ≠ Calm','清晰 ≠ 自信 ≠ 平静')}</b></div></div>
      <div class="am-scores"><table><caption>${t('Self-rated before → after, round 1 (1–5)','第一轮自评，前 → 后（1–5 分）')}</caption><thead><tr><th></th><th>${t('Clarity','清晰度')}</th><th>${t('Confidence','信心')}</th><th>${t('What changed','实际变化')}</th></tr></thead><tbody><tr><th>${t('Participant A','参与者 A')}</th><td>4.2 → 4.3</td><td>3.9 → 3.9</td><td>${t('A concrete plan and people to consult','有了具体计划和可以请教的人')}</td></tr><tr><th>${t('Participant B','参与者 B')}</th><td>5 → 5</td><td>3 → 3</td><td>${t('Realised accommodation came first','意识到住房才是眼下第一位')}</td></tr></tbody></table><p>${t('The scores barely moved. The decisions did.','分数几乎没动，决定却变了。')}</p></div>
      <div class="am-quotes"><blockquote class="am-quote">${t('“I can be clear and still feel anxious.”','“我可以想得很清楚，但还是焦虑。”')}<cite>${t('Participant, round 1','参与者，第一轮')}</cite></blockquote><blockquote class="am-quote">${t('“I realised there are some things I can choose to let go of.”','“我意识到，有些事我可以选择放下。”')}<cite>${t('Participant, round 1','参与者，第一轮')}</cite></blockquote></div>
      <h3 class="am-sub">${t('What changed from V1 to V2','从 V1 到 V2 改了什么')}</h3>
      <ol class="am-changes">${changes.map(([h,b])=>`<li><b>${t(...h)}</b><span>${t(...b)}</span></li>`).join('')}</ol>
      <ul class="am-chips">${responses.map(r=>`<li>${t(...r)}</li>`).join('')}</ul>
      <p>${t('In round 2, one participant started with rent, job search, money, CV, graduation, internship and interviews all at once, and ended with:','第二轮里，一位参与者一开始同时压着房租、求职、钱、简历、毕业、实习和面试，最后落到：')}</p>
      <blockquote class="am-quote">${t('“Solve my contract first.”','“先把租房合同的事解决。”')}<cite>${t('Participant, round 2, who added: “but it still feels troublesome, because the other things are waiting.”','第二轮参与者，接着又说：“但还是很烦，因为其他事都还在等着我。”')}</cite></blockquote>
      <p class="am-note">${t('Still rough: “Compare” needed examples and occasional explanation, and the full sheet felt like a burden to someone already overwhelmed. The next version should need less guidance, not add more.','仍然粗糙的地方：“比较”这一步还需要例子和偶尔的解释；对已经很累的人来说，整张表本身也是负担。下一版应该是需要更少引导，而不是加更多步骤。')}</p>`,'test')}
    ${sec('claim',['Outcome','结论'],['What I can claim, and what I can’t yet.','我能证明什么，还不能证明什么。'],`<div class="am-claims"><div><small>${t('Shown in testing','测试中已看到')}</small><p>${t('Many competing pressures became one priority and one concrete next step.','一堆互相挤压的压力，变成一个优先事项和一个具体的下一步。')}</p></div><div><small>${t('Not shown','尚未证明')}</small><p>${t('That anxiety goes down, that people can do it without a facilitator, or that it sticks with repeated use.','焦虑会下降；没有引导者也能独立完成；反复使用后能变成习惯。')}</p></div><div><small>${t('What I’d test next','下一步要测')}</small><p>${t('A four-question quick mode: What is taking my attention? What matters now? What response do I need? What will I do next? Then repeated use, and other decisions like housing or visas.','四个问题的快速版：什么在占据我的注意力？现在什么最重要？我需要哪种回应？下一步做什么？再测反复使用，以及能否用在住房、签证等其他决定上。')}</p></div></div>
      <p class="am-take">${t('The biggest shift for me: from designing an object to designing a capability, and from promising “less anxiety” to a claim the evidence could actually carry.','对我来说最大的转变：从设计一个物件，转向培养一种能力；从承诺“减少焦虑”，转向一个证据真正撑得住的结论。')}</p>`,'reflect')}
    <nav class="project-nav"><a href="project-cross-culture.html">${t('Cross-Culture Icebreaker','跨文化破冰包')}</a><a class="back-link" href="work.html">${t('Back to All Work','返回全部作品')}</a></nav></article>`);
}
export async function renderPortfolio() {
  for(const key of Object.keys(dictionary))delete dictionary[key];
  const home = `<section class="v3-hero"><div><p class="v3-eyebrow">${t('Research-led Multidisciplinary Designer','研究驱动的跨领域设计师')}</p><h1>${t('Research-led.','以研究为起点。')}<br><span>${t('Made tangible.','让想法可体验。')}</span></h1></div><div class="v3-hero-note"><p>${t('I turn complex questions into experiences you can see, use and test.','我将复杂的问题转化为可看见、可使用、可测试的体验。')}</p><span>${t('Products. Moving images. Systems.','产品、动态影像与系统。')}</span></div></section>`;
  const work = `<section class="v3-hero v3-hero--work"><div><p class="v3-eyebrow">${t('The work of Yifan Zhu','朱异凡的设计实践')}</p><h1>${t('Different disciplines.','跨越不同领域。')}<br><span>${t('One curious mind.','始于同一份好奇。')}</span></h1></div><div class="v3-hero-note"><p>${t('Find the perspective that fits your team.','找到适合你的团队的设计视角。')}</p><span>${t('Explore a collection. Open the full story.','按方向浏览，深入完整案例。')}</span></div></section>`;
  // The homepage opens straight on the collection, so a reviewer can pick a discipline in one click.
  const homeHero = work.replace(`${t('The work of Yifan Zhu','朱异凡的设计实践')}`,t('Yifan Zhu · Research-led Multidisciplinary Designer','朱异凡 · 研究驱动的跨领域设计师'));
  await fs.writeFile('index.html',document('Yifan Zhu | Research-led Multidisciplinary Designer',homeHero+gallery(),'v3-index'));
  await fs.writeFile('practice.html',renderVisualWork(t,document,projects));
  await fs.writeFile('work.html',document('Yifan Zhu | All Work',work+gallery(),'v3-index'));
  await fs.writeFile('project-anxiety-market.html',anxiety());
  for(const [file,html] of renderProductDemos(t,document))await fs.writeFile(file,html);
  // Register the strings used by the dynamic collection title and media dialog.
  t('Visual practice. Creative tools.','视觉实践与创意工具。');t('Original Blender visual practice','原创 Blender 视觉实践');
  for(const [en,zh] of [['Inside Blender.','在 Blender 中体验。'],['Six controls. One workflow.','六项控制，同一流程。'],['One system, different visual directions.','一套系统，多种视觉方向。'],['Making variations independent.','让视觉变体保持独立。'],['Public product & release.','公开产品与发布证据。'],['From repetitive setup to creative control.','从重复搭建，到创作控制。']])t(en,zh);
  for(const [en,zh] of [['Project context','项目背景'],['The case at a glance','案例速览'],['Further reflections & competencies','深入反思与能力'],['End-to-end process','完整产品过程'],['Test coverage','测试覆盖范围'],['Launch context & platform evidence','发布背景与平台证据'],['Commercialisation & delivery','商业化与交付'],['Institutional setting & collaboration','机构背景与合作'],['My contribution in detail','我的具体贡献'],['Detailed design decisions','详细设计决策'],['Research filtering process','研究筛选过程'],['Learner needs in detail','不同学习者的需求'],['Potential educational value','潜在教育价值'],['Prototype & outcome','原型与成果']])t(en,zh);
  for (const c of categories) { pair(c.label);pair(c.description); }
  for (const [en,zh] of [['Close video','关闭视频'],['Close image','关闭图片'],['Copy collection link','复制分类链接'],['Link copied','链接已复制'],['Copy this URL','复制此链接'],['Video could not play. Open the original file.','视频暂时无法播放，请打开原视频文件。'],['Open original video','打开原视频'],['Read the full story','阅读完整案例'],['Watch walkthrough','观看演示'],['View live product','查看在线产品'],['See prototype evidence','查看原型证据'],['Back to collection','返回作品分类'],['Open image at full size','查看完整图片']])t(en,zh);
  // Keep public pages in the existing project; do not regenerate their case content.
  const legacy = ['about.html','practice.html','resource-platform.html','project-cyber-projection-toolkit.html','project-biodiversity-clock.html','project-scone-through-time.html','project-ear-shield.html','project-machine-mapping.html','project-seedwalkers.html','project-cross-culture.html','case-studies.html'];
  for (const file of legacy) {
    let html = await fs.readFile(file,'utf8');
    html=html.replace(/(?:<a class="v3-skip"[\s\S]*?<\/a>\s*)?<header\b[\s\S]*?<\/header>/,header());
    html=html.replace(/<main(?: id="main")?>/,'<main id="main">');
    if (!html.includes('href="v3.css"'))html=html.replace('</head>','<link rel="stylesheet" href="v3.css" /></head>');
    if (!html.includes('src="scripts/theme.js"'))html=html.replace(/<link\b[^>]*rel="stylesheet"/, '<meta name="theme-color" content="#f6f5f1" /><script src="scripts/theme.js"></script><link rel="stylesheet"');
    if (!html.includes('href="themes.css"'))html=html.replace('</head>','<link rel="stylesheet" href="themes.css" /></head>');
    if (!html.includes('src="scripts/v3-site.js"'))html=html.replace('</body>','<script src="scripts/v3-site.js" defer></script></body>');
    html=html.replace(/<h2>(Cyber Projection Toolkit|Ear Shield|Machine Mapping|SeedWalkers|Cross-Culture Icebreaker)<\/h2>/,'<h1>$1</h1>');
    const project=projects.find(p=>p.href.split('#')[0]===file),highlight=project&&caseHighlights[project.id];
    if(highlight?.hero){
      const originalCover=t('Open original project cover','查看原始项目封面');
      const imageAlt=pair(highlight.alt);
      html=html.replace(new RegExp(`<img src="${highlight.original.replaceAll('.','\\.')}"[^>]*>`),`<img src="${highlight.hero}" alt="${imageAlt}" /><figcaption><a class="v3-original-cover" href="${highlight.original}" target="_blank" rel="noopener">${originalCover} ↗</a></figcaption>`);
    }
    // Existing videos keep their full originals; posters avoid empty mobile players.
    const posters={'assets/blender-visuals-01.mp4':'blender-reel','assets/codesk-website-showcase.mp4':'web-prototype','assets/practice-videos/hyper3d-ai-pipeline-collaboration-web.mp4':'ai-motion','assets/practice-videos/manual-3d-modeling-01.mp4':'modeling-01','assets/practice-videos/manual-3d-modeling-02.mp4':'modeling-02','assets/practice-videos/manual-3d-modeling-03.mp4':'modeling-03','assets/cyber-projection-toolkit/hologram-addon-english-tutorial.mp4':'toolkit'};
    html=html.replace(/<video\b[^>]*>/g,tag=>{const src=/src="([^"]+)"/.exec(tag)?.[1];return posters[src]&&!tag.includes('poster=')?tag.replace('<video',`<video poster="assets/v3/${posters[src]}.jpg"`):tag;});
    for(const project of projects.filter(p=>p.webVideo))html=html.replaceAll(`src="${project.video}"`,`src="${project.webVideo}"`);
    let imageIndex=0;
    html=html.replace(/<img\b[^>]*>/g,tag=>{
      const first=imageIndex++===0;
      if(!tag.includes('decoding='))tag=tag.replace('<img','<img decoding="async"');
      if(!first&&!tag.includes('loading='))tag=tag.replace('<img','<img loading="lazy"');
      if(first&&!tag.includes('fetchpriority='))tag=tag.replace('<img','<img fetchpriority="high"');
      return tag;
    });
    if(file==='about.html'){
      const intro=t('I am a Research-led Multidisciplinary Designer. I connect user research, problem framing, systems thinking and experience design with AI-assisted rapid prototyping, testing and iteration. My work translates complex ecological, cultural and social systems into visual, interactive and research-led experiences.','我是一名研究驱动的跨领域设计师。我连接用户研究、问题定义、系统思维与体验设计，并借助 AI 辅助快速原型、测试与迭代推进设计。我的作品将复杂的生态、文化和社会系统转化为视觉、互动与研究驱动的体验。');
      html=html.replace(/I am a service and transformation designer[\s\S]*?research-led experiences\./,intro);
      const contactActions=`<div class="v3-about-contact"><a href="mailto:zhuyifan001225@gmail.com">zhuyifan001225@gmail.com</a><a href="#cv-title">${t('CV & contact ↓','简历与联系 ↓')}</a></div>`;
      if(html.includes('class="v3-about-contact"'))html=html.replace(/<div class="v3-about-contact">[\s\S]*?<\/div>/,contactActions);
      else html=html.replace(/(<section class="case-landing about-hero">[\s\S]*?)(<\/section>)/, '$1'+contactActions+'$2');
      const roleLinks=`<section class="section v3-role-links" aria-label="${t('Role-specific portfolio links','岗位专属作品集链接')}"><div class="section-kicker">${t('Find your perspective','找到你的设计视角')}</div><h2>${t('A collection for every conversation.','为不同岗位提供对应作品。')}</h2><p>${t('Each collection has its own shareable URL, ready to link from a role-specific CV.','每个分类都有独立分享链接，可用于不同岗位的简历。')}</p><nav>${categories.filter(c=>c.id!=='all').map(c=>`<a href="work.html?filter=${c.id}">${pair(c.label)} ↗</a>`).join('')}</nav></section>`;
      if(html.includes('class="section v3-role-links"'))html=html.replace(/<section class="section v3-role-links"[\s\S]*?<\/section>/,roleLinks);
      else html=html.replace('<section class="section cv-section"',roleLinks+'\n<section class="section cv-section"');
    }
    for(const [from,en,zh] of resourceCopy){
      const translated=t(en,zh);
      if(file==='resource-platform.html'){
        const pattern=from.replace(/[.*+?^\x24{}()|[\]\\]/g,'\\    await fs.writeFile(file,html);').replace(/\s+/g,'\\s+');
        html=html.replace(new RegExp(pattern,'g'),translated);
      }
    }
    await fs.writeFile(file,html);
  }
  let language=await fs.readFile('scripts/language.js','utf8');
  language=language.replace(/"practice.html": "[^"]*"/, '"practice.html": "朱异凡 | 影像与创意工具"');
  for(const [en,zh] of Object.entries(dictionary)) dictionary[en+' ↗']=zh+' ↗';
  const addition=`  // V3 translations start\n  Object.assign(zh, ${JSON.stringify(dictionary,null,2)});\n  // V3 translations end\n\n`;
  if(language.includes('// V3 translations start'))language=language.replace(/  \/\/ V3 translations start[\s\S]*?  \/\/ V3 translations end\n\n/,addition);
  else language=language.replace('  const zhTitles',addition+'  const zhTitles');
  if(!language.includes('portfolio:language'))language=language.replace('    updateSwitcherState(language);','    updateSwitcherState(language);\n    document.dispatchEvent(new CustomEvent("portfolio:language", { detail: { language } }));');
  if(!language.includes('"popstate"'))language=language.replace('  document.addEventListener("DOMContentLoaded",', '  window.addEventListener("popstate", () => applyLanguage(getInitialLanguage()));\n\n  document.addEventListener("DOMContentLoaded",');
  language=language.replace('"index.html": "朱异凡 | 服务与转型设计作品集"','"index.html": "朱异凡 | 研究驱动的跨领域设计师"').replace('"work.html": "朱异凡 | 项目"','"work.html": "朱异凡 | 全部作品"');
  if(!language.includes('"project-anxiety-market.html":'))language=language.replace('  const zhTitles = {','  const zhTitles = {\n    "project-anxiety-market.html": "朱异凡 | The Anxiety Market 焦虑市场",');
  for(const c of productCases){
    const entry=`${JSON.stringify(c.file)}: ${JSON.stringify('朱异凡 | '+c.title[1])}`;
    const existing=new RegExp(`"${c.file.replaceAll('.', '\\.')}": "[^"]*"`);
    language=existing.test(language)?language.replace(existing,entry):language.replace('  const zhTitles = {','  const zhTitles = {\n    '+entry+',');
  }
  await fs.writeFile('scripts/language.js',language);
  console.log(`Rendered homepage, All Work and research case from ${projects.length} catalogue entries.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await renderPortfolio();

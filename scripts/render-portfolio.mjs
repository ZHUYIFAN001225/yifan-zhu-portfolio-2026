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
    <nav aria-label="Primary navigation"><a href="work.html">${t('All Work','全部作品')}</a><a href="practice.html">${t('Films & Tools','影像与工具')}</a><a href="about.html">About</a><a class="v3-contact-link" href="mailto:zhuyifan001225@gmail.com" aria-label="${t('Email Yifan Zhu','发邮件给朱一帆')}"><span class="v3-contact-label">${t('Let’s talk','聊聊合作')}</span><svg class="v3-mail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.5"/></svg></a><button class="v3-theme-toggle" type="button" data-theme-toggle aria-label="${t('Switch to dark mode','切换到深色模式')}"><span class="v3-theme-label">${t('Dark','深色')}</span></button></nav></header>`;
const footer = () => `<footer class="site-footer v3-footer"><div><a href="index.html">Yifan Zhu</a><p>${t('Research-led Multidisciplinary Designer','研究驱动的跨领域设计师')}</p></div><a href="mailto:zhuyifan001225@gmail.com">zhuyifan001225@gmail.com</a><div class="v3-footer-social"><a href="https://www.douyin.com/video/7652021976073058661" target="_blank" rel="noopener noreferrer">Douyin</a><a href="https://xhslink.com/m/AZhAMj7fpc7" target="_blank" rel="noopener noreferrer">${t('Xiaohongshu / RED','小红书 / RED')}</a><a href="https://b23.tv/DQqusXX" target="_blank" rel="noopener noreferrer">Bilibili</a><a href="https://boywithdoughnut.huotan.net/" target="_blank" rel="noopener noreferrer">${t('Resource Website','资源网站')}</a></div></footer>`;
function card(project,index) {
  const tones={'beauty-marketplace':['#ddd3e2','#3e3047'],'salon-booking':['#cedbd2','#263e32'],'ear-shield':['#cbdde7','#243d50'],'anxiety-market':['#dce3ed','#35445a'],'biodiversity-clock':['#dfe5be','#414b2f'],seedwalkers:['#d2dfc7','#354a30'],'machine-mapping':['#d8cce9','#433157'],scone:['#ead9bd','#57412c'],'cross-culture':['#ead3c2','#54382b'],'resource-platform':['#d0d9e1','#324654']};
  const tone=tones[project.id]||['#ddd9d0','#34363b'];
  return `<article class="v3-card${project.video?' v3-card--video':' v3-card--still'}${project.demo?' v3-card--product':''}" style="--project-tone:${tone[0]};--project-ink:${tone[1]}" data-project="${project.id}" data-categories="${project.categories.join(' ')}"><div class="v3-card-inner">
    <div class="v3-media-wrap"><a class="v3-media v3-media--${project.shape}" data-case-link href="${project.href}" aria-label="${pair(project.title)}">
      ${project.demo?'<span class="v3-product-cover-stack">':''}<img src="${project.cover}" alt="${pair(project.title)}" ${index<3?'fetchpriority="high"':'loading="lazy"'} decoding="async" />${project.demo?`<img src="assets/v3/products/${project.demo==='beauty'?'beauty-creator':'booking-admin'}.jpg" alt="${t(project.demo==='beauty'?'Creator view':'Shared shop diary',project.demo==='beauty'?'创作者视角':'店铺共享排期')}" loading="lazy" decoding="async" /></span>`:''}
      ${project.preview ? `<video class="v3-hover-video" data-preview="${project.preview}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>`:''}
      ${!project.video?`<span class="v3-hover-summary" aria-hidden="true">${pair(project.subtitle)}</span>`:''}
      <span class="v3-media-label">${pair(project.kind)}</span><span class="v3-media-arrow" aria-hidden="true">↗</span></a>
      ${project.video?`<button class="v3-play" type="button" data-play="${project.id}" aria-label="${t('Play video: '+project.title.en,'播放视频：'+project.title.zh)}">${t('Play','播放')} <span translate="no">${project.duration}</span></button>`:''}</div>
    <div class="v3-card-info"><div class="v3-card-status ${project.status.en==='Released product'?'v3-card-status--live':''}">${pair(project.status)}</div>
      <h3><a data-case-link href="${project.href}">${pair(project.title)}</a></h3><p>${pair(project.subtitle)}</p>
      ${project.demo?`<a class="v3-demo-card-link" data-case-link href="${project.href}#interactive-demo">${t('See prototype flow','查看原型流程')} ↗</a>`:''}<div class="v3-card-tags">${project.tags.map(pair).map(s=>`<span>${s}</span>`).join('')}</div>
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
  <section class="v3-public"><div><p class="v3-nav-label">${t('A public creative practice','面向公众的创作实践')}</p><h2>${t('Made to be shared.','让创作被分享。')}</h2><a href="resource-platform.html">${t('View the platform evidence','查看平台实践证据')} ↗</a></div><div class="v3-public-metrics"><a href="https://www.douyin.com/video/7652021976073058661" target="_blank" rel="noopener noreferrer"><strong>381K+</strong><span>${t('views on one original Blender reel','单条原创 Blender 短片播放量')}</span><small>${t('54K+ likes · Douyin','5.4 万+点赞 · 抖音')}</small></a><a href="https://b23.tv/DQqusXX" target="_blank" rel="noopener noreferrer"><strong>141K+</strong><span>${t('Bilibili views','Bilibili 播放量')}</span></a><a href="https://xhslink.com/m/AZhAMj7fpc7" target="_blank" rel="noopener noreferrer"><strong>11.6K</strong><span>${t('likes & collects on RED','小红书点赞与收藏')}</span></a><a href="resource-platform.html"><strong>1.1K+</strong><span>${t('resource downloads / claims','资源下载 / 领取')}</span><small>${t('460+ resource users','460+ 资源用户')}</small></a></div></section>`;
}
function document(title,body,pageClass='') { return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="description" content="Yifan Zhu — Research-led Multidisciplinary Designer. Explore digital products, UX, 3D, AI, motion, creative technology and service design." /><title>${title}</title><meta name="theme-color" content="#f6f5f1" /><script src="scripts/theme.js"></script><link rel="stylesheet" href="styles.css" /><link rel="stylesheet" href="v3.css" /><link rel="stylesheet" href="themes.css" /></head><body class="${pageClass}">${header()}<main id="main">${body}</main>${footer()}<script src="scripts/language.js" defer></script><script src="scripts/v3-site.js" defer></script>${pageClass?'\n<script type="module" src="scripts/gallery.mjs"></script>':''}</body></html>\n`.replace(/[ \t]+$/gm,''); }
function anxiety() {
  const section = (label,title,body) => `<section class="case-section"><div class="case-label">${t(...label)}</div><div class="case-content"><h2>${t(...title)}</h2>${body}</div></section>`;
  const figure = (file,alt,caption) => `<figure class="v3-evidence"><img src="assets/v3/${file}.jpg" alt="${t(...alt)}" loading="lazy" /><figcaption>${t(...caption)}</figcaption></figure>`;
  return document('Yifan Zhu | The Anxiety Market',`<article class="full-case single-project v3-anxiety"><a class="back-link" href="work.html">${t('Back to All Work','返回全部作品')}</a><section class="case-head"><div><p class="eyebrow">${t('Service & Transformation / Research in progress','服务与转型 / 研究进行中')}</p><h1>${t('The Anxiety Market','The Anxiety Market 焦虑市场')}</h1><p>${t('How might support help Chinese international students navigate the transition from study to graduate employment in the UK?','支持服务如何帮助在英中国留学生应对从学习走向毕业求职的过渡？')}</p><span class="v3-research-status">${t('Exploratory research · not a launched service','探索性研究 · 非已发布服务')}</span></div><img src="assets/v3/anxiety-map.jpg" alt="${t('Existing stakeholder service system map','现有利益相关者服务系统地图')}" /></section>
    ${section(['The question','研究问题'],['When uncertainty becomes a service problem.','当不确定性成为服务问题。'],`<p>${t('This transformation design project explores how information uncertainty, comparison, administrative overload and fragmented support shape the transition from final study to graduate job seeking.','这一转型设计项目探索信息不确定、比较、行政负担与支持碎片化，如何影响从学业末期走向毕业求职的过程。')}</p><p>${t('The inquiry asks what trustworthy support should provide. It does not assume that all paid career services are harmful.','研究关注可信赖的支持应提供什么，并不预设所有付费求职服务都有害。')}</p>`)}
    ${section(['Research','研究'],['From conversations to patterns.','从对话走向模式。'],`<p>${t('The source research includes six anonymised open-narrative interviews. Participant evidence is kept separate from researcher autoethnography, then synthesised into shared patterns and an emotion-led journey map.','原始研究包含六次匿名开放叙事访谈，将参与者证据与研究者自我民族志区分，再综合为共性模式与情绪导向的旅程地图。')}</p>${figure('anxiety-patterns',['Synthesis of individual stories into shared patterns','将个体故事综合为共同模式'],['Original research synthesis: uncertainty, pressure and support gaps.','原始研究综合：不确定性、压力与支持缺口。'])}${figure('anxiety-journey',['Emotion-led international student journey map','情绪导向的国际学生旅程地图'],['The transition is examined as a sequence of experiences, rather than a single job-search task.','将过渡理解为一系列连续体验，而非单一求职任务。'])}`)}
    ${section(['Systems framing','系统框架'],['Looking beyond the individual.','从个人体验走向系统。'],`<p>${t('Stakeholder mapping connects students, institutions, information sources and commercial support. Relationship breakdowns become starting points for opportunity areas, rather than proof of a finished solution.','利益相关者地图连接学生、机构、信息来源与商业支持。关系断点被用来发现机会领域，而非证明某个最终方案。')}</p>${figure('anxiety-opportunities',['Relationship breakdowns and opportunity areas','关系断点与机会领域'],['Original systems map and opportunity framing.','原始系统地图与机会定义。'])}`)}
    ${section(['Current status','当前状态'],['A direction for further testing.','有待进一步测试的方向。'],`<p>${t('An exploratory hypothesis is that, under uncertainty and overload, commercial support can feel like relief. Further validation is needed. The work currently presents research, systems framing and an initial prototype direction; no commercial launch, measured impact or validated service outcome is claimed.','探索性假设是：在不确定与负担过重的情境下，商业支持可能被体验为一种缓解。这仍需要验证。当前展示研究、系统框架与初步原型方向，不宣称商业发布、已量化影响或已验证的服务结果。')}</p><ul class="tag-list"><li>${t('User Research','用户研究')}</li><li>${t('Problem Framing','问题定义')}</li><li>${t('Systems Thinking','系统思维')}</li><li>${t('Experience Design','体验设计')}</li></ul>`)}
    <nav class="project-nav"><a href="project-cross-culture.html">${t('Cross-Culture Icebreaker','跨文化破冰包')}</a><a class="back-link" href="work.html">${t('Back to All Work','返回全部作品')}</a></nav></article>`);
}
export async function renderPortfolio() {
  for(const key of Object.keys(dictionary))delete dictionary[key];
  const home = `<section class="v3-hero"><div><p class="v3-eyebrow">${t('Research-led Multidisciplinary Designer','研究驱动的跨领域设计师')}</p><h1>${t('Research-led.','以研究为起点。')}<br><span>${t('Made tangible.','让想法可体验。')}</span></h1></div><div class="v3-hero-note"><p>${t('I turn complex questions into experiences you can see, use and test.','我将复杂的问题转化为可看见、可使用、可测试的体验。')}</p><span>${t('Products. Moving images. Systems.','产品、动态影像与系统。')}</span></div></section>`;
  const work = `<section class="v3-hero v3-hero--work"><div><p class="v3-eyebrow">${t('The work of Yifan Zhu','朱一帆的设计实践')}</p><h1>${t('Different disciplines.','跨越不同领域。')}<br><span>${t('One curious mind.','始于同一份好奇。')}</span></h1></div><div class="v3-hero-note"><p>${t('Find the perspective that fits your team.','找到适合你的团队的设计视角。')}</p><span>${t('Explore a collection. Open the full story.','按方向浏览，深入完整案例。')}</span></div></section>`;
  await fs.writeFile('index.html',document('Yifan Zhu | Research-led Multidisciplinary Designer',home+selected()+approach(),'v3-index'));
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
  language=language.replace(/"practice.html": "[^"]*"/, '"practice.html": "朱一帆 | 影像与创意工具"');
  for(const [en,zh] of Object.entries(dictionary)) dictionary[en+' ↗']=zh+' ↗';
  const addition=`  // V3 translations start\n  Object.assign(zh, ${JSON.stringify(dictionary,null,2)});\n  // V3 translations end\n\n`;
  if(language.includes('// V3 translations start'))language=language.replace(/  \/\/ V3 translations start[\s\S]*?  \/\/ V3 translations end\n\n/,addition);
  else language=language.replace('  const zhTitles',addition+'  const zhTitles');
  if(!language.includes('portfolio:language'))language=language.replace('    updateSwitcherState(language);','    updateSwitcherState(language);\n    document.dispatchEvent(new CustomEvent("portfolio:language", { detail: { language } }));');
  if(!language.includes('"popstate"'))language=language.replace('  document.addEventListener("DOMContentLoaded",', '  window.addEventListener("popstate", () => applyLanguage(getInitialLanguage()));\n\n  document.addEventListener("DOMContentLoaded",');
  language=language.replace('"index.html": "朱一帆 | 服务与转型设计作品集"','"index.html": "朱一帆 | 研究驱动的跨领域设计师"').replace('"work.html": "朱一帆 | 项目"','"work.html": "朱一帆 | 全部作品"');
  if(!language.includes('"project-anxiety-market.html":'))language=language.replace('  const zhTitles = {','  const zhTitles = {\n    "project-anxiety-market.html": "朱一帆 | The Anxiety Market 焦虑市场",');
  for(const c of productCases){
    const entry=`${JSON.stringify(c.file)}: ${JSON.stringify('朱一帆 | '+c.title[1])}`;
    const existing=new RegExp(`"${c.file.replaceAll('.', '\\.')}": "[^"]*"`);
    language=existing.test(language)?language.replace(existing,entry):language.replace('  const zhTitles = {','  const zhTitles = {\n    '+entry+',');
  }
  await fs.writeFile('scripts/language.js',language);
  console.log(`Rendered homepage, All Work and research case from ${projects.length} catalogue entries.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await renderPortfolio();

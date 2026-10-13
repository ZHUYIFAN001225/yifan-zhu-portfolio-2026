// Uses the same titles and descriptions as All Work and the video viewer.
export const resourceCopy = [
  ['Home / Practice / Resource Platform','Home / Films & Tools / Resource Platform','首页 / 影像与工具 / 资源平台'],
  ['Public Design-Learning Platform / Digital Resource Practice','Creative Publishing / Tools & Resources','创作发布 / 工具与资源'],
  ['I built a public-facing 3D and AI-assisted creative practice across Douyin, Xiaohongshu, Bilibili and a personal resource website. The practice translates Blender, GIS, AI-assisted workflows and visual prototyping processes into public tutorials, visual work, design-process content and reusable project resources.','I create and publish original 3D imagery, Blender tutorials and reusable production resources across Douyin, Xiaohongshu, Bilibili and my resource website. My work connects visual production, workflow development, technical communication and resource distribution.','通过抖音、小红书、Bilibili 和个人资源网站，创作并发布原创三维影像、Blender 教程与可复用制作资源，将视觉制作、工作流开发、技术传播和资源分发连接起来。'],
  ['Original Blender visual practice','Original Blender films and environments','原创 Blender 影像与场景作品'],
  ['A self-initiated showcase of visual work created in Blender over two years.','Original Blender films and environments developed across two years of independent production.','在两年独立创作中完成的原创 Blender 影像与场景作品。'],
  ['Blender, GIS, AI-assisted workflows, visual prototyping and reusable learning files','Blender, GIS, AI-assisted workflows, visual prototyping and reusable project files','Blender、GIS、AI 辅助工作流、视觉原型与可复用工程文件'],
  ['Measurable engagement around 3D and AI-assisted learning resources.','Original work and production resources reaching a public audience.','面向真实受众的原创作品与制作资源。'],
  ['What this independent practice demonstrates.','Visual production, resource design and public communication.','视觉制作、资源设计与公众传播。'],
  ['Independent initiative','Creative platform development','创作平台建设'],
  ['Building measurable public-facing practice outside a traditional internship or company project.','Developing and maintaining a public platform for original work, production resources and creator feedback.','建设并维护面向公众的创作平台，连接原创作品、制作资源与创作者反馈。'],
  ['A public-facing design practice with evidence beyond academic work.','Original visual work with measurable audience reach.','具有可衡量传播表现的原创视觉作品。'],
  ['Verify the public platform work.','Explore published work and production resources.','查看已发布作品与制作资源。']
];

export function renderVisualWork(t,document,projects){
  const pair=value=>t(value.en,value.zh);
  const project=id=>projects.find(item=>item.id===id);
  const externalLink=item=>item.external?`<a class="v3-demo-card-link" href="${item.external}" target="_blank" rel="noopener noreferrer">${pair(item.externalLabel)} ↗</a>`:'';
  const film=id=>{
    const item=project(id),anchor=item.href.split('#')[1];
    return `<article id="${anchor}"><video poster="${item.cover}" controls playsinline preload="metadata" src="${item.webVideo||item.video}"></video><div><span>${pair(item.title)}</span><p>${pair(item.subtitle)}</p>${externalLink(item)}</div></article>`;
  };
  return document('Yifan Zhu | Films & Creative Tools',`
    <section class="practice-hero">
      <a class="back-link" href="index.html">${t('Home / Films & Tools','首页 / 影像与工具')}</a>
      <p class="eyebrow">${t('3D Environments / Motion / Creative Technology','3D 环境设计 / 动态影像 / 创意技术')}</p>
      <h1>${t('Worlds in motion. Tools for creation.','构建视觉世界，拓展创作方式。')}</h1>
      <p>${t('Original 3D environments, cinematic sequences and digital experiences. My work combines modelling, materials, lighting and camera design with AI-assisted production and reusable creative tools.','从原创三维场景、动画镜头到数字体验，将建模、材质、灯光与镜头设计，连接 AI 辅助制作和可复用的创作工具。')}</p>
    </section>
    <section class="section archive-index" aria-labelledby="archive-title">
      <div class="section-kicker">${t('Selected visual work','精选视觉作品')}</div>
      <h2 id="archive-title">${t('3D environments. Motion. Digital experiences.','三维场景、动态影像与数字体验。')}</h2>
      <div class="practice-evidence-grid" aria-label="${t('Selected films and digital experiences','精选影像与数字体验')}">
        <a href="#blender-visual-reel"><video poster="${project('blender-reel').cover}" muted playsinline preload="metadata" src="${project('blender-reel').webVideo}"></video><span>${t('3D Environments & Cinematography','3D 环境与镜头设计')}</span></a>
        <a href="#naturalis-web-experience"><video poster="${project('web-prototype').cover}" muted playsinline preload="metadata" src="${project('web-prototype').webVideo}"></video><span>${pair(project('web-prototype').title)}</span></a>
        <a href="#hyper3d-motion"><video poster="${project('ai-motion').cover}" muted playsinline preload="metadata" src="${project('ai-motion').webVideo}"></video><span>${pair(project('ai-motion').title)}</span></a>
        <a href="#resource-platform"><img src="assets/v3/platform-cover.webp" alt="${t('Original 3D films and creative resources','原创三维影像与创作资源')}" loading="lazy" decoding="async"><span>${t('Creative Tools & Resources','创作工具与资源')}</span></a>
      </div>
      <div class="archive-grid">
        <a href="#blender-visual-reel"><span>01</span><h3>${t('3D Environments & Cinematography','3D 环境与镜头设计')}</h3><p>${t('Scene construction, materials, atmospheric lighting and camera animation.','场景构建、材质设计、氛围灯光与镜头动画。')}</p></a>
        <a href="#ai-creative-pipeline"><span>02</span><h3>${t('AI-assisted Motion & Web Experiences','AI 辅助动态影像与网页体验')}</h3><p>${t('Character animation, visual direction and interactive web prototyping.','角色动画、视觉方向与交互网页原型。')}</p></a>
        <a href="#resource-platform"><span>03</span><h3>${t('Creative Tools & Resources','创作工具与资源')}</h3><p>${t('Blender tools, production workflows and publicly available project files.','Blender 工具、制作工作流与公开工程资源。')}</p></a>
      </div>
    </section>
    <article class="practice-entry" id="blender-visual-reel">
      <div class="practice-entry-copy">
        <p class="eyebrow">${t('01 / 3D Environments & Cinematography','01 / 3D 环境与镜头设计')}</p>
        <h2>${t('Original worlds, built and animated in Blender.','在 Blender 中构建并演绎原创世界。')}</h2>
        <p>${t('Cyberpunk architecture, floating landscapes and spacecraft flight sequences. I use scene construction, material design, atmospheric lighting and camera movement to establish scale, depth and a distinct visual identity.','赛博朋克建筑、浮空景观与飞行器镜头。通过场景构建、材质设计、氛围灯光和镜头运动，塑造空间尺度、景深与鲜明的视觉特征。')}</p>
        <ul class="tag-list"><li>Blender</li><li>${t('Environment design','环境设计')}</li><li>${t('Lighting & materials','灯光与材质')}</li><li>${t('Camera animation','镜头动画')}</li></ul>
      </div>
      <div class="practice-video-grid">${['blender-reel','modeling-01','modeling-02','modeling-03'].map(film).join('')}</div>
    </article>
    <article class="practice-entry" id="ai-creative-pipeline">
      <div class="practice-entry-copy">
        <p class="eyebrow">${t('02 / AI-assisted Motion & Web Experiences','02 / AI 辅助动态影像与网页体验')}</p>
        <h2>${t('From visual direction to a working experience.','从视觉方向到可体验的成果。')}</h2>
        <p>${t('Naturalis brings botanical imagery and editorial typography into an immersive web prototype. The Hyper3D collaboration applies an AI-supported pipeline to character creation and animation. Each project shows a different application of visual direction and rapid production.','Naturalis 将植物影像与编辑式排版融入沉浸式网页原型；Hyper3D 合作通过 AI 辅助流程完成角色生成与动画。两项作品分别呈现视觉方向在交互体验和动态制作中的应用。')}</p>
        <ul class="tag-list"><li>${t('Web experience design','网页体验设计')}</li><li>${t('AI-assisted production','AI 辅助制作')}</li><li>${t('Character animation','角色动画')}</li><li>${t('Visual direction','视觉方向')}</li></ul>
      </div>
      <div class="practice-video-grid">${['web-prototype','ai-motion'].map(film).join('')}</div>
    </article>
    <section class="practice-entry" id="resource-platform">
      <div class="practice-entry-copy">
        <p class="eyebrow">${t('03 / Creative Tools & Resources','03 / 创作工具与资源')}</p>
        <h2>${t('Creative work with a public audience.','让创作走向真实受众。')}</h2>
        <p>${t('I publish original films, Blender workflows and reusable project resources across Douyin, Bilibili, Xiaohongshu and my resource platform. This connects visual production with tutorial development, resource distribution and creator feedback.','通过抖音、Bilibili、小红书和个人资源平台发布原创影像、Blender 工作流与可复用工程，将视觉制作连接教程开发、资源分发和创作者反馈。')}</p>
        <ul class="tag-list"><li>${t('Original films','原创影像')}</li><li>${t('Blender tools','Blender 工具')}</li><li>${t('Workflow publishing','工作流分享')}</li><li>${t('Creative resources','创作资源')}</li></ul>
      </div>
      <div class="metrics-grid compact-metrics">
        <a href="https://www.douyin.com/video/7652021976073058661" target="_blank" rel="noopener noreferrer"><strong>381K+ views</strong><span>${t('54K+ likes on one original Douyin Blender visual reel','单条原创 Blender 影像获得 5.4 万+点赞')}</span><em>${t('View Douyin work','查看抖音作品')}</em></a>
        <a href="https://xhslink.com/m/AZhAMj7fpc7" target="_blank" rel="noopener noreferrer"><strong>11.6K</strong><span>${t('likes & collects on Xiaohongshu / RED','小红书点赞与收藏')}</span><em>${t('Open RED profile','打开小红书主页')}</em></a>
        <a href="https://b23.tv/DQqusXX" target="_blank" rel="noopener noreferrer"><strong>141K+</strong><span>${t('total views on Bilibili','Bilibili 总播放量')}</span><em>${t('Open Bilibili','打开 Bilibili')}</em></a>
        <a href="https://boywithdoughnut.huotan.net/" target="_blank" rel="noopener noreferrer"><strong>1.1K+</strong><span>${t('free resource downloads / claims','免费资源下载 / 领取')}</span><em>${t('Visit resource website','访问资源网站')}</em></a>
      </div>
      <a class="primary-cta" href="resource-platform.html">${t('Explore the creative platform','了解创作平台')} ↗</a>
    </section>`);
}

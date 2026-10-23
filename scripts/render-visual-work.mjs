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
      <p class="eyebrow">${t('3D Environments / AI Video / Motion / Creative Technology','3D 环境设计 / AI 视频 / 动态影像 / 创意技术')}</p>
      <h1>${t('Worlds in motion. Tools for creation.','构建视觉世界，拓展创作方式。')}</h1>
      <p>${t('Original 3D environments, cinematic sequences, AI video and digital experiences. My work combines modelling, materials, lighting and camera design with AI-assisted production and reusable creative tools.','从原创三维场景、动画镜头、AI 视频到数字体验，将建模、材质、灯光与镜头设计，连接 AI 辅助制作和可复用的创作工具。')}</p>
    </section>
    <section class="section archive-index" aria-labelledby="archive-title">
      <div class="section-kicker">${t('Selected visual work','精选视觉作品')}</div>
      <h2 id="archive-title">${t('3D environments. Motion. Digital experiences.','三维场景、动态影像与数字体验。')}</h2>
      <div class="practice-evidence-grid" aria-label="${t('Selected films and digital experiences','精选影像与数字体验')}">
        <a href="#blender-visual-reel"><video poster="${project('blender-reel').cover}" muted playsinline preload="metadata" src="${project('blender-reel').webVideo}"></video><span>${t('3D Environments & Cinematography','3D 环境与镜头设计')}</span></a>
        <a href="#ai-video-production"><video poster="${project('ai-video-restyle').cover}" muted playsinline preload="metadata" src="${project('ai-video-restyle').webVideo}"></video><span>${t('AI Video Production','AI 视频制作')}</span></a>
        <a href="#hyper3d-motion"><video poster="${project('ai-motion').cover}" muted playsinline preload="metadata" src="${project('ai-motion').webVideo}"></video><span>${pair(project('ai-motion').title)}</span></a>
        <a href="#resource-platform"><img src="assets/v3/platform-cover.webp" alt="${t('Original 3D films and creative resources','原创三维影像与创作资源')}" loading="lazy" decoding="async"><span>${t('Creative Tools & Resources','创作工具与资源')}</span></a>
      </div>
      <div class="archive-grid">
        <a href="#blender-visual-reel"><span>01</span><h3>${t('3D Environments & Cinematography','3D 环境与镜头设计')}</h3><p>${t('Scene construction, materials, atmospheric lighting and camera animation.','场景构建、材质设计、氛围灯光与镜头动画。')}</p></a>
        <a href="#ai-video-production"><span>02</span><h3>${t('AI Video Production','AI 视频制作')}</h3><p>${t('Motion Transfer, look direction, shot continuity and finishing edits.','动作迁移、风格方向、镜头连续性与后期剪辑。')}</p></a>
        <a href="#ai-creative-pipeline"><span>03</span><h3>${t('AI-assisted Motion & Web Experiences','AI 辅助动态影像与网页体验')}</h3><p>${t('Character animation, visual direction and interactive web prototyping.','角色动画、视觉方向与交互网页原型。')}</p></a>
        <a href="#resource-platform"><span>04</span><h3>${t('Creative Tools & Resources','创作工具与资源')}</h3><p>${t('Blender tools, production workflows and publicly available project files.','Blender 工具、制作工作流与公开工程资源。')}</p></a>
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
    <article class="practice-entry" id="ai-video-production">
      <div class="practice-entry-copy">
        <p class="eyebrow">${t('02 / AI Video Production','02 / AI 视频制作')}</p>
        <h2>${t('One live-action scene, re-directed as a character film.','同一场真人实拍，重新导演成角色短片。')}</h2>
        <p>${t('A new direction in my practice: using AI video generation as a production tool rather than a one-click effect. With Motion Transfer, the movement and camera work of a live-action poker B-roll guide a new character and visual style, while the original timing and props carry through. The work is in choosing shots, defining the look, judging each generation and editing the passes into one clean film.','这是我实践中的新方向：把 AI 视频生成当作制作工具，而不是一键特效。通过动作迁移（Motion Transfer），以一段真人扑克 B-roll 的动作和运镜为参考，替换人物与画面风格并重新生成，同时保留原片的节奏与道具。真正的工作在于挑选镜头、确定风格、判断每一次生成的质量，并把多段生成剪辑成一部干净完整的短片。')}</p>
        <ul class="tag-list"><li>${t('Higgsfield Genjutsu','Higgsfield Genjutsu')}</li><li>${t('Motion Transfer','动作迁移')}</li><li>${t('Look development','风格设定')}</li><li>${t('Editing & clean-up','剪辑与修帧')}</li></ul>
      </div>
      <div class="ai-video-feature">
        <article id="${project('ai-video-restyle').href.split('#')[1]}" class="ai-video-film"><video poster="${project('ai-video-restyle').cover}" controls playsinline preload="metadata" src="${project('ai-video-restyle').webVideo}"></video><div><span>${pair(project('ai-video-restyle').title)}</span><p>${pair(project('ai-video-restyle').subtitle)}</p><p class="ai-video-credit">${t('Motion and camera reference:','动作与运镜参考：')} <a href="https://www.youtube.com/watch?v=K4P3DI6cqxo" target="_blank" rel="noopener noreferrer">${t('Peter Lindgren — A CINEMATIC POKER B ROLL','Peter Lindgren — A CINEMATIC POKER B ROLL')} ↗</a></p><a class="v3-demo-card-link" href="${project('ai-video-restyle').video}" target="_blank" rel="noopener">${t('Watch in 1080p','观看 1080p 版本')} ↗</a></div></article>
      </div>
      <ol class="ai-video-process" aria-label="${t('Production process','制作流程')}">
        <li><span>01</span><h3>${t('Select the source','选择素材')}</h3><p>${t('A cinematic poker B-roll with strong close-ups, hand actions and controlled lighting, which give the model clear motion to follow.','选择特写丰富、手部动作清晰、灯光可控的电影感扑克 B-roll，为模型提供明确的运动参照。')}</p></li>
        <li><span>02</span><h3>${t('Define the look','确定风格')}</h3><p>${t('A stylised character with Egyptian-inspired gold jewellery, set against a green table and purple-magenta shadows.','风格化角色、埃及元素金饰，搭配绿色牌桌与紫红色暗部光影。')}</p></li>
        <li><span>03</span><h3>${t('Generate in passes','分段生成')}</h3><p>${t('Motion Transfer in Higgsfield Genjutsu, in two passes (25 s and 21 s). Each pass was tested at 420p first and only rendered at 1080p once it worked, to avoid wasted generations.','在 Higgsfield Genjutsu 中用动作迁移分两段生成（25 秒与 21 秒）。每段先用 420p 测试，满意后再输出 1080p，减少不必要的消耗。')}</p></li>
        <li><span>04</span><h3>${t('Edit & clean up','剪辑与修帧')}</h3><p>${t('The passes are cut into one 46-second film, with flickering frames removed and a high-quality 1080p export.','将两段剪成一部 46 秒短片，删除闪烁帧，并以 1080p 高画质导出。')}</p></li>
      </ol>
    </article>
    <article class="practice-entry" id="ai-creative-pipeline">
      <div class="practice-entry-copy">
        <p class="eyebrow">${t('03 / AI-assisted Motion & Web Experiences','03 / AI 辅助动态影像与网页体验')}</p>
        <h2>${t('From visual direction to a working experience.','从视觉方向到可体验的成果。')}</h2>
        <p>${t('Naturalis brings botanical imagery and editorial typography into an immersive web prototype. The Hyper3D collaboration applies an AI-supported pipeline to character creation and animation. Each project shows a different application of visual direction and rapid production.','Naturalis 将植物影像与编辑式排版融入沉浸式网页原型；Hyper3D 合作通过 AI 辅助流程完成角色生成与动画。两项作品分别呈现视觉方向在交互体验和动态制作中的应用。')}</p>
        <ul class="tag-list"><li>${t('Web experience design','网页体验设计')}</li><li>${t('AI-assisted production','AI 辅助制作')}</li><li>${t('Character animation','角色动画')}</li><li>${t('Visual direction','视觉方向')}</li></ul>
      </div>
      <div class="practice-video-grid">${['web-prototype','ai-motion'].map(film).join('')}</div>
    </article>
    <section class="practice-entry" id="resource-platform">
      <div class="practice-entry-copy">
        <p class="eyebrow">${t('04 / Creative Tools & Resources','04 / 创作工具与资源')}</p>
        <h2>${t('Creative work with a public audience.','让创作走向真实受众。')}</h2>
        <p>${t('I publish original films, Blender workflows and reusable project resources across Douyin, Bilibili, Xiaohongshu and my resource platform. This connects visual production with tutorial development, resource distribution and creator feedback.','通过抖音、Bilibili、小红书和个人资源平台发布原创影像、Blender 工作流与可复用工程，将视觉制作连接教程开发、资源分发和创作者反馈。')}</p>
        <ul class="tag-list"><li>${t('Original films','原创影像')}</li><li>${t('Blender tools','Blender 工具')}</li><li>${t('Workflow publishing','工作流分享')}</li><li>${t('Creative resources','创作资源')}</li></ul>
      </div>
      <div class="metrics-grid compact-metrics">
        <a href="https://www.douyin.com/user/MS4wLjABAAAA_lHmWTuM_a1k_09EF1ewxBH9vU3K2tYWuNJe-Mk7H_0" target="_blank" rel="noopener noreferrer"><strong>381K+ views</strong><span>${t('54K+ likes on one original Douyin Blender visual reel','单条原创 Blender 影像获得 5.4 万+点赞')}</span><em>${t('Open Douyin profile','打开抖音主页')}</em></a>
        <a href="https://xhslink.com/m/AZhAMj7fpc7" target="_blank" rel="noopener noreferrer"><strong>11.6K</strong><span>${t('likes & collects on Xiaohongshu / RED','小红书点赞与收藏')}</span><em>${t('Open RED profile','打开小红书主页')}</em></a>
        <a href="https://b23.tv/DQqusXX" target="_blank" rel="noopener noreferrer"><strong>141K+</strong><span>${t('total views on Bilibili','Bilibili 总播放量')}</span><em>${t('Open Bilibili','打开 Bilibili')}</em></a>
        <a href="https://boywithdoughnut.huotan.net/" target="_blank" rel="noopener noreferrer"><strong>1.1K+</strong><span>${t('free resource downloads / claims','免费资源下载 / 领取')}</span><em>${t('Visit resource website','访问资源网站')}</em></a>
      </div>
      <a class="primary-cta" href="resource-platform.html">${t('Explore the creative platform','了解创作平台')} ↗</a>
    </section>`);
}

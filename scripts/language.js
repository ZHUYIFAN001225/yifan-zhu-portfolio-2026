(() => {
  const LANGUAGE_KEY = "portfolio-language";
  const CHINESE_HOST_HINTS = ["netlify.app"];
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "VIDEO", "AUDIO", "CANVAS"]);
  const originalText = new WeakMap();
  const originalTitle = document.title;

  const zh = {
    "Yifan Zhu": "朱一帆",
    "YIFAN ZHU": "朱一帆",
    "Work": "项目",
    "Practice": "实践",
    "About": "关于",
    "Contact": "联系",
    "Portfolio": "作品集",
    "Home / About": "首页 / 关于",
    "Home / Practice": "首页 / 实践",
    "Home / Work": "首页 / 项目",
    "Home / Practice / Resource Platform": "首页 / 实践 / 资源平台",
    "Project Hub": "项目导航",
    "All Projects": "全部项目",
    "Choose a Direction": "选择浏览方向",
    "Featured Case Studies": "精选案例",
    "Public Practice Metrics": "公开实践数据",
    "Skills & Methods": "技能与方法",
    "Profile": "个人简介",
    "How I Work": "我的工作方式",
    "CV": "简历",
    "Public Metrics": "公开数据",
    "Challenge": "挑战",
    "Process": "过程",
    "Evidence": "证据",
    "Outcome": "结果",
    "External Links": "外部链接",
    "Practice Structure": "实践结构",
    "All": "全部",
    "Service & Transformation": "服务与转型",
    "Creative Technology": "创意技术",
    "Cultural / Education": "文化 / 教育",
    "Social / Public Innovation": "社会 / 公共创新",
    "Speculative / Critical Interaction": "思辨 / 批判性交互",
    "Service Design / Creative Technology / 3D + AI": "服务设计 / 创意技术 / 3D + AI",
    "Service Systems": "服务系统",
    "Creative Technology": "创意技术",
    "Cultural Learning": "文化学习",
    "Service & Transformation Design": "服务与转型设计",
    "Creative Technology / 3D / AI": "创意技术 / 3D / AI",
    "Cultural & Educational Experience": "文化与教育体验",
    "View Service & Transformation Work": "查看服务与转型项目",
    "View Creative Technology Practice": "查看创意技术实践",
    "View Cultural Experience Projects": "查看文化体验项目",
    "Open all work": "查看全部项目",
    "View evidence page": "查看证据页面",
    "Open full evidence page": "打开完整证据页面",
    "Open RED profile": "打开小红书主页",
    "Open Bilibili profile": "打开 Bilibili 主页",
    "Open Bilibili": "打开 Bilibili",
    "View Douyin work": "查看抖音作品",
    "Visit resource website": "访问资源网站",
    "View resource platform": "查看资源平台",
    "Request CV": "索取简历",
    "View Case Study": "查看案例",
    "View Evidence Page": "查看证据页",
    "View Xiaohongshu / RED": "查看小红书 / RED",
    "View Bilibili": "查看 Bilibili",
    "View Douyin": "查看抖音",
    "Visit Resource Website": "访问资源网站",
    "Resource Website": "资源网站",
    "Xiaohongshu / RED": "小红书 / RED",
    "Bilibili": "Bilibili",
    "Douyin": "抖音",

    "Service & Transformation Designer working with Creative Technology, 3D Visualisation and AI-assisted Prototyping.": "服务与转型设计师，结合创意技术、3D 可视化和 AI 辅助原型进行设计实践。",
    "I translate complex social, cultural and ecological systems into visual, interactive and research-led experiences.": "我将复杂的社会、文化与生态系统转译为可视化、可交互、以研究为基础的体验。",
    "Start from the role, then move into project evidence.": "从求职方向进入，再查看对应的项目证据。",
    "For service design, transformation design, systems thinking and research-led innovation roles.": "适合服务设计、转型设计、系统思维和研究驱动创新方向。",
    "For creative technologist, 3D visualisation, AI-assisted prototyping and digital experience roles.": "适合创意技术、3D 可视化、AI 辅助原型和数字体验方向。",
    "For cultural experience, learning design, social innovation and public engagement roles.": "适合文化体验、学习设计、社会创新和公共参与方向。",
    "The strongest project evidence for recruiters.": "给招聘方快速判断能力的核心项目证据。",
    "Turning Scottish food heritage into an interactive learning journey about service innovation and inclusive hospitality.": "将苏格兰饮食文化转化为关于服务创新与包容性 hospitality 的互动学习旅程。",
    "A future museum-and-park experience translating ecological rhythms in Pollok Country Park into visitor action.": "一个面向未来的博物馆与公园体验，将 Pollok Country Park 的生态节律转化为游客的观察、反思与行动。",
    "A public-facing creative technology practice across Douyin, Bilibili, Xiaohongshu and a personal resource website.": "围绕抖音、Bilibili、小红书和个人资源网站展开的公开创意技术实践。",
    "Smart whale monitoring and echo enhancement, translated into an interactive public education installation.": "将鲸类声学监测与回声增强概念转译为互动公共教育装置。",
    "Public 3D / AI Design Practice": "公开 3D / AI 设计实践",
    "Alongside academic service and transformation design projects, I run a public-facing 3D and AI-assisted creative practice across Douyin, Xiaohongshu, Bilibili and a personal resource website.": "在学术服务与转型设计项目之外，我也在抖音、小红书、Bilibili 和个人资源网站上持续经营公开的 3D 与 AI 辅助创作实践。",
    "likes & collects on Xiaohongshu / RED": "小红书点赞与收藏",
    "total views on Bilibili": "Bilibili 总播放量",
    "54K+ likes on one original Blender visual reel": "单条原创 Blender 视觉短片获得 5.4 万+点赞",
    "free resource downloads / claims": "免费资源下载 / 领取",
    "resource users": "资源用户",
    "A mixed toolkit for research-led digital service work.": "用于研究驱动数字服务工作的复合工具箱。",
    "Research & Strategy": "研究与策略",
    "Desk research, field observation, stakeholder mapping, service blueprinting, systems framing and insight synthesis.": "桌面研究、田野观察、利益相关者地图、服务蓝图、系统框架与洞察综合。",
    "Experience Design": "体验设计",
    "Learning journeys, public engagement, phygital interaction, prototyping, testing and reflective iteration.": "学习旅程、公共参与、虚实融合交互、原型、测试与反思迭代。",
    "Blender, Unity, Arduino, TouchDesigner, Python, AI-assisted workflows and visual communication.": "Blender、Unity、Arduino、TouchDesigner、Python、AI 辅助流程与视觉传达。",
    "Open to service design, transformation design and creative technology opportunities.": "开放服务设计、转型设计和创意技术相关机会。",

    "Work organised by role evidence.": "按岗位能力证据组织的项目。",
    "A scannable project hub for service design, transformation design, creative technology, cultural learning and social innovation roles.": "一个方便快速浏览的项目导航，覆盖服务设计、转型设计、创意技术、文化学习和社会创新方向。",
    "Open a case study from the evidence you need.": "根据你需要看的能力证据打开对应案例。",
    "Service & Transformation / Cultural Ecology": "服务与转型 / 文化生态",
    "Cultural / Education / Service Innovation": "文化 / 教育 / 服务创新",
    "Creative Technology / Public Learning": "创意技术 / 公开学习",
    "Environmental Technology / Speculative System": "环境技术 / 思辨系统",
    "Creative Technology / Critical AI": "创意技术 / 批判性 AI",
    "Service & Transformation / Urban Biodiversity": "服务与转型 / 城市生物多样性",
    "Social / Public Innovation / Cultural Experience": "社会 / 公共创新 / 文化体验",
    "A cultural service learning prototype connecting Scottish tea culture with service innovation and inclusive hospitality.": "一个文化服务学习原型，将苏格兰茶文化与服务创新、包容性 hospitality 连接起来。",
    "A public-facing practice across Douyin, Bilibili, Xiaohongshu and a resource website for 3D, Blender and AI-assisted workflows.": "一个面向公众的实践，围绕抖音、Bilibili、小红书和资源网站发布 3D、Blender 与 AI 辅助流程内容。",
    "An acoustic monitoring and public interaction concept that makes underwater noise disruption more legible.": "一个声学监测与公共互动概念，让水下噪音干扰问题更容易被公众理解。",
    "A participatory interaction experiment using speech, image search and visualization to question colour stereotypes.": "一个使用语音、图像搜索和可视化来质疑颜色刻板印象的参与式交互实验。",
    "A city-scale AR service concept for reconnecting fragmented urban biodiversity through seed cards and public participation.": "一个城市尺度 AR 服务概念，通过种子卡片和公众参与重新连接碎片化城市生物多样性。",
    "A social pack and board-game system for helping Chinese international students connect through low-pressure interaction.": "一套社交卡包与桌游系统，帮助中国留学生通过低压力互动建立连接。",

    "Creative Technology & Visual Practice": "创意技术与视觉实践",
    "3D visualisation, AI-assisted prototyping and public learning resources.": "3D 可视化、AI 辅助原型与公开学习资源。",
    "This page collects independent visual and technical practice that sits beside my research-led case studies. It shows craft, tool fluency, public teaching output and the way I use digital workflows to make ideas easier to see and share.": "这一页汇集了我在研究型案例之外的独立视觉与技术实践，展示手工能力、工具熟练度、公开教学输出，以及我如何用数字流程让想法更容易被看见和分享。",
    "Three evidence areas for creative technology roles.": "面向创意技术岗位的三类证据。",
    "3D Visualisation / Blender Craft": "3D 可视化 / Blender 手工能力",
    "Manual modeling, material atmosphere, lighting and cinematic visual prototyping.": "手动建模、材质氛围、灯光与电影感视觉原型。",
    "AI-assisted Web & Creative Pipeline": "AI 辅助网页与创作流程",
    "AI-assisted website building, AI-generated character and animation workflows.": "AI 辅助网站搭建、AI 生成人物与动画流程。",
    "Public Learning & Resource Platform": "公开学习与资源平台",
    "Public tutorials, free resource downloads / claims and creator-platform evidence.": "公开教程、免费资源下载 / 领取与创作者平台数据证据。",
    "Codex / AI-assisted web prototype": "Codex / AI 辅助网页原型",
    "AI creative pipeline collaboration": "AI 创作流程合作",
    "Manual 3D modeling and visual prototyping.": "手动 3D 建模与视觉原型。",
    "AI-supported workflows used as prototyping material.": "将 AI 支持流程作为原型材料。",
    "Independent public practice with measurable engagement.": "有可衡量互动数据的独立公开实践。",
    "Main visual reel": "主要视觉合集",
    "Manual modeling study 01": "手动建模练习 01",
    "Manual modeling study 02": "手动建模练习 02",
    "Manual modeling study 03": "手动建模练习 03",
    "Self-made 3D modeling and visual-build evidence.": "自主完成的 3D 建模与视觉搭建证据。",
    "Additional Blender-based modeling and visual prototyping work.": "更多基于 Blender 的建模和视觉原型实践。",
    "Further production range and visual control.": "进一步展示制作范围和视觉控制能力。",
    "A personal website prototype and teaching-content showcase built through an AI-assisted workflow.": "通过 AI 辅助流程搭建的个人网站原型与教学内容展示。",
    "AI-generated character and animation workflow produced for a Hyper3D collaboration.": "为 Hyper3D 合作制作的 AI 生成人物与动画流程视频。",

    "Public Design-Learning Platform / Digital Resource Practice": "公开设计学习平台 / 数字资源实践",
    "Independent 3D & AI Resource Platform": "独立 3D 与 AI 资源平台",
    "Role": "角色",
    "Platforms": "平台",
    "Focus": "重点",
    "Output": "产出",
    "Independent creator, 3D visualisation designer, tutorial producer and resource platform operator": "独立创作者、3D 可视化设计师、教程制作人与资源平台运营者",
    "Douyin, Xiaohongshu / RED, Bilibili and personal resource website": "抖音、小红书 / RED、Bilibili 与个人资源网站",
    "Blender, GIS, AI-assisted workflows, visual prototyping and reusable learning files": "Blender、GIS、AI 辅助流程、视觉原型与可复用学习文件",
    "Tutorial videos, design-process posts, free project files and resource distribution": "教程视频、设计过程帖、免费项目文件与资源分发",
    "Measurable engagement around 3D and AI-assisted learning resources.": "围绕 3D 与 AI 辅助学习资源的可衡量互动数据。",
    "likes & collects": "点赞与收藏",
    "total views": "总播放量",
    "free digital resource downloads / claims": "免费数字资源下载 / 领取",
    "Making technical workflows easier to learn, reproduce and adapt.": "让技术流程更容易学习、复现和改造。",
    "From workflow testing to public resource distribution.": "从流程测试到公开资源分发。",
    "What this independent practice demonstrates.": "这项独立实践证明了什么。",
    "Public communication": "公开传播",
    "Reusable resource design": "可复用资源设计",
    "Creative technology fluency": "创意技术熟练度",
    "Independent initiative": "独立主动性",
    "A public-facing design practice with evidence beyond academic work.": "一个有学术项目之外证据的公开设计实践。",
    "Verify the public platform work.": "验证公开平台实践。",
    "Original Blender visual reel showcasing two years of visual work.": "展示两年视觉实践的原创 Blender 视觉短片。",
    "Visual design, Blender and AI workflow posts.": "视觉设计、Blender 与 AI 流程内容。",
    "Blender tutorials, 3D workflow videos and design-process content.": "Blender 教程、3D 流程视频和设计过程内容。",
    "Free Blender project files, 3D scene assets and workflow resources.": "免费 Blender 项目文件、3D 场景资产与工作流资源。",

    "Designing between systems, culture and creative technology.": "在系统、文化与创意技术之间进行设计。",
    "I am a service and transformation designer with a creative technology edge. My work translates complex ecological, cultural and social systems into visual, interactive and research-led experiences.": "我是一名带有创意技术背景的服务与转型设计师。我的作品将复杂的生态、文化与社会系统转译为可视化、可交互、以研究为基础的体验。",
    "Research-led framing": "研究驱动的框架搭建",
    "I use desk research, field observation, stakeholder mapping and synthesis to turn broad topics into focused design opportunities.": "我通过桌面研究、田野观察、利益相关者地图与综合分析，把宽泛主题转化为清晰的设计机会。",
    "Experience prototyping": "体验原型",
    "I build tangible, visual and interactive prototypes that make abstract systems easier to test, explain and discuss.": "我搭建实体、视觉和交互原型，让抽象系统更容易被测试、解释和讨论。",
    "Creative technology practice": "创意技术实践",
    "I use Blender, AI-assisted workflows, physical computing and web-based prototypes as tools for exploration and communication.": "我使用 Blender、AI 辅助流程、物理计算和网页原型作为探索与沟通工具。",
    "CV available upon request.": "可按需提供简历。",
    "For applications, I can share the most relevant CV version depending on whether the role focuses on service transformation, creative technology, 3D visualisation or AI-assisted prototyping.": "针对不同申请方向，我可以提供更匹配的简历版本，例如服务转型、创意技术、3D 可视化或 AI 辅助原型方向。",

    "Home / Work / Scone Through Time": "首页 / 项目 / 司康时光",
    "Cultural Service Learning Prototype": "文化服务学习原型",
    "A digital learning journey for service innovation and inclusive hospitality.": "一个面向服务创新与包容性 hospitality 的数字学习旅程。",
    "A cultural service learning prototype that uses Scottish tea culture, object-led storytelling and interactive micro-modules to help young learners connect cultural heritage with service innovation and inclusive hospitality.": "一个文化服务学习原型，通过苏格兰茶文化、物件引导叙事和互动微课程模块，帮助年轻学习者把文化遗产与服务创新、包容性 hospitality 连接起来。",
    "Scone Through Time was developed in response to a real educational and cultural learning context. The project explored how Scottish afternoon tea and scone culture could become a low-barrier learning experience for secondary, ASN and hospitality learners.": "《司康时光》回应真实的教育与文化学习语境，探索苏格兰下午茶和司康文化如何成为面向中学生、ASN 学习者与 hospitality 学生的低门槛学习体验。",
    "Project Type": "项目类型",
    "Real-world grounding": "现实语境",
    "Audience": "受众",
    "Cultural Service Learning Prototype / Educational Service Experience": "文化服务学习原型 / 教育服务体验",
    "Scottish afternoon tea and scone culture; secondary / ASN / hospitality learner needs; peer-tested classroom-style prototype.": "苏格兰下午茶与司康文化；中学 / ASN / hospitality 学习者需求；经过同伴测试的课堂式原型。",
    "Secondary school learners, ASN learners and hospitality students": "中学生、ASN 学习者与 hospitality 学生",
    "Team member; contributed to research filtering, ideation, testing, storytelling and learning experience development.": "团队成员；参与研究筛选、概念生成、测试、叙事和学习体验开发。",
    "Three stop-motion micro-learning modules, interactive learning prompts and tea bag business model simulation.": "三个定格动画微学习模块、互动学习提示和茶包商业模式模拟。",
    "In this case study": "本案例结构",
    "A research-to-learning pivot.": "从研究转向学习体验的关键转折。",
    "01 Context & Challenge": "01 背景与挑战",
    "02 Research Filtering": "02 研究筛选",
    "03 Ideation & Testing": "03 构思与测试",
    "04 Final Learning Experience": "04 最终学习体验",
    "05 Potential Educational Value": "05 潜在教育价值",
    "Everyday cultural objects became a way into service learning.": "日常文化物件成为进入服务学习的入口。",
    "The challenge was not to display cultural history.": "挑战不是展示文化历史。",
    "Three learner groups shaped the experience structure.": "三类学习者塑造了体验结构。",
    "Secondary school learners": "中学生",
    "ASN learners": "ASN 学习者",
    "Hospitality students": "Hospitality 学生",
    "Need concrete stories and clear examples rather than long explanatory text.": "需要具体故事和清晰案例，而不是长篇解释文字。",
    "Need highly visual, chunked and low-barrier content that supports different learning access needs.": "需要高度视觉化、分段清晰、低门槛的内容，以支持不同学习进入方式。",
    "Need to connect heritage, service experience and business skills in a practical way.": "需要以实践方式连接文化遗产、服务体验和商业技能。",
    "Too much material, not enough teachable story.": "材料太多，但可教学的故事不够清晰。",
    "What we did": "我们做了什么",
    "What we found": "我们发现了什么",
    "Why it mattered": "为什么重要",
    "Design decision": "设计决策",
    "Explored broad Scottish tea, food heritage, tourism and hospitality sources.": "广泛研究苏格兰茶文化、食物遗产、旅游与 hospitality 资料。",
    "The research field was fragmented and difficult to turn into a focused learning journey.": "研究材料非常碎片化，难以直接转化为聚焦的学习旅程。",
    "Young learners need a teachable story, not a dense archive of disconnected facts.": "年轻学习者需要可教学的故事，而不是大量互不连接的事实档案。",
    "Simplify the project around recognisable cultural objects and clear learning moments.": "围绕可识别的文化物件和清晰学习时刻简化项目。",
    "Research was filtered through time, people and item.": "研究通过时间、人群和物件三个维度被筛选。",
    "Fragmented tea / food culture research": "碎片化茶 / 食物文化研究",
    "Time / People / Item": "时间 / 人群 / 物件",
    "Object-led cultural learning": "物件引导的文化学习",
    "Three cultural shifts made the learning journey clearer.": "三个文化转变让学习旅程更清晰。",
    "Luxury & Status": "奢侈与身份",
    "Rare access": "稀缺接触",
    "Tea enters elite and aristocratic spaces, helping learners understand status, scarcity and early access.": "茶进入精英和贵族空间，帮助学习者理解身份、稀缺性和早期接触。",
    "Social Ritual & Identity": "社交仪式与身份",
    "Shared behaviour": "共享行为",
    "Afternoon tea becomes a social ritual connected with class, identity, imitation and public life.": "下午茶成为与阶层、身份、模仿和公共生活相关的社交仪式。",
    "Mass Access & Service Innovation": "大众可及与服务创新",
    "Scalable service": "可规模化服务",
    "Tea bags, co-op stores and standardised packaging make tea more affordable, teachable and widely accessible.": "茶包、合作社商店和标准化包装让茶变得更可负担、更可教学，也更容易被大众接触。",
    "Crazy 8s helped generate and filter possible learning formats.": "Crazy 8s 帮助生成并筛选可能的学习形式。",
    "Generated ideas including board games, short films, sound tea bags, miniature models, workshops and interactive screens.": "生成了桌游、短片、声音茶包、微缩模型、工作坊和互动屏幕等想法。",
    "Some ideas were engaging, but many were too complex, too technology-heavy or weak as teaching tools for a peer-tested classroom-style prototype.": "部分想法很吸引人，但很多过于复杂、技术负担过重，或作为课堂式同伴测试原型的教学工具不够强。",
    "The outcome needed to work in a classroom-like learning context with short attention spans and mixed learning needs.": "最终产出需要适用于类似课堂的学习语境，面对较短注意力和混合学习需求。",
    "Select stop-motion and object-based interaction because they balanced accessibility, storytelling, feasibility and engagement.": "选择定格动画与物件互动，因为它们在可及性、叙事、可行性和参与度之间取得平衡。",
    "Criterion 01": "标准 01",
    "Criterion 02": "标准 02",
    "Criterion 03": "标准 03",
    "Criterion 04": "标准 04",
    "Historical accuracy": "历史准确性",
    "Middle-school accessibility": "中学生可理解性",
    "Teaching-tool potential": "教学工具潜力",
    "Feasibility & engagement": "可行性与参与度",
    "SCAMPER turned many ideas into specific design decisions.": "SCAMPER 将多个想法转化为具体设计决策。",
    "Substitute": "替代",
    "Eliminate": "删除",
    "Adapt": "改造",
    "Rearrange": "重组",
    "Combine": "组合",
    "Use stop-motion instead of live shooting": "用定格动画替代真人拍摄",
    "Remove high-barrier VR ideas": "移除高门槛 VR 想法",
    "Treat tea bags as cultural containers": "把茶包视为文化容器",
    "Move interaction after each segment": "把互动移到每段之后",
    "Merge animation with object-based interaction": "将动画与物件互动结合",
    "From beautiful storytelling to structured learning.": "从漂亮叙事转向结构化学习。",
    "Feedback:": "反馈：",
    "Issue:": "问题：",
    "Design Change:": "设计调整：",
    "The prototype was tested through peer feedback and classroom-style review.": "原型通过同伴反馈和课堂式评审进行测试。",
    "A long linear story was less effective than short learning modules with interaction after each segment.": "长线性故事不如每段后有互动的短学习模块有效。",
    "Add a separate interactive prompt after each animation segment.": "在每个动画片段后加入独立互动提示。",
    "The tea bag appeared only at the end.": "茶包只在结尾出现。",
    "The key object felt abrupt and carried too little meaning.": "关键物件出现得突兀，承载意义不足。",
    "Transform tea bags into a dedicated learning module.": "将茶包转化为独立学习模块。",
    "Important information was implicit in the visuals.": "重要信息隐含在视觉中。",
    "Students could remember surface details but miss the deeper service message.": "学生能记住表层细节，但容易错过更深层的服务信息。",
    "Divide the story into three standalone micro-course modules.": "将故事拆分为三个独立微课程模块。",
    "Some scenes were visually attractive.": "有些场景视觉上很吸引人。",
    "They did not clearly support the learning objective.": "但它们没有清晰支持学习目标。",
    "Remove visually beautiful but pedagogically weak scenes.": "移除视觉漂亮但教学意义较弱的场景。",
    "Three micro-learning modules connect culture with service thinking.": "三个微学习模块连接文化与服务思维。",
    "Module 01 / 1680s": "模块 01 / 1680 年代",
    "Tea enters Scotland as a rare luxury": "茶作为稀缺奢侈品进入苏格兰",
    "Learning focus: status, packaging, early access and social class.": "学习重点：身份、包装、早期接触与社会阶层。",
    "Module 02 / 19th century": "模块 02 / 19 世纪",
    "Afternoon tea becomes a social ritual": "下午茶成为社交仪式",
    "Learning focus: identity, imitation, customer expectations and experience design.": "学习重点：身份、模仿、顾客期待与体验设计。",
    "Module 03 / Early 20th century": "模块 03 / 20 世纪初",
    "Tea bags and factories create mass access": "茶包与工厂创造大众可及性",
    "Learning focus: standardisation, affordability, business model and inclusive service.": "学习重点：标准化、可负担性、商业模式与包容性服务。",
    "The tea bag became a service innovation metaphor.": "茶包成为服务创新的隐喻。",
    "Handmade / premium model": "手工 / 高端模式",
    "High ritual, lower scalability": "高仪式感，较低可规模化",
    "Traditional service can feel beautiful and personal, but it may require more time, training and labour.": "传统服务可以很精致、很个人化，但通常需要更多时间、培训和劳动力。",
    "Tea bag / co-op / mass access model": "茶包 / 合作社 / 大众可及模式",
    "Standardised, teachable and accessible": "标准化、可教学、可接触",
    "Tea bag innovation is not only packaging innovation. It represents standardisation, lower cost, easier training, wider access and scalable service design.": "茶包创新不只是包装创新。它代表标准化、更低成本、更容易培训、更广泛可及，以及可规模化的服务设计。",
    "The proposal creates a bridge between cultural learning and service thinking.": "这个提案在文化学习与服务思维之间建立桥梁。",
    "Cultural connection": "文化连接",
    "Classroom discussion": "课堂讨论",
    "Inclusive service thinking": "包容性服务思维",
    "Could help learners connect familiar heritage objects with modern hospitality and service experience.": "可以帮助学习者把熟悉的遗产物件与现代 hospitality 和服务体验连接起来。",
    "Could support discussion by making abstract cultural and business concepts easier to understand.": "可以通过让抽象文化和商业概念更易理解来支持课堂讨论。",
    "Could help hospitality learners think about pricing, accessibility, customer inclusivity and scalable service design.": "可以帮助 hospitality 学习者思考定价、可及性、顾客包容性和可规模化服务设计。",
    "Cultural education needs more than beautiful storytelling.": "文化教育需要的不只是漂亮叙事。",
    "Meaning needs structure": "意义需要结构",
    "Objects can carry service logic": "物件可以承载服务逻辑",
    "Learning should transfer": "学习应该可以迁移",
    "For young learners, visual storytelling needs direct learning cues, interaction and immediate processing moments.": "对年轻学习者来说，视觉叙事需要直接学习提示、互动和即时处理信息的时刻。",
    "The tea bag helped translate abstract ideas such as standardisation, lower cost and wider access into a concrete learning object.": "茶包帮助把标准化、低成本和更广泛可及等抽象概念转译为具体学习物件。",
    "A strong educational service experience helps learners understand not only what happened in the past, but why it matters now and how it can inform future service decisions.": "强的教育服务体验不仅帮助学习者理解过去发生了什么，也帮助他们理解为什么这对当下重要，以及它如何启发未来服务决策。",
    "What This Project Demonstrates": "这个项目展示了什么",
    "Competencies for service, transformation and innovation roles": "面向服务、转型与创新岗位的能力",
    "Research filtering": "研究筛选",
    "Learning experience design": "学习体验设计",
    "Iteration through testing": "通过测试迭代",
    "Service innovation framing": "服务创新框架",
    "Turning fragmented cultural research into a teachable narrative with clear learning moments.": "将碎片化文化研究转化为有清晰学习时刻的可教学叙事。",
    "Designing visual, chunked and interactive modules for different learner needs.": "为不同学习需求设计视觉化、分段式、可互动的模块。",
    "Using feedback to pivot from passive storytelling to structured micro-learning.": "利用反馈从被动叙事转向结构化微学习。",
    "Connecting heritage objects with inclusive business models, access and scalable service design.": "将遗产物件与包容性商业模式、可及性和可规模化服务设计连接起来。",

    "Multi-Species / Biodiversity Clock": "多物种 / 生物多样性时钟",
    "Scone Through Time": "司康时光",
    "Ear Shield": "Ear Shield 鲸声护盾",
    "SeedWalkers": "SeedWalkers 种子行者",
    "Cross-Culture Icebreaker": "跨文化破冰包",
    "Machine Mapping": "Machine Mapping 机器映射",
    "Public Creative Technology Practice": "公开创意技术实践"
  };

  const zhTitles = {
    "index.html": "朱一帆 | 服务与转型设计作品集",
    "work.html": "朱一帆 | 项目",
    "practice.html": "朱一帆 | 创意技术与视觉实践",
    "about.html": "朱一帆 | 关于",
    "resource-platform.html": "朱一帆 | 独立 3D 与 AI 资源平台",
    "project-scone-through-time.html": "朱一帆 | 司康时光",
    "project-biodiversity-clock.html": "朱一帆 | 多物种 / 生物多样性时钟",
    "project-ear-shield.html": "朱一帆 | Ear Shield 鲸声护盾",
    "project-seedwalkers.html": "朱一帆 | SeedWalkers 种子行者"
  };

  const normalize = (value) => value.replace(/\s+/g, " ").trim();

  const getCurrentPage = () => {
    const page = window.location.pathname.split("/").pop();
    return page || "index.html";
  };

  const getInitialLanguage = () => {
    const params = new URLSearchParams(window.location.search);
    const queryLanguage = params.get("lang");
    if (queryLanguage === "zh" || queryLanguage === "en") return queryLanguage;

    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;

    const host = window.location.hostname.toLowerCase();
    return CHINESE_HOST_HINTS.some((hint) => host.includes(hint)) ? "zh" : "en";
  };

  const setTextNode = (node, value) => {
    const current = originalText.get(node) || node.nodeValue;
    const leading = current.match(/^\s*/)?.[0] || "";
    const trailing = current.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${value}${trailing}`;
  };

  const applyLanguageToTextNodes = (language) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (!normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      const english = originalText.get(node);
      const key = normalize(english);
      if (language === "zh" && zh[key]) setTextNode(node, zh[key]);
      if (language === "en") node.nodeValue = english;
    });
  };

  const updateSwitcherState = (language) => {
    document.querySelectorAll("[data-language-option]").forEach((button) => {
      const isActive = button.dataset.languageOption === language;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const applyLanguage = (language) => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    applyLanguageToTextNodes(language);
    document.title = language === "zh" && zhTitles[getCurrentPage()] ? zhTitles[getCurrentPage()] : originalTitle;
    updateSwitcherState(language);
  };

  const createLanguageSwitcher = () => {
    const nav = document.querySelector(".site-header nav");
    if (!nav || document.querySelector(".language-switcher")) return;

    const switcher = document.createElement("div");
    switcher.className = "language-switcher";
    switcher.setAttribute("aria-label", "Language switcher");

    [
      ["en", "EN"],
      ["zh", "中文"]
    ].forEach(([language, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.languageOption = language;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        window.localStorage.setItem(LANGUAGE_KEY, language);
        applyLanguage(language);
      });
      switcher.appendChild(button);
    });

    nav.appendChild(switcher);
  };

  document.addEventListener("DOMContentLoaded", () => {
    createLanguageSwitcher();
    applyLanguage(getInitialLanguage());
  });
})();

// Storyboard Skill / 分镜 Skill — an agent skill that turns one sentence into a production-ready storyboard, with a
// different creative method for brand films, IP dramas and science explainers, and layered quality checks.
// Three days, solo: the agent-workflow piece of three October works on AI × video. The overview boards have Chinese twins.
const A = 'assets/projects/storyboard-skill/';

export function renderStoryboardSkill(t, document) {
  const img = (f, alt, i18n = false) => `<img${i18n ? ' data-i18n-img' : ''} src="${A}${f}.webp" alt="${t(...alt)}" loading="lazy" decoding="async" />`;
  const board = (n, cap) => `<figure class="sb-board" data-zoom="${A}overview-0${n}-large.webp">${img(`overview-0${n}`, cap, true)}<figcaption>${t(...cap)}<span>${t('Click to read it at full size', '点击看大图')}</span></figcaption></figure>`;
  const sketch = (f, cap) => `<figure class="sb-sketch" data-zoom>${img(f, cap)}<figcaption>${t(...cap)}</figcaption></figure>`;
  const sec = (id, label, title, body) => `<section class="case-section" id="${id}"><div class="case-label">${t(...label)}</div><div class="case-content">${title ? `<h2>${t(...title)}</h2>` : ''}${body}</div></section>`;
  const h3 = (en, zh) => `<h3>${t(en, zh)}</h3>`;
  const p = (en, zh) => `<p>${t(en, zh)}</p>`;
  const note = t('Independent project. The sketches are composition frames generated with an image model, not final shots; nothing here was published or measured.', '独立项目。草图是用图像模型生成的构图参考，不是成片；这里的内容没有发布，也没有传播数据。');
  const idx = [['run', ['The run', '运行录屏']], ['problem', ['The problem', '问题']], ['methods', ['Three methods', '三种方法']], ['how', ['How it runs', '执行步骤']], ['quality', ['Quality', '质量分层']], ['task1', ['Keep This Tooth', '这颗牙，别补']], ['task2', ['Give Me a Pocket', '给我一个口袋']], ['task3', ['Apples', '苹果变褐']], ['tools', ['Tools & limits', '工具与边界']], ['reflect', ['Reflection', '反思']]];

  const body = `<article class="full-case single-project am-case sb"><a class="back-link" href="work.html">${t('Back to All Work', '返回全部作品')}</a>
    <section class="case-head am-head"><div><p class="eyebrow">${t('AI agent workflow · Skill design · Creative methods · Oct 2026', 'AI Agent 工作流 · Skill 设计 · 创作方法 · 2026 年 10 月')}</p>
      <h1>${t('Storyboard Skill', '分镜 Skill')}</h1>
      <p>${t('An agent skill that turns one sentence into a production-ready storyboard: an outline, per-shot sketches and an overview board. It decides what kind of film the request is, applies a different creative method for brand films, IP dramas and science explainers, and checks its own work layer by layer.', '一个可被 AI Agent 调用的 Skill：一句话进去，出来一套能直接进入制作的分镜——大纲、逐镜草图、总览图。它先判断这是哪一类片子，对品牌片、IP 短剧、科普分别用不同的创作方法，并逐层检查自己的产出。')}</p>
      <p class="i2e-note">${note}</p></div>
      <figure class="am-hero sb-hero" data-zoom="${A}overview-01-large.webp">${img('cover', ['Overview board for Keep This Tooth: the first row of shots', '《这颗牙，别补》的分镜总览图：第一排镜头'], true)}<figcaption>${t('Keep This Tooth, overview board. Composition sketches, not final shots. Click to read it.', '《这颗牙，别补》总览图。草图是构图参考，不是成片。点击可放大阅读。')}</figcaption></figure></section>

    <section class="am-tldr" aria-label="${t('In 30 seconds', '30 秒速读')}"><p class="am-tldr-title">${t('In 30 seconds', '30 秒速读')}</p><dl>
      <div><dt>${t('My role', '我的角色')}</dt><dd>${t('Solo, 3 days: skill design, creative methods, quality system, scripts, run recording', '独立完成，3 天：Skill 设计、创作方法、质量体系、脚本、运行录屏')}</dd></div>
      <div><dt>${t('The goal', '目标')}</dt><dd>${t('A skill an AI agent can call and run reliably, that treats a brand film, a drama and an explainer as three different jobs', '一个 Agent 可调用、稳定执行的 Skill，把品牌片、短剧、科普当成三件不同的事来做')}</dd></div>
      <div><dt>${t('The idea', '核心想法')}</dt><dd>${t('Behave like a director: decide what kind of film it is, find one specific idea worth filming, check the work before handing over', '像导演一样工作：先判断片种，找到一个值得拍的具体想法，交付前自己检查')}</dd></div>
      <div><dt>${t('Output', '产出')}</dt><dd>${t('Three films from three prompts, 33 sketches, every redo logged; validation enforced in code', '三句话出三部片，33 张草图，每次返工有记录；结构校验由脚本强制执行')}</dd></div></dl>
      <ul class="am-skills" aria-label="${t('Skills shown', '体现的能力')}">${[['Agent & skill design', 'Agent 与 Skill 设计'], ['Creative direction', '创意指导'], ['Storyboarding', '分镜'], ['Prompt systems', '提示词系统'], ['Quality frameworks', '质量框架'], ['Python tooling', 'Python 工具']].map(k => `<li>${t(...k)}</li>`).join('')}</ul></section>
    <nav class="ux-case-index" aria-label="${t('Case contents', '案例目录')}" data-case-index>${idx.map(([id, l]) => `<a href="#${id}">${t(...l)}</a>`).join('')}<a class="ux-index-top" href="#main">${t('↑ Top', '↑ 顶部')}</a></nav>

    ${sec('run', ['The run', '运行录屏'], ['Watch the agent run it', '看 Agent 把它跑一遍'], `
      <figure class="i2e-video"><video controls preload="none" playsinline poster="${A}poster-en.jpg" data-i2e-video data-en="${A}recording-en.mp4" data-zh="${A}recording-zh.mp4" data-poster-en="${A}poster-en.jpg" data-poster-zh="${A}poster-zh.jpg"><source src="${A}recording-en.mp4" type="video/mp4" /><track kind="subtitles" src="${A}recording-en.vtt" srclang="en" label="English" /></video><figcaption>${t('2 min 56 s, edited from a real run of about two hours; waiting for images is sped up, with the speed shown top right. Codex calls the skill → the request goes in verbatim → the skill asks to decide the type → thesis and specificity test → tone frame approval → generation and per-image review → only failed shots redone → validation → overview board, for all three tasks.', '2 分 56 秒，剪自约两小时的真实运行；等待出图的部分加速，倍速标在右上角。Codex 调用 Skill → 原句输入 → Skill 提问判断类型 → 命题与具体性测试 → 定调图确认 → 出图与逐张看图 → 不合格只重做该镜 → 校验 → 总览图，三个任务依次完成。')}</figcaption></figure>
      <div class="i2e-actions"><a class="i2e-btn" data-i2e-demo data-en="${A}skill-en.txt" data-zh="${A}skill-zh.txt" href="${A}skill-en.txt" target="_blank" rel="noopener">${t('Read the skill file', '查看 Skill 原文')} <span aria-hidden="true">↗</span></a><span class="i2e-actions-note">${t('SKILL.md: triggers, steps, rules, output contract and quality checks. Opens in a new tab.', 'SKILL.md：触发条件、执行步骤、专业规则、输出格式和质量标准。在新标签页打开。')}</span></div>`)}

    ${sec('problem', ['The problem', '问题'], ['“One prompt, one storyboard” says nothing', '“一个提示词出一套分镜”，什么都没说'], `
      ${p('Generic storyboard prompts treat every request the same way: pick a topic, list some shots, generate pretty frames. The result usually looks expensive and says nothing. “A premium AI video” becomes glowing brains and blue particles. “Virtual fashion” becomes a catwalk.', '通用的分镜提示词把所有需求当成一回事：挑个主题，列几个镜头，生成几张好看的画面。结果往往看起来很贵，却什么都没说。“高级感 AI 视频”变成发光的大脑和蓝色粒子，“虚拟时尚”变成 T 台走秀。')}
      ${p('I wanted the skill to behave more like a director: decide what kind of film this is, find one specific idea worth filming, and check its own work before handing it over.', '我希望这个 Skill 更像一位导演：先判断这是哪一类片子，找到一个值得拍的具体想法，交付前自己检查。')}`)}

    ${sec('methods', ['Three methods', '三种方法'], ['Three video types, three methods', '三类视频，三种方法'], `
      ${p('The topic alone can’t decide the type: the same topic can be a brand film, a drama or an explainer. When a request is open, the skill asks one question that changes the direction: “Do you want viewers to remember a brand, a character, or understand a question?” If it can’t ask, it picks a route and writes the reason down as an assumption, never as something the user confirmed.', '主题词不能单独决定类型：同一个主题可以拍成品牌片、短剧或科普。需求没说清时，Skill 先问一个影响方向的问题：“想让观众记住一个品牌、一个角色，还是弄懂一个问题？”不能提问时，它选一条路并把理由记为假设，而不是当成用户确认过的。')}
      <table class="i2e-metrics sb-table"><thead><tr><th></th><th>${t('Brand film', '品牌创意宣传片')}</th><th>${t('IP drama', 'IP 向短剧')}</th><th>${t('Science explainer', '知识类科普')}</th></tr></thead><tbody>
        <tr><td>${t('Goal', '目的')}</td><td>${t('Remember a brand or a stance', '让观众记住一个品牌或主张')}</td><td>${t('Remember a character and their story', '让观众记住一个角色和 ta 的故事')}</td><td>${t('Understand one question', '让观众弄懂一个问题')}</td></tr>
        <tr><td>${t('Answer first', '先回答')}</td><td>${t('Audience, goal, single promise', '受众、传播目标、单一主张')}</td><td>${t('Who the character is, goal and obstacle', '角色辨识、目标与阻力')}</td><td>${t('The exact question, what viewers already believe', '具体问题、观众原有认知或误解')}</td></tr>
        <tr><td>${t('Structure', '结构')}</td><td>${t('Hook → visible proof → brand link', '钩子 → 可见证据 → 品牌关系')}</td><td>${t('Action → consequence → new choice → change', '行动 → 后果 → 新选择 → 变化')}</td><td>${t('Phenomenon → mechanism → evidence → limits', '现象 → 机制 → 证据 → 边界')}</td></tr>
        <tr><td>${t('Must check', '必须检查')}</td><td>${t('Is the benefit shown, or only claimed in voiceover?', '利益是画面证明的，还是旁白宣称的？')}</td><td>${t('Does every choice have a reason? Who knows what?', '每个选择有没有原因？谁知道什么？')}</td><td>${t('Does every fact have a source? Does the analogy overreach?', '每个事实有没有出处？类比有没有越界？')}</td></tr>
        <tr><td>${t('Required fields', '专属字段')}</td><td><code>${t('single_promise · benefit_proof · creative_device · viewing_mechanism', 'single_promise · benefit_proof · creative_device · viewing_mechanism')}</code></td><td><code>${t('character_sheet · causal_beats · knowledge_states · ending_change', 'character_sheet · causal_beats · knowledge_states · ending_change')}</code></td><td><code>${t('question · claim_evidence_map · explanation_steps · analogy_limits', 'question · claim_evidence_map · explanation_steps · analogy_limits')}</code></td></tr></tbody></table>
      ${p('The validation script enforces the type-specific fields: relabelling a brand film as a drama fails, and a science fact without a source, or not marked as verified, fails.', '校验脚本会检查所选类型的专属字段：把品牌片改个类型名冒充短剧，会被拦下；科普的事实没有出处或没有标注已核实，也会被拦下。')}`)}

    ${sec('how', ['How it runs', '执行步骤'], ['Ten steps, from the sentence to the board', '从一句话到总览图的十步'], `
      <ol class="sb-steps">
        <li><b>${t('Record the request', '记录原句')}</b>${t('word for word; separate user constraints, working assumptions and creative proposals.', '一字不改；区分用户约束、工作假设和创作提议。')}</li>
        <li><b>${t('Thesis and core frame', '命题与核心画面')}</b>${t('Write the single most representative frame and pass three specificity tests: Swap (would it still work for another topic?), Truth (what real situation does it reveal?), Shootable (could real people in a real place film it?). Fail → back to ideation.', '写出全片最有代表性的一帧，过三项具体性测试：换个主题还成立吗、揭示了什么真实处境、能否真实拍出。不过 → 回去重想。')}</li>
        <li><b>${t('Cinematography spec', '摄影规范')}</b>${t('medium, aspect, focal length, light source, palette with only one strong colour, texture, composition rules, banned clichés. Every image prompt derives from it.', '媒介、画幅、焦段、光源、只有一个强色的色彩、质感、构图规则、禁止项。所有出图提示词都从它派生。')}</li>
        <li><b>${t('Script by type', '按类型写脚本')}</b>${t('promise and proof, or goal, obstacle and cause, or question, fact table and explanation chain.', '主张与证据，或目标、阻力与因果，或问题、事实表与解释链。')}</li>
        <li><b>${t('References', '参考')}</b>${t('only for people, places and props that repeat across shots.', '只给跨镜头重复出现的人、地点和道具。')}</li>
        <li><b>${t('Shot groups', '镜头组')}</b>${t('purpose, action, shot size, camera, motion, light, continuity, sound, transition, plus a motion brief for video production.', '目的、动作、景别、机位、运动、光线、连续性、声音、转场，加一份给视频制作的交接说明。')}</li>
        <li><b>${t('Tone frame → user approval', '定调图 → 用户确认')}</b>${t('before any shot sketches.', '出任何分镜草图之前。')}</li>
        <li><b>${t('Generate', '出图')}</b>${t('key shot first; batch only after it passes. Raw and graded images kept separately.', '代表镜头先行，通过后再批量。原图和调色后的图分开保存。')}</li>
        <li><b>${t('Review every image', '逐张看图')}</b>${t('redo only the failed shot and keep the old version.', '只重做不合格的镜头，旧版保留。')}</li>
        <li><b>${t('Validate and lay out', '校验与排版')}</b>${t('the outline, overview board and a read-only viewer.', '大纲、总览图和一个只读查看页。')}</li></ol>
      ${h3('Rules that make “premium” checkable', '让“高级感”可检查的规则')}
      <ul class="i2e-list">
        <li>${t('Light has a source; colour is restrained, with at most one strong colour; materials are real; empty space is intentional.', '光有来源；色彩克制，最多一个强色；材质真实；留白是有意的。')}</li>
        <li>${t('Six documentary-cinema rules: people are busy, not posing; a specific place with lived-in clutter; light through air; one consistent grade; observe through things; imperfection allowed.', '六条纪实电影规则：人在忙，不在摆姿势；具体的地方，有生活杂物；光穿过空气；统一的调色；隔着东西观察；允许不完美。')}</li>
        <li>${t('Clichés (glowing brains, blue-purple particles, holograms, neon, hair-flip catwalks) need a film-specific reason, or they’re replaced.', '陈词滥调（发光大脑、蓝紫粒子、全息、霓虹、甩发走秀）需要这部片子特有的理由，否则换掉。')}</li>
        <li>${t('Continuity of axis, eyelines, direction of movement, props and light. No text from the image model; captions and logos are added in post.', '轴线、视线、运动方向、道具和光线的连续性。图像模型不出文字；字幕和 Logo 后期加。')}</li>
        <li>${t('“Make it go viral” becomes viewing mechanisms (hook, participation, payoff, screenshot frame), marked as an assumption, never a promise of reach.', '“要能火”变成观看机制（钩子、参与、回报、可截图的一帧），标为假设，从不承诺传播量。')}</li></ul>`)}

    ${sec('quality', ['Quality', '质量分层'], ['Quality is layered, never one “pass”', '质量分层记录，不合并成一个“通过”'], `
      <table class="i2e-metrics"><thead><tr><th>${t('Layer', '层')}</th><th>${t('What’s checked', '检查什么')}</th><th>${t('Who judges', '谁判断')}</th></tr></thead><tbody>
        <tr><td>${t('Technical structure', '技术结构')}</td><td>${t('Continuous timing, required fields, type fields, image dependencies, files and aspect, no reuse', '时间连续、字段齐全、类型专属字段、图片依赖、文件与画幅、不重复使用')}</td><td>${t('Script', '脚本')}</td></tr>
        <tr><td>${t('Creative method', '创意方法')}</td><td>${t('Specificity tests; brand proof, drama causality, science sources and limits', '具体性测试；品牌证据、短剧因果、科普出处与边界')}</td><td>${t('Agent, then user', 'Agent，然后用户')}</td></tr>
        <tr><td>${t('Shot design', '镜头设计')}</td><td>${t('What each shot changes, and why the cut works', '每个镜头改变了什么，剪接为什么成立')}</td><td>${t('Agent', 'Agent')}</td></tr>
        <tr><td>${t('Image quality', '画面质量')}</td><td>${t('Light, material, people, space, text, clichés, the six documentary rules', '光、材质、人、空间、文字、陈词滥调、六条纪实规则')}</td><td>${t('Agent, confirmed by designer', 'Agent，设计师确认')}</td></tr>
        <tr><td>${t('User acceptance', '用户接受')}</td><td>${t('Does it match what they wanted?', '是不是用户想要的？')}</td><td>${t('User', '用户')}</td></tr></tbody></table>
      <figure class="sb-board sb-board--redo" data-zoom>${img('redo-compare', ['Before and after a redo, with the review note', '返工前后对比，附看图记录'])}<figcaption>${t('Every redo keeps the old version and the reason. Keep This Tooth was redone seven times across five shots.', '每次返工都保留旧版和原因。《这颗牙，别补》在五个镜头上共返工七次。')}</figcaption></figure>`)}

    ${sec('task1', ['Film 1', '第一部'], ['Keep This Tooth', '这颗牙，别补'], `
      <dl class="sb-facts">
        <div><dt>${t('The request', '一句话需求')}</dt><dd>${t('“Make me a premium AI video that can go viral.”', '「帮我做一个关于 AI 的高级感视频，要能火」')}</dd></div>
        <div><dt>${t('Type', '类型判断')}</dt><dd>${t('The skill asked whether viewers should remember a stance, a character or an answer; the user chose a stance about AI → brand film.', 'Skill 先问“想让观众记住一个主张、一个角色，还是弄懂一个问题”，用户选择记住一个关于 AI 的主张 → 品牌创意宣传片。')}</dd></div>
        <div><dt>${t('Film', '片名')}</dt><dd>${t('Keep This Tooth · vertical 9:16 · 32 s · 8 shots', '《这颗牙，别补》· 竖屏 9:16 · 32 秒 · 8 镜')}</dd></div>
        <div><dt>${t('Thesis', '核心命题')}</dt><dd>${t('Repair the damage, keep the truth. AI’s ability follows a person’s choice, and never rewrites a memory on its own.', '把缺损补上，把真实留下。AI 的能力服从人的选择，不替记忆擅自补写。')}</dd></div>
        <div><dt>${t('Story', '故事')}</dt><dd>${t('In an old photo studio, a daughter asks a retoucher to restore her father’s photo with AI, but insists: “Don’t fix this tooth.” Only the torn corner is repaired; her father’s gap-toothed smile stays.', '女儿在老照相馆请修图师用 AI 修复父亲的旧照，却坚持“这颗牙，别补”：只修照片角上的破损，保留父亲缺牙的笑。')}</dd></div>
        <div><dt>${t('“Premium”, made concrete', '“高级感”的落地')}</dt><dd>${t('Documentary cinema: observed through door frames and glass, a real old shop, low sunlight through dust, one cool grey-green grade, and a single strong colour, the daughter’s dark vermilion bag.', '纪实电影感：隔着门框与玻璃观察、真实老店、低角度日光穿过浮尘、统一冷灰绿偏色，唯一强色是女儿的暗朱红帆布袋。')}</dd></div>
        <div><dt>${t('“Go viral”, as mechanisms', '“要能火”的落地')}</dt><dd>${t('Unverified: “Don’t fix this tooth” raises a question in the first two seconds; S07 puts old and new side by side for pausing; “Which imperfection would you keep?” invites comments.', '观看机制，未经数据验证：开头 2 秒“这颗牙，别补”制造疑问；S07 原照与修复照并排可暂停对照；“你想保留哪个不完美”引发评论。')}</dd></div></dl>
      ${board(1, ['Overview board: Keep This Tooth', '总览图：《这颗牙，别补》'])}
      <div class="sb-sketches">${sketch('sketch-brand-s01', ['S01 · Her finger stops at the gap: “Don’t fix this tooth”', 'S01 · 她的手指停在缺牙处：“这颗牙，别补”'])}${sketch('sketch-brand-s04', ['S04 · Only this corner: the retoucher points at the tear', 'S04 · 只修这个角：修图师指着破损处'])}</div>
      ${p('Redo log: the agent reviewed every image and redid seven times (S01, S03, S05, S06 once each; S04 three times), all logged with old versions kept. S04’s third version still had the fingertip about 1 cm off the tear: the agent marked it as not fully met, the user accepted it as “composition intent readable”, and both conclusions were recorded separately.', '返工记录：Agent 逐张看图共返工 7 次（S01、S03、S05、S06 各 1 次，S04 3 次），全部记录，旧版保留。S04 第三版指尖距破损处约 1 厘米，Agent 判为未完全达标，用户以“构图意图可读”验收，两层结论分别记录。')}`)}

    ${sec('task2', ['Film 2', '第二部'], ['Give Me a Pocket', '给我一个口袋'], `
      <dl class="sb-facts">
        <div><dt>${t('The request', '一句话需求')}</dt><dd>${t('“Design a cinematic storyboard for a Virtual Fashion video.”', '「帮我根据“虚拟时尚”主题视频，输出一份影视化分镜头设计」')}</dd></div>
        <div><dt>${t('Type', '类型判断')}</dt><dd>${t('After the question, the user chose to remember a virtual character’s story → IP drama.', 'Skill 提问后，用户选择记住一个虚拟角色的故事 → IP 向短剧。')}</dd></div>
        <div><dt>${t('Film', '片名')}</dt><dd>${t('Give Me a Pocket · landscape 16:9 · 40 s · 8 shots', '《给我一个口袋》· 横屏 16:9 · 40 秒 · 8 镜')}</dd></div>
        <div><dt>${t('Thesis', '核心命题')}</dt><dd>${t('Azhi, a virtual character, stops asking whether clothes look good. She wants a pocket that can carry her keys: from wearing looks others designed to deciding for her own life.', '虚拟角色阿只不再只问衣服好不好看，她要一个能把钥匙带走的口袋——从穿别人设计的外观，到为自己的生活作决定。')}</dd></div>
        <div><dt>${t('Story', '故事')}</dt><dd>${t('The pocket on Azhi’s jacket is only a texture, so her keys fall straight through. She refuses “a nicer outfit”, sews a square of brick-red cloth into a real pocket herself, and the keys finally stay.', '阿只外套上的口袋只是贴图，钥匙穿过去掉在地上；她拒绝“换一套更好看的”，自己把一块砖红布缝成真口袋，钥匙终于留住。')}</dd></div>
        <div><dt>${t('IP elements', 'IP 要素')}</dt><dd>${t('A recognisable character (silver lock at the left temple, dark grey jacket), goal and obstacle, causal beats, an ending change, and a series hook: “Tomorrow: shoes I can run in.”', '角色识别（左鬓银白发束、深灰外套）、目标与阻力、因果节拍、结尾变化，以及系列延续：“下次做能跑的鞋”。')}</dd></div>
        <div><dt>${t('“Cinematic”, made concrete', '“影视化”的落地')}</dt><dd>${t('A real garment workshop, high-window light through dust and iron steam, observed through hanging cloth and racks, and one strong colour: the brick-red pocket.', '服装工坊实景、高窗日光穿过浮尘与熨斗蒸汽、隔垂布与衣架观察，唯一强色是那块砖红口袋布。')}</dd></div></dl>
      ${board(2, ['Overview board: Give Me a Pocket', '总览图：《给我一个口袋》'])}
      <div class="sb-sketches sb-sketches--wide">${sketch('sketch-drama-s03', ['S03 · The keys fall straight through the painted pocket', 'S03 · 钥匙从贴图口袋里直接掉下去'])}${sketch('sketch-drama-s06', ['S06 · She sews the brick-red cloth into a real pocket', 'S06 · 她把砖红布缝成真口袋'])}</div>
      ${p('Redo log: the first identity reference drew a real pocket, contradicting the “it’s only a texture” premise, so it was redone; S06 was redone once.', '返工记录：身份参考第一版画出了真口袋，与“口袋只是贴图”的设定冲突，返工；S06 返工 1 次。')}`)}

    ${sec('task3', ['Film 3', '第三部'], ['Why Do Apples Turn Brown?', '苹果为什么会变褐'], `
      ${p('A third film to exercise the science method on its own. The question is clear, so the skill classified it as a science explainer without asking.', '第三部片，单独验证科普方法。需求明确，Skill 直接判定为知识类科普，没有提问。')}
      <dl class="sb-facts">
        <div><dt>${t('The request', '一句话需求')}</dt><dd>${t('“Why does a peeled apple turn brown after a while?”', '「为什么削了皮的苹果放一会儿会变褐色？」')}</dd></div>
        <div><dt>${t('Film', '片名')}</dt><dd>${t('Why Do Apples Turn Brown? · 16:9 · 32 s · 4 shots', '《苹果为什么会变褐》· 16:9 · 32 秒 · 4 镜')}</dd></div>
        <div><dt>${t('Explanation chain', '解释链')}</dt><dd>${t('Phenomenon (the flesh browns) → condition (peeling breaks cell compartments, so PPO meets phenols and oxygen) → mechanism (phenols oxidise to quinones, which form brown pigments) → control (lemon juice’s acidity slows it).', '现象（果肉变褐）→ 条件（削皮破坏细胞分隔，PPO 与酚类、氧气接触）→ 机制（酚类氧化成醌，再形成褐色色素）→ 对照（柠檬汁的酸性放慢反应）。')}</dd></div>
        <div><dt>${t('Fact check', '事实核查')}</dt><dd>${t('All four facts marked verified, with sources: University of Wisconsin–Madison; Science Buddies; American Chemical Society.', '4 条事实全部标注已核实，出处：University of Wisconsin–Madison、Science Buddies、American Chemical Society。')}</dd></div>
        <div><dt>${t('Analogy limits', '类比边界')}</dt><dd>${t('The mechanism diagrams are labelled “illustrative, not a micrograph”; shapes and colours are only reading aids and arrows don’t imply quantities.', '机制图标注“示意，非显微图”；形状颜色只作阅读编码，箭头不代表计量。')}</dd></div></dl>
      ${board(3, ['Overview board: Why Do Apples Turn Brown?', '总览图：《苹果为什么会变褐》'])}
      <div class="sb-sketches sb-sketches--wide">${sketch('sketch-science-s01', ['S01 · The phenomenon: a peeled apple, browning', 'S01 · 现象：削了皮的苹果在变褐'])}${sketch('sketch-science-s04', ['S04 · The control: lemon juice slows it (labels from the original Chinese run)', 'S04 · 对照：柠檬汁放慢反应'])}</div>`)}

    ${sec('tools', ['Tools & limits', '工具与边界'], ['Tools, honestly', '工具与边界，如实说'], `
      <ul class="i2e-list">
        <li>${t('All 33 sketches were made with Higgsfield gpt_image_2 (1k, high). Every image has a task ID, and the model field was checked from the task record.', '33 张草图全部用 Higgsfield 的 gpt_image_2（1k、high）生成。每张记录任务 ID，并从任务记录核实模型字段。')}</li>
        <li>${t('The skill isn’t tied to one image platform: step 8 first confirms which tools and models are actually available. Without one, it delivers a task package for someone else to generate and fill back in.', 'Skill 不绑定出图平台：第 8 步先确认实际可用的工具和型号。没有可用工具时，交付一份任务包，由他人出图再填回。')}</li>
        <li>${t('The validation script only proves structure: continuous timing, complete fields, type fields, images present at the right aspect. It doesn’t replace looking at the images or human judgement.', '校验脚本只证明结构正确：时间连续、字段齐全、类型专属字段、草图存在且画幅正确。它不代替看图和人工判断。')}</li>
        <li>${t('Method sources: director, storyboard and asset-management methods adapted from Alianess/minimax-h3-director-prompts (MIT); brand shot grammar references whystrohm/shotkit (Apache-2.0). The three creative methods, cinematography standard, output contract, quality review and all scripts are original.', '方法来源：导演、分镜与素材管理方法改编自 Alianess/minimax-h3-director-prompts（MIT）；品牌镜头语法参考 whystrohm/shotkit（Apache-2.0）。三种创作方法、摄影标准、输出格式、质量检查和全部脚本为原创。')}</li>
        <li>${t('Limits: the sketches are composition frames, not final shots; some science diagrams carry Chinese labels because the original run was in Chinese; “viral” mechanisms are assumptions; the user-acceptance layer was me, so it isn’t independent review.', '边界：草图是构图参考，不是成片；科普的部分示意图带中文标注，因为原始运行是中文的；“能火”的机制是假设；用户验收层是我自己，不算独立评审。')}</li></ul>`)}

    ${sec('reflect', ['Reflection', '反思'], ['What I’d take forward', '我带走的'], `
      ${p('The most useful decision was refusing to let the topic choose the method. Asking one direction-setting question, then enforcing type-specific fields in code, is what made three very different films come out of the same skill. The second was separating “the structure is valid” from “the film is good”: the script can prove the first, but only looking at every frame, and logging every redo, gets you near the second.', '最有用的决定是不让主题词替方法做决定。先问一个定方向的问题，再用代码强制类型专属字段，三部完全不同的片子才能从同一个 Skill 里出来。第二是把“结构正确”和“片子好”分开：脚本能证明前者，后者只能靠逐帧看图、记录每次返工来逼近。')}
      <p class="i2e-note">${note}</p>`)}
    <nav class="project-nav"><a href="project-doodle-to-real.html">${t('Doodle to Real', '手绘入画')}</a><a class="back-link" href="work.html">${t('Back to All Work', '返回全部作品')}</a></nav></article>
  <script>
  (()=>{const v=document.querySelector('[data-i2e-video]'),a=document.querySelector('[data-i2e-demo]');
    const apply=()=>{const zh=document.documentElement.lang.startsWith('zh');
      if(v){const want=zh?v.dataset.zh:v.dataset.en,s=v.querySelector('source');if(s.getAttribute('src')!==want){const playing=!v.paused;v.pause();s.setAttribute('src',want);v.setAttribute('poster',zh?v.dataset.posterZh:v.dataset.posterEn);const tr=v.querySelector('track');if(tr){if(zh)tr.remove();}v.load();if(playing)v.play().catch(()=>{});}}
      if(a)a.setAttribute('href',zh?a.dataset.zh:a.dataset.en);};
    apply();document.addEventListener('portfolio:language',apply);})();
  </script><script src="scripts/case-lightbox.js" defer></script>`;
  return document('Yifan Zhu | Storyboard Skill', body);
}

// Idea to Edit / 灵感成片 — a feature concept for CapCut (剪映), done solo in five days: one of three October pieces on
// AI × video (product, creative technology, agent workflow). English copy follows the English case study; the Chinese is condensed from the 26-page planning
// document along the same structure. Screenshots switch with the language (the zh/ twins), so do the film and the demo.
const A = 'assets/projects/idea-to-edit/';
const DEMO_ZH = 'https://zhuyifan001225.github.io/jianying-inspiration-demo/';

export function renderIdeaToEdit(t, document) {
  const img = (f, alt, i18n = true) => `<img${i18n ? ' data-i18n-img' : ''} src="${A}${f}.webp" alt="${t(...alt)}" loading="lazy" decoding="async" />`;
  // a screenshot with its numbered callouts under it
  const shot = (f, cap, leg = [], cls = '') => `<figure class="i2e-fig ${cls}" data-zoom>${img(f, cap)}<figcaption><p>${t(...cap)}</p>${leg.length ? `<ol class="i2e-leg">${leg.map(([n, en, zh]) => `<li><i>${n}</i>${t(en, zh)}</li>`).join('')}</ol>` : ''}</figcaption></figure>`;
  const diagram = (f, cap) => `<figure class="i2e-fig i2e-fig--d" data-zoom>${img(f, cap)}<figcaption><p>${t(...cap)}</p></figcaption></figure>`;
  const sec = (id, label, title, body) => `<section class="case-section" id="${id}"><div class="case-label">${t(...label)}</div><div class="case-content">${title ? `<h2>${t(...title)}</h2>` : ''}${body}</div></section>`;
  const h3 = (en, zh, id = '') => `<h3${id ? ` id="${id}"` : ''}>${t(en, zh)}</h3>`;
  const p = (en, zh) => `<p>${t(en, zh)}</p>`;
  const note = t('Unofficial concept. Not affiliated with ByteDance or CapCut. Stock footage; AI generation is simulated.', '非官方概念设计，与字节跳动 / 剪映无关；画面为授权实拍素材，AI 生成过程为演示。');
  const idx = [['idea', ['The idea', '核心想法']], ['overview', ['Why', '为什么']], ['insight', ['Insight', '洞察']], ['direction', ['Direction', '方向']], ['design', ['Design', '功能']], ['build', ['Feasibility', '可行性']], ['measure', ['Metrics', '指标']], ['demo', ['Prototype & film', '原型与视频']], ['reflect', ['Reflection', '反思']]];

  const body = `<article class="full-case single-project am-case i2e"><a class="back-link" href="work.html">${t('Back to All Work', '返回全部作品')}</a>
    <section class="case-head am-head"><div><p class="eyebrow">${t('Product concept · Interaction design · Prototype · Oct 2026', '产品概念 · 交互设计 · 可交互原型 · 2026 年 10 月')}</p>
      <h1>${t('Idea to Edit', '灵感成片')}</h1>
      <p>${t('Turn one idea into a video you can keep editing. A feature concept for CapCut: a sentence or a photo becomes an editable project, and when one part feels wrong you fix that part — by emotion, or by marking a few clips.', '一句想法出片，哪里不满意改哪里。为剪映策划的新功能：一句话或一张照片，直接生成一个可编辑的剪辑工程；哪一段不对，就按情绪调那一段，或者标记几个片段一次返工。')}</p>
      <p class="i2e-note">${note}</p></div>
      <figure class="am-hero">${img('hero', ['The Idea to Edit timeline: emotion, video, music, SFX and voice tracks, each one separate', '灵感成片的时间线：情绪、视频、音乐、音效、人声五条轨道，各自独立'])}<figcaption>${t('The result of one sentence: a CapCut project with every track separate, not a single video file.', '一句话的结果：一个分轨的剪映工程，而不是一条压好的视频。')}</figcaption></figure></section>

    <section class="am-tldr" aria-label="${t('In 30 seconds', '30 秒速读')}"><p class="am-tldr-title">${t('In 30 seconds', '30 秒速读')}</p><dl>
      <div><dt>${t('My role', '我的角色')}</dt><dd>${t('Solo, 5 days: research, strategy, interaction design, interactive prototype, demo film', '独立完成，5 天：调研、策略、交互设计、可交互原型、演示视频')}</dd></div>
      <div><dt>${t('The question', '问题')}</dt><dd>${t('How should AI video generation live inside an editor people already use? Starting point: one idea in, a finished piece out', 'AI 视频生成应该怎样长在一个大家已经在用的剪辑器里？起点：一句想法进去，一支成片出来')}</dd></div>
      <div><dt>${t('The reframe', '我的判断')}</dt><dd>${t('“One-click video” already exists. People give up after generation, when fixing one part means regenerating everything.', '“一键出片”已经不稀缺。人们放弃是在生成之后：改一处就得整片重来。')}</dd></div>
      <div><dt>${t('The answer', '方案')}</dt><dd>${t('Generate straight into an editable timeline; revise by emotion node or by marking clips; every version kept', '直接生成到可编辑的时间线；按情绪节点或标记片段局部返工；每个版本都保留')}</dd></div></dl>
      <ul class="am-skills" aria-label="${t('Skills shown', '体现的能力')}">${[['Product strategy', '产品策略'], ['Journey mapping', '用户旅程'], ['Interaction design', '交互设计'], ['AI product design', 'AI 产品设计'], ['Prototyping', '原型制作'], ['Feasibility & metrics', '可行性与指标']].map(k => `<li>${t(...k)}</li>`).join('')}</ul></section>
    <nav class="ux-case-index" aria-label="${t('Case contents', '案例目录')}" data-case-index>${idx.map(([id, l]) => `<a href="#${id}">${t(...l)}</a>`).join('')}<a class="ux-index-top" href="#main">${t('↑ Top', '↑ 顶部')}</a></nav>

    <section class="case-section i2e-two" id="idea" aria-label="${t('The idea in one screen', '一屏看懂')}"><div class="case-label">${t('The idea', '核心想法')}</div><div class="case-content"><h2>${t('One sentence in, an editable project out. Then fix only what bothers you.', '一句话进去，一个可编辑的工程出来。然后，哪里不满意改哪里。')}</h2>
      <div class="i2e-two-grid">
        <a class="i2e-two-card" href="#emotion"><span class="i2e-two-img">${img('d5', ['Emotion nodes on the timeline', '时间线上的情绪节点'])}</span><b>${t('Fix by emotion', '按情绪改')}</b><span>${t('“This part should feel more upbeat.” The timeline carries emotion as editable nodes; the system says what it will change before it generates anything.', '“这一段要更欢快一点。”情绪是时间线上可编辑的节点，系统先告诉你会改什么，再生成。')}</span></a>
        <a class="i2e-two-card" href="#redo"><span class="i2e-two-img">${img('s09', ['Mark and batch redo', '标记并批量返工'])}</span><b>${t('Fix by clip', '按片段改')}</b><span>${t('“Clips 2 and 4 are off.” Mark them, describe each problem, redo them together. Everything else stays, and every version is kept.', '“第 2、4 段不对。”标记、各写一句问题、一起返工。其余不动，每个版本都保留。')}</span></a>
      </div></div></section>

    ${sec('overview', ['Why', '为什么'], ['Not a better generator. A better “after”.', '不是生成得更好，而是生成之后改得动。'], `
      ${p('CapCut can already turn a script into a video, and several apps generate storyboards from a sentence. While researching I noticed that creators rarely give up at the first generation. They give up afterwards: one part feels wrong, the only option is to regenerate everything, and the parts they liked change too. So I designed for what happens after generation: the output is a CapCut project with every track separate, and revision is local.', '剪映已经能把脚本变成视频，相关产品也能从一句话生成故事板。调研时我发现，创作者很少在第一次生成时放弃，放弃是在之后：一处不满意，只能整片重来，连满意的部分也跟着变了。所以我把设计重心放在“生成之后”：结果是一个分轨的剪映工程，修改只动局部。')}`)}

    ${sec('insight', ['Insight', '洞察'], ['What users say vs. what they mean', '用户说出口的，和他真正想要的'], `
      ${p('I started from one concrete prompt a parent might type after a weekend trip:', '我从一句具体的话开始。假设一位妈妈周末带女儿和狗狗去了海边，回来后在剪映里输入：')}
      <blockquote class="am-quote">${t('“Took my daughter and our dog to the beach on a rainy day. It was a bit of a letdown at first, but we ended up having so much fun. I want to turn it into a warm family vlog.”', '“下雨天带女儿和狗狗去海边，本来有点扫兴，结果玩得特别开心。想剪成一支温暖的家庭 vlog。”')}</blockquote>
      ${p('It looks clear, but it contains three layers, and people can express each layer very differently.', '这句话看起来很清楚，但拆开看包含三层信息，而用户对每一层的表达能力完全不一样。')}
      ${diagram('d1', ['Three layers inside one prompt: events, emotion, defaults', '一句话里的三层信息：事件、情绪、默认'])}
      <ul class="i2e-list">
        <li><b>${t('Events', '事件层')}</b>${t('(who, where, what) are easy to say, and AI rarely gets them wrong.', '谁、在哪、做了什么。用户说得最清楚，AI 也很少出错。')}</li>
        <li><b>${t('Emotion', '情绪层')}</b>${t('(“a letdown”, “warm”) is the real point, but users only have adjectives. They can’t describe shots, pacing or music. This is where AI misreads most: “warm” becomes an orange filter.', '“扫兴”“温暖”才是重点，但用户只有形容词，说不出该放慢节奏还是换一段音乐。AI 在这里最容易出错：把“温暖”理解成一层暖色滤镜。')}</li>
        <li><b>${t('Defaults', '默认层')}</b>${t('(“same daughter and dog in every shot”, “documentary feel”) are never said at all, so they’re the easiest to break.', '女儿和狗在每个镜头里应该长得一样、整支片子应该统一质感。没人会说出来，所以最容易被破坏。')}</li></ul>
      ${p('Each layer gets its own design answer: show AI’s understanding so events can be checked; turn emotion into something editable on the timeline; lock appearance with reference images.', '每一层都有对应的设计回应：把 AI 的理解摊开，让事件能被检查；把情绪变成时间线上可编辑的对象；用参考图锁定长相。')}
      ${h3('Three kinds of users, one shared gap', '三类用户，卡在同一个地方')}
      <ul class="i2e-list">
        <li><b>${t('Young creators', '年轻的故事创作者')}</b>${t('have ideas but no storyboard skills. They need to see what AI understood before committing.', '手里有故事和感觉，不会写分镜。需要 AI 先把想法翻译成画面，而且这个翻译过程要看得见、改得了。')}</li>
        <li><b>${t('Designers', '设计师')}</b>${t('care about control: keep the subject, type and layout intact while adding motion.', '手里通常是一张静态图。最在意主体、构图和文字不能被改坏。')}</li>
        <li><b>${t('Short-video creators', '短视频创作者')}</b>${t('publish often. Their typical feedback is “the draft is fine, just clips 2 and 4 are off”. Their biggest cost isn’t the first generation, it’s rework.', '追求更新频率。典型反馈是“初稿还行，就第 2、4 段不对”。最大的成本不是第一次生成，而是返工。')}</li></ul>
      ${p('None of them lacks a starting point. What’s missing is the path from a first draft to “this feels right”.', '三类人都不缺一个“起点”，缺的是从起点走到满意的那段路。')}
      ${h3('The journey: the lowest point is revision', '从一个想法到发布：旅程的最低点在修改')}
      ${diagram('d2a', ['Journey map, part 1: stages, quotes and the emotion curve', '用户旅程（上）：阶段、原话与情绪曲线'])}
      ${diagram('d2b', ['Journey map, part 2: tools, pain points and opportunities', '用户旅程（下）：工具、痛点与机会'])}
      ${p('Mapping the end-to-end journey made two problems visible. Tools are scattered: storyboard, generation, music and editing all happen in different apps. And emotion keeps dropping, hitting bottom at the revision step: “I regenerated it again and lost the part I already liked.”', '把整个过程拆成五个阶段后，两个问题变得清楚。一是工具分散：写分镜、生成画面、配音乐、剪辑分别在不同的产品里。二是越往后情绪越低，最低点出现在最后的“修改”：每一次修改都不可预期、不能只改局部、改坏了也回不去。')}
      ${p('That’s why I focused the design on revision, making it predictable (tell me what you’ll change first), local (only touch what I selected) and reversible (every version is kept).', '这也是我把设计重心放在“修改”这一步的原因：让修改可预期（改之前先告诉你会怎么改）、可局部（只动选中的部分）、可撤回（每个版本都保留）。')}`)}

    ${sec('direction', ['Direction', '方向'], ['Choosing the direction', '为什么是这个方向'], `
      ${diagram('d3', ['Positioning: easy to start vs. easy to edit locally', '定位图：起步门槛 × 结果能否局部修改'])}
      ${p('Mapping existing tools by “how much expertise you need to start” and “can you edit the result locally” shows a gap. Tools that are easy to start produce a single, uneditable video; tools that are editable need professional skills. The top-right — start with one sentence, and still edit any part — wasn’t well served.', '把现有产品放在“起步门槛”和“结果能不能局部修改”两个维度上，空白很明显：起步容易的产品，结果是一整条改不动的视频；改得动的工具，起步需要专业知识。右上角——一句话就能开始，而且结果可以局部修改——还没有被很好地满足。')}
      ${h3('Three candidates, I chose the first', '三个候选，我选了第一个')}
      <ol class="i2e-options">
        <li><b>${t('Emotion director', '情绪导演')}</b><span>${t('Turn the emotional arc into editable timeline nodes. Chosen: closest to the core question, serves all three user types, and targets the lowest point of the journey directly.', '把情绪走向变成时间线上可调整的节点。选它：最贴合核心问题，能同时服务三类用户，直接对准旅程的最低点。')}</span><em>${t('Chosen', '已选')}</em></li>
        <li><b>${t('Layout guardian', '版式守护')}</b><span>${t('Protect text, logos and subjects when designers animate posters. Kept as a principle inside the photo entry rather than a separate feature.', '设计师把海报做成动态时，保护文字、Logo 和主体。它的核心被放进了图片入口，而不是单独做一个功能。')}</span></li>
        <li><b>${t('Reference calibration', '参考风格校准')}</b><span>${t('Explain why a result doesn’t match a reference. Valuable, but narrower, and close to what reference-based generation already does.', '生成结果不像参考图时，告诉系统哪里不像。有价值，但人群更窄，也和现有的“参考图生成＋指令编辑”重合太多。')}</span></li></ol>
      ${h3('Principles I set for myself', '我给自己定的几条规矩')}
      <ul class="i2e-list">
        <li><b>${t('Draft first, then edit.', '先出初稿，再让人改。')}</b>${t('No forms before generation. One sentence gets you a full draft; refining is optional.', '生成前不填表。一句话就能走到完整初稿，想细调的人再看分镜。')}</li>
        <li><b>${t('Generate into the timeline.', '生成就发生在时间线里。')}</b>${t('The output is a project, not a download link. Every track stays separate.', '结果不是下载链接，而是时间线上的片段和音轨，各轨独立。')}</li>
        <li><b>${t('Change only what you touch.', '改哪里，只动哪里。')}</b>${t('Manual edits are never silently overwritten; redo applies only to selected clips; AI changes arrive as candidates.', '手动改过的地方 AI 不会悄悄覆盖；返工只作用于选中的片段；AI 的修改先给候选，确认后才替换。')}</li>
        <li><b>${t('Don’t fake precision.', '不假装精确。')}</b>${t('Emotion nodes express the creator’s intent, not a measurement of the viewer, so there is no “emotion accuracy score”.', '情绪节点表达的是创作者的意图，不是对观众情绪的测量，所以界面里没有任何“情绪准确率”。')}</li></ul>`)}

    ${sec('design', ['Design', '功能'], ['How it works', '灵感成片是怎么工作的'], `
      <nav class="i2e-subnav" aria-label="${t('In this section', '本节内容')}">${[['entry', 'Entry', '入口'], ['understand', 'AI’s understanding', 'AI 的理解'], ['storyboard', 'Storyboard', '分镜'], ['timeline', 'Timeline', '时间线'], ['emotion', 'Emotion nodes', '情绪节点'], ['redo', 'Mark & redo', '标记返工'], ['photo', 'From a photo', '图片入口']].map(([id, en, zh], i) => `<a href="#${id}"><i>${i + 1}</i>${t(en, zh)}</a>`).join('')}</nav>
      ${diagram('d4', ['Two entry points into one editable timeline', '两个入口，汇进同一条可编辑的时间线'])}
      ${h3('Start from a sentence or a photo', '从一句话或一张照片开始', 'entry')}
      ${p('The entry sits under “New project” on the CapCut home screen: text on the left, photo on the right. Text accepts a sentence to a full script, with an optional reference image to lock a look. Two buttons: generate a full draft, or refine the storyboard first.', '入口放在剪映首页「开始创作」的下方：左边从文字开始，右边从图片开始。文字入口接受一句话到一段故事，可以挂一张参考图锁定长相或风格。两个按钮：「一键成片」直接给初稿，「先细化分镜」先把 AI 拆好的分镜给你看。')}
      ${shot('s01', ['Home entry: text on the left, photo on the right', '首页入口：左边从文字开始，右边从图片开始'], [[1, 'New entry “Idea to Edit”: one idea → an editable video', '新入口「灵感成片」：一个想法 → 可编辑成片'], [2, 'Start from text: a sentence, story or script', '从文字开始：一句话 / 一段故事 / 脚本'], [3, 'Optional reference: lock a look or style', '可选参考图：锁定长相或风格'], [4, 'Duration', '时长'], [5, 'Refine storyboard first: edit, then generate', '先细化分镜：先改再生成'], [6, 'Generate full draft: straight to a first cut', '一键成片：直接出初稿'], [7, 'Start from a photo: pick a sample or upload', '从图片开始：选示例或上传'], [8, 'AI reads the photo, then suggests directions', 'AI 先读图再给方向']])}
      ${h3('Show what AI understood', '先让用户看到 AI 理解了什么', 'understand')}
      ${p('Instead of a spinner, AI lays out its understanding step by step: theme, cast, emotional arc, output format, then characters with reference images, then the storyboard row by row. Misunderstandings are cheapest to catch here, and the wait becomes useful.', '点击之后不是一个转圈的进度条，而是把 AI 的理解一条条摊开：主题、角色、情绪走向、成片规格，然后是每个角色一张参考图，再是逐行成形的分镜。理解错了在这一步就能发现，等待也变成了预览。')}
      <details class="i2e-more"><summary>${t('See the understanding screen', '看 AI 理解过程的界面')}</summary>${shot('s02', ['AI lays out its understanding: summary, theme, cast, emotional arc, then the characters', 'AI 一步步摊开它的理解：梗概、主题、角色、情绪走向，以及人物设定'], [[1, 'Visible progress: 6 steps, one by one', '处理过程可见：6 个步骤逐个完成'], [2, 'AI’s understanding: summary, theme, cast, emotional arc', 'AI 的理解：梗概＋主题 / 角色 / 情绪走向'], [3, 'Characters appear as the steps complete', '人物设定随步骤出现'], [4, 'Storyboard fills in row by row', '分镜逐行生成中']])}</details>
      ${h3('Every cell of the storyboard is editable', '分镜表的每一格都能改', 'storyboard')}
      ${p('Every cell is editable: description, shot size, camera, dialogue and speaker, cast (which brings their reference images), framing reference. AI can also suggest a missing shot and explain why.', '分镜表里每一项都能改：画面描述、景别、运镜、台词和说话人、出场角色（决定这一镜带哪些参考图）、构图参考。AI 补充的“拍摄细节”对用户可见、可改，不是黑盒。')}
      ${shot('s03', ['Storyboard: every cell is editable', '分镜表：每一格都能直接修改'], [[1, '“How to edit” tips stay visible', '「怎么改」说明常驻'], [2, 'Sketch', '分镜草图'], [3, 'Shot description: edit directly', '画面描述：直接改写'], [4, 'Shot details added by AI (light / framing / action)', 'AI 补充的拍摄细节（光线 / 构图 / 动作）'], [5, 'Shot size: pick or custom', '景别：下拉选 / 自定义'], [6, 'Camera', '运镜'], [7, 'Dialogue + speaker', '台词＋说话人'], [8, 'Duration', '时长'], [9, 'Cast (with reference images)', '出场角色（带人物参考图）'], [10, 'Framing reference', '本镜构图参考'], [11, 'Reorder / delete', '调序 / 删除']])}
      ${h3('Generated straight into the timeline', '生成结果直接长在时间线上', 'timeline')}
      ${p('Clips fill the timeline in place. The result is a CapCut project with emotion, video, music, SFX and voice tracks, with no download-and-re-import step. On top of CapCut’s existing layout I added only one emotion track and three panels, so current users don’t have to relearn anything.', '十个片段在时间线上原位生成、逐个回填，先完成的先能播放。结果是一个带情绪、视频、音乐、音效、人声五条轨道的剪映工程，省掉了“下载素材再导入”的环节。我在剪映原有布局上只加了一条情绪轨和三个面板，老用户不用重新学。')}
      ${shot('s06', ['Editor overview: script left, preview centre, tracks below, three panels right', '剪辑工作区总览：左侧脚本、中间预览、下方分轨时间线、右侧三个面板'], [[1, 'Your idea + AI understanding + refs', '你的灵感＋AI 理解＋参考图'], [2, 'Script: click a line, preview and timeline jump there', '分镜脚本：点哪段，画面和时间线跳到哪段'], [3, 'Full draft preview (with captions)', '完整初稿预览（含字幕）'], [4, 'Emotion track', '情绪轨'], [5, 'Video clips (numbered like the script)', '视频片段（编号与脚本对应）'], [6, 'Music', '音乐'], [7, 'SFX', '音效'], [8, 'Voice / dialogue: each track separate', '人声 / 对白：每轨独立调'], [9, 'Clip / Emotion nodes / Redo list', '片段 / 情绪节点 / 返工清单']])}
      ${h3('Fix by emotion: emotion nodes', '改到满意：情绪节点', 'emotion')}
      ${p('This is the core idea. The hardest thing for users to express, emotion, becomes a visible, editable object on the timeline. The film is split into beats (“A bit let down → Surprise · Running wild → Warm”), each with a feeling, a range and an intensity.', '这是我最想解决的部分，也是这个方案和“对话式重新生成”最本质的区别：把用户最难表达的“情绪”，变成时间线上一个看得见、摸得着的对象。情绪轨把整支片子分成三段：有点扫兴、意外·撒欢、温暖，每段有感受、时间范围和表达强度。')}
      ${diagram('d5', ['Emotion nodes on the timeline', '时间线上的情绪节点'])}
      ${p('Say “more upbeat” at strong intensity for the middle beat. Before generating anything, the system lists how each clip will change — brighter, warmer, bigger movement, music shifting to a major key — and keeps characters and story unchanged. Results arrive as candidates to preview, not overwrites.', '比如觉得中间“撒欢”那段不够欢快，就选中它，说一句“更欢快”，强度调到“明显”。系统不会马上动手，而是先列出每个片段打算怎么改：画面更亮更暖、动作幅度更大、音乐转成上扬的大调；人物和故事不变。确认后生成的是候选版本，预览满意了才应用。')}
      ${shot('s08b', ['Adjusting an emotion node, with an impact preview before anything is generated', '调整情绪段：一句话要求、强度、影响范围，以及生成前的影响预览'], [[1, 'Selected emotion node', '选中的情绪段'], [2, 'One line or a preset: More upbeat', '一句话或快捷选项：更欢快'], [3, 'Intensity: Subtle / Moderate / Strong', '强度：含蓄 / 适中 / 明显'], [4, 'Which clips it affects', '影响哪几段'], [5, 'Shows how each clip will change first', '生成前先告诉你每段怎么变'], [6, 'Generate candidates (doesn’t overwrite)', '生成候选（不直接覆盖）']])}
      <blockquote class="am-quote">${t('“Tell me what you’ll change first” turns revision from a lottery into a decision.', '“先告诉你怎么改”，让修改从“抽奖”变成了“决定”。')}</blockquote>
      ${h3('Fix by clip: mark and batch redo', '改到满意：只改不满意的那几段', 'redo')}
      ${p('Sometimes the emotion is fine and only a few shots are off. Users mark any clips (2, 4, 8, 10), describe each problem, and redo them in one batch. Each clip shows its own status; a failed clip is retried alone; old and new versions are compared side by side; every version is kept for undo.', '另一种常见情况是情绪没问题，只是某几个镜头不对。用户在时间线上标记任意片段（第 2、4、8、10 段），每段写自己的问题，一键批量返工。每段独立显示状态；失败只重试那一段；新旧版本并排对比；每个版本都保留，随时回退。')}
      ${shot('s09', ['Mark the clips you dislike, describe each problem, redo them in one batch', '标记不满意的片段，每段写自己的问题，一键批量返工'], [[1, 'Mark the clips you dislike (any order)', '标记不满意的片段（可不连续）'], [2, 'Marked 2, 4, 8, 10', '已标记 2、4、8、10'], [3, 'Describe each problem', '每段写自己的问题'], [4, 'What to change: visual / motion / sound / emotion', '改什么：画面 / 动态 / 声音 / 情绪'], [5, 'Batch redo; other clips stay', '一键批量返工，其余片段保留'], [6, 'v2: emotion tweak applied', 'v2：情绪调整已应用的版本']])}
      ${shot('s11', ['Compare old and new; AI explains what changed and what didn’t', '新旧版本并排对比，AI 说明改了什么、没改什么'], [[1, 'Original', '原版'], [2, 'New: now a close-up', '新版：换成特写'], [3, 'AI explains what changed and what didn’t', 'AI 说明改了什么、没改什么'], [4, 'Apply new', '应用新版'], [5, 'Or close compare', '或关闭对比']])}
      <details class="i2e-more"><summary>${t('Two details: retrying a failed clip, and the version history', '两个细节：失败重试，以及版本历史')}</summary><div class="i2e-pair">
        ${shot('s10b', ['A failed clip is retried alone; finished ones stay', '失败只重试这一段，已完成的保留'], [[1, 'Retry only the failed clip', '失败只重试这一段']])}
        ${shot('s12', ['Every version is kept; revert any time', '每段保留全部版本，随时回退'], [[1, 'Undo / redo', '撤销 / 重做'], [2, 'Every version kept; revert any time', '每段保留全部版本，随时回退']])}</div></details>
      ${p('Local redo is also cheaper: regenerating 4 of 10 clips costs about 40% of a full re-run. And not every fix needs AI. The clip panel also offers ordinary edits — duration, per-clip music and voice levels, ducking under dialogue — so problems that ordinary editing can solve never trigger a regeneration.', '局部返工也直接影响成本：只重做 10 段里的 4 段，大约是整片重做的 40%。而且并不是所有修改都需要 AI，片段面板里也提供常规编辑：调时长、单独调这一段的音乐和人声音量、对白时自动压低音乐。能用常规剪辑解决的，就不重新生成。')}
      ${diagram('d6', ['Cost: full regeneration vs. local redo', '成本：整片重做 vs. 局部返工'])}
      ${h3('Start from a photo', '从一张照片开始', 'photo')}
      ${p('For designers and people who only have a photo: AI reads the image (subject, light, mood, framing, a story worth telling) and offers three directions. Bring it to life keeps the photo as the first frame; Make it the star of a short film uses the photo as the lead’s reference image; Animated poster adds a slow push and typeset titles, so the text is never redrawn by the model.', '图片入口为设计师和“手里只有照片”的用户准备。上传后 AI 先读图：主体、光线、情绪、构图，还有一个“可以讲的故事”，然后给三个方向。「让它动起来」以原照片为第一帧；「以它为主角拍短片」把照片设为主角参考图，延展出五个镜头；「动态海报」缓推镜头、标题依次浮现，文字由排版层负责，不交给模型重画。')}
      ${shot('s14b', ['Photo entry: AI reads the photo, then offers three directions', 'AI 读完照片后给出三个方向，可以再补一句想法'], [[1, 'Finds a story to tell', '读出可以讲的故事'], [2, 'Bring it to life', '让它动起来'], [3, 'Make it the star of a short film', '以它为主角拍短片'], [4, 'Animated poster', '动态海报'], [5, 'Add a note (optional)', '可补一句想法']])}
      <details class="i2e-more"><summary>${t('See the three photo directions', '看图片入口的三个方向')}</summary><div class="i2e-pair">
        ${shot('s15', ['Bring it to life: clip 1 is the photo, clip 2 continues from it', '让它动起来：第 1 段就是原照片，第 2 段从照片延续'], [[1, 'Clip 1 = your photo (first frame unchanged)', '第 1 段＝原照片（首帧不变）'], [2, 'Clip 2 = motion continuing from the photo', '第 2 段＝从照片延续的动态']])}
        ${shot('s16', ['Star of a short film: the photo becomes the lead’s reference image, five shots extended by AI', '以它为主角拍短片：照片自动成为主角参考图，延展出 5 个镜头'], [[1, 'Uploaded photo', '上传的照片'], [2, 'Photo becomes the lead’s reference image', '照片自动成为主角参考图'], [3, '5 shots extended by AI, all editable', 'AI 延展出的 5 个镜头，同样可改']])}</div>
      ${shot('s17', ['Animated poster: slow push and titles revealed in sequence', '动态海报：缓推镜头，标题依次浮现'], [], 'i2e-fig--half')}</details>`)}

    ${sec('build', ['Feasibility', '可行性'], ['Can it be built?', '能不能做出来'], `
      ${diagram('d7', ['Technical pipeline: every step uses capabilities that already exist', '技术链路：每个环节都有现成能力'])}
      <ul class="i2e-tags"><li><b>${t('Exists', '现成')}</b>${t('LLM · image generation · reference-based video generation · speech, music, SFX', '大语言模型 · 图像生成 · 参考视频生成 · 语音、音乐、音效')}</li><li><b>${t('New', '新建')}</b>${t('writing clips, tracks, emotion nodes and versions into an editable project', '把片段、音轨、情绪节点和版本写进可编辑的工程')}</li></ul>
      ${p('Every step uses capabilities that already exist: an LLM for understanding and storyboards, image generation for reference images, reference-based video generation for clips, and speech, music and SFX generation for audio. The genuinely new part is step five: writing clips, tracks, emotion nodes and versions into an editable CapCut project and keeping them linked.', '前四步——理解与分镜、角色参考图、分镜画面、声音——都可以由现有的大语言模型、图像生成、多模态参考视频生成、语音与音乐生成完成。真正需要新建的是第五步：把片段、音轨、情绪节点和版本写进剪映工程，并维护它们之间的关联。')}
      ${p('Emotion nodes don’t need a new model. They’re a metadata layer in the storyboard that links an intent to a range of clips; a redo turns the node plus the user’s sentence into per-clip generation parameters (tone, brightness, motion, camera speed, musical key, volume), only for clips the user hasn’t locked.', '情绪节点不需要新模型。它本质上是分镜数据里的一层元数据，把“意图”和“片段范围”关联起来；返工时，系统把节点和用户的一句话转换成范围内每个片段的生成参数（色调、亮度、动作幅度、运镜速度、音乐调式与音量），只对用户没有锁定的片段生成候选。')}
      ${p('Known limits I’d design around in v1: faces drift most in group shots, profiles and backs; large motions distort hands and clothing; multi-speaker lip-sync is unreliable. So v1 caps main characters at three and shots at 15 seconds, and says so up front.', '目前做不好的地方：多人同框、侧脸和背影最容易“变脸”；大幅度动作会让手部和服装变形；多人同时说话时口型还不稳定。所以首版限制主要人物不超过三个、单镜不超过 15 秒，并且把这些限制在界面上提前说清楚。')}
      <ol class="i2e-rollout"><li><b>1</b>${t('Text entry, editable storyboard, generate-to-timeline, single-clip redo and versions', '文字入口、可改分镜、时间线内生成、单段返工和版本回退')}</li><li><b>2</b>${t('Emotion nodes, batch redo, compare', '情绪节点、多段标记批量返工、新旧对比')}</li><li><b>3</b>${t('Photo entry, animated posters, one-tap publishing', '图片入口、动态海报、一键发布')}</li></ol>`)}

    ${sec('measure', ['Metrics', '指标'], ['How I’d know it works', '怎么判断做对了'], `
      ${p('I wouldn’t measure how many people pressed Generate, but how many edited a draft and published it.', '我不看“有多少人点了生成”，而是看“有多少人改完并发布了”。')}
      <table class="i2e-metrics"><thead><tr><th>${t('Question', '它回答的问题')}</th><th>${t('Signal', '怎么算')}</th></tr></thead><tbody>
        <tr><td>${t('Do people revise instead of starting over?', '“只改那一段”有没有被采用？')}</td><td>${t('Share of sessions using local redo vs. full regeneration', '局部返工次数 ÷（局部返工＋整片重做）')}</td></tr>
        <tr><td>${t('Is the draft good enough to build on?', '用户能不能改到满意？')}</td><td>${t('Drafts that get exported after edits', '初稿最终被导出或发布的比例')}</td></tr>
        <tr><td>${t('Are emotion nodes understood?', '情绪是不是一个好理解的修改入口？')}</td><td>${t('Emotion-node edits per project; candidates applied vs. discarded', '调整过情绪节点的作品占比；候选被应用与被放弃的比例')}</td></tr>
        <tr><td>${t('Does it save effort?', '局部返工是否真的省钱？')}</td><td>${t('Time and generation cost from first draft to export', '从初稿到导出的总生成秒数与耗时')}</td></tr></tbody></table>
      ${p('Before launch, I’d run concept tests with 5–8 target users, two or three per group, watching three things: whether they understand emotion nodes and marking without explanation, whether they choose local redo over full regeneration the first time something feels off, and whether “tell me first” makes them more willing to try.', '上线前，我会先找 5 到 8 位目标用户（三类各两位左右）做概念测试，重点看三件事：不经讲解能不能理解“情绪节点”和“标记返工”；第一次想修改时会不会选局部返工而不是整片重做；“先告诉你怎么改”是否让他们更愿意尝试。')}`)}

    ${sec('demo', ['Prototype & film', '原型与视频'], ['See it work', '原型与演示视频'], `
      ${p('The interactive prototype recreates the CapCut desktop editor with two complete stories: a text idea (“Beach Day in the Rain”) and a photo idea (“Doudou’s Day”). Every feature in this case study is clickable. The film walks through every feature in the order above, narrated.', '可交互 Demo 复刻了剪映电脑版界面，包含两个完整案例：文字入口的“下雨天也要去海边”和图片入口的“我家豆豆”。文中提到的每个功能都能在 Demo 里点到。演示视频按本文顺序把所有功能操作一遍，带解说和字幕。')}
      <figure class="i2e-video"><video controls preload="none" playsinline poster="${A}poster-en.jpg" data-i2e-video data-en="${A}demo-film-en.mp4" data-zh="${A}demo-film-zh.mp4" data-poster-en="${A}poster-en.jpg" data-poster-zh="${A}poster-zh.jpg"><source src="${A}demo-film-en.mp4" type="video/mp4" /><track kind="subtitles" src="${A}demo-film-en.vtt" srclang="en" label="English" /></video><figcaption>${t('Demo film · 2 min 34 s, narrated (the Chinese version runs 2 min 9 s)', '演示视频 · 中文版约 2 分 9 秒，带解说（英文版 2 分 34 秒）')}</figcaption></figure>
      <div class="i2e-actions"><a class="i2e-btn" data-i2e-demo data-en="${A}demo-en.html" data-zh="${DEMO_ZH}" href="${A}demo-en.html" target="_blank" rel="noopener">${t('Open the interactive prototype', '打开可交互原型')} <span aria-hidden="true">↗</span></a><span class="i2e-actions-note">${t('Best on a desktop browser. Opens in a new tab.', '建议用电脑浏览器，在新标签页打开。国内网络偶尔较慢，请稍等片刻。')}</span></div>
      ${p('A suggested three-minute path: start from text, choose Refine storyboard first, change one shot size, add a line of dialogue, accept AI’s suggested shot, generate; in the editor click the middle emotion beat, choose More upbeat at Strong, read the impact preview, apply; load the demo marks, redo four clips, compare clip 8, apply, then revert from the version history; back on the home screen, start from the sample photo and choose Bring it to life.', '推荐路径（约 3 分钟）：首页从文字开始，点「先细化分镜」，改一个景别、加一句台词、采纳 AI 建议的镜头，然后生成；在工作区点情绪轨的“意外·撒欢”，选「更欢快」、强度「明显」，看影响预览后应用；点「载入演示标记」批量返工四段，对比第 8 段后应用，再在版本历史里回退；回到首页从图片开始，选「我家豆豆」，看读图结果，选「让它动起来」。')}
      <p class="i2e-note">${note}</p>`)}

    ${sec('reflect', ['Reflection', '反思'], ['What I’d take forward', '我带走的几点'], `
      <ul class="i2e-list">
        <li><b>${t('The most useful reframe was moving from “generate better” to “edit better”.', '最有用的转向是从“生成得更好”到“改得动”。')}</b>${t('It changed the success metric from first-draft quality to how quickly someone reaches a version they’re happy with.', '它把成功的标准从初稿质量，换成了用户多快能改到满意。')}</li>
        <li><b>${t('Emotion is the layer users can say least but care about most.', '情绪是用户最说不清、却最在意的一层。')}</b>${t('Making it an object on the timeline was the bridge between vague adjectives and concrete changes.', '把它变成时间线上的对象，是模糊的形容词和具体修改之间的桥。')}</li>
        <li><b>${t('What’s still untested:', '还没有验证的：')}</b>${t('the personas and journey are based on public sources and product analysis, not interviews. The next step is the concept test above, especially whether emotion nodes are understood without onboarding.', '用户画像和旅程基于公开资料与产品推演，没有做过访谈。下一步是上面的概念测试，尤其是不经讲解时情绪节点能不能被理解。')}</li></ul>`)}
    <nav class="project-nav"><a href="project-beauty-marketplace.html">${t('LOOK — Beauty Marketplace', 'LOOK 见己 · 美容服务平台')}</a><a class="back-link" href="work.html">${t('Back to All Work', '返回全部作品')}</a></nav></article>
  <script>
  // the film and the prototype follow the page language
  (()=>{const v=document.querySelector('[data-i2e-video]'),a=document.querySelector('[data-i2e-demo]');
    const apply=()=>{const zh=document.documentElement.lang.startsWith('zh');
      if(v){const want=zh?v.dataset.zh:v.dataset.en;if(v.querySelector('source').getAttribute('src')!==want){const playing=!v.paused;v.pause();v.querySelector('source').setAttribute('src',want);v.setAttribute('poster',zh?v.dataset.posterZh:v.dataset.posterEn);v.querySelector('track')?.toggleAttribute('default',false);v.load();if(playing)v.play().catch(()=>{});}}
      if(a)a.setAttribute('href',zh?a.dataset.zh:a.dataset.en);};
    apply();document.addEventListener('portfolio:language',apply);})();
  </script>`;
  return document('Yifan Zhu | Idea to Edit', body + '<script src="scripts/case-lightbox.js" defer></script>');
}

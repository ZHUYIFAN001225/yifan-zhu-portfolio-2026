// Display language for the LOOK prototype. The prototype was written with Chinese and English mixed;
// this layer shows it in one language: ?lang=en (default) or ?lang=zh. Data and logic are unchanged.
(function () {
  // Embedded in a case page: never move the visitor's page by focusing inside the frame before they interact with it.
  if (window !== window.top) {
    var nativeFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (opts) { if (!document.hasFocus()) return; return nativeFocus.call(this, Object.assign({}, opts, { preventScroll: true })); };
  }
  var KEY = 'look-demo-lang';
  var params = new URLSearchParams(location.search);
  var lang = params.get('lang');
  try { if (lang === 'en' || lang === 'zh') sessionStorage.setItem(KEY, lang); else lang = sessionStorage.getItem(KEY); } catch (e) { /* no storage */ }
  if (lang !== 'zh') lang = 'en';
  document.documentElement.setAttribute('data-demo-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  var ZH_EN = {
    // entry & sign-in
    "Chrome 镜面美甲": "Chrome nails",
    "法式凝胶美甲": "French gel nails",
    "设计款美甲": "Designer nails",
    "精致法式美甲": "Refined French nails",
    "透明感凝胶美甲": "Sheer gel nails",
    "镜面光泽美甲": "Mirror-shine nails",
    "Balayage 染发": "Balayage colour",
    "全头染色": "Full colour",
    "剪发 + 染发": "Cut + colour",
    "剪发与日常造型": "Cut & everyday styling",
    "短发修剪": "Short cut",
    "自然挑染": "Natural highlights",
    "有类似作品": "has similar work",
    "发送服务 / 价格建议": "Send service / price suggestion",
    "这个月": "this month",
    "先建立一套 Look": "Build a Look first",
    "已回应 · 用户可查看你提供的相似作品": "Replied · the client can see the similar work you sent",
    "已完成服务 · ": "Completed · ",
    "我的主页": "My page",
    "本机模拟对话 · 当前身份：Creator": "Simulated chat on this device · role: Creator",
    "查看评价": "View review",
    "评价已保存，结果图已进入 Community 和 Tagged Work。": "Review saved. Your result photo is now in the community and in Tagged Work.",
    "已模拟完成服务，用户可评价并发布 After Photo": "Service marked complete (demo). The client can now review and post an after-photo.",
    "已用你的真实 Portfolio 作品回应需求": "You replied with your real portfolio work.",
    "简单评价": "Short review",
    "你喜欢这次的效果吗？": "How did you like the result?",
    "上传 After Photo": "Upload after-photo",
    "使用示例结果图": "Use a sample result",
    "提交评价": "Submit review",
    "完成服务后才可以评价": "You can review after the service",
    "从精致法式到镜面光泽，为每一双手找到恰到好处的细节。喜欢干净线条，也喜欢一点小惊喜。": "From refined French to mirror shine, the right detail for every pair of hands. I love clean lines and a small surprise.",
    "偏爱自然的层次、柔和的线条和好打理的发型。每一次改变，都从了解你的生活方式开始。": "I love natural layers, soft lines and hair that is easy to look after. Every change starts with how you live.",
    "保留个人特色，用细腻妆感衬托气色。妆容的色调和浓度可以根据肤色、场合与喜好沟通调整。": "Keep what makes you you, with makeup that lifts your skin. Tone and coverage are agreed for your skin, the occasion and your taste.",
    "在安静的空间里，给肌肤一点休息的时间。根据你的肤质与日常习惯，制定适合的护理方案。": "A quiet hour for your skin, with care planned around your skin type and routine.",
    "用细腻的眉形与自然卷翘，衬托你原本的五官。专注睫毛提升与眉毛塑形。": "Soft brows and a natural curl that frame your features. Lash lifts and brow shaping.",
    "让衣橱更简单，让表达更清晰。以日常需求为起点，为你找到舒适又有个人特色的搭配。": "A simpler wardrobe and a clearer style, starting from your everyday needs.",
    "擅长把颜色融入发型，用自然渐变与柔和挑染，创造随光线变化的层次感。": "Colour woven into the cut: natural gradients and soft highlights that change with the light.",
    "用透明感、细节和微妙的色彩，让日常美甲多一点温柔。专注极简与韩系设计。": "Sheer finishes, small details and subtle colour. Minimal and Korean-style designs.",
    "自然光泽与柔和妆感，让你在重要时刻依然像自己。提供日常、活动与新娘妆容服务。": "A natural glow so you still look like you on big days. Everyday, event and bridal makeup.",
    "给自己留出一段安静的护理时间。专业人士会先了解肌肤状态，再与你确认适合的护理内容。": "Time set aside for care. Your skin is assessed first, then the treatment is agreed with you.",
    "注重轮廓、纹理和日常打理，也提供个人造型建议。": "Focus on shape, texture and easy care, with personal styling advice.",
    '先看见喜欢的，再遇见合适的人。': 'See what you love first, then meet the right person.',
    '今天，从哪个身份开始？': 'Who are you today?', '寻找你的风格，或让自己的作品被看见。': 'Find your style, or get your work seen.',
    'FOR ME · 用户': 'FOR ME · USER', '发现属于我的风格': 'Discover my style', '探索 · 收藏 · 搭配 · 预约': 'Explore · Save · Build · Book',
    '进入用户端 →': 'Enter as user →', '进入 Creator 端 →': 'Enter as Creator →', '让作品遇见新客户': 'Let your work meet new clients',
    '作品 · 服务 · 日程 · 客户': 'Work · Services · Calendar · Clients', '开发演示 · 两个身份的数据在本机联动，方便体验完整流程。': 'Development demo · both roles share data on this device, so you can try the whole flow.',
    '找到属于你的下一种风格。': 'Find your next style.', '从一张心动的图片，开始你的造型旅程。': 'Start your style journey from one picture you love.',
    '使用 Google 继续': 'Continue with Google', '预览': 'Preview', '开发预览 · Google 登录尚未连接': 'Development preview · Google sign-in not connected',
    '或使用演示账号': 'Or use a demo account', '你的称呼': 'Your name', '开始探索': 'Start exploring', '无需真实手机号或密码，演示资料仅保存在当前浏览器。': 'No real phone number or password needed; demo data stays in this browser.',
    '重新选择身份': 'Choose a different role', '哪些感觉，让你心动？': 'Which looks speak to you?', '见己 · 手机交互原型': 'LOOK · interactive mobile prototype',
    'LOOK 手机应用演示': 'LOOK mobile app demo', 'LOOK 首页': 'LOOK home',
    // discover, search, detail
    '搜索发型、美甲、妆容或风格': 'Search hair, nails, makeup or a style', '用示例图体验': 'Try with a sample image', '全部': 'All', '从这些风格开始': 'Start from these styles',
    '大家正在找': 'Trending searches', '上传图片找同款（会员）': 'Find similar from a photo (members)', '搜索': 'Search', '搜索作品': 'Search work',
    '更多探索内容': 'More to explore', '继续发现': 'Keep discovering', '继续看相似图片': 'See more similar pictures', '收藏此作品': 'Save this work',
    '作品详情': 'Work details', '作品选项': 'Work options', '喜欢这个风格': 'Love this style', '参考价格 · 60 分钟': 'Guide price · 60 min',
    '预约这个造型': 'Book this look', 'Hair / 示例作品': 'Hair / sample work', '图片为演示素材，服务与创作者信息为模拟。': 'Images are demo material; services and Creators are simulated.',
    '创作者、作品归属和匹配结果为模拟数据。': 'Creators, attribution and matches are simulated.', 'Visually similar · 演示匹配': 'Visually similar · demo match',
    'Same category · 需确认': 'Same category · to confirm', '3 个新造型与你收藏的风格相近。': '3 new looks are close to styles you saved.', '新通知': 'New', '通知': 'Notifications',
    // build & preview
    '命名': 'Rename', '发型': 'Hair', '妆容': 'Makeup', '上衣': 'Top', '下装': 'Bottom', '鞋履': 'Shoes', '美甲': 'Nails', '配饰': 'Accessories', '穿搭': 'Outfit',
    '已加入 美甲': 'Added: Nails', '已加入 发型': 'Added: Hair', '加入鞋履与配饰，让搭配更完整。': 'Add shoes and accessories to complete the look.',
    'Style Preview 为所选元素的 collage，不承诺真实穿搭或本人照片合成。': 'Style Preview is a collage of your picks, not a real try-on or photo edit.',
    '搭配分析为演示规则，不是对个人外貌的判断。': 'The analysis is a demo rule, not a judgement of anyone’s appearance.',
    // matches & creator
    'Best matches · 演示 Portfolio 匹配': 'Best matches · demo portfolio match', 'GLASGOW · 示意地图': 'GLASGOW · sketch map', 'Glasgow 附近 Creator 示意地图': 'Sketch map of Creators near Glasgow',
    '区域中心示意地图；未连接 Maps / Places，不代表道路或行程时间。': 'Area sketch map; not connected to Maps, so no roads or travel times.',
    '最近可约 10月7日周三 10:00': 'Next free Wed 7 Oct 10:00', '查看作品': 'View work', '发送风格需求': 'Send a style request', '调整附近范围': 'Change nearby range', '调整我的附近范围': 'Change my nearby range',
    '距所选区域约 1.9 mi · 当前范围内': 'About 1.9 mi from your area · in range', 'West End · 约 1.9 miles · 能力尚未确认': 'West End · about 1.9 miles · skills not yet confirmed',
    'Not yet verified on platform · 示例商家': 'Not yet verified · sample business', '喜欢柔和层次与自然纹理。先理解你想表达的感觉，再一起确认可以实现的方案。': 'I love soft layers and natural texture. First I understand the feeling you want, then we agree what is achievable.',
    '查看位置与取消政策': 'Location & cancellation policy', '很喜欢最后的效果，沟通细致。已完成服务 · 示例评价': 'Loved the result and the careful consultation. Completed service · sample review',
    '层次修剪与日常造型 · 60 min': 'Layered cut & everyday styling · 60 min', '60 min · 层次修剪与日常造型': '60 min · layered cut & everyday styling', '层次修剪与日常造型': 'Layered cut & everyday styling',
    '服务前沟通 · 120 min': 'Consultation first · 120 min', '120 min · 服务前沟通': '120 min · consultation first', '服务前沟通': 'Consultation first',
    // booking
    'Client reference · 自动附加': 'Client reference · attached automatically', '查看预约摘要': 'Review booking', '例如：目前头发齐肩，希望保留长度。': 'e.g. Shoulder-length now, want to keep the length.',
    '演示付款': 'Demo payment', 'Deposit £10 · 到店付余款': 'Deposit £10 · pay the rest in person', 'Request Booking · 24 小时内等待确认': 'Request booking · confirmed within 24 h',
    '提前 24 小时取消可退演示预付款；不足时限只保留最多 £10 定金，其余预付款退回。待确认请求可免费撤回。改期也遵守此时限。本 Demo 不收款。': 'Cancel 24 h ahead for a full refund; later, up to £10 deposit is kept and the rest refunded. Pending requests can be withdrawn free. Rescheduling follows the same rule. No real payment in this demo.',
    'Confirm Booking · 模拟付款': 'Confirm booking · simulated payment', '重新选择时间': 'Pick another time', '不收款，不发送真实预约。': 'No charge; no real booking is sent.',
    '灰色时间包含服务冲突和你已有预约；跨 Creator 默认预留 30 分钟，不代表真实路程。时间统一使用 Europe/London；演示日期为 2026 年 10 月。': 'Greyed times clash with the service or your other bookings; 30 min is kept between different Creators. Times are Europe/London; demo dates are October 2026.',
    '服务': 'Service', '演示付款 / 到店余款': 'Demo payment / due in person', '地点': 'Location', '所有订单和付款为本机模拟记录；开发演示允许提前模拟完成服务。': 'Orders and payments are simulated on this device; the demo lets you complete a service early.',
    '本机模拟对话 · 当前身份：Consumer': 'Simulated chat on this device · role: user', '聊聊你喜欢的造型…': 'Talk about the look you like…', '发送': 'Send', '添加附件': 'Add attachment', '消息内容': 'Message',
    '找到附近 Creator': 'Find Creators nearby', '把喜欢的参考图，带到附近。': 'Take the pictures you love to someone nearby.', '留下我的造型需求': 'Leave my style request',
    // profile & settings
    '把喜欢的灵感，变成自己的风格。': 'Turn inspiration into your own style.', '本人照片造型建议 · 开发体验': 'Style ideas on your own photo · preview', '体验': 'Try',
    '切换登录身份': 'Switch account', '退出当前身份': 'Sign out', 'Demo account · 仅本机保存，不创建真实账号。': 'Demo account · saved on this device only; no real account.',
    '个人设置': 'Settings', '演示账号': 'Demo account', '城市': 'City', '选择居住区域与附近范围': 'Home area & nearby range', '预约提醒': 'Booking reminders', '调整我的审美偏好': 'Adjust my taste',
    '演示数据与隐私说明': 'Demo data & privacy', '所有演示数据只保存在此浏览器中。上传图片仅在本机处理，不会上传服务器。': 'All demo data stays in this browser. Uploaded images are processed on this device only.',
    '重新开始演示': 'Restart demo', '会结合收藏、组合、模拟购买和预约持续变化。': 'Updates as you save, build, buy and book.', '建立你的第一套 Look': 'Build your first Look',
    '先从喜欢的图片开始。': 'Start with pictures you love.', '服务完成后，留下真实感受。': 'After a service, share how it really went.', '把每一项安排到合适的时间': 'Schedule each part at the right time',
    '从 Hair、Nails、Makeup 分别查找 Creator 和时间。': 'Find a Creator and time for hair, nails and makeup.', '已关联商品会出现在这里。': 'Linked products appear here.', '继续安排造型': 'Keep planning',
    '让作品成为你的名片': 'Let your work speak for you', '上传照片或先使用本机示例。': 'Upload photos or use the samples.', '使用示例 After Photo': 'Use a sample after-photo',
    '只有点击 Share publicly 后才进入 Community；外部参考默认私密。': 'Only “Share publicly” posts to the community; outside references stay private.',
    // LOOK Plus studio
    '我的造型室': 'My style studio', '会员专属': 'Members', '开发体验 · 暂时开放': 'Preview · open for now', '灵感，穿在自己身上。': 'Inspiration, on you.',
    '从一张照片，找到你喜欢的自己。': 'From one photo, find the you that you like.', '图片找同款': 'Find similar', '把喜欢的参考图，带到附近。 ': 'Take a picture to someone nearby.',
    '适合我的造型': 'Looks that suit me', '从你自己出发，探索更多可能。': 'Start from you and explore what’s possible.', '整体试搭': 'Whole-look try-on', '把收藏的灵感，搭成一整套。': 'Turn saved inspiration into a full look.',
    '我的搭配方案': 'My outfits', '会员功能开发体验；上传图片仅用于本机预览。': 'Member preview; uploaded images are only used on this device.',
    // creator side
    '工作台': 'Workbench', '发现灵感': 'Discover', '我的收藏': 'Saved', '我的作品集': 'My portfolio', '查看我的公开主页': 'View my public page', '编辑职业档案': 'Edit Creator profile',
    '切换演示 Creator': 'Switch demo Creator', '体验哪个 Creator？': 'Which Creator?', '发布作品': 'Post work', '管理服务': 'Services', '刷刷灵感': 'Browse ideas',
    '公开作品': 'Public', '已下架': 'Hidden', '预览我的公开主页': 'Preview my public page', '分享我的主页': 'Share my page', '分享作品': 'Share work',
    '时段': 'Time slots', '设置规则': 'Rules', '操作即时保存并同步消费者可约时间；已预约时段不可覆盖。': 'Changes save instantly and update what clients can book; booked times can’t be overwritten.',
    '使用 5 张示例作品': 'Use 5 sample works', '示例标签可编辑，未做真实 AI 识别。': 'Sample tags are editable; no real AI recognition.', '保存规则': 'Save rules',
    '最早可约由营业时间和 minimum notice 共同决定。': 'The earliest bookable time depends on opening hours and minimum notice.',
    '仅展示本机汇总需求与行为，不暴露用户住址或个人资料。': 'Shows only summary demand on this device, never addresses or personal details.',
    '编辑 Creator 档案': 'Edit Creator profile', 'Home-based · 预约确认前隐藏准确地址': 'Home-based · exact address hidden until confirmed', '更换头像': 'Change photo', '保存资料': 'Save profile',
    '身份验证为演示标记。收费演示：平台引入的新客户首次完成服务收取 15%，重复客户为 0%；取消订单不收获客费。此比例仅为产品假设，尚未定价。': 'Verification is a demo label. Fee demo: 15% on a new client’s first completed service, 0% on repeat clients, nothing on cancellations. A product assumption, not a set price.',
    '查看客户预约': 'View client bookings', '查看客户 Tagged Work': 'View client tagged work', '匿名客户 J · Glasgow': 'Anonymous client J · Glasgow', '£50–70 · 这个月': '£50–70 · this month',
    '选择最类似的真实作品': 'Pick your closest real work', '职业或名字': 'Role or name', '关于此演示': 'About this demo', '关闭': 'Close', '返回': 'Back',
    // looks & tags (data)
    '法式松弛感短发': 'Effortless French bob', '轻盈层次 · 暖棕挑染': 'Light layers · warm brown highlights', '利落线条 · 渐变短发': 'Clean lines · tapered crop', '奶茶色渐变 Bob': 'Milk-tea gradient bob',
    '空气感纹理 · 柔和波浪': 'Airy texture · soft waves', '面部轮廓里的温柔线条': 'Soft lines that frame the face', '像天生好气色的自然妆': 'Naturally fresh makeup', '清透水光 · Soft Glam': 'Dewy glow · soft glam',
    '干净底妆 · 少即是多': 'Clean base · less is more', '微光法式 · 日常精致': 'Shimmer French · everyday polish', '银色镜面 · 极简法式': 'Silver chrome · minimal French', '裸粉色 · 透亮镜面': 'Nude pink · glossy chrome',
    '珍珠光泽 · 温柔法式': 'Pearl sheen · soft French', '粉色与银色的平衡': 'Pink and silver in balance', '金色边缘的小心思': 'A hint of gold at the tips', '原生感眉形 · 轻盈有序': 'Natural brows · light and neat',
    '自然卷翘 · 素颜也有神': 'Natural curl · bright eyes bare-faced', '轻柔卷翘 · 睫毛提升': 'Soft curl · lash lift', '眉毛定型 · 自然生长感': 'Brow lamination · natural growth', '白衬衫的日常新解': 'A fresh take on the white shirt',
    '轻松出门 · 通勤胶囊': 'Easy out the door · commute capsule', '黑白之间 · 简单刚好': 'Black and white · just enough', '暖调渐变 · 柔和轮廓': 'Warm gradient · soft outline', '柔和护理 · 找回水润': 'Gentle care · hydration back',
    '深层清洁 · 慢下来': 'Deep cleanse · slow down', '给肌肤一小时的休息': 'An hour off for your skin', '午后焕新 · 美容护理': 'Afternoon refresh · beauty care', '为重要时刻穿得像自己': 'Dress like yourself for big moments',
    '我的日常法式': 'My everyday French', '干净白衬衫': 'Clean white shirt', '利落黑色长裤': 'Sharp black trousers', '宽松日常裤装': 'Relaxed everyday trousers', '轻松针织上衣': 'Easy knit top',
    '轻盈活动鞋履': 'Light active shoes', '柔和金色配饰': 'Soft gold accessories', '银色细节 · 日常配饰': 'Silver details · everyday accessories', '黑色日常上衣': 'Black everyday top', '黑色简约鞋履': 'Black minimal shoes',
    '演示造型参考，可与专业人士沟通细节。': 'Demo style reference; details to agree with the professional.', '注重轮廓、纹理和日常打理，也提供个人造型建议。': 'Focus on shape, texture and easy care, with personal styling advice.',
    '柔和的轮廓与自然的层次，让发型在日常里也轻松好看。预约前可以与造型师确认发质、长度和颜色方案。': 'A soft outline and natural layers that look good every day. Confirm hair type, length and colour with the stylist before booking.',
    '松弛感短发': 'Effortless bob', '微光美甲': 'Shimmer nails', '自然好气色': 'Fresh glow', '极简日常': 'Minimal everyday', '日系': 'Japanese', '法式': 'French', '自然': 'Natural', '短发': 'Short hair', '层次': 'Layered',
    '极简': 'Minimal', '银色': 'Silver', '金色': 'Gold', '粉色': 'Pink', '暖棕': 'Warm brown', '奶茶色': 'Milk tea', '卷翘': 'Curl', '眉毛': 'Brows', '睫毛': 'Lashes', '水光': 'Dewy', '珍珠': 'Pearl', '波浪': 'Waves',
    '直发': 'Straight', '日常': 'Everyday', '通勤': 'Commute', '活动': 'Events', '黑白': 'Black & white', '护理': 'Care', '补水': 'Hydration', '清洁': 'Cleansing', '放松': 'Relax', '衣橱': 'Wardrobe', '个人造型': 'Personal styling',
    '作品': 'Work', '保存 ': 'Save ', '查看作品：': 'View work: ', '查看相似作品 ': 'View similar work ', '相似作品 ': 'Similar work ', '管理作品 ': 'Manage work ', '选择 ': 'Choose ',
    '周一': 'Mon', '周二': 'Tue', '周三': 'Wed', '周四': 'Thu', '周五': 'Fri', '周六': 'Sat', '周日': 'Sun', '分钟': ' min'
  };
  var EN_ZH = {
    "Hi Amy! I'd love the soft layered wolf cut. My hair is shoulder length now.": "Amy 你好！我很喜欢这款柔和层次狼尾，我现在是齐肩长发。",
    "Could we keep most of the length at the back?": "后面的长度可以尽量保留吗？",
    "Hi Jamie! Yes, we can keep the length at the back and add soft layers around the face.": "Jamie 你好！可以，后面保留长度，脸周做柔和的层次。",
    "Bring a photo of how you usually style it — see you on Wednesday.": "带一张你平时打理后的照片来吧，周三见。",
    "Hi Mia, could the chrome tips be a little softer, more silver than mirror?": "Mia 你好，镜面的指尖可以柔和一点吗？偏银色、不要太亮。",
    "Of course! I'll do a softer silver chrome with a sheer pink base. See you Saturday!": "当然可以！做柔和的银色镜面，底色用透粉，周六见！",
    "Hi Jamie, I saw you saved my butterfly layers. Happy to talk through how it would work with your hair type.": "Jamie 你好，看到你收藏了我的蝴蝶层次剪，可以聊聊它适不适合你的发质。",
    "Amy listened to exactly what I wanted. The layers are soft, easy to style in the morning, and I kept my length.": "Amy 完全听懂了我想要的。层次很柔和，早上很好打理，长度也保留住了。",
    "Soft layers · first visit": "柔和层次 · 第一次预约",
    "Booked Amy after seeing her bob on LOOK. Exactly the picture, but it actually suits my face.": "在 LOOK 上看到 Amy 的波波头就约了她。和图片一模一样，而且真的适合我的脸型。",
    "Pearl French for a wedding": "婚礼用的珍珠法式",
    "Mia matched the photo I saved and made it a little more subtle for daytime.": "Mia 按我收藏的图片做的，又调得更适合白天一些。",
    "Soft glam for graduation": "毕业典礼的柔和妆容",
    "Sophie kept it light and it lasted all day. Lovely to find someone through her real work.": "Sophie 妆感很轻，一整天都没掉。通过真实作品找到她，感觉很好。",
    "Layered Cut & Style · My Result": "层次剪发与造型 · 我的成果",
    "Almond": "杏仁形",
    "Gel": "凝胶",
    "Dark Brown": "深棕",
    "Medium Length": "中长发",
    "COMPLETED": "已完成",
    "Message Mia": "给 Mia 发消息",
    "How did it go?": "这次服务怎么样？",
    'ONE APP. TWO PERSPECTIVES.': '一个应用，两种视角', 'I’M A CREATOR': '我是 Creator', 'Choose a few looks you like.': '选几个你喜欢的造型', 'Like': '喜欢', 'Skip': '跳过', 'Start discovering': '开始发现',
    'For You': '推荐', 'Hair': '发型', 'Nails': '美甲', 'Makeup': '妆容', 'Outfit': '穿搭', 'Accessories': '配饰', 'All': '全部', 'Inspiration': '灵感', 'Creator': 'Creator', '✓ Creator': '✓ Creator',
    'Discover': '发现', 'Search': '搜索', 'Build': '搭配', 'Messages': '消息', 'Profile': '我的', 'Show us what you like.': '告诉我们你喜欢什么', 'Upload anything that inspires you.': '上传任何给你灵感的图片',
    'Upload Photo': '上传照片', 'Take Photo': '拍照', 'Paste Image': '粘贴图片', 'LOOK EDIT': 'LOOK 精选', 'Notifications': '通知', 'Real work by Alex Morgan': 'Alex Morgan 的真实作品',
    'Save': '收藏', 'Saved': '已收藏', 'Similar': '相似', 'Add to Look': '加入 Look', 'Make It Real': '让它成真', 'Find professionals nearby': '查找附近的专业人士', 'See how it fits my look': '看看是否适合我的 Look',
    'Visually similar': '视觉相似', 'Recommended for you': '为你推荐', 'Related styles': '相关风格', 'Build your look.': '搭配你的 Look', 'Look 01': 'Look 01', 'Mix what you love into one complete style.': '把喜欢的元素组合成一整套造型',
    'Complete My Look': '完成我的 Look', 'Visualise': '预览效果', 'Style Preview': '风格预览', 'A visual interpretation of your selected look.': '所选元素组合的视觉示意',
    'Change Hair': '更换发型', 'Change Makeup': '更换妆容', 'Change Outfit': '更换上衣', 'Change Bottom': '更换下装', 'Change Shoes': '更换鞋履', 'Change Nails': '更换美甲', 'Change Accessories': '更换配饰',
    'Why it works': '为什么合适', 'Mixed colour palette': '多种色彩组合', '2 / 7 elements selected': '已选 2 / 7 项', 'Compare textures and proportions': '比较质感与比例', 'Try changing': '试试更换', 'Save Look': '保存 Look', 'Regenerate': '重新生成',
    'Matches Near You': '附近匹配', 'Glasgow · City Centre · 3 mi': '格拉斯哥 · 市中心 · 3 英里', 'List': '列表', 'Map': '地图', 'Similar work': '相似作品', 'More professionals nearby': '附近更多专业人士',
    'Hair Stylist': '发型师', 'Barber': '理发师', 'Nail Artist': '美甲师', 'Makeup Artist': '化妆师', 'Skin Specialist': '皮肤护理师', 'Colour Specialist': '染发师', 'Personal Stylist': '个人造型师', 'Lash & Brow Artist': '睫毛与眉形师',
    'City Centre': '市中心', 'West End': '西区', 'Finnieston': 'Finnieston', 'Partick': 'Partick', 'Merchant City': 'Merchant City', 'Southside': '南区', 'East End': '东区', 'Govan': 'Govan',
    'Similar work to your reference': '与你的参考相似的作品', 'All Work': '全部作品', 'Tagged Work': '客户标记作品', 'Services': '服务', 'Message': '发消息', 'Check Availability': '查看空档', 'Haircut': '剪发', 'Colour': '染发', 'Perm': '烫发', 'Styling': '造型',
    'Layered Cut & Style': '层次剪发与造型', 'Colour & Style': '染发与造型', 'Service': '服务', 'Booking Summary': '预约摘要', 'Date / Time': '日期 / 时间', 'Estimated / Duration': '预估价格 / 时长', 'Optional note': '备注（选填）',
    'Booking Details': '预约详情', 'CONFIRMED': '已确认', 'You’re booked.': '预约成功', "You're booked.": '预约成功', 'Client reference': '客户参考图', 'Message Amy': '给 Amy 发消息', 'View Booking': '查看预约', 'Reschedule': '改期', 'Cancel': '取消', 'Add to Calendar': '加入日历',
    'Booking update': '预约更新', 'Bookings': '预约', 'Upcoming': '即将到来', 'Completed': '已完成', 'Cancelled': '已取消', 'Confirmed': '已确认', 'Mark Complete · Demo': '标记完成 · 演示',
    'Edit': '编辑', 'My Looks': '我的 Look', 'My Taste': '我的审美', 'Reviews': '评价', 'Settings': '设置', 'LOOK Plus': 'LOOK Plus', 'Switch Mode · Creator': '切换为 Creator', 'Switch Mode · For Me': '切换为用户', 'Share Result / My Look': '分享成果 / 我的 Look',
    'YOUR STYLE': '你的风格', 'Favourite colours': '喜欢的颜色', 'Favourite silhouettes': '喜欢的廓形', 'Hair preferences': '发型偏好', 'Nail preferences': '美甲偏好', 'Black': '黑色', 'Silver': '银色', 'Gold': '金色', 'Neutral': '中性色', 'Nude': '裸色',
    'Layered': '层次', 'Minimal': '极简', 'Oversized': '宽松', 'Soft': '柔和', 'Clean': '干净', 'French': '法式', 'Bob': '波波头', 'Chrome': '镜面', 'Balayage': '手刷挑染', 'Create a Look': '创建 Look',
    'Whole Makeover Plan': '整体改造计划', 'Shop items': '关联商品', 'Share Result': '分享成果', 'Upload photos': '上传照片', 'Build from your favourites': '从收藏开始搭配', 'Search Creator': '搜索 Creator',
    'Creator Home': 'Creator 首页', 'Today, make it real.': '今天，让作品成真。', 'Today': '今天', 'New Requests': '新需求', 'This week': '本周', 'Profile views': '主页浏览', 'View Calendar': '查看日程', 'Manage Requests': '管理需求', 'View Insights': '查看洞察',
    'People near you are looking for': '附近的人正在找', 'Portfolio': '作品集', 'Upload': '上传', 'Show your work.': '展示你的作品', 'Connect Instagram': '连接 Instagram', 'Calendar': '日程', 'Available': '可预约', 'Holiday': '休假', 'Time Off': '临时休息', 'Break': '休息',
    'Working Hours / Break': '营业时间 / 休息', 'Style Requests': '风格需求', 'I can do this': '我可以做', 'Not my style': '不是我的风格', 'Add Service': '添加服务', 'Insights': '洞察', 'Portfolio views': '作品浏览', 'Service value · Demo': '服务金额 · 演示', 'Popular styles': '热门风格',
    'Booking Rules': '预约规则', 'Booking rules': '预约规则', 'Minimum notice (hours)': '最短提前时间（小时）', 'Latest booking horizon (days)': '最远可约天数', 'No same-day bookings': '不接受当天预约',
    'Creator Profile': 'Creator 档案', 'Verified Creator · Demo': '已认证 Creator · 演示', 'Analytics / Demand': '数据 / 需求', 'Name': '姓名', 'Business Name（optional）': '店名（选填）', 'Location': '区域', 'Service Area': '服务范围', 'Instagram（optional）': 'Instagram（选填）', 'Bio': '简介', 'Address': '地址',
    'Wolf Cut': '狼尾剪', 'Soft Layered Wolf Cut': '柔和层次狼尾', 'Butterfly Layers': '蝴蝶层次剪', 'Copper Balayage': '铜色挑染', 'Curtain Bangs': '八字刘海', 'Korean Soft Perm': '韩式柔软烫', 'Clean Textured Cut': '清爽纹理短发', 'Soft layered hairstyle': '柔和层次发型', 'Soft Glam': '柔和精致妆', 'Lash Lift': '睫毛提升',
    'Consumer navigation': '用户导航', 'Creator navigation': 'Creator 导航', 'CREATED BY': '作者', 'DEMO / 01': '演示 / 01', 'Demo': '演示', '1 requests': '1 个需求', '0 views': '0 次浏览',
    'Mon': '周一', 'Tue': '周二', 'Wed': '周三', 'Thu': '周四', 'Fri': '周五', 'Sat': '周六', 'Sun': '周日'
  };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WD = { '一': 'Mon', '二': 'Tue', '三': 'Wed', '四': 'Thu', '五': 'Fri', '六': 'Sat', '日': 'Sun' };
  var WDZ = { Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日' };
  var HAN = /[一-鿿]/;
  var zhKeys = Object.keys(ZH_EN).sort(function (a, b) { return b.length - a.length; });
  function toEn(s) {
    if (!HAN.test(s)) return s;
    var t = s.trim(); if (ZH_EN[t]) return s.replace(t, ZH_EN[t]);
    s = s.replace(/(\S+(?: \S+)?) 的服务已完成。/g, '$1’s service is complete.').replace(/约\s*([\d.]+)\s*(miles|mi)/g, 'About $1 $2').replace(/最近可约/g, 'Next free');
    s = s.replace(/(\d+)月(\d+)日周([一二三四五六日])/g, function (m, mo, d, w) { return WD[w] + ' ' + d + ' ' + MON[mo - 1]; })
         .replace(/(\d+)月(\d+)日/g, function (m, mo, d) { return d + ' ' + MON[mo - 1]; });
    for (var i = 0; i < zhKeys.length; i++) if (s.indexOf(zhKeys[i]) >= 0) s = s.split(zhKeys[i]).join(ZH_EN[zhKeys[i]]);
    return s.replace(/，/g, ', ').replace(/。/g, '. ').replace(/：/g, ': ').replace(/？/g, '?').replace(/（/g, ' (').replace(/）/g, ')');
  }
  // English phrases that also appear inside mixed Chinese strings; names, streets and the LOOK/Creator/Look terms stay.
  var PHRASES = {
    'Soft Layered Wolf Cut': '柔和层次狼尾', 'Layered Cut & Style': '层次剪发与造型', 'My Result': '我的成果', 'How did it go?': '这次服务怎么样？', 'Booking': '预约', 'collage': '拼贴', 'Soft layers · first visit': '柔和层次 · 第一次预约', 'Soft layered hairstyle': '柔和层次发型', 'Butterfly Layers': '蝴蝶层次剪', 'Copper Balayage': '铜色挑染', 'Curtain Bangs': '八字刘海',
    'Korean Soft Perm': '韩式柔软烫', 'Clean Textured Cut': '清爽纹理短发', 'Not yet verified on platform': '平台尚未认证', 'Best matches': '最佳匹配', 'Confirm Booking': '确认预约',
    'Request Booking': '请求预约', 'Same category': '同类别', 'Home-based': '家庭工作室', 'Style Preview': '风格预览', 'Demo account': '演示账号', 'Share publicly': '公开分享',
    'After Photo': '成果照片', 'Tagged Work': '客户标记作品', 'minimum notice': '最短提前时间', 'Europe/London': '伦敦时间', 'Maps / Places': '地图服务', 'Studio Common': 'Studio Common',
    'West End': '西区', 'City Centre': '市中心', 'Southside': '南区', 'East End': '东区', 'GLASGOW': '格拉斯哥', 'Glasgow': '格拉斯哥', 'Portfolio': '作品集', 'Consumer': '用户',
    'FOR ME': '为自己', 'Community': '社区', 'confirmed': '已确认', 'Deposit': '定金', 'miles': '英里', 'km': '公里', 'Demo': '演示', 'Share': '分享', 'Hair': '发型', 'Nails': '美甲', 'Makeup': '妆容', 'min': '分钟'
  };
  var phraseKeys = Object.keys(PHRASES).sort(function (a, b) { return b.length - a.length; });
  var NAMES = /Amy Chen|Alex Morgan|Mia Chen|Sophie Wilson|Emma Reid|Isla Brown|Grace Lee|Oliver James|Yuna Park|Noah Fraser|Woodlands Road/;
  function phrases(s) {
    if (NAMES.test(s) && !/·/.test(s)) return s;
    for (var i = 0; i < phraseKeys.length; i++) {
      var k = phraseKeys[i], re = new RegExp('(^|[^A-Za-z])' + k.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + '(?=$|[^A-Za-z])', 'g');
      s = s.replace(re, function (m, pre) { return pre + PHRASES[k]; });
    }
    return s;
  }
  function toZh(s) {
    var t = s.trim(); if (!t || !/[A-Za-z]/.test(t)) return s;
    if (HAN.test(t)) { var mixed = phrases(t.split('How did it go? ').join('这次服务怎么样？')).replace(/([\u4e00-\u9fff]) (?=[\u4e00-\u9fff])/g, '$1'); return mixed === t ? s : s.replace(t, mixed); }
    if (EN_ZH[t]) return s.replace(t, EN_ZH[t]);
    // Segments joined by " · " or " / " are translated piece by piece; names and prices stay as they are.
    var parts = t.split(/( · | \/ )/); var changed = false;
    for (var i = 0; i < parts.length; i += 2) { var p = parts[i].trim(); if (EN_ZH[p]) { parts[i] = EN_ZH[p]; changed = true; } }
    var out = parts.join('');
    out = out.replace(/^Your booking with (.+) is tomorrow at ([\d:]+)$/, '明天 $2 与 $1 有预约').replace(/^Real work by (.+)$/, '$1 的真实作品').replace(/^From £(\d+)$/, '£$1 起').replace(/^About ([\d.]+) miles$/, '约 $1 英里')
             .replace(/(\d+) reviews/, '$1 条评价').replace(/(\d+) bookings/, '$1 次预约').replace(/^Full payment (£\d+)$/, '全额支付 $1').replace(/(\d+) mi\b/, '$1 英里');
    if (!NAMES.test(out) || /·/.test(out)) out = phrases(out);
    return (changed || out !== t) ? s.replace(t, out) : s;
  }
  var tr = lang === 'zh' ? toZh : toEn;
  window.__lookT = tr;
  var ATTRS = ['aria-label', 'placeholder', 'title', 'alt'];
  function walk(root) {
    if (root.nodeType === 3) { var v = tr(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (root.tagName === 'SCRIPT' || root.tagName === 'STYLE') return;
      for (var a = 0; a < ATTRS.length; a++) { var x = root.getAttribute(ATTRS[a]); if (x) { var y = tr(x); if (y !== x) root.setAttribute(ATTRS[a], y); } }
    }
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'characterData' || m.type === 'attributes') walk(m.target);
      else for (var k = 0; k < m.addedNodes.length; k++) walk(m.addedNodes[k]);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener('DOMContentLoaded', function () { walk(document.body); document.title = tr(document.title); });
})();

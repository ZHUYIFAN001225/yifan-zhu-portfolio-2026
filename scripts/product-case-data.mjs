// Shared editorial source for the website and recruitment PDFs.
// A pair is [English, Chinese]. Field evidence stays empty until real material arrives.
const p=(en,zh)=>[en,zh];
export const productCases=[{
  id:'beauty',slug:'beauty-marketplace',file:'project-beauty-marketplace.html',pdf:'LOOK',
  title:p('LOOK — Beauty Marketplace','LOOK 见己 · 美容服务平台'),
  subtitle:p('See the work first. Book the person who made it.','先看作品，再预约做出它的人。'),
  intro:p('A Pinterest-like, image-led platform where every picture is real work by a real, local Creator. For users, it is a way to find a look and the person who can actually do it. For Creators, it is a living portfolio that turns their work into new customers.','一个像 Pinterest 一样由图片引导的平台，但每一张图都是真实 Creator 完成的真实作品。对用户，它帮你找到喜欢的造型，以及真正能做出来的人；对 Creator，它是一个能把作品变成新客户的个人作品集。'),
  core:p('Every image is real, and every image leads to a person you can book. A Creator’s portfolio is the user’s inspiration — the feed is the bridge between them.','每一张图都是真的，每一张图背后都有一个可以预约的人。Creator 的作品集就是用户的灵感来源，Feed 就是连接两者的桥。'),
  status:p('Interactive prototype · field research planned','交互原型可体验 · 现场调研待开展'),
  role:p('Product strategy, service and system design, information architecture, UI and AI-assisted prototyping of both the user and Creator sides','产品策略、服务与系统设计、信息架构、界面，以及用户端与 Creator 端的 AI 辅助原型'),
  scope:p('User + Creator mobile journeys','用户 + Creator 双端移动体验'),
  hero:['beauty-discover','beauty-creator'],
  question:p('How might a picture someone loves lead straight to the person who can make it real?','如何让一张心动的图片，直接通向能把它做出来的人？'),
  pains:[
    {quote:p('“I love it, but I don’t know what it’s called.”','“我觉得好看，但不知道它叫什么。”'),body:p('People have a picture, not a service name.','用户手里只有图，没有专业名称。')},
    {quote:p('“Pinterest shows me looks, not who can do them.”','“Pinterest 给我看造型，却不告诉我谁能做。”'),body:p('The maker may be abroad, unqualified or untraceable.','作者可能在国外、不专业，或根本找不到。')},
    {quote:p('“I have to pick a salon before I see the work.”','“我得先选店，才能看到作品。”'),body:p('Shops and stars come first; the person’s skill comes last.','先看店铺和评分，最后才看到人的手艺。')},
    {quote:p('“Instagram gives me likes, not bookings.”','“Instagram 给我点赞，不给我预约。”'),body:p('Real work, every day — but few new customers.','每天发真实作品，却很少带来新客户。')}
  ],
  evidence:p('Built from my product outlines, a whole-product interactive demo and a Glasgow logic and business review. Interviews and field testing come next; accounts, Creators, prices and distances in the demo are simulated.','依据我的产品大纲、完整产品交互 Demo 和格拉斯哥逻辑与商业复审。访谈和实地测试是下一步；Demo 中的账号、Creator、价格和距离均为模拟。'),
  objectives:[p('Let people start from a picture, not a service name.','让用户从图片出发，而不是从服务名称出发。'),p('Show who made the work, then where, how much and when.','先看到作品是谁做的，再看到在哪里、多少钱、什么时候。'),p('Give each Creator a portfolio that belongs to them and brings them new customers.','给每位 Creator 一个属于自己、能带来新客户的作品集。')],
  audience:[
    {title:p('User','用户'),body:p('Browse real work, save what they like, find who made it, compare and book.','浏览真实作品，收藏喜欢的，找到作者，比较后预约。')},
    {title:p('Creator','Creator / 服务提供者'),body:p('Hairstylists, barbers, nail and makeup artists. Their portfolio is their profile, and it follows them if they change salons.','发型师、理发师、美甲师、化妆师。作品集就是他们的主页，换店也会跟着他们走。')},
    {title:p('Pilot operator','试点运营者'),body:p('Recruits the first local Creators, sets trust rules for original work and client consent.','招募首批本地 Creator，制定原创作品与客户授权的信任规则。')}
  ],
  system:{
    kind:'bridge',
    title:p('Two sides, one feed of real work','两端用户，共享一个真实作品 Feed'),
    lead:p('One picture, two meanings: a portfolio piece for the Creator, inspiration for the user.','同一张图，两种意义：对 Creator 是作品集，对用户是灵感。'),
    left:{title:p('Users','用户'),question:p('Who can do this look?','谁能做这个造型？'),items:[p('Browse real work','浏览真实作品'),p('Work first, Creator after','先看作品，再看作者'),p('Save · taste learns','收藏 · 学习审美'),p('Match a screenshot','以图匹配'),p('Area · price · time','区域 · 价格 · 时间'),p('Book this look','预约这个造型')]},
    bridge:p('Real work','真实作品'),
    right:{title:p('Creators','Creator'),question:p('How does my work bring customers?','作品怎样带来客户？'),items:[p('Upload original work','上传原创作品'),p('Auto-tagged by style','按风格自动标签'),p('Services · prices · diary','服务 · 价格 · 日程'),p('Requests & bookings','请求与预约'),p('See what people want','了解用户需求'),p('Portable identity','口碑随人走')]}
  },
  flywheel:{
    title:p('The loop that makes it grow','让平台成长的闭环'),
    steps:[p('Creator uploads real work','Creator 上传真实作品'),p('Work appears in the feed','作品进入 Feed'),p('User discovers and saves','用户发现并收藏'),p('Creator is revealed','看到是谁做的'),p('Book this look','预约这个造型'),p('Service delivered','完成服务'),p('New result joins the portfolio','新作品加入作品集'),p('More real work in the feed','Feed 里的真实作品更多')],
    note:p('Each booking can create new real work — content, supply and demand grow together.','每次预约都可能产生新作品——内容、供给和需求一起增长。')
  },
  strategy:{
    title:p('Starting a real-work marketplace','如何启动一个真实作品平台'),
    lead:p('No Creators, no real work, no feed — so supply comes first.','没有 Creator 就没有作品，也就没有 Feed——所以先建立供给。'),
    phases:[
      {tag:p('01','01'),title:p('One city, Creators who already post','一个城市，从已经在发作品的人开始'),body:p('Glasgow stylists already on Instagram.','格拉斯哥已在 Instagram 发作品的人。')},
      {tag:p('02','02'),title:p('Make joining effortless','让入驻几乎没有门槛'),body:p('Import and auto-tag their work. Likes → bookings.','导入并自动标签作品。点赞 → 预约。')},
      {tag:p('03','03'),title:p('A feed that is real from day one','从第一天起就是真实的 Feed'),body:p('Users browse and match local work.','用户浏览并匹配本地作品。')},
      {tag:p('04','04'),title:p('Booking, then results flow back','预约，再让结果回流'),body:p('New results return to the feed.','新作品回流到 Feed。')}
    ],
    northStar:p('Trust: original work and client consent confirmed; user uploads stay private.','信任规则：确认原创与客户授权；用户上传仅作私人参考。'),
    business:{title:p('Proposed business model','拟定商业模式'),items:[
      {title:p('First-customer fee','首次获客费'),body:p('Only for new customers — no reason to bypass.','只对新客户收费，没有绕开平台的理由。')},
      {title:p('Creator Pro','Creator Pro'),body:p('Insights, diary, richer portfolio.','数据、日程与作品集工具。')},
      {title:p('User premium','用户高级功能'),body:p('Image match & AI preview; core stays free.','以图匹配与 AI 预览；核心免费。')},
      {title:p('Sponsored, later','后期推广'),body:p('Labelled promotion at scale.','规模化后的标注推广。')}
    ],note:p('A proposal to test, not validated revenue.','这是待验证的方案，不是已实现的收入。')}
  },
  ia:[
    {title:p('Consumer navigation','消费者导航'),levels:[p('L1 · Discover / Search / Build / Messages / Profile','一级 · 发现 / 搜索 / 组合造型 / 消息 / 个人'),p('L2 · Look detail / saved board / matches / Creator profile / conversations','二级 · 造型详情 / 收藏板 / 匹配结果 / Creator 主页 / 会话'),p('L3 · Add to Look / edit tags / choose service and time / booking actions','三级 · 加入造型 / 编辑标签 / 选择服务与时间 / 订单操作')]},
    {title:p('Creator navigation','Creator 导航'),levels:[p('L1 · Home / Portfolio / Calendar / Messages / Profile','一级 · 首页 / 作品 / 日历 / 消息 / 个人'),p('L2 · Requests / work details / appointments / service settings','二级 · 客户请求 / 作品详情 / 预约 / 服务设置'),p('L3 · Reply / confirm or decline / update availability / publish work','三级 · 回复 / 确认或拒绝 / 调整空档 / 发布作品')]}
  ],
  iaNote:p('One app with two roles sharing one feed of real work. For users the feed is inspiration; for Creators it is their shop window.','一个 App，两种身份，共享一个真实作品 Feed。对用户，Feed 是灵感；对 Creator，Feed 是自己的橱窗。'),
  journey:[
    {title:p('Discover','发现'),body:p('Browse a feed of real local work and save what you like.','浏览本地真实作品 Feed，收藏喜欢的。')},
    {title:p('Reveal','揭晓'),body:p('Open the work to see who made it, the service and the price.','点开作品，看到是谁做的、什么服务、多少钱。')},
    {title:p('Compare','比较'),body:p('Similar work from nearby Creators, filtered by area first.','先按区域筛选，再比较附近 Creator 的相似作品。')},
    {title:p('Book this look','预约这个造型'),body:p('Pick a service and time; the Creator receives the same request.','选择服务和时间，Creator 收到同一个请求。')},
    {title:p('Back to the feed','回到 Feed'),body:p('The finished result can join the Creator’s portfolio.','完成后的结果可以加入 Creator 的作品集。')}
  ],
  journeyNote:p('No suitable Creator nearby? The user can widen the area or leave a style request, which shows the platform where to recruit next.','附近没有合适的 Creator？用户可以扩大范围或留下造型需求，这也告诉平台下一步该在哪里招募 Creator。'),
  screens:[
    {file:'beauty-discover',title:p('01 / Visual discovery','01 / 视觉发现'),body:p('Pictures lead, like Pinterest. Creator work always carries who made it; anything without a real Creator behind it is labelled differently, so it is never presented as bookable proof.','像 Pinterest 一样由图片引导。Creator 的作品始终标明作者；没有真实 Creator 的图片会另行标注，不会被当成可预约的能力证明。')},
    {file:'beauty-detail',ext:'png',title:p('02 / A reference with context','02 / 带上下文的参考'),body:p('Save, Similar, Add to Look and Make It Real serve different intentions. Work attribution stays visible before the user moves towards a service.','收藏、找相似、加入造型与 Make It Real 对应不同意图；在进入服务前保留作品归属与上下文。')},
    {file:'beauty-matches',ext:'png',title:p('03 / Compare local evidence','03 / 比较本地作品'),body:p('Relevant work, area, indicative price and availability appear together. “Similar work” and “Same category” are labelled differently, so a loose match is never presented as proof of skill.','把相关作品、区域、参考价格与可约时间放在一起；「相似作品」和「同类服务」分开标注，不把宽泛匹配当成能力证明。')},
    {file:'beauty-build',ext:'png',title:p('04 / Express a complete look','04 / 表达完整造型'),body:p('A personal board brings hair, makeup, clothing and accessories together. The preview is a collage, positioned as a style check rather than a prediction of the final result.','个人造型板把发型、妆容、服装与配饰放在一起。预览以拼贴呈现，定位是判断整体是否协调，而不是预测最终效果。')},
    {file:'beauty-creator',title:p('05 / The other side of the service','05 / 服务的另一端'),body:p('The Creator side is their portfolio and business in one: work, services, requests and calendar, plus the same feed to see what people want.','Creator 端把作品集和生意合在一起：作品、服务、请求和日历，还能浏览同一个 Feed，了解用户想要什么。')},
    {file:'beauty-booking',title:p('06 / A traceable booking','06 / 可跟进的预约'),body:p('The booking keeps the chosen look, service and Creator together, and the Creator sees the same request on their side.','预约把所选造型、服务和 Creator 关联在一起，Creator 端能看到同一个请求。')}
  ],
  decisions:[
    {title:p('Location before ranking','先筛区域，再做排序'),why:p('An attractive match outside the chosen area cannot solve a local service need.','超出所选范围的漂亮结果，无法解决本地服务需求。'),how:p('Apply the distance filter before tag-based ranking; offer an editable area when location access is unavailable.','先应用距离筛选，再按标签排序；无法使用定位时，允许编辑区域。'),test:p('Check whether participants understand the area limit and find relevant options.','验证参与者能否理解范围限制，并找到相关选择。')},
    {title:p('Matching is not feasibility','匹配不等于可实现'),why:p('Similar images alone cannot establish provider capability, price or time.','图片相似不能证明服务能力、价格或所需时间。'),how:p('Keep work attribution and match labels explicit; connect selection to consultation and confirmation.','明确作品归属与匹配标签，让选择继续进入咨询与确认。'),test:p('Check whether people distinguish inspiration, provider work and a confirmed service.','验证用户能否区分灵感图、服务者作品和已确认服务。')},
    {title:p('Keep both sides consistent','保持双端一致'),why:p('Availability and price can change between browsing and booking.','浏览与预约之间，空档和价格可能发生变化。'),how:p('Booking conditions are rechecked on submit, and pending requests stay visible to both sides.','提交时重新检查预约条件，待处理请求对双方都保持可见。'),test:p('Test stale information, unavailable slots and declined requests before a real pilot.','真实试点前测试信息过期、空档失效与请求被拒绝等场景。')}
  ],
  demo:p('Choose the Consumer role and a preset demo name. Open a look → Make It Real → nearby Creators → service and availability. Switch to the matching Creator from Profile to inspect the same request. No real phone number or payment is needed.','选择消费者身份与预设演示称呼。打开造型 → Make It Real → 附近 Creator → 服务与空档。在个人页切换到对应 Creator，可查看同一请求。无需真实手机号或支付。'),
  // Public deployment of the standalone prototype (separate repository). Empty until it is live.
  publicDemo:'',
  boundary:p('Creator identities, reviews, distances, payments and messages are simulated. Matching uses tags and rules; style preview is a collage. Browser storage does not provide production authentication or cross-device sync. A separate, narrower V1 includes persistent APIs and an iOS source project, but is not a launched product.','Creator 身份、评价、距离、支付与消息均为模拟。匹配基于标签与规则；造型预览为拼贴。浏览器存储不等于生产身份认证或跨设备同步。另有范围更小的 V1，包含持久化 API 与 iOS 源码，但尚未上线。'),
  research:[
    {title:p('Explore the real journey','了解真实服务旅程'),body:p('Ask consumers how they collect references, explain a look and decide whom to trust. Capture consented journey notes and anonymised examples.','了解消费者如何收集参考、表达造型并判断可信服务者；记录经同意的旅程笔记与匿名例子。')},
    {title:p('Observe provider work','观察服务者工作'),body:p('Discuss consultation, feasible requests, pricing and diary management with local providers. Record actual constraints before narrowing the pilot.','与本地服务者讨论咨询、需求可行性、报价与排期；依据真实限制收敛试点范围。')},
    {title:p('Test one complete task','测试完整任务'),body:p('Ask a participant to turn a chosen look into a suitable service request. Record completion, hesitation, misunderstood labels and recovery from no matches.','请参与者把喜欢的造型转成合适的服务请求；记录完成情况、犹豫点、标签误解与无结果时的恢复方式。')}
  ],
  roadmap:[p('Now · connected whole-product mobile demo','现在 · 完整移动产品交互 Demo'),p('Next · interviews, observation and task-based testing','下一步 · 访谈、观察与任务测试'),p('Then · refine a limited local provider pilot','之后 · 收敛本地小范围商家试点'),p('Before release · real identity, provider onboarding, privacy, payments and notifications','发布前 · 真实身份、商家接入、隐私、支付与通知')],
  evidenceItems:[],
  sourceDocs:['look-demo/README.md','look-demo/格拉斯哥逻辑与商业复审.md','look-demo/design-qa.md']
},{
  id:'booking',slug:'glasgow-booking',file:'project-glasgow-booking.html',pdf:'Glasgow-Booking',
  title:p('Glasgow Salon Booking','格拉斯哥理发店预约系统'),
  subtitle:p('One shared diary. Two clear experiences.','一本共享预约本，两端清晰体验。'),
  intro:p('A customer and shop booking system for a small Glasgow salon run by an older owner, who currently manages every appointment through WeChat, a paper diary and memory.','为格拉斯哥一家小理发店设计的顾客与店铺双端预约系统。店主年纪较大，目前所有预约都靠微信、纸质本和记忆管理。'),
  core:p('The aim is not to put booking online. It is to let the routine run itself, so the owner only steps in for the exceptions — without learning a complicated tool.','目标不是「把预约搬到线上」，而是让日常预约自己运转，店主只在出现异常时介入，而且不需要学习复杂的工具。'),
  status:p('Local shared prototype · field research planned','本地双端原型 · 现场调研待开展'),
  role:p('Problem framing, service blueprint, booking rules, UI for both sides and AI-assisted prototyping','问题定义、服务蓝图、预约规则、双端界面与 AI 辅助原型'),
  scope:p('Customer booking + shop diary and availability','顾客预约 + 店铺排期与开放安排'),
  hero:['booking-customer','booking-admin'],
  question:p('How might every customer book easily — without adding work for the owner?','如何让每类顾客都能轻松预约，同时不给店主增加负担？'),
  persona:{name:p('The owner','店主「阿姨」'),traits:[p('Runs the salon alone','独自经营小店'),p('WeChat + paper diary','微信 + 纸质预约本'),p('Hours change with health and travel','营业时间随身体和出行变化'),p('Away for two weeks recently','最近离开过半个月'),p('Needs tools she can read at a glance','工具必须一眼看懂')],quote:p('“Is anyone booked on Friday? Who do I need to tell?”','「周五有人约吗？我要通知谁？」')},
  whoNeeds:{title:p('Same booking, different questions','同一个预约，双方关心的完全不同'),left:{title:p('Customer asks','顾客关心'),items:[p('What services?','有哪些服务？'),p('Which days are open?','哪天营业？'),p('Which times are free?','哪些时间有空？'),p('What did I book?','我约了什么？')]},center:p('One shared diary','一本共享预约本'),right:{title:p('Owner asks','店主关心'),items:[p('How many today?','今天几位？'),p('Who, when, what, how long?','谁、几点、做什么、多久？'),p('Where is free time?','哪里还有空？'),p('Who is affected if I close?','停业会影响谁？')]}},
  flows:{title:p('Three users, three ways in','三类用户，三种入口'),lanes:[
    {title:p('Chinese customers','中国顾客'),channel:p('WeChat mini program · V1','微信小程序 · 第一版'),steps:[p('Open','打开'),p('Service','选服务'),p('Time','选时间'),p('Confirm','确认')]},
    {title:p('Non-WeChat customers','非微信顾客'),channel:p('Owner adds them · own entry next','先由店主补录 · 独立入口下一阶段'),steps:[p('Call or walk in','电话或到店'),p('Owner adds booking','店主补录'),p('Same diary','进入同一本日程')]},
    {title:p('Owner','店主'),channel:p('Shop view','店铺端'),steps:[p('Today','看今天'),p('Set hours once','设一次营业时间'),p('Handle exceptions','只处理异常')]}
  ]},
  pains:[
    {quote:p('Everything lives in one person','所有信息都在一个人身上'),body:p('WeChat + paper diary + memory.','微信 + 纸质本 + 记忆。')},
    {quote:p('One long service delays everyone after it','一个长服务拖慢后面所有人'),body:p('Times were written down; durations were not.','记了几点来，没记要多久。')},
    {quote:p('Plans change — and every change means messaging everyone','安排一变，就要逐个通知'),body:p('Illness or travel = messaging everyone again.','生病或出行，就要逐个重新联系。')},
    {quote:p('Customers have to ask before they can book','顾客必须先问才能约'),body:p('No WeChat, no easy way in.','不用微信，就没有入口。')}
  ],
  evidence:p('Built from my background and pain-point notes on the salon, a booking-logic specification and local self-tests. A structured interview and on-site test with the owner come next; services, hours and bookings in the demo are fixtures.','依据我对这家店整理的背景与痛点记录、预约逻辑规格和本地自测。下一步是与店主进行结构化访谈和现场测试；Demo 中的服务、营业时间和预约均为演示配置。'),
  system:{
    kind:'blueprint',
    title:p('Service blueprint: who does what','服务蓝图：谁在做什么'),
    lead:p('Routine work moves to the system. The owner acts in only two places.','日常工作交给系统，店主只在两处出手。'),
    rows:[p('Customer','顾客'),p('Owner','店主'),p('System','系统（后台）')],
    stages:[
      {title:p('Choose','选择'),cells:[p('Picks a service','选服务'),p('—','—'),p('Knows its duration','知道时长')]},
      {title:p('Find a time','找时间'),cells:[p('By date or fixed time','按日期或固定时间'),p('Sets hours once','设一次营业时间'),p('Only times that fit','只给放得下的时间')]},
      {title:p('Book','预约'),cells:[p('Confirms','确认'),p('Nothing','无需操作'),p('Rechecks — no double booking','复核，防重复')]},
      {title:p('Before visit','到店前'),planned:true,cells:[p('Confirmation + day-before reminder','预约确认 + 前一天提醒'),p('Nothing','无需操作'),p('Sends WeChat reminders','发送微信提醒')]},
      {title:p('Visit','到店'),cells:[p('Arrives','到店'),p('Just cuts hair','专心理发'),p('Status updates itself','状态自动流转')]},
      {title:p('Exception','异常'),cells:[p('Rebooks, service kept','保留服务重新约'),p('Closes a day once','一键关闭某天'),p('Moves bookings to “reschedule”','预约转入待改期')]}
    ]
  },
  scenario:{title:p('When the owner suddenly can’t open','当店主突然不能营业'),steps:[p('Customer books 13:00','顾客预约 13:00'),p('Owner closes 13:00–14:00','店主关闭 13:00–14:00'),p('Booking becomes “to reschedule”','预约变为「待改期」'),p('Customer picks a new time, service kept','顾客改约新时间，服务保留'),p('Owner’s diary updates','店主日程同步更新')],note:p('Tested end to end across both sides of the prototype.','已在原型双端完成整条流程测试。')},
  principles:{
    title:p('Booking rules that protect the owner','保护店主的预约规则'),
    items:[
      {title:p('The routine runs itself','日常自己运转'),body:p('Owner handles exceptions only.','店主只处理异常。')},
      {title:p('Duration decides availability','时长决定能否预约'),body:p('150-min gap: yes to a cut, no to a colour.','150 分钟空档：能剪发，不能染发。')},
      {title:p('Only valid start times','只给合法开始时间'),body:p('No “17:45” — the day stays unfragmented.','不能随便填 17:45，一天不被切碎。')},
      {title:p('Recommend, don’t decide','推荐，但不替用户决定'),body:p('Suggested times reduce effort; any valid time stays open.','推荐时间减少判断，其他合法时间仍可选。')},
      {title:p('“Not open yet” ≠ “full”','「暂未开放」≠「已满」'),body:p('Owner sets how far ahead to open; no same-day bookings.','店主决定开放到哪天；不能预约当天。')},
      {title:p('Protect long gaps','保护整块时间'),body:p('Fill small gaps; keep big blocks free.','填小空档，留大块时间。')},
      {title:p('Never delete a booking','预约永不直接删除'),body:p('Closures move bookings to rescheduling.','停业时预约转入改期。')},
      {title:p('Low learning cost','学习成本要低'),body:p('Starts from “today”, like her paper diary.','从「今天」开始，像她的纸质本。')}
    ],
    notTitle:p('Deliberately not in V1','第一版刻意不做'),
    notInV1:[p('Online payment','在线支付'),p('Coupons & points','优惠券与积分'),p('Multiple shops','多门店'),p('Parallel services','并行服务'),p('No-show penalties','未到店惩罚'),p('AI chat','AI 客服')]
  },
  iteration:{
    process:{title:p('How I worked','我的工作方法'),steps:[p('Pain points','痛点'),p('V1 scope','功能范围'),p('Three user flows','三条用户流程'),p('Rules + AI guardrails','规则与 AI 开发边界'),p('Build & test','开发与测试')],note:p('Booking rules, data contract and what the AI may change were fixed before any code was written.','预约规则、数据契约和 AI 可修改的范围，都在写代码之前先定好。')},
    items:[
      {title:p('Customer flow','顾客端流程'),before:p('One long schedule list on the home screen','首页一长列完整排期'),after:p('Three steps: week overview → valid times → confirm','三步：一周概览 → 合法时间 → 确认'),note:p('Detailed diary folded away; Back keeps the selection.','详细排期收起；返回时保留已选内容。')},
      {title:p('Owner’s side','店主端'),before:p('About 10 scattered settings pages','约 10 个分散的设置页'),after:p('4 time-first tabs: Today · Diary · Availability · More','4 个以时间为主的入口：今天 · 日程 · 开放预约 · 更多'),note:p('“No-show” moved under more actions, so the routine stays automatic.','「未到店」收进更多操作，让日常保持自动运转。')},
      {title:p('Two developers, one core','两人协作，共享一个核心'),before:p('Customer and owner sides built separately','顾客端与店主端分开开发'),after:p('One shared booking core, changes agreed first','共用一个预约核心，改动先确认再执行'),note:p('e.g. how the owner adds a non-WeChat customer was raised as a change request.','例如「店主如何补录非微信顾客」就以变更请求提出。')}
    ],
    tasks:{title:p('Owner tasks, measured in taps','店主常用操作：实测点击步数'),target:4,items:[{label:p('See today','查看今天'),value:1},{label:p('Open the next two weeks','开放未来两周'),value:2},{label:p('Set a weekly day off','设置每周固定休息日'),value:3},{label:p('Close a day next week','下周某天全天休息'),value:6}],note:p('Target: 3–4 taps. Closing a future day still takes 6 — the next thing to simplify.','目标是 3–4 步。关闭未来某天仍需 6 步，是下一轮要简化的地方。')},
    evidence:p('Design reviews and 82 automated tests, including the full cross-side closure scenario. Not yet tested with the owner herself.','依据设计复审和 82 项自动测试，包括完整的跨端停业场景。尚未与店主本人进行测试。')
  },
  objectives:[p('Reduce repeated messages about available times.','减少反复询问空档的沟通。'),p('Fit the complete service into a valid opening window.','让完整服务时长放入合法营业窗口。'),p('Preserve affected appointments when the shop changes its schedule.','店铺调整安排时，保留并处理受影响预约。')],
  audience:[
    {title:p('Customer','顾客'),body:p('Choose a service and time, understand the duration, then find and change the appointment.','选择服务与时间、理解时长，并能找到和修改预约。')},
    {title:p('Shop owner','店铺经营者'),body:p('See the day, enter a manual booking, adjust opening hours and resolve affected appointments.','查看当天安排、手动补录、调整开放时间，并处理受影响预约。')},
    {title:p('Customers without WeChat','不用微信的顾客'),body:p('Considered from the start; in V1 the owner adds them, with their own entry next.','从调研阶段就纳入考虑；第一版由店主补录，独立入口放到下一阶段。')}
  ],
  ia:[
    {title:p('Customer · three-step booking','顾客端 · 三级预约流程'),levels:[p('L1 · Service + date / My bookings','一级 · 服务与日期 / 我的预约'),p('L2 · Legal start times / appointment detail','二级 · 合法开始时间 / 预约详情'),p('L3 · Review and confirm / reschedule / cancel confirmation','三级 · 核对并确认 / 改期 / 取消确认')]},
    {title:p('Shop · task-based navigation','店铺端 · 按任务导航'),levels:[p('L1 · Today / Diary / Availability / More','一级 · 今天 / 日程 / 开放预约 / 更多'),p('L2 · Day detail / affected bookings / weekly opening rules','二级 · 当日详情 / 受影响预约 / 每周开放规则'),p('L3 · Add or edit appointment / temporary closure / restore availability','三级 · 补录或编辑预约 / 临时关闭 / 恢复开放')]}
  ],
  iaNote:p('This reflects the current customer preview and connected full shop interface. Date and fixed-time filtering are modes within the first step, rather than additional page levels.','对应当前顾客预览与已联调的完整店铺界面。按日期与按固定时间查找属于第一步中的不同模式，不额外增加页面层级。'),
  journey:[
    {title:p('Choose','选择'),body:p('Select a service and available date.','选择服务与可约日期。')},
    {title:p('Check','检查'),body:p('See starts that fit the full duration.','查看能容纳完整时长的开始时间。')},
    {title:p('Confirm','确认'),body:p('Review service, duration and local time.','核对服务、时长与当地时间。')},
    {title:p('Manage','管理'),body:p('Find the same appointment in My bookings and the shop diary.','在我的预约与店铺日程找到同一预约。')},
    {title:p('Recover','恢复'),body:p('If hours change, retain the booking and arrange a new time.','营业安排改变时，保留预约并重新安排时间。')}
  ],
  journeyNote:p('Back preserves a valid selection. Changing the service or date clears an incompatible time. Rescheduling reuses the selection flow; cancellation requires its own confirmation.','返回保留有效选择；更换服务或日期后，清除不再适用的时间。改期复用选择流程，取消则需要单独确认。'),
  screens:[
    {file:'booking-customer',title:p('01 / Service and date','01 / 服务与日期'),body:p('Service duration is visible before choosing a day. Earliest availability and date status make the next action clear, while unavailable dates remain explicit.','先展示服务时长，再选择日期；最早可约时间与日期状态帮助确定下一步，不可约日期也有明确反馈。')},
    {file:'booking-time',ext:'png',title:p('02 / A valid start time','02 / 合法开始时间'),body:p('Only starts that accommodate the whole service are offered. The detailed diary is expandable, keeping the main choice compact.','仅提供能容纳完整服务的开始时间；当天详细排期按需展开，让主选择保持简洁。')},
    {file:'booking-review',ext:'png',title:p('03 / Check before committing','03 / 提交前核对'),body:p('Date, start and end, service and duration are brought together, so the customer confirms exactly what the shop will see.','集中核对日期、起止时间、服务与时长，顾客确认的内容和店铺看到的完全一致。')},
    {file:'booking-schedule',title:p('04 / The shared diary','04 / 共享日程'),body:p('The shop sees appointments against the day, rather than reconstructing them from messages. Customer and shop actions use one booking core.','店铺按天查看预约，无需从多条消息重建安排。顾客与店铺操作复用同一预约核心。')},
    {file:'booking-availability',ext:'png',title:p('05 / Rules and exceptions','05 / 固定规则与临时例外'),body:p('Weekly opening rules, the future booking horizon and temporary closures are separated, so recurring settings are not confused with a one-off change.','区分每周固定安排、未来开放范围与临时关闭，避免把一次变动误设为长期规则。')},
    {file:'booking-exception',ext:'png',title:p('06 / Preserve affected bookings','06 / 保留受影响预约'),body:p('Before closing a day, the owner is told how many customers are affected. Their bookings are kept and move to rescheduling instead of disappearing.','关闭某天之前，系统先告诉店主会影响多少位顾客；这些预约会保留并进入改期，而不是直接消失。')}
  ],
  decisions:[],
  demo:p('Choose a service → an available day → a start time → review. Confirm only a simulated appointment, then open the shop view to inspect the same date. Try My bookings for rescheduling and cancellation. All data are local fixtures.','选择服务 → 可约日期 → 开始时间 → 核对。确认模拟预约后，打开店铺端查看同一天。可在我的预约中体验改期与取消。数据均为本地演示配置。'),
  // Public deployment of the standalone prototype (separate repository). Empty until it is live.
  publicDemo:'',
  boundary:p('The portfolio runs an isolated build of the existing customer and full shop source. Both use a local shared service; restarting it resets in-memory appointments. CloudBase persistence, real WeChat identity, reliable notifications and production deployment are unfinished. No real customer is charged or notified.','作品集运行现有顾客端与完整店铺源码的隔离构建，连接本地共享服务；重启会重置内存预约。CloudBase 持久化、真实微信身份、可靠通知与正式部署尚未完成，不会向真实顾客收费或发送通知。'),
  research:[
    {title:p('Observe a real booking','观察真实预约'),body:p('With permission, map how a request moves from a conversation to the diary, including changes and interruptions. Record steps without retaining private customer details.','获得同意后，记录需求如何从对话进入预约本，以及中途变动与打断；不保留顾客隐私信息。')},
    {title:p('Validate the operating rules','验证实际经营规则'),body:p('Confirm service lengths, opening windows, same-day policy, buffers and preferred language with the owner. Demo fixtures are not final business rules.','与经营者核实服务时长、开放窗口、当天预约政策、缓冲与语言偏好；演示配置不作为最终经营规则。')},
    {title:p('Test both sides of a change','测试变动后的双端体验'),body:p('Ask a customer to book and reschedule, then ask the owner to adjust a period and identify affected appointments. Record completion, errors, time and assistance.','请顾客预约并改期，再请经营者调整时段并找到受影响预约；记录完成情况、错误、耗时与所需帮助。')}
  ],
  roadmap:[p('Now · customer and full shop interfaces connected locally','现在 · 顾客端与完整店铺端本地联调'),p('Next · owner interview, observation and two-sided task testing','下一步 · 店主访谈、现场观察与双端任务测试'),p('Then · refine service rules and run an agreed limited pilot','之后 · 修订服务规则并开展经同意的小范围试点'),p('Before release · persistent data, identity, notification delivery and recovery checks','发布前 · 持久化、身份、通知送达与恢复验证')],
  evidenceItems:[],
  sourceDocs:['01_Background_and_Pain_Points.txt','Barbershop_Design_Logic_Framework.txt','preview/NAVIGATION_REVIEW.md','SELF_TEST_REPORT.md']
}];

export const caseLabels={
  overview:p('The problem','问题'),
  system:p('How the system works','系统如何运转'),
  strategy:p('Strategy','策略'),
  iteration:p('Process & iteration','方法与迭代'),
  structure:p('Information architecture','信息架构'),
  flow:p('The end-to-end journey','完整体验流程'),
  interfaces:p('Interface walkthrough','关键界面解读'),
  logic:p('Decisions & state logic','决策与状态逻辑'),
  research:p('Research & field testing','调研与实地测试'),
  release:p('Progress & release plan','当前进度与发布计划'),
};
// Per-case wording for sections whose content differs.
export const caseLabelOverrides={booking:{strategy:p('Design principles','设计原则')}};
export const evidenceSlots=[
  {kind:'field',title:p('Site photographs & observation','现场照片与观察'),help:p('Add consented photos with date, setting and the workflow observed.','添加经同意的现场照片，并记录日期、场景与观察到的工作流程。')},
  {kind:'interview',title:p('Interview findings','访谈发现'),help:p('Add anonymised notes, participant context and the insight supported.','添加匿名笔记、参与者背景与其支持的发现。')},
  {kind:'iteration',title:p('Testing & iteration','测试与迭代'),help:p('Connect a task and observed issue to a design change and a retest.','把任务与观察到的问题，连接到设计修改和再次测试。')}
];

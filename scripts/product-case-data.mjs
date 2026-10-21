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
  // Screen map: every screen is a real capture from the running prototype, grouped by navigation level.
  facts:[
    {label:p('Type','类型'),value:p('Two-sided marketplace · mobile','双边平台 · 移动端')},
    {label:p('Stage','阶段'),value:p('Working prototype, pre-pilot','可运行原型 · 试点前')},
    {label:p('Built with','实现方式'),value:p('Spec-first, AI-assisted web prototype','先写规格，AI 辅助实现的网页原型')}
  ],
  build:{
    lead:p('I wrote the product specification first, then built the prototype with AI coding tools inside clear rules, so every screen follows the same logic.','先写完整的产品规格，再在明确规则下用 AI 编程工具实现原型，让每个界面都遵循同一套逻辑。'),
    steps:[
      {title:p('Specification','产品规格'),body:p('One written spec covers both roles: feed, matching, booking, payment rules, cancellation and privacy.','一份规格覆盖两种身份：信息流、匹配、预约、付款、取消与隐私规则。')},
      {title:p('Prototype','原型实现'),body:p('A mobile web app with about 40 routes across both roles. Data stays in the browser, on one demo clock in Europe/London time.','移动网页应用，两种身份共约 40 个路由；数据保存在浏览器中，统一使用伦敦时区的演示时钟。')},
      {title:p('Rules in code','规则落到代码'),body:p('Search radius is a hard limit, a declined Creator is not shown again, pending requests expire, and the home address stays hidden until confirmed.','搜索半径是硬限制；拒绝过的 Creator 不再推荐；待确认请求会过期；家庭工作室地址确认前不公开。')},
      {title:p('Checks','检查'),body:p('Automated checks run every main flow and edge case, and render every route in both roles.','自动检查覆盖每条主流程与边界情况，并在两种身份下渲染全部路由。')}
    ],
    stats:[{value:51,label:p('main-flow interaction checks','项主流程交互检查')},{value:56,label:p('edge-case checks','项边界检查')},{value:80,label:p('route renders across both roles','次双身份路由渲染')}],
    note:p('Checks ran on a virtual DOM; the prototype has not yet been tested on real phones with real users.','检查在虚拟 DOM 中进行；尚未在真实手机上与真实用户测试。')
  },
  challenges:{
    hard:[
      {title:p('Cold start is a supply problem','冷启动首先是供给问题'),body:p('The feed only works if there are local Creators with real work nearby. A beautiful feed means nothing if no one in range can do the look.','只有附近有真实作品的 Creator，信息流才有意义；图片再好看，范围内没人能做也没有用。')},
      {title:p('Similar is not the same as possible','相似不等于能做到'),body:p('A picture cannot show hair condition, time or materials, so a consultation or quote step is still needed before booking.','图片看不出发质、耗时与材料，预约前仍需要咨询或报价。')},
      {title:p('Image rights and consent','图片授权与同意'),body:p('“Real work” must be the Creator’s own, with client consent. The prototype uses reference images that are not cleared for public use, so it is not public yet.','“真实作品”必须是 Creator 本人的，并获得客户同意。原型使用的参考图未获公开授权，因此暂未公开发布。')}
    ],
    gaps:[p('Real accounts, payments and notifications','真实账号、付款与通知'),p('Postcode geocoding and travel time','邮编定位与路程时间'),p('Real image matching (scores are demo values)','真实图像匹配（评分为演示值）'),p('Testing with Glasgow Creators and users','与格拉斯哥 Creator 和用户的测试')],
    opportunities:[
      {title:p('Portfolio as acquisition','作品集即获客'),body:p('A Creator’s portfolio brings first-time customers, so a first-customer fee aligns platform income with real value.','Creator 的作品集为其带来新客，按首单收费让平台收入与真实价值一致。')},
      {title:p('Local demand insight','本地需求洞察'),body:p('Requests show what people nearby are looking for, which Creators can act on.','需求数据显示附近的人在找什么，Creator 可以据此调整作品与服务。')},
      {title:p('Personal preview, if proven','个人预览（需验证）'),body:p('An AI preview on your own photo could be a paid feature, once quality, speed and cost are tested.','在本人照片上的 AI 预览可成为付费功能，前提是质量、速度与成本经过验证。')}
    ],
    success:[p('Searches with similar work in range','范围内能找到相似作品的搜索比例'),p('Match → message → booking conversion','匹配 → 咨询 → 预约的转化'),p('Creator reply time','Creator 回复时长'),p('Repeat bookings and shared results','复购与结果分享')]
  },
  screenMap:{
    dir:'look',
    lead:p('Every screen below is captured from the running prototype. Level 1 is the tab bar; each row follows one path deeper. Select any screen to enlarge it.','以下每个界面均截自正在运行的原型。第一层是底部标签栏；每一行沿一条路径向下深入。点击任意界面可放大查看。'),
    sides:[
      {id:'user',label:p('User side','用户端'),
       tabs:[{file:'discover',title:p('Discover','发现')},{file:'search',title:p('Search','搜索')},{file:'build',title:p('Build','搭配')},{file:'messages',title:p('Messages','消息')},{file:'profile',title:p('Profile','我的')}],
       paths:[
        {from:p('Discover → the core journey: from a picture to a booking','发现 → 核心路径：从一张图片到一次预约'),key:true,steps:[
          {file:'detail',level:2,title:p('Real work, with its maker','真实作品与作者')},
          {file:'make-it-real',level:'sheet',title:p('Make It Real','Make It Real')},
          {file:'matches',level:3,title:p('Matches near you','附近匹配')},
          {file:'creator',level:4,title:p('Creator portfolio','Creator 作品集')},
          {file:'availability',level:'sheet',title:p('Pick a time','选择时间')},
          {file:'summary',level:'sheet',title:p('Booking summary','预约摘要')},
          {file:'booked',level:5,title:p('Booked','预约完成')},
          {file:'chat',level:5,title:p('Chat with the Creator','与 Creator 沟通')}]},
        {from:p('Discover → explore around one picture','发现 → 围绕一张图继续探索'),steps:[
          {file:'similar',level:3,title:p('Similar work','相似作品')},
          {file:'work-info',level:3,title:p('Work details & price','作品详情与价格')},
          {file:'matches-map',level:3,title:p('Matches on a map','地图查看匹配')},
          {file:'notifications',level:2,title:p('Notifications','通知')}]},
        {from:p('Search & Build','搜索与搭配'),steps:[
          {file:'creator-search',level:2,title:p('Search Creators','搜索 Creator')},
          {file:'preview',level:2,title:p('Style preview','整体预览')}]},
        {from:p('Profile','我的'),steps:[
          {file:'saved',level:2,title:p('Saved','收藏')},
          {file:'taste',level:2,title:p('My taste','我的审美')},
          {file:'bookings',level:2,title:p('Bookings','我的预约')},
          {file:'plus',level:2,title:p('LOOK Plus studio','LOOK Plus 造型室')},
          {file:'settings',level:2,title:p('Settings & area','设置与区域')}]}]},
      {id:'creator',label:p('Creator side','Creator 端'),
       note:p('Discover and Search are shared with the user side; Creators see the same feed of real work.','发现与搜索与用户端共用；Creator 看到的是同一个真实作品流。'),
       tabs:[{file:'c-home',title:p('Workbench','工作台')},{file:'c-messages',title:p('Messages','消息')},{file:'c-profile',title:p('Profile','我的')}],
       paths:[
        {from:p('Workbench → turn demand into bookings','工作台 → 把需求变成预约'),key:true,steps:[
          {file:'c-requests',level:2,title:p('Style requests','风格需求')},
          {file:'c-respond',level:'sheet',title:p('Answer with real work','用真实作品回应')},
          {file:'c-calendar',level:2,title:p('Calendar','日程')},
          {file:'c-bookings',level:2,title:p('Bookings','客户预约')},
          {file:'c-insights',level:2,title:p('Local demand','附近需求')}]},
        {from:p('Workbench → portfolio','工作台 → 作品集'),seq:true,steps:[
          {file:'c-portfolio',level:2,title:p('Portfolio','作品集')},
          {file:'c-upload',level:3,title:p('Upload work','上传作品')}]},
        {from:p('Profile → business set-up','我的 → 经营设置'),steps:[
          {file:'c-setup',level:2,title:p('Creator profile','职业档案')},
          {file:'c-services',level:2,title:p('Services & prices','服务与价格')},
          {file:'c-rules',level:2,title:p('Booking rules','预约规则')}]}]}
    ]
  },
  details:[
    {file:'zoom-real-work',title:p('Every picture names its maker','每张图都标明作者'),body:p('“Real work by …” sits under the image, and Make It Real is the one primary action. Inspiration leads straight to a person.','图片下方写明“Real work by…”，Make It Real 是唯一主操作：灵感直接通向一个人。')},
    {file:'zoom-matches',title:p('Matches show proof, not just names','匹配结果展示证据'),body:p('Distance, starting price, rating and three similar pieces of their own work, so a user compares results before profiles.','距离、起价、评分，以及三张 TA 自己的相似作品：先比较作品，再看个人资料。')},
    {file:'zoom-slots',title:p('Only real free times','只显示真实空闲时间'),body:p('Times that are taken or too short for the service are greyed out; the chosen slot is the only red element.','已被占用或放不下该服务的时间直接置灰；所选时段是唯一的红色元素。')},
    {file:'zoom-respond',title:p('Creators answer with their own work','Creator 用自己的作品回应'),body:p('Replying to a style request means choosing the closest real piece from the portfolio, so the promise is backed by evidence.','回应风格需求时，必须从作品集中选出最接近的真实作品，承诺有据可查。')},
    {file:'zoom-calendar',title:p('One calendar, three states','一个日程，三种状态'),body:p('Available, holiday and time off are set per day; breaks stay visible so the Creator sees the shape of the day at a glance.','按天设置可约、休假与临时休息；休息时段保留可见，一眼看清当天安排。')}
  ],
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
  facts:[
    {label:p('Type','类型'),value:p('Service design · booking system','服务设计 · 预约系统')},
    {label:p('Stage','阶段'),value:p('Working prototype, before owner testing','可运行原型 · 待店主测试')},
    {label:p('Built with','实现方式'),value:p('TypeScript booking core, AI-assisted within rules','TypeScript 预约核心 · 规则内 AI 辅助开发')}
  ],
  build:{
    lead:p('The logic was fixed before any screen: pain points, V1 scope, three user flows, then technical rules for the AI tools. Visual polish came last.','先定逻辑再做界面：痛点 → 第一版范围 → 三条用户流程 → 给 AI 工具的技术规则，视觉放在最后。'),
    steps:[
      {title:p('One booking core','一个预约核心'),body:p('Availability, booking, rescheduling, closures and admin actions live in one shared TypeScript core used by both sides.','可约时间、预约、改期、休息与店主操作都在同一个 TypeScript 核心中，双端共用。')},
      {title:p('Guardrails for AI','给 AI 的边界'),body:p('A written spec, folder rules and a list of what the AI may and may not change kept generated code inside the design.','书面规格、文件夹规则，以及 AI 可改与不可改的范围，让生成的代码不偏离设计。')},
      {title:p('Two front ends','两个前端'),body:p('A customer flow and a shop diary, both phone-sized; the target is a WeChat mini program with a separate entry for non-WeChat customers.','顾客流程与店铺预约本，均为手机尺寸；目标形态是微信小程序，并为不用微信的顾客提供独立入口。')},
      {title:p('Public prototype','公开原型'),body:p('The real booking rules are bundled to run in the browser, so anyone can try both sides without a server.','真实预约规则被打包在浏览器中运行，无需服务器即可体验双端。')}
    ],
    stats:[{value:82,label:p('automated tests','项自动化测试')},{value:4,label:p('tabs for the owner','个店主标签页')},{value:3,label:p('steps for a customer to book','步完成顾客预约')}],
    note:p('Tests check the rules; they do not show that the owner finds it easy. That needs the interview and on-site test below.','测试验证的是规则，不代表店主觉得好用；这需要下方的访谈与现场测试。')
  },
  challenges:{
    hard:[
      {title:p('A low-confidence user','数字信心较弱的使用者'),body:p('The owner is used to WeChat and a paper diary. Every extra step is a reason to go back to them, so the shop side had to shrink to four tabs.','店主习惯微信与纸质本，多一步就可能退回旧方式，因此店铺端收敛为四个标签页。')},
      {title:p('Durations are uncertain','时长并不确定'),body:p('Hair length and colour change how long a service takes, so estimates can still overrun.','头发长度与染发会改变服务时长，估算仍可能超时。')},
      {title:p('Two kinds of customer','两类顾客'),body:p('WeChat suits Chinese customers but not everyone else. V1 serves WeChat; others are added by the owner until their own entry is ready.','微信适合中国顾客，却不适合所有人。第一版服务微信顾客，其他顾客由店主代录，直到独立入口上线。')}
    ],
    gaps:[p('Cloud storage and real WeChat sign-in','云端存储与真实微信登录'),p('Reliable notifications after a closure','休息后可靠的通知'),p('Interview and on-site test with the owner','与店主的访谈与现场测试'),p('Own entry for non-WeChat customers','非微信顾客的独立入口')],
    opportunities:[
      {title:p('Fewer messages','更少的消息往来'),body:p('If customers can see free times themselves, most “are you open?” messages disappear.','顾客能自己看到空位，大部分“在吗、有空吗”的消息就会消失。')},
      {title:p('A wider local audience','更广的本地客群'),body:p('A non-WeChat entry opens the shop to local customers who would never add a private WeChat.','非微信入口让不会添加私人微信的本地顾客也能预约。')},
      {title:p('A pattern for other small shops','可复用于其他小店'),body:p('The same core could serve other one-person services with changing hours.','同一个核心可以服务其他营业时间多变的个体店。')}
    ],
    success:[p('Owner tasks in four taps or fewer','店主常用操作不超过 4 步'),p('Share of bookings made without chatting','无需聊天完成的预约比例'),p('Time spent rescheduling after a closure','休息后重新安排所花的时间'),p('Owner still using it after a month','一个月后店主仍在使用')]
  },
  screenMap:{
    dir:'booking',
    lead:p('Captured from the public prototype (English layer on). Level 1 is the bottom navigation; each row follows one path deeper. Select any screen to enlarge it.','截自公开原型（开启英文层）。第一层是底部导航；每一行沿一条路径向下深入。点击任意界面可放大查看。'),
    sides:[
      {id:'customer',label:p('Customer app','顾客端'),
       tabs:[{file:'book',title:p('Book','预约')},{file:'mine',title:p('My bookings','我的预约')}],
       paths:[
        {from:p('Book → three steps','预约 → 三步完成'),key:true,steps:[
          {file:'day',level:2,title:p('Choose a time','选择时间')},
          {file:'confirm',level:3,title:p('Check before booking','核对')},
          {file:'booked',level:3,title:p('Booked','预约成功')}]},
        {from:p('Book → search by time of day','预约 → 按固定时间找'),steps:[
          {file:'by-time',level:'mode',title:p('By time of day','按时间找')}]},
        {from:p('My bookings → change of plan','我的预约 → 计划有变'),steps:[
          {file:'reschedule',level:2,title:p('Change time','修改时间')},
          {file:'cancel',level:2,title:p('Cancel','取消预约')}]}]},
      {id:'shop',label:p('Shop admin','店铺后台'),
       tabs:[{file:'today',title:p('Today','今天')},{file:'schedule',title:p('Schedule','日程')},{file:'window',title:p('Open for booking','开放预约')},{file:'more',title:p('More','更多')}],
       paths:[
        {from:p('Today → the owner’s routine','今天 → 店主的日常操作'),key:true,steps:[
          {file:'add',level:2,title:p('Add a booking','补录预约')},
          {file:'time-off',level:2,title:p('Take time off','临时休息')},
          {file:'todo',level:2,title:p('Needs a new time','待改期')}]},
        {from:p('Schedule & More','日程与更多'),steps:[
          {file:'day-detail',level:2,title:p('A day in the diary','某一天的预约')},
          {file:'services',level:2,title:p('Services & durations','服务与时长')}]}]}
    ]
  },
  details:[
    {file:'zoom-durations',title:p('Duration is chosen first','先选服务时长'),body:p('Each service shows its length, and the earliest free time updates with it, because duration decides what fits.','每项服务标明时长，最早可约时间随之更新：时长决定了哪里放得下。')},
    {file:'zoom-day',title:p('The diary, not the chat','看预约本，而不是翻聊天'),body:p('The owner sees a day as times, services and status, with Add and Adjust one tap away.','店主看到的是一天的时间、服务与状态；补录与调整一步可达。')},
    {file:'zoom-time-off',title:p('Time off never deletes a booking','休息不会删除预约'),body:p('The rule is written on the screen: bookings are kept and affected customers pick a new time.','规则直接写在界面上：预约保留，受影响的顾客重新选时间。')},
    {file:'zoom-kept',title:p('Customers see why, and what to do','顾客知道原因与下一步'),body:p('A closure turns the booking into “Needs new time” with a one-tap way to choose again.','店铺休息后，预约变为“待改期”，并提供一键重新选择。')}
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
  structure:p('Screen map','界面地图'),
  flow:p('The end-to-end journey','完整体验流程'),
  interfaces:p('Design details','界面细节'),
  logic:p('Decisions & state logic','决策与状态逻辑'),
  build:p('How it was built','如何实现'),
  challenges:p('Challenges, gaps & opportunities','挑战、不足与机会'),
  research:p('Validation plan','验证计划'),
  release:p('Progress & release plan','当前进度与发布计划'),
};
// Per-case wording for sections whose content differs.
export const caseLabelOverrides={booking:{strategy:p('Design principles','设计原则')}};
export const evidenceSlots=[
  {kind:'field',title:p('Site photographs & observation','现场照片与观察'),help:p('Add consented photos with date, setting and the workflow observed.','添加经同意的现场照片，并记录日期、场景与观察到的工作流程。')},
  {kind:'interview',title:p('Interview findings','访谈发现'),help:p('Add anonymised notes, participant context and the insight supported.','添加匿名笔记、参与者背景与其支持的发现。')},
  {kind:'iteration',title:p('Testing & iteration','测试与迭代'),help:p('Connect a task and observed issue to a design change and a retest.','把任务与观察到的问题，连接到设计修改和再次测试。')}
];

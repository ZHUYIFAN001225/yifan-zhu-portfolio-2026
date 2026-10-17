// Shared editorial source for the website and recruitment PDFs.
// A pair is [English, Chinese]. Field evidence stays empty until real material arrives.
const p=(en,zh)=>[en,zh];
export const productCases=[{
  id:'beauty',slug:'beauty-marketplace',file:'project-beauty-marketplace.html',pdf:'LOOK',
  title:p('LOOK — Beauty Marketplace','LOOK 见己 · 美容服务平台'),
  subtitle:p('From visual inspiration to a bookable local service.','从视觉灵感，到可预约的本地服务。'),
  intro:p('A two-sided mobile product exploring how people communicate a desired look, assess local Creators and move towards a service appointment.','一个双边移动产品：探索人们如何表达想要的造型、判断附近 Creator 是否合适，并进一步预约服务。'),
  status:p('Interactive prototype · field research planned','交互原型可体验 · 现场调研待开展'),
  role:p('Product framing, experience design and AI-assisted prototyping','产品定义、体验设计与 AI 辅助原型'),
  scope:p('Consumer + Creator mobile journeys','消费者 + Creator 双端移动体验'),
  hero:['beauty-discover','beauty-creator'],
  question:p('How might a saved image become a clear, realistic service request?','如何让一张收藏图片，变成清楚、可实现的服务需求？'),
  context:p('LOOK starts with a product hypothesis: visual inspiration and local service booking often require different kinds of information. The prototype connects the desired look with actual work, service scope, location, consultation and availability. The demand and provider workflow still need field validation.','LOOK 从一个产品假设出发：视觉灵感与本地服务预约需要不同的信息。原型尝试把想要的造型与实际作品、服务范围、地点、咨询及空档连接起来。真实需求与服务者工作方式仍需现场验证。'),
  evidence:p('Current basis: the existing whole-product demo, its product specification and a Glasgow logic/business review. No interview, observation or field usability study has been completed. Screens show simulated accounts and content, rather than real customer outcomes.','当前依据：现有完整产品 Demo、产品规格及格拉斯哥逻辑与商业复审文档。目前未完成访谈、现场观察或实地可用性测试。截图中的账号与内容为模拟，不代表真实客户成果。'),
  objectives:[p('Make a visual preference easier to explain.','让视觉偏好更容易表达。'),p('Help people judge relevant local work before committing.','先判断附近服务者的相关作品，再决定是否预约。'),p('Connect the request to a manageable Creator workflow.','把需求连接到 Creator 可管理的服务流程。')],
  audience:[
    {title:p('Consumer','消费者'),body:p('Collect inspiration, combine a look, compare relevant work and confirm service details.','收集灵感、组合造型、比较相关作品，并核对服务细节。')},
    {title:p('Creator','Creator / 服务提供者'),body:p('Present actual work, clarify services, handle requests and manage availability.','展示实际作品、说明服务、处理咨询并管理空档。')},
    {title:p('Pilot operator','试点运营者'),body:p('Define the initial local supply, onboarding and trust requirements. This role is a planning lens, not an existing operations dashboard.','明确本地首批供给、入驻与信任要求。这是规划视角，并非已实现的运营后台。')}
  ],
  ia:[
    {title:p('Consumer navigation','消费者导航'),levels:[p('L1 · Discover / Search / Build / Messages / Profile','一级 · 发现 / 搜索 / 组合造型 / 消息 / 个人'),p('L2 · Look detail / saved board / matches / Creator profile / conversations','二级 · 造型详情 / 收藏板 / 匹配结果 / Creator 主页 / 会话'),p('L3 · Add to Look / edit tags / choose service and time / booking actions','三级 · 加入造型 / 编辑标签 / 选择服务与时间 / 订单操作')]},
    {title:p('Creator navigation','Creator 导航'),levels:[p('L1 · Home / Portfolio / Calendar / Messages / Profile','一级 · 首页 / 作品 / 日历 / 消息 / 个人'),p('L2 · Requests / work details / appointments / service settings','二级 · 客户请求 / 作品详情 / 预约 / 服务设置'),p('L3 · Reply / confirm or decline / update availability / publish work','三级 · 回复 / 确认或拒绝 / 调整空档 / 发布作品')]}
  ],
  iaNote:p('A map of the current prototype, organised by navigation, detail and action depth. Labels do not imply three separate apps. Interview findings may change this hierarchy.','依据当前原型整理，区分导航、详情和操作深度；并不代表三个独立应用。访谈后仍可调整层级。'),
  journey:[
    {title:p('Discover','发现'),body:p('Browse and save a look.','浏览并收藏喜欢的造型。')},
    {title:p('Define','表达'),body:p('Inspect the detail or combine a personal board.','查看详情，或组合个人造型板。')},
    {title:p('Compare','比较'),body:p('Filter nearby Creators and relevant portfolio work.','筛选附近 Creator 与相关作品。')},
    {title:p('Consult & book','咨询与预约'),body:p('Clarify feasibility, select a service and check a time.','确认可行性，选择服务并检查时间。')},
    {title:p('Follow through','跟进'),body:p('Track the request; the Creator manages the same booking.','跟进请求；Creator 管理同一预约。')}
  ],
  journeyNote:p('No suitable result? Adjust the area or leave a style request. A visual match is an invitation to consult, not a guarantee of the result.','没有合适结果？调整范围或留下造型需求。视觉匹配引导咨询，不保证实际效果。'),
  screens:[
    {file:'beauty-discover',title:p('01 / Visual discovery','01 / 视觉发现'),body:p('Images lead the browse experience. Inspiration and Creator work have distinct labels, so a reference image does not silently become a provider claim.','以图片主导浏览，区分灵感图与 Creator 作品，避免将参考图片直接当成服务者的能力证明。')},
    {file:'beauty-detail',ext:'png',title:p('02 / A reference with context','02 / 带上下文的参考'),body:p('Save, Similar, Add to Look and Make It Real serve different intentions. Work attribution stays visible before the user moves towards a service.','收藏、找相似、加入造型与 Make It Real 对应不同意图；在进入服务前保留作品归属与上下文。')},
    {file:'beauty-matches',ext:'png',title:p('03 / Compare local evidence','03 / 比较本地作品'),body:p('Relevant work, area, indicative price and availability appear together. Similar work and Same category remain distinct; ratings and distances here are demonstration data.','把相关作品、区域、参考价格与可约时间放在一起；区分相似作品与同类服务。此处评价和距离均为演示数据。')},
    {file:'beauty-build',ext:'png',title:p('04 / Express a complete look','04 / 表达完整造型'),body:p('A personal board separates hair, makeup, clothing and accessories. The preview is a collage; it is not an AI try-on or a promised service result.','个人造型板拆分发型、妆容、服装与配饰。预览是拼贴，并非 AI 试妆，也不承诺实际服务效果。')},
    {file:'beauty-creator',title:p('05 / The other side of the service','05 / 服务的另一端'),body:p('A dedicated Creator experience organises requests, portfolio, services and calendar, rather than treating the product as a consumer gallery alone.','Creator 独立体验组织请求、作品、服务与日历，让产品同时考虑服务提供者的工作。')},
    {file:'beauty-booking',title:p('06 / A traceable booking','06 / 可跟进的预约'),body:p('The simulated booking connects the chosen look, service and provider. Its state is available to the matching Creator account in the same browser.','模拟预约关联所选造型、服务与提供者；同一浏览器中，对应 Creator 身份可查看该预约状态。')}
  ],
  decisions:[
    {title:p('Location before ranking','先筛区域，再做排序'),why:p('An attractive match outside the chosen area cannot solve a local service need.','超出所选范围的漂亮结果，无法解决本地服务需求。'),how:p('Apply the distance filter before tag-based ranking; offer an editable area when location access is unavailable.','先应用距离筛选，再按标签排序；无法使用定位时，允许编辑区域。'),test:p('Check whether participants understand the area limit and find relevant options.','验证参与者能否理解范围限制，并找到相关选择。')},
    {title:p('Matching is not feasibility','匹配不等于可实现'),why:p('Similar images alone cannot establish provider capability, price or time.','图片相似不能证明服务能力、价格或所需时间。'),how:p('Keep work attribution and match labels explicit; connect selection to consultation and confirmation.','明确作品归属与匹配标签，让选择继续进入咨询与确认。'),test:p('Check whether people distinguish inspiration, provider work and a confirmed service.','验证用户能否区分灵感图、服务者作品和已确认服务。')},
    {title:p('Keep both sides consistent','保持双端一致'),why:p('Availability and price can change between browsing and booking.','浏览与预约之间，空档和价格可能发生变化。'),how:p('The demo rechecks booking conditions and keeps pending requests visible. Chat, payment and identity remain simulated.','Demo 复核预约条件并保留待处理请求；聊天、支付与身份仍为模拟。'),test:p('Test stale information, unavailable slots and declined requests before a real pilot.','真实试点前测试信息过期、空档失效与请求被拒绝等场景。')}
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
  intro:p('A customer and shop booking prototype for a Glasgow salon, translating scattered chat coordination and a paper diary into a service-aware appointment workflow.','围绕格拉斯哥理发店场景的顾客与店铺双端预约原型：把分散的聊天协调与纸质记录，转化为考虑真实服务时长的预约流程。'),
  status:p('Local shared prototype · field research planned','本地双端原型 · 现场调研待开展'),
  role:p('Problem framing, service flow, UI and AI-assisted prototyping','问题定义、服务流程、界面与 AI 辅助原型'),
  scope:p('Customer booking + shop diary and availability','顾客预约 + 店铺排期与开放安排'),
  hero:['booking-customer','booking-admin'],
  question:p('How might booking stay simple when service lengths and opening hours change?','服务时长与营业安排变化时，如何仍让预约简单可靠？'),
  context:p('Existing background notes describe an owner-managed salon coordinating appointments through WeChat and a paper diary. Scattered records, varying service lengths and manual schedule changes motivate the prototype. These notes establish the context; they are not a completed interview study.','已有背景文档描述了一家由经营者亲自管理、依赖微信与纸质本协调预约的理发店。记录分散、服务时长不同与人工改期构成原型起点。这些笔记用于说明背景，不代表已完成访谈研究。'),
  evidence:p('Current basis: project background and pain-point notes, a design-logic framework, navigation review and local implementation/self-test records. No on-site observation, interview or field usability test has been completed. Opening hours, services and bookings in the demo are fixtures.','当前依据：背景与痛点笔记、设计逻辑框架、导航复审及本地实现与自测记录。目前未完成现场观察、访谈或实地可用性测试。Demo 中的营业时间、服务与预约均为演示配置。'),
  objectives:[p('Reduce repeated messages about available times.','减少反复询问空档的沟通。'),p('Fit the complete service into a valid opening window.','让完整服务时长放入合法营业窗口。'),p('Preserve affected appointments when the shop changes its schedule.','店铺调整安排时，保留并处理受影响预约。')],
  audience:[
    {title:p('Customer','顾客'),body:p('Choose a service and time, understand the duration, then find and change the appointment.','选择服务与时间、理解时长，并能找到和修改预约。')},
    {title:p('Shop owner','店铺经营者'),body:p('See the day, enter a manual booking, adjust opening hours and resolve affected appointments.','查看当天安排、手动补录、调整开放时间，并处理受影响预约。')},
    {title:p('Different entry habits','不同入口习惯'),body:p('The brief includes Chinese and non-Chinese customers. Language and access requirements still need validation; the current demo is not a verified multilingual release.','原始需求包含华人与非华人顾客；语言与入口习惯仍需验证，当前 Demo 并非经过验证的多语言正式版。')}
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
    {file:'booking-review',ext:'png',title:p('03 / Check before committing','03 / 提交前核对'),body:p('Date, start and end, service and duration are brought together. The page explicitly identifies the booking as a local preview.','集中核对日期、起止时间、服务与时长；页面明确说明此次预约仅为本地预览。')},
    {file:'booking-schedule',title:p('04 / The shared diary','04 / 共享日程'),body:p('The shop sees appointments against the day, rather than reconstructing them from messages. Customer and shop actions use one booking core.','店铺按天查看预约，无需从多条消息重建安排。顾客与店铺操作复用同一预约核心。')},
    {file:'booking-availability',ext:'png',title:p('05 / Rules and exceptions','05 / 固定规则与临时例外'),body:p('Weekly opening rules, the future booking horizon and temporary closures are separated, so recurring settings are not confused with a one-off change.','区分每周固定安排、未来开放范围与临时关闭，避免把一次变动误设为长期规则。')},
    {file:'booking-exception',ext:'png',title:p('06 / Preserve affected bookings','06 / 保留受影响预约'),body:p('A temporary closure communicates that existing appointments remain visible and need rescheduling. The interface does not imply a real notification has been delivered.','临时休息页面说明已有预约仍会保留并需要改期；界面不将此等同于已送达真实通知。')}
  ],
  decisions:[
    {title:p('Duration drives availability','时长决定可约性'),why:p('An empty start time alone does not guarantee space for a long service.','开始时间空闲，并不意味着能放下较长服务。'),how:p('Check the full interval against opening windows, breaks and other appointments.','把完整时间段与营业窗口、休息及其他预约比较。'),test:p('Test short and long services near breaks and closing time.','测试短服务、长服务在休息与打烊边界附近的情况。')},
    {title:p('One shared state','双端共享状态'),why:p('Separate calendars create conflicting versions of the same appointment.','各自维护日历容易产生同一预约的不同版本。'),how:p('Customer and shop views use a shared local booking core and in-memory data source.','顾客与店铺复用本地预约核心和内存数据源。'),test:p('Compare both views after booking, rescheduling, cancellation and a shop-side change.','在预约、改期、取消及店铺调整后，对照双端状态。')},
    {title:p('Recover rather than erase','让变动可以恢复'),why:p('Deleting an affected booking would hide an unresolved customer commitment.','直接删除受影响预约，会掩盖尚未解决的顾客承诺。'),how:p('Keep the record visible in an affected / reschedule state; preserve context during recovery.','保留记录并进入受影响 / 待改期状态，恢复流程保留上下文。'),test:p('Ask the owner to close a period and explain which customers still need action.','请经营者关闭一个时段，并判断哪些顾客仍需处理。')}
  ],
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
  overview:p('01 / Context & scope','01 / 背景与范围'),
  structure:p('02 / Information architecture','02 / 信息架构'),
  flow:p('03 / The end-to-end journey','03 / 完整体验流程'),
  interfaces:p('04 / Interface walkthrough','04 / 关键界面解读'),
  logic:p('05 / Decisions & state logic','05 / 决策与状态逻辑'),
  research:p('06 / Research & field testing','06 / 调研与实地测试'),
  release:p('07 / Progress & release plan','07 / 当前进度与发布计划'),
};
export const evidenceSlots=[
  {kind:'field',title:p('Site photographs & observation','现场照片与观察'),help:p('Add consented photos with date, setting and the workflow observed.','添加经同意的现场照片，并记录日期、场景与观察到的工作流程。')},
  {kind:'interview',title:p('Interview findings','访谈发现'),help:p('Add anonymised notes, participant context and the insight supported.','添加匿名笔记、参与者背景与其支持的发现。')},
  {kind:'iteration',title:p('Testing & iteration','测试与迭代'),help:p('Connect a task and observed issue to a design change and a retest.','把任务与观察到的问题，连接到设计修改和再次测试。')}
];

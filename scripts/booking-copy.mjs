// Glasgow Salon Booking — the words of the opening (English / 中文), shared by the cover script.
export const T = {
  tag: ['MADE FOR ONE OWNER. BUILT FOR HER WHOLE DAY.', '为一位店主而做。为她的一整天而建。'],
  t1: ['GLASGOW', '格拉斯哥'], t2: ['SALON', '理发店'], t3: ['BOOKING', '预约系统'],
  copy: ['Customers book themselves. The owner sees her whole day. Nobody is deleted when plans change.', '顾客自己预约，店主一眼看完一天，计划变了也没有人被删掉。'],
  ck: ['DESIGNED AND BUILT FOR A ONE-CHAIR SALON IN GLASGOW.', '为格拉斯哥一家只有一把椅子的理发店设计并实现。'],
  cd: ['The smallest booking system that still has rules.', '最小的预约系统，但规则一条不少。'],
  live: ['Live since 21 Oct 2026 ↗', '2026 年 10 月 21 日上线 ↗'], scroll: ['SCROLL TO CONTINUE', '向下滚动'],
  // 2 — the phone alone
  p1: ['One shared', '一本共享的'], p2: ['diary', '预约本'], p3: ['GLASGOW SALON BOOKING · v1', '格拉斯哥理发店预约 · v1'],
  pp: ['The paper book, the WeChat messages and the missed calls — folded into one screen both sides can trust.', '那本纸质预约本、微信里的消息和没接到的电话——折进一块两边都信得过的屏幕里。'],
  pq: ['* Every screen here is the real product.', '* 这里的每一屏都是真实产品。'],
  // 3 — fits
  a_k: ['ONLY TIMES THAT FIT', '只给放得下的时间'],
  a_p: ['Pick the service first. Its length decides which times are offered — a colour never gets squeezed into a 30-minute gap.', '先选服务。时长决定给出哪些时间——染发永远不会被塞进 30 分钟的空档。'],
  a_big1: ['NO IMPOSSIBLE', '没有一个'], a_big2: ['BOOKINGS', '排不下的预约'],
  a_s: [['COLOUR & BLEACH', '染发漂发'], ['LONG HAIRCUT', '长发剪发'], ['SHORT HAIRCUT', '短发剪发']], a_d: ['180′', '60′', '30′'],
  a_f: ['SLOT FIT MODEL (SFM)', '时段匹配模型'], a_f2: ['A visualization, not a warranty', '示意，不是承诺'],
  // 4 — moved, not lost
  b_k: ['MOVED, NEVER DELETED', '只会挪动，不会删除'],
  b_p: ['When she closes a few hours, the bookings inside them are lifted out and parked, not erased. Every customer keeps a place.', '她临时关掉几个小时，里面的预约会被整个抬出来放在一边，而不是被抹掉。每位顾客都还有位置。'],
  b_big1: ['NOW 0 BOOKINGS', '现在 0 个预约'], b_big2: ['LOST', '丢失'],
  b_f: ['RE-SLOTTING (circle = kept)', '重新排位（圈住 = 保留）'], b_f2: ['move(t) → t′, never delete(t)', 'move(t) → t′，而不是 delete(t)'],
  // 5 — record
  c_k: ['RULES & RECORD', '规则与记录'], c_m: ['LIVE SINCE 21 OCT 2026', '2026 年 10 月 21 日上线'], c_r: ['REAL SCREENS', '真实界面'],
  c: [
    [['RULE 01', '规则 01'], ['“Service first, then time. The length is the rule, not the customer’s guess.”', '“先选服务，再选时间。时长说了算，不靠顾客猜。”'], ['Customer side · booking flow', '顾客端 · 预约流程']],
    [['RULE 02', '规则 02'], ['“Only days the shop is open, only times the service fits.”', '“只显示开门的日子，只给放得下的时间。”'], ['Customer side · calendar', '顾客端 · 日历']],
    [['RULE 03', '规则 03'], ['“Closing hours moves bookings to a parking list. Nobody is deleted.”', '“临时关店会把预约移到待处理列表，没有人被删掉。”'], ['Owner side · time off', '店主端 · 临时关店']]
  ],
  shots: [['Book', '预约'], ['Today', '今天'], ['Time off', '临时关店']],
  try: ['Try the demo ↓', '试用演示版 ↓'],
  ek: ['AFTER CLOSING', '打烊之后'], ep: ['The day gets written up by hand. Who came, who moved, who never showed — and the messages keep coming until she has checked every one.', '一天的账要手写补完：谁来了、谁改了、谁没来——消息还在不停进来，她得一条条核对到很晚。'],
  wx: [['Emma', 'Emma'], ['Running 20 min late, sorry!!', '我要晚 20 分钟，不好意思！！'], ['Mrs Li', '李阿姨'], ['Can I move to 3 o’clock?', '能改到三点吗？'], ['Zhou', '周先生'], ['Are you open Sunday?', '周日开门吗？'], ['Mr He', '何先生'], ['What time was I booked again?', '我约的是几点来着？'], ['+44 7700 900…', '+44 7700 900…'], ['Missed call', '未接来电'], ['Sun', '孙小姐'], ['Still have 11:30?', '11:30 还有吗？']],
  now: ['now', '现在'], wxk: ['WeChat', '微信']
};
export const CHARS = () => [...Object.values(T).flat(3)].join('') + '0123456789:′→✗✆';

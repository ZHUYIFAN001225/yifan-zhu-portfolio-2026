// English layer for the public prototype. The product UI is written in Chinese (V1 serves WeChat customers);
// this translates rendered text so English-speaking reviewers can use it. Default: English. ?lang=zh shows the original.
(function () {
  var KEY = 'glasgow-booking-demo-lang';
  var q = new URLSearchParams(location.search).get('lang');
  var lang = q === 'zh' || q === 'en' ? q : null;
  try { if (lang) sessionStorage.setItem(KEY, lang); else lang = sessionStorage.getItem(KEY); } catch (e) { /* no storage */ }
  if (lang !== 'zh') lang = 'en';
  document.documentElement.setAttribute('data-demo-lang', lang);
  // ?embed=1: shown inside the portfolio case page, which supplies its own view switch and language.
  if (new URLSearchParams(location.search).get('embed') === '1') {
    document.documentElement.setAttribute('data-demo-embed', '');
    var st = document.createElement('style');
    st.textContent = '[data-demo-embed] .preview-switch,[data-demo-embed] .preview-caption,[data-demo-embed] .preview-note{display:none!important}[data-demo-embed] body{padding-top:16px}';
    document.head ? document.head.appendChild(st) : document.documentElement.appendChild(st);
  }

  // Longest phrases are applied first, so whole sentences win over the words inside them.
  var D = {
    // customer app
    '理发预约 · 手机交互预览': 'Salon booking · interactive preview', '理发预约': 'Book a haircut',
    'GLASGOW · 英国当地时间': 'GLASGOW · UK local time', '英国当地时间': 'UK local time',
    '想做什么服务？': 'What would you like?', '哪天方便？': 'Which day suits you?',
    '按固定时间找': 'By time of day', '按日期看': 'By date', '查找方式': 'Search mode',
    '正在查询空位…': 'Checking free times…', '点日期选时间 · 当天不接受新预约': 'Tap a date to pick a time · no same-day bookings',
    '在手机内点击、返回与滚动': 'Tap, go back and scroll inside the phone', '浏览器内演示，数据只存在本机': 'Runs in your browser; data stays on this device',
    '顾客客户端': 'Customer app', '店铺后台': 'Shop admin', '切换检查端': 'Switch view', '手机预览': 'Phone preview',
    '刷新空位': 'Refresh times', '返回上一级': 'Back', '预约步骤': 'Booking steps', '主要导航': 'Main navigation',
    '上一周': 'Previous week', '下一周': 'Next week', '第一周': 'Week 1', '第二周': 'Week 2', '开始时间': 'Start time',
    '重置演示': 'Reset demo', '我的预约': 'My bookings', '预计时长': 'Duration',
    '正在改期 · 原预约会保留': 'Rescheduling · your original booking is kept', '正在改期': 'Rescheduling',
    '临时关闭': 'Closed', '你不能操作这条预约，请刷新后重试。': 'You can’t change this booking. Refresh and try again.',
    '保留预约': 'Keep booking', '修改预约时间': 'Change booking time', '修改时间': 'Change time', '再约一次': 'Book again',
    '匹配的时间': 'Matching times', '取消这次预约？': 'Cancel this booking?', '已取消预约，该时间已重新开放。': 'Booking cancelled. The time is open again.',
    '已完成 · 自动': 'Completed · auto', '已选日期': 'Selected date', '店铺营业时间有变，原预约保留，请重新选择时间。': 'Opening hours changed. Your booking is kept — please pick a new time.',
    '当前条件下暂无空位，试试其他服务或时间。': 'No free times for this search. Try another service or time.',
    '推荐仅供参考，以上时间都可以选择。': 'Suggested only — any time above can be booked.', '改期成功，原时间已释放。': 'Rescheduled. Your old time has been released.',
    '暂无匹配时段，请返回更换日期。': 'No matching times. Go back and try another date.', '暂时无法完成操作，请刷新后重试。': 'Couldn’t complete that. Refresh and try again.',
    '最后核对一下': 'Check before you book', '最早可约': 'Earliest free', '本次仅创建本地预览预约，不会通知店主。': 'Demo booking only — the owner is not notified.',
    '查看当天排期 · 空闲 / 已约': 'Day schedule · free / booked', '核对新的预约时间': 'Check your new time', '正在取消…': 'Cancelling…', '正在提交…': 'Booking…',
    '此时不可约': 'Not available', '此时可约': 'Available', '确认取消': 'Confirm cancellation',
    '确认后，时间将开放给其他顾客，取消记录会保留。如果只是时间不方便，也可以返回修改时间。': 'The time will open to other customers and a record is kept. If the time just doesn’t suit you, you can change it instead.',
    '确认成功后，原时间才会释放。': 'Your old time is released only after this is confirmed.', '确认改期': 'Confirm new time', '确认新时间前，原预约继续保留。': 'Your current booking stays until you confirm a new time.',
    '确认预约': 'Confirm booking', '该日已休息，请选择其他日期。': 'The shop is closed that day. Please pick another date.',
    '该日期已不在当前范围内，请返回重选。': 'That date is no longer bookable. Please go back and choose again.', '该日期暂未开放或已过期，请重新选择日期。': 'That date isn’t open yet or has passed. Please choose another.',
    '该时间最早可约': 'Earliest free time', '该服务暂不可预约，请选择其他服务。': 'This service can’t be booked right now. Please choose another.',
    '请先登录，再继续预约。': 'Please sign in to continue.', '请按预约时间到店。如计划有变，可在「我的预约」修改或取消。': 'Please arrive at your booked time. Plans changed? Edit or cancel in “My bookings”.',
    '请选择开始时间': 'Choose a start time', '请选择新日期，确认成功前原预约保留。': 'Pick a new date. Your booking is kept until you confirm.',
    '还没有预约': 'No bookings yet', '这个时间刚刚被预约了，请返回重新选择。': 'Someone just took that time. Please go back and choose again.',
    '这个时间已不可预约，请返回重新选择。': 'That time is no longer available. Please choose again.', '选好服务和时间，就可以预约了。': 'Pick a service and a time to book.',
    '选择开始时间': 'Choose a start time', '选择时间': 'Choose a time', '选时间': 'Time', '选服务与日期': 'Service & date', '重新选时间': 'Pick a new time',
    '预约成功，已为你保留以下时间。': 'Booked! This time is held for you.', '预约状态已变化，请刷新后重试。': 'This booking has changed. Refresh and try again.',
    '预约记录不存在，请返回刷新。': 'Booking not found. Go back and refresh.', '预约记录已保留。': 'Your booking record is kept.', '预约记录': 'Booking records',
    '下一步': 'Next', '未开放': 'Not open', '可预约': 'Free', '已预约': 'Booked', '已取消': 'Cancelled', '店铺取消': 'Cancelled by shop',
    '待改期': 'Needs new time', '未到店': 'No-show', '进行中': 'In progress', '已满': 'Full', '已约': 'Booked', '空闲': 'Free', '推荐': 'Suggested',
    '明天': 'Tomorrow', '今天': 'Today', '取消预约': 'Cancel booking', '服务': 'Service', '时间': 'Time', '预约': 'Book',
    // seed data
    '短发剪发': 'Short haircut', '长发剪发': 'Long haircut', '复杂染漂': 'Colour & bleach', '示例服务': 'Sample service', '剪发': 'Haircut', '染发': 'Colour',
    '150分钟空档': '150-min gap', '30 / 60 / 90分钟碎片': '30 / 60 / 90-min gaps', '临时整天关闭': 'Closed all day', '临时部分关闭': 'Partly closed',
    '固定周日休息': 'Closed Sundays', '多个30分钟碎片': 'Several 30-min gaps', '完全约满': 'Fully booked', '接近约满 / 仅30分钟': 'Nearly full / 30 min only',
    '较长连续空档': 'Long free block', '高占用 / 120分钟空档': 'Busy / 120-min gap', '高占用 / 180分钟空档': 'Busy / 180-min gap',
    '高占用 / 60分钟空档': 'Busy / 60-min gap', '高占用 / 两段60分钟': 'Busy / two 60-min gaps',
    '李女士': 'Ms Li', '林女士': 'Ms Lin', '王女士': 'Ms Wang', '陈先生': 'Mr Chen', '顾客（姓名待完善）': 'Customer (name pending)',
    '演示备注：希望自然一些': 'Demo note: wants a natural look', '演示：店铺临时休息，需要联系顾客重新选择时间': 'Demo: shop closed at short notice; customer needs to pick a new time',
    // shop admin
    '店铺预约本 · 界面预览': 'Shop diary · interface preview', '店铺预约本': 'Shop diary', '浏览器内演示': 'In-browser demo',
    '伦敦时间': 'London time', '下一位顾客': 'Next customer', '不常用的事情，放在这里。': 'Less frequent tasks live here.',
    '临时休息影响的预约，会保留在这里。': 'Bookings affected by a closure are kept here.', '临时调整今天': 'Adjust today', '临时休息': 'Time off', '临时调整': 'Adjust',
    '之后每周生效。已约顾客临时受影响时，请使用下方临时调整。': 'Applies every week from now. For one-off changes that affect booked customers, use Adjust below.',
    '人数为当天有效预约；空闲情况不代表每项服务都能放下。': 'Counts are active bookings; free time doesn’t mean every service fits.',
    '今天休息': 'Closed today', '今天剩余预约': 'Remaining today', '今天整体安排': 'Today at a glance', '今天没有后续预约': 'No more bookings today',
    '今天空闲时间': 'Free time today', '今日预约人数': 'Bookings today', '今日预约': 'Today',
    '你已完成操作预览。接入双方确认的共享后台后，这一步才会真正保存并同步给顾客。': 'Preview complete. Once the shared back end is connected, this step will save and sync to customers.',
    '保存安排': 'Save', '保存日期': 'Save dates', '保存服务项目？新的时长只用于新预约，已有预约保留原时长。': 'Save this service? New durations apply to new bookings only.',
    '保存服务': 'Save service', '保存营业安排': 'Save opening hours', '信息已发生变化，请刷新后再操作': 'Something changed. Refresh and try again',
    '先看一周，再安排每一天。': 'See the week first, then plan each day.', '先选时间，再确认顾客。保存时会再次检查是否可约。': 'Pick a time, then the customer. Availability is checked again on save.',
    '全天休息': 'Closed all day', '全天': 'All day', '关掉某一天，就是固定休息日。': 'Switch a day off to make it a regular day off.', '决定什么时候接客，其余交给预约本。': 'Decide when you work; the diary does the rest.',
    '创建预约': 'Create booking', '剩余空闲': 'Free left', '变更记录': 'Change log', '只处理需要你决定的事': 'Only what needs your decision',
    '名称、预计时长、启用和排序': 'Name, duration, on/off and order', '后台主导航': 'Admin navigation',
    '哪一天休息': 'Which day off', '填写原因，方便以后核对': 'Add a reason for your records', '备注（选填）': 'Note (optional)',
    '已有顾客编号': 'Existing customer ID', '已有预约会保留，受影响的顾客需要重新选时间。': 'Bookings are kept; affected customers will pick a new time.',
    '已保存': 'Saved', '已完成': 'Completed', '已暂停': 'Paused', '店主补录': 'Added by owner', '店铺临时调整': 'Shop change', '店铺取消预约': 'Shop cancelled',
    '开发调试：': 'Dev: ', '开放到指定日期': 'Open until a date', '开放预约至': 'Bookable until', '开放预约': 'Open for booking', '开放到': 'Open until',
    '异常处理': 'Exceptions', '异常记录': 'Exception log', '当前最早可添加明天的预约。': 'Bookings can be added from tomorrow.', '当前正在服务': 'Serving now',
    '当天已设置的休息': 'Time off set for this day', '待处理与异常记录': 'To do & exceptions', '待处理': 'To do',
    '待改期、店铺取消、异常记录': 'Needs new time, shop cancellations, exceptions', '微信预约': 'WeChat booking', '恢复营业': 'Reopen',
    '恢复这段时间的营业？待改期订单不会在页面自动恢复，后台仍须检查容量。': 'Reopen this time? Bookings waiting for a new time won’t be restored automatically.',
    '恢复这段时间的营业？待改期顾客仍需重新选择时间。': 'Reopen this time? Customers waiting for a new time still need to pick one.',
    '排序（数字小的排前面）': 'Order (lower first)', '接近满': 'Nearly full', '收起': 'Close', '日程': 'Schedule',
    '暂无剩余空闲': 'No free time left', '暂无可用联系电话': 'No phone number available', '暂无后续预约': 'No upcoming bookings', '暂无服务': 'No services',
    '暂时无法连接店铺，请稍后重试': 'Can’t reach the shop right now. Please try again', '暂未开放': 'Not open yet', '更多操作': 'More actions', '更多': 'More',
    '更新每周营业安排？已有预约的处理由后台统一检查，临时休息请使用“临时休息”。': 'Update weekly hours? Existing bookings are checked; use “Time off” for one-off closures.',
    '有空闲': 'Free time', '服务名称': 'Service name', '服务项目与时长': 'Services & durations', '服务项目': 'Services',
    '未来开放范围': 'How far ahead', '未来': 'Ahead', '本周': 'This week', '来源：': 'Source: ', '查看演示': 'View demo', '查看预约': 'View booking', '标记未到店': 'Mark no-show',
    '正在读取店铺安排…': 'Loading the shop diary…', '正常服务由系统自动完成。系统已完成的预约仍可修正为未到店。': 'Normal visits complete automatically. You can still mark one as a no-show.',
    '正常预约按时间自动完成，无需逐单确认。所有时间按英国伦敦时间显示。': 'Bookings complete automatically — no need to confirm each one. All times are London time.',
    '正常预约自动完成，无需逐单确认。': 'Bookings complete automatically — no need to confirm each one.', '正常': 'Normal',
    '此账号没有店铺管理权限，请联系店主': 'This account can’t manage the shop', '此预约需要顾客重新选择时间。恢复营业后，请查看这笔预约的最新状态。': 'This customer needs to pick a new time. After reopening, check this booking’s status.',
    '每周固定安排 / 伦敦时间': 'Weekly hours / London time', '每周固定安排': 'Weekly hours', '每周这天休息': 'Closed this day every week', '每天向前开放': 'Open each day ahead',
    '没有备注': 'No note', '没有找到这笔预约，请刷新': 'Booking not found. Please refresh', '浏览器预览不拨打电话；正式版由微信发起。': 'The preview doesn’t place calls; the live version calls via WeChat.',
    '添加预约': 'Add booking', '演示模式 · 没有保存': 'Demo mode · not saved', '演示预约本 · 示例数据，不会保存真实预约': 'Demo diary · sample data, no real bookings',
    '留足时间，好好服务': 'Leave enough time for each customer', '目前没有需要处理的预约': 'Nothing needs your attention', '知道了': 'OK', '确定': 'OK',
    '确认休息安排': 'Confirm time off', '确认保存': 'Confirm save', '确认添加': 'Confirm', '空闲较多': 'Mostly free', '结束时间须晚于开始时间': 'End time must be after start time',
    '结束时间': 'End time', '结束': 'End', '给自己留出休息时间': 'Make time to rest', '网页预约': 'Web booking', '联系顾客': 'Contact customer', '自定义日期': 'Custom date',
    '营业时间': 'Opening hours', '营业': 'Open', '该时段店铺休息，请选择其他时间': 'The shop is closed then. Please pick another time', '该时间刚刚被预约，请换一个时间': 'That time was just booked. Please pick another',
    '该服务不存在，请刷新后重试': 'Service not found. Please refresh', '该服务已暂停预约': 'This service is paused', '请先登录后重试': 'Please sign in and try again',
    '请填写名称和有效时长': 'Enter a name and a valid duration', '请填写处理原因': 'Please add a reason', '请检查填写的信息': 'Please check the details',
    '请检查每天的营业时间': 'Please check each day’s hours', '请确认': 'Please confirm', '请选择明天或之后的日期': 'Choose tomorrow or later', '请选择服务并填写顾客编号': 'Choose a service and enter a customer ID',
    '调整服务时长，不会改变已有预约。': 'Changing a duration doesn’t affect existing bookings.', '较忙': 'Busy', '返回服务列表': 'Back to services', '还需接待': 'Still to come',
    '这一天没有临时休息安排': 'No time off this day', '这一天没有预约': 'No bookings this day', '这个开始时间不符合预约规则': 'That start time doesn’t follow the booking rules',
    '这个日期尚未开放预约': 'That date isn’t open yet', '选中时间尚未锁定；服务需要完整放入空闲时间。': 'Time not held yet; the service must fit inside free time.', '选择日期': 'Choose date',
    '选择日期后，也可以恢复已关闭的时间。受影响预约会保留并进入待改期。': 'After choosing a date you can also reopen closed time. Affected bookings are kept and marked “needs new time”.',
    '部分临时关闭': 'Partly closed', '重新加载': 'Reload', '顾客取消': 'Customer cancelled', '顾客客户端': 'Customer app',
    '顾客选择功能尚未接入，暂时无法在此提交预约。': 'Customer picker not connected yet; booking can’t be submitted here.',
    '顾客重新选择时间后，预约恢复为“已预约”。消息发送失败也不会删除预约。': 'Once the customer picks a new time, the booking returns to “Booked”. A failed message never deletes a booking.',
    '预约时间已调整': 'Booking time changed', '预约状态已变化，请刷新后重试': 'This booking has changed. Refresh and try again', '预约详情': 'Booking details',
    '预览休息安排': 'Preview time off', '预览服务设置': 'Preview service', '预览营业安排': 'Preview hours', '预计占用': 'Booked time', '预计时长（分钟）': 'Duration (minutes)',
    '＋ 临时休息一天': '+ Take a day off', '＋ 临时关闭几个小时': '+ Close for a few hours', '＋ 添加服务': '+ Add service', '＋ 添加预约': '+ Add booking',
    '已关闭': 'closed', '休息': 'Closed', '取消': 'Cancel', '开始': 'Start', '至': 'to', '顾客': 'Customer', '日期': 'Date', '返回': 'Back',
    '今天共': 'Today:', '位客人': 'customers', '位　›': ' ›', '人 · ': 'booked · ',
    '分钟': ' min', '个可选': ' free', '小时': ' h',
    '周一': 'Mon', '周二': 'Tue', '周三': 'Wed', '周四': 'Thu', '周五': 'Fri', '周六': 'Sat', '周日': 'Sun'
  };
  var keys = Object.keys(D).sort(function (a, b) { return b.length - a.length; });
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var P = [
    [/(\d)(周[一二三四五六日])/g, '$1 $2'],
    [/暂停\s*(\S+)\s*(全天|[\d:]+—[\d:]+)\s*的预约？受影响预约会保留并转为待改期。/g, function (m, d, t) { return 'Pause bookings on ' + d + ' (' + (t === '全天' ? 'all day' : t) + ')? Affected bookings are kept and marked “needs new time”.'; }],
    [/将(.+?)的预约设为“(.+?)”？/g, 'Mark the booking for $1 as “$2”?'],
    [/(\d+)月(\d+)日/g, function (m, a, b) { return b + ' ' + MON[a - 1]; }],
    [/今天共\s*(\d+)\s*位客人/g, '$1 customers today'],
    [/待改期\s*(\d+)\s*位/g, '$1 need a new time'],
    [/(\d+)\s*个可选/g, '$1 free'],
    [/开放至\s*/g, 'Open until '],
    [/(\d+)\s*人\s*·\s*/g, '$1 booked · '],
    [/(\d+)\s*位/g, '$1'],
    [/(\d+)\s*周(?![一二三四五六日])/g, function (m, n) { return n + (n === '1' ? ' week' : ' weeks'); }],
    [/(\d+)\s*分钟/g, '$1 min'],
    [/(\d+)\s*小时/g, '$1 h']
  ];
  var POST = [
    [/预计\s*/g, 'Est. '],
    [/补录\s*/g, 'Add '],
    [/暂停\s*/g, 'Pause '],
    [/，/g, ', '], [/？/g, '?'], [/：/g, ': '], [/。/g, '. '], [/的/g, ' ']
  ];
  var HAN = /[一-鿿，。？：]/;
  function tr(s) {
    if (!HAN.test(s)) return s;
    var t = s.trim(); if (D[t]) return s.replace(t, D[t]);
    for (var j = 0; j < P.length; j++) s = s.replace(P[j][0], P[j][1]);
    for (var i = 0; i < keys.length; i++) if (s.indexOf(keys[i]) >= 0) s = s.split(keys[i]).join(D[keys[i]]);
    for (var k = 0; k < POST.length; k++) s = s.replace(POST[k][0], POST[k][1]);
    return s;
  }
  window.__demoT = tr;
  if (lang === 'zh') return;

  var ATTRS = ['aria-label', 'placeholder', 'title', 'alt'];
  function walk(root) {
    if (root.nodeType === 3) { var v = tr(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (root.tagName === 'SCRIPT' || root.tagName === 'STYLE') return;
      for (var a = 0; a < ATTRS.length; a++) { var x = root.getAttribute(ATTRS[a]); if (x && HAN.test(x)) root.setAttribute(ATTRS[a], tr(x)); }
      if ((root.tagName === 'INPUT' || root.tagName === 'TEXTAREA') && HAN.test(root.value || '')) root.value = tr(root.value);
    }
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  var nativeConfirm = window.confirm.bind(window), nativeAlert = window.alert.bind(window);
  window.confirm = function (m) { return nativeConfirm(tr(String(m))); };
  window.alert = function (m) { return nativeAlert(tr(String(m))); };
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'characterData') walk(m.target);
      else if (m.type === 'attributes') walk(m.target);
      else for (var k = 0; k < m.addedNodes.length; k++) walk(m.addedNodes[k]);
    }
    if (HAN.test(document.title)) document.title = tr(document.title);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  document.addEventListener('DOMContentLoaded', function () { walk(document); });
  document.documentElement.lang = 'en';
})();

const el = (id) => document.getElementById(id);
const escape = (s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const time = (iso) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
const localDate = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const label = (date) => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Europe/London', month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(date + 'T12:00:00Z'));
const dayName = (date) => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Europe/London', weekday: 'short' }).format(new Date(date + 'T12:00:00Z'));
let data;
let serviceId = 'cut30';
let page = 'home';
let mode = 'date';
let activeDate = '';
let weekOffset = 0;
let selected;
let editing;
let cancelling;
let revision = 0;
let loading = false;
let submitting = false;
const errors = {
    SLOT_TAKEN: '这个时间刚刚被预约了，请返回重新选择。',
    SLOT_INVALID: '这个时间已不可预约，请返回重新选择。',
    SHOP_CLOSED: '该日已休息，请选择其他日期。',
    OUTSIDE_BOOKING_WINDOW: '该日期暂未开放或已过期，请重新选择日期。',
    FORBIDDEN: '你不能操作这条预约，请刷新后重试。',
    AUTH_REQUIRED: '请先登录，再继续预约。',
    SERVICE_INACTIVE: '该服务暂不可预约，请选择其他服务。',
    INVALID_APPOINTMENT_STATE: '预约状态已变化，请刷新后重试。'
};
function message(text) { el('message').textContent = text; }
function service() { return data.services.find(s => s.serviceId === serviceId); }
function duration() { return editing?.durationMinSnapshot ?? service().durationMin; }
function serviceName() { return editing?.serviceNameSnapshot ?? service().name; }
const statusLabels = { booked: '已预约', in_progress: '进行中', completed_auto: '已完成 · 自动', cancelled_by_user: '已取消', cancelled_by_shop: '店铺取消', needs_reschedule: '待改期', no_show: '未到店' };
function visibleSlots(day) {
    return mode === 'time' ? day.legalSlots.filter(s => time(s.startAt) === el('preferred').value) : day.legalSlots;
}
async function api(path, body) {
    const response = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
    const result = await response.json();
    if (!response.ok)
        throw new Error(errors[result.error] || '暂时无法完成操作，请刷新后重试。');
    return result;
}
async function load() {
    const request = ++revision;
    loading = true;
    el('main').setAttribute('aria-busy', 'true');
    el('refresh').disabled = true;
    if (data && !submitting)
        render();
    try {
        const result = await api('/api/state?' + new URLSearchParams({ serviceId, ...(editing ? { editing: editing.appointmentId } : {}) }));
        if (request !== revision)
            return;
        data = result;
        if (selected && !data.days.some(d => d.legalSlots.some(s => s.startAt === selected.startAt)))
            selected = undefined;
    }
    catch (error) {
        message(error.message);
    }
    finally {
        if (request === revision) {
            loading = false;
            el('main').setAttribute('aria-busy', 'false');
            if (data && !submitting)
                render();
            el('refresh').disabled = submitting;
        }
    }
}
function go(next, replace = false) {
    page = next;
    history[replace ? 'replaceState' : 'pushState']({ page }, '', '#' + next);
    render();
    el('main').scrollTop = 0;
    el('title').focus({ preventScroll: true });
}
function renderHome() {
    const picker = el('preferred');
    const previousTime = picker.value;
    const options = [...new Set(data.days.flatMap(d => d.legalSlots.map(s => time(s.startAt))))].sort();
    // Keep the chosen time visible even when switching services makes it unavailable.
    if (previousTime && !options.includes(previousTime))
        options.push(previousTime);
    picker.innerHTML = options.sort().map(value => `<option>${value}</option>`).join('');
    if (previousTime)
        picker.value = previousTime;
    picker.disabled = options.length === 0 || loading;
    el('services').innerHTML = data.services.map(s => `<button class="service" data-service="${s.serviceId}" aria-pressed="${s.serviceId === serviceId}" ${editing || loading ? 'disabled' : ''}>${escape(s.name)}<small>${s.durationMin} 分钟</small></button>`).join('');
    const earliest = data.days.flatMap(visibleSlots)[0];
    el('earliest').innerHTML = earliest
        ? `<button data-date="${localDate(earliest.startAt)}" ${loading ? 'disabled' : ''}><div><small>${mode === 'time' ? '该时间最早可约' : '最早可约'}${editing ? ' · 正在改期' : ''}</small><strong>${label(localDate(earliest.startAt))} · ${time(earliest.startAt)}</strong></div><span aria-hidden="true">→</span></button>`
        : '<p class="hint">当前条件下暂无空位，试试其他服务或时间。</p>';
    el('until').textContent = '开放至 ' + data.last.slice(5).replace('-', '/');
    el('timeFilter').hidden = mode !== 'time';
    el('byDate').setAttribute('aria-pressed', String(mode === 'date'));
    el('byTime').setAttribute('aria-pressed', String(mode === 'time'));
    el('days').setAttribute('aria-busy', String(loading));
    const visibleDays = data.days.slice(weekOffset * 7, weekOffset === 0 ? 7 : 15);
    el('weekLabel').textContent = weekOffset === 0 ? '第一周' : '第二周';
    el('prevWeek').disabled = weekOffset === 0 || loading;
    el('nextWeek').disabled = weekOffset === 1 || loading;
    el('days').innerHTML = visibleDays.map(day => {
        const slots = visibleSlots(day);
        const enabled = slots.length > 0;
        const status = day.dayStatus === 'available'
            ? (enabled ? (mode === 'time' ? '此时可约' : '可预约') : '此时不可约')
            : { full: '已满', closed: '休息', not_open_yet: '未开放' }[day.dayStatus];
        const date = day.date.slice(5).replace('-', '/');
        return `<button class="date-card ${!enabled ? 'unavailable' : ''} ${day.dayStatus}" data-date="${day.date}" aria-label="${label(day.date)} ${status}" ${!enabled || loading ? 'disabled' : ''}><span class="weekday">${day.date === data.first ? '明天' : dayName(day.date)}</span><strong>${date}</strong><span class="state">${status}</span></button>`;
    }).join('');
}
function slotButton(slot, recommended) {
    return `<button class="slot" data-start="${slot.startAt}" aria-label="${time(slot.startAt)} 开始${recommended ? ' 推荐' : ''}" aria-pressed="${selected?.startAt === slot.startAt}" ${loading ? 'disabled' : ''}>${time(slot.startAt)}${recommended ? '<small>推荐</small>' : ''}</button>`;
}
// Occupancy visualization only; legal times are always returned by the shared engine.
function timeline(date) {
    const weekday = new Date(date + 'T12:00:00Z').getUTCDay();
    const hours = data.businessHours.find(h => h.dayOfWeek === weekday);
    if (!hours?.isOpen || !hours.openTime || !hours.closeTime)
        return '<p class="hint">休息</p>';
    const minutes = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    const open = minutes(hours.openTime), close = minutes(hours.closeTime);
    const intervals = [...data.busy.map(s => ({ ...s, kind: '已约' })), ...data.closures.map(s => ({ ...s, kind: '临时关闭' }))].filter(s => localDate(s.startAt) <= date && localDate(s.endAt) >= date).map(s => ({
        from: Math.max(open, localDate(s.startAt) < date ? open : minutes(time(s.startAt))),
        to: Math.min(close, localDate(s.endAt) > date ? close : minutes(time(s.endAt))), kind: s.kind
    })).filter(s => s.from < s.to);
    const points = [...new Set([open, close, ...intervals.flatMap(s => [s.from, s.to])])].sort((a, b) => a - b);
    const clock = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
    const segments = points.slice(0, -1).map((from, i) => ({ from, to: points[i + 1], kind: intervals.find(s => s.kind === '临时关闭' && s.from <= from && s.to >= points[i + 1])?.kind ?? intervals.find(s => s.from <= from && s.to >= points[i + 1])?.kind ?? '空闲' }));
    return `<div class="timeline" aria-hidden="true">${segments.map(s => `<span class="${s.kind === '空闲' ? '' : 'busy'}" style="flex:${s.to - s.from}"></span>`).join('')}</div><div class="intervals">${segments.map(s => `<span>${s.kind} ${clock(s.from)}–${clock(s.to)}</span>`).join('')}</div>`;
}
function renderDay() {
    const day = data.days.find(d => d.date === activeDate);
    if (!day) {
        el('day').innerHTML = '<p class="empty">该日期已不在当前范围内，请返回重选。</p>';
        return;
    }
    const slots = visibleSlots(day);
    el('day').innerHTML = `<div class="day-summary"><small>${editing ? '修改预约时间' : '已选日期'}</small><h2>${label(day.date)}</h2><p class="hint">${escape(serviceName())} · 预计 ${duration()} 分钟</p></div><div class="heading"><h2>${mode === 'time' ? '匹配的时间' : '选择开始时间'}</h2><small>${slots.length} 个可选</small></div><div class="slots">${slots.map(s => slotButton(s, day.recommendedSlots.some(r => r.startAt === s.startAt))).join('')}</div>${slots.length ? '' : '<p class="empty">暂无匹配时段，请返回更换日期。</p>'}<p class="hint day-note">推荐仅供参考，以上时间都可以选择。</p>${editing ? '<p class="explain">确认新时间前，原预约继续保留。</p>' : ''}<details><summary>查看当天排期 · 空闲 / 已约</summary>${timeline(day.date)}</details>`;
}
function ticket(startAt, endAt, name, minutes) {
    return `<div class="ticket"><p class="ticket-date">${label(localDate(startAt))}</p><p class="ticket-time">${time(startAt)}–${time(endAt)}</p><dl><div><dt>服务</dt><dd>${escape(name)}</dd></div><div><dt>预计时长</dt><dd>${minutes} 分钟</dd></div><div><dt>时间</dt><dd>英国当地时间</dd></div></dl></div>`;
}
function renderConfirm() {
    el('confirm').innerHTML = selected
        ? `<h2>${editing ? '核对新的预约时间' : '最后核对一下'}</h2>${ticket(selected.startAt, selected.endAt, serviceName(), duration())}<p class="explain">${editing ? '确认成功后，原时间才会释放。' : '请按预约时间到店。如计划有变，可在「我的预约」修改或取消。'}</p><p class="hint">本次仅创建本地预览预约，不会通知店主。</p>`
        : '<p class="empty">这个时间已不可预约，请返回重新选择。</p>';
}
function renderMine() {
    el('mine').innerHTML = '<div class="heading"><h2>预约记录</h2><button id="newBooking" class="text-button">再约一次</button></div>' +
        (data.appointments.length ? data.appointments.slice().reverse().map(a => `<article class="appointment ${a.status === 'cancelled_by_user' ? 'cancelled' : ''}"><div class="heading"><h3>${label(localDate(a.startAt))}</h3><span class="badge">${statusLabels[a.status]}</span></div><strong>${time(a.startAt)}–${time(a.endAt)}</strong><p class="hint">${escape(a.serviceNameSnapshot)} · ${a.durationMinSnapshot} 分钟</p>${a.status === 'needs_reschedule' ? `<p class="explain">店铺营业时间有变，原预约保留，请重新选择时间。</p><div class="actions"><button data-edit="${a.appointmentId}">重新选时间</button></div>` : a.status === 'booked' ? `<div class="actions"><button data-edit="${a.appointmentId}">修改时间</button><button data-cancel="${a.appointmentId}">取消预约</button></div>` : '<p class="hint">预约记录已保留。</p>'}</article>`).join('') : '<div class="empty">还没有预约<br>选好服务和时间，就可以预约了。</div>');
}
function renderCancel() {
    el('cancel').innerHTML = cancelling
        ? '<h2>取消这次预约？</h2>' + ticket(cancelling.startAt, cancelling.endAt, cancelling.serviceNameSnapshot, cancelling.durationMinSnapshot) + '<p class="explain">确认后，时间将开放给其他顾客，取消记录会保留。如果只是时间不方便，也可以返回修改时间。</p>'
        : '<p class="empty">预约记录不存在，请返回刷新。</p>';
}
function render() {
    if (!data)
        return;
    for (const id of ['home', 'day', 'confirm', 'mine', 'cancel'])
        el(id).hidden = id !== page;
    const titles = { home: '理发预约', day: '选择时间', confirm: '确认预约', mine: '我的预约', cancel: '取消预约' };
    el('title').textContent = titles[page];
    el('subtitle').textContent = editing ? '正在改期 · 原预约会保留' : 'GLASGOW · 英国当地时间';
    el('back').hidden = page === 'home' || page === 'mine';
    el('back').disabled = submitting;
    el('refresh').disabled = loading || submitting;
    el('steps').hidden = page === 'mine' || page === 'cancel';
    const activeStep = page === 'confirm' ? 2 : page === 'day' ? 1 : 0;
    el('steps').innerHTML = ['选服务与日期', '选时间', '确认预约'].map((s, i) => `${i ? '<span class="arrow" aria-hidden="true">›</span>' : ''}<${i === activeStep ? 'b' : 'span'} ${i === activeStep ? 'aria-current="step"' : ''}>${i + 1} ${s}</${i === activeStep ? 'b' : 'span'}>`).join('');
    renderHome();
    renderDay();
    renderConfirm();
    renderMine();
    renderCancel();
    el('nav').hidden = page !== 'home' && page !== 'mine';
    el('navBook').toggleAttribute('aria-current', page === 'home');
    el('navMine').toggleAttribute('aria-current', page === 'mine');
    el('count').textContent = String(data.appointments.filter(a => ['booked', 'in_progress', 'needs_reschedule'].includes(a.status)).length || '');
    const action = el('actionbar');
    action.hidden = page === 'home' || page === 'mine';
    if (page === 'day')
        action.innerHTML = `<div><strong>${selected ? time(selected.startAt) + '–' + time(selected.endAt) : '请选择开始时间'}</strong><small>${escape(serviceName())} · ${duration()} 分钟</small></div><button id="review" class="primary" ${!selected || loading ? 'disabled' : ''}>下一步</button>`;
    if (page === 'confirm')
        action.innerHTML = `<button id="submit" class="primary wide" ${submitting || loading || !selected ? 'disabled' : ''}>${submitting ? '正在提交…' : editing ? '确认改期' : '确认预约'}</button>`;
    if (page === 'cancel')
        action.innerHTML = `<button id="keepBooking" ${submitting ? 'disabled' : ''}>保留预约</button><button id="submitCancel" class="danger" ${submitting || !cancelling ? 'disabled' : ''}>${submitting ? '正在取消…' : '确认取消'}</button>`;
}
async function submit(cancel = false) {
    if (submitting || loading || (cancel ? !cancelling : !selected))
        return;
    submitting = true;
    message('');
    render();
    try {
        if (cancel) {
            await api('/api/cancel', { appointmentId: cancelling.appointmentId });
            message('已取消预约，该时间已重新开放。');
        }
        else {
            await api(editing ? '/api/reschedule' : '/api/create', editing
                ? { appointmentId: editing.appointmentId, startAt: selected.startAt }
                : { serviceId, startAt: selected.startAt });
            message(editing ? '改期成功，原时间已释放。' : '预约成功，已为你保留以下时间。');
        }
        selected = undefined;
        editing = undefined;
        cancelling = undefined;
        await load();
        go('mine', true);
    }
    catch (error) {
        message(error.message);
        await load();
        el('main').scrollTop = 0;
    }
    finally {
        submitting = false;
        render();
    }
}
function back() {
    if (submitting)
        return;
    message('');
    go(page === 'confirm' ? 'day' : page === 'cancel' ? 'mine' : 'home');
}
document.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled || submitting)
        return;
    const { service: nextService, date, start, edit, cancel } = button.dataset;
    if (nextService) {
        serviceId = nextService;
        selected = undefined;
        message('');
        await load();
    }
    if (date) {
        if (activeDate !== date)
            selected = undefined;
        activeDate = date;
        message('');
        go('day');
        await load();
    }
    if (start) {
        selected = data.days.flatMap(d => d.legalSlots).find(s => s.startAt === start);
        render();
    }
    if (edit) {
        editing = data.appointments.find(a => a.appointmentId === edit);
        serviceId = editing.serviceId;
        selected = undefined;
        activeDate = '';
        mode = 'date';
        weekOffset = 0;
        await load();
        message('请选择新日期，确认成功前原预约保留。');
        go('home');
    }
    if (cancel) {
        cancelling = data.appointments.find(a => a.appointmentId === cancel);
        message('');
        go('cancel');
    }
    if (button.id === 'prevWeek' || button.id === 'nextWeek') {
        weekOffset = button.id === 'nextWeek' ? 1 : 0;
        renderHome();
    }
    if (button.id === 'review') {
        message('');
        go('confirm');
    }
    if (button.id === 'submit')
        await submit();
    if (button.id === 'submitCancel')
        await submit(true);
    if (button.id === 'back')
        back();
    if (button.id === 'keepBooking') {
        cancelling = undefined;
        message('');
        go('mine');
    }
    if (button.id === 'byDate' || button.id === 'byTime') {
        mode = button.id === 'byDate' ? 'date' : 'time';
        selected = undefined;
        render();
    }
    if (button.id === 'navBook' || button.id === 'newBooking' || button.id === 'navMine') {
        editing = undefined;
        selected = undefined;
        message('');
        await load();
        go(button.id === 'navMine' ? 'mine' : 'home');
    }
});
el('preferred').onchange = () => { selected = undefined; render(); };
el('refresh').onclick = () => { void load(); };
window.addEventListener('popstate', () => {
    if (submitting)
        return;
    let next = location.hash.slice(1);
    if (!['home', 'day', 'confirm', 'mine', 'cancel'].includes(next))
        next = 'home';
    if (next === 'day' && !activeDate || next === 'confirm' && !selected || next === 'cancel' && !cancelling)
        next = 'home';
    page = next;
    message('');
    render();
    el('main').scrollTop = 0;
    el('title').focus({ preventScroll: true });
});
history.replaceState({ page: 'home' }, '', '#home');
void load();
document.addEventListener('visibilitychange', () => { if (!document.hidden && !submitting && !loading)
    void load(); });
export {};

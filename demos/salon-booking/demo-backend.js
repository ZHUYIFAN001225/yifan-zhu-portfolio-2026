(function(){
"use strict";
const __defs = {
"node:http": function (exports) {exports.createServer = (handler) => { const s = { handler, address: () => ({ port: 4173 }), listen() { return s; }, on() { return s; } }; return s; };},
"node:fs/promises": function (exports) {exports.readFile = async () => { throw new Error('not available in browser'); };},
"node:path": function (exports) {exports.resolve = (...p) => p.join('/');},
"dist/preview/server.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreviewServer = createPreviewServer;
const node_http_1 = __require("node:http");
const promises_1 = __require("node:fs/promises");
const node_path_1 = __require("node:path");
const availability_1 = __require("dist/cloudfunctions/booking-core/availability.js");
const create_appointment_1 = __require("dist/cloudfunctions/booking-core/create-appointment.js");
const lifecycle_1 = __require("dist/cloudfunctions/booking-core/lifecycle.js");
const policy_1 = __require("dist/cloudfunctions/booking-core/policy.js");
const time_1 = __require("dist/cloudfunctions/common/time.js");
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const memory_repository_1 = __require("dist/preview/memory-repository.js");
const seed_1 = __require("dist/preview/seed.js");
const admin_1 = __require("dist/cloudfunctions/booking-core/admin.js");
// Server-side, fixed demo identities only. No identity supplied by HTTP request is trusted.
function createPreviewServer(options = {}) {
    const clock = options.clock ?? (() => new Date());
    const repository = options.repository ?? new memory_repository_1.MemoryRepository((0, seed_1.realisticFixture)(clock()).data);
    const actor = options.actor ?? { userId: 'preview-customer', role: 'customer' };
    const adminActor = { userId: 'preview-admin', role: 'admin' };
    const root = (0, node_path_1.resolve)(__dirname, '../..');
    async function snapshot(serviceId, editing) {
        const now = clock();
        await (0, lifecycle_1.reconcileStatuses)(repository, now);
        const data = repository.snapshot(), { first, last } = (0, policy_1.bookingBounds)(data.policy, now);
        // All sections in this response must describe the same committed snapshot.
        const view = new memory_repository_1.MemoryRepository(data);
        const endDate = (0, time_1.addLocalDays)(last, 1);
        const range = { startDate: first, endDate };
        const days = editing ? await (0, lifecycle_1.getRescheduleAvailability)(editing, range, actor, view, now)
            : await view.transaction(tx => (0, availability_1.getAvailability)({ serviceId, ...range }, tx, now));
        const appointments = await (0, lifecycle_1.getMyAppointments)(actor, view);
        const original = editing ? appointments.find(a => a.appointmentId === editing) : undefined;
        return {
            services: data.services.filter(s => s.isActive), first, last, days, appointments,
            busy: data.appointments.filter(a => ['booked', 'in_progress'].includes(a.status) && a.appointmentId !== original?.appointmentId).map(a => ({ startAt: a.startAt, endAt: a.endAt })),
            // Preview-only presentation data, not changes to Availability API or persisted schema.
            closures: data.closures.filter(c => c.status === 'active').map(c => ({ startAt: c.startAt, endAt: c.endAt })),
            businessHours: data.hours
        };
    }
    async function adminSnapshot(date) {
        const now = clock();
        await (0, lifecycle_1.reconcileStatuses)(repository, now);
        return repository.transaction(tx => (0, admin_1.getAdminSchedule)(date, tx, now));
    }
    const server = (0, node_http_1.createServer)(async (req, res) => {
        const origin = 'http://127.0.0.1:' + server.address().port;
        const url = new URL(req.url || '/', origin);
        res.setHeader('Cache-Control', 'no-store');
        try {
            (0, errors_1.requireValue)(req.headers.host === new URL(origin).host, 'FORBIDDEN');
            if (url.pathname.startsWith('/api/admin/')) {
                (0, errors_1.requireValue)(options.enableAdminDemo === true, 'FORBIDDEN');
                (0, errors_1.requireValue)(req.headers['x-demo-admin'] === 'local-preview', 'FORBIDDEN');
                (0, errors_1.requireValue)(!req.headers.origin || req.headers.origin === origin, 'FORBIDDEN');
            }
            if (url.pathname === '/api/state' && req.method === 'GET') {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(await snapshot(url.searchParams.get('serviceId') || 'cut30', url.searchParams.get('editing') || undefined)));
                return;
            }
            if (url.pathname === '/api/admin/state' && req.method === 'GET') {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                const date = url.searchParams.get('date') || (0, policy_1.bookingBounds)(repository.snapshot().policy, clock()).first;
                res.end(JSON.stringify(await adminSnapshot(date)));
                return;
            }
            if (url.pathname === '/api/admin/dashboard' && req.method === 'GET') {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(await (0, admin_1.getAdminDashboard)(repository, clock())));
                return;
            }
            if (url.pathname === '/api/admin/pending' && req.method === 'GET') {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(await (0, admin_1.getPendingActions)(repository)));
                return;
            }
            if (url.pathname.startsWith('/api/')) {
                (0, errors_1.requireValue)(req.method === 'POST' && req.headers.origin === origin, 'FORBIDDEN');
                let raw = '';
                for await (const chunk of req) {
                    raw += chunk;
                    (0, errors_1.requireValue)(Buffer.byteLength(raw) <= 8192);
                }
                let body;
                try {
                    body = JSON.parse(raw);
                }
                catch {
                    throw new errors_1.BookingError('INVALID_INPUT');
                }
                (0, errors_1.requireValue)(body && typeof body === 'object' && !Array.isArray(body));
                let result;
                if (url.pathname === '/api/create')
                    result = await (0, create_appointment_1.createAppointment)({ customerId: actor.userId, source: 'wechat', serviceId: body.serviceId, startAt: body.startAt }, repository, clock());
                else if (url.pathname === '/api/cancel')
                    result = await (0, lifecycle_1.cancelAppointment)(body.appointmentId, actor, repository, clock());
                else if (url.pathname === '/api/reschedule')
                    result = await (0, lifecycle_1.rescheduleAppointment)(body.appointmentId, body.startAt, actor, repository, clock());
                else if (url.pathname === '/api/admin/no-show')
                    result = await (0, lifecycle_1.setAppointmentException)(body.appointmentId, 'no_show', adminActor, repository, clock());
                else if (url.pathname === '/api/admin/exception')
                    result = await (0, lifecycle_1.setAppointmentException)(body.appointmentId, body.status, adminActor, repository, clock());
                else if (url.pathname === '/api/admin/closure') {
                    (0, errors_1.requireValue)(typeof body.date === 'string' && typeof body.type === 'string');
                    const startAt = body.type === 'full_day' ? (0, time_1.localDateTimeToUtc)(body.date, '00:00').toISOString() : (0, time_1.localDateTimeToUtc)(body.date, body.startTime).toISOString();
                    const endAt = body.type === 'full_day' ? (0, time_1.localDateTimeToUtc)((0, time_1.addLocalDays)(body.date, 1), '00:00').toISOString() : (0, time_1.localDateTimeToUtc)(body.date, body.endTime).toISOString();
                    result = await (0, lifecycle_1.createClosure)({ type: body.type, startAt, endAt }, adminActor, repository, clock());
                }
                else if (url.pathname === '/api/admin/remove-closure')
                    result = await (0, admin_1.removeClosure)(body.closureId, adminActor, repository);
                else if (url.pathname === '/api/admin/business-hours')
                    result = await (0, admin_1.setBusinessHours)(body.businessHours, adminActor, repository);
                else if (url.pathname === '/api/admin/booking-policy')
                    result = await (0, admin_1.setBookingPolicy)(body, adminActor, repository);
                else if (url.pathname === '/api/admin/service')
                    result = await (0, admin_1.upsertService)(body, adminActor, repository, clock());
                else if (url.pathname === '/api/admin/manual-appointment')
                    result = await (0, admin_1.createManualAppointment)(body, adminActor, repository, clock());
                else
                    throw new errors_1.BookingError('INVALID_INPUT');
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(result));
                return;
            }
            const files = { '/': ['preview/index.html', 'text/html'], '/admin.html': ['admin-client/preview/index.html', 'text/html'], '/admin-legacy.html': ['preview/admin.html', 'text/html'], '/style.css': ['preview/style.css', 'text/css'], '/client.js': ['dist/browser/preview/client.js', 'text/javascript'], '/admin-client.js': ['preview/admin-client.js', 'text/javascript'] };
            const file = files[url.pathname];
            if (!file) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.setHeader('Content-Type', file[1] + '; charset=utf-8');
            res.end(await (0, promises_1.readFile)((0, node_path_1.resolve)(root, file[0])));
        }
        catch (error) {
            const code = error instanceof errors_1.BookingError ? error.code : 'INTERNAL_ERROR';
            res.writeHead(code === 'FORBIDDEN' ? 403 : code === 'INTERNAL_ERROR' ? 500 : 409, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: code }));
        }
    });
    return { server, repository };
}
// Explicit local role simulation; never enable for a deployed/customer-facing server.
if (require.main === module)
    createPreviewServer({ enableAdminDemo: true }).server.listen(4173, '127.0.0.1', () => console.log('High-occupancy preview: http://127.0.0.1:4173/'));

},
"dist/preview/memory-repository.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRepository = void 0;
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const time_1 = __require("dist/cloudfunctions/common/time.js");
class MemoryRepository {
    data;
    tail = Promise.resolve();
    failNextCommit = false;
    constructor(seed) { this.data = structuredClone(seed); }
    snapshot() { return structuredClone(this.data); }
    async configureFixture(change) {
        const job = this.tail.then(() => { const draft = this.snapshot(); change(draft); this.data = draft; });
        this.tail = job.catch(() => { });
        return job;
    }
    async getService(id) { return this.snapshot().services.find(s => s.serviceId === id); }
    async getAllServices() { return this.snapshot().services; }
    async getPolicy() { return this.snapshot().policy; }
    async getBusinessHours() { return this.snapshot().hours; }
    async getClosures(start, end) { return this.snapshot().closures.filter(c => (0, time_1.overlaps)(c.startAt, c.endAt, start, end)); }
    async getAppointments(start, end) { return this.snapshot().appointments.filter(a => (0, time_1.overlaps)(a.startAt, a.endAt, start, end)); }
    async createAppointment(_a) { throw new Error('Use transaction'); }
    transaction(work) {
        const job = this.tail.then(async () => {
            const draft = this.snapshot();
            const check = (a) => {
                if (!['booked', 'in_progress'].includes(a.status))
                    return;
                (0, errors_1.requireValue)(!draft.appointments.some(other => other.appointmentId !== a.appointmentId && ['booked', 'in_progress'].includes(other.status) && (0, time_1.overlaps)(a.startAt, a.endAt, other.startAt, other.endAt)), 'SLOT_TAKEN');
            };
            const tx = {
                getAllServices: async () => structuredClone(draft.services),
                getService: async (id) => structuredClone(draft.services.find(s => s.serviceId === id)),
                getPolicy: async () => structuredClone(draft.policy), getBusinessHours: async () => structuredClone(draft.hours),
                getClosures: async (start, end) => structuredClone(draft.closures.filter(c => (0, time_1.overlaps)(c.startAt, c.endAt, start, end))),
                getAppointments: async (start, end) => structuredClone(draft.appointments.filter(a => (0, time_1.overlaps)(a.startAt, a.endAt, start, end))),
                getAppointment: async (id) => structuredClone(draft.appointments.find(a => a.appointmentId === id)),
                createAppointment: async (a) => { (0, errors_1.requireValue)(!draft.appointments.some(x => x.appointmentId === a.appointmentId), 'CONFLICT'); check(a); draft.appointments.push(structuredClone(a)); },
                saveAppointment: async (a) => { const index = draft.appointments.findIndex(x => x.appointmentId === a.appointmentId); (0, errors_1.requireValue)(index >= 0, 'APPOINTMENT_NOT_FOUND'); check(a); draft.appointments[index] = structuredClone(a); },
                saveClosure: async (c) => { const index = draft.closures.findIndex(x => x.closureId === c.closureId); if (index < 0)
                    draft.closures.push(structuredClone(c));
                else
                    draft.closures[index] = structuredClone(c); },
                removeClosure: async (id) => { const closure = draft.closures.find(x => x.closureId === id); (0, errors_1.requireValue)(closure, 'APPOINTMENT_NOT_FOUND'); closure.status = 'removed'; },
                saveBusinessHours: async (hours) => { draft.hours = structuredClone(hours); },
                savePolicy: async (policy) => { draft.policy = structuredClone(policy); },
                saveService: async (service) => { const index = draft.services.findIndex(x => x.serviceId === service.serviceId); if (index < 0)
                    draft.services.push(structuredClone(service));
                else
                    draft.services[index] = structuredClone(service); }
            };
            const value = await work(tx);
            if (this.failNextCommit) {
                this.failNextCommit = false;
                throw new Error('Injected commit failure');
            }
            this.data = draft;
            return structuredClone(value);
        });
        this.tail = job.catch(() => { });
        return job;
    }
}
exports.MemoryRepository = MemoryRepository;

},
"dist/cloudfunctions/booking-core/availability.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateService = validateService;
exports.getAvailability = getAvailability;
const booking_1 = __require("dist/miniprogram/types/booking.js");
const time_1 = __require("dist/cloudfunctions/common/time.js");
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const policy_1 = __require("dist/cloudfunctions/booking-core/policy.js");
function validateService(service) {
    (0, errors_1.requireValue)(service, 'SERVICE_NOT_FOUND');
    (0, errors_1.requireValue)(service.isActive, 'SERVICE_INACTIVE');
    (0, errors_1.requireValue)(Number.isInteger(service.durationMin) && service.durationMin > 0);
}
async function getAvailability(input, source, now = new Date()) {
    (0, errors_1.requireValue)(input && typeof input.serviceId === 'string' && input.serviceId.length > 0);
    (0, time_1.assertDate)(input.startDate);
    (0, time_1.assertDate)(input.endDate);
    (0, errors_1.requireValue)(input.startDate <= input.endDate);
    // Technical request-size guard, not the shop's business booking window.
    (0, errors_1.requireValue)((Date.parse(input.endDate) - Date.parse(input.startDate)) / 86400000 <= 365);
    if (input.preferredTime !== undefined)
        (0, time_1.assertTime)(input.preferredTime);
    const service = await source.getService(input.serviceId);
    validateService(service);
    const policy = await source.getPolicy(), bounds = (0, policy_1.bookingBounds)(policy, now);
    const hours = await source.getBusinessHours();
    (0, errors_1.requireValue)(new Set(hours.map(h => h.dayOfWeek)).size === hours.length);
    for (const h of hours) {
        (0, errors_1.requireValue)(Number.isInteger(h.dayOfWeek) && h.dayOfWeek >= 0 && h.dayOfWeek <= 6);
        if (h.isOpen) {
            (0, time_1.assertTime)(h.openTime);
            (0, time_1.assertTime)(h.closeTime);
            (0, errors_1.requireValue)(h.openTime < h.closeTime);
        }
    }
    const rangeStart = (0, time_1.localDateTimeToUtc)(input.startDate, '00:00').toISOString();
    const rangeEnd = (0, time_1.localDateTimeToUtc)((0, time_1.addLocalDays)(input.endDate, 1), '00:00').toISOString();
    const [closures, appointments] = await Promise.all([source.getClosures(rangeStart, rangeEnd), source.getAppointments(rangeStart, rangeEnd)]);
    const blocked = [...closures.filter(c => c.status === 'active'), ...appointments.filter(a => booking_1.ACTIVE_CAPACITY_STATUSES.includes(a.status))];
    for (const interval of blocked)
        (0, errors_1.requireValue)((0, time_1.parseInstant)(interval.startAt) < (0, time_1.parseInstant)(interval.endAt));
    const result = [];
    for (let date = input.startDate; date <= input.endDate; date = (0, time_1.addLocalDays)(date, 1)) {
        const empty = (dayStatus) => result.push({ date, legalSlots: [], recommendedSlots: [], dayStatus });
        if (date > bounds.last) {
            empty('not_open_yet');
            continue;
        }
        const h = hours.find(h => h.dayOfWeek === (0, time_1.localDayOfWeek)(date));
        if (date < bounds.first || !h?.isOpen) {
            empty('closed');
            continue;
        }
        const open = (0, time_1.localDateTimeToUtc)(date, h.openTime).getTime(), close = (0, time_1.localDateTimeToUtc)(date, h.closeTime).getTime();
        const dayClosures = closures.filter(c => c.status === 'active').map(c => [Date.parse(c.startAt), Date.parse(c.endAt)]).sort((a, b) => a[0] - b[0]);
        let covered = open;
        for (const [start, end] of dayClosures) {
            if (start <= covered && end > covered)
                covered = end;
        }
        if (covered >= close) {
            empty('closed');
            continue;
        }
        const all = [];
        for (let cursor = open; cursor + service.durationMin * 60000 <= close; cursor += 60000) {
            const local = (0, time_1.utcToLocalDateTime)(new Date(cursor));
            const [hh, mm] = local.time.split(':').map(Number);
            if ((hh * 60 + mm) % policy.customerStartStepMin !== 0)
                continue;
            const startAt = new Date(cursor).toISOString(), endAt = new Date(cursor + service.durationMin * 60000).toISOString();
            if (!blocked.some(b => (0, time_1.overlaps)(startAt, endAt, b.startAt, b.endAt)))
                all.push({ startAt, endAt });
        }
        const legalSlots = input.preferredTime === undefined ? all : all.filter(s => (0, time_1.utcToLocalDateTime)(s.startAt).time === input.preferredTime);
        // Recommend boundary-adjacent slots without deleting any legal option.
        const score = (s) => {
            const before = Math.max(open, ...blocked.filter(b => Date.parse(b.endAt) <= Date.parse(s.startAt)).map(b => Date.parse(b.endAt)));
            const after = Math.min(close, ...blocked.filter(b => Date.parse(b.startAt) >= Date.parse(s.endAt)).map(b => Date.parse(b.startAt)));
            return Math.min(Date.parse(s.startAt) - before, after - Date.parse(s.endAt));
        };
        const recommendedSlots = [...legalSlots].sort((a, b) => score(a) - score(b) || a.startAt.localeCompare(b.startAt)).slice(0, 2);
        result.push({ date, legalSlots, recommendedSlots, dayStatus: all.length ? 'available' : 'full' });
    }
    return result;
}

},
"dist/cloudfunctions/booking-core/create-appointment.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingError = void 0;
exports.validateSlot = validateSlot;
exports.createAppointment = createAppointment;
const availability_1 = __require("dist/cloudfunctions/booking-core/availability.js");
const time_1 = __require("dist/cloudfunctions/common/time.js");
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const repository_1 = __require("dist/cloudfunctions/booking-core/repository.js");
const policy_1 = __require("dist/cloudfunctions/booking-core/policy.js");
var errors_2 = __require("dist/cloudfunctions/common/errors.js");
Object.defineProperty(exports, "BookingError", { enumerable: true, get: function () { return errors_2.BookingError; } });
// Must be called inside the same transaction that persists the appointment/capacity.
async function validateSlot(serviceId, startAt, source, now) {
    const start = (0, time_1.parseInstant)(startAt), date = (0, time_1.utcToLocalDateTime)(start).date;
    const policy = await source.getPolicy(), bounds = (0, policy_1.bookingBounds)(policy, now);
    (0, errors_1.requireValue)(date >= bounds.first && date <= bounds.last, 'OUTSIDE_BOOKING_WINDOW');
    const [day] = await (0, availability_1.getAvailability)({ serviceId, startDate: date, endDate: date }, { ...source,
        getService: id => source.getService(id), getPolicy: () => source.getPolicy(), getBusinessHours: () => source.getBusinessHours(),
        getClosures: (a, b) => source.getClosures(a, b), getAppointments: async () => []
    }, now);
    (0, errors_1.requireValue)(day.dayStatus !== 'closed', 'SHOP_CLOSED');
    const slot = day.legalSlots.find(s => s.startAt === start.toISOString());
    (0, errors_1.requireValue)(slot, 'SLOT_INVALID');
    const appointments = await source.getAppointments(slot.startAt, slot.endAt);
    (0, errors_1.requireValue)(!appointments.some(a => ['booked', 'in_progress'].includes(a.status) && (0, time_1.overlaps)(slot.startAt, slot.endAt, a.startAt, a.endAt)), 'SLOT_TAKEN');
    return slot;
}
async function createAppointment(input, repository, now = new Date()) {
    (0, errors_1.requireValue)(input && typeof input.customerId === 'string' && input.customerId.trim(), 'AUTH_REQUIRED');
    (0, errors_1.requireValue)(typeof input.serviceId === 'string' && input.serviceId.trim());
    // This is the customer create operation; manual/Web auth requires its own trusted adapter.
    (0, errors_1.requireValue)(input.source === 'wechat', 'FORBIDDEN');
    (0, errors_1.requireValue)(input.note === undefined || typeof input.note === 'string');
    (0, time_1.parseInstant)(input.startAt);
    return (0, repository_1.atomic)(repository, async (tx) => {
        const service = await tx.getService(input.serviceId);
        (0, availability_1.validateService)(service);
        const slot = await validateSlot(input.serviceId, input.startAt, tx, now);
        const timestamp = now.toISOString();
        const appointment = {
            appointmentId: crypto.randomUUID(), customerId: input.customerId, serviceId: service.serviceId,
            serviceNameSnapshot: service.name, durationMinSnapshot: service.durationMin,
            ...slot, status: 'booked', source: 'wechat', createdAt: timestamp, updatedAt: timestamp,
            history: [{ fromStatus: null, toStatus: 'booked', changedAt: timestamp, changedBy: input.customerId }],
            ...(input.note === undefined ? {} : { note: input.note })
        };
        await tx.createAppointment(appointment);
        return appointment;
    });
}

},
"dist/cloudfunctions/booking-core/lifecycle.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = cancelAppointment;
exports.getRescheduleAvailability = getRescheduleAvailability;
exports.rescheduleAppointment = rescheduleAppointment;
exports.createClosure = createClosure;
exports.effectiveStatus = effectiveStatus;
exports.reconcileStatuses = reconcileStatuses;
exports.setAppointmentException = setAppointmentException;
exports.getMyAppointments = getMyAppointments;
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const time_1 = __require("dist/cloudfunctions/common/time.js");
const repository_1 = __require("dist/cloudfunctions/booking-core/repository.js");
const availability_1 = __require("dist/cloudfunctions/booking-core/availability.js");
const create_appointment_1 = __require("dist/cloudfunctions/booking-core/create-appointment.js");
async function owned(tx, id, actor) {
    (0, repository_1.authenticated)(actor);
    const a = await tx.getAppointment(id);
    (0, errors_1.requireValue)(a, 'APPOINTMENT_NOT_FOUND');
    (0, errors_1.requireValue)(a.customerId === actor.userId, 'FORBIDDEN');
    return a;
}
function change(a, status, actor, now, reason) {
    a.history.push({ fromStatus: a.status, toStatus: status, changedAt: now.toISOString(), changedBy: actor, ...(reason ? { reason } : {}) });
    a.status = status;
    a.updatedAt = now.toISOString();
}
async function cancelAppointment(id, actor, repository, now = new Date()) {
    return (0, repository_1.atomic)(repository, async (tx) => {
        const a = await owned(tx, id, actor);
        (0, errors_1.requireValue)(a.status === 'booked' && now < (0, time_1.parseInstant)(a.startAt), 'INVALID_APPOINTMENT_STATE');
        change(a, 'cancelled_by_user', actor.userId, now);
        await tx.saveAppointment(a);
        return a;
    });
}
async function rescheduleSource(tx, id, actor, now) {
    const a = await owned(tx, id, actor);
    (0, errors_1.requireValue)(a.status === 'needs_reschedule' || a.status === 'booked' && now < (0, time_1.parseInstant)(a.startAt), 'INVALID_APPOINTMENT_STATE');
    const source = {
        getService: async (serviceId) => serviceId === a.serviceId ? {
            serviceId, name: a.serviceNameSnapshot, durationMin: a.durationMinSnapshot, isActive: true,
            displayOrder: 0, createdAt: a.createdAt, updatedAt: a.updatedAt
        } : undefined,
        getPolicy: () => tx.getPolicy(), getBusinessHours: () => tx.getBusinessHours(),
        getClosures: (start, end) => tx.getClosures(start, end),
        getAppointments: async (start, end) => (await tx.getAppointments(start, end)).filter(x => x.appointmentId !== id)
    };
    return { a, source };
}
async function getRescheduleAvailability(id, input, actor, repository, now = new Date()) {
    return (0, repository_1.atomic)(repository, async (tx) => {
        const { a, source } = await rescheduleSource(tx, id, actor, now);
        return (0, availability_1.getAvailability)({ ...input, serviceId: a.serviceId }, source, now);
    });
}
async function rescheduleAppointment(id, startAt, actor, repository, now = new Date()) {
    return (0, repository_1.atomic)(repository, async (tx) => {
        const { a, source } = await rescheduleSource(tx, id, actor, now);
        const slot = await (0, create_appointment_1.validateSlot)(a.serviceId, startAt, source, now);
        const previous = a.startAt;
        a.startAt = slot.startAt;
        a.endAt = slot.endAt;
        change(a, 'booked', actor.userId, now, `reschedule: ${previous} -> ${a.startAt}`);
        await tx.saveAppointment(a);
        return a;
    });
}
async function createClosure(input, actor, repository, now = new Date()) {
    (0, repository_1.administrator)(actor);
    (0, errors_1.requireValue)(input && ['full_day', 'partial'].includes(input.type));
    (0, errors_1.requireValue)((0, time_1.parseInstant)(input.startAt) < (0, time_1.parseInstant)(input.endAt));
    return (0, repository_1.atomic)(repository, async (tx) => {
        const closure = { type: input.type, startAt: (0, time_1.parseInstant)(input.startAt).toISOString(), endAt: (0, time_1.parseInstant)(input.endAt).toISOString(), closureId: crypto.randomUUID(), status: 'active', createdBy: actor.userId, createdAt: now.toISOString() };
        await tx.saveClosure(closure);
        const affected = await tx.getAppointments(closure.startAt, closure.endAt);
        for (const a of affected) {
            if (a.status === 'booked' && (0, time_1.parseInstant)(a.startAt) > now && (0, time_1.overlaps)(a.startAt, a.endAt, closure.startAt, closure.endAt)) {
                change(a, 'needs_reschedule', actor.userId, now, `closure: ${closure.closureId}`);
                await tx.saveAppointment(a);
            }
        }
        return closure;
    });
}
function effectiveStatus(a, now, grace) {
    (0, errors_1.requireValue)(Number.isInteger(grace) && grace >= 0 && Number.isFinite(now.getTime()));
    if (!['booked', 'in_progress'].includes(a.status))
        return a.status;
    if (now.getTime() >= (0, time_1.parseInstant)(a.endAt).getTime() + grace * 60000)
        return 'completed_auto';
    if (now >= (0, time_1.parseInstant)(a.startAt))
        return 'in_progress';
    return a.status;
}
async function reconcileStatuses(repository, now = new Date()) {
    return (0, repository_1.atomic)(repository, async (tx) => {
        const policy = await tx.getPolicy();
        // Time bounds are an adapter query, not new persisted metadata.
        const list = await tx.getAppointments('0001-01-01T00:00:00Z', now.toISOString());
        for (const a of list) {
            const effective = effectiveStatus(a, now, policy.autoCompleteGraceMin);
            if (a.status === 'booked' && (effective === 'in_progress' || effective === 'completed_auto'))
                change(a, 'in_progress', 'system', now);
            if (effective === 'completed_auto' && a.status === 'in_progress')
                change(a, 'completed_auto', 'system', now);
            await tx.saveAppointment(a);
        }
    });
}
async function setAppointmentException(id, status, actor, repository, now = new Date()) {
    (0, repository_1.administrator)(actor);
    (0, errors_1.requireValue)(status === 'no_show' || status === 'cancelled_by_shop');
    return (0, repository_1.atomic)(repository, async (tx) => {
        const a = await tx.getAppointment(id);
        (0, errors_1.requireValue)(a, 'APPOINTMENT_NOT_FOUND');
        const policy = await tx.getPolicy();
        const effective = effectiveStatus(a, now, policy.autoCompleteGraceMin);
        if (a.status === 'booked' && (effective === 'in_progress' || effective === 'completed_auto'))
            change(a, 'in_progress', 'system', now);
        if (a.status === 'in_progress' && effective === 'completed_auto')
            change(a, 'completed_auto', 'system', now);
        const allowed = status === 'no_show' ? ['booked', 'completed_auto'] : ['booked', 'needs_reschedule'];
        (0, errors_1.requireValue)(allowed.includes(a.status), 'INVALID_APPOINTMENT_STATE');
        change(a, status, actor.userId, now);
        await tx.saveAppointment(a);
        return a;
    });
}
async function getMyAppointments(actor, repository) {
    (0, repository_1.authenticated)(actor);
    return (0, repository_1.atomic)(repository, async (tx) => (await tx.getAppointments('0001-01-01T00:00:00Z', '9999-12-31T23:59:59Z')).filter(a => a.customerId === actor.userId));
}

},
"dist/cloudfunctions/booking-core/policy.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePolicy = validatePolicy;
exports.bookingBounds = bookingBounds;
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const time_1 = __require("dist/cloudfunctions/common/time.js");
function validatePolicy(policy) {
    (0, errors_1.requireValue)(policy && policy.timezone === 'Europe/London' && policy.sameDayBooking === false);
    (0, errors_1.requireValue)(policy.bookingWindowDays !== undefined || policy.bookingOpenUntil !== undefined);
    if (policy.bookingWindowDays !== undefined)
        (0, errors_1.requireValue)(Number.isInteger(policy.bookingWindowDays) && policy.bookingWindowDays > 0);
    if (policy.bookingOpenUntil !== undefined)
        (0, time_1.assertDate)(policy.bookingOpenUntil);
    for (const n of [policy.internalSlotGranularityMin, policy.customerStartStepMin])
        (0, errors_1.requireValue)(Number.isInteger(n) && n > 0 && n <= 1440);
    (0, errors_1.requireValue)(policy.customerStartStepMin % policy.internalSlotGranularityMin === 0);
    (0, errors_1.requireValue)(Number.isInteger(policy.autoCompleteGraceMin) && policy.autoCompleteGraceMin >= 0);
}
function bookingBounds(policy, now) {
    validatePolicy(policy);
    const first = (0, time_1.addLocalDays)((0, time_1.utcToLocalDateTime)(now).date, 1);
    const limits = [policy.bookingOpenUntil, policy.bookingWindowDays === undefined ? undefined : (0, time_1.addLocalDays)(first, policy.bookingWindowDays - 1)].filter((s) => !!s);
    return { first, last: limits.sort()[0] };
}

},
"dist/cloudfunctions/common/time.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertDate = assertDate;
exports.assertTime = assertTime;
exports.parseInstant = parseInstant;
exports.localDateTimeToUtc = localDateTimeToUtc;
exports.utcToLocalDateTime = utcToLocalDateTime;
exports.localDayOfWeek = localDayOfWeek;
exports.addLocalDays = addLocalDays;
exports.minutesBetween = minutesBetween;
exports.overlaps = overlaps;
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});
function assertDate(value) {
    (0, errors_1.requireValue)(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value));
    const date = new Date(value + 'T00:00:00Z');
    (0, errors_1.requireValue)(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value);
}
function assertTime(value) {
    (0, errors_1.requireValue)(typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}
function parts(date) {
    (0, errors_1.requireValue)(Number.isFinite(date.getTime()));
    return Object.fromEntries(formatter.formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}
function parseInstant(value) {
    (0, errors_1.requireValue)(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value));
    assertDate(value.slice(0, 10));
    assertTime(value.slice(11, 16));
    (0, errors_1.requireValue)(Number(value.slice(17, 19)) < 60);
    const result = new Date(value);
    (0, errors_1.requireValue)(Number.isFinite(result.getTime()));
    return result;
}
function localDateTimeToUtc(date, time) {
    assertDate(date);
    assertTime(time);
    const wall = Date.parse(date + 'T' + time + ':00Z');
    const offsets = new Set();
    for (const delta of [-86400000, 0, 86400000]) {
        const instant = wall + delta, p = parts(new Date(instant));
        offsets.add(Date.parse(p.year + '-' + p.month + '-' + p.day + 'T' + p.hour + ':' + p.minute + ':' + p.second + 'Z') - instant);
    }
    const matches = [...offsets].map(offset => new Date(wall - offset)).filter(candidate => {
        const local = utcToLocalDateTime(candidate);
        return local.date === date && local.time === time;
    });
    // No silent choice for nonexistent or ambiguous wall time. Explicit-offset instants remain unambiguous.
    (0, errors_1.requireValue)(matches.length === 1);
    return matches[0];
}
function utcToLocalDateTime(value) {
    const p = parts(typeof value === 'string' ? parseInstant(value) : value);
    return { date: p.year + '-' + p.month + '-' + p.day, time: p.hour + ':' + p.minute };
}
function localDayOfWeek(date) { assertDate(date); return new Date(date + 'T12:00:00Z').getUTCDay(); }
function addLocalDays(date, days) {
    assertDate(date);
    (0, errors_1.requireValue)(Number.isInteger(days));
    const d = new Date(date + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
function minutesBetween(startAt, endAt) { return (Date.parse(endAt) - Date.parse(startAt)) / 60000; }
function overlaps(aStart, aEnd, bStart, bEnd) {
    return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
}

},
"dist/cloudfunctions/common/errors.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingError = void 0;
exports.requireValue = requireValue;
class BookingError extends Error {
    code;
    constructor(code) {
        super(code);
        this.code = code;
        this.name = 'BookingError';
    }
}
exports.BookingError = BookingError;
function requireValue(condition, code = 'INVALID_INPUT') {
    if (!condition)
        throw new BookingError(code);
}

},
"dist/preview/seed.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instant = void 0;
exports.emptyFixture = emptyFixture;
exports.fixtureAppointment = fixtureAppointment;
exports.realisticFixture = realisticFixture;
const time_1 = __require("dist/cloudfunctions/common/time.js");
function emptyFixture(now = new Date('2026-09-29T12:00:00Z')) {
    return {
        services: [['cut30', '短发剪发', 30], ['cut60', '长发剪发', 60], ['colour180', '复杂染漂', 180]].map(([id, name, n], i) => ({ serviceId: String(id), name: String(name), durationMin: Number(n), isActive: true, displayOrder: i, createdAt: now.toISOString(), updatedAt: now.toISOString() })),
        policy: { timezone: 'Europe/London', sameDayBooking: false, bookingWindowDays: 14, internalSlotGranularityMin: 15, customerStartStepMin: 30, autoCompleteGraceMin: 15 },
        hours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, isOpen: true, openTime: '10:00', closeTime: '18:00' })),
        closures: [], appointments: []
    };
}
const instant = (date, time) => (0, time_1.localDateTimeToUtc)(date, time).toISOString();
exports.instant = instant;
function fixtureAppointment(date, start, end, customerId = 'fixture-other', status = 'booked') {
    const startAt = (0, exports.instant)(date, start), endAt = (0, exports.instant)(date, end), minutes = (Date.parse(endAt) - Date.parse(startAt)) / 60000;
    return { appointmentId: crypto.randomUUID(), customerId, serviceId: minutes === 180 ? 'colour180' : minutes === 60 ? 'cut60' : 'cut30', serviceNameSnapshot: '示例服务', durationMinSnapshot: minutes, startAt, endAt, status, source: 'wechat', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', history: [{ fromStatus: null, toStatus: 'booked', changedAt: '2026-01-01T00:00:00.000Z', changedBy: customerId }] };
}
function realisticFixture(now = new Date()) {
    const data = emptyFixture(now), today = (0, time_1.utcToLocalDateTime)(now).date, first = (0, time_1.addLocalDays)(today, 1), last = (0, time_1.addLocalDays)(today, 14);
    data.hours[0].isOpen = false;
    const workdays = Array.from({ length: 14 }, (_, i) => (0, time_1.addLocalDays)(first, i)).filter(date => (0, time_1.localDayOfWeek)(date) !== 0);
    const scenarios = {};
    const fill = (date, from, to) => {
        const clock = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
        for (let t = from; t < to;) {
            const n = Math.min(60, to - t);
            data.appointments.push(fixtureAppointment(date, clock(t), clock(t + n)));
            t += n;
        }
    };
    const gaps = [
        ['完全约满', []], ['接近约满 / 仅30分钟', [[600, 630]]], ['多个30分钟碎片', [[630, 660], [810, 840], [990, 1020]]],
        ['30 / 60 / 90分钟碎片', [[600, 630], [720, 780], [930, 1020]]], ['150分钟空档', [[720, 870]]],
        ['较长连续空档', [[720, 960]]], ['临时部分关闭', [[600, 720], [780, 930]]], ['临时整天关闭', [[600, 1080]]],
        ['高占用 / 60分钟空档', [[960, 1020]]], ['高占用 / 120分钟空档', [[600, 720]]],
        ['高占用 / 两段60分钟', [[660, 720], [900, 960]]], ['高占用 / 180分钟空档', [[780, 960]]]
    ];
    workdays.forEach((date, i) => {
        const [name, free] = gaps[i % gaps.length];
        scenarios[date] = name;
        let cursor = 600;
        for (const [start, end] of free) {
            fill(date, cursor, start);
            cursor = end;
        }
        fill(date, cursor, 1080);
        if (name === '临时部分关闭')
            data.closures.push({ closureId: 'seed-partial', startAt: (0, exports.instant)(date, '13:00'), endAt: (0, exports.instant)(date, '14:00'), type: 'partial', status: 'active', createdBy: 'seed-admin', createdAt: now.toISOString() });
        if (name === '临时整天关闭') {
            data.closures.push({ closureId: 'seed-full', startAt: (0, exports.instant)(date, '00:00'), endAt: (0, exports.instant)((0, time_1.addLocalDays)(date, 1), '00:00'), type: 'full_day', status: 'active', createdBy: 'seed-admin', createdAt: now.toISOString() });
            const a = fixtureAppointment(date, '10:00', '11:00', 'preview-customer', 'needs_reschedule');
            a.history.push({ fromStatus: 'booked', toStatus: 'needs_reschedule', changedAt: now.toISOString(), changedBy: 'seed-admin', reason: 'closure: seed-full' });
            a.updatedAt = now.toISOString();
            data.appointments.push(a);
        }
    });
    for (let date = first; date <= last; date = (0, time_1.addLocalDays)(date, 1))
        if ((0, time_1.localDayOfWeek)(date) === 0)
            scenarios[date] = '固定周日休息';
    scenarios[(0, time_1.addLocalDays)(last, 1)] = '暂未开放';
    return { data, first, last, scenarios };
}

},
"dist/cloudfunctions/booking-core/admin.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminSchedule = getAdminSchedule;
exports.getAdminDashboard = getAdminDashboard;
exports.getPendingActions = getPendingActions;
exports.setBusinessHours = setBusinessHours;
exports.setBookingPolicy = setBookingPolicy;
exports.removeClosure = removeClosure;
exports.upsertService = upsertService;
exports.createManualAppointment = createManualAppointment;
const time_1 = __require("dist/cloudfunctions/common/time.js");
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
const policy_1 = __require("dist/cloudfunctions/booking-core/policy.js");
const repository_1 = __require("dist/cloudfunctions/booking-core/repository.js");
const availability_1 = __require("dist/cloudfunctions/booking-core/availability.js");
function validateHours(hours) {
    (0, errors_1.requireValue)(Array.isArray(hours) && hours.length === 7);
    const seen = new Set();
    for (const h of hours) {
        (0, errors_1.requireValue)(Number.isInteger(h.dayOfWeek) && h.dayOfWeek >= 0 && h.dayOfWeek <= 6 && !seen.has(h.dayOfWeek));
        seen.add(h.dayOfWeek);
        if (h.isOpen) {
            (0, errors_1.requireValue)(typeof h.openTime === 'string' && typeof h.closeTime === 'string');
            (0, time_1.assertTime)(h.openTime);
            (0, time_1.assertTime)(h.closeTime);
            (0, errors_1.requireValue)(h.openTime < h.closeTime);
        }
    }
}
function validateServiceInput(input) {
    (0, errors_1.requireValue)(typeof input.name === 'string' && input.name.trim().length > 0);
    (0, errors_1.requireValue)(Number.isInteger(input.durationMin) && input.durationMin > 0);
    (0, errors_1.requireValue)(typeof input.isActive === 'boolean');
    (0, errors_1.requireValue)(Number.isInteger(input.displayOrder) && input.displayOrder >= 0);
}
function dayIntervals(data, date) {
    (0, time_1.assertDate)(date);
    const hours = data.hours.find(h => h.dayOfWeek === (0, time_1.localDayOfWeek)(date));
    if (!hours?.isOpen)
        return { dayStatus: 'closed', freeIntervals: [] };
    const open = (0, time_1.localDateTimeToUtc)(date, hours.openTime).getTime();
    const close = (0, time_1.localDateTimeToUtc)(date, hours.closeTime).getTime();
    const blocked = [...data.closures.filter(c => c.status === 'active'), ...data.appointments.filter(a => ['booked', 'in_progress'].includes(a.status))]
        .map(x => [Math.max(open, Date.parse(x.startAt)), Math.min(close, Date.parse(x.endAt))])
        .filter(([start, end]) => start < end).sort((a, b) => a[0] - b[0]);
    const free = [];
    let cursor = open;
    for (const [start, end] of blocked) {
        if (start > cursor)
            free.push({ startAt: new Date(cursor).toISOString(), endAt: new Date(start).toISOString() });
        cursor = Math.max(cursor, end);
    }
    if (cursor < close)
        free.push({ startAt: new Date(cursor).toISOString(), endAt: new Date(close).toISOString() });
    return { dayStatus: free.length ? 'available' : 'full', freeIntervals: free };
}
async function getAdminSchedule(date, repository, now = new Date()) {
    (0, time_1.assertDate)(date);
    const [policy, hours, closures, appointments, services] = await Promise.all([
        repository.getPolicy(), repository.getBusinessHours(),
        repository.getClosures('0001-01-01T00:00:00Z', '9999-12-31T23:59:59Z'),
        repository.getAppointments('0001-01-01T00:00:00Z', '9999-12-31T23:59:59Z'), repository.getAllServices()
    ]);
    const { last } = (0, policy_1.bookingBounds)(policy, now);
    if (date > last)
        return { date, appointments, closures: closures.filter((c) => c.status === 'active'), services, businessHours: hours, policy, freeIntervals: [], dayStatus: 'not_open_yet' };
    const day = dayIntervals({ hours, closures, appointments, policy }, date);
    return { date, appointments: appointments.filter((a) => (0, time_1.utcToLocalDateTime)(a.startAt).date === date), closures: closures.filter((c) => c.status === 'active' && (0, time_1.utcToLocalDateTime)(c.startAt).date === date), services, businessHours: hours, policy, ...day };
}
async function getAdminDashboard(repository, now = new Date()) {
    const date = (0, time_1.utcToLocalDateTime)(now).date;
    const schedule = await getAdminSchedule(date, repository, now);
    const all = schedule.appointments;
    const pending = all.filter(a => a.status === 'needs_reschedule' || a.status === 'cancelled_by_shop');
    return { schedule, pendingCount: pending.length };
}
async function getPendingActions(repository) {
    const appointments = await repository.getAppointments('0001-01-01T00:00:00Z', '9999-12-31T23:59:59Z');
    return { appointments: appointments.filter((a) => a.status === 'needs_reschedule' || a.status === 'cancelled_by_shop' || a.status === 'no_show') };
}
async function setBusinessHours(hours, actor, repository) {
    (0, repository_1.administrator)(actor);
    validateHours(hours);
    return (0, repository_1.atomic)(repository, async (tx) => { await tx.saveBusinessHours(hours); return {}; });
}
async function setBookingPolicy(input, actor, repository) {
    (0, repository_1.administrator)(actor);
    return (0, repository_1.atomic)(repository, async (tx) => {
        const current = await tx.getPolicy();
        const next = { ...current, bookingWindowDays: input.bookingWindowDays, bookingOpenUntil: input.bookingOpenUntil };
        if (input.bookingWindowDays === undefined && input.bookingOpenUntil === undefined) {
            next.bookingWindowDays = current.bookingWindowDays;
            next.bookingOpenUntil = current.bookingOpenUntil;
        }
        else if (input.bookingWindowDays !== undefined)
            next.bookingOpenUntil = undefined;
        else
            next.bookingWindowDays = undefined;
        (0, policy_1.validatePolicy)(next);
        await tx.savePolicy(next);
        return {};
    });
}
async function removeClosure(closureId, actor, repository) {
    (0, repository_1.administrator)(actor);
    (0, errors_1.requireValue)(typeof closureId === 'string' && closureId.length > 0);
    return (0, repository_1.atomic)(repository, async (tx) => { await tx.removeClosure(closureId); return {}; });
}
async function upsertService(input, actor, repository, now = new Date()) {
    (0, repository_1.administrator)(actor);
    validateServiceInput(input);
    return (0, repository_1.atomic)(repository, async (tx) => {
        const id = input.serviceId ?? crypto.randomUUID();
        const existing = await tx.getService(id);
        const service = existing ? { ...existing, name: input.name.trim(), durationMin: input.durationMin, isActive: input.isActive, displayOrder: input.displayOrder, updatedAt: now.toISOString() } : { serviceId: id, name: input.name.trim(), durationMin: input.durationMin, isActive: input.isActive, displayOrder: input.displayOrder, createdAt: now.toISOString(), updatedAt: now.toISOString() };
        await tx.saveService(service);
        return service;
    });
}
async function createManualAppointment(input, actor, repository, now = new Date()) {
    (0, repository_1.administrator)(actor);
    (0, errors_1.requireValue)(input && input.customerId.trim() && input.serviceId);
    (0, time_1.assertDate)(input.date);
    (0, time_1.assertTime)(input.startTime);
    return (0, repository_1.atomic)(repository, async (tx) => {
        const service = await tx.getService(input.serviceId);
        (0, availability_1.validateService)(service);
        const policy = await tx.getPolicy();
        const bounds = (0, policy_1.bookingBounds)(policy, now);
        (0, errors_1.requireValue)(input.date >= bounds.first && input.date <= bounds.last, 'OUTSIDE_BOOKING_WINDOW');
        const hours = (await tx.getBusinessHours()).find(h => h.dayOfWeek === (0, time_1.localDayOfWeek)(input.date));
        (0, errors_1.requireValue)(hours?.isOpen, 'SHOP_CLOSED');
        const start = (0, time_1.localDateTimeToUtc)(input.date, input.startTime);
        const end = new Date(start.getTime() + service.durationMin * 60000);
        (0, errors_1.requireValue)((0, time_1.utcToLocalDateTime)(end).date === input.date && (0, time_1.utcToLocalDateTime)(end).time <= hours.closeTime, 'SLOT_INVALID');
        const startAt = start.toISOString(), endAt = end.toISOString();
        const closures = await tx.getClosures(startAt, endAt);
        (0, errors_1.requireValue)(!closures.some(c => c.status === 'active' && (0, time_1.overlaps)(startAt, endAt, c.startAt, c.endAt)), 'SHOP_CLOSED');
        const appointments = await tx.getAppointments(startAt, endAt);
        (0, errors_1.requireValue)(!appointments.some(a => ['booked', 'in_progress'].includes(a.status) && (0, time_1.overlaps)(startAt, endAt, a.startAt, a.endAt)), 'SLOT_TAKEN');
        const timestamp = now.toISOString();
        const appointment = { appointmentId: crypto.randomUUID(), customerId: input.customerId.trim(), serviceId: service.serviceId, serviceNameSnapshot: service.name, durationMinSnapshot: service.durationMin, startAt, endAt, status: 'booked', source: 'admin_manual', createdAt: timestamp, updatedAt: timestamp, history: [{ fromStatus: null, toStatus: 'booked', changedAt: timestamp, changedBy: actor.userId }], ...(input.note ? { note: input.note } : {}) };
        await tx.createAppointment(appointment);
        return appointment;
    });
}

},
"dist/miniprogram/types/booking.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.ACTIVE_CAPACITY_STATUSES = void 0;
exports.ACTIVE_CAPACITY_STATUSES = ['booked', 'in_progress'];
exports.ERROR_CODES = {
    INVALID_INPUT: 'INVALID_INPUT',
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    FORBIDDEN: 'FORBIDDEN',
    SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
    SERVICE_INACTIVE: 'SERVICE_INACTIVE',
    OUTSIDE_BOOKING_WINDOW: 'OUTSIDE_BOOKING_WINDOW',
    SHOP_CLOSED: 'SHOP_CLOSED',
    SLOT_INVALID: 'SLOT_INVALID',
    SLOT_TAKEN: 'SLOT_TAKEN',
    APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
    INVALID_APPOINTMENT_STATE: 'INVALID_APPOINTMENT_STATE',
    CONFLICT: 'CONFLICT',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

},
"dist/cloudfunctions/booking-core/repository.js": function (exports, module, __dirname, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atomic = atomic;
exports.authenticated = authenticated;
exports.administrator = administrator;
const errors_1 = __require("dist/cloudfunctions/common/errors.js");
function atomic(repository, work) {
    const adapter = repository;
    (0, errors_1.requireValue)(typeof adapter.transaction === 'function', 'INTERNAL_ERROR');
    return adapter.transaction(work);
}
function authenticated(actor) {
    (0, errors_1.requireValue)(actor && typeof actor.userId === 'string' && actor.userId.trim(), 'AUTH_REQUIRED');
    (0, errors_1.requireValue)(actor.role === 'customer' || actor.role === 'admin', 'FORBIDDEN');
}
function administrator(actor) { authenticated(actor); (0, errors_1.requireValue)(actor.role === 'admin', 'FORBIDDEN'); }

},
};
const __cache = {};
function __require(id) {
  if (__cache[id]) return __cache[id].exports;
  const module = { exports: {} }; __cache[id] = module;
  __defs[id](module.exports, module, '', { main: null });
  return module.exports;
}
// Browser runtime: runs the preview API in this page and keeps one shared demo state in localStorage.
const KEY = 'glasgow-booking-demo-v1';
const { createPreviewServer } = __require('dist/preview/server.js');
const { MemoryRepository } = __require('dist/preview/memory-repository.js');
const { realisticFixture } = __require('dist/preview/seed.js');
const ORIGIN = 'http://127.0.0.1:4173';
const today = () => new Date().toISOString().slice(0, 10);

function store() { try { return window.localStorage; } catch { return null; } }
function load() {
  try {
    const saved = JSON.parse(store()?.getItem(KEY) || 'null');
    // Seed dates are relative to today, so a demo saved on another day starts fresh.
    if (saved && saved.day === today() && saved.data) return saved.data;
  } catch { /* fall through to a fresh seed */ }
  return realisticFixture(new Date()).data;
}
let repository, handler;
function boot(data) {
  repository = new MemoryRepository(data);
  handler = createPreviewServer({ enableAdminDemo: true, repository }).server.handler;
}
function save() {
  try { store()?.setItem(KEY, JSON.stringify({ day: today(), data: repository.snapshot() })); } catch { /* private mode: state lives in memory */ }
}
boot(load());

function isApi(input) {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
  if (!raw) return null;
  const url = new URL(raw, location.href);
  const at = url.pathname.indexOf('/api/');
  // The shop client was built against the local preview address; serve that here too.
  if ((url.origin !== location.origin && !/^(127\.0\.0\.1|localhost):4173$/.test(url.host)) || at < 0) return null;
  return url.pathname.slice(at) + url.search;
}

const nativeFetch = window.fetch.bind(window);
window.fetch = async function (input, init = {}) {
  const path = isApi(input);
  if (!path) return nativeFetch(input, init);
  // Pick up writes made in another tab (customer ↔ shop) before answering.
  boot(load());
  const method = (init.method || 'GET').toUpperCase();
  const body = typeof init.body === 'string' ? init.body : '';
  const req = {
    url: path, method,
    headers: { host: '127.0.0.1:4173', origin: ORIGIN, 'x-demo-admin': 'local-preview' },
    async *[Symbol.asyncIterator]() { if (body) yield body; }
  };
  return new Promise((done) => {
    let status = 200; const headers = {};
    const res = {
      setHeader(k, v) { headers[k.toLowerCase()] = v; },
      writeHead(code, h = {}) { status = code; for (const k in h) headers[k.toLowerCase()] = h[k]; },
      end(payload = '') {
        if (method === 'POST' && status === 200) save();
        done(new Response(payload, { status, headers }));
      }
    };
    handler(req, res);
  });
};
globalThis.Buffer = globalThis.Buffer || { byteLength: (s) => new TextEncoder().encode(s).length };

document.addEventListener('click', (e) => {
  if (!e.target.closest?.('[data-demo-reset]')) return;
  try { store()?.removeItem(KEY); } catch { /* ignore */ }
  location.reload();
});

})();

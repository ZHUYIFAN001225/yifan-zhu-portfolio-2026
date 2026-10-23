(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/common/errors.ts
  var BookingError = class extends Error {
    constructor(code) {
      super(code);
      __publicField(this, "code", code);
      this.name = "BookingError";
    }
  };
  function requireValue(condition, code = "INVALID_INPUT") {
    if (!condition) throw new BookingError(code);
  }

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/common/time.ts
  var formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  function assertDate(value) {
    requireValue(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value));
    const date = /* @__PURE__ */ new Date(value + "T00:00:00Z");
    requireValue(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value);
  }
  function assertTime(value) {
    requireValue(typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
  }
  function parts(date) {
    requireValue(Number.isFinite(date.getTime()));
    const result = {};
    for (const part of formatter.formatToParts(date)) if (part.type !== "literal") result[part.type] = part.value;
    return result;
  }
  function parseInstant(value) {
    requireValue(typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value));
    assertDate(value.slice(0, 10));
    assertTime(value.slice(11, 16));
    requireValue(Number(value.slice(17, 19)) < 60);
    const result = new Date(value);
    requireValue(Number.isFinite(result.getTime()));
    return result;
  }
  var wallTimeCache = /* @__PURE__ */ new Map();
  var wallDateOffsets = /* @__PURE__ */ new Map();
  function localDateTimeToUtc(date, time) {
    assertDate(date);
    assertTime(time);
    const cacheKey = date + "T" + time, cached = wallTimeCache.get(cacheKey);
    if (cached !== void 0) return new Date(cached);
    const wall = Date.parse(date + "T" + time + ":00Z");
    let offsets = wallDateOffsets.get(date);
    if (!offsets) {
      const candidates = /* @__PURE__ */ new Set();
      for (const delta of [-864e5, 0, 864e5]) {
        const instant2 = wall + delta, p = parts(new Date(instant2));
        candidates.add(Date.parse(p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":" + p.minute + ":" + p.second + "Z") - instant2);
      }
      offsets = [...candidates];
      if (wallDateOffsets.size >= 1024) wallDateOffsets.delete(wallDateOffsets.keys().next().value);
      wallDateOffsets.set(date, offsets);
    }
    const matches = offsets.map((offset) => new Date(wall - offset)).filter((candidate) => {
      const local = utcToLocalDateTime(candidate);
      return local.date === date && local.time === time;
    });
    requireValue(matches.length === 1);
    if (wallTimeCache.size >= 1024) wallTimeCache.delete(wallTimeCache.keys().next().value);
    wallTimeCache.set(cacheKey, matches[0].getTime());
    return matches[0];
  }
  function utcToLocalDateTime(value) {
    const p = parts(typeof value === "string" ? parseInstant(value) : value);
    return { date: p.year + "-" + p.month + "-" + p.day, time: p.hour + ":" + p.minute };
  }
  function localDayOfWeek(date) {
    assertDate(date);
    return (/* @__PURE__ */ new Date(date + "T12:00:00Z")).getUTCDay();
  }
  function addLocalDays(date, days) {
    assertDate(date);
    requireValue(Number.isInteger(days));
    const d = /* @__PURE__ */ new Date(date + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function overlaps(aStart, aEnd, bStart, bEnd) {
    return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
  }

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/preview/memory-repository.ts
  var MemoryRepository = class {
    constructor(seed2) {
      __publicField(this, "data");
      __publicField(this, "tail", Promise.resolve());
      __publicField(this, "failNextCommit", false);
      this.data = structuredClone(seed2);
    }
    snapshot() {
      return structuredClone(this.data);
    }
    async configureFixture(change2) {
      const job = this.tail.then(() => {
        const draft = this.snapshot();
        change2(draft);
        this.data = draft;
      });
      this.tail = job.catch(() => {
      });
      return job;
    }
    async getService(id) {
      return this.snapshot().services.find((s) => s.serviceId === id);
    }
    async getAllServices() {
      return this.snapshot().services;
    }
    async getPolicy() {
      return this.snapshot().policy;
    }
    async getBusinessHours() {
      return this.snapshot().hours;
    }
    async getClosures(start, end) {
      return this.snapshot().closures.filter((c) => overlaps(c.startAt, c.endAt, start, end));
    }
    async getAppointments(start, end) {
      return this.snapshot().appointments.filter((a) => overlaps(a.startAt, a.endAt, start, end));
    }
    async createAppointment(_a) {
      throw new Error("Use transaction");
    }
    transaction(work) {
      const job = this.tail.then(async () => {
        const draft = this.snapshot();
        const check = (a) => {
          if (!["booked", "in_progress"].includes(a.status)) return;
          requireValue(!draft.appointments.some((other) => other.appointmentId !== a.appointmentId && ["booked", "in_progress"].includes(other.status) && overlaps(a.startAt, a.endAt, other.startAt, other.endAt)), "SLOT_TAKEN");
        };
        const tx = {
          getAllServices: async () => structuredClone(draft.services),
          getService: async (id) => structuredClone(draft.services.find((s) => s.serviceId === id)),
          getPolicy: async () => structuredClone(draft.policy),
          getBusinessHours: async () => structuredClone(draft.hours),
          getClosures: async (start, end) => structuredClone(draft.closures.filter((c) => overlaps(c.startAt, c.endAt, start, end))),
          getAppointments: async (start, end) => structuredClone(draft.appointments.filter((a) => overlaps(a.startAt, a.endAt, start, end))),
          getAppointment: async (id) => structuredClone(draft.appointments.find((a) => a.appointmentId === id)),
          createAppointment: async (a) => {
            requireValue(!draft.appointments.some((x) => x.appointmentId === a.appointmentId), "CONFLICT");
            check(a);
            draft.appointments.push(structuredClone(a));
          },
          saveAppointment: async (a) => {
            const index = draft.appointments.findIndex((x) => x.appointmentId === a.appointmentId);
            requireValue(index >= 0, "APPOINTMENT_NOT_FOUND");
            check(a);
            draft.appointments[index] = structuredClone(a);
          },
          saveClosure: async (c) => {
            const index = draft.closures.findIndex((x) => x.closureId === c.closureId);
            if (index < 0) draft.closures.push(structuredClone(c));
            else draft.closures[index] = structuredClone(c);
          },
          removeClosure: async (id) => {
            const closure = draft.closures.find((x) => x.closureId === id);
            requireValue(closure, "APPOINTMENT_NOT_FOUND");
            closure.status = "removed";
          },
          saveBusinessHours: async (hours) => {
            draft.hours = structuredClone(hours);
          },
          savePolicy: async (policy) => {
            draft.policy = structuredClone(policy);
          },
          saveService: async (service) => {
            const index = draft.services.findIndex((x) => x.serviceId === service.serviceId);
            if (index < 0) draft.services.push(structuredClone(service));
            else draft.services[index] = structuredClone(service);
          }
        };
        const value = await work(tx);
        if (this.failNextCommit) {
          this.failNextCommit = false;
          throw new Error("Injected commit failure");
        }
        this.data = draft;
        return structuredClone(value);
      });
      this.tail = job.catch(() => {
      });
      return job;
    }
  };

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/preview/seed.ts
  function emptyFixture(now = /* @__PURE__ */ new Date("2026-09-29T12:00:00Z")) {
    return {
      services: [["cut30", "\u77ED\u53D1\u526A\u53D1", 30], ["cut60", "\u957F\u53D1\u526A\u53D1", 60], ["colour180", "\u590D\u6742\u67D3\u6F02", 180]].map(([id, name, n], i) => ({ serviceId: String(id), name: String(name), durationMin: Number(n), isActive: true, displayOrder: i, createdAt: now.toISOString(), updatedAt: now.toISOString() })),
      policy: { timezone: "Europe/London", sameDayBooking: false, bookingWindowDays: 14, internalSlotGranularityMin: 15, customerStartStepMin: 30, autoCompleteGraceMin: 15 },
      hours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, isOpen: true, openTime: "10:00", closeTime: "18:00" })),
      closures: [],
      appointments: []
    };
  }
  var instant = (date, time) => localDateTimeToUtc(date, time).toISOString();

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/booking-core/policy.ts
  function validatePolicy(policy) {
    requireValue(policy && policy.timezone === "Europe/London" && policy.sameDayBooking === false);
    requireValue(policy.bookingWindowDays !== void 0 || policy.bookingOpenUntil !== void 0);
    if (policy.bookingWindowDays !== void 0) requireValue(Number.isInteger(policy.bookingWindowDays) && policy.bookingWindowDays > 0);
    if (policy.bookingOpenUntil !== void 0) assertDate(policy.bookingOpenUntil);
    for (const n of [policy.internalSlotGranularityMin, policy.customerStartStepMin]) requireValue(Number.isInteger(n) && n > 0 && n <= 1440);
    requireValue(policy.customerStartStepMin % policy.internalSlotGranularityMin === 0);
    requireValue(Number.isInteger(policy.autoCompleteGraceMin) && policy.autoCompleteGraceMin >= 0);
  }
  function bookingBounds(policy, now) {
    validatePolicy(policy);
    const first = addLocalDays(utcToLocalDateTime(now).date, 1);
    const limits = [policy.bookingOpenUntil, policy.bookingWindowDays === void 0 ? void 0 : addLocalDays(first, policy.bookingWindowDays - 1)].filter((s) => !!s);
    return { first, last: limits.sort()[0] };
  }

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/miniprogram/types/booking.ts
  var ACTIVE_CAPACITY_STATUSES = ["booked", "in_progress"];

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/booking-core/availability.ts
  function validateService(service) {
    requireValue(service, "SERVICE_NOT_FOUND");
    requireValue(service.isActive, "SERVICE_INACTIVE");
    requireValue(Number.isInteger(service.durationMin) && service.durationMin > 0);
  }
  async function getAvailability(input, source, now = /* @__PURE__ */ new Date()) {
    requireValue(input && typeof input.serviceId === "string" && input.serviceId.length > 0);
    assertDate(input.startDate);
    assertDate(input.endDate);
    requireValue(input.startDate <= input.endDate);
    requireValue((Date.parse(input.endDate) - Date.parse(input.startDate)) / 864e5 <= 365);
    if (input.preferredTime !== void 0) assertTime(input.preferredTime);
    const service = await source.getService(input.serviceId);
    validateService(service);
    const policy = await source.getPolicy(), bounds = bookingBounds(policy, now);
    const hours = await source.getBusinessHours();
    requireValue(new Set(hours.map((h) => h.dayOfWeek)).size === hours.length);
    for (const h of hours) {
      requireValue(Number.isInteger(h.dayOfWeek) && h.dayOfWeek >= 0 && h.dayOfWeek <= 6);
      if (h.isOpen) {
        assertTime(h.openTime);
        assertTime(h.closeTime);
        requireValue(h.openTime < h.closeTime);
      }
    }
    const rangeStart = localDateTimeToUtc(input.startDate, "00:00").toISOString();
    const rangeEnd = localDateTimeToUtc(addLocalDays(input.endDate, 1), "00:00").toISOString();
    const [closures, appointments] = await Promise.all([source.getClosures(rangeStart, rangeEnd), source.getAppointments(rangeStart, rangeEnd)]);
    const blocked = [...closures.filter((c) => c.status === "active"), ...appointments.filter((a) => ACTIVE_CAPACITY_STATUSES.includes(a.status))];
    const blockedIntervals = blocked.map((interval) => {
      const start = parseInstant(interval.startAt).getTime(), end = parseInstant(interval.endAt).getTime();
      requireValue(start < end);
      return [start, end];
    });
    const dayClosures = closures.filter((c) => c.status === "active").map((c) => [Date.parse(c.startAt), Date.parse(c.endAt)]).sort((a, b) => a[0] - b[0]);
    const result = [];
    for (let date = input.startDate; date <= input.endDate; date = addLocalDays(date, 1)) {
      const empty = (dayStatus) => result.push({ date, legalSlots: [], recommendedSlots: [], dayStatus });
      if (date > bounds.last) {
        empty("not_open_yet");
        continue;
      }
      const h = hours.find((h2) => h2.dayOfWeek === localDayOfWeek(date));
      if (date < bounds.first || !h?.isOpen) {
        empty("closed");
        continue;
      }
      const open = localDateTimeToUtc(date, h.openTime).getTime(), close = localDateTimeToUtc(date, h.closeTime).getTime();
      let covered = open;
      for (const [start, end] of dayClosures) {
        if (start <= covered && end > covered) covered = end;
      }
      if (covered >= close) {
        empty("closed");
        continue;
      }
      const all = [];
      const wallMinutes = (t) => {
        const [h2, m] = t.split(":").map(Number);
        return h2 * 60 + m;
      };
      const normalDay = close - open === (wallMinutes(h.closeTime) - wallMinutes(h.openTime)) * 6e4;
      const step = normalDay ? policy.customerStartStepMin : 1;
      const offset = normalDay ? (step - wallMinutes(h.openTime) % step) % step : 0;
      for (let cursor = open + offset * 6e4; cursor + service.durationMin * 6e4 <= close; cursor += step * 6e4) {
        if (!normalDay) {
          const local = utcToLocalDateTime(new Date(cursor));
          const [hh, mm] = local.time.split(":").map(Number);
          if ((hh * 60 + mm) % policy.customerStartStepMin !== 0) continue;
        }
        const end = cursor + service.durationMin * 6e4;
        if (!blockedIntervals.some(([start, finish]) => cursor < finish && start < end)) all.push({ startAt: new Date(cursor).toISOString(), endAt: new Date(end).toISOString() });
      }
      const legalSlots = input.preferredTime === void 0 ? all : all.filter((s) => utcToLocalDateTime(s.startAt).time === input.preferredTime);
      const score = (s) => {
        const start = Date.parse(s.startAt), end = Date.parse(s.endAt);
        let before = open, after = close;
        for (const [blockedStart, blockedEnd] of blockedIntervals) {
          if (blockedEnd <= start) before = Math.max(before, blockedEnd);
          if (blockedStart >= end) after = Math.min(after, blockedStart);
        }
        return Math.min(start - before, after - end);
      };
      const recommendedSlots = legalSlots.map((slot) => ({ slot, score: score(slot) })).sort((a, b) => a.score - b.score || a.slot.startAt.localeCompare(b.slot.startAt)).slice(0, 2).map((item) => item.slot);
      result.push({ date, legalSlots, recommendedSlots, dayStatus: all.length ? "available" : "full" });
    }
    return result;
  }

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/booking-core/repository.ts
  function atomic(repository, work) {
    const adapter = repository;
    requireValue(typeof adapter.transaction === "function", "INTERNAL_ERROR");
    return adapter.transaction(work);
  }
  function authenticated(actor) {
    requireValue(actor && typeof actor.userId === "string" && actor.userId.trim(), "AUTH_REQUIRED");
    requireValue(actor.role === "customer" || actor.role === "admin", "FORBIDDEN");
  }
  function administrator(actor) {
    authenticated(actor);
    requireValue(actor.role === "admin", "FORBIDDEN");
  }

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/booking-core/create-appointment.ts
  async function validateSlot(serviceId, startAt, source, now) {
    const start = parseInstant(startAt), date = utcToLocalDateTime(start).date;
    const policy = await source.getPolicy(), bounds = bookingBounds(policy, now);
    requireValue(date >= bounds.first && date <= bounds.last, "OUTSIDE_BOOKING_WINDOW");
    const [day] = await getAvailability({ serviceId, startDate: date, endDate: date }, {
      ...source,
      getService: (id) => source.getService(id),
      getPolicy: () => source.getPolicy(),
      getBusinessHours: () => source.getBusinessHours(),
      getClosures: (a, b) => source.getClosures(a, b),
      getAppointments: async () => []
    }, now);
    requireValue(day.dayStatus !== "closed", "SHOP_CLOSED");
    const slot = day.legalSlots.find((s) => s.startAt === start.toISOString());
    requireValue(slot, "SLOT_INVALID");
    const appointments = await source.getAppointments(slot.startAt, slot.endAt);
    requireValue(!appointments.some((a) => ["booked", "in_progress"].includes(a.status) && overlaps(slot.startAt, slot.endAt, a.startAt, a.endAt)), "SLOT_TAKEN");
    return slot;
  }
  async function createAppointment(input, repository, now = /* @__PURE__ */ new Date()) {
    requireValue(input && typeof input.customerId === "string" && input.customerId.trim(), "AUTH_REQUIRED");
    requireValue(typeof input.serviceId === "string" && input.serviceId.trim());
    requireValue(input.source === "wechat" || input.source === "web", "FORBIDDEN");
    requireValue(input.note === void 0 || typeof input.note === "string");
    parseInstant(input.startAt);
    return atomic(repository, async (tx) => {
      const service = await tx.getService(input.serviceId);
      validateService(service);
      const slot = await validateSlot(input.serviceId, input.startAt, tx, now);
      const timestamp = now.toISOString();
      const appointment = {
        appointmentId: crypto.randomUUID(),
        customerId: input.customerId,
        serviceId: service.serviceId,
        serviceNameSnapshot: service.name,
        durationMinSnapshot: service.durationMin,
        ...slot,
        status: "booked",
        source: input.source,
        createdAt: timestamp,
        updatedAt: timestamp,
        history: [{ fromStatus: null, toStatus: "booked", changedAt: timestamp, changedBy: input.customerId }],
        ...input.note === void 0 ? {} : { note: input.note }
      };
      await tx.createAppointment(appointment);
      return appointment;
    });
  }

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/booking-core/lifecycle.ts
  async function owned(tx, id, actor) {
    authenticated(actor);
    const a = await tx.getAppointment(id);
    requireValue(a, "APPOINTMENT_NOT_FOUND");
    requireValue(a.customerId === actor.userId, "FORBIDDEN");
    return a;
  }
  function change(a, status, actor, now, reason) {
    a.history.push({ fromStatus: a.status, toStatus: status, changedAt: now.toISOString(), changedBy: actor, ...reason ? { reason } : {} });
    a.status = status;
    a.updatedAt = now.toISOString();
  }
  async function cancelAppointment(id, actor, repository, now = /* @__PURE__ */ new Date()) {
    return atomic(repository, async (tx) => {
      const a = await owned(tx, id, actor);
      if (a.status === "cancelled_by_user") return a;
      requireValue(a.status === "needs_reschedule" || a.status === "booked" && now < parseInstant(a.startAt), "INVALID_APPOINTMENT_STATE");
      change(a, "cancelled_by_user", actor.userId, now);
      await tx.saveAppointment(a);
      return a;
    });
  }
  async function rescheduleSource(tx, id, actor, now) {
    const a = await owned(tx, id, actor);
    requireValue(a.status === "needs_reschedule" || a.status === "booked" && now < parseInstant(a.startAt), "INVALID_APPOINTMENT_STATE");
    const source = {
      getService: async (serviceId) => serviceId === a.serviceId ? {
        serviceId,
        name: a.serviceNameSnapshot,
        durationMin: a.durationMinSnapshot,
        isActive: true,
        displayOrder: 0,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      } : void 0,
      getPolicy: () => tx.getPolicy(),
      getBusinessHours: () => tx.getBusinessHours(),
      getClosures: (start, end) => tx.getClosures(start, end),
      getAppointments: async (start, end) => (await tx.getAppointments(start, end)).filter((x) => x.appointmentId !== id)
    };
    return { a, source };
  }
  async function getRescheduleAvailability(id, input, actor, repository, now = /* @__PURE__ */ new Date()) {
    return atomic(repository, async (tx) => {
      const { a, source } = await rescheduleSource(tx, id, actor, now);
      return getAvailability({ ...input, serviceId: a.serviceId }, source, now);
    });
  }
  async function rescheduleAppointment(id, startAt, actor, repository, now = /* @__PURE__ */ new Date()) {
    return atomic(repository, async (tx) => {
      const { a, source } = await rescheduleSource(tx, id, actor, now);
      const slot = await validateSlot(a.serviceId, startAt, source, now);
      const previous = a.startAt;
      a.startAt = slot.startAt;
      a.endAt = slot.endAt;
      change(a, "booked", actor.userId, now, `reschedule: ${previous} -> ${a.startAt}`);
      await tx.saveAppointment(a);
      return a;
    });
  }
  async function createClosure(input, actor, repository, now = /* @__PURE__ */ new Date()) {
    administrator(actor);
    requireValue(input && ["full_day", "partial"].includes(input.type));
    requireValue(parseInstant(input.startAt) < parseInstant(input.endAt));
    return atomic(repository, async (tx) => {
      const closure = { type: input.type, startAt: parseInstant(input.startAt).toISOString(), endAt: parseInstant(input.endAt).toISOString(), closureId: crypto.randomUUID(), status: "active", createdBy: actor.userId, createdAt: now.toISOString() };
      await tx.saveClosure(closure);
      const affected = await tx.getAppointments(closure.startAt, closure.endAt);
      for (const a of affected) {
        if (a.status === "booked" && parseInstant(a.startAt) > now && overlaps(a.startAt, a.endAt, closure.startAt, closure.endAt)) {
          change(a, "needs_reschedule", actor.userId, now, `closure: ${closure.closureId}`);
          await tx.saveAppointment(a);
        }
      }
      return closure;
    });
  }
  function effectiveStatus(a, now, grace) {
    requireValue(Number.isInteger(grace) && grace >= 0 && Number.isFinite(now.getTime()));
    if (!["booked", "in_progress"].includes(a.status)) return a.status;
    if (now.getTime() >= parseInstant(a.endAt).getTime() + grace * 6e4) return "completed_auto";
    if (now >= parseInstant(a.startAt)) return "in_progress";
    return a.status;
  }
  async function reconcileStatuses(repository, now = /* @__PURE__ */ new Date()) {
    return atomic(repository, async (tx) => {
      const policy = await tx.getPolicy();
      const list = tx.getActiveAppointmentsBefore ? await tx.getActiveAppointmentsBefore(now.toISOString()) : await tx.getAppointments("0001-01-01T00:00:00Z", now.toISOString());
      for (const a of list) {
        const effective = effectiveStatus(a, now, policy.autoCompleteGraceMin);
        if (a.status === "booked" && (effective === "in_progress" || effective === "completed_auto")) change(a, "in_progress", "system", now);
        if (effective === "completed_auto" && a.status === "in_progress") change(a, "completed_auto", "system", now);
        await tx.saveAppointment(a);
      }
    });
  }
  async function setAppointmentException(id, status, actor, repository, now = /* @__PURE__ */ new Date(), reason) {
    administrator(actor);
    requireValue(reason === void 0 || typeof reason === "string" && reason.trim().length > 0);
    requireValue(status === "no_show" || status === "cancelled_by_shop");
    return atomic(repository, async (tx) => {
      const a = await tx.getAppointment(id);
      requireValue(a, "APPOINTMENT_NOT_FOUND");
      const policy = await tx.getPolicy();
      const effective = effectiveStatus(a, now, policy.autoCompleteGraceMin);
      if (a.status === "booked" && (effective === "in_progress" || effective === "completed_auto")) change(a, "in_progress", "system", now);
      if (a.status === "in_progress" && effective === "completed_auto") change(a, "completed_auto", "system", now);
      const allowed = status === "no_show" ? ["booked", "in_progress", "completed_auto"] : ["booked", "needs_reschedule"];
      requireValue(allowed.includes(a.status), "INVALID_APPOINTMENT_STATE");
      change(a, status, actor.userId, now, reason?.trim());
      await tx.saveAppointment(a);
      return a;
    });
  }
  async function getMyAppointments(actor, repository) {
    authenticated(actor);
    return atomic(repository, async (tx) => tx.getCustomerAppointments ? tx.getCustomerAppointments(actor.userId) : (await tx.getAppointments("0001-01-01T00:00:00Z", "9999-12-31T23:59:59Z")).filter((a) => a.customerId === actor.userId));
  }

  // ../glasgow-booking-system-2026-09-30-0026-london/web-cloudflare/cloudfunctions/booking-core/admin.ts
  function validateHours(hours) {
    requireValue(Array.isArray(hours) && hours.length === 7);
    const seen = /* @__PURE__ */ new Set();
    for (const h of hours) {
      requireValue(Number.isInteger(h.dayOfWeek) && h.dayOfWeek >= 0 && h.dayOfWeek <= 6 && !seen.has(h.dayOfWeek));
      seen.add(h.dayOfWeek);
      if (h.isOpen) {
        requireValue(typeof h.openTime === "string" && typeof h.closeTime === "string");
        assertTime(h.openTime);
        assertTime(h.closeTime);
        requireValue(h.openTime < h.closeTime);
      }
    }
  }
  function validateServiceInput(input) {
    requireValue(typeof input.name === "string" && input.name.trim().length > 0);
    requireValue(Number.isInteger(input.durationMin) && input.durationMin > 0);
    requireValue(typeof input.isActive === "boolean");
    requireValue(Number.isInteger(input.displayOrder) && input.displayOrder >= 0);
  }
  function dayIntervals(data, date) {
    assertDate(date);
    const hours = data.hours.find((h) => h.dayOfWeek === localDayOfWeek(date));
    if (!hours?.isOpen) return { dayStatus: "closed", freeIntervals: [] };
    const open = localDateTimeToUtc(date, hours.openTime).getTime();
    const close = localDateTimeToUtc(date, hours.closeTime).getTime();
    const blocked = [...data.closures.filter((c) => c.status === "active"), ...data.appointments.filter((a) => ["booked", "in_progress"].includes(a.status))].map((x) => [Math.max(open, Date.parse(x.startAt)), Math.min(close, Date.parse(x.endAt))]).filter(([start, end]) => start < end).sort((a, b) => a[0] - b[0]);
    const free = [];
    let cursor = open;
    for (const [start, end] of blocked) {
      if (start > cursor) free.push({ startAt: new Date(cursor).toISOString(), endAt: new Date(start).toISOString() });
      cursor = Math.max(cursor, end);
    }
    if (cursor < close) free.push({ startAt: new Date(cursor).toISOString(), endAt: new Date(close).toISOString() });
    return { dayStatus: free.length ? "available" : "full", freeIntervals: free };
  }
  async function getAdminSchedule(date, repository, now = /* @__PURE__ */ new Date()) {
    assertDate(date);
    const [policy, hours, closures, appointments, services] = await Promise.all([
      repository.getPolicy(),
      repository.getBusinessHours(),
      repository.getClosures(localDateTimeToUtc(date, "00:00").toISOString(), localDateTimeToUtc(addLocalDays(date, 1), "00:00").toISOString()),
      repository.getAppointments(localDateTimeToUtc(date, "00:00").toISOString(), localDateTimeToUtc(addLocalDays(date, 1), "00:00").toISOString()),
      repository.getAllServices()
    ]);
    const { last } = bookingBounds(policy, now);
    const dayStart = localDateTimeToUtc(date, "00:00").toISOString();
    const dayEnd = localDateTimeToUtc(addLocalDays(date, 1), "00:00").toISOString();
    const dayClosures = closures.filter((c) => c.status === "active" && overlaps(c.startAt, c.endAt, dayStart, dayEnd));
    const dayAppointments = appointments.filter((a) => utcToLocalDateTime(a.startAt).date === date);
    if (date > last) return { date, appointments: dayAppointments, closures: dayClosures, services, businessHours: hours, policy, freeIntervals: [], dayStatus: "not_open_yet" };
    const day = dayIntervals({ hours, closures, appointments, policy }, date);
    return { date, appointments: dayAppointments, closures: dayClosures, services, businessHours: hours, policy, ...day };
  }
  async function getAdminDashboard(repository, now = /* @__PURE__ */ new Date()) {
    const date = utcToLocalDateTime(now).date;
    const schedule = await getAdminSchedule(date, repository, now);
    const all = schedule.appointments;
    const pending = all.filter((a) => a.status === "needs_reschedule" || a.status === "cancelled_by_shop");
    return { schedule, pendingCount: pending.length };
  }
  async function getPendingActions(repository) {
    const appointments = repository.getPendingAppointments ? await repository.getPendingAppointments() : await repository.getAppointments("0001-01-01T00:00:00Z", "9999-12-31T23:59:59Z");
    return { appointments: appointments.filter((a) => a.status === "needs_reschedule" || a.status === "cancelled_by_shop" || a.status === "no_show") };
  }
  async function setBusinessHours(hours, actor, repository, options = {}, now = /* @__PURE__ */ new Date()) {
    administrator(actor);
    validateHours(hours);
    return atomic(repository, async (tx) => {
      const all = await tx.getAppointments(now.toISOString(), "9999-12-31T23:59:59Z");
      const affected = all.filter((a) => {
        if (!["booked", "in_progress"].includes(a.status)) return false;
        const start = utcToLocalDateTime(a.startAt), end = utcToLocalDateTime(a.endAt);
        const h = hours.find((h2) => h2.dayOfWeek === localDayOfWeek(start.date));
        return !h?.isOpen || start.time < h.openTime || end.date !== start.date || end.time > h.closeTime;
      }).map((a) => ({ appointmentId: a.appointmentId, startAt: a.startAt, endAt: a.endAt }));
      if (options.dryRun || affected.length && !options.confirmExisting) return { saved: false, affected };
      await tx.saveBusinessHours(hours);
      return { saved: true, affected };
    });
  }
  async function setBookingPolicy(input, actor, repository) {
    administrator(actor);
    return atomic(repository, async (tx) => {
      const current = await tx.getPolicy();
      const next = { ...current, bookingWindowDays: input.bookingWindowDays, bookingOpenUntil: input.bookingOpenUntil };
      if (input.bookingWindowDays === void 0 && input.bookingOpenUntil === void 0) {
        next.bookingWindowDays = current.bookingWindowDays;
        next.bookingOpenUntil = current.bookingOpenUntil;
      } else if (input.bookingWindowDays !== void 0) next.bookingOpenUntil = void 0;
      else next.bookingWindowDays = void 0;
      validatePolicy(next);
      await tx.savePolicy(next);
      return {};
    });
  }
  async function removeClosure(closureId, actor, repository) {
    administrator(actor);
    requireValue(typeof closureId === "string" && closureId.length > 0);
    return atomic(repository, async (tx) => {
      await tx.removeClosure(closureId);
      return {};
    });
  }
  async function upsertService(input, actor, repository, now = /* @__PURE__ */ new Date()) {
    administrator(actor);
    validateServiceInput(input);
    return atomic(repository, async (tx) => {
      const id = input.serviceId ?? crypto.randomUUID();
      const existing = await tx.getService(id);
      const service = existing ? { ...existing, name: input.name.trim(), durationMin: input.durationMin, isActive: input.isActive, displayOrder: input.displayOrder, updatedAt: now.toISOString() } : { serviceId: id, name: input.name.trim(), durationMin: input.durationMin, isActive: input.isActive, displayOrder: input.displayOrder, createdAt: now.toISOString(), updatedAt: now.toISOString() };
      await tx.saveService(service);
      return service;
    });
  }
  async function createManualAppointment(input, actor, repository, now = /* @__PURE__ */ new Date()) {
    administrator(actor);
    requireValue(input && input.customerId.trim() && input.serviceId);
    assertDate(input.date);
    assertTime(input.startTime);
    return atomic(repository, async (tx) => {
      const service = await tx.getService(input.serviceId);
      validateService(service);
      const policy = await tx.getPolicy();
      const bounds = bookingBounds(policy, now);
      requireValue(input.date >= utcToLocalDateTime(now.toISOString()).date && input.date <= bounds.last, "OUTSIDE_BOOKING_WINDOW");
      const hours = (await tx.getBusinessHours()).find((h) => h.dayOfWeek === localDayOfWeek(input.date));
      requireValue(hours?.isOpen, "SHOP_CLOSED");
      const start = localDateTimeToUtc(input.date, input.startTime);
      const end = new Date(start.getTime() + service.durationMin * 6e4);
      requireValue(input.startTime >= hours.openTime && start > now && utcToLocalDateTime(end).date === input.date && utcToLocalDateTime(end).time <= hours.closeTime, "SLOT_INVALID");
      const startAt = start.toISOString(), endAt = end.toISOString();
      const closures = await tx.getClosures(startAt, endAt);
      requireValue(!closures.some((c) => c.status === "active" && overlaps(startAt, endAt, c.startAt, c.endAt)), "SHOP_CLOSED");
      const appointments = await tx.getAppointments(startAt, endAt);
      requireValue(!appointments.some((a) => ["booked", "in_progress"].includes(a.status) && overlaps(startAt, endAt, a.startAt, a.endAt)), "SLOT_TAKEN");
      const timestamp = now.toISOString();
      const appointment = { appointmentId: crypto.randomUUID(), customerId: input.customerId.trim(), serviceId: service.serviceId, serviceNameSnapshot: service.name, durationMinSnapshot: service.durationMin, startAt, endAt, status: "booked", source: "admin_manual", createdAt: timestamp, updatedAt: timestamp, history: [{ fromStatus: null, toStatus: "booked", changedAt: timestamp, changedBy: actor.userId }], ...input.note ? { note: input.note } : {} };
      await tx.createAppointment(appointment);
      return appointment;
    });
  }

  // web-demo/demo-backend.ts
  var KEY = "glasgow-booking-web-demo-v1";
  var ME = "demo-me";
  var OWNER = "demo-owner";
  var english = document.documentElement.lang.startsWith("en");
  var today = () => utcToLocalDateTime((/* @__PURE__ */ new Date()).toISOString()).date;
  function seed() {
    const now = /* @__PURE__ */ new Date(), data = emptyFixture(now), first = today();
    data.hours[0].isOpen = false;
    const people = {
      [ME]: { name: english ? "You (demo)" : "\u4F60\uFF08\u6F14\u793A\u987E\u5BA2\uFF09", email: "you@example.com", phone: "" },
      c1: { name: "\u9648\u6653", email: "chen@example.com", phone: "07700 900111" },
      c2: { name: "Emma Clarke", email: "emma@example.com", phone: "07700 900222" },
      c3: { name: "\u738B\u963F\u59E8", email: "", phone: "07700 900333" },
      c4: { name: "Liam Murray", email: "liam@example.com", phone: "" },
      c5: { name: "\u674E\u540C\u5B66", email: "li@example.com", phone: "07700 900555" },
      c6: { name: "Sophie Brown", email: "sophie@example.com", phone: "07700 900666" },
      c7: { name: "\u8D75\u5148\u751F", email: "", phone: "07700 900777" },
      c8: { name: "Aisha Khan", email: "aisha@example.com", phone: "" }
    };
    const svc = { 30: ["cut30", "\u77ED\u53D1\u526A\u53D1"], 60: ["cut60", "\u957F\u53D1\u526A\u53D1"], 180: ["colour180", "\u590D\u6742\u67D3\u6F02"] };
    const book = (dayOffset, start, minutes, customerId, status = "booked", source = "web") => {
      const date = addLocalDays(first, dayOffset);
      if (localDayOfWeek(date) === 0) return;
      const startAt = instant(date, start), endAt = new Date(Date.parse(startAt) + minutes * 6e4).toISOString(), [serviceId, name] = svc[minutes];
      data.appointments.push({
        appointmentId: crypto.randomUUID(),
        customerId,
        serviceId,
        serviceNameSnapshot: name,
        durationMinSnapshot: minutes,
        startAt,
        endAt,
        status,
        source,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        history: [{ fromStatus: null, toStatus: status, changedAt: now.toISOString(), changedBy: customerId }]
      });
    };
    book(0, "10:00", 30, "c1");
    book(0, "11:00", 60, "c2");
    book(0, "14:00", 180, "c5");
    book(0, "17:30", 30, "c3", "booked", "admin_manual");
    book(1, "10:30", 60, "c4");
    book(1, "13:00", 30, "c6");
    book(1, "15:00", 30, "c7", "booked", "admin_manual");
    book(2, "10:00", 180, "c8");
    book(2, "14:30", 30, "c1");
    book(3, "11:00", 30, "c2");
    book(3, "12:00", 60, "c5");
    book(3, "16:00", 60, "c6");
    book(4, "10:00", 30, "c3", "booked", "admin_manual");
    book(4, "13:30", 60, "c4", "needs_reschedule");
    book(5, "11:30", 30, "c7");
    book(6, "10:00", 60, "c8");
    book(8, "14:00", 180, "c2");
    const partial = addLocalDays(first, 4);
    data.closures.push({ closureId: "demo-partial", type: "partial", startAt: instant(partial, "13:00"), endAt: instant(partial, "15:00"), status: "active", createdBy: OWNER, createdAt: now.toISOString() });
    return { data, people };
  }
  function storage() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }
  var state;
  try {
    const saved = JSON.parse(storage()?.getItem(KEY) || "null");
    state = saved && saved.day === today() ? saved : { day: today(), ...seed() };
  } catch {
    state = { day: today(), ...seed() };
  }
  var repo = new MemoryRepository(state.data);
  var persist = () => {
    try {
      storage()?.setItem(KEY, JSON.stringify({ day: state.day, data: repo.snapshot(), people: state.people }));
    } catch {
    }
  };
  function resetDemo() {
    state = { day: today(), ...seed() };
    repo = new MemoryRepository(state.data);
    persist();
    location.reload();
  }
  window.__resetBookingDemo = resetDemo;
  var HttpError = class extends Error {
    constructor(status, code) {
      super(code);
      __publicField(this, "status", status);
      __publicField(this, "code", code);
    }
  };
  var demand = (ok, status = 400, code = "INVALID_INPUT") => {
    if (!ok) throw new HttpError(status, code);
  };
  var json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "Content-Type": "application/json" } });
  var trusted = (tx) => Object.assign(tx, { transaction: (work) => work(tx) });
  var me = { userId: ME, role: "customer" };
  var owner = { userId: OWNER, role: "admin" };
  var viewer = () => ({ id: ME, ...state.people[ME] });
  var EN_NAMES = { "\u9648\u6653": "Chen Xiao", "\u738B\u963F\u59E8": "Mrs Wang", "\u674E\u540C\u5B66": "Li Wei", "\u8D75\u5148\u751F": "Mr Zhao" };
  var shown = (name) => name && english && EN_NAMES[name] || name;
  var decorate = (list) => list.map((a) => {
    const p = state.people[a.customerId];
    return { ...a, customerDisplayName: shown(p?.name) || (english ? "Customer" : "\u987E\u5BA2"), customerEmail: p?.email || "", customerPhone: p?.phone || "" };
  });
  var customers = () => Object.entries(state.people).filter(([id]) => id !== ME).map(([customerId, p]) => ({ customerId, name: shown(p.name) }));
  var phoneOk = (phone) => !phone || phone.length <= 25 && /^[+\d\s()\-]+$/.test(phone) && phone.replace(/\D/g, "").length >= 7 && phone.replace(/\D/g, "").length <= 15;
  async function customerState(url) {
    const editing = url.searchParams.get("editing") || "";
    return repo.transaction(async (tx) => {
      const now = /* @__PURE__ */ new Date();
      await reconcileStatuses(trusted(tx), now);
      const policy = await tx.getPolicy(), { first, last } = bookingBounds(policy, now);
      const services = (await tx.getAllServices()).filter((s) => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
      const svc = services.find((s) => s.serviceId === url.searchParams.get("serviceId")) || services[0];
      const range = { startDate: first, endDate: last < first ? first : last };
      let days = svc ? await getAvailability({ serviceId: svc.serviceId, ...range }, tx, now) : [];
      if (editing) days = await getRescheduleAvailability(editing, range, me, trusted(tx), now);
      const appointments = await getMyAppointments(me, trusted(tx));
      const from = localDateTimeToUtc(first, "00:00").toISOString(), to = localDateTimeToUtc(addLocalDays(range.endDate, 1), "00:00").toISOString();
      const busy = (await tx.getAppointments(from, to)).filter((a) => ["booked", "in_progress"].includes(a.status) && a.appointmentId !== editing).map((a) => ({ startAt: a.startAt, endAt: a.endAt }));
      const closures = (await tx.getClosures(from, to)).filter((c) => c.status === "active").map((c) => ({ startAt: c.startAt, endAt: c.endAt }));
      return { selectedServiceId: editing ? appointments.find((a) => a.appointmentId === editing)?.serviceId || svc?.serviceId || "" : svc?.serviceId || "", services, first, last, days, appointments, busy, closures, businessHours: await tx.getBusinessHours(), viewer: viewer() };
    });
  }
  async function handle(method, url, body) {
    const path = url.pathname.replace(/^.*?(\/api\/)/, "/api/"), now = /* @__PURE__ */ new Date();
    try {
      if (path === "/api/me") return json({ viewer: viewer(), admin: false, csrf: "demo", googleConfigured: false, localTest: false });
      if (path === "/api/admin/me") return json({ viewer: viewer(), admin: true, csrf: "demo", googleConfigured: false, localTest: false });
      if (path === "/api/web/auth/config") return json({ configured: false, redirect: false });
      if (method === "POST") {
        let result;
        if (path.endsWith("/logout")) return json({ ok: true });
        if (path === "/api/create" || path === "/api/web/create") {
          const phone = typeof body.phone === "string" ? body.phone.trim() : "";
          demand(phoneOk(phone));
          result = await createAppointment({ customerId: ME, serviceId: body.serviceId, startAt: body.startAt, source: "web" }, repo, now);
          if (phone) state.people[ME].phone = phone;
        } else if (path === "/api/cancel" || path === "/api/web/cancel") result = await cancelAppointment(body.appointmentId, me, repo, now);
        else if (path === "/api/reschedule" || path === "/api/web/reschedule") result = await rescheduleAppointment(body.appointmentId, body.startAt, me, repo, now);
        else if (path === "/api/admin/no-show" || path === "/api/admin/exception") result = await setAppointmentException(body.appointmentId, body.status || "no_show", owner, repo, now, body.reason);
        else if (path === "/api/admin/closure") {
          demand(["full_day", "partial"].includes(body.type));
          const startAt = localDateTimeToUtc(body.date, body.type === "full_day" ? "00:00" : body.startTime).toISOString();
          const endAt = localDateTimeToUtc(body.type === "full_day" ? addLocalDays(body.date, 1) : body.date, body.type === "full_day" ? "00:00" : body.endTime).toISOString();
          result = await createClosure({ type: body.type, startAt, endAt }, owner, repo, now);
        } else if (path === "/api/admin/remove-closure") result = await removeClosure(body.closureId, owner, repo);
        else if (path === "/api/admin/business-hours") result = await setBusinessHours(body.businessHours, owner, repo, { dryRun: body.dryRun === true, confirmExisting: body.confirmExisting === true }, now);
        else if (path === "/api/admin/booking-policy") result = await setBookingPolicy(body, owner, repo);
        else if (path === "/api/admin/service") result = await upsertService(body, owner, repo, now);
        else if (path === "/api/admin/manual-appointment") {
          const phone = typeof body.phone === "string" ? body.phone.trim() : "";
          demand(phoneOk(phone));
          let input = body;
          if (typeof body.newCustomerName === "string") {
            const name = body.newCustomerName.trim();
            demand(name.length >= 1 && name.length <= 80);
            const id = "walk-in-" + crypto.randomUUID().slice(0, 8);
            state.people[id] = { name, email: "", phone };
            input = { ...body, customerId: id };
          } else demand(state.people[body.customerId], 404, "NOT_FOUND");
          result = await createManualAppointment(input, owner, repo, now);
        } else if (path === "/api/admin/reschedule") result = await repo.transaction(async (tx) => {
          const a = await tx.getAppointment(body.appointmentId);
          demand(a, 404, "APPOINTMENT_NOT_FOUND");
          const r = await rescheduleAppointment(a.appointmentId, body.startAt, { userId: a.customerId, role: "customer" }, trusted(tx), now);
          r.history[r.history.length - 1].changedBy = OWNER;
          await tx.saveAppointment(r);
          return r;
        });
        else throw new HttpError(404, "NOT_FOUND");
        persist();
        return json(result);
      }
      const snap = (read) => repo.transaction(async (tx) => {
        await reconcileStatuses(trusted(tx), now);
        return read(tx);
      });
      if (path === "/api/state" || path === "/api/web/state" || path === "/api/availability") return json(await customerState(url));
      if (path === "/api/admin/reschedule-availability") {
        const id = url.searchParams.get("appointmentId") || "", date2 = url.searchParams.get("date") || "";
        return json(await snap(async (tx) => {
          const a = await tx.getAppointment(id);
          demand(a, 404, "APPOINTMENT_NOT_FOUND");
          return getRescheduleAvailability(id, { startDate: date2, endDate: date2 }, { userId: a.customerId, role: "customer" }, trusted(tx));
        }));
      }
      const date = url.searchParams.get("date") || today();
      if (path === "/api/admin/state") {
        const d = await snap((tx) => getAdminSchedule(date, tx));
        return json({ ...d, appointments: decorate(d.appointments), customers: customers() });
      }
      if (path === "/api/admin/dashboard") {
        const d = await snap((tx) => getAdminDashboard(tx));
        return json({ ...d, schedule: { ...d.schedule, appointments: decorate(d.schedule.appointments), customers: customers() } });
      }
      if (path === "/api/admin/pending") {
        const d = await snap((tx) => getPendingActions(tx));
        return json({ ...d, appointments: decorate(d.appointments) });
      }
      throw new HttpError(404, "NOT_FOUND");
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.code }, error.status);
      if (error instanceof BookingError) return json({ error: error.code }, error.code === "FORBIDDEN" ? 403 : error.code === "INVALID_INPUT" ? 400 : 409);
      console.error(error);
      return json({ error: "INTERNAL_ERROR" }, 500);
    }
  }
  var nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, location.href);
    if (url.origin !== location.origin || !url.pathname.includes("/api/")) return nativeFetch(input, init);
    let body = {};
    if (init.body) {
      try {
        body = JSON.parse(String(init.body));
      } catch {
        return json({ error: "INVALID_INPUT" }, 400);
      }
    }
    await new Promise((r) => setTimeout(r, 120));
    return handle((init.method || "GET").toUpperCase(), url, body);
  };
  (() => {
    const q = new URLSearchParams(location.search), wantEn = q.get("lang") === "en";
    if (wantEn && !english) {
      const file = location.pathname.endsWith("admin.html") ? "admin.html" : "";
      location.replace(location.pathname.replace(/[^/]*$/, "") + "en/" + file + location.search + location.hash);
    }
    if (q.get("lang") === "zh" && english) {
      const file = location.pathname.endsWith("admin.html") ? "admin.html" : "";
      location.replace(location.pathname.replace(/en\/[^/]*$/, "") + file + location.search + location.hash);
    }
    const bar = () => {
      if (document.querySelector(".demo-bar")) return;
      const b = document.createElement("div");
      b.className = "demo-bar";
      b.append(english ? "Demo \xB7 sample data stays in your browser" : "\u6F14\u793A \xB7 \u793A\u4F8B\u6570\u636E\u53EA\u4FDD\u5B58\u5728\u4F60\u7684\u6D4F\u89C8\u5668\u91CC");
      const r = document.createElement("button");
      r.type = "button";
      r.textContent = english ? "Reset" : "\u91CD\u7F6E";
      r.onclick = resetDemo;
      b.append(r);
      document.body.prepend(b);
    };
    if (document.body) bar();
    else document.addEventListener("DOMContentLoaded", bar);
  })();
})();

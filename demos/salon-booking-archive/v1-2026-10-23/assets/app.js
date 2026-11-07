// miniprogram/shop.ts
var shop = {
  name: "",
  // e.g. 店名 / Shop name, shown above the page title
  address: "",
  // street address, shown on the review step and in My bookings
  phone: ""
  // a number customers may call
};

// web/shared/http.ts
var identity = { viewer: null, admin: false, csrf: "", googleConfigured: false, localTest: false };
var english = document.body?.dataset.lang === "en" || location.pathname.startsWith("/en");
var adminView = () => document.body?.dataset.view === "admin" || location.pathname.startsWith("/admin");
var zh = { AUTH_REQUIRED: "\u8BF7\u5148\u767B\u5F55\u3002", SLOT_TAKEN: "\u8FD9\u4E2A\u65F6\u95F4\u521A\u521A\u88AB\u9884\u7EA6\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002", CONFLICT: "\u6570\u636E\u521A\u521A\u66F4\u65B0\uFF0C\u8BF7\u91CD\u8BD5\u3002", FORBIDDEN: "\u4F60\u6CA1\u6709\u6743\u9650\u8FDB\u884C\u6B64\u64CD\u4F5C\u3002", CSRF_FAILED: "\u767B\u5F55\u72B6\u6001\u6709\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002", INVALID_CREDENTIALS: "\u90AE\u7BB1\u6216\u5BC6\u7801\u4E0D\u6B63\u786E\u3002", RATE_LIMITED: "\u64CD\u4F5C\u8F83\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002", GOOGLE_NOT_CONFIGURED: "Google \u767B\u5F55\u5C1A\u672A\u914D\u7F6E\uFF0C\u5F53\u524D\u4EC5\u53EF\u672C\u673A\u6D4B\u8BD5\u3002", SHOP_CLOSED: "\u8BE5\u65F6\u6BB5\u5DF2\u5173\u95ED\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u65F6\u95F4\u3002", SLOT_INVALID: "\u8FD9\u4E2A\u65F6\u95F4\u5DF2\u4E0D\u53EF\u9884\u7EA6\u3002", OUTSIDE_BOOKING_WINDOW: "\u8BE5\u65E5\u671F\u5C1A\u672A\u5F00\u653E\u6216\u5DF2\u8FC7\u671F\u3002", IDEMPOTENCY_CONFLICT: "\u8BF7\u6C42\u5185\u5BB9\u5DF2\u6539\u53D8\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002", INVALID_INPUT: "\u8BF7\u68C0\u67E5\u586B\u5199\u7684\u4FE1\u606F\u3002", SERVICE_NOT_FOUND: "\u8BE5\u670D\u52A1\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002", SERVICE_INACTIVE: "\u8BE5\u670D\u52A1\u5DF2\u6682\u505C\u9884\u7EA6\u3002", APPOINTMENT_NOT_FOUND: "\u6CA1\u6709\u627E\u5230\u8FD9\u7B14\u9884\u7EA6\uFF0C\u8BF7\u5237\u65B0\u3002", INVALID_APPOINTMENT_STATE: "\u9884\u7EA6\u72B6\u6001\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002", NOT_FOUND: "\u9875\u9762\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u3002", INTERNAL_ERROR: "\u6682\u65F6\u65E0\u6CD5\u8FDE\u63A5\u5E97\u94FA\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002", DATABASE_NOT_INITIALIZED: "\u5E97\u94FA\u6B63\u5728\u7EF4\u62A4\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002" };
var en = { AUTH_REQUIRED: "Please sign in first.", SLOT_TAKEN: "That time was just booked. Please choose another.", CONFLICT: "Something just changed. Please try again.", FORBIDDEN: "You don\u2019t have permission to do this.", CSRF_FAILED: "Your sign-in changed. Please refresh and try again.", INVALID_CREDENTIALS: "Incorrect email or password.", RATE_LIMITED: "Too many attempts. Please wait a moment.", GOOGLE_NOT_CONFIGURED: "Google sign-in is not set up yet.", SHOP_CLOSED: "The shop is closed at that time. Please choose another.", SLOT_INVALID: "That time can no longer be booked.", OUTSIDE_BOOKING_WINDOW: "That date isn\u2019t open for booking yet.", IDEMPOTENCY_CONFLICT: "Your request changed. Please refresh and try again.", INVALID_INPUT: "Please check the details you entered.", SERVICE_NOT_FOUND: "That service no longer exists. Please refresh.", SERVICE_INACTIVE: "That service is not available right now.", APPOINTMENT_NOT_FOUND: "We couldn\u2019t find that booking. Please refresh.", INVALID_APPOINTMENT_STATE: "This booking has changed. Please refresh and try again.", NOT_FOUND: "Not found. Please refresh.", INTERNAL_ERROR: "We can\u2019t reach the shop right now. Please try again shortly.", DATABASE_NOT_INITIALIZED: "The shop is under maintenance. Please try again shortly." };
var messages = english ? en : zh;
async function refreshIdentity(admin2 = adminView()) {
  const r = await fetch(admin2 ? "/api/admin/me" : "/api/me", { cache: "no-store" });
  if (!r.ok) {
    identity = { ...identity, viewer: null, admin: false, csrf: "" };
    if (admin2 && !location.pathname.startsWith("/admin/login")) location.replace("/admin/login");
    return identity;
  }
  identity = await r.json();
  return identity;
}
async function api(path, body) {
  const headers = {}, options = { cache: "no-store" };
  let storageKey = "";
  if (body !== void 0) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = identity.csrf;
    storageKey = "pending:" + path + ":" + JSON.stringify(body);
    let key = sessionStorage.getItem(storageKey);
    if (!key) {
      key = crypto.randomUUID();
      sessionStorage.setItem(storageKey, key);
    }
    headers["Idempotency-Key"] = key;
    options.method = "POST";
    options.body = JSON.stringify(body);
  }
  options.headers = headers;
  const response = await fetch(path, options);
  const value = await response.json();
  if (storageKey && (response.ok || response.status >= 400 && response.status < 500 && response.status !== 429)) sessionStorage.removeItem(storageKey);
  if (!response.ok) {
    if (response.status === 401 && location.pathname.startsWith("/admin") && path !== "/api/admin/login") location.replace("/admin/login");
    const error = Object.assign(new Error(messages[value.error] || messages.INTERNAL_ERROR), { code: value.error });
    throw error;
  }
  return value;
}
function loginURL() {
  return "/api/auth/google/start?return=" + encodeURIComponent(location.pathname + location.search + location.hash);
}

// web/shared/services.ts
var getCustomerState = (serviceId = "cut30", editing = "") => api("/api/state?" + new URLSearchParams({ serviceId, ...editing ? { editing } : {} }));
var createCustomerAppointment = (serviceId, startAt, phone = "") => api("/api/create", { serviceId, startAt, ...phone ? { phone } : {} });
var rescheduleCustomerAppointment = (appointmentId, startAt) => api("/api/reschedule", { appointmentId, startAt });
var cancelCustomerAppointment = (appointmentId) => api("/api/cancel", { appointmentId });
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function present(d) {
  return { ...d, businessHours: d.businessHours.map((h) => ({ ...h, dayOfWeek: weekdays[h.dayOfWeek], openTime: h.openTime || "10:00", closeTime: h.closeTime || "18:00" })), closures: d.closures.map((c) => ({ ...c, canRemove: c.status === "active" })) };
}
async function call(name, input) {
  const read2 = name === "getAdminDashboard" ? "/api/admin/dashboard" : name === "getAdminSchedule" ? "/api/admin/state?date=" + encodeURIComponent(input.date) : name === "getPendingActions" ? "/api/admin/pending" : "";
  const routes = { setBusinessHours: "business-hours", setBookingPolicy: "booking-policy", createClosure: "closure", removeClosure: "remove-closure", upsertService: "service", createManualAppointment: "manual-appointment", setAppointmentException: "exception" };
  const payload = name === "setBusinessHours" ? { ...input, businessHours: input.businessHours.map((h) => ({ ...h, dayOfWeek: weekdays.indexOf(h.dayOfWeek) })) } : input;
  const result = await api(read2 || "/api/admin/" + routes[name], read2 ? void 0 : payload);
  if (name === "getAdminSchedule") return present(result);
  if (name === "getAdminDashboard") return { ...result, schedule: present(result.schedule) };
  return result;
}

// miniprogram/services/customer-session.ts
var customerSession = {
  serviceId: "cut30",
  editingId: "",
  notice: ""
};

// miniprogram/utils/customer-format.ts
var timeOf = (iso) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
var dateLabel = (date) => new Intl.DateTimeFormat("zh-CN", { timeZone: "Europe/London", month: "numeric", day: "numeric", weekday: "short" }).format(/* @__PURE__ */ new Date(date + "T12:00:00Z"));
var serviceName = (services, id) => services.find((s) => s.serviceId === id)?.name || "\u670D\u52A1";
var statusLabel = { booked: "\u5DF2\u9884\u7EA6", in_progress: "\u8FDB\u884C\u4E2D", completed_auto: "\u5DF2\u5B8C\u6210", cancelled_by_user: "\u5DF2\u53D6\u6D88", cancelled_by_shop: "\u5E97\u94FA\u53D6\u6D88", needs_reschedule: "\u5F85\u6539\u671F", no_show: "\u672A\u5230\u5E97" };
var slotView = (slot, day) => ({ startAt: slot.startAt, endAt: slot.endAt, label: timeOf(slot.startAt), recommended: day.recommendedSlots.some((r) => r.startAt === slot.startAt) });
var shortRef = (id) => id.replace(/-/g, "").slice(0, 8).toUpperCase();

// miniprogram/pages/customer/book/index.ts
var book_default = {
  callShop() {
    if (shop.phone) wx.makePhoneCall({ phoneNumber: shop.phone });
  },
  data: {
    shop,
    loading: false,
    saving: false,
    error: "",
    notice: "",
    stage: "home",
    mode: "date",
    preferred: "",
    serviceId: "cut30",
    serviceName: "",
    duration: 0,
    services: [],
    days: [],
    weekdays: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"],
    monthLabel: "",
    until: "",
    activeDate: "",
    activeDateLabel: "",
    slots: [],
    selected: null,
    editingId: "",
    earliest: "",
    availableTimes: [],
    selectedLabel: "",
    phone: ""
  },
  // Kept out of setData-driven re-render so typing is not interrupted.
  phoneInput(e) {
    this.data.phone = e.detail.value;
  },
  state: null,
  revision: 0,
  onShow() {
    this.setData({ editingId: customerSession.editingId, serviceId: customerSession.serviceId, stage: "home", selected: null, notice: customerSession.notice });
    customerSession.notice = "";
    void this.load();
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  async load() {
    const revision = ++this.revision;
    this.setData({ loading: true, error: "" });
    try {
      const state = await getCustomerState(this.data.serviceId, this.data.editingId);
      if (revision !== this.revision) return;
      this.state = state;
      const serviceId = this.data.editingId ? this.data.serviceId : state.selectedServiceId;
      customerSession.serviceId = serviceId;
      const service = state.services.find((s) => s.serviceId === serviceId);
      const times2 = [...new Set(state.days.flatMap((d) => d.legalSlots.map((s) => timeOf(s.startAt))))].sort();
      const preferred = times2.includes(this.data.preferred) ? this.data.preferred : times2[0] || "";
      this.setData({
        serviceId,
        serviceName: serviceName(state.services, serviceId),
        duration: service?.durationMin || 0,
        services: state.services.map((s) => ({ id: s.serviceId, name: s.name, duration: s.durationMin, selected: s.serviceId === serviceId })),
        until: state.last.slice(5).replace("-", "/"),
        availableTimes: times2,
        preferred
      });
      this.refreshViews();
    } catch (error) {
      if (revision === this.revision) this.setData({ error: error.message });
    } finally {
      if (revision === this.revision) this.setData({ loading: false });
    }
  },
  refreshViews() {
    if (!this.state) return;
    const { mode, preferred, activeDate, selected } = this.data;
    const eligible = this.state.days.filter((d) => d.date <= this.state.last);
    const first = eligible[0]?.date || "";
    const last = eligible[eligible.length - 1]?.date || "";
    const leading = first ? ((/* @__PURE__ */ new Date(first + "T12:00:00Z")).getUTCDay() + 6) % 7 : 0;
    const days = Array.from({ length: leading }, (_, i) => ({ date: "empty-" + i, number: "", status: "", available: false, selected: false, placeholder: true }));
    days.push(...eligible.map((d) => {
      const count = d.legalSlots.filter((s) => mode === "date" || timeOf(s.startAt) === preferred).length;
      const status = d.dayStatus === "closed" ? "\u4F11\u606F" : d.dayStatus === "not_open_yet" ? "\u672A\u5F00\u653E" : count ? "\u53EF\u9884\u7EA6" : mode === "time" ? "\u6B64\u65F6\u4E0D\u53EF\u7EA6" : "\u5DF2\u6EE1";
      return { date: d.date, number: String(Number(d.date.slice(-2))), status, available: count > 0, selected: activeDate === d.date };
    }));
    const monthLabel = first ? Number(first.slice(0, 4)) + " \u5E74 " + Number(first.slice(5, 7)) + " \u6708" + (first.slice(0, 7) === last.slice(0, 7) ? "" : " \u2014 " + (first.slice(0, 4) === last.slice(0, 4) ? "" : Number(last.slice(0, 4)) + " \u5E74 ") + Number(last.slice(5, 7)) + " \u6708") : "";
    const day = this.state.days.find((d) => d.date === activeDate);
    const slots = (day?.legalSlots || []).filter((s) => mode === "date" || timeOf(s.startAt) === preferred).map((s) => ({ ...slotView(s, day), selected: s.startAt === selected?.startAt }));
    const earliest = this.state.days.flatMap((d) => d.legalSlots.filter((s) => mode === "date" || timeOf(s.startAt) === preferred))[0];
    this.setData({ days, monthLabel, slots, activeDateLabel: activeDate ? dateLabel(activeDate) : "", selectedLabel: selected ? timeOf(selected.startAt) + "\u2013" + timeOf(selected.endAt) : "", earliest: earliest ? dateLabel(this.state.days.find((d) => d.legalSlots.some((s) => s.startAt === earliest.startAt)).date) + " " + timeOf(earliest.startAt) : "" });
  },
  async selectService(e) {
    if (this.data.editingId) return;
    const serviceId = String(e.currentTarget.dataset.id);
    customerSession.serviceId = serviceId;
    this.setData({ serviceId, selected: null, activeDate: "" });
    await this.load();
  },
  selectMode(e) {
    this.setData({ mode: String(e.currentTarget.dataset.mode), selected: null });
    this.refreshViews();
  },
  selectPreferred(e) {
    this.setData({ preferred: this.data.availableTimes[Number(e.detail.value)] || "", selected: null });
    this.refreshViews();
  },
  openEarliest() {
    const slot = this.state?.days.flatMap((d) => d.legalSlots.filter((s) => this.data.mode === "date" || timeOf(s.startAt) === this.data.preferred))[0];
    if (slot) this.openDateValue(this.state.days.find((d) => d.legalSlots.some((s) => s.startAt === slot.startAt)).date);
  },
  openDate(e) {
    this.openDateValue(String(e.currentTarget.dataset.date));
  },
  openDateValue(date) {
    const day = this.state?.days.find((d) => d.date === date);
    if (!day?.legalSlots.length) return;
    this.setData({ activeDate: date, selected: null, stage: "day" });
    this.refreshViews();
  },
  chooseSlot(e) {
    const slot = this.state?.days.find((d) => d.date === this.data.activeDate)?.legalSlots.find((s) => s.startAt === e.currentTarget.dataset.start);
    if (!slot) return;
    this.setData({ selected: slot });
    this.refreshViews();
  },
  async review() {
    const selected = this.data.selected;
    if (!selected) return;
    await this.load();
    if (!this.state?.days.some((d) => d.legalSlots.some((s) => s.startAt === selected.startAt))) {
      this.setData({ selected: null, notice: "\u8FD9\u4E2A\u65F6\u95F4\u521A\u521A\u88AB\u9884\u7EA6\u4E86\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002" });
      this.refreshViews();
      return;
    }
    this.setData({ selected, stage: "confirm", notice: "" });
  },
  async submit() {
    const selected = this.data.selected;
    if (!selected || this.data.saving) return;
    const phone = this.data.phone.trim(), digits = phone.replace(/\D/g, "");
    if (phone && (!/^[+\d\s()\-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) {
      this.setData({ error: "\u7535\u8BDD\u53F7\u7801\u683C\u5F0F\u4E0D\u5BF9\uFF0C\u8BF7\u68C0\u67E5\u4E00\u4E0B\uFF0C\u6216\u8005\u7559\u7A7A\u3002" });
      return;
    }
    this.setData({ saving: true, error: "" });
    try {
      if (this.data.editingId) await rescheduleCustomerAppointment(this.data.editingId, selected.startAt);
      else await createCustomerAppointment(this.data.serviceId, selected.startAt, this.data.phone.trim());
      customerSession.editingId = "";
      customerSession.notice = this.data.editingId ? "\u6539\u671F\u6210\u529F\uFF0C\u539F\u65F6\u95F4\u5DF2\u91CA\u653E\u3002" : "\u9884\u7EA6\u6210\u529F\uFF0C\u5DF2\u4E3A\u4F60\u4FDD\u7559\u65F6\u95F4\u3002";
      wx.switchTab({ url: "/pages/customer/mine/index" });
    } catch (error) {
      this.setData({ error: error.message, stage: "day", selected: null });
      await this.load();
    } finally {
      this.setData({ saving: false });
    }
  },
  back() {
    this.setData({ stage: this.data.stage === "confirm" ? "day" : "home", error: "", notice: "" });
  },
  showMine() {
    customerSession.editingId = "";
    wx.switchTab({ url: "/pages/customer/mine/index" });
  }
};

// miniprogram/pages/customer/mine/index.ts
var mine_default = {
  callShop() {
    if (shop.phone) wx.makePhoneCall({ phoneNumber: shop.phone });
  },
  data: { shop, loading: false, error: "", notice: "", rows: [] },
  onShow() {
    this.setData({ notice: customerSession.notice });
    customerSession.notice = "";
    void this.load();
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const state = await getCustomerState(customerSession.serviceId);
      this.setData({ rows: state.appointments.slice().reverse().map((a) => ({ id: a.appointmentId, ref: shortRef(a.appointmentId), serviceId: a.serviceId, date: dateLabel(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(a.startAt))), time: timeOf(a.startAt) + "\u2013" + timeOf(a.endAt), service: a.serviceNameSnapshot, duration: a.durationMinSnapshot, status: statusLabel[a.status], canChange: a.status === "booked" || a.status === "needs_reschedule", pending: a.status === "needs_reschedule" })) });
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
  newBooking() {
    customerSession.editingId = "";
    wx.switchTab({ url: "/pages/customer/book/index" });
  },
  edit(e) {
    customerSession.editingId = String(e.currentTarget.dataset.id);
    customerSession.serviceId = String(e.currentTarget.dataset.service);
    customerSession.notice = "";
    wx.switchTab({ url: "/pages/customer/book/index" });
  },
  async cancel(e) {
    const id = String(e.currentTarget.dataset.id);
    const result = await wx.showModal({ title: "\u53D6\u6D88\u8FD9\u6B21\u9884\u7EA6\uFF1F", content: "\u786E\u8BA4\u540E\uFF0C\u65F6\u95F4\u5C06\u5F00\u653E\u7ED9\u5176\u4ED6\u987E\u5BA2\uFF0C\u53D6\u6D88\u8BB0\u5F55\u4F1A\u4FDD\u7559\u3002", confirmText: "\u786E\u8BA4\u53D6\u6D88", cancelText: "\u4FDD\u7559\u9884\u7EA6" });
    if (!result.confirm) return;
    try {
      await cancelCustomerAppointment(id);
      this.setData({ notice: "\u5DF2\u53D6\u6D88\u9884\u7EA6\uFF0C\u8BE5\u65F6\u95F4\u5DF2\u91CD\u65B0\u5F00\u653E\u3002" });
      await this.load();
    } catch (error) {
      this.setData({ error: error.message });
    }
  }
};

// miniprogram/config.ts
var config = { mode: "local", localApiBase: "http://127.0.0.1:4173", cloudEnv: "", apiContractConfirmed: false };

// miniprogram/utils/errors.ts
var errorText = { INVALID_INPUT: "\u8BF7\u68C0\u67E5\u586B\u5199\u7684\u4FE1\u606F", AUTH_REQUIRED: "\u8BF7\u5148\u767B\u5F55\u540E\u91CD\u8BD5", FORBIDDEN: "\u6B64\u8D26\u53F7\u6CA1\u6709\u5E97\u94FA\u7BA1\u7406\u6743\u9650\uFF0C\u8BF7\u8054\u7CFB\u5E97\u4E3B", SERVICE_NOT_FOUND: "\u8BE5\u670D\u52A1\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5", SERVICE_INACTIVE: "\u8BE5\u670D\u52A1\u5DF2\u6682\u505C\u9884\u7EA6", OUTSIDE_BOOKING_WINDOW: "\u8FD9\u4E2A\u65E5\u671F\u5C1A\u672A\u5F00\u653E\u9884\u7EA6", SHOP_CLOSED: "\u8BE5\u65F6\u6BB5\u5E97\u94FA\u4F11\u606F\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u65F6\u95F4", SLOT_INVALID: "\u8FD9\u4E2A\u5F00\u59CB\u65F6\u95F4\u4E0D\u7B26\u5408\u9884\u7EA6\u89C4\u5219", SLOT_TAKEN: "\u8BE5\u65F6\u95F4\u521A\u521A\u88AB\u9884\u7EA6\uFF0C\u8BF7\u6362\u4E00\u4E2A\u65F6\u95F4", APPOINTMENT_NOT_FOUND: "\u6CA1\u6709\u627E\u5230\u8FD9\u7B14\u9884\u7EA6\uFF0C\u8BF7\u5237\u65B0", INVALID_APPOINTMENT_STATE: "\u9884\u7EA6\u72B6\u6001\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5", CONFLICT: "\u4FE1\u606F\u5DF2\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u540E\u518D\u64CD\u4F5C", INTERNAL_ERROR: "\u6682\u65F6\u65E0\u6CD5\u8FDE\u63A5\u5E97\u94FA\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" };
function friendly(error) {
  const code = error?.code;
  return code && errorText[code] || errorText.INTERNAL_ERROR;
}

// miniprogram/utils/london.ts
function londonParts(value = /* @__PURE__ */ new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value));
  const get = (key) => parts.find((p) => p.type === key).value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}
var today = () => londonParts().date;
var time = (value) => londonParts(value).time;
function addDays(date, days) {
  return new Date(Date.parse(date + "T12:00:00Z") + days * 864e5).toISOString().slice(0, 10);
}
function dateTitle(date) {
  const d = /* @__PURE__ */ new Date(date + "T12:00:00Z");
  return `${Number(date.slice(5, 7))}\u6708${Number(date.slice(8))}\u65E5 \xB7 ${["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"][d.getUTCDay()]}`;
}

// miniprogram/utils/presentation.ts
var statusText = { booked: "\u5DF2\u9884\u7EA6", in_progress: "\u8FDB\u884C\u4E2D", completed_auto: "\u5DF2\u5B8C\u6210", cancelled_by_user: "\u987E\u5BA2\u53D6\u6D88", cancelled_by_shop: "\u5E97\u94FA\u53D6\u6D88", needs_reschedule: "\u5F85\u6539\u671F", no_show: "\u672A\u5230\u5E97" };
function effectiveStatus(a, grace, now = Date.now()) {
  if (a.status !== "booked" && a.status !== "in_progress") return a.status;
  if (now >= Date.parse(a.endAt) + grace * 6e4) return "completed_auto";
  if (now >= Date.parse(a.startAt)) return "in_progress";
  return a.status;
}
function allowedException(status, target) {
  return target === "no_show" ? ["booked", "in_progress", "completed_auto"].includes(status) : target === "cancelled_by_shop" && ["booked", "needs_reschedule"].includes(status);
}
function summary(rows) {
  return { total: rows.filter((a) => !["cancelled_by_shop", "cancelled_by_user"].includes(a.effective)).length, done: rows.filter((a) => a.effective === "completed_auto").length, remaining: rows.filter((a) => ["booked", "in_progress"].includes(a.effective)).length };
}
var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function londonWall(date, time2) {
  const wall = Date.parse(`${date}T${time2}:00Z`);
  for (let offset = -180; offset <= 180; offset++) {
    const candidate = new Date(wall - offset * 6e4);
    const local = londonParts(candidate);
    if (local.date === date && local.time === time2) return candidate.getTime();
  }
  return NaN;
}
function minutesLabel(minutes3) {
  const rounded = Math.max(0, Math.round(minutes3));
  const hours = Math.floor(rounded / 60), rest = rounded % 60;
  if (hours && rest) return `${hours}\u5C0F\u65F6${rest}\u5206\u949F`;
  if (hours) return `${hours}\u5C0F\u65F6`;
  return `${rest}\u5206\u949F`;
}
function merge(intervals) {
  return intervals.sort((a, b) => a[0] - b[0]).reduce((out, [start2, end]) => {
    const last = out[out.length - 1];
    if (last && start2 <= last[1]) last[1] = Math.max(last[1], end);
    else out.push([start2, end]);
    return out;
  }, []);
}
function todayOverview(schedule) {
  const weekdayName = weekday[(/* @__PURE__ */ new Date(`${schedule.date}T12:00:00Z`)).getUTCDay()];
  const hours = schedule.businessHours.find((h) => h.dayOfWeek === weekdayName);
  if (!hours || !hours.isOpen || !hours.openTime || !hours.closeTime) return { appointmentCount: 0, openLabel: "\u4ECA\u5929\u4F11\u606F", occupiedMinutes: 0, freeMinutes: 0, occupiedLabel: "0\u5206\u949F", freeLabel: "0\u5206\u949F", statusLabel: "\u4F11\u606F" };
  const open = londonWall(schedule.date, hours.openTime), close = londonWall(schedule.date, hours.closeTime);
  if (!Number.isFinite(open) || !Number.isFinite(close) || close <= open) return { appointmentCount: 0, openLabel: `${hours.openTime}\u2013${hours.closeTime}`, occupiedMinutes: 0, freeMinutes: 0, occupiedLabel: "0\u5206\u949F", freeLabel: "0\u5206\u949F", statusLabel: "\u4F11\u606F" };
  const closureIntervals = merge(schedule.closures.map((c) => [Math.max(open, Date.parse(c.startAt)), Math.min(close, Date.parse(c.endAt))]).filter(([start2, end]) => start2 < end));
  const closedMinutes = closureIntervals.reduce((total, [start2, end]) => total + (end - start2) / 6e4, 0);
  const valid = schedule.appointments.filter((a) => ["booked", "in_progress", "completed_auto"].includes(a.status));
  const occupiedMinutes = valid.reduce((total, a) => {
    const start2 = Math.max(open, Date.parse(a.startAt)), end = Math.min(close, Date.parse(a.endAt));
    return total + (start2 < end ? (end - start2) / 6e4 : 0);
  }, 0);
  const openMinutes = (close - open) / 6e4, freeMinutes = Math.max(0, openMinutes - closedMinutes - occupiedMinutes), usableMinutes = Math.max(0, openMinutes - closedMinutes), ratio = usableMinutes ? freeMinutes / usableMinutes : 0;
  const statusLabel2 = freeMinutes === 0 ? "\u5DF2\u6EE1" : ratio <= 0.25 ? "\u8F83\u5FD9" : ratio >= 0.5 ? "\u7A7A\u95F2\u8F83\u591A" : "\u6B63\u5E38";
  return { appointmentCount: valid.length, openLabel: `${hours.openTime}\u2013${hours.closeTime}`, occupiedMinutes, freeMinutes, occupiedLabel: minutesLabel(occupiedMinutes), freeLabel: minutesLabel(freeMinutes), statusLabel: statusLabel2 };
}

// miniprogram/utils/ui.ts
function row(a, grace = 15) {
  const effective = effectiveStatus(a, grace);
  return { ...a, effective, ref: a.appointmentId.replace(/-/g, "").slice(0, 8).toUpperCase(), statusText: statusText[effective], startLabel: time(a.startAt), endLabel: time(a.endAt), dateLabel: dateTitle(londonParts(a.startAt).date), canNoShow: allowedException(effective, "no_show"), canCancel: allowedException(effective, "cancelled_by_shop") };
}
var baseData = { demo: config.mode === "demo", loading: false, saving: false, error: "" };
function detail(e) {
  const d = e.currentTarget.dataset;
  wx.navigateTo({ url: `/pages/admin/detail/index?id=${encodeURIComponent(d.id)}&date=${d.date}&pending=${d.pending ? "1" : "0"}` });
}
function navigate(e) {
  wx.navigateTo({ url: `/pages/admin/${e.currentTarget.dataset.page}/index` });
}
async function save(name, input, message) {
  const { confirm } = await wx.showModal({ title: "\u8BF7\u786E\u8BA4", content: message, confirmText: config.mode === "demo" ? "\u67E5\u770B\u6F14\u793A" : "\u786E\u8BA4\u4FDD\u5B58", confirmColor: "#5C669B" });
  if (!confirm) return false;
  if (config.mode === "demo") {
    await wx.showModal({ title: "\u6F14\u793A\u6A21\u5F0F \xB7 \u6CA1\u6709\u4FDD\u5B58", content: "\u4F60\u5DF2\u5B8C\u6210\u64CD\u4F5C\u9884\u89C8\u3002\u63A5\u5165\u53CC\u65B9\u786E\u8BA4\u7684\u5171\u4EAB\u540E\u53F0\u540E\uFF0C\u8FD9\u4E00\u6B65\u624D\u4F1A\u771F\u6B63\u4FDD\u5B58\u5E76\u540C\u6B65\u7ED9\u987E\u5BA2\u3002", showCancel: false, confirmText: "\u77E5\u9053\u4E86" });
    return false;
  }
  await call(name, input);
  wx.showToast({ title: "\u5DF2\u4FDD\u5B58", icon: "success" });
  return true;
}

// miniprogram/pages/admin/today/index.ts
var today_default = {
  data: { ...baseData, date: "", dateTitle: "", overview: null, rows: [], next: null, current: null, counts: { total: 0, done: 0, remaining: 0 }, pendingCount: 0, free: [], nextFree: "", freeLeft: "", statusClass: "", statusText: "" },
  timer: 0,
  onShow() {
    this.load();
    this.timer = setInterval(() => this.load(), 3e4);
  },
  onHide() {
    clearInterval(this.timer);
  },
  onUnload() {
    clearInterval(this.timer);
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  openDetail: detail,
  async load() {
    if (this.data.loading) return;
    this.setData({ loading: true, error: "" });
    try {
      const [d, p] = await Promise.all([call("getAdminDashboard", {}), call("getPendingActions", {})]);
      const all = d.schedule.appointments.map((a) => row(a, d.schedule.policy.autoCompleteGraceMin)).sort((a, b) => a.startAt.localeCompare(b.startAt));
      this.setData({ date: d.schedule.date, dateTitle: dateTitle(d.schedule.date), overview: todayOverview(d.schedule), counts: summary(all.filter((a) => ["booked", "in_progress", "completed_auto"].includes(a.effective))), rows: all.filter((a) => a.effective === "booked"), current: all.find((a) => a.effective === "in_progress") || null, next: all.find((a) => a.effective === "booked") || null, pendingCount: p.appointments.filter((a) => a.status === "needs_reschedule").length, statusClass: { "\u5DF2\u6EE1": "full", "\u8F83\u5FD9": "busy", "\u6B63\u5E38": "normal", "\u7A7A\u95F2\u8F83\u591A": "quiet", "\u4F11\u606F": "closed" }[todayOverview(d.schedule).statusLabel] || "normal", free: d.schedule.freeIntervals.map((i) => ({ start: Math.max(Math.ceil(Date.now() / 9e5) * 9e5, Date.parse(i.startAt)), end: Date.parse(i.endAt) })).filter((i) => i.end - i.start >= 9e5).map((i) => time(new Date(i.start).toISOString()) + "\u2013" + time(new Date(i.end).toISOString())) });
      const left = d.schedule.freeIntervals.reduce((t, i) => t + Math.max(0, Date.parse(i.endAt) - Math.max(Math.ceil(Date.now() / 9e5) * 9e5, Date.parse(i.startAt))), 0) / 6e4;
      const ov = this.data.overview;
      const ended = !!ov && ov.statusLabel !== "\u4F11\u606F" && !this.data.free.length && !this.data.counts.remaining && !left;
      this.setData({ statusText: ended ? "\u4ECA\u5929\u5DF2\u7ED3\u675F" : ov?.statusLabel || "", statusClass: ended ? "closed" : this.data.statusClass, nextFree: this.data.free[0] || "", freeLeft: left >= 60 ? `${Math.floor(left / 60)}\u5C0F\u65F6${left % 60 ? Math.round(left % 60) + "\u5206" : ""}` : `${Math.round(left)}\u5206\u949F` });
    } catch (e) {
      this.setData({ error: friendly(e), overview: null, rows: [], next: null, current: null, free: [], counts: { total: 0, done: 0, remaining: 0 }, pendingCount: 0 });
    } finally {
      this.setData({ loading: false });
    }
  },
  add() {
    wx.navigateTo({ url: "/pages/admin/manual/index" });
  },
  adjust() {
    wx.navigateTo({ url: "/pages/admin/closure/index?fullDay=0&date=" + this.data.date });
  },
  goPending() {
    wx.navigateTo({ url: "/pages/admin/pending/index" });
  }
};

// miniprogram/utils/calendar.ts
var minutes = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
function calendarTimeline(d) {
  const active = d.appointments.filter((a) => ["booked", "in_progress", "completed_auto"].includes(a.status));
  const weekday2 = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][(/* @__PURE__ */ new Date(d.date + "T12:00:00Z")).getUTCDay()];
  const hours = d.businessHours.find((h) => h.dayOfWeek === weekday2);
  const spans = active.map((a) => ({ id: a.appointmentId, start: minutes(time(a.startAt)), end: minutes(time(a.endAt)), title: a.serviceNameSnapshot, name: a.customerDisplayName, status: statusText[a.status], tone: a.status === "completed_auto" ? "finished" : a.durationMinSnapshot >= 90 ? "lilac" : a.durationMinSnapshot >= 60 ? "peach" : "sage" }));
  const from = Math.floor(Math.min(hours?.isOpen ? minutes(hours.openTime) : 10 * 60, ...spans.map((s) => s.start)) / 60) * 60;
  const to = Math.ceil(Math.max(hours?.isOpen ? minutes(hours.closeTime) : 18 * 60, ...spans.map((s) => s.end)) / 60) * 60;
  const clock2 = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  const blocks = d.closures.map((c) => {
    const start2 = londonParts(c.startAt).date < d.date ? from : Math.max(from, minutes(time(c.startAt)));
    const end = londonParts(c.endAt).date > d.date ? to : Math.min(to, minutes(time(c.endAt)));
    return { id: c.closureId, top: (start2 - from) * 2.6, height: (end - start2) * 2.6, label: clock2(start2) + "\u2013" + clock2(end) };
  }).filter((c) => c.height > 0);
  return { blocks, height: (to - from) * 2.6, ticks: Array.from({ length: (to - from) / 60 + 1 }, (_, i) => ({ label: clock2(from + i * 60), top: i * 60 * 2.6 })), events: spans.map((s) => ({ ...s, top: (s.start - from) * 2.6, height: Math.max(64, (s.end - s.start) * 2.6 - 6), label: clock2(s.start) + "\u2013" + clock2(s.end) })) };
}

// miniprogram/pages/admin/schedule/index.ts
var weekdays2 = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
var schedule_default = {
  data: { ...baseData, date: today(), dateTitle: "", monthTitle: "", expanded: false, week: [], month: [], query: "", all: [], rows: [], closures: [], blocks: [], timeline: [], ticks: [], height: 0, status: "", count: 0 },
  revision: 0,
  onShow() {
    this.load();
  },
  openDetail: detail,
  async load() {
    const revision = ++this.revision;
    this.setData({ loading: true, error: "" });
    this.calendar();
    try {
      const d = await call("getAdminSchedule", { date: this.data.date });
      if (revision !== this.revision) return;
      const visual = calendarTimeline(d);
      const rows = d.appointments.map((a) => row(a, d.policy.autoCompleteGraceMin));
      this.setData({ dateTitle: dateTitle(d.date), all: rows, rows: rows.filter((a) => !this.data.query || (a.customerDisplayName + " " + a.serviceNameSnapshot).includes(this.data.query)), blocks: visual.blocks, timeline: visual.events, ticks: visual.ticks, height: visual.height, count: rows.filter((a) => ["booked", "in_progress", "completed_auto"].includes(a.effective)).length, status: d.dayStatus === "not_open_yet" ? "\u6682\u672A\u5F00\u653E" : d.dayStatus === "closed" ? "\u4F11\u606F\u65E5" : d.dayStatus === "full" ? "\u5DF2\u6392\u6EE1" : "\u5F00\u653E\u9884\u7EA6", closures: d.closures.map((c) => ({ ...c, label: dateTitle(c.startAt.slice(0, 10)) + " " + (c.type === "full_day" ? "\u5168\u5929\u4F11\u606F" : time(c.startAt) + "\u2013" + time(c.endAt)) })) });
    } catch (e) {
      if (revision === this.revision) this.setData({ error: friendly(e), blocks: [], timeline: [], all: [], rows: [], closures: [], ticks: [], height: 0 });
    } finally {
      if (revision === this.revision) this.setData({ loading: false });
    }
  },
  calendar() {
    const date = this.data.date, dow = (/* @__PURE__ */ new Date(date + "T12:00:00Z")).getUTCDay(), start2 = addDays(date, -((dow + 6) % 7)), first = date.slice(0, 8) + "01", firstDow = (/* @__PURE__ */ new Date(first + "T12:00:00Z")).getUTCDay(), monthStart = addDays(first, -((firstDow + 6) % 7));
    this.setData({ monthTitle: date.slice(0, 4) + "\u5E74 " + Number(date.slice(5, 7)) + "\u6708", week: Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start2, i);
      return { date: d, day: String(Number(d.slice(8))), weekday: weekdays2[(/* @__PURE__ */ new Date(d + "T12:00:00Z")).getUTCDay()], selected: d === date };
    }), month: Array.from({ length: 42 }, (_, i) => {
      const d = addDays(monthStart, i);
      return { date: d, day: String(Number(d.slice(8))), selected: d === date, dim: d.slice(0, 7) !== date.slice(0, 7) };
    }) });
  },
  openDay(e) {
    this.setData({ date: e.currentTarget.dataset.date });
    this.load();
  },
  choose(e) {
    this.setData({ date: String(e.detail.value) });
    this.load();
  },
  shift(e) {
    this.setData({ date: addDays(this.data.date, Number(e.currentTarget.dataset.days)) });
    this.load();
  },
  goToday() {
    this.setData({ date: today() });
    this.load();
  },
  toggleCalendar() {
    this.setData({ expanded: !this.data.expanded });
  },
  search(e) {
    const query = e.detail.value.trim();
    this.setData({ query, rows: this.data.all.filter((a) => !query || (a.customerDisplayName + " " + a.serviceNameSnapshot + " " + a.ref).toUpperCase().includes(query.toUpperCase())) });
  },
  add() {
    wx.navigateTo({ url: "/pages/admin/manual/index?date=" + this.data.date });
  },
  adjust() {
    wx.navigateTo({ url: "/pages/admin/closure/index?date=" + this.data.date });
  },
  async remove(e) {
    if (this.data.saving) return;
    this.setData({ saving: true });
    try {
      if (await save("removeClosure", { closureId: e.currentTarget.dataset.id }, "\u6062\u590D\u8FD9\u6BB5\u65F6\u95F4\u7684\u8425\u4E1A\uFF1F\u5F85\u6539\u671F\u987E\u5BA2\u4ECD\u9700\u91CD\u65B0\u9009\u62E9\u65F6\u95F4\u3002")) await this.load();
    } catch (e2) {
      this.setData({ error: friendly(e2) });
    } finally {
      this.setData({ saving: false });
    }
  }
};

// miniprogram/pages/admin/pending/index.ts
var pending_default = {
  data: { ...baseData, rows: [], all: [], pending: true, date: "", selected: "needs_reschedule", groups: [{ key: "needs_reschedule", label: "\u5F85\u6539\u671F", count: 0 }, { key: "cancelled_by_shop", label: "\u5E97\u94FA\u53D6\u6D88", count: 0 }, { key: "no_show", label: "\u5F02\u5E38\u8BB0\u5F55", count: 0 }] },
  onShow() {
    this.load();
  },
  openDetail: detail,
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const d = await call("getPendingActions", {});
      this.setData({ all: d.appointments.map((a) => row(a)), groups: this.data.groups.map((g) => ({ ...g, count: d.appointments.filter((a) => a.status === g.key).length })) });
      this.filter();
    } catch (e) {
      this.setData({ error: friendly(e), rows: [], all: [], groups: this.data.groups.map((g) => ({ ...g, count: 0 })) });
    } finally {
      this.setData({ loading: false });
    }
  },
  select(e) {
    this.setData({ selected: e.currentTarget.dataset.key });
    this.filter();
  },
  filter() {
    this.setData({ rows: this.data.all.filter((a) => a.status === this.data.selected) });
  }
};

// miniprogram/pages/admin/settings/index.ts
var settings_default = { data: baseData, navigate, load() {
}, onPullDownRefresh() {
  wx.stopPullDownRefresh();
} };

// miniprogram/pages/admin/detail/index.ts
var detail_default = {
  data: { ...baseData, item: null, reason: "", more: false, history: [] },
  id: "",
  date: "",
  pending: false,
  onLoad(o) {
    this.id = o.id || "";
    this.date = o.date || "";
    this.pending = o.pending === "1";
  },
  onShow() {
    this.load();
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  async load() {
    this.setData({ loading: true, error: "", item: null });
    try {
      let a;
      let grace = 15;
      if (this.pending) {
        a = (await call("getPendingActions", {})).appointments.find((a2) => a2.appointmentId === this.id);
      } else {
        const d = await call("getAdminSchedule", { date: this.date });
        a = d.appointments.find((a2) => a2.appointmentId === this.id);
        grace = d.policy.autoCompleteGraceMin;
      }
      if (!a) throw { code: "APPOINTMENT_NOT_FOUND" };
      this.setData({ item: row(a, grace), history: a.history.map((h) => ({ label: `${h.fromStatus ? statusText[h.fromStatus] : "\u521B\u5EFA\u9884\u7EA6"} \u2192 ${statusText[h.toStatus]}`, reason: h.reason?.startsWith("closure:") ? "\u5E97\u94FA\u4E34\u65F6\u8C03\u6574" : h.reason?.startsWith("reschedule:") ? "\u9884\u7EA6\u65F6\u95F4\u5DF2\u8C03\u6574" : h.reason || "" })) });
    } catch (e) {
      this.setData({ error: friendly(e) });
    } finally {
      this.setData({ loading: false });
    }
  },
  toggleMore() {
    this.setData({ more: !this.data.more });
  },
  reason(e) {
    this.setData({ reason: e.detail.value });
  },
  phone() {
    const phone = this.data.item?.customerPhone;
    if (phone) wx.makePhoneCall({ phoneNumber: phone });
  },
  async exception(e) {
    if (this.data.saving || !this.data.item) return;
    const status = e.currentTarget.dataset.status;
    if (!allowedException(this.data.item.effective, status)) return;
    if (!this.data.reason.trim()) {
      wx.showToast({ title: "\u8BF7\u586B\u5199\u5904\u7406\u539F\u56E0", icon: "none" });
      return;
    }
    this.setData({ saving: true });
    try {
      if (await save("setAppointmentException", { appointmentId: this.id, status, reason: this.data.reason.trim() }, `\u5C06${this.data.item.customerDisplayName}\u7684\u9884\u7EA6\u8BBE\u4E3A\u201C${statusText[status]}\u201D\uFF1F`)) await this.load();
    } catch (e2) {
      this.setData({ error: friendly(e2) });
    } finally {
      this.setData({ saving: false });
    }
  }
};

// miniprogram/pages/admin/manual/index.ts
var weekdayZh = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
var dayLabel = (date) => `${Number(date.slice(5, 7))}/${Number(date.slice(8))} ${weekdayZh[(/* @__PURE__ */ new Date(date + "T12:00:00Z")).getUTCDay()]}`;
var manual_default = {
  data: { ...baseData, customers: [], customerIndex: 0, preferred: "", days: [], slots: [], dayIndex: 0, slotIndex: -1, custom: false, customTime: "", newCustomer: false, newName: "", newPhone: "", customerId: "", note: "", services: [], serviceIndex: 0 },
  onLoad(o) {
    if (o.date) this.setData({ preferred: o.date });
    this.load();
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const first = await getCustomerState();
      const d = await call("getAdminSchedule", { date: first.first });
      const services = d.services.filter((s) => s.isActive);
      this.setData({ services, customers: d.customers || [], serviceIndex: Math.min(this.data.serviceIndex, Math.max(0, services.length - 1)) });
      await this.loadSlots();
    } catch (e) {
      this.setData({ error: friendly(e), services: [], days: [], slots: [] });
    } finally {
      this.setData({ loading: false });
    }
  },
  async loadSlots() {
    const s = this.data.services[Number(this.data.serviceIndex)];
    if (!s) {
      this.setData({ days: [], slots: [] });
      return;
    }
    const keep = this.data.days[this.data.dayIndex]?.date || this.data.preferred;
    const state = await getCustomerState(s.serviceId);
    const days = state.days.filter((day) => day.legalSlots.length).map((day) => ({ date: day.date, label: dayLabel(day.date), slots: day.legalSlots.map((x) => ({ startAt: x.startAt, label: time(x.startAt) })) }));
    try {
      const t = await call("getAdminSchedule", { date: today() });
      const nowStep = Math.ceil(Date.now() / 9e5) * 9e5, len = s.durationMin * 6e4, slots = [];
      for (const f of t.freeIntervals || []) {
        for (let at = Math.max(nowStep, Date.parse(f.startAt)); at + len <= Date.parse(f.endAt); at += 9e5) slots.push({ startAt: new Date(at).toISOString(), label: time(new Date(at).toISOString()) });
      }
      if (slots.length) days.unshift({ date: today(), label: "\u4ECA\u5929", slots });
    } catch {
    }
    const index = Math.max(0, days.findIndex((day) => day.date === keep));
    this.setData({ days, dayIndex: index, slots: days[index]?.slots || [], slotIndex: -1 });
  },
  field(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },
  choose(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },
  async chooseService(e) {
    this.setData({ serviceIndex: Number(e.detail.value) });
    try {
      await this.loadSlots();
    } catch (err) {
      this.setData({ error: friendly(err) });
    }
  },
  chooseDay(e) {
    const dayIndex = Number(e.currentTarget.dataset.index);
    this.setData({ dayIndex, slots: this.data.days[dayIndex]?.slots || [], slotIndex: -1 });
  },
  chooseSlot(e) {
    this.setData({ slotIndex: Number(e.currentTarget.dataset.index), custom: false });
  },
  // The owner may still enter a non-standard start (the server re-checks hours, closures and overlaps).
  toggleCustomer() {
    this.setData({ newCustomer: !this.data.newCustomer });
  },
  nameInput(e) {
    this.data.newName = e.detail.value;
  },
  phoneInput(e) {
    this.data.newPhone = e.detail.value;
  },
  toggleCustom() {
    this.setData({ custom: !this.data.custom, slotIndex: -1 });
  },
  customInput(e) {
    this.data.customTime = e.detail.value;
  },
  async submit() {
    if (this.data.saving) return;
    const s = this.data.services[Number(this.data.serviceIndex)];
    const fresh = this.data.newCustomer, name = this.data.newName.trim(), phone = this.data.newPhone.trim(), digits = phone.replace(/\D/g, "");
    const customer = fresh ? name ? { customerId: "", name } : void 0 : this.data.customers[Number(this.data.customerIndex)];
    if (fresh && phone && (!/^[+\d\s()\-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) {
      wx.showToast({ title: "\u7535\u8BDD\u53F7\u7801\u683C\u5F0F\u4E0D\u5BF9", icon: "none" });
      return;
    }
    const day = this.data.days[this.data.dayIndex];
    const picked = this.data.slots[this.data.slotIndex];
    const custom = this.data.custom && /^([01]\d|2[0-3]):[0-5]\d$/.test(this.data.customTime) ? { label: this.data.customTime } : null;
    const slot = picked || custom;
    if (!s || !customer || !slot) {
      wx.showToast({ title: this.data.custom ? "\u8BF7\u586B\u5199\u5F00\u59CB\u65F6\u95F4\uFF0C\u4F8B\u5982 14:15" : fresh && !name ? "\u8BF7\u586B\u5199\u987E\u5BA2\u59D3\u540D" : "\u8BF7\u9009\u62E9\u670D\u52A1\u3001\u65F6\u95F4\u548C\u987E\u5BA2", icon: "none" });
      return;
    }
    this.setData({ saving: true, error: "" });
    try {
      if (await save("createManualAppointment", { customerId: customer.customerId, ...fresh ? { newCustomerName: name, ...phone ? { phone } : {} } : {}, serviceId: s.serviceId, date: day.date, startTime: slot.label, note: this.data.note.trim() }, `\u4E3A ${customer.name} \u6DFB\u52A0 ${day.label} ${slot.label} \u7684${s.name}\uFF0C\u9884\u8BA1${s.durationMin}\u5206\u949F\uFF1F`)) wx.navigateBack();
    } catch (e) {
      this.setData({ error: friendly(e) });
      await this.loadSlots().catch(() => {
      });
    } finally {
      this.setData({ saving: false });
    }
  }
};

// miniprogram/pages/admin/closure/index.ts
var weekdayZh2 = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var SPAN = 28;
var STEP = 15;
var dayLabel2 = (date) => `${Number(date.slice(5, 7))}/${Number(date.slice(8))} ${weekdayZh2[(/* @__PURE__ */ new Date(date + "T12:00:00Z")).getUTCDay()]}`;
var minutes2 = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
var clock = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
var londonMinutes = (iso) => minutes2(time(iso));
var sameDate = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(iso));
var closure_default = {
  data: { ...baseData, mode: "days", days: [], blanks: [], selected: [], focus: "", cells: [], start: -1, end: -1, summary: "", notice: "", closuresOfFocus: [], cellsReady: false, monthTitle: "" },
  onLoad(o) {
    this.setData({ mode: o.fullDay === "0" ? "hours" : "days", focus: o.date || "" });
    this.load();
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const dates = Array.from({ length: SPAN }, (_, i) => addDays(today(), i));
      const results = new Array(SPAN);
      let next = 0;
      await Promise.all(Array.from({ length: 6 }, async () => {
        while (next < SPAN) {
          const i = next++;
          results[i] = await call("getAdminSchedule", { date: dates[i] });
        }
      }));
      const days = results.map((d, i) => {
        const date = dates[i], weekday2 = (/* @__PURE__ */ new Date(date + "T12:00:00Z")).getUTCDay();
        const hours = d.businessHours.find((h) => h.dayOfWeek === names[weekday2]);
        const closures = d.closures.filter((c) => c.status === "active");
        const bookings = d.appointments.filter((a) => ["booked", "in_progress"].includes(a.status) && Date.parse(a.startAt) > Date.now()).map((a) => ({ startAt: a.startAt, endAt: a.endAt, name: a.customerDisplayName || "\u987E\u5BA2" }));
        return { date, day: String(Number(date.slice(8))), weekday: weekday2, open: !!hours?.isOpen, openTime: hours?.openTime || "10:00", closeTime: hours?.closeTime || "18:00", bookings, closures, fullyClosed: closures.some((c) => c.type === "full_day") };
      });
      const focus = days.some((d) => d.date === this.data.focus) ? this.data.focus : (days.find((d) => d.open && !d.fullyClosed && d.date > today()) || days[0]).date;
      const keep = this.data.selected.filter((s) => days.some((d) => d.date === s && d.open && !d.fullyClosed));
      this.setData({ days: days.map((d) => ({ ...d, label: dayLabel2(d.date) })), blanks: Array.from({ length: (days[0].weekday + 6) % 7 }, (_, i) => i), focus, selected: keep, monthTitle: `${Number(dates[0].slice(5, 7))}\u6708 \u2014 ${Number(dates[SPAN - 1].slice(5, 7))}\u6708` });
      this.refresh();
    } catch (e) {
      this.setData({ error: friendly(e) });
    } finally {
      this.setData({ loading: false });
    }
  },
  // Recompute the calendar badges, the timeline and the summary from the current selection.
  refresh() {
    const d = this.data;
    const focusDay = d.days.find((x) => x.date === d.focus);
    const days = d.days.map((x) => {
      const pick = d.mode === "days" ? d.selected.includes(x.date) : x.date === d.focus;
      const note = !x.open ? "\u56FA\u5B9A\u4F11\u606F" : x.fullyClosed ? "\u5DF2\u5173\u95ED" : x.bookings.length ? `${x.bookings.length} \u4F4D\u987E\u5BA2` : x.closures.length ? "\u90E8\u5206\u5173\u95ED" : "\u8425\u4E1A";
      return { ...x, pick, note, disabled: !x.open || d.mode === "days" && x.fullyClosed, busy: x.bookings.length > 0 };
    });
    let cells = [], summary2 = "", closuresOfFocus = [];
    if (focusDay) {
      closuresOfFocus = focusDay.closures.map((c) => ({ closureId: c.closureId, label: c.type === "full_day" ? `${dayLabel2(focusDay.date)} \u5168\u5929\u4F11\u606F` : `${dayLabel2(focusDay.date)} ${time(c.startAt)}\u2013${time(c.endAt)} \u4F11\u606F` }));
    }
    if (d.mode === "hours" && focusDay && focusDay.open && !focusDay.fullyClosed) {
      const open = minutes2(focusDay.openTime), close = minutes2(focusDay.closeTime), nowMin = focusDay.date === today() ? londonMinutes((/* @__PURE__ */ new Date()).toISOString()) : -1;
      const lo = Math.min(d.start, d.end < 0 ? d.start : d.end), hi = Math.max(d.start, d.end < 0 ? d.start : d.end);
      for (let m = open, i = 0; m < close; m += STEP, i++) {
        const s = m, e = m + STEP;
        const booked = focusDay.bookings.some((b) => londonMinutes(b.startAt) < e && londonMinutes(b.endAt) > s && sameDate(b.startAt) === focusDay.date);
        const closed = focusDay.closures.some((c) => c.type === "partial" && londonMinutes(c.startAt) < e && londonMinutes(c.endAt) > s);
        const state = e <= nowMin ? "past" : closed ? "closed" : d.start >= 0 && i >= lo && i <= hi ? "picked" : booked ? "booked" : "free";
        cells.push({ i, label: m % 60 === 0 ? clock(m) : "", hour: m % 60 === 0, state });
      }
      if (d.start >= 0) {
        const from = open + lo * STEP, to = open + (hi + 1) * STEP;
        const hit = focusDay.bookings.filter((b) => londonMinutes(b.startAt) < to && londonMinutes(b.endAt) > from);
        summary2 = `\u5173\u95ED ${dayLabel2(focusDay.date)} ${clock(from)}\u2013${clock(to)}${hit.length ? ` \xB7 \u5F71\u54CD ${hit.length} \u4F4D\u987E\u5BA2\uFF08${hit.map((h) => h.name).join("\u3001")}\uFF09\uFF0C\u4F1A\u8F6C\u4E3A\u5F85\u6539\u671F` : " \xB7 \u8FD9\u6BB5\u65F6\u95F4\u6CA1\u6709\u9884\u7EA6"}`;
      }
    } else if (d.mode === "days" && d.selected.length) {
      const picked = d.days.filter((x) => d.selected.includes(x.date));
      const n = picked.reduce((t, x) => t + x.bookings.length, 0);
      summary2 = `\u5173\u95ED ${picked.map((x) => dayLabel2(x.date)).join("\u3001")} \u5168\u5929${n ? ` \xB7 \u5F71\u54CD ${n} \u4F4D\u987E\u5BA2\uFF0C\u4F1A\u8F6C\u4E3A\u5F85\u6539\u671F` : " \xB7 \u8FD9\u51E0\u5929\u6CA1\u6709\u9884\u7EA6"}`;
    }
    this.setData({ days, cells, summary: summary2, closuresOfFocus, cellsReady: cells.length > 0 });
  },
  mode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode, start: -1, end: -1, notice: "" });
    this.refresh();
  },
  tapDay(e) {
    const date = String(e.currentTarget.dataset.date);
    const day = this.data.days.find((x) => x.date === date);
    if (!day || !day.open) return;
    if (this.data.mode === "days") {
      if (day.fullyClosed) {
        this.setData({ focus: date });
        this.refresh();
        return;
      }
      const selected = this.data.selected.includes(date) ? this.data.selected.filter((s) => s !== date) : [...this.data.selected, date].sort();
      this.setData({ selected, focus: date, notice: "" });
    } else this.setData({ focus: date, start: -1, end: -1, notice: "" });
    this.refresh();
  },
  // First tap marks the start, second tap the end; a third tap starts a new range.
  tapCell(e) {
    const i = Number(e.currentTarget.dataset.i);
    const cell = this.data.cells[i];
    if (!cell || cell.state === "past" || cell.state === "closed") return;
    if (this.data.start < 0 || this.data.end >= 0) this.setData({ start: i, end: -1 });
    else this.setData({ end: i });
    this.setData({ notice: "" });
    this.refresh();
  },
  clearPick() {
    this.setData({ selected: [], start: -1, end: -1, notice: "" });
    this.refresh();
  },
  async submit() {
    if (this.data.saving || !this.data.summary) return;
    const d = this.data;
    const { confirm } = await wx.showModal({ title: "\u786E\u8BA4\u4F11\u606F\u5B89\u6392", content: d.summary + "\u3002\u5DF2\u6709\u9884\u7EA6\u4E0D\u4F1A\u88AB\u5220\u9664\u3002", confirmText: "\u786E\u8BA4\u5173\u95ED", confirmColor: "#5C669B" });
    if (!confirm) return;
    this.setData({ saving: true, error: "" });
    let done = 0, affected = 0;
    const failed = [];
    try {
      if (d.mode === "days") {
        for (const date of d.selected) {
          try {
            await call("createClosure", { date, type: "full_day" });
            affected += d.days.find((x) => x.date === date)?.bookings.length || 0;
            done++;
          } catch (err) {
            failed.push(dayLabel2(date) + "\uFF1A" + friendly(err));
          }
        }
      } else {
        const focusDay = d.days.find((x) => x.date === d.focus);
        const open = minutes2(focusDay.openTime), lo = Math.min(d.start, d.end < 0 ? d.start : d.end), hi = Math.max(d.start, d.end < 0 ? d.start : d.end);
        const from = open + lo * STEP, to = open + (hi + 1) * STEP;
        try {
          await call("createClosure", { date: d.focus, type: "partial", startTime: clock(from), endTime: clock(to) });
          affected += focusDay.bookings.filter((b) => londonMinutes(b.startAt) < to && londonMinutes(b.endAt) > from).length;
          done++;
        } catch (err) {
          failed.push(friendly(err));
        }
      }
      const what = d.mode === "days" ? `\u5DF2\u5173\u95ED ${done} \u5929` : done ? "\u5DF2\u5173\u95ED\u8FD9\u6BB5\u65F6\u95F4" : "";
      this.setData({ selected: [], start: -1, end: -1, notice: [what && what + (affected ? `\uFF0C${affected} \u4F4D\u987E\u5BA2\u8F6C\u4E3A\u5F85\u6539\u671F\uFF0C\u4ED6\u4EEC\u4F1A\u5728\u300C\u6211\u7684\u9884\u7EA6\u300D\u91CC\u770B\u5230\u63D0\u793A` : ""), failed.length ? "\u672A\u6210\u529F\uFF1A" + failed.join("\uFF1B") : ""].filter(Boolean).join("\u3002") });
      await this.load();
    } finally {
      this.setData({ saving: false });
    }
  },
  async remove(e) {
    if (this.data.saving) return;
    const { confirm } = await wx.showModal({ title: "\u6062\u590D\u8425\u4E1A\uFF1F", content: "\u8FD9\u6BB5\u65F6\u95F4\u4F1A\u91CD\u65B0\u5F00\u653E\u7ED9\u987E\u5BA2\u3002\u4E4B\u524D\u8F6C\u4E3A\u5F85\u6539\u671F\u7684\u9884\u7EA6\u4E0D\u4F1A\u81EA\u52A8\u6062\u590D\uFF0C\u8BF7\u5230\u300C\u5F85\u5904\u7406\u300D\u91CC\u67E5\u770B\u3002", confirmText: "\u6062\u590D\u8425\u4E1A", confirmColor: "#5C669B" });
    if (!confirm) return;
    this.setData({ saving: true });
    try {
      await call("removeClosure", { closureId: e.currentTarget.dataset.id });
      this.setData({ notice: "\u5DF2\u6062\u590D\u8425\u4E1A" });
      await this.load();
    } catch (err) {
      this.setData({ error: friendly(err) });
    } finally {
      this.setData({ saving: false });
    }
  }
};

// miniprogram/pages/admin/hours/index.ts
var labels = { Monday: "\u5468\u4E00", Tuesday: "\u5468\u4E8C", Wednesday: "\u5468\u4E09", Thursday: "\u5468\u56DB", Friday: "\u5468\u4E94", Saturday: "\u5468\u516D", Sunday: "\u5468\u65E5" };
var hours_default = {
  data: { ...baseData, hours: [] },
  onLoad() {
    this.load();
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const d = await call("getAdminSchedule", { date: today() });
      this.setData({ hours: d.businessHours.map((h) => ({ ...h, label: labels[h.dayOfWeek] || h.dayOfWeek })) });
    } catch (e) {
      this.setData({ error: friendly(e), hours: [] });
    } finally {
      this.setData({ loading: false });
    }
  },
  change(e) {
    const { index, field } = e.currentTarget.dataset;
    this.setData({ [`hours[${index}].${field}`]: e.detail.value });
  },
  async submit() {
    if (this.data.saving) return;
    const businessHours = this.data.hours.map(({ label, ...h }) => h);
    if (!businessHours.length || businessHours.some((h) => h.isOpen && h.closeTime <= h.openTime)) {
      wx.showToast({ title: "\u8BF7\u68C0\u67E5\u6BCF\u5929\u7684\u8425\u4E1A\u65F6\u95F4", icon: "none" });
      return;
    }
    this.setData({ saving: true, error: "" });
    try {
      await save("setBusinessHours", { businessHours }, "\u66F4\u65B0\u6BCF\u5468\u8425\u4E1A\u5B89\u6392\uFF1F\u5DF2\u6709\u9884\u7EA6\u7684\u5904\u7406\u7531\u540E\u53F0\u7EDF\u4E00\u68C0\u67E5\uFF0C\u4E34\u65F6\u4F11\u606F\u8BF7\u4F7F\u7528\u201C\u4E34\u65F6\u4F11\u606F\u201D\u3002");
    } catch (e) {
      this.setData({ error: friendly(e) });
    } finally {
      this.setData({ saving: false });
    }
  }
};

// miniprogram/pages/admin/policy/index.ts
var times = Array.from({ length: 35 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
var labels2 = { Monday: "\u5468\u4E00", Tuesday: "\u5468\u4E8C", Wednesday: "\u5468\u4E09", Thursday: "\u5468\u56DB", Friday: "\u5468\u4E94", Saturday: "\u5468\u516D", Sunday: "\u5468\u65E5" };
var policy_default = {
  data: { ...baseData, days: 0, until: "", custom: false, ready: false, hours: [], editing: -1, editOpen: true, openTime: "", closeTime: "", times, openIndex: 0, closeIndex: 0, presets: [{ days: 7, label: "1 \u5468" }, { days: 14, label: "2 \u5468" }, { days: 21, label: "3 \u5468" }] },
  onShow() {
    this.load();
  },
  async load() {
    this.setData({ loading: true, error: "", ready: false });
    try {
      const d = await call("getAdminSchedule", { date: today() });
      this.setData({ days: d.policy.bookingWindowDays || 0, until: d.policy.bookingOpenUntil || addDays(today(), d.policy.bookingWindowDays || 14), custom: !!d.policy.bookingOpenUntil, hours: d.businessHours.map((h) => ({ ...h, label: labels2[h.dayOfWeek] })).sort((a, b) => Object.keys(labels2).indexOf(a.dayOfWeek) - Object.keys(labels2).indexOf(b.dayOfWeek)), ready: true });
    } catch (e) {
      this.setData({ error: friendly(e) });
    } finally {
      this.setData({ loading: false });
    }
  },
  async preset(e) {
    if (this.data.saving) return;
    const days = Number(e.currentTarget.dataset.days);
    this.setData({ saving: true, error: "" });
    try {
      await call("setBookingPolicy", { bookingWindowDays: days });
      this.setData({ days, custom: false, until: addDays(today(), days) });
    } catch (e2) {
      this.setData({ error: friendly(e2) });
    } finally {
      this.setData({ saving: false });
    }
  },
  custom() {
    this.setData({ custom: true });
  },
  date(e) {
    this.setData({ until: String(e.detail.value) });
  },
  async saveDate() {
    if (this.data.saving) return;
    if (this.data.until <= today()) {
      this.setData({ error: "\u8BF7\u9009\u62E9\u660E\u5929\u6216\u4E4B\u540E\u7684\u65E5\u671F" });
      return;
    }
    this.setData({ saving: true, error: "" });
    try {
      if (await save("setBookingPolicy", { bookingOpenUntil: this.data.until }, "\u5F00\u653E\u9884\u7EA6\u81F3 " + this.data.until + "\uFF1F")) await this.load();
    } catch (e) {
      this.setData({ error: friendly(e) });
    } finally {
      this.setData({ saving: false });
    }
  },
  edit(e) {
    const i = Number(e.currentTarget.dataset.index), h = this.data.hours[i];
    const openTime = h.openTime || "10:00", closeTime = h.closeTime || "18:00";
    this.setData({ editing: i, editOpen: h.isOpen, openTime, closeTime, openIndex: Math.max(0, times.indexOf(openTime)), closeIndex: Math.max(0, times.indexOf(closeTime)) });
  },
  toggle(e) {
    this.setData({ editOpen: e.detail.value });
  },
  clock(e) {
    const field = String(e.currentTarget.dataset.field), i = Number(e.detail.value);
    this.setData({ [field]: times[i], [field === "openTime" ? "openIndex" : "closeIndex"]: i });
  },
  async rest() {
    this.setData({ editOpen: false });
    await this.saveHours();
  },
  async saveHours() {
    if (this.data.saving || this.data.editing < 0) return;
    if (this.data.editOpen && this.data.openTime >= this.data.closeTime) {
      this.setData({ error: "\u7ED3\u675F\u65F6\u95F4\u987B\u665A\u4E8E\u5F00\u59CB\u65F6\u95F4" });
      return;
    }
    this.setData({ saving: true, error: "" });
    try {
      const hours = this.data.hours.map(({ label, ...h }, i) => i === this.data.editing ? { ...h, isOpen: this.data.editOpen, openTime: this.data.openTime, closeTime: this.data.closeTime } : h);
      const check = await call("setBusinessHours", { businessHours: hours, dryRun: true });
      if (check.affected.length) {
        const answer = await wx.showModal({ title: "\u6709 " + check.affected.length + " \u4E2A\u9884\u7EA6\u5728\u65B0\u8425\u4E1A\u65F6\u95F4\u4E4B\u5916", content: "\u5DF2\u6709\u9884\u7EA6\u5C06\u4FDD\u7559\uFF0C\u8BF7\u6309\u539F\u7EA6\u63A5\u5F85\uFF1B\u5982\u9700\u53D8\u66F4\uFF0C\u8BF7\u518D\u4F7F\u7528\u4E34\u65F6\u8C03\u6574\u8054\u7CFB\u987E\u5BA2\u3002\u662F\u5426\u4FDD\u7559\u8FD9\u4E9B\u9884\u7EA6\u5E76\u4FDD\u5B58\uFF1F" });
        if (!answer.confirm) return;
      }
      const result = await call("setBusinessHours", { businessHours: hours, confirmExisting: true });
      if (!result.saved) throw { code: "SLOT_INVALID" };
      this.setData({ editing: -1 });
      await this.load();
    } catch (e) {
      this.setData({ error: friendly(e) });
    } finally {
      this.setData({ saving: false });
    }
  },
  closeEditor() {
    this.setData({ editing: -1 });
  },
  adjust(e) {
    wx.navigateTo({ url: "/pages/admin/closure/index?fullDay=" + e.currentTarget.dataset.full });
  }
};

// miniprogram/pages/admin/services/index.ts
var services_default = {
  data: { ...baseData, services: [], editing: false, serviceId: "", name: "", duration: "30", active: true, order: 0 },
  onLoad() {
    this.load();
  },
  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },
  async load() {
    this.setData({ loading: true, error: "" });
    try {
      const d = await call("getAdminSchedule", { date: today() });
      this.setData({ services: d.services.sort((a, b) => a.displayOrder - b.displayOrder) });
    } catch (e) {
      this.setData({ error: friendly(e), services: [] });
    } finally {
      this.setData({ loading: false });
    }
  },
  edit(e) {
    const s = this.data.services.find((s2) => s2.serviceId === e.currentTarget.dataset.id);
    this.setData({ editing: true, serviceId: s?.serviceId || "", name: s?.name || "", duration: String(s?.durationMin || 30), active: s?.isActive ?? true, order: s?.displayOrder ?? this.data.services.length });
  },
  field(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },
  toggle(e) {
    this.setData({ active: e.detail.value });
  },
  cancel() {
    this.setData({ editing: false });
  },
  async submit() {
    if (this.data.saving) return;
    const durationMin = Number(this.data.duration);
    if (!this.data.name.trim() || !Number.isInteger(durationMin) || durationMin <= 0) {
      wx.showToast({ title: "\u8BF7\u586B\u5199\u540D\u79F0\u548C\u6709\u6548\u65F6\u957F", icon: "none" });
      return;
    }
    this.setData({ saving: true, error: "" });
    try {
      if (await save("upsertService", { ...this.data.serviceId ? { serviceId: this.data.serviceId } : {}, name: this.data.name.trim(), durationMin, isActive: this.data.active, displayOrder: Number(this.data.order) }, "\u4FDD\u5B58\u670D\u52A1\u9879\u76EE\uFF1F\u65B0\u7684\u65F6\u957F\u53EA\u7528\u4E8E\u65B0\u9884\u7EA6\uFF0C\u5DF2\u6709\u9884\u7EA6\u4FDD\u7559\u539F\u65F6\u957F\u3002")) {
        this.setData({ editing: false });
        await this.load();
      }
    } catch (e) {
      this.setData({ error: friendly(e) });
    } finally {
      this.setData({ saving: false });
    }
  }
};

// web/generated/pages.js
var pages = { "pages/customer/book/index": { definition: book_default, title: "\u7406\u53D1\u9884\u7EA6" }, "pages/customer/mine/index": { definition: mine_default, title: "\u6211\u7684\u9884\u7EA6" }, "pages/admin/today/index": { definition: today_default, title: "\u4ECA\u65E5\u9884\u7EA6" }, "pages/admin/schedule/index": { definition: schedule_default, title: "\u65E5\u7A0B" }, "pages/admin/pending/index": { definition: pending_default, title: "\u5F85\u5904\u7406" }, "pages/admin/settings/index": { definition: settings_default, title: "\u66F4\u591A" }, "pages/admin/detail/index": { definition: detail_default, title: "\u9884\u7EA6\u8BE6\u60C5" }, "pages/admin/manual/index": { definition: manual_default, title: "\u6DFB\u52A0\u9884\u7EA6" }, "pages/admin/closure/index": { definition: closure_default, title: "\u4E34\u65F6\u4F11\u606F" }, "pages/admin/hours/index": { definition: hours_default, title: "\u8425\u4E1A\u65F6\u95F4" }, "pages/admin/policy/index": { definition: policy_default, title: "\u5F00\u653E\u9884\u7EA6" }, "pages/admin/services/index": { definition: services_default, title: "\u670D\u52A1\u9879\u76EE" } };
var templates = { "pages/customer/book/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "customer-page" }, children: [{ text: "\n  " }, { tag: "view", attrs: { "class": "customer-top" }, children: [{ tag: "view", attrs: { "wx:if": (d) => d.shop.name, "class": "customer-kicker" }, children: [{ text: (d) => d.shop.name }] }, { tag: "view", attrs: { "class": "customer-title" }, children: [{ text: "\u9009\u62E9\u5230\u5E97\u65F6\u95F4" }] }] }, { text: "\n  " }, { tag: "view", attrs: { "wx:if": (d) => d.error, "class": "customer-error" }, children: [{ text: (d) => d.error }, { tag: "button", attrs: { "bindtap": "load" }, children: [{ text: "\u91CD\u65B0\u52A0\u8F7D" }] }] }, { text: "\n  " }, { tag: "view", attrs: { "wx:if": (d) => d.notice, "class": "customer-notice" }, children: [{ text: (d) => d.notice }] }, { text: "\n  " }, { tag: "view", attrs: { "wx:if": (d) => d.editingId, "class": "customer-notice" }, children: [{ text: "\u8BF7\u9009\u62E9\u65B0\u65F6\u95F4\uFF0C\u786E\u8BA4\u6210\u529F\u524D\u539F\u9884\u7EA6\u4FDD\u7559\u3002" }] }, { text: "\n  " }, { tag: "view", attrs: { "class": "customer-steps" }, children: [{ tag: "text", attrs: { "class": (d) => "customer-step " + String(((d2) => d2.stage === "home" ? "active" : "")(d) ?? "") }, children: [{ text: "1 \u670D\u52A1\u4E0E\u65E5\u671F" }] }, { tag: "text", attrs: { "class": "customer-step-sep" }, children: [{ text: "\u203A" }] }, { tag: "text", attrs: { "class": (d) => "customer-step " + String(((d2) => d2.stage === "day" ? "active" : "")(d) ?? "") }, children: [{ text: "2 \u65F6\u95F4" }] }, { tag: "text", attrs: { "class": "customer-step-sep" }, children: [{ text: "\u203A" }] }, { tag: "text", attrs: { "class": (d) => "customer-step " + String(((d2) => d2.stage === "confirm" ? "active" : "")(d) ?? "") }, children: [{ text: "3 \u786E\u8BA4" }] }] }, { text: "\n  " }, { tag: "block", attrs: { "wx:if": (d) => d.stage === "home" }, children: [{ text: "\n    " }, { tag: "view", attrs: { "class": "customer-section" }, children: [{ tag: "view", attrs: { "class": "customer-heading" }, children: [{ text: "\u9009\u62E9\u670D\u52A1" }] }, { tag: "view", attrs: { "class": "customer-service-grid" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.services, "wx:key": "id", "data-id": (d) => d.item.id, "bindtap": "selectService", "disabled": (d) => !!d.editingId || d.loading, "class": (d) => "customer-service " + String(((d2) => d2.item.selected ? "selected" : "")(d) ?? "") }, children: [{ tag: "text", attrs: {}, children: [{ text: (d) => d.item.name }] }, { tag: "text", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.item.duration)(d) ?? "") + " \u5206\u949F" }] }] }] }] }, { text: "\n    " }, { tag: "button", attrs: { "wx:if": (d) => d.earliest, "class": "customer-earliest", "bindtap": "openEarliest" }, children: [{ tag: "view", attrs: {}, children: [{ tag: "text", attrs: { "class": "small" }, children: [{ text: "\u6700\u65E9\u53EF\u7EA6" }] }, { tag: "text", attrs: { "class": "customer-strong" }, children: [{ text: (d) => d.earliest }] }] }, { tag: "text", attrs: {}, children: [{ text: "\u2192" }] }] }, { text: "\n    " }, { tag: "view", attrs: { "class": "customer-section" }, children: [{ tag: "view", attrs: { "class": "customer-row" }, children: [{ tag: "view", attrs: { "class": "customer-heading" }, children: [{ text: "\u9009\u62E9\u65E5\u671F" }] }, { tag: "text", attrs: { "class": "small" }, children: [{ text: (d) => "\u5F00\u653E\u81F3 " + String(((d2) => d2.until)(d) ?? "") }] }] }, { tag: "view", attrs: { "class": "customer-segment" }, children: [{ tag: "button", attrs: { "data-mode": "date", "bindtap": "selectMode", "class": (d) => d.mode === "date" ? "selected" : "" }, children: [{ text: "\u6309\u65E5\u671F\u627E" }] }, { tag: "button", attrs: { "data-mode": "time", "bindtap": "selectMode", "class": (d) => d.mode === "time" ? "selected" : "" }, children: [{ text: "\u6309\u56FA\u5B9A\u65F6\u95F4\u627E" }] }] }, { tag: "picker", attrs: { "wx:if": (d) => d.mode === "time", "range": (d) => d.availableTimes, "bindchange": "selectPreferred" }, children: [{ tag: "view", attrs: { "class": "customer-time-filter" }, children: [{ text: (d) => "\u6307\u5B9A\u65F6\u95F4 " + String(((d2) => d2.preferred)(d) ?? "") + "\u3000\u2304" }] }] }, { tag: "view", attrs: { "class": "customer-month-title" }, children: [{ text: (d) => d.monthLabel }] }, { tag: "view", attrs: { "class": "customer-weekdays" }, children: [{ tag: "text", attrs: { "wx:for": (d) => d.weekdays, "wx:key": "*this" }, children: [{ text: (d) => d.item }] }] }, { tag: "view", attrs: { "class": "customer-days" }, children: [{ tag: "block", attrs: { "wx:for": (d) => d.days, "wx:key": "date" }, children: [{ tag: "view", attrs: { "wx:if": (d) => d.item.placeholder, "class": "customer-date-spacer" }, children: [] }, { tag: "button", attrs: { "wx:else": "", "class": (d) => "customer-date " + String(((d2) => d2.item.available ? "" : "disabled")(d) ?? "") + " " + String(((d2) => d2.item.selected ? "selected" : "")(d) ?? ""), "data-date": (d) => d.item.date, "bindtap": "openDate", "disabled": (d) => !d.item.available || d.loading }, children: [{ tag: "text", attrs: { "class": "customer-date-number" }, children: [{ text: (d) => d.item.number }] }, { tag: "text", attrs: { "class": "small" }, children: [{ text: (d) => d.item.status }] }] }] }] }] }, { text: "\n  " }] }, { text: "\n  " }, { tag: "block", attrs: { "wx:elif": (d) => d.stage === "day" }, children: [{ tag: "button", attrs: { "class": "customer-back", "bindtap": "back" }, children: [{ text: "\u2039 \u8FD4\u56DE\u65E5\u671F" }] }, { tag: "view", attrs: { "class": "customer-section" }, children: [{ tag: "view", attrs: { "class": "customer-heading" }, children: [{ text: (d) => d.activeDateLabel }] }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.serviceName)(d) ?? "") + " \xB7 " + String(((d2) => d2.duration)(d) ?? "") + " \u5206\u949F" }] }] }, { tag: "view", attrs: { "class": "customer-section" }, children: [{ tag: "view", attrs: { "class": "customer-row" }, children: [{ tag: "view", attrs: { "class": "customer-heading" }, children: [{ text: "\u9009\u62E9\u5F00\u59CB\u65F6\u95F4" }] }, { tag: "text", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.slots.length)(d) ?? "") + " \u4E2A\u53EF\u9009" }] }] }, { tag: "view", attrs: { "class": "customer-slots" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.slots, "wx:key": "startAt", "data-start": (d) => d.item.startAt, "bindtap": "chooseSlot", "class": (d) => "customer-slot " + String(((d2) => d2.item.selected ? "selected" : "")(d) ?? "") }, children: [{ text: (d) => d.item.label }, { tag: "text", attrs: { "wx:if": (d) => d.item.recommended, "class": "small" }, children: [{ text: "\u63A8\u8350" }] }] }] }, { tag: "view", attrs: { "wx:if": (d) => !d.slots.length, "class": "customer-empty" }, children: [{ text: "\u6682\u65E0\u5339\u914D\u65F6\u6BB5\uFF0C\u8BF7\u8FD4\u56DE\u66F4\u6362\u65E5\u671F\u3002" }] }] }, { tag: "button", attrs: { "class": "customer-primary", "bindtap": "review", "disabled": (d) => !d.selected || d.loading }, children: [{ text: "\u4E0B\u4E00\u6B65" }] }] }, { text: "\n  " }, { tag: "block", attrs: { "wx:else": "" }, children: [{ tag: "button", attrs: { "class": "customer-back", "bindtap": "back" }, children: [{ text: "\u2039 \u8FD4\u56DE\u65F6\u95F4" }] }, { tag: "view", attrs: { "class": "customer-section" }, children: [{ tag: "view", attrs: { "class": "customer-heading" }, children: [{ text: (d) => d.editingId ? "\u6838\u5BF9\u65B0\u7684\u9884\u7EA6\u65F6\u95F4" : "\u6700\u540E\u6838\u5BF9\u4E00\u4E0B" }] }, { tag: "view", attrs: { "class": "customer-ticket" }, children: [{ tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => d.activeDateLabel }] }, { tag: "view", attrs: { "class": "customer-ticket-time" }, children: [{ text: (d) => d.selectedLabel }] }, { tag: "view", attrs: {}, children: [{ text: (d) => "" + String(((d2) => d2.serviceName)(d) ?? "") + " \xB7 " + String(((d2) => d2.duration)(d) ?? "") + " \u5206\u949F" }] }] }, { tag: "view", attrs: { "wx:if": (d) => d.shop.address || d.shop.phone, "class": "customer-shop" }, children: [{ tag: "view", attrs: { "wx:if": (d) => d.shop.address }, children: [{ tag: "text", attrs: { "class": "customer-label" }, children: [{ text: "\u5730\u5740" }] }, { tag: "text", attrs: {}, children: [{ text: (d) => d.shop.address }] }] }, { tag: "view", attrs: { "wx:if": (d) => d.shop.phone, "bindtap": "callShop" }, children: [{ tag: "text", attrs: { "class": "customer-label" }, children: [{ text: "\u7535\u8BDD" }] }, { tag: "text", attrs: { "class": "customer-link-text" }, children: [{ text: (d) => d.shop.phone }] }] }] }, { tag: "view", attrs: { "wx:if": (d) => !d.editingId, "class": "customer-phone" }, children: [{ tag: "text", attrs: { "class": "customer-label" }, children: [{ text: "\u7535\u8BDD\uFF08\u9009\u586B\uFF09" }] }, { tag: "input", attrs: { "type": "tel", "value": (d) => d.phone, "bindinput": "phoneInput", "maxlength": "25", "placeholder": "\u65B9\u4FBF\u5E97\u91CC\u6709\u53D8\u52A8\u65F6\u8054\u7CFB\u4F60" }, children: [] }] }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => d.editingId ? "\u786E\u8BA4\u6210\u529F\u540E\uFF0C\u539F\u65F6\u95F4\u624D\u4F1A\u91CA\u653E\u3002" : "\u5982\u8BA1\u5212\u6709\u53D8\uFF0C\u53EF\u5728\u300C\u6211\u7684\u9884\u7EA6\u300D\u4FEE\u6539\u6216\u53D6\u6D88\u3002" }] }] }, { tag: "customer-auth", attrs: {}, children: [] }, { tag: "button", attrs: { "class": "customer-primary", "bindtap": "submit", "disabled": (d) => d.saving || !d.selected }, children: [{ text: (d) => d.saving ? "\u6B63\u5728\u63D0\u4EA4\u2026" : d.editingId ? "\u786E\u8BA4\u6539\u671F" : "\u786E\u8BA4\u9884\u7EA6" }] }] }, { text: "\n" }] }, { text: "\n" }] }, "pages/customer/mine/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "customer-page" }, children: [{ tag: "view", attrs: { "class": "customer-top" }, children: [{ tag: "view", attrs: { "wx:if": (d) => d.shop.name, "class": "customer-kicker" }, children: [{ text: (d) => d.shop.name }] }, { tag: "view", attrs: { "class": "customer-title" }, children: [{ text: "\u6211\u7684\u9884\u7EA6" }] }] }, { tag: "view", attrs: { "wx:if": (d) => d.notice, "class": "customer-notice" }, children: [{ text: (d) => d.notice }] }, { tag: "view", attrs: { "wx:if": (d) => d.error, "class": "customer-error" }, children: [{ text: (d) => d.error }, { tag: "button", attrs: { "bindtap": "load" }, children: [{ text: "\u91CD\u65B0\u52A0\u8F7D" }] }] }, { tag: "view", attrs: { "wx:if": (d) => d.shop.address || d.shop.phone, "class": "customer-shop" }, children: [{ tag: "view", attrs: { "wx:if": (d) => d.shop.address }, children: [{ tag: "text", attrs: { "class": "customer-label" }, children: [{ text: "\u5730\u5740" }] }, { tag: "text", attrs: {}, children: [{ text: (d) => d.shop.address }] }] }, { tag: "view", attrs: { "wx:if": (d) => d.shop.phone, "bindtap": "callShop" }, children: [{ tag: "text", attrs: { "class": "customer-label" }, children: [{ text: "\u7535\u8BDD" }] }, { tag: "text", attrs: { "class": "customer-link-text" }, children: [{ text: (d) => d.shop.phone }] }] }] }, { tag: "customer-auth", attrs: {}, children: [] }, { tag: "view", attrs: { "class": "customer-row customer-section" }, children: [{ tag: "view", attrs: { "class": "customer-heading" }, children: [{ text: "\u9884\u7EA6\u8BB0\u5F55" }] }, { tag: "button", attrs: { "class": "customer-link", "bindtap": "newBooking" }, children: [{ text: "\u518D\u7EA6\u4E00\u6B21 \u2192" }] }] }, { tag: "view", attrs: { "wx:if": (d) => !d.rows.length && !d.loading, "class": "customer-empty" }, children: [{ text: "\u8FD8\u6CA1\u6709\u9884\u7EA6\u3002\u9009\u597D\u670D\u52A1\u548C\u65F6\u95F4\uFF0C\u5C31\u53EF\u4EE5\u9884\u7EA6\u4E86\u3002" }] }, { tag: "view", attrs: { "wx:for": (d) => d.rows, "wx:key": "id", "class": "customer-appointment" }, children: [{ tag: "view", attrs: { "class": "customer-row" }, children: [{ tag: "text", attrs: { "class": "customer-heading" }, children: [{ text: (d) => d.item.date }] }, { tag: "text", attrs: { "class": "customer-status" }, children: [{ text: (d) => d.item.status }] }] }, { tag: "view", attrs: { "class": "customer-appointment-time" }, children: [{ text: (d) => d.item.time }] }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.item.service)(d) ?? "") + " \xB7 " + String(((d2) => d2.item.duration)(d) ?? "") + " \u5206\u949F" }] }, { tag: "view", attrs: { "class": "small booking-reference" }, children: [{ text: (d) => "\u9884\u7EA6\u7F16\u53F7\uFF1A" + String(((d2) => d2.item.ref)(d) ?? "") }] }, { tag: "view", attrs: { "wx:if": (d) => d.item.pending, "class": "customer-notice" }, children: [{ text: "\u5E97\u94FA\u8425\u4E1A\u65F6\u95F4\u6709\u53D8\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u65F6\u95F4\u3002" }] }, { tag: "view", attrs: { "wx:if": (d) => d.item.canChange, "class": "customer-actions" }, children: [{ tag: "button", attrs: { "bindtap": "edit", "data-id": (d) => d.item.id, "data-service": (d) => d.item.serviceId }, children: [{ text: (d) => d.item.pending ? "\u91CD\u65B0\u9009\u65F6\u95F4" : "\u4FEE\u6539\u65F6\u95F4" }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "cancel", "data-id": (d) => d.item.id }, children: [{ text: "\u53D6\u6D88\u9884\u7EA6" }] }] }] }] }, { text: "\n" }] }, "pages/admin/today/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "admin-nav", attrs: { "current": "today" }, children: [] }, { text: "\n" }, { tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { tag: "view", attrs: { "class": "eyebrow" }, children: [{ text: (d) => d.dateTitle }] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u4ECA\u5929" }] }, { text: "\n" }, { tag: "block", attrs: { "wx:if": (d) => !d.error }, children: [{ tag: "view", attrs: { "wx:if": (d) => d.overview, "class": "overview-card" }, children: [{ tag: "view", attrs: { "class": "overview-head" }, children: [{ tag: "view", attrs: {}, children: [{ tag: "view", attrs: { "class": "overview-kicker" }, children: [{ text: "\u4ECA\u5929\u6574\u4F53\u5B89\u6392" }] }, { tag: "view", attrs: { "class": "overview-title" }, children: [{ text: (d) => "\u4ECA\u5929\u5171 " + String(((d2) => d2.counts.total)(d) ?? "") + " \u4F4D\u5BA2\u4EBA" }] }] }, { tag: "view", attrs: { "class": (d) => "overview-status " + String(((d2) => d2.statusClass)(d) ?? "") }, children: [{ text: (d) => d.statusText }] }] }, { tag: "view", attrs: { "class": "overview-open" }, children: [{ text: (d) => "\u8FD8\u8981\u63A5\u5F85 " + String(((d2) => d2.counts.remaining)(d) ?? "") + " \u4F4D \xB7 \u8425\u4E1A " + String(((d2) => d2.overview.openLabel)(d) ?? "") }] }, { tag: "view", attrs: { "class": "overview-metrics" }, children: [{ tag: "view", attrs: {}, children: [{ tag: "view", attrs: { "class": "overview-label" }, children: [{ text: "\u4ECA\u5929\u8FD8\u7A7A" }] }, { tag: "view", attrs: { "class": "overview-number" }, children: [{ text: (d) => d.freeLeft }] }, { tag: "view", attrs: { "class": "overview-label" }, children: [{ text: "\u4ECE\u73B0\u5728\u5230\u6253\u70CA" }] }] }, { tag: "view", attrs: {}, children: [{ tag: "view", attrs: { "class": "overview-label" }, children: [{ text: "\u4E0B\u4E00\u4E2A\u7A7A\u6863" }] }, { tag: "view", attrs: { "class": "overview-number" }, children: [{ text: (d) => d.nextFree || "\u2014" }] }, { tag: "view", attrs: { "class": "overview-label" }, children: [{ text: (d) => d.nextFree ? "\u53EF\u4EE5\u63A5\u4E34\u65F6\u5BA2\u4EBA" : "\u4ECA\u5929\u6CA1\u6709\u7A7A\u6863\u4E86" }] }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "grid" }, children: [{ tag: "button", attrs: { "bindtap": "add" }, children: [{ text: "\uFF0B \u6DFB\u52A0\u9884\u7EA6" }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "adjust" }, children: [{ text: "\u4E34\u65F6\u8C03\u6574\u4ECA\u5929" }] }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { text: "\n" }, { tag: "button", attrs: { "wx:if": (d) => d.pendingCount, "class": "attention", "bindtap": "goPending" }, children: [{ text: (d) => "\u6709 " + String(((d2) => d2.pendingCount)(d) ?? "") + " \u4F4D\u987E\u5BA2\u5F85\u6539\u671F\uFF0C\u53BB\u5904\u7406\u3000\u203A" }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.current, "class": "card hero" }, children: [{ tag: "view", attrs: {}, children: [{ text: "\u5F53\u524D\u6B63\u5728\u670D\u52A1" }] }, { tag: "view", attrs: { "class": "time" }, children: [{ text: (d) => "" + String(((d2) => d2.current.startLabel)(d) ?? "") + "\u2013" + String(((d2) => d2.current.endLabel)(d) ?? "") }] }, { tag: "view", attrs: {}, children: [{ text: (d) => "" + String(((d2) => d2.current.serviceNameSnapshot)(d) ?? "") + " \xB7 " + String(((d2) => d2.current.customerDisplayName)(d) ?? "") }] }, { tag: "button", attrs: { "bindtap": "openDetail", "data-id": (d) => d.current.appointmentId, "data-date": (d) => d.date }, children: [{ text: "\u67E5\u770B\u9884\u7EA6" }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "section" }, children: [{ text: "\u4E0B\u4E00\u4F4D\u987E\u5BA2" }] }, { tag: "view", attrs: { "wx:if": (d) => d.next, "class": "card" }, children: [{ tag: "view", attrs: { "class": "title" }, children: [{ text: (d) => d.next.startLabel }] }, { tag: "view", attrs: {}, children: [{ text: (d) => "" + String(((d2) => d2.next.customerDisplayName)(d) ?? "") + " \xB7 " + String(((d2) => d2.next.serviceNameSnapshot)(d) ?? "") }] }] }, { tag: "view", attrs: { "wx:elif": (d) => !d.loading, "class": "card" }, children: [{ text: "\u4ECA\u5929\u6CA1\u6709\u540E\u7EED\u9884\u7EA6" }] }, { text: "\n" }, { tag: "view", attrs: { "class": "section" }, children: [{ text: "\u4ECA\u5929\u5269\u4F59\u9884\u7EA6" }] }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "wx:for": (d) => d.rows, "wx:key": "appointmentId", "class": "appointment row", "bindtap": "openDetail", "data-id": (d) => d.item.appointmentId, "data-date": (d) => d.date }, children: [{ tag: "text", attrs: { "class": "clock" }, children: [{ text: (d) => d.item.startLabel }] }, { tag: "view", attrs: { "class": "grow" }, children: [{ tag: "view", attrs: {}, children: [{ text: (d) => d.item.serviceNameSnapshot }] }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.item.customerDisplayName)(d) ?? "") + " \xB7 " + String(((d2) => d2.item.durationMinSnapshot)(d) ?? "") + " \u5206\u949F" }] }] }, { tag: "text", attrs: {}, children: [{ text: "\u203A" }] }] }, { tag: "view", attrs: { "wx:if": (d) => !d.rows.length, "class": "muted" }, children: [{ text: "\u6682\u65E0\u540E\u7EED\u9884\u7EA6" }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "section" }, children: [{ text: "\u4ECA\u5929\u7A7A\u95F2\u65F6\u95F4" }] }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "wx:for": (d) => d.free, "wx:key": "*this" }, children: [{ text: (d) => d.item }] }, { tag: "view", attrs: { "wx:if": (d) => !d.free.length, "class": "muted" }, children: [{ text: "\u6682\u65E0\u5269\u4F59\u7A7A\u95F2" }] }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u6B63\u5E38\u9884\u7EA6\u81EA\u52A8\u5B8C\u6210\uFF0C\u65E0\u9700\u9010\u5355\u786E\u8BA4\u3002" }] }] }] }, { text: "\n" }] }, "pages/admin/schedule/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "admin-nav", attrs: { "current": "schedule" }, children: [] }, { text: "\n" }, { tag: "view", attrs: { "class": "page calendar-page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { text: "\n" }, { tag: "view", attrs: { "class": "row calendar-heading" }, children: [{ tag: "view", attrs: {}, children: [{ tag: "view", attrs: { "class": "eyebrow" }, children: [{ text: "\u5E97\u94FA\u65E5\u7A0B" }] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u65E5\u7A0B\u5B89\u6392" }] }] }, { tag: "button", attrs: { "class": "calendar-add", "bindtap": "add" }, children: [{ text: "\uFF0B" }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "calendar-panel" }, children: [{ tag: "view", attrs: { "class": "row" }, children: [{ tag: "button", attrs: { "class": "month-toggle", "bindtap": "toggleCalendar" }, children: [{ text: (d) => "" + String(((d2) => d2.monthTitle)(d) ?? "") + " " + String(((d2) => d2.expanded ? "\u2303" : "\u2304")(d) ?? "") }] }, { tag: "button", attrs: { "class": "today-pill", "bindtap": "goToday" }, children: [{ text: "\u4ECA\u5929" }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "week-strip" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.week, "wx:key": "date", "class": (d) => "date-pill " + String(((d2) => d2.item.selected ? "selected" : "")(d) ?? ""), "bindtap": "openDay", "data-date": (d) => d.item.date }, children: [{ tag: "text", attrs: { "class": "week-letter" }, children: [{ text: (d) => d.item.weekday }] }, { tag: "text", attrs: { "class": "day-number" }, children: [{ text: (d) => d.item.day }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.expanded, "class": "month-grid" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.month, "wx:key": "date", "class": (d) => "month-day " + String(((d2) => d2.item.selected ? "selected" : "")(d) ?? "") + " " + String(((d2) => d2.item.dim ? "dim" : "")(d) ?? ""), "bindtap": "openDay", "data-date": (d) => d.item.date }, children: [{ text: (d) => d.item.day }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "row week-controls" }, children: [{ tag: "button", attrs: { "bindtap": "shift", "data-days": "-7" }, children: [{ text: "\u2039 \u4E0A\u4E00\u5468" }] }, { tag: "picker", attrs: { "mode": "date", "value": (d) => d.date, "bindchange": "choose" }, children: [{ tag: "view", attrs: {}, children: [{ text: (d) => d.date }] }] }, { tag: "button", attrs: { "bindtap": "shift", "data-days": "7" }, children: [{ text: "\u4E0B\u4E00\u5468 \u203A" }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "row day-heading" }, children: [{ tag: "view", attrs: {}, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: (d) => d.dateTitle }] }, { tag: "text", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.count)(d) ?? "") + " \u4F4D\u987E\u5BA2 \xB7 " + String(((d2) => d2.status)(d) ?? "") }] }] }, { tag: "button", attrs: { "class": "today-pill", "bindtap": "adjust" }, children: [{ text: "\u8C03\u6574\u8425\u4E1A" }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:for": (d) => d.closures, "wx:key": "closureId", "class": "notice" }, children: [{ text: (d) => "" + String(((d2) => d2.item.label)(d) ?? "") + " \u5DF2\u5173\u95ED" }, { tag: "button", attrs: { "wx:if": (d) => d.item.canRemove, "class": "secondary", "bindtap": "remove", "data-id": (d) => d.item.closureId, "disabled": (d) => d.saving }, children: [{ text: "\u6062\u590D\u8FD9\u6BB5\u8425\u4E1A" }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => !d.timeline.length && !d.loading, "class": "calendar-empty" }, children: [{ text: "\u8FD9\u4E00\u5929\u6CA1\u6709\u5DF2\u5B89\u6392\u7684\u9884\u7EA6" }, { tag: "view", attrs: { "class": "small" }, children: [{ text: "\u53EF\u4EE5\u6DFB\u52A0\u9884\u7EA6\uFF0C\u6216\u9009\u62E9\u5176\u4ED6\u65E5\u671F\u67E5\u770B" }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "time-canvas", "style": (d) => "height:" + String(((d2) => d2.height)(d) ?? "") + "rpx" }, children: [{ tag: "view", attrs: { "wx:for": (d) => d.ticks, "wx:key": "label", "class": "time-tick", "style": (d) => "top:" + String(((d2) => d2.item.top)(d) ?? "") + "rpx" }, children: [{ tag: "text", attrs: {}, children: [{ text: (d) => d.item.label }] }, { tag: "view", attrs: { "class": "time-rule" }, children: [] }] }, { tag: "view", attrs: { "wx:for": (d) => d.blocks, "wx:key": "id", "class": "time-event closure-block", "style": (d) => "top:" + String(((d2) => d2.item.top)(d) ?? "") + "rpx;height:" + String(((d2) => d2.item.height)(d) ?? "") + "rpx" }, children: [{ tag: "view", attrs: { "class": "event-title" }, children: [{ text: "\u4E34\u65F6\u4F11\u606F" }] }, { tag: "view", attrs: { "class": "event-caption" }, children: [{ text: (d) => d.item.label }] }] }, { tag: "view", attrs: { "wx:for": (d) => d.timeline, "wx:key": "id", "class": (d) => "time-event " + String(((d2) => d2.item.tone)(d) ?? ""), "style": (d) => "top:" + String(((d2) => d2.item.top)(d) ?? "") + "rpx;height:" + String(((d2) => d2.item.height)(d) ?? "") + "rpx", "bindtap": "openDetail", "data-id": (d) => d.item.id, "data-date": (d) => d.date }, children: [{ tag: "view", attrs: { "class": "event-title" }, children: [{ text: (d) => "" + String(((d2) => d2.item.title)(d) ?? "") + " " }, { tag: "text", attrs: { "class": "event-time" }, children: [{ text: (d) => d.item.label }] }] }, { tag: "view", attrs: { "class": "event-caption" }, children: [{ text: (d) => "" + String(((d2) => d2.item.name)(d) ?? "") + " \xB7 " + String(((d2) => d2.item.status)(d) ?? "") }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "section" }, children: [{ text: "\u5168\u90E8\u9884\u7EA6\u8BB0\u5F55" }] }, { tag: "input", attrs: { "class": "calendar-search", "placeholder": "\u641C\u7D22\u987E\u5BA2\u3001\u670D\u52A1\u6216\u9884\u7EA6\u7F16\u53F7", "value": (d) => d.query, "bindinput": "search" }, children: [] }, { tag: "view", attrs: { "wx:for": (d) => d.rows, "wx:key": "appointmentId", "class": "appointment row", "bindtap": "openDetail", "data-id": (d) => d.item.appointmentId, "data-date": (d) => d.date }, children: [{ tag: "text", attrs: {}, children: [{ text: (d) => d.item.startLabel }] }, { tag: "view", attrs: { "class": "grow" }, children: [{ text: (d) => d.item.serviceNameSnapshot }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => d.item.customerDisplayName }] }] }, { tag: "text", attrs: { "class": "badge" }, children: [{ text: (d) => d.item.statusText }] }] }, { text: "\n" }] }, { text: "\n" }] }, "pages/admin/pending/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { tag: "view", attrs: { "class": "eyebrow" }, children: [{ text: "\u53EA\u5904\u7406\u9700\u8981\u4F60\u51B3\u5B9A\u7684\u4E8B" }] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u5F85\u5904\u7406" }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: "\u4E34\u65F6\u4F11\u606F\u5F71\u54CD\u7684\u9884\u7EA6\uFF0C\u4F1A\u4FDD\u7559\u5728\u8FD9\u91CC\u3002" }] }, { tag: "view", attrs: { "class": "grid" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.groups, "wx:key": "key", "class": "secondary", "bindtap": "select", "data-key": (d) => d.item.key }, children: [{ text: (d) => "" + String(((d2) => d2.item.label)(d) ?? "") + " " + String(((d2) => d2.item.count)(d) ?? "") }] }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "class": "appointment row", "wx:for": (d) => d.rows, "wx:key": "appointmentId", "bindtap": "openDetail", "data-id": (d) => d.item.appointmentId, "data-date": (d) => d.date, "data-pending": (d) => d.pending }, children: [{ tag: "view", attrs: { "class": "clock" }, children: [{ text: (d) => d.item.startLabel }] }, { tag: "view", attrs: { "class": "grow" }, children: [{ tag: "view", attrs: { "class": "customer" }, children: [{ text: (d) => d.item.customerDisplayName }] }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.item.serviceNameSnapshot)(d) ?? "") + " \xB7 " + String(((d2) => d2.item.durationMinSnapshot)(d) ?? "") + "\u5206\u949F" }] }, { tag: "view", attrs: { "wx:if": (d) => d.pending, "class": "small" }, children: [{ text: (d) => d.item.dateLabel }] }] }, { tag: "view", attrs: {}, children: [{ tag: "view", attrs: { "class": (d) => "badge " + String(((d2) => d2.item.effective)(d) ?? "") }, children: [{ text: (d) => d.item.statusText }] }] }, { tag: "view", attrs: { "class": "arrow" }, children: [{ text: "\u203A" }] }] }, { tag: "view", attrs: { "wx:if": (d) => !d.rows.length && !d.loading && !d.error, "class": "empty" }, children: [{ text: "\u76EE\u524D\u6CA1\u6709\u9700\u8981\u5904\u7406\u7684\u9884\u7EA6" }] }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u987E\u5BA2\u91CD\u65B0\u9009\u62E9\u65F6\u95F4\u540E\uFF0C\u9884\u7EA6\u6062\u590D\u4E3A\u201C\u5DF2\u9884\u7EA6\u201D\u3002\u6D88\u606F\u53D1\u9001\u5931\u8D25\u4E5F\u4E0D\u4F1A\u5220\u9664\u9884\u7EA6\u3002" }] }] }, { text: "\r\n" }] }, "pages/admin/settings/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "admin-nav", attrs: { "current": "settings" }, children: [] }, { text: "\n" }, { tag: "view", attrs: { "class": "page" }, children: [{ tag: "view", attrs: { "class": "title" }, children: [{ text: "\u66F4\u591A" }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: "\u4E0D\u5E38\u7528\u7684\u4E8B\u60C5\uFF0C\u653E\u5728\u8FD9\u91CC\u3002" }] }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "button", attrs: { "class": "secondary", "bindtap": "navigate", "data-page": "pending" }, children: [{ text: "\u5F85\u5904\u7406\u4E0E\u5F02\u5E38\u8BB0\u5F55\u3000\u203A" }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u5F85\u6539\u671F\u3001\u5E97\u94FA\u53D6\u6D88\u3001\u5F02\u5E38\u8BB0\u5F55" }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "navigate", "data-page": "services" }, children: [{ text: "\u670D\u52A1\u9879\u76EE\u4E0E\u65F6\u957F\u3000\u203A" }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u540D\u79F0\u3001\u9884\u8BA1\u65F6\u957F\u3001\u542F\u7528\u548C\u6392\u5E8F" }] }] }, { tag: "view", attrs: { "class": "notice" }, children: [{ text: "\u6B63\u5E38\u9884\u7EA6\u6309\u65F6\u95F4\u81EA\u52A8\u5B8C\u6210\uFF0C\u65E0\u9700\u9010\u5355\u786E\u8BA4\u3002" }] }] }, { text: "\n" }] }, "pages/admin/detail/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { tag: "block", attrs: { "wx:if": (d) => d.item }, children: [{ tag: "view", attrs: { "class": "eyebrow" }, children: [{ text: (d) => d.item.dateLabel }] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: (d) => d.item.customerDisplayName }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: (d) => "" + String(((d2) => d2.item.serviceNameSnapshot)(d) ?? "") + " \xB7 " + String(((d2) => d2.item.durationMinSnapshot)(d) ?? "") + "\u5206\u949F" }] }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "class": "title" }, children: [{ text: (d) => "" + String(((d2) => d2.item.startLabel)(d) ?? "") + " \u2014 " + String(((d2) => d2.item.endLabel)(d) ?? "") }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "view", attrs: { "class": (d) => "badge " + String(((d2) => d2.item.effective)(d) ?? "") }, children: [{ text: (d) => d.item.statusText }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "view", attrs: {}, children: [{ text: (d) => d.item.note || "\u6CA1\u6709\u5907\u6CE8" }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: (d) => "\u6765\u6E90\uFF1A" + String(((d2) => d2.item.source === "wechat" ? "\u5FAE\u4FE1\u9884\u7EA6" : d2.item.source === "admin_manual" ? "\u5E97\u4E3B\u8865\u5F55" : "\u7F51\u9875\u9884\u7EA6")(d) ?? "") }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: (d) => "\u9884\u7EA6\u7F16\u53F7\uFF1A" + String(((d2) => d2.item.ref)(d) ?? "") }] }] }, { tag: "view", attrs: { "wx:if": (d) => d.item.customerEmail, "class": "notice" }, children: [{ text: (d) => "\u987E\u5BA2\u90AE\u7BB1\uFF1A" + String(((d2) => d2.item.customerEmail)(d) ?? "") }] }, { tag: "button", attrs: { "wx:if": (d) => d.item.customerPhone, "class": "secondary", "bindtap": "phone" }, children: [{ text: "\u8054\u7CFB\u987E\u5BA2" }] }, { tag: "view", attrs: { "wx:elif": (d) => !d.item.customerEmail, "class": "notice" }, children: [{ text: "\u6682\u65E0\u53EF\u7528\u8054\u7CFB\u7535\u8BDD" }] }, { tag: "view", attrs: { "wx:if": (d) => d.item.effective === "needs_reschedule", "class": "notice" }, children: [{ text: "\u6B64\u9884\u7EA6\u9700\u8981\u987E\u5BA2\u91CD\u65B0\u9009\u62E9\u65F6\u95F4\u3002\u6062\u590D\u8425\u4E1A\u540E\uFF0C\u8BF7\u67E5\u770B\u8FD9\u7B14\u9884\u7EA6\u7684\u6700\u65B0\u72B6\u6001\u3002" }] }, { tag: "button", attrs: { "wx:if": (d) => d.item.canNoShow || d.item.canCancel, "class": "secondary", "bindtap": "toggleMore" }, children: [{ text: "\u66F4\u591A\u64CD\u4F5C" }] }, { tag: "view", attrs: { "wx:if": (d) => d.more, "class": "card" }, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: "\u5F02\u5E38\u5904\u7406" }] }, { tag: "textarea", attrs: { "placeholder": "\u586B\u5199\u539F\u56E0\uFF0C\u65B9\u4FBF\u4EE5\u540E\u6838\u5BF9", "value": (d) => d.reason, "bindinput": "reason", "maxlength": "200" }, children: [] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "button", attrs: { "wx:if": (d) => d.item.canNoShow, "class": "secondary", "bindtap": "exception", "data-status": "no_show", "disabled": (d) => d.saving }, children: [{ text: "\u6807\u8BB0\u672A\u5230\u5E97" }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "button", attrs: { "wx:if": (d) => d.item.canCancel, "class": "danger", "bindtap": "exception", "data-status": "cancelled_by_shop", "disabled": (d) => d.saving }, children: [{ text: "\u5E97\u94FA\u53D6\u6D88\u9884\u7EA6" }] }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u6B63\u5E38\u670D\u52A1\u7531\u7CFB\u7EDF\u81EA\u52A8\u5B8C\u6210\u3002\u7CFB\u7EDF\u5DF2\u5B8C\u6210\u7684\u9884\u7EA6\u4ECD\u53EF\u4FEE\u6B63\u4E3A\u672A\u5230\u5E97\u3002" }] }, { tag: "view", attrs: { "wx:if": (d) => d.history.length, "class": "card" }, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: "\u53D8\u66F4\u8BB0\u5F55" }] }, { tag: "view", attrs: { "wx:for": (d) => d.history, "wx:key": "index", "class": "history" }, children: [{ tag: "view", attrs: {}, children: [{ text: (d) => d.item.label }] }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => d.item.reason }] }] }] }] }] }, { text: "\n" }] }, "pages/admin/manual/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u6DFB\u52A0\u9884\u7EA6" }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: "\u5148\u9009\u670D\u52A1\u548C\u65F6\u95F4\uFF0C\u518D\u9009\u987E\u5BA2\u3002\u53EA\u663E\u793A\u653E\u5F97\u4E0B\u8FD9\u9879\u670D\u52A1\u7684\u65F6\u95F4\uFF1B\u4ECA\u5929\u7684\u7A7A\u6863\u4E5F\u53EF\u4EE5\u52A0\u3002" }] }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "1 \xB7 \u670D\u52A1" }] }, { tag: "picker", attrs: { "range": (d) => d.services, "range-key": "name", "value": (d) => d.serviceIndex, "bindchange": "chooseService" }, children: [{ tag: "view", attrs: { "class": "picker" }, children: [{ text: (d) => d.services[d.serviceIndex].name || "\u6682\u65E0\u670D\u52A1" }] }] }] }, { tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "2 \xB7 \u65E5\u671F" }] }, { tag: "view", attrs: { "class": "customer-slots manual-days" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.days, "wx:key": "date", "data-index": (d) => d.index, "bindtap": "chooseDay", "class": (d) => "customer-slot " + String(((d2) => d2.index === d2.dayIndex ? "selected" : "")(d) ?? "") }, children: [{ text: (d) => d.item.label }, { tag: "text", attrs: { "class": "small" }, children: [{ text: (d) => "" + String(((d2) => d2.item.slots.length)(d) ?? "") + " \u4E2A\u65F6\u95F4" }] }] }] }, { tag: "view", attrs: { "wx:if": (d) => !d.days.length && !d.loading, "class": "hint" }, children: [{ text: "\u5F00\u653E\u8303\u56F4\u5185\u6CA1\u6709\u80FD\u653E\u4E0B\u8FD9\u9879\u670D\u52A1\u7684\u65F6\u95F4\u3002" }] }] }, { tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "3 \xB7 \u5F00\u59CB\u65F6\u95F4" }] }, { tag: "view", attrs: { "class": "customer-slots" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.slots, "wx:key": "startAt", "data-index": (d) => d.index, "bindtap": "chooseSlot", "class": (d) => "customer-slot " + String(((d2) => d2.index === d2.slotIndex ? "selected" : "")(d) ?? "") }, children: [{ text: (d) => d.item.label }] }] }, { tag: "button", attrs: { "class": "secondary manual-custom", "bindtap": "toggleCustom" }, children: [{ text: (d) => d.custom ? "\u6539\u56DE\u9009\u62E9\u65F6\u95F4" : "\u5176\u4ED6\u65F6\u95F4\u2026" }] }, { tag: "view", attrs: { "wx:if": (d) => d.custom, "class": "manual-custom-field" }, children: [{ tag: "input", attrs: { "type": "time", "value": (d) => d.customTime, "bindinput": "customInput", "step": "300" }, children: [] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u975E\u6574\u70B9\u65F6\u95F4\u4E5F\u53EF\u4EE5\uFF0C\u6BD4\u5982 14:15\u3002\u7CFB\u7EDF\u4F1A\u68C0\u67E5\u662F\u5426\u5728\u8425\u4E1A\u65F6\u95F4\u5185\u3001\u6709\u6CA1\u6709\u548C\u522B\u7684\u9884\u7EA6\u91CD\u53E0\u3002" }] }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u4FDD\u5B58\u65F6\u4F1A\u518D\u68C0\u67E5\u4E00\u6B21\uFF1B\u5982\u679C\u521A\u88AB\u522B\u4EBA\u7EA6\u8D70\uFF0C\u4F1A\u63D0\u793A\u4F60\u6362\u4E00\u4E2A\u65F6\u95F4\u3002" }] }] }, { tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "4 \xB7 \u987E\u5BA2" }] }, { tag: "view", attrs: { "class": "off-tabs" }, children: [{ tag: "button", attrs: { "class": (d) => d.newCustomer ? "" : "active", "bindtap": "toggleCustomer", "disabled": (d) => !d.newCustomer }, children: [{ text: "\u5DF2\u6709\u987E\u5BA2" }] }, { tag: "button", attrs: { "class": (d) => d.newCustomer ? "active" : "", "bindtap": "toggleCustomer", "disabled": (d) => d.newCustomer }, children: [{ text: "\u65B0\u987E\u5BA2\uFF08\u7535\u8BDD / \u5230\u5E97\uFF09" }] }] }, { tag: "block", attrs: { "wx:if": (d) => !d.newCustomer }, children: [{ tag: "picker", attrs: { "range": (d) => d.customers, "range-key": "name", "value": (d) => d.customerIndex, "bindchange": "choose", "data-field": "customerIndex" }, children: [{ tag: "view", attrs: { "class": "picker" }, children: [{ text: (d) => d.customers[d.customerIndex].name || "\u6682\u65E0\u5DF2\u6709\u987E\u5BA2" }] }] }] }, { tag: "block", attrs: { "wx:else": "" }, children: [{ tag: "input", attrs: { "class": "manual-input", "value": (d) => d.newName, "bindinput": "nameInput", "maxlength": "80", "placeholder": "\u987E\u5BA2\u59D3\u540D" }, children: [] }, { tag: "input", attrs: { "class": "manual-input", "type": "tel", "value": (d) => d.newPhone, "bindinput": "phoneInput", "maxlength": "25", "placeholder": "\u7535\u8BDD\uFF08\u9009\u586B\uFF09" }, children: [] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u4E0D\u9700\u8981\u987E\u5BA2\u6709\u8D26\u53F7\u3002\u4E0B\u6B21\u53EF\u4EE5\u5728\u300C\u5DF2\u6709\u987E\u5BA2\u300D\u91CC\u76F4\u63A5\u9009\u5230 TA\u3002" }] }] }] }, { tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "\u5907\u6CE8\uFF08\u9009\u586B\uFF09" }] }, { tag: "textarea", attrs: { "value": (d) => d.note, "bindinput": "field", "data-field": "note", "maxlength": "200" }, children: [] }] }] }, { tag: "button", attrs: { "bindtap": "submit", "disabled": (d) => !d.customers.length && !d.newCustomer || d.saving || d.loading || !d.services.length || d.slotIndex < 0 && !d.custom }, children: [{ text: "\u786E\u8BA4\u6DFB\u52A0" }] }] }, { text: "\n" }] }, "pages/admin/closure/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { tag: "view", attrs: { "class": "eyebrow" }, children: [{ text: "\u7ED9\u81EA\u5DF1\u7559\u51FA\u4F11\u606F\u65F6\u95F4" }] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u4E34\u65F6\u4F11\u606F" }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: "\u5DF2\u6709\u9884\u7EA6\u4E0D\u4F1A\u88AB\u5220\u9664\uFF0C\u53D7\u5F71\u54CD\u7684\u987E\u5BA2\u4F1A\u6536\u5230\u300C\u9700\u8981\u91CD\u65B0\u9009\u65F6\u95F4\u300D\u7684\u63D0\u793A\u3002" }] }, { text: "\n" }, { tag: "view", attrs: { "class": "off-tabs" }, children: [{ tag: "button", attrs: { "class": (d) => d.mode === "days" ? "active" : "", "bindtap": "mode", "data-mode": "days" }, children: [{ text: "\u4F11\u606F\u51E0\u5929" }] }, { tag: "button", attrs: { "class": (d) => d.mode === "hours" ? "active" : "", "bindtap": "mode", "data-mode": "hours" }, children: [{ text: "\u5173\u51E0\u4E2A\u5C0F\u65F6" }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.notice, "class": "off-notice" }, children: [{ text: (d) => d.notice }] }, { text: "\n" }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "class": "off-head" }, children: [{ tag: "text", attrs: { "class": "section" }, children: [{ text: (d) => d.mode === "days" ? "\u70B9\u9009\u8981\u4F11\u606F\u7684\u65E5\u5B50\uFF0C\u53EF\u4EE5\u9009\u591A\u5929" : "\u5148\u9009\u54EA\u4E00\u5929" }] }, { tag: "text", attrs: { "class": "small" }, children: [{ text: (d) => d.monthTitle }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "off-week" }, children: [{ tag: "text", attrs: {}, children: [{ text: "\u4E00" }] }, { tag: "text", attrs: {}, children: [{ text: "\u4E8C" }] }, { tag: "text", attrs: {}, children: [{ text: "\u4E09" }] }, { tag: "text", attrs: {}, children: [{ text: "\u56DB" }] }, { tag: "text", attrs: {}, children: [{ text: "\u4E94" }] }, { tag: "text", attrs: {}, children: [{ text: "\u516D" }] }, { tag: "text", attrs: {}, children: [{ text: "\u65E5" }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "off-grid" }, children: [{ tag: "view", attrs: { "wx:for": (d) => d.blanks, "wx:key": "*this", "class": "off-blank" }, children: [] }, { tag: "button", attrs: { "wx:for": (d) => d.days, "wx:key": "date", "class": (d) => "off-day " + String(((d2) => d2.item.pick ? "pick" : "")(d) ?? "") + " " + String(((d2) => d2.item.disabled ? "off" : "")(d) ?? "") + " " + String(((d2) => d2.item.busy ? "busy" : "")(d) ?? ""), "bindtap": "tapDay", "data-date": (d) => d.item.date, "disabled": (d) => !d.item.open }, children: [{ tag: "text", attrs: { "class": "off-num" }, children: [{ text: (d) => d.item.day }] }, { tag: "text", attrs: { "class": "off-note" }, children: [{ text: (d) => d.item.note }] }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.mode === "hours", "class": "card" }, children: [{ tag: "view", attrs: { "class": "off-head" }, children: [{ tag: "text", attrs: { "class": "section" }, children: [{ text: "\u5728\u65F6\u95F4\u8F74\u4E0A\u70B9\u5F00\u59CB\u3001\u518D\u70B9\u7ED3\u675F" }] }, { tag: "text", attrs: { "class": "small" }, children: [{ text: "\u5DE6\u53F3\u6ED1\u52A8" }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.cellsReady, "class": "off-axis keep-scroll-x" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.cells, "wx:key": "i", "class": (d) => "off-cell " + String(((d2) => d2.item.state)(d) ?? "") + " " + String(((d2) => d2.item.hour ? "hour" : "")(d) ?? ""), "bindtap": "tapCell", "data-i": (d) => d.item.i }, children: [{ tag: "text", attrs: { "class": "off-tick" }, children: [{ text: (d) => d.item.label }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.cellsReady, "class": "off-legend" }, children: [{ tag: "text", attrs: { "class": "free" }, children: [{ text: "\u53EF\u5173\u95ED" }] }, { tag: "text", attrs: { "class": "booked" }, children: [{ text: "\u5DF2\u6709\u9884\u7EA6" }] }, { tag: "text", attrs: { "class": "picked" }, children: [{ text: "\u8981\u5173\u95ED" }] }, { tag: "text", attrs: { "class": "closed" }, children: [{ text: "\u5DF2\u5173\u95ED" }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => !d.cellsReady && !d.loading, "class": "hint" }, children: [{ text: "\u8FD9\u4E00\u5929\u4E0D\u8425\u4E1A\u6216\u5DF2\u5168\u5929\u5173\u95ED\uFF0C\u8BF7\u6362\u4E00\u5929\u3002" }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.summary, "class": "off-summary" }, children: [{ tag: "view", attrs: {}, children: [{ text: (d) => d.summary }] }, { tag: "view", attrs: { "class": "grid" }, children: [{ tag: "button", attrs: { "bindtap": "submit", "disabled": (d) => d.saving }, children: [{ text: (d) => d.saving ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u786E\u8BA4\u5173\u95ED" }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "clearPick", "disabled": (d) => d.saving }, children: [{ text: "\u91CD\u65B0\u9009\u62E9" }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.closuresOfFocus.length }, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: "\u8FD9\u4E00\u5929\u5DF2\u8BBE\u7F6E\u7684\u4F11\u606F" }] }, { tag: "view", attrs: { "class": "card", "wx:for": (d) => d.closuresOfFocus, "wx:key": "closureId" }, children: [{ tag: "view", attrs: { "class": "row off-existing" }, children: [{ tag: "text", attrs: {}, children: [{ text: (d) => d.item.label }] }, { tag: "button", attrs: { "class": "secondary", "data-id": (d) => d.item.closureId, "bindtap": "remove", "disabled": (d) => d.saving }, children: [{ text: "\u6062\u590D\u8425\u4E1A" }] }] }] }] }, { text: "\n" }] }, { text: "\n" }] }, "pages/admin/hours/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { tag: "view", attrs: { "class": "eyebrow" }, children: [{ text: "\u6BCF\u5468\u56FA\u5B9A\u5B89\u6392" }] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u8425\u4E1A\u65F6\u95F4" }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: "\u5173\u6389\u67D0\u4E00\u5929\uFF0C\u5C31\u662F\u56FA\u5B9A\u4F11\u606F\u65E5\u3002" }] }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "wx:for": (d) => d.hours, "wx:key": "dayOfWeek", "class": "hours" }, children: [{ tag: "view", attrs: { "class": "row" }, children: [{ tag: "text", attrs: {}, children: [{ text: (d) => "" + String(((d2) => d2.item.label)(d) ?? "") + " \xB7 " + String(((d2) => d2.item.isOpen ? "\u8425\u4E1A" : "\u4F11\u606F")(d) ?? "") }] }, { tag: "switch", attrs: { "color": "#5C669B", "checked": (d) => d.item.isOpen, "bindchange": "change", "data-index": (d) => d.index, "data-field": "isOpen" }, children: [] }] }, { tag: "view", attrs: { "wx:if": (d) => d.item.isOpen, "class": "row" }, children: [{ tag: "picker", attrs: { "mode": "time", "value": (d) => d.item.openTime, "bindchange": "change", "data-index": (d) => d.index, "data-field": "openTime" }, children: [{ tag: "view", attrs: { "class": "picker" }, children: [{ text: (d) => "" + String(((d2) => d2.item.openTime)(d) ?? "") + " \u25BE" }] }] }, { tag: "text", attrs: {}, children: [{ text: "\u81F3" }] }, { tag: "picker", attrs: { "mode": "time", "value": (d) => d.item.closeTime, "bindchange": "change", "data-index": (d) => d.index, "data-field": "closeTime" }, children: [{ tag: "view", attrs: { "class": "picker" }, children: [{ text: (d) => "" + String(((d2) => d2.item.closeTime)(d) ?? "") + " \u25BE" }] }] }] }] }] }, { tag: "button", attrs: { "bindtap": "submit", "disabled": (d) => d.saving || d.loading || !d.hours.length, "loading": (d) => d.saving }, children: [{ text: (d) => d.demo ? "\u9884\u89C8\u8425\u4E1A\u5B89\u6392" : "\u4FDD\u5B58\u8425\u4E1A\u5B89\u6392" }] }] }, { text: "\n" }] }, "pages/admin/policy/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "admin-nav", attrs: { "current": "policy" }, children: [] }, { text: "\n" }, { tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { text: "\n" }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u5F00\u653E\u9884\u7EA6" }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: "\u51B3\u5B9A\u4EC0\u4E48\u65F6\u5019\u63A5\u5BA2\uFF0C\u5176\u4F59\u4EA4\u7ED9\u9884\u7EA6\u672C\u3002" }] }, { text: "\n" }, { tag: "block", attrs: { "wx:if": (d) => d.ready }, children: [{ tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: "\u672A\u6765\u5F00\u653E\u8303\u56F4" }] }, { tag: "view", attrs: { "class": "grid" }, children: [{ tag: "button", attrs: { "wx:for": (d) => d.presets, "wx:key": "days", "class": (d) => d.days === d.item.days && !d.custom ? "" : "secondary", "bindtap": "preset", "data-days": (d) => d.item.days, "disabled": (d) => d.saving }, children: [{ text: (d) => d.item.label }] }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: (d) => "" + String(((d2) => d2.custom ? "\u5F00\u653E\u5230\u6307\u5B9A\u65E5\u671F" : "\u6BCF\u5929\u5411\u524D\u5F00\u653E")(d) ?? "") + " \xB7 " + String(((d2) => d2.until)(d) ?? "") }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "custom", "disabled": (d) => d.saving }, children: [{ text: "\u81EA\u5B9A\u4E49\u65E5\u671F" }] }, { tag: "view", attrs: { "wx:if": (d) => d.custom, "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "\u5F00\u653E\u5230" }] }, { tag: "picker", attrs: { "mode": "date", "value": (d) => d.until, "bindchange": "date" }, children: [{ tag: "view", attrs: { "class": "picker" }, children: [{ text: (d) => d.until }] }] }, { tag: "button", attrs: { "bindtap": "saveDate", "disabled": (d) => d.saving }, children: [{ text: "\u4FDD\u5B58\u65E5\u671F" }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: "\u6BCF\u5468\u56FA\u5B9A\u5B89\u6392" }] }, { tag: "block", attrs: { "wx:for": (d) => d.hours, "wx:key": "dayOfWeek" }, children: [{ tag: "button", attrs: { "class": "secondary week-row", "bindtap": "edit", "data-index": (d) => d.index, "disabled": (d) => d.saving }, children: [{ text: (d) => "" + String(((d2) => d2.item.label)(d) ?? "") + "\u3000" + String(((d2) => d2.item.isOpen ? d2.item.openTime + "\u2013" + d2.item.closeTime : "\u4F11\u606F")(d) ?? "") + "\u3000\u203A" }] }, { text: "\n" }, { tag: "view", attrs: { "wx:if": (d) => d.editing === d.index, "class": "card" }, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: (d) => d.item.label }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "rest", "disabled": (d) => d.saving }, children: [{ text: "\u6BCF\u5468\u8FD9\u5929\u4F11\u606F" }] }, { tag: "view", attrs: { "class": "row field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "\u8425\u4E1A" }] }, { tag: "switch", attrs: { "checked": (d) => d.editOpen, "bindchange": "toggle" }, children: [] }] }, { tag: "view", attrs: { "wx:if": (d) => d.editOpen }, children: [{ tag: "label", attrs: {}, children: [{ text: "\u5F00\u59CB" }] }, { tag: "picker", attrs: { "range": (d) => d.times, "value": (d) => d.openIndex, "bindchange": "clock", "data-field": "openTime" }, children: [{ tag: "view", attrs: { "class": "picker" }, children: [{ text: (d) => d.openTime }] }] }, { tag: "label", attrs: {}, children: [{ text: "\u7ED3\u675F" }] }, { tag: "picker", attrs: { "range": (d) => d.times, "value": (d) => d.closeIndex, "bindchange": "clock", "data-field": "closeTime" }, children: [{ tag: "view", attrs: { "class": "picker" }, children: [{ text: (d) => d.closeTime }] }] }] }, { tag: "button", attrs: { "bindtap": "saveHours", "disabled": (d) => d.saving }, children: [{ text: "\u4FDD\u5B58\u5B89\u6392" }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "closeEditor", "disabled": (d) => d.saving }, children: [{ text: "\u6536\u8D77" }] }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u4E4B\u540E\u6BCF\u5468\u751F\u6548\u3002\u5DF2\u7EA6\u987E\u5BA2\u4E34\u65F6\u53D7\u5F71\u54CD\u65F6\uFF0C\u8BF7\u4F7F\u7528\u4E0B\u65B9\u4E34\u65F6\u8C03\u6574\u3002" }] }] }, { text: "\n" }, { tag: "view", attrs: { "class": "card" }, children: [{ tag: "view", attrs: { "class": "section" }, children: [{ text: "\u4E34\u65F6\u8C03\u6574" }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "adjust", "data-full": "1" }, children: [{ text: "\uFF0B \u4F11\u606F\u51E0\u5929\uFF08\u53EF\u591A\u9009\uFF09" }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "adjust", "data-full": "0" }, children: [{ text: "\uFF0B \u5173\u51E0\u4E2A\u5C0F\u65F6\uFF08\u65F6\u95F4\u8F74\uFF09" }] }, { tag: "view", attrs: { "class": "hint" }, children: [{ text: "\u9009\u62E9\u65E5\u671F\u540E\uFF0C\u4E5F\u53EF\u4EE5\u6062\u590D\u5DF2\u5173\u95ED\u7684\u65F6\u95F4\u3002\u53D7\u5F71\u54CD\u9884\u7EA6\u4F1A\u4FDD\u7559\u5E76\u8FDB\u5165\u5F85\u6539\u671F\u3002" }] }] }] }] }, { text: "\n" }] }, "pages/admin/services/index": { tag: "root", attrs: { "xmlns:wx": "urn:wx", "xmlns:bind": "urn:bind" }, children: [{ tag: "view", attrs: { "class": "page" }, children: [{ tag: "page-state", attrs: { "demo": (d) => d.demo, "loading": (d) => d.loading, "error": (d) => d.error, "bind:retry": "load" }, children: [] }, { tag: "view", attrs: { "class": "eyebrow" }, children: [{ text: "\u7559\u8DB3\u65F6\u95F4\uFF0C\u597D\u597D\u670D\u52A1" }] }, { tag: "view", attrs: { "class": "title" }, children: [{ text: "\u670D\u52A1\u9879\u76EE" }] }, { tag: "view", attrs: { "class": "subtitle" }, children: [{ text: "\u8C03\u6574\u670D\u52A1\u65F6\u957F\uFF0C\u4E0D\u4F1A\u6539\u53D8\u5DF2\u6709\u9884\u7EA6\u3002" }] }, { tag: "block", attrs: { "wx:if": (d) => !d.editing }, children: [{ tag: "view", attrs: { "wx:for": (d) => d.services, "wx:key": "serviceId", "class": "card", "bindtap": "edit", "data-id": (d) => d.item.serviceId }, children: [{ tag: "view", attrs: { "class": "row" }, children: [{ tag: "view", attrs: {}, children: [{ tag: "view", attrs: { "class": "customer" }, children: [{ text: (d) => d.item.name }] }, { tag: "view", attrs: { "class": "small" }, children: [{ text: (d) => "\u9884\u8BA1 " + String(((d2) => d2.item.durationMin)(d) ?? "") + " \u5206\u949F" }] }] }, { tag: "view", attrs: { "class": "badge" }, children: [{ text: (d) => d.item.isActive ? "\u5F00\u653E\u9884\u7EA6" : "\u5DF2\u6682\u505C" }] }, { tag: "text", attrs: {}, children: [{ text: "\u203A" }] }] }] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "edit", "disabled": (d) => d.loading || !!d.error }, children: [{ text: "\uFF0B \u6DFB\u52A0\u670D\u52A1" }] }] }, { tag: "view", attrs: { "wx:else": "", "class": "card" }, children: [{ tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "\u670D\u52A1\u540D\u79F0" }] }, { tag: "input", attrs: { "value": (d) => d.name, "bindinput": "field", "data-field": "name", "maxlength": "50" }, children: [] }] }, { tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "\u9884\u8BA1\u65F6\u957F\uFF08\u5206\u949F\uFF09" }] }, { tag: "input", attrs: { "type": "number", "value": (d) => d.duration, "bindinput": "field", "data-field": "duration" }, children: [] }] }, { tag: "view", attrs: { "class": "field" }, children: [{ tag: "label", attrs: {}, children: [{ text: "\u6392\u5E8F\uFF08\u6570\u5B57\u5C0F\u7684\u6392\u524D\u9762\uFF09" }] }, { tag: "input", attrs: { "type": "number", "value": (d) => d.order, "bindinput": "field", "data-field": "order" }, children: [] }] }, { tag: "view", attrs: { "class": "row" }, children: [{ tag: "text", attrs: {}, children: [{ text: "\u5F00\u653E\u9884\u7EA6" }] }, { tag: "switch", attrs: { "color": "#5C669B", "checked": (d) => d.active, "bindchange": "toggle" }, children: [] }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "button", attrs: { "bindtap": "submit", "disabled": (d) => d.saving, "loading": (d) => d.saving }, children: [{ text: (d) => d.demo ? "\u9884\u89C8\u670D\u52A1\u8BBE\u7F6E" : "\u4FDD\u5B58\u670D\u52A1" }] }, { tag: "view", attrs: { "class": "gap" }, children: [] }, { tag: "button", attrs: { "class": "secondary", "bindtap": "cancel", "disabled": (d) => d.saving }, children: [{ text: "\u8FD4\u56DE\u670D\u52A1\u5217\u8868" }] }] }] }, { text: "\n" }] } };

// web/shared/i18n.ts
var lang = document.body.dataset.lang === "en" ? "en" : "zh";
var english2 = lang === "en";
var exact = {
  "\u7406\u53D1\u9884\u7EA6": "Book an appointment",
  "\u6211\u7684\u9884\u7EA6": "My bookings",
  "\u9884\u7EA6": "Book",
  "\u9009\u62E9\u5230\u5E97\u65F6\u95F4": "Find your time",
  "\u670D\u52A1\u4E0E\u65E5\u671F": "Service & date",
  "\u65F6\u95F4": "Time",
  "\u786E\u8BA4": "Confirm",
  "\u9009\u62E9\u670D\u52A1": "Choose a service",
  "\u6700\u65E9\u53EF\u7EA6": "First available",
  "\u9009\u62E9\u65E5\u671F": "Choose a date",
  "\u6309\u65E5\u671F\u627E": "Browse dates",
  "\u6309\u56FA\u5B9A\u65F6\u95F4\u627E": "Find a time",
  "\u6307\u5B9A\u65F6\u95F4": "Start time",
  "\u8FD4\u56DE\u65E5\u671F": "Back to dates",
  "\u9009\u62E9\u5F00\u59CB\u65F6\u95F4": "Choose a start time",
  "\u63A8\u8350": "Suggested",
  "\u4E0B\u4E00\u6B65": "Continue",
  "\u8FD4\u56DE\u65F6\u95F4": "Back to times",
  "\u6838\u5BF9\u65B0\u7684\u9884\u7EA6\u65F6\u95F4": "Check your new time",
  "\u6700\u540E\u6838\u5BF9\u4E00\u4E0B": "Check before booking",
  "\u7535\u8BDD\uFF08\u9009\u586B\uFF09": "Phone (optional)",
  "\u65B9\u4FBF\u5E97\u91CC\u6709\u53D8\u52A8\u65F6\u8054\u7CFB\u4F60": "So the shop can reach you if plans change",
  "\u786E\u8BA4\u6210\u529F\u540E\uFF0C\u539F\u65F6\u95F4\u624D\u4F1A\u91CA\u653E\u3002": "Your original time is kept until the change is confirmed.",
  "\u5982\u8BA1\u5212\u6709\u53D8\uFF0C\u53EF\u5728\u300C\u6211\u7684\u9884\u7EA6\u300D\u4FEE\u6539\u6216\u53D6\u6D88\u3002": "If plans change, you can change or cancel in My bookings.",
  "\u6B63\u5728\u63D0\u4EA4\u2026": "Saving\u2026",
  "\u786E\u8BA4\u6539\u671F": "Confirm change",
  "\u786E\u8BA4\u9884\u7EA6": "Confirm booking",
  "\u53D6\u6D88\u8FD9\u6B21\u9884\u7EA6\uFF1F": "Cancel this booking?",
  "\u786E\u8BA4\u540E\uFF0C\u65F6\u95F4\u5C06\u5F00\u653E\u7ED9\u5176\u4ED6\u987E\u5BA2\uFF0C\u53D6\u6D88\u8BB0\u5F55\u4F1A\u4FDD\u7559\u3002": "The time will be released for other customers. A record of the cancellation is kept.",
  "\u786E\u8BA4\u53D6\u6D88": "Cancel booking",
  "\u4FDD\u7559\u9884\u7EA6": "Keep booking",
  "\u5DF2\u53D6\u6D88\u9884\u7EA6\uFF0C\u8BE5\u65F6\u95F4\u5DF2\u91CD\u65B0\u5F00\u653E\u3002": "Booking cancelled. This time is available again.",
  "\u9884\u7EA6\u8BB0\u5F55": "Your bookings",
  "\u518D\u7EA6\u4E00\u6B21 \u2192": "Book again \u2192",
  "\u8FD8\u6CA1\u6709\u9884\u7EA6\u3002\u9009\u597D\u670D\u52A1\u548C\u65F6\u95F4\uFF0C\u5C31\u53EF\u4EE5\u9884\u7EA6\u4E86\u3002": "No bookings yet. Choose a service and a time to book.",
  "\u5E97\u94FA\u8425\u4E1A\u65F6\u95F4\u6709\u53D8\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u65F6\u95F4\u3002": "The shop\u2019s hours changed. Please choose a new time.",
  "\u91CD\u65B0\u9009\u65F6\u95F4": "Choose new time",
  "\u4FEE\u6539\u65F6\u95F4": "Change time",
  "\u53D6\u6D88\u9884\u7EA6": "Cancel booking",
  "\u5DF2\u9884\u7EA6": "Booked",
  "\u8FDB\u884C\u4E2D": "In progress",
  "\u5DF2\u5B8C\u6210": "Completed",
  "\u5DF2\u53D6\u6D88": "Cancelled",
  "\u5E97\u94FA\u53D6\u6D88": "Cancelled by shop",
  "\u5F85\u6539\u671F": "Needs new time",
  "\u672A\u5230\u5E97": "Missed",
  "\u4F11\u606F": "Closed",
  "\u672A\u5F00\u653E": "Not open",
  "\u53EF\u9884\u7EA6": "Open",
  "\u6B64\u65F6\u4E0D\u53EF\u7EA6": "Not free",
  "\u5DF2\u6EE1": "Full",
  "\u8FD9\u4E2A\u65F6\u95F4\u521A\u521A\u88AB\u9884\u7EA6\u4E86\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002": "That time was just booked. Please choose another.",
  "\u7535\u8BDD\u53F7\u7801\u683C\u5F0F\u4E0D\u5BF9\uFF0C\u8BF7\u68C0\u67E5\u4E00\u4E0B\uFF0C\u6216\u8005\u7559\u7A7A\u3002": "Please check the phone number, or leave it empty.",
  "\u6539\u671F\u6210\u529F\uFF0C\u539F\u65F6\u95F4\u5DF2\u91CA\u653E\u3002": "Booking changed. Your old time is available again.",
  "\u9884\u7EA6\u6210\u529F\uFF0C\u5DF2\u4E3A\u4F60\u4FDD\u7559\u65F6\u95F4\u3002": "Booking confirmed. Your time is reserved.",
  "\u8BF7\u9009\u62E9\u65B0\u65F6\u95F4\uFF0C\u786E\u8BA4\u6210\u529F\u524D\u539F\u9884\u7EA6\u4FDD\u7559\u3002": "Choose a new time. Your current booking stays until the change is confirmed.",
  "\u6682\u65E0\u5339\u914D\u65F6\u6BB5\uFF0C\u8BF7\u8FD4\u56DE\u66F4\u6362\u65E5\u671F\u3002": "No times left on this day. Please go back and choose another date.",
  "\u91CD\u65B0\u52A0\u8F7D": "Try again",
  "\u53D6\u6D88": "Cancel",
  "\u786E\u5B9A": "OK",
  "\u9000\u51FA\u767B\u5F55": "Sign out",
  "\u767B\u5F55\u540E\u4FDD\u5B58\u548C\u7BA1\u7406\u9884\u7EA6": "Sign in to book and manage your bookings",
  "\u4F7F\u7528 Google \u8D26\u53F7\u767B\u5F55\uFF0C\u65E0\u9700\u53E6\u8BBE\u5BC6\u7801\u3002": "Use your Google account. No new password needed.",
  "Google \u767B\u5F55\u5F85\u914D\u7F6E\u3002\u5F53\u524D\u672C\u673A\u9884\u89C8\u4E0D\u4F1A\u8FDB\u884C\u771F\u5B9E Google \u9A8C\u8BC1\u3002": "Google sign-in is not set up in this local preview.",
  "\u8BF7\u70B9\u5FAE\u4FE1\u53F3\u4E0A\u89D2\u83DC\u5355\uFF0C\u5728 Safari \u6216\u7CFB\u7EDF\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u540E\u767B\u5F55\u3002": "In WeChat, tap \xB7\xB7\xB7 at the top right and open this page in Safari or your browser to sign in.",
  "\u590D\u5236\u5F53\u524D\u9884\u7EA6\u94FE\u63A5": "Copy this booking link",
  "\u94FE\u63A5\u5DF2\u590D\u5236\uFF0C\u8BF7\u5728\u7CFB\u7EDF\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u3002": "Link copied. Open it in your browser.",
  "\u672C\u673A\u6D4B\u8BD5\u5BC6\u94A5\uFF08\u89C1\u672C\u673A\u51ED\u636E\u6587\u4EF6\uFF09": "Local test key",
  "\u6B63\u5728\u8BFB\u53D6\u5E97\u94FA\u5B89\u6392\u2026": "Loading the shop\u2019s diary\u2026",
  "\u672C\u673A\u6D4B\u8BD5 \xB7 D1 \u6570\u636E\u4F1A\u4FDD\u7559\uFF1BGoogle \u5C1A\u9700\u6B63\u5F0F\u914D\u7F6E": "Local test \xB7 data is kept; Google sign-in not configured",
  "\u9690\u79C1\u8BF4\u660E": "Privacy",
  "\u8FD4\u56DE": "Back",
  "\u8BF7\u786E\u8BA4": "Please confirm",
  "\u5DF2\u4FDD\u5B58": "Saved",
  "\u670D\u52A1": "Service",
  "\u5730\u5740": "Address",
  "\u7535\u8BDD": "Phone",
  "\u65E5": "S",
  "\u4E00": "M",
  "\u4E8C": "T",
  "\u4E09": "W",
  "\u56DB": "T",
  "\u4E94": "F",
  "\u516D": "S",
  "\u77ED\u53D1\u526A\u53D1": "Short haircut",
  "\u957F\u53D1\u526A\u53D1": "Long haircut",
  "\u590D\u6742\u67D3\u6F02": "Colour & bleach"
};
var ownerExact = {
  "\u4ECA\u65E5\u9884\u7EA6": "Today",
  "\u4ECA\u5929": "Today",
  "\u65E5\u7A0B": "Diary",
  "\u5F00\u653E\u9884\u7EA6": "Opening",
  "\u66F4\u591A": "More",
  "\u9884\u7EA6\u8BE6\u60C5": "Booking details",
  "\u4E34\u65F6\u4F11\u606F": "Time off",
  "\u6DFB\u52A0\u9884\u7EA6": "Add a booking",
  "\u5F85\u5904\u7406": "Needs attention",
  "\u670D\u52A1\u9879\u76EE": "Services",
  "\u7ED9\u81EA\u5DF1\u7559\u51FA\u4F11\u606F\u65F6\u95F4": "Make time for yourself",
  "\u5DF2\u6709\u9884\u7EA6\u4E0D\u4F1A\u88AB\u5220\u9664\uFF0C\u53D7\u5F71\u54CD\u7684\u987E\u5BA2\u4F1A\u6536\u5230\u300C\u9700\u8981\u91CD\u65B0\u9009\u65F6\u95F4\u300D\u7684\u63D0\u793A\u3002": "Bookings are never deleted. Affected customers are asked to pick a new time.",
  "\u4F11\u606F\u51E0\u5929": "Days off",
  "\u5173\u51E0\u4E2A\u5C0F\u65F6": "A few hours",
  "\u70B9\u9009\u8981\u4F11\u606F\u7684\u65E5\u5B50\uFF0C\u53EF\u4EE5\u9009\u591A\u5929": "Tap the days you want off (several at once)",
  "\u5148\u9009\u54EA\u4E00\u5929": "First, pick a day",
  "\u5728\u65F6\u95F4\u8F74\u4E0A\u70B9\u5F00\u59CB\u3001\u518D\u70B9\u7ED3\u675F": "Tap a start, then an end, on the timeline",
  "\u5DE6\u53F3\u6ED1\u52A8": "Swipe sideways",
  "\u53EF\u5173\u95ED": "Free",
  "\u5DF2\u6709\u9884\u7EA6": "Booked",
  "\u8981\u5173\u95ED": "To close",
  "\u5DF2\u5173\u95ED": "Closed",
  "\u8FD9\u4E00\u5929\u4E0D\u8425\u4E1A\u6216\u5DF2\u5168\u5929\u5173\u95ED\uFF0C\u8BF7\u6362\u4E00\u5929\u3002": "Closed that day. Please pick another.",
  "\u6B63\u5728\u4FDD\u5B58\u2026": "Saving\u2026",
  "\u786E\u8BA4\u5173\u95ED": "Close these times",
  "\u91CD\u65B0\u9009\u62E9": "Start over",
  "\u8FD9\u4E00\u5929\u5DF2\u8BBE\u7F6E\u7684\u4F11\u606F": "Time off already set for this day",
  "\u6062\u590D\u8425\u4E1A": "Reopen",
  "\u6CA1\u6709\u5907\u6CE8": "No note",
  "\u5FAE\u4FE1\u9884\u7EA6": "WeChat",
  "\u5E97\u4E3B\u8865\u5F55": "Added by the owner",
  "\u7F51\u9875\u9884\u7EA6": "Website",
  "\u8054\u7CFB\u987E\u5BA2": "Contact customer",
  "\u6682\u65E0\u53EF\u7528\u8054\u7CFB\u7535\u8BDD": "No phone number",
  "\u6B64\u9884\u7EA6\u9700\u8981\u987E\u5BA2\u91CD\u65B0\u9009\u62E9\u65F6\u95F4\u3002\u6062\u590D\u8425\u4E1A\u540E\uFF0C\u8BF7\u67E5\u770B\u8FD9\u7B14\u9884\u7EA6\u7684\u6700\u65B0\u72B6\u6001\u3002": "This customer needs to pick a new time.",
  "\u66F4\u591A\u64CD\u4F5C": "More actions",
  "\u5F02\u5E38\u5904\u7406": "Exceptions",
  "\u586B\u5199\u539F\u56E0\uFF0C\u65B9\u4FBF\u4EE5\u540E\u6838\u5BF9": "Add a reason for the record",
  "\u6807\u8BB0\u672A\u5230\u5E97": "Mark as missed",
  "\u5E97\u94FA\u53D6\u6D88\u9884\u7EA6": "Cancel for the shop",
  "\u6B63\u5E38\u670D\u52A1\u7531\u7CFB\u7EDF\u81EA\u52A8\u5B8C\u6210\u3002\u7CFB\u7EDF\u5DF2\u5B8C\u6210\u7684\u9884\u7EA6\u4ECD\u53EF\u4FEE\u6B63\u4E3A\u672A\u5230\u5E97\u3002": "Visits complete automatically. A completed visit can still be marked as missed.",
  "\u53D8\u66F4\u8BB0\u5F55": "History",
  "\u6BCF\u5468\u56FA\u5B9A\u5B89\u6392": "Weekly hours",
  "\u8425\u4E1A\u65F6\u95F4": "Opening hours",
  "\u5173\u6389\u67D0\u4E00\u5929\uFF0C\u5C31\u662F\u56FA\u5B9A\u4F11\u606F\u65E5\u3002": "Switch a day off to make it a regular day off.",
  "\u8425\u4E1A": "Open",
  "\u4F11\u606F": "Closed",
  "\u81F3": "to",
  "\u5148\u9009\u670D\u52A1\u548C\u65F6\u95F4\uFF0C\u518D\u9009\u987E\u5BA2\u3002\u53EA\u663E\u793A\u653E\u5F97\u4E0B\u8FD9\u9879\u670D\u52A1\u7684\u65F6\u95F4\uFF1B\u4ECA\u5929\u7684\u7A7A\u6863\u4E5F\u53EF\u4EE5\u52A0\u3002": "Pick the service and time, then the customer. Only times that fit the service are shown; today\u2019s gaps can be used too.",
  "\u670D\u52A1": "Service",
  "\u6682\u65E0\u670D\u52A1": "No services",
  "\u65E5\u671F": "Date",
  "\u5F00\u653E\u8303\u56F4\u5185\u6CA1\u6709\u80FD\u653E\u4E0B\u8FD9\u9879\u670D\u52A1\u7684\u65F6\u95F4\u3002": "No time fits this service in the open period.",
  "\u5F00\u59CB\u65F6\u95F4": "Start time",
  "\u6539\u56DE\u9009\u62E9\u65F6\u95F4": "Back to time buttons",
  "\u5176\u4ED6\u65F6\u95F4\u2026": "Other time\u2026",
  "\u975E\u6574\u70B9\u65F6\u95F4\u4E5F\u53EF\u4EE5\uFF0C\u6BD4\u5982 14:15\u3002\u7CFB\u7EDF\u4F1A\u68C0\u67E5\u662F\u5426\u5728\u8425\u4E1A\u65F6\u95F4\u5185\u3001\u6709\u6CA1\u6709\u548C\u522B\u7684\u9884\u7EA6\u91CD\u53E0\u3002": "Any time works, e.g. 14:15. It is checked against opening hours and other bookings.",
  "\u4FDD\u5B58\u65F6\u4F1A\u518D\u68C0\u67E5\u4E00\u6B21\uFF1B\u5982\u679C\u521A\u88AB\u522B\u4EBA\u7EA6\u8D70\uFF0C\u4F1A\u63D0\u793A\u4F60\u6362\u4E00\u4E2A\u65F6\u95F4\u3002": "Checked again on save; if someone just took it you\u2019ll be asked to choose another.",
  "\u987E\u5BA2": "Customer",
  "\u5DF2\u6709\u987E\u5BA2": "Existing customer",
  "\u65B0\u987E\u5BA2\uFF08\u7535\u8BDD / \u5230\u5E97\uFF09": "New (phone / walk-in)",
  "\u6682\u65E0\u5DF2\u6709\u987E\u5BA2": "No customers yet",
  "\u987E\u5BA2\u59D3\u540D": "Customer name",
  "\u4E0D\u9700\u8981\u987E\u5BA2\u6709\u8D26\u53F7\u3002\u4E0B\u6B21\u53EF\u4EE5\u5728\u300C\u5DF2\u6709\u987E\u5BA2\u300D\u91CC\u76F4\u63A5\u9009\u5230 TA\u3002": "No account needed. Next time they appear under Existing customer.",
  "\u5907\u6CE8\uFF08\u9009\u586B\uFF09": "Note (optional)",
  "\u786E\u8BA4\u6DFB\u52A0": "Add booking",
  "\u53EA\u5904\u7406\u9700\u8981\u4F60\u51B3\u5B9A\u7684\u4E8B": "Only what needs your decision",
  "\u4E34\u65F6\u4F11\u606F\u5F71\u54CD\u7684\u9884\u7EA6\uFF0C\u4F1A\u4FDD\u7559\u5728\u8FD9\u91CC\u3002": "Bookings affected by time off wait here.",
  "\u76EE\u524D\u6CA1\u6709\u9700\u8981\u5904\u7406\u7684\u9884\u7EA6": "Nothing needs attention",
  "\u987E\u5BA2\u91CD\u65B0\u9009\u62E9\u65F6\u95F4\u540E\uFF0C\u9884\u7EA6\u6062\u590D\u4E3A\u201C\u5DF2\u9884\u7EA6\u201D\u3002\u6D88\u606F\u53D1\u9001\u5931\u8D25\u4E5F\u4E0D\u4F1A\u5220\u9664\u9884\u7EA6\u3002": "When the customer picks a new time the booking is active again. Bookings are never deleted.",
  "\u51B3\u5B9A\u4EC0\u4E48\u65F6\u5019\u63A5\u5BA2\uFF0C\u5176\u4F59\u4EA4\u7ED9\u9884\u7EA6\u672C\u3002": "Decide when you take customers; the diary does the rest.",
  "\u672A\u6765\u5F00\u653E\u8303\u56F4": "How far ahead to open",
  "\u5F00\u653E\u5230\u6307\u5B9A\u65E5\u671F": "Open until a set date",
  "\u6BCF\u5929\u5411\u524D\u5F00\u653E": "Rolling window",
  "\u81EA\u5B9A\u4E49\u65E5\u671F": "Pick a date",
  "\u5F00\u653E\u5230": "Open until",
  "\u4FDD\u5B58\u65E5\u671F": "Save date",
  "\u6BCF\u5468\u8FD9\u5929\u4F11\u606F": "Closed every week",
  "\u5F00\u59CB": "Opens",
  "\u7ED3\u675F": "Closes",
  "\u4FDD\u5B58\u5B89\u6392": "Save",
  "\u6536\u8D77": "Close",
  "\u4E4B\u540E\u6BCF\u5468\u751F\u6548\u3002\u5DF2\u7EA6\u987E\u5BA2\u4E34\u65F6\u53D7\u5F71\u54CD\u65F6\uFF0C\u8BF7\u4F7F\u7528\u4E0B\u65B9\u4E34\u65F6\u8C03\u6574\u3002": "Applies every week from now. For one-off changes use time off below.",
  "\u4E34\u65F6\u8C03\u6574": "One-off changes",
  "\u4F11\u606F\u51E0\u5929\uFF08\u53EF\u591A\u9009\uFF09": "+ Days off (several at once)",
  "\u5173\u51E0\u4E2A\u5C0F\u65F6\uFF08\u65F6\u95F4\u8F74\uFF09": "+ A few hours (timeline)",
  "\uFF0B \u4F11\u606F\u51E0\u5929\uFF08\u53EF\u591A\u9009\uFF09": "+ Days off (several at once)",
  "\uFF0B \u5173\u51E0\u4E2A\u5C0F\u65F6\uFF08\u65F6\u95F4\u8F74\uFF09": "+ A few hours (timeline)",
  "\u9009\u62E9\u65E5\u671F\u540E\uFF0C\u4E5F\u53EF\u4EE5\u6062\u590D\u5DF2\u5173\u95ED\u7684\u65F6\u95F4\u3002\u53D7\u5F71\u54CD\u9884\u7EA6\u4F1A\u4FDD\u7559\u5E76\u8FDB\u5165\u5F85\u6539\u671F\u3002": "You can also reopen closed time. Affected bookings are kept and wait for a new time.",
  "\u5E97\u94FA\u65E5\u7A0B": "Shop diary",
  "\u65E5\u7A0B\u5B89\u6392": "Diary",
  "\u8C03\u6574\u8425\u4E1A": "Adjust hours",
  "\u6062\u590D\u8FD9\u6BB5\u8425\u4E1A": "Reopen this time",
  "\u8FD9\u4E00\u5929\u6CA1\u6709\u5DF2\u5B89\u6392\u7684\u9884\u7EA6": "No bookings this day",
  "\u53EF\u4EE5\u6DFB\u52A0\u9884\u7EA6\uFF0C\u6216\u9009\u62E9\u5176\u4ED6\u65E5\u671F\u67E5\u770B": "Add a booking or pick another day",
  "\u5168\u90E8\u9884\u7EA6\u8BB0\u5F55": "All bookings",
  "\u641C\u7D22\u987E\u5BA2\u3001\u670D\u52A1\u6216\u9884\u7EA6\u7F16\u53F7": "Search customer, service or reference",
  "\u7559\u8DB3\u65F6\u95F4\uFF0C\u597D\u597D\u670D\u52A1": "Leave enough time for each service",
  "\u8C03\u6574\u670D\u52A1\u65F6\u957F\uFF0C\u4E0D\u4F1A\u6539\u53D8\u5DF2\u6709\u9884\u7EA6\u3002": "Changing a duration does not change existing bookings.",
  "\u5DF2\u6682\u505C": "Paused",
  "\u6DFB\u52A0\u670D\u52A1": "Add service",
  "\u670D\u52A1\u540D\u79F0": "Service name",
  "\u9884\u8BA1\u65F6\u957F\uFF08\u5206\u949F\uFF09": "Duration (minutes)",
  "\u6392\u5E8F\uFF08\u6570\u5B57\u5C0F\u7684\u6392\u524D\u9762\uFF09": "Order (lower first)",
  "\u9884\u89C8\u670D\u52A1\u8BBE\u7F6E": "Preview",
  "\u4FDD\u5B58\u670D\u52A1": "Save service",
  "\u8FD4\u56DE\u670D\u52A1\u5217\u8868": "Back to services",
  "\u4E0D\u5E38\u7528\u7684\u4E8B\u60C5\uFF0C\u653E\u5728\u8FD9\u91CC\u3002": "Less frequent tasks.",
  "\u5F85\u5904\u7406\u4E0E\u5F02\u5E38\u8BB0\u5F55\u3000\u203A": "Needs attention & exceptions \u203A",
  "\u5F85\u6539\u671F\u3001\u5E97\u94FA\u53D6\u6D88\u3001\u5F02\u5E38\u8BB0\u5F55": "New time needed, shop cancellations, exceptions",
  "\u670D\u52A1\u9879\u76EE\u4E0E\u65F6\u957F\u3000\u203A": "Services & durations \u203A",
  "\u540D\u79F0\u3001\u9884\u8BA1\u65F6\u957F\u3001\u542F\u7528\u548C\u6392\u5E8F": "Name, duration, on/off and order",
  "\u6B63\u5E38\u9884\u7EA6\u6309\u65F6\u95F4\u81EA\u52A8\u5B8C\u6210\uFF0C\u65E0\u9700\u9010\u5355\u786E\u8BA4\u3002": "Visits complete automatically; no need to confirm each one.",
  "\u6B63\u5E38\u9884\u7EA6\u81EA\u52A8\u5B8C\u6210\uFF0C\u65E0\u9700\u9010\u5355\u786E\u8BA4\u3002": "Visits complete automatically; no need to confirm each one.",
  "\u4ECA\u5929\u6574\u4F53\u5B89\u6392": "Today at a glance",
  "\u4ECA\u5929\u8FD8\u7A7A": "Free today",
  "\u4ECE\u73B0\u5728\u5230\u6253\u70CA": "From now until closing",
  "\u4E0B\u4E00\u4E2A\u7A7A\u6863": "Next gap",
  "\u53EF\u4EE5\u63A5\u4E34\u65F6\u5BA2\u4EBA": "Room for a walk-in",
  "\u4ECA\u5929\u6CA1\u6709\u7A7A\u6863\u4E86": "No gaps left today",
  "\u4E34\u65F6\u8C03\u6574\u4ECA\u5929": "Adjust today",
  "\uFF0B \u6DFB\u52A0\u9884\u7EA6": "+ Add a booking",
  "\u5F53\u524D\u6B63\u5728\u670D\u52A1": "With a customer now",
  "\u67E5\u770B\u9884\u7EA6": "View booking",
  "\u4E0B\u4E00\u4F4D\u987E\u5BA2": "Next customer",
  "\u4ECA\u5929\u6CA1\u6709\u540E\u7EED\u9884\u7EA6": "No more bookings today",
  "\u4ECA\u5929\u5269\u4F59\u9884\u7EA6": "Rest of today",
  "\u6682\u65E0\u540E\u7EED\u9884\u7EA6": "No more bookings",
  "\u4ECA\u5929\u7A7A\u95F2\u65F6\u95F4": "Free time today",
  "\u6682\u65E0\u5269\u4F59\u7A7A\u95F2": "No free time left",
  "\u56FA\u5B9A\u4F11\u606F": "Day off",
  "\u90E8\u5206\u5173\u95ED": "Part closed",
  "\u5168\u5929\u4F11\u606F": "Closed all day",
  "\u786E\u8BA4\u4F11\u606F\u5B89\u6392": "Confirm time off",
  "\u6062\u590D\u8425\u4E1A\uFF1F": "Reopen?",
  "\u8FD9\u6BB5\u65F6\u95F4\u4F1A\u91CD\u65B0\u5F00\u653E\u7ED9\u987E\u5BA2\u3002\u4E4B\u524D\u8F6C\u4E3A\u5F85\u6539\u671F\u7684\u9884\u7EA6\u4E0D\u4F1A\u81EA\u52A8\u6062\u590D\uFF0C\u8BF7\u5230\u300C\u5F85\u5904\u7406\u300D\u91CC\u67E5\u770B\u3002": "This time opens to customers again. Bookings already waiting for a new time stay in Needs attention.",
  "\u5DF2\u6062\u590D\u8425\u4E1A": "Reopened",
  "\u5F85\u6539\u671F": "Needs new time",
  "\u5E97\u94FA\u53D6\u6D88": "Cancelled by shop",
  "\u5F02\u5E38\u8BB0\u5F55": "Exceptions",
  "\u5DF2\u6EE1": "Full",
  "\u8F83\u5FD9": "Busy",
  "\u6B63\u5E38": "Normal",
  "\u7A7A\u95F2\u8F83\u591A": "Quiet",
  "\u4ECA\u5929\u5DF2\u7ED3\u675F": "Day over",
  "\u4ECA\u5929\u4F11\u606F": "Closed today",
  "\u786E\u8BA4\u4FDD\u5B58": "Save",
  "\u67E5\u770B\u6F14\u793A": "See demo",
  "\u77E5\u9053\u4E86": "OK",
  "\u987E\u5BA2\u53D6\u6D88": "Cancelled by customer",
  "\u9000\u51FA\u767B\u5F55": "Sign out",
  "\u8BF7\u586B\u5199\u987E\u5BA2\u59D3\u540D": "Please enter the customer\u2019s name",
  "\u7535\u8BDD\u53F7\u7801\u683C\u5F0F\u4E0D\u5BF9": "Please check the phone number",
  "\u8BF7\u9009\u62E9\u670D\u52A1\u3001\u65F6\u95F4\u548C\u987E\u5BA2": "Choose a service, time and customer",
  "\u8BF7\u586B\u5199\u5F00\u59CB\u65F6\u95F4\uFF0C\u4F8B\u5982 14:15": "Enter a start time, e.g. 14:15",
  "\u6F14\u793A\u9884\u7EA6\u672C \xB7 \u793A\u4F8B\u6570\u636E\uFF0C\u4E0D\u4F1A\u4FDD\u5B58\u771F\u5B9E\u9884\u7EA6": "Demo diary \xB7 sample data, nothing is saved",
  "\u91CD\u65B0\u52A0\u8F7D": "Try again",
  "1 \u5468": "1 week",
  "2 \u5468": "2 weeks",
  "3 \u5468": "3 weeks",
  "\u2039 \u4E0A\u4E00\u5468": "\u2039 Previous week",
  "\u4E0B\u4E00\u5468 \u203A": "Next week \u203A",
  "\u4E0A\u4E00\u5468": "Previous week",
  "\u4ECA\u5929\u5269\u4F59": "Rest of today",
  "\u8BF7\u68C0\u67E5\u6BCF\u5929\u7684\u8425\u4E1A\u65F6\u95F4": "Please check each day\u2019s hours",
  "\u7ED3\u675F\u65F6\u95F4\u987B\u665A\u4E8E\u5F00\u59CB\u65F6\u95F4": "Closing must be after opening"
};
Object.assign(exact, ownerExact);
var phrases = Object.entries({ "\u77ED\u53D1\u526A\u53D1": "Short haircut", "\u957F\u53D1\u526A\u53D1": "Long haircut", "\u590D\u6742\u67D3\u6F02": "Colour & bleach", "\u9884\u7EA6\u7F16\u53F7\uFF1A": "Booking reference: ", "\u672C\u673A\u6D4B\u8BD5\u987E\u5BA2": "Test customer", "\u6D4B\u8BD5\u987E\u5BA2": "Test customer", "\u672C\u673A\u6D4B\u8BD5\u5E97\u4E3B": "Test owner", "\u5DF2\u5B8C\u6210": "Completed", "\u5DF2\u9884\u7EA6": "Booked", "\u5F85\u6539\u671F": "Needs new time", "\u5E97\u94FA\u53D6\u6D88": "Cancelled by shop", "\u5F02\u5E38\u8BB0\u5F55": "Exceptions", "\u8FDB\u884C\u4E2D": "In progress", "\u672A\u5230\u5E97": "Missed", "\u3000": " " });
var W = { "\u65E5": "Sun", "\u4E00": "Mon", "\u4E8C": "Tue", "\u4E09": "Wed", "\u56DB": "Thu", "\u4E94": "Fri", "\u516D": "Sat" };
var M = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var MF = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var rules = [
  [/(\d{1,2})\/(\d{1,2})\s*周([日一二三四五六])/g, (_, mo, d, w) => `${W[w]} ${Number(d)} ${M[Number(mo)]}`],
  [/(\d{4}) 年 (\d{1,2}) 月 — (?:(\d{4}) 年 )?(\d{1,2}) 月/g, (_, y, a, y2, b) => `${MF[Number(a)]}${y2 && y2 !== y ? " " + y : ""} \u2013 ${MF[Number(b)]} ${y2 || y}`],
  [/(\d{4}) 年 (\d{1,2}) 月/g, (_, y, a) => `${MF[Number(a)]} ${y}`],
  [/开放至 (\d{1,2})\/(\d{1,2})/g, (_, mo, d) => `Open until ${Number(d)} ${M[Number(mo)]}`],
  [/(\d+) 个可选/g, (_, n) => `${n} times`],
  [/(\d{1,2})月(\d{1,2})日\s*·\s*周([日一二三四五六])/g, (_, mo, d, w) => `${W[w]} ${Number(d)} ${M[Number(mo)]}`],
  [/(\d{4})年\s*(\d{1,2})月/g, (_, y, a) => `${MF[Number(a)]} ${y}`],
  [/今天共 (\d+) 位客人/g, (_, n) => `${n} customer${n === "1" ? "" : "s"} today`],
  [/还要接待 (\d+) 位 · 营业 /g, (_, n) => `${n} still to come \xB7 open `],
  [/有 (\d+) 位顾客待改期，去处理\s*›/g, (_, n) => `${n} customer${n === "1" ? "" : "s"} need${n === "1" ? "s" : ""} a new time \u203A`],
  [/为 (.+?) 添加 (.+?) 的(.+?)，预计(\d+)分钟？/g, (_, who, when, what, n) => `Add ${what} (${n} min) for ${who} on ${when}?`],
  [/已关闭 (\d+) 天/g, (_, n) => `Closed ${n} day${n === "1" ? "" : "s"}`],
  [/已关闭这段时间/g, () => "Closed that time"],
  [/，(\d+) 位顾客转为待改期，他们会在「我的预约」里看到提示/g, (_, n) => `. ${n} customer${n === "1" ? "" : "s"} will be asked to pick a new time`],
  [/影响 (\d+) 位顾客（(.+?)），会转为待改期/g, (_, n, who) => `${n} customer${n === "1" ? "" : "s"} (${who}) will need a new time`],
  [/影响 (\d+) 位顾客，会转为待改期/g, (_, n) => `${n} customer${n === "1" ? "" : "s"} will need a new time`],
  [/这几天没有预约/g, () => "no bookings on these days"],
  [/这段时间没有预约/g, () => "no bookings in this time"],
  [/^关闭 /g, () => "Close "],
  [/ 全天/g, () => " (all day)"],
  [/。已有预约不会被删除。/g, () => ". Bookings are never deleted."],
  [/^(\d+) 位顾客$/g, (_, n) => `${n} booked`],
  [/(\d+) 位顾客 · 开放预约/g, (_, n) => `${n} customer${n === "1" ? "" : "s"} \xB7 open`],
  [/(\d+) 位顾客/g, (_, n) => `${n} customer${n === "1" ? "" : "s"}`],
  [/(\d+) 个时间/g, (_, n) => `${n} times`],
  [/(\d+)小时(\d+)分/g, (_, h, m) => `${h}h ${m}m`],
  [/(\d+)小时/g, (_, h) => `${h} h`],
  [/每天向前开放 · /g, () => "Rolling \xB7 until "],
  [/开放到指定日期 · /g, () => "Open until "],
  [/(\d{1,2})\/(\d{1,2}) ([A-Z][a-z]{2}) 休息/g, (_, mo, d, w) => `${w} ${Number(d)} ${M[Number(mo)]} closed`],
  [/来源：微信预约/g, () => "Source: WeChat"],
  [/来源：网页预约/g, () => "Source: Website"],
  [/来源：店主补录/g, () => "Source: added by the owner"],
  [/^创建预约 →/g, () => "Created \u2192"],
  [/^预计 (?=\d)/g, () => "About "],
  [/预约编号：/g, () => "Booking reference: "],
  [/来源：/g, () => "Source: "],
  [/顾客邮箱：/g, () => "Email: "],
  [/(\d+)\s*分钟/g, (_, n) => `${n} min`],
  [/(\d{1,2})月 — (\d{1,2})月/g, (_, a, b) => `${M[Number(a)]} \u2013 ${M[Number(b)]}`],
  [/周([日一二三四五六])/g, (_, w) => W[w]],
  [/、/g, () => ", "],
  [/休息/g, () => "closed"],
  [/(?<![\u4e00-\u9fff])营业(?![\u4e00-\u9fff])/g, () => "open"],
  [/\s·\s/g, () => ", "]
];
function tr(text) {
  if (!english2 || !text || !/[一-鿿·]/.test(text)) return text;
  const t = text.trim();
  if (exact[t]) return text.replace(t, exact[t]);
  const m = t.match(/^([‹›←→＋+·\d\s]*?)([^‹›←→＋+·\d\s].*?)([\s‹›←→]*)$/);
  if (m && exact[m[2]]) return text.replace(t, m[1] + exact[m[2]] + m[3]);
  let out = text;
  for (const [re, fn] of rules) out = out.replace(re, fn);
  for (const [zh2, en2] of phrases) out = out.split(zh2).join(en2);
  return out;
}

// web/app.ts
var admin = document.body.dataset.view === "admin";
var screen = document.getElementById("screen");
var routeBase = admin ? "pages/admin/" : "pages/customer/";
var current;
var route = "";
var routeURL = "";
var trail = [];
var queued = false;
var read = (v, d) => typeof v === "function" ? v(d) : v;
var element = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== void 0) e.textContent = tr(text);
  return e;
};
function notice(message) {
  void modal({ title: message, showCancel: false });
}
function toast(message) {
  document.querySelector(".app-toast")?.remove();
  const t = element("div", "app-toast", message);
  t.setAttribute("role", "status");
  document.body.append(t);
  setTimeout(() => t.remove(), 1800);
}
async function modal(o) {
  return new Promise((resolve) => {
    const box = element("dialog", "app-modal");
    box.append(element("h3", "", o.title), element("p", "", o.content || ""));
    if (!o.content) box.querySelector("p").remove();
    const actions = element("div", "app-modal-actions");
    const end = (confirmed) => {
      box.close();
      box.remove();
      resolve({ confirm: confirmed, cancel: !confirmed });
    };
    if (o.showCancel !== false) {
      const b = element("button", "secondary", o.cancelText || "\u53D6\u6D88");
      b.onclick = () => end(false);
      actions.append(b);
    }
    const yes = element("button", "", o.confirmText || "\u786E\u5B9A");
    yes.onclick = () => end(true);
    actions.append(yes);
    box.append(actions);
    box.oncancel = (e) => {
      e.preventDefault();
      end(false);
    };
    document.body.append(box);
    box.showModal();
  });
}
window.wx = { request: () => Promise.reject(new Error("Unsupported browser transport")), showModal: modal, showToast: (o) => toast(o.title), stopPullDownRefresh: () => {
}, navigateTo: (o) => go(o.url), redirectTo: (o) => go(o.url, false), switchTab: (o) => {
  trail = [];
  go(o.url, false);
}, navigateBack: () => back(), makePhoneCall: (o) => {
  location.href = "tel:" + o.phoneNumber;
}, cloud: { callFunction: () => Promise.reject(new Error("Not configured")) } };
function invoke(name, node, d, detail2 = {}) {
  const a = node.attrs || {}, dataset = Object.fromEntries(Object.entries(a).filter(([k]) => k.startsWith("data-")).map(([k, v]) => [k.slice(5), read(v, d)]));
  const value = current?.[name]?.({ detail: detail2, currentTarget: { dataset } });
  if (value?.catch) value.catch((e) => notice(e.message));
}
function children(parent, nodes, d) {
  let matched = false;
  for (const n of nodes) {
    const a = n.attrs || {};
    if (a["wx:for"] !== void 0) {
      const values = read(a["wx:for"], d) || [];
      values.forEach((item, index) => children(parent, [{ ...n, attrs: Object.fromEntries(Object.entries(a).filter(([k]) => k !== "wx:for")) }], { ...d, [a["wx:for-item"] || "item"]: item, [a["wx:for-index"] || "index"]: index }));
      continue;
    }
    if (a["wx:if"] !== void 0) {
      matched = !!read(a["wx:if"], d);
      if (!matched) continue;
    } else if (a["wx:elif"] !== void 0) {
      if (matched) continue;
      matched = !!read(a["wx:elif"], d);
      if (!matched) continue;
    } else if ("wx:else" in a) {
      if (matched) continue;
      matched = true;
    } else if (n.tag) matched = false;
    renderNode(parent, n, d);
  }
}
function authPanel(parent) {
  const box = element("section", "auth-panel");
  if (identity.viewer) {
    const row2 = element("div", "auth-profile"), details = element("div");
    details.append(element("strong", "", identity.viewer.name), element("small", "", identity.viewer.email));
    const out = element("button", "", "\u9000\u51FA\u767B\u5F55");
    out.onclick = async () => {
      await api("/api/auth/logout", {});
      await refreshIdentity();
      await current?.load?.();
      render();
    };
    row2.append(details, out);
    box.append(row2);
  } else {
    box.append(element("strong", "", "\u767B\u5F55\u540E\u4FDD\u5B58\u548C\u7BA1\u7406\u9884\u7EA6"), element("p", "", "\u4F7F\u7528 Google \u8D26\u53F7\u767B\u5F55\uFF0C\u65E0\u9700\u53E6\u8BBE\u5BC6\u7801\u3002"));
    if (identity.googleConfigured) {
      const link = element("a", "google-signin", "Continue with Google");
      link.href = loginURL();
      link.onclick = saveIntent;
      box.append(link);
    } else box.append(element("p", "auth-note", "Google \u767B\u5F55\u5F85\u914D\u7F6E\u3002\u5F53\u524D\u672C\u673A\u9884\u89C8\u4E0D\u4F1A\u8FDB\u884C\u771F\u5B9E Google \u9A8C\u8BC1\u3002"));
    if (/MicroMessenger/i.test(navigator.userAgent)) {
      const p = element("p", "auth-note", "\u8BF7\u70B9\u5FAE\u4FE1\u53F3\u4E0A\u89D2\u83DC\u5355\uFF0C\u5728 Safari \u6216\u7CFB\u7EDF\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u540E\u767B\u5F55\u3002");
      box.append(p);
      const copy = element("button", "secondary", "\u590D\u5236\u5F53\u524D\u9884\u7EA6\u94FE\u63A5");
      copy.onclick = async () => {
        saveIntent();
        await navigator.clipboard.writeText(intentURL());
        notice("\u94FE\u63A5\u5DF2\u590D\u5236\uFF0C\u8BF7\u5728\u7CFB\u7EDF\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u3002");
      };
      box.append(copy);
    }
    if (identity.localTest) {
      const input = element("input", "test-key");
      input.type = "password";
      input.placeholder = "\u672C\u673A\u6D4B\u8BD5\u5BC6\u94A5\uFF08\u89C1\u672C\u673A\u51ED\u636E\u6587\u4EF6\uFF09";
      input.autocomplete = "off";
      box.append(input);
      const actions = element("div", "test-actions");
      for (const account of ["A", "B"]) {
        const b = element("button", "", `\u6D4B\u8BD5\u987E\u5BA2 ${account}`);
        b.onclick = async () => {
          try {
            await api("/api/auth/local-test", { account, key: input.value });
            await refreshIdentity();
            await current?.load?.();
            render();
          } catch (e) {
            notice(e.message);
          }
        };
        actions.append(b);
      }
      box.append(actions);
    }
  }
  parent.append(box);
}
function renderNode(parent, n, d) {
  if (n.text !== void 0) {
    parent.append(document.createTextNode(tr(String(read(n.text, d) ?? ""))));
    return;
  }
  const tag = n.tag, a = n.attrs || {};
  if (tag === "root" || tag === "block") {
    children(parent, n.children || [], d);
    return;
  }
  if (tag === "customer-auth") {
    authPanel(parent);
    return;
  }
  if (tag === "page-state") {
    if (d.loading) parent.append(element("div", "notice", "\u6B63\u5728\u8BFB\u53D6\u5E97\u94FA\u5B89\u6392\u2026"));
    if (d.error) {
      const e2 = element("div", "error", d.error), b = element("button", "", "\u91CD\u65B0\u52A0\u8F7D");
      b.onclick = () => current.load();
      e2.append(b);
      parent.append(e2);
    }
    return;
  }
  if (tag === "admin-nav") {
    const nav = element("nav", "admin-nav");
    for (const [id, label] of [["today", "\u4ECA\u5929"], ["schedule", "\u65E5\u7A0B"], ["policy", "\u5F00\u653E\u9884\u7EA6"], ["settings", "\u66F4\u591A"]]) {
      const b = element("button", a.current === id ? "active" : "", label);
      b.onclick = () => {
        trail = [];
        go("pages/admin/" + id + "/index", false);
      };
      nav.append(b);
    }
    parent.append(nav);
    return;
  }
  const mode = read(a.mode, d), e = element(tag === "view" ? "div" : tag === "text" ? "span" : tag === "switch" ? "input" : tag === "picker" ? mode ? "input" : "select" : tag);
  if (a.class) e.className = read(a.class, d);
  const calendarScale = /\b(time-canvas|time-tick|time-event)\b/.test(e.className) ? 1.7 : 1;
  if (a.style) e.style.cssText = String(read(a.style, d)).replace(/([\d.]+)rpx/g, (_, n2) => String(Number(n2) / 2 * calendarScale) + "px");
  const on = (kind, detail2) => invoke(read(a[kind], d), n, d, detail2);
  if (tag === "switch") {
    e.type = "checkbox";
    e.checked = !!read(a.checked, d);
    e.onchange = () => on("bindchange", { value: e.checked });
  } else if (tag === "picker") {
    e.className += " picker";
    if (mode) {
      e.type = mode;
      e.value = read(a.value, d) || "";
    } else {
      const items = read(a.range, d) || [];
      items.forEach((item, index) => {
        const o = element("option");
        o.value = String(index);
        o.textContent = tr(a["range-key"] ? item[a["range-key"]] : String(item));
        e.append(o);
      });
      e.value = String(read(a.value, d) || "0");
    }
    e.onchange = () => on("bindchange", { value: e.value });
  } else if (tag === "input" || tag === "textarea") {
    if (tag === "input") e.type = read(a.type, d) || "text";
    e.value = read(a.value, d) || "";
    e.placeholder = tr(read(a.placeholder, d) || "");
    if (a.maxlength) e.maxLength = Number(read(a.maxlength, d));
    e.oninput = () => on("bindinput", { value: e.value });
  } else children(e, n.children || [], d);
  if (a.disabled !== void 0) e.disabled = !!read(a.disabled, d);
  if (a.bindtap) {
    if (tag === "view" || tag === "text") {
      e.setAttribute("role", "button");
      e.tabIndex = 0;
      e.onkeydown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          e.click();
        }
      };
    }
    if (!admin && read(a.bindtap, d) === "submit" && !identity.viewer) e.disabled = true;
    e.onclick = (event) => {
      event.stopPropagation();
      on("bindtap", {});
    };
  }
  parent.append(e);
}
function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    render();
  });
}
function render() {
  if (!current) return;
  const active = document.activeElement, inputs = Array.from(screen.querySelectorAll("input,textarea,select")), idx = inputs.indexOf(active), start2 = active?.selectionStart, end = active?.selectionEnd, y = scrollY;
  const keepX = Array.from(screen.querySelectorAll(".keep-scroll-x")).map((e) => e.scrollLeft);
  screen.replaceChildren();
  children(screen, [templates[route]], current.data);
  screen.querySelectorAll(".keep-scroll-x").forEach((e, i) => {
    if (keepX[i]) e.scrollLeft = keepX[i];
  });
  if (idx >= 0) {
    const next = screen.querySelectorAll("input,textarea,select")[idx];
    next?.focus({ preventScroll: true });
    try {
      next?.setSelectionRange(start2, end);
    } catch {
    }
  }
  addAdminReschedule();
  window.scrollTo(0, y);
  document.getElementById("back").style.visibility = trail.length || current.data.stage && current.data.stage !== "home" ? "visible" : "hidden";
  const tabs = document.getElementById("tabs");
  tabs.replaceChildren();
  tabs.hidden = admin;
  if (!admin) for (const [id, label, path] of [["book", "\u9884\u7EA6", "M3 5h18v16H3z M7 3v4 M17 3v4 M3 10h18"], ["mine", "\u6211\u7684\u9884\u7EA6", "M5 3h14v18l-3-2-4 2-4-2-3 2z M8 8h8 M8 12h8"]]) {
    const b = element("button", route.includes("/" + id + "/") ? "active" : "");
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="${path}"/></svg>`;
    b.append(document.createTextNode(tr(label)));
    b.onclick = () => {
      customerSession.editingId = "";
      trail = [];
      go("pages/customer/" + id + "/index", false);
    };
    tabs.append(b);
  }
}
function assign(data, patch) {
  for (const [key, value] of Object.entries(patch)) {
    const parts = key.replace(/\[(\d+)\]/g, ".$1").split(".");
    let obj = data;
    for (const part of parts.slice(0, -1)) obj = obj[part];
    obj[parts.at(-1)] = value;
  }
}
function go(url, push = true, viewState) {
  const [next, query] = url.replace(/^\//, "").split("?");
  if (!next.startsWith(routeBase) || !pages[next]) return;
  current?.onHide?.();
  current?.onUnload?.();
  if (push && route) {
    const previousView = admin && route.includes("/schedule/") ? { date: current.data.date, query: current.data.query, expanded: current.data.expanded } : void 0;
    history.replaceState({ ...history.state, viewState: previousView }, "");
    trail.push({ url: routeURL, scroll: scrollY, viewState: previousView });
  }
  route = next;
  routeURL = next + (query ? "?" + query : "");
  const p = pages[route];
  current = { ...p.definition, data: { ...structuredClone(p.definition.data), ...viewState } };
  const instance = current;
  instance.setData = (patch) => {
    const previous = instance.data.stage;
    assign(instance.data, patch);
    if (current !== instance) return;
    if (patch.stage && patch.stage !== previous) history.pushState({ route: routeURL, stage: patch.stage }, "", "#" + route.split("/").at(-2) + "-" + patch.stage);
    queue();
  };
  document.getElementById("pageTitle").textContent = tr(p.title);
  history[push ? "pushState" : "replaceState"]({ route: routeURL, viewState }, "", "#" + route.split("/").at(-2));
  current.onLoad?.(Object.fromEntries(new URLSearchParams(query)));
  current.onShow?.();
  render();
  window.scrollTo(0, 0);
}
function back() {
  if (current?.data.stage && current.data.stage !== "home") {
    current.back();
    return;
  }
  const prev = trail.pop();
  if (prev) {
    go(prev.url, false, prev.viewState);
    window.scrollTo(0, prev.scroll);
  } else go(routeBase + (admin ? "today" : "book") + "/index", false);
}
function intent() {
  return { serviceId: current?.data.serviceId || customerSession.serviceId, editingId: customerSession.editingId, activeDate: current?.data.activeDate || "", selected: current?.data.selected || null, stage: current?.data.stage || "home" };
}
function saveIntent() {
  sessionStorage.setItem("booking-intent", JSON.stringify(intent()));
}
function intentURL() {
  const x = intent();
  return location.origin + "/?service=" + encodeURIComponent(x.serviceId) + "&date=" + encodeURIComponent(x.activeDate) + "&start=" + encodeURIComponent(x.selected?.startAt || "");
}
document.getElementById("back").onclick = back;
window.addEventListener("popstate", (event) => {
  if (event.state?.route === routeURL && event.state.stage) {
    assign(current.data, { stage: event.state.stage });
    render();
  } else if (event.state?.route) go(event.state.route, false, event.state.viewState);
});
async function start() {
  await refreshIdentity(admin);
  if (!admin && identity.admin) {
    location.replace("/admin/?v=google");
    return;
  }
  if (identity.localTest) {
    const bar = document.getElementById("localNotice");
    bar.hidden = false;
    bar.textContent = tr("\u672C\u673A\u6D4B\u8BD5 \xB7 D1 \u6570\u636E\u4F1A\u4FDD\u7559\uFF1BGoogle \u5C1A\u9700\u6B63\u5F0F\u914D\u7F6E");
  }
  const action = document.getElementById("accountAction");
  if (admin) {
    action.textContent = tr("\u9000\u51FA\u767B\u5F55");
    action.onclick = async () => {
      await api("/api/admin/logout", {});
      location.replace("/admin/login");
    };
  } else {
    const to = english2 ? "../" : "en/";
    action.textContent = english2 ? "\u4E2D\u6587" : "EN";
    action.setAttribute("aria-label", english2 ? "\u5207\u6362\u5230\u4E2D\u6587" : "Switch to English");
    action.setAttribute("lang", english2 ? "zh-CN" : "en");
    action.onclick = () => {
      location.href = to + (location.hash.startsWith("#mine") ? "#mine" : "");
    };
  }
  const hash = location.hash.slice(1).split("-")[0];
  go(routeBase + (admin ? ["today", "schedule", "policy", "settings", "pending"].includes(hash) ? hash : "today" : hash === "mine" ? "mine" : "book") + "/index", false);
  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem("booking-intent") || "null");
  } catch {
  }
  const query = new URLSearchParams(location.search);
  if (!saved && query.get("service")) saved = { serviceId: query.get("service"), activeDate: query.get("date"), selected: query.get("start") ? { startAt: query.get("start") } : null, stage: "day", editingId: "" };
  if (!admin && saved && route.includes("/book/")) {
    sessionStorage.removeItem("booking-intent");
    customerSession.serviceId = saved.serviceId;
    customerSession.editingId = saved.editingId || "";
    current.setData({ serviceId: saved.serviceId, editingId: saved.editingId || "" });
    await current.load();
    const chosen = current.state?.days.flatMap((d) => d.legalSlots).find((s) => s.startAt === saved.selected?.startAt);
    current.setData({ activeDate: saved.activeDate || "", selected: chosen || null, stage: chosen ? saved.stage : "home" });
    current.refreshViews();
  }
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !current?.data.saving && ["today", "schedule", "pending"].some((x) => route.includes("/" + x + "/"))) void current.load();
});
setInterval(() => {
  if (admin && !document.hidden && !current?.data.saving && !document.querySelector("dialog[open]") && ["today", "schedule", "pending"].some((x) => route.includes("/" + x + "/"))) void current?.load?.();
}, 3e4);
void start().catch((e) => {
  screen.textContent = e.message;
});
function addAdminReschedule() {
  if (!admin || !route.includes("/detail/") || !current.data.item || !["booked", "needs_reschedule"].includes(current.data.item.effective)) return;
  const button = element("button", "secondary", "\u4FEE\u6539\u9884\u7EA6\u65F6\u95F4");
  button.style.cssText = "display:block;width:calc(100% - 32px);max-width:876px;margin:16px auto";
  button.onclick = async () => {
    const item = current.data.item, id = current.id, box = element("dialog", "app-modal");
    box.append(element("h3", "", "\u4FEE\u6539\u9884\u7EA6\u65F6\u95F4"));
    const date = element("input", "picker");
    date.type = "date";
    date.value = current.date;
    const times2 = element("select", "picker"), feedback = element("p", "");
    const actions = element("div", "app-modal-actions"), cancel = element("button", "secondary", "\u53D6\u6D88"), confirm = element("button", "", "\u786E\u8BA4\u6539\u671F");
    cancel.onclick = () => {
      box.close();
      box.remove();
    };
    actions.append(cancel, confirm);
    box.append(date, times2, feedback, actions);
    document.body.append(box);
    box.showModal();
    let slots = [];
    const reload = async () => {
      confirm.disabled = true;
      times2.replaceChildren();
      try {
        const days = await api("/api/admin/reschedule-availability?" + new URLSearchParams({ appointmentId: id, date: date.value }));
        slots = days[0]?.legalSlots || [];
        for (const s of slots) {
          const o = element("option");
          o.value = s.startAt;
          o.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(s.startAt));
          times2.append(o);
        }
        feedback.textContent = slots.length ? "\u539F\u9884\u7EA6\u5728\u786E\u8BA4\u6210\u529F\u524D\u4FDD\u7559\u3002" : "\u5F53\u5929\u6CA1\u6709\u53EF\u7528\u65F6\u95F4\uFF0C\u8BF7\u66F4\u6362\u65E5\u671F\u3002";
        confirm.disabled = !slots.length;
      } catch (e) {
        feedback.textContent = e.message;
      }
    };
    date.onchange = () => void reload();
    confirm.onclick = async () => {
      confirm.disabled = true;
      try {
        await api("/api/admin/reschedule", { appointmentId: id, startAt: times2.value });
        current.date = date.value;
        box.close();
        box.remove();
        await current.load();
      } catch (e) {
        feedback.textContent = e.message;
        confirm.disabled = false;
      }
    };
    await reload();
  };
  screen.append(button);
}

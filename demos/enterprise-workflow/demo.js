(() => {
  "use strict";

  const STORAGE_KEY = "x7do0-ew-demo-state-v1";
  const LANGUAGE_KEY = "x7do0-language";
  const embedded = new URLSearchParams(location.search).get("embedded") === "1";
  document.documentElement.classList.toggle("is-embedded", embedded);

  const translations = {
    ar: {
      skip: "انتقل إلى التجربة",
      back: "البورتفوليو",
      demoLabel: "تجربة تفاعلية مصغرة",
      sampleData: "بيانات تجريبية فقط",
      reset: "إعادة التجربة",
      viewAs: "عرض كـ",
      employee: "موظف",
      employeeHint: "إنشاء ومتابعة الطلبات",
      manager: "مدير",
      managerHint: "مراجعة الطلبات واتخاذ القرار",
      dashboard: "لوحة التحكم",
      requests: "الطلبات",
      auditTrail: "سجل التدقيق",
      demoGoal: "هدف التجربة",
      demoGoalText: "أنشئ طلبًا كموظف، أرسله، ثم بدّل إلى المدير ووافق عليه.",
      newRequest: "طلب جديد",
      myRequests: "طلباتي",
      incomingRequests: "الطلبات الواردة",
      myRequestsHint: "جميع الطلبات في هذه التجربة",
      incomingRequestsHint: "الطلبات المرسلة للمراجعة",
      pending: "قيد الانتظار",
      pendingHint: "بانتظار قرار المدير",
      managerPendingHint: "تحتاج إلى قرارك",
      approved: "تمت الموافقة",
      approvedHint: "طلبات اكتملت داخل الـDemo",
      recentActivity: "النشاط الحالي",
      requestsOverview: "نظرة على الطلبات",
      managerRequestsOverview: "صندوق المراجعة",
      viewAll: "عرض الكل",
      flowTitle: "جرّب دورة الموافقة",
      guideCreate: "أنشئ طلبًا كموظف",
      guideSubmit: "أرسل الطلب للمراجعة",
      guideSwitch: "بدّل إلى دور المدير",
      guideApprove: "راجع الطلب ووافق عليه",
      guideVerify: "ارجع للموظف وتأكد من الحالة",
      requestWorkspace: "REQUEST WORKSPACE",
      allStatuses: "كل الحالات",
      auditTitle: "سجل الأحداث التجريبي",
      createRequestTitle: "إنشاء طلب تجريبي",
      createRequestDescription: "هذه البيانات تبقى داخل المتصفح ولا ترسل لأي خادم.",
      requestTitleLabel: "عنوان الطلب",
      categoryLabel: "الفئة",
      amountLabel: "القيمة التجريبية",
      notesLabel: "ملاحظة قصيرة",
      purchase: "شراء",
      service: "خدمة",
      other: "أخرى",
      cancel: "إلغاء",
      createDraft: "إنشاء المسودة",
      status: "الحالة",
      managerDecision: "قرار المدير",
      managerDecisionHint: "الموافقة هنا تغيّر حالة الطلب داخل هذه التجربة فقط.",
      approveRequest: "الموافقة على الطلب",
      readyToSubmit: "المسودة جاهزة للإرسال",
      readyToSubmitHint: "بعد الإرسال سيظهر الطلب في واجهة المدير.",
      submitForReview: "إرسال للمراجعة",
      employeeWorkspace: "موظف · مساحة العمل",
      managerWorkspace: "مدير · مساحة المراجعة",
      employeeContextTitle: "أنت الآن في واجهة الموظف",
      employeeContextCopy: "يمكنك إنشاء الطلب وإرساله، ثم التبديل إلى المدير لمراجعته.",
      managerContextTitle: "أنت الآن في واجهة المدير",
      managerContextCopy: "ترى هنا الطلبات التي أرسلها الموظف وتستطيع اتخاذ قرار الموافقة.",
      employeeDashboardTitle: "لوحة التحكم",
      employeeDashboardDescription: "تابع طلباتك وأنشئ طلبًا جديدًا للتجربة.",
      managerDashboardTitle: "لوحة المراجعة",
      managerDashboardDescription: "راجع الطلبات الواردة واتخذ القرار من نفس التجربة.",
      employeeRequestsTitle: "طلباتي",
      managerRequestsTitle: "الطلبات الواردة",
      auditPageTitle: "سجل التدقيق",
      auditPageDescription: "تتبّع الأحداث التي حدثت أثناء هذه الجلسة التجريبية.",
      requestsPageDescriptionEmployee: "كل الطلبات التي أنشأتها في هذه التجربة.",
      requestsPageDescriptionManager: "الطلبات المرسلة للمدير داخل هذه التجربة.",
      emptyEmployeeTitle: "لا توجد طلبات بعد",
      emptyEmployeeCopy: "أنشئ طلبًا جديدًا حتى تبدأ دورة الموافقة.",
      emptyManagerTitle: "لا توجد طلبات للمراجعة",
      emptyManagerCopy: "ارجع إلى دور الموظف وأنشئ طلبًا ثم أرسله للمراجعة.",
      emptyAuditTitle: "لا توجد أحداث بعد",
      emptyAuditCopy: "أي إنشاء أو إرسال أو موافقة ستظهر هنا.",
      draft: "مسودة",
      awaitingManager: "بانتظار المدير",
      approvedStatus: "تمت الموافقة",
      noNotes: "لا توجد ملاحظة.",
      demoRequestDefault: "طلب شراء تجريبي",
      demoNotesDefault: "طلب تجريبي لاختبار دورة الموافقة داخل البورتفوليو.",
      toastCreated: "تم إنشاء المسودة. افتح الطلب وأرسله للمراجعة.",
      toastSubmitted: "تم إرسال الطلب. بدّل الآن إلى دور المدير.",
      toastManager: "أنت الآن في واجهة المدير. افتح الطلب الوارد للمراجعة.",
      toastApproved: "تمت الموافقة. ارجع إلى الموظف لمشاهدة الحالة الجديدة.",
      toastVerified: "اكتملت دورة الـDemo: الموظف يرى الطلب كموافق عليه.",
      toastReset: "تمت إعادة التجربة إلى البداية.",
      auditCreated: "أنشأ الموظف الطلب",
      auditSubmitted: "أرسل الموظف الطلب للمراجعة",
      auditApproved: "وافق المدير على الطلب",
      byEmployee: "بواسطة الموظف",
      byManager: "بواسطة المدير",
      currency: "د.ع"
    },
    en: {
      skip: "Skip to demo",
      back: "Portfolio",
      demoLabel: "Interactive mini demo",
      sampleData: "Sample data only",
      reset: "Reset demo",
      viewAs: "View as",
      employee: "Employee",
      employeeHint: "Create and track requests",
      manager: "Manager",
      managerHint: "Review requests and decide",
      dashboard: "Dashboard",
      requests: "Requests",
      auditTrail: "Audit trail",
      demoGoal: "Demo goal",
      demoGoalText: "Create a request as Employee, submit it, switch to Manager, and approve it.",
      newRequest: "New request",
      myRequests: "My requests",
      incomingRequests: "Incoming requests",
      myRequestsHint: "All requests in this demo",
      incomingRequestsHint: "Requests submitted for review",
      pending: "Pending",
      pendingHint: "Waiting for manager decision",
      managerPendingHint: "Waiting for your decision",
      approved: "Approved",
      approvedHint: "Requests completed in the demo",
      recentActivity: "Current activity",
      requestsOverview: "Requests overview",
      managerRequestsOverview: "Review inbox",
      viewAll: "View all",
      flowTitle: "Try the approval flow",
      guideCreate: "Create a request as Employee",
      guideSubmit: "Submit the request for review",
      guideSwitch: "Switch to the Manager role",
      guideApprove: "Review and approve the request",
      guideVerify: "Return to Employee and verify status",
      requestWorkspace: "REQUEST WORKSPACE",
      allStatuses: "All statuses",
      auditTitle: "Demo event log",
      createRequestTitle: "Create a demo request",
      createRequestDescription: "This data stays in your browser and is not sent to a server.",
      requestTitleLabel: "Request title",
      categoryLabel: "Category",
      amountLabel: "Demo amount",
      notesLabel: "Short note",
      purchase: "Purchase",
      service: "Service",
      other: "Other",
      cancel: "Cancel",
      createDraft: "Create draft",
      status: "Status",
      managerDecision: "Manager decision",
      managerDecisionHint: "Approval changes this request only inside the demo.",
      approveRequest: "Approve request",
      readyToSubmit: "Draft is ready to submit",
      readyToSubmitHint: "After submission, the request will appear in the Manager view.",
      submitForReview: "Submit for review",
      employeeWorkspace: "Employee · Workspace",
      managerWorkspace: "Manager · Review workspace",
      employeeContextTitle: "You are viewing the Employee interface",
      employeeContextCopy: "Create and submit a request, then switch to Manager to review it.",
      managerContextTitle: "You are viewing the Manager interface",
      managerContextCopy: "Submitted employee requests appear here for an approval decision.",
      employeeDashboardTitle: "Dashboard",
      employeeDashboardDescription: "Track your requests and create a new request for the demo.",
      managerDashboardTitle: "Review dashboard",
      managerDashboardDescription: "Review incoming requests and make the decision in the same demo.",
      employeeRequestsTitle: "My requests",
      managerRequestsTitle: "Incoming requests",
      auditPageTitle: "Audit trail",
      auditPageDescription: "Track the actions recorded during this demo session.",
      requestsPageDescriptionEmployee: "Every request you created in this demo.",
      requestsPageDescriptionManager: "Requests submitted to the Manager in this demo.",
      emptyEmployeeTitle: "No requests yet",
      emptyEmployeeCopy: "Create a new request to start the approval flow.",
      emptyManagerTitle: "Nothing to review yet",
      emptyManagerCopy: "Switch to Employee, create a request, and submit it for review.",
      emptyAuditTitle: "No events yet",
      emptyAuditCopy: "Create, submit, and approval events will appear here.",
      draft: "Draft",
      awaitingManager: "Awaiting manager",
      approvedStatus: "Approved",
      noNotes: "No note provided.",
      demoRequestDefault: "Demo purchase request",
      demoNotesDefault: "Sample request used to demonstrate the approval workflow in the portfolio.",
      toastCreated: "Draft created. Open the request and submit it for review.",
      toastSubmitted: "Request submitted. Switch to the Manager role now.",
      toastManager: "You are now in the Manager interface. Open the incoming request.",
      toastApproved: "Request approved. Return to Employee to see the new status.",
      toastVerified: "Demo flow complete: Employee can see the approved request.",
      toastReset: "Demo reset to its initial state.",
      auditCreated: "Employee created the request",
      auditSubmitted: "Employee submitted the request for review",
      auditApproved: "Manager approved the request",
      byEmployee: "by Employee",
      byManager: "by Manager",
      currency: "IQD"
    }
  };

  const defaultState = () => ({
    role: "employee",
    activeView: "dashboard",
    requests: [],
    audit: [],
    selectedRequestId: null,
    sawManagerAfterSubmit: false,
    sawEmployeeAfterApproval: false
  });

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  function initialLanguage() {
    const urlLanguage = new URLSearchParams(location.search).get("lang");
    if (urlLanguage === "en") return "en";
    if (urlLanguage === "ar") return "ar";
    return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
  }

  let language = initialLanguage();
  let state = loadState();
  let toastTimer = null;

  function dict() {
    return translations[language];
  }

  function t(key) {
    return dict()[key] ?? key;
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        requests: Array.isArray(parsed.requests) ? parsed.requests : [],
        audit: Array.isArray(parsed.audit) ? parsed.audit : []
      };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem(LANGUAGE_KEY, language);

    qsa("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (dict()[key]) element.textContent = dict()[key];
    });

    const toggle = qs("[data-language-toggle]");
    if (toggle) {
      toggle.textContent = language === "ar" ? "EN" : "AR";
      toggle.setAttribute("aria-label", language === "ar" ? "Switch to English" : "التبديل إلى العربية");
    }

    const backLink = qs("[data-back-link]");
    if (backLink) backLink.href = language === "en" ? "../../?lang=en#projects" : "../../#projects";

    const url = new URL(location.href);
    if (language === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    history.replaceState({}, "", url);

    document.title = language === "ar"
      ? "Enterprise Workflow — تجربة تفاعلية"
      : "Enterprise Workflow — Interactive Demo";
  }

  function formatAmount(value) {
    const number = Number(value || 0);
    const locale = language === "ar" ? "ar-IQ" : "en-US";
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(number)} ${t("currency")}`;
  }

  function formatTime(value) {
    const date = new Date(value);
    const locale = language === "ar" ? "ar-IQ" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);
  }

  function categoryLabel(category) {
    return t(category === "service" ? "service" : category === "other" ? "other" : "purchase");
  }

  function statusLabel(status) {
    if (status === "approved") return t("approvedStatus");
    if (status === "pending") return t("awaitingManager");
    return t("draft");
  }

  function visibleRequests() {
    if (state.role === "manager") {
      return state.requests.filter((request) => request.status !== "draft");
    }
    return state.requests;
  }

  function counts() {
    const requests = visibleRequests();
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      approved: requests.filter((request) => request.status === "approved").length
    };
  }

  function renderRole() {
    qsa("[data-role-switch]").forEach((button) => {
      const active = button.dataset.roleSwitch === state.role;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const isEmployee = state.role === "employee";
    qs("[data-role-avatar]").textContent = isEmployee ? "👤" : "👔";
    qs("[data-role-context-title]").textContent = t(isEmployee ? "employeeContextTitle" : "managerContextTitle");
    qs("[data-role-context-copy]").textContent = t(isEmployee ? "employeeContextCopy" : "managerContextCopy");
    qs("[data-role-pill]").textContent = isEmployee ? "EMPLOYEE" : "MANAGER";
    qs("[data-current-role-label]").textContent = t(isEmployee ? "employeeWorkspace" : "managerWorkspace");

    const createButton = qs("[data-create-request]");
    createButton.hidden = !isEmployee;

    const metricLabel = qs('[data-i18n="myRequests"]');
    const metricHint = qs('[data-i18n="myRequestsHint"]');
    const pendingHint = qs('[data-i18n="pendingHint"]');
    const overviewTitle = qs('[data-i18n="requestsOverview"]');
    if (metricLabel) metricLabel.textContent = t(isEmployee ? "myRequests" : "incomingRequests");
    if (metricHint) metricHint.textContent = t(isEmployee ? "myRequestsHint" : "incomingRequestsHint");
    if (pendingHint) pendingHint.textContent = t(isEmployee ? "pendingHint" : "managerPendingHint");
    if (overviewTitle) overviewTitle.textContent = t(isEmployee ? "requestsOverview" : "managerRequestsOverview");

    if (state.role === "manager" && state.requests.some((request) => request.status !== "draft")) {
      state.sawManagerAfterSubmit = true;
    }

    if (state.role === "employee" && state.requests.some((request) => request.status === "approved")) {
      if (!state.sawEmployeeAfterApproval) showToast(t("toastVerified"));
      state.sawEmployeeAfterApproval = true;
    }
  }

  function renderViewHeader() {
    const isEmployee = state.role === "employee";
    const title = qs("[data-page-title]");
    const description = qs("[data-page-description]");

    if (state.activeView === "dashboard") {
      title.textContent = t(isEmployee ? "employeeDashboardTitle" : "managerDashboardTitle");
      description.textContent = t(isEmployee ? "employeeDashboardDescription" : "managerDashboardDescription");
    } else if (state.activeView === "requests") {
      title.textContent = t(isEmployee ? "employeeRequestsTitle" : "managerRequestsTitle");
      description.textContent = t(isEmployee ? "requestsPageDescriptionEmployee" : "requestsPageDescriptionManager");
    } else {
      title.textContent = t("auditPageTitle");
      description.textContent = t("auditPageDescription");
    }

    qs("[data-requests-title]").textContent = t(isEmployee ? "employeeRequestsTitle" : "managerRequestsTitle");
  }

  function renderNavigation() {
    qsa("[data-nav-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.navView === state.activeView);
    });
    qsa("[data-view]").forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === state.activeView);
    });
  }

  function renderMetrics() {
    const metric = counts();
    qs("[data-metric-total]").textContent = metric.total;
    qs("[data-metric-pending]").textContent = metric.pending;
    qs("[data-metric-approved]").textContent = metric.approved;
    qs("[data-request-count]").textContent = metric.total;
  }

  function createEmptyState(kind) {
    const wrap = document.createElement("div");
    wrap.className = "empty-state";
    const icon = document.createElement("span");
    icon.textContent = kind === "audit" ? "✓" : "+";
    const title = document.createElement("strong");
    const copy = document.createElement("p");

    if (kind === "audit") {
      title.textContent = t("emptyAuditTitle");
      copy.textContent = t("emptyAuditCopy");
    } else if (state.role === "manager") {
      title.textContent = t("emptyManagerTitle");
      copy.textContent = t("emptyManagerCopy");
    } else {
      title.textContent = t("emptyEmployeeTitle");
      copy.textContent = t("emptyEmployeeCopy");
    }

    wrap.append(icon, title, copy);
    return wrap;
  }

  function createRequestRow(request) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "request-row";
    button.dataset.requestId = request.id;

    const main = document.createElement("div");
    main.className = "request-main";
    const icon = document.createElement("span");
    icon.className = "request-icon";
    icon.textContent = request.category === "service" ? "SV" : request.category === "other" ? "OT" : "PO";

    const copy = document.createElement("div");
    copy.className = "request-copy";
    const title = document.createElement("strong");
    title.textContent = request.title;
    const meta = document.createElement("div");
    meta.className = "request-meta";
    const id = document.createElement("span");
    id.textContent = request.id;
    const category = document.createElement("span");
    category.textContent = categoryLabel(request.category);
    const amount = document.createElement("span");
    amount.textContent = formatAmount(request.amount);
    meta.append(id, category, amount);
    copy.append(title, meta);
    main.append(icon, copy);

    const status = document.createElement("div");
    status.className = "request-status";
    const chip = document.createElement("span");
    chip.className = `status-chip status-chip--${request.status}`;
    chip.textContent = statusLabel(request.status);
    status.append(chip);

    button.append(main, status);
    button.addEventListener("click", () => openRequestDetail(request.id));
    return button;
  }

  function renderRequests() {
    const requests = visibleRequests();
    const dashboardList = qs("[data-dashboard-request-list]");
    const fullList = qs("[data-full-request-list]");
    dashboardList.replaceChildren();
    fullList.replaceChildren();

    if (!requests.length) {
      dashboardList.append(createEmptyState("requests"));
      fullList.append(createEmptyState("requests"));
      return;
    }

    const sorted = [...requests].sort((a, b) => b.createdAt - a.createdAt);
    sorted.slice(0, 3).forEach((request) => dashboardList.append(createRequestRow(request)));
    sorted.forEach((request) => fullList.append(createRequestRow(request)));
  }

  function auditText(event) {
    if (event.type === "approved") return t("auditApproved");
    if (event.type === "submitted") return t("auditSubmitted");
    return t("auditCreated");
  }

  function renderAudit() {
    const list = qs("[data-audit-list]");
    list.replaceChildren();
    if (!state.audit.length) {
      list.append(createEmptyState("audit"));
      return;
    }

    [...state.audit].reverse().forEach((event) => {
      const entry = document.createElement("article");
      entry.className = "audit-entry";
      const dot = document.createElement("span");
      dot.className = "audit-dot";
      const title = document.createElement("strong");
      title.textContent = `${auditText(event)} · ${event.requestId}`;
      const meta = document.createElement("p");
      meta.textContent = t(event.actor === "manager" ? "byManager" : "byEmployee");
      const time = document.createElement("time");
      time.dateTime = new Date(event.at).toISOString();
      time.textContent = formatTime(event.at);
      entry.append(dot, title, meta, time);
      list.append(entry);
    });
  }

  function guideProgress() {
    const hasCreated = state.requests.length > 0;
    const hasSubmitted = state.requests.some((request) => request.status === "pending" || request.status === "approved");
    const hasApproved = state.requests.some((request) => request.status === "approved");
    return {
      create: hasCreated ? "complete" : "current",
      submit: !hasCreated ? "idle" : hasSubmitted ? "complete" : "current",
      switch: !hasSubmitted ? "idle" : state.sawManagerAfterSubmit ? "complete" : "current",
      approve: !state.sawManagerAfterSubmit ? "idle" : hasApproved ? "complete" : "current",
      verify: !hasApproved ? "idle" : state.sawEmployeeAfterApproval ? "complete" : "current"
    };
  }

  function renderGuide() {
    const progress = guideProgress();
    qsa("[data-guide-step]").forEach((item) => {
      const value = progress[item.dataset.guideStep];
      item.classList.toggle("is-current", value === "current");
      item.classList.toggle("is-complete", value === "complete");
    });
  }

  function notifyHost() {
    if (!embedded || parent === window) return;
    parent.postMessage({
      source: "enterprise-workflow-demo",
      type: "state",
      role: state.role,
      progress: guideProgress(),
    }, location.origin);
  }

  function render() {
    applyLanguage();
    renderRole();
    renderNavigation();
    renderViewHeader();
    renderMetrics();
    renderRequests();
    renderAudit();
    renderGuide();
    saveState();
    notifyHost();
  }

  function openCreateDialog() {
    if (state.role !== "employee") return;
    const dialog = qs("[data-request-dialog]");
    qs("[data-request-title-input]").value = t("demoRequestDefault");
    qs("[data-request-category]").value = "purchase";
    qs("[data-request-amount]").value = "250000";
    qs("[data-request-notes]").value = t("demoNotesDefault");
    dialog.showModal();
    window.setTimeout(() => qs("[data-request-title-input]").focus(), 30);
  }

  function createRequest(form) {
    const data = new FormData(form);
    const id = `REQ-DEMO-${String(state.requests.length + 1).padStart(4, "0")}`;
    const request = {
      id,
      title: String(data.get("title") || "").trim() || t("demoRequestDefault"),
      category: String(data.get("category") || "purchase"),
      amount: Math.max(0, Number(data.get("amount") || 0)),
      notes: String(data.get("notes") || "").trim(),
      status: "draft",
      createdAt: Date.now()
    };
    state.requests.push(request);
    state.audit.push({ type: "created", requestId: id, actor: "employee", at: Date.now() });
    state.selectedRequestId = id;
    saveState();
    qs("[data-request-dialog]").close();
    render();
    showToast(t("toastCreated"));
    openRequestDetail(id);
  }

  function selectedRequest() {
    return state.requests.find((request) => request.id === state.selectedRequestId) ?? null;
  }

  function openRequestDetail(id) {
    const request = state.requests.find((item) => item.id === id);
    if (!request) return;
    state.selectedRequestId = id;
    saveState();

    qs("[data-detail-id]").textContent = request.id;
    qs("[data-detail-title]").textContent = request.title;
    qs("[data-detail-status-copy]").textContent = statusLabel(request.status);
    qs("[data-detail-category]").textContent = categoryLabel(request.category);
    qs("[data-detail-amount]").textContent = formatAmount(request.amount);
    qs("[data-detail-status]").textContent = statusLabel(request.status);
    qs("[data-detail-notes]").textContent = request.notes || t("noNotes");

    const managerActions = qs("[data-manager-actions]");
    const employeeActions = qs("[data-employee-actions]");
    managerActions.hidden = !(state.role === "manager" && request.status === "pending");
    employeeActions.hidden = !(state.role === "employee" && request.status === "draft");

    qs("[data-detail-dialog]").showModal();
  }

  function submitSelectedRequest() {
    const request = selectedRequest();
    if (!request || state.role !== "employee" || request.status !== "draft") return;
    request.status = "pending";
    state.audit.push({ type: "submitted", requestId: request.id, actor: "employee", at: Date.now() });
    saveState();
    qs("[data-detail-dialog]").close();
    render();
    showToast(t("toastSubmitted"));
  }

  function approveSelectedRequest() {
    const request = selectedRequest();
    if (!request || state.role !== "manager" || request.status !== "pending") return;
    request.status = "approved";
    state.audit.push({ type: "approved", requestId: request.id, actor: "manager", at: Date.now() });
    saveState();
    qs("[data-detail-dialog]").close();
    render();
    showToast(t("toastApproved"));
  }

  function switchRole(role) {
    if (!['employee', 'manager'].includes(role) || role === state.role) return;
    state.role = role;
    state.activeView = "dashboard";
    if (role === "manager" && state.requests.some((request) => request.status === "pending" || request.status === "approved")) {
      state.sawManagerAfterSubmit = true;
    }
    if (role === "employee" && state.requests.some((request) => request.status === "approved")) {
      state.sawEmployeeAfterApproval = true;
    }
    saveState();
    render();

    if (role === "manager" && state.requests.some((request) => request.status === "pending")) {
      showToast(t("toastManager"));
    } else if (role === "employee" && state.requests.some((request) => request.status === "approved")) {
      showToast(t("toastVerified"));
    }
  }

  function switchView(view) {
    if (!["dashboard", "requests", "audit"].includes(view)) return;
    state.activeView = view;
    saveState();
    renderNavigation();
    renderViewHeader();
    qs("#demo-main")?.focus({ preventScroll: true });
  }

  function resetDemo() {
    state = defaultState();
    sessionStorage.removeItem(STORAGE_KEY);
    qsa("dialog[open]").forEach((dialog) => dialog.close());
    render();
    showToast(t("toastReset"));
  }

  function showToast(message) {
    const toast = qs("[data-toast]");
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function setupEvents() {
    qsa("[data-role-switch]").forEach((button) => {
      button.addEventListener("click", () => switchRole(button.dataset.roleSwitch));
    });

    qsa("[data-nav-view]").forEach((button) => {
      button.addEventListener("click", () => switchView(button.dataset.navView));
    });

    qs("[data-create-request]").addEventListener("click", openCreateDialog);
    qs("[data-open-requests]").addEventListener("click", () => switchView("requests"));
    qs("[data-reset]").addEventListener("click", resetDemo);
    qs("[data-language-toggle]").addEventListener("click", () => {
      language = language === "ar" ? "en" : "ar";
      render();
    });

    qsa("[data-dialog-close]").forEach((button) => {
      button.addEventListener("click", () => qs("[data-request-dialog]").close());
    });
    qs("[data-detail-close]").addEventListener("click", () => qs("[data-detail-dialog]").close());

    qs("[data-request-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      createRequest(event.currentTarget);
    });

    qs("[data-submit-request]").addEventListener("click", submitSelectedRequest);
    qs("[data-approve]").addEventListener("click", approveSelectedRequest);

    qsa("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    });

    addEventListener("message", (event) => {
      if (!embedded || event.origin !== location.origin || event.data?.source !== "x7do0-portfolio") return;
      if (event.data.type === "set-role") switchRole(event.data.role);
      if (event.data.type === "reset") resetDemo();
    });
  }

  function init() {
    setupEvents();
    render();
  }

  init();
})();

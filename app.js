(() => {
  "use strict";

  const state = {
    language: "ar",
    content: null,
    flowStep: 2,
    flowTimer: null
  };

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const languageFromUrl = new URLSearchParams(window.location.search).get("lang");
  const storedLanguage = localStorage.getItem("x7do0-language");
  const initialLanguage = languageFromUrl === "en" ? "en" : storedLanguage === "en" ? "en" : "ar";

  async function fetchContent(language) {
    const response = await fetch(`./content/portfolio.${language}.json`, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Could not load portfolio content (${response.status}).`);
    }
    return response.json();
  }

  function setText(selector, value, parent = document) {
    const element = qs(selector, parent);
    if (element && typeof value === "string") {
      element.textContent = value;
    }
  }

  function setMeta(selector, value) {
    const element = qs(selector);
    if (element && value) {
      element.setAttribute("content", value);
    }
  }

  function withLanguage(url) {
    if (state.language !== "en") return url;
    const [path, hash = ""] = url.split("#");
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}lang=en${hash ? `#${hash}` : ""}`;
  }

  function renderHeader(content) {
    qsa("[data-nav]").forEach((element) => {
      const key = element.dataset.nav;
      element.textContent = content.nav[key] ?? element.textContent;
      if (key === "resume") {
        element.href = withLanguage("./resume/");
      }
    });

    qsa("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });
  }

  function renderHero(content) {
    setText("#hero-title", content.hero.title);
    setText(".hero-description", content.hero.description);
    setText("[data-action='primary']", content.hero.primaryAction);
    setText("[data-action='secondary']", content.hero.secondaryAction);

    const proof = qs("#hero-proof");
    proof.replaceChildren(
      ...content.hero.proofItems.map((item) => {
        const span = document.createElement("span");
        span.textContent = item;
        return span;
      })
    );
  }

  function previewCopy() {
    if (state.language === "en") {
      return {
        open: "Try project",
        enterprise: {
          portal: "Employee portal",
          role: "Employee",
          nav: ["Dashboard", "My requests", "Audit trail"],
          title: "My requests",
          newRequest: "New request",
          metricTotal: "Total",
          metricPending: "Pending",
          metricApproved: "Approved",
          request: "Equipment purchase request",
          status: "Awaiting manager"
        },
        academy: {
          path: "Python Fundamentals",
          progress: "Progress",
          lesson: "Variables & printing",
          copy: "Learn the idea, edit the example, then validate your solution.",
          lessons: ["Lesson", "Practice", "Progress"],
          run: "Check solution"
        },
        mahsoob: {
          cashier: "Cashier",
          products: "Products",
          reports: "Reports",
          title: "New sale",
          scan: "Scan barcode or search product",
          item1: "Mineral water",
          item2: "Notebook",
          cart: "Cart",
          total: "Total",
          checkout: "Complete sale"
        },
        masroofi: {
          greeting: "Good evening",
          balance: "Current balance",
          income: "Income",
          expenses: "Expenses",
          transactions: "Recent transactions",
          salary: "Demo salary",
          shopping: "Home shopping",
          add: "Add expense"
        }
      };
    }

    return {
      open: "جرّب المشروع",
      enterprise: {
        portal: "بوابة الموظف",
        role: "موظف",
        nav: ["لوحة التحكم", "طلباتي", "سجل التدقيق"],
        title: "طلباتي",
        newRequest: "طلب جديد",
        metricTotal: "الإجمالي",
        metricPending: "قيد الانتظار",
        metricApproved: "تمت الموافقة",
        request: "طلب شراء أجهزة",
        status: "بانتظار المدير"
      },
      academy: {
        path: "أساسيات بايثون",
        progress: "التقدم",
        lesson: "المتغيرات والطباعة",
        copy: "افهم الفكرة، عدّل المثال، ثم تحقق من الحل داخل المسار.",
        lessons: ["الدرس", "التمرين", "التقدم"],
        run: "تحقق من الحل"
      },
      mahsoob: {
        cashier: "الكاشير",
        products: "المنتجات",
        reports: "التقارير",
        title: "عملية بيع جديدة",
        scan: "امسح الباركود أو ابحث عن منتج",
        item1: "مياه معدنية",
        item2: "دفتر ملاحظات",
        cart: "السلة",
        total: "الإجمالي",
        checkout: "إكمال البيع"
      },
      masroofi: {
        greeting: "مساء الخير",
        balance: "الرصيد الحالي",
        income: "الدخل",
        expenses: "المصروفات",
        transactions: "آخر العمليات",
        salary: "راتب تجريبي",
        shopping: "مشتريات منزلية",
        add: "إضافة مصروف"
      }
    };
  }

  function previewMarkup(slug) {
    const copy = previewCopy();
    const demoHref = withLanguage(`./demos/${slug}/`);

    if (slug === "enterprise-workflow") {
      const p = copy.enterprise;
      return `
        <a class="live-preview-link live-enterprise" href="${demoHref}" aria-label="${copy.open}: Enterprise Workflow">
          <div class="live-appbar">
            <span class="live-brand"><i>EW</i><b>Enterprise Workflow</b></span>
            <span class="live-role-badge">${p.role}</span>
          </div>
          <div class="live-enterprise-body">
            <aside class="live-enterprise-nav">
              <span class="is-active"><i></i>${p.nav[0]}</span>
              <span><i></i>${p.nav[1]}</span>
              <span><i></i>${p.nav[2]}</span>
            </aside>
            <div class="live-enterprise-main">
              <div class="live-screen-head"><div><small>${p.portal}</small><strong>${p.title}</strong></div><em>+ ${p.newRequest}</em></div>
              <div class="live-metrics">
                <span><small>${p.metricTotal}</small><b>03</b></span>
                <span><small>${p.metricPending}</small><b>01</b></span>
                <span><small>${p.metricApproved}</small><b>02</b></span>
              </div>
              <div class="live-request-row"><span class="live-request-mark">PO</span><div><b>${p.request}</b><small>REQ-2026-0837 · 250,000 IQD</small></div><em>${p.status}</em></div>
            </div>
          </div>
          <span class="live-try">${copy.open}<b>↗</b></span>
        </a>`;
    }

    if (slug === "coding-academy") {
      const p = copy.academy;
      return `
        <a class="live-preview-link live-academy" href="${demoHref}" aria-label="${copy.open}: Coding Academy">
          <div class="live-academy-top"><span class="live-brand"><i>&lt;/&gt;</i><b>X7do0 Academy</b></span><span>50%</span></div>
          <div class="live-academy-body">
            <aside class="live-academy-nav">
              <strong>${p.path}</strong>
              ${p.lessons.map((item, index) => `<span class="${index === 0 ? "is-active" : ""}"><i>0${index + 1}</i>${item}</span>`).join("")}
              <div><small>${p.progress}</small><b><i style="width:50%"></i></b></div>
            </aside>
            <div class="live-academy-main">
              <small>LESSON 01 · PYTHON</small>
              <h4>${p.lesson}</h4>
              <p>${p.copy}</p>
              <pre><code><span>name</span> = <em>"x7do0"</em>\n<b>print</b>(name)</code></pre>
              <button type="button" tabindex="-1">${p.run}</button>
            </div>
          </div>
          <span class="live-try">${copy.open}<b>↗</b></span>
        </a>`;
    }

    if (slug === "mahsoob") {
      const p = copy.mahsoob;
      return `
        <a class="live-preview-link live-mahsoob" href="${demoHref}" aria-label="${copy.open}: Mahsoob POS">
          <div class="live-mahsoob-body">
            <aside class="live-mahsoob-nav">
              <span class="live-mahsoob-logo">م</span><strong>محسوب</strong>
              <span class="is-active">▣ ${p.cashier}</span><span>□ ${p.products}</span><span>⌁ ${p.reports}</span>
              <small>Mahsoob POS</small>
            </aside>
            <div class="live-mahsoob-main">
              <div class="live-mahsoob-head"><div><small>POS / CASHIER</small><strong>${p.title}</strong></div><span>● OFFLINE</span></div>
              <div class="live-mahsoob-search">⌕ <span>${p.scan}</span></div>
              <div class="live-mahsoob-grid">
                <div class="live-product-list"><span><i>01</i><b>${p.item1}</b><em>500</em></span><span><i>02</i><b>${p.item2}</b><em>2,250</em></span></div>
                <div class="live-cart"><small>${p.cart}</small><span><b>${p.item1}</b><em>500</em></span><span><b>${p.item2}</b><em>2,250</em></span><div><small>${p.total}</small><strong>2,750 IQD</strong></div><button type="button" tabindex="-1">${p.checkout}</button></div>
              </div>
            </div>
          </div>
          <span class="live-try">${copy.open}<b>↗</b></span>
        </a>`;
    }

    const p = copy.masroofi;
    return `
      <a class="live-preview-link live-masroofi" href="${demoHref}" aria-label="${copy.open}: Masroofi">
        <div class="live-masroofi-top"><span class="live-masroofi-logo">م</span><strong>مصروفي</strong><span>•••</span></div>
        <div class="live-masroofi-main">
          <div class="live-masroofi-head"><div><small>${p.greeting}</small><b>${p.balance}</b></div><button type="button" tabindex="-1">+ ${p.add}</button></div>
          <div class="live-balance-card"><small>${p.balance}</small><strong>1,350,000 <em>د.ع</em></strong><span>↑ +8.4%</span></div>
          <div class="live-money-stats"><span><small>${p.income}</small><b>1,500,000</b></span><span><small>${p.expenses}</small><b>150,000</b></span></div>
          <div class="live-transactions"><small>${p.transactions}</small><span><i>↗</i><b>${p.salary}</b><em>+1,500,000</em></span><span><i>↘</i><b>${p.shopping}</b><em>−150,000</em></span></div>
        </div>
        <span class="live-try">${copy.open}<b>↗</b></span>
      </a>`;
  }

  function renderProjectPreview(article, project) {
    const preview = qs(".workflow-canvas, .academy-canvas", article);
    if (!preview) return;
    preview.classList.add("project-live-preview");
    preview.dataset.livePreview = project.slug;
    preview.removeAttribute("aria-hidden");
    preview.setAttribute("aria-label", `${previewCopy().open}: ${project.title}`);
    preview.innerHTML = previewMarkup(project.slug);
  }

  function renderProjects(content) {
    setText("#projects-title", content.projectsSection.title);
    setText("#projects-description", content.projectsSection.description);

    content.projects.forEach((project, index) => {
      const article = qs(`[data-project="${project.slug}"]`);
      if (!article) return;

      setText("h3", project.title, article);
      const summary = qs(".project-copy > p", article);
      if (summary) summary.textContent = project.summary;

      const link = qs("[data-project-open]", article);
      if (link) {
        const label = qs("span", link);
        if (label) label.textContent = project.cta;
        link.href = withLanguage(`./projects/${project.slug}/`);
        link.setAttribute("aria-label", `${project.cta}: ${project.title}`);
      }

      const number = qs(".project-number", article);
      if (number) number.textContent = String(index + 1).padStart(2, "0");
      renderProjectPreview(article, project);
    });
  }

  function renderCapabilities(content) {
    setText("#capabilities-title", content.skillsSection.title);
    setText("#technologies-title", content.technologiesSection.title);

    const list = qs("#capability-list");
    list.replaceChildren(
      ...content.skillsSection.items.map((item) => {
        const entry = document.createElement("li");
        const heading = document.createElement("h3");
        heading.textContent = item;
        entry.append(heading);
        return entry;
      })
    );

    const groups = qs("#technology-groups");
    groups.replaceChildren(
      ...content.technologiesSection.groups.map((group) => {
        const section = document.createElement("section");
        section.className = "technology-group";
        const title = document.createElement("h4");
        title.textContent = group.title;
        const items = document.createElement("p");
        items.append(
          ...group.items.map((item) => {
            const span = document.createElement("span");
            span.textContent = item;
            return span;
          })
        );
        section.append(title, items);
        return section;
      })
    );
  }

  function renderEducation(content) {
    setText("#education-title", content.education.title);
    setText(".institution", content.education.institution);
    setText(".achievement", content.education.description);
  }

  function renderKnowledge(content) {
    setText("#knowledge-title", content.knowledge.title);
    setText("#knowledge-description", content.knowledge.description);
    qsa(".media-pending p").forEach((element) => {
      element.textContent = content.knowledge.pendingLabel;
    });
  }

  function renderContact(content) {
    setText("#contact-title", content.contact.title);
    setText("#contact-description", content.contact.description);

    const links = qs("#contact-links");
    const orderedLinks = [
      ...content.contact.links.filter((link) => link.url),
      ...content.contact.links.filter((link) => !link.url)
    ];

    links.replaceChildren(
      ...orderedLinks.map((link) => {
        const element = document.createElement(link.url ? "a" : "span");
        element.className = `contact-link${link.url ? "" : " is-disabled"}`;
        element.dataset.contactId = link.id;

        const label = document.createElement("span");
        label.textContent = link.label;
        element.append(label);

        if (link.url) {
          element.href = link.url;
          element.target = "_blank";
          element.rel = "noopener noreferrer";
          element.setAttribute("aria-label", `${link.label} — ${state.language === "ar" ? "يفتح في نافذة جديدة" : "opens in a new tab"}`);
          element.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>');
        } else {
          element.setAttribute("aria-disabled", "true");
          const pending = document.createElement("small");
          pending.textContent = content.ui.upcoming;
          element.append(pending);
        }

        return element;
      })
    );
  }

  function renderInterface(content) {
    qsa("[data-ui]").forEach((element) => {
      const value = content.ui[element.dataset.ui];
      if (typeof value === "string") element.textContent = value;
    });

    qsa("[data-ui-aria]").forEach((element) => {
      const value = content.ui[element.dataset.uiAria];
      if (typeof value === "string") element.setAttribute("aria-label", value);
    });

    content.ui.flowStates.forEach((label, index) => {
      setText(`[data-flow-label="${index}"]`, label);
    });
    updateFlow(state.flowStep, false);
  }

  function renderStructuredData(content) {
    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          name: content.brand.name,
          alternateName: "x7do0",
          jobTitle: content.brand.role,
          description: content.hero.description,
          url: "https://x7do0.github.io/X7do0-portfolio/",
          sameAs: ["https://github.com/x7do0"]
        },
        {
          "@type": "ItemList",
          name: content.projectsSection.title,
          itemListElement: content.projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: project.title,
            url: `https://x7do0.github.io/X7do0-portfolio/projects/${project.slug}/`
          }))
        }
      ]
    };
    qs("#structured-data").textContent = JSON.stringify(graph);
  }

  function updatePageMetadata(content) {
    document.title = content.meta.title;
    setMeta('meta[name="description"]', content.meta.description);
    setMeta('meta[property="og:title"]', content.meta.title);
    setMeta('meta[property="og:description"]', content.meta.description);
    setMeta('meta[property="og:locale"]', state.language === "ar" ? "ar_IQ" : "en_US");

    const canonical = qs('link[rel="canonical"]');
    if (canonical) {
      canonical.href = state.language === "en"
        ? "https://x7do0.github.io/X7do0-portfolio/?lang=en"
        : "https://x7do0.github.io/X7do0-portfolio/";
    }
  }

  async function applyLanguage(language, { updateUrl = true } = {}) {
    const normalizedLanguage = language === "en" ? "en" : "ar";
    const content = await fetchContent(normalizedLanguage);

    state.language = normalizedLanguage;
    state.content = content;
    document.documentElement.lang = normalizedLanguage;
    document.documentElement.dir = normalizedLanguage === "ar" ? "rtl" : "ltr";
    localStorage.setItem("x7do0-language", normalizedLanguage);

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (normalizedLanguage === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      history.replaceState({}, "", url);
    }

    renderHeader(content);
    renderHero(content);
    renderProjects(content);
    renderCapabilities(content);
    renderEducation(content);
    renderKnowledge(content);
    renderContact(content);
    renderInterface(content);
    renderStructuredData(content);
    updatePageMetadata(content);
    setText("#footer-name", content.brand.name);
  }

  function updateFlow(nextStep, animate = true) {
    const maxStep = 4;
    state.flowStep = Math.max(0, Math.min(maxStep, Number(nextStep)));
    const steps = qsa(".flow-step");
    steps.forEach((step, index) => {
      step.classList.toggle("is-active", index === state.flowStep);
      step.classList.toggle("is-complete", index < state.flowStep);
    });

    const progress = qs(".flow-track span");
    if (progress) progress.style.width = `${state.flowStep * 25}%`;
    const status = qs("[data-flow-state]");
    if (status && state.content) {
      status.textContent = state.content.ui.flowStatus[state.flowStep];
    }

    if (animate) restartFlowTimer();
  }

  function restartFlowTimer() {
    window.clearInterval(state.flowTimer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    state.flowTimer = window.setInterval(() => {
      updateFlow((state.flowStep + 1) % 5, false);
    }, 2800);
  }

  function setupFlowInteraction() {
    qsa(".flow-step").forEach((step) => {
      step.addEventListener("click", () => updateFlow(step.dataset.step));
    });

    const canvas = qs(".workflow-canvas");
    canvas?.addEventListener("mouseenter", () => window.clearInterval(state.flowTimer));
    canvas?.addEventListener("mouseleave", restartFlowTimer);
    canvas?.addEventListener("focusin", () => window.clearInterval(state.flowTimer));
    canvas?.addEventListener("focusout", restartFlowTimer);
  }

  function setupLanguageSwitch() {
    qsa("[data-language]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (button.dataset.language === state.language) return;
        button.disabled = true;
        try {
          await applyLanguage(button.dataset.language);
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function setupMobileMenu() {
    const button = qs(".menu-button");
    const menu = qs("#mobile-menu");
    if (!button || !menu) return;

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      menu.classList.toggle("is-open", !isOpen);
    });

    qsa("a", menu).forEach((link) => {
      link.addEventListener("click", () => {
        button.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  function setupScrollEffects() {
    const header = qs("#site-header");
    const progress = qs(".scroll-progress span");

    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      header?.classList.toggle("is-scrolled", scrollTop > 24);
      if (progress) progress.style.width = `${scrollable > 0 ? (scrollTop / scrollable) * 100 : 0}%`;
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    qsa(".reveal").forEach((element) => revealObserver.observe(element));

    const navigationLinks = qsa('.desktop-nav a[href^="#"]');
    const sections = qsa("main > section[id]");
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          link.classList.toggle("is-active", link.hash === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -55%" });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  function setupPointerGlow() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const glow = qs(".pointer-glow");
    if (!glow) return;
    document.body.classList.add("has-pointer");
    window.addEventListener("pointermove", (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  async function init() {
    setupLanguageSwitch();
    setupMobileMenu();
    setupScrollEffects();
    setupPointerGlow();
    setupFlowInteraction();
    setText("#footer-year", String(new Date().getFullYear()));

    try {
      await applyLanguage(initialLanguage, { updateUrl: false });
      restartFlowTimer();
    } catch (error) {
      console.error(error);
      document.documentElement.classList.add("content-load-failed");
    }
  }

  init();
})();

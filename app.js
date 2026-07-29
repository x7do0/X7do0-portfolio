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

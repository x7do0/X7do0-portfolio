(() => {
  "use strict";

  const state = { language: "ar", content: null };
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const icons = {
    workflow: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="14" width="7" height="6" rx="1"/><path d="M10 7h4a3 3 0 0 1 3 3v4M7 10v4a3 3 0 0 0 3 3h4"/></svg>',
    academy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2.2 7 2.2 10 0v-5M21 9v6"/></svg>',
    mahsoob: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/></svg>',
    masroofi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12v4"/><path d="M16 12h5v4h-5a2 2 0 1 1 0-4Z"/></svg>',
    backend: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></svg>',
    web: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    database: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></svg>',
    quality: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
    git: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 10 10-10 10L2 12 12 2Z"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="16" cy="8" r="1.5"/><path d="M9.5 8h5M8 9.5v3l6.5 3"/></svg>',
    ai: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8A3 3 0 0 0 6 14v1a3 3 0 0 0 3 3h1V4H9ZM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8A3 3 0 0 1 18 14v1a3 3 0 0 1-3 3h-1V4h1Z"/><path d="M10 9H8M14 9h2M10 14H8M14 14h2M12 18v4"/></svg>',
    education: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/></svg>',
    focus: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3V1M21 12h2M12 21v2M3 12H1"/></svg>',
    projects: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.2-.4 6.5-1.6 6.5-7A5.4 5.4 0 0 0 19 3.7 5 5 0 0 0 18.9 0S17.7-.4 15 1.5a13.4 13.4 0 0 0-7 0C5.3-.4 4.1 0 4.1 0A5 5 0 0 0 4 3.7a5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.5 7A4.8 4.8 0 0 0 8 18v4M8 19c-3 .9-3-1.5-4-2"/></svg>'
  };

  function text(selector, value, root = document) {
    const node = qs(selector, root);
    if (node && typeof value === "string") node.textContent = value;
  }

  function localizedUrl(url) {
    if (state.language !== "en") return url;
    const [path, hash] = url.split("#");
    return `${path}${path.includes("?") ? "&" : "?"}lang=en${hash ? `#${hash}` : ""}`;
  }

  function setDocument(content) {
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
    document.title = content.meta.title;
    qs('meta[name="description"]').content = content.meta.description;
    qs('meta[property="og:title"]').content = content.meta.title;
    qs('meta[property="og:description"]').content = content.meta.description;
    qsa("[data-language]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.language === state.language)));
  }

  function renderStatic(content) {
    qsa("[data-brand]").forEach((node) => { node.textContent = content.brand[node.dataset.brand] || ""; });
    qsa("[data-hero]").forEach((node) => { node.textContent = content.hero[node.dataset.hero] || ""; });
    qsa("[data-about]").forEach((node) => { node.textContent = content.about[node.dataset.about] || ""; });
    qsa("[data-projects-section]").forEach((node) => { node.textContent = content.projectsSection[node.dataset.projectsSection] || ""; });
    qsa("[data-skills-section]").forEach((node) => { node.textContent = content.skillsSection[node.dataset.skillsSection] || ""; });
    qsa("[data-knowledge]").forEach((node) => { node.textContent = content.knowledge[node.dataset.knowledge] || ""; });
    qsa("[data-contact]").forEach((node) => { node.textContent = content.contact[node.dataset.contact] || ""; });
    qsa("[data-resume]").forEach((node) => { node.textContent = content.resume[node.dataset.resume] || ""; });
    qsa("[data-education]").forEach((node) => { node.textContent = content.education[node.dataset.education] || ""; });
    qsa("[data-copy]").forEach((node) => { if (content.home[node.dataset.copy]) node.textContent = content.home[node.dataset.copy]; });
    qsa("[data-aria]").forEach((node) => { if (content.home[node.dataset.aria]) node.setAttribute("aria-label", content.home[node.dataset.aria]); });
    text("[data-brand='role']", content.brand.role);
    qs("[data-portrait-alt]").alt = content.hero.portraitAlt;
    qs("#knowledge-link").href = content.knowledge.channelUrl;
  }

  function projectIcon(slug) {
    return icons[slug === "enterprise-workflow" ? "workflow" : slug === "coding-academy" ? "academy" : slug];
  }

  function renderProjects(content) {
    const list = qs("#project-list");
    list.replaceChildren(...content.projects.map((project, index) => {
      const article = document.createElement("article");
      article.className = "project-row reveal";
      article.dataset.project = project.slug;
      article.innerHTML = `
        <div class="project-index" aria-hidden="true"><span>${String(index + 1).padStart(2, "0")}</span><i>${projectIcon(project.slug)}</i></div>
        <div class="project-copy">
          <div class="project-title-line"><h3>${project.title}</h3><span>${project.category}</span></div>
          <p>${project.summary}</p>
          <ul class="project-facts">${project.facts.map((fact) => `<li>${fact}</li>`).join("")}</ul>
          <div class="tech-tags">${project.tech.map((item) => `<span>${item}</span>`).join("")}</div>
        </div>
        <figure class="project-media">
          <img src="${project.previewImage}" alt="${project.previewAlt}" width="800" height="450" loading="lazy" decoding="async">
          <figcaption>${project.previewCaption}</figcaption>
        </figure>
        <div class="project-actions">
          <a class="button button--primary demo-trigger" href="${localizedUrl(`./projects/${project.slug}/?demo=1#demo`)}">${content.home.tryDemo}<span aria-hidden="true">${state.language === "ar" ? "←" : "→"}</span></a>
          <a class="button button--quiet" href="${localizedUrl(`./projects/${project.slug}/`)}">${content.home.fullDetails}</a>
        </div>`;
      return article;
    }));
  }

  function renderSkills(content) {
    const iconNames = ["backend", "web", "database", "quality", "git", "ai"];
    const skills = content.skillsSection.items;
    const showcase = qs("#capability-rail");
    showcase.className = "skills-showcase";
    showcase.innerHTML = `
      <article class="skill-primary">
        <div class="skill-primary__visual" aria-hidden="true">
          <span class="skill-orbit skill-orbit--one"></span><span class="skill-orbit skill-orbit--two"></span>
          <i>${icons.backend}</i><b>API</b><b>DB</b><b>QA</b>
        </div>
        <div><span class="skill-number">01 / CORE</span><h3>${skills[0].title}</h3><p>${skills[0].description}</p><small>${skills[0].label}</small></div>
      </article>
      <div class="skill-list">
        ${skills.slice(1).map((item, offset) => `<article class="skill-item"><span>${String(offset + 2).padStart(2, "0")}</span><i>${icons[iconNames[offset + 1]]}</i><div><strong>${item.title}</strong><p>${item.description}</p><small>${item.label}</small></div></article>`).join("")}
      </div>`;

    const technologyItems = content.technologiesSection.groups.flatMap((group) => group.items);
    qs("#technology-rail").replaceChildren(...technologyItems.map((item) => {
      const node = document.createElement("span");
      node.className = "technology-mark";
      node.innerHTML = `<b>${item.mark}</b><span>${item.name}</span>`;
      return node;
    }));
  }

  function renderResume(content) {
    qsa("[data-resume-icon]").forEach((node) => { node.innerHTML = icons[node.dataset.resumeIcon]; });
    qs("#resume-focus").replaceChildren(...content.resume.focusItems.map((item) => {
      const li = document.createElement("li"); li.textContent = item; return li;
    }));
    qs("#resume-projects").replaceChildren(...content.projects.slice(0, 3).map((project) => {
      const li = document.createElement("li"); li.innerHTML = `<a href="#projects" data-project-jump="${project.slug}">${project.title}</a>`; return li;
    }));
  }

  function renderContact(content) {
    const links = content.contact.links.filter((link) => link.url);
    qs("#contact-links").replaceChildren(...links.map((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "contact-link";
      anchor.innerHTML = `${link.id === "github" ? icons.github : ""}<span>${link.label}</span><b aria-hidden="true">↗</b>`;
      return anchor;
    }));
  }

  function setupNavigation() {
    const menuButton = qs(".menu-button");
    const mobileMenu = qs("#mobile-menu");
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      mobileMenu.classList.toggle("is-open", !open);
    });
    qsa("a", mobileMenu).forEach((anchor) => anchor.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
    }));
    qsa("[data-project-jump]").forEach((anchor) => anchor.addEventListener("click", () => {
      const row = qs(`[data-project="${anchor.dataset.projectJump}"]`);
      window.setTimeout(() => row?.focus({ preventScroll: true }), 450);
    }));
  }

  function setupReveal() {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      qsa(".reveal").forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    qsa(".reveal").forEach((node) => observer.observe(node));
  }

  function updateLanguageUrl(language) {
    const url = new URL(window.location.href);
    if (language === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
    history.replaceState({}, "", url);
  }

  async function load(language) {
    const response = await fetch(`./content/portfolio.${language}.json`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Content load failed (${response.status})`);
    state.language = language;
    state.content = await response.json();
    localStorage.setItem("x7do0-language", language);
    setDocument(state.content);
    renderStatic(state.content);
    renderProjects(state.content);
    renderSkills(state.content);
    renderResume(state.content);
    renderContact(state.content);
    setupNavigation();
    setupReveal();
  }

  qsa("[data-language]").forEach((button) => button.addEventListener("click", () => {
    const language = button.dataset.language;
    if (language === state.language) return;
    updateLanguageUrl(language);
    window.location.reload();
  }));

  qs("#footer-year").textContent = new Date().getFullYear();
  const requested = new URLSearchParams(location.search).get("lang");
  const initialLanguage = requested === "en" ? "en" : requested === "ar" ? "ar" : localStorage.getItem("x7do0-language") === "en" ? "en" : "ar";
  load(initialLanguage).catch((error) => {
    console.error(error);
    document.body.classList.add("content-error");
  });
})();

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
    youtube: '<svg class="social-logo social-logo--youtube" viewBox="0 0 24 24" aria-hidden="true"><path class="youtube-body" d="M21.2 7.2a2.8 2.8 0 0 0-2-2C17.4 4.7 12 4.7 12 4.7s-5.4 0-7.2.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.3 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0-.5-4.8Z"/><path class="youtube-play" d="m10 9 5 3-5 3V9Z"/></svg>'
  };

  const technologyLogoPaths = {
    csharp: "./assets/technology/csharp.svg",
    dotnet: "./assets/technology/dotnet.svg",
    aspnet: "./assets/technology/aspnetcore.svg",
    efcore: "./assets/technology/efcore.svg",
    sqlserver: "./assets/technology/sqlserver.svg",
    sqlite: "./assets/technology/sqlite.svg",
    python: "./assets/technology/python.svg",
    cpp: "./assets/technology/cplusplus.svg",
    git: "./assets/technology/git.svg",
    github: "./assets/technology/github.svg",
    html: "./assets/technology/html5.svg",
    css: "./assets/technology/css3.svg",
    javascript: "./assets/technology/javascript.svg",
    typescript: "./assets/technology/typescript.svg",
    react: "./assets/technology/react.svg",
    indexeddb: "./assets/technology/indexeddb.svg"
  };

  const socialLogoPaths = {
    email: "./assets/technology/gmail.svg",
    telegram: "./assets/technology/telegram.svg",
    github: "./assets/technology/github-light.svg",
    youtube: "./assets/technology/youtube.svg",
    instagram: "./assets/technology/instagram.svg"
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
    const structuredData = qs("#structured-data");
    if (structuredData) {
      const profile = JSON.parse(structuredData.textContent);
      profile.name = content.brand.name;
      profile.alternateName = ["x7do0", "Haidara Muhanned"];
      profile.jobTitle = "Backend-focused Software Developer";
      profile.sameAs = content.contact.links
        .filter((link) => ["github", "youtube", "instagram"].includes(link.id))
        .map((link) => link.url);
      profile.address = { "@type": "PostalAddress", addressLocality: "Najaf", addressCountry: "IQ" };
      structuredData.textContent = JSON.stringify(profile);
    }
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
    qsa("[data-profile]").forEach((node) => { node.textContent = content.profile[node.dataset.profile] || ""; });
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
        </figure>
        <div class="project-actions">
          <a class="button button--primary demo-trigger" href="${localizedUrl(`./projects/${project.slug}/?demo=1#demo`)}">${content.home.tryDemo}<span aria-hidden="true">${state.language === "ar" ? "←" : "→"}</span></a>
          <a class="button button--quiet" href="${localizedUrl(`./projects/${project.slug}/`)}">${content.home.fullDetails}</a>
        </div>`;
      return article;
    }));
  }

  function renderSkills(content) {
    const iconNames = ["backend", "database", "quality", "git", "projects", "ai"];
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

    qs("#technology-rail").replaceChildren(...content.technologiesSection.groups.map((group, groupIndex) => {
      const section = document.createElement("section");
      section.className = "technology-group";
      section.dataset.technologyGroup = String(groupIndex + 1);
      section.innerHTML = `
        <h4><span>${String(groupIndex + 1).padStart(2, "0")}</span>${group.title}</h4>
        <div class="technology-group__items">
          ${group.items.map((item) => `<span class="technology-mark" data-technology="${item.icon}"><b class="technology-logo"><img src="${technologyLogoPaths[item.icon]}" alt="" width="36" height="36" loading="lazy" decoding="async"></b><bdi dir="ltr">${item.name}</bdi></span>`).join("")}
        </div>`;
      return section;
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
    qs("#full-resume-link").href = localizedUrl("./resume/");
  }

  function renderKnowledge(content) {
    const videos = qs("#knowledge-videos");
    videos.replaceChildren(...content.knowledge.videos.map((video) => {
      const article = document.createElement("article");
      article.className = `video-card${video.featured ? " video-card--featured" : ""}`;
      article.dataset.videoId = video.id;
      article.innerHTML = `
        <div class="video-preview">
          <img src="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}" width="480" height="360" loading="lazy" decoding="async">
          <button class="video-play" type="button" data-video-play aria-label="${content.knowledge.playLabel}: ${video.title}">
            <span>${icons.youtube}</span>
          </button>
        </div>
        <div class="video-copy">
          <span>${video.category}</span>
          <h3>${video.title}</h3>
          <p>${video.description}</p>
          <a href="${video.url}" target="_blank" rel="noopener noreferrer">${content.knowledge.directLabel}<b aria-hidden="true">↗</b></a>
        </div>`;
      return article;
    }));

    qsa("[data-video-play]", videos).forEach((button) => button.addEventListener("click", () => {
      const article = button.closest("[data-video-id]");
      const video = content.knowledge.videos.find((item) => item.id === article.dataset.videoId);
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
      iframe.title = video.title;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      article.querySelector(".video-preview").replaceChildren(iframe);
      iframe.focus();
    }));
  }

  function renderContact(content) {
    const links = content.contact.links.filter((link) => link.url);
    qs("#contact-links").replaceChildren(...links.map((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      if (!link.url.startsWith("mailto:")) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      anchor.className = `contact-link contact-link--${link.kind}`;
      anchor.dataset.social = link.id;
      anchor.dataset.kind = link.kind;
      anchor.innerHTML = `<img class="contact-logo" src="${socialLogoPaths[link.id]}" alt="" width="24" height="24"><span><small>${link.label}</small><strong>${link.value}</strong></span><b aria-hidden="true">${link.url.startsWith("mailto:") ? "→" : "↗"}</b>`;
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
    renderKnowledge(state.content);
    renderContact(state.content);
    setupNavigation();
    setupReveal();
    await window.portfolioReady?.();
  }

  qsa("[data-language]").forEach((button) => button.addEventListener("click", () => {
    const language = button.dataset.language;
    if (language === state.language) return;
    localStorage.setItem("x7do0-language", language);
    updateLanguageUrl(language);
    window.location.reload();
  }));

  qs("#footer-year").textContent = new Date().getFullYear();
  const requested = new URLSearchParams(location.search).get("lang");
  const initialLanguage = requested === "en" ? "en" : requested === "ar" ? "ar" : localStorage.getItem("x7do0-language") === "en" ? "en" : "ar";
  load(initialLanguage).catch((error) => {
    console.error(error);
    document.body.classList.add("content-error");
    window.portfolioReady?.();
  });
})();

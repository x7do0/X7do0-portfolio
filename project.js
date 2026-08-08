(() => {
  "use strict";

  const body = document.body;
  const root = body.dataset.root || "../../";
  const slug = body.dataset.project;
  const queryLanguage = new URLSearchParams(location.search).get("lang");
  let language = queryLanguage === "en"
    ? "en"
    : queryLanguage === "ar" ? "ar" : localStorage.getItem("x7do0-language") === "en" ? "en" : "ar";

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  let demoHostCleanup = null;

  function renderProjectLinks(project, content) {
    const actions = qs(".project-demo-actions");
    if (!actions) return;
    const demoLink = qs("[data-demo-link]", actions);
    const hint = qs("[data-page-text='demoHint']", actions);
    const externalLinks = project.links || [];
    let links = qs(".project-external-links", actions);
    if (!links) {
      links = document.createElement("div");
      links.className = "project-external-links";
      actions.insertBefore(links, hint);
    }
    links.replaceChildren(...externalLinks.map((item) => {
      const link = document.createElement("a");
      link.className = `project-link project-link--${item.kind}`;
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.label;
      link.setAttribute("aria-label", `${item.label} — ${project.title}`);
      return link;
    }));
    if (demoLink) demoLink.classList.toggle("project-demo-cta--secondary", externalLinks.some((item) => item.kind === "live"));
    if (hint) hint.textContent = content.projectPage.demoHint;
  }

  function renderCaseStudy(project, content) {
    const existing = qs(".project-case-study");
    if (existing) existing.remove();
    if (!project.caseStudy?.sections?.length || !project.media?.length) return;

    qs(".project-future")?.remove();

    const study = document.createElement("div");
    study.className = "project-case-study";
    const metricMarkup = (project.metrics || []).map((item) => `
      <li><strong>${item.value}</strong><span>${item.label}</span></li>`).join("");
    const sectionMarkup = project.caseStudy.sections.map((section, index) => `
      <article class="case-section reveal">
        <span class="case-section__index">${String(index + 1).padStart(2, "0")}</span>
        <div><h3>${section.title}</h3><p>${section.body}</p>${section.items?.length ? `<ul>${section.items.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}</div>
      </article>`).join("");
    const media = project.media
      .map((item, index) => ({ ...item, sourceIndex: index }))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.order ?? a.sourceIndex) - (b.order ?? b.sourceIndex));
    const featuredIndex = Math.max(0, media.findIndex((item) => item.featured));
    const featured = media[featuredIndex];
    const mediaUrl = (item) => `${root}${item.src.replace(/^\.\//, "")}`;
    const mediaDimensions = (item) => item.device === "phone" ? { width: 390, height: 844 } : { width: 1440, height: 960 };
    const featuredDimensions = mediaDimensions(featured);
    const isRtl = document.documentElement.dir === "rtl";
    const previousPath = isRtl ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6";
    const nextPath = isRtl ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6";
    const previousIcon = `<svg class="media-arrow media-arrow--previous" viewBox="0 0 24 24" aria-hidden="true"><path d="${previousPath}"/></svg>`;
    const nextIcon = `<svg class="media-arrow media-arrow--next" viewBox="0 0 24 24" aria-hidden="true"><path d="${nextPath}"/></svg>`;
    const thumbnailMarkup = media.map((item, index) => `
      <button class="case-media-thumb${item.device === "phone" ? " case-media-thumb--phone" : ""}" type="button" role="tab" aria-selected="${index === featuredIndex}" aria-controls="case-media-panel" tabindex="${index === featuredIndex ? "0" : "-1"}" data-media-index="${index}" aria-label="${String(index + 1).padStart(2, "0")}: ${item.alt}">
        <img src="${mediaUrl(item)}" alt="" width="240" height="160" loading="lazy" decoding="async">
        <span>${String(index + 1).padStart(2, "0")}</span>
      </button>`).join("");

    study.innerHTML = `
      <section class="case-gallery shell"><header class="case-heading reveal"><span>02</span><div><h2>${content.projectPage.mediaTitle}</h2></div></header>
        <div class="case-media-browser reveal${featured.device === "phone" ? " is-phone-media" : ""}" data-media-browser tabindex="-1">
          <figure class="case-media-main" id="case-media-panel" role="tabpanel">
            <button class="case-media-main__open" type="button" data-media-open aria-label="${content.projectPage.enlargeImage}: ${featured.alt}">
              <img src="${mediaUrl(featured)}" alt="${featured.alt}" width="${featuredDimensions.width}" height="${featuredDimensions.height}" loading="eager" decoding="async" data-media-main-image>
            </button>
            <div class="case-media-main__controls" aria-hidden="false">
              <button type="button" data-media-previous aria-label="${content.projectPage.previousImage}">${previousIcon}</button>
              <span data-media-count aria-live="polite">${featuredIndex + 1} / ${media.length}</span>
              <button type="button" data-media-next aria-label="${content.projectPage.nextImage}">${nextIcon}</button>
            </div>
          </figure>
          <div class="case-media-rail" role="tablist" aria-label="${content.projectPage.mediaNavigation}">${thumbnailMarkup}</div>
          <div class="case-media-caption" aria-live="polite">
            <strong data-media-label>${String(featuredIndex + 1).padStart(2, "0")}</strong>
            <p data-media-caption>${featured.caption}</p>
          </div>
        </div>
      </section>
      <section class="case-intro shell reveal">
        <div><span class="case-kicker">${project.status}</span><h2>${project.caseStudy.title}</h2><p>${project.caseStudy.intro}</p></div>
        <ul class="case-metrics" aria-label="${content.projectPage.keyFacts}">${metricMarkup}</ul>
      </section>
      <section class="case-story"><div class="shell"><header class="case-heading reveal"><span>03</span><h2>${content.projectPage.detailsTitle}</h2></header><div class="case-sections">${sectionMarkup}</div></div></section>`;
    qs(".project-overview")?.remove();
    qs(".project-hero").after(study);

    const browser = qs("[data-media-browser]", study);
    const mainImage = qs("[data-media-main-image]", browser);
    const mainButton = qs("[data-media-open]", browser);
    const caption = qs("[data-media-caption]", browser);
    const label = qs("[data-media-label]", browser);
    const count = qs("[data-media-count]", browser);
    const thumbnails = qsa("[data-media-index]", browser);
    let selectedIndex = featuredIndex;
    let dialog = null;
    let transitionToken = 0;

    const selectMedia = (nextIndex, focusThumbnail = false, navigationDirection = "") => {
      const currentTransition = ++transitionToken;
      selectedIndex = (nextIndex + media.length) % media.length;
      const item = media[selectedIndex];
      const selectedThumbnail = thumbnails[selectedIndex];
      browser.dataset.mediaDirection = navigationDirection;
      browser.classList.add("is-changing");
      browser.classList.toggle("is-phone-media", item.device === "phone");
      const dimensions = mediaDimensions(item);
      mainImage.width = dimensions.width;
      mainImage.height = dimensions.height;
      mainImage.src = mediaUrl(item);
      mainImage.alt = item.alt;
      mainButton.setAttribute("aria-label", `${content.projectPage.enlargeImage}: ${item.alt}`);
      caption.textContent = item.caption;
      label.textContent = String(selectedIndex + 1).padStart(2, "0");
      count.textContent = `${selectedIndex + 1} / ${media.length}`;
      thumbnails.forEach((thumbnail, index) => {
        const selected = index === selectedIndex;
        thumbnail.setAttribute("aria-selected", String(selected));
        thumbnail.tabIndex = selected ? 0 : -1;
      });
      selectedThumbnail.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest", inline: "nearest" });
      if (focusThumbnail) selectedThumbnail.focus();
      if (dialog) {
        dialog.classList.toggle("is-phone-media", item.device === "phone");
        const dialogImage = qs("img", dialog);
        dialogImage.width = dimensions.width;
        dialogImage.height = dimensions.height;
        dialogImage.src = mediaUrl(item);
        dialogImage.alt = item.alt;
      }
      const settle = () => {
        setTimeout(() => {
          if (currentTransition !== transitionToken) return;
          browser.classList.remove("is-changing");
          delete browser.dataset.mediaDirection;
        }, 160);
      };
      if (mainImage.complete) requestAnimationFrame(settle);
      else mainImage.addEventListener("load", settle, { once: true });
      const nextItem = media[(selectedIndex + 1) % media.length];
      const preload = new Image();
      preload.src = mediaUrl(nextItem);
    };

    const move = (delta, focusThumbnail = false) => selectMedia(selectedIndex + delta, focusThumbnail, delta > 0 ? "next" : "previous");
    thumbnails.forEach((thumbnail) => thumbnail.addEventListener("click", () => {
      const target = Number(thumbnail.dataset.mediaIndex);
      selectMedia(target, false, target > selectedIndex ? "next" : target < selectedIndex ? "previous" : "");
    }));
    qs("[data-media-previous]", browser).addEventListener("click", () => move(-1));
    qs("[data-media-next]", browser).addEventListener("click", () => move(1));
    browser.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const rtl = document.documentElement.dir === "rtl";
      if (event.key === "Home" || event.key === "End") {
        selectMedia(event.key === "Home" ? 0 : media.length - 1, true, event.key === "Home" ? "previous" : "next");
        return;
      }
      const delta = event.key === "ArrowRight" ? (rtl ? -1 : 1) : (rtl ? 1 : -1);
      move(delta, true);
    });

    mainButton.addEventListener("click", () => {
      const opener = mainButton;
      dialog = document.createElement("dialog");
      dialog.className = `project-lightbox${media[selectedIndex].device === "phone" ? " is-phone-media" : ""}`;
      const dialogDimensions = mediaDimensions(media[selectedIndex]);
      const previousControl = `<button type="button" data-lightbox-previous aria-label="${content.projectPage.previousImage}">${previousIcon}</button>`;
      const nextControl = `<button type="button" data-lightbox-next aria-label="${content.projectPage.nextImage}">${nextIcon}</button>`;
      const lightboxControls = isRtl
        ? `${nextControl}<span>${content.projectPage.mediaNavigation}</span>${previousControl}`
        : `${previousControl}<span>${content.projectPage.mediaNavigation}</span>${nextControl}`;
      dialog.innerHTML = `<div class="project-lightbox__stage"><img src="${mediaUrl(media[selectedIndex])}" alt="${media[selectedIndex].alt}" width="${dialogDimensions.width}" height="${dialogDimensions.height}"></div><div class="project-lightbox__controls">${lightboxControls}</div><button class="project-lightbox__close" type="button" data-lightbox-close aria-label="${content.ui.close}">×</button>`;
      document.body.appendChild(dialog);
      const close = () => dialog.close();
      qs("[data-lightbox-close]", dialog).addEventListener("click", close);
      qs("[data-lightbox-previous]", dialog).addEventListener("click", () => move(-1));
      qs("[data-lightbox-next]", dialog).addEventListener("click", () => move(1));
      dialog.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const rtl = document.documentElement.dir === "rtl";
        if (event.key === "Home" || event.key === "End") {
          selectMedia(event.key === "Home" ? 0 : media.length - 1, false, event.key === "Home" ? "previous" : "next");
          return;
        }
        move(event.key === "ArrowRight" ? (rtl ? -1 : 1) : (rtl ? 1 : -1));
      });
      dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
      dialog.addEventListener("close", () => { dialog.remove(); dialog = null; opener.focus(); });
      dialog.showModal();
      qs("[data-lightbox-close]", dialog).focus();
    });
  }

  function renderRelatedProjects(project, content) {
    qs(".project-related")?.remove();
    const related = content.projects.filter((item) => item.slug !== project.slug);
    if (!related.length) return;

    const section = document.createElement("section");
    section.className = "project-related shell";
    section.innerHTML = `
      <header class="case-heading reveal"><span>04</span><div><h2>${content.projectPage.otherProjectsTitle}</h2><p>${content.projectPage.otherProjectsDescription}</p></div></header>
      <div class="project-related__grid">
        ${related.map((item) => `<a class="project-related__card reveal" href="${root}projects/${item.slug}/${language === "en" ? "?lang=en" : ""}">
          <span class="project-related__image"><img src="${root}${item.previewImage.replace(/^\.\//, "")}" alt="${item.previewAlt}" width="640" height="400" loading="lazy" decoding="async"></span>
          <span class="project-related__body"><small>${item.category}</small><strong>${item.title}</strong><span>${item.summary}</span><b>${content.projectPage.openProject}</b></span>
        </a>`).join("")}
      </div>`;
    qs("main").appendChild(section);
  }

  async function loadContent(nextLanguage) {
    const response = await fetch(`${root}content/portfolio.${nextLanguage}.json`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Content request failed (${response.status}).`);
    return response.json();
  }

  function previewMarkup(kind) {
    if (kind === "workflow") {
      return `
        <div class="page-workflow" aria-hidden="true">
          <div class="page-workflow__head"><span>REQ-2026-0837</span><i></i><strong>workflow.active</strong></div>
          <div class="page-workflow__rail">
            <span class="is-done"><i></i><b>01</b></span>
            <span class="is-done"><i></i><b>02</b></span>
            <span class="is-active"><i></i><b>03</b></span>
            <span><i></i><b>04</b></span>
            <span><i></i><b>05</b></span>
          </div>
          <div class="page-workflow__system">
            <span><small>AUTH</small><strong>Roles</strong></span>
            <span><small>CORE</small><strong>Requests</strong></span>
            <span><small>FLOW</small><strong>Approvals</strong></span>
            <span><small>LOG</small><strong>Audit</strong></span>
          </div>
        </div>`;
    }

    if (kind === "mahsoob") {
      return `
        <div class="page-mahsoob" aria-hidden="true">
          <aside><strong>محسوب</strong><span>الكاشير</span><span>المنتجات</span><span>التقارير</span></aside>
          <div class="page-mahsoob__sale">
            <div class="page-mahsoob__items"><span><b>ماء معدني</b><small>750 د.ع</small></span><span><b>حليب</b><small>2,000 د.ع</small></span></div>
            <div class="page-mahsoob__total"><span>الإجمالي</span><strong>2,750 د.ع</strong><i>إكمال البيع</i></div>
          </div>
        </div>`;
    }

    if (kind === "masroofi") {
      return `
        <div class="page-masroofi" aria-hidden="true">
          <div class="page-masroofi__balance"><span>الرصيد الحالي</span><strong>1,350,000 د.ع</strong><small>يتحدث فورًا</small></div>
          <div class="page-masroofi__summary"><span><small>الدخل</small><b>1,500,000</b></span><span><small>المصروفات</small><b>150,000</b></span></div>
          <div class="page-masroofi__rows"><span>↗ <b>راتب تجريبي</b><small>+1,500,000</small></span><span>🛍️ <b>مشتريات منزلية</b><small>−150,000</small></span></div>
        </div>`;
    }

    return `
      <div class="page-academy" aria-hidden="true">
        <div class="page-academy__head"><span>&lt;/&gt;</span><strong>learning.path</strong><i></i></div>
        <div class="page-academy__path">
          <span class="is-active"><i>01</i><strong>syntax</strong></span>
          <span><i>02</i><strong>practice</strong></span>
          <span><i>03</i><strong>exercises</strong></span>
          <span><i>04</i><strong>progress</strong></span>
        </div>
        <pre><code><em>name</em> = "x7do0"
print(name)</code></pre>
      </div>`;
  }

  function updateUrl(nextLanguage) {
    const url = new URL(location.href);
    if (nextLanguage === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    history.replaceState({}, "", url);
  }

  function updateProjectMetadata(project) {
    let imageMeta = qs('meta[property="og:image"]');
    if (!imageMeta) {
      imageMeta = document.createElement("meta");
      imageMeta.setAttribute("property", "og:image");
      document.head.appendChild(imageMeta);
    }
    imageMeta.content = new URL(`${root}${project.previewImage.replace(/^\.\//, "")}`, location.href).href;

    let structured = qs("#project-structured-data");
    if (!structured) {
      structured = document.createElement("script");
      structured.id = "project-structured-data";
      structured.type = "application/ld+json";
      document.head.appendChild(structured);
    }
    structured.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: project.title,
      description: project.summary,
      applicationCategory: project.category,
      operatingSystem: project.slug === "mahsoob" ? "Windows" : "Web",
      author: { "@type": "Person", name: "Haidara Muhanned" },
      image: imageMeta.content,
      url: location.href,
    });
  }

  async function render(nextLanguage, updateHistory = true) {
    qs(".project-inline-demo")?.remove();
    demoHostCleanup?.();
    demoHostCleanup = null;
    const content = await loadContent(nextLanguage);
    const project = content.projects.find((item) => item.slug === slug);
    if (!project) {
      location.href = root;
      return;
    }

    language = nextLanguage;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("x7do0-language", language);
    if (updateHistory) updateUrl(language);

    qsa("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });

    qsa("[data-project-text='title']").forEach((element) => { element.textContent = project.title; });
    qsa("[data-project-text='summary']").forEach((element) => { element.textContent = project.summary; });

    const pageText = {
      back: content.projectPage.backAction,
      overview: content.projectPage.overviewTitle,
      media: content.projectPage.mediaTitle,
      mediaPending: content.projectPage.mediaPending,
      details: content.projectPage.detailsTitle,
      detailsPending: content.projectPage.detailsPending,
      tryDemo: content.projectPage.tryDemo,
      demoHint: content.projectPage.demoHint
    };
    qsa("[data-page-text]").forEach((element) => {
      element.textContent = pageText[element.dataset.pageText] ?? element.textContent;
    });

    qs("#project-preview").innerHTML = `<figure class="project-source-preview"><img src="${root}${project.previewImage.replace(/^\.\//, "")}" alt="${project.previewAlt}" width="800" height="450"></figure>`;
    qs("#project-preview").setAttribute("aria-label", content.projectPage.previewTitle);
    renderProjectLinks(project, content);
    renderCaseStudy(project, content);
    renderRelatedProjects(project, content);
    qs("[data-brand-name]").textContent = content.brand.name;
    qs("[data-year]").textContent = String(new Date().getFullYear());
    qs("[data-ui-top]").textContent = content.ui.top;
    qs(".skip-link").textContent = content.ui.skip;

    const back = qs(".inner-back");
    back.href = language === "en" ? `${root}?lang=en#projects` : `${root}#projects`;
    qsa(".brand").forEach((link) => { link.href = language === "en" ? `${root}?lang=en` : root; });

    const demoLink = qs("[data-demo-link]");
    if (demoLink) {
      demoLink.href = language === "en"
        ? `${root}demos/${slug}/?lang=en`
        : `${root}demos/${slug}/`;
      demoLink.onclick = (event) => {
        event.preventDefault();
        let stage = qs(".project-inline-demo");
        if (!stage) {
          stage = document.createElement("section");
          stage.className = "project-inline-demo shell";
          stage.id = "demo";
          stage.setAttribute("role", "dialog");
          stage.setAttribute("aria-modal", "true");
          stage.setAttribute("aria-label", `${content.projectPage.previewTitle}: ${project.title}`);
          const demoExperience = content.projectPage.demoExperiences[slug];
          const demoSummary = demoExperience.roles ? `
            <div class="project-demo-companion__roles">
              <div class="project-demo-companion__copy"><small>${content.projectPage.demoControlsTitle}</small><strong>${content.projectPage.demoRoleLabel}</strong><p>${demoExperience.description}</p></div>
              <div class="project-demo-role-switch" role="group" aria-label="${content.projectPage.demoRoleLabel}">
                <button type="button" data-demo-role="employee" aria-pressed="true">${content.projectPage.demoEmployee}</button>
                <button type="button" data-demo-role="manager" aria-pressed="false">${content.projectPage.demoManager}</button>
              </div>
              <button class="project-demo-reset" type="button" data-demo-reset>${content.projectPage.demoReset}</button>
            </div>` : `
            <div class="project-demo-companion__summary">
              <span class="project-demo-companion__mark" aria-hidden="true">${demoExperience.mark}</span>
              <div class="project-demo-companion__copy"><small>${content.projectPage.demoControlsTitle}</small><strong>${demoExperience.title}</strong><p>${demoExperience.description}</p></div>
              <button class="project-demo-reset" type="button" data-demo-reset>${content.projectPage.demoReset}</button>
            </div>`;
          const demoCompanion = `
            <aside class="project-demo-companion" aria-label="${content.projectPage.demoControlsTitle}">
              ${demoSummary}
              <div class="project-demo-companion__guide">
                <strong>${content.projectPage.demoGuideTitle}</strong>
                <ol style="--demo-step-count:${demoExperience.steps.length}">${demoExperience.steps.map((item, index) => `<li class="${index === 0 ? "is-current" : ""}" data-demo-guide-step="${item.id}"><span>${String(index + 1).padStart(2, "0")}</span><p>${item.text}</p></li>`).join("")}</ol>
              </div>
            </aside>`;
          stage.innerHTML = `<header><div><small>${content.projectPage.previewTitle}</small><h2>${project.title}</h2></div><button type="button" data-demo-close aria-label="${content.ui.close}">×</button></header><div class="project-demo-workspace">${demoCompanion}<div class="project-demo-frame"><iframe title="${content.projectPage.previewTitle}: ${project.title}" loading="lazy"></iframe></div></div><p>${content.projectPage.demoHint}</p>`;
          qs(".project-hero").after(stage);
          body.classList.add("demo-preview-open");
          const iframe = qs("iframe", stage);
          const frame = qs(".project-demo-frame", stage);
          const cleanups = [];
          demoHostCleanup = () => cleanups.splice(0).forEach((cleanup) => cleanup());
          let fitFrameRequest = 0;
          let frameResizeObserver = null;
          const fitFrameToContent = () => {
            cancelAnimationFrame(fitFrameRequest);
            fitFrameRequest = requestAnimationFrame(() => {
              const frameDocument = iframe.contentDocument;
              if (!frameDocument?.body) return;
              const canUseCompactDesktop = innerHeight <= 760 && ["coding-academy", "masroofi"].includes(slug);
              const canReflowMobile = frame.clientWidth < 700 && slug !== "mahsoob";
              const virtualWidth = frame.clientWidth < 700 ? canReflowMobile ? 640 : 820 : canUseCompactDesktop ? 1100 : 1200;
              iframe.style.width = `${virtualWidth}px`;
              if (!iframe.dataset.demoFitted) {
                iframe.style.height = canUseCompactDesktop ? "500px" : "600px";
                iframe.style.transform = "translate(-50%, -50%) scale(1)";
              }
              requestAnimationFrame(() => {
                const measuredHeight = Math.ceil(frameDocument.body.scrollHeight || frameDocument.documentElement.scrollHeight);
                iframe.style.height = `${measuredHeight}px`;
                requestAnimationFrame(() => {
                  const contentHeight = Math.ceil(Math.max(measuredHeight, frameDocument.body.scrollHeight, frameDocument.documentElement.scrollHeight));
                  const scale = Math.min(1, frame.clientWidth / virtualWidth, frame.clientHeight / contentHeight);
                  iframe.style.height = `${contentHeight}px`;
                  iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
                  iframe.dataset.demoFitted = "true";
                  stage.style.setProperty("--demo-scale", scale.toFixed(4));
                });
              });
            });
          };
          const onFrameLoad = () => {
            iframe.contentDocument.documentElement.classList.add("is-embedded");
            fitFrameToContent();
            requestAnimationFrame(fitFrameToContent);
            frameResizeObserver?.disconnect();
            frameResizeObserver = new ResizeObserver(fitFrameToContent);
            frameResizeObserver.observe(iframe.contentDocument.body);
          };
          const onViewportResize = () => fitFrameToContent();
          iframe.addEventListener("load", onFrameLoad);
          addEventListener("resize", onViewportResize);
          cleanups.push(() => {
            iframe.removeEventListener("load", onFrameLoad);
            removeEventListener("resize", onViewportResize);
            cancelAnimationFrame(fitFrameRequest);
            frameResizeObserver?.disconnect();
            body.classList.remove("demo-preview-open");
          });
          const closeDemo = () => {
            demoHostCleanup?.();
            demoHostCleanup = null;
            stage.remove();
            demoLink.focus();
          };
          const onDemoKeydown = (event) => { if (event.key === "Escape") closeDemo(); };
          qs("[data-demo-close]", stage).addEventListener("click", closeDemo);
          addEventListener("keydown", onDemoKeydown);
          cleanups.push(() => removeEventListener("keydown", onDemoKeydown));

          const updateCompanion = (payload) => {
            qsa("[data-demo-role]", stage).forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.demoRole === payload.role)));
            qsa("[data-demo-guide-step]", stage).forEach((item) => {
              const status = payload.progress?.[item.dataset.demoGuideStep] || "idle";
              item.classList.toggle("is-current", status === "current");
              item.classList.toggle("is-complete", status === "complete");
            });
            fitFrameToContent();
          };
          const send = (type, value = {}) => iframe.contentWindow?.postMessage({ source: "x7do0-portfolio", type, ...value }, location.origin);
          const onMessage = (message) => {
            if (message.origin !== location.origin || message.source !== iframe.contentWindow) return;
            if (message.data?.source === `${slug}-demo` && message.data.type === "state") updateCompanion(message.data);
          };
          addEventListener("message", onMessage);
          qsa("[data-demo-role]", stage).forEach((button) => button.addEventListener("click", () => send("set-role", { role: button.dataset.demoRole })));
          qs("[data-demo-reset]", stage).addEventListener("click", () => send("reset"));
          cleanups.push(() => removeEventListener("message", onMessage));
        }
        const embeddedUrl = new URL(demoLink.href, location.href);
        embeddedUrl.searchParams.set("embedded", "1");
        qs("iframe", stage).src = embeddedUrl.href;
        requestAnimationFrame(() => qs("[data-demo-close]", stage).focus());
      };
      if (new URLSearchParams(location.search).get("demo") === "1") {
        requestAnimationFrame(() => demoLink.click());
      }
    }

    const future = qs(".project-future");
    if (future && !project.caseStudy?.sections?.length) {
      const panels = qsa(".future-panel", future);
      panels[0].querySelector("h2").textContent = language === "ar" ? "ما الذي يقدمه" : "What it delivers";
      panels[0].querySelector("p").textContent = project.facts.join(language === "ar" ? "، " : ", ");
      panels[1].querySelector("h2").textContent = language === "ar" ? "التقنيات الأساسية" : "Core technologies";
      panels[1].querySelector("p").textContent = project.tech.join(" · ");
      future.classList.add("has-content");
    }

    document.title = `${project.title} | x7do0`;
    qs('meta[name="description"]').content = project.summary;
    qs('meta[property="og:title"]').content = `${project.title} | x7do0`;
    qs('meta[property="og:description"]').content = project.summary;
    const canonical = qs('link[rel="canonical"]');
    canonical.href = `https://x7do0.github.io/X7do0-portfolio/projects/${slug}/${language === "en" ? "?lang=en" : ""}`;
    updateProjectMetadata(project);
    setupRevealNodes();
    await window.portfolioReady?.();
  }

  let observer;
  function setupRevealNodes() {
    if (!observer) return;
    qsa(".reveal:not([data-reveal-bound])").forEach((element) => {
      element.dataset.revealBound = "true";
      observer.observe(element);
    });
  }

  function setupMotion() {
    const progress = qs(".scroll-progress span");
    const update = () => {
      const available = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${available > 0 ? (scrollY / available) * 100 : 0}%`;
    };
    addEventListener("scroll", update, { passive: true });
    update();

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    setupRevealNodes();
  }

  qsa("[data-language]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.language === language) return;
      await render(button.dataset.language);
    });
  });

  setupMotion();
  render(language, false).catch((error) => {
    console.error(error);
    window.portfolioReady?.();
    location.href = root;
  });
})();

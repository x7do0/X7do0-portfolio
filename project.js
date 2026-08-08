(() => {
  "use strict";

  const body = document.body;
  const root = body.dataset.root || "../../";
  const slug = body.dataset.project;
  const queryLanguage = new URLSearchParams(location.search).get("lang");
  let language = queryLanguage === "en"
    ? "en"
    : localStorage.getItem("x7do0-language") === "en" ? "en" : "ar";

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

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
          <span><i>03</i><strong>project</strong></span>
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

  async function render(nextLanguage, updateHistory = true) {
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

    qs("#project-preview").innerHTML = `<figure class="project-source-preview"><img src="${root}${project.previewImage.replace(/^\.\//, "")}" alt="${project.previewAlt}" width="800" height="450"><figcaption>${project.previewCaption}</figcaption></figure>`;
    qs("#project-preview").setAttribute("aria-label", content.projectPage.previewTitle);
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
          stage.innerHTML = `<header><div><small>${content.projectPage.previewTitle}</small><h2>${project.title}</h2></div><button type="button" aria-label="${content.ui.close}">×</button></header><iframe title="${content.projectPage.previewTitle}: ${project.title}" loading="lazy"></iframe><p>${content.projectPage.demoHint}</p>`;
          qs(".project-hero").after(stage);
          qs("button", stage).addEventListener("click", () => { stage.remove(); });
        }
        qs("iframe", stage).src = demoLink.href;
        stage.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      };
      if (new URLSearchParams(location.search).get("demo") === "1") {
        requestAnimationFrame(() => demoLink.click());
      }
    }

    const future = qs(".project-future");
    if (future) {
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
  }

  function setupMotion() {
    const progress = qs(".scroll-progress span");
    const update = () => {
      const available = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${available > 0 ? (scrollY / available) * 100 : 0}%`;
    };
    addEventListener("scroll", update, { passive: true });
    update();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    qsa(".reveal").forEach((element) => observer.observe(element));
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
    location.href = root;
  });
})();

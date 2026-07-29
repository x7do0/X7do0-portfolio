(() => {
  "use strict";

  const root = document.body.dataset.root || "../";
  const requestedLanguage = new URLSearchParams(location.search).get("lang");
  let language = requestedLanguage === "en"
    ? "en"
    : localStorage.getItem("x7do0-language") === "en" ? "en" : "ar";

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  async function loadContent(nextLanguage) {
    const response = await fetch(`${root}content/portfolio.${nextLanguage}.json`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Content request failed (${response.status}).`);
    return response.json();
  }

  function setText(selector, value) {
    qsa(selector).forEach((element) => { element.textContent = value; });
  }

  function updateUrl(nextLanguage) {
    const url = new URL(location.href);
    if (nextLanguage === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    history.replaceState({}, "", url);
  }

  async function render(nextLanguage, updateHistory = true) {
    const content = await loadContent(nextLanguage);
    language = nextLanguage;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("x7do0-language", language);
    if (updateHistory) updateUrl(language);

    qsa("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });

    qsa("[data-resume]").forEach((element) => {
      element.textContent = content.resume[element.dataset.resume] ?? element.textContent;
    });
    setText("[data-brand-role]", content.brand.role);
    setText("[data-brand-name]", content.brand.name);
    setText("[data-education='institution']", content.education.institution);
    setText("[data-education='description']", content.education.description);
    setText("[data-ui-top]", content.ui.top);
    setText(".skip-link", content.ui.skip);
    setText("[data-resume-ui='back']", language === "ar" ? "العودة إلى الرئيسية" : "Back to home");
    setText("[data-year]", String(new Date().getFullYear()));

    const homeUrl = language === "en" ? `${root}?lang=en` : root;
    qsa(".brand, .inner-back").forEach((link) => { link.href = homeUrl; });

    const skills = qs("#resume-skills");
    skills.replaceChildren(
      ...content.skillsSection.items.map((skill, index) => {
        const item = document.createElement("li");
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const title = document.createElement("strong");
        title.textContent = skill;
        item.append(number, title);
        return item;
      })
    );

    const technologies = qs("#resume-technologies");
    technologies.replaceChildren(
      ...content.technologiesSection.groups.map((group) => {
        const section = document.createElement("section");
        const heading = document.createElement("h3");
        heading.textContent = group.title;
        const list = document.createElement("p");
        list.textContent = group.items.join(" · ");
        section.append(heading, list);
        return section;
      })
    );

    const projects = qs("#resume-projects");
    projects.replaceChildren(
      ...content.projects.map((project, index) => {
        const link = document.createElement("a");
        link.href = `${root}projects/${project.slug}/${language === "en" ? "?lang=en" : ""}`;
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const copy = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = project.title;
        const summary = document.createElement("p");
        summary.textContent = project.summary;
        copy.append(title, summary);
        link.append(number, copy);
        return link;
      })
    );

    document.title = `${language === "ar" ? "السيرة الذاتية" : "Resume"} | ${content.brand.name}`;
    qs('meta[name="description"]').content = content.resume.intro;
    qs('meta[property="og:title"]').content = document.title;
    qs('meta[property="og:description"]').content = content.resume.intro;
    qs('link[rel="canonical"]').href = `https://x7do0.github.io/X7do0-portfolio/resume/${language === "en" ? "?lang=en" : ""}`;
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
    button.addEventListener("click", () => {
      if (button.dataset.language !== language) render(button.dataset.language);
    });
  });

  setupMotion();
  render(language, false).catch((error) => {
    console.error(error);
    location.href = root;
  });
})();

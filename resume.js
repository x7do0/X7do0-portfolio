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
    setText("[data-brand-name]", content.brand.name);
    qsa("[data-profile]").forEach((element) => {
      element.textContent = content.profile[element.dataset.profile] ?? element.textContent;
    });
    qsa("[data-education]").forEach((element) => {
      element.textContent = content.education[element.dataset.education] ?? element.textContent;
    });
    setText("[data-ui-top]", content.ui.top);
    setText(".skip-link", content.ui.skip);
    setText("[data-resume-ui='back']", language === "ar" ? "العودة إلى الرئيسية" : "Back to home");
    setText("[data-year]", String(new Date().getFullYear()));

    const homeUrl = language === "en" ? `${root}?lang=en` : root;
    qsa(".brand, .inner-back").forEach((link) => { link.href = homeUrl; });

    const contactById = new Map(content.contact.links.map((link) => [link.id, link]));
    qs("#resume-contact").replaceChildren(...content.resume.contactIds.map((id) => {
      const contact = contactById.get(id);
      const link = document.createElement("a");
      link.href = contact.url;
      link.dataset.contact = contact.id;
      if (!contact.url.startsWith("mailto:")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      const label = document.createElement("span");
      label.textContent = contact.label;
      const value = document.createElement("strong");
      value.textContent = contact.value;
      link.append(label, value);
      return link;
    }));

    const skills = qs("#resume-skills");
    skills.replaceChildren(
      ...content.resume.skillGroups.map((group, index) => {
        const item = document.createElement("section");
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const title = document.createElement("strong");
        title.textContent = group.title;
        const details = document.createElement("p");
        details.textContent = group.items.join(" · ");
        const copy = document.createElement("div");
        copy.append(title, details);
        item.append(number, copy);
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
        list.textContent = group.items.map((item) => typeof item === "string" ? item : item.name).join(" · ");
        section.append(heading, list);
        return section;
      })
    );

    const orderedProjects = content.resume.projectOrder.map((slug) => content.projects.find((project) => project.slug === slug));
    const projects = qs("#resume-projects");
    projects.replaceChildren(
      ...orderedProjects.map((project, index) => {
        const link = document.createElement("a");
        link.href = `${root}projects/${project.slug}/${language === "en" ? "?lang=en" : ""}`;
        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        const copy = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = project.title;
        const summary = document.createElement("p");
        summary.textContent = project.resumeSummary;
        const details = document.createElement("small");
        details.textContent = `${project.facts.join(" · ")} — ${project.tech.join(" · ")}`;
        copy.append(title, summary, details);
        link.append(number, copy);
        return link;
      })
    );

    const youtube = content.contact.links.find((link) => link.id === "youtube");
    qs("#resume-youtube").href = youtube.url;
    qs("#resume-youtube").firstChild.textContent = "youtube.com/@x7do0eng ";

    qs("#resume-languages").replaceChildren(...content.resume.languages.map((item) => {
      const entry = document.createElement("li");
      entry.textContent = item;
      return entry;
    }));

    document.title = `${language === "ar" ? "السيرة الذاتية" : "Resume"} | ${content.brand.name}`;
    qs('meta[name="description"]').content = content.resume.summary;
    qs('meta[property="og:title"]').content = document.title;
    qs('meta[property="og:description"]').content = content.resume.summary;
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

    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      qsa(".reveal").forEach((element) => element.classList.add("is-visible"));
      return;
    }

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

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const atmosphere = document.querySelector(".scroll-atmosphere");
  if (!atmosphere) return;

  const sectionIds = ["home", "projects", "capabilities", "education", "knowledge", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let lastY = window.scrollY;
  let rafId = 0;

  function activeSection() {
    const marker = window.innerHeight * 0.44;
    let selected = sections[0]?.id || "home";

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) {
        selected = section.id;
        break;
      }
      if (rect.top <= marker) selected = section.id;
    }

    return selected;
  }

  function render() {
    rafId = 0;

    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, y / max));
    const delta = y - lastY;
    const direction = delta > 0.5 ? "down" : delta < -0.5 ? "up" : (document.documentElement.dataset.scrollDirection || "down");

    document.documentElement.dataset.scrollDirection = direction;
    document.documentElement.dataset.scrollSection = activeSection();

    if (!reducedMotion.matches) {
      const directionalNudge = direction === "down" ? 1 : -1;
      const velocity = Math.min(18, Math.abs(delta) * 0.55);

      atmosphere.style.setProperty("--atmo-grid-y", `${(-92 * progress).toFixed(2)}px`);
      atmosphere.style.setProperty("--atmo-grid-x", `${(directionalNudge * velocity * 0.34).toFixed(2)}px`);
      atmosphere.style.setProperty("--atmo-orb-a-y", `${(-118 * progress).toFixed(2)}px`);
      atmosphere.style.setProperty("--atmo-orb-b-y", `${(96 * progress).toFixed(2)}px`);
      atmosphere.style.setProperty("--atmo-orb-x", `${(directionalNudge * velocity).toFixed(2)}px`);
      atmosphere.style.setProperty("--atmo-line-y", `${(72 * progress).toFixed(2)}px`);
    }

    lastY = y;
  }

  function schedule() {
    if (rafId) return;
    rafId = requestAnimationFrame(render);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reducedMotion.addEventListener?.("change", schedule);

  render();
})();

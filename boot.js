(() => {
  "use strict";

  const html = document.documentElement;
  const requested = new URLSearchParams(location.search).get("lang");
  let stored = "ar";
  try {
    stored = localStorage.getItem("x7do0-language") === "en" ? "en" : "ar";
  } catch {
    // Keep Arabic as the safe default when storage is unavailable.
  }

  const language = requested === "en" ? "en" : requested === "ar" ? "ar" : stored;
  html.lang = language;
  html.dir = language === "ar" ? "rtl" : "ltr";
  html.classList.add("portfolio-booting");

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    html.classList.remove("portfolio-booting");
    html.classList.add("portfolio-ready");
  };

  window.portfolioReady = async () => {
    const font = language === "ar"
      ? '400 1em "IBM Plex Sans Arabic"'
      : '400 1em "Space Grotesk"';
    if (document.fonts?.load) {
      await Promise.race([
        document.fonts.load(font),
        new Promise((resolve) => setTimeout(resolve, 1800)),
      ]);
    }
    requestAnimationFrame(() => requestAnimationFrame(reveal));
  };

  // Never leave the page hidden if content or font loading fails unexpectedly.
  setTimeout(reveal, 4500);
})();

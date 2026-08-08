(() => {
  "use strict";

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const resetScroll = () => requestAnimationFrame(() => scrollTo({ top: 0, left: 0, behavior: "auto" }));
  if (document.readyState === "loading") {
    addEventListener("DOMContentLoaded", resetScroll, { once: true });
  } else {
    resetScroll();
  }
  addEventListener("pageshow", resetScroll);
})();

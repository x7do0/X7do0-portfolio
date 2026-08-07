(() => {
  'use strict';

  const arabicIndic = /[٠-٩]/g;
  const easternArabicIndic = /[۰-۹]/g;
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const easternDigits = '۰۱۲۳۴۵۶۷۸۹';

  function toLatinDigits(value) {
    return String(value)
      .replace(arabicIndic, (digit) => String(arabicDigits.indexOf(digit)))
      .replace(easternArabicIndic, (digit) => String(easternDigits.indexOf(digit)));
  }

  function formatTimeElements(root = document) {
    const elements = root.querySelectorAll?.('time[datetime]') ?? [];
    elements.forEach((element) => {
      const date = new Date(element.dateTime);
      if (Number.isNaN(date.getTime())) return;
      element.textContent = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    });
  }

  function normalizeText(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, textarea, code, pre')) return NodeFilter.FILTER_REJECT;
        return arabicIndic.test(node.nodeValue || '') || easternArabicIndic.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => { node.nodeValue = toLatinDigits(node.nodeValue || ''); });
  }

  let queued = false;
  function normalize() {
    queued = false;
    formatTimeElements();
    normalizeText();
  }

  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(normalize);
  });

  const start = () => {
    normalize();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

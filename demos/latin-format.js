(() => {
  'use strict';

  const arabicIndicGlobal = /[٠-٩]/g;
  const easternArabicIndicGlobal = /[۰-۹]/g;
  const arabicIndicTest = /[٠-٩]/;
  const easternArabicIndicTest = /[۰-۹]/;
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const easternDigits = '۰۱۲۳۴۵۶۷۸۹';

  function toLatinDigits(value) {
    return String(value)
      .replace(arabicIndicGlobal, (digit) => String(arabicDigits.indexOf(digit)))
      .replace(easternArabicIndicGlobal, (digit) => String(easternDigits.indexOf(digit)));
  }

  function formatTimeElements(root = document) {
    const elements = root.querySelectorAll?.('time[datetime]') ?? [];
    elements.forEach((element) => {
      const date = new Date(element.dateTime);
      if (Number.isNaN(date.getTime())) return;
      const formatted = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
      element.dir = 'ltr';
      element.style.unicodeBidi = 'isolate';
      if (element.textContent !== formatted) element.textContent = formatted;
    });
  }

  function normalizeText(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, textarea, code, pre')) return NodeFilter.FILTER_REJECT;
        const value = node.nodeValue || '';
        return arabicIndicTest.test(value) || easternArabicIndicTest.test(value)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const normalized = toLatinDigits(node.nodeValue || '');
      if (node.nodeValue !== normalized) node.nodeValue = normalized;
    });
  }

  function installEnterpriseRoleControl() {
    if (!window.location.pathname.includes('/demos/enterprise-workflow/')) return;

    const rolePanel = document.querySelector('.role-panel');
    if (rolePanel) {
      rolePanel.classList.add('role-panel--floating');
      rolePanel.setAttribute('aria-label', 'Demo role switcher');
      if (rolePanel.parentElement !== document.body) document.body.append(rolePanel);
    }

    if (!document.querySelector('link[data-floating-role-control]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './floating-role-control.css';
      stylesheet.dataset.floatingRoleControl = '';
      document.head.append(stylesheet);
    }
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
    installEnterpriseRoleControl();
    normalize();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
(() => {
  'use strict';

  const STORAGE_KEY = 'x7do0-masroofi-demo-v1';
  const LANGUAGE_KEY = 'x7do0-language';

  const i18n = {
    ar: {
      portfolio: 'البورتفوليو', personal: 'مصاريفي الشخصية', sample: 'بيانات تجريبية فقط', reset: 'إعادة',
      hello: 'نظرة سريعة على مصروفي', helloCopy: 'الرصيد محسوب مباشرة من الدخل والمصروفات.', addExpense: 'إضافة مصروف',
      balance: 'الرصيد الحالي', balanceHint: 'يتحدث فورًا بعد أي إضافة أو حذف', income: 'الدخل', expenses: 'المصروفات', thisMonth: 'هذا الشهر',
      recent: 'آخر العمليات', recentCopy: 'سجل موحد للدخل والمصروفات', home: 'الرئيسية', history: 'السجل',
      goal: 'جرّب الإضافة الفورية', step1: 'أضف مصروفًا جديدًا', step2: 'لاحظ تغيّر الرصيد والإجمالي', step3: 'احذف العملية وشاهد رجوع الأرقام',
      localNote: 'كل شيء في هذا الـDemo داخل جلسة المتصفح فقط.', newExpense: 'إضافة مصروف تجريبي', formHint: 'لن ترسل أي بيانات إلى خادم.',
      name: 'اسم المصروف', amount: 'المبلغ', category: 'التصنيف', note: 'ملاحظة', notePlaceholder: 'اختياري', food: 'طعام ومشروبات', transport: 'مواصلات', shopping: 'تسوق',
      cancel: 'إلغاء', saveExpense: 'حفظ المصروف', salary: 'راتب تجريبي', groceries: 'مشتريات منزلية', coffee: 'قهوة', noTransactions: 'لا توجد عمليات بعد.',
      added: 'تمت إضافة المصروف وتحديث الرصيد فورًا.', deleted: 'تم حذف العملية وعادت الأرقام للتحديث.', currency: 'د.ع', deleteLabel: 'حذف'
    },
    en: {
      portfolio: 'Portfolio', personal: 'My personal expenses', sample: 'Sample data only', reset: 'Reset',
      hello: 'A quick look at Masroofi', helloCopy: 'Balance is calculated directly from income and expenses.', addExpense: 'Add expense',
      balance: 'Current balance', balanceHint: 'Updates instantly after every add or delete', income: 'Income', expenses: 'Expenses', thisMonth: 'This month',
      recent: 'Recent transactions', recentCopy: 'One timeline for income and expenses', home: 'Home', history: 'History',
      goal: 'Try instant updates', step1: 'Add a new expense', step2: 'Watch balance and totals update', step3: 'Delete it and see the numbers revert',
      localNote: 'Everything in this demo stays in this browser session.', newExpense: 'Add a demo expense', formHint: 'No data is sent to a server.',
      name: 'Expense name', amount: 'Amount', category: 'Category', note: 'Note', notePlaceholder: 'Optional', food: 'Food & drinks', transport: 'Transport', shopping: 'Shopping',
      cancel: 'Cancel', saveExpense: 'Save expense', salary: 'Demo salary', groceries: 'Home groceries', coffee: 'Coffee', noTransactions: 'No transactions yet.',
      added: 'Expense added and balance updated instantly.', deleted: 'Transaction deleted and totals recalculated.', currency: 'IQD', deleteLabel: 'Delete'
    }
  };

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  function initialLanguage() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl === 'en') return 'en';
    if (fromUrl === 'ar') return 'ar';
    return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'ar';
  }

  function seededState() {
    const now = Date.now();
    return {
      transactions: [
        { id: 'seed-income', type: 'income', nameKey: 'salary', amount: 1500000, category: 'income', note: '', at: now - 1000 * 60 * 60 * 20 },
        { id: 'seed-expense', type: 'expense', nameKey: 'groceries', amount: 150000, category: 'shopping', note: '', at: now - 1000 * 60 * 60 * 4 }
      ],
      createdDemoExpense: false,
      sawUpdatedTotals: false,
      deletedDemoExpense: false
    };
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return seededState();
      const parsed = JSON.parse(raw);
      return {
        ...seededState(),
        ...parsed,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : seededState().transactions
      };
    } catch {
      return seededState();
    }
  }

  let language = initialLanguage();
  let state = loadState();
  let toastTimer = null;

  function t(key) { return i18n[language][key] ?? key; }
  function saveState() { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function money(value) {
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ${t('currency')}`;
  }

  function transactionName(tx) {
    if (tx.nameKey) return t(tx.nameKey);
    return tx.name;
  }

  function totals() {
    const income = state.transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = state.transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expenses, balance: income - expenses };
  }

  function categoryLabel(category) {
    if (category === 'transport') return t('transport');
    if (category === 'shopping') return t('shopping');
    if (category === 'income') return t('income');
    return t('food');
  }

  function formatTime(at) {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(at));
  }

  function showToast(message) {
    const toast = qs('[data-toast]');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANGUAGE_KEY, language);
    qsa('[data-i18n]').forEach((element) => {
      const value = i18n[language][element.dataset.i18n];
      if (value) element.textContent = value;
    });
    qsa('[data-i18n-placeholder]').forEach((element) => {
      const value = i18n[language][element.dataset.i18nPlaceholder];
      if (value) element.placeholder = value;
    });
    qs('[data-lang]').textContent = language === 'ar' ? 'EN' : 'AR';
    qs('[data-back]').href = language === 'en' ? '../../?lang=en#projects' : '../../#projects';
    const url = new URL(location.href);
    if (language === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
    history.replaceState({}, '', url);
    document.title = language === 'ar' ? 'مصروفي — تجربة تفاعلية' : 'Masroofi — Interactive Demo';
  }

  function renderGuide() {
    qsa('[data-step]').forEach((item) => item.classList.remove('current', 'done'));
    const step1 = qs('[data-step="1"]');
    const step2 = qs('[data-step="2"]');
    const step3 = qs('[data-step="3"]');
    if (!state.createdDemoExpense) {
      step1.classList.add('current');
      return;
    }
    step1.classList.add('done');
    if (!state.deletedDemoExpense) {
      step2.classList.add('done');
      step3.classList.add('current');
      return;
    }
    step2.classList.add('done');
    step3.classList.add('done');
  }

  function renderTransactions() {
    const host = qs('[data-list]');
    host.replaceChildren();
    const sorted = [...state.transactions].sort((a, b) => b.at - a.at);
    if (!sorted.length) {
      const p = document.createElement('p');
      p.textContent = t('noTransactions');
      host.append(p);
      return;
    }

    sorted.forEach((tx) => {
      const row = document.createElement('article');
      row.className = `transaction ${tx.type}`;
      row.dataset.transactionId = tx.id;
      const sign = tx.type === 'income' ? '+' : '−';
      const icon = tx.type === 'income' ? '↗' : tx.category === 'transport' ? '🚕' : tx.category === 'shopping' ? '🛍️' : '☕';
      row.innerHTML = `
        <span class="tx-icon" aria-hidden="true">${icon}</span>
        <div class="tx-copy"><strong>${transactionName(tx)}</strong><small>${categoryLabel(tx.category)} · ${formatTime(tx.at)}</small></div>
        <strong class="tx-amount">${sign}${money(tx.amount)}</strong>
        <button class="delete" type="button" aria-label="${t('deleteLabel')}" data-delete="${tx.id}">×</button>`;
      row.querySelector('[data-delete]').addEventListener('click', () => deleteTransaction(tx.id));
      host.append(row);
    });
  }

  function render() {
    const summary = totals();
    qs('[data-balance]').textContent = money(summary.balance);
    qs('[data-income]').textContent = money(summary.income);
    qs('[data-expenses]').textContent = money(summary.expenses);
    qs('[data-count]').textContent = String(state.transactions.length);
    renderTransactions();
    renderGuide();
    saveState();
  }

  function openDialog() {
    const form = qs('[data-form]');
    form.elements.name.value = t('coffee');
    form.elements.amount.value = '5000';
    form.elements.category.value = 'food';
    form.elements.note.value = '';
    qs('[data-dialog]').showModal();
    setTimeout(() => form.elements.name.focus(), 30);
  }

  function createExpense(form) {
    const data = new FormData(form);
    const tx = {
      id: `demo-${Date.now()}`,
      type: 'expense',
      name: String(data.get('name') || '').trim() || t('coffee'),
      amount: Math.max(0, Number(data.get('amount') || 0)),
      category: String(data.get('category') || 'food'),
      note: String(data.get('note') || '').trim(),
      at: Date.now(),
      isDemoCreated: true
    };
    state.transactions.push(tx);
    state.createdDemoExpense = true;
    state.sawUpdatedTotals = true;
    state.deletedDemoExpense = false;
    qs('[data-dialog]').close();
    render();
    showToast(t('added'));
  }

  function deleteTransaction(id) {
    const target = state.transactions.find((tx) => tx.id === id);
    state.transactions = state.transactions.filter((tx) => tx.id !== id);
    if (target?.isDemoCreated) state.deletedDemoExpense = true;
    render();
    showToast(t('deleted'));
  }

  function reset() {
    state = seededState();
    saveState();
    render();
  }

  qs('[data-add-expense]').addEventListener('click', openDialog);
  qsa('[data-close]').forEach((button) => button.addEventListener('click', () => qs('[data-dialog]').close()));
  qs('[data-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    createExpense(event.currentTarget);
  });
  qs('[data-reset]').addEventListener('click', reset);
  qs('[data-lang]').addEventListener('click', () => {
    language = language === 'ar' ? 'en' : 'ar';
    applyLanguage();
    render();
  });

  applyLanguage();
  render();
})();
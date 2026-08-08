import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const outputRoot = path.resolve('assets/projects');
const masroofiRoot = path.join(outputRoot, 'masroofi');
const academyRoot = path.join(outputRoot, 'coding-academy');

await Promise.all([
  mkdir(masroofiRoot, { recursive: true }),
  mkdir(academyRoot, { recursive: true }),
]);

console.log('Launching browser...');
const browser = await chromium.launch({ headless: true });
console.log('Browser ready.');

async function capture(page, directory, name, options = {}) {
  await page.screenshot({
    path: path.join(directory, `${name}.jpg`),
    type: 'jpeg',
    quality: 86,
    fullPage: options.fullPage ?? false,
  });
}

async function seedMasroofi(page) {
  const now = new Date();
  const iso = (daysAgo, hour) => {
    const value = new Date(now);
    value.setDate(value.getDate() - daysAgo);
    value.setHours(hour, 20, 0, 0);
    return value.toISOString();
  };
  const records = [
    { id: 'portfolio-income-salary', type: 'income', amount: 1800000, note: 'راتب هذا الشهر', emoji: '💼', occurredAt: iso(5, 9), createdAt: iso(5, 9), updatedAt: iso(5, 9) },
    { id: 'portfolio-income-freelance', type: 'income', amount: 450000, note: 'دفعة مشروع برمجي', emoji: '💻', occurredAt: iso(2, 14), createdAt: iso(2, 14), updatedAt: iso(2, 14) },
    { id: 'portfolio-expense-market', type: 'expense', amount: 138000, note: 'مشتريات البيت', emoji: '🛒', occurredAt: iso(1, 18), createdAt: iso(1, 18), updatedAt: iso(1, 18) },
    { id: 'portfolio-expense-transport', type: 'expense', amount: 35000, note: 'تنقلات اليوم', emoji: '🚕', occurredAt: iso(0, 11), createdAt: iso(0, 11), updatedAt: iso(0, 11) },
    { id: 'portfolio-expense-internet', type: 'expense', amount: 45000, note: 'اشتراك الإنترنت', emoji: '🌐', occurredAt: iso(3, 16), createdAt: iso(3, 16), updatedAt: iso(3, 16) },
  ];

  await page.evaluate(async (items) => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.open('masroofi-db', 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore('transactions', { keyPath: 'id' });
        store.createIndex('occurredAt', 'occurredAt');
        store.createIndex('type', 'type');
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('transactions', 'readwrite');
        const store = tx.objectStore('transactions');
        store.clear();
        items.forEach((item) => store.put(item));
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, records);
  await page.reload();
  await page.getByText('الرصيد الحالي').first().waitFor();
}

async function captureMasroofi() {
  console.log('Capturing Masroofi...');
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/Masroofi/', { waitUntil: 'networkidle' });
  await seedMasroofi(page);
  await capture(page, masroofiRoot, '01-balance-dashboard-light');

  await page.getByRole('button', { name: 'المصروفات' }).click();
  await page.getByRole('heading', { name: 'سجل المصروفات' }).waitFor();
  await capture(page, masroofiRoot, '02-expenses-and-entry-form', { fullPage: true });

  await page.getByRole('button', { name: 'السجل' }).click();
  await page.getByText('فلترة السجل').waitFor({ state: 'hidden' }).catch(() => {});
  await capture(page, masroofiRoot, '03-unified-history');

  await page.getByRole('button', { name: 'النسخ الاحتياطي والاسترجاع' }).click();
  await page.getByRole('dialog', { name: 'النسخ الاحتياطي والاسترجاع' }).waitFor();
  await capture(page, masroofiRoot, '04-backup-and-restore');
  await page.getByRole('button', { name: 'إغلاق' }).click();

  await page.getByLabel('التنقل الرئيسي').getByRole('button', { name: 'الدخل' }).click();
  await page.getByRole('heading', { name: 'سجل الدخل' }).waitFor();
  await page.locator('.date-trigger').click();
  await page.getByRole('dialog').waitFor();
  await capture(page, masroofiRoot, '05-modern-date-picker');
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto('http://127.0.0.1:5173/Masroofi/', { waitUntil: 'networkidle' });
  await seedMasroofi(mobilePage);
  await mobilePage.getByRole('button', { name: /المظهر الحالي/ }).click();
  await mobilePage.getByRole('button', { name: /المظهر الحالي/ }).click();
  await capture(mobilePage, masroofiRoot, '06-mobile-dark-dashboard');
  await mobile.close();
}

async function captureAcademy() {
  console.log('Capturing Coding Academy...');
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'تعلّم البرمجة بخطوات واضحة' }).waitFor();
  await capture(page, academyRoot, '01-learning-home');

  await page.goto('http://127.0.0.1:4174/courses/python/index.html', { waitUntil: 'networkidle' });
  await page.locator('.concept-card').first().waitFor();
  await capture(page, academyRoot, '02-python-topic-cards');

  await page.locator('.concept-point').first().hover();
  await page.locator('#code-preview-popover[aria-hidden="false"]').waitFor();
  await capture(page, academyRoot, '03-topic-code-preview');

  await page.goto('http://127.0.0.1:4174/courses/python/lessons/index.html#lesson-05', { waitUntil: 'networkidle' });
  await page.locator('.lesson-document').waitFor();
  await capture(page, academyRoot, '04-lesson-and-source-files', { fullPage: true });

  await page.goto('http://127.0.0.1:4174/courses/python/practice/index.html', { waitUntil: 'networkidle' });
  await page.locator('.practice-question-card').first().waitFor();
  await capture(page, academyRoot, '05-practice-library');

  await page.goto('http://127.0.0.1:4174/courses/python/practice/question.html?id=6', { waitUntil: 'networkidle' });
  await page.locator('main').waitFor();
  await capture(page, academyRoot, '06-interactive-exercise', { fullPage: true });
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pageMobile = await mobile.newPage();
  await pageMobile.goto('http://127.0.0.1:4174/courses/python/index.html', { waitUntil: 'networkidle' });
  await pageMobile.locator('.concept-card').first().waitFor();
  await capture(pageMobile, academyRoot, '07-mobile-topic-path');
  await mobile.close();
}

try {
  await captureMasroofi();
  await captureAcademy();
  console.log('Captured Masroofi and Coding Academy case-study media.');
} finally {
  await browser.close();
}

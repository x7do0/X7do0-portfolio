import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const appUrl = process.env.MASROOFI_URL ?? 'http://127.0.0.1:5173/Masroofi/';
const output = path.resolve('assets/projects/masroofi');
await mkdir(output, { recursive: true });

function sampleTransactions() {
  const now = new Date();
  const at = (daysAgo, hour) => {
    const value = new Date(now);
    value.setDate(value.getDate() - daysAgo);
    value.setHours(hour, 20, 0, 0);
    return value.toISOString();
  };
  const item = (id, type, amount, title, emoji, daysAgo, hour, note = '') => ({
    id,
    type,
    amount,
    title,
    note,
    emoji,
    occurredAt: at(daysAgo, hour),
    createdAt: at(daysAgo, hour),
    updatedAt: at(daysAgo, hour),
  });
  return [
    item('portfolio-income-salary', 'income', 1800000, 'راتب هذا الشهر', '💼', 5, 9, 'الراتب الشهري'),
    item('portfolio-income-freelance', 'income', 450000, 'دفعة مشروع برمجي', '💻', 2, 14),
    item('portfolio-expense-market', 'expense', 138000, 'مشتريات البيت', '🛒', 1, 18),
    item('portfolio-expense-transport', 'expense', 35000, 'تنقلات اليوم', '🚕', 0, 11),
    item('portfolio-expense-internet', 'expense', 45000, 'اشتراك الإنترنت', '🌐', 3, 16),
  ];
}

async function seed(page) {
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
        const database = request.result;
        const transaction = database.transaction('transactions', 'readwrite');
        const store = transaction.objectStore('transactions');
        store.clear();
        items.forEach((entry) => store.put(entry));
        transaction.oncomplete = () => { database.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, sampleTransactions());
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('الرصيد الحالي').first().waitFor();
}

async function stabilize(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
  await page.waitForTimeout(250);
}

async function capture(page, name) {
  await stabilize(page);
  await page.screenshot({ path: path.join(output, `${name}.png`), type: 'png', fullPage: false });
}

async function openApp(context, theme = 'light') {
  const page = await context.newPage();
  await page.goto(appUrl, { waitUntil: 'networkidle' });
  await page.evaluate((value) => localStorage.setItem('masroofi-theme', value), theme);
  await seed(page);
  return page;
}

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
  const page = await openApp(desktop, 'light');
  await capture(page, '01-balance-dashboard-light');

  await page.locator('.bottom-nav').getByRole('button', { name: 'الدخل' }).click();
  await page.getByRole('heading', { name: 'سجل الدخل' }).waitFor();
  await capture(page, '02-income-and-entry-form');

  await page.locator('.bottom-nav').getByRole('button', { name: 'المصروفات' }).click();
  await page.getByRole('heading', { name: 'سجل المصروفات' }).waitFor();
  await capture(page, '03-expenses-and-entry-form');

  await page.locator('.bottom-nav').getByRole('button', { name: 'السجل' }).click();
  await page.getByText('كل العمليات').first().waitFor();
  await capture(page, '04-unified-history');

  await page.getByRole('button', { name: 'النسخ الاحتياطي والاسترجاع' }).click();
  await page.getByRole('dialog', { name: 'النسخ الاحتياطي والاسترجاع' }).waitFor();
  await capture(page, '05-backup-and-restore');
  await page.getByRole('button', { name: 'إغلاق' }).click();

  await page.locator('.bottom-nav').getByRole('button', { name: 'الدخل' }).click();
  await page.locator('.date-trigger').click();
  await page.getByRole('dialog').waitFor();
  await capture(page, '06-modern-date-picker');
  await desktop.close();

  const mobileLight = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' });
  const mobileLightPage = await openApp(mobileLight, 'light');
  await capture(mobileLightPage, '07-mobile-light-dashboard');
  await mobileLight.close();

  const mobileDark = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark' });
  const mobileDarkPage = await openApp(mobileDark, 'dark');
  await capture(mobileDarkPage, '08-mobile-dark-dashboard');
  await mobileDark.close();

  console.log('Captured 8 crisp Masroofi product screens as PNG files.');
} finally {
  await browser.close();
}

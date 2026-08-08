import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const output = path.resolve('assets/projects/enterprise-workflow');
const employeeEmail = process.env.ENTERPRISE_E2E_EMPLOYEE_EMAIL;
const managerEmail = process.env.ENTERPRISE_E2E_MANAGER_EMAIL;
const password = process.env.ENTERPRISE_E2E_PASSWORD;
if (!employeeEmail || !managerEmail || !password) {
  throw new Error('Set ENTERPRISE_E2E_EMPLOYEE_EMAIL, ENTERPRISE_E2E_MANAGER_EMAIL, and ENTERPRISE_E2E_PASSWORD for disposable test users.');
}
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function login(page, email) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/');
  await page.getByRole('main').waitFor();
}

async function configure(page, theme) {
  await page.evaluate((value) => {
    localStorage.setItem('workflow_language', 'en');
    localStorage.setItem('company-workflow-theme', value);
  }, theme);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('html').waitFor();
}

async function capture(page, name) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.getByText(/Loading Dashboard/i).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await page.locator('[data-slot="skeleton"], .animate-pulse').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
}

try {
  const employee = await browser.newContext({ viewport: { width: 1440, height: 960 }, colorScheme: 'light' });
  const employeePage = await employee.newPage();
  await login(employeePage, employeeEmail);
  await configure(employeePage, 'light');
  await capture(employeePage, '01-employee-dashboard-light');
  await employeePage.goto('http://localhost:3000/requests/create', { waitUntil: 'domcontentloaded' });
  await employeePage.getByRole('main').waitFor();
  await capture(employeePage, '02-employee-new-request-light');
  await employeePage.goto('http://localhost:3000/requests/my', { waitUntil: 'domcontentloaded' });
  await employeePage.getByRole('main').waitFor();
  await capture(employeePage, '03-employee-requests-light');
  await employee.close();

  const manager = await browser.newContext({ viewport: { width: 1440, height: 960 }, colorScheme: 'dark' });
  const managerPage = await manager.newPage();
  await login(managerPage, managerEmail);
  await configure(managerPage, 'dark');
  await capture(managerPage, '04-manager-dashboard-dark');
  await managerPage.goto('http://localhost:3000/approvals', { waitUntil: 'domcontentloaded' });
  await managerPage.getByRole('main').waitFor();
  await capture(managerPage, '05-manager-approvals-dark');
  await managerPage.goto('http://localhost:3000/requests', { waitUntil: 'domcontentloaded' });
  await managerPage.getByRole('main').waitFor();
  await capture(managerPage, '06-manager-team-requests-dark');
  await manager.close();
  console.log('Captured six Enterprise Workflow screens from the guarded E2E environment.');
} finally {
  await browser.close();
}

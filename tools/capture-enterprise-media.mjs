import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, request as playwrightRequest } from '@playwright/test';

const webUrl = process.env.ENTERPRISE_WEB_URL ?? 'http://localhost:3000';
const apiUrl = process.env.ENTERPRISE_API_URL ?? 'http://localhost:5103';
const sourceRoot = process.env.ENTERPRISE_SOURCE_ROOT;
const shouldPrepare = process.env.ENTERPRISE_PREPARE === '1';
const output = path.resolve('assets/projects/enterprise-workflow');
const users = {
  admin: process.env.ENTERPRISE_E2E_ADMIN_EMAIL ?? 'admin.demo@workflow.test',
  manager: process.env.ENTERPRISE_E2E_MANAGER_EMAIL ?? 'manager.demo@workflow.test',
  employee: process.env.ENTERPRISE_E2E_EMPLOYEE_EMAIL ?? 'employee.demo@workflow.test',
};
const password = process.env.ENTERPRISE_E2E_PASSWORD ?? 'Password123!';

if (shouldPrepare && !sourceRoot) {
  throw new Error('Set ENTERPRISE_SOURCE_ROOT when ENTERPRISE_PREPARE=1.');
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function assertGuardedE2EConfig() {
  const configPath = path.join(sourceRoot, 'src/Company.Workflow.API/appsettings.E2E.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const connection = config.ConnectionStrings?.DefaultConnection ?? '';
  if (config.E2E?.EnableTestEndpoints !== true || !connection.includes('Database=CompanyWorkflowDb_E2E')) {
    throw new Error('Refusing database preparation: the source is not configured for the guarded CompanyWorkflowDb_E2E database.');
  }
}

async function expectOk(response, label) {
  if (!response.ok()) {
    throw new Error(`${label} failed (${response.status()}): ${await response.text()}`);
  }
}

async function login(page, email) {
  await page.goto(`${webUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(`${webUrl}/`, { timeout: 20000 });
  await page.getByRole('main').waitFor({ timeout: 20000 });
}

async function configure(page, theme) {
  await page.evaluate((value) => {
    localStorage.setItem('workflow_language', 'en');
    localStorage.setItem('company-workflow-theme', value);
  }, theme);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('html').waitFor();
}

async function resetPassword(api, email) {
  const forgot = await api.post('/api/auth/forgot-password', { data: { email } });
  await expectOk(forgot, `Forgot password for ${email}`);
  let captured;
  for (let attempt = 0; attempt < 20 && !captured; attempt += 1) {
    const messages = await api.get('/api/setup/emails');
    await expectOk(messages, 'Read captured E2E emails');
    captured = [...await messages.json()].reverse().find((message) => message.to === email);
    if (!captured) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const legacyToken = captured?.body?.match(/password reset token is:\s*([^\s<]+)/i)?.[1];
  const linkToken = captured?.body?.match(/\/reset-password\/([^\"<\s]+)/i)?.[1];
  const token = legacyToken ?? (linkToken ? decodeURIComponent(linkToken) : undefined);
  if (!token) throw new Error(`No captured reset token for ${email}.`);
  const reset = await api.post('/api/auth/reset-password', { data: { token, newPassword: password } });
  await expectOk(reset, `Reset password for ${email}`);
}

async function prepareGuardedEnvironment() {
  await assertGuardedE2EConfig();
  const api = await playwrightRequest.newContext({ baseURL: apiUrl });
  const setupContext = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const setupPage = await setupContext.newPage();
  try {
    await expectOk(await api.post('/api/setup/reset'), 'Guarded E2E database reset');
    await expectOk(await api.post('/api/setup', {
      data: {
        companyName: 'Portfolio Demo Company',
        adminFullName: 'Avery Demo Admin',
        adminEmail: users.admin,
        adminPassword: password,
        smtpHost: 'localhost',
        smtpPort: 1025,
        smtpSenderEmail: 'noreply@workflow.test',
        smtpSenderName: 'Portfolio Workflow Demo',
        smtpUseSsl: false,
      },
    }), 'Initialize guarded E2E company');

    await login(setupPage, users.admin);
    await setupPage.goto(`${webUrl}/employees`, { waitUntil: 'domcontentloaded' });
    await setupPage.getByRole('heading', { name: 'Employees' }).waitFor({ timeout: 20000 });
    await setupPage.getByRole('button', { name: /CSV Import/ }).click();
    const csvPath = path.join(sourceRoot, 'src/Company.Workflow.Web/e2e/fixtures/employees-demo.csv');
    await setupPage.locator('input[type="file"]').setInputFiles(csvPath);
    await setupPage.getByRole('button', { name: 'Preview Import' }).click();
    await setupPage.getByRole('button', { name: 'Confirm Import' }).click();
    await setupPage.getByText('Import Successful').waitFor({ timeout: 30000 });
    await resetPassword(api, users.manager);
    await resetPassword(api, users.employee);
  } finally {
    await setupContext.close();
    await api.dispose();
  }
}

async function capture(page, name) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.getByText(/Loading Dashboard/i).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await page.locator('[data-slot="skeleton"], .animate-pulse').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false });
}

async function visitAndCapture(page, route, name) {
  await page.goto(`${webUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('main').waitFor({ timeout: 20000 });
  await capture(page, name);
}

try {
  if (shouldPrepare) await prepareGuardedEnvironment();

  const employee = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
  const employeePage = await employee.newPage();
  await login(employeePage, users.employee);
  await configure(employeePage, 'light');
  await capture(employeePage, '01-employee-dashboard-light');
  await visitAndCapture(employeePage, '/requests/create', '02-employee-new-request-light');
  await visitAndCapture(employeePage, '/requests/my', '03-employee-requests-light');
  await visitAndCapture(employeePage, '/notifications', '04-employee-notifications-light');
  await employee.close();

  const manager = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1.5, colorScheme: 'dark' });
  const managerPage = await manager.newPage();
  await login(managerPage, users.manager);
  await configure(managerPage, 'dark');
  await capture(managerPage, '05-manager-dashboard-dark');
  await visitAndCapture(managerPage, '/approvals', '06-manager-approvals-dark');
  await visitAndCapture(managerPage, '/requests', '07-manager-team-requests-dark');
  await manager.close();

  const admin = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
  const adminPage = await admin.newPage();
  await login(adminPage, users.admin);
  await configure(adminPage, 'light');
  await visitAndCapture(adminPage, '/employees', '08-admin-employees-light');
  await visitAndCapture(adminPage, '/roles', '09-admin-roles-light');
  await adminPage.goto(`${webUrl}/administration`, { waitUntil: 'domcontentloaded' });
  await adminPage.getByRole('main').waitFor({ timeout: 20000 });
  await adminPage.getByText('Workflow Designer', { exact: true }).click();
  await capture(adminPage, '10-admin-workflow-rules-light');
  await visitAndCapture(adminPage, '/reports', '11-admin-reports-light');
  await visitAndCapture(adminPage, '/audit', '12-admin-audit-trail-light');
  await admin.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light', isMobile: true });
  const mobilePage = await mobile.newPage();
  await login(mobilePage, users.employee);
  await configure(mobilePage, 'light');
  await capture(mobilePage, '13-employee-mobile-dashboard-light');
  await mobile.close();

  console.log('Captured 13 Enterprise Workflow screens from the guarded E2E environment.');
} finally {
  await browser.close();
}

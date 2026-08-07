const { test, expect } = require('@playwright/test');
const fs = require('fs');

fs.mkdirSync('artifacts', { recursive: true });

function watchRuntimeErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function revealWholePage(page) {
  const reveals = page.locator('.reveal');
  const count = await reveals.count();
  for (let index = 0; index < count; index += 1) {
    await reveals.nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
}

test('home renders all four projects, portrait, skills and both languages', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('#capabilities-title')).toContainText('المهارات');
  await expect(page.getByText('كيف أعمل', { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-project-open]')).toHaveCount(4);
  await expect(page.locator('[data-project="mahsoob"]')).toContainText('محسوب');
  await expect(page.locator('[data-project="masroofi"]')).toContainText('مصروفي');

  const portraitBackground = await page.locator('.system-window').evaluate((element) =>
    getComputedStyle(element, '::after').backgroundImage
  );
  expect(portraitBackground).toContain('profile-cutout.png');

  await revealWholePage(page);
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });

  await page.locator('[data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#hero-title')).toContainText('I build');
  await expect(page.locator('[data-project="mahsoob"]')).toContainText('Mahsoob');
  await expect(page.locator('[data-project="masroofi"]')).toContainText('Masroofi');
  expect(errors).toEqual([]);
});

test('mobile home stays usable and produces a reference screenshot', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('.system-window')).toBeVisible();
  await revealWholePage(page);
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('every project detail page links to its own demo', async ({ page }) => {
  const slugs = ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi'];
  for (const slug of slugs) {
    await page.goto(`/projects/${slug}/`);
    const link = page.locator('[data-demo-link]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', `../../demos/${slug}/`);
  }
});

test('Enterprise employee is light, manager is dark, and approval flow completes', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/enterprise-workflow/');

  await expect(page.locator('[data-role-switch="employee"]')).toHaveClass(/is-active/);
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(23, 36, 58)');
  await page.screenshot({ path: 'artifacts/enterprise-employee-light.png', fullPage: true });

  await page.locator('[data-create-request]').click();
  await expect(page.locator('[data-request-dialog]')).toBeVisible();
  await page.locator('[data-request-form] button[type="submit"]').click();
  await expect(page.locator('[data-detail-dialog]')).toBeVisible();
  await page.locator('[data-submit-request]').click();

  await page.locator('[data-role-switch="manager"]').click();
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(238, 244, 255)');
  await page.screenshot({ path: 'artifacts/enterprise-manager-dark.png', fullPage: true });

  const managerInbox = page.locator('[data-dashboard-request-list] .request-row');
  await expect(managerInbox).toHaveCount(1);
  await managerInbox.first().click();
  await page.locator('[data-approve]').click();
  await page.locator('[data-role-switch="employee"]').click();

  await expect(page.locator('[data-dashboard-request-list] .status-chip--approved')).toHaveCount(1);
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(23, 36, 58)');
  await page.screenshot({ path: 'artifacts/enterprise-demo-approved.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Mahsoob cashier adds a product, calculates change, and completes a sale', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/mahsoob/');

  await page.locator('[data-product="1001"]').click();
  await expect(page.locator('[data-cart-count]')).toHaveText('1');
  await expect(page.locator('[data-total]')).not.toHaveText(/^(0|٠)/);

  await page.locator('[data-cash]').fill('1000');
  await expect(page.locator('[data-checkout]')).toBeEnabled();
  await page.locator('[data-checkout]').click();
  await expect(page.locator('[data-receipt]')).toBeVisible();
  await expect(page.locator('[data-receipt-total]')).not.toHaveText('');
  await page.screenshot({ path: 'artifacts/mahsoob-demo.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Masroofi adds an expense, updates totals, then reverts after delete', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/masroofi/');

  const initialBalance = await page.locator('[data-balance]').textContent();
  const initialExpenses = await page.locator('[data-expenses]').textContent();

  await page.locator('[data-add-expense]').click();
  await expect(page.locator('[data-dialog]')).toBeVisible();
  await page.locator('[data-form] button[type="submit"]').click();

  await expect(page.locator('[data-transaction-id^="demo-"]')).toHaveCount(1);
  await expect(page.locator('[data-balance]')).not.toHaveText(initialBalance || '');
  await expect(page.locator('[data-expenses]')).not.toHaveText(initialExpenses || '');
  await page.screenshot({ path: 'artifacts/masroofi-demo-added.png', fullPage: true });

  await page.locator('[data-transaction-id^="demo-"] [data-delete]').click();
  await expect(page.locator('[data-transaction-id^="demo-"]')).toHaveCount(0);
  await expect(page.locator('[data-balance]')).toHaveText(initialBalance || '');
  await expect(page.locator('[data-expenses]')).toHaveText(initialExpenses || '');
  expect(errors).toEqual([]);
});

test('Coding Academy validates Python practice and updates progress to 100%', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/coding-academy/');

  await expect(page.locator('[data-progress-label]')).toHaveText('50%');
  await page.locator('[data-go-practice]').click();
  await expect(page.locator('[data-view="practice"]')).toHaveClass(/active/);
  await page.locator('[data-editor]').fill('name = "Magnus"\nprint(name)');
  await page.locator('[data-check]').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/success/);
  await expect(page.locator('[data-progress-label]')).toHaveText('100%');
  await expect(page.locator('[data-view="result"]')).toHaveClass(/active/);
  await page.screenshot({ path: 'artifacts/coding-academy-demo.png', fullPage: true });
  expect(errors).toEqual([]);
});

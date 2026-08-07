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

test('home renders portrait, skills and both languages without runtime errors', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('#capabilities-title')).toContainText('المهارات');
  await expect(page.getByText('كيف أعمل', { exact: true })).toHaveCount(0);

  const portraitBackground = await page.locator('.system-window').evaluate((element) =>
    getComputedStyle(element, '::after').backgroundImage
  );
  expect(portraitBackground).toContain('profile-cutout.png');

  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });

  await page.locator('[data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#hero-title')).toContainText('I build');
  expect(errors).toEqual([]);
});

test('mobile home stays usable and produces a reference screenshot', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('.system-window')).toBeVisible();
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Enterprise Workflow demo completes employee to manager approval flow', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/enterprise-workflow/');

  await page.locator('[data-create-request]').click();
  await expect(page.locator('[data-request-dialog]')).toBeVisible();
  await page.locator('[data-request-form] button[type="submit"]').click();

  await expect(page.locator('[data-detail-dialog]')).toBeVisible();
  await page.locator('[data-submit-request]').click();
  await page.locator('[data-role-switch="manager"]').click();

  const managerInbox = page.locator('[data-dashboard-request-list] .request-row');
  await expect(managerInbox).toHaveCount(1);
  await managerInbox.first().click();
  await page.locator('[data-approve]').click();
  await page.locator('[data-role-switch="employee"]').click();

  await expect(page.locator('[data-dashboard-request-list] .status-chip--approved')).toHaveCount(1);
  await page.screenshot({ path: 'artifacts/enterprise-demo-approved.png', fullPage: true });
  expect(errors).toEqual([]);
});

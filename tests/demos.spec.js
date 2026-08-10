const { test, expect } = require('@playwright/test');

function runtimeErrors(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

test('Enterprise demo creates, submits, and approves a request', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/demos/enterprise-workflow/');
  await page.locator('[data-create-request]').click();
  await page.locator('[data-request-form] button[type="submit"]').click();
  await page.locator('[data-submit-request]').click();
  await page.locator('[data-role-switch="manager"]').click();
  await expect(page.locator('[data-create-request]')).toBeHidden();
  await expect(page.locator('[data-dashboard-request-list] .request-row')).toHaveCount(1);
  await page.locator('[data-dashboard-request-list] .request-row').click();
  await page.locator('[data-approve]').click();
  await page.locator('[data-role-switch="employee"]').click();
  await expect(page.locator('[data-dashboard-request-list] .status-chip--approved')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('Mahsoob demo completes a cash sale', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/demos/mahsoob/');
  await page.locator('[data-product="1001"]').click();
  await expect(page.locator('[data-cart-count]')).toHaveText('1');
  await page.locator('[data-cash]').fill('1000');
  await expect(page.locator('[data-checkout]')).toBeEnabled();
  await page.locator('[data-checkout]').click();
  await expect(page.locator('[data-receipt]')).toBeVisible();
  expect(errors).toEqual([]);
});

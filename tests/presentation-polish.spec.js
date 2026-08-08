const { test, expect } = require('@playwright/test');

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

test('project identities are prominent and immediately readable beside live previews', async ({ page }) => {
  await page.goto('/');

  const projects = ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi'];
  for (const slug of projects) {
    const article = page.locator(`[data-project="${slug}"]`);
    const title = article.locator('.project-copy h3');
    const preview = article.locator('.project-live-preview');
    const details = article.locator('[data-project-open]');

    await expect(title).toBeVisible();
    await expect(preview).toBeVisible();
    await expect(details).toBeVisible();

    const fontSize = await title.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(fontSize).toBeGreaterThan(38);

    const category = await title.evaluate((element) => getComputedStyle(element, '::before').content);
    expect(category).not.toBe('none');
    expect(category).not.toBe('""');
  }

  await page.screenshot({ path: 'artifacts/project-identity-desktop.png', fullPage: true });
  await expectNoHorizontalOverflow(page);
});

test('mobile project identity appears before each live preview and remains compact', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
    const article = page.locator(`[data-project="${slug}"]`);
    await article.scrollIntoViewIfNeeded();
    const copyBox = await article.locator('.project-copy').boundingBox();
    const previewBox = await article.locator('.project-live-preview').boundingBox();
    expect(copyBox).not.toBeNull();
    expect(previewBox).not.toBeNull();
    expect(copyBox.y).toBeLessThan(previewBox.y);
  }

  await page.screenshot({ path: 'artifacts/project-identity-mobile.png', fullPage: true });
  await expectNoHorizontalOverflow(page);
});

test('Enterprise role switcher is a floating top demo control, not app chrome', async ({ page }) => {
  await page.goto('/demos/enterprise-workflow/');

  const control = page.locator('.role-panel--floating');
  await expect(control).toBeVisible();
  await expect(control).toHaveCSS('position', 'fixed');

  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y).toBeGreaterThanOrEqual(76);
  expect(box.y).toBeLessThan(150);

  const employee = control.locator('[data-role-switch="employee"]');
  const manager = control.locator('[data-role-switch="manager"]');
  await expect(employee).toHaveClass(/is-active/);

  const background = await control.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');

  await manager.click();
  await expect(manager).toHaveClass(/is-active/);
  await expect(employee).not.toHaveClass(/is-active/);

  await employee.click();
  await expect(employee).toHaveClass(/is-active/);
  await page.screenshot({ path: 'artifacts/enterprise-floating-role.png', fullPage: true });
  await expectNoHorizontalOverflow(page);
});

test('floating role control stays at the top on mobile without covering the page width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demos/enterprise-workflow/');

  const control = page.locator('.role-panel--floating');
  await expect(control).toBeVisible();
  await expect(control).toHaveCSS('position', 'fixed');

  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeLessThanOrEqual(362);
  expect(box.x).toBeGreaterThanOrEqual(12);
  expect(box.x + box.width).toBeLessThanOrEqual(378);
  expect(box.y).toBeGreaterThanOrEqual(72);
  expect(box.y).toBeLessThan(145);

  await page.screenshot({ path: 'artifacts/enterprise-floating-role-mobile.png', fullPage: true });
  await expectNoHorizontalOverflow(page);
});
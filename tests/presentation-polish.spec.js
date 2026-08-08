const { test, expect } = require('@playwright/test');

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function jumpToSection(page, id) {
  await page.evaluate((sectionId) => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    document.getElementById(sectionId)?.scrollIntoView({ block: 'center', behavior: 'auto' });
    root.style.scrollBehavior = previous;
  }, id);
  await page.waitForTimeout(220);
}

test('editorial hero is complete in the first viewport and atmosphere changes through the page', async ({ page }) => {
  await page.goto('/');
  const portrait = page.locator('.hero-portrait');
  const image = portrait.locator('img');
  await expect(portrait).toBeVisible();
  await expect(image).toBeVisible();
  expect(await image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBeTruthy();
  await page.screenshot({ path: 'artifacts/hero-initial-desktop.png' });

  const checkpoints = [
    ['projects', 'atmosphere-projects.png'],
    ['capabilities', 'atmosphere-capabilities.png'],
    ['contact', 'atmosphere-contact.png']
  ];

  for (const [section, file] of checkpoints) {
    await jumpToSection(page, section);
    await expect(page.locator('html')).toHaveAttribute('data-scroll-section', section);
    await page.screenshot({ path: `artifacts/${file}` });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.hero-portrait')).toBeVisible();
  await expect(page.locator('.hero-portrait img')).toBeVisible();
  await page.screenshot({ path: 'artifacts/hero-initial-mobile.png' });
  await expectNoHorizontalOverflow(page);
});

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
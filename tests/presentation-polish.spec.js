const { test, expect } = require('@playwright/test');

async function expectNoOverflow(page) {
  const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
}

test('desktop layout keeps breathing room and stable lightweight motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const container = await page.locator('.container').first().boundingBox();
  expect(container.width).toBeLessThanOrEqual(1120);
  expect(container.x).toBeGreaterThanOrEqual(150);
  const row = page.locator('.project-row').first();
  await expect(row).toBeVisible();
  const transition = await row.evaluate(element => getComputedStyle(element).transitionProperty);
  expect(transition).toContain('transform');
  expect(transition).not.toContain('filter');
  await expect(page.locator('script[src*="scroll-atmosphere"]')).toHaveCount(0);
  await expect(page.locator('.skills-showcase')).toBeVisible();
  await page.screenshot({ path: 'artifacts/portfolio-v2-desktop.png', fullPage: true });
  await expectNoOverflow(page);
});

test('mobile puts project identity before its visual and keeps actions clear', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
    const row = page.locator(`[data-project="${slug}"]`);
    const copy = await row.locator('.project-copy').boundingBox();
    const media = await row.locator('.project-media').boundingBox();
    expect(copy.y).toBeLessThan(media.y);
    await expect(row.locator('.demo-trigger')).toBeVisible();
    await expect(row.locator('.project-actions a')).toHaveCount(2);
  }
  await page.screenshot({ path: 'artifacts/portfolio-v2-mobile.png', fullPage: true });
  await expectNoOverflow(page);
});

test('reduced motion removes animated duration', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const duration = await page.locator('.project-row').first().evaluate(element => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
  await context.close();
});

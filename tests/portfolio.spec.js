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
    const item = reveals.nth(index);
    if (!(await item.isVisible())) continue;
    await item.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectLatinNumerals(page, selector = 'body') {
  const text = await page.locator(selector).innerText();
  expect(text).not.toMatch(/[٠-٩۰-۹]/);
}

async function portraitBaseHeight(page) {
  return page.locator('.hero .window-statusbar').evaluate((element) => parseFloat(getComputedStyle(element).height));
}

test('home renders source-backed project UIs, anchored portrait, YouTube and no unfinished placeholders', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('#capabilities-title')).toContainText('المهارات');
  await expect(page.getByText('كيف أعمل', { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-project-open]')).toHaveCount(4);
  await expect(page.locator('.project-live-preview')).toHaveCount(4);
  await expect(page.locator('[data-project="mahsoob"]')).toContainText('محسوب');
  await expect(page.locator('[data-project="masroofi"]')).toContainText('مصروفي');

  for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
    const liveLink = page.locator(`[data-live-preview="${slug}"] .live-preview-link`);
    await expect(liveLink).toBeVisible();
    await expect(liveLink).toHaveAttribute('href', `./demos/${slug}/`);
    await expect(liveLink).toHaveAttribute('aria-label', /.+/);
  }

  await expect(page.locator('.live-enterprise')).toHaveCSS('background-color', 'rgb(250, 250, 250)');

  const portraitBackground = await page.locator('.system-window').evaluate((element) =>
    getComputedStyle(element, '::after').backgroundImage
  );
  expect(portraitBackground).toContain('profile-cutout.png');
  await expect(page.locator('.hero .window-statusbar')).toHaveCSS('display', 'block');
  expect(await portraitBaseHeight(page)).toBeGreaterThanOrEqual(58);

  await expect(page.locator('.knowledge .media-rail')).toBeHidden();
  await expect(page.locator('.contact-link[href]')).toHaveCount(2);
  await expect(page.locator('[data-contact-id="github"]')).toBeVisible();
  const youtube = page.locator('[data-contact-id="youtube"]');
  await expect(youtube).toBeVisible();
  await expect(youtube).toHaveAttribute('href', 'https://youtube.com/@x7do0eng?si=bRb1wQVL0y4vTbjq');
  const disabledContacts = page.locator('.contact-link.is-disabled');
  await expect(disabledContacts).toHaveCount(3);
  for (let index = 0; index < await disabledContacts.count(); index += 1) {
    await expect(disabledContacts.nth(index)).toBeHidden();
  }

  await expectLatinNumerals(page, '#projects');
  await revealWholePage(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });

  await page.locator('[data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#hero-title')).toContainText('I build');
  await expect(page.locator('[data-project="mahsoob"]')).toContainText('Mahsoob');
  await expect(page.locator('[data-project="masroofi"]')).toContainText('Masroofi');
  await expect(page.locator('.live-enterprise')).toContainText('Employee');
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('mobile home keeps portrait seated on its platform and previews usable', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('.system-window')).toBeVisible();
  await expect(page.locator('.project-live-preview')).toHaveCount(4);
  await expect(page.locator('.hero .window-statusbar')).toHaveCSS('display', 'block');
  expect(await portraitBaseHeight(page)).toBeGreaterThanOrEqual(48);
  const visualHeight = await page.locator('.hero .system-window').evaluate((element) => parseFloat(getComputedStyle(element).height));
  expect(visualHeight).toBeLessThanOrEqual(370);
  await expect(page.locator('.knowledge .media-rail')).toBeHidden();
  await revealWholePage(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('public SEO routes are healthy and demo simulations stay out of the crawl surface', async ({ request }) => {
  const publicRoutes = [
    '/',
    '/?lang=en',
    '/resume/',
    '/projects/enterprise-workflow/',
    '/projects/coding-academy/',
    '/projects/mahsoob/',
    '/projects/masroofi/'
  ];

  for (const route of publicRoutes) {
    const response = await request.get(route);
    expect(response.ok(), `${route} should return a successful response`).toBeTruthy();
  }

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toContain('Disallow: /X7do0-portfolio/demos/');
  expect(robots).toContain('Sitemap: https://x7do0.github.io/X7do0-portfolio/sitemap.xml');

  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
    expect(sitemap).toContain(`https://x7do0.github.io/X7do0-portfolio/projects/${slug}/`);
  }
  expect(sitemap).not.toContain('/demos/');
});

test('every project detail page links to its own demo without empty future sections', async ({ page }) => {
  const slugs = ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi'];
  for (const slug of slugs) {
    await page.goto(`/projects/${slug}/`);
    const link = page.locator('[data-demo-link]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', `../../demos/${slug}/`);
    await expect(page.locator('.project-future')).toBeHidden();
    await expectNoHorizontalOverflow(page);
  }
});

test('resume hides unavailable PDF instead of advertising unfinished content', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/resume/');
  await expect(page.locator('[data-resume="title"]')).toBeVisible();
  await expect(page.locator('.resume-download.is-disabled')).toBeHidden();
  await expect(page.locator('#resume-projects > a')).toHaveCount(4);
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('Enterprise employee uses the source-backed light shell, manager is dark, and approval completes with Latin numerals', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/enterprise-workflow/');

  await expect(page.locator('[data-role-switch="employee"]')).toHaveClass(/is-active/);
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(41, 46, 53)');
  await expectLatinNumerals(page);
  await page.screenshot({ path: 'artifacts/enterprise-employee-light.png', fullPage: true });

  await page.locator('[data-create-request]').click();
  await expect(page.locator('[data-request-dialog]')).toBeVisible();
  await page.locator('[data-request-form] button[type="submit"]').click();
  await expect(page.locator('[data-detail-dialog]')).toBeVisible();
  await expectLatinNumerals(page);
  await page.locator('[data-submit-request]').click();

  await page.locator('[data-role-switch="manager"]').click();
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(238, 244, 255)');
  await expectLatinNumerals(page);
  await page.screenshot({ path: 'artifacts/enterprise-manager-dark.png', fullPage: true });

  const managerInbox = page.locator('[data-dashboard-request-list] .request-row');
  await expect(managerInbox).toHaveCount(1);
  await managerInbox.first().click();
  await page.locator('[data-approve]').click();
  await page.locator('[data-role-switch="employee"]').click();

  await expect(page.locator('[data-dashboard-request-list] .status-chip--approved')).toHaveCount(1);
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(41, 46, 53)');
  await page.locator('[data-nav-view="audit"]').click();
  await expect(page.locator('time[datetime]').first()).toContainText(/[0-9]{2} [A-Za-z]{3} [0-9]{4}/);
  await expectLatinNumerals(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/enterprise-demo-approved.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Mahsoob cashier stays source-styled, uses Latin numerals, calculates change, and completes a sale', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/mahsoob/');

  await expect(page.locator('.sidebar')).toHaveCSS('background-color', 'rgb(16, 41, 31)');
  await page.locator('[data-product="1001"]').click();
  await expect(page.locator('[data-cart-count]')).toHaveText('1');
  await expect(page.locator('[data-total]')).not.toHaveText(/^0/);
  await expectLatinNumerals(page);

  await page.locator('[data-cash]').fill('1000');
  await expect(page.locator('[data-checkout]')).toBeEnabled();
  await expectLatinNumerals(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/mahsoob-cashier.png', fullPage: true });

  await page.locator('[data-checkout]').click();
  await expect(page.locator('[data-receipt]')).toBeVisible();
  await expect(page.locator('[data-receipt-total]')).not.toHaveText('');
  await expectLatinNumerals(page);
  await page.screenshot({ path: 'artifacts/mahsoob-receipt.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Masroofi matches its light green hierarchy, uses English-style dates/numerals, updates totals, then reverts', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/masroofi/');

  await expect(page.locator('.balance-card')).toHaveCSS('border-radius', '30px');
  await expectLatinNumerals(page);
  const firstTimestamp = page.locator('.tx-copy small').first();
  await expect(firstTimestamp).toContainText(/[0-9]{2} [A-Za-z]{3} [0-9]{4}/);

  const initialBalance = await page.locator('[data-balance]').textContent();
  const initialExpenses = await page.locator('[data-expenses]').textContent();

  await page.locator('[data-add-expense]').click();
  await expect(page.locator('[data-dialog]')).toBeVisible();
  await page.locator('[data-form] button[type="submit"]').click();

  await expect(page.locator('[data-transaction-id^="demo-"]')).toHaveCount(1);
  await expect(page.locator('[data-balance]')).not.toHaveText(initialBalance || '');
  await expect(page.locator('[data-expenses]')).not.toHaveText(initialExpenses || '');
  await expectLatinNumerals(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/masroofi-demo-added.png', fullPage: true });

  await page.locator('[data-transaction-id^="demo-"] [data-delete]').click();
  await expect(page.locator('[data-transaction-id^="demo-"]')).toHaveCount(0);
  await expect(page.locator('[data-balance]')).toHaveText(initialBalance || '');
  await expect(page.locator('[data-expenses]')).toHaveText(initialExpenses || '');
  expect(errors).toEqual([]);
});

test('Coding Academy uses its semantic tokens, Latin progress values and updates progress to 100%', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/coding-academy/');

  await expect(page.locator('[data-progress-label]')).toHaveText('50%');
  await expectLatinNumerals(page);
  await page.locator('[data-go-practice]').click();
  await expect(page.locator('[data-view="practice"]')).toHaveClass(/active/);
  await page.locator('[data-editor]').fill('name = "Magnus"\nprint(name)');
  await page.locator('[data-check]').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/success/);
  await expect(page.locator('[data-progress-label]')).toHaveText('100%');
  await expect(page.locator('[data-view="result"]')).toHaveClass(/active/);
  await expectLatinNumerals(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/coding-academy-demo.png', fullPage: true });
  expect(errors).toEqual([]);
});
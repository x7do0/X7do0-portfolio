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
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(220);
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

async function expectEditorialPortrait(page) {
  const portrait = page.locator('.hero-portrait');
  const image = portrait.locator('img');
  const base = portrait.locator('.hero-portrait-base');

  await expect(portrait).toBeVisible();
  await expect(portrait).not.toHaveClass(/reveal/);
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', './assets/profile/profile-cutout.png');
  await expect(image).toHaveAttribute('loading', 'eager');
  await expect(image).toHaveAttribute('fetchpriority', 'high');
  await expect(image).toHaveAttribute('decoding', 'sync');
  await expect(page.locator('link[rel="preload"][as="image"][href="./assets/profile/profile-cutout.png"]')).toHaveCount(1);

  const imageState = await image.evaluate((element) => ({
    complete: element.complete,
    naturalWidth: element.naturalWidth,
    opacity: getComputedStyle(element).opacity,
    animationName: getComputedStyle(element).animationName
  }));
  expect(imageState.complete).toBeTruthy();
  expect(imageState.naturalWidth).toBeGreaterThan(0);
  expect(imageState.opacity).toBe('1');
  expect(imageState.animationName).toBe('none');

  const baseHeight = await base.evaluate((element) => parseFloat(getComputedStyle(element).height));
  expect(baseHeight).toBeGreaterThanOrEqual(54);
  await expect(page.locator('.hero .system-window')).toHaveCount(0);
}

async function expectScrollAtmosphere(page) {
  const atmosphere = page.locator('.scroll-atmosphere');
  await expect(atmosphere).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-scroll-section', 'home');

  const initialGridY = await atmosphere.evaluate((element) => getComputedStyle(element).getPropertyValue('--atmo-grid-y').trim());

  await page.evaluate(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const target = document.getElementById('capabilities');
    if (target) target.scrollIntoView({ block: 'center', behavior: 'auto' });
    else window.scrollTo(0, document.body.scrollHeight * 0.55);
    root.style.scrollBehavior = previous;
  });
  await page.waitForTimeout(260);

  const downGridY = await atmosphere.evaluate((element) => getComputedStyle(element).getPropertyValue('--atmo-grid-y').trim());
  expect(downGridY).not.toBe(initialGridY);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-direction', 'down');
  await expect(page.locator('html')).not.toHaveAttribute('data-scroll-section', 'home');

  await page.evaluate(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  });
  await page.waitForTimeout(220);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-direction', 'up');
  await expect(page.locator('html')).toHaveAttribute('data-scroll-section', 'home');

  const returnedGridY = await atmosphere.evaluate((element) => getComputedStyle(element).getPropertyValue('--atmo-grid-y').trim());
  expect(returnedGridY).not.toBe(downGridY);
}

test('home uses an eager editorial portrait, moving atmosphere, source-backed previews and real YouTube', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('#capabilities-title')).toContainText('المهارات');
  await expect(page.getByText('كيف أعمل', { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-project-open]')).toHaveCount(4);
  await expect(page.locator('.project-live-preview')).toHaveCount(4);
  await expect(page.locator('.live-enterprise')).toHaveCSS('background-color', 'rgb(250, 250, 250)');

  await expectEditorialPortrait(page);
  await expectScrollAtmosphere(page);

  await expect(page.locator('.knowledge .media-rail')).toBeHidden();
  await expect(page.locator('.contact-link[href]')).toHaveCount(2);
  await expect(page.locator('[data-contact-id="github"]')).toBeVisible();
  const youtube = page.locator('[data-contact-id="youtube"]');
  await expect(youtube).toBeVisible();
  await expect(youtube).toHaveAttribute('href', 'https://youtube.com/@x7do0eng?si=bRb1wQVL0y4vTbjq');

  await expectLatinNumerals(page, '#projects');
  await revealWholePage(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });

  await page.locator('[data-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#hero-title')).toContainText('I build');
  await expect(page.locator('[data-project="mahsoob"]')).toContainText('Mahsoob');
  await expect(page.locator('[data-project="masroofi"]')).toContainText('Masroofi');
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('mobile home keeps the editorial portrait intentionally cropped and atmosphere responsive', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expectEditorialPortrait(page);
  await expect(page.locator('.project-live-preview')).toHaveCount(4);

  const portraitHeight = await page.locator('.hero-portrait').evaluate((element) => parseFloat(getComputedStyle(element).height));
  expect(portraitHeight).toBeLessThanOrEqual(410);
  expect(portraitHeight).toBeGreaterThanOrEqual(335);

  await expectScrollAtmosphere(page);
  await revealWholePage(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('public SEO routes are healthy and demos stay out of the crawl surface', async ({ request }) => {
  for (const route of ['/', '/?lang=en', '/resume/', '/projects/enterprise-workflow/', '/projects/coding-academy/', '/projects/mahsoob/', '/projects/masroofi/']) {
    const response = await request.get(route);
    expect(response.ok(), `${route} should return a successful response`).toBeTruthy();
  }

  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /X7do0-portfolio/demos/');
  expect(robots).toContain('Sitemap: https://x7do0.github.io/X7do0-portfolio/sitemap.xml');

  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
    expect(sitemap).toContain(`https://x7do0.github.io/X7do0-portfolio/projects/${slug}/`);
  }
  expect(sitemap).not.toContain('/demos/');
});

test('every project detail page links to its own demo without empty future sections', async ({ page }) => {
  for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
    await page.goto(`/projects/${slug}/`);
    await expect(page.locator('[data-demo-link]')).toBeVisible();
    await expect(page.locator('[data-demo-link]')).toHaveAttribute('href', `../../demos/${slug}/`);
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

test('Enterprise employee is light, manager is dark, approval completes and dates stay English-style', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/enterprise-workflow/');
  await expect(page.locator('[data-role-switch="employee"]')).toHaveClass(/is-active/);
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(41, 46, 53)');
  await expectLatinNumerals(page);
  await page.screenshot({ path: 'artifacts/enterprise-employee-light.png', fullPage: true });

  await page.locator('[data-create-request]').click();
  await page.locator('[data-request-form] button[type="submit"]').click();
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
  await page.locator('[data-nav-view="audit"]').click();
  await expect(page.locator('time[datetime]').first()).toContainText(/[0-9]{2} [A-Za-z]{3} [0-9]{4}/);
  await expectLatinNumerals(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/enterprise-demo-approved.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Mahsoob cashier uses its source styling, Latin numerals and completes a sale', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/mahsoob/');
  await expect(page.locator('.sidebar')).toHaveCSS('background-color', 'rgb(16, 41, 31)');
  await page.locator('[data-product="1001"]').click();
  await expect(page.locator('[data-cart-count]')).toHaveText('1');
  await expectLatinNumerals(page);
  await page.locator('[data-cash]').fill('1000');
  await expect(page.locator('[data-checkout]')).toBeEnabled();
  await page.screenshot({ path: 'artifacts/mahsoob-cashier.png', fullPage: true });
  await page.locator('[data-checkout]').click();
  await expect(page.locator('[data-receipt]')).toBeVisible();
  await expectLatinNumerals(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: 'artifacts/mahsoob-receipt.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('Masroofi keeps its light green hierarchy, English-style dates and reversible totals', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/masroofi/');
  await expect(page.locator('.balance-card')).toHaveCSS('border-radius', '30px');
  await expectLatinNumerals(page);
  await expect(page.locator('.tx-copy small').first()).toContainText(/[0-9]{2} [A-Za-z]{3} [0-9]{4}/);

  const initialBalance = await page.locator('[data-balance]').textContent();
  const initialExpenses = await page.locator('[data-expenses]').textContent();
  await page.locator('[data-add-expense]').click();
  await page.locator('[data-form] button[type="submit"]').click();
  await expect(page.locator('[data-transaction-id^="demo-"]')).toHaveCount(1);
  await expect(page.locator('[data-balance]')).not.toHaveText(initialBalance || '');
  await expect(page.locator('[data-expenses]')).not.toHaveText(initialExpenses || '');
  await expectLatinNumerals(page);
  await page.screenshot({ path: 'artifacts/masroofi-demo-added.png', fullPage: true });

  await page.locator('[data-transaction-id^="demo-"] [data-delete]').click();
  await expect(page.locator('[data-balance]')).toHaveText(initialBalance || '');
  await expect(page.locator('[data-expenses]')).toHaveText(initialExpenses || '');
  expect(errors).toEqual([]);
});

test('Coding Academy uses its semantic tokens and updates progress to 100%', async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto('/demos/coding-academy/');
  await expect(page.locator('[data-progress-label]')).toHaveText('50%');
  await expectLatinNumerals(page);
  await page.locator('[data-go-practice]').click();
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

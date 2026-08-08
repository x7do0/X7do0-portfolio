const { test, expect } = require('@playwright/test');

function runtimeErrors(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

async function expectNoOverflow(page) {
  const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
}

test('home identifies Haidera and routes every demo to its project page', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toHaveText('حيدره مهند');
  await expect(page.locator('[data-brand="role"]')).toContainText('Backend');
  await expect(page.locator('.project-row')).toHaveCount(4);
  await expect(page.locator('.project-media img')).toHaveCount(4);
  await expect(page.locator('.demo-trigger')).toHaveCount(4);
  await expect(page.locator('.project-actions a')).toHaveCount(8);
  await expect(page.locator('.skill-primary')).toHaveCount(1);
  await expect(page.locator('.skill-item')).toHaveCount(5);
  await expect(page.locator('.technology-mark')).toHaveCount(12);

  const listWidth = await page.locator('#project-list').evaluate(element => element.getBoundingClientRect().width);
  expect(listWidth).toBeLessThanOrEqual(1120);

  await expect(page.locator('#demo-stage')).toHaveCount(0);
  await expect(page.locator('[data-project="coding-academy"] .demo-trigger')).toHaveAttribute('href', './projects/coding-academy/?demo=1#demo');
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('English switches direction and keeps complete project content', async ({ page }) => {
  await page.goto('/?lang=en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('h1')).toHaveText('Haidera Muhannad');
  await expect(page.locator('[data-project="mahsoob"]')).toContainText('Offline-first');
  await expect(page.locator('[data-project="masroofi"]')).toContainText('IndexedDB');
  await expectNoOverflow(page);

  await page.locator('[data-language="ar"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toHaveText('حيدره مهند');
});

test('project details use real previews, source-backed facts, and an inline demo', async ({ page }) => {
  for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
    await page.goto(`/projects/${slug}/`);
    await expect(page.locator('.project-source-preview img')).toBeVisible();
    await expect(page.locator('.project-future.has-content')).toBeVisible();
    await expect(page.locator('.future-panel')).toHaveCount(2);
    await page.locator('[data-demo-link]').click();
    await expect(page.locator('.project-inline-demo')).toBeVisible();
    await expect(page.locator('.project-inline-demo iframe')).toHaveAttribute('src', new RegExp(`/demos/${slug}/`));
    await page.locator('.project-inline-demo button').click();
    await expect(page.locator('.project-inline-demo')).toHaveCount(0);
    await expectNoOverflow(page);
  }

  await page.goto('/projects/coding-academy/?demo=1#demo');
  await expect(page.locator('.project-inline-demo')).toBeVisible();
  await expect(page.locator('.project-inline-demo iframe')).toHaveAttribute('src', /\/demos\/coding-academy\//);
});

test('resume renders structured skills and technology names', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/resume/');
  await expect(page.locator('#resume-skills li')).toHaveCount(6);
  await expect(page.locator('#resume-skills')).toContainText('Backend');
  await expect(page.locator('#resume-technologies')).toContainText('ASP.NET Core');
  await expect(page.locator('#resume-projects > a')).toHaveCount(4);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('Academy demo leads with topic cards and completes its practice path', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/demos/coding-academy/');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.locator('[data-view="topics"]')).toHaveClass(/active/);
  await expect(page.locator('.topic-card')).toHaveCount(6);
  await expect(page.locator('[data-progress-label]')).toHaveText('0%');
  await page.locator('[data-open-lesson]').click();
  await expect(page.locator('[data-view="lesson"]')).toHaveClass(/active/);
  await expect(page.locator('[data-progress-label]')).toHaveText('50%');
  await page.locator('[data-go-practice]').click();
  await page.locator('[data-editor]').fill('name = "Magnus"\nprint(name)');
  await page.locator('[data-check]').click();
  await expect(page.locator('[data-feedback]')).toHaveClass(/success/);
  await expect(page.locator('[data-progress-label]')).toHaveText('100%');
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('public SEO routes and crawl boundaries remain healthy', async ({ request }) => {
  for (const route of ['/', '/?lang=en', '/resume/', '/projects/enterprise-workflow/', '/projects/coding-academy/', '/projects/mahsoob/', '/projects/masroofi/']) {
    expect((await request.get(route)).ok(), route).toBeTruthy();
  }
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /X7do0-portfolio/demos/');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/demos/');
});

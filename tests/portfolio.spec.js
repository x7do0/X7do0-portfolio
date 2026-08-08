const { test, expect } = require('@playwright/test');

const forbiddenEmail = ['x7do02', 'gmail.com'].join('@');
const unapprovedNetwork = ['Linked', 'In'].join('');
const unsuppliedExperience = ['Professional', 'Experience'].join(' ');

function runtimeErrors(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

async function expectNoOverflow(page) {
  const widths = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
}

async function expectApprovedPublicIdentity(page) {
  await expect(page.locator('body')).not.toContainText(forbiddenEmail);
  await expect(page.locator('body')).not.toContainText(unapprovedNetwork);
}

test('Arabic home presents the professional profile, work, learning, and approved contact routes', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toHaveText('حيدره مهند');
  await expect(page.locator('[data-brand="role"]')).toHaveText('مطور برمجيات يركز على الـBackend وبناء الأنظمة');
  await expect(page.locator('[data-profile="location"]')).toHaveText('النجف، العراق');
  await expect(page.locator('[data-education="compactAchievement"]')).toContainText('الأولى');

  await expect(page.locator('.project-row')).toHaveCount(4);
  await expect(page.locator('.project-media img')).toHaveCount(4);
  await expect(page.locator('.demo-trigger')).toHaveCount(4);
  await expect(page.locator('.project-actions a')).toHaveCount(8);
  await expect(page.locator('#demo-stage')).toHaveCount(0);
  await expect(page.locator('[data-project="coding-academy"] .demo-trigger')).toHaveAttribute('href', './projects/coding-academy/?demo=1#demo');

  await expect(page.locator('.skill-primary')).toHaveCount(1);
  await expect(page.locator('.skill-item')).toHaveCount(5);
  await expect(page.locator('.technology-group')).toHaveCount(4);
  await expect(page.locator('.technology-mark')).toHaveCount(16);
  await expect(page.locator('.technology-logo svg')).toHaveCount(16);
  for (const [index, name] of ['C#', '.NET', 'ASP.NET Core', 'EF Core'].entries()) {
    await expect(page.locator('.technology-mark').nth(index)).toContainText(name);
  }

  const technologyComesFirst = await page.evaluate(() => Boolean(
    document.querySelector('.technology-section').compareDocumentPosition(document.querySelector('.skills-showcase'))
      & Node.DOCUMENT_POSITION_FOLLOWING,
  ));
  expect(technologyComesFirst).toBeTruthy();

  await expect(page.locator('.video-card')).toHaveCount(3);
  await expect(page.locator('.video-card--featured')).toHaveAttribute('data-video-id', 'eYEO5DZsvqo');
  await expect(page.locator('.video-card iframe')).toHaveCount(0);
  for (const id of ['eYEO5DZsvqo', '8eiVaCv26uk', 'SQuMf_pCC7U']) {
    await expect(page.locator(`.video-card[data-video-id="${id}"] a`)).toHaveAttribute('href', new RegExp(id));
  }
  await page.locator('.video-card--featured [data-video-play]').click();
  await expect(page.locator('.video-card--featured iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/eYEO5DZsvqo/);

  const approvedLinks = {
    email: 'mailto:x7do0eng@gmail.com',
    telegram: 'https://t.me/ctedev',
    github: 'https://github.com/x7do0',
    youtube: 'https://youtube.com/@x7do0eng',
    instagram: 'https://instagram.com/x7do0',
  };
  for (const [id, href] of Object.entries(approvedLinks)) {
    await expect(page.locator(`.contact-link[data-social="${id}"]`)).toHaveAttribute('href', href);
    await expect(page.locator(`.contact-link[data-social="${id}"] svg`)).toBeVisible();
  }
  await expect(page.locator('#full-resume-link')).toHaveAttribute('href', './resume/');
  await expectApprovedPublicIdentity(page);

  const listWidth = await page.locator('#project-list').evaluate(element => element.getBoundingClientRect().width);
  expect(listWidth).toBeLessThanOrEqual(1120);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('English switches direction, preserves content, and can switch back to Arabic', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/?lang=en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('h1')).toHaveText('Haidara Muhanned');
  await expect(page).toHaveTitle('Haidara Muhanned | Backend-focused Software Developer');
  await expect(page.locator('[data-brand="role"]')).toHaveText('Backend-focused Software Developer');
  await expect(page.locator('[data-portrait-alt]')).toHaveAttribute('alt', 'Portrait of Haidara Muhanned');
  await expect(page.locator('.portrait-mark')).toHaveText('x7do0');
  await expect(page.locator('#knowledge-title')).toHaveText('Learning & Teaching');
  await expect(page.locator('a[href="#knowledge"]').first()).toContainText('Learning');
  await expect(page.locator('.video-card')).toHaveCount(3);
  await expect(page.locator('[data-project="mahsoob"]')).toContainText('Offline-first');
  await expect(page.locator('[data-project="masroofi"]')).toContainText('IndexedDB');
  await expect(page.locator('#full-resume-link')).toHaveAttribute('href', './resume/?lang=en');
  await expectApprovedPublicIdentity(page);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);

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

test('resume is a complete bilingual web resume with approved public data', async ({ page }) => {
  for (const [path, language, direction] of [['/resume/', 'ar', 'rtl'], ['/resume/?lang=en', 'en', 'ltr']]) {
    const errors = runtimeErrors(page);
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('html')).toHaveAttribute('dir', direction);
    await expect(page.locator('.resume-location')).toBeVisible();
    await expect(page.locator('.education-entry')).toContainText(language === 'ar' ? 'جامعة الكفيل' : 'University of Al-Kafeel');
    await expect(page.locator('.education-entry')).toContainText(language === 'ar' ? 'المركز الأول' : 'Ranked 1st');
    await expect(page.locator('#resume-skills section')).toHaveCount(4);
    await expect(page.locator('#resume-skills')).toContainText('Backend');
    await expect(page.locator('#resume-technologies')).toContainText('ASP.NET Core');
    await expect(page.locator('#resume-projects > a')).toHaveCount(4);
    await expect(page.locator('.resume-teaching')).toBeVisible();
    await expect(page.locator('.resume-languages')).toBeVisible();
    await expect(page.locator('#resume-contact')).toContainText('x7do0eng@gmail.com');
    await expect(page.locator('body')).not.toContainText(unsuppliedExperience);
    await expect(page.locator('.resume-download')).toBeHidden();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Backend|الـBackend/);
    await expectApprovedPublicIdentity(page);

    const projectNames = await page.locator('#resume-projects h3').allTextContents();
    expect(projectNames).toEqual(language === 'ar'
      ? ['Enterprise Workflow', 'محسوب', 'مصروفي', 'أكاديمية البرمجة']
      : ['Enterprise Workflow', 'Mahsoob', 'Masroofi', 'Coding Academy']);
    for (const link of await page.locator('#resume-projects > a').all()) {
      await expect(link).toHaveAttribute('href', /\.\.\/projects\/.+\//);
    }
    await expectNoOverflow(page);
    expect(errors).toEqual([]);
  }
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
  for (const route of ['/', '/?lang=en', '/resume/', '/resume/?lang=en', '/projects/enterprise-workflow/', '/projects/coding-academy/', '/projects/mahsoob/', '/projects/masroofi/']) {
    expect((await request.get(route)).ok(), route).toBeTruthy();
  }
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /X7do0-portfolio/demos/');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/demos/');
  const manifest = await (await request.get('/site.webmanifest')).json();
  expect(manifest.name).toBe('Haidara Muhanned — x7do0');
  expect(manifest.description).toContain('Haidara Muhanned');
});

test('structured profile metadata matches the approved public identity', async ({ page }) => {
  await page.goto('/?lang=en');
  const profile = await page.locator('script[type="application/ld+json"]').evaluate(node => JSON.parse(node.textContent));
  expect(profile.name).toBe('Haidara Muhanned');
  expect(profile.jobTitle).toBe('Backend-focused Software Developer');
  expect(profile.address.addressLocality).toBe('Najaf');
  expect(profile.sameAs).toEqual([
    'https://github.com/x7do0',
    'https://youtube.com/@x7do0eng',
    'https://instagram.com/x7do0',
  ]);
  expect(JSON.stringify(profile)).not.toContain(forbiddenEmail);
});

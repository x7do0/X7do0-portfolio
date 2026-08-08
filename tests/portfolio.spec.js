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

async function expectDemoFitsViewport(page) {
  await expect.poll(() => page.locator('.project-inline-demo').evaluate((stage) => {
    const frame = stage.querySelector('.project-demo-frame').getBoundingClientRect();
    const iframe = stage.querySelector('iframe').getBoundingClientRect();
    const bounds = stage.getBoundingClientRect();
    return bounds.left >= 0 && bounds.top >= 0
      && bounds.right <= innerWidth + 1 && bounds.bottom <= innerHeight + 1
      && iframe.left >= frame.left - 1 && iframe.top >= frame.top - 1
      && iframe.right <= frame.right + 1 && iframe.bottom <= frame.bottom + 1;
  })).toBeTruthy();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
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
  await expect(page.locator('.technology-logo img')).toHaveCount(16);
  expect(await page.locator('.technology-logo img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBeTruthy();
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
    await expect(page.locator(`.contact-link[data-social="${id}"] .contact-logo`)).toBeVisible();
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

test('initial language and font are ready before the page becomes visible, and the language control stays fixed', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('x7do0-language', 'en'));
  let releaseContent;
  const contentGate = new Promise(resolve => { releaseContent = resolve; });
  await page.route('**/content/portfolio.en.json', async route => {
    await contentGate;
    await route.continue();
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('html')).toHaveClass(/portfolio-booting/);
  await expect(page.locator('body')).toHaveCSS('visibility', 'hidden');
  releaseContent();
  await expect(page.locator('h1')).toHaveText('Haidara Muhanned');
  await expect(page.locator('html')).toHaveClass(/portfolio-ready/);
  await expect(page.locator('body')).toHaveCSS('font-family', /IBM Plex Sans Arabic|Space Grotesk/);

  const englishSwitch = await page.locator('.site-header .language-switch').boundingBox();
  await page.locator('[data-language="ar"]').click();
  await expect(page.locator('h1')).toHaveText('حيدره مهند');
  const arabicSwitch = await page.locator('.site-header .language-switch').boundingBox();
  expect(Math.abs(englishSwitch.x - arabicSwitch.x)).toBeLessThan(1);
  expect(Math.abs(englishSwitch.width - arabicSwitch.width)).toBeLessThan(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/enterprise-workflow/?lang=en');
  const mobileEnglishSwitch = await page.locator('.inner-header .language-switch').boundingBox();
  await page.locator('[data-language="ar"]').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const mobileArabicSwitch = await page.locator('.inner-header .language-switch').boundingBox();
  expect(Math.abs(mobileEnglishSwitch.x - mobileArabicSwitch.x)).toBeLessThan(1);
  expect(Math.abs(mobileEnglishSwitch.width - mobileArabicSwitch.width)).toBeLessThan(1);
  await expectNoOverflow(page);
});

test('project details use real previews, source-backed facts, and an inline demo', async ({ page }) => {
  for (const slug of ['enterprise-workflow', 'coding-academy', 'masroofi']) {
    await page.goto(`/projects/${slug}/`);
    await expect(page.locator('.project-source-preview img')).toBeVisible();
    await expect(page.locator('.project-source-preview figcaption')).toHaveCount(0);
    await expect(page.locator('.project-case-study')).toBeVisible();
    await expect(page.locator('.case-section')).toHaveCount(4);
    await expect(page.locator('.case-media-main img')).toHaveCount(1);
    const expectedMediaCount = { 'enterprise-workflow': 13, 'coding-academy': 7, masroofi: 8 }[slug];
    await expect(page.locator('.case-media-thumb')).toHaveCount(expectedMediaCount);
    await expect(page.locator('.project-future')).toHaveCount(0);
    await page.locator('[data-demo-link]').click();
    await expect(page.locator('.project-inline-demo')).toBeVisible();
    await expect(page.locator('.project-demo-companion')).toBeVisible();
    await expect(page.locator('.project-inline-demo iframe')).toHaveAttribute('src', new RegExp(`/demos/${slug}/`));
    await expect.poll(() => page.locator('.project-inline-demo iframe').evaluate((iframe) => {
      const frameDocument = iframe.contentDocument;
      return Boolean(frameDocument?.body) && Math.max(frameDocument.body.scrollHeight, frameDocument.documentElement.scrollHeight) <= iframe.clientHeight + 2;
    })).toBeTruthy();
    await expectDemoFitsViewport(page);
    await page.locator('[data-demo-close]').click();
    await expect(page.locator('.project-inline-demo')).toHaveCount(0);
    await expect(page.locator('.project-overview')).toHaveCount(0);
    await expect(page.locator('.project-related__card')).toHaveCount(3);
    expect(await page.evaluate(() => {
      const hero = document.querySelector('.project-hero');
      const gallery = document.querySelector('.case-gallery');
      const intro = document.querySelector('.case-intro');
      const story = document.querySelector('.case-story');
      const related = document.querySelector('.project-related');
      const follows = (first, second) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
      return follows(hero, gallery) && follows(gallery, intro) && follows(intro, story) && follows(story, related) && related === document.querySelector('main').lastElementChild;
    })).toBeTruthy();
    await expectNoOverflow(page);
  }

  await page.goto('/projects/mahsoob/');
  await expect(page.locator('.project-source-preview img')).toBeVisible();
  await expect(page.locator('.project-future.has-content')).toBeVisible();
  await expect(page.locator('.future-panel')).toHaveCount(2);
  await expect(page.locator('.project-case-study')).toHaveCount(0);
  await expect(page.locator('.project-related__card')).toHaveCount(3);
  await expect(page.locator('main > .project-related')).toBeVisible();
  await page.locator('[data-demo-link]').click();
  await expect.poll(() => page.locator('.project-inline-demo iframe').evaluate((iframe) => {
    const frameDocument = iframe.contentDocument;
    return Boolean(frameDocument?.body) && Math.max(frameDocument.body.scrollHeight, frameDocument.documentElement.scrollHeight) <= iframe.clientHeight + 2;
  })).toBeTruthy();
  await expect(page.locator('.project-demo-companion')).toBeVisible();
  await expectDemoFitsViewport(page);

  await page.goto('/projects/coding-academy/?demo=1#demo');
  await expect(page.locator('.project-inline-demo')).toBeVisible();
  await expect(page.locator('.project-inline-demo iframe')).toHaveAttribute('src', /\/demos\/coding-academy\//);
});

test('embedded Enterprise demo keeps portfolio controls outside the product and enforces role permissions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/projects/enterprise-workflow/');
  await page.locator('[data-demo-link]').click();

  const stage = page.locator('.project-inline-demo');
  const frame = page.frameLocator('.project-inline-demo iframe');
  await expect(stage).toBeVisible();
  await expect(stage.locator('.project-demo-companion')).toBeVisible();
  await expect(stage.locator('iframe')).toHaveAttribute('src', /embedded=1/);
  await expectDemoFitsViewport(page);

  await expect(frame.locator('.role-panel')).toBeHidden();
  await expect(frame.locator('.guide-panel')).toBeHidden();
  await expect(frame.locator('[data-create-request]')).toBeVisible();
  await page.locator('[data-demo-role="manager"]').click();
  await expect(frame.locator('[data-create-request]')).toBeHidden();
  await expect(frame.locator('[data-page-title]')).toHaveText('لوحة المراجعة');
  await page.locator('[data-demo-role="employee"]').click();
  await expect(frame.locator('[data-create-request]')).toBeVisible();
  await expect(page.locator('[data-demo-guide-step="create"]')).toHaveClass(/is-current/);
});

test('project demos provide project-specific guided flows in one viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/projects/coding-academy/?lang=en');
  await page.locator('[data-demo-link]').click();
  await expect(page.locator('[data-demo-role]')).toHaveCount(0);
  await expect(page.locator('[data-demo-guide-step]')).toHaveCount(4);
  await expectDemoFitsViewport(page);
  let frame = page.frameLocator('.project-inline-demo iframe');
  await frame.locator('[data-open-lesson]').click();
  await expect(page.locator('[data-demo-guide-step="lesson"]')).toHaveClass(/is-current/);
  await frame.locator('[data-go-practice]').click();
  await expect(page.locator('[data-demo-guide-step="practice"]')).toHaveClass(/is-current/);
  await frame.locator('[data-check]').click();
  await expect(page.locator('[data-demo-guide-step="result"]')).toHaveClass(/is-current/, { timeout: 2000 });
  await page.locator('[data-demo-reset]').click();
  await expect(page.locator('[data-demo-guide-step="topics"]')).toHaveClass(/is-current/);

  await page.goto('/projects/mahsoob/?lang=en');
  await page.locator('[data-demo-link]').click();
  await expect(page.locator('[data-demo-role]')).toHaveCount(0);
  await expect(page.locator('[data-demo-guide-step]')).toHaveCount(4);
  await expectDemoFitsViewport(page);
  frame = page.frameLocator('.project-inline-demo iframe');
  await frame.locator('[data-product]').first().click();
  await expect(page.locator('[data-demo-guide-step="payment"]')).toHaveClass(/is-current/);
  await frame.locator('[data-cash]').fill('100000');
  await expect(page.locator('[data-demo-guide-step="checkout"]')).toHaveClass(/is-current/);
  await frame.locator('[data-checkout]').click();
  await expect(page.locator('[data-demo-guide-step="receipt"]')).toHaveClass(/is-current/);
  await page.locator('[data-demo-reset]').click();
  await expect(frame.locator('[data-receipt]')).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-demo-guide-step="product"]')).toHaveClass(/is-current/);

  await page.goto('/projects/masroofi/?lang=en');
  await page.locator('[data-demo-link]').click();
  await expect(page.locator('[data-demo-role]')).toHaveCount(0);
  await expect(page.locator('[data-demo-guide-step]')).toHaveCount(3);
  await expectDemoFitsViewport(page);
  frame = page.frameLocator('.project-inline-demo iframe');
  await frame.locator('[data-add-expense]').click();
  await frame.locator('[data-form]').evaluate((form) => form.requestSubmit());
  await expect(page.locator('[data-demo-guide-step="delete"]')).toHaveClass(/is-current/);
  await frame.locator('[data-transaction-id^="demo-"] [data-delete]').click();
  await expect(page.locator('[data-demo-guide-step="delete"]')).toHaveClass(/is-complete/);
  await page.locator('[data-demo-reset]').click();
  await expect(page.locator('[data-demo-guide-step="add"]')).toHaveClass(/is-current/);
});

test('project back control is prominent, fixed to the useful edge, and works in both directions', async ({ page }) => {
  for (const query of ['', '?lang=en']) {
    await page.goto(`/projects/enterprise-workflow/${query}`);
    const back = page.locator('.inner-back');
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute('href', /#projects$/);
    const visual = await back.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { left: box.left, width: box.width, height: box.height, border: style.borderTopWidth, background: style.backgroundImage };
    });
    expect(visual.left).toBeLessThanOrEqual(80);
    expect(visual.width).toBeGreaterThanOrEqual(46);
    expect(visual.height).toBeGreaterThanOrEqual(44);
    expect(visual.border).not.toBe('0px');
    expect(visual.background).not.toBe('none');
    await back.click();
    await expect(page).toHaveURL(/\/(?:\?lang=en)?#projects$/);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/enterprise-workflow/');
  const overlaps = await page.evaluate(() => {
    const back = document.querySelector('.inner-back').getBoundingClientRect();
    const brand = document.querySelector('.inner-header__content > .brand').getBoundingClientRect();
    const language = document.querySelector('.inner-header .language-switch').getBoundingClientRect();
    const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return intersects(back, brand) || intersects(back, language);
  });
  expect(overlaps).toBeFalsy();
});

test('project pages keep internal copy useful and avoid technical capture labels', async ({ page }) => {
  const removedPhrases = [
    'لقطة فعلية من بيئة E2E المعزولة',
    'واجهة البطاقات الحالية بعد إزالة مسار المشروع الختامي القديم',
    'محاكاة مصدرية للواجهة',
    'واجهة المنتج الحالية ملتقطة من المصدر المدقق',
    'captured from the isolated E2E environment',
    'after removing the deprecated final-project path',
    'Source-faithful simulation',
    'captured locally from the verified source',
  ];

  for (const languageQuery of ['', '?lang=en']) {
    for (const slug of ['enterprise-workflow', 'coding-academy', 'mahsoob', 'masroofi']) {
      await page.goto(`/projects/${slug}/${languageQuery}`);
      const body = await page.locator('body').innerText();
      for (const phrase of removedPhrases) expect(body).not.toContain(phrase);
      await expect(page.locator('.project-related__card')).toHaveCount(3);
    }
  }

  await page.goto('/projects/enterprise-workflow/');
  await expect(page.locator('.case-metrics')).not.toContainText(/IQD|UTC|Asia\/Baghdad/);
  await page.goto('/projects/masroofi/?lang=en');
  await expect(page.locator('.case-metrics')).not.toContainText(/IQD|currency/i);
});

test('refresh and browser back return every visited page to the top', async ({ page }) => {
  await page.goto('/projects/enterprise-workflow/');
  await expect(page.locator('.project-related')).toBeVisible();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  });
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await page.reload();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);

  await page.locator('.project-related__card').first().scrollIntoViewIfNeeded();
  const originalUrl = page.url();
  await page.locator('.project-related__card').first().click();
  await expect(page).not.toHaveURL(originalUrl);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  await page.goBack();
  await expect(page).toHaveURL(originalUrl);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);

  await page.goto('/');
  const details = page.locator('[data-project="enterprise-workflow"] .button--quiet');
  await details.click();
  await expect(page).toHaveURL(/\/projects\/enterprise-workflow\//);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
});

test('public product links and media lightbox are explicit and keyboard-safe', async ({ page }) => {
  for (const slug of ['coding-academy', 'masroofi']) {
    await page.goto(`/projects/${slug}/`);
    await expect(page.locator('.project-link--live')).toHaveAttribute('target', '_blank');
    await expect(page.locator('.project-link--source')).toHaveAttribute('rel', /noopener/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /assets\/projects/);
    const structured = JSON.parse(await page.locator('#project-structured-data').textContent());
    expect(structured['@type']).toBe('SoftwareApplication');
    expect(structured.author.name).toBe('Haidara Muhanned');
    await page.locator('.case-media-main__open').click();
    await expect(page.locator('.project-lightbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.project-lightbox')).toHaveCount(0);
  }

  await page.goto('/projects/enterprise-workflow/');
  await expect(page.locator('.project-external-links a')).toHaveCount(0);
});

test('case-study media browser is bilingual, responsive, selectable, and keyboard-safe', async ({ page }) => {
  await page.goto('/');
  const states = [
    { query: '', language: 'ar', direction: 'rtl', viewport: { width: 1440, height: 960 } },
    { query: '?lang=en', language: 'en', direction: 'ltr', viewport: { width: 1440, height: 960 } },
    { query: '?lang=en', language: 'en', direction: 'ltr', viewport: { width: 820, height: 1180 } },
    { query: '', language: 'ar', direction: 'rtl', viewport: { width: 390, height: 844 } },
    { query: '?lang=en', language: 'en', direction: 'ltr', viewport: { width: 390, height: 844 } },
  ];

  for (const slug of ['enterprise-workflow', 'masroofi', 'coding-academy']) {
    const primaryImage = {
      'enterprise-workflow': '01-employee-dashboard-light.png',
      masroofi: '01-balance-dashboard-light.png',
      'coding-academy': '02-python-topic-cards.jpg',
    }[slug];
    for (const state of states) {
      await page.setViewportSize(state.viewport);
      await page.evaluate(language => localStorage.setItem('x7do0-language', language), state.language);
      await page.goto(`/projects/${slug}/${state.query}`);
      await expect(page.locator('html')).toHaveAttribute('lang', state.language);
      await expect(page.locator('html')).toHaveAttribute('dir', state.direction);

      const mainImage = page.locator('[data-media-main-image]');
      const thumbnails = page.locator('.case-media-thumb');
      const caption = page.locator('[data-media-caption]');
      await expect(mainImage).toHaveCount(1);
      await expect(mainImage).toBeVisible();
      expect(await thumbnails.count()).toBeGreaterThan(1);
      await expect(thumbnails.first()).toHaveAttribute('aria-selected', 'true');
      await expect(mainImage).toHaveAttribute('src', new RegExp(primaryImage.replace('.', '\\.')));

      const previous = page.locator('[data-media-previous]');
      const next = page.locator('[data-media-next]');
      await expect(previous.locator('.media-arrow--previous')).toHaveCount(1);
      await expect(next.locator('.media-arrow--next')).toHaveCount(1);
      await expect(previous.locator('path')).toHaveAttribute('d', state.direction === 'rtl' ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6');
      await expect(next.locator('path')).toHaveAttribute('d', state.direction === 'rtl' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6');
      const previousBox = await previous.boundingBox();
      const nextBox = await next.boundingBox();
      expect(state.direction === 'rtl' ? previousBox.x > nextBox.x : previousBox.x < nextBox.x).toBeTruthy();

      await next.click();
      await expect(thumbnails.nth(1)).toHaveAttribute('aria-selected', 'true');
      await previous.click();
      await expect(thumbnails.first()).toHaveAttribute('aria-selected', 'true');

      const browserBox = await page.locator('.case-media-browser').boundingBox();
      const mainStageBox = await page.locator('.case-media-main__open').boundingBox();
      expect(browserBox.width).toBeLessThanOrEqual(state.viewport.width > 720 ? 962 : state.viewport.width - 30);
      expect(mainStageBox.height).toBeLessThanOrEqual(state.viewport.width > 900 ? 602 : state.viewport.width > 720 ? 502 : 300);
      const thumbnailSizes = await thumbnails.evaluateAll(buttons => buttons.map(button => {
        const box = button.getBoundingClientRect();
        return `${Math.round(box.width)}x${Math.round(box.height)}`;
      }));
      expect(new Set(thumbnailSizes).size).toBe(1);

      const initialSource = await mainImage.getAttribute('src');
      const initialCaption = await caption.textContent();
      await thumbnails.nth(1).click();
      await expect(mainImage).not.toHaveAttribute('src', initialSource);
      await expect(caption).not.toHaveText(initialCaption);
      await expect(thumbnails.first()).toHaveAttribute('aria-selected', 'false');
      await expect(thumbnails.nth(1)).toHaveAttribute('aria-selected', 'true');

      const selectedSource = await mainImage.getAttribute('src');
      await page.locator('.case-media-main__open').click();
      await expect(page.locator('.project-lightbox img')).toHaveAttribute('src', selectedSource);
      const lightboxPrevious = page.locator('[data-lightbox-previous]');
      const lightboxNext = page.locator('[data-lightbox-next]');
      await expect(lightboxPrevious.locator('path')).toHaveAttribute('d', state.direction === 'rtl' ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6');
      await expect(lightboxNext.locator('path')).toHaveAttribute('d', state.direction === 'rtl' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6');
      const lightboxPreviousBox = await lightboxPrevious.boundingBox();
      const lightboxNextBox = await lightboxNext.boundingBox();
      expect(state.direction === 'rtl' ? lightboxPreviousBox.x > lightboxNextBox.x : lightboxPreviousBox.x < lightboxNextBox.x).toBeTruthy();
      await page.keyboard.press(state.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(page.locator('.project-lightbox img')).not.toHaveAttribute('src', selectedSource);
      const lightboxBox = await page.locator('.project-lightbox').boundingBox();
      expect(lightboxBox.width).toBeLessThanOrEqual(state.viewport.width > 720 ? Math.min(1122, state.viewport.width * .88) : state.viewport.width - 30);
      expect(lightboxBox.height).toBeLessThanOrEqual(state.viewport.height * .86);
      await page.keyboard.press('Escape');
      await expect(page.locator('.project-lightbox')).toHaveCount(0);

      await thumbnails.nth(1).click();
      await thumbnails.nth(1).focus();
      await page.keyboard.press(state.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(thumbnails.nth(2)).toHaveAttribute('aria-selected', 'true');
      await expect(thumbnails.nth(2)).toBeFocused();

      const phoneThumbnail = page.locator('.case-media-thumb--phone').first();
      await expect(phoneThumbnail).toBeVisible();
      await phoneThumbnail.click();
      await expect(page.locator('.case-media-browser')).toHaveClass(/is-phone-media/);
      await expect.poll(() => mainImage.evaluate(image => image.complete && image.naturalHeight > image.naturalWidth)).toBeTruthy();
      const phoneStageBox = await page.locator('.case-media-main__open').boundingBox();
      const phoneImageBox = await mainImage.boundingBox();
      expect(phoneImageBox.width).toBeLessThan(phoneStageBox.width * .7);
      await page.locator('.case-media-main__open').click();
      await expect(page.locator('.project-lightbox')).toHaveClass(/is-phone-media/);
      const phoneLightboxBox = await page.locator('.project-lightbox').boundingBox();
      expect(phoneLightboxBox.width).toBeLessThanOrEqual(Math.min(380, state.viewport.width - 30));
      await page.keyboard.press('Escape');

      expect(await page.locator('.case-media-browser img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBeTruthy();
      const rail = page.locator('.case-media-rail');
      expect(await rail.evaluate(element => element.scrollWidth >= element.clientWidth)).toBeTruthy();
      await expectNoOverflow(page);
    }
  }
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

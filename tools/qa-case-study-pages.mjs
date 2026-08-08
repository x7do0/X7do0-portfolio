import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const output = path.resolve('output/playwright/media-browser');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function verify(slug, language, viewport, suffix) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${slug}/${language}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${slug}/${language}: ${error.message}`));
  await page.goto(`http://127.0.0.1:4173/projects/${slug}/${language === 'en' ? '?lang=en' : ''}`, { waitUntil: 'networkidle' });
  await page.locator('.project-case-study').waitFor();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  if (await page.locator('html').getAttribute('dir') !== direction) throw new Error(`${slug} has the wrong ${language} direction`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`${slug} overflows by ${overflow}px at ${viewport.width}px`);
  const mediaBrowser = page.locator('.case-media-browser');
  const mainImage = mediaBrowser.locator('[data-media-main-image]');
  const thumbnails = mediaBrowser.locator('.case-media-thumb');
  const initialSource = await mainImage.getAttribute('src');
  const initialCaption = await mediaBrowser.locator('[data-media-caption]').textContent();
  if (await mainImage.count() !== 1) throw new Error(`${slug} does not expose exactly one primary image`);
  if (await thumbnails.count() < 2) throw new Error(`${slug} does not expose a thumbnail rail`);
  if (await thumbnails.first().getAttribute('aria-selected') !== 'true') throw new Error(`${slug} does not initially select its first thumbnail`);
  await thumbnails.nth(1).click();
  if (await mainImage.getAttribute('src') === initialSource) throw new Error(`${slug} did not switch the primary image`);
  if (await mediaBrowser.locator('[data-media-caption]').textContent() === initialCaption) throw new Error(`${slug} did not update its caption`);
  if (await thumbnails.nth(1).getAttribute('aria-selected') !== 'true') throw new Error(`${slug} did not move the selected thumbnail state`);
  await mediaBrowser.locator('.case-media-main__open').click();
  if (await page.locator('.project-lightbox img').getAttribute('src') !== await mainImage.getAttribute('src')) throw new Error(`${slug} lightbox did not open the selected image`);
  await page.keyboard.press('Escape');
  await thumbnails.nth(1).focus();
  await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
  if (await thumbnails.nth(2).getAttribute('aria-selected') !== 'true') throw new Error(`${slug} keyboard navigation did not advance logically in ${direction}`);
  await thumbnails.first().click();
  await mainImage.evaluate((element) => element.decode());
  const thumbnailImages = mediaBrowser.locator('.case-media-thumb img');
  for (let index = 0; index < await thumbnailImages.count(); index += 1) {
    const image = thumbnailImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
  }
  await thumbnails.first().scrollIntoViewIfNeeded();
  const unloaded = await mediaBrowser.locator('img').evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).length);
  if (unloaded) throw new Error(`${slug} has ${unloaded} unloaded case-study images`);
  if (language === 'ar' && (suffix === 'desktop' || (slug === 'enterprise-workflow' && suffix === 'mobile'))) {
    await mediaBrowser.screenshot({ path: path.join(output, `${slug}-${language}-${suffix}.png`) });
  }
  await context.close();
}

try {
  for (const slug of ['enterprise-workflow', 'coding-academy', 'masroofi']) {
    await verify(slug, 'ar', { width: 1440, height: 960 }, 'desktop');
    await verify(slug, 'en', { width: 1440, height: 960 }, 'desktop');
    await verify(slug, 'ar', { width: 390, height: 844 }, 'mobile');
    await verify(slug, 'en', { width: 390, height: 844 }, 'mobile');
  }
  if (errors.length) throw new Error(`Browser runtime errors:\n${errors.join('\n')}`);
  console.log('Verified 12 bilingual/responsive media-browser states without overflow, broken images, or interaction failures.');
} finally {
  await browser.close();
}

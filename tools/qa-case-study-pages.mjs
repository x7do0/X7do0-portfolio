import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const output = path.resolve('output/playwright/case-studies');
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
  const images = page.locator('.case-media-card img');
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
  }
  const unloaded = await page.locator('.case-media-card img').evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).length);
  if (unloaded) throw new Error(`${slug} has ${unloaded} unloaded case-study images`);
  await page.screenshot({ path: path.join(output, `${slug}-${language}-${suffix}.png`), fullPage: true });
  await context.close();
}

try {
  for (const slug of ['enterprise-workflow', 'coding-academy', 'masroofi']) {
    await verify(slug, 'ar', { width: 1440, height: 960 }, 'desktop');
    await verify(slug, 'en', { width: 1440, height: 960 }, 'desktop');
    await verify(slug, 'ar', { width: 390, height: 844 }, 'mobile');
  }
  if (errors.length) throw new Error(`Browser runtime errors:\n${errors.join('\n')}`);
  console.log('Verified 9 bilingual/responsive case-study states without overflow or image failures.');
} finally {
  await browser.close();
}

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const outputRoot = path.resolve('assets/projects');
const academyRoot = path.join(outputRoot, 'coding-academy');

await mkdir(academyRoot, { recursive: true });

console.log('Launching browser...');
const browser = await chromium.launch({ headless: true });
console.log('Browser ready.');

async function capture(page, directory, name, options = {}) {
  await page.screenshot({
    path: path.join(directory, `${name}.jpg`),
    type: 'jpeg',
    quality: 86,
    fullPage: options.fullPage ?? false,
  });
}

async function captureAcademy() {
  console.log('Capturing Coding Academy...');
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'تعلّم البرمجة بخطوات واضحة' }).waitFor();
  await capture(page, academyRoot, '01-learning-home');

  await page.goto('http://127.0.0.1:4174/courses/python/index.html', { waitUntil: 'networkidle' });
  await page.locator('.concept-card').first().waitFor();
  await capture(page, academyRoot, '02-python-topic-cards');

  await page.locator('.concept-point').first().hover();
  await page.locator('#code-preview-popover[aria-hidden="false"]').waitFor();
  await capture(page, academyRoot, '03-topic-code-preview');

  await page.goto('http://127.0.0.1:4174/courses/python/lessons/index.html#lesson-05', { waitUntil: 'networkidle' });
  await page.locator('.lesson-document').waitFor();
  await capture(page, academyRoot, '04-lesson-and-source-files', { fullPage: true });

  await page.goto('http://127.0.0.1:4174/courses/python/practice/index.html', { waitUntil: 'networkidle' });
  await page.locator('.practice-question-card').first().waitFor();
  await capture(page, academyRoot, '05-practice-library');

  await page.goto('http://127.0.0.1:4174/courses/python/practice/question.html?id=6', { waitUntil: 'networkidle' });
  await page.locator('main').waitFor();
  await capture(page, academyRoot, '06-interactive-exercise', { fullPage: true });
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pageMobile = await mobile.newPage();
  await pageMobile.goto('http://127.0.0.1:4174/courses/python/index.html', { waitUntil: 'networkidle' });
  await pageMobile.locator('.concept-card').first().waitFor();
  await capture(pageMobile, academyRoot, '07-mobile-topic-path');
  await mobile.close();
}

try {
  await captureAcademy();
  console.log('Captured Coding Academy case-study media.');
} finally {
  await browser.close();
}

import fs from 'node:fs';

const path = 'tests/portfolio.spec.js';
let text = fs.readFileSync(path, 'utf8');

function replaceExact(from, to) {
  if (!text.includes(from)) throw new Error(`Expected block not found:\n${from}`);
  text = text.replace(from, to);
}

replaceExact(
  `  await expect(page.locator('[data-project="mahsoob"]')).toContainText('Offline-first');`,
  `  await expect(page.locator('[data-project="mahsoob"]')).toContainText('In development');`,
);

replaceExact(
  `  for (const slug of ['enterprise-workflow', 'coding-academy', 'masroofi']) {`,
  `  for (const slug of ['enterprise-workflow', 'masroofi']) {`,
);

replaceExact(
  `    const expectedMediaCount = { 'enterprise-workflow': 13, 'coding-academy': 7, masroofi: 8 }[slug];`,
  `    const expectedMediaCount = { 'enterprise-workflow': 13, masroofi: 8 }[slug];`,
);

const beforeMahsoob = `  await page.goto('/projects/mahsoob/');\n  await expect(page.locator('.project-source-preview img')).toBeVisible();\n  await expect(page.locator('.project-future.has-content')).toBeVisible();\n  await expect(page.locator('.future-panel')).toHaveCount(2);\n  await expect(page.locator('.project-case-study')).toHaveCount(0);`;
const afterMahsoob = `  await page.goto('/projects/coding-academy/');\n  await expect(page.locator('.project-source-preview img')).toBeVisible();\n  await expect(page.locator('.project-source-preview img')).toHaveAttribute('src', /coding-academy-current\\.svg/);\n  await expect(page.locator('.project-source-preview figcaption')).toHaveCount(0);\n  await expect(page.locator('.project-case-study')).toHaveCount(0);\n  await expect(page.locator('[data-media-main-image]')).toHaveCount(0);\n  await expect(page.locator('.case-media-thumb')).toHaveCount(0);\n  await expect(page.locator('.project-future')).toHaveCount(0);\n  await expect(page.locator('.project-related__card')).toHaveCount(3);\n  await expectNoOverflow(page);\n\n  await page.goto('/projects/mahsoob/');\n  await expect(page.locator('.project-source-preview img')).toBeVisible();\n  await expect(page.locator('.project-future')).toHaveCount(0);\n  await expect(page.locator('.future-panel')).toHaveCount(0);\n  await expect(page.locator('.project-case-study')).toHaveCount(0);`;
replaceExact(beforeMahsoob, afterMahsoob);

replaceExact(
  `    await page.locator('.case-media-main__open').click();\n    await expect(page.locator('.project-lightbox')).toBeVisible();\n    await page.keyboard.press('Escape');\n    await expect(page.locator('.project-lightbox')).toHaveCount(0);`,
  `    if (slug === 'masroofi') {\n      await page.locator('.case-media-main__open').click();\n      await expect(page.locator('.project-lightbox')).toBeVisible();\n      await page.keyboard.press('Escape');\n      await expect(page.locator('.project-lightbox')).toHaveCount(0);\n    } else {\n      await expect(page.locator('.case-media-main__open')).toHaveCount(0);\n      await expect(page.locator('.project-case-study')).toHaveCount(0);\n      await expect(page.locator('.project-future')).toHaveCount(0);\n    }`,
);

replaceExact(
  `  for (const slug of ['enterprise-workflow', 'masroofi', 'coding-academy']) {\n    const primaryImage = {\n      'enterprise-workflow': '01-employee-dashboard-light.png',\n      masroofi: '01-balance-dashboard-light.png',\n      'coding-academy': '02-python-topic-cards.jpg',\n    }[slug];`,
  `  for (const slug of ['enterprise-workflow', 'masroofi']) {\n    const primaryImage = {\n      'enterprise-workflow': '01-employee-dashboard-light.png',\n      masroofi: '01-balance-dashboard-light.png',\n    }[slug];`,
);

fs.writeFileSync(path, text);
console.log('Updated portfolio tests for current Academy and Mahsoob positioning.');

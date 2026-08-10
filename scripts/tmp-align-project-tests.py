from pathlib import Path

path = Path('tests/portfolio.spec.js')
source = path.read_text(encoding='utf-8')


def replace_exact(old, new):
    global source
    if old not in source:
        raise RuntimeError(f'Missing expected text: {old}')
    source = source.replace(old, new, 1)


def replace_test(name, replacement):
    global source
    token = f"test('{name}'"
    start = source.find(token)
    if start < 0:
        raise RuntimeError(f'Missing test: {name}')
    next_start = source.find("\ntest('", start + len(token))
    end = len(source) if next_start < 0 else next_start + 1
    source = source[:start] + replacement.strip() + '\n\n' + source[end:]


replace_exact(
    "  await expect(page.locator('.demo-trigger')).toHaveCount(4);",
    "  await expect(page.locator('.demo-trigger')).toHaveCount(2);",
)
replace_exact(
    "  await expect(page.locator('[data-project=\"coding-academy\"] .demo-trigger')).toHaveAttribute('href', './projects/coding-academy/?demo=1#demo');",
    """  await expect(page.locator('[data-project="enterprise-workflow"] .demo-trigger')).toBeVisible();
  await expect(page.locator('[data-project="mahsoob"] .demo-trigger')).toBeVisible();
  await expect(page.locator('[data-project="coding-academy"] .demo-trigger')).toHaveCount(0);
  await expect(page.locator('[data-project="coding-academy"] .button--primary')).toHaveAttribute('href', 'https://x7do0.github.io/X7do0-Academy/');
  await expect(page.locator('[data-project="coding-academy"] .button--primary')).toHaveAttribute('target', '_blank');
  await expect(page.locator('[data-project="masroofi"] .demo-trigger')).toHaveCount(0);
  await expect(page.locator('[data-project="masroofi"] .button--primary')).toHaveAttribute('href', 'https://x7do0.github.io/Masroofi/');
  await expect(page.locator('[data-project="masroofi"] .button--primary')).toHaveAttribute('target', '_blank');""",
)
replace_exact(
    "  await expect(page.locator('.skill-item')).toHaveCount(5);",
    "  await expect(page.locator('.skill-item')).toHaveCount(4);",
)

replace_test('project details use real previews, source-backed facts, and an inline demo', r"""
test('project details use current media, real links, and demos only where appropriate', async ({ page }) => {
  await page.goto('/projects/enterprise-workflow/');
  await expect(page.locator('.project-source-preview img')).toBeVisible();
  await expect(page.locator('.project-case-study')).toBeVisible();
  await expect(page.locator('.case-section')).toHaveCount(4);
  await expect(page.locator('.case-media-thumb')).toHaveCount(13);
  await expect(page.locator('[data-demo-link]')).toBeVisible();
  await page.locator('[data-demo-link]').click();
  await expect(page.locator('.project-inline-demo')).toBeVisible();
  await expect(page.locator('.project-inline-demo iframe')).toHaveAttribute('src', /\/demos\/enterprise-workflow\//);
  await expectDemoFitsViewport(page);
  await page.locator('[data-demo-close]').click();
  await expect(page.locator('.project-related__card')).toHaveCount(3);
  await expectNoOverflow(page);

  await page.goto('/projects/coding-academy/');
  await expect(page.locator('.project-source-preview img')).toBeVisible();
  await expect(page.locator('.project-source-preview img')).toHaveAttribute('src', /coding-academy\/01-home-current\.png/);
  await expect(page.locator('.project-case-study')).toBeVisible();
  await expect(page.locator('.case-section')).toHaveCount(4);
  await expect(page.locator('.case-media-thumb')).toHaveCount(6);
  await expect(page.locator('[data-demo-link]')).toHaveCount(0);
  await expect(page.locator('.project-link--live')).toHaveAttribute('href', 'https://x7do0.github.io/X7do0-Academy/');
  await expect(page.locator('.project-link--live')).toHaveAttribute('target', '_blank');
  await expect(page.locator('.project-future')).toHaveCount(0);
  await expect(page.locator('.project-related__card')).toHaveCount(3);
  await expectNoOverflow(page);

  await page.goto('/projects/masroofi/');
  await expect(page.locator('.project-source-preview img')).toBeVisible();
  await expect(page.locator('.project-case-study')).toBeVisible();
  await expect(page.locator('.case-section')).toHaveCount(4);
  await expect(page.locator('.case-media-thumb')).toHaveCount(8);
  await expect(page.locator('[data-demo-link]')).toHaveCount(0);
  await expect(page.locator('.project-link--live')).toHaveAttribute('href', 'https://x7do0.github.io/Masroofi/');
  await expect(page.locator('.project-link--live')).toHaveAttribute('target', '_blank');
  await expect(page.locator('.project-future')).toHaveCount(0);
  await expect(page.locator('.project-related__card')).toHaveCount(3);
  await expectNoOverflow(page);

  await page.goto('/projects/mahsoob/');
  await expect(page.locator('.project-source-preview img')).toBeVisible();
  await expect(page.locator('.project-development-notice')).toBeVisible();
  await expect(page.locator('.project-development-notice')).toContainText('قيد التطوير');
  await expect(page.locator('.project-development-notice')).toHaveAttribute('role', 'status');
  await expect(page.locator('.project-case-study')).toHaveCount(0);
  await expect(page.locator('.project-future')).toHaveCount(0);
  await expect(page.locator('[data-demo-link]')).toBeVisible();
  await page.locator('[data-demo-link]').click();
  await expect(page.locator('.project-inline-demo')).toBeVisible();
  await expect(page.locator('.project-inline-demo iframe')).toHaveAttribute('src', /\/demos\/mahsoob\//);
  await expectDemoFitsViewport(page);
  await expect(page.locator('.project-related__card')).toHaveCount(3);
  await expectNoOverflow(page);
});
""")

replace_test('project demos provide project-specific guided flows in one viewport', r"""
test('Mahsoob demo provides its guided point-of-sale flow in one viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/mahsoob/?lang=en');
  await page.locator('[data-demo-link]').click();
  await expect(page.locator('[data-demo-role]')).toHaveCount(0);
  await expect(page.locator('[data-demo-guide-step]')).toHaveCount(4);
  await expectDemoFitsViewport(page);
  const frame = page.frameLocator('.project-inline-demo iframe');
  await frame.locator('[data-product]').first().click();
  await expect(page.locator('[data-demo-guide-step="payment"]')).toHaveClass(/is-current/);
  await frame.locator('[data-cash]').fill('100000');
  await expect(page.locator('[data-demo-guide-step="checkout"]')).toHaveClass(/is-current/);
  await frame.locator('[data-checkout]').click();
  await expect(page.locator('[data-demo-guide-step="receipt"]')).toHaveClass(/is-current/);
  await page.locator('[data-demo-reset]').click();
  await expect(frame.locator('[data-receipt]')).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-demo-guide-step="product"]')).toHaveClass(/is-current/);
});
""")

replace_test('project demos use short laptop and mobile space for a readable no-scroll presentation', r"""
test('project demos use short laptop and mobile space for a readable no-scroll presentation', async ({ page }) => {
  const minimumDesktopScale = {
    'enterprise-workflow': 0.89,
    mahsoob: 0.87,
  };

  await page.setViewportSize({ width: 1536, height: 696 });
  for (const slug of Object.keys(minimumDesktopScale)) {
    await page.goto(`/projects/${slug}/`);
    await page.locator('[data-demo-link]').click();
    await page.locator('iframe[data-demo-fitted="true"]').waitFor();
    await expectDemoFitsViewport(page);
    const presentation = await page.locator('.project-inline-demo').evaluate((stage) => ({
      scale: Number(getComputedStyle(stage).getPropertyValue('--demo-scale')),
      guideFont: Number.parseFloat(getComputedStyle(stage.querySelector('[data-demo-guide-step] p')).fontSize),
    }));
    expect(presentation.scale).toBeGreaterThanOrEqual(minimumDesktopScale[slug]);
    expect(presentation.guideFont).toBeGreaterThanOrEqual(11.5);
    await expect.poll(() => page.locator('.project-inline-demo iframe').evaluate((iframe) => (
      iframe.contentDocument.documentElement.scrollHeight - iframe.clientHeight
    ))).toBeLessThanOrEqual(2);
  }

  await page.goto('/projects/enterprise-workflow/');
  await page.locator('[data-demo-link]').click();
  const enterpriseFrame = page.frameLocator('.project-inline-demo iframe');
  await expect.poll(() => enterpriseFrame.locator('.content-grid').evaluate((grid) => {
    const panel = grid.querySelector('.requests-panel').getBoundingClientRect();
    return panel.width / grid.getBoundingClientRect().width;
  })).toBeGreaterThan(0.95);

  await page.setViewportSize({ width: 390, height: 844 });
  const minimumMobileScale = {
    'enterprise-workflow': 0.55,
    mahsoob: 0.43,
  };
  for (const slug of Object.keys(minimumMobileScale)) {
    await page.goto(`/projects/${slug}/`);
    await page.locator('[data-demo-link]').click();
    await page.locator('iframe[data-demo-fitted="true"]').waitFor();
    await expectDemoFitsViewport(page);
    const scale = await page.locator('.project-inline-demo').evaluate((stage) => Number(getComputedStyle(stage).getPropertyValue('--demo-scale')));
    expect(scale).toBeGreaterThanOrEqual(minimumMobileScale[slug]);
  }
});
""")

replace_test('public product links and media lightbox are explicit and keyboard-safe', r"""
test('public product links and media lightbox are explicit and keyboard-safe', async ({ page }) => {
  const liveUrls = {
    'coding-academy': 'https://x7do0.github.io/X7do0-Academy/',
    masroofi: 'https://x7do0.github.io/Masroofi/',
  };
  for (const slug of Object.keys(liveUrls)) {
    await page.goto(`/projects/${slug}/`);
    await expect(page.locator('.project-link--live')).toHaveAttribute('href', liveUrls[slug]);
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
""")

replace_test('Academy demo leads with topic cards and completes its practice path', r"""
test('Academy project presents current screenshots and the published learning platform', async ({ page }) => {
  const errors = runtimeErrors(page);
  await page.goto('/projects/coding-academy/');
  await expect(page.locator('.project-source-preview img')).toHaveAttribute('src', /coding-academy\/01-home-current\.png/);
  await expect(page.locator('.project-case-study')).toBeVisible();
  await expect(page.locator('.case-media-thumb')).toHaveCount(6);
  await expect(page.locator('.project-link--live')).toHaveAttribute('href', 'https://x7do0.github.io/X7do0-Academy/');
  await expect(page.locator('[data-demo-link]')).toHaveCount(0);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});
""")

path.write_text(source, encoding='utf-8')
print('Portfolio project tests aligned with current presentation.')

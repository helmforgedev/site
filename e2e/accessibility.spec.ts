import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagesToTest = [
  { name: 'Homepage', path: '/' },
  { name: 'Docs', path: '/docs' },
  { name: 'Playground', path: '/playground' },
  { name: 'Blog', path: '/blog' },
  { name: 'Changelog', path: '/changelog' },
];

test.describe('Accessibility', () => {
  for (const page of pagesToTest) {
    test(`${page.name} has no critical a11y violations`, async ({ page: p }) => {
      await p.goto(page.path);
      await p.waitForLoadState('domcontentloaded');

      const results = await new AxeBuilder({ page: p })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.pagefind-ui') // exclude third-party search UI
        .analyze();

      const critical = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

      if (critical.length > 0) {
        const summary = critical
          .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
          .join('\n');
        expect(critical, `Accessibility violations on ${page.name}:\n${summary}`).toHaveLength(0);
      }
    });
  }

  test('skip-to-content link is functional', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
  });

  test('keyboard navigation through header nav', async ({ page }) => {
    await page.goto('/');

    // Tab past skip link to first nav item
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // logo link
    await page.keyboard.press('Tab'); // first nav item

    const activeElement = page.locator(':focus');
    await expect(activeElement).toBeVisible();
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([alt])');
    expect(await images.count()).toBe(0);
  });

  test('heading hierarchy is correct on homepage', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });
});

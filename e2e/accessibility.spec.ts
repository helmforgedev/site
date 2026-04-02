import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagesToTest = [
  { name: 'Homepage', path: '/' },
  { name: 'Docs', path: '/docs' },
  { name: 'Playground', path: '/playground' },
  { name: 'Blog', path: '/blog' },
  { name: 'Changelog', path: '/changelog' },
  { name: 'Stack Builder', path: '/stack' },
  { name: 'Roadmap', path: '/roadmap' },
  { name: 'Request', path: '/request' },
  { name: 'Community', path: '/community' },
];

test.describe('Accessibility', () => {
  for (const pg of pagesToTest) {
    test(`${pg.name} has no critical a11y violations (WCAG 2.2 AA)`, async ({ page }) => {
      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .exclude('.pagefind-ui')
        .analyze();

      const critical = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

      if (critical.length > 0) {
        const summary = critical
          .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
          .join('\n');
        expect(critical, `Accessibility violations on ${pg.name}:\n${summary}`).toHaveLength(0);
      }
    });
  }

  test('skip-to-content link is functional', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit does not focus links with Tab by default');
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

  test('dropdown menus support keyboard navigation', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit does not reliably support programmatic focus on menu items');
    await page.goto('/');
    const nav = page.locator('header nav').first();

    // Tab to the Tools dropdown trigger
    const toolsBtn = nav.getByRole('button', { name: 'Tools' });
    await toolsBtn.focus();

    // ArrowDown should open dropdown and focus first item
    await page.keyboard.press('ArrowDown');
    const firstItem = nav.locator('[role="menuitem"]').first();
    await expect(firstItem).toBeFocused();

    // Escape should close and return focus to trigger
    await page.keyboard.press('Escape');
    await expect(toolsBtn).toBeFocused();
  });

  test('tab panels have proper ARIA roles', async ({ page }) => {
    await page.goto('/docs');

    // Check if DocsTabs exist on the page
    const tabPanels = page.locator('[role="tabpanel"]');
    const tabLists = page.locator('[role="tablist"]');

    // If tabs exist, verify ARIA structure
    if ((await tabLists.count()) > 0) {
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);

      // First tab should be selected
      const firstTab = tabs.first();
      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('form fields have required ARIA attributes', async ({ page }) => {
    await page.goto('/request');

    const chartName = page.locator('#chart-name');
    await expect(chartName).toHaveAttribute('aria-required', 'true');
    await expect(chartName).toHaveAttribute('required', '');

    const projectUrl = page.locator('#project-url');
    await expect(projectUrl).toHaveAttribute('aria-required', 'true');
    await expect(projectUrl).toHaveAttribute('autocomplete', 'url');
  });

  test('interactive elements meet minimum target size', async ({ page }) => {
    await page.goto('/');

    // Check header nav buttons are at least 36px tall (> 24px WCAG 2.5.8 minimum)
    const navButtons = page.locator('header nav button, header nav a').all();
    for (const btn of await navButtons) {
      const box = await btn.boundingBox();
      if (box && box.height > 0) {
        expect(box.height, `Button "${await btn.textContent()}" height ${box.height}px < 24px`).toBeGreaterThanOrEqual(
          24,
        );
      }
    }
  });

  test('mobile menu items meet 44px touch target', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Open mobile menu
    const menuToggle = page.locator('#mobile-menu-toggle');
    await menuToggle.click();
    await page.waitForTimeout(300);

    // Check mobile nav items
    const mobileLinks = page.locator('#mobile-menu a');
    const count = await mobileLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = mobileLinks.nth(i);
      const box = await link.boundingBox();
      if (box && box.height > 0) {
        expect(box.height, `Mobile link ${i} height ${box.height}px < 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

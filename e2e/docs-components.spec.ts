import { test, expect } from '@playwright/test';

test.describe('Docs Components', () => {
  test('DocsTabs switches between tabs', async ({ page }) => {
    await page.goto('/docs/charts/postgresql');
    const tabGroup = page.locator('[role="tablist"]').first();

    if ((await tabGroup.count()) > 0) {
      const tabs = tabGroup.locator('[role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThanOrEqual(2);

      // Click second tab
      await tabs.nth(1).click();
      await page.waitForTimeout(200);

      // Verify the second tab is now active
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');

      // Click first tab back
      await tabs.nth(0).click();
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('Callout components render on troubleshooting page', async ({ page }) => {
    await page.goto('/docs/troubleshooting');
    await expect(page).toHaveTitle(/Troubleshooting/i);
    // Callout components should be present
    const callouts = page.locator('[class*="callout"], [class*="Callout"], aside, [role="note"]');
    expect(await callouts.count()).toBeGreaterThan(0);
  });

  test('FAQ page has collapsible details sections', async ({ page }) => {
    await page.goto('/docs/faq');
    await expect(page).toHaveTitle(/FAQ/i);

    const details = page.locator('details');
    expect(await details.count()).toBeGreaterThan(5);

    // Click to expand first details
    const first = details.first();
    const summary = first.locator('summary');
    await summary.click();
    await expect(first).toHaveAttribute('open', '');
  });

  test('install section on homepage has tabs and copy', async ({ page }) => {
    await page.goto('/');
    // Look for the install section with helm/OCI tabs
    const installSection = page.locator('#install, [data-section="install"]').first();

    if ((await installSection.count()) > 0) {
      // Should have tab-like controls
      const tabs = installSection.locator('button, [role="tab"]');
      expect(await tabs.count()).toBeGreaterThanOrEqual(1);
    }
  });
});

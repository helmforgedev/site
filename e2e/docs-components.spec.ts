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

  test('chart docs page displays chart header quick bar', async ({ page }) => {
    await page.goto('/docs/charts/postgresql');
    const main = page.locator('#main-content');
    await expect(main.getByRole('link', { name: 'Values Studio' }).first()).toHaveAttribute(
      'href',
      '/playground/postgresql',
    );
    await expect(main.getByRole('link', { name: 'Stack Builder' })).toHaveAttribute(
      'href',
      '/stack?select=postgresql',
    );
    await expect(main.locator('text=Pinned Digest').first()).toBeVisible();

    // Verify official schema reference section is loaded
    const schemaRef = page.locator('#values-schema-reference');
    await expect(schemaRef).toBeVisible();
    await expect(schemaRef.locator('text=Values Schema Reference')).toBeVisible();
    await expect(schemaRef.locator('.schema-row').first()).toBeVisible();

    // Verify architecture topology section is loaded from DESIGN.md
    const archSection = page.locator('#architecture-topology');
    await expect(archSection).toBeVisible();
    await expect(archSection.locator('text=System Architecture')).toBeVisible();
    await expect(archSection.locator('text=DESIGN.md Synced')).toBeVisible();
    await expect(archSection.getByRole('link', { name: /GitHub DESIGN\.md/i })).toHaveAttribute(
      'href',
      /github\.com\/helmforgedev\/charts\/blob\/main\/charts\/postgresql\/DESIGN\.md#architecture/,
    );
  });

  test('chart docs page with multiple topologies renders switchable tabs if available', async ({
    page,
  }) => {
    await page.goto('/docs/charts/mysql');
    const archSection = page.locator('#architecture-topology');
    if (await archSection.isVisible()) {
      const tabs = archSection.locator('[role="tab"]');
      const tabCount = await tabs.count();
      if (tabCount >= 2) {
        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      }
    }
  });
});

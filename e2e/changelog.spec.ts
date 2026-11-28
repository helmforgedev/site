// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.describe('Changelog Page', () => {
  test('renders releases and real-time search filter', async ({ page }) => {
    await page.goto('/changelog');

    await expect(page).toHaveTitle(/Changelog/i);
    await expect(page.locator('h1')).toContainText("What's new in HelmForge charts");

    // Search input should exist
    const searchInput = page.locator('#changelog-search');
    await expect(searchInput).toBeVisible();

    // Release list should have entries
    const items = page.locator('#changelog-list .changelog-item');
    expect(await items.count()).toBeGreaterThan(5);

    // Filter by a chart that is present in the rendered release feed
    const firstChart = await items.first().getAttribute('data-chart');
    expect(firstChart).toBeTruthy();
    await searchInput.fill(firstChart!);
    await page.waitForTimeout(200);

    // Visible items should be filtered
    const visibleItems = page.locator('#changelog-list .changelog-item:visible');
    const visibleCount = await visibleItems.count();
    expect(visibleCount).toBeGreaterThanOrEqual(1);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(200);
    const restoredCount = await page.locator('#changelog-list .changelog-item:visible').count();
    expect(restoredCount).toBeGreaterThan(visibleCount);
  });

  test('displays verification signals and links to documentation and studio', async ({ page }) => {
    await page.goto('/changelog');

    // Verification tags
    await expect(page.getByText('Cosign Signed')).toBeVisible();

    // Open first release details
    const firstDetails = page.locator('#changelog-list .changelog-item').first();
    await firstDetails.locator('summary').click();

    // Documentation link inside open details
    const docsLink = firstDetails.locator('a[href^="/docs/charts/"]');
    await expect(docsLink).toBeVisible();

    // Values Studio link inside open details
    const studioLink = firstDetails.locator('a[href^="/playground"]');
    await expect(studioLink).toBeVisible();
  });
});

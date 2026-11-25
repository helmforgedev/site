// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.describe('Home Page Modernization', () => {
  test('renders hero, comparison, and chart request sections', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/HelmForge/i);

    // Hero section
    await expect(page.locator('.hero-terminal')).toBeVisible();

    // Redundant install section must NOT be present
    const installSection = page.locator('#install, [data-section="install"]');
    expect(await installSection.count()).toBe(0);

    // Comparison table
    await expect(page.getByText('HelmForge vs Bitnami — feature by feature.')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Generic Community' })).toBeVisible();

    // Chart Request Pipeline section on Home
    await expect(page.getByText('We forge what you request.')).toBeVisible();
    await expect(page.locator('#main-content a[href="/request"]').first()).toBeVisible();

    // Links to Stack Builder and Values Studio
    const stackLinks = page.locator('a[href="/stack"]');
    expect(await stackLinks.count()).toBeGreaterThanOrEqual(1);

    const playgroundLinks = page.locator('a[href="/playground"]');
    expect(await playgroundLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test('home chart request section keeps delivered charts visible and renders open requests when available', async ({
    page,
  }) => {
    await page.goto('/');

    // Chart request community column keeps delivered charts visible alongside open requests
    const requestSection = page.locator('#chart-request');
    await expect(requestSection).toBeVisible();

    const trending = requestSection.getByText('Trending Community Requests');
    const delivered = requestSection.getByText('Recently Delivered Requests');
    await expect(delivered).toBeVisible();

    // The trending block is intentionally omitted when no chart requests are open.
    if ((await trending.count()) > 0) {
      await expect(trending).toBeVisible();
      await expect(requestSection.getByText('Click to upvote with')).toBeVisible();
    }
  });
});

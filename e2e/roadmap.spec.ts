// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.describe('Roadmap & Delivery Track Record', () => {
  test('renders roadmap heading and delivered pillars', async ({ page }) => {
    await page.goto('/roadmap');

    await expect(page).toHaveTitle(/Roadmap/i);
    await expect(page.locator('h1')).toContainText('Forging the Future of');

    // Strategic Delivered Pillars
    await expect(page.getByText('Core Architecture & Non-Root Security Standard')).toBeVisible();
    await expect(page.getByText('Day-Two Operations & Automated Backups')).toBeVisible();
    await expect(page.getByText('Supply Chain Security & Distribution Infrastructure')).toBeVisible();

    // Check delivered items
    await expect(
      page.getByText('100% official upstream container images pinned by immutable SHA256 digests').first(),
    ).toBeVisible();
  });

  test('displays upcoming strategic initiatives and request cta', async ({ page }) => {
    await page.goto('/roadmap');

    // Strategic Focus / Upcoming sections
    await expect(page.getByText('Strategic Vision').first()).toBeVisible();
    await expect(page.getByText('Have an architecture or chart suggestion?')).toBeVisible();

    // Chart request link
    const requestLink = page.locator('#main-content a[href="/request"]');
    await expect(requestLink.first()).toBeVisible();
  });
});

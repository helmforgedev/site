// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.describe('Community & Governance Hub', () => {
  test('renders community metrics and contribution tracks', async ({ page }) => {
    await page.goto('/community');

    await expect(page).toHaveTitle(/Community.*HelmForge/i);
    await expect(page.locator('h1')).toContainText('Built in the open, shaped by operators');

    // Metrics grid
    await expect(page.getByText('136+').first()).toBeVisible();
    await expect(page.getByText('Production Charts').first()).toBeVisible();
    await expect(page.getByText('Apache-2.0').first()).toBeVisible();
    await expect(page.getByText('Quality Gate').first()).toBeVisible();

    // Contribution pathways
    await expect(page.getByText('Submit a Chart')).toBeVisible();
    await expect(page.getByText('Report Issues')).toBeVisible();
    await expect(page.getByText('Improve Documentation')).toBeVisible();

    // Request Pipeline
    await expect(page.getByText('Submit Request')).toBeVisible();
    await expect(page.getByText('Maintainer Audit')).toBeVisible();
    await expect(page.getByText('k3d Validation')).toBeVisible();
    await expect(page.getByText('Signed Release')).toBeVisible();
  });

  test('links to governance, code of conduct, and maintainers', async ({ page }) => {
    await page.goto('/community');

    const githubLinks = page.locator('#main-content a[href*="github.com/helmforgedev"]');
    expect(await githubLinks.count()).toBeGreaterThanOrEqual(2);

    // Contributor CTA link in main content
    const requestCta = page.locator('#main-content a[href="/request"]');
    await expect(requestCta.first()).toBeVisible();
  });
});

// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.describe('Chart Request Page', () => {
  test('renders chart request form and delivered community requests', async ({ page }) => {
    await page.goto('/request');

    await expect(page).toHaveTitle(/Request a Chart/i);
    await expect(page.locator('h1')).toContainText('Missing a chart?');

    // Form inputs
    const chartNameInput = page.locator('#chart-name');
    await expect(chartNameInput).toBeVisible();

    const projectUrlInput = page.locator('#project-url');
    await expect(projectUrlInput).toBeVisible();

    const reasonInput = page.locator('#reason');
    await expect(reasonInput).toBeVisible();

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Open GitHub Issue');
  });

  test('generates pre-filled GitHub issue URL on form submit', async ({ page }) => {
    await page.goto('/request');

    await page.locator('#chart-name').fill('plausible-analytics');
    await page.locator('#project-url').fill('https://github.com/plausible/analytics');
    await page.locator('#reason').fill('Privacy-friendly Google Analytics alternative');

    // Mock window.open to test parameters without opening real browser popup
    await page.evaluate(() => {
      (window as any).__openedUrl = '';
      window.open = (url) => {
        (window as any).__openedUrl = url;
        return null;
      };
    });

    await page.locator('button[type="submit"]').click();

    const openedUrl = await page.evaluate(() => (window as any).__openedUrl);
    expect(openedUrl).toContain('github.com/helmforgedev/charts/issues/new');
    expect(openedUrl).toContain('plausible-analytics');
  });
});

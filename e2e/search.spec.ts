import { test, expect } from '@playwright/test';

test.describe('Search modal', () => {
  test('opens with Ctrl+K and closes with Escape', async ({ page }) => {
    await page.goto('/');

    // Modal should be hidden initially
    const overlay = page.locator('#search-overlay');
    await expect(overlay).toHaveClass(/hidden/);

    // Open with Ctrl+K
    await page.keyboard.press('Control+k');
    await expect(overlay).not.toHaveClass(/hidden/);

    // Input should be focused
    await expect(page.locator('#search-input')).toBeFocused();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(overlay).toHaveClass(/hidden/);
  });

  test('opens from header search button', async ({ page }) => {
    await page.goto('/');

    const searchBtn = page.locator('#search-trigger');
    await searchBtn.click();

    const overlay = page.locator('#search-overlay');
    await expect(overlay).not.toHaveClass(/hidden/);
  });

  test('closes when clicking backdrop', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Control+k');
    const overlay = page.locator('#search-overlay');
    await expect(overlay).not.toHaveClass(/hidden/);

    // Click the backdrop (top-left corner, outside the centered modal)
    await page.locator('#search-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(overlay).toHaveClass(/hidden/);
  });
});

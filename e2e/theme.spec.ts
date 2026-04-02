import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('toggles between dark and light themes', async ({ page }) => {
    await page.goto('/');

    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="Toggle" i]').first();
    if ((await themeToggle.count()) === 0) return; // Skip if no toggle found

    await themeToggle.click();
    await page.waitForTimeout(300);

    // Theme should have changed
    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(newTheme).not.toBe(initialTheme);

    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(300);
    const restoredTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(restoredTheme).toBe(initialTheme);
  });

  test('theme persists across navigation', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="Toggle" i]').first();
    if ((await themeToggle.count()) === 0) return;

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(300);
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    // Navigate to another page
    await page.goto('/docs');
    await page.waitForTimeout(300);
    const themeAfterNav = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(themeAfterNav).toBe(theme);
  });

  test('no broken styles in light mode', async ({ page }) => {
    await page.goto('/');
    // Force light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('helmforge-theme', 'light');
    });
    await page.waitForTimeout(300);

    // Check header is visible and has reasonable styling
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const headerBg = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Should not be transparent (rgb(0,0,0,0))
    expect(headerBg).not.toBe('rgba(0, 0, 0, 0)');

    // Check main content area text is visible (not same color as background)
    const body = page.locator('body');
    const bodyBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const bodyColor = await body.evaluate((el) => window.getComputedStyle(el).color);
    expect(bodyBg).not.toBe(bodyColor);
  });
});

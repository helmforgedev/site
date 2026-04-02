import { test, expect } from '@playwright/test';

test.describe('Navigation and page rendering', () => {
  test('header renders all nav items', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav').first();
    // Direct nav links
    await expect(nav.getByText('Docs')).toBeVisible();
    await expect(nav.getByText('Blog')).toBeVisible();
    // Dropdown trigger buttons
    await expect(nav.getByRole('button', { name: 'Tools' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Community' })).toBeVisible();
    await expect(nav.locator('a[href*="github.com"]')).toBeVisible();
  });

  test('dropdown menus reveal items on hover', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav').first();
    // Hover Tools dropdown to reveal items
    await nav.getByRole('button', { name: 'Tools' }).hover();
    await expect(nav.getByText('Stack Builder')).toBeVisible();
    await expect(nav.getByText('Playground')).toBeVisible();
    // Hover Community dropdown to reveal items
    await nav.getByRole('button', { name: 'Community' }).hover();
    await expect(nav.getByText('Changelog')).toBeVisible();
    await expect(nav.getByText('Request a Chart')).toBeVisible();
  });

  test('docs page loads with sidebar', async ({ page }) => {
    await page.goto('/docs');
    await expect(page).toHaveTitle(/Docs|Documentation/i);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('chart catalog renders cards', async ({ page }) => {
    await page.goto('/');
    const chartGrid = page.locator('#chart-grid-container');
    await expect(chartGrid).toBeVisible();
    const cards = chartGrid.locator('.chart-card');
    expect(await cards.count()).toBeGreaterThan(10);
  });

  test('changelog page loads', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page).toHaveTitle(/Changelog/i);
  });

  test('stack builder page loads', async ({ page }) => {
    await page.goto('/stack');
    await expect(page).toHaveTitle(/Stack Builder/i);
  });

  test('request page loads with form', async ({ page }) => {
    await page.goto('/request');
    await expect(page).toHaveTitle(/Request/i);
    await expect(page.locator('#request-form')).toBeVisible();
  });

  test('404 page renders', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await expect(page.locator('text=404')).toBeVisible();
  });
});

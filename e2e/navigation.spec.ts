import { test, expect } from '@playwright/test';

test.describe('Navigation and page rendering', () => {
  test('header renders all nav items', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav').first();
    await expect(nav.getByText('Home')).toBeVisible();
    await expect(nav.getByText('Docs')).toBeVisible();
    await expect(nav.getByText('Stack Builder')).toBeVisible();
    await expect(nav.getByText('Request')).toBeVisible();
    await expect(nav.getByText('Changelog')).toBeVisible();
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

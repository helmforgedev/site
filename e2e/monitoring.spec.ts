import { test, expect } from '@playwright/test';

test.describe('Blog monitoring', () => {
  test('renders the discovery monitoring workflow', async ({ page }) => {
    await page.goto('/blog/monitoring');

    await expect(page).toHaveTitle(/Blog Discovery Monitoring/i);
    await expect(page.locator('h1')).toContainText('Blog discovery monitoring');
    await expect(page.getByText('Google Search Console').first()).toBeVisible();
    await expect(page.getByText('Bing Webmaster Tools').first()).toBeVisible();
    await expect(page.getByText('Core Web Vitals').first()).toBeVisible();
    await expect(page.getByText('Google Discover').first()).toBeVisible();
    await expect(page.locator('a[href="/sitemap-index.xml"]')).toContainText('sitemap-index.xml');
    await expect(page.locator('a[href="/blog/rss.xml"]')).toContainText('/blog/rss.xml');
  });

  test('exposes analytics content groups in generated pages', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');
    await expect(page.locator('html')).toHaveAttribute('data-content-group', 'Blog');

    await page.goto('/docs/charts/postgresql');
    await expect(page.locator('html')).toHaveAttribute('data-content-group', 'Chart docs');
  });
});

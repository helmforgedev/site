import { test, expect } from '@playwright/test';

test.describe('Chart Icons', () => {
  test('all chart icons load on homepage catalog', async ({ page }) => {
    await page.goto('/');
    const chartGrid = page.locator('#chart-grid-container');
    await expect(chartGrid).toBeVisible();

    // Get all image sources in the chart grid
    const images = chartGrid.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(10);

    // Scroll to make lazy images visible, then check they load
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await img.scrollIntoViewIfNeeded();
    }
    // Wait for lazy images to load
    await page.waitForTimeout(1000);

    // Verify all images loaded via fetch (avoids lazy loading issues)
    const failedSrcs = await page.evaluate(() => {
      const imgs = document.querySelectorAll<HTMLImageElement>('#chart-grid-container img');
      const failed: string[] = [];
      imgs.forEach((img) => {
        if (!img.complete || img.naturalWidth === 0) {
          failed.push(img.src);
        }
      });
      return failed;
    });
    expect(failedSrcs, `Failed to load icons: ${failedSrcs.join(', ')}`).toHaveLength(0);
  });

  test('SVG icons are not corrupted', async ({ page }) => {
    await page.goto('/');
    const chartGrid = page.locator('#chart-grid-container');
    const svgImages = chartGrid.locator('img[src$=".svg"]');
    const count = await svgImages.count();

    for (let i = 0; i < count; i++) {
      const img = svgImages.nth(i);
      const src = await img.getAttribute('src');

      // Fetch the SVG content and verify it starts with SVG markup
      const response = await page.request.get(src!);
      expect(response.status(), `SVG returned error status: ${src}`).toBe(200);
      const body = await response.text();
      expect(body, `SVG content is not valid SVG: ${src}`).toMatch(/^(<\?xml|<svg)/);
    }
  });

  test('playground chart icons load', async ({ page }) => {
    await page.goto('/playground');
    const chartList = page.locator('.playground-chart-btn');
    const images = page.locator('.playground-chart-btn img');
    const count = await images.count();
    expect(count).toBeGreaterThan(10);

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const loaded = await img.evaluate((el: HTMLImageElement) => el.naturalWidth > 0 && el.complete);
      const src = await img.getAttribute('src');
      expect(loaded, `Playground icon failed: ${src}`).toBe(true);
    }
  });
});

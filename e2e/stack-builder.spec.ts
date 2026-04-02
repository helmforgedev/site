import { test, expect } from '@playwright/test';

test.describe('Stack Builder', () => {
  test('renders chart list and output panel', async ({ page }) => {
    await page.goto('/stack');
    await expect(page).toHaveTitle(/Stack Builder/i);
    const chartItems = page.locator('.stack-chart-item');
    expect(await chartItems.count()).toBeGreaterThan(10);
    await expect(page.locator('#stack-output')).toBeVisible();
  });

  test('selecting a chart updates output', async ({ page }) => {
    await page.goto('/stack');
    const firstChart = page.locator('.stack-chart-item').first();
    await firstChart.click();

    const code = page.locator('#stack-code');
    await expect(code).toContainText('helm install');
    await expect(page.locator('#stack-count')).toContainText('1 selected');
  });

  test('preset stacks select multiple charts', async ({ page }) => {
    await page.goto('/stack');
    const presetBtn = page.locator('.stack-preset').first();
    await presetBtn.click();

    const code = page.locator('#stack-code');
    await expect(code).toContainText('helm install');
    // Multiple charts should be selected
    const countText = await page.locator('#stack-count').textContent();
    const count = parseInt(countText ?? '0');
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('format toggle switches output', async ({ page }) => {
    await page.goto('/stack');
    // Select a chart first
    await page.locator('.stack-chart-item').first().click();

    // Switch to Helmfile
    await page.locator('.stack-format-btn[data-format="helmfile"]').click();
    await expect(page.locator('#stack-code')).toContainText('repositories');
    await expect(page.locator('#stack-filename')).toContainText('helmfile.yaml');

    // Switch to ArgoCD
    await page.locator('.stack-format-btn[data-format="argocd"]').click();
    await expect(page.locator('#stack-code')).toContainText('Application');
    await expect(page.locator('#stack-filename')).toContainText('applications.yaml');
  });

  test('copy button is enabled after selection', async ({ page }) => {
    await page.goto('/stack');
    const copyBtn = page.locator('#stack-copy-btn');
    await expect(copyBtn).toBeDisabled();
    await page.locator('.stack-chart-item').first().click();
    await expect(copyBtn).toBeEnabled();
  });

  test('search filter hides non-matching charts', async ({ page }) => {
    await page.goto('/stack');
    const searchInput = page.locator('#stack-search');
    await searchInput.fill('postgresql');

    const visibleItems = page.locator('.stack-chart-item:visible');
    expect(await visibleItems.count()).toBeGreaterThanOrEqual(1);
    expect(await visibleItems.count()).toBeLessThan(10);
  });

  test('does not scroll past footer when clicking charts', async ({ page }) => {
    await page.goto('/stack');
    const chartList = page.locator('#stack-chart-list');
    await chartList.evaluate((el) => (el.scrollTop = el.scrollHeight));
    await page.waitForTimeout(200);

    await page.locator('.stack-chart-item').last().click({ force: true });
    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    expect(scrollY).toBeLessThanOrEqual(bodyHeight - viewportHeight + 5);
  });
});

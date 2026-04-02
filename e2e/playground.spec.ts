import { test, expect } from '@playwright/test';

test.describe('Playground', () => {
  test('renders chart list and config panel', async ({ page }) => {
    await page.goto('/playground');
    await expect(page).toHaveTitle(/Playground/i);
    const chartBtns = page.locator('.playground-chart-btn');
    expect(await chartBtns.count()).toBeGreaterThan(10);
    await expect(page.locator('#playground-empty')).toBeVisible();
  });

  test('selecting a chart shows config controls', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    await expect(page.locator('#playground-fields')).toBeVisible();
    await expect(page.locator('#playground-chart-title')).toContainText('PostgreSQL');
    await expect(page.locator('#playground-code')).toContainText('helm install postgresql');
  });

  test('changing values updates command output', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Change storage size
    const storageInput = page.locator('input[data-field-key="persistence.size"]');
    await storageInput.clear();
    await storageInput.fill('20Gi');

    const code = page.locator('#playground-code');
    await expect(code).toContainText('persistence.size=20Gi');
  });

  test('values.yaml output mode works', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Change a value first
    const storageInput = page.locator('input[data-field-key="persistence.size"]');
    await storageInput.clear();
    await storageInput.fill('20Gi');

    // Switch to values.yaml output
    await page.locator('.playground-output-btn[data-output="values"]').click();
    await expect(page.locator('#playground-filename')).toContainText('values.yaml');
    await expect(page.locator('#playground-code')).toContainText('persistence');
  });

  test('scenario buttons apply values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Click Production scenario
    const prodBtn = page.locator('.playground-scenario-btn:has-text("Production")');
    if ((await prodBtn.count()) > 0) {
      await prodBtn.click();
      const code = page.locator('#playground-code');
      await expect(code).toContainText('replicaCount');
    }
  });

  test('copy button is enabled after selection', async ({ page }) => {
    await page.goto('/playground');
    const copyBtn = page.locator('#playground-copy');
    await expect(copyBtn).toBeDisabled();
    await page.locator('.playground-chart-btn').first().click();
    await expect(copyBtn).toBeEnabled();
  });

  test('share button is enabled after selection', async ({ page }) => {
    await page.goto('/playground');
    const shareBtn = page.locator('#playground-share');
    await expect(shareBtn).toBeDisabled();
    await page.locator('.playground-chart-btn[data-slug="redis"]').click();
    await expect(shareBtn).toBeEnabled();
  });

  test('URL state updates with chart selection', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="redis"]').click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('chart=redis');
  });

  test('loads state from URL params', async ({ page }) => {
    await page.goto('/playground?chart=postgresql&persistence.size=50Gi');
    await expect(page.locator('#playground-chart-title')).toContainText('PostgreSQL');
    await expect(page.locator('#playground-code')).toContainText('persistence.size=50Gi');
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/playground');
    const searchInput = page.locator('#playground-search');
    await searchInput.fill('redis');

    const visibleBtns = page.locator('.playground-chart-btn:visible');
    expect(await visibleBtns.count()).toBeGreaterThanOrEqual(1);
    expect(await visibleBtns.count()).toBeLessThan(10);
  });

  test('diff view shows changed values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Initially no changes
    await expect(page.locator('#playground-diff')).toBeHidden();

    // Change a value
    const storageInput = page.locator('input[data-field-key="persistence.size"]');
    await storageInput.clear();
    await storageInput.fill('20Gi');

    await expect(page.locator('#playground-diff')).toBeVisible();
    await expect(page.locator('#playground-diff-count')).toContainText('1');
  });

  test('collapsible sections expand on toggle click', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Backup section should be collapsed — child fields hidden
    const backupFields = page.locator('[data-group-fields="S3 Backup"]');
    await expect(backupFields).toHaveCSS('max-height', '0px');

    // Click the section toggle to expand
    await page.locator('[data-section-toggle="S3 Backup"]').click();
    await page.waitForTimeout(300);

    // Child fields should now be visible
    await expect(page.locator('input[data-field-key="backup.schedule"]')).toBeVisible();
    await expect(page.locator('input[data-field-key="backup.s3.bucket"]')).toBeVisible();

    // Output should include backup.enabled=true
    await expect(page.locator('#playground-code')).toContainText('backup.enabled=true');
  });

  test('collapsible sections collapse and reset values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Expand resources
    await page.locator('[data-section-toggle="Resources"]').click();
    await page.waitForTimeout(300);

    // Change CPU request
    const cpuInput = page.locator('input[data-field-key="resources.requests.cpu"]');
    await cpuInput.clear();
    await cpuInput.fill('500m');
    await expect(page.locator('#playground-code')).toContainText('resources.requests.cpu=500m');

    // Collapse resources — values should reset
    await page.locator('[data-section-toggle="Resources"]').click();
    await page.waitForTimeout(300);

    // Output should no longer contain resources
    await expect(page.locator('#playground-code')).not.toContainText('resources.requests.cpu');
  });

  test('scenario auto-expands collapsible sections', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Click Production scenario
    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    await page.waitForTimeout(300);

    // Backup and Resources sections should auto-expand
    await expect(page.locator('input[data-field-key="backup.schedule"]')).toBeVisible();
    await expect(page.locator('input[data-field-key="resources.requests.cpu"]')).toBeVisible();

    // Output should contain backup and resources values
    await expect(page.locator('#playground-code')).toContainText('backup.enabled=true');
  });
});

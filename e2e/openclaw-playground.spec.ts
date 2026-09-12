// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="openclaw"]').click();
});

test('OpenClaw keeps optional telemetry and backup disabled', async ({ page }) => {
  const output = page.locator('#playground-code');
  await expect(output).toContainText('openclaw');
  await expect(output).not.toContainText('backup.enabled=true');
  await expect(output).not.toContainText('metrics.enabled=true');
  await expect(output).not.toContainText('dangerouslyDisableDeviceAuth');
});

test('provider and gateway identity use explicit Secrets', async ({ page }) => {
  await page.locator('input[data-field-key="credentials.existingSecret"]').fill('provider');
  await page.locator('input[data-field-key="auth.existingSecret"]').fill('gateway');
  await expect(page.locator('#playground-code')).toContainText('credentials.existingSecret=provider');
  await expect(page.locator('#playground-code')).toContainText('auth.existingSecret=gateway');
});

test('S3 activation emits the required bucket and Secret', async ({ page }) => {
  await page.locator('[data-section-toggle="Verified S3 backups"]').click();
  await page.locator('input[data-field-key="backup.s3.bucket"]').fill('agent-backups');
  await page.locator('input[data-field-key="backup.s3.existingSecret"]').fill('agent-s3');
  await expect(page.locator('#playground-code')).toContainText('backup.enabled=true');
  await expect(page.locator('#playground-code')).toContainText('backup.s3.bucket=agent-backups');
});

test('documentation, values and official icon are available on mobile', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/charts/openclaw');
  await expect(page.getByRole('heading', { name: 'OpenClaw', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Values reference', exact: true })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, page: document.body.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
  const icon = await request.get('/icons/charts/openclaw.png');
  expect(icon.status()).toBe(200);
  expect((await icon.body()).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
});

// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="hermes-agent"]').click();
});

test('Hermes keeps privileged optional features disabled initially', async ({ page }) => {
  const output = page.locator('#playground-code');
  await expect(output).toContainText('hermes-agent');
  await expect(output).not.toContainText('dashboard.enabled=true');
  await expect(output).not.toContainText('backup.enabled=true');
  await expect(output).not.toContainText('metrics.enabled=true');
});

test('dashboard activation selects editable configuration and separate identity', async ({ page }) => {
  await page.locator('[data-section-toggle="Administrative dashboard"]').click();
  await page.locator('input[data-field-key="dashboard.existingSecret"]').fill('hermes-admin');
  const output = page.locator('#playground-code');
  await expect(output).toContainText('dashboard.enabled=true');
  await expect(output).toContainText('config.policy=seed');
  await expect(output).toContainText('dashboard.existingSecret=hermes-admin');
});

test('custom provider configuration emits an explicit credential environment reference', async ({ page }) => {
  await page.locator('input[data-field-key="agent.provider"]').fill('custom:internal');
  await page.locator('input[data-field-key="agent.baseUrl"]').fill('https://inference.example.com/v1');
  await page.locator('input[data-field-key="agent.apiKeyEnv"]').fill('HERMES_INFERENCE_KEY');
  await page.locator('input[data-field-key="credentials.existingSecret"]').fill('hermes-provider');
  const output = page.locator('#playground-code');
  await expect(output).toContainText('agent.provider=custom:internal');
  await expect(output).toContainText('agent.apiKeyEnv=HERMES_INFERENCE_KEY');
  await expect(output).toContainText('credentials.existingSecret=hermes-provider');
});

test('S3 backup activation keeps bucket and credentials explicit', async ({ page }) => {
  await page.locator('[data-section-toggle="Verified S3 backups"]').click();
  await page.locator('input[data-field-key="backup.s3.bucket"]').fill('hermes-backups');
  await page.locator('input[data-field-key="backup.s3.existingSecret"]').fill('hermes-s3');
  const output = page.locator('#playground-code');
  await expect(output).toContainText('backup.enabled=true');
  await expect(output).toContainText('backup.s3.bucket=hermes-backups');
  await expect(output).toContainText('backup.s3.existingSecret=hermes-s3');
});

test('Hermes documentation and official icon are available', async ({ page, request }) => {
  await page.goto('/docs/charts/hermes-agent');
  await expect(page.getByRole('heading', { name: 'Hermes Agent', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Values reference', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Backup and restore', exact: true })).toBeVisible();
  const icon = await request.get('/icons/charts/hermes-agent.png');
  expect(icon.status()).toBe(200);
  expect(icon.headers()['content-type']).toContain('image/png');
  expect((await icon.body()).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
});

test('wide values remain inside the mobile documentation layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const slug of ['hermes-agent', 'mssql']) {
    await page.goto(`/docs/charts/${slug}`);
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, page: document.body.scrollWidth }));
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

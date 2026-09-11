// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="mssql"]').click();
});

test('SQL Server requires deliberate license consent', async ({ page }) => {
  const output = page.locator('#playground-code');
  await expect(output).not.toContainText('license.acceptEULA=true');
  await page.locator('button[data-field-key="license.acceptEULA"]').click();
  await expect(output).toContainText('license.acceptEULA=true');
  await page.locator('button[data-field-key="license.acceptEULA"]').click();
  await expect(output).not.toContainText('license.acceptEULA=true');
});

test('edition choices select a compatible engine without accepting its license', async ({ page }) => {
  const edition = page.locator('select[data-field-key="sql.edition"]');
  const version = page.locator('select[data-field-key="image.tag"]');
  const output = page.locator('#playground-code');
  await edition.selectOption('Web');
  await expect(version).toHaveValue(/^2022-CU26/);
  await expect(output).toContainText('sql.edition=Web');
  await edition.selectOption('StandardDeveloper');
  await expect(version).toHaveValue(/^2025-CU8/);
  await expect(output).toContainText('sql.edition=StandardDeveloper');
  await version.selectOption({ index: 1 });
  await expect(edition).toHaveValue('Express');
  await edition.selectOption('ProductKey');
  await expect(output).toContainText('license.existingSecret=sql-server-license');
  await expect(output).not.toContainText('license.acceptEULA=true');
});

test('S3 activation includes a database, credential reference and explicit network destination', async ({ page }) => {
  await page.locator('[data-section-toggle="S3 full backups"]').click();
  const output = page.locator('#playground-code');
  await expect(output).toContainText('backup.enabled=true');
  await expect(output).toContainText('backup.s3.bucket=sql-server-backups');
  await expect(output).toContainText('backup.s3.existingSecret=sql-server-backup-s3');
  await expect(output).toContainText('backup.egress[0].to[0].ipBlock.cidr=203.0.113.0/24');
  await expect(output).toContainText('initdb.databases[0].existingSecret=application-db');
  await expect(output).not.toContainText('license.acceptEULA=true');
});

test('SQL Server documentation and canonical icon are published by the build', async ({ page, request }) => {
  await page.goto('/docs/charts/mssql');
  await expect(page.getByRole('heading', { name: 'Microsoft SQL Server', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Complete values reference', exact: true })).toBeVisible();
  const response = await request.get('/icons/charts/mssql.png');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  expect((await response.body()).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
});

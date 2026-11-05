// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="mysql"]').click();
});

test('MySQL Pod Identity backup controls emit the chart contract', async ({ page }) => {
  await page.locator('[data-section-toggle="S3 Backup"]').click();
  await page.locator('input[data-field-key="backup.s3.bucket"]').fill('mysql-backups');
  await page.locator('input[data-field-key="backup.s3.region"]').fill('us-east-1');
  await page.locator('button[data-field-key="backup.s3.credentialsFromPodIdentity"]').click();

  const output = page.locator('#playground-code');
  await expect(output).toContainText('backup.enabled=true');
  await expect(output).toContainText('backup.s3.bucket=mysql-backups');
  await expect(output).toContainText('backup.s3.region=us-east-1');
  await expect(output).toContainText('backup.s3.credentialsFromPodIdentity=true');
  await expect(output).toContainText('backup.serviceAccount.create=true');
});

test('Gitea does not expose MySQL Pod Identity controls', async ({ page }) => {
  await page.locator('.playground-chart-btn[data-slug="gitea"]').click();
  await page.locator('[data-section-toggle="S3 Backup"]').click();
  await expect(page.locator('[data-field-key="backup.s3.credentialsFromPodIdentity"]')).toHaveCount(0);
  await expect(page.locator('[data-field-key="backup.serviceAccount.create"]')).toHaveCount(0);
});

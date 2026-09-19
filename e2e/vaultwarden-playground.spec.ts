// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="vaultwarden"]').click();
  await page.locator('[data-section-toggle="S3 Backup"]').click();
});

test('Vaultwarden private CA and skipped TLS verification remain mutually exclusive', async ({ page }) => {
  const caSecret = page.locator('input[data-field-key="backup.s3.caSecret"]');
  const insecure = page.locator('button[data-field-key="backup.s3.insecureSkipVerify"]');
  const output = page.locator('#playground-code');

  await caSecret.fill('vaultwarden-s3-ca');
  await expect(output).toContainText('backup.s3.caSecret=vaultwarden-s3-ca');

  await insecure.click();
  await expect(caSecret).toHaveValue('');
  await expect(output).toContainText('backup.s3.insecureSkipVerify=true');
  await expect(output).not.toContainText('backup.s3.caSecret=');

  await caSecret.fill('vaultwarden-s3-ca');
  await expect(output).toContainText('backup.s3.caSecret=vaultwarden-s3-ca');
  await expect(output).not.toContainText('backup.s3.insecureSkipVerify=true');
});

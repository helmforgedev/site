import { test, expect } from '@playwright/test';

test('Dawarich preserves private identity and activates native monitoring dependencies', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="dawarich"]').click();
  await page.locator('input[data-field-key="bootstrap.existingSecret"]').fill('locations-administrator');
  await page.locator('input[data-field-key="identity.existingSecret"]').fill('locations-identity');
  await page.locator('button[data-field-key="metrics.serviceMonitor.enabled"]').click();
  const output = page.locator('#playground-code');
  await expect(output).toContainText('bootstrap.existingSecret=locations-administrator');
  await expect(output).toContainText('identity.existingSecret=locations-identity');
  await expect(output).toContainText('metrics.enabled=true');
  await expect(output).toContainText('metrics.serviceMonitor.enabled=true');
  await page.locator('button[data-field-key="metrics.enabled"]').click();
  await expect(output).not.toContainText('metrics.serviceMonitor.enabled=true');
});

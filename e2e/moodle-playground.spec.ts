// SPDX-License-Identifier: Apache-2.0
import { expect, test } from '@playwright/test';

test('Moodle emits independent web and metrics listeners', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="moodle"]').click();

  const listener = page.locator('input[data-field-key="containerPorts.http"]');
  const service = page.locator('input[data-field-key="service.port"]');
  await expect(listener).toHaveValue('8080');
  await expect(service).toHaveValue('80');
  await listener.fill('18080');
  await service.fill('18081');

  await page.locator('button[data-section-toggle="Application metrics"]').click();
  const metrics = page.locator('input[data-field-key="metrics.port"]');
  await expect(metrics).toHaveValue('9090');
  await metrics.fill('19090');
  const serviceMonitor = page.locator('button[data-field-key="metrics.serviceMonitor.enabled"]');
  await expect(serviceMonitor).toBeVisible();
  await serviceMonitor.click();

  const code = page.locator('#playground-code');
  await expect(code).toContainText('containerPorts.http=18080');
  await expect(code).toContainText('service.port=18081');
  await expect(code).toContainText('metrics.enabled=true');
  await expect(code).toContainText('metrics.port=19090');
  await expect(code).toContainText('metrics.serviceMonitor.enabled=true');
});

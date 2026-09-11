// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test('embedding dual-stack configuration includes the required IPv6 listeners', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="text-embeddings-inference"]').click();
  await page.locator('button[data-field-key="proxy.ipv6"]').click();
  await page.locator('select[data-field-key="service.ipFamilyPolicy"]').selectOption('RequireDualStack');
  await expect(page.locator('#playground-code')).toContainText('proxy.ipv6=true');
  await expect(page.locator('#playground-code')).toContainText('service.ipFamilyPolicy=RequireDualStack');
});

test('embedding deployment preserves immutable model identity and secret references', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="text-embeddings-inference"]').click();
  await page.locator('input[data-field-key="auth.existingSecret"]').fill('production-embeddings-api');
  await page.locator('input[data-field-key="model.servedName"]').fill('corpus-v2');
  const output = page.locator('#playground-code');
  await expect(output).toContainText('auth.existingSecret=production-embeddings-api');
  await expect(output).toContainText('model.servedName=corpus-v2');
  await expect(page.locator('input[data-field-key="model.revision"]')).toHaveValue(
    '5c38ec7c405ec4b44b94cc5a9bb96e735b38267a',
  );
});

test('embedding deployment exports admission budgets and independent replicas', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="text-embeddings-inference"]').click();
  for (const [key, value] of Object.entries({
    'inference.maxConcurrentRequests': '32',
    'inference.maxClientBatchSize': '8',
    replicaCount: '2',
  })) {
    await page.locator(`input[data-field-key="${key}"]`).fill(value);
  }
  const output = page.locator('#playground-code');
  await expect(output).toContainText('inference.maxConcurrentRequests=32');
  await expect(output).toContainText('inference.maxClientBatchSize=8');
  await expect(output).toContainText('replicaCount=2');
});

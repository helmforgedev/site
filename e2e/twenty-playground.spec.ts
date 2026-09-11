import { test, expect } from '@playwright/test';

test('Twenty preserves native ownership and dependency credential references', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="twenty"]').click();
  await page.locator('input[data-field-key="bootstrap.existingSecret"]').fill('crm-owner');
  await page.locator('input[data-field-key="identity.existingSecret"]').fill('crm-identity');
  await page.locator('input[data-field-key="postgresql.auth.existingSecret"]').fill('crm-database');
  await page.locator('input[data-field-key="redis.auth.existingSecret"]').fill('crm-queue');
  const output = page.locator('#playground-code');
  await expect(output).toContainText('bootstrap.existingSecret=crm-owner');
  await expect(output).toContainText('identity.existingSecret=crm-identity');
  await expect(output).toContainText('postgresql.auth.existingSecret=crm-database');
  await expect(output).toContainText('redis.auth.existingSecret=crm-queue');
});

test('Twenty exports external TLS dependencies, private files, mail and native monitoring', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="twenty"]').click();
  for (const key of [
    'postgresql.enabled',
    'redis.enabled',
    'smtp.enabled',
    'metrics.enabled',
    'metrics.serviceMonitor.enabled',
  ]) {
    await page.locator(`button[data-field-key="${key}"]`).click();
  }
  for (const [key, value] of Object.entries({
    'database.host': 'postgres.example.test',
    'database.passwordSecret': 'crm-postgres',
    'database.tls.caSecret': 'postgres-ca',
    'cache.host': 'redis.example.test',
    'cache.passwordSecret': 'crm-redis',
    'cache.tls.caSecret': 'redis-ca',
    'storage.s3.bucket': 'crm-files',
    'storage.s3.existingSecret': 'crm-s3',
    'smtp.host': 'smtp.example.test',
    'smtp.from': 'crm@example.test',
    'smtp.username': 'crm-mail',
    'smtp.existingSecret': 'crm-smtp',
  })) {
    await page.locator(`input[data-field-key="${key}"]`).fill(value);
  }
  await page.locator('select[data-field-key="storage.driver"]').selectOption('s3');
  const output = page.locator('#playground-code');
  for (const value of [
    'postgresql.enabled=false',
    'redis.enabled=false',
    'database.tls.caSecret=postgres-ca',
    'cache.tls.caSecret=redis-ca',
    'storage.driver=s3',
    'storage.s3.existingSecret=crm-s3',
    'smtp.enabled=true',
    'smtp.existingSecret=crm-smtp',
    'metrics.serviceMonitor.enabled=true',
  ]) {
    await expect(output).toContainText(value);
  }
});

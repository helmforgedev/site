import { test, expect } from '@playwright/test';

test('Reactive Resume preserves external database and retained identity references', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="reactive-resume"]').click();
  await page.locator('input[data-field-key="bootstrap.existingSecret"]').fill('resume-owner');
  await page.locator('input[data-field-key="identity.existingSecret"]').fill('resume-identity');
  await page.locator('button[data-field-key="postgresql.enabled"]').click();
  await page.locator('input[data-field-key="database.host"]').fill('postgres.example.test');
  await page.locator('input[data-field-key="database.passwordSecret"]').fill('resume-database');
  const output = page.locator('#playground-code');
  await expect(output).toContainText('bootstrap.existingSecret=resume-owner');
  await expect(output).toContainText('identity.existingSecret=resume-identity');
  await expect(output).toContainText('postgresql.enabled=false');
  await expect(output).toContainText('database.host=postgres.example.test');
  await expect(output).toContainText('database.passwordSecret=resume-database');
});

test('Reactive Resume exports linked-user OAuth2 and private integration trust', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="reactive-resume"]').click();
  for (const key of ['smtp.enabled', 'oauth.enabled', 'storage.s3.forcePathStyle']) {
    await page.locator(`button[data-field-key="${key}"]`).click();
  }
  for (const [key, value] of Object.entries({
    'smtp.host': 'smtp.example.test',
    'smtp.username': 'resume-mail',
    'smtp.from': 'resume@example.test',
    'smtp.existingSecret': 'resume-smtp',
    'smtp.tls.caSecret': 'mail-ca',
    'oauth.clientId': 'resume-web',
    'oauth.existingSecret': 'resume-oauth',
    'oauth.authorizationUrl': 'https://id.example.test/authorize',
    'oauth.tokenUrl': 'https://id.example.test/token',
    'oauth.userInfoUrl': 'https://id.example.test/userinfo',
    'oauth.caSecret': 'id-ca',
    'storage.s3.bucket': 'resume-pictures',
    'storage.s3.existingSecret': 'resume-s3',
    'storage.s3.caSecret': 'bucket-ca',
  })) {
    await page.locator(`input[data-field-key="${key}"]`).fill(value);
  }
  await page.locator('select[data-field-key="storage.driver"]').selectOption('s3');
  const output = page.locator('#playground-code');
  for (const value of [
    'smtp.enabled=true',
    'smtp.tls.caSecret=mail-ca',
    'oauth.enabled=true',
    'oauth.existingSecret=resume-oauth',
    'oauth.caSecret=id-ca',
    'storage.driver=s3',
    'storage.s3.forcePathStyle=true',
    'storage.s3.caSecret=bucket-ca',
  ]) {
    await expect(output).toContainText(value);
  }
});

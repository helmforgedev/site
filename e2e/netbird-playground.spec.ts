import { test, expect } from '@playwright/test';

test('NetBird exposes process ports and production safeguards', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="netbird"]').click();

  await expect(page.locator('input[data-field-key="server.image.tag"]')).toHaveValue('0.81.3');
  await page.locator('input[data-field-key="server.containerPorts.http"]').fill('8080');
  await page.locator('input[data-field-key="server.containerPorts.metrics"]').fill('9191');
  await page.locator('input[data-field-key="dashboard.containerPorts.http"]').fill('8088');

  await page.locator('[data-section-toggle="Operations"]').click();
  await page.locator('button[data-field-key="pdb.enabled"]').click();
  await page.locator('input[data-field-key="networkPolicy.stunIngressFrom[0].ipBlock.cidr"]').fill('203.0.113.0/24');

  const output = page.locator('#playground-code');
  await expect(output).toContainText('server.containerPorts.http=8080');
  await expect(output).toContainText('server.containerPorts.metrics=9191');
  await expect(output).toContainText('dashboard.containerPorts.http=8088');
  await expect(output).toContainText('pdb.enabled=true');
  await expect(output).toContainText('networkPolicy.stunIngressFrom[0].ipBlock.cidr=203.0.113.0/24');
});

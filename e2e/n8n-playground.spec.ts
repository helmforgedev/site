// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test('n8n exposes extra environment variables for task runner sidecars', async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="n8n"]').click();
  await page.locator('[data-section-toggle="Task Runners"]').click();
  await page.locator('input[data-field-key="taskRunners.extraEnv[0].name"]').fill('GENERIC_TIMEZONE');
  await page.locator('input[data-field-key="taskRunners.extraEnv[0].value"]').fill('UTC');

  const output = page.locator('#playground-code');
  await expect(output).toContainText('taskRunners.extraEnv[0].name=GENERIC_TIMEZONE');
  await expect(output).toContainText('taskRunners.extraEnv[0].value=UTC');
});

// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.describe('Values Studio v2.0', () => {
  test('renders chart selection, schema controls, and YAML output', async ({ page }) => {
    await page.goto('/playground');

    await expect(page).toHaveTitle(/Playground|Values Studio/i);

    // Chart list should be populated
    const chartList = page.locator('#chart-list, #playground-chart-list, [data-chart-item]');
    expect(await chartList.count()).toBeGreaterThanOrEqual(1);

    // Command/YAML output preview should be visible
    const outputPanel = page.locator('#yaml-output, #code-output, #values-output, pre code');
    await expect(outputPanel.first()).toBeVisible();

    // Copy button should be present
    const copyBtn = page.locator('#copy-btn, #copy-command, button:has-text("Copy")');
    await expect(copyBtn.first()).toBeVisible();
  });

  test('switches charts and updates configuration preview', async ({ page }) => {
    await page.goto('/playground?chart=redis');

    // Should load redis configuration
    await expect(page.locator('body')).toContainText('redis');

    // Values preview should update
    const code = page.locator('pre code, #yaml-output, #code-output');
    await expect(code.first()).toContainText('redis');
  });

  test('loads mysql via direct slug route and renders configuration controls', async ({ page }) => {
    await page.goto('/playground/mysql');

    // Should redirect to /playground?chart=mysql
    await expect(page).toHaveURL(/\/playground\?chart=mysql/);

    // Configuration panel should be visible with Mysql title
    await expect(page.locator('#playground-fields')).toBeVisible();
    await expect(page.locator('#playground-chart-title')).toContainText('Mysql');

    // Values preview should update with mysql install command
    const code = page.locator('#playground-code');
    await expect(code).toContainText('helm install mysql');
  });
});

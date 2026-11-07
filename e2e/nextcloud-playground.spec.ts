// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="nextcloud"]').click();
});

test('IRSA role annotation is preserved in Helm and values output', async ({ page }) => {
  const roleArn = 'arn:aws:iam::123456789012:role/nextcloud-backup';
  const roleInput = page.getByText('IRSA role ARN', { exact: true }).locator('../..').locator('input');

  await roleInput.fill(roleArn);

  const output = page.locator('#playground-code');
  await expect(output).toContainText(
    String.raw`--set 'backup.serviceAccount.annotations.eks\.amazonaws\.com/role-arn'=${roleArn}`,
  );

  await page.locator('.playground-output-btn[data-output="values"]').click();
  await expect(output).toContainText(`eks.amazonaws.com/role-arn: ${roleArn}`);
});

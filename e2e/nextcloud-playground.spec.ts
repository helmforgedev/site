// SPDX-License-Identifier: Apache-2.0
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/playground');
  await page.locator('.playground-chart-btn[data-slug="nextcloud"]').click();
});

test('IRSA role annotation is preserved in Helm and values output', async ({ page }) => {
  const roleArn = 'arn:aws:iam::123456789012:role/nextcloud-backup';
  const backupGroup = page.locator('.playground-group[data-group-name="Coordinated backup"]');
  const roleInput = backupGroup.getByText('IRSA role ARN', { exact: true }).locator('../..').locator('input');

  await roleInput.fill(roleArn);

  const output = page.locator('#playground-code');
  await expect(output).toContainText(
    String.raw`--set 'backup.serviceAccount.annotations.eks\.amazonaws\.com/role-arn'=${roleArn}`,
  );

  await page.locator('.playground-output-btn[data-output="values"]').click();
  await expect(output).toContainText(`eks.amazonaws.com/role-arn: ${roleArn}`);
});

test('primary object storage emits S3, Secret and workload identity values', async ({ page }) => {
  const group = page.locator('.playground-group[data-group-name="Primary object storage"]');
  const roleArn = 'arn:aws:iam::123456789012:role/nextcloud-primary-s3';

  await group.locator('button[data-field-key="primaryObjectStore.enabled"]').click();
  await group.locator('input[data-field-key="primaryObjectStore.endpoint"]').fill('https://s3.wasabisys.com');
  await group.locator('input[data-field-key="primaryObjectStore.region"]').fill('us-east-1');
  await group.locator('input[data-field-key="primaryObjectStore.bucket"]').fill('nextcloud-data');
  await group.locator('button[data-field-key="primaryObjectStore.credentialsFromPodIdentity"]').click();
  await group.getByText('IRSA role ARN', { exact: true }).locator('../..').locator('input').fill(roleArn);

  const output = page.locator('#playground-code');
  await expect(output).toContainText('--set primaryObjectStore.enabled=true');
  await expect(output).toContainText('--set primaryObjectStore.endpoint=https://s3.wasabisys.com');
  await expect(output).toContainText('--set primaryObjectStore.bucket=nextcloud-data');
  await expect(output).toContainText('--set primaryObjectStore.credentialsFromPodIdentity=true');
  await expect(output).toContainText(
    String.raw`--set 'primaryObjectStore.serviceAccount.annotations.eks\.amazonaws\.com/role-arn'=${roleArn}`,
  );
  await expect(output).not.toContainText('acknowledgePreviousConfigurationHash');

  await page.locator('.playground-output-btn[data-output="values"]').click();
  await expect(output).toContainText('primaryObjectStore:');
  await expect(output).toContainText('endpoint: https://s3.wasabisys.com');
  await expect(output).toContainText('bucket: nextcloud-data');
  await expect(output).toContainText(`eks.amazonaws.com/role-arn: ${roleArn}`);
});

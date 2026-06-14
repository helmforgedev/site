import { test, expect } from '@playwright/test';

test.describe('Playground', () => {
  test('renders chart list and config panel', async ({ page }) => {
    await page.goto('/playground');
    await expect(page).toHaveTitle(/Playground/i);
    const chartBtns = page.locator('.playground-chart-btn');
    expect(await chartBtns.count()).toBeGreaterThan(10);
    await expect(page.locator('#playground-empty')).toBeVisible();
  });

  test('selecting a chart shows config controls', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    await expect(page.locator('#playground-fields')).toBeVisible();
    await expect(page.locator('#playground-chart-title')).toContainText('PostgreSQL');
    await expect(page.locator('#playground-code')).toContainText('helm install postgresql');
  });

  test('changing values updates command output', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Change storage size
    const storageInput = page.locator('input[data-field-key="standalone.persistence.size"]');
    await storageInput.clear();
    await storageInput.fill('20Gi');

    const code = page.locator('#playground-code');
    await expect(code).toContainText('standalone.persistence.size=20Gi');
  });

  test('values.yaml output mode works', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Change a value first
    const storageInput = page.locator('input[data-field-key="standalone.persistence.size"]');
    await storageInput.clear();
    await storageInput.fill('20Gi');

    // Switch to values.yaml output
    await page.locator('.playground-output-btn[data-output="values"]').click();
    await expect(page.locator('#playground-filename')).toContainText('values.yaml');
    await expect(page.locator('#playground-code')).toContainText('persistence');
  });

  test('helm output escapes comma-separated set values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="phpmyadmin"]').click();

    await page.locator('[data-section-toggle="Multi-Server"]').click();
    await expect(page.locator('#playground-code')).toContainText(
      String.raw`phpmyadmin.hosts=mysql-primary.svc\,mysql-replica.svc`,
    );
    await expect(page.locator('#playground-code')).toContainText(String.raw`phpmyadmin.ports=3306\,3306`);
    await expect(page.locator('#playground-code')).toContainText(String.raw`phpmyadmin.verboses=Primary\,Replica`);
  });

  test('gitea database mode choices stay renderable', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="gitea"]').click();
    await page.locator('[data-section-toggle="Database"]').click();

    const databaseMode = page.locator('select[data-field-key="database.mode"]');
    await expect(databaseMode.locator('option[value="mysql"]')).toHaveCount(0);
    await expect(databaseMode.locator('option[value="postgresql"]')).toHaveCount(1);

    const postgresqlToggle = page.locator('button[data-field-key="postgresql.enabled"]');

    await databaseMode.selectOption('postgresql');
    await expect(page.locator('#playground-code')).toContainText('database.mode=postgresql');
    await expect(page.locator('#playground-code')).toContainText('postgresql.enabled=true');
    await expect(page.locator('#playground-code')).toContainText('postgresql.auth.password=change-me-gitea-postgresql');

    await databaseMode.selectOption('sqlite');
    await expect(page.locator('#playground-code')).toContainText('database.mode=sqlite');
    await expect(page.locator('#playground-code')).not.toContainText('postgresql.enabled=true');
    await expect(page.locator('#playground-code')).not.toContainText('postgresql.auth.password=');

    await postgresqlToggle.click();
    await expect(page.locator('#playground-code')).not.toContainText('database.mode=sqlite');
    await expect(page.locator('#playground-code')).toContainText('database.mode=auto');
    await expect(page.locator('#playground-code')).toContainText('postgresql.enabled=true');
    await expect(page.locator('#playground-code')).toContainText('postgresql.auth.password=change-me-gitea-postgresql');

    await postgresqlToggle.click();
    await databaseMode.selectOption('external');
    await expect(page.locator('#playground-code')).toContainText('database.mode=external');
    await postgresqlToggle.click();
    await expect(page.locator('#playground-code')).not.toContainText('database.mode=external');
    await expect(page.locator('#playground-code')).toContainText('database.mode=auto');
    await expect(page.locator('#playground-code')).toContainText('postgresql.enabled=true');
    await expect(page.locator('#playground-code')).toContainText('postgresql.auth.password=change-me-gitea-postgresql');

    await postgresqlToggle.click();
    await databaseMode.selectOption('postgresql');
    await postgresqlToggle.click();
    await expect(page.locator('#playground-code')).not.toContainText('database.mode=postgresql');
    await expect(page.locator('#playground-code')).not.toContainText('postgresql.enabled=true');
    await expect(page.locator('#playground-code')).not.toContainText('postgresql.auth.password=');

    await page.locator('.playground-chart-btn[data-slug="gitea"]').click();
    await page.locator('button[data-field-key="postgresql.enabled"]').click();
    await expect(page.locator('#playground-code')).toContainText('postgresql.enabled=true');
    await expect(page.locator('#playground-code')).toContainText('postgresql.auth.password=change-me-gitea-postgresql');

    await page.locator('button[data-field-key="postgresql.enabled"]').click();
    await expect(page.locator('#playground-code')).not.toContainText('postgresql.enabled=true');
    await expect(page.locator('#playground-code')).not.toContainText('postgresql.auth.password=');
  });

  test('gitea postgresql toggle clears external database detection fields', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="gitea"]').click();
    await page.locator('.playground-scenario-btn:has-text("External Database")').click();

    const code = page.locator('#playground-code');
    await expect(code).toContainText('database.mode=external');
    await expect(code).toContainText('database.external.host=postgres.database.svc.cluster.local');
    await expect(code).toContainText('database.external.existingSecret=gitea-db-credentials');

    await page.locator('button[data-field-key="postgresql.enabled"]').click();
    await expect(code).not.toContainText('database.mode=external');
    await expect(code).not.toContainText('database.external.host=');
    await expect(code).not.toContainText('database.external.existingSecret=');
    await expect(code).toContainText('postgresql.enabled=true');
    await expect(code).toContainText('postgresql.auth.password=change-me-gitea-postgresql');
  });

  test('scenario buttons apply values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Click Production scenario
    const prodBtn = page.locator('.playground-scenario-btn:has-text("Production")');
    if ((await prodBtn.count()) > 0) {
      await prodBtn.click();
      const code = page.locator('#playground-code');
      await expect(code).toContainText('replication.slots.enabled=true');
    }
  });

  test('activation values refresh already rendered controls', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="listmonk"]').click();

    await page.locator('select[data-field-key="database.mode"]').selectOption('external');
    await expect(page.locator('button[data-field-key="postgresql.enabled"]')).toHaveClass(/bg-border/);
    await expect(page.locator('#playground-code')).toContainText('database.mode=external');
    await expect(page.locator('#playground-code')).toContainText('postgresql.enabled=false');
    await expect(page.locator('#playground-code')).toContainText('database.external.name=listmonk');
    await expect(page.locator('#playground-code')).toContainText('database.external.username=listmonk');

    await page.locator('button[data-field-key="postgresql.enabled"]').click();
    await expect(page.locator('select[data-field-key="database.mode"]')).toHaveValue('auto');
    await expect(page.locator('#playground-code')).not.toContainText('database.mode=external');
    await expect(page.locator('#playground-code')).not.toContainText('postgresql.enabled=false');

    await page.locator('button[data-field-key="postgresql.enabled"]').click();
    await expect(page.locator('select[data-field-key="database.mode"]')).toHaveValue('external');
    await expect(page.locator('#playground-code')).toContainText('database.mode=external');
    await expect(page.locator('#playground-code')).toContainText('postgresql.enabled=false');
    await expect(page.locator('#playground-code')).toContainText('database.external.name=listmonk');

    await page.locator('select[data-field-key="database.mode"]').selectOption('auto');
    await expect(page.locator('button[data-field-key="postgresql.enabled"]')).toHaveClass(/bg-primary/);

    await page.locator('[data-section-toggle="External Database"]').click();
    await page.locator('input[data-field-key="database.external.host"]').fill('postgres.example.com');
    await page.locator('input[data-field-key="database.external.existingSecret"]').fill('listmonk-db');

    await expect(page.locator('select[data-field-key="database.mode"]')).toHaveValue('external');
    await expect(page.locator('button[data-field-key="postgresql.enabled"]')).toHaveClass(/bg-border/);
    await expect(page.locator('#playground-code')).toContainText('database.mode=external');
    await expect(page.locator('#playground-code')).toContainText('postgresql.enabled=false');
    await expect(page.locator('#playground-code')).toContainText('database.external.host=postgres.example.com');
    await expect(page.locator('#playground-code')).toContainText('database.external.existingSecret=listmonk-db');

    await page.locator('select[data-field-key="database.mode"]').selectOption('postgresql');
    await expect(page.locator('button[data-field-key="postgresql.enabled"]')).toHaveClass(/bg-primary/);
    await expect(page.locator('#playground-code')).not.toContainText('database.mode=external');
    await expect(page.locator('#playground-code')).not.toContainText('database.external.');
  });

  test('apache basic auth scenario emits external secrets values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="apache"]').click();

    await page.locator('.playground-scenario-btn:has-text("Basic Auth")').click();
    const code = page.locator('#playground-code');

    await expect(code).toContainText('basicAuth.enabled=true');
    await expect(code).toContainText('basicAuth.existingSecret=apache-basicauth');
    await expect(code).toContainText('externalSecrets.enabled=true');
    await expect(code).toContainText('externalSecrets.secretStoreRef.kind=ClusterSecretStore');
    await expect(code).toContainText('externalSecrets.data[0].remoteRef.key=apache/basicauth');
  });

  test('apache production scenario emits resources and disruption budget values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="apache"]').click();

    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    const code = page.locator('#playground-code');

    await expect(code).toContainText('replicaCount=3');
    await expect(code).toContainText('resources.requests.cpu=100m');
    await expect(code).toContainText('resources.requests.memory=128Mi');
    await expect(code).toContainText('resources.limits.cpu=1');
    await expect(code).toContainText('resources.limits.memory=512Mi');
    await expect(code).toContainText('pdb.enabled=true');
    await expect(code).toContainText('networkPolicy.ingress.enabled=false');
  });

  test('apache optional networking fields remain opt-in', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="apache"]').click();

    await page.locator('[data-section-toggle="Ingress"]').click();
    const code = page.locator('#playground-code');
    await expect(code).not.toContainText('ingress.tls[0].secretName');
    await expect(code).not.toContainText('ingress.ingressClassName');

    await page.locator('[data-section-toggle="Service IP Family"]').click();
    await expect(code).not.toContainText('service.ipFamilyPolicy');
    await expect(code).not.toContainText('service.ipFamilies[0]');

    await page.locator('select[data-field-key="service.ipFamilyPolicy"]').selectOption('SingleStack');
    await page.locator('select[data-field-key="service.ipFamilies[0]"]').selectOption('IPv4');
    await expect(code).toContainText('service.ipFamilyPolicy=SingleStack');
    await expect(code).toContainText('service.ipFamilies[0]=IPv4');
  });

  test('apache expanded sections preserve secure chart defaults', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="apache"]').click();

    await page.locator('[data-section-toggle="Metrics"]').click();
    const code = page.locator('#playground-code');
    await expect(code).toContainText('serverStatus.enabled=true');
    await expect(code).toContainText('serverStatus.require=local');
    await expect(code).not.toContainText('serverStatus.require=all granted');

    await page.locator('[data-section-toggle="Network Policy"]').click();
    await expect(code).toContainText('networkPolicy.ingress.enabled=false');
    await expect(code).toContainText('networkPolicy.egress.allowInternet=true');
    await expect(code).not.toContainText('networkPolicy.egress.allowInternet=false');
  });

  test('ddns-updater ingress emits chart values contract fields', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="ddns-updater"]').click();

    await page.locator('[data-section-toggle="Ingress"]').click();
    const code = page.locator('#playground-code');

    await expect(code).toContainText('ingress.enabled=true');
    await expect(code).toContainText('ingress.hosts[0].host=ddns.example.com');
    await expect(code).toContainText('ingress.hosts[0].paths[0].path=/');
    await expect(code).toContainText('ingress.hosts[0].paths[0].pathType=Prefix');
    await expect(code).not.toContainText('ingress.hostname');
  });


  test('changedetection production scenario emits browser ingress and external secrets values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="changedetection"]').click();

    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    const code = page.locator('#playground-code');

    await expect(code).toContainText('changedetection.baseUrl=https://changes.example.com');
    await expect(code).toContainText('browser.enabled=true');
    await expect(code).toContainText('browser.resources.limits.memory=2Gi');
    await expect(code).toContainText('ingress.enabled=true');
    await expect(code).toContainText('ingress.tls[0].secretName=changedetection-tls');
    await expect(code).toContainText('externalSecrets.enabled=true');
    await expect(code).toContainText('externalSecrets.secretStoreRef.kind=ClusterSecretStore');
    await expect(code).toContainText('externalSecrets.data[0].remoteRef.key=changedetection/app');
  });

  test('cloudflared production scenario emits secret availability and monitoring values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="cloudflared"]').click();

    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    const code = page.locator('#playground-code');

    await expect(code).toContainText('tunnel.quickTunnel.enabled=false');
    await expect(code).toContainText('tunnel.existingSecret=cloudflare-tunnel');
    await expect(code).toContainText('replicaCount=2');
    await expect(code).toContainText('pdb.enabled=true');
    await expect(code).toContainText('metrics.enabled=true');
    await expect(code).toContainText('serviceMonitor.enabled=true');
    await expect(code).toContainText('serviceMonitor.interval=30s');
  });

  test('discount-bandit playground emits chart contract fields', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="discount-bandit"]').click();

    await page.locator('[data-section-toggle="Database"]').click();
    await expect(page.locator('#playground-code')).not.toContainText('database.external.host');
    await expect(page.locator('#playground-code')).not.toContainText('database.external.existingSecret');

    await page.locator('.playground-scenario-btn:has-text("SQLite Dev")').click();
    await expect(page.locator('#playground-code')).toContainText('database.mode=sqlite');
    await expect(page.locator('#playground-code')).toContainText('database.sqlite.enabled=true');
    await expect(page.locator('#playground-code')).not.toContainText('database.external.host');
    await expect(page.locator('#playground-code')).not.toContainText('database.external.existingSecret');

    await page.locator('[data-section-toggle="Resources"]').click();
    await expect(page.locator('#playground-code')).toContainText('resources.requests.cpu=250m');
    await expect(page.locator('#playground-code')).toContainText('resources.limits.cpu=1000m');
    await expect(page.locator('#playground-code')).toContainText(
      'podSecurityContext.seccompProfile.type=RuntimeDefault',
    );
    await expect(page.locator('#playground-code')).toContainText('securityContext.allowPrivilegeEscalation=false');

    await page.locator('.playground-scenario-btn:has-text("External MySQL + ESO")').click();
    await expect(page.locator('#playground-code')).toContainText('database.mode=external');
    await expect(page.locator('#playground-code')).toContainText('database.external.host=mysql.example.internal');
    await expect(page.locator('#playground-code')).toContainText('externalSecrets.database.enabled=true');
    await expect(page.locator('#playground-code')).toContainText(
      'externalSecrets.database.passwordRemoteRef.key=databases/discount-bandit',
    );
    await expect(page.locator('#playground-code')).not.toContainText('database.external.existingSecret');
    await expect(page.locator('#playground-code')).not.toContainText('database.external.password');

    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="discount-bandit"]').click();
    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    await expect(page.locator('#playground-code')).toContainText('gatewayAPI.enabled=true');
    await expect(page.locator('#playground-code')).toContainText(
      String.raw`networkPolicy.ingress.extraFrom[0].namespaceSelector.matchLabels.kubernetes\.io/metadata\.name=gateway-system`,
    );
    await page.locator('.playground-output-btn[data-output="values"]').click();
    await expect(page.locator('#playground-code')).toContainText('kubernetes.io/metadata.name: gateway-system');
    await page.locator('.playground-output-btn[data-output="helm"]').click();
    await expect(page.locator('#playground-code')).toContainText(
      'externalSecrets.app.appKeyRemoteRef.key=apps/discount-bandit',
    );
    await expect(page.locator('#playground-code')).not.toContainText(
      'externalSecrets.app.exchangeRateApiKeyRemoteRef.key',
    );
    await expect(page.locator('#playground-code')).not.toContainText('externalSecrets.database.enabled');
  });

  test('dolibarr playground emits chart contract fields', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="dolibarr"]').click();

    await page.locator('[data-section-toggle="External Secrets"]').click();
    let code = page.locator('#playground-code');
    await expect(code).toContainText('externalSecrets.enabled=true');
    await expect(code).toContainText('admin.existingSecret=dolibarr-admin-credentials');
    await expect(code).toContainText('externalSecrets.data[0].secretKey=admin-password');
    await expect(code).toContainText('admin.existingSecretPasswordKey=admin-password');
    await expect(code).toContainText('externalSecrets.data[0].remoteRef.key=apps/dolibarr');
    await expect(code).toContainText('externalSecrets.data[0].remoteRef.property=admin-password');

    const adminSecretKey = page.locator('input[data-field-key="externalSecrets.data[0].secretKey"]');
    await adminSecretKey.clear();
    await adminSecretKey.fill('custom-admin-password');
    await expect(code).toContainText('externalSecrets.data[0].secretKey=custom-admin-password');
    await expect(code).toContainText('admin.existingSecretPasswordKey=custom-admin-password');

    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    code = page.locator('#playground-code');

    await expect(code).toContainText('dolibarr.siteUrl=https://erp.example.com');
    await expect(code).toContainText('externalSecrets.enabled=true');
    await expect(code).toContainText('admin.existingSecret=dolibarr-admin-secret');
    await expect(code).toContainText('externalSecrets.data[0].secretKey=admin-password');
    await expect(code).toContainText('mysql.standalone.persistence.size=20Gi');
    await expect(code).toContainText('persistence.documents.size=20Gi');
    await expect(code).toContainText('ingress.hosts[0].host=erp.example.com');
    await expect(code).toContainText('backup.enabled=true');
    await expect(code).toContainText('backup.s3.existingSecret=dolibarr-s3-credentials');
    await expect(code).not.toContainText('--set persistence.size=');
    await expect(code).not.toContainText('--set ingress.hostname=');
  });
  test('copy button is enabled after selection', async ({ page }) => {
    await page.goto('/playground');
    const copyBtn = page.locator('#playground-copy');
    await expect(copyBtn).toBeDisabled();
    await page.locator('.playground-chart-btn').first().click();
    await expect(copyBtn).toBeEnabled();
  });

  test('share button is enabled after selection', async ({ page }) => {
    await page.goto('/playground');
    const shareBtn = page.locator('#playground-share');
    await expect(shareBtn).toBeDisabled();
    await page.locator('.playground-chart-btn[data-slug="redis"]').click();
    await expect(shareBtn).toBeEnabled();
  });

  test('URL state updates with chart selection', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="redis"]').click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('chart=redis');
  });

  test('loads state from URL params', async ({ page }) => {
    await page.goto('/playground?chart=postgresql&standalone.persistence.size=50Gi');
    await expect(page.locator('#playground-chart-title')).toContainText('PostgreSQL');
    await expect(page.locator('#playground-code')).toContainText('standalone.persistence.size=50Gi');
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/playground');
    const searchInput = page.locator('#playground-search');
    await searchInput.fill('redis');

    const visibleBtns = page.locator('.playground-chart-btn:visible');
    expect(await visibleBtns.count()).toBeGreaterThanOrEqual(1);
    expect(await visibleBtns.count()).toBeLessThan(10);
  });

  test('diff view shows changed values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Initially no changes
    await expect(page.locator('#playground-diff')).toBeHidden();

    // Change a value
    const storageInput = page.locator('input[data-field-key="standalone.persistence.size"]');
    await storageInput.clear();
    await storageInput.fill('20Gi');

    await expect(page.locator('#playground-diff')).toBeVisible();
    await expect(page.locator('#playground-diff-count')).toContainText('1');
  });

  test('collapsible sections expand on toggle click', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Backup section should be collapsed — child fields hidden
    const backupFields = page.locator('[data-group-fields="S3 Backup"]');
    await expect(backupFields).toHaveCSS('max-height', '0px');

    // Click the section toggle to expand
    await page.locator('[data-section-toggle="S3 Backup"]').click();
    await page.waitForTimeout(300);

    // Child fields should now be visible
    await expect(page.locator('input[data-field-key="backup.schedule"]')).toBeVisible();
    await expect(page.locator('input[data-field-key="backup.s3.bucket"]')).toBeVisible();

    // Output should include backup.enabled=true
    await expect(page.locator('#playground-code')).toContainText('backup.enabled=true');
  });

  test('collapsible sections collapse and reset values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Expand production security
    await page.locator('[data-section-toggle="Production Security"]').click();
    await page.waitForTimeout(300);

    // Enable replication slots
    const slotsToggle = page.locator('button[data-field-key="replication.slots.enabled"]');
    await slotsToggle.click();
    await expect(page.locator('#playground-code')).toContainText('replication.slots.enabled=true');

    // Collapse production security - values should reset
    await page.locator('[data-section-toggle="Production Security"]').click();
    await page.waitForTimeout(300);

    // Output should no longer contain replication slots
    await expect(page.locator('#playground-code')).not.toContainText('replication.slots.enabled');
  });

  test('scenario auto-expands collapsible sections', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    // Click Production scenario
    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    await page.waitForTimeout(300);

    // Backup and production security sections should auto-expand
    await expect(page.locator('input[data-field-key="backup.schedule"]')).toBeVisible();
    await expect(page.locator('button[data-field-key="replication.slots.enabled"]')).toBeVisible();

    // Output should contain backup and resources values
    await expect(page.locator('#playground-code')).toContainText('backup.enabled=true');
  });

  test('scenario-only values are removed when their section is collapsed', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="liwan"]').click();

    await page.locator('.playground-scenario-btn:has-text("Dual Stack")').click();
    await expect(page.locator('#playground-code')).toContainText('service.ipFamilies[0]=IPv4');
    await expect(page.locator('#playground-code')).toContainText('service.ipFamilies[1]=IPv6');

    await page.locator('[data-section-toggle="Service IP Family"]').click();
    await expect(page.locator('#playground-code')).not.toContainText('service.ipFamilies[1]');
  });

  test('scenario-only array values do not duplicate edited primary values', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="liwan"]').click();

    await page.locator('.playground-scenario-btn:has-text("Dual Stack")').click();
    await page.locator('select[data-field-key="service.ipFamilies[0]"]').selectOption('IPv6');

    await expect(page.locator('#playground-code')).toContainText('service.ipFamilies[0]=IPv6');
    await expect(page.locator('#playground-code')).not.toContainText('service.ipFamilies[1]=IPv6');
  });

  test('scenario-only secondary family is removed for SingleStack policy', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="liwan"]').click();

    await page.locator('.playground-scenario-btn:has-text("Dual Stack")').click();
    await page.locator('select[data-field-key="service.ipFamilyPolicy"]').selectOption('SingleStack');

    await expect(page.locator('#playground-code')).toContainText('service.ipFamilyPolicy=SingleStack');
    await expect(page.locator('#playground-code')).not.toContainText('service.ipFamilies[1]');
  });

  test('scenario-only values follow their collapsible section ownership', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.playground-chart-btn[data-slug="postgresql"]').click();

    await page.locator('.playground-scenario-btn:has-text("Production")').click();
    await expect(page.locator('#playground-code')).toContainText('replication.wal.maxSlotWalKeepSize=8GB');

    await page.locator('[data-section-toggle="Production Security"]').click();
    await expect(page.locator('#playground-code')).not.toContainText('replication.wal.maxSlotWalKeepSize');
  });
});

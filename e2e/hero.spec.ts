import { test, expect } from '@playwright/test';

test.describe('Hero Section and SEO validations', () => {
  test('should render the terminal animation without errors', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/HelmForge/);

    // Verify the chart count badge rendered properly
    await expect(page.locator('text=Charts').first()).toBeVisible();

    // The terminal container should exist
    const terminal = page.locator('.hero-terminal');
    await expect(terminal).toBeVisible();

    // Verify terminal eventually renders the helm repo add output
    await expect(page.locator('#terminal-lines >> text=helmforge').first()).toBeVisible({ timeout: 15000 });
  });

  test('should inject the aggressive SEO and JSON-LD schemas', async ({ page }) => {
    await page.goto('/');

    // Check meta keywords
    const metaKeywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    expect(metaKeywords).toContain('bitnami alternative');
    expect(metaKeywords).toContain('helm chart');

    // Check JSON-LD
    const jsonLDTags = await page.locator('script[type="application/ld+json"]').all();
    let hasSoftwareApp = false;
    let hasOrganization = false;

    for (const tag of jsonLDTags) {
      const content = await tag.textContent();
      if (!content) continue;

      const parsed = JSON.parse(content);
      if (parsed['@type'] === 'Organization') {
        hasOrganization = true;
        expect(parsed.logo).toContain('.svg');
      } else if (parsed['@type'] === 'SoftwareApplication') {
        hasSoftwareApp = true;
        expect(parsed.keywords).toContain('bitnami alternative');
        expect(parsed.description).toContain('observability');
      }
    }

    expect(hasOrganization).toBeTruthy();
    expect(hasSoftwareApp).toBeTruthy();
  });
});

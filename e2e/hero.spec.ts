import { test, expect } from '@playwright/test';

test.describe('Hero Section and SEO validations', () => {

  test('should render the dynamic typing terminal without errors', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/HelmForge/);
    
    // Wait for the splash screen to disappear
    await page.locator('#splash-screen').waitFor({ state: 'hidden', timeout: 5000 });

    // Verify the glassmorphism grid chart count rendered properly
    await expect(page.locator('p:has-text("Charts")').first()).toBeVisible();

    // The typed.js element should exist inside the terminal window
    const typedElement = page.locator('#typed-element');
    await expect(typedElement).toBeVisible();

    // Verify terminal eventually prints the success states configured in the component
    // We wait up to 25s for the first interaction to unfold
    await expect(page.locator('.text-zinc-500', { hasText: 'added' }).first()).toBeVisible({ timeout: 25000 });
  });

  test('should inject the aggressive SEO and JSON-LD schemas', async ({ page }) => {
    await page.goto('/');

    // Check meta keywords
    const metaKeywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    expect(metaKeywords).toContain('bitnami alternative');
    expect(metaKeywords).toContain('postgresql');

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

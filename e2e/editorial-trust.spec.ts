import { test, expect } from '@playwright/test';

test.describe('Editorial trust signals', () => {
  test('author profile identifies maintainer and exposes Person structured data', async ({ page }) => {
    await page.goto('/authors/maicon-berlofa');

    await expect(page).toHaveTitle(/Maicon Berlofa/i);
    await expect(page.locator('h1')).toContainText('Maicon Berlofa');
    await expect(page.getByText(/founder and maintainer of HelmForge/i).first()).toBeVisible();
    await expect(page.getByText('Kubernetes operations', { exact: true })).toBeVisible();
    await expect(page.locator('a[href="https://github.com/mberlofa"]')).toBeVisible();
    await expect(page.locator('a[href="https://www.linkedin.com/in/berlofa"]')).toBeVisible();

    const structuredData = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((content) =>
      JSON.parse(content),
    );
    const person = structuredData.find((schema) => schema['@type'] === 'Person');

    expect(person).toMatchObject({
      '@type': 'Person',
      name: 'Maicon Berlofa',
      url: 'https://helmforge.dev/authors/maicon-berlofa',
      jobTitle: 'Founder and Maintainer',
      affiliation: {
        '@type': 'Organization',
        name: 'HelmForge',
        url: 'https://helmforge.dev',
      },
    });
    expect(person.knowsAbout).toContain('Helm chart engineering');
  });

  test('about page explains the project and is backed by AboutPage schema', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('h1')).toContainText('Open-source Helm charts, forged to last');
    await expect(page.getByText('Why we built HelmForge')).toBeVisible();
    await expect(page.getByText(/100% open-source under Apache-2\.0/i)).toBeVisible();

    const structuredData = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((content) =>
      JSON.parse(content),
    );
    expect(structuredData.some((schema) => schema['@type'] === 'AboutPage')).toBeTruthy();
  });

  test('contact and corrections pages expose clear reporting channels', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('h1')).toContainText('Reach the right channel');
    await expect(page.locator('#main-content a[href="mailto:berlofa@helmforge.dev"]')).toBeVisible();
    await expect(page.locator('#main-content a[href="https://github.com/helmforgedev/charts/issues"]')).toBeVisible();
    await expect(page.locator('#main-content a[href="/corrections"]')).toBeVisible();

    await page.goto('/corrections');
    await expect(page.locator('h1')).toContainText('Help keep HelmForge accurate');
    await expect(page.locator('#main-content a[href="mailto:berlofa@helmforge.dev"]')).toBeVisible();
    await expect(page.locator('#main-content a[href="https://github.com/helmforgedev/site/issues/new"]')).toBeVisible();
  });

  test('editorial policy documents review, sources, updates, and standards', async ({ page }) => {
    await page.goto('/editorial-policy');

    await expect(page.locator('h1')).toContainText('Technical integrity, verified in production');
    await expect(page.getByText('Primary Source Grounding')).toBeVisible();
    await expect(page.getByText('Behavioral Verification')).toBeVisible();
    await expect(page.getByText('Human Review & Attribution Prohibition')).toBeVisible();
    await expect(page.getByText('Transparent Correction Policy')).toBeVisible();
  });

  test('footer links to project trust pages', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/about"]')).toBeVisible();
    await expect(footer.locator('a[href="/contact"]')).toBeVisible();
    await expect(footer.locator('a[href="/authors/maicon-berlofa"]')).toBeVisible();
    await expect(footer.locator('a[href="/editorial-policy"]')).toBeVisible();
    await expect(footer.locator('a[href="/corrections"]')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Editorial trust signals', () => {
  test('author profile identifies maintainer and exposes Person structured data', async ({ page }) => {
    await page.goto('/authors/maicon-berlofa');

    await expect(page).toHaveTitle(/Maicon Berlofa/i);
    await expect(page.locator('h1')).toContainText('Maicon Berlofa');
    await expect(page.getByText(/founder and maintainer of HelmForge/i)).toBeVisible();
    await expect(page.getByText('Kubernetes operations', { exact: true })).toBeVisible();
    await expect(page.locator('a[href="https://github.com/mberlofa"]')).toBeVisible();
    await expect(page.locator('a[href="https://www.linkedin.com/in/berlofa"]')).toBeVisible();
    await expect(page.locator('a[href="mailto:maicon.berloffa@gmail.com"]')).toBeVisible();

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

    await expect(page.locator('h1')).toContainText('Production-ready Helm charts');
    await expect(page.getByText(/Apache-2\.0 Helm charts/i)).toBeVisible();
    await expect(page.getByText(/official upstream container images/i)).toBeVisible();

    const structuredData = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((content) =>
      JSON.parse(content),
    );
    expect(structuredData.some((schema) => schema['@type'] === 'AboutPage')).toBeTruthy();
  });

  test('contact and corrections pages expose clear reporting channels', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('h1')).toContainText('Reach the right channel');
    await expect(page.locator('a[href="mailto:berlofa@helmforge.dev"]')).toBeVisible();
    await expect(page.locator('a[href="https://github.com/helmforgedev/charts/issues"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /Corrections Report an article/i })).toBeVisible();

    await page.goto('/corrections');
    await expect(page.locator('h1')).toContainText('Help keep HelmForge content accurate');
    await expect(page.locator('a[href="mailto:berlofa@helmforge.dev"]')).toBeVisible();
    await expect(page.locator('a[href="https://github.com/helmforgedev/site/issues/new"]')).toBeVisible();
  });

  test('editorial policy documents review, sources, updates, and AI assistance', async ({ page }) => {
    await page.goto('/editorial-policy');

    await expect(page.locator('h1')).toContainText('How HelmForge publishes technical content');
    await expect(page.getByText('Technical review')).toBeVisible();
    await expect(page.getByText('Source selection')).toBeVisible();
    await expect(page.getByText('AI and editorial assistance')).toBeVisible();
    await expect(page.getByText('Update policy')).toBeVisible();
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

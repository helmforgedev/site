import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog index renders post cards', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog/i);
    const cards = page.locator('a[href^="/blog/"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
  });

  test('blog index has rss subscribe and follow-author cta', async ({ page }) => {
    await page.goto('/blog');

    const subscribe = page.locator('a[aria-label="Subscribe via RSS"]').first();
    await expect(subscribe).toBeVisible();
    await expect(subscribe).toHaveAttribute('href', '/rss.xml');

    await expect(page.locator('a[aria-label="Follow Maicon Berlofa on GitHub"]')).toBeVisible();
    await expect(page.locator('a[aria-label="Follow Maicon Berlofa on LinkedIn"]')).toBeVisible();
  });

  test('blog post renders with content', async ({ page }) => {
    await page.goto('/blog');
    const firstPost = page.locator('a[href^="/blog/"]').first();
    const href = await firstPost.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    await expect(page.locator('article')).toBeVisible();
    // Reading time should be visible
    await expect(page.locator('text=/\\d+ min read/')).toBeVisible();
  });

  test('blog post has date and tags', async ({ page }) => {
    await page.goto('/blog');
    const firstPost = page.locator('a[href^="/blog/"]').first();
    const href = await firstPost.getAttribute('href');
    await page.goto(href!);

    // Should have a time element
    await expect(page.locator('time')).toBeVisible();
    // Should have at least one tag
    expect(
      await page
        .locator('[class*="tag"], [class*="badge"], span:has-text("helm"), span:has-text("kubernetes")')
        .count(),
    ).toBeGreaterThan(0);
  });

  test('blog post has share links', async ({ page }) => {
    await page.goto('/blog');
    const firstPost = page.locator('a[href^="/blog/"]').first();
    const href = await firstPost.getAttribute('href');
    await page.goto(href!);

    // Should have share links (Twitter/X, LinkedIn, or copy)
    const shareLinks = page.locator(
      'a[href*="twitter.com"], a[href*="x.com"], a[href*="linkedin.com"], button:has-text("Copy")',
    );
    expect(await shareLinks.count()).toBeGreaterThan(0);
  });

  test('blog post with cover image renders hero media', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const hero = page.locator('figure img[src*="/blog/"][src$=".webp"]').first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute('alt', /Kubernetes 1\.34/i);
  });

  test('blog post renders author card with social links', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const authorCard = page.locator('aside section').filter({ hasText: 'Written by' }).first();
    await expect(authorCard).toBeVisible();
    await expect(authorCard.getByText('Maicon Berlofa')).toBeVisible();
    await expect(authorCard.locator('a[aria-label*="GitHub"]')).toBeVisible();
    await expect(authorCard.locator('a[aria-label*="LinkedIn"]')).toBeVisible();
  });

  test('blog post has rss subscribe cta in sidebar', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const subscribeSection = page.locator('aside section').filter({ hasText: 'Subscribe via RSS' }).first();
    await expect(subscribeSection).toBeVisible();
    await expect(subscribeSection.locator('a[aria-label="Subscribe via RSS"]')).toHaveAttribute('href', '/rss.xml');
  });

  test('blog post exposes Person author in structured data', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const scripts = page.locator('script[type="application/ld+json"]');
    const combined = (await scripts.allTextContents()).join('\n');

    expect(combined).toContain('"@type":"Article"');
    expect(combined).toContain('"@type":"Person"');
    expect(combined).toContain('Maicon Berlofa');
  });
});

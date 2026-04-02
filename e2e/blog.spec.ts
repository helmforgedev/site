import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog index renders post cards', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog/i);
    const cards = page.locator('a[href^="/blog/"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
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
});

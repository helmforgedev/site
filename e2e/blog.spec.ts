import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog index renders post cards', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog/i);
    const cards = page.locator('a[href^="/blog/"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
  });

  test('blog index has newsletter and rss subscribe ctas', async ({ page }) => {
    await page.goto('/blog');

    const newsletter = page.locator('a[aria-label="Open newsletter page"]').first();
    await expect(newsletter).toBeVisible();
    await expect(newsletter).toHaveAttribute('href', '/newsletter');

    const subscribe = page.locator('a[aria-label="Subscribe via RSS"]').first();
    await expect(subscribe).toBeVisible();
    await expect(subscribe).toHaveAttribute('href', '/rss.xml');
  });

  test('blog index keeps subscription actions near header', async ({ page }) => {
    await page.goto('/blog');

    const actions = page.locator('[aria-label="Blog subscription actions"]');
    await expect(actions).toBeVisible();
    await expect(actions.locator('a[aria-label="Open newsletter page"]')).toBeVisible();
    await expect(actions.locator('a[aria-label="Subscribe via RSS"]')).toBeVisible();
  });

  test('blog cards expose title, description, author, and date', async ({ page }) => {
    await page.goto('/blog');

    const firstCard = page.locator('a[href^="/blog/"]').first();
    await expect(firstCard.locator('h2')).toBeVisible();
    await expect(firstCard.locator('p')).toBeVisible();
    await expect(firstCard.locator('time')).toBeVisible();
    await expect(firstCard.locator('time')).toHaveAttribute('datetime', /\d{4}-\d{2}-\d{2}T/);
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

  test('blog post has newsletter and rss subscribe cta in sidebar', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const subscribeSection = page.locator('aside section').filter({ hasText: 'Newsletter and RSS' }).first();
    await expect(subscribeSection).toBeVisible();
    await expect(subscribeSection.locator('a[aria-label="Open newsletter page"]')).toHaveAttribute(
      'href',
      '/newsletter',
    );
    await expect(subscribeSection.locator('a[aria-label="Subscribe via RSS"]')).toHaveAttribute('href', '/rss.xml');
  });

  test('blog post has end-of-article newsletter cta', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const ctaSection = page.locator('article section').filter({ hasText: 'Get the next post in your inbox' }).first();
    await expect(ctaSection).toBeVisible();
    await expect(ctaSection.locator('a[aria-label="Open newsletter page"]')).toHaveAttribute('href', '/newsletter');
    await expect(ctaSection.locator('a[aria-label="Subscribe via RSS"]')).toHaveAttribute('href', '/rss.xml');
  });

  test('newsletter page embeds listmonk form', async ({ page }) => {
    await page.goto('/newsletter');
    await expect(page).toHaveTitle(/Newsletter/i);
    await expect(page.locator('h1')).toContainText('Stay ahead');

    const form = page.locator('form[aria-label="HelmForge newsletter form"]');
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute('action', 'https://newsletter.helmforge.dev/subscription/form');
    await expect(form.locator('input[name="email"]')).toBeVisible();
    await expect(form.locator('input[name="name"]')).toBeVisible();
    await expect(form.locator('input[name="l"][value="7f91e9db-d5f1-4999-83fd-a908208bd8d5"]')).toBeChecked();
    await expect(page.locator('altcha-widget')).toHaveAttribute(
      'challengeurl',
      'https://newsletter.helmforge.dev/api/public/captcha/altcha',
    );
  });

  test('blog post exposes Person author in structured data', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const scripts = page.locator('script[type="application/ld+json"]');
    const combined = (await scripts.allTextContents()).join('\n');

    expect(combined).toContain('"@type":"Article"');
    expect(combined).toContain('"@type":"Person"');
    expect(combined).toContain('Maicon Berlofa');
  });

  test('blog post includes canonical, rss discovery, and is indexable', async ({ page }) => {
    await page.goto('/blog/kubernetes-1-34-image-short-names');

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/blog\/kubernetes-1-34-image-short-names\/?$/);

    const rssAlternate = page.locator('link[rel="alternate"][type="application/rss+xml"]');
    await expect(rssAlternate).toHaveAttribute('href', '/rss.xml');

    await expect(page.locator('meta[name="robots"][content*="noindex" i]')).toHaveCount(0);
  });

  test('rss endpoint responds with atom self link', async ({ page }) => {
    const response = await page.request.get('/rss.xml');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('xml');

    const body = await response.text();
    expect(body).toContain('<rss');
    expect(body).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(body).toContain('<atom:link href="https://helmforge.dev/rss.xml" rel="self" type="application/rss+xml"');
    expect(body).toContain('<language>en</language>');
  });

  test('sitemap includes blog urls', async ({ page }) => {
    const response = await page.request.get('/sitemap-index.xml');
    expect(response.ok()).toBeTruthy();
    const indexBody = await response.text();

    const sitemapMatch = indexBody.match(/<loc>([^<]*sitemap-0\.xml)<\/loc>/);
    expect(sitemapMatch).toBeTruthy();

    const sitemapResponse = await page.request.get(sitemapMatch![1]);
    expect(sitemapResponse.ok()).toBeTruthy();
    const sitemapBody = await sitemapResponse.text();

    expect(sitemapBody).toContain('https://helmforge.dev/blog/');
    expect(sitemapBody).toContain('https://helmforge.dev/blog/kubernetes-1-34-image-short-names');
  });
});

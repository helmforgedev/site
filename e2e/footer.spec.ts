import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/stack',
  '/blog',
  '/docs',
  '/playground',
  '/roadmap',
  '/community',
  '/changelog',
  '/request',
  '/about',
  '/contact',
  '/authors/maicon-berlofa',
  '/editorial-policy',
  '/corrections',
];

test.describe('Footer', () => {
  for (const path of pages) {
    test(`no gap below footer on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(300);

      const gap = await page.evaluate(() => {
        const footer = document.querySelector('footer');
        if (!footer) return -1;
        const bodyHeight = document.body.scrollHeight;
        const footerBottom = footer.getBoundingClientRect().bottom + window.scrollY;
        return Math.round(bodyHeight - footerBottom);
      });

      expect(gap).toBeLessThanOrEqual(5);
    });
  }
});

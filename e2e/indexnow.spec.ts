import { expect, test } from '@playwright/test';

test.describe('IndexNow', () => {
  test('serves the IndexNow key from the site root', async ({ page }) => {
    const response = await page.request.get('/helmforge-indexnow-key.txt');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/plain');

    const body = (await response.text()).trim();
    expect(body).toMatch(/^[a-f0-9]{32}$/);
  });
});

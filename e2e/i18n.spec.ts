import { expect, test } from '@playwright/test';

test.describe('Internationalization', () => {
  test.use({ locale: 'es-ES' });

  test('detects browser locale by default', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit locale handling is flaky in CI for this assertion.');

    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.removeItem('hf_locale');
    });

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('[data-i18n="header.docs"]').first()).toHaveText('Documentación');
  });

  test('persists manual language selection', async ({ page, context }) => {
    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.removeItem('hf_locale');
    });

    await page.goto('/');

    await page.locator('[data-locale-button]').first().click();
    await page.locator('[data-locale-option][data-locale="pt-BR"]').first().click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('[data-i18n="header.docs"]').first()).toHaveText('Documentação');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('[data-i18n="header.docs"]').first()).toHaveText('Documentação');
  });
});

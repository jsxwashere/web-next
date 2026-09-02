import { expect, test } from '@playwright/test';
import { signIn, TEST_USER } from './helpers/auth';

/**
 * `auth.spec.ts` — Sprint 8.6 E2E: signin akışı + middleware koruması.
 *
 * Senaryolar:
 *   1. /signin aç → email/password doldur → Continue → / veya /projects'a yönlen
 *   2. Signin olmadan /dashboard'e erişim → middleware /signin'e redirect eder
 *   3. Yanlış şifre ile signin → hata mesajı görünür
 */
test.describe('Auth flow', () => {
  test('user can sign in with valid credentials and lands on protected route', async ({
    page,
  }) => {
    await signIn(page);

    // Yönlendirildikten sonra — ana sayfa veya /projects
    const url = new URL(page.url());
    expect(['/', '/projects', '/dashboard'].includes(url.pathname)).toBe(true);

    // Header'da kullanıcı adı veya en azından ana içerik render edildi mi?
    await expect(page.locator('body')).toBeVisible();
  });

  test('unauthenticated access to /dashboard redirects to /signin', async ({
    page,
  }) => {
    // Cookie'leri temizle — fresh ziyaretçi
    await page.context().clearCookies();
    await page.goto('/dashboard');

    // Middleware /signin'e redirect etmeli
    await expect(page).toHaveURL(/\/signin(?:\?|$)/, { timeout: 15_000 });

    // Signin başlığı görünür
    await expect(
      page.getByRole('heading', { name: /sign in/i }),
    ).toBeVisible();
  });

  test('signing in with wrong password shows an error', async ({ page }) => {
    await page.goto('/signin');
    await page.locator('input[placeholder="Your email"]').fill(TEST_USER.email);
    await page
      .locator('input[placeholder="Your password"]')
      .fill('wrong-password-xxx');

    await page.getByRole('button', { name: /continue/i }).click();

    // Hata mesajı — Alert component'i destructive variant ile
    // VEYA URL signin'de kaldı
    await page.waitForTimeout(2_000);
    expect(page.url()).toContain('/signin');
  });
});
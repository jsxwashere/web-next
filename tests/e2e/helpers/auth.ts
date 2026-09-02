import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Test kullanıcı kimlik bilgileri.
 *
 * Signin sayfasındaki demo kimlik bilgileriyle uyumlu:
 *   demo@kt.com / demo123
 *
 * NOT: `auth.ts` → `authorizeLaravel` fonksiyonu bu bilgileri
 * `${LARAVEL_BASE}/api/auth/jwt-login`'e POST ediyor. Laravel
 * backend'in bu kullanıcıyla seeded olması beklenir.
 */
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'demo@kt.com',
  password: process.env.E2E_TEST_PASSWORD ?? 'demo123',
} as const;

/**
 * `signIn(page)` — NextAuth credentials provider üzerinden giriş.
 *
 * Akış:
 *   1. /signin sayfasını aç
 *   2. Email + password doldur
 *   3. "Continue" submit butonuna tıkla
 *   4. `router.push('/')` ile ana sayfaya yönlenmeyi bekle
 *
 * `waitForURL`'in içinde `**` glob var — örn. /, /dashboard, /projects
 * yönlendirmelerinin tümü kabul edilir.
 */
export async function signIn(page: Page): Promise<void> {
  await page.goto('/signin');
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

  // Form alanları — placeholder'a göre locator.
  // FormField label'ları <label for> ile bağlı olsa da, bazı UI primitive'lerde
  // label association gecikir. placeholder kesindir.
  const emailInput = page.locator('input[placeholder="Your email"]');
  const passwordInput = page.locator('input[placeholder="Your password"]');

  await emailInput.fill(TEST_USER.email);
  await passwordInput.fill(TEST_USER.password);

  // Submit — "Continue" metinli buton
  await page.getByRole('button', { name: /continue/i }).click();

  // Middleware redirect ya da başarılı signin sonrası '/' gelmesini bekle
  await page.waitForURL(
    (url) => {
      const p = url.pathname;
      return p === '/' || p.startsWith('/dashboard') || p.startsWith('/projects');
    },
    { timeout: 30_000 },
  );
}

/**
 * `signOut(page)` — NextAuth signOut endpoint'i üzerinden çıkış.
 *
 * Cookie'leri temizlemek için API'yi doğrudan çağırıyoruz;
 * UI'da bir sign-out butonu varsa ileride locator değiştirilebilir.
 */
export async function signOut(page: Page): Promise<void> {
  await page.context().clearCookies();
}
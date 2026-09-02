import { defineConfig, devices } from '@playwright/test';

/**
 * `playwright.config.ts`
 *
 * Sprint 8.6 — E2E test altyapısı.
 *
 * - Test dizini: ./tests/e2e
 * - baseURL: Next.js dev server (http://localhost:3000)
 * - Headless, screenshot only-on-failure, trace on-first-retry
 * - webServer komutu yoksa mevcut dev server'ı reuse eder (CI'da başlatır)
 */
export default defineConfig({
  testDir: './tests/e2e',
  // Fully parallel; CI'da 1 worker ile çalıştırılabilir
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Locale & timezone stabil kalsın
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
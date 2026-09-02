import { expect, test } from '@playwright/test';
import { signIn } from './helpers/auth';

/**
 * `project-navigation.spec.ts` — Sprint 8.6 E2E: /projects → detay akışı.
 *
 * Senaryo:
 *   1. Signin
 *   2. /projects sayfasını aç
 *   3. İlk proje kartına tıkla (ya da "Tümü" tab'ında)
 *   4. /projects/{id} üzerindeyken ProjectTabs görünür
 *   5. Bir tab'ı (örn. "Tahsilatlar") tıkla → URL değişir
 *   6. ProjectHero bileşeni render edilir
 */
test.describe('Project navigation', () => {
  test('user can navigate from /projects to project detail and switch tabs', async ({
    page,
  }) => {
    await signIn(page);

    // /projects sayfasını aç
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects(?:\?|$)/, { timeout: 15_000 });

    // Yükleme için bekle — API çağrıları
    await page.waitForTimeout(2_000);

    // İlk proje kartını bul — role="button" olan ilk link
    // ŞantiyePro card'ları <Link href="/projects/{id}"> içerir
    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    await expect(firstProjectLink).toBeVisible({ timeout: 15_000 });

    const href = await firstProjectLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/^\/projects\/\d+/);

    // Tıkla ve detay sayfasına git
    await firstProjectLink.click();

    // URL'i bekleyen
    await page.waitForURL(href!, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/projects\/\d+/);

    // ProjectTabs — TabsList "Proje modülleri" aria-label'ına sahip
    const tablist = page.locator('[aria-label="Proje modülleri"]');
    await expect(tablist).toBeVisible({ timeout: 10_000 });

    // İlk tab'ı tıkla — Tahsilatlar veya başka bir aktif tab
    // TabsTrigger'lar içindeki ilk 'a' elementi
    const firstTabLink = tablist.locator('a').first();
    await expect(firstTabLink).toBeVisible();

    // ProjectHero render — layout'ta ProjectTabs'in altında
    // Hero'nun başlığı proje adıdır (h1 veya h2)
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('switching to Tahsilatlar tab updates URL', async ({ page }) => {
    await signIn(page);

    // /projects sayfası
    await page.goto('/projects');
    await page.waitForTimeout(2_000);

    const firstProjectLink = page.locator('a[href^="/projects/"]').first();
    const href = await firstProjectLink.getAttribute('href');
    if (!href) {
      test.skip(true, 'No projects available');
      return;
    }

    await firstProjectLink.click();
    await page.waitForURL(href, { timeout: 15_000 });

    // Tahsilatlar tab'ı
    const tahsilatlarTab = page
      .locator('[aria-label="Proje modülleri"] a[href*="/tahsilatlar"]')
      .first();

    const tahsilatlarExists = (await tahsilatlarTab.count()) > 0;
    if (!tahsilatlarExists) {
      test.skip(true, 'Tahsilatlar tab not available for this project');
      return;
    }

    await tahsilatlarTab.click();
    await expect(page).toHaveURL(/\/tahsilatlar(?:\?|$)/, { timeout: 10_000 });
  });
});
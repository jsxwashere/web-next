'use client';

/**
 * `lib/auth/sign-out.ts`
 *
 * Hem NextAuth session'ını hem Laravel JWT backend'inin
 * `/api/auth/jwt-logout` endpoint'ini çağıran ortak çıkış helper'ı.
 *
 * UserDropdown "Çıkış" butonu ve `signOut()` çağrılan tüm
 * client component'lerde kullanılır.
 */

import { signOut } from 'next-auth/react';

const LARAVEL_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * 1. Laravel `/api/auth/jwt-logout` → mevcut JWT'yi blacklist'e al
 * 2. NextAuth `signOut()` → cookie + session temizle, `/signin`'e yönlendir
 *
 * Hata durumunda bile NextAuth session'ı temizlenir — kullanıcı
 * yine de çıkış yapmış olur.
 */
export async function performSignOut(
  accessToken?: string,
  options?: { callbackUrl?: string; redirect?: boolean },
): Promise<void> {
  const redirectTo = options?.callbackUrl ?? '/signin';

  // 1. Backend invalidate — başarısız olsa bile client-side çıkışa devam et
  if (accessToken) {
    try {
      await fetch(`${LARAVEL_BASE}/api/auth/jwt-logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
    } catch {
      // network / 401 → sessizce yut; client-side temizlik zaten yapılacak
    }
  }

  // 2. NextAuth session temizle + yönlendir
  const redirectFlag = options?.redirect ?? true;
  await signOut({
    callbackUrl: redirectTo,
    redirect: redirectFlag as true,
  });
}
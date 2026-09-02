'use client';

/**
 * `hooks/use-auth-api.ts`
 *
 * `lib/api/client.ts` fetch instance'ını aktif NextAuth session'ına
 * bağlayan client-side hook. Bir client component mount olduğunda
 * çağrılır ve `useSession` her değiştiğinde provider yenilenir.
 *
 * Kullanım:
 *   ```tsx
 *   'use client';
 *   import { useAuthApi } from '@/hooks/use-auth-api';
 *   import { api } from '@/lib/api/client';
 *
 *   export function MyClientComponent() {
 *     useAuthApi();
 *     return <button onClick={() => api.get('/projects')}>load</button>;
 *   }
 *   ```
 *
 * **ECC P0-3 — token leak hardening:**
 *   - `refreshToken` client'ta ERİŞİLEMEZ. Refresh'i `/api/auth/refresh`
 *     server route handler'ı yapar (Laravel'a server-to-server çağrı).
 *   - Client yalnızca yeni `accessToken`'ı alır; `refreshToken` server-side
 *     NextAuth `jwt` callback'inde (cookie'de) kalır.
 *   - `useEffect` cleanup: StrictMode double-mount'ta singleton'ın sıfırlanmasını
 *     engeller; sadece konfig'i yeniler.
 *
 * **ECC P0-02 — race + first-render fix:**
 *   - `hydrated` flag: ilk render'da `tokenProvider` null olduğunda
 *     `apiFetchAuthed` çağrıları token'sız gider ve 401'e düşerdi. Artık
 *     `hydrated === true` olmadan `configureAuthClient` çağrılmaz.
 *   - Cleanup: `resetAuthClient()` StrictMode'un ikinci mount'undan ÖNCE
 *     birinci mount'un cleanup'ı çalıştığında konfig'i sıfırlar; ikinci
 *     mount yeniden konfigüre eder. Bu, session üzerine yazma race'ini
 *     ortadan kaldırır.
 */

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  configureAuthClient,
  resetAuthClient,
} from '@/lib/api/client';

export function useAuthApi(): void {
  const { data: session, update } = useSession();
  const [hydrated, setHydrated] = useState(false);

  // İlk mount sonrası hydrated=true. Bu sayede ilk render'da
  // token henüz yokken konfig yazılıp `apiFetchAuthed` çağrıları
  // yetim (orphan) token ile gitmez.
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    configureAuthClient({
      // Sadece kısa ömürlü accessToken forward edilir
      tokenProvider: () => {
        if (!session?.user) return null;
        return {
          accessToken: session.user.accessToken,
          accessTokenExpires: session.user.accessTokenExpires,
        };
      },

      // Refresh server-side proxy üzerinden yapılır — client refreshToken
      // hiçbir zaman bilmez. Proxy `refreshToken`'ı JWT cookie'den okur,
      // Laravel'a iletir, dönen yeni `accessToken`'ı `update()` ile
      // session'a yazar.
      refreshHandler: async () => {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            cache: 'no-store',
          });

          if (!res.ok) {
            await signOut({ callbackUrl: '/signin', redirect: true });
            return null;
          }

          const data = (await res.json()) as {
            access_token?: string;
            expires_in?: number;
          };

          if (!data.access_token) {
            await signOut({ callbackUrl: '/signin', redirect: true });
            return null;
          }

          // NextAuth session'ı yeni accessToken ile güncelle — bir sonraki
          // `useSession()` çağrısı yeni değeri görecek.
          await update?.({
            accessToken: data.access_token,
            accessTokenExpires:
              Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
          });

          return {
            accessToken: data.access_token,
            accessTokenExpires:
              Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
          };
        } catch {
          await signOut({ callbackUrl: '/signin', redirect: true });
          return null;
        }
      },

      onAuthFailure: () => {
        // signOut zaten yönlendirme yapıyor
        void signOut({ callbackUrl: '/signin', redirect: true });
      },
    });

    // P0-02 — StrictMode double-mount'ta ikinci mount'tan ÖNCE birinci
    // mount'un cleanup'ı çalışır. resetAuthClient singleton'ı temizler
    // ki yeni mount konfig'i overwrite etmesin / stale provider kalmasın.
    return () => {
      resetAuthClient();
    };
  }, [hydrated, session?.user?.accessToken, session?.user?.accessTokenExpires, update]);
}
'use client';

/**
 * `hooks/use-auth-api.ts`
 *
 * `lib/api/client.ts` axios instance'ını aktif NextAuth session'ına
 * bağlayan client-side hook. Bir client component mount olduğunda
 * çağrılır ve `useSession` her değiştiğinde axios interceptor
 *  provider'ı yenilenir.
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
 * Layout'lar (örn. `app/(protected)/layout.tsx`) zaten mount sırasında
 * `useSession()` çağırır; dolayısıyla `useAuthApi()`'i `<ShellLayoutSwitcher>`
 * içine bir kez çağırmak yeterli olur.
 */

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { configureAuthClient } from '@/lib/api/client';
import { refreshAccessToken } from '@/lib/auth/refresh';

export function useAuthApi(): void {
  const { data: session, update } = useSession();

  useEffect(() => {
    configureAuthClient({
      tokenProvider: () =>
        session && 'accessToken' in session.user
          ? (session.user as unknown as {
              accessToken?: string;
              refreshToken?: string;
              accessTokenExpires?: number;
            })
          : null,

      refreshHandler: async () => {
        const refreshToken = (
          session?.user as unknown as { refreshToken?: string } | undefined
        )?.refreshToken;

        if (!refreshToken) {
          await signOut({ callbackUrl: '/signin', redirect: true });
          return null;
        }

        const result = await refreshAccessToken(refreshToken);
        if (!result.success) {
          await signOut({ callbackUrl: '/signin', redirect: true });
          return null;
        }

        // NextAuth session'ını yeni token'larla güncelle — bir sonraki
        // `useSession()` çağrısı yeni accessToken'ı görecek.
        await update?.({
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          accessTokenExpires:
            Math.floor(Date.now() / 1000) + result.expires_in,
        });

        return {
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          accessTokenExpires:
            Math.floor(Date.now() / 1000) + result.expires_in,
        };
      },

      onAuthFailure: () => {
        // signOut zaten yönlendirme yapıyor
        void signOut({ callbackUrl: '/signin', redirect: true });
      },
    });
  }, [session, update]);
}
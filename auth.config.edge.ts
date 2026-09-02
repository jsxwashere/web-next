/**
 * `auth.config.edge.ts`
 *
 * NextAuth v5 (Auth.js) — EDGE-SAFE minimal konfigürasyon.
 *
 * Bu dosya SADECE middleware.ts tarafından import edilir. Edge runtime'da
 * `openid-client` ve diğer Node-only bağımlılıklar yüklenemediğinden,
 * Providers listesi boş bırakıldı ve `jwt/session` callback'leri kaldırıldı.
 *
 * Tam konfigürasyon (CredentialsProvider, callbacks) `auth.config.ts`
 * içindedir ve `auth.ts` tarafından kullanılır.
 *
 * Amaç: Sadece `callbacks.authorized` ile route koruma kararı vermek.
 */

import type { NextAuthConfig } from 'next-auth';

/**
 * v5 tip alias'ı.
 */
export const authConfigEdge: NextAuthConfig = {
  providers: [], // Edge'de provider yüklenmez — sadece auth kararı
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
    signOut: '/signin',
    error: '/signin',
  },
  callbacks: {
    /**
     * `authorized` callback — middleware'de her istek için çalışır.
     * `true` dönerse request geçer, `false` dönerse `pages.signIn`'e redirect.
     */
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public sayfalar — auth gerektirmez
      const isPublicAuthRoute =
        pathname.startsWith('/signin') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password') ||
        pathname.startsWith('/verify-email');

      if (isPublicAuthRoute) return true;

      // Diğer tüm sayfalar → login gerekli
      return isLoggedIn;
    },
  },
  // debug: middleware'de debug log'ları production'da da yazabilir,
  //         edge bundle'ı şişirmemek için burada kapalı.
  debug: false,
};
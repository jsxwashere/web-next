/**
 * `auth.config.ts`
 *
 * NextAuth v5 (Auth.js) — edge-safe konfigürasyon parçası.
 *
 * Kurulu paket: `next-auth@4.24.11` (v4). Sprint 4'te
 * `next-auth@5.0.0-beta` upgrade'i ile birlikte bu dosyadaki
 * `NextAuthConfig` tip referansı `next-auth`'ten çözülecek ve
 * `interface NextAuthConfig` kullanımına geçilecek.
 *
 * Şu an için tip tanımlarını burada locally tutuyoruz; v4 API'si
 * `NextAuthOptions` ile aynı yapıya sahip (v5 `NextAuthConfig`'in
 * edge-safe alt kümesi).
 *
 * Bölümler:
 *   1. providers[]         → Credentials placeholder (edge-safe iskelet)
 *   2. session             → JWT stratejisi, 30 gün
 *   3. callbacks.jwt       → token'a access/refresh + expires ekle
 *   4. callbacks.session   → session.user'a forward
 *   5. pages               → özel signin/signout sayfaları
 */

import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import type { MemberPayload } from './lib/auth/types';

/**
 * v4 ile uyumlu tip aliası. v5'te `import type { NextAuthConfig } from 'next-auth'`
 * ile değiştirilecek.
 */
type AuthConfig = NextAuthOptions;

/**
 * Edge runtime'da koşan `middleware.ts` için güvenli placeholder provider.
 * Asıl `authorize` implementasyonu `auth.ts` içindedir.
 */
const credentialsPlaceholder = Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  authorize: async () => null,
});

export const authConfig: AuthConfig = {
  providers: [credentialsPlaceholder],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/signin',
    signOut: '/signin',
    error: '/signin',
  },
  callbacks: {
    /**
     * JWT callback — provider'dan dönen user objesi ilk kez burada
     * token'a aktarılır; sonraki çağrılarda yalnızca `token` gelir.
     *
     * v4'te middleware-level "authorized" callback'i yok; v5'e geçişte
     * `callbacks.authorized` callback'i eklenecek (authConfig içinde).
     */
    async jwt({ token, user }) {
      // İlk giriş — `user` Laravel authorize'dan dönen payload
      if (user) {
        const u = user as unknown as {
          accessToken?: string;
          refreshToken?: string;
          accessTokenExpires?: number;
          roleKey?: string | null;
          permissions?: string[];
          member?: MemberPayload;
        };
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenExpires = u.accessTokenExpires;
        token.roleKey = u.roleKey ?? null;
        token.permissions = u.permissions ?? [];
        token.member = u.member;
        return token;
      }

      // Sonraki çağrılar — token hâlâ geçerli mi?
      const expiresAt =
        typeof token.accessTokenExpires === 'number'
          ? token.accessTokenExpires
          : 0;

      const stillValid =
        expiresAt > 0 &&
        Math.floor(Date.now() / 1000) < expiresAt - 30;

      if (stillValid) {
        return token;
      }

      // Süresi dolmuş → refresh denemesi
      const refreshToken = token.refreshToken;
      if (!refreshToken) {
        return { ...token, refreshError: 'no_refresh_token' };
      }

      const { refreshAccessToken } = await import('@/lib/auth/refresh');
      const result = await refreshAccessToken(refreshToken);

      if (result.success) {
        token.accessToken = result.access_token;
        token.refreshToken = result.refresh_token;
        token.accessTokenExpires =
          Math.floor(Date.now() / 1000) + result.expires_in;
        token.refreshError = undefined;
        return token;
      }

      return { ...token, refreshError: result.message };
    },

    /**
     * Session callback — JWT'den client session'ı doldurur.
     */
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.roleKey = token.roleKey ?? null;
        session.user.permissions = token.permissions ?? [];
        session.user.member = token.member;
        session.user.accessTokenExpires = token.accessTokenExpires;
      }

      if (token.refreshError && !token.accessToken) {
        return { ...session, user: undefined };
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV !== 'production',
};
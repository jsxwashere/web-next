/**
 * `auth.config.ts`
 *
 * NextAuth v5 (Auth.js) — node runtime konfigürasyonu.
 *
 * Bu dosya JWT/session callback'lerini ve Credentials provider
 * placeholder'ını içerir. Edge-safe kısım (`authorized` callback)
 * `auth.config.edge.ts`'ten gelir.
 *
 * Bölümler:
 *   1. providers[]         → Credentials placeholder (edge-safe iskelet)
 *   2. session             → JWT stratejisi, 30 gün
 *   3. callbacks.jwt       → token'a access/refresh + expires ekle
 *   4. callbacks.session   → session.user'a forward
 *   5. pages               → özel signin/signout sayfaları
 */

import type { NextAuthConfig, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import type { MemberPayload } from './lib/auth/types';

/**
 * v5 tip alias'ı.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async () => null,
    }),
  ],
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
        expiresAt > 0 && Math.floor(Date.now() / 1000) < expiresAt - 30;

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
     *
     * ECC P0-3: `refreshToken` ASLA client'a expose edilmez. Sadece
     * kısa ömürlü `accessToken` ve `accessTokenExpires` forward edilir.
     * Refresh server-side (`jwt` callback içinde `refreshAccessToken`)
     * tetiklenir — bkz. `app/api/auth/jwt-refresh-proxy/route.ts` (varsa)
     * veya yeni `useServerRefresh` helper'ı.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.accessTokenExpires = token.accessTokenExpires;
        session.user.roleKey = token.roleKey ?? null;
        session.user.permissions = token.permissions ?? [];
        session.user.member = token.member;
      }

      if (token.refreshError && !token.accessToken) {
        return { ...session, user: undefined };
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV !== 'production',
};

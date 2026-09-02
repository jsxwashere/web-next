/**
 * `lib/auth/types.ts`
 *
 * NextAuth v5 (Auth.js) için tip modülü augmentation'ı.
 *
 * `session.user` ve JWT payload'ına Laravel JwtAuthController'dan
 * gelen alanlar (accessToken, roleKey, permissions, member) eklenir.
 * Böylece `useSession()` ve `auth()` çağrılarında
 * `session.user.accessToken` / `session.user.roleKey` gibi alanlara
 * tip güvenli erişim sağlanır.
 *
 * v5 ile beraber `next-auth` paketinde `Session` ve `User` interface'leri
 * tanımlıdır. Burada bunları merge ediyoruz.
 */

import type { DefaultSession } from 'next-auth';

interface MemberPayload {
  account_id?: number | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  view_mode?: string | null;
}

declare module 'next-auth' {
  interface Session {
    user: {
      /**
       * Laravel `access_token` — kısa ömürlü (15 dk). axios isteklerinde
       * `Authorization: Bearer` başlığına eklenir. Client'ta expose edilir.
       */
      accessToken?: string;
      /**
       * `access_token` Unix-expires (saniye). Bu değer dolduğunda refresh tetiklenir.
       * Client'ta kalabilir (zamanlama kontrolü için).
       */
      accessTokenExpires?: number;
      /** Kullanıcının Spatie rol adı (örn: "admin", "firma_sahibi") */
      roleKey?: string | null;
      /** Tenant/member alt-objesi (Laravel `member` payload'ı ile aynı) */
      member?: MemberPayload;
      /** Spatie `getAllPermissions()` düzleştirilmiş izin listesi */
      permissions?: string[];
      /**
       * NOT: `refreshToken` BURADAN KALDIRILDI (ECC P0-3).
       * XSS yüzeyinden sıyrılmak için refresh token sadece server-side
       * JWT cookie'de tutulur. Client refresh'leri `jwt` callback'inden
       * (server-side) tetiklenir; client tarafı `/api/auth/jwt-refresh`
       * proxy'siyle refresh yapar.
       */
      /** Legacy alan — v4 `auth-options.ts` user-management route'ları kullanıyor */
      avatar?: string | null;
      roleId?: string;
      roleName?: string;
    } & DefaultSession['user'];
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    roleKey?: string | null;
    permissions?: string[];
    member?: MemberPayload;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    roleKey?: string | null;
    permissions?: string[];
    member?: MemberPayload;
    /** Refresh denemesinde gelen geçici hata */
    refreshError?: string;
    /** Legacy alanlar — v4 `auth-options.ts` user-management route'ları kullanıyor */
    roleId?: string;
    roleName?: string;
    avatar?: string | null;
  }
  // `JWT.id` ve `JWT.status` v4'te zaten tanımlı; tekrar declare etmek
  // modifier hatası veriyor. Burada genişletmiyoruz — mevcut `id` ve
  // `status` zaten v4 tipinde var.
}

export type { MemberPayload };

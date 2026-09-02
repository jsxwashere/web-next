/**
 * `middleware.ts`
 *
 * NextAuth v5 (Auth.js) — Edge middleware.
 *
 * ÖNEMLİ: `auth.config.edge.ts` kullanılır (edge-safe minimal konfigürasyon).
 * `auth.config.ts` CredentialsProvider + openid-client bağımlılıkları içerir ve
 * edge runtime'da yüklenemez. Bu yüzden ayrı tutulur.
 *
 * Kurallar:
 *   - `app/(protected)/*` → auth zorunlu, yoksa `/signin` redirect
 *   - `app/(auth)/*` (signin/signup/forgot/reset/verify) → public
 *   - `app/api/*` → public (Laravel API'ye proxy gerekmiyor,
 *     frontend axios doğrudan çağırıyor)
 *   - Statik varlıklar, `/_next/*`, `/public/*` → public
 */

import NextAuth from 'next-auth';
import { authConfigEdge } from './auth.config.edge';

// Edge middleware'de yalnızca edge-safe konfigürasyon çalıştırılır.
// openid-client / CredentialsProvider bağımlılıkları dahil edilmez.
const { auth } = NextAuth(authConfigEdge);

// v5'te `auth` zaten middleware function olarak dönüyor —
// `authorized()` callback'i karar veriyor, burada ek iş gerekmez.
export default auth;

/**
 * `matcher` — middleware'in hangi path'lerde çalışacağını belirler.
 * - `api/*` → atlanır (Laravel API'ye doğrudan erişim)
 * - `_next/static`, `_next/image`, `favicon.ico` → atlanır
 * - Görsel/dosya uzantıları → atlanır
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2|ttf|eot)$).*)',
  ],
};
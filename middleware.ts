/**
 * `middleware.ts`
 *
 * NextAuth v4 (Auth.js) — Edge middleware.
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
// openid-client / CredentialsProvider / openid-client bağımlılıkları dahil edilmez.
const { auth } = NextAuth(authConfigEdge);

export default auth((_request: unknown) => {
  // authConfigEdge.callbacks.authorized karar veriyor — burada ek bir şey gerekmez.
  void _request;
});

/**
 * `matcher` — middleware'in hangi path'lerde çalışacağını belirler.
 * - `api/*` → atlanır (Laravel API'ye doğrudan erişim, axios hallediyor)
 * - `_next/static`, `_next/image`, `favicon.ico` → atlanır
 * - Görsel/dosya uzantıları → atlanır
 * - `signin`, `signup`, `forgot-password`, `reset-password`, `verify-email` →
 *   public, `authorized()` callback'i bunları ayrıca ele alıyor
 */
export const config = {
  matcher: [
    /*
     * Tüm path'leri yakala, HARİÇ:
     *  - api/* (Laravel API'ye doğrudan erişim)
     *  - _next/static, _next/image, _next/data
     *  - favicon, robots.txt, sitemap.xml
     *  - statik dosyalar (.* uzantılı)
     */
    '/((?!api|_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2|ttf|eot)$).*)',
  ],
};
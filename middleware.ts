/**
 * `middleware.ts`
 *
 * NextAuth v5 (Auth.js) — Edge middleware.
 *
 * Kurallar:
 *   - `app/(protected)/*` → auth zorunlu, yoksa `/signin` redirect
 *   - `app/(auth)/*` (signin/signup/forgot/reset/verify) → public
 *   - `app/api/*` → public (Laravel API'ye proxy gerekmiyor,
 *     frontend axios doğrudan çağırıyor)
 *   - Statik varlıklar, `/_next/*`, `/public/*` → public
 *
 * `authConfig.callbacks.authorized` fonksiyonu zaten yukarıda
 * `pathname.startsWith('/signin')` mantığını kurmuş durumda —
 * burada yalnızca `matcher` ile uygulama kapsamını sınırlıyoruz.
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Edge middleware'de yalnızca edge-safe konfigürasyon çalıştırılır
// (prisma adapter vb. dahil edilmez).
const { auth } = NextAuth(authConfig);

export default auth((_request: unknown) => {
  // authConfig.callbacks.authorized zaten karar veriyor — burada ek
  // bir şey yapmaya gerek yok. Boş bırakılırsa NextAuth yukarıdaki
  // callback'i otomatik kullanır.
  // Bu fonksiyonun varlığı, `auth` middleware'inin devreye girmesini sağlar.
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
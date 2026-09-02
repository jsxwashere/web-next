/**
 * `app/api/auth/refresh/route.ts`
 *
 * **ECC P0-3 — server-side refresh proxy.**
 *
 * Client 401 yakaladığında bu endpoint'e POST atar. Bu route:
 *   1. NextAuth `auth()` çağrısıyla server-side session/JWT cookie'den
 *      `refreshToken`'ı okur (client hiçbir zaman görmez).
 *   2. Laravel `/api/auth/jwt-refresh` endpoint'ine server-to-server çağrı yapar.
 *   3. Başarılıysa `unstable_update` ile NextAuth session'ı yeni token'larla günceller
 *      (cookie otomatik set edilir; yeni `refreshToken` da cookie'ye yazılır).
 *   4. Response body'sinde **yalnızca `accessToken`** döner — `refreshToken`
 *      client'a ASLA expose edilmez.
 *
 * `refreshToken` her zaman server-side'da kalır (NextAuth JWT cookie).
 * XSS yüzeyi yalnızca kısa ömürlü `accessToken` (15 dk) olur.
 */

import { NextResponse } from 'next/server';
import { auth, unstable_update } from '@/auth';
import { refreshAccessToken } from '@/lib/auth/refresh';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * NextAuth v5 — JWT cookie'den `refreshToken`'a erişmek için
 * `auth()` ile dönen session içindeki JWT payload'ına bakıyoruz.
 * `session.user.refreshToken` tip düzeyinde yok (ECC P0-3), ancak
 * server tarafında JWT token'ı cookie'de duruyor; burada runtime'da
 * `session` üzerinden okuyacağır.
 */
interface ServerSessionWithRefresh {
  refreshToken?: string;
  accessToken?: string;
}

export async function POST(): Promise<NextResponse> {
  // Server-side session'dan refreshToken oku — client bunu hiçbir zaman göndermez
  const session = (await auth()) as unknown as ServerSessionWithRefresh | null;

  const refreshToken = session?.refreshToken;

  if (!refreshToken) {
    // Session yoksa veya refreshToken yoksa 401 dön (client signin'e yönlendirir)
    return NextResponse.json(
      { error: 'no_refresh_token' },
      { status: 401 },
    );
  }

  const result = await refreshAccessToken(refreshToken);

  if (!result.success) {
    // Refresh başarısız — 401 dön (client signOut eder)
    return NextResponse.json(
      { error: 'refresh_failed', message: result.message },
      { status: 401 },
    );
  }

  // Başarılı: NextAuth session'ı yeni token'larla güncelle.
  // unstable_update jwt callback'ini tetikler; orada yeni refreshToken
  // cookie'ye yazılır (client görmez).
  await unstable_update({
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    accessTokenExpires:
      Math.floor(Date.now() / 1000) + result.expires_in,
  } as unknown as Parameters<typeof unstable_update>[0]);

  // Client'a **yalnızca accessToken** dön. `refresh_token` ASLA leak olmaz.
  return NextResponse.json(
    {
      access_token: result.access_token,
      expires_in: result.expires_in,
      token_type: result.token_type,
    },
    {
      status: 200,
      headers: {
        // Bu response'un cache'e girmesini engelle
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    },
  );
}
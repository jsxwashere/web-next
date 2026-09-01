/**
 * `lib/auth/refresh.ts`
 *
 * Laravel `/api/auth/jwt-refresh` endpoint'ini çağırarak
 * `refresh_token` üzerinden yeni `access_token` üretir.
 *
 * Bu helper hem NextAuth `jwt` callback'inden (sunucu tarafı) hem de
 * `lib/api/client.ts` axios interceptor'ından (client tarafı, 401 yakalandığında)
 * çağrılabilir.
 *
 * Hem istemci hem sunucu tarafında çalışacak şekilde tasarlanmıştır:
 *   - Tarayıcıda:  fetch → backend
 *   - Sunucuda:   fetch → backend (route handler / server component)
 */

const DEFAULT_LARAVEL_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8000';

export interface RefreshSuccess {
  success: true;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshFailure {
  success: false;
  message: string;
}

export type RefreshResult = RefreshSuccess | RefreshFailure;

/**
 * Laravel `POST /api/auth/jwt-refresh` çağır.
 *
 * @param refreshToken Mevcut (henüz süresi dolmamış) refresh token
 * @param baseUrl Opsiyonel override — test veya multi-tenant için
 */
export async function refreshAccessToken(
  refreshToken: string,
  baseUrl: string = DEFAULT_LARAVEL_BASE,
): Promise<RefreshResult> {
  if (!refreshToken) {
    return { success: false, message: 'Refresh token missing' };
  }

  try {
    const response = await fetch(`${baseUrl}/api/auth/jwt-refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      // Yetkilendirme gerektiren bir internal call — Next.js fetch cache'ine
      // girmesini istemeyiz.
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await safeJson(response);
      return {
        success: false,
        message: data?.message ?? `Refresh failed (HTTP ${response.status})`,
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      access_token?: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
      message?: string;
    };

    if (!data?.access_token) {
      return {
        success: false,
        message: data?.message ?? 'Refresh response missing access_token',
      };
    }

    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? refreshToken,
      token_type: data.token_type ?? 'Bearer',
      expires_in: data.expires_in ?? 3600,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown refresh error',
    };
  }
}

/**
 * Token süresi dolmuş mu kontrol et.
 * Laravel default JWT TTL = 60 dk (3600 sn). expires_in saniye cinsinden döner.
 */
export function isTokenExpired(expiresAtSeconds: number | undefined): boolean {
  if (!expiresAtSeconds) return true;
  // 30 saniyelik güvenlik marjı — sunucu saat kaymasını da tolere eder
  return Math.floor(Date.now() / 1000) >= expiresAtSeconds - 30;
}

async function safeJson(res: Response): Promise<{ message?: string } | null> {
  try {
    return (await res.json()) as { message?: string };
  } catch {
    return null;
  }
}
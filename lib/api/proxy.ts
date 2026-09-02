/**
 * `lib/api/proxy.ts`
 *
 * Next.js API proxy route'ları için ortak forward mantığı.
 *
 * Her proxy route şu kalıbı takip eder:
 *   1. `auth()` ile NextAuth session doğrula (401 → Unauthorized)
 *   2. Request body / query string'i olduğu gibi Laravel'a forward et
 *   3. Authorization: Bearer <accessToken> başlığını server-side ekle
 *   4. Yanıtı aynen geri dön (status + body)
 *
 * Bu sayede:
 *   - Browser same-origin istek atar (CORS yok)
 *   - AccessToken HttpOnly JWT cookie'de kalır (XSS yüzeyi daralır)
 *   - Laravel'a yalnızca imzalı Bearer header ile ulaşılır
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { LARAVEL_BASE } from './config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Laravel'den dönen JSON yanıtı aynen geri döner. 502 upstream error
 * durumunda anlamlı mesajla birlikte döner.
 */
export async function forwardJson(
  init: RequestInit,
  url: string,
): Promise<NextResponse> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    return NextResponse.json({ message: 'Upstream error' }, { status: 502 });
  }

  // Boş body (örn. 204) için null geçir
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  // Laravel her zaman JSON döner; ama hata güvenliği için text fallback
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      // parse hatası → text olarak dön
    }
  }
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': contentType || 'text/plain' },
  });
}

/**
 * Auth kontrolü + Bearer header kurulumu.
 * Başarısızsa NextResponse (401) döner; başarıysa header map'i verir.
 */
export type AuthedInitResult =
  | { ok: true; init: RequestInit }
  | { ok: false; response: NextResponse };

export async function buildAuthedInit(
  request: Request,
  method: string,
  body?: BodyInit | null,
): Promise<AuthedInitResult> {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    };
  }

  const accessToken = session.user.accessToken;
  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: 'No access token' },
        { status: 401 },
      ),
    };
  }

  // Content-Type: Laravel tarafı JSON bekliyor (form-data upload'lar hariç
  // — bu dosyalar ayrı bir proxy tarafından handle edilir).
  const incomingType = request.headers.get('content-type') ?? '';
  const isJson = incomingType.toLowerCase().includes('application/json');

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
  if (body && isJson) {
    headers['Content-Type'] = 'application/json';
  }

  return {
    ok: true,
    init: {
      method,
      headers,
      body: body ?? undefined,
      cache: 'no-store',
    },
  };
}

/**
 * Query string'i (varsa) Laravel URL'ine ekler. base path verilen
 * resource path'in başına `/api` ekler.
 */
export function laravelUrl(
  resourcePath: string,
  searchParams?: URLSearchParams,
): string {
  const qs = searchParams?.toString() ?? '';
  // Next.js route'lar `/receipts/` trailing slash ile gelebilir; Laravel
  // route'ları slash'sız tanımlı. Normalize et.
  const trimmed = resourcePath.replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${LARAVEL_BASE}/api${path}${qs ? `?${qs}` : ''}`;
}

/**
 * JSON body forward etmek için yardımcı — request body stream'ini tüketir.
 * Body yoksa undefined döner.
 */
export async function readJsonBody(
  request: Request,
): Promise<unknown | undefined> {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) return undefined;
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/**
 * Forward yardımcısı — JSON body ile Laravel'a POST/PUT/PATCH/DELETE atar.
 * Laravel body'yi JSON olarak kabul eder.
 */
export async function forwardJsonBody(
  request: Request,
  resourcePath: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
): Promise<NextResponse> {
  const authResult = await buildAuthedInit(request, method, null);
  if (!authResult.ok) return authResult.response;
  const { init: baseInit } = authResult;

  const body = await readJsonBody(request);
  const init: RequestInit = {
    ...baseInit,
    body: body === undefined ? undefined : JSON.stringify(body),
  };

  const url = laravelUrl(resourcePath);
  return forwardJson(init, url);
}

/**
 * Forward yardımcısı — GET (query string) ile Laravel'a istek atar.
 */
export async function forwardGet(
  request: Request,
  resourcePath: string,
): Promise<NextResponse> {
  const authResult = await buildAuthedInit(request, 'GET', null);
  if (!authResult.ok) return authResult.response;
  const { init } = authResult;

  const url = new URL(request.url);
  const laravel = laravelUrl(resourcePath, url.searchParams);
  return forwardJson(init, laravel);
}

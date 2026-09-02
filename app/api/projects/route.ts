/**
 * `app/api/projects/route.ts`
 *
 * Next.js BFF proxy — Laravel `/api/projects` uç noktasını sarmalayan
 * GET (list) ve POST (create) handler'ları.
 *
 * Token: `auth()` ile NextAuth session'dan `accessToken` okunur, Bearer
 * header olarak Laravel'a forward edilir. Client tarafı sadece
 * same-origin istek atar → CORS yok.
 *
 * Sprint 8.7+ — Tüm Laravel endpoint'leri bu kalıpla proxy'lenebilir.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/projects');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/projects', 'POST');
}

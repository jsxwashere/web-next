/**
 * `app/api/collections/route.ts`
 *
 * Tahsilat listesi proxy'si. Laravel `/api/collections` uç noktasını
 * sarmalar.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/collections');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/collections', 'POST');
}

/**
 * `app/api/materials/route.ts`
 *
 * Malzeme listesi proxy'si. Laravel `/api/materials` uç noktasını
 * sarmalar.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/materials');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/materials', 'POST');
}

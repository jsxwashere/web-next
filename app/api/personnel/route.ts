/**
 * `app/api/personnel/route.ts`
 *
 * Personel listesi proxy'si. Laravel `/api/personnel` uç noktasını
 * sarmalar.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/personnel');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/personnel', 'POST');
}

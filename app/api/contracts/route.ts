/**
 * `app/api/contracts/route.ts`
 *
 * Sözleşme listesi proxy'si. Laravel `/api/contracts` uç noktasını
 * sarmalar.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/contracts');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/contracts', 'POST');
}

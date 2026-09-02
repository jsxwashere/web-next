/**
 * `app/api/firms/route.ts`
 *
 * Firma listesi proxy'si. Laravel `/api/firms` uç noktasını sarmalar.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/firms');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/firms', 'POST');
}

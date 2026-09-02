/**
 * `app/api/receipts/route.ts`
 *
 * Dekont listesi proxy'si. Laravel `/api/receipts` uç noktasını sarmalar.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/receipts');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/receipts', 'POST');
}

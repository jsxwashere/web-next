/**
 * `app/api/transactions/route.ts`
 *
 * Transaction (gelir/gider) listesi proxy'si. Laravel `/api/transactions`.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/transactions');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/transactions', 'POST');
}

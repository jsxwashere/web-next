/**
 * `app/api/entitlements/route.ts`
 *
 * Hakediş listesi proxy'si. Laravel `/api/entitlements` uç noktasını
 * sarmalar.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/entitlements');
}

export async function POST(request: Request): Promise<Response> {
  return forwardJsonBody(request, '/entitlements', 'POST');
}

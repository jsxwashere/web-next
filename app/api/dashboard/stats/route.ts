/**
 * `app/api/dashboard/stats/route.ts`
 *
 * Dashboard istatistik proxy'si. Laravel `/api/dashboard/stats`
 * uç noktasını sarmalar.
 */

import { forwardGet } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/dashboard/stats');
}

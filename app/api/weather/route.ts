/**
 * `app/api/weather/route.ts`
 *
 * Hava durumu proxy'si. Laravel `/api/weather`.
 */

import { forwardGet } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/weather');
}

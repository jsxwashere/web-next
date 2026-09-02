/**
 * `app/api/attendance/route.ts`
 *
 * Devam (attendance) listesi proxy'si. Laravel `/api/attendance`.
 */

import { forwardGet } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/attendance');
}

/**
 * `app/api/dashboard/recent-activity/route.ts`
 *
 * Son aktivite akışı proxy'si. Laravel
 * `/api/dashboard/recent-activity` uç noktasını sarmalar.
 */

import { forwardGet } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  return forwardGet(request, '/dashboard/recent-activity');
}

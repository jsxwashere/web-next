/**
 * `app/api/projects/[id]/stats/route.ts`
 *
 * Proje istatistikleri. Laravel `/api/projects/{id}/stats`.
 */

import { forwardGet } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardGet(request, `/projects/${id}/stats`);
}

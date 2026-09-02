/**
 * `app/api/projects/[id]/site-reports/route.ts`
 *
 * Projenin saha raporları. Laravel `/api/projects/{id}/site-reports`.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardGet(request, `/projects/${id}/site-reports`);
}

export async function POST(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardJsonBody(request, `/projects/${id}/site-reports`, 'POST');
}

/**
 * `app/api/projects/[id]/drawings/route.ts`
 *
 * Projenin çizimleri. Laravel `/api/projects/{id}/drawings`.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardGet(request, `/projects/${id}/drawings`);
}

export async function POST(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardJsonBody(request, `/projects/${id}/drawings`, 'POST');
}

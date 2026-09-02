/**
 * `app/api/projects/[id]/transactions/route.ts`
 *
 * Projenin transaction listesi. Laravel `/api/projects/{id}/transactions`.
 */

import { forwardGet, forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardGet(request, `/projects/${id}/transactions`);
}

export async function POST(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardJsonBody(request, `/projects/${id}/transactions`, 'POST');
}

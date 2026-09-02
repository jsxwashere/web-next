/**
 * `app/api/receipts/[id]/route.ts`
 *
 * Tek dekont için DELETE proxy'su. Laravel `/api/receipts/{id}`.
 */

import { buildAuthedInit, forwardJson, laravelUrl } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const authResult = await buildAuthedInit(request, 'DELETE', null);
  if (!authResult.ok) return authResult.response;
  const { init } = authResult;
  return forwardJson(init, laravelUrl(`/receipts/${id}`));
}

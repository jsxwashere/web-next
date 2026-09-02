/**
 * `app/api/projects/[id]/contracts/route.ts`
 *
 * Projenin sözleşmeleri. Laravel `/api/projects/{id}/contracts`.
 */

import { forwardGet } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardGet(request, `/projects/${id}/contracts`);
}

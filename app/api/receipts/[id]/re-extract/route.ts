/**
 * `app/api/receipts/[id]/re-extract/route.ts`
 *
 * Dekont yeniden OCR çıkarma proxy'su. Laravel
 * `/api/receipts/{id}/re-extract`.
 */

import { forwardJsonBody } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return forwardJsonBody(request, `/receipts/${id}/re-extract`, 'POST');
}

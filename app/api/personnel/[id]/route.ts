/**
 * `app/api/personnel/[id]/route.ts`
 *
 * Tek personel detayı / güncelleme / silme proxy'su. Laravel
 * `/api/personnel/{id}` uç noktasını sarmalar.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildAuthedInit, forwardJson, laravelUrl } from '@/lib/api/proxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const authResult = await buildAuthedInit(request, 'GET', null);
  if (!authResult.ok) return authResult.response;
  const { init } = authResult;
  const url = new URL(request.url);
  return forwardJson(init, laravelUrl(`/personnel/${id}`, url.searchParams));
}

export async function PATCH(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.text();
  const url = laravelUrl(`/personnel/${id}`);
  const init: RequestInit = {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.user.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body || undefined,
    cache: 'no-store',
  };
  return forwardJson(init, url);
}

export async function DELETE(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const authResult = await buildAuthedInit(request, 'DELETE', null);
  if (!authResult.ok) return authResult.response;
  const { init } = authResult;
  return forwardJson(init, laravelUrl(`/personnel/${id}`));
}

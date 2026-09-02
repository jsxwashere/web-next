/**
 * `app/api/projects/[id]/route.ts`
 *
 * Tek proje için GET / PUT / DELETE proxy'su. Laravel
 * `/api/projects/{id}` endpoint'ine karşılık gelir.
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
  return forwardJson(init, laravelUrl(`/projects/${id}`, url.searchParams));
}

export async function PUT(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.text();
  const url = laravelUrl(`/projects/${id}`);
  const init: RequestInit = {
    method: 'PUT',
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
  return forwardJson(init, laravelUrl(`/projects/${id}`));
}

export async function PATCH(request: Request, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.text();
  const url = laravelUrl(`/projects/${id}`);
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

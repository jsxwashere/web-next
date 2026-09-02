/**
 * `app/api/health/route.ts`
 *
 * Sprint 8.6 — Uptime / liveness probe.
 *
 * Frontend'in ve deploy pipeline'ın sağlık kontrolü için basit bir
 * GET endpoint'i. Laravel backend'e bağımlı değildir — Next.js
 * process'inin ayakta olduğunu doğrular.
 *
 * Kullanım:
 *   curl -sS http://localhost:3000/api/health
 *   → {"status":"ok","timestamp":"2026-09-02T12:34:56.789Z"}
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(): NextResponse<{ status: 'ok'; timestamp: string }> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
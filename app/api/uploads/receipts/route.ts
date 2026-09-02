/**
 * `app/api/uploads/receipts/route.ts`
 *
 * Sprint 8.7+ — Dekont upload proxy'su (BFF).
 *
 * Akış:
 *   1. İstemci FormData (multipart) ile POST atar
 *   2. Next.js route MIME + boyut + dosya sayısı validate eder
 *      (P0-5 savunma hattı; client tarafı da validate eder)
 *   3. `auth()` ile NextAuth session doğrulanır; accessToken cookie'den okunur
 *   4. Multipart payload Laravel `/api/receipts/` uç noktasına
 *      Bearer header ile forward edilir
 *   5. Laravel JSON yanıtı aynen geri döner
 *
 * Avantajlar:
 *   - Browser same-origin → CORS yok
 *   - AccessToken HttpOnly cookie'de kalır, XSS yüzeyi daralır
 *   - Laravel'a yalnız imzalı Bearer ile ulaşılır
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { LARAVEL_BASE } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Buffer-based multipart parsing için

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 20;

type ValidationFailure = {
  ok: false;
  status: number;
  error: string;
};

function fail(status: number, error: string): ValidationFailure {
  return { ok: false, status, error };
}

async function extractAndValidate(
  request: Request,
): Promise<
  { ok: true; files: File[]; formData: FormData } | ValidationFailure
> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, 'Geçersiz multipart payload.');
  }

  const files: File[] = [];
  const entries = Array.from(form.entries());
  for (let i = 0; i < entries.length; i++) {
    const value = entries[i][1];
    if (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as { arrayBuffer?: unknown }).arrayBuffer === 'function'
    ) {
      files.push(value as File);
    }
  }

  if (files.length === 0) {
    return fail(400, 'Yüklenecek dosya bulunamadı.');
  }
  if (files.length > MAX_FILES) {
    return fail(413, `Çok fazla dosya (max ${MAX_FILES}).`);
  }

  for (const file of files) {
    if (!ALLOWED_MIME.has(file.type)) {
      return fail(
        415,
        `Geçersiz dosya tipi: ${file.type || 'bilinmiyor'} (${file.name}).`,
      );
    }
    if (file.size > MAX_SIZE) {
      return fail(
        413,
        `Dosya çok büyük: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
      );
    }
    if (file.size === 0) {
      return fail(400, `Boş dosya: ${file.name}.`);
    }
  }

  return { ok: true, files, formData: form };
}

export async function POST(request: Request): Promise<NextResponse> {
  // 1) Content-Type guard — multipart değilse 415
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Content-Type multipart/form-data olmalı.' },
      { status: 415 },
    );
  }

  // 2) Payload doğrulama
  const result = await extractAndValidate(request);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  // 3) Auth — NextAuth session'dan accessToken oku
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 4) Multipart payload'ı Laravel'a forward et
  // Body zaten validate sırasında tüketildi; `result.formData` üzerinden
  // yeniden kullanıyoruz. Dosya stream'leri hâlâ geçerli.
  let response: Response;
  try {
    response = await fetch(`${LARAVEL_BASE}/api/receipts/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        Accept: 'application/json',
        // Content-Type set edilmez → fetch multipart boundary ekler
      },
      body: result.formData,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }

  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return new NextResponse(text, {
      status: response.status,
      headers: { 'content-type': contentType },
    });
  }
}

/**
 * `app/api/uploads/receipts/route.ts`
 *
 * Sprint 8.7 (P0-3 — server-side upload validation)
 *
 * İstemci tarafı `useUploadReceipts` hook'u MIME + boyut doğrulaması yapar
 * (`hooks/use-santiyepro-api.ts`); bu route ise aynı kontrolleri SERVER
 * tarafında tekrar uygular. Böylece:
 *   - DevTools / curl ile gelen istekler de reddedilir
 *   - Laravel backend'in önünde bir BFF (Backend-for-Frontend) katmanı
 *     sağlanır
 *   - Yetkilendirme (NextAuth session) burada doğrulanır, backend'e
 *     yalnız imzalı token geçer
 *
 * Bu endpoint opsiyoneldir — isteyen client'lar doğrudan Laravel
 * `/api/receipts/` üzerinden de upload edebilir. Etkinleştirmek için
 * `hooks/use-santiyepro-api.ts`'deki `uploadReceipts` fonksiyonunun
 * `LARAVEL_BASE` yerine `/api/uploads/receipts` hedeflemesi gerekir.
 *
 * Validate kural seti (client ile birebir aynı):
 *   - MIME allow-list: image/jpeg, image/png, image/webp, image/gif,
 *     application/pdf
 *   - Maks. dosya boyutu: 10 MB / dosya
 *   - Maks. dosya sayısı: 20 (UX'i korumak için)
 *
 * Sprint 8.7+ takip notu: Tüm Laravel API'leri bu pattern'e
 * taşınabilir (`/api/projects`, `/api/transactions`, …); her biri
 * NextAuth session doğrulaması + tip kontrolü içerir.
 */

import { NextResponse } from 'next/server';

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

/**
 * Multipart payload'dan dosyaları çıkarır ve validate eder.
 * `request.formData()` Next.js tarafından sağlanır; biz yalnız
 * doğrulama + ileri proxy hazırlığı yaparız.
 */
async function extractAndValidate(
  request: Request,
): Promise<{ ok: true; files: File[] } | ValidationFailure> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, 'Geçersiz multipart payload.');
  }

  // FormData üzerindeki tüm File entry'lerini topla
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

  return { ok: true, files };
}

/**
 * POST /api/uploads/receipts
 *
 * Şu an validate-only stub: dosyalar doğrulanır, başarılıysa 202 +
 * özet döner. Laravel'a proxy ileride eklenecek (Sprint 8.7+ takip notu).
 */
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

  // 3) Sprint 8.7+ — Laravel proxy + NextAuth token burada forward edilecek.
  // Şimdilik validate-only ack dönüyoruz; client tarafı zaten doğrudan
  // Laravel'a yüklüyor (`uploadReceipts`).
  const summary = result.files.map((f) => ({
    name: f.name,
    type: f.type,
    size: f.size,
  }));

  return NextResponse.json(
    {
      accepted: result.files.length,
      files: summary,
      note: 'Validate-only ack — Sprint 8.7+’da Laravel proxy eklenecek.',
    },
    { status: 202 },
  );
}

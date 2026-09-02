/**
 * `lib/api/config.ts`
 *
 * Merkezi API base URL konfigürasyonu.
 *
 * İki ayrı sabit gerekiyor çünkü Next.js client ve server farklı originlerde:
 *
 *  - `LARAVEL_BASE`  — server-side (Next.js API route'ları) Laravel backend'i
 *    doğrudan çağırır. `process.env.API_BASE_URL` veya
 *    `NEXT_PUBLIC_API_BASE_URL` (production'da Laravel public URL).
 *
 *  - `NEXT_API_BASE` — client-side (browser) Next.js API proxy katmanına gider.
 *    Her zaman relative (`/api`) → browser same-origin istek atar; CORS
 *    sorunu ortadan kalkar. Next.js proxy route'ları `auth()` ile
 *    accessToken'ı okur ve Laravel'a Bearer header ile forward eder.
 *
 * Mimari (Sprint 8.7+ / BFF):
 *   Browser → /api/projects  (Next.js proxy, same-origin)
 *          → http://localhost:8000/api/projects  (Laravel, server-to-server)
 *
 * Token akışı:
 *   NextAuth JWT cookie (HttpOnly) → `auth()` → Bearer header → Laravel.
 */

export const LARAVEL_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8000';

/**
 * Client tarafında tüm istekler bu relative base üzerinden gider.
 * Browser same-origin policy sayesinde CORS yok; Next.js proxy
 * session doğrulamasını server-side yapar.
 */
export const NEXT_API_BASE = '/api';

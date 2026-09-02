/**
 * `app/api/auth/[...nextauth]/route.ts`
 *
 * NextAuth v5 — GET/POST handler re-export.
 *
 * v5'te handler'lar `auth.ts` (root-level) dosyasından
 * `export const { handlers } = NextAuth(...)` olarak alınır
 * ve burada re-export edilir. Bu dosya asıl auth logiğini
 * içermiyor; sadece HTTP handler'ları döndürüyor.
 */

import { handlers } from '@/auth';

export const { GET, POST } = handlers;
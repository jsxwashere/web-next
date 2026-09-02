/**
 * `lib/db.ts`
 *
 * Sprint 7 cleanup: Prisma kaldırıldı (Laravel API kullanılıyor).
 *
 * Geriye dönük uyumluluk shim'i — `isUnique` / `getSettings` çağrıları
 * artık 404 (stub error) fırlatır. Yeni kod bu fonksiyonları
 * kullanmamalı; Laravel'a doğrudan istek atmalı.
 */

import { prisma } from '@/lib/prisma';

interface SystemSettingLike {
  id: string;
  [key: string]: unknown;
}

/**
 * @deprecated Prisma kaldırıldı — Sprint 7 cleanup.
 * @throws Bu fonksiyon artık çağrılamaz.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function isUnique(..._args: unknown[]): Promise<boolean> {
  void prisma;
  throw new Error(
    '[lib/db.ts] isUnique() kaldırıldı — Laravel API kullanılıyor. Sprint 7 cleanup.',
  );
}

/**
 * @deprecated Prisma kaldırıldı — Sprint 7 cleanup.
 * @throws Bu fonksiyon artık çağrılamaz.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSettings(..._args: unknown[]): Promise<SystemSettingLike | null> {
  void prisma;
  throw new Error(
    '[lib/db.ts] getSettings() kaldırıldı — Laravel API kullanılıyor. Sprint 7 cleanup.',
  );
}
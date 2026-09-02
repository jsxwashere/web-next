/**
 * `services/system-log.ts`
 *
 * Sprint 7 cleanup: Prisma kaldırıldı (Laravel API kullanılıyor).
 *
 * Bu fonksiyon artık no-op — çağrıldığında uyarı loglar ama
 * veritabanına yazmaz. Yeni kod Laravel API üzerinden log atmalı.
 */

export interface SystemLogProps {
  event: string;
  userId: string;
  entityId?: string;
  entityType?: string;
  description?: string;
  ipAddress?: string;
  meta?: string;
}

/**
 * @deprecated Prisma kaldırıldı — Sprint 7 cleanup. Bu fonksiyon
 * artık no-op; log'lar Laravel tarafına taşınmalı.
 */
export async function systemLog(
  props: SystemLogProps,
  _tx?: unknown,
): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[services/system-log.ts] systemLog() no-op — Prisma kaldırıldı.',
      props.event,
    );
  }
}
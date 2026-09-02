/**
 * `lib/prisma.ts`
 *
 * Sprint 7 cleanup: Prisma kaldırıldı (Laravel API kullanılıyor).
 *
 * Bu dosya artık sadece geriye dönük uyumluluk shim'i — eski
 * `import { prisma } from '@/lib/prisma'` çağrıları için boş bir
 * placeholder export eder. Yeni kod Prisma import etmemeli.
 *
 * Kaldırılma planı: Sprint 8'de user-management UI tarafı da
 * Laravel'a taşındığında bu dosya silinecek.
 */

const prisma = new Proxy(
  {},
  {
    get() {
      throw new Error(
        '[lib/prisma.ts] PrismaClient kaldırıldı — bu endpoint/backend ' +
          'artık Laravel API üzerinden çalışmalı. Sprint 7 cleanup.',
      );
    },
  },
);

export { prisma };
export default prisma;
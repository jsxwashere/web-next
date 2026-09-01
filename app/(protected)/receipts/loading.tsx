/**
 * `app/(protected)/receipts/loading.tsx`
 *
 * Sprint 6 — Makbuzlar listesi için özel route-level skeleton.
 * Header + upload area + 5 receipt row skeleton.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function ReceiptsLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-3 w-72" />
      </div>

      {/* Upload alanı */}
      <div className="rounded-lg border border-dashed border-border bg-muted/50 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

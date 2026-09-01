/**
 * `app/(protected)/firms/loading.tsx`
 *
 * Sprint 6 — Firmalar listesi için özel route-level skeleton.
 * Header + 6 type tab + 4 firm card skeleton.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function FirmsLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div>
        <Skeleton className="h-5 w-20" />
        <Skeleton className="mt-2 h-3 w-64" />
      </div>

      {/* Filtre bar */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="ms-auto h-8 w-64 rounded-md" />
      </div>

      {/* Firma kart skeletonları */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * `app/(protected)/personnel/loading.tsx`
 *
 * Sprint 6 — Personel listesi için özel route-level skeleton.
 * 3 stat kart + filtre bar + 4 person card skeleton.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonnelLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Filtre bar */}
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 w-64 rounded-md sm:ms-auto" />
      </div>

      {/* Personel kart skeletonları */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

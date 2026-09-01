/**
 * `app/(protected)/account/loading.tsx`
 *
 * Sprint 6 — Account layout skeleton. Nav sidebar + form area skeleton.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountLoading() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-64" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Account sub-nav */}
        <nav className="flex w-full shrink-0 flex-col gap-1 lg:w-56">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </nav>

        {/* Form area */}
        <div className="flex-1 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * `app/(protected)/projects/new/loading.tsx`
 *
 * Sprint 7 — Yeni proje sihirbazı skeleton.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function NewProjectLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="rounded-lg border border-border bg-card p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-3 h-10 w-full" />
        <Skeleton className="mt-3 h-10 w-full" />
      </div>
    </div>
  );
}
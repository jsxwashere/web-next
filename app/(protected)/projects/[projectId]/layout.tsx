'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { ProjectTabs } from '@/app/components/layouts/shell/project-tabs';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Sprint 2 — Proje bağlamı layout.
 *
 * `/projects/[projectId]/*` altındaki tüm sayfalar bu layout'tan geçer.
 * Tek sidebar zaten `(protected)/layout.tsx` üzerinden sağlanıyor;
 * burada proje modülleri (Genel, Tahsilatlar, …) yatay tab olarak gösterilir.
 */
export default function ProjectLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;

  if (!projectId) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <div className="flex flex-col">
      <ProjectTabs />
      <div className="grow">{children}</div>
    </div>
  );
}
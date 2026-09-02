'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { ProjectTabs } from '@/app/components/layouts/shell/project-tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectHero } from './_components/project-hero';

/**
 * Sprint 2 — Proje bağlamı layout.
 *
 * `/projects/[projectId]/*` altındaki tüm sayfalar bu layout'tan geçer.
 * Tek sidebar zaten `(protected)/layout.tsx` üzerinden sağlanıyor;
 * burada proje modülleri (Genel, Tahsilatlar, …) yatay tab olarak gösterilir.
 *
 * Sprint 8.3b — Tüm 9 proje içi sayfada paylaşılan `<ProjectHero />`
 * ProjectTabs'in hemen altında render edilir. Tabs sistemi değişmez.
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
      <ProjectHero projectId={projectId} />
      <div className="grow">{children}</div>
    </div>
  );
}
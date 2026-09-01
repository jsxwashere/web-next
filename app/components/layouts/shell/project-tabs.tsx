'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { PROJECT_TABS } from '@/config/project-tabs.config';
import { type ProjectTab } from '@/config/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Sprint 2 — Proje içi yatay sekmeler.
 *
 * `/projects/[projectId]` rotasının altında render edilir.
 * Aktif tab `usePathname` ile hesaplanır.
 *
 * "Genel" sekmesinin path segmenti boş olduğu için
 * `/projects/[projectId]` ile eşleşir.
 */
export function ProjectTabs() {
  const params = useParams<{ projectId: string }>();
  const pathname = usePathname();

  const projectId = params?.projectId ?? '';

  const activeTab = useMemo<ProjectTab>(() => {
    // pathname: /projects/[projectId]/<segment>
    const prefix = `/projects/${projectId}`;
    const rest = pathname.startsWith(prefix)
      ? pathname.slice(prefix.length).replace(/^\//, '')
      : '';
    const segment = rest.split('/')[0] ?? '';
    return (
      PROJECT_TABS.find((tab) => tab.segment === segment) ??
      PROJECT_TABS[0]!
    );
  }, [pathname, projectId]);

  return (
    <div className="border-b border-border bg-background">
      <Tabs value={activeTab.segment}>
        <TabsList
          variant="line"
          className="px-5 lg:px-6 h-12"
          aria-label="Proje modülleri"
        >
          {PROJECT_TABS.map((tab) => {
            const href =
              tab.segment === ''
                ? `/projects/${projectId}`
                : `/projects/${projectId}/${tab.segment}`;
            const Icon = tab.icon;
            const isActive = activeTab.segment === tab.segment;

            return (
              <TabsTrigger
                key={tab.segment || 'root'}
                value={tab.segment}
                disabled={tab.disabled}
                asChild
                className={cn(isActive && 'text-primary')}
              >
                <Link href={href} className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <span>{tab.title}</span>
                  {tab.badge && (
                    <span className="ms-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
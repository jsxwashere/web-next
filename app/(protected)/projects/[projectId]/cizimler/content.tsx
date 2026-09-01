'use client';

import { useMemo } from 'react';
import { FileImage, Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Container } from '@/components/common/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectDrawings } from '@/hooks/use-santiyepro-api';
import {
  DrawingStatus,
  DrawingStatusLabels,
  DrawingStatusVariants,
} from '@/lib/enums';
import type { Drawing } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatDateTr } from '@/lib/helpers';

/**
 * Sprint 5 — Çizimler (project-scoped).
 *
 * API: GET /api/projects/{projectId}/drawings
 *
 * DWG yükleme (multipart upload) Sprint 6'da Sheet/drawer'a taşınacak.
 */

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIdx = 0;
  while (size >= 1024 && unitIdx < units.length - 1) {
    size /= 1024;
    unitIdx++;
  }
  return `${size.toFixed(1)} ${units[unitIdx]}`;
}

export function DrawingsContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const drawingsQuery = useProjectDrawings(projectId);

  const drawings = useMemo<Drawing[]>(
    () => drawingsQuery.data?.data ?? [],
    [drawingsQuery.data],
  );

  if (drawingsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Container>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-medium">
              {t('pages.projectTabs.cizimler.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.cizimler.subtitle')}
            </p>
          </div>
          <Button size="sm">
            <Plus className="me-1 size-4" />
            {t('pages.projectTabs.cizimler.addDrawing')}
          </Button>
        </div>

        {/* Liste */}
        {drawings.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={FileImage}
                title={t('pages.projectTabs.cizimler.noDrawings')}
                description={t('pages.projectTabs.cizimler.noDrawingsDesc')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {drawings.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-blue-500/10">
                  <FileImage className="size-4 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">
                    {d.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {d.created_at && <span>{formatDateTr(d.created_at)}</span>}
                    <span>{formatFileSize(d.file_size)}</span>
                  </div>
                </div>
                <Badge
                  variant={DrawingStatusVariants[d.status] ?? 'secondary'}
                  className="shrink-0"
                >
                  {DrawingStatusLabels[d.status] ?? d.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
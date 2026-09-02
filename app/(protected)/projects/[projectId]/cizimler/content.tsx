'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileImage,
  Loader2,
  Plus,
  Search,
  X as XIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Container } from '@/components/common/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectDrawings } from '@/hooks/use-santiyepro-api';
import {
  DrawingStatus,
  DrawingStatusLabels,
  DrawingStatusVariants,
  type DrawingStatus as DrawingStatusKey,
} from '@/lib/enums';
import type { Drawing } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatDateTr } from '@/lib/helpers';
import { NewDrawingSheet } from './_components/new-drawing-sheet';

/**
 * Sprint 8.3b — Çizimler (project-scoped) — ŞantiyePro tasarımına uyarlandı.
 *
 * Taşınan özellikler:
 *  - Üst KPI'lar: Toplam çizim, parse edilmiş, bekleyen, başarısız
 *  - Filtre bar: Durum (pending/running/success/failed), arama
 *  - Çizim kartları: Dosya adı, format, boyut, parse durumu badge, tarih
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

function getFormatFromName(name: string): 'DWG' | 'DXF' | 'OTHER' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.dwg')) return 'DWG';
  if (lower.endsWith('.dxf')) return 'DXF';
  return 'OTHER';
}

type StatusFilter = 'all' | DrawingStatusKey;
type FormatFilter = 'all' | 'DWG' | 'DXF';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: DrawingStatus.PENDING, label: DrawingStatusLabels[DrawingStatus.PENDING] },
  { value: DrawingStatus.RUNNING, label: DrawingStatusLabels[DrawingStatus.RUNNING] },
  { value: DrawingStatus.SUCCESS, label: DrawingStatusLabels[DrawingStatus.SUCCESS] },
  { value: DrawingStatus.FAILED, label: DrawingStatusLabels[DrawingStatus.FAILED] },
];

export function DrawingsContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const drawingsQuery = useProjectDrawings(projectId);
  const [openNew, setOpenNew] = useState(false);

  const drawings = useMemo<Drawing[]>(
    () => drawingsQuery.data?.data ?? [],
    [drawingsQuery.data],
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');

  const stats = useMemo(() => {
    return {
      total: drawings.length,
      success: drawings.filter((d) => d.status === DrawingStatus.SUCCESS).length,
      pending: drawings.filter((d) => d.status === DrawingStatus.PENDING || d.status === DrawingStatus.RUNNING).length,
      failed: drawings.filter((d) => d.status === DrawingStatus.FAILED).length,
    };
  }, [drawings]);

  const filtered = useMemo(() => {
    return drawings.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (formatFilter !== 'all') {
        const fmt = getFormatFromName(d.name);
        if (fmt !== formatFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [drawings, search, statusFilter, formatFilter]);

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
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
          <Button size="sm" onClick={() => setOpenNew(true)}>
            <Plus className="me-1 size-4" />
            {t('pages.projectTabs.cizimler.addDrawing')}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileImage className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.cizimler.totalCount')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.cizimler.parsed')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{stats.success}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Clock className="size-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.cizimler.pending')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <AlertCircle className="size-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.cizimler.failed')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{stats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtre barı */}
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
          {/* Durum filtresi */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm',
                  statusFilter === s.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Format filtresi */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFormatFilter('all')}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                formatFilter === 'all'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t('pages.projectTabs.cizimler.formatAll')}
            </button>
            <button
              type="button"
              onClick={() => setFormatFilter('DWG')}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                formatFilter === 'DWG'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              DWG
            </button>
            <button
              type="button"
              onClick={() => setFormatFilter('DXF')}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                formatFilter === 'DXF'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              DXF
            </button>
          </div>

          {/* Arama */}
          <div className="relative flex-1 sm:ms-auto sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages.projectTabs.cizimler.title')}
              className="h-8 w-full ps-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Aramayı temizle"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={FileImage}
                title={
                  search || statusFilter !== 'all' || formatFilter !== 'all'
                    ? t('pages.projectTabs.cizimler.noResults')
                    : t('pages.projectTabs.cizimler.noDrawings')
                }
                description={
                  search || statusFilter !== 'all' || formatFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.cizimler.noDrawingsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((d) => {
              const fmt = getFormatFromName(d.name);
              const Icon =
                d.status === DrawingStatus.RUNNING
                  ? Loader2
                  : d.status === DrawingStatus.SUCCESS
                    ? CheckCircle2
                    : d.status === DrawingStatus.FAILED
                      ? AlertCircle
                      : Clock;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-md',
                      fmt === 'DWG'
                        ? 'bg-blue-500/10 text-blue-500'
                        : fmt === 'DXF'
                          ? 'bg-violet-500/10 text-violet-500'
                          : 'bg-gray-500/10 text-gray-500',
                    )}
                  >
                    <FileImage className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-foreground">
                        {d.name}
                      </p>
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                        {fmt}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {d.created_at && (
                        <span>{formatDateTr(d.created_at)}</span>
                      )}
                      {d.file_size && (
                        <>
                          <span>·</span>
                          <span>{formatFileSize(d.file_size)}</span>
                        </>
                      )}
                      {d.status === DrawingStatus.RUNNING && (
                        <>
                          <span>·</span>
                          <span className="text-blue-500">
                            AI tarafından işleniyor
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={DrawingStatusVariants[d.status] ?? 'secondary'}
                    appearance="light"
                    className="shrink-0 gap-1"
                  >
                    <Icon
                      className={cn(
                        'size-3',
                        d.status === DrawingStatus.RUNNING && 'animate-spin',
                      )}
                    />
                    {DrawingStatusLabels[d.status] ?? d.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewDrawingSheet
        open={openNew}
        onOpenChange={setOpenNew}
        projectId={projectId}
      />
    </Container>
  );
}
'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle2,
  Download,
  Plus,
  Search,
  TrendingUp,
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
import { useProjectCollections } from '@/hooks/use-santiyepro-api';
import type { Collection } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, formatDateTr } from '@/lib/helpers';
import { NewCollectionSheet } from './_components/new-collection-sheet';

/**
 * Sprint 8.3a — Tahsilatlar content (ŞantiyePro tasarımına uyarlandı).
 *
 * API: GET /api/collections?project_id={projectId}
 *
 * Senaryolar: boş durum, yükleme, dolu liste + filtreleme + KPI'lar + tablar.
 */

type StatusFilter = 'all' | 'on_time' | 'scheduled' | 'delayed';

const PAYMENT_TYPE_BADGES: Record<string, 'secondary' | 'success' | 'warning' | 'destructive' | 'info'> = {
  cash: 'success',
  bank_transfer: 'info',
  check: 'warning',
  credit_card: 'secondary',
  other: 'secondary',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  cash: 'Nakit',
  bank_transfer: 'Havale/EFT',
  check: 'Çek',
  credit_card: 'Kredi Kartı',
  other: 'Diğer',
};

/**
 * Tahsilatın durumunu hesapla:
 * - Tahsil tarihi yoksa → Zamanında
 * - Tarih bugünden önceyse → Gecikmiş
 * - Tarih bugünse → Zamanında
 * - Tarih bugünden sonraysa → Vadeli
 */
function getCollectionStatus(c: Collection): StatusFilter {
  const due = c.collection_date;
  if (!due) return 'on_time';
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return 'on_time';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  if (d < today) return 'delayed';
  if (d.getTime() === today.getTime()) return 'on_time';
  return 'scheduled';
}

export function TahsilatlarContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const collectionsQuery = useProjectCollections(projectId);

  const collections = useMemo<Collection[]>(
    () => collectionsQuery.data?.data ?? [],
    [collectionsQuery.data],
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openNew, setOpenNew] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    let thisMonth = 0;
    let overdueCount = 0;
    let overdueTotal = 0;
    let onTimeCount = 0;
    let daysCovered: Record<string, boolean> = {};

    for (const c of collections) {
      const d = c.collection_date ? new Date(c.collection_date) : null;
      if (d && d >= monthStart) thisMonth += c.amount ?? 0;

      const status = getCollectionStatus(c);
      if (status === 'delayed') {
        overdueCount += 1;
        overdueTotal += c.amount ?? 0;
      } else if (status === 'on_time') {
        onTimeCount += 1;
      }

      if (d && d <= todayStart) {
        daysCovered[d.toISOString().slice(0, 10)] = true;
      }
    }

    const dayCount = Math.max(1, Object.keys(daysCovered).length);
    const totalAmount = collections.reduce((s, c) => s + (c.amount ?? 0), 0);
    const dailyAvg = totalAmount / dayCount;

    const successRate =
      overdueCount + onTimeCount > 0
        ? Math.round((onTimeCount / (overdueCount + onTimeCount)) * 100)
        : 100;

    return {
      thisMonth,
      overdueCount,
      overdueTotal,
      dailyAvg,
      successRate,
    };
  }, [collections]);

  const filtered = useMemo(() => {
    return collections.filter((c) => {
      if (statusFilter !== 'all' && getCollectionStatus(c) !== statusFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matches =
          (c.description ?? '').toLowerCase().includes(q) ||
          (c.payment_type ?? '').toLowerCase().includes(q) ||
          (c.reference_type ?? '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [collections, search, statusFilter]);

  const handleExportCsv = () => {
    const rows: string[] = ['Tarih,Tutar,Para Birimi,Ödeme Tipi,Durum,Açıklama'];
    for (const c of filtered) {
      rows.push(
        [
          c.collection_date ?? '',
          String(c.amount ?? 0),
          c.currency ?? 'TRY',
          PAYMENT_TYPE_LABELS[c.payment_type ?? ''] ?? c.payment_type ?? '',
          getCollectionStatus(c),
          (c.description ?? '').replace(/"/g, '""'),
        ]
          .map((v) => `"${String(v)}"`)
          .join(','),
      );
    }
    const blob = new Blob(['﻿' + rows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tahsilatlar-${projectId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (collectionsQuery.isLoading) {
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
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="ms-auto h-8 w-64 rounded-md" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
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
              {t('pages.projectTabs.tahsilatlar.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.tahsilatlar.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {filtered.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleExportCsv}>
                <Download className="me-1 size-4" />
                {t('pages.projectTabs.tahsilatlar.exportCsv')}
              </Button>
            )}
            <Button size="sm" onClick={() => setOpenNew(true)}>
              <Plus className="me-1 size-4" />
              {t('pages.projectTabs.tahsilatlar.addCollection')}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Banknote className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.tahsilatlar.thisMonth')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatAmount(stats.thisMonth)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <TrendingUp className="size-4 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.tahsilatlar.dailyAvg')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatAmount(stats.dailyAvg)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'rounded-lg p-3',
                    stats.overdueCount > 0
                      ? 'bg-rose-500/10'
                      : 'bg-emerald-500/10',
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      'size-4',
                      stats.overdueCount > 0
                        ? 'text-rose-500'
                        : 'text-emerald-500',
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.tahsilatlar.overdue')}
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-bold tabular-nums',
                      stats.overdueCount > 0 && 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {stats.overdueCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <CheckCircle2 className="size-4 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.tahsilatlar.count')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {collections.length}
                    <span className="ms-2 text-sm font-medium text-muted-foreground">
                      ({stats.successRate}%)
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue alert */}
        {stats.overdueCount > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              {t('pages.projectTabs.tahsilatlar.overdueAlert', {
                count: stats.overdueCount,
                amount: formatAmount(stats.overdueTotal),
              })}
            </span>
          </div>
        )}

        {/* Filter chips + search */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {(
            [
              {
                value: 'all' as StatusFilter,
                label: t('pages.projectTabs.tahsilatlar.all'),
              },
              {
                value: 'on_time' as StatusFilter,
                label: t('pages.projectTabs.tahsilatlar.onTime'),
              },
              {
                value: 'scheduled' as StatusFilter,
                label: t('pages.projectTabs.tahsilatlar.scheduled'),
              },
              {
                value: 'delayed' as StatusFilter,
                label: t('pages.projectTabs.tahsilatlar.delayed'),
              },
            ]
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {tab.label}
            </button>
          ))}

          <div className="relative ms-auto w-full sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages.projectTabs.tahsilatlar.searchPlaceholder')}
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

        {/* List */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Banknote}
                title={
                  search || statusFilter !== 'all'
                    ? t('pages.projectTabs.tahsilatlar.noResults')
                    : t('pages.projectTabs.tahsilatlar.noCollections')
                }
                description={
                  search || statusFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.tahsilatlar.noCollectionsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((collection) => {
              const status = getCollectionStatus(collection);
              const statusBadge: {
                label: string;
                variant: 'success' | 'warning' | 'destructive';
              } =
                status === 'delayed'
                  ? {
                      label: t('pages.projectTabs.tahsilatlar.delayed'),
                      variant: 'destructive',
                    }
                  : status === 'scheduled'
                    ? {
                        label: t('pages.projectTabs.tahsilatlar.scheduled'),
                        variant: 'warning',
                      }
                    : {
                        label: t('pages.projectTabs.tahsilatlar.onTime'),
                        variant: 'success',
                      };

              return (
                <div
                  key={collection.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-500/10">
                    <Banknote className="size-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-bold text-foreground">
                        {collection.description || 'Tahsilat'}
                      </p>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatAmount(collection.amount, collection.currency ?? 'TRY')}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {collection.collection_date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDateTr(collection.collection_date)}
                        </span>
                      )}
                      {collection.payment_type && (
                        <Badge
                          variant={PAYMENT_TYPE_BADGES[collection.payment_type] ?? 'secondary'}
                          className="h-4 px-1.5 text-[10px]"
                        >
                          {PAYMENT_TYPE_LABELS[collection.payment_type] ?? collection.payment_type}
                        </Badge>
                      )}
                      <Badge
                        variant={statusBadge.variant}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewCollectionSheet
        open={openNew}
        onOpenChange={setOpenNew}
        projectId={projectId}
      />
    </Container>
  );
}
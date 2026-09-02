'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  Download,
  FileText,
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
import { useProjectEntitlements } from '@/hooks/use-santiyepro-api';
import {
  EntitlementStatus,
  EntitlementStatusLabels,
  EntitlementStatusVariants,
  type EntitlementStatus as EntitlementStatusKey,
} from '@/lib/enums';
import type { Entitlement } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, formatDateTr } from '@/lib/helpers';
import { NewEntitlementSheet } from './_components/new-entitlement-sheet';

/**
 * Sprint 8.3a — Hakediş (ŞantiyePro tasarımına uyarlandı).
 *
 * API: GET /api/projects/{projectId}/entitlements
 *
 * Filtreler: status (pending/in_review/approved/rejected), search.
 */

const STATUS_FILTERS: { value: 'all' | EntitlementStatusKey; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: EntitlementStatus.PENDING, label: EntitlementStatusLabels[EntitlementStatus.PENDING] },
  { value: EntitlementStatus.IN_REVIEW, label: EntitlementStatusLabels[EntitlementStatus.IN_REVIEW] },
  { value: EntitlementStatus.APPROVED, label: EntitlementStatusLabels[EntitlementStatus.APPROVED] },
  { value: EntitlementStatus.REJECTED, label: EntitlementStatusLabels[EntitlementStatus.REJECTED] },
];

export function HakedisContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EntitlementStatusKey>('all');
  const [openNew, setOpenNew] = useState(false);

  const entitlementsQuery = useProjectEntitlements(projectId, {
    search: search || undefined,
    status: statusFilter === 'all' ? 'all' : statusFilter,
  });

  const entitlements = useMemo<Entitlement[]>(
    () => entitlementsQuery.data?.data ?? [],
    [entitlementsQuery.data],
  );

  const summary = entitlementsQuery.data?.summary;

  const collected = useMemo(
    () =>
      entitlements
        .filter((e) => e.status === EntitlementStatus.APPROVED)
        .reduce((sum, e) => sum + (e.total_amount ?? 0), 0),
    [entitlements],
  );

  const totalAmount = summary?.total_amount ?? 0;
  const pendingAmount = summary?.pending_amount ?? 0;
  const remaining = Math.max(0, totalAmount - collected);
  const collectionRate =
    totalAmount > 0 ? Math.min(100, Math.round((collected / totalAmount) * 100)) : 0;

  const handleExportCsv = () => {
    const headers = [
      'Tarih',
      'Firma',
      'Sözleşme',
      'Tutar',
      'Para Birimi',
      'Durum',
    ];
    const rows: string[] = [headers.join(',')];
    for (const e of entitlements) {
      rows.push(
        [
          e.delivery_date ?? '',
          e.firm_name ?? '',
          '', // contract name not in summary response
          String(e.total_amount ?? 0),
          '', // currency
          EntitlementStatusLabels[e.status] ?? e.status,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      );
    }
    const blob = new Blob(['﻿' + rows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hakedis-${projectId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (entitlementsQuery.isLoading) {
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
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
          <Skeleton className="ms-auto h-8 w-64 rounded-md" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
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
              {t('pages.projectTabs.hakedis.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.hakedis.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {entitlements.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleExportCsv}>
                <Download className="me-1 size-4" />
                CSV
              </Button>
            )}
            <Button size="sm" onClick={() => setOpenNew(true)}>
              <Plus className="me-1 size-4" />
              {t('pages.projectTabs.hakedis.addEntitlement')}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <ClipboardList className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.hakedis.total')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatAmount(totalAmount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {summary?.total ?? 0}{' '}
                    {t('pages.projectTabs.hakedis.count').toLowerCase()}
                  </p>
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.hakedis.collected')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatAmount(collected)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {collectionRate}% {t('pages.projectTabs.hakedis.progress').toLowerCase()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <Clock className="size-4 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.hakedis.pending')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {formatAmount(pendingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-3">
                  <DollarSign className="size-4 text-violet-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.hakedis.remaining')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatAmount(remaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtre barı */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {s.label}
            </button>
          ))}

          <div className="relative ms-auto w-full sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages.projectTabs.hakedis.searchPlaceholder')}
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
        {entitlements.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={ClipboardList}
                title={t('pages.projectTabs.hakedis.noEntitlements')}
                description={
                  search || statusFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.hakedis.noEntitlementsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {entitlements.map((e) => {
              const progress =
                totalAmount > 0
                  ? Math.min(
                      100,
                      Math.round(
                        ((e.status === EntitlementStatus.APPROVED
                          ? e.total_amount
                          : 0) /
                          totalAmount) *
                          100,
                      ),
                    )
                  : 0;

              return (
                <div
                  key={e.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10">
                      <FileText className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {e.firm_name ?? 'Firma belirtilmemiş'}
                          </p>
                          {e.delivery_date && (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="size-3" />
                              {formatDateTr(e.delivery_date)}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                          {formatAmount(e.total_amount)}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant={EntitlementStatusVariants[e.status] ?? 'secondary'}
                          className="h-4 px-1.5 text-[10px]"
                        >
                          {EntitlementStatusLabels[e.status] ?? e.status}
                        </Badge>
                        {e.details && e.details.length > 0 && (
                          <span className="text-[10px]">
                            · {e.details.length}{' '}
                            {t('pages.projectTabs.hakedis.items')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar — sadece approved ise yeşil */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="size-3" />
                        {t('pages.projectTabs.hakedis.progress')}
                      </span>
                      <span className="tabular-nums">
                        {e.status === EntitlementStatus.APPROVED
                          ? formatAmount(e.total_amount)
                          : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full transition-all',
                          e.status === EntitlementStatus.APPROVED
                            ? 'bg-emerald-500'
                            : e.status === EntitlementStatus.REJECTED
                              ? 'bg-rose-500'
                              : 'bg-amber-500',
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewEntitlementSheet
        open={openNew}
        onOpenChange={setOpenNew}
        projectId={projectId}
      />
    </Container>
  );
}
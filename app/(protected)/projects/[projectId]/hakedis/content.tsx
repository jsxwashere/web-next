'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, Download, Search, X as XIcon } from 'lucide-react';
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

/**
 * Sprint 5 — Hakediş (project-scoped).
 *
 * API: GET /api/projects/{projectId}/entitlements
 *
 * Filtreler: status (pending/in_review/approved/rejected), search
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

  const entitlementsQuery = useProjectEntitlements(projectId, {
    search: search || undefined,
    status: statusFilter === 'all' ? 'all' : statusFilter,
  });

  const entitlements = useMemo<Entitlement[]>(
    () => entitlementsQuery.data?.data ?? [],
    [entitlementsQuery.data],
  );

  const summary = entitlementsQuery.data?.summary;

  const filteredTotal = useMemo(
    () => entitlements.reduce((sum, e) => sum + (e.total_amount ?? 0), 0),
    [entitlements],
  );

  const handleExportCsv = () => {
    const rows: string[] = ['Tarih,Firma,Sözleşme,Tutar,Durum'];
    for (const e of entitlements) {
      rows.push(
        [
          e.delivery_date ?? '',
          e.firm_name ?? '',
          '', // contract name not in summary response
          e.total_amount ?? 0,
          EntitlementStatusLabels[e.status] ?? e.status,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      );
    }
    const blob = new Blob([rows.join('\n')], {
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
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
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
              {t('pages.projectTabs.hakedis.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.hakedis.subtitle')}
            </p>
          </div>
          {entitlements.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleExportCsv}>
              <Download className="me-1 size-4" />
              CSV
            </Button>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.hakedis.count')}
              </p>
              <p className="text-2xl font-bold">{summary?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.hakedis.approved')}: {summary?.approved ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.hakedis.total')}
              </p>
              <p className="text-2xl font-bold">
                {formatAmount(summary?.total_amount ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.hakedis.pending')}
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatAmount(summary?.pending_amount ?? 0)}
              </p>
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
                title={
                  search || statusFilter !== 'all'
                    ? t('pages.projectTabs.hakedis.noEntitlements')
                    : t('pages.projectTabs.hakedis.noEntitlements')
                }
                description={
                  search || statusFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.hakedis.noEntitlementsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {entitlements.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10">
                    <ClipboardList className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {e.firm_name ?? 'Firma belirtilmemiş'}
                        </p>
                        {e.delivery_date && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDateTr(e.delivery_date)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-bold tabular-nums text-foreground shrink-0">
                        {formatAmount(e.total_amount)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant={EntitlementStatusVariants[e.status] ?? 'secondary'}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {EntitlementStatusLabels[e.status] ?? e.status}
                      </Badge>
                      {e.details && e.details.length > 0 && (
                        <span className="text-[10px]">
                          {e.details.length} kalem
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredTotal !== (summary?.total_amount ?? 0) && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                <span>Filtreli toplam</span>
                <span className="font-bold text-foreground">
                  {formatAmount(filteredTotal)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
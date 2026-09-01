'use client';

import { useMemo, useState } from 'react';
import { FileText, Plus, Search, X as XIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Container } from '@/components/common/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectContracts } from '@/hooks/use-santiyepro-api';
import {
  ContractStatusLabels,
  ContractStatusVariants,
  ContractType,
  ContractTypeLabels,
  ContractTypeVariants,
  type ContractStatus as ContractStatusKey,
  type ContractType as ContractTypeKey,
} from '@/lib/enums';
import type { Contract } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, formatDateTr } from '@/lib/helpers';

/**
 * Sprint 5 — Sözleşmeler (project-scoped).
 *
 * API: GET /api/projects/{projectId}/contracts
 *
 * Filtreler: type (sabit/birim/malzeme), status, search
 */

const STATUS_FILTERS: { value: 'all' | ContractStatusKey; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: ContractStatusLabels.active },
  { value: 'in_progress', label: ContractStatusLabels.in_progress },
  { value: 'completed', label: ContractStatusLabels.completed },
  { value: 'cancelled', label: ContractStatusLabels.cancelled },
];

export function SozlesmelerContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContractTypeKey>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatusKey>('all');

  const contractsQuery = useProjectContracts(projectId, {
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const contracts = useMemo<Contract[]>(
    () => contractsQuery.data?.data ?? [],
    [contractsQuery.data],
  );
  const summary = contractsQuery.data?.summary;

  if (contractsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
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
              {t('pages.projectTabs.sozlesmeler.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.sozlesmeler.subtitle')}
            </p>
          </div>
          <Button size="sm">
            <Plus className="me-1 size-4" />
            {t('pages.projectTabs.sozlesmeler.addContract')}
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.sozlesmeler.count')}
              </p>
              <p className="text-2xl font-bold">{summary?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">
                Aktif: {summary?.active ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.sozlesmeler.total')}
              </p>
              <p className="text-2xl font-bold">
                {formatAmount(summary?.total_amount ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.sozlesmeler.paid')}
              </p>
              <p className="text-2xl font-bold">
                {formatAmount(summary?.paid ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Kalan:{' '}
                {formatAmount(
                  (summary?.total_amount ?? 0) - (summary?.paid ?? 0),
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {/* Type filter */}
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              typeFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            Tüm Tipler
          </button>
          {(Object.values(ContractType) as ContractTypeKey[]).map((ct) => (
            <button
              key={ct}
              type="button"
              onClick={() => setTypeFilter(ct)}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === ct
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {ContractTypeLabels[ct]}
            </button>
          ))}

          {/* Status filter */}
          <div className="ms-auto flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | ContractStatusKey)
              }
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('pages.projectTabs.sozlesmeler.searchPlaceholder')}
                className="h-8 w-48 ps-8 sm:w-64"
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
        </div>

        {/* List */}
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={FileText}
                title={
                  search || typeFilter !== 'all' || statusFilter !== 'all'
                    ? t('pages.projectTabs.sozlesmeler.noResults')
                    : t('pages.projectTabs.sozlesmeler.noContracts')
                }
                description={
                  search || typeFilter !== 'all' || statusFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.sozlesmeler.noContractsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {contracts.map((c) => {
              const paid = Number(c.paid_amount ?? 0);
              const total = Number(c.total_amount ?? 0);
              const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

              return (
                <div
                  key={c.id}
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
                            {c.name}
                          </p>
                          {c.firm?.name && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {c.firm.name}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-bold tabular-nums text-foreground shrink-0">
                          {formatAmount(total)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {c.start_date && <span>{formatDateTr(c.start_date)}</span>}
                        <Badge
                          variant={ContractTypeVariants[c.type] ?? 'secondary'}
                          className="h-4 px-1.5 text-[10px]"
                        >
                          {ContractTypeLabels[c.type] ?? c.type}
                        </Badge>
                        <Badge
                          variant={ContractStatusVariants[c.status] ?? 'secondary'}
                          className="h-4 px-1.5 text-[10px]"
                        >
                          {ContractStatusLabels[c.status] ?? c.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        Ödenen: <span className="font-semibold text-foreground">{formatAmount(paid)}</span>
                      </span>
                      <span className="tabular-nums">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
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
    </Container>
  );
}
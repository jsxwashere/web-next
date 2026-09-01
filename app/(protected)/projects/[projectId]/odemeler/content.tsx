'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Search,
  X as XIcon,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Container } from '@/components/common/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectTransactions } from '@/hooks/use-santiyepro-api';
import type { Transaction } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, formatDateTr } from '@/lib/helpers';
import { TransactionKindLabels } from '@/lib/enums';

/**
 * Sprint 5 — Ödemeler (birleşik gelir/gider tablosu).
 *
 * API: GET /api/projects/{projectId}/transactions
 * Query params: search, type (all|expense|income), sources[],
 *   kinds[], start_date, end_date, status (paid|unpaid)
 *
 * Senaryolar: boş durum, yükleme, dolu liste + filtreleme
 */

type TypeFilter = 'all' | 'expense' | 'income';

const KIND_SOURCE_MAP: Record<string, string> = {
  firm_payment: 'expense',
  employee_payment: 'employee',
  salary_payment: 'employee',
  collection: 'income',
  owner_payment: 'income',
  kd_payment: 'income',
  kd_collection: 'income',
  barter: 'income',
};

const SOURCE_LABELS: Record<string, string> = {
  expense: 'Firma',
  employee: 'Personel',
  income: 'Gelir',
};

const SOURCE_COLORS: Record<string, string> = {
  expense: 'bg-rose-500/10 text-rose-600',
  employee: 'bg-amber-500/10 text-amber-600',
  income: 'bg-emerald-500/10 text-emerald-600',
};

export function OdemelerContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const transactionsQuery = useProjectTransactions(projectId, {
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const transactions = useMemo<Transaction[]>(
    () => transactionsQuery.data?.data ?? [],
    [transactionsQuery.data],
  );

  const totals = transactionsQuery.data?.totals;
  const overallTotals = transactionsQuery.data?.overall_totals;
  const overdue = transactionsQuery.data?.overdue;

  if (transactionsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
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
              {t('pages.projectTabs.odemeler.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.odemeler.subtitle')}
            </p>
          </div>
          <Button size="sm">
            <CreditCard className="me-1 size-4" />
            {t('pages.projectTabs.odemeler.addTransaction')}
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-rose-500/10 p-3">
                  <ArrowUpRight className="size-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.odemeler.expense')}
                  </p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {formatAmount(overallTotals?.expense ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <ArrowDownRight className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.odemeler.income')}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatAmount(overallTotals?.income ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <CreditCard className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.odemeler.net')}
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      (overallTotals?.net ?? 0) >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {formatAmount(overallTotals?.net ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue alert */}
        {(overdue?.count ?? 0) > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              {overdue?.count} gecikmiş ödeme — toplam{' '}
              <span className="font-bold">{formatAmount(overdue?.total ?? 0)}</span>
            </span>
          </div>
        )}

        {/* Filtre barı */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
          {(
            [
              { value: 'all', label: t('pages.projectTabs.odemeler.all') },
              { value: 'expense', label: t('pages.projectTabs.odemeler.expenseOnly') },
              { value: 'income', label: t('pages.projectTabs.odemeler.incomeOnly') },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setTypeFilter(tab.value)}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === tab.value
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
              placeholder={t('pages.projectTabs.odemeler.searchPlaceholder')}
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
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={CreditCard}
                title={
                  search || typeFilter !== 'all'
                    ? t('pages.projectTabs.odemeler.noResults')
                    : t('pages.projectTabs.odemeler.noTransactions')
                }
                description={
                  search || typeFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.odemeler.noTransactionsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const source = KIND_SOURCE_MAP[tx.kind] ?? 'income';
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-md',
                      SOURCE_COLORS[source] ?? 'bg-muted',
                    )}
                  >
                    {isIncome ? (
                      <ArrowDownRight className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {tx.description ??
                            tx.firm_name ??
                            tx.employee_name ??
                            TransactionKindLabels[tx.kind] ??
                            tx.kind}
                        </p>
                        {tx.firm_name && tx.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {tx.firm_name}
                          </p>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-sm font-bold tabular-nums shrink-0',
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400',
                        )}
                      >
                        {isIncome ? '+' : '-'}
                        {formatAmount(tx.amount)}
                      </p>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {tx.date && <span>{formatDateTr(tx.date)}</span>}
                      <Badge
                        variant={isIncome ? 'success' : 'destructive'}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {SOURCE_LABELS[source] ?? tx.kind}
                      </Badge>
                      {!tx.is_paid && (
                        <Badge variant="warning" className="h-4 px-1.5 text-[10px]">
                          Bekliyor
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filtered totals */}
        {totals && transactions.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <span>Filtrelenen sonuçlar</span>
            <div className="flex items-center gap-4">
              <span>
                Gider: <span className="font-bold">{formatAmount(totals.expense)}</span>
              </span>
              <span>
                Gelir: <span className="font-bold">{formatAmount(totals.income)}</span>
              </span>
              <span>
                Net: <span className="font-bold">{formatAmount(totals.net)}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

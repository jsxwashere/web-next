'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
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
import { useProjectTransactions } from '@/hooks/use-santiyepro-api';
import type { Transaction } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, formatDateTr } from '@/lib/helpers';
import { PaymentTypeLabels, TransactionKindLabels } from '@/lib/enums';
import { NewPaymentSheet } from './_components/new-payment-sheet';
import { PaymentDetailDrawer } from './_components/payment-detail-drawer';

/**
 * Sprint 8.3a — Ödemeler (ŞantiyePro tasarımına uyarlandı).
 *
 * API: GET /api/projects/{projectId}/transactions
 * Query params: search, type (all|expense|income)
 *
 * Senaryolar: boş durum, yükleme, dolu liste + sekmeler + KPI'lar + uyarılar.
 */

type TypeFilter = 'all' | 'expense' | 'income';
type StatusFilter = 'all' | 'paid' | 'unpaid';

const KIND_SOURCE_MAP: Record<string, 'expense' | 'employee' | 'income'> = {
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

/**
 * Ödemenin durumu:
 * - is_paid → ÖDENDİ
 * - tarihi geçmiş → GECİKTİ
 * - yoksa → GELECEK
 */
function getPaymentStatus(item: Transaction): {
  label: string;
  variant: 'success' | 'warning' | 'destructive' | 'info';
} {
  if (item.is_paid) {
    return { label: 'ÖDENDİ', variant: 'success' };
  }
  if (!item.date) {
    return { label: 'GELECEK', variant: 'warning' };
  }
  const due = new Date(item.date);
  if (Number.isNaN(due.getTime())) {
    return { label: 'GELECEK', variant: 'warning' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today
    ? { label: 'GECİKTİ', variant: 'destructive' }
    : { label: 'GELECEK', variant: 'warning' };
}

export function OdemelerContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openNew, setOpenNew] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const transactionsQuery = useProjectTransactions(projectId, {
    search: searchText || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const transactions = useMemo<Transaction[]>(
    () => transactionsQuery.data?.data ?? [],
    [transactionsQuery.data],
  );

  const totals = transactionsQuery.data?.totals;
  const overallTotals = transactionsQuery.data?.overall_totals;
  const overdue = transactionsQuery.data?.overdue;

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (statusFilter === 'paid' && !tx.is_paid) return false;
      if (statusFilter === 'unpaid' && tx.is_paid) return false;
      return true;
    });
  }, [transactions, statusFilter]);

  const filteredExpense = useMemo(
    () =>
      filtered
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + (tx.amount ?? 0), 0),
    [filtered],
  );
  const filteredIncome = useMemo(
    () =>
      filtered
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + (tx.amount ?? 0), 0),
    [filtered],
  );

  const handleExportCsv = () => {
    const headers = [
      'Tür',
      'Tarih',
      'Tutar',
      'Para Birimi',
      'Ödeme Tipi',
      'Firma',
      'Personel',
      'Sözleşme',
      'Kategori',
      'Durum',
      'Açıklama',
    ];
    const rows: string[] = [headers.join(',')];
    for (const tx of filtered) {
      const status = getPaymentStatus(tx).label;
      const type = tx.type === 'expense' ? 'Gider' : 'Gelir';
      const paymentType =
        tx.source === 'expense'
          ? (PaymentTypeLabels[tx.payment_type ?? ''] ?? tx.payment_type ?? '')
          : (TransactionKindLabels[tx.kind ?? ''] ?? '');
      rows.push(
        [
          type,
          tx.date ?? '',
          String(tx.amount ?? 0),
          tx.currency ?? 'TRY',
          paymentType,
          tx.firm_name ?? '',
          tx.employee_name ?? '',
          tx.contract_name ?? '',
          tx.category_name ?? '',
          status,
          (tx.description ?? '').replace(/"/g, '""'),
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
    link.download = `odemeler-${projectId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (transactionsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-72" />
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
          <div className="flex items-center gap-2">
            {filtered.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleExportCsv}>
                <Download className="me-1 size-4" />
                {t('pages.projectTabs.odemeler.exportCsv')}
              </Button>
            )}
            <Button size="sm" onClick={() => setOpenNew(true)}>
              <Plus className="me-1 size-4" />
              {t('pages.projectTabs.odemeler.addTransaction')}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-rose-500/10 p-3">
                  <ArrowUpRight className="size-4 text-rose-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.odemeler.expense')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.odemeler.income')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.odemeler.net')}
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-bold tabular-nums',
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

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'rounded-lg p-3',
                    (overdue?.count ?? 0) > 0
                      ? 'bg-rose-500/10'
                      : 'bg-emerald-500/10',
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      'size-4',
                      (overdue?.count ?? 0) > 0
                        ? 'text-rose-500'
                        : 'text-emerald-500',
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.odemeler.overdueCount')}
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-bold tabular-nums',
                      (overdue?.count ?? 0) > 0 &&
                        'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {overdue?.count ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatAmount(overdue?.total ?? 0)}
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
              {t('pages.projectTabs.odemeler.overdueAlert', {
                count: overdue?.count ?? 0,
                amount: formatAmount(overdue?.total ?? 0),
              })}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {(
            [
              {
                value: 'all' as TypeFilter,
                label: t('pages.projectTabs.odemeler.all'),
              },
              {
                value: 'expense' as TypeFilter,
                label: t('pages.projectTabs.odemeler.expenseOnly'),
              },
              {
                value: 'income' as TypeFilter,
                label: t('pages.projectTabs.odemeler.incomeOnly'),
              },
            ]
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

          {/* Status filter */}
          <div className="ms-2 flex items-center gap-1 border-s border-border ps-3">
            {(
              [
                {
                  value: 'all' as StatusFilter,
                  label: t('common.labels.all'),
                  icon: undefined as undefined,
                },
                {
                  value: 'paid' as StatusFilter,
                  label: t('pages.projectTabs.odemeler.statusPaid'),
                  icon: <CheckCircle2 className="me-1 size-3" />,
                },
                {
                  value: 'unpaid' as StatusFilter,
                  label: t('pages.projectTabs.odemeler.unpaidOnly'),
                  icon: <Clock className="me-1 size-3" />,
                },
              ]
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                  statusFilter === tab.value
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative ms-auto w-full sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages.projectTabs.odemeler.searchPlaceholder')}
              className="h-8 w-full ps-8"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
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
                icon={CreditCard}
                title={
                  searchText || typeFilter !== 'all' || statusFilter !== 'all'
                    ? t('pages.projectTabs.odemeler.noResults')
                    : t('pages.projectTabs.odemeler.noTransactions')
                }
                description={
                  searchText || typeFilter !== 'all' || statusFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.odemeler.noTransactionsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => {
              const source = KIND_SOURCE_MAP[tx.kind] ?? 'income';
              const isIncome = tx.type === 'income';
              const status = getPaymentStatus(tx);

              return (
                <div
                  key={tx.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(tx.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(tx.id);
                    }
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
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
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          {tx.firm_name && tx.description && (
                            <span>{tx.firm_name}</span>
                          )}
                          {tx.contract_name && (
                            <span className="inline-flex items-center gap-1">
                              · {t('pages.projectTabs.odemeler.contract')}:{' '}
                              {tx.contract_name}
                            </span>
                          )}
                          {tx.category_name && (
                            <span className="inline-flex items-center gap-1">
                              · {tx.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <p
                        className={cn(
                          'shrink-0 text-sm font-bold tabular-nums',
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400',
                        )}
                      >
                        {isIncome ? '+' : '-'}
                        {formatAmount(tx.amount)}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {tx.date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDateTr(tx.date)}
                        </span>
                      )}
                      <Badge
                        variant={isIncome ? 'success' : 'destructive'}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {SOURCE_LABELS[source] ?? tx.kind}
                      </Badge>
                      <Badge
                        variant={status.variant}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {status.label}
                      </Badge>
                      {tx.payment_type && tx.source === 'expense' && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 text-[10px]"
                        >
                          {PaymentTypeLabels[tx.payment_type] ?? tx.payment_type}
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
        {filtered.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <span>{t('pages.projectTabs.odemeler.filteredTotals')}</span>
            <div className="flex items-center gap-4">
              <span>
                {t('pages.projectTabs.odemeler.expenseOnly')}:{' '}
                <span className="font-bold text-rose-600 tabular-nums">
                  {formatAmount(filteredExpense)}
                </span>
              </span>
              <span>
                {t('pages.projectTabs.odemeler.incomeOnly')}:{' '}
                <span className="font-bold text-emerald-600 tabular-nums">
                  {formatAmount(filteredIncome)}
                </span>
              </span>
              <span>
                {t('pages.projectTabs.odemeler.net')}:{' '}
                <span
                  className={cn(
                    'font-bold tabular-nums',
                    filteredIncome - filteredExpense >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600',
                  )}
                >
                  {formatAmount(filteredIncome - filteredExpense)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      <NewPaymentSheet
        open={openNew}
        onOpenChange={setOpenNew}
        projectId={projectId}
      />

      <PaymentDetailDrawer
        open={Boolean(selectedId)}
        onOpenChange={(o) => {
          if (!o) setSelectedId(null);
        }}
        transactionId={selectedId}
      />
    </Container>
  );
}
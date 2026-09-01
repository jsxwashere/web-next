'use client';

import { useMemo, useState } from 'react';
import { Banknote, Search, X as XIcon } from 'lucide-react';
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

/**
 * Sprint 5 — Tahsilatlar content.
 *
 * API: GET /api/collections?project_id={projectId}
 *
 * Senaryolar: boş durum, yükleme, dolu liste + arama
 */

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

export function TahsilatlarContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const collectionsQuery = useProjectCollections(projectId);

  const collections = useMemo<Collection[]>(
    () => collectionsQuery.data?.data ?? [],
    [collectionsQuery.data],
  );

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return collections;
    const q = search.toLowerCase();
    return collections.filter(
      (c) =>
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.payment_type ?? '').toLowerCase().includes(q),
    );
  }, [collections, search]);

  const totalCount = collections.length;
  const totalAmount = useMemo(
    () => collections.reduce((sum, c) => sum + (c.amount ?? 0), 0),
    [collections],
  );

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[1, 2].map((i) => (
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
              {t('pages.projectTabs.tahsilatlar.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.tahsilatlar.subtitle')}
            </p>
          </div>
          <Button size="sm">
            <Banknote className="me-1 size-4" />
            {t('pages.projectTabs.tahsilatlar.addCollection')}
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Banknote className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.tahsilatlar.total')}
                  </p>
                  <p className="text-2xl font-bold">{formatAmount(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Banknote className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.tahsilatlar.count')}
                  </p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
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

        {/* List */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Banknote}
                title={
                  search
                    ? t('pages.projectTabs.tahsilatlar.noResults')
                    : t('pages.projectTabs.tahsilatlar.noCollections')
                }
                description={
                  search
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.tahsilatlar.noCollectionsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-500/10">
                  <Banknote className="size-4 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {collection.description || 'Tahsilat'}
                    </p>
                    <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatAmount(collection.amount, collection.currency ?? 'TRY')}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {collection.collection_date && (
                      <span>{formatDateTr(collection.collection_date)}</span>
                    )}
                    {collection.payment_type && (
                      <Badge
                        variant={PAYMENT_TYPE_BADGES[collection.payment_type] ?? 'secondary'}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {PAYMENT_TYPE_LABELS[collection.payment_type] ?? collection.payment_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  BoxIcon,
  Calendar,
  LinkIcon,
  Package,
  Plus,
  Search,
  TruckIcon,
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
import { useProjectMaterials } from '@/hooks/use-santiyepro-api';
import type { Material } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, formatDateTr } from '@/lib/helpers';
import { NewMaterialSheet } from './_components/new-material-sheet';

/**
 * Sprint 8.3a — Malzeme (ŞantiyePro tasarımına uyarlandı).
 *
 * API: GET /api/projects/{projectId}/materials
 *
 * Filtreler: arama (malzeme, tedarikçi), iade filtresi.
 */

export function MalzemeContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const materialsQuery = useProjectMaterials(projectId);

  const materials = useMemo<Material[]>(
    () => materialsQuery.data?.data ?? [],
    [materialsQuery.data],
  );

  const [search, setSearch] = useState('');
  const [returnsOnly, setReturnsOnly] = useState(false);
  const [openNew, setOpenNew] = useState(false);

  const stats = useMemo(() => {
    const totalAmount = materials
      .filter((m) => !m.is_return)
      .reduce((sum, m) => sum + (m.amount ?? 0), 0);
    const contractCount = materials.filter((m) => m.contract_id).length;
    return { totalAmount, contractCount };
  }, [materials]);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      if (returnsOnly && !m.is_return) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          (m.supplier_name ?? '').toLowerCase().includes(q) ||
          (m.manual_supplier_name ?? '').toLowerCase().includes(q) ||
          (m.description ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [materials, search, returnsOnly]);

  if (materialsQuery.isLoading) {
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
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="ms-auto h-8 w-64 rounded-md" />
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
              {t('pages.projectTabs.malzeme.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.malzeme.subtitle')}
            </p>
          </div>
          <Button size="sm" onClick={() => setOpenNew(true)}>
            <Plus className="me-1 size-4" />
            {t('pages.projectTabs.malzeme.addMaterial')}
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <BoxIcon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.malzeme.total')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatAmount(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-3">
                  <Package className="size-4 text-violet-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.malzeme.count')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {materials.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <LinkIcon className="size-4 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.malzeme.contractBound')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {stats.contractCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtre barı */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setReturnsOnly(!returnsOnly)}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              returnsOnly
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {t('pages.projectTabs.malzeme.returnsOnly')}
          </button>

          <div className="relative ms-auto w-full sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages.projectTabs.malzeme.searchPlaceholder')}
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
                icon={BoxIcon}
                title={t('pages.projectTabs.malzeme.noMaterials')}
                description={
                  search || returnsOnly
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.malzeme.noMaterialsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => {
              const supplier = m.supplier_name ?? m.manual_supplier_name;

              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-md',
                      m.is_return
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-violet-500/10 text-violet-600',
                    )}
                  >
                    {m.is_return ? (
                      <Package className="size-4" />
                    ) : (
                      <TruckIcon className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {m.name}
                        </p>
                        {supplier && (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <TruckIcon className="size-3" />
                            {supplier}
                          </p>
                        )}
                      </div>
                      <p
                        className={cn(
                          'shrink-0 text-sm font-bold tabular-nums',
                          m.is_return
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-foreground',
                        )}
                      >
                        {m.is_return ? '-' : ''}
                        {formatAmount(m.amount)}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {m.delivery_date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDateTr(m.delivery_date)}
                        </span>
                      )}
                      {m.unit && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                          {m.unit}
                        </Badge>
                      )}
                      {m.is_return && (
                        <Badge
                          variant="destructive"
                          className="h-4 px-1.5 text-[10px]"
                        >
                          {t('pages.projectTabs.malzeme.return')}
                        </Badge>
                      )}
                      {m.contract_id && (
                        <Badge
                          variant="info"
                          className="h-4 px-1.5 text-[10px]"
                        >
                          <LinkIcon className="me-0.5 size-2.5" />
                          {t('pages.projectTabs.malzeme.contract')}
                        </Badge>
                      )}
                      {m.ticket_number && (
                        <span className="font-mono text-[10px]">
                          {t('pages.projectTabs.malzeme.ticket')}: {m.ticket_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewMaterialSheet
        open={openNew}
        onOpenChange={setOpenNew}
        projectId={projectId}
      />
    </Container>
  );
}
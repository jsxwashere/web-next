/**
 * `app/(protected)/firms/page.tsx`
 *
 * Sprint 4 — Global Firmalar listesi (proje bağlamı yok).
 *
 * ŞantiyePro `resources/js/pages/contractors/index.tsx` davranışı korunur:
 *   - Tip filtresi (Tümü, Tedarikçi, Taşeron, vb.)
 *   - Arama (isim + vergi no)
 *   - Firma kartı: isim, tip badge, vergi no, iletişim
 *
 * API: GET /api/firms
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Mail,
  Phone,
  X as XIcon,
  Search,
} from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFirms } from '@/hooks/use-santiyepro-api';
import {
  FirmType,
  FirmTypeLabels,
  FirmTypeVariants,
  type FirmType as FirmTypeKey,
} from '@/lib/enums';
import type { Firm } from '@/lib/api/types';

type TypeFilter = 'all' | FirmTypeKey;

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: FirmType.PROVIDER, label: FirmTypeLabels[FirmType.PROVIDER] },
  { value: FirmType.SUBCONTRACTOR, label: FirmTypeLabels[FirmType.SUBCONTRACTOR] },
  { value: FirmType.WORKER, label: FirmTypeLabels[FirmType.WORKER] },
  { value: FirmType.INSTITUTION, label: FirmTypeLabels[FirmType.INSTITUTION] },
  { value: FirmType.OTHER, label: FirmTypeLabels[FirmType.OTHER] },
];

export default function FirmsPage() {
  const firmsQuery = useFirms();

  const firms = useMemo<Firm[]>(
    () => firmsQuery.data?.data ?? [],
    [firmsQuery.data],
  );

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<TypeFilter>('all');

  const filtered = useMemo(() => {
    return firms.filter((f) => {
      const matchesType = activeType === 'all' || f.type === activeType;
      if (!matchesType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          (f.tax_number ?? '').toLowerCase().includes(q) ||
          (f.contact_name ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [firms, search, activeType]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: firms.length };
    for (const t of Object.values(FirmType)) {
      counts[t] = firms.filter((f) => f.type === t).length;
    }
    return counts;
  }, [firms]);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div>
        <h1 className="text-base font-medium">Firmalar</h1>
        <p className="text-xs text-muted-foreground">
          Tüm projelerdeki tedarikçi, taşeron ve kurum kayıtlarınız.
        </p>
      </div>

      {/* Filtre bar */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveType(tab.value)}
              className={
                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm ' +
                (activeType === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground')
              }
            >
              {tab.label}
              <Badge
                variant={activeType === tab.value ? 'secondary' : 'outline'}
                className="ml-0.5 h-4 min-w-4 text-[10px] sm:h-5 sm:min-w-5 sm:text-xs"
              >
                {typeCounts[tab.value] ?? 0}
              </Badge>
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:ms-auto sm:w-64">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Firma ara..."
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

      {/* İçerik */}
      {firmsQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Building2}
              title={
                search || activeType !== 'all'
                  ? 'Filtreye uygun firma bulunamadı'
                  : 'Henüz firma yok'
              }
              description={
                search || activeType !== 'all'
                  ? 'Filtrelerinizi temizleyip tekrar deneyin.'
                  : 'İlk firmanızı ekleyin; ödeme, sözleşme ve malzeme kayıtları burada bağlanır.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((firm) => (
            <Link
              key={firm.id}
              href={`/firmalar/${firm.id}`}
              className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-1 text-[15px] font-bold text-foreground">
                      {firm.name}
                    </h2>
                    <Badge
                      variant={FirmTypeVariants[firm.type] ?? 'secondary'}
                      className="shrink-0"
                    >
                      {FirmTypeLabels[firm.type] ?? firm.type}
                    </Badge>
                  </div>
                  {firm.contact_name && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {firm.contact_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {firm.tax_number && (
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">VKN:</span>
                    <span className="tabular-nums">{firm.tax_number}</span>
                  </span>
                )}
                {firm.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" />
                    <span>{firm.phone}</span>
                  </span>
                )}
                {firm.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" />
                    <span className="truncate">{firm.email}</span>
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
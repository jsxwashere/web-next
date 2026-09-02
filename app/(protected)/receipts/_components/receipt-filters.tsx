'use client';

/**
 * `app/(protected)/receipts/_components/receipt-filters.tsx`
 *
 * Sprint 8.2 — Filtre barı (durum + arama).
 *
 * Sprint 6.5'teki "Yeni Dekont" sheet'i için tasarım bozulmadan,
 * mevcut sekme görünümüne filtre eklenir.
 */

import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ReceiptStatus,
  ReceiptStatusLabels,
  type ReceiptStatus as ReceiptStatusKey,
} from '@/lib/enums';
import { cn } from '@/lib/utils';

export type ReceiptStatusFilter = ReceiptStatusKey | 'all';

export interface ReceiptFiltersValue {
  status: ReceiptStatusFilter;
  search: string;
}

export interface ReceiptFiltersProps {
  value: ReceiptFiltersValue;
  onChange: (next: ReceiptFiltersValue) => void;
}

const STATUSES: { value: ReceiptStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  {
    value: ReceiptStatus.ACCEPTED as ReceiptStatusKey,
    label: ReceiptStatusLabels[ReceiptStatus.ACCEPTED],
  },
  {
    value: ReceiptStatus.EXTRACTED as ReceiptStatusKey,
    label: ReceiptStatusLabels[ReceiptStatus.EXTRACTED],
  },
  {
    value: ReceiptStatus.PENDING as ReceiptStatusKey,
    label: ReceiptStatusLabels[ReceiptStatus.PENDING],
  },
  {
    value: ReceiptStatus.FAILED as ReceiptStatusKey,
    label: ReceiptStatusLabels[ReceiptStatus.FAILED],
  },
];

export function ReceiptFilters({ value, onChange }: ReceiptFiltersProps) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? STATUSES : STATUSES.slice(0, 4);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 lg:flex-row lg:items-center">
      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-1">
        <Filter className="size-3.5 text-muted-foreground" />
        {visible.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ ...value, status: s.value })}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              value.status === s.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted',
            )}
          >
            {s.label}
          </button>
        ))}
        {STATUSES.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Daha az' : 'Daha fazla'}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative flex-1 lg:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Dekont ara..."
          className="h-8 pl-9 pr-8 text-xs"
        />
        {value.search && (
          <button
            type="button"
            onClick={() => onChange({ ...value, search: '' })}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Aramayı temizle"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export const RECEIPT_FILTERS_DEFAULT: ReceiptFiltersValue = {
  status: 'all',
  search: '',
};
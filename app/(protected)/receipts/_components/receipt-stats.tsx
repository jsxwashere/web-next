'use client';

/**
 * `app/(protected)/receipts/_components/receipt-stats.tsx`
 *
 * Sprint 8.2 — Dekont istatistik kartları (4 KPI).
 *
 * - Toplam dekont
 * - İşlenmiş (kabul edilmiş)
 * - Okunuyor (pending/extracted)
 * - Başarısız (failed)
 */

import {
  CheckCircle,
  CircleAlert,
  Clock,
  Receipt,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ReceiptStatus,
  type ReceiptStatus as ReceiptStatusKey,
} from '@/lib/enums';
import type { ReceiptItem } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export interface ReceiptStatsProps {
  items: ReceiptItem[];
}

interface StatConfig {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'primary' | 'success' | 'warning' | 'destructive';
  count: (items: ReceiptItem[]) => number;
  hint: string;
}

const STATS: StatConfig[] = [
  {
    key: 'total',
    title: 'Toplam Dekont',
    icon: Receipt,
    accent: 'primary',
    count: (i) => i.length,
    hint: 'Tüm zamanlar',
  },
  {
    key: 'accepted',
    title: 'İşlenmiş',
    icon: CheckCircle,
    accent: 'success',
    count: (i) =>
      i.filter((d) => d.status === (ReceiptStatus.ACCEPTED as ReceiptStatusKey))
        .length,
    hint: 'Ödeme kaydına dönüştü',
  },
  {
    key: 'pending',
    title: 'Okunuyor / İncelemede',
    icon: Clock,
    accent: 'warning',
    count: (i) =>
      i.filter(
        (d) =>
          d.status === (ReceiptStatus.PENDING as ReceiptStatusKey) ||
          d.status === (ReceiptStatus.EXTRACTED as ReceiptStatusKey),
      ).length,
    hint: 'Onayınız bekleniyor',
  },
  {
    key: 'failed',
    title: 'Başarısız',
    icon: CircleAlert,
    accent: 'destructive',
    count: (i) =>
      i.filter((d) => d.status === (ReceiptStatus.FAILED as ReceiptStatusKey))
        .length,
    hint: 'Yeniden okunmalı',
  },
];

const accentClasses: Record<StatConfig['accent'], string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  destructive: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export function ReceiptStats({ items }: ReceiptStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = stat.count(items);
        return (
          <Card key={stat.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-md',
                  accentClasses[stat.accent],
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-lg font-semibold tabular-nums">
                  {value}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {stat.hint}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
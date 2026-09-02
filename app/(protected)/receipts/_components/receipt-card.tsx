'use client';

/**
 * `app/(protected)/receipts/_components/receipt-card.tsx`
 *
 * Sprint 8.2 — Tek dekont kartı (liste satırı).
 *
 * ŞantiyePro `receipt-card.tsx` davranışı korunur; grid layout için:
 *   - Sol: küçük dosya önizleme / icon
 *   - Orta: mağaza adı + meta (kayıt türü · tarih)
 *   - Sağ: tutar + aksiyonlar (Yeniden Oku · İncele · Sil)
 */

import { FileText, Image as ImageIcon, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ReceiptRecordTypeLabels,
  ReceiptStatus,
  ReceiptStatusLabels,
  ReceiptStatusVariants,
  type ReceiptRecordType as ReceiptRecordTypeKey,
  type ReceiptStatus as ReceiptStatusKey,
} from '@/lib/enums';
import { formatAmount, formatDateTr, getEnumLabel, storageUrl } from '@/lib/helpers';
import type { ReceiptItem } from '@/lib/api/types';

export interface ReceiptCardProps {
  item: ReceiptItem;
  deleting: boolean;
  rereading: boolean;
  onReview: (item: ReceiptItem) => void;
  onReRead: (item: ReceiptItem) => void;
  onDelete: (item: ReceiptItem) => void;
}

export function ReceiptCard({
  item,
  deleting,
  rereading,
  onReview,
  onReRead,
  onDelete,
}: ReceiptCardProps) {
  const s = item.suggestion ?? {};
  const amount = Number(s.amount ?? s.amount_try ?? 0);
  const isReviewable =
    item.status === (ReceiptStatus.EXTRACTED as ReceiptStatusKey) ||
    item.status === (ReceiptStatus.FAILED as ReceiptStatusKey);
  const canReRead = item.status !== (ReceiptStatus.ACCEPTED as ReceiptStatusKey);

  const fileUrl = storageUrl(item.file ?? '');
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      {/* Thumbnail */}
      <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted">
        {fileUrl && !isPdf ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt={item.original_name ?? 'Dekont'}
            className="size-full object-cover"
          />
        ) : fileUrl && isPdf ? (
          <FileText className="size-4 text-muted-foreground" />
        ) : (
          <ImageIcon className="size-4 text-muted-foreground" />
        )}
      </div>

      {/* Status */}
      <Badge
        variant={
          ReceiptStatusVariants[item.status as ReceiptStatusKey] ?? 'secondary'
        }
        className="shrink-0"
      >
        {getEnumLabel(item.status, ReceiptStatusLabels)}
      </Badge>

      {/* Middle: name + meta */}
      <div className="min-w-0 flex-1">
        <p className="block truncate text-sm font-semibold text-foreground">
          {s.counterparty_name || item.original_name || 'Dekont'}
        </p>
        <p className="block truncate text-xs text-muted-foreground">
          {[
            s.record
              ? ReceiptRecordTypeLabels[s.record as ReceiptRecordTypeKey]
              : null,
            s.date ? formatDateTr(s.date) : null,
            item.created_at ? formatDateTr(item.created_at) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {/* Amount */}
      <span className="tabular-nums text-sm font-semibold text-foreground">
        {amount > 0 ? formatAmount(amount) : '—'}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {isReviewable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReview(item)}
          >
            İncele
          </Button>
        )}
        {canReRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReRead(item)}
            disabled={rereading || deleting}
          >
            <RefreshCw className="me-1 size-4" />
            {rereading ? 'Okunuyor…' : 'Yeniden Oku'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(item)}
          disabled={deleting || rereading}
          aria-label="Dekontu sil"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}


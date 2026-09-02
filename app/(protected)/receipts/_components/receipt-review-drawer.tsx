'use client';

/**
 * `app/(protected)/receipts/_components/receipt-review-drawer.tsx`
 *
 * Sprint 8.2 — Dekont inceleme drawer'ı.
 *
 * ŞantiyePro `receipt-review-sheet.tsx` davranışı korunur; ancak:
 *   - Bu drawer sadece AI'ın okuduğu alanları GÖSTERİR (read-only).
 *   - Kabul/Red akışı Sprint 8.3'te backend POST /receipts/{id}/accept
 *     ve /reject ile ayrı bir form olarak bağlanacak.
 *   - Görsel/PDF önizleme gösterilir.
 *
 * Kullanıcı isteği: "tasarımı çok bozmadan" — mevcut davranış korunur.
 */

import { FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ReceiptStatusLabels,
  ReceiptStatusVariants,
  type ReceiptStatus as ReceiptStatusKey,
} from '@/lib/enums';
import { formatAmount, formatDateTr, getEnumLabel, storageUrl } from '@/lib/helpers';
import type { ReceiptItem } from '@/lib/api/types';

export interface ReceiptReviewDrawerProps {
  open: boolean;
  receipt: ReceiptItem | null;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptReviewDrawer({
  open,
  receipt,
  onOpenChange,
}: ReceiptReviewDrawerProps) {
  if (!receipt) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent />
      </Drawer>
    );
  }

  const s = receipt.suggestion;
  const e = receipt.extraction;
  const fileUrl = storageUrl(receipt.file ?? '');
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const amount = Number(s?.amount ?? s?.amount_try ?? 0);
  const variant =
    ReceiptStatusVariants[receipt.status as ReceiptStatusKey] ?? 'secondary';

  const warnings = [
    ...(s?.warnings ?? []),
    ...(e?.warnings ?? []),
    ...(s?.duplicate_of?.label
      ? [`Bu ödeme zaten kayıtlı olabilir: ${s.duplicate_of.label}`]
      : []),
  ].filter(Boolean);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            AI Okuma Sonucu
          </DrawerTitle>
          <DrawerDescription>
            {receipt.original_name ??
              s?.counterparty_name ??
              'Okunan bilgiler aşağıdadır.'}
          </DrawerDescription>
          <Badge variant={variant} className="mt-2 w-fit">
            {getEnumLabel(receipt.status, ReceiptStatusLabels)}
          </Badge>
        </DrawerHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
              <ul className="flex flex-col gap-1 text-xs text-amber-800 dark:text-amber-300">
                {warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI extracted fields */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Karşı taraf"
              value={s?.counterparty_name ?? '—'}
            />
            <Field
              label="Tarih"
              value={s?.date ? formatDateTr(s.date) : '—'}
            />
            <Field
              label="Tutar"
              value={amount > 0 ? formatAmount(amount) : '—'}
            />
            <Field
              label="Para birimi"
              value={(s?.currency ?? 'TRY').toUpperCase()}
            />
            <Field
              label="Yön"
              value={
                s?.direction === 'incoming'
                  ? 'Gelen'
                  : s?.direction === 'outgoing'
                    ? 'Giden'
                    : (s?.direction ?? '—')
              }
            />
            <Field
              label="Kayıt türü"
              value={s?.record ?? '—'}
            />
            <Field
              label="IBAN"
              value={s?.counterparty_iban ?? '—'}
              mono
            />
            <Field
              label="Ödeme kaynağı"
              value={s?.payment_source ?? '—'}
            />
          </div>

          {/* Extraction details */}
          {e?.description && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  Açıklama
                </p>
                <p className="text-sm">{e.description}</p>
              </div>
            </>
          )}

          {e?.reference && (
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                Referans
              </p>
              <p className="text-sm font-mono">{e.reference}</p>
            </div>
          )}

          {/* Sender / Receiver */}
          {(e?.sender?.name || e?.receiver?.name) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {e?.sender && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      Gönderen
                    </p>
                    <p className="text-sm">{e.sender.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {e.sender.iban ?? ''}
                    </p>
                  </div>
                )}
                {e?.receiver && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      Alan
                    </p>
                    <p className="text-sm">{e.receiver.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {e.receiver.iban ?? ''}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* File preview */}
          {fileUrl && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Dekont görseli
                </p>
                <div className="overflow-hidden rounded-md border border-border bg-muted">
                  {isPdf ? (
                    <div className="flex h-40 items-center justify-center gap-2">
                      <FileText className="size-6 text-muted-foreground" />
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline"
                      >
                        PDF'i aç
                      </a>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileUrl}
                      alt="Dekont"
                      className="max-h-64 w-full object-contain"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Empty preview state */}
          {!fileUrl && (
            <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
              <ImageIcon className="size-4" />
              Bu dekont için dosya önizlemesi yok.
            </div>
          )}
        </div>

        <DrawerFooter className="border-t">
          <p className="text-[11px] text-muted-foreground">
            Onay/Red akışı Sprint 8.3'te eklenecek.
          </p>
          <DrawerClose asChild>
            <Button variant="outline" size="sm">
              Kapat
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
      <p
        className={
          mono
            ? 'truncate text-sm font-mono'
            : 'truncate text-sm font-medium text-foreground'
        }
      >
        {value}
      </p>
    </div>
  );
}
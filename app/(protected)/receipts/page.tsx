/**
 * `app/(protected)/receipts/page.tsx`
 *
 * Sprint 4 — Makbuzlar / Dekont Okuma.
 *
 * ŞantiyePro `resources/js/pages/receipts/index.tsx` davranışı korunur:
 *   - Dosya yükleme (multi-file upload, AI okuma)
 *   - Bekleyen/tamamlanan toggle
 *   - Liste: durum badge, karşı taraf, kayıt türü, tutar, aksiyonlar
 *   - Yeniden oku / Sil / İncele
 *
 * API: GET /api/receipts, POST /api/receipts (upload),
 *      POST /api/receipts/{id}/re-extract, DELETE /api/receipts/{id}
 */

'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle,
  Eye,
  Landmark,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useDeleteReceipt,
  useReceipts,
  useReExtractReceipt,
  useUploadReceipts,
} from '@/hooks/use-santiyepro-api';
import {
  ReceiptRecordType,
  ReceiptRecordTypeLabels,
  ReceiptStatus,
  ReceiptStatusLabels,
  ReceiptStatusVariants,
  type ReceiptRecordType as ReceiptRecordTypeKey,
  type ReceiptStatus as ReceiptStatusKey,
} from '@/lib/enums';
import type { ReceiptItem } from '@/lib/api/types';
import { formatAmount, formatDateTr, getEnumLabel } from '@/lib/helpers';

export default function ReceiptsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptsQuery = useReceipts();
  const uploadMutation = useUploadReceipts();
  const deleteMutation = useDeleteReceipt();
  const reExtractMutation = useReExtractReceipt();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reReadingId, setReReadingId] = useState<string | null>(null);

  const items: ReceiptItem[] = receiptsQuery.data?.data ?? [];
  const pendingItems = items.filter(
    (d) =>
      d.status === ReceiptStatus.EXTRACTED ||
      d.status === ReceiptStatus.FAILED,
  );
  const completedCount = items.length - pendingItems.length;
  const displayItems = showCompleted ? items : pendingItems;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 20) {
      toast.error('Tek seferde en fazla 20 dekont yükleyebilirsiniz.');
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Önce bir dekont seçin.');
      return;
    }
    if (selectedFiles.length > 20) {
      toast.error('Tek seferde en fazla 20 dekont yükleyebilirsiniz.');
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({ files: selectedFiles });
      const uploadedItems = result?.data?.items ?? [];
      setSelectedFiles([]);

      if (
        uploadedItems.length === 1 &&
        uploadedItems[0]?.status === ReceiptStatus.FAILED
      ) {
        toast.warning(
          'Dekont okunamadı — bilgileri elle girebilirsiniz.',
        );
      } else if (
        uploadedItems.length === 1 &&
        uploadedItems[0]?.status !== ReceiptStatus.FAILED
      ) {
        toast.success('Dekont okundu');
      } else {
        toast.success(`${uploadedItems.length} dekont okundu`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Dekont yüklenemedi.',
      );
    }
  };

  const handleDelete = async (item: ReceiptItem) => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Bu dekontu silmek istediğinizden emin misiniz?')
    ) {
      return;
    }

    setDeletingId(item.id);
    try {
      await deleteMutation.mutateAsync({ id: item.id });
      toast.success('Dekont silindi');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Silme başarısız.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReRead = async (item: ReceiptItem) => {
    setReReadingId(item.id);
    try {
      await reExtractMutation.mutateAsync({ id: item.id });
      toast.success('Dekont yeniden okundu');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Dekont yeniden okunamadı.',
      );
    } finally {
      setReReadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div>
        <h1 className="text-base font-medium">Dekont Okuma</h1>
        <p className="text-xs text-muted-foreground">
          Banka dekontunu yükleyin; tutar, tarih ve karşı taraf otomatik
          okunsun. Onayladığınızda gerçek ödeme kaydı oluşur.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-bold">Dekont Yükle</h2>

          <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex flex-col items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Upload className="size-6" />
              <span className="font-medium">
                {selectedFiles.length === 0
                  ? 'Dosya seçmek için tıklayın'
                  : `${selectedFiles.length} dosya seçildi`}
              </span>
              <span className="text-xs">
                JPG, PNG veya PDF · Tek seferde en fazla 20 dosya
              </span>
            </button>
            {selectedFiles.length > 0 && (
              <ul className="mt-3 text-left text-xs text-muted-foreground">
                {selectedFiles.map((f, i) => (
                  <li key={i} className="truncate">
                    {f.name} ({(f.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {selectedFiles.length === 0
                ? 'Tutar, tarih ve karşı taraf otomatik okunur; kayıt oluşmadan önce onayınızı isteriz.'
                : `${selectedFiles.length} dosya seçildi`}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              disabled={
                selectedFiles.length === 0 || uploadMutation.isPending
              }
            >
              <Upload className="me-1 size-4" />
              {uploadMutation.isPending ? 'Yükleniyor…' : 'Yükle ve Oku'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipt List */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Okunan Dekontlar</h2>
            {receiptsQuery.error ? (
              <span className="text-warning flex items-center gap-2 text-xs font-medium">
                Dekontlar yüklenemedi.
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => receiptsQuery.refetch()}
                  disabled={receiptsQuery.isFetching}
                >
                  <RefreshCw className="me-1 size-3" />
                  Yenile
                </Button>
              </span>
            ) : null}
          </div>

          {receiptsQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Landmark}
              title="Henüz dekont yok"
              description="Yukarıdan bir banka dekontu yükleyin; tutar, tarih ve karşı taraf otomatik okunsun."
            />
          ) : displayItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Bekleyen dekont yok"
              description={`Tüm dekontlar tamamlandı. ${completedCount} tamamlanmış dekontu görmek için aşağıdaki "Tamamlananları göster" düğmesini kullanın.`}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {displayItems.map((item) => {
                const s = item.suggestion ?? {};
                const amount = Number(s.amount ?? s.amount_try ?? 0);
                const isReviewable =
                  item.status === ReceiptStatus.EXTRACTED ||
                  item.status === ReceiptStatus.FAILED;
                const canReRead = item.status !== ReceiptStatus.ACCEPTED;

                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <Badge
                      variant={
                        ReceiptStatusVariants[item.status as ReceiptStatusKey] ??
                        'secondary'
                      }
                      className="shrink-0"
                    >
                      {getEnumLabel(item.status, ReceiptStatusLabels)}
                    </Badge>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {s.counterparty_name || item.original_name || 'Dekont'}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[
                          s.record
                            ? ReceiptRecordTypeLabels[
                                s.record as ReceiptRecordTypeKey
                              ]
                            : null,
                          s.date ? formatDateTr(s.date) : null,
                          item.created_at
                            ? formatDateTr(item.created_at)
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>

                    <span className="tabular text-sm font-semibold text-foreground">
                      {amount > 0 ? formatAmount(amount) : '—'}
                    </span>

                    <span className="flex shrink-0 items-center gap-1.5">
                      {isReviewable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="İncele (yakında)"
                        >
                          <Eye className="me-1 size-4" />
                          İncele
                        </Button>
                      )}
                      {canReRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReRead(item)}
                          disabled={
                            reReadingId === item.id || deletingId === item.id
                          }
                        >
                          <RefreshCw className="me-1 size-4" />
                          {reReadingId === item.id ? 'Okunuyor…' : 'Yeniden Oku'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item)}
                        disabled={
                          deletingId === item.id || reReadingId === item.id
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {completedCount > 0 && (
            <div className="pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleted((v) => !v)}
              >
                {showCompleted
                  ? 'Yalnızca bekleyenler'
                  : `Tamamlananları göster (${completedCount})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
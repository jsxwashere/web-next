'use client';

/**
 * `app/(protected)/receipts/_components/content.tsx`
 *
 * Sprint 8.2 — Dekont sayfası içerik kompozisyonu.
 *
 * Akış:
 *   1) Üst başlık + KPI istatistikleri (Sprint 8.2 yeni)
 *   2) Filtre barı (Sprint 8.2 yeni)
 *   3) "Yeni Dekont" sheet (Sprint 6.5 — dokunulmaz) burada DEĞİL,
 *      page.tsx seviyesinde kalır.
 *   4) Upload card + dekont listesi (revize)
 *   5) İnceleme drawer (Sprint 8.2 — review drawer)
 */

import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle,
  Landmark,
  RefreshCw,
  Upload as UploadIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReceiptReviewDrawer } from '@/app/(protected)/receipts/_components/receipt-review-drawer';
import {
  ReceiptCard,
} from '@/app/(protected)/receipts/_components/receipt-card';
import {
  RECEIPT_FILTERS_DEFAULT,
  ReceiptFilters,
  type ReceiptFiltersValue,
} from '@/app/(protected)/receipts/_components/receipt-filters';
import { ReceiptStats } from '@/app/(protected)/receipts/_components/receipt-stats';
import { ReceiptUpload } from '@/app/(protected)/receipts/_components/receipt-upload';
import {
  useDeleteReceipt,
  useReceipts,
  useReExtractReceipt,
  useUploadReceipts,
} from '@/hooks/use-santiyepro-api';
import { ReceiptStatus, type ReceiptStatus as ReceiptStatusKey } from '@/lib/enums';
import type { ReceiptItem } from '@/lib/api/types';

export interface ReceiptsContentProps {
  /** Sprint 6.5 NewReceiptSheet'i burada tetikler. */
  onOpenNewReceipt: () => void;
}

export function ReceiptsContent({ onOpenNewReceipt }: ReceiptsContentProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const receiptsQuery = useReceipts();
  const uploadMutation = useUploadReceipts();
  const deleteMutation = useDeleteReceipt();
  const reExtractMutation = useReExtractReceipt();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reReadingId, setReReadingId] = useState<string | null>(null);
  const [reviewingItem, setReviewingItem] = useState<ReceiptItem | null>(null);
  const [filters, setFilters] = useState<ReceiptFiltersValue>(
    RECEIPT_FILTERS_DEFAULT,
  );

  const items: ReceiptItem[] = receiptsQuery.data?.data ?? [];

  const filteredItems = useMemo(() => {
    let result = items;
    if (filters.status !== 'all') {
      result = result.filter((d) => d.status === filters.status);
    }
    const search = filters.search.trim().toLowerCase();
    if (search) {
      result = result.filter((d) => {
        const s = d.suggestion ?? {};
        const haystacks = [
          d.original_name ?? '',
          s.counterparty_name ?? '',
          s.record ?? '',
        ];
        return haystacks.some((h) => h.toLowerCase().includes(search));
      });
    }
    return result;
  }, [items, filters]);

  const pendingItems = items.filter(
    (d) =>
      d.status === (ReceiptStatus.EXTRACTED as ReceiptStatusKey) ||
      d.status === (ReceiptStatus.FAILED as ReceiptStatusKey),
  );
  const completedCount = items.length - pendingItems.length;

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error(t('pages.receipts.noFileError'));
      return;
    }
    if (selectedFiles.length > 20) {
      toast.error(t('pages.receipts.maxFilesError'));
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({ files: selectedFiles });
      const uploadedItems = result?.data?.items ?? [];
      setSelectedFiles([]);

      if (
        uploadedItems.length === 1 &&
        uploadedItems[0]?.status === (ReceiptStatus.FAILED as ReceiptStatusKey)
      ) {
        toast.warning(
          'Dekont okunamadı — bilgileri elle girebilirsiniz.',
        );
      } else if (
        uploadedItems.length === 1 &&
        uploadedItems[0]?.status !== (ReceiptStatus.FAILED as ReceiptStatusKey)
      ) {
        toast.success('Dekont okundu');
        setReviewingItem(uploadedItems[0]);
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
      !window.confirm(t('pages.receipts.confirmDelete'))
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

  const isLoadingList = receiptsQuery.isLoading;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-base font-medium">
            {t('pages.receipts.title')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t('pages.receipts.subtitle')}
          </p>
        </div>
        <Button onClick={onOpenNewReceipt} size="sm">
          <UploadIcon className="me-1 size-4" />
          {t('pages.receipts.uploadCta')}
        </Button>
      </div>

      {/* KPI istatistikleri */}
      <ReceiptStats items={items} />

      {/* Filtre barı */}
      <ReceiptFilters value={filters} onChange={setFilters} />

      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-bold">Dekont Yükle</h2>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="hidden"
            aria-hidden="true"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) {
                setSelectedFiles((prev) => [...prev, ...files].slice(0, 20));
              }
              e.target.value = '';
            }}
          />

          <ReceiptUpload
            value={selectedFiles}
            onChange={setSelectedFiles}
            disabled={uploadMutation.isPending}
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {selectedFiles.length === 0
                ? 'Tutar, tarih ve karşı taraf otomatik okunur; kayıt oluşmadan önce onayınızı isteriz.'
                : `${selectedFiles.length} dosya seçildi`}
            </p>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={
                selectedFiles.length === 0 || uploadMutation.isPending
              }
            >
              <UploadIcon className="me-1 size-4" />
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
              <span className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                Dekontlar yüklenemedi.
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => receiptsQuery.refetch()}
                  disabled={receiptsQuery.isFetching}
                >
                  <RefreshCw className="me-1 size-3" />
                  {t('common.buttons.refresh')}
                </Button>
              </span>
            ) : null}
          </div>

          {isLoadingList ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Landmark}
              title={t('pages.receipts.noReceipts')}
              description={t('pages.receipts.noReceiptsDesc')}
            />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Filtreye uygun dekont yok"
              description="Farklı bir filtre deneyin veya aramayı temizleyin."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredItems.map((item) => (
                <ReceiptCard
                  key={item.id}
                  item={item}
                  deleting={deletingId === item.id}
                  rereading={reReadingId === item.id}
                  onReview={setReviewingItem}
                  onReRead={handleReRead}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}

          {completedCount > 0 && (
            <div className="pt-3">
              <p className="text-xs text-muted-foreground">
                {completedCount} dekont tamamlandı (kabul/red).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* İnceleme drawer */}
      <ReceiptReviewDrawer
        open={!!reviewingItem}
        receipt={reviewingItem}
        onOpenChange={(open) => {
          if (!open) {
            setReviewingItem(null);
          }
        }}
      />
    </div>
  );
}
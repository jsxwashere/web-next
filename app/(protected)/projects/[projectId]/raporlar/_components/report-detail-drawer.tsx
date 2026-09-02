/**
 * `raporlar/_components/report-detail-drawer.tsx`
 *
 * Sprint 8.3b — Saha raporu detay görünümü (read-only drawer).
 * Tam rapor içeriği + foto galeri.
 */

'use client';

import {
  CalendarDays,
  Camera,
  Shield,
  Users,
  X as XIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  SiteReportStatusLabels,
  SiteReportStatusVariants,
  SiteReportWeatherLabels,
  WeatherEmojis,
} from '@/lib/enums';
import type { SiteReport } from '@/lib/api/types';
import { formatDateTr, storageUrl } from '@/lib/helpers';

export interface ReportDetailDrawerProps {
  report: SiteReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDetailDrawer({
  report,
  open,
  onOpenChange,
}: ReportDetailDrawerProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-background shadow-xl sm:max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">{t('pages.projectTabs.raporlar.detailTitle')}</h2>
            <Badge
              variant={SiteReportStatusVariants[report.status] ?? 'secondary'}
              className="h-4 px-1.5 text-[10px]"
            >
              {SiteReportStatusLabels[report.status] ?? report.status}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {/* Tarih + Hava */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span className="text-sm font-bold">{formatDateTr(report.date)}</span>
              </div>
              {report.weather && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-base">
                    {WeatherEmojis[report.weather] ?? ''}
                  </span>
                  <span className="font-medium">
                    {SiteReportWeatherLabels[report.weather] ?? ''}
                  </span>
                  {report.temperature_min_c != null &&
                    report.temperature_max_c != null && (
                      <span className="tabular-nums">
                        {Math.round(report.temperature_min_c)}° /{' '}
                        {Math.round(report.temperature_max_c)}°
                      </span>
                    )}
                </div>
              )}
            </div>

            <Separator />

            {/* Yapılan İşler */}
            {report.work_summary && (
              <section>
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  {t('pages.projectTabs.raporlar.workDone')}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {report.work_summary}
                </p>
              </section>
            )}

            {/* Engeller */}
            {report.blockers && (
              <section>
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  {t('pages.projectTabs.raporlar.blockers')}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {report.blockers}
                </p>
              </section>
            )}

            {/* Ziyaretçiler */}
            {report.visitors && (
              <section>
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Users className="size-3" />
                  {t('pages.projectTabs.raporlar.visitors')}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {report.visitors}
                </p>
              </section>
            )}

            {/* Emniyet Notları */}
            {report.safety_notes && (
              <section>
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Shield className="size-3" />
                  {t('pages.projectTabs.raporlar.safetyNotes')}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {report.safety_notes}
                </p>
              </section>
            )}

            {/* Foto Galeri */}
            {report.photos && report.photos.length > 0 && (
              <section>
                <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Camera className="size-3" />
                  Fotoğraflar ({report.photos.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {report.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square overflow-hidden rounded-md border border-border"
                    >
                      <img
                        src={storageUrl(photo.image)}
                        alt={photo.caption ?? ''}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
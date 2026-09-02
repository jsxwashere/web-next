'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Camera,
  Cloud,
  LineChart,
  Plus,
  Search,
  Shield,
  Users,
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
import { useProjectSiteReports } from '@/hooks/use-santiyepro-api';
import {
  SiteReportStatus,
  SiteReportStatusLabels,
  SiteReportStatusVariants,
  SiteReportWeather,
  SiteReportWeatherLabels,
  WeatherEmojis,
  type SiteReportStatus as SiteReportStatusKey,
  type SiteReportWeather as SiteReportWeatherKey,
} from '@/lib/enums';
import type { SiteReport } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatDateTr } from '@/lib/helpers';
import { NewSiteReportSheet } from './_components/new-site-report-sheet';
import { ReportDetailDrawer } from './_components/report-detail-drawer';

/**
 * Sprint 8.3b — Saha Raporları (project-scoped) — ŞantiyePro tasarımına uyarlandı.
 *
 * Taşınan özellikler:
 *  - Üst KPI'lar: Toplam rapor, bu hafta, hava durumu dağılımı
 *  - Filtre bar: Durum (draft/submitted), hava durumu
 *  - Rapor kartları: Tarih, hava durumu emoji + sıcaklık, yapılan işler, ziyaretçiler, engeller, emniyet
 *  - Foto galeri thumbnail sayısı
 *  - Detay drawer: Tam rapor + galeri (read-only başlangıç)
 */

type WeatherFilter = 'all' | SiteReportWeatherKey;
type StatusFilter = 'all' | SiteReportStatusKey;

const WEATHER_FILTERS: { value: WeatherFilter; label: string; emoji?: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: SiteReportWeather.SUNNY, label: SiteReportWeatherLabels[SiteReportWeather.SUNNY], emoji: WeatherEmojis[SiteReportWeather.SUNNY] },
  { value: SiteReportWeather.CLOUDY, label: SiteReportWeatherLabels[SiteReportWeather.CLOUDY], emoji: WeatherEmojis[SiteReportWeather.CLOUDY] },
  { value: SiteReportWeather.RAINY, label: SiteReportWeatherLabels[SiteReportWeather.RAINY], emoji: WeatherEmojis[SiteReportWeather.RAINY] },
  { value: SiteReportWeather.STORMY, label: SiteReportWeatherLabels[SiteReportWeather.STORMY], emoji: WeatherEmojis[SiteReportWeather.STORMY] },
  { value: SiteReportWeather.SNOWY, label: SiteReportWeatherLabels[SiteReportWeather.SNOWY], emoji: WeatherEmojis[SiteReportWeather.SNOWY] },
  { value: SiteReportWeather.FOGGY, label: SiteReportWeatherLabels[SiteReportWeather.FOGGY], emoji: WeatherEmojis[SiteReportWeather.FOGGY] },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: SiteReportStatus.DRAFT, label: SiteReportStatusLabels[SiteReportStatus.DRAFT] },
  { value: SiteReportStatus.SUBMITTED, label: SiteReportStatusLabels[SiteReportStatus.SUBMITTED] },
  { value: SiteReportStatus.APPROVED, label: SiteReportStatusLabels[SiteReportStatus.APPROVED] },
];

export function RaporlarContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const reportsQuery = useProjectSiteReports(projectId);

  const reports = useMemo<SiteReport[]>(
    () => reportsQuery.data?.data ?? [],
    [reportsQuery.data],
  );

  const [search, setSearch] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [weatherFilter, setWeatherFilter] = useState<WeatherFilter>('all');
  const [selectedReport, setSelectedReport] = useState<SiteReport | null>(null);

  // Bu hafta rapor sayısı
  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return reports.filter((r) => new Date(r.date) >= startOfWeek).length;
  }, [reports]);

  // Hava durumu dağılımı
  const weatherCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reports) {
      if (r.weather) {
        counts[r.weather] = (counts[r.weather] ?? 0) + 1;
      }
    }
    return counts;
  }, [reports]);

  const summary = reportsQuery.data?.summary;

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (weatherFilter !== 'all' && r.weather !== weatherFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (r.work_summary ?? '').toLowerCase().includes(q) ||
          (r.work_done ?? '').toLowerCase().includes(q) ||
          (r.blockers ?? '').toLowerCase().includes(q) ||
          (r.visitors ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, search, statusFilter, weatherFilter]);

  if (reportsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
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
              {t('pages.projectTabs.raporlar.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.raporlar.subtitle')}
            </p>
          </div>
          <Button size="sm" onClick={() => setOpenNew(true)}>
            <Plus className="me-1 size-4" />
            {t('pages.projectTabs.raporlar.addReport')}
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <LineChart className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.raporlar.total')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {summary?.total ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <CalendarDays className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.raporlar.thisWeek')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {thisWeekCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                {t('pages.projectTabs.raporlar.lastReport')}
              </p>
              <p className="text-base font-bold">
                {summary?.last_report_date
                  ? formatDateTr(summary.last_report_date)
                  : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hava durumu dağılımı */}
        {Object.keys(weatherCounts).length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {t('pages.projectTabs.raporlar.weatherDistribution')}:
            </span>
            {Object.entries(weatherCounts).map(([w, count]) => (
              <Badge key={w} variant="outline" appearance="light" className="gap-1 px-2 py-1 text-[11px]">
                <span>{WeatherEmojis[w as SiteReportWeatherKey] ?? ''}</span>
                <span>{SiteReportWeatherLabels[w as SiteReportWeatherKey] ?? w}</span>
                <span className="font-bold tabular-nums">{count}</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Filtre barı */}
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
          {/* Durum filtresi */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm',
                  statusFilter === s.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Hava durumu filtresi */}
          <div className="flex items-center gap-1 border-s border-border ps-3">
            {WEATHER_FILTERS.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => setWeatherFilter(w.value)}
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium transition-colors',
                  weatherFilter === w.value
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-muted-foreground hover:bg-muted',
                )}
                title={w.label}
              >
                {w.emoji ? (
                  <span className="flex items-center gap-0.5">
                    {w.emoji} <span className="hidden sm:inline">{w.label}</span>
                  </span>
                ) : (
                  w.label
                )}
              </button>
            ))}
          </div>

          {/* Arama */}
          <div className="relative ms-auto w-full sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rapor içeriği ara..."
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
                icon={CalendarDays}
                title={
                  search || statusFilter !== 'all' || weatherFilter !== 'all'
                    ? t('pages.projectTabs.raporlar.noResults')
                    : t('pages.projectTabs.raporlar.noReports')
                }
                description={
                  search || statusFilter !== 'all' || weatherFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.raporlar.noReportsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((report) => {
              const photoCount = report.photos?.length ?? 0;
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
                >
                  {/* Üst satır: Tarih + Durum + Hava */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">
                        {formatDateTr(report.date)}
                      </p>
                      <Badge
                        variant={SiteReportStatusVariants[report.status] ?? 'secondary'}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {SiteReportStatusLabels[report.status] ?? report.status}
                      </Badge>
                    </div>
                    {report.weather && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="text-sm">
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

                  {/* Yapılan işler */}
                  {report.work_summary && (
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {t('pages.projectTabs.raporlar.workDone')}
                      </p>
                      <p className="line-clamp-2 text-sm text-foreground">
                        {report.work_summary}
                      </p>
                    </div>
                  )}

                  {/* Meta: ziyaretçiler, engeller, emniyet, foto */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {report.visitors && (
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        <span className="line-clamp-1">{report.visitors}</span>
                      </span>
                    )}
                    {report.blockers && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <span className="font-semibold">
                          {t('pages.projectTabs.raporlar.blockers')}:
                        </span>{' '}
                        <span className="line-clamp-1">{report.blockers}</span>
                      </span>
                    )}
                    {report.safety_notes && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <Shield className="size-3" />
                        <span className="line-clamp-1">{report.safety_notes}</span>
                      </span>
                    )}
                    {photoCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Camera className="size-3" />
                        <span>{photoCount} fotoğraf</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewSiteReportSheet
        open={openNew}
        onOpenChange={setOpenNew}
        projectId={projectId}
      />

      {selectedReport && (
        <ReportDetailDrawer
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => {
            if (!open) setSelectedReport(null);
          }}
        />
      )}
    </Container>
  );
}
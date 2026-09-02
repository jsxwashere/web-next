'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Cloud,
  LineChart,
  Plus,
  Search,
  Sun,
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
} from '@/lib/enums';
import type { SiteReport } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatDateTr } from '@/lib/helpers';
import { NewSiteReportSheet } from './_components/new-site-report-sheet';

/**
 * Sprint 5 — Saha Raporları (project-scoped).
 *
 * API: GET /api/projects/{projectId}/site-reports
 *
 * Yeni rapor oluşturma (sheet) Sprint 6'da tamamlanacak.
 */

const WEATHER_ICON: Record<string, typeof Sun> = {
  [SiteReportWeather.SUNNY]: Sun,
  [SiteReportWeather.CLOUDY]: Cloud,
  [SiteReportWeather.RAINY]: Cloud,
  [SiteReportWeather.STORMY]: Cloud,
  [SiteReportWeather.SNOWY]: Cloud,
  [SiteReportWeather.FOGGY]: Cloud,
};

export function RaporlarContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const reportsQuery = useProjectSiteReports(projectId);

  const reports = useMemo<SiteReport[]>(
    () => reportsQuery.data?.data ?? [],
    [reportsQuery.data],
  );

  const [search, setSearch] = useState('');
  const [openNew, setOpenNew] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return reports;
    const q = search.toLowerCase();
    return reports.filter(
      (r) =>
        (r.work_summary ?? '').toLowerCase().includes(q) ||
        (r.work_done ?? '').toLowerCase().includes(q) ||
        (r.blockers ?? '').toLowerCase().includes(q) ||
        (r.visitors ?? '').toLowerCase().includes(q),
    );
  }, [reports, search]);

  const summary = reportsQuery.data?.summary;

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
                  <p className="text-2xl font-bold">{summary?.total ?? 0}</p>
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
                    {t('pages.projectTabs.raporlar.submitted')}
                  </p>
                  <p className="text-2xl font-bold">{summary?.submitted ?? 0}</p>
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

        {/* Search */}
        <div className="relative w-full sm:w-72">
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

        {/* Liste */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={CalendarDays}
                title={
                  search
                    ? t('pages.projectTabs.raporlar.noReports')
                    : t('pages.projectTabs.raporlar.noReports')
                }
                description={
                  search
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.raporlar.noReportsDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((report) => {
              const WeatherIcon = report.weather
                ? WEATHER_ICON[report.weather] ?? Sun
                : null;

              return (
                <div
                  key={report.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {WeatherIcon && (
                        <span className="flex items-center gap-1">
                          <WeatherIcon className="size-3" />
                          {report.weather
                            ? SiteReportWeatherLabels[report.weather]
                            : ''}
                        </span>
                      )}
                      {report.temperature_min_c !== null &&
                        report.temperature_min_c !== undefined &&
                        report.temperature_max_c !== null &&
                        report.temperature_max_c !== undefined && (
                          <span className="tabular-nums">
                            {Math.round(report.temperature_min_c)}° /{' '}
                            {Math.round(report.temperature_max_c)}°
                          </span>
                        )}
                    </div>
                  </div>

                  {report.work_summary && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {t('pages.projectTabs.raporlar.workDone')}
                      </p>
                      <p className="text-sm text-foreground">{report.work_summary}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {report.blockers && (
                      <span>
                        <span className="font-semibold">
                          {t('pages.projectTabs.raporlar.blockers')}:
                        </span>{' '}
                        {report.blockers}
                      </span>
                    )}
                    {report.visitors && (
                      <span>
                        <span className="font-semibold">
                          {t('pages.projectTabs.raporlar.visitors')}:
                        </span>{' '}
                        {report.visitors}
                      </span>
                    )}
                  </div>
                </div>
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
    </Container>
  );
}
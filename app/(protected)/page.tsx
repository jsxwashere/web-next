/**
 * `app/(protected)/page.tsx`
 *
 * Sprint 8.1 — Dashboard (Pano) — ŞantiyePro tasarımı taşınmış.
 *
 * ŞantiyePro `resources/js/pages/dashboard/index.tsx` davranışı korunur:
 *   - Selamlama + hava durumu widget'ı (aktif projeler için)
 *   - KPI kartları (aktif şantiyeler, toplam alacak, bu ay gider, bekleyen hakediş)
 *   - En yakın ödeme — ayrı kart
 *   - Kritik ödemeler listesi
 *   - Son hareketler
 *
 * API: GET /api/dashboard/stats + GET /api/dashboard/recent-activity
 *      + GET /api/weather (her aktif proje için)
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import {
  Building2,
  ChevronRight,
  Clock,
  Cloud,
  CloudRain,
  CloudSnow,
  Receipt,
  Sun,
  Wallet,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  useDashboardStats,
  useProjects,
  useRecentActivity,
  type WeatherData,
} from '@/hooks/use-santiyepro-api';
import { formatAmount, formatShortDate, getEnumLabel } from '@/lib/helpers';
import { api } from '@/lib/api/client';
import {
  ProjectStatus,
  Weather,
  WeatherEmojis,
  WeatherLabels,
} from '@/lib/enums';
import type { Project } from '@/lib/api/types';

const WEATHER_ICONS: Record<string, LucideIcon> = {
  [Weather.SUNNY]: Sun,
  [Weather.CLOUDY]: Cloud,
  [Weather.RAINY]: CloudRain,
  [Weather.STORMY]: Wind,
  [Weather.SNOWY]: CloudSnow,
  [Weather.FOGGY]: Cloud,
};

function getGreetingKey(hour: number): string {
  if (hour < 6) return 'greetings.night';
  if (hour < 12) return 'greetings.morning';
  if (hour < 18) return 'greetings.afternoon';
  return 'greetings.evening';
}

/** useQueries queryFn closure'ı içinde hook kullanamayız; api.get direkt çağrılır. */
async function weatherFetcher(
  projectId: string,
  date: string,
): Promise<WeatherData | null> {
  try {
    const res = await api.get<{ data: WeatherData }>('/weather', {
      params: { project_id: projectId, date },
    });
    return res.data;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const statsQuery = useDashboardStats();
  const activityQuery = useRecentActivity(10);
  const projectsQuery = useProjects();

  const stats = statsQuery.data?.stats;
  const activities = activityQuery.data?.activities ?? [];
  const nearest = stats?.critical_payments?.items?.[0] ?? null;

  // ── Aktif projeler için hava durumu (en fazla 6) ──
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const activeProjects = useMemo<Project[]>(
    () =>
      (projectsQuery.data?.data ?? [])
        .filter(
          (p) =>
            p.status === ProjectStatus.IN_PROGRESS ||
            p.status === ProjectStatus.ACTIVE,
        )
        .slice(0, 6),
    [projectsQuery.data],
  );

  const weatherQueries = useQueries({
    queries: useMemo(
      () =>
        activeProjects.map((p) => ({
          queryKey: ['weather', p.id, today],
          queryFn: () => weatherFetcher(p.id, today),
          staleTime: 1000 * 60 * 30,
        })),
      [activeProjects, today],
    ),
  });

  const weatherList = useMemo(
    () =>
      activeProjects.map((p, idx) => ({
        project: p,
        data: weatherQueries[idx]?.data ?? null,
      })),
    [activeProjects, weatherQueries],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return t(getGreetingKey(hour));
  }, [t]);

  return (
    <div className="flex flex-col gap-8 px-4 py-6 lg:px-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('pages.dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Aktif Şantiyeler */}
        <Link
          href="/projects"
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <Building2 className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {t('pages.dashboard.activeProjects')}
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {statsQuery.isLoading ? '—' : (stats?.active_projects ?? 0)}
          </div>
          <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <span>{t('pages.dashboard.activeProjectsSub')}</span>
            <ChevronRight className="size-3.5" />
          </div>
        </Link>

        {/* Toplam Alacak */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <Wallet className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {t('pages.dashboard.totalCollections')}
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {statsQuery.isLoading
              ? '—'
              : formatAmount(stats?.total_collections ?? 0)}
          </div>
          <div className="mt-auto text-sm font-medium text-muted-foreground">
            {t('pages.dashboard.totalCollectionsSub')}
          </div>
        </div>

        {/* Bu Ay Gider */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-100 text-violet-700">
              <Receipt className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {t('pages.dashboard.monthlyPayments')}
            </span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {statsQuery.isLoading
              ? '—'
              : formatAmount(stats?.monthly_payments ?? 0)}
          </div>
          <div className="mt-auto text-sm font-medium text-muted-foreground">
            {t('pages.dashboard.monthlyPaymentsSub')}
          </div>
        </div>

        {/* Bekleyen Hakediş */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700">
              <Receipt className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {t('pages.dashboard.pendingProgress')}
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {statsQuery.isLoading
              ? '—'
              : formatAmount(stats?.pending_progress_payments ?? 0)}
          </div>
          <div className="mt-auto text-sm font-medium text-muted-foreground">
            {t('pages.dashboard.pendingProgressSub')}
          </div>
        </div>
      </div>

      {/* En Yakın Ödeme + Hava Durumu */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {nearest && (
          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700">
                  <Clock className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('pages.dashboard.nearestPayment')}
                    </span>
                    {nearest.status === 'overdue' && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                        {t('pages.dashboard.critical')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xl font-bold text-foreground">
                    {formatAmount(nearest.amount ?? 0)}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {nearest.name}
                    {nearest.date && ` · ${formatShortDate(nearest.date)}`}
                  </div>
                </div>
              </div>
              {nearest.url && (
                <Link
                  href={nearest.url}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  {t('common.buttons.detail')}{' '}
                  <ChevronRight className="size-3.5" />
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hava Durumu — Aktif Projeler */}
        {weatherList.length > 0 && (
          <Card className={nearest ? 'xl:col-span-2' : 'xl:col-span-3'}>
            <CardContent className="flex flex-col gap-3 p-5">
              <header className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {t('pages.dashboard.weatherTitle')}
                </h2>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {t('common.buttons.view')} <ChevronRight className="size-3" />
                </Link>
              </header>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {weatherList.map(({ project, data }) => {
                  const WIcon =
                    WEATHER_ICONS[data?.weather ?? ''] ?? Sun;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
                    >
                      <WIcon className="size-5 text-muted-foreground" />
                      {data ? (
                        <>
                          <span className="line-clamp-1 max-w-full text-[11px] font-semibold">
                            {project.name}
                          </span>
                          <span className="text-xs font-semibold">
                            {data.temperature_min_c ?? '—'}° /{' '}
                            {data.temperature_max_c ?? '—'}°
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {getEnumLabel(data.weather, WeatherLabels)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="line-clamp-1 max-w-full text-[11px] font-semibold text-muted-foreground">
                            {project.name}
                          </span>
                          <Badge variant="outline" className="h-5 text-[10px]">
                            —
                          </Badge>
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Kritik Ödemeler + Son Hareketler */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Kritik Ödemeler */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <header className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t('pages.dashboard.criticalPayments')}
              </h2>
            </header>
            {statsQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            ) : stats?.critical_payments?.items?.length ? (
              <ul className="flex max-h-[400px] flex-col overflow-y-auto">
                {stats.critical_payments.items.map((payment) => {
                  const content = (
                    <>
                      <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-muted">
                        <span className="text-sm leading-none font-bold">
                          {payment.date
                            ? new Date(payment.date).getDate()
                            : '--'}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {payment.name || t('pages.dashboard.payment')}
                        </span>
                        <span className="mt-0.5 block text-[13px] font-semibold text-muted-foreground">
                          {formatAmount(payment.amount)}
                        </span>
                      </span>
                      {payment.days_overdue > 0 && (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                          {payment.days_overdue}{' '}
                          {t('pages.dashboard.daysOverdue')}
                        </span>
                      )}
                    </>
                  );
                  const rowBase =
                    '-mx-2 grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-md px-2 py-3';

                  return (
                    <li key={payment.id}>
                      {payment.url ? (
                        <Link
                          href={payment.url}
                          className={`${rowBase} transition-colors hover:bg-muted/50`}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className={rowBase}>{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                title={t('pages.dashboard.noOverdue')}
                description={t('pages.dashboard.noOverdueDesc')}
              />
            )}
          </CardContent>
        </Card>

        {/* Son Hareketler */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <header className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t('pages.dashboard.recentActivity')}
              </h2>
            </header>
            {activityQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                title={t('pages.dashboard.noActivity')}
                description={t('pages.dashboard.noActivityDesc')}
              />
            ) : (
              <ul className="flex max-h-[400px] flex-col overflow-y-auto">
                {activities.map((activity) => (
                  <li key={activity.id}>
                    {activity.href ? (
                      <Link
                        href={activity.href}
                        className="-mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Receipt className="size-4 text-muted-foreground" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {activity.description}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {activity.project}
                            {activity.date &&
                              ` · ${formatShortDate(activity.date)}`}
                          </span>
                        </span>
                        {activity.amount > 0 && (
                          <span
                            className={
                              'shrink-0 text-sm font-semibold ' +
                              (activity.type === 'payment'
                                ? 'text-red-600'
                                : activity.type === 'collection'
                                  ? 'text-emerald-600'
                                  : 'text-foreground')
                            }
                          >
                            {formatAmount(activity.amount)}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="-mx-2 flex items-start gap-3 rounded-md px-2 py-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Receipt className="size-4 text-muted-foreground" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {activity.description}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {activity.project}
                            {activity.date &&
                              ` · ${formatShortDate(activity.date)}`}
                          </span>
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
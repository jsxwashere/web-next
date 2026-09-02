/**
 * `app/(protected)/projects/page.tsx`
 *
 * Sprint 8.1 — Projeler listesi (ŞantiyePro tasarımı taşınmış).
 *
 * ŞantiyePro `resources/js/pages/projects/index.tsx` davranışı korunur:
 *   - Liste/Kart görünümü toggle (localStorage persist)
 *   - Durum tab'ları (Tümü, Aktif, Tamamlandı, Pasif) — sayıları ile
 *   - Tip tab'ları (Tümü, Kat Karşılığı, Kendi Arsana, Taahhüt, Kentsel Dönüşüm)
 *   - Arama (isim + konum)
 *   - Proje kartı: tip ikonu, isim, konum, progress bar, birim sayıları, hava durumu badge
 *   - Personel/firma count'ları useProjectStats ile dinamik
 *
 * API: GET /api/projects, GET /api/weather, GET /api/projects/{id}/stats
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import {
  Building2,
  Cloud,
  CloudRain,
  CloudSnow,
  FolderOpen,
  HardHat,
  LandPlot,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  RotateCw,
  Search,
  Sun,
  Users,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useProjectStats,
  useProjectWeather,
  useProjects,
  type ProjectStats,
  type WeatherData,
} from '@/hooks/use-santiyepro-api';
import {
  ProjectStatus,
  ProjectStatusLabels,
  ProjectStatusVariants,
  ProjectType,
  ProjectTypeLabels,
  Weather,
  WeatherEmojis,
  WeatherLabels,
  type ProjectStatus as ProjectStatusType,
  type ProjectType as ProjectTypeKey,
} from '@/lib/enums';
import type { Project } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatNumber, getEnumLabel } from '@/lib/helpers';

type StatusFilter = 'all' | ProjectStatusType;
type TypeFilter = 'all' | ProjectTypeKey;

const TYPE_ICONS: Record<string, LucideIcon> = {
  [ProjectType.CO_BUILD]: Building2,
  [ProjectType.OWN_LAND]: LandPlot,
  [ProjectType.CONTRACT]: HardHat,
  [ProjectType.URBAN_RENEWAL]: RotateCw,
};

const WEATHER_ICONS: Record<string, LucideIcon> = {
  [Weather.SUNNY]: Sun,
  [Weather.CLOUDY]: Cloud,
  [Weather.RAINY]: CloudRain,
  [Weather.STORMY]: Wind,
  [Weather.SNOWY]: CloudSnow,
  [Weather.FOGGY]: Cloud,
};

export default function ProjectsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('common.labels.all') },
    {
      value: ProjectStatus.IN_PROGRESS,
      label: ProjectStatusLabels[ProjectStatus.IN_PROGRESS],
    },
    {
      value: ProjectStatus.COMPLETED,
      label: ProjectStatusLabels[ProjectStatus.COMPLETED],
    },
    {
      value: ProjectStatus.PASSIVE,
      label: ProjectStatusLabels[ProjectStatus.PASSIVE],
    },
  ];

  const TYPE_TABS: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: t('pages.projects.typeAll') },
    { value: ProjectType.CO_BUILD, label: ProjectTypeLabels[ProjectType.CO_BUILD] },
    { value: ProjectType.OWN_LAND, label: ProjectTypeLabels[ProjectType.OWN_LAND] },
    { value: ProjectType.CONTRACT, label: ProjectTypeLabels[ProjectType.CONTRACT] },
    {
      value: ProjectType.URBAN_RENEWAL,
      label: ProjectTypeLabels[ProjectType.URBAN_RENEWAL],
    },
  ];

  const projectsQuery = useProjects();

  const projects = useMemo<Project[]>(
    () => projectsQuery.data?.data ?? [],
    [projectsQuery.data],
  );

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StatusFilter>(
    ProjectStatus.IN_PROGRESS,
  );
  const [activeTypeTab, setActiveTypeTab] = useState<TypeFilter>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // ── Hava durumu sorguları (her proje için bugün) ──
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);

  const weatherQueries = useQueries({
    queries: useMemo(
      () =>
        projectIds.map((projectId) => ({
          queryKey: ['weather', projectId, today],
          queryFn: () => weatherFetcher(projectId, today),
          staleTime: 1000 * 60 * 30,
        })),
      [projectIds, today],
    ),
  });

  const weatherMap = useMemo<Record<string, WeatherData | null>>(() => {
    const map: Record<string, WeatherData | null> = {};
    projectIds.forEach((projectId, index) => {
      const q = weatherQueries[index];
      if (q?.data) {
        map[projectId] = q.data;
      }
    });
    return map;
  }, [weatherQueries, projectIds]);

  // ── Proje istatistikleri (personel/firma count) ──
  const statsQueries = useQueries({
    queries: useMemo(
      () =>
        projectIds.map((projectId) => ({
          queryKey: ['project-stats', projectId],
          queryFn: () => statsFetcher(projectId),
          staleTime: 1000 * 60 * 5,
        })),
      [projectIds],
    ),
  });

  const statsMap = useMemo<Record<string, ProjectStats | null>>(() => {
    const map: Record<string, ProjectStats | null> = {};
    projectIds.forEach((projectId, index) => {
      const q = statsQueries[index];
      if (q?.data) {
        map[projectId] = q.data;
      }
    });
    return map;
  }, [statsQueries, projectIds]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.location ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = activeTab === 'all' || p.status === activeTab;
      const matchesType =
        activeTypeTab === 'all' || p.type === activeTypeTab;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, search, activeTab, activeTypeTab]);

  const statusCounts = useMemo(
    () => ({
      all: projects.length,
      [ProjectStatus.ACTIVE]: projects.filter(
        (p) => p.status === ProjectStatus.ACTIVE,
      ).length,
      [ProjectStatus.IN_PROGRESS]: projects.filter(
        (p) => p.status === ProjectStatus.IN_PROGRESS,
      ).length,
      [ProjectStatus.COMPLETED]: projects.filter(
        (p) => p.status === ProjectStatus.COMPLETED,
      ).length,
      [ProjectStatus.PASSIVE]: projects.filter(
        (p) => p.status === ProjectStatus.PASSIVE,
      ).length,
    }),
    [projects],
  );

  const typeCounts = useMemo(
    () => ({
      all: projects.length,
      [ProjectType.CO_BUILD]: projects.filter(
        (p) => p.type === ProjectType.CO_BUILD,
      ).length,
      [ProjectType.OWN_LAND]: projects.filter(
        (p) => p.type === ProjectType.OWN_LAND,
      ).length,
      [ProjectType.CONTRACT]: projects.filter(
        (p) => p.type === ProjectType.CONTRACT,
      ).length,
      [ProjectType.URBAN_RENEWAL]: projects.filter(
        (p) => p.type === ProjectType.URBAN_RENEWAL,
      ).length,
    }),
    [projects],
  );

  const handleSelectProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  // Loading skeleton
  if (projectsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-medium">{t('pages.projects.title')}</h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projects.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (projectsQuery.error) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <h1 className="text-base font-medium">{t('pages.projects.title')}</h1>
        <EmptyState
          icon={FolderOpen}
          title={t('pages.projects.error')}
          description={t('pages.projects.errorDesc')}
          action={
            <Button size="sm" onClick={() => projectsQuery.refetch()}>
              {t('common.buttons.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium">{t('pages.projects.title')}</h1>
          <p className="text-xs text-muted-foreground">
            {t('pages.projects.subtitle')}
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/projects/new" data-tour="projeler-create">
            <Plus className="size-3.5" />
            {t('pages.projects.newProject')}
          </Link>
        </Button>
      </div>

      {/* Filtre bar */}
      <div className="flex flex-col gap-3 border-b border-border pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Durum tab'ları */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm',
                  activeTab === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {tab.label}
                <Badge
                  variant={activeTab === tab.value ? 'secondary' : 'outline'}
                  className="ml-0.5 h-4 min-w-4 text-[10px] sm:h-5 sm:min-w-5 sm:text-xs"
                >
                  {statusCounts[tab.value]}
                </Badge>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:ms-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('pages.projects.searchPlaceholder')}
                className="h-8 w-full ps-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            >
              {viewMode === 'list' ? (
                <>
                  <LayoutGrid className="size-3.5" />
                  {t('common.buttons.card')}
                </>
              ) : (
                <>
                  <List className="size-3.5" />
                  {t('common.buttons.list')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tip tab'ları */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTypeTab(tab.value)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors sm:text-xs',
                activeTypeTab === tab.value
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {tab.label}
              {typeCounts[tab.value] > 0 && (
                <span className="text-[10px] opacity-70">
                  {typeCounts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik */}
      {filtered.length > 0 ? (
        viewMode === 'list' ? (
          <div className="flex flex-col gap-4">
            {filtered.map((project) => {
              const Icon = TYPE_ICONS[project.type] ?? Building2;
              const hasUnits = (project.total_units ?? 0) > 0;
              const landownerCount = project.landowner_units ?? 0;
              const weather = weatherMap[project.id];
              const stats = statsMap[project.id];

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelectProject(project)}
                  className="group flex cursor-pointer flex-col rounded-lg border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted focus-visible:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                      <Icon className="size-4" />
                    </div>
                    <h2 className="line-clamp-1 text-[15px] font-bold text-foreground">
                      {project.name}
                    </h2>
                    {/* Hava Durumu Badge */}
                    {weather && (
                      <Badge
                        variant="outline"
                        className="h-5 shrink-0 gap-1 px-2 text-[11px]"
                      >
                        <span>{WeatherEmojis[weather.weather as Weather] ?? ''}</span>
                        <span>
                          {getEnumLabel(weather.weather, WeatherLabels)}
                        </span>
                        {weather.temperature_min_c !== null &&
                          weather.temperature_max_c !== null && (
                            <span className="tabular-nums">
                              · {weather.temperature_min_c}°/
                              {weather.temperature_max_c}°
                            </span>
                          )}
                      </Badge>
                    )}
                    {/* Durum - en sağda */}
                    <Badge
                      variant={
                        ProjectStatusVariants[project.status] ?? 'secondary'
                      }
                      className="ms-auto h-5 shrink-0 px-2 text-[11px]"
                    >
                      {ProjectStatusLabels[project.status] ?? project.status}
                    </Badge>
                  </div>

                  {/* İkinci satır - Sol: Konum, Sağ: Personel/Firma */}
                  <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">
                        {project.location ?? t('pages.projects.noLocation')}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3" />
                        <span>
                          {stats?.personnel_count ?? 0}{' '}
                          {t('pages.projects.personnelCount')}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-3" />
                        <span>
                          {stats?.firm_count ?? 0}{' '}
                          {t('pages.projects.firmCount')}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{ width: `${project.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-orange-600 tabular-nums">
                      %{project.progress ?? 0}
                    </span>
                  </div>

                  {hasUnits && (
                    <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm leading-none font-semibold tabular-nums">
                          {project.total_units ?? 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.total')}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm leading-none font-semibold text-green-600 tabular-nums">
                          {project.sold_count ?? 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.sold')}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm leading-none font-semibold text-orange-600 tabular-nums">
                          {landownerCount > 0 ? landownerCount : 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.landowner')}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm leading-none font-semibold tabular-nums">
                          {formatNumber(
                            (project.total_units ?? 0) -
                              (project.sold_count ?? 0),
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.remaining')}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => {
              const Icon = TYPE_ICONS[project.type] ?? Building2;
              const hasUnits = (project.total_units ?? 0) > 0;
              const landownerCount = project.landowner_units ?? 0;
              const weather = weatherMap[project.id];
              const stats = statsMap[project.id];
              const WeatherIcon =
                WEATHER_ICONS[weather?.weather ?? ''] ?? Sun;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelectProject(project)}
                  className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-muted focus-visible:outline-none"
                >
                  <header className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                      <Icon className="size-4" />
                    </div>
                    <h2 className="line-clamp-1 flex-1 text-lg font-bold">
                      {project.name}
                    </h2>
                    {/* Hava Durumu */}
                    {weather && (
                      <Badge
                        variant="outline"
                        className="h-6 shrink-0 gap-1.5 px-2.5 text-[12px]"
                      >
                        <WeatherIcon className="size-3" />
                        <span>
                          {getEnumLabel(weather.weather, WeatherLabels)}
                        </span>
                        {weather.temperature_min_c !== null &&
                          weather.temperature_max_c !== null && (
                            <span className="tabular-nums">
                              · {weather.temperature_min_c}° /{' '}
                              {weather.temperature_max_c}°
                            </span>
                          )}
                      </Badge>
                    )}
                    {/* Durum - en sağda */}
                    <Badge
                      variant={
                        ProjectStatusVariants[project.status] ?? 'secondary'
                      }
                      className="ms-auto h-6 px-2.5 text-[12px]"
                    >
                      {ProjectStatusLabels[project.status] ?? project.status}
                    </Badge>
                  </header>

                  <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground/60" />
                      <span className="truncate">
                        {project.location ?? t('pages.projects.noLocation')}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        <span>
                          {stats?.personnel_count ?? 0}{' '}
                          {t('pages.projects.personnelCount')}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        <span>
                          {stats?.firm_count ?? 0}{' '}
                          {t('pages.projects.firmCount')}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{ width: `${project.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="tabular text-[15px] font-bold text-orange-600">
                      %{project.progress ?? 0}
                    </span>
                  </div>

                  {hasUnits && (
                    <div className="mt-1 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="tabular text-[18px] leading-none font-semibold tracking-tight">
                          {project.total_units ?? 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.total')}
                        </span>
                      </div>
                      <span className="h-6 w-px bg-border" />
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="tabular text-[18px] leading-none font-semibold tracking-tight text-green-600">
                          {project.sold_count ?? 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.sold')}
                        </span>
                      </div>
                      <span className="h-6 w-px bg-border" />
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="tabular text-[18px] leading-none font-semibold tracking-tight text-orange-600">
                          {landownerCount > 0 ? landownerCount : 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.landowner')}
                        </span>
                      </div>
                      <span className="h-6 w-px bg-border" />
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="tabular text-[18px] leading-none font-semibold tracking-tight">
                          {formatNumber(
                            (project.total_units ?? 0) -
                              (project.sold_count ?? 0),
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {t('pages.projects.remaining')}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={FolderOpen}
              title={
                search || activeTab !== 'all' || activeTypeTab !== 'all'
                  ? t('pages.projects.noResults')
                  : t('pages.projects.noProjects')
              }
              description={
                search || activeTab !== 'all' || activeTypeTab !== 'all'
                  ? t('common.messages.clearFilters')
                  : t('pages.projects.noProjectsDesc')
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Hava durumu fetch — useQueries'in `queryFn` closure'ı içinde hook kullanamayız
 * (rules of hooks); bu yüzden direkt api.get ile çekilir.
 * İlgili cache key'i useProjectWeather ile çakışmaması için özel prefix.
 */
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

async function statsFetcher(projectId: string): Promise<ProjectStats | null> {
  try {
    const res = await api.get<{ data: ProjectStats }>(
      `/projects/${projectId}/stats`,
    );
    return res.data;
  } catch {
    return null;
  }
}
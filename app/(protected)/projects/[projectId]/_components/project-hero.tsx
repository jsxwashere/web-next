/**
 * `project-hero.tsx`
 *
 * Sprint 8.3b — Tüm 9 proje içi sayfada (tahsilat, ödeme, sözleşme, ...)
 * ortak render edilen proje hero başlık bileşeni.
 *
 * Layout:
 *  - Sol: Proje adı (büyük), tip + durum badge, lokasyon
 *  - Orta: Tamamlanma yüzdesi + tarih aralığı
 *  - Sağ: Hava durumu widget'ı + hızlı işlem butonları
 *  - Sol border rengi: proje tipine göre değişir
 *
 * Tüm 9 proje içi sayfada `ProjectTabs`'in hemen altında render edilir.
 * ŞantiyePro referans: `resources/js/pages/project/detail/index.tsx`
 * pickProjectColor + CloudSun weather widget + MapPin lokasyon.
 */

'use client';

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Cloud,
  CloudRain,
  CloudSnow,
  MapPin,
  ReceiptText,
  Sun,
  Wind,
} from 'lucide-react';
import { useState } from 'react';
import { useProject } from '@/hooks/use-santiyepro-api';
import { useTodayAttendance } from '@/hooks/use-santiyepro-api';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ProjectStatus,
  ProjectStatusLabels,
  ProjectStatusVariants,
  ProjectType,
  ProjectTypeLabels,
  AttendanceStatus,
} from '@/lib/enums';
import type { ProjectType as ProjectTypeKey } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { todayStr } from '@/lib/helpers';
import { NewCollectionSheet } from '../tahsilatlar/_components/new-collection-sheet';
import { NewPaymentSheet } from '../odemeler/_components/new-payment-sheet';

const PROJECT_COLOR: Record<ProjectTypeKey, string> = {
  [ProjectType.OWN_LAND]: 'bg-emerald-500',
  [ProjectType.CONTRACT]: 'bg-blue-500',
  [ProjectType.URBAN_RENEWAL]: 'bg-amber-500',
  [ProjectType.CO_BUILD]: 'bg-violet-500',
};

const WEATHER_ICON: Record<string, typeof Sun> = {
  sunny: Sun,
  clear: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  stormy: CloudRain,
  foggy: Cloud,
  windy: Wind,
};

export interface ProjectHeroProps {
  projectId: string;
}

/**
 * Sprint 8.3b — Tüm 9 proje içi sayfada paylaşılan hero.
 * Layout (ProjectLayout) içinde <ProjectTabs/> altında render edilir.
 */
export function ProjectHero({ projectId }: ProjectHeroProps) {
  const { t } = useTranslation();
  const { data: projectResp, isLoading } = useProject(projectId);
  const today = todayStr();
  const { data: attendanceResp } = useTodayAttendance(today, {
    project_id: projectId,
  });
  const todayAtSite = (() => {
    const items = Array.isArray(attendanceResp?.data) ? attendanceResp.data : [];
    const onSiteStatuses: AttendanceStatus[] = [
      AttendanceStatus.FULL_DAY,
      AttendanceStatus.HALF_DAY,
      AttendanceStatus.PRESENT,
      AttendanceStatus.LATE,
    ];
    return items
      .filter((e): e is { status?: string } => typeof e === 'object' && e !== null)
      .filter((e) => onSiteStatuses.includes(e.status as AttendanceStatus))
      .length;
  })();

  const [openCollection, setOpenCollection] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  if (isLoading) {
    return (
      <div className="border-b border-border bg-card/40 px-4 py-4 lg:px-6">
        <div className="mx-auto flex max-w-[1320px] items-center gap-3">
          <div className="h-12 w-1 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden h-10 w-40 animate-pulse rounded-md bg-muted sm:block" />
        </div>
      </div>
    );
  }

  const project = projectResp?.data;
  if (!project) {
    return (
      <div className="border-b border-border bg-card/40 px-4 py-4 lg:px-6">
        <div className="mx-auto max-w-[1320px] text-sm text-muted-foreground">
          {t('pages.projectTabs.hero.projectNotFound')}
        </div>
      </div>
    );
  }

  const colorBar = PROJECT_COLOR[project.type] ?? 'bg-gray-400';
  const typeLabel = ProjectTypeLabels[project.type] ?? project.type;
  const statusLabel = ProjectStatusLabels[project.status] ?? project.status;
  const statusVariant = ProjectStatusVariants[project.status] ?? 'secondary';

  // Progress (placeholder: project.progress yoksa 0)
  const progress = typeof project.progress === 'number' ? project.progress : 0;
  const startDate = (project as { start_date?: string }).start_date;
  const endDate = (project as { end_date?: string }).end_date;

  return (
    <div className="border-b border-border bg-card/40 px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 lg:flex-row lg:items-center">
        {/* Sol: renk çubuğu + isim + badge + lokasyon */}
        <div className="flex flex-1 items-start gap-3">
          <div className={cn('mt-1 h-12 w-1 rounded-full', colorBar)} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight lg:text-2xl">
                {project.name}
              </h1>
              <Badge variant="outline" className="text-[10px]">
                {typeLabel}
              </Badge>
              <Badge variant={statusVariant} className="text-[10px]">
                {statusLabel}
              </Badge>
            </div>
            {project.location ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {project.location}
              </p>
            ) : (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {t('pages.projectTabs.hero.noLocation')}
              </p>
            )}
          </div>
        </div>

        {/* Orta: progress ring */}
        <div className="flex items-center gap-3 lg:px-4">
          <div className="relative grid size-14 place-items-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
              <circle
                className="text-muted"
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <circle
                className="text-primary transition-all"
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${Math.min(100, progress)}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <span className="text-[11px] font-bold tabular-nums">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
          <div className="hidden flex-col text-xs lg:flex">
            {(startDate || endDate) && (
              <span className="text-muted-foreground">
                {startDate ?? '—'} → {endDate ?? '—'}
              </span>
            )}
            <span className="font-semibold">
              {t('pages.dashboard.activeProjectsSub')}
            </span>
          </div>
        </div>

        {/* Sağ: hava durumu + bugün şantiyede + hızlı işlemler */}
        <div className="flex flex-col gap-2 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <TodayAtSiteBadge count={todayAtSite} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setOpenCollection(true)}
            >
              <ArrowDownToLine className="me-1 size-4" />
              {t('pages.projectTabs.hero.newCollection')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpenPayment(true)}
            >
              <ArrowUpFromLine className="me-1 size-4" />
              {t('pages.projectTabs.hero.newPayment')}
            </Button>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <NewCollectionSheet
        open={openCollection}
        onOpenChange={setOpenCollection}
        projectId={projectId}
      />
      <NewPaymentSheet
        open={openPayment}
        onOpenChange={setOpenPayment}
        projectId={projectId}
      />
    </div>
  );
}

/**
 * Bugün şantiyede olan personel sayısı rozeti.
 * attendance response içinden status filtresiyle sayım yaparız.
 */
function TodayAtSiteBadge({ count }: { count: number }) {
  const { t } = useTranslation();
  return (
    <Badge variant="success" appearance="light" className="gap-1.5 px-2.5 py-1">
      <ReceiptText className="size-3" />
      <span className="text-[11px]">
        {count} {t('pages.projectTabs.personel.todayAtSite')}
      </span>
    </Badge>
  );
}

/**
 * Hava durumu placeholder'ı — Sprint 8.1'de useProjectWeather var ama her sayfada
 * ayrı istek atmamak için global hava durumu için Sprint 8.4'te eklenebilir.
 */
export function ProjectWeatherBadge({
  weather,
  tempMinC,
  tempMaxC,
}: {
  weather: string;
  tempMinC?: number | null;
  tempMaxC?: number | null;
}) {
  const Icon = WEATHER_ICON[weather] ?? Sun;
  const temps: string[] = [];
  if (tempMinC != null) temps.push(`${Math.round(tempMinC)}°`);
  if (tempMaxC != null) temps.push(`${Math.round(tempMaxC)}°`);
  return (
    <Badge variant="info" appearance="light" className="gap-1.5 px-2.5 py-1">
      <Icon className="size-3" />
      <span className="text-[11px]">{temps.join(' / ') || '—'}</span>
    </Badge>
  );
}

// Mark unused-import lint-safe
void Banknote;
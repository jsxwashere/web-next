/**
 * `app/(protected)/personnel/page.tsx`
 *
 * Sprint 8.1 — Global Personel listesi (ŞantiyePro tasarımı taşınmış).
 *
 * ŞantiyePro `resources/js/pages/personnel/index.tsx` davranışı korunur:
 *   - Stat kartları: Aktif Personel, Bugün Şantiyede, Bu Ay Maaş
 *   - Günlük/Haftalık/Aylık dağılımı
 *   - Durum tabs (Aktif, Pasif, Ayrılan, Tümü)
 *   - Maaş tipi filtresi (Günlük, Haftalık, Aylık)
 *   - Arama (isim + rol)
 *   - Personel kartları: avatar, isim, rol, maaş, aktif/pasif toggle
 *
 * API: GET /api/personnel, GET /api/attendance?date=
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CalendarCheck,
  DollarSign,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  usePersonnel,
  useTodayAttendance,
  useTogglePersonnelStatus,
} from '@/hooks/use-santiyepro-api';
import {
  AttendanceStatus,
  PersonnelRoleLabels,
  PersonnelStatus,
  PersonnelStatusLabels,
  PersonnelStatusVariants,
  SalaryType,
  SalaryTypeLabels,
  type PersonnelStatus as PersonnelStatusKey,
  type SalaryType as SalaryTypeKey,
} from '@/lib/enums';
import type { Personnel, PersonnelAssignment } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import {
  formatAmount,
  getInitials,
  storageUrl,
  todayStr,
} from '@/lib/helpers';

const AVATAR_COLORS = [
  'bg-blue-500/10 text-blue-500',
  'bg-violet-500/10 text-violet-500',
  'bg-emerald-500/10 text-emerald-500',
  'bg-amber-500/10 text-amber-500',
  'bg-rose-500/10 text-rose-500',
  'bg-cyan-500/10 text-cyan-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getRoleLabel(
  role?: string | null,
  customRole?: string | null,
): string {
  if (!role && !customRole) return '—';
  if (role === '__custom__' || (role && !PersonnelRoleLabels[role])) {
    return customRole ?? role ?? '—';
  }
  return PersonnelRoleLabels[role ?? ''] ?? customRole ?? role ?? '—';
}

function getActiveAssignment(p: Personnel): PersonnelAssignment | undefined {
  return p.assignments?.find((a) => a.is_active) ?? p.assignments?.[0];
}

function getWage(a?: PersonnelAssignment): {
  amount: number;
  unitKey: 'wagePerDay' | 'wagePerWeek' | 'wagePerMonth' | null;
} {
  if (!a) return { amount: 0, unitKey: null };
  if (a.salary_type === SalaryType.MONTHLY && a.monthly_salary) {
    return { amount: a.monthly_salary, unitKey: 'wagePerMonth' };
  }
  if (a.salary_type === SalaryType.WEEKLY && a.weekly_salary) {
    return { amount: a.weekly_salary, unitKey: 'wagePerWeek' };
  }
  if (a.daily_wage) {
    return { amount: a.daily_wage, unitKey: 'wagePerDay' };
  }
  return { amount: 0, unitKey: null };
}

type StatusTabValue = PersonnelStatusKey | 'all';
type SalaryTypeFilterValue = 'all' | SalaryTypeKey;

export default function PersonnelPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const personnelQuery = usePersonnel();
  const toggleMutation = useTogglePersonnelStatus();

  const todayDate = todayStr();
  const attendanceQuery = useTodayAttendance(todayDate);

  const personnel = useMemo<Personnel[]>(
    () => personnelQuery.data?.data ?? [],
    [personnelQuery.data],
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTabValue>(
    PersonnelStatus.ACTIVE,
  );
  const [salaryTypeFilter, setSalaryTypeFilter] =
    useState<SalaryTypeFilterValue>('all');

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((p) => {
      // Durum filtresi
      if (statusFilter !== 'all') {
        if (statusFilter === PersonnelStatus.ACTIVE && p.status !== PersonnelStatus.ACTIVE) {
          return false;
        }
        if (
          statusFilter === PersonnelStatus.PASSIVE &&
          p.status === PersonnelStatus.ACTIVE
        ) {
          return false;
        }
        if (
          statusFilter === PersonnelStatus.LEFT &&
          p.status !== PersonnelStatus.LEFT
        ) {
          return false;
        }
      }

      // Maaş tipi filtresi
      if (salaryTypeFilter !== 'all') {
        const match = p.assignments?.some(
          (x) => x.is_active && x.salary_type === salaryTypeFilter,
        );
        if (!match) return false;
      }

      // Arama
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.role ?? '').toLowerCase().includes(q) ||
          (p.custom_role ?? '').toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [personnel, statusFilter, salaryTypeFilter, search]);

  const activeCount = useMemo(
    () => personnel.filter((p) => p.status === PersonnelStatus.ACTIVE).length,
    [personnel],
  );
  const passiveCount = useMemo(
    () =>
      personnel.filter((p) => p.status === PersonnelStatus.PASSIVE).length,
    [personnel],
  );
  const leftCount = useMemo(
    () => personnel.filter((p) => p.status === PersonnelStatus.LEFT).length,
    [personnel],
  );

  // ── Bugün şantiyede sayısı (attendance records) ──
  const todayAtSiteCount = useMemo(() => {
    const entries = attendanceQuery.data?.data ?? [];
    return entries.filter(
      (e) =>
        (e as { status?: string }).status === AttendanceStatus.FULL_DAY ||
        (e as { status?: string }).status === AttendanceStatus.HALF_DAY ||
        (e as { status?: string }).status === AttendanceStatus.PRESENT ||
        (e as { status?: string }).status === AttendanceStatus.LATE,
    ).length;
  }, [attendanceQuery.data]);

  // ── Maaş tipi dağılımı (sadece aktif) ──
  const dailyCount = useMemo(
    () =>
      personnel.filter((p) => {
        if (p.status !== PersonnelStatus.ACTIVE) return false;
        const a = getActiveAssignment(p);
        return a?.salary_type === SalaryType.DAILY;
      }).length,
    [personnel],
  );
  const weeklyCount = useMemo(
    () =>
      personnel.filter((p) => {
        if (p.status !== PersonnelStatus.ACTIVE) return false;
        const a = getActiveAssignment(p);
        return a?.salary_type === SalaryType.WEEKLY;
      }).length,
    [personnel],
  );
  const monthlyCount = useMemo(
    () =>
      personnel.filter((p) => {
        if (p.status !== PersonnelStatus.ACTIVE) return false;
        const a = getActiveAssignment(p);
        return a?.salary_type === SalaryType.MONTHLY;
      }).length,
    [personnel],
  );

  // ── Bu ay tahmini maaş ──
  const totalMonthlySalary = useMemo(() => {
    return personnel
      .filter((p) => p.status === PersonnelStatus.ACTIVE)
      .reduce((sum, p) => {
        const a = getActiveAssignment(p);
        if (a?.salary_type === SalaryType.MONTHLY && a.monthly_salary) {
          return sum + a.monthly_salary;
        }
        if (a?.salary_type === SalaryType.WEEKLY && a.weekly_salary) {
          return sum + a.weekly_salary * 4.33;
        }
        if (a?.salary_type === SalaryType.DAILY && a.daily_wage) {
          return sum + a.daily_wage * 22;
        }
        return sum;
      }, 0);
  }, [personnel]);

  const handleToggle = (p: Personnel) => {
    const newStatus =
      p.status === PersonnelStatus.ACTIVE
        ? PersonnelStatus.PASSIVE
        : PersonnelStatus.ACTIVE;
    toggleMutation.mutate({ id: p.id, status: newStatus });
  };

  const handleSelect = (p: Personnel) => {
    router.push(`/personnel/${p.id}`);
  };

  if (personnelQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div>
          <h1 className="text-base font-medium">{t('pages.personnel.title')}</h1>
          <p className="text-xs text-muted-foreground">
            {t('pages.personnel.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium">{t('pages.personnel.title')}</h1>
          <p className="text-xs text-muted-foreground">
            {t('pages.personnel.subtitle')}
          </p>
        </div>
        <Button size="sm">
          <Users className="me-1 size-4" />
          {t('pages.personnel.addPersonnel')}
        </Button>
      </div>

      {/* Stat Kartları */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-5">
                <Users className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('pages.personnel.activePersonnel')}
                </p>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">
                  {t('pages.personnel.passive')}: {passiveCount} ·{' '}
                  {t('pages.personnel.left')}: {leftCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-5">
                <CalendarCheck className="size-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('pages.personnel.todayAtSite')}
                </p>
                <p className="text-2xl font-bold">{todayAtSiteCount}</p>
                <p className="text-xs text-muted-foreground">
                  {t('pages.personnel.todayAtSiteSub')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-5">
                <DollarSign className="size-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {t('pages.personnel.monthlySalary')}
                </p>
                <p className="text-2xl font-bold">
                  {formatAmount(totalMonthlySalary)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('pages.personnel.monthlySalarySub')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maaş tipi dağılımı (compact) */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Building2 className="size-3.5" />
          {t('pages.personnel.dailyCount')}: {dailyCount}
        </span>
        <span className="flex items-center gap-1.5">
          {t('pages.personnel.weeklyCount')}: {weeklyCount}
        </span>
        <span className="flex items-center gap-1.5">
          {t('pages.personnel.monthlyCount')}: {monthlyCount}
        </span>
      </div>

      {/* Filtre barı */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSalaryTypeFilter(
                salaryTypeFilter === SalaryType.DAILY ? 'all' : SalaryType.DAILY,
              )
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              salaryTypeFilter === SalaryType.DAILY
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {SalaryTypeLabels[SalaryType.DAILY]}
          </button>
          <button
            type="button"
            onClick={() =>
              setSalaryTypeFilter(
                salaryTypeFilter === SalaryType.WEEKLY
                  ? 'all'
                  : SalaryType.WEEKLY,
              )
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              salaryTypeFilter === SalaryType.WEEKLY
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {SalaryTypeLabels[SalaryType.WEEKLY]}
          </button>
          <button
            type="button"
            onClick={() =>
              setSalaryTypeFilter(
                salaryTypeFilter === SalaryType.MONTHLY
                  ? 'all'
                  : SalaryType.MONTHLY,
              )
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              salaryTypeFilter === SalaryType.MONTHLY
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {SalaryTypeLabels[SalaryType.MONTHLY]}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages.personnel.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {t('pages.personnel.all')}{' '}
            <span className="text-xs opacity-70">{personnel.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(PersonnelStatus.ACTIVE)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === PersonnelStatus.ACTIVE
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {PersonnelStatusLabels[PersonnelStatus.ACTIVE]}{' '}
            <span className="text-xs opacity-70">{activeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(PersonnelStatus.PASSIVE)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === PersonnelStatus.PASSIVE
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {PersonnelStatusLabels[PersonnelStatus.PASSIVE]}{' '}
            <span className="text-xs opacity-70">{passiveCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(PersonnelStatus.LEFT)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === PersonnelStatus.LEFT
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {PersonnelStatusLabels[PersonnelStatus.LEFT]}{' '}
            <span className="text-xs opacity-70">{leftCount}</span>
          </button>
        </div>
      </div>

      {/* Liste */}
      {filteredPersonnel.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Users}
              title={
                personnel.length === 0
                  ? t('pages.personnel.noPersonnel')
                  : t('pages.personnel.noResults')
              }
              description={
                personnel.length === 0
                  ? t('pages.personnel.noPersonnelDesc')
                  : t('pages.personnel.noResultsDesc')
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPersonnel.map((p) => {
            const roleLabel = getRoleLabel(p.role, p.custom_role);
            const a = getActiveAssignment(p);
            const { amount: wage, unitKey: wageUnitKey } = getWage(a);
            const color = getAvatarColor(p.name);
            const isLeft = p.status === PersonnelStatus.LEFT;
            const isActive = p.status === PersonnelStatus.ACTIVE;

            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(p);
                  }
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent/50',
                  !isActive && !isLeft && 'opacity-60',
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {p.photo ? (
                    <img
                      src={storageUrl(p.photo)}
                      alt={p.name}
                      className="size-11 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex size-11 items-center justify-center rounded-full text-xs font-bold',
                        color,
                      )}
                    >
                      {getInitials(p.name)}
                    </div>
                  )}
                  <div
                    className={cn(
                      'absolute right-0 bottom-0 size-3 rounded-full border-2 border-background',
                      isActive ? 'bg-green-500' : 'bg-gray-400',
                    )}
                  />
                </div>

                {/* Bilgiler */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate text-sm font-bold',
                      isLeft && 'text-muted-foreground line-through',
                    )}
                  >
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{roleLabel}</span>
                    {wage > 0 && wageUnitKey && (
                      <>
                        <span>·</span>
                        <span>
                          {formatAmount(wage)} {t(`pages.personnel.${wageUnitKey}`)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Sağ: Aktif toggle veya rozet */}
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant={PersonnelStatusVariants[p.status] ?? 'secondary'}
                  >
                    {PersonnelStatusLabels[p.status] ?? p.status}
                  </Badge>
                  {isLeft ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(p);
                      }}
                      title={t('pages.personnel.reactivate')}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(p);
                      }}
                      disabled={toggleMutation.isPending}
                      title={
                        isActive
                          ? t('pages.personnel.deactivate')
                          : t('pages.personnel.activate')
                      }
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors',
                        isActive ? 'bg-primary' : 'bg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'size-5 rounded-full bg-background shadow-sm transition-transform',
                          isActive ? 'translate-x-5' : 'translate-x-0',
                        )}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
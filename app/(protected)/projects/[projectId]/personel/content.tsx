'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  DollarSign,
  Phone,
  Plus,
  Search,
  Settings,
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
import {
  useProjectPersonnel,
  useTodayAttendance,
} from '@/hooks/use-santiyepro-api';
import {
  PersonnelRoleLabels,
  PersonnelStatus,
  SalaryType,
  SalaryTypeLabels,
  type SalaryType as SalaryTypeKey,
} from '@/lib/enums';
import type { Personnel, PersonnelAssignment } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, getInitials, storageUrl, todayStr } from '@/lib/helpers';
import { NewPersonnelSheet } from './_components/new-personnel-sheet';
import { PersonnelDetailDrawer } from './_components/personnel-detail-drawer';
import { AssignmentDrawer } from './_components/assignment-drawer';

/**
 * Sprint 8.3b — Personel (project-scoped) — ŞantiyePro tasarımına uyarlandı.
 *
 * Taşınan özellikler:
 *  - Üst KPI'lar: Toplam personel, aktif, bugün şantiyede, maaş toplamı
 *  - Maaş tipi sekmeleri: Günlük / Haftalık / Aylık
 *  - Durum filtresi: Aktif / Pasif / Tümü
 *  - Arama + personel kartları (avatar, rol, badge, maaş, telefon)
 */

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

function getProjectAssignment(p: Personnel): PersonnelAssignment | undefined {
  return p.assignments?.find((a) => a.is_active) ?? p.assignments?.[0];
}

function getRoleLabel(role?: string | null, customRole?: string | null): string {
  if (!role && !customRole) return '—';
  if (role === '__custom__' || (role && !PersonnelRoleLabels[role])) {
    return customRole ?? role ?? '—';
  }
  return PersonnelRoleLabels[role ?? ''] ?? customRole ?? role ?? '—';
}

function getWage(a?: PersonnelAssignment): { amount: number; unit: string } {
  if (!a) return { amount: 0, unit: '' };
  if (a.salary_type === SalaryType.MONTHLY && a.monthly_salary) {
    return { amount: a.monthly_salary, unit: '/ Ay' };
  }
  if (a.salary_type === SalaryType.WEEKLY && a.weekly_salary) {
    return { amount: a.weekly_salary, unit: '/ Hafta' };
  }
  if (a.daily_wage) return { amount: a.daily_wage, unit: '/ Gün' };
  return { amount: 0, unit: '' };
}

export function PersonelContent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const personnelQuery = useProjectPersonnel(projectId);
  const today = todayStr();
  const { data: attendanceResp } = useTodayAttendance(today, {
    project_id: projectId,
  });

  const personnel = useMemo<Personnel[]>(
    () => personnelQuery.data?.data ?? [],
    [personnelQuery.data],
  );

  // Bugün şantiyede olan personellerin ID'leri
  const todayOnSiteIds = useMemo(() => {
    const entries = Array.isArray(attendanceResp?.data) ? attendanceResp.data : [];
    const onSiteStatuses = ['full_day', 'half_day', 'present', 'late'];
    const ids = entries
      .filter((e): e is { status?: string; employee?: string } => typeof e === 'object' && e !== null)
      .filter((e) => onSiteStatuses.includes(e.status ?? ''))
      .map((e) => e.employee)
      .filter((id): id is string => Boolean(id));
    return new Set(ids);
  }, [attendanceResp]);

  const [search, setSearch] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | PersonnelStatus>('all');
  const [salaryTypeFilter, setSalaryTypeFilter] = useState<'all' | SalaryTypeKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => personnel.filter((p) => p.status === PersonnelStatus.ACTIVE).length,
    [personnel],
  );
  const passiveCount = useMemo(
    () => personnel.filter((p) => p.status !== PersonnelStatus.ACTIVE).length,
    [personnel],
  );

  const dailyCount = useMemo(() => {
    return personnel.filter((p) => {
      const a = getProjectAssignment(p);
      return p.status === PersonnelStatus.ACTIVE && a?.salary_type === SalaryType.DAILY;
    }).length;
  }, [personnel]);

  const weeklyCount = useMemo(() => {
    return personnel.filter((p) => {
      const a = getProjectAssignment(p);
      return p.status === PersonnelStatus.ACTIVE && a?.salary_type === SalaryType.WEEKLY;
    }).length;
  }, [personnel]);

  const monthlyCount = useMemo(() => {
    return personnel.filter((p) => {
      const a = getProjectAssignment(p);
      return p.status === PersonnelStatus.ACTIVE && a?.salary_type === SalaryType.MONTHLY;
    }).length;
  }, [personnel]);

  const totalMonthly = useMemo(() => {
    return personnel.reduce((sum, p) => {
      const a = getProjectAssignment(p);
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

  const filtered = useMemo(() => {
    return personnel.filter((p) => {
      if (statusFilter === PersonnelStatus.ACTIVE && p.status !== PersonnelStatus.ACTIVE) return false;
      if (statusFilter === PersonnelStatus.PASSIVE && p.status === PersonnelStatus.ACTIVE) return false;
      if (salaryTypeFilter !== 'all') {
        const match = p.assignments?.some(
          (a) => a.is_active && a.salary_type === salaryTypeFilter,
        );
        if (!match) return false;
      }
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

  const isLoading = personnelQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
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
              {t('pages.projectTabs.personel.title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('pages.projectTabs.personel.subtitle')}
            </p>
          </div>
          <Button size="sm" onClick={() => setOpenNew(true)}>
            <Plus className="me-1 size-4" />
            {t('pages.projectTabs.personel.addPersonnel')}
          </Button>
        </div>

        {/* Selected personnel toolbar — assignment action */}
        {selectedId && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-2 text-xs">
            <span className="font-medium text-primary">
              {filtered.find((p) => p.id === selectedId)?.name ?? ''}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAssignmentId(selectedId)}
            >
              <Settings className="me-1 size-4" />
              {t('pages.projectTabs.personel.assignment.manageAssignment')}
            </Button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.personel.activeCount')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{activeCount}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Bu projede
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.personel.todayAtSite')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{todayOnSiteIds.size}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date().toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      weekday: 'long',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <DollarSign className="size-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.personel.monthlyCost')}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{formatAmount(totalMonthly)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Tahmini aylık toplam
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary type filter chips */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setSalaryTypeFilter('all')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              salaryTypeFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {t('pages.projectTabs.personel.all')}{' '}
            <span className="text-xs opacity-70">{activeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setSalaryTypeFilter(SalaryType.DAILY)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              salaryTypeFilter === SalaryType.DAILY
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {t('pages.projectTabs.personel.dailyCount')}{' '}
            <span className="text-xs opacity-70">{dailyCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setSalaryTypeFilter(SalaryType.WEEKLY)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              salaryTypeFilter === SalaryType.WEEKLY
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {t('pages.projectTabs.personel.weeklyCount')}{' '}
            <span className="text-xs opacity-70">{weeklyCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setSalaryTypeFilter(SalaryType.MONTHLY)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              salaryTypeFilter === SalaryType.MONTHLY
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {t('pages.projectTabs.personel.monthlyCount')}{' '}
            <span className="text-xs opacity-70">{monthlyCount}</span>
          </button>

          {/* Durum filtresi */}
          <div className="ms-2 flex items-center gap-1 border-s border-border ps-3">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                statusFilter === 'all'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t('pages.projectTabs.personel.all')}{' '}
              <span className="opacity-70">{activeCount + passiveCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(PersonnelStatus.ACTIVE)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                statusFilter === PersonnelStatus.ACTIVE
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t('pages.projectTabs.personel.filters.active')}{' '}
              <span className="opacity-70">{activeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(PersonnelStatus.PASSIVE)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                statusFilter === PersonnelStatus.PASSIVE
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t('pages.projectTabs.personel.passive')}{' '}
              <span className="opacity-70">{passiveCount}</span>
            </button>
          </div>

          {/* Arama */}
          <div className="relative ms-auto w-full sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages.projectTabs.personel.searchPlaceholder')}
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

        {/* Personel Listesi */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Users}
                title={
                  search || statusFilter !== 'all' || salaryTypeFilter !== 'all'
                    ? t('pages.projectTabs.personel.noResults')
                    : t('pages.projectTabs.personel.noPersonnel')
                }
                description={
                  search || statusFilter !== 'all' || salaryTypeFilter !== 'all'
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.personel.noPersonnelDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const roleLabel = getRoleLabel(p.role, p.custom_role);
              const assignment = getProjectAssignment(p);
              const { amount: wage, unit: wageUnit } = getWage(assignment);
              const color = getAvatarColor(p.name);
              const isLeft = p.status === 'left' as PersonnelStatus;
              const isOnSite = todayOnSiteIds.has(p.id);

              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(p.id);
                    }
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50',
                    p.status !== PersonnelStatus.ACTIVE && !isLeft && 'opacity-60',
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
                        {getInitials(p.name, 2)}
                      </div>
                    )}
                    {/* Durum noktası */}
                    <div
                      className={cn(
                        'absolute right-0 bottom-0 size-3 rounded-full border-2 border-background',
                        p.status === PersonnelStatus.ACTIVE
                          ? 'bg-green-500'
                          : 'bg-gray-400',
                      )}
                    />
                  </div>

                  {/* Bilgiler */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={cn(
                          'truncate text-sm font-bold',
                          isLeft && 'text-muted-foreground line-through',
                        )}
                      >
                        {p.name}
                      </p>
                      {/* Attendance badge */}
                      {isOnSite && (
                        <Badge variant="success" appearance="light" className="h-4 px-1.5 text-[10px]">
                          {t('pages.projectTabs.personel.attendanceBadge')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{roleLabel}</span>
                      {assignment?.salary_type && (
                        <>
                          <span>·</span>
                          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                            {SalaryTypeLabels[assignment.salary_type] ?? assignment.salary_type}
                          </Badge>
                        </>
                      )}
                      {p.phone && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Phone className="size-3" />
                            {p.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Maaş bilgisi */}
                  {wage > 0 && (
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums">
                        {formatAmount(wage)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{wageUnit}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewPersonnelSheet open={openNew} onOpenChange={setOpenNew} />

      <PersonnelDetailDrawer
        open={Boolean(selectedId)}
        onOpenChange={(o) => {
          if (!o) setSelectedId(null);
        }}
        personnelId={selectedId}
      />

      <AssignmentDrawer
        open={Boolean(assignmentId)}
        onOpenChange={(o) => {
          if (!o) setAssignmentId(null);
        }}
        personnelId={assignmentId}
      />
    </Container>
  );
}

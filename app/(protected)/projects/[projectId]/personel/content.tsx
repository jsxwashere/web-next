'use client';

import { useMemo, useState } from 'react';
import { DollarSign, Search, Users, X as XIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/common/empty-state';
import { Container } from '@/components/common/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectPersonnel } from '@/hooks/use-santiyepro-api';
import {
  PersonnelRoleLabels,
  SalaryType,
  SalaryTypeLabels,
} from '@/lib/enums';
import type { Personnel, PersonnelAssignment } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { formatAmount, getInitials, storageUrl } from '@/lib/helpers';

/**
 * Sprint 5 — Personel (project-scoped).
 *
 * API: GET /api/projects/{projectId}/personnel
 *
 * Bu sayfa yalnızca bu projeye atanmış personelleri listeler.
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

  const personnel = useMemo<Personnel[]>(
    () => personnelQuery.data?.data ?? [],
    [personnelQuery.data],
  );

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return personnel;
    const q = search.toLowerCase();
    return personnel.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.role ?? '').toLowerCase().includes(q) ||
        (p.custom_role ?? '').toLowerCase().includes(q),
    );
  }, [personnel, search]);

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

  if (personnelQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Container>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div>
          <h1 className="text-base font-medium">
            {t('pages.projectTabs.personel.title')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t('pages.projectTabs.personel.subtitle')}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                  <p className="text-2xl font-bold">{personnel.length}</p>
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
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {t('pages.projectTabs.personel.monthlyCost')}
                  </p>
                  <p className="text-2xl font-bold">{formatAmount(totalMonthly)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
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

        {/* Liste */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Users}
                title={
                  search
                    ? t('pages.firms.noResults')
                    : t('pages.projectTabs.personel.noPersonnel')
                }
                description={
                  search
                    ? t('common.messages.clearFilters')
                    : t('pages.projectTabs.personel.noPersonnelDesc')
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filtered.map((p) => {
              const roleLabel = getRoleLabel(p.role, p.custom_role);
              const assignment = getProjectAssignment(p);
              const { amount: wage, unit: wageUnit } = getWage(assignment);
              const color = getAvatarColor(p.name);

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="relative">
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
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{roleLabel}</span>
                      {assignment?.salary_type && (
                        <>
                          <span>·</span>
                          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                            {SalaryTypeLabels[assignment.salary_type] ??
                              assignment.salary_type}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
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
    </Container>
  );
}
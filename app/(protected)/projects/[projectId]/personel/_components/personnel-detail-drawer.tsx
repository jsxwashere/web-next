/**
 * `personel/_components/personnel-detail-drawer.tsx`
 *
 * Sprint 8.4 — Personel detay + düzenleme drawer'ı.
 *
 * - Read-only: id, name, role, phone, salary_type, daily_wage, weekly_salary,
 *   monthly_salary, status
 * - Edit: name, role, phone, salary_type, daily_wage, weekly_salary,
 *   monthly_salary, status
 * - API: GET /api/personnel/{id} (global), PATCH /api/personnel/{id}
 *
 * Not: Maaş alanları project_assignment üzerinde tutuluyor. Bu drawer
 * global personel kaydını düzenler; maaş değişikliği için atama
 * update gerekir. Burada sadece read-only maaş alanlarını gösteriyoruz.
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  LoaderCircleIcon,
  Phone,
  Users,
  X as XIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useGetPersonnel,
  useUpdatePersonnel,
} from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import {
  PersonnelRoleLabels,
  PersonnelStatus,
  PersonnelStatusLabels,
  PersonnelStatusVariants,
  SalaryType,
  SalaryTypeLabels,
  type PersonnelStatus as PersonnelStatusKey,
} from '@/lib/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  optimisticUpdate,
  snapshotQuery,
} from '@/lib/api/optimistic';
import { formatAmount } from '@/lib/helpers';

const STATUS_OPTIONS: { value: PersonnelStatusKey; label: string }[] = [
  {
    value: PersonnelStatus.ACTIVE,
    label: PersonnelStatusLabels[PersonnelStatus.ACTIVE],
  },
  {
    value: PersonnelStatus.PASSIVE,
    label: PersonnelStatusLabels[PersonnelStatus.PASSIVE],
  },
  {
    value: PersonnelStatus.LEFT,
    label: PersonnelStatusLabels[PersonnelStatus.LEFT],
  },
];

const ROLE_OPTIONS = [
  ...Object.entries(PersonnelRoleLabels).map(([k, v]) => ({ value: k, label: v })),
  { value: '__custom__', label: 'Diğer (özel)' },
];

const personnelSchema = z.object({
  name: z.string().min(1, 'Ad zorunlu').max(150),
  role: z.string().min(1, 'Rol zorunlu'),
  phone: z.string().nullable().optional(),
  status: z.enum(['active', 'passive', 'left']),
});

type PersonnelEditValues = z.infer<typeof personnelSchema>;

export interface PersonnelDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelId: string | null;
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function getRoleLabel(role?: string | null, customRole?: string | null): string {
  if (!role && !customRole) return '—';
  if (role === '__custom__' || (role && !PersonnelRoleLabels[role])) {
    return customRole ?? role ?? '—';
  }
  return PersonnelRoleLabels[role ?? ''] ?? customRole ?? role ?? '—';
}

export function PersonnelDetailDrawer({
  open,
  onOpenChange,
  personnelId,
}: PersonnelDetailDrawerProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: resp, isLoading, error } = useGetPersonnel(personnelId);
  const updateMutation = useUpdatePersonnel();
  const item = resp?.data;

  const form = useForm<PersonnelEditValues>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      name: '',
      role: '',
      phone: '',
      status: PersonnelStatus.ACTIVE,
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name ?? '',
        role: item.role ?? '',
        phone: item.phone ?? '',
        status: (item.status as PersonnelEditValues['status']) ?? PersonnelStatus.ACTIVE,
      });
    }
  }, [item, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!personnelId) return;
    const detailKey = ['personnel-detail', personnelId] as const;
    const snapshot = snapshotQuery<{ data: typeof item }>(queryClient, detailKey);

    try {
      optimisticUpdate<{ data: typeof item }>(queryClient, detailKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data
            ? {
                ...old.data,
                name: data.name,
                role: data.role,
                phone: data.phone || null,
                status: data.status,
              }
            : old.data,
        };
      });

      await updateMutation.mutateAsync({
        id: personnelId,
        data: {
          name: data.name,
          role: data.role,
          phone: data.phone || null,
          status: data.status,
        },
      });
      toast.success(t('pages.projectTabs.common.saved'));
      onOpenChange(false);
    } catch (err) {
      if (snapshot) {
        queryClient.setQueryData(detailKey, snapshot);
      }
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.common.saveError');
      toast.error(message);
    }
  });

  const roleLabel = item ? getRoleLabel(item.role, item.custom_role) : '—';
  const activeAssignment = item?.assignments?.find((a) => a.is_active);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md bg-primary/10">
                <Users className="size-4 text-primary" />
              </div>
              <SheetTitle>
                {t('pages.projectTabs.personel.detailDrawer.title')}
              </SheetTitle>
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
        </SheetHeader>

        {isLoading ? (
          <SheetBody>
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </SheetBody>
        ) : error || !item ? (
          <SheetBody>
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {t('pages.projectTabs.personel.detailDrawer.loadError')}
            </div>
          </SheetBody>
        ) : (
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="flex flex-1 flex-col gap-4 overflow-hidden"
            >
              <SheetBody className="flex-1 space-y-4 overflow-y-auto">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="truncate text-base font-bold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel}</p>
                  {item.phone && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="size-3" />
                      {item.phone}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={PersonnelStatusVariants[item.status] ?? 'secondary'}
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {PersonnelStatusLabels[item.status] ?? item.status}
                    </Badge>
                    {activeAssignment?.salary_type && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                        {SalaryTypeLabels[activeAssignment.salary_type]}
                      </Badge>
                    )}
                  </div>
                  {activeAssignment && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {activeAssignment.salary_type === SalaryType.MONTHLY &&
                        activeAssignment.monthly_salary && (
                          <span className="font-bold tabular-nums text-foreground">
                            {formatAmount(activeAssignment.monthly_salary)} / Ay
                          </span>
                        )}
                      {activeAssignment.salary_type === SalaryType.WEEKLY &&
                        activeAssignment.weekly_salary && (
                          <span className="font-bold tabular-nums text-foreground">
                            {formatAmount(activeAssignment.weekly_salary)} / Hafta
                          </span>
                        )}
                      {activeAssignment.salary_type === SalaryType.DAILY &&
                        activeAssignment.daily_wage && (
                          <span className="font-bold tabular-nums text-foreground">
                            {formatAmount(activeAssignment.daily_wage)} / Gün
                          </span>
                        )}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t('pages.projectTabs.common.readOnlyInfo')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldRow label="ID">{item.id}</FieldRow>
                    <FieldRow label="TC No">{item.tc_no ?? '—'}</FieldRow>
                    <FieldRow label="SGK No">{item.sgk_no ?? '—'}</FieldRow>
                    <FieldRow label="IBAN">{item.iban ?? '—'}</FieldRow>
                    <FieldRow label={t('common.labels.date')}>
                      {item.birth_date ?? '—'}
                    </FieldRow>
                    <FieldRow label={t('common.labels.name') + ' (özel)'}>
                      {item.custom_role ?? '—'}
                    </FieldRow>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t('pages.projectTabs.common.editableFields')}
                  </p>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pages.projectTabs.forms.newPersonnel.name')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('pages.projectTabs.forms.newPersonnel.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('pages.projectTabs.forms.newPersonnel.role')} *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('pages.projectTabs.forms.newPersonnel.rolePlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ROLE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('pages.projectTabs.common.status')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pages.personnel.phone')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('pages.projectTabs.forms.newPersonnel.phonePlaceholder')}
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold">
                    {t('common.labels.actions')}
                  </p>
                  <p>
                    {t('pages.projectTabs.personel.assignment.manageAssignment')}
                  </p>
                </div>
              </SheetBody>

              <SheetFooter className="border-t border-border pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateMutation.isPending}
                >
                  {t('common.buttons.cancel')}
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <LoaderCircleIcon className="me-1 size-4 animate-spin" />
                  )}
                  {updateMutation.isPending ? t('pages.projectTabs.common.saving') : t('common.buttons.save')}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}

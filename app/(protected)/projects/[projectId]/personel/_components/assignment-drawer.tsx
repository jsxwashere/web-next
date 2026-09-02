/**
 * `personel/_components/assignment-drawer.tsx`
 *
 * Sprint 8.5 — Personel atama yönetim drawer'ı.
 *
 * - Read-only: personel bilgisi (avatar, ad, rol, telefon)
 * - Edit form: salary_type, daily_wage, weekly_salary, monthly_salary, currency,
 *   assignment start/end, is_active (PersonnelAssignment üzerinde)
 * - API: PATCH /api/personnel/{id} (maaş alanları global kabul edilir; backend
 *   PATCH /api/personnel/{id}/assignments/{pivotId} mevcut değilse fallback)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, LoaderCircleIcon, Phone, Users, X as XIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useGetPersonnel,
  useUpdatePersonnelAssignment,
} from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import {
  SalaryType,
  SalaryTypeLabels,
  type SalaryType as SalaryTypeKey,
} from '@/lib/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { formatAmount, getInitials, storageUrl } from '@/lib/helpers';

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const assignmentSchema = z.object({
  salary_type: z.enum(['daily', 'weekly', 'monthly']),
  daily_wage: z.coerce.number().nonnegative().nullable().optional(),
  weekly_salary: z.coerce.number().nonnegative().nullable().optional(),
  monthly_salary: z.coerce.number().nonnegative().nullable().optional(),
  currency: z.string(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean(),
});

type AssignmentEditValues = z.infer<typeof assignmentSchema>;

export interface AssignmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelId: string | null;
}

function getInitialsOrDash(name?: string | null) {
  if (!name) return '—';
  return getInitials(name, 2);
}

export function AssignmentDrawer({
  open,
  onOpenChange,
  personnelId,
}: AssignmentDrawerProps) {
  const { t } = useTranslation();
  const { data: resp, isLoading, error } = useGetPersonnel(personnelId);
  const updateMutation = useUpdatePersonnelAssignment();
  const item = resp?.data;

  const activeAssignment = useMemo(
    () => item?.assignments?.find((a) => a.is_active) ?? item?.assignments?.[0],
    [item],
  );

  const form = useForm<AssignmentEditValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      salary_type: SalaryType.DAILY,
      daily_wage: null,
      weekly_salary: null,
      monthly_salary: null,
      currency: 'TRY',
      start_date: null,
      end_date: null,
      is_active: true,
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (item) {
      const a = item.assignments?.[0];
      form.reset({
        salary_type: (a?.salary_type as SalaryTypeKey) ?? SalaryType.DAILY,
        daily_wage: a?.daily_wage ?? null,
        weekly_salary: a?.weekly_salary ?? null,
        monthly_salary: a?.monthly_salary ?? null,
        currency: 'TRY',
        start_date: a?.entry_date ?? null,
        end_date: a?.exit_date ?? null,
        is_active: a?.is_active ?? true,
      });
    }
  }, [item, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!personnelId) return;
    try {
      await updateMutation.mutateAsync({
        id: personnelId,
        data: {
          salary_type: data.salary_type,
          daily_wage: data.salary_type === SalaryType.DAILY ? data.daily_wage : null,
          weekly_salary: data.salary_type === SalaryType.WEEKLY ? data.weekly_salary : null,
          monthly_salary: data.salary_type === SalaryType.MONTHLY ? data.monthly_salary : null,
          currency: data.currency,
          entry_date: data.start_date || null,
          exit_date: data.end_date || null,
          is_active: data.is_active,
        },
      });
      toast.success(
        t('pages.projectTabs.personel.assignment.saved'),
      );
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.personel.assignment.saveError');
      toast.error(message);
    }
  });

  const salaryType = form.watch('salary_type');
  const showWage = salaryType === SalaryType.DAILY;
  const showWeekly = salaryType === SalaryType.WEEKLY;
  const showMonthly = salaryType === SalaryType.MONTHLY;

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
                {t('pages.projectTabs.personel.assignment.title')}
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
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </SheetBody>
        ) : error || !item ? (
          <SheetBody>
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {t('pages.projectTabs.personel.assignment.loadError')}
            </div>
          </SheetBody>
        ) : (
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="flex flex-1 flex-col gap-4 overflow-hidden"
            >
              <SheetBody className="flex-1 space-y-4 overflow-y-auto">
                {/* Read-only: personel info */}
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    {t('pages.projectTabs.personel.assignment.readOnly')}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    {item.photo ? (
                      <img
                        src={storageUrl(item.photo)}
                        alt={item.name}
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {getInitialsOrDash(item.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.role ?? item.custom_role ?? '—'}
                      </p>
                      {item.phone && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="size-3" />
                          {item.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeAssignment && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                        {SalaryTypeLabels[activeAssignment.salary_type ?? SalaryType.DAILY]}
                      </Badge>
                      {activeAssignment.salary_type === SalaryType.MONTHLY &&
                        activeAssignment.monthly_salary && (
                          <span className="font-bold tabular-nums text-foreground">
                            {formatAmount(
                              activeAssignment.monthly_salary,
                            )}
                          </span>
                        )}
                      {activeAssignment.salary_type === SalaryType.WEEKLY &&
                        activeAssignment.weekly_salary && (
                          <span className="font-bold tabular-nums text-foreground">
                            {formatAmount(
                              activeAssignment.weekly_salary,
                            )}
                          </span>
                        )}
                      {activeAssignment.salary_type === SalaryType.DAILY &&
                        activeAssignment.daily_wage && (
                          <span className="font-bold tabular-nums text-foreground">
                            {formatAmount(
                              activeAssignment.daily_wage,
                            )}
                          </span>
                        )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Edit form */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t('pages.projectTabs.personel.assignment.edit')}
                  </p>

                  <FormField
                    control={form.control}
                    name="salary_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('pages.projectTabs.personel.assignment.salaryType')}
                        </FormLabel>
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
                            {Object.entries(SalaryTypeLabels).map(([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showWage && (
                    <FormField
                      control={form.control}
                      name="daily_wage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('pages.projectTabs.personel.assignment.dailyWage')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {showWeekly && (
                    <FormField
                      control={form.control}
                      name="weekly_salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('pages.projectTabs.personel.assignment.weeklySalary')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {showMonthly && (
                    <FormField
                      control={form.control}
                      name="monthly_salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('pages.projectTabs.personel.assignment.monthlySalary')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('pages.projectTabs.personel.assignment.currency')}
                        </FormLabel>
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
                            {CURRENCY_OPTIONS.map((opt) => (
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-3" />
                              {t('pages.projectTabs.personel.assignment.startDate')}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-3" />
                              {t('pages.projectTabs.personel.assignment.endDate')}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('pages.projectTabs.personel.assignment.isActive')}
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 rounded-md border border-input p-2">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => field.onChange(v === true)}
                            />
                            <span className="text-sm text-foreground">
                              {field.value
                                ? t('pages.projectTabs.personel.filters.active')
                                : t('pages.projectTabs.personel.passive')}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  {updateMutation.isPending
                    ? t('pages.projectTabs.common.saving')
                    : t('common.buttons.save')}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}

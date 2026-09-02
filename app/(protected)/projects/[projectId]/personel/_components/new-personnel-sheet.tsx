/**
 * `personel/_components/new-personnel-sheet.tsx`
 *
 * Sprint 6.5 — Yeni personel ekleme drawer'ı.
 *
 * API: POST /api/personnel — global endpoint (personel modülünden).
 * Sheet kapatıldıktan sonra `project-personnel` listesi invalidate edilir.
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreatePersonnel } from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import {
  PersonnelRoleLabels,
  PersonnelStatus,
  PersonnelStatusLabels,
  SalaryType,
  SalaryTypeLabels,
} from '@/lib/enums';
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const ROLE_OPTIONS = Object.entries(PersonnelRoleLabels).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_OPTIONS = [
  { value: PersonnelStatus.ACTIVE, label: PersonnelStatusLabels[PersonnelStatus.ACTIVE] },
  { value: PersonnelStatus.PASSIVE, label: PersonnelStatusLabels[PersonnelStatus.PASSIVE] },
];

const SALARY_TYPE_OPTIONS = [
  { value: SalaryType.DAILY, label: SalaryTypeLabels[SalaryType.DAILY] },
  { value: SalaryType.WEEKLY, label: SalaryTypeLabels[SalaryType.WEEKLY] },
  { value: SalaryType.MONTHLY, label: SalaryTypeLabels[SalaryType.MONTHLY] },
];

const personnelSchema = z.object({
  name: z.string().min(2, 'validation.minLength').max(120),
  role: z.string().min(1, 'validation.required'),
  phone: z.string().max(30).optional().or(z.literal('')),
  status: z.string().min(1, 'validation.required'),
  salary_type: z.string().min(1, 'validation.required'),
  daily_wage: z.coerce.number().nonnegative().optional(),
  weekly_salary: z.coerce.number().nonnegative().optional(),
  monthly_salary: z.coerce.number().nonnegative().optional(),
});

type PersonnelFormValues = z.infer<typeof personnelSchema>;

const defaultValues: PersonnelFormValues = {
  name: '',
  role: 'worker',
  phone: '',
  status: PersonnelStatus.ACTIVE,
  salary_type: SalaryType.MONTHLY,
  daily_wage: 0,
  weekly_salary: 0,
  monthly_salary: 0,
};

export function NewPersonnelSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const createMutation = useCreatePersonnel();

  const form = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const salaryType = form.watch('salary_type');

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        role: data.role,
        phone: data.phone || null,
        status: data.status,
        salary_type: data.salary_type,
        daily_wage:
          data.salary_type === SalaryType.DAILY ? data.daily_wage ?? 0 : 0,
        weekly_salary:
          data.salary_type === SalaryType.WEEKLY ? data.weekly_salary ?? 0 : 0,
        monthly_salary:
          data.salary_type === SalaryType.MONTHLY
            ? data.monthly_salary ?? 0
            : 0,
      });
      toast.success(t('pages.projectTabs.forms.newPersonnel.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newPersonnel.error');
      toast.error(message);
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newPersonnel.title')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <SheetBody className="flex-1 space-y-4 overflow-y-auto">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newPersonnel.name')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newPersonnel.namePlaceholder',
                        )}
                        {...field}
                      />
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
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPersonnel.role')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                'pages.projectTabs.forms.newPersonnel.rolePlaceholder',
                              )}
                            />
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPersonnel.phone')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'pages.projectTabs.forms.newPersonnel.phonePlaceholder',
                          )}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newPersonnel.status')}
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

              <FormField
                control={form.control}
                name="salary_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newPersonnel.salaryType')}
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
                        {SALARY_TYPE_OPTIONS.map((opt) => (
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

              {salaryType === SalaryType.DAILY && (
                <FormField
                  control={form.control}
                  name="daily_wage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPersonnel.dailyWage')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {salaryType === SalaryType.WEEKLY && (
                <FormField
                  control={form.control}
                  name="weekly_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPersonnel.weeklySalary')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {salaryType === SalaryType.MONTHLY && (
                <FormField
                  control={form.control}
                  name="monthly_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPersonnel.monthlySalary')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </SheetBody>

            <SheetFooter className="border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <LoaderCircleIcon className="me-1 size-4 animate-spin" />
                )}
                {createMutation.isPending
                  ? t('pages.projectTabs.forms.actions.creating')
                  : t('common.buttons.save')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
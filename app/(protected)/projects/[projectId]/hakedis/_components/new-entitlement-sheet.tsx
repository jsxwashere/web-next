/**
 * `hakedis/_components/new-entitlement-sheet.tsx`
 *
 * Sprint 6.5 — Yeni hakediş ekleme drawer'ı.
 *
 * API: POST /api/entitlements (project_id otomatik enjekte edilir).
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useCreateEntitlement,
  useProjectFirms,
} from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
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

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const entitlementSchema = z.object({
  number: z.coerce.number().int().positive('validation.required'),
  firm_id: z.string().optional().or(z.literal('')),
  contractor_name: z.string().min(2, 'validation.minLength'),
  period_end: z.string().min(1, 'validation.required'),
  total_amount: z.coerce.number().positive('validation.minAmount'),
  currency: z.string().min(1, 'validation.required'),
});

type EntitlementFormValues = z.infer<typeof entitlementSchema>;

const defaultValues: EntitlementFormValues = {
  number: 1,
  firm_id: '',
  contractor_name: '',
  period_end: '',
  total_amount: 0,
  currency: 'TRY',
};

export function NewEntitlementSheet({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateEntitlement(projectId);
  const firmsQuery = useProjectFirms(projectId);

  const form = useForm<EntitlementFormValues>({
    resolver: zodResolver(entitlementSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        number: data.number,
        firm_id: data.firm_id || null,
        contractor_name: data.contractor_name,
        period_end: data.period_end,
        total_amount: data.total_amount,
        currency: data.currency,
        date: data.period_end,
      });
      toast.success(t('pages.projectTabs.forms.newEntitlement.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newEntitlement.error');
      toast.error(message);
    }
  });

  const firms = firmsQuery.data?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newEntitlement.title')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <SheetBody className="flex-1 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newEntitlement.number')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder={t(
                            'pages.projectTabs.forms.newEntitlement.numberPlaceholder',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newEntitlement.periodEnd')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="firm_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const firm = firms.find((f) => f.id === value);
                        if (firm) {
                          form.setValue('contractor_name', firm.name);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Firma seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {firms.map((firm) => (
                          <SelectItem key={firm.id} value={firm.id}>
                            {firm.name}
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
                name="contractor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newEntitlement.contractor')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newEntitlement.contractorPlaceholder',
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
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newEntitlement.amount')}
                        <span className="text-destructive">*</span>
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

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newEntitlement.currency')}
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
              </div>
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
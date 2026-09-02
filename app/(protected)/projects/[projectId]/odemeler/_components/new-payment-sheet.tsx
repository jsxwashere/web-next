/**
 * `odemeler/_components/new-payment-sheet.tsx`
 *
 * Sprint 6.5 — Yeni ödeme (gider) ekleme drawer'ı.
 *
 * Davranış referansı: ŞantiyePro `resources/js/pages/project/transactions/components/transaction-sheet/firm-payment-form.tsx`
 * API: POST /api/transactions (kind=firm_payment, type=expense)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreateTransaction, useProjectFirms } from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import { PaymentTypeLabels } from '@/lib/enums';
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
import { Textarea } from '@/components/ui/textarea';

const PAYMENT_TYPE_OPTIONS = [
  { value: 'cash', label: PaymentTypeLabels['cash'] ?? 'Nakit' },
  { value: 'bank_transfer', label: PaymentTypeLabels['bank_transfer'] ?? 'Havale/EFT' },
  { value: 'check', label: PaymentTypeLabels['check'] ?? 'Çek' },
  { value: 'credit_card', label: PaymentTypeLabels['credit_card'] ?? 'Kredi Kartı' },
  { value: 'other', label: PaymentTypeLabels['other'] ?? 'Diğer' },
];

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const paymentSchema = z.object({
  amount: z.coerce.number().positive('validation.minAmount'),
  currency: z.string().min(1, 'validation.required'),
  payment_type: z.string().min(1, 'validation.required'),
  payment_date: z.string().min(1, 'validation.required'),
  firm_id: z.string().optional().or(z.literal('')),
  manual_firm_name: z.string().optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const defaultValues: PaymentFormValues = {
  amount: 0,
  currency: 'TRY',
  payment_type: 'bank_transfer',
  payment_date: '',
  firm_id: '',
  manual_firm_name: '',
  description: '',
};

export function NewPaymentSheet({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateTransaction(projectId);
  const firmsQuery = useProjectFirms(projectId);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    } else if (!form.getValues('payment_date')) {
      const today = new Date().toISOString().slice(0, 10);
      form.setValue('payment_date', today);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const firmId = data.firm_id || undefined;
      await createMutation.mutateAsync({
        type: 'expense',
        kind: 'firm_payment',
        amount: data.amount,
        currency: data.currency,
        payment_type: data.payment_type,
        date: data.payment_date || null,
        firm_id: firmId,
        manual_firm_name: data.manual_firm_name || undefined,
        description: data.description || undefined,
      });
      toast.success(t('pages.projectTabs.forms.newPayment.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newPayment.error');
      toast.error(message);
    }
  });

  const firms = firmsQuery.data?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newPayment.title')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <SheetBody className="flex-1 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPayment.amount')}
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
                        {t('pages.projectTabs.forms.newPayment.currency')}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPayment.paymentType')}
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
                          {PAYMENT_TYPE_OPTIONS.map((opt) => (
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
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newPayment.paymentDate')}
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
                    <FormLabel>
                      {t('pages.projectTabs.forms.newPayment.firm')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'pages.projectTabs.forms.newPayment.firmPlaceholder',
                            )}
                          />
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
                name="manual_firm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Manuel Firma Adı
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Listede yoksa elle girin"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newPayment.description')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder={t(
                          'pages.projectTabs.forms.newPayment.descriptionPlaceholder',
                        )}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
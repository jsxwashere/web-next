/**
 * `tahsilatlar/_components/new-collection-sheet.tsx`
 *
 * Sprint 6.5 — Yeni tahsilat ekleme drawer'ı (Radix Sheet + RHF + Zod).
 *
 * Davranış referansı: ŞantiyePro `resources/js/pages/project/transactions/components/transaction-sheet/income-form.tsx`
 * API: POST /api/collections (useCreateTransaction ile project_id enjekte edilir)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreateTransaction } from '@/hooks/use-santiyepro-api';
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

const PAYMENT_TYPE_OPTIONS = [
  { value: 'cash', label: PaymentTypeLabels['cash'] ?? 'Nakit' },
  { value: 'bank_transfer', label: PaymentTypeLabels['bank_transfer'] ?? 'Havale/EFT' },
  { value: 'check', label: PaymentTypeLabels['check'] ?? 'Çek' },
  { value: 'credit_card', label: PaymentTypeLabels['credit_card'] ?? 'Kredi Kartı' },
  { value: 'promissory_note', label: PaymentTypeLabels['promissory_note'] ?? 'Senet' },
  { value: 'other', label: PaymentTypeLabels['other'] ?? 'Diğer' },
];

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const collectionSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'validation.minAmount' }).positive('validation.minAmount'),
  currency: z.string().min(1, 'validation.required'),
  payment_type: z.string().min(1, 'validation.required'),
  collection_date: z.string().min(1, 'validation.required'),
  due_date: z.string().optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

const defaultValues: CollectionFormValues = {
  amount: 0,
  currency: 'TRY',
  payment_type: 'bank_transfer',
  collection_date: '',
  due_date: '',
  description: '',
};

export function NewCollectionSheet({
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

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // Sheet açıldığında bugünün tarihini default olarak ayarla (boşsa)
  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    } else if (!form.getValues('collection_date')) {
      const today = new Date().toISOString().slice(0, 10);
      form.setValue('collection_date', today);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        type: 'income',
        kind: 'collection',
        amount: data.amount,
        currency: data.currency,
        payment_type: data.payment_type,
        date: data.collection_date || null,
        due_date: data.due_date || null,
        description: data.description || null,
      });
      toast.success(t('pages.projectTabs.forms.newCollection.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newCollection.error');
      toast.error(message);
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newCollection.title')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <SheetBody className="flex-1 space-y-4 overflow-y-auto">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newCollection.amount')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t(
                          'pages.projectTabs.forms.newCollection.amountPlaceholder',
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newCollection.currency')}
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

                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newCollection.paymentType')}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="collection_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newCollection.paymentDate')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newCollection.dueDate')}
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newCollection.description')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newCollection.descriptionPlaceholder',
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
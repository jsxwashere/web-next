/**
 * `odemeler/_components/payment-detail-drawer.tsx`
 *
 * Sprint 8.4 — Ödeme (gider) detay + düzenleme drawer'ı.
 *
 * - Read-only: id, payment_date, due_date, amount, currency, payment_source,
 *   payment_type, firm, work_step, contract, description, is_paid, status
 * - Edit: amount, payment_date, due_date, payment_source, payment_type,
 *   work_step, contract, description
 * - API: GET /api/transactions/{id} (kind=firm_payment), PATCH /api/transactions/{id}
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  LoaderCircleIcon,
  X as XIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useGetTransaction,
  useUpdateTransaction,
} from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import { PaymentTypeLabels } from '@/lib/enums';
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
import { formatAmount, formatDateTr } from '@/lib/helpers';

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const paymentSchema = z.object({
  amount: z.coerce.number().positive('Tutar 0\'dan büyük olmalı'),
  currency: z.string().min(1, 'Para birimi zorunlu'),
  payment_type: z.string().min(1, 'Ödeme tipi zorunlu'),
  date: z.string().min(1, 'Ödeme tarihi zorunlu'),
  due_date: z.string().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  is_paid: z.boolean(),
});

type PaymentEditValues = z.infer<typeof paymentSchema>;

export interface PaymentDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
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

function getStatus(item: { is_paid?: boolean; date?: string | null }): {
  label: string;
  variant: 'success' | 'warning' | 'destructive';
} {
  if (item.is_paid) return { label: 'ÖDENDİ', variant: 'success' };
  if (!item.date) return { label: 'GELECEK', variant: 'warning' };
  const due = new Date(item.date);
  if (Number.isNaN(due.getTime())) return { label: 'GELECEK', variant: 'warning' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today
    ? { label: 'GECİKTİ', variant: 'destructive' }
    : { label: 'GELECEK', variant: 'warning' };
}

export function PaymentDetailDrawer({
  open,
  onOpenChange,
  transactionId,
}: PaymentDetailDrawerProps) {
  const { t } = useTranslation();
  const { data: resp, isLoading, error } = useGetTransaction(transactionId);
  const updateMutation = useUpdateTransaction();
  const item = resp?.data;

  const form = useForm<PaymentEditValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      currency: 'TRY',
      payment_type: 'bank_transfer',
      date: '',
      due_date: '',
      description: '',
      is_paid: false,
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (item) {
      form.reset({
        amount: item.amount ?? 0,
        currency: item.currency ?? 'TRY',
        payment_type: item.payment_type ?? 'bank_transfer',
        date: item.date ?? '',
        due_date: item.due_date ?? '',
        description: item.description ?? '',
        is_paid: Boolean(item.is_paid),
      });
    }
  }, [item, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!transactionId) return;
    try {
      await updateMutation.mutateAsync({
        id: transactionId,
        data: {
          amount: data.amount,
          currency: data.currency,
          payment_type: data.payment_type,
          date: data.date || null,
          due_date: data.due_date || null,
          description: data.description || null,
          is_paid: data.is_paid,
        },
      });
      toast.success('Ödeme güncellendi');
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : 'Ödeme güncellenemedi';
      toast.error(message);
    }
  });

  const paymentTypeLabel = item?.payment_type
    ? (PaymentTypeLabels[item.payment_type] ?? item.payment_type)
    : '—';
  const status = item ? getStatus(item) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md bg-rose-500/10">
                <ArrowUpRight className="size-4 text-rose-600" />
              </div>
              <SheetTitle>Ödeme Detayı</SheetTitle>
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
              Ödeme yüklenemedi.
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
                  <p className="text-xs text-muted-foreground">Tutar</p>
                  <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                    -{formatAmount(item.amount, item.currency ?? 'TRY')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDateTr(item.date)}
                      </span>
                    )}
                    {status && (
                      <Badge
                        variant={status.variant}
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {status.label}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Salt Okunur Bilgiler
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldRow label="ID">{item.id}</FieldRow>
                    <FieldRow label="Tür">
                      {item.type === 'expense' ? 'Gider' : 'Gelir'}
                    </FieldRow>
                    <FieldRow label="Ödeme Tipi">{paymentTypeLabel}</FieldRow>
                    <FieldRow label="Ödeme Kaynağı">
                      {item.payment_source_name ?? '—'}
                    </FieldRow>
                    <FieldRow label="Firma">{item.firm_name ?? '—'}</FieldRow>
                    <FieldRow label="Personel">
                      {item.employee_name ?? '—'}
                    </FieldRow>
                    <FieldRow label="Sözleşme">
                      {item.contract_name ?? '—'}
                    </FieldRow>
                    <FieldRow label="Kategori">
                      {item.category_name ?? '—'}
                    </FieldRow>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Düzenlenebilir Alanlar
                  </p>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tutar *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
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
                          <FormLabel>Para Birimi</FormLabel>
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
                          <FormLabel>Ödeme Tipi</FormLabel>
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
                              {Object.entries(PaymentTypeLabels).map(([k, v]) => (
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ödeme Tarihi *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ''} />
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
                          <FormLabel>Vade Tarihi</FormLabel>
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ödeme açıklaması"
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
                    name="is_paid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ödeme Durumu</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v === 'true')}
                          value={field.value ? 'true' : 'false'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="size-3 text-emerald-600" />
                                Ödendi
                              </span>
                            </SelectItem>
                            <SelectItem value="false">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3 text-amber-600" />
                                Beklemede
                              </span>
                            </SelectItem>
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
                  disabled={updateMutation.isPending}
                >
                  {t('common.buttons.cancel')}
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <LoaderCircleIcon className="me-1 size-4 animate-spin" />
                  )}
                  {updateMutation.isPending ? 'Kaydediliyor...' : t('common.buttons.save')}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * `tahsilatlar/_components/collection-detail-drawer.tsx`
 *
 * Sprint 8.4 — Tahsilat detay + düzenleme drawer'ı.
 *
 * - Read-only: tüm alanlar (id, created_at, payment_date, due_date, amount,
 *   currency, payment_source, contract, description, status)
 * - Edit: amount, currency, payment_source, payment_date, due_date,
 *   contract_id, description, status
 * - API: GET /api/transactions/{id} (kind=collection), PATCH /api/transactions/{id}
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Calendar, LoaderCircleIcon, Pencil, X as XIcon } from 'lucide-react';
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

const STATUS_OPTIONS = [
  { value: 'received', label: 'Tahsil Edildi' },
  { value: 'pending', label: 'Beklemede' },
];

const collectionSchema = z.object({
  amount: z.coerce.number().positive('Tutar 0\'dan büyük olmalı'),
  currency: z.string().min(1, 'Para birimi zorunlu'),
  payment_type: z.string().min(1, 'Ödeme tipi zorunlu'),
  date: z.string().min(1, 'Tahsil tarihi zorunlu'),
  due_date: z.string().nullable().optional(),
  contract_id: z.string().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.string().min(1),
});

type CollectionEditValues = z.infer<typeof collectionSchema>;

export interface CollectionDetailDrawerProps {
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

export function CollectionDetailDrawer({
  open,
  onOpenChange,
  transactionId,
}: CollectionDetailDrawerProps) {
  const { t } = useTranslation();
  const { data: resp, isLoading, error } = useGetTransaction(transactionId);
  const updateMutation = useUpdateTransaction();
  const item = resp?.data;

  const form = useForm<CollectionEditValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      amount: 0,
      currency: 'TRY',
      payment_type: 'bank_transfer',
      date: '',
      due_date: '',
      contract_id: '',
      description: '',
      status: 'received',
    },
    mode: 'onBlur',
  });

  // Veri geldiğinde formu doldur
  useEffect(() => {
    if (item) {
      form.reset({
        amount: item.amount ?? 0,
        currency: item.currency ?? 'TRY',
        payment_type: item.payment_type ?? 'bank_transfer',
        date: item.date ?? '',
        due_date: item.due_date ?? '',
        contract_id: item.contract_id ?? '',
        description: item.description ?? '',
        status: item.is_paid ? 'received' : 'pending',
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
          contract_id: data.contract_id || null,
          description: data.description || null,
          is_paid: data.status === 'received',
        },
      });
      toast.success('Tahsilat güncellendi');
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : 'Tahsilat güncellenemedi';
      toast.error(message);
    }
  });

  const paymentTypeLabel = item?.payment_type
    ? (PaymentTypeLabels[item.payment_type] ?? item.payment_type)
    : '—';

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
      }}
    >
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md bg-emerald-500/10">
                <Banknote className="size-4 text-emerald-600" />
              </div>
              <SheetTitle>Tahsilat Detayı</SheetTitle>
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
              Tahsilat yüklenemedi.
            </div>
          </SheetBody>
        ) : (
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="flex flex-1 flex-col gap-4 overflow-hidden"
            >
              <SheetBody className="flex-1 space-y-4 overflow-y-auto">
                {/* Özet */}
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Tutar</p>
                  <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{formatAmount(item.amount, item.currency ?? 'TRY')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDateTr(item.date)}
                      </span>
                    )}
                    <Badge
                      variant={item.is_paid ? 'success' : 'warning'}
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {item.is_paid ? 'Tahsil Edildi' : 'Beklemede'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Read-only alanlar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Pencil className="size-3" />
                    Salt Okunur Bilgiler
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldRow label="ID">{item.id}</FieldRow>
                    <FieldRow label="Ödeme Tipi">{paymentTypeLabel}</FieldRow>
                    <FieldRow label="Ödeme Kaynağı">
                      {item.payment_source_name ?? '—'}
                    </FieldRow>
                    <FieldRow label="Sözleşme">
                      {item.contract_name ?? '—'}
                    </FieldRow>
                  </div>
                </div>

                <Separator />

                {/* Edit alanları */}
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
                          <FormLabel>Tahsil Tarihi *</FormLabel>
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
                    name="contract_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sözleşme ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sözleşme ID (opsiyonel)"
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
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tahsilat açıklaması"
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durum</FormLabel>
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

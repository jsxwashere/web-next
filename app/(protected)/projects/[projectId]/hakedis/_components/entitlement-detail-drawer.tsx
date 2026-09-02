/**
 * `hakedis/_components/entitlement-detail-drawer.tsx`
 *
 * Sprint 8.4 — Hakediş detay + düzenleme drawer'ı.
 *
 * - Read-only: id, number, project, contractor, period_end, amount,
 *   currency, payment_status, status, paid_amount
 * - Edit: number, period_end, amount, currency, payment_status, paid_amount
 * - API: GET /api/entitlements/{id}, PATCH /api/entitlements/{id}
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ClipboardList,
  LoaderCircleIcon,
  TrendingUp,
  X as XIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useGetEntitlement,
  useUpdateEntitlement,
} from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import {
  EntitlementStatusLabels,
  EntitlementStatusVariants,
  type EntitlementStatus,
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
import { formatAmount, formatDateTr } from '@/lib/helpers';

const STATUS_OPTIONS = [
  { value: 'pending', label: EntitlementStatusLabels['pending' as EntitlementStatus] ?? 'Bekliyor' },
  { value: 'in_review', label: EntitlementStatusLabels['in_review' as EntitlementStatus] ?? 'İncelemede' },
  { value: 'approved', label: EntitlementStatusLabels['approved' as EntitlementStatus] ?? 'Onaylandı' },
  { value: 'rejected', label: EntitlementStatusLabels['rejected' as EntitlementStatus] ?? 'Reddedildi' },
];

const entitlementSchema = z.object({
  delivery_date: z.string().nullable().optional(),
  total_amount: z.coerce.number().nonnegative('Tutar 0 veya büyük olmalı'),
  status: z.enum(['pending', 'in_review', 'approved', 'rejected']),
});

type EntitlementEditValues = z.infer<typeof entitlementSchema>;

export interface EntitlementDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitlementId: string | null;
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

export function EntitlementDetailDrawer({
  open,
  onOpenChange,
  entitlementId,
}: EntitlementDetailDrawerProps) {
  const { t } = useTranslation();
  const { data: resp, isLoading, error } = useGetEntitlement(entitlementId);
  const updateMutation = useUpdateEntitlement();
  const item = resp?.data;

  const form = useForm<EntitlementEditValues>({
    resolver: zodResolver(entitlementSchema),
    defaultValues: {
      delivery_date: '',
      total_amount: 0,
      status: 'pending',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (item) {
      form.reset({
        delivery_date: item.delivery_date ?? '',
        total_amount: item.total_amount ?? 0,
        status: (item.status as EntitlementEditValues['status']) ?? 'pending',
      });
    }
  }, [item, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!entitlementId) return;
    try {
      await updateMutation.mutateAsync({
        id: entitlementId,
        data: {
          delivery_date: data.delivery_date || null,
          total_amount: data.total_amount,
          status: data.status,
        },
      });
      toast.success('Hakediş güncellendi');
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : 'Hakediş güncellenemedi';
      toast.error(message);
    }
  });

  const details = item?.details ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md bg-primary/10">
                <ClipboardList className="size-4 text-primary" />
              </div>
              <SheetTitle>Hakediş Detayı</SheetTitle>
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
              Hakediş yüklenemedi.
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
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold">{item.firm_name ?? 'Firma belirtilmemiş'}</p>
                      {item.delivery_date && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Dönem: {formatDateTr(item.delivery_date)}
                        </p>
                      )}
                    </div>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatAmount(item.total_amount)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={EntitlementStatusVariants[item.status] ?? 'secondary'}
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {EntitlementStatusLabels[item.status] ?? item.status}
                    </Badge>
                  </div>
                  {item.status === 'approved' && item.total_amount > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="size-3" />
                          Tahsil Oranı
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Salt Okunur Bilgiler
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldRow label="ID">{item.id}</FieldRow>
                    <FieldRow label="Proje ID">{item.project_id}</FieldRow>
                    <FieldRow label="Firma">{item.firm_name ?? '—'}</FieldRow>
                    <FieldRow label="Sözleşme ID">
                      {item.contract_id ?? '—'}
                    </FieldRow>
                  </div>
                </div>

                {details.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Hakediş Kalemleri ({details.length})
                      </p>
                      <div className="rounded-md border border-border">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="p-2 text-start font-medium">Kalem</th>
                              <th className="p-2 text-end font-medium">Miktar</th>
                              <th className="p-2 text-start font-medium">Birim</th>
                              <th className="p-2 text-end font-medium">Birim Fiyat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.map((d) => (
                              <tr key={d.id} className="border-t border-border">
                                <td className="p-2">{d.name}</td>
                                <td className="p-2 text-end tabular-nums">{d.quantity}</td>
                                <td className="p-2">{d.unit}</td>
                                <td className="p-2 text-end tabular-nums">
                                  {formatAmount(d.unit_price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Düzenlenebilir Alanlar
                  </p>

                  <FormField
                    control={form.control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dönem Sonu</FormLabel>
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
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tutar *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
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

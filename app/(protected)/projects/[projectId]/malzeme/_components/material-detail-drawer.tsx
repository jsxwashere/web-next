/**
 * `malzeme/_components/material-detail-drawer.tsx`
 *
 * Sprint 8.4 — Malzeme detay + düzenleme drawer'ı.
 *
 * - Read-only: id, name, quantity, unit, amount, currency, supplier, contract,
 *   delivery_date, irsaliye_no, is_return
 * - Edit: name, quantity, unit, amount, supplier_id, contract_id, delivery_date,
 *   irsaliye_no
 * - API: GET /api/materials/{id}, PATCH /api/materials/{id}
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BoxIcon, Calendar, LoaderCircleIcon, X as XIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useGetMaterial,
  useUpdateMaterial,
} from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
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

const materialSchema = z.object({
  name: z.string().min(1, 'Malzeme adı zorunlu').max(150),
  amount: z.coerce.number().nonnegative('Tutar 0 veya büyük olmalı'),
  delivery_date: z.string().nullable().optional(),
  ticket_number: z.string().nullable().optional(),
});

type MaterialEditValues = z.infer<typeof materialSchema>;

export interface MaterialDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string | null;
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

export function MaterialDetailDrawer({
  open,
  onOpenChange,
  materialId,
}: MaterialDetailDrawerProps) {
  const { t } = useTranslation();
  const { data: resp, isLoading, error } = useGetMaterial(materialId);
  const updateMutation = useUpdateMaterial();
  const item = resp?.data;

  const form = useForm<MaterialEditValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      amount: 0,
      delivery_date: '',
      ticket_number: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name ?? '',
        amount: item.amount ?? 0,
        delivery_date: item.delivery_date ?? '',
        ticket_number: item.ticket_number ?? '',
      });
    }
  }, [item, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!materialId) return;
    try {
      await updateMutation.mutateAsync({
        id: materialId,
        data: {
          name: data.name,
          amount: data.amount,
          delivery_date: data.delivery_date || null,
          ticket_number: data.ticket_number || null,
        },
      });
      toast.success('Malzeme güncellendi');
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : 'Malzeme güncellenemedi';
      toast.error(message);
    }
  });

  const supplier = item?.supplier_name ?? item?.manual_supplier_name ?? '—';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={
                  item?.is_return
                    ? 'grid size-8 place-items-center rounded-md bg-rose-500/10'
                    : 'grid size-8 place-items-center rounded-md bg-violet-500/10'
                }
              >
                <BoxIcon
                  className={
                    item?.is_return
                      ? 'size-4 text-rose-600'
                      : 'size-4 text-violet-600'
                  }
                />
              </div>
              <SheetTitle>Malzeme Detayı</SheetTitle>
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
              Malzeme yüklenemedi.
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
                  <p
                    className={
                      item.is_return
                        ? 'mt-1 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400'
                        : 'mt-1 text-2xl font-bold tabular-nums'
                    }
                  >
                    {item.is_return ? '-' : ''}
                    {formatAmount(item.amount)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.delivery_date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDateTr(item.delivery_date)}
                      </span>
                    )}
                    {item.unit && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                        {item.unit}
                      </Badge>
                    )}
                    {item.is_return && (
                      <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                        İade
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
                    <FieldRow label="Proje ID">{item.project_id}</FieldRow>
                    <FieldRow label="Tedarikçi">{supplier}</FieldRow>
                    <FieldRow label="Birim">{item.unit ?? '—'}</FieldRow>
                    <FieldRow label="Sözleşme ID">
                      {item.contract_id ?? '—'}
                    </FieldRow>
                    <FieldRow label="İrsaliye No">
                      {item.ticket_number ?? '—'}
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Malzeme Adı *</FormLabel>
                        <FormControl>
                          <Input placeholder="Malzeme adı" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="delivery_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teslim Tarihi</FormLabel>
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
                      name="ticket_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>İrsaliye No</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="İrsaliye no"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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

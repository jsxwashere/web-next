/**
 * `sozlesmeler/_components/contract-detail-drawer.tsx`
 *
 * Sprint 8.4 — Sözleşme detay + düzenleme drawer'ı.
 *
 * - Read-only: tüm sözleşme alanları + details listesi
 * - Edit: name, type, status, total_amount, start_date, end_date
 * - API: GET /api/contracts/{id}?include=details, PATCH /api/contracts/{id}
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, LoaderCircleIcon, X as XIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import {
  useGetContract,
  useUpdateContract,
} from '@/hooks/use-santiyepro-api';
import {
  ContractStatus,
  ContractStatusLabels,
  ContractStatusVariants,
  ContractType,
  ContractTypeLabels,
  ContractTypeVariants,
} from '@/lib/enums';
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
import { formatAmount } from '@/lib/helpers';

const contractSchema = z.object({
  name: z.string().min(1, 'Sözleşme adı zorunlu').max(150),
  type: z.enum(['fixed', 'unit_based', 'material']),
  status: z.enum(['draft', 'active', 'in_progress', 'completed', 'cancelled']),
  total_amount: z.coerce.number().nonnegative('Tutar 0 veya büyük olmalı'),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

type ContractEditValues = z.infer<typeof contractSchema>;

export interface ContractDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string | null;
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

const TYPE_OPTIONS: { value: ContractType; label: string }[] = [
  { value: ContractType.FIXED, label: ContractTypeLabels[ContractType.FIXED] },
  {
    value: ContractType.UNIT_BASED,
    label: ContractTypeLabels[ContractType.UNIT_BASED],
  },
  { value: ContractType.MATERIAL, label: ContractTypeLabels[ContractType.MATERIAL] },
];

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: ContractStatus.DRAFT, label: ContractStatusLabels[ContractStatus.DRAFT] },
  {
    value: ContractStatus.ACTIVE,
    label: ContractStatusLabels[ContractStatus.ACTIVE],
  },
  {
    value: ContractStatus.IN_PROGRESS,
    label: ContractStatusLabels[ContractStatus.IN_PROGRESS],
  },
  {
    value: ContractStatus.COMPLETED,
    label: ContractStatusLabels[ContractStatus.COMPLETED],
  },
  {
    value: ContractStatus.CANCELLED,
    label: ContractStatusLabels[ContractStatus.CANCELLED],
  },
];

export function ContractDetailDrawer({
  open,
  onOpenChange,
  contractId,
}: ContractDetailDrawerProps) {
  const { t } = useTranslation();
  const { data: resp, isLoading, error } = useGetContract(contractId);
  const updateMutation = useUpdateContract();
  const item = resp?.data;

  const form = useForm<ContractEditValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      name: '',
      type: ContractType.FIXED,
      status: ContractStatus.ACTIVE,
      total_amount: 0,
      start_date: '',
      end_date: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name ?? '',
        type: (item.type as ContractType) ?? ContractType.FIXED,
        status: (item.status as ContractStatus) ?? ContractStatus.ACTIVE,
        total_amount: item.total_amount ?? 0,
        start_date: item.start_date ?? '',
        end_date: item.end_date ?? '',
      });
    }
  }, [item, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!contractId) return;
    try {
      await updateMutation.mutateAsync({
        id: contractId,
        data: {
          name: data.name,
          type: data.type,
          status: data.status,
          total_amount: data.total_amount,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        },
      });
      toast.success('Sözleşme güncellendi');
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : 'Sözleşme güncellenemedi';
      toast.error(message);
    }
  });

  const details = item?.details ?? [];
  const paid = Number(item?.paid_amount ?? 0);
  const total = Number(item?.total_amount ?? 0);
  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-md bg-primary/10">
                <FileText className="size-4 text-primary" />
              </div>
              <SheetTitle>Sözleşme Detayı</SheetTitle>
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
              Sözleşme yüklenemedi.
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
                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {formatAmount(item.total_amount)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant={ContractTypeVariants[item.type] ?? 'secondary'}
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {ContractTypeLabels[item.type] ?? item.type}
                    </Badge>
                    <Badge
                      variant={ContractStatusVariants[item.status] ?? 'secondary'}
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {ContractStatusLabels[item.status] ?? item.status}
                    </Badge>
                  </div>
                  {total > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>İlerleme</span>
                        <span className="tabular-nums">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={
                            progress >= 100
                              ? 'h-full bg-emerald-500'
                              : 'h-full bg-primary'
                          }
                          style={{ width: `${progress}%` }}
                        />
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
                    <FieldRow label="Firma">{item.firm?.name ?? '—'}</FieldRow>
                    <FieldRow label="Ödenen">
                      {formatAmount(paid)}
                    </FieldRow>
                    <FieldRow label="Kalan">
                      {formatAmount(Math.max(0, total - paid))}
                    </FieldRow>
                  </div>
                </div>

                {details.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Sözleşme Kalemleri ({details.length})
                      </p>
                      <div className="rounded-md border border-border">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="p-2 text-start font-medium">
                                Kalem
                              </th>
                              <th className="p-2 text-end font-medium">
                                Miktar
                              </th>
                              <th className="p-2 text-start font-medium">
                                Birim
                              </th>
                              <th className="p-2 text-end font-medium">
                                Birim Fiyat
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.map((d) => (
                              <tr
                                key={d.id}
                                className="border-t border-border"
                              >
                                <td className="p-2">{d.name}</td>
                                <td className="p-2 text-end tabular-nums">
                                  {d.quantity}
                                </td>
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sözleşme Adı *</FormLabel>
                        <FormControl>
                          <Input placeholder="Sözleşme adı" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tip</FormLabel>
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
                              {TYPE_OPTIONS.map((opt) => (
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

                  <FormField
                    control={form.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toplam Tutar *</FormLabel>
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
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Başlangıç</FormLabel>
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
                          <FormLabel>Bitiş</FormLabel>
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

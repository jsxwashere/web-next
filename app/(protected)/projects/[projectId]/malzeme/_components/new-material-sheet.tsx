/**
 * `malzeme/_components/new-material-sheet.tsx`
 *
 * Sprint 6.5 — Yeni malzeme ekleme drawer'ı.
 *
 * API: POST /api/materials (project_id otomatik enjekte edilir).
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreateMaterial, useProjectContracts, useProjectFirms } from '@/hooks/use-santiyepro-api';
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
import { Textarea } from '@/components/ui/textarea';

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const UNIT_OPTIONS = [
  { value: 'm3', label: 'm³' },
  { value: 'm2', label: 'm²' },
  { value: 'm', label: 'm' },
  { value: 'ton', label: 'ton' },
  { value: 'kg', label: 'kg' },
  { value: 'adet', label: 'adet' },
  { value: 'paket', label: 'paket' },
  { value: 'kova', label: 'kova' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Bekliyor' },
  { value: 'received', label: 'Teslim Alındı' },
  { value: 'returned', label: 'İade' },
];

const materialSchema = z.object({
  name: z.string().min(2, 'validation.minLength').max(200),
  amount: z.coerce.number().positive('validation.minAmount'),
  unit: z.string().min(1, 'validation.required'),
  currency: z.string().min(1, 'validation.required'),
  manual_supplier_name: z.string().optional().or(z.literal('')),
  firm_id: z.string().optional().or(z.literal('')),
  contract_id: z.string().optional().or(z.literal('')),
  delivery_date: z.string().optional().or(z.literal('')),
  status: z.string().min(1, 'validation.required'),
  description: z.string().max(500).optional().or(z.literal('')),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

const defaultValues: MaterialFormValues = {
  name: '',
  amount: 0,
  unit: 'adet',
  currency: 'TRY',
  manual_supplier_name: '',
  firm_id: '',
  contract_id: '',
  delivery_date: '',
  status: 'pending',
  description: '',
};

export function NewMaterialSheet({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateMaterial(projectId);
  const firmsQuery = useProjectFirms(projectId);
  const contractsQuery = useProjectContracts(projectId);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        amount: data.amount,
        unit: data.unit,
        currency: data.currency,
        firm_id: data.firm_id || null,
        manual_supplier_name: data.manual_supplier_name || null,
        contract_id: data.contract_id || null,
        delivery_date: data.delivery_date || null,
        status: data.status,
        description: data.description || null,
      });
      toast.success(t('pages.projectTabs.forms.newMaterial.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newMaterial.error');
      toast.error(message);
    }
  });

  const firms = firmsQuery.data?.data ?? [];
  const contracts = contractsQuery.data?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newMaterial.title')}</SheetTitle>
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
                      {t('pages.projectTabs.forms.newMaterial.name')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newMaterial.namePlaceholder',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newMaterial.amount')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newMaterial.unit')}
                        <span className="text-destructive">*</span>
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
                          {UNIT_OPTIONS.map((opt) => (
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newMaterial.currency')}
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

              <FormField
                control={form.control}
                name="firm_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newMaterial.supplier')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'pages.projectTabs.forms.newMaterial.supplierPlaceholder',
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
                name="manual_supplier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manuel Tedarikçi Adı</FormLabel>
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
                name="contract_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newMaterial.contract')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sözleşme seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contracts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newMaterial.deliveryDate')}
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
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
                      <FormLabel>
                        {t('pages.projectTabs.forms.newMaterial.status')}
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Ek bilgiler..."
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
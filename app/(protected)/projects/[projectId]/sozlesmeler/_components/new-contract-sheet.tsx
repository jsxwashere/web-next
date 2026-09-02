/**
 * `sozlesmeler/_components/new-contract-sheet.tsx`
 *
 * Sprint 6.5 — Yeni sözleşme ekleme drawer'ı.
 *
 * API: POST /api/contracts (project_id otomatik enjekte edilir).
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreateContract, useProjectFirms } from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import {
  ContractStatus,
  ContractStatusLabels,
  ContractType,
  ContractTypeLabels,
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
import { Textarea } from '@/components/ui/textarea';

const TYPE_OPTIONS = [
  { value: ContractType.FIXED, label: ContractTypeLabels[ContractType.FIXED] },
  { value: ContractType.UNIT_BASED, label: ContractTypeLabels[ContractType.UNIT_BASED] },
  { value: ContractType.MATERIAL, label: ContractTypeLabels[ContractType.MATERIAL] },
];

const STATUS_OPTIONS = [
  { value: ContractStatus.DRAFT, label: ContractStatusLabels[ContractStatus.DRAFT] },
  { value: ContractStatus.ACTIVE, label: ContractStatusLabels[ContractStatus.ACTIVE] },
  { value: ContractStatus.IN_PROGRESS, label: ContractStatusLabels[ContractStatus.IN_PROGRESS] },
  { value: ContractStatus.COMPLETED, label: ContractStatusLabels[ContractStatus.COMPLETED] },
];

const CURRENCY_OPTIONS = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const contractSchema = z.object({
  name: z.string().min(2, 'validation.minLength').max(200),
  type: z.string().min(1, 'validation.required'),
  status: z.string().min(1, 'validation.required'),
  firm_id: z.string().optional().or(z.literal('')),
  total_amount: z.coerce.number().nonnegative(),
  currency: z.string().min(1, 'validation.required'),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
});

type ContractFormValues = z.infer<typeof contractSchema>;

const defaultValues: ContractFormValues = {
  name: '',
  type: ContractType.FIXED,
  status: ContractStatus.DRAFT,
  firm_id: '',
  total_amount: 0,
  currency: 'TRY',
  start_date: '',
  end_date: '',
  description: '',
};

export function NewContractSheet({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateContract(projectId);
  const firmsQuery = useProjectFirms(projectId);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        type: data.type,
        status: data.status,
        firm_id: data.firm_id || null,
        total_amount: data.total_amount,
        currency: data.currency,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        description: data.description || null,
      });
      toast.success(t('pages.projectTabs.forms.newContract.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newContract.error');
      toast.error(message);
    }
  });

  const firms = firmsQuery.data?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newContract.title')}</SheetTitle>
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
                      {t('pages.projectTabs.forms.newContract.name')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newContract.namePlaceholder',
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newContract.type')}
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
                      <FormLabel>
                        {t('pages.projectTabs.forms.newContract.status')}
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
                name="firm_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newContract.firm')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'pages.projectTabs.forms.newContract.firmPlaceholder',
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newContract.totalAmount')}
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
                        {t('pages.projectTabs.forms.newContract.currency')}
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
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newContract.startDate')}
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
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newContract.endDate')}
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
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Sözleşme detayları, notlar..."
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
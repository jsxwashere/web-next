/**
 * `firmalar/_components/new-firm-sheet.tsx`
 *
 * Sprint 6.5 — Yeni firma ekleme drawer'ı.
 *
 * API: POST /api/firms
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreateFirm } from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import { FirmType, FirmTypeLabels } from '@/lib/enums';
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

const FIRM_TYPE_OPTIONS = [
  { value: FirmType.PROVIDER, label: FirmTypeLabels[FirmType.PROVIDER] },
  { value: FirmType.SUBCONTRACTOR, label: FirmTypeLabels[FirmType.SUBCONTRACTOR] },
  { value: FirmType.WORKER, label: FirmTypeLabels[FirmType.WORKER] },
  { value: FirmType.INSTITUTION, label: FirmTypeLabels[FirmType.INSTITUTION] },
  { value: FirmType.OTHER, label: FirmTypeLabels[FirmType.OTHER] },
];

const firmSchema = z.object({
  name: z.string().min(2, 'validation.minLength').max(200),
  type: z.string().min(1, 'validation.required'),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('validation.invalidEmail').optional().or(z.literal('')),
  speciality: z.string().max(100).optional().or(z.literal('')),
});

type FirmFormValues = z.infer<typeof firmSchema>;

const defaultValues: FirmFormValues = {
  name: '',
  type: FirmType.OTHER,
  phone: '',
  email: '',
  speciality: '',
};

export function NewFirmSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateFirm();

  const form = useForm<FirmFormValues>({
    resolver: zodResolver(firmSchema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        type: data.type,
        phone: data.phone || null,
        email: data.email || null,
        speciality: data.speciality || null,
      });
      toast.success(t('pages.projectTabs.forms.newFirm.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newFirm.error');
      toast.error(message);
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newFirm.title')}</SheetTitle>
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
                      {t('pages.projectTabs.forms.newFirm.name')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newFirm.namePlaceholder',
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newFirm.type')}
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
                        {FIRM_TYPE_OPTIONS.map((opt) => (
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newFirm.phone')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'pages.projectTabs.forms.newFirm.phonePlaceholder',
                          )}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newFirm.email')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t(
                            'pages.projectTabs.forms.newFirm.emailPlaceholder',
                          )}
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
                name="speciality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newFirm.speciality')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newFirm.specialityPlaceholder',
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

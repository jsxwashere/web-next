/**
 * `raporlar/_components/new-site-report-sheet.tsx`
 *
 * Sprint 6.5 — Yeni saha raporu ekleme drawer'ı.
 *
 * API: POST /api/site-reports (project otomatik enjekte edilir).
 *
 * Davranış referansı: ŞantiyePro `resources/js/pages/project/detail/components/add-site-report-sheet.tsx`
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreateSiteReport } from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import {
  SiteReportStatus,
  SiteReportStatusLabels,
  SiteReportWeather,
  SiteReportWeatherLabels,
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

const WEATHER_OPTIONS = [
  { value: SiteReportWeather.SUNNY, label: SiteReportWeatherLabels[SiteReportWeather.SUNNY] },
  { value: SiteReportWeather.CLOUDY, label: SiteReportWeatherLabels[SiteReportWeather.CLOUDY] },
  { value: SiteReportWeather.RAINY, label: SiteReportWeatherLabels[SiteReportWeather.RAINY] },
  { value: SiteReportWeather.STORMY, label: SiteReportWeatherLabels[SiteReportWeather.STORMY] },
  { value: SiteReportWeather.SNOWY, label: SiteReportWeatherLabels[SiteReportWeather.SNOWY] },
  { value: SiteReportWeather.FOGGY, label: SiteReportWeatherLabels[SiteReportWeather.FOGGY] },
];

const STATUS_OPTIONS = [
  { value: SiteReportStatus.DRAFT, label: SiteReportStatusLabels[SiteReportStatus.DRAFT] },
  { value: SiteReportStatus.SUBMITTED, label: SiteReportStatusLabels[SiteReportStatus.SUBMITTED] },
  { value: SiteReportStatus.APPROVED, label: SiteReportStatusLabels[SiteReportStatus.APPROVED] },
];

const siteReportSchema = z.object({
  date: z.string().min(1, 'validation.required'),
  weather: z.string().min(1, 'validation.required'),
  temperature_min_c: z.coerce.number().optional(),
  temperature_max_c: z.coerce.number().optional(),
  work_summary: z.string().min(3, 'validation.minLength'),
  blockers: z.string().max(500).optional().or(z.literal('')),
  visitors: z.string().max(500).optional().or(z.literal('')),
  safety_notes: z.string().max(500).optional().or(z.literal('')),
  status: z.string().min(1, 'validation.required'),
});

type SiteReportFormValues = z.infer<typeof siteReportSchema>;

const defaultValues: SiteReportFormValues = {
  date: '',
  weather: SiteReportWeather.SUNNY,
  temperature_min_c: undefined,
  temperature_max_c: undefined,
  work_summary: '',
  blockers: '',
  visitors: '',
  safety_notes: '',
  status: SiteReportStatus.DRAFT,
};

export function NewSiteReportSheet({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateSiteReport(projectId);

  const form = useForm<SiteReportFormValues>({
    resolver: zodResolver(siteReportSchema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    } else if (!form.getValues('date')) {
      const today = new Date().toISOString().slice(0, 10);
      form.setValue('date', today);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        date: data.date,
        weather: data.weather,
        temperature_min_c: data.temperature_min_c ?? null,
        temperature_max_c: data.temperature_max_c ?? null,
        work_summary: data.work_summary,
        blockers: data.blockers || null,
        visitors: data.visitors || null,
        safety_notes: data.safety_notes || null,
        status: data.status,
      });
      toast.success(t('pages.projectTabs.forms.newReport.success'));
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newReport.error');
      toast.error(message);
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newReport.title')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <SheetBody className="flex-1 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newReport.date')}
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
                  name="weather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newReport.weather')}
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
                          {WEATHER_OPTIONS.map((opt) => (
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
                  name="temperature_min_c"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newReport.tempMin')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="—"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature_max_c"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('pages.projectTabs.forms.newReport.tempMax')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="—"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="work_summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newReport.workSummary')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={t(
                          'pages.projectTabs.forms.newReport.workSummaryPlaceholder',
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
                name="blockers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newReport.blockers')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder={t(
                          'pages.projectTabs.forms.newReport.blockersPlaceholder',
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
                name="visitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newReport.visitors')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder={t(
                          'pages.projectTabs.forms.newReport.visitorsPlaceholder',
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
                name="safety_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newReport.safetyNotes')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder={t(
                          'pages.projectTabs.forms.newReport.safetyNotesPlaceholder',
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newReport.status')}
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
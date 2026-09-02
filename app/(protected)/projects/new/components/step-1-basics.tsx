/**
 * Step 1 — Temel bilgiler (proje adı, tip, konum, durum).
 *
 * Davranış: `.tmp-crawl/sp-deep/projeler-sihirbazi.md` [validation]
 *   - name: 2-100 karakter, trim
 *   - project_kind: enum (own_land/co_build/contract/urban_renewal)
 *   - location, start_date: opsiyonel
 *   - status: enum (active/completed/passive/in_progress)
 */

'use client';

import {
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
import { useTranslation } from '@/hooks/useTranslation';
import {
  ProjectStatus,
  ProjectStatusLabels,
  ProjectType,
  ProjectTypeLabels,
} from '@/lib/enums';

export function BasicsStep() {
  const { t } = useTranslation();
  const PROJECT_TYPE_OPTIONS = [
    { value: ProjectType.OWN_LAND, label: ProjectTypeLabels[ProjectType.OWN_LAND] },
    { value: ProjectType.CO_BUILD, label: ProjectTypeLabels[ProjectType.CO_BUILD] },
    { value: ProjectType.CONTRACT, label: ProjectTypeLabels[ProjectType.CONTRACT] },
    { value: ProjectType.URBAN_RENEWAL, label: ProjectTypeLabels[ProjectType.URBAN_RENEWAL] },
  ];
  const STATUS_OPTIONS = [
    { value: ProjectStatus.IN_PROGRESS, label: ProjectStatusLabels[ProjectStatus.IN_PROGRESS] },
    { value: ProjectStatus.ACTIVE, label: ProjectStatusLabels[ProjectStatus.ACTIVE] },
    { value: ProjectStatus.COMPLETED, label: ProjectStatusLabels[ProjectStatus.COMPLETED] },
    { value: ProjectStatus.PASSIVE, label: ProjectStatusLabels[ProjectStatus.PASSIVE] },
  ];

  return (
    <div className="flex flex-col gap-5">
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('pages.projects.wizard.fields.name')}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('pages.projects.wizard.fields.namePlaceholder')}
                maxLength={100}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('pages.projects.wizard.fields.type')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('pages.projects.wizard.fields.type')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROJECT_TYPE_OPTIONS.map((opt) => (
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.projects.wizard.fields.status')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('pages.projects.wizard.fields.status')}
                    />
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
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.projects.wizard.fields.location')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t(
                  'pages.projects.wizard.fields.locationPlaceholder',
                )}
                maxLength={100}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.projects.wizard.fields.city')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('pages.projects.wizard.fields.cityPlaceholder')}
                maxLength={50}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
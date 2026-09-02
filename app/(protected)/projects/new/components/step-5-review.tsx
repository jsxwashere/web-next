/**
 * Step 5 — Özet + Kaydet.
 *
 * Davranış: `.tmp-crawl/sp-deep/projeler-sihirbazi.md` [api] :1240, :1255
 *   - "Proje oluşturuldu" toast
 *   - resource_id / id redirect için okunur
 *   - hata ApiError.message veya generic "Kayıt başarısız."
 */

'use client';

import {
  ProjectStatusLabels,
  ProjectTypeLabels,
} from '@/lib/enums';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';

import type { WizardValues } from '../schema';

type ReviewStepProps = {
  values: WizardValues;
};

export function ReviewStep({ values }: ReviewStepProps) {
  const { t } = useTranslation();

  const totalUnits = values.blocks.reduce(
    (sum, b) =>
      sum +
      (Number.isFinite(b.count) ? b.count : 0) +
      (Number.isFinite(b.officeCount) ? b.officeCount : 0),
    0,
  );

  const allUnits = Object.values(values.unitsByBlock ?? {}).reduce(
    (acc, list) => acc + list.length,
    0,
  );

  const typeLabel = ProjectTypeLabels[values.type] ?? values.type;
  const statusLabel = ProjectStatusLabels[values.status] ?? values.status;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        {t('pages.projects.wizard.fields.reviewHelp')}
      </div>

      {/* Basics */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('pages.projects.wizard.fields.reviewTitle')}
        </h3>
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 text-sm sm:grid-cols-2">
          <Field
            label={t('pages.projects.wizard.fields.reviewName')}
            value={values.name || '—'}
          />
          <Field
            label={t('pages.projects.wizard.fields.reviewType')}
            value={
              <Badge variant="secondary" className="text-xs">
                {typeLabel}
              </Badge>
            }
          />
          <Field
            label={t('pages.projects.wizard.fields.reviewLocation')}
            value={
              values.location || values.city
                ? `${values.location ?? ''}${values.location && values.city ? ', ' : ''}${values.city ?? ''}`
                : '—'
            }
          />
          <Field
            label={t('pages.projects.wizard.fields.reviewStatus')}
            value={statusLabel}
          />
        </div>
      </section>

      <Separator />

      {/* Blocks */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('pages.projects.wizard.fields.reviewBlocks')} ({totalUnits})
        </h3>
        {values.blocks.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t('pages.projects.wizard.fields.noBlocks')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {values.blocks.map((b) => {
              const apt =
                Number.isFinite(b.count) ? b.count : 0;
              const off =
                Number.isFinite(b.officeCount) ? b.officeCount : 0;
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <span className="font-medium">{b.name || '—'}</span>
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {t('pages.projects.wizard.fields.unitsApartmentLine', { count: apt })}
                    {off > 0
                      ? `, ${t('pages.projects.wizard.fields.unitsOfficeLine', { count: off })}`
                      : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {allUnits > 0 && (
          <p className="text-xs text-muted-foreground">
            {t('pages.projects.wizard.fields.reviewUnits')}:{' '}
            <span className="font-semibold text-foreground">{allUnits}</span>
          </p>
        )}
      </section>

      <Separator />

      {/* Financials */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('pages.projects.wizard.fields.reviewFinancial')}
        </h3>
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 text-sm sm:grid-cols-2">
          <Field
            label={t('pages.projects.wizard.fields.reviewBudget')}
            value={
              typeof values.budget === 'number' && !Number.isNaN(values.budget)
                ? new Intl.NumberFormat('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(values.budget) +
                  ' ' +
                  values.currency
                : '—'
            }
          />
          <Field
            label={t('pages.projects.wizard.fields.reviewStartDate')}
            value={values.startDate || '—'}
          />
          <Field
            label={t('pages.projects.wizard.fields.reviewKdv')}
            value={
              typeof values.kdvOrani === 'number'
                ? `%${values.kdvOrani}`
                : '—'
            }
          />
          <Field
            label={t('pages.projects.wizard.fields.reviewCurrency')}
            value={values.currency}
          />
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
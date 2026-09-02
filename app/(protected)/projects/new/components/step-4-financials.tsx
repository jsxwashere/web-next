/**
 * Step 4 — Finansal bilgiler (bütçe, başlangıç, KDV, para birimi).
 *
 * Davranış: `.tmp-crawl/sp-deep/projeler-sihirbazi.md` [validation]
 *   - estimated_budget: 0 - 999999999999.99 (≈1 trilyon TL, :250)
 *   - land_cost_tl üst sınırı daha sıkı (100M) — bu adımda yok
 *   - start_date yyyy-MM-dd slice (:1116)
 *   - currency: TL / USD / EUR (:325-337)
 *   - KDV 0-100 + 2 decimal
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

import { CurrencyEnum, type CurrencyValue } from '../schema';

export function FinancialsStep() {
  const { t } = useTranslation();
  const CURRENCY_OPTIONS: { value: CurrencyValue; label: string; symbol: string }[] =
    [
      { value: 'TRY', label: 'Türk Lirası', symbol: '₺' },
      { value: 'USD', label: 'Amerikan Doları', symbol: '$' },
      { value: 'EUR', label: 'Euro', symbol: '€' },
    ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.projects.wizard.fields.budget')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  placeholder={t(
                    'pages.projects.wizard.fields.budgetPlaceholder',
                  )}
                  value={
                    typeof field.value === 'number' && !Number.isNaN(field.value)
                      ? String(field.value)
                      : ''
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      field.onChange(undefined);
                      return;
                    }
                    const n = Number(v);
                    field.onChange(Number.isFinite(n) ? n : undefined);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('pages.projects.wizard.fields.currency')}
              </FormLabel>
              <Select
                onValueChange={(val) => field.onChange(val as CurrencyValue)}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CurrencyEnum.options.map((opt) => {
                    const optMeta = CURRENCY_OPTIONS.find((o) => o.value === opt);
                    return (
                      <SelectItem key={opt} value={opt}>
                        {opt} {optMeta?.symbol} {optMeta?.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('pages.projects.wizard.fields.startDate')}
              </FormLabel>
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
          name="kdvOrani"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('pages.projects.wizard.fields.kdvOrani')}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  inputMode="decimal"
                  placeholder={t(
                    'pages.projects.wizard.fields.kdvOraniPlaceholder',
                  )}
                  value={
                    typeof field.value === 'number' && !Number.isNaN(field.value)
                      ? String(field.value)
                      : ''
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      field.onChange(undefined);
                      return;
                    }
                    const n = Number(v);
                    field.onChange(Number.isFinite(n) ? n : undefined);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
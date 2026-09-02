/**
 * Step 2 — Bloklar.
 *
 * Davranış: `.tmp-crawl/sp-deep/projeler-sihirbazi.md`
 *   - blok satırları dinamik eklenir/çıkarılır (:864-868)
 *   - "Başka Blok Ekle" her zaman aktif
 *   - "Kaldır" en az 1 blok kaldı kuralıyla disabled olur
 *   - count + office_count integer
 *   - "Toplam N bölüm" başlığı (:821)
 */

'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';

import type { WizardValues } from '../schema';

export function BlocksStep() {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<WizardValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'blocks' });

  const totalUnits = watch('blocks').reduce(
    (sum, b) => sum + (Number.isFinite(b.count) ? b.count : 0) +
      (Number.isFinite(b.officeCount) ? b.officeCount : 0),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {t('pages.projects.wizard.fields.blocksHelp')}
        </p>
        <p className="text-sm font-semibold tabular-nums">
          {t('pages.projects.wizard.fields.totalUnits', { count: totalUnits })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[1fr_120px_120px_40px]"
          >
            <FormField
              control={control}
              name={`blocks.${idx}.name` as const}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    {t('pages.projects.wizard.fields.blockName')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'pages.projects.wizard.fields.blockNamePlaceholder',
                      )}
                      maxLength={50}
                      {...f}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`blocks.${idx}.count` as const}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    {t('pages.projects.wizard.fields.blockCount')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={999}
                      step={1}
                      inputMode="numeric"
                      value={
                        typeof f.value === 'number' && !Number.isNaN(f.value)
                          ? String(f.value)
                          : ''
                      }
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === '') {
                          f.onChange(0);
                          return;
                        }
                        const n = parseInt(next, 10);
                        f.onChange(Number.isFinite(n) ? Math.max(0, Math.min(999, n)) : 0);
                      }}
                      onBlur={f.onBlur}
                      name={f.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`blocks.${idx}.officeCount` as const}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    {t('pages.projects.wizard.fields.blockOfficeCount')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={999}
                      step={1}
                      inputMode="numeric"
                      value={
                        typeof f.value === 'number' && !Number.isNaN(f.value)
                          ? String(f.value)
                          : ''
                      }
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === '') {
                          f.onChange(0);
                          return;
                        }
                        const n = parseInt(next, 10);
                        f.onChange(Number.isFinite(n) ? Math.max(0, Math.min(999, n)) : 0);
                      }}
                      onBlur={f.onBlur}
                      name={f.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={fields.length <= 1}
              onClick={() => remove(idx)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={t('pages.projects.wizard.fields.removeBlock')}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            id: `b${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: '',
            count: 0,
            officeCount: 0,
          })
        }
        className="self-start gap-1.5"
      >
        <Plus className="size-3.5" />
        {t('pages.projects.wizard.fields.addBlock')}
      </Button>
    </div>
  );
}
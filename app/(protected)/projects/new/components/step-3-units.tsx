/**
 * Step 3 — Bağımsız bölümler (daireler/ofisler).
 *
 * Davranış: `.tmp-crawl/sp-deep/projeler-sihirbazi.md` [conditional]
 *   - taahhut projelerde bloklar-daireler gizlenir (:741); bu wizard'da
 *     "Bölüm Girme" toggle'ı ile sözleşmeli projeler atlayabilir
 *   - ofisler ayrı sayılır (:1145-1164), sıralama "Ofis-" öneki
 *     parseInt'e düşer (:126-129)
 *   - step-2 ile aynı dinamik field array yapısı (blockId başına liste)
 *
 * Bir blok seçilir; o bloğun daire listesi düzenlenir.
 */

'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

import {
  UnitTypeEnum,
  UnitTypeLabels,
  type UnitTypeValue,
} from '../schema';
import type { WizardValues } from '../schema';

export function UnitsStep() {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<WizardValues>();
  const blocks = watch('blocks');

  const validBlocks = useMemo(
    () => blocks.filter((b) => b.name.trim().length > 0),
    [blocks],
  );

  const [activeBlockId, setActiveBlockId] = useState<string>(
    validBlocks[0]?.id ?? '',
  );

  const activeBlock = validBlocks.find((b) => b.id === activeBlockId) ?? validBlocks[0];

  const { fields, append, remove } = useFieldArray({
    control,
    name: `unitsByBlock.${activeBlock?.id ?? ''}` as const,
  });

  if (validBlocks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
        {t('pages.projects.wizard.fields.noBlocks')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Block tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {validBlocks.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveBlockId(b.id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              activeBlock?.id === b.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
          >
            {b.name || `(${t('pages.projects.wizard.fields.blockNamePlaceholder')})`}
          </button>
        ))}
      </div>

      {activeBlock ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {t('pages.projects.wizard.fields.unitsHelp')}
          </div>

          <div className="flex flex-col gap-2">
            {fields.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
                Henüz daire eklenmedi
              </div>
            )}

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-2 items-end gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[80px_120px_100px_100px_40px]"
              >
                <FormField
                  control={control}
                  name={
                    `unitsByBlock.${activeBlock.id}.${idx}.unitNo` as const
                  }
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('pages.projects.wizard.fields.unitNumber')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'pages.projects.wizard.fields.unitNumberPlaceholder',
                          )}
                          maxLength={20}
                          {...f}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={
                    `unitsByBlock.${activeBlock.id}.${idx}.type` as const
                  }
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('pages.projects.wizard.fields.unitType')}
                      </FormLabel>
                      <Select
                        onValueChange={(val) => f.onChange(val as UnitTypeValue)}
                        value={f.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UnitTypeEnum.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {UnitTypeLabels[opt]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={
                    `unitsByBlock.${activeBlock.id}.${idx}.floor` as const
                  }
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('pages.projects.wizard.fields.unitFloor')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          inputMode="numeric"
                          placeholder={t(
                            'pages.projects.wizard.fields.unitFloorPlaceholder',
                          )}
                          value={
                            typeof f.value === 'number' && !Number.isNaN(f.value)
                              ? String(f.value)
                              : ''
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '') {
                              f.onChange(undefined);
                              return;
                            }
                            const n = parseInt(v, 10);
                            f.onChange(Number.isFinite(n) ? n : undefined);
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
                  name={
                    `unitsByBlock.${activeBlock.id}.${idx}.area` as const
                  }
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {t('pages.projects.wizard.fields.unitArea')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          min={0}
                          inputMode="numeric"
                          placeholder={t(
                            'pages.projects.wizard.fields.unitAreaPlaceholder',
                          )}
                          value={
                            typeof f.value === 'number' && !Number.isNaN(f.value)
                              ? String(f.value)
                              : ''
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '') {
                              f.onChange(undefined);
                              return;
                            }
                            const n = Number(v);
                            f.onChange(Number.isFinite(n) ? n : undefined);
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
                  onClick={() => remove(idx)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t(
                    'pages.projects.wizard.fields.removeUnit',
                  )}
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
                id: `u${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                unitNo: '',
                type: '1+1',
                floor: undefined,
                area: undefined,
              })
            }
            className="self-start gap-1.5"
          >
            <Plus className="size-3.5" />
            {t('pages.projects.wizard.fields.addUnit')}
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          {t('pages.projects.wizard.fields.skipUnits')}
        </div>
      )}
    </div>
  );
}
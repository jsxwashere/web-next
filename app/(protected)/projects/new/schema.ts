/**
 * `app/(protected)/projects/new/schema.ts`
 *
 * Sprint 7 — Yeni proje sihirbazı Zod şeması.
 *
 * Davranış referansı: `.tmp-crawl/sp-deep/projeler-sihirbazi.md` [validation].
 *
 * Adımlar:
 *   1. Basics   → name, type, location, city, status
 *   2. Blocks   → dinamik blok listesi (en az 1 blok)
 *   3. Units    → her blok için dinamik daire listesi (opsiyonel)
 *   4. Financials → budget, start_date, kdv_orani, currency
 *   5. Review   → sadece özet (validasyon uygulanmaz)
 *
 * Tüm adımlar tek bir büyük `wizardSchema`'da birleştirilir; `safeParse`
 * ile parça parça doğrulama `wizardPartialSchema(fieldNames)` ile yapılır.
 */

import { z } from 'zod';

import { ProjectStatus, ProjectType } from '@/lib/enums';

// Para birimi enum'u (ŞantiyePro S :325-337 ile uyumlu)
export const CurrencyEnum = z.enum(['TRY', 'USD', 'EUR']);
export type CurrencyValue = z.infer<typeof CurrencyEnum>;

// Birim (daire) tipi (ŞantiyePro birim sıralaması + ofis öneki)
export const UnitTypeEnum = z.enum([
  '1+0',
  '1+1',
  '2+1',
  '3+1',
  '4+1',
  'office',
  'other',
]);
export type UnitTypeValue = z.infer<typeof UnitTypeEnum>;

export const UnitTypeLabels: Record<UnitTypeValue, string> = {
  '1+0': '1+0',
  '1+1': '1+1',
  '2+1': '2+1',
  '3+1': '3+1',
  '4+1': '4+1',
  office: 'Ofis',
  other: 'Diğer',
};

// --- TEK ADIM ŞEMALARI ---

// Note: `.default()` kullanmıyoruz — react-hook-form `defaultValues`'tan
// başlıyor, schema input → output aynı kalıyor.
export const basicsSchema = z.object({
  name: z
    .string()
    .min(2, 'validation.nameMin')
    .max(100, 'validation.nameMax')
    .trim(),
  type: z.nativeEnum(ProjectType, {
    errorMap: () => ({ message: 'validation.typeRequired' }),
  }),
  location: z
    .string()
    .max(100, 'validation.locationMax')
    .trim()
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(50, 'validation.locationMax')
    .trim()
    .optional()
    .or(z.literal('')),
  status: z.nativeEnum(ProjectStatus),
});

export type BasicsValues = z.infer<typeof basicsSchema>;

export const blockSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'validation.blockNameRequired')
    .max(50, 'validation.blockNameMax')
    .trim(),
  count: z
    .number({ invalid_type_error: 'validation.blockCountInvalid' })
    .int('validation.blockCountInvalid')
    .min(0, 'validation.blockCountInvalid')
    .max(999, 'validation.blockCountInvalid'),
  officeCount: z
    .number({ invalid_type_error: 'validation.blockCountInvalid' })
    .int('validation.blockCountInvalid')
    .min(0, 'validation.blockCountInvalid')
    .max(999, 'validation.blockCountInvalid'),
});

export type BlockValues = z.infer<typeof blockSchema>;

export const blocksSchema = z.object({
  blocks: z.array(blockSchema).min(1, 'validation.blockNameRequired'),
});

export type BlocksValues = z.infer<typeof blocksSchema>;

export const unitSchema = z.object({
  id: z.string(),
  unitNo: z
    .string()
    .min(1, 'validation.unitNumberRequired')
    .max(20, 'validation.unitNumberRequired')
    .trim(),
  type: UnitTypeEnum,
  floor: z
    .number({ invalid_type_error: 'validation.unitAreaInvalid' })
    .int('validation.unitAreaInvalid')
    .min(-5, 'validation.unitAreaInvalid')
    .max(200, 'validation.unitAreaInvalid')
    .optional(),
  area: z
    .number({ invalid_type_error: 'validation.unitAreaInvalid' })
    .min(0, 'validation.unitAreaInvalid')
    .max(100000, 'validation.unitAreaInvalid')
    .optional(),
});

export type UnitValues = z.infer<typeof unitSchema>;

export const unitsSchema = z.object({
  /** Map<blockId, UnitValues[]> */
  unitsByBlock: z.record(z.array(unitSchema)),
});

export type UnitsValues = z.infer<typeof unitsSchema>;

export const financialsSchema = z.object({
  budget: z
    .number({ invalid_type_error: 'validation.budgetMin' })
    .min(0, 'validation.budgetMin')
    .max(999999999999.99, 'validation.budgetMax')
    .optional(),
  startDate: z.string().optional().or(z.literal('')),
  kdvOrani: z
    .number({ invalid_type_error: 'validation.kdvMin' })
    .min(0, 'validation.kdvMin')
    .max(100, 'validation.kdvMax')
    .optional(),
  currency: CurrencyEnum,
});

export type FinancialsValues = z.infer<typeof financialsSchema>;

// --- TAM WIZARD ŞEMASI ---

export const wizardSchema = basicsSchema
  .merge(blocksSchema)
  .merge(unitsSchema)
  .merge(financialsSchema);

export type WizardValues = z.infer<typeof wizardSchema>;

/**
 * İlgili adımın alanlarını doğrulayan yardımcı.
 *
 * react-hook-form `trigger(fieldNames)` ile uyumlu çalışır; hata varsa
 * o adımda kalır, yoksa ilerler.
 */
export function fieldsForStep(step: WizardStep): string[] {
  switch (step) {
    case 'basics':
      return ['name', 'type', 'location', 'city', 'status'];
    case 'blocks':
      return ['blocks'];
    case 'units':
      return ['unitsByBlock'];
    case 'financials':
      return ['budget', 'startDate', 'kdvOrani', 'currency'];
    case 'review':
      return [];
  }
}

export type WizardStep = 'basics' | 'blocks' | 'units' | 'financials' | 'review';

export const WIZARD_STEPS: { id: WizardStep; titleKey: string }[] = [
  { id: 'basics', titleKey: 'steps.basics' },
  { id: 'blocks', titleKey: 'steps.blocks' },
  { id: 'units', titleKey: 'steps.units' },
  { id: 'financials', titleKey: 'steps.financials' },
  { id: 'review', titleKey: 'steps.review' },
];

// --- DEFAULT VALUES ---

export const defaultWizardValues: WizardValues = {
  name: '',
  type: ProjectType.OWN_LAND,
  location: '',
  city: '',
  status: ProjectStatus.IN_PROGRESS,
  blocks: [{ id: 'b1', name: 'A Blok', count: 0, officeCount: 0 }],
  unitsByBlock: { b1: [] },
  budget: undefined,
  startDate: '',
  kdvOrani: 20,
  currency: 'TRY',
};

// --- API PAYLOAD BUILDER ---
// (ŞantiyePro `171gpwffoviaf.js` :1209-1231 ile uyumlu)

export type WizardPayload = {
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  location?: string;
  city?: string;
  budget?: number;
  start_date?: string;
  kdv_orani?: number;
  currency: CurrencyValue;
  blocks: { name: string; count: number; office_count: number }[];
  units: Array<{
    block_name: string;
    unit_no: string;
    type: UnitTypeValue;
    floor?: number;
    area?: number;
  }>;
};

/** Wizard state → POST /api/projects payload. */
export function buildPayload(values: WizardValues): WizardPayload {
  const blocks = values.blocks
    .filter((b) => b.name.trim().length > 0)
    .map((b) => ({
      name: b.name.trim(),
      count: Number.isFinite(b.count) ? b.count : 0,
      office_count: Number.isFinite(b.officeCount) ? b.officeCount : 0,
    }));

  const units: WizardPayload['units'] = [];
  for (const block of values.blocks) {
    if (!block.name.trim()) continue;
    const list = values.unitsByBlock[block.id] ?? [];
    for (const u of list) {
      if (!u.unitNo.trim()) continue;
      units.push({
        block_name: block.name.trim(),
        unit_no: u.unitNo.trim(),
        type: u.type,
        floor: typeof u.floor === 'number' ? u.floor : undefined,
        area: typeof u.area === 'number' ? u.area : undefined,
      });
    }
  }

  return {
    name: values.name.trim(),
    type: values.type,
    status: values.status,
    location: values.location?.trim() || undefined,
    city: values.city?.trim() || undefined,
    budget: values.budget,
    start_date: values.startDate || undefined,
    kdv_orani: values.kdvOrani,
    currency: values.currency,
    blocks,
    units,
  };
}
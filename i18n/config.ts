// src/config/languages.ts
export interface Language {
  code: string;
  name: string;
  shortName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  isDefault?: boolean;
}

export const I18N_LANGUAGES: Language[] = [
  {
    code: 'tr',
    name: 'Türkçe',
    shortName: 'TR',
    direction: 'ltr',
    flag: '/media/flags/turkey.svg',
    isDefault: true,
  },
  {
    code: 'en',
    name: 'English',
    shortName: 'EN',
    direction: 'ltr',
    flag: '/media/flags/united-states.svg',
  },
  {
    code: 'ar',
    name: 'Arabic',
    shortName: 'AR',
    direction: 'rtl',
    flag: '/media/flags/saudi-arabia.svg',
  },
  {
    code: 'es',
    name: 'Spanish',
    shortName: 'ES',
    direction: 'ltr',
    flag: '/media/flags/spain.svg',
  },
  {
    code: 'de',
    name: 'German',
    shortName: 'DE',
    direction: 'ltr',
    flag: '/media/flags/germany.svg',
  },
  {
    code: 'ch',
    name: 'Chinese',
    shortName: 'CH',
    direction: 'ltr',
    flag: '/media/flags/china.svg',
  },
];

/**
 * ŞantiyePro default language is Turkish.
 * The default is set on the `tr` entry; resolve it at runtime so callers
 * can fall back gracefully if the list ever changes.
 */
export const DEFAULT_LANGUAGE_CODE =
  I18N_LANGUAGES.find((l) => l.isDefault)?.code ?? 'tr';

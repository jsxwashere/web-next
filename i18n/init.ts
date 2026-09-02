/**
 * i18n singleton initialization (module-level).
 *
 * `useEffect` içinde init yapıldığında ilk render'da `i18n.isInitialized`
 * false olur → `t('auth.signin.title')` raw key döner. Module-level init
 * bu sorunu çözer: provider render edildiğinde i18n zaten hazır.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18N_LANGUAGES, DEFAULT_LANGUAGE_CODE } from './config';

import enTranslations from './messages/en.json';
import trTranslations from './messages/tr.json';
import arTranslations from './messages/ar.json';
import esTranslations from './messages/es.json';
import deTranslations from './messages/de.json';
import chTranslations from './messages/ch.json';

const resources = {
  en: { translation: enTranslations },
  tr: { translation: trTranslations },
  ar: { translation: arTranslations },
  es: { translation: esTranslations },
  de: { translation: deTranslations },
  ch: { translation: chTranslations },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LANGUAGE_CODE,
      supportedLngs: I18N_LANGUAGES.map((l) => l.code),
      load: 'currentOnly',
      debug: process.env.NODE_ENV === 'development',
      compatibilityJSON: 'v4',
      interpolation: {
        prefix: '{{',
        suffix: '}}',
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'language',
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
import { I18N_LANGUAGES, DEFAULT_LANGUAGE_CODE } from '@/i18n/config';
// Module-level singleton — see @/i18n/init. This ensures `i18n.t()`
// works on first render (i18n is already initialized at import time),
// so the auth/signin page does not flash raw keys like
// `auth.signin.title` for one frame.
import i18n from '@/i18n/init';

interface I18nProviderProps {
  children: ReactNode;
}

function I18nProvider({ children }: I18nProviderProps) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(i18n.isInitialized);

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsI18nInitialized(true);
      return;
    }

    // Fallback: in some edge runtime contexts the module-level init
    // may have been deferred. Wait for the next tick and check again.
    const handle = setTimeout(() => {
      setIsI18nInitialized(i18n.isInitialized);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const language = I18N_LANGUAGES.find((lang) => lang.code === lng);
      if (language?.direction) {
        document.documentElement.setAttribute('dir', language.direction);
      }
    };

    if (i18n.language) {
      handleLanguageChange(i18n.language);
    }
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Get current language for direction
  const currentLanguage = I18N_LANGUAGES.find((lang) => lang.code === (i18n.language || DEFAULT_LANGUAGE_CODE)) || I18N_LANGUAGES[0];

  return (
    <I18nextProvider i18n={i18n}>
      <RadixDirectionProvider dir={currentLanguage.direction}>
        {children}
      </RadixDirectionProvider>
    </I18nextProvider>
  );
}

const useLanguage = () => {
  const currentLanguage = I18N_LANGUAGES.find((lang) => lang.code === i18n.language) || I18N_LANGUAGES[0];

  const changeLanguage = (code: string) => {
    if (!I18N_LANGUAGES.some((lang) => lang.code === code)) {
      return;
    }
    i18n.changeLanguage(code);
  };

  return {
    languageCode: i18n.language,
    language: currentLanguage,
    changeLanguage,
  };
};

export { I18nProvider, useLanguage };

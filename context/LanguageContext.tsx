'use client';

import * as React from 'react';

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGE_CODES,
  type SupportedLanguage,
} from '@/config/languages';
import {
  getTranslation,
  type TranslationReplacements,
} from '@/lib/localization';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): SupportedLanguage {
  const stored = window.localStorage.getItem('language');
  return stored &&
    SUPPORTED_LANGUAGE_CODES.includes(stored as SupportedLanguage)
    ? (stored as SupportedLanguage)
    : DEFAULT_LANGUAGE;
}

const getServerSnapshot = (): SupportedLanguage => DEFAULT_LANGUAGE;

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  translate: (key: string, replacements?: TranslationReplacements) => string;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: React.PropsWithChildren) => {
  // useSyncExternalStore uses getServerSnapshot during SSR + hydration (no mismatch),
  // then switches to getSnapshot (localStorage) after hydration completes.
  const language = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setLanguage = React.useCallback((lang: SupportedLanguage) => {
    window.localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    // Dispatch a synthetic storage event so the subscriber in the current tab
    // re-reads the snapshot and triggers a re-render.
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'language', newValue: lang }),
    );
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const translate = React.useCallback(
    (key: string, replacements?: TranslationReplacements) =>
      getTranslation(language, key, replacements),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = React.useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};

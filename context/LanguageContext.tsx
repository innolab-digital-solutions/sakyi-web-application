'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getTranslation,
  type SupportedLanguage,
  type TranslationReplacements,
} from '@/lib/localization';

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (key: string, replacements?: TranslationReplacements) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem('language');

    if (stored === 'en' || stored === 'my') {
      window.setTimeout(() => setLanguageState(stored), 0);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language === 'my' ? 'my' : 'en';
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    const nextLang: SupportedLanguage =
      lang === 'en' || lang === 'my' ? lang : 'en';

    setLanguageState(nextLang);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', nextLang);
    }
  }, []);

  const translate = useCallback(
    (key: string, replacements?: TranslationReplacements) =>
      getTranslation(language, key, replacements),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      translate,
    }),
    [language, setLanguage, translate],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return ctx;
}

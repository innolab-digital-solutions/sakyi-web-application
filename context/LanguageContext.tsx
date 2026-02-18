'use client';

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { type SupportedLanguage, getTranslation } from '@/lib/localization';

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Top-level provider component for the language context.
 *
 * This component is responsible for:
 * - Hydrating the initial language from persistent storage
 * - Exposing the current language, `setLanguage` mutator and `translate` translator
 *   to all components via React context
 *
 * It should typically be mounted once near the root layout so that
 * all pages share the same language state.
 */
export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // Hydrate initial language from persistent storage on the client.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem('language');

    if (stored === 'en' || stored === 'my') {
      window.setTimeout(() => setLanguageState(stored), 0);
    }
  }, []);

  /**
   * Update the active language and persist the choice to localStorage.
   * Any unsupported language codes are coerced back to the English default.
   */
  const setLanguage = useCallback((lang: SupportedLanguage) => {
    const nextLang: SupportedLanguage =
      lang === 'en' || lang === 'my' ? lang : 'en';

    setLanguageState(nextLang);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', nextLang);
    }
  }, []);

  /**
   * Resolve a translation key for the current language (delegates to localization lib).
   */
  const translate = useCallback(
    (key: string) => getTranslation(language, key),
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

/**
 * Convenience hook for consuming the current language context.
 *
 * This hook exposes:
 * - `language`: current language code
 * - `setLanguage`: mutator for updating the language
 * - `t`: translator function for resolving string keys
 *
 * Throws a descriptive error when used outside of `LanguageProvider`
 * to surface configuration issues early in development.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return ctx;
}

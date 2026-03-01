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

/**
 * Shape of the language context that is exposed by `LanguageProvider`
 * and consumed via the `useLanguage` hook.
 */
type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (key: string, replacements?: TranslationReplacements) => string;
};
/**
 * Internal React context carrying language state and translation helpers.
 *
 * Prefer using `LanguageProvider` and `useLanguage` instead of consuming this
 * context directly to keep usage consistent across the app.
 */
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
 *
 * @param {PropsWithChildren} props - React children that require access to language state.
 * @returns {JSX.Element} Provider wrapping the passed children.
 */
export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

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
   *
   * @param {SupportedLanguage} lang - The language code to set.
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
   * Pass replacements to interpolate :placeholder tokens, e.g. translate('validation.required', { attribute: 'email' }).
   *
   * @param {string} key - Translation key path, e.g. `"validation.required"`.
   * @param {TranslationReplacements} [replacements] - Optional placeholder replacements.
   * @returns {string} Resolved and interpolated translation string.
   */
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

/**
 * Convenience hook for consuming the current language context.
 *
 * This hook exposes:
 * - `language`: current language code
 * - `setLanguage`: mutator for updating the language
 * - `translate`: translator function for resolving string keys
 *
 * Throws a descriptive error when used outside of `LanguageProvider`
 * to surface configuration issues early in development.
 *
 * @returns {LanguageContextValue} The current language context value.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return ctx;
}

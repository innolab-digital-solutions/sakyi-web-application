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

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  translate: (key: string, replacements?: TranslationReplacements) => string;
};

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const stored = window.localStorage.getItem('language');

  return stored &&
    SUPPORTED_LANGUAGE_CODES.includes(stored as SupportedLanguage)
    ? (stored as SupportedLanguage)
    : DEFAULT_LANGUAGE;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

/**
 * Provides language state and translation functionality to the React component tree.
 *
 * - Tracks the current language and persists it to localStorage.
 * - Sets the HTML document's language attribute according to the current language.
 * - Supplies a translation function using the current language context.
 *
 * @param {React.PropsWithChildren} props - The children to be wrapped by the language provider.
 * @returns {JSX.Element} The provider component supplying language context to its descendants.
 *
 * Context value:
 *   - language: The currently selected language code.
 *   - setLanguage: Function to update the selected language.
 *   - translate: Function to translate a string key with optional replacements, using the current language.
 *
 * Usage:
 *   Wrap application components in <LanguageProvider> to enable localization and language switching.
 */
export const LanguageProvider = ({ children }: React.PropsWithChildren) => {
  const [language, setLanguage] = React.useState<SupportedLanguage>(() =>
    getInitialLanguage(),
  );

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', language);
    }
  }, [language]);

  /**
   * Translates a key into the current language, with optional string replacement interpolation.
   *
   * @param {string} key - The translation key (dot-separated for nested paths).
   * @param {TranslationReplacements} [replacements] - Optional placeholder replacements.
   * @returns {string} The translated and interpolated string.
   */
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

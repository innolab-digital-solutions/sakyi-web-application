/**
 * Enumeration of all supported language codes in the application.
 * These codes are used for validation, routing, and language selection.
 */
export type SupportedLanguage = 'en' | 'my';

/**
 * Represents a language entry for user interface purposes.
 *
 * - `code`: The supported language code.
 * - `name`: Human-readable label for the language, shown in UI pickers.
 */
export type LanguageEntry = {
  code: SupportedLanguage;
  name: string;
};

export const SUPPORTED_LANGUAGE_CODES = ['en', 'my'] as const;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en' as const;

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en' as const;

export const LANGUAGES: readonly LanguageEntry[] = [
  { code: 'en', name: 'English' },
  { code: 'my', name: 'Myanmar' },
];

import en from './dictionaries/en';
import my from './dictionaries/my';

import type {
  SupportedLanguage,
  TranslationObject,
  Translations,
} from './types';

/**
 * Resolves a dot-separated translation key within a translation object.
 * Traverses nested objects based on the given key, and returns the string value if found;
 * otherwise returns undefined.
 *
 * @param {TranslationObject | undefined} source - The base translation object or undefined.
 * @param {string} key - The translation key, using dot notation for nested values, e.g. "home.title".
 * @returns {string | undefined} The translated string if found, otherwise undefined.
 */
const resolveKey = (
  source: TranslationObject | undefined,
  key: string,
): string | undefined => {
  if (!source) return undefined;

  const segments = key.split('.');

  const result = segments.reduce<unknown>((current, segment) => {
    if (
      current &&
      typeof current === 'object' &&
      segment in (current as TranslationObject)
    ) {
      return (current as TranslationObject)[segment];
    }
    return undefined;
  }, source);

  return typeof result === 'string' ? result : undefined;
};

/**
 * Returns the full dictionary of locale data (en, my). Use when you need
 * raw translation objects; for resolving a single key use `getTranslation(language, key)`.
 *
 * @returns {Translations} All locale dictionaries keyed by language code.
 */
export const getDictionaries = (): Translations => {
  return { en, my };
};

/**
 * Retrieves the current language setting from localStorage if on the client,
 * or returns the English language on the server.
 * Only returns supported languages; falls back to the English language otherwise.
 *
 * @returns {SupportedLanguage} The currently selected language code ('en' or 'my').
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem('language');

  if (stored === 'en' || stored === 'my') {
    return stored;
  }

  return 'en';
};

/**
 * Returns the translation for a given language and key. Single source of truth for lookup:
 * active language first, then English fallback, then the key itself. Use when the language
 * is known (e.g. from React state); use `translate(key)` when language should be read
 * from persistence (e.g. server or non-context usage).
 *
 * @param {SupportedLanguage} language - The language code to translate into.
 * @param {string} key - The translation key, using dot notation (e.g. "public.home.title").
 * @returns {string} The translated string, or the key if not found.
 */
export const getTranslation = (
  language: SupportedLanguage,
  key: string,
): string => {
  const dictionaries = getDictionaries();

  const fromActive = resolveKey(dictionaries[language], key);
  if (fromActive) return fromActive;

  const fromFallback = resolveKey(dictionaries.en, key);
  if (fromFallback) return fromFallback;

  return key;
};

/**
 * Translates a given key using the current language from persistence (localStorage on client,
 * or default on server). For components inside LanguageProvider, prefer the context's
 * translate function so it reacts to language state.
 *
 * @param {string} key - The translation key to look up, using dot notation for hierarchy.
 * @returns {string} The translated string matching the key, or the key itself if no translation is found.
 */
export const translate = (key: string): string => {
  return getTranslation(getCurrentLanguage(), key);
};

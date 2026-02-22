import en from './dictionaries/en';
import my from './dictionaries/my';

import type {
  SupportedLanguage,
  TranslationObject,
  Translations,
  TranslationReplacements,
} from './types';

/**
 * Replaces :placeholder tokens in a string with values from the replacements object.
 * Example: interpolate("The :attribute field is required.", { attribute: "email" }) => "The email field is required."
 * Placeholders not found in replacements are left unchanged.
 */
const interpolate = (
  template: string,
  replacements: TranslationReplacements,
): string => {
  if (Object.keys(replacements).length === 0) return template;

  return template.replace(/:(\w+)/g, (_, name) =>
    name in replacements ? replacements[name]! : `:${name}`,
  );
};

/**
 * Resolves a dot-separated translation key within a translation object.
 * Traverses nested objects based on the given key, and returns the string value if found;
 * otherwise returns undefined.
 *
 * @param source - The base translation object or undefined.
 * @param key - The translation key, using dot notation for nested values, e.g. "home.title".
 * @returns The translated string if found, otherwise undefined.
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
 * @returns All locale dictionaries keyed by language code.
 */
export const getDictionaries = (): Translations => {
  return { en, my };
};

/**
 * Retrieves the current language setting from localStorage if on the client,
 * or returns the English language on the server.
 * Only returns supported languages; falls back to the English language otherwise.
 *
 * @returns The currently selected language code ('en' or 'my').
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
 * Optional replacements interpolate :placeholder tokens in the resolved string,
 * e.g. getTranslation('en', 'validation.required', { attribute: 'email' }) for
 * "The :attribute field is required." → "The email field is required."
 *
 * @param language - The language code to translate into.
 * @param key - The translation key, using dot notation (e.g. "public.home.title").
 * @param replacements - Optional map of placeholder names to values for dynamic interpolation.
 * @returns The translated string (with placeholders replaced if given), or the key if not found.
 */
export const getTranslation = (
  language: SupportedLanguage,
  key: string,
  replacements?: TranslationReplacements,
): string => {
  const dictionaries = getDictionaries();

  let raw =
    resolveKey(dictionaries[language], key) ??
    resolveKey(dictionaries.en, key) ??
    key;

  if (replacements && Object.keys(replacements).length > 0) {
    raw = interpolate(raw, replacements);
  }

  return raw;
};

/**
 * Translates a given key using the current language from persistence (localStorage on client,
 * or default on server). For components inside LanguageProvider, prefer the context's
 * translate function so it reacts to language state.
 *
 * @param key - The translation key to look up, using dot notation for hierarchy.
 * @param replacements - Optional map for :placeholder interpolation in the translated string.
 * @returns The translated string (with placeholders replaced if given), or the key if not found.
 */
export const translate = (
  key: string,
  replacements?: TranslationReplacements,
): string => {
  return getTranslation(getCurrentLanguage(), key, replacements);
};

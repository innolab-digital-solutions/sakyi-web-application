import en from './dictionaries/en';
import my from './dictionaries/my';
import type {
  SupportedLanguage,
  TranslationObject,
  TranslationReplacements,
  Translations,
} from './types';

/**
 * Interpolates placeholder tokens in a translation string with values from the provided replacements object.
 *
 * Replaces all occurrences of `:placeholder` tokens in the template string with values from `replacements`.
 * Placeholders without corresponding values are left unchanged.
 *
 * @param {string} template - The translation string containing `:placeholder` tokens.
 * @param {TranslationReplacements} replacements - An object mapping placeholder names to their replacement values.
 * @returns {string} The interpolated string with all recognized placeholders replaced.
 *
 * @example
 * interpolate("Welcome, :name!", { name: "Alice" }) // => "Welcome, Alice!"
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
 * Recursively resolves a dot-separated translation key within a given translation object.
 *
 * Traverses nested objects by splitting the key with `.`.
 * Returns the corresponding string value if found; otherwise, returns undefined.
 *
 * @param {TranslationObject | undefined} source - The root translation object to search.
 * @param {string} key - The dot notation key, e.g. `"errors.required"`.
 * @returns {string | undefined} The resolved translation string if found, otherwise undefined.
 *
 * @example
 * resolveKey({ errors: { required: "Required field" } }, "errors.required") // => "Required field"
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
 * Returns all available locale dictionaries indexed by language code.
 *
 * Use this when the raw translation data is needed (e.g., for custom utilities or testing).
 * For key lookups, prefer `getTranslation`.
 *
 * @returns {Translations} All dictionaries keyed by supported language codes.
 */
export const getDictionaries = (): Translations => {
  return { en, my };
};

/**
 * Returns the current language selection.
 *
 * Reads the user's preferred language from localStorage if running on the client,
 * defaulting to English (`'en'`) if not found or if running on the server.
 * Only values matching supported languages will be returned.
 *
 * @returns {SupportedLanguage} The currently selected language code.
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
 * Resolves and returns a translation string for a specified language and key, using English as a fallback.
 *
 * Searches the target language dictionary first, then falls back to English. If neither is found, returns the key itself.
 * Supports string interpolation via :placeholder tokens when replacements are provided.
 *
 * @param {SupportedLanguage} language - The desired language code ('en' | 'my').
 * @param {string} key - The translation key, using dot notation for nested paths (e.g. "validation.required").
 * @param {TranslationReplacements} [replacements] - Optional placeholder values for interpolation.
 * @returns {string} The localized and interpolated translation, or the key if no translation is found.
 *
 * @example
 * getTranslation('en', 'greeting.hello', { name: 'John' })
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
 * Returns the translation string for the current language and key from persistence or environment.
 *
 * This utility reads the active language automatically (from localStorage on the client,
 * or defaults on the server/build). For dynamic React usage inside a LanguageProvider context,
 * prefer the provided `translate` function for reactivity.
 *
 * Supports :placeholder string interpolation via replacements.
 *
 * @param {string} key - The translation key, using dot notation for hierarchy.
 * @param {TranslationReplacements} [replacements] - Optional values for :placeholder interpolation.
 * @returns {string} The translated string (with interpolation if replacements provided), or the key if not found.
 */
export const translate = (
  key: string,
  replacements?: TranslationReplacements,
): string => {
  return getTranslation(getCurrentLanguage(), key, replacements);
};

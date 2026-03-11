import type { SupportedLanguage } from '@/config/languages';

/**
 * All supported language codes used for localization, re-exported from configuration.
 * Use this type when referencing a valid language key anywhere in localization context.
 */
export type { SupportedLanguage };

/**
 * Represents a single dictionary of translation keys and values (with support for nested namespaces).
 *
 * - Keys are string paths (dot-separated for nested objects).
 * - Values can be either a translated string or another TranslationObject (for nested translation structure).
 *
 * @example
 * {
 *   greeting: {
 *     hello: "Hello",
 *     welcome: "Welcome, :name!"
 *   },
 *   error: {
 *     notFound: "Not found"
 *   }
 * }
 */
export type TranslationObject = {
  [key: string]: string | TranslationObject;
};

/**
 * Top-level index of all app dictionaries, keyed by language code.
 *
 * @example
 * {
 *   en: { ... },
 *   my: { ... }
 * }
 */
export type Translations = Record<SupportedLanguage, TranslationObject>;

/**
 * Placeholder values for interpolation in translation strings.
 *
 * @example
 *   key: "greeting.welcome"
 *   translation: "Welcome, :name!"
 *   replacements: { name: "Alice" }
 */
export type TranslationReplacements = Record<string, string>;

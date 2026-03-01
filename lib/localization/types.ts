/**
 * Supported language codes for localization.
 * Extend this union to support additional languages.
 *
 * @example 'en' | 'my'
 */
export type SupportedLanguage = 'en' | 'my';

/**
 * Represents a recursive structure for translation keys and their values.
 *
 * Allows for both flat and nested translation objects.
 *
 * @example
 * {
 *   "greeting": "Hello",
 *   "messages": {
 *     "welcome": "Welcome!",
 *     "bye": {
 *       "formal": "Goodbye!",
 *       "informal": "See ya!"
 *     }
 *   }
 * }
 */
export type TranslationObject = {
  [key: string]: string | TranslationObject;
};

/**
 * Maps each supported language to its corresponding translation object.
 *
 * Used as the top-level container for all translations in the app.
 * Keys correspond to language codes, values to the translation trees.
 *
 * @example
 * {
 *   "en": {
 *     "greeting": "Hello",
 *     "messages": {
 *       "welcome": "Welcome!",
 *       "bye": {
 *         "formal": "Goodbye!",
 *         "informal": "See ya!"
 *       }
 *     }
 *   },
 * }
 */
export type Translations = Record<SupportedLanguage, TranslationObject>;

/**
 * Replacement variables for dynamic translation strings.
 *
 * Used for string interpolation, e.g. `{ name: 'John' }` in `"Hello, :name"`.
 */
export type TranslationReplacements = Record<string, string>;

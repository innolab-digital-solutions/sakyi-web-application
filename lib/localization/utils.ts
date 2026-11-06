import { TranslationObject, TranslationReplacements } from './types';

/**
 * Replaces placeholders in a template string with provided replacement values.
 *
 * Placeholders are denoted as `:key` within the template string. Each occurrence
 * of a placeholder will be replaced with the corresponding value from the replacements object.
 * If a replacement for a placeholder is not provided, the original placeholder is preserved.
 *
 * @param {string} template - The template string containing `:key` placeholders.
 * @param {TranslationReplacements} replacements - A mapping of placeholder names to their replacement values.
 * @returns {string} The interpolated string with replacements applied.
 *
 * @example
 * interpolate("Hello, :name!", { name: "Alice" }) // "Hello, Alice!"
 * interpolate("Welcome, :user! Today is :day.", { user: "Bob" }) // "Welcome, Bob! Today is :day." (if 'day' not provided)
 */
export const interpolate = (
  template: string,
  replacements: TranslationReplacements,
): string => {
  if (Object.keys(replacements).length === 0) return template;

  return template.replace(/:(\w+)/g, (_, name) =>
    name in replacements ? replacements[name]! : `:${name}`,
  );
};

/**
 * Resolves a translation value from a potentially nested TranslationObject using a dot-separated key path.
 *
 * Traverses the given source object by splitting the key into path segments and descending each segment.
 * Returns the located string value if found and is a string, or undefined otherwise.
 *
 * @param {TranslationObject | undefined} source - The root translation object to search within.
 * @param {string} key - Dot-separated key path used to locate a nested translation value (e.g., "greeting.welcome").
 * @returns {string | undefined} The resolved translation string if found, or undefined if not present or not a string.
 *
 * @example
 * resolveKey(source, "greeting.welcome"); // "Hello!"
 * resolveKey(source, "greeting.unknown"); // undefined
 * resolveKey(undefined, "any.key"); // undefined
 */
export const resolveKey = (
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

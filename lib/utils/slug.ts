/**
 * Converts a string to a URL-friendly slug.
 *
 * Normalizes the input by removing accents/diacritics, converting to lowercase,
 * replacing non-alphanumeric characters with hyphens, and trimming leading/trailing hyphens.
 *
 * Example: slugify("Hello, World!") → "hello-world"
 *
 * @param {string} value - The string to be slugified.
 * @returns {string} The URL-friendly slug, or an empty string if input is falsy.
 */
export const slugify = (value: string): string => {
  if (!value) {
    return '';
  }

  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extracts and returns uppercase initials from a string value.
 *
 * - Trims whitespace from the input.
 * - Splits the value into words by whitespace, takes the first character of each word,
 *   and joins these characters.
 * - The result is limited to a maximum length (default: 2).
 * - Returns an empty string if input is blank or only whitespace.
 *
 * Example: getInitials("Jane Doe") → "JD"
 *
 * @param {string} value - The string to extract initials from.
 * @param {number} [maxLength=2] - Maximum number of initials to return (minimum 1).
 * @returns {string} Uppercase initials, up to maxLength, or empty string if no valid characters.
 */
export function getInitials(value: string, maxLength: number = 2): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const initials = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0] ?? '')
    .join('');

  return initials.slice(0, Math.max(1, maxLength)).toUpperCase();
}

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

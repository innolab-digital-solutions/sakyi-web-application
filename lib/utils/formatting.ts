/**
 * Converts a URL slug to a human-readable title by splitting on hyphens
 * and capitalizing the first letter of each word.
 *
 * @param {string} slug - Hyphen-separated URL slug (e.g. "weight-management-program").
 * @returns {string} Title-cased string (e.g. "Weight Management Program").
 */
export const formatSlugAsTitle = (slug: string): string => {
  return slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

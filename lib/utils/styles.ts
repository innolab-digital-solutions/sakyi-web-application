import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges and deduplicates Tailwind CSS class names
 *
 * Combines multiple class values using clsx and resolves Tailwind
 * class conflicts with tailwind-merge. Later classes override earlier
 * ones when conflicts occur (e.g., `cn('px-4', 'px-6')` returns `'px-6'`).
 *
 * @param {ClassValue[]} inputs - Class values to merge (strings, objects, arrays)
 * @returns {string} Merged and deduplicated class string
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

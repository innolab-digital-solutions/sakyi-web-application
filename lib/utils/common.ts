import { type ClassValue,clsx } from 'clsx';
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

/**
 * Smoothly scrolls the document to the vertical position of a target element, with an optional offset.
 *
 * This utility locates the first element matching the given `elementId`, computes its vertical position
 * relative to the viewport and current scroll, and scrolls the window smoothly so that the element
 * appears at the top of the viewport minus the specified offset.
 *
 * Use a positive offset to account for fixed headers or reserved space at the top of the page.
 *
 * @param {string} elementId - The id of the element to scroll to.
 * @param {number} [offset=0] - Optional number of pixels to offset from the top after scrolling. Defaults to 0.
 */
export const smoothScrollTo = (elementId: string, offset: number = 0): void => {
  const element = document.querySelector<HTMLElement>(`#${elementId}`);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

/**
 * Computes the visible page numbers for a pagination component, given the current page,
 * the last page, and the maximum number of buttons to display.
 *
 * @param {number} currentPage - The currently selected page (1-based).
 * @param {number} lastPage - The total number of pages (must be >= 1).
 * @param {number} [maxButtons=5] - The maximum number of pagination buttons to display.
 * @returns {number[]} An array of visible page numbers in ascending order to render in the pagination UI.
 *
 * If the last page is less than or equal to `maxButtons`, all pages are shown starting from 1.
 * Otherwise, the computation centers around the current page and ensures the length
 * does not exceed `maxButtons`.
 *
 * Constraints:
 * - The returned numbers are always between 1 and `lastPage` (inclusive).
 * - Always returns at least one page number.
 */
export const getVisiblePageNumbers = (
  currentPage: number,
  lastPage: number,
  maxButtons = 5,
): number[] => {
  if (lastPage < 1) return [1];
  const safeLast = Math.max(1, lastPage);
  const current = Math.min(Math.max(1, currentPage), safeLast);

  if (safeLast <= maxButtons) {
    return Array.from({ length: safeLast }, (_, i) => i + 1);
  }

  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(safeLast, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
};

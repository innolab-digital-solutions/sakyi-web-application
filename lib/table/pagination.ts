/**
 * Builds a compact list of page numbers to show in the pagination control
 * (current window with first/last when needed).
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


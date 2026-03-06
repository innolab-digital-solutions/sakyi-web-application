import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import type { TablePagination as TablePaginationType } from '@/hooks/table/types';

type TablePaginationProps = {
  pagination: TablePaginationType<unknown>;
  /**
   * Current page index controlled by the table hook.
   * This is derived from URL/query state rather than the API meta to avoid
   * any off-by-one or desync issues between client state and backend payloads.
   */
  currentPage: number;
  /**
   * Optional callback to request a different page.
   * The parent component (e.g. table module) is responsible for
   * updating query params / re-fetching data.
   */
  onPageChange?: (page: number) => void;
};

type PageItem = number | 'ellipsis';

const createPageItems = (current: number, total: number): PageItem[] => {
  const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 1;

  if (safeTotal <= 7) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [];
  const firstPage = 1;
  const lastPage = safeTotal;
  const windowSize = 1; // number of pages to show on each side of current

  const start = Math.max(firstPage + 1, current - windowSize);
  const end = Math.min(lastPage - 1, current + windowSize);

  pages.push(firstPage);

  if (start > firstPage + 1) {
    pages.push('ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < lastPage - 1) {
    pages.push('ellipsis');
  }

  pages.push(lastPage);

  return pages;
};

const TablePagination = ({
  pagination,
  currentPage,
  onPageChange,
}: TablePaginationProps) => {
  const { last_page, total, per_page } = pagination;

  const derivedLastPage =
    last_page && Number.isFinite(last_page)
      ? Number(last_page)
      : total && per_page
        ? Math.max(1, Math.ceil(total / per_page))
        : 1;

  const lastPage = derivedLastPage;

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), lastPage || 1);

  const pageItems = createPageItems(safeCurrentPage, lastPage);

  const handleChange = (page: number) => {
    if (!onPageChange || page === safeCurrentPage) return;
    onPageChange(page);
  };

  const canGoPrev = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < lastPage;

  return (
    <Pagination className='order-1 w-auto sm:order-2'>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant='ghost'
            size='sm'
            className='gap-1 px-2.5 sm:pl-2.5'
            disabled={!canGoPrev}
            onClick={() => {
              if (canGoPrev) {
                handleChange(currentPage - 1);
              }
            }}
          >
            <ChevronLeftIcon className='size-4' />
            <span className='hidden sm:inline'>Previous</span>
          </Button>
        </PaginationItem>

        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <span className='text-muted-foreground flex h-9 w-9 items-center justify-center'>
                ...
              </span>
            </PaginationItem>
          ) : (
            <PaginationItem key={`page-${item}`}>
              <Button
                variant={item === safeCurrentPage ? 'default' : 'ghost'}
                size='sm'
                onClick={() => handleChange(item)}
              >
                {item}
              </Button>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <Button
            variant='ghost'
            size='sm'
            className='gap-1 px-2.5 sm:pr-2.5'
            disabled={!canGoNext}
            onClick={() => {
              if (canGoNext) {
                handleChange(currentPage + 1);
              }
            }}
          >
            <span className='hidden sm:inline'>Next</span>
            <ChevronRightIcon className='size-4' />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;

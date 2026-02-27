import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { TablePagination as TablePaginationType } from '@/hooks/table/type';

type TablePaginationProps = {
  pagination: TablePaginationType<unknown>;
  /**
   * Optional callback to request a different page.
   * The parent component (e.g. table module) is responsible for
   * updating query params / re-fetching data.
   */
  onPageChange?: (page: number) => void;
};

type PageItem = number | 'ellipsis';

const createPageItems = (current: number, total: number): PageItem[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [];
  const firstPage = 1;
  const lastPage = total;
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
  onPageChange,
}: TablePaginationProps) => {
  const { current_page: currentPage, last_page: lastPage } = pagination;

  // Do not render pagination controls if there is only one page.
  if (lastPage <= 1) {
    return null;
  }

  const pageItems = createPageItems(currentPage, lastPage);

  const handleChange = (page: number) => {
    if (!onPageChange || page === currentPage) return;
    onPageChange(page);
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < lastPage;

  return (
    <Pagination className='order-1 w-auto sm:order-2'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            onClick={(event) => {
              event.preventDefault();
              if (canGoPrev) {
                handleChange(currentPage - 1);
              }
            }}
            className={!canGoPrev ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href='#'
                isActive={item === currentPage}
                onClick={(event) => {
                  event.preventDefault();
                  handleChange(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href='#'
            onClick={(event) => {
              event.preventDefault();
              if (canGoNext) {
                handleChange(currentPage + 1);
              }
            }}
            className={!canGoNext ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;

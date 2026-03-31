'use client';

import { useMemo, useState } from 'react';

import TextField from '@/components/shared/form/TextField';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TableControls } from '@/lib/table';
import { getVisiblePageNumbers } from '@/lib/table';
import { cn } from '@/lib/utils/styles';

const ROWS_PER_PAGE_OPTIONS = [10, 15, 25, 50, 100] as const;

const ROWS_PER_PAGE_NUMBERS: readonly number[] = ROWS_PER_PAGE_OPTIONS;

function rowsPerPageSelectOptions(current: number): number[] {
  const base = [...ROWS_PER_PAGE_NUMBERS];
  if (!ROWS_PER_PAGE_NUMBERS.includes(current)) {
    base.push(current);
    base.sort((a, b) => a - b);
  }
  return base;
}

export type TableListShellProps<TItem = unknown> = {
  children: React.ReactNode;
  /**
   * When provided, search, rows-per-page, and pagination are wired to `useTable` controls.
   * When omitted, search and rows-per-page use local state so the shell stays interactive
   * (e.g. legacy tables that do not call `useTable` yet).
   */
  controls?: TableControls<TItem>;
  searchPlaceholder?: string;
  /** Rendered to the right of the search box (e.g. filter controls). */
  filters?: React.ReactNode;
  className?: string;
};

const TableListShell = <TItem,>({
  children,
  controls,
  searchPlaceholder = 'Search ...',
  filters,
  className,
}: TableListShellProps<TItem>) => {
  const [localSearch, setLocalSearch] = useState('');
  const [localPerPage, setLocalPerPage] = useState<number>(
    ROWS_PER_PAGE_OPTIONS[1],
  );

  const searchEnabled = controls ? controls.search != null : true;
  const searchValue = controls?.search ? controls.search.value : localSearch;
  const handleSearchChange = (value: string) => {
    if (controls?.search) {
      controls.search.onChange(value);
    } else {
      setLocalSearch(value);
    }
  };

  const paginationEnabled = controls ? controls.pagination != null : true;
  const pagination = controls?.pagination;
  const perPageValue = pagination ? pagination.perPage : localPerPage;
  const handlePerPageChange = (n: number) => {
    if (pagination) {
      pagination.onPerPageChange(n);
    } else {
      setLocalPerPage(n);
    }
  };

  const perPageSelectOptions = useMemo(
    () => rowsPerPageSelectOptions(perPageValue),
    [perPageValue],
  );

  const meta = pagination?.meta;
  const currentPage = pagination?.page ?? 1;
  const lastPage = Math.max(1, meta?.last_page ?? 1);
  const total = meta?.total ?? 0;
  const from = meta?.from ?? null;
  const to = meta?.to ?? null;
  const hasResults = total > 0;

  const canPrev = currentPage > 1;
  const canNext =
    meta != null
      ? currentPage < lastPage || meta.has_more_pages === true
      : false;

  const pageNumbers = getVisiblePageNumbers(currentPage, lastPage, 5);

  const searchBusy =
    controls?.query.isFetching === true ||
    controls?.search?.isDebouncing === true;

  return (
    <div
      className={cn(
        'border-border bg-card max-w-full min-w-0 space-y-5 rounded-md border p-6 shadow',
        className,
      )}
    >
      {searchEnabled || filters ? (
        <div className='flex items-center justify-between gap-3'>
          {searchEnabled ? (
            <TextField
              type='search'
              placeholder={searchPlaceholder}
              className='bg-background h-11! w-full max-w-xs rounded-md text-[13px]!'
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-busy={searchBusy}
            />
          ) : null}
          {filters ? (
            <div className='flex items-center gap-2'>{filters}</div>
          ) : null}
        </div>
      ) : null}
      <div className='border-border bg-card min-w-0 overflow-hidden rounded-lg border shadow-xs'>
        <div className='min-w-0 overflow-x-auto'>{children}</div>
      </div>

      <div
        className={cn(
          'border-border flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between',
        )}
      >
        {paginationEnabled ? (
          <>
            <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
              <div className='flex items-center gap-2.5'>
                <span className='text-foreground/80 text-[13px] font-medium whitespace-nowrap'>
                  Rows per page
                </span>
                <Select
                  value={String(perPageValue)}
                  onValueChange={(v) => handlePerPageChange(Number(v))}
                >
                  <SelectTrigger
                    size='sm'
                    className='border-border bg-background h-9! w-17 shadow-none'
                    aria-label='Rows per page'
                  >
                    <SelectValue placeholder='Per page' />
                  </SelectTrigger>
                  <SelectContent position='popper' sideOffset={4}>
                    {perPageSelectOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasResults ? (
              <>
                <div className='text-foreground/80 text-[13px] font-medium whitespace-nowrap'>
                  Showing {from} to {to} of {total} results
                </div>

                {pagination ? (
                  <Pagination className='mx-0 w-full justify-end sm:w-auto'>
                    <PaginationContent className='flex-wrap'>
                      <PaginationItem>
                        <PaginationPrevious
                          href='#'
                          className={cn(
                            !canPrev && 'pointer-events-none opacity-40',
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!canPrev) return;
                            pagination.onPageChange(currentPage - 1);
                          }}
                        />
                      </PaginationItem>

                      {pageNumbers.map((n) => (
                        <PaginationItem key={n}>
                          <PaginationLink
                            href='#'
                            size='default'
                            isActive={n === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              pagination.onPageChange(n);
                            }}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href='#'
                          className={cn(
                            !canNext && 'pointer-events-none opacity-40',
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!canNext) return;
                            pagination.onPageChange(currentPage + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                ) : (
                  <div className='text-muted-foreground text-xs'>
                    Pagination (connect useTable)
                  </div>
                )}
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TableListShell;

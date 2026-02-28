import { PropsWithChildren, ReactNode } from 'react';

import RowsPerPageSelect from '@/components/shared/table/RowsPerPageSelect';
import TableDataSearchBox from '@/components/shared/table/TableDataSearchBox';
import TableEmptyState from '@/components/shared/table/TableEmptyState';
import TablePagination from '@/components/shared/table/TablePagination';
import type { TablePagination as TablePaginationType } from '@/hooks/table/type';

type TableLayoutProps = {
  isLoading?: boolean;
  filters: ReactNode;
  pagination: TablePaginationType<unknown> | null;
  page: number;
  perPage: number;
  search: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange: (search: string) => void;
};

const TableLayout = ({
  children,
  filters,
  pagination,
  page,
  perPage,
  search,
  onPageChange,
  onPerPageChange,
  onSearchChange,
}: PropsWithChildren<TableLayoutProps>) => {
  return (
    <div className='border-border max-w-full rounded-md border bg-white'>
      {/* Responsive Header */}
      <div className='border-border flex flex-col border-b px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
        <TableDataSearchBox value={search} onChange={onSearchChange} />

        {/* Filters and Tabs - responsive across mobile, tablet, desktop */}
        <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4'>
          {filters ? filters : null}
        </div>
      </div>

      {/* Table  */}
      <div className='overflow-x-auto'>{children}</div>

      {pagination && pagination.total === 0 && (
        <div>
          <TableEmptyState />
        </div>
      )}

      {/* Table Footer  */}
      {pagination ? (
        <div className='border-border flex flex-col border-t px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
          <RowsPerPageSelect
            value={perPage}
            onChange={(next) => {
              onPerPageChange(next);
              // Reset to first page when page size changes.
              if (page !== 1) {
                onPageChange(1);
              }
            }}
          />

          <TablePagination
            pagination={pagination}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </div>
  );
};

export default TableLayout;

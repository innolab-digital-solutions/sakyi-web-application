import { PropsWithChildren, ReactNode } from 'react';

import RowsPerPageSelect from '@/components/shared/table/RowsPerPageSelect';
import TableDataSearchBox from '@/components/shared/table/TableDataSearchBox';
import TablePagination from '@/components/shared/table/TablePagination';
import type { TablePagination as TablePaginationType } from '@/hooks/table/type';

type TableLayoutProps = {
  isLoading?: boolean;
  filters: ReactNode;
  pagination: TablePaginationType<unknown> | null;
};

const TableLayout = ({
  children,
  filters,
  pagination,
}: PropsWithChildren<TableLayoutProps>) => {
  return (
    <div className='border-border max-w-full rounded-md border bg-white'>
      {/* Responsive Header */}
      <div className='border-border flex flex-col border-b px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
        <TableDataSearchBox />

        {/* Filters and Tabs - responsive across mobile, tablet, desktop */}
        <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4'>
          {filters ? filters : null}
        </div>
      </div>

      {/* Table  */}
      <div className='overflow-x-auto'>{children}</div>

      {/* Table Footer  */}
      {pagination ? (
        <div className='border-border flex flex-col border-t px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
          <RowsPerPageSelect />

          <TablePagination />
        </div>
      ) : null}
    </div>
  );
};

export default TableLayout;

import { PropsWithChildren, ReactNode } from 'react';

import RowsPerPageSelect from '@/components/shared/table/RowsPerPageSelect';
import TableDataSearchBox from '@/components/shared/table/TableDataSearchBox';
import TableEmptyState from '@/components/shared/table/TableEmptyState';
import TablePagination from '@/components/shared/table/TablePagination';
import type { TableControls } from '@/hooks/table/types';

type TableLayoutProps = {
  filters: ReactNode;
  controls: TableControls;
};

const TableLayout = ({
  children,
  filters,
  controls,
}: PropsWithChildren<TableLayoutProps>) => {
  const { search, perPage, pagination: paginationControls } = controls;
  const meta = paginationControls.meta;

  return (
    <div className='border-border max-w-full rounded-md border bg-white'>
      <div className='border-border flex flex-col border-b px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
        <TableDataSearchBox value={search.value} onChange={search.onChange} />

        <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4'>
          {filters ? filters : null}
        </div>
      </div>

      <div className='overflow-x-auto'>{children}</div>

      {meta && meta.total === 0 && (
        <div>
          <TableEmptyState />
        </div>
      )}

      {meta ? (
        <div className='border-border flex flex-col border-t px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
          <RowsPerPageSelect
            value={perPage.value}
            onChange={(next) => {
              perPage.onChange(next);
              if (paginationControls.page !== 1) {
                paginationControls.onPageChange(1);
              }
            }}
          />

          <TablePagination
            pagination={meta}
            currentPage={paginationControls.page}
            onPageChange={paginationControls.onPageChange}
          />
        </div>
      ) : null}
    </div>
  );
};

export default TableLayout;

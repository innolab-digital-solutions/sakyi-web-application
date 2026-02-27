import { ChevronDown, ListFilter } from 'lucide-react';
import { PropsWithChildren } from 'react';

import LanguageTabs from '@/components/admin/control/table/LanguageTabs';
import RowsPerPageSelect from '@/components/admin/control/table/RowsPerPageSelect';
import TableDataSearchBox from '@/components/admin/control/table/TableDataSearchBox';
import TablePagination from '@/components/admin/control/table/TablePagination';
import { Button } from '@/components/ui/button';

const TableContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className='border-border rounded-md border bg-white'>
      {/* Responsive Header */}
      <div className='border-border flex flex-col border-b px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
        <TableDataSearchBox />

        {/* Filters and Tabs - responsive across mobile, tablet, desktop */}
        <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4'>
          {/* Filters */}
          <div className='shrink-0'>
            <Button
              variant='outline'
              className='text-foreground/80 bg-background h-10 rounded-md px-3 font-semibold sm:px-4'
            >
              <ListFilter className='h-4 w-4' />
              <span className='xs:inline hidden'>Filters</span>
              <ChevronDown className='hidden h-4 w-4 sm:inline' />
            </Button>
          </div>

          {/* Tab */}
          <LanguageTabs />
        </div>
      </div>

      {/* Table  */}
      {children}

      {/* Table Footer  */}
      <div className='border-border flex flex-col border-t px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-5'>
        <RowsPerPageSelect />

        <TablePagination />
      </div>
    </div>
  );
};

export default TableContainer;

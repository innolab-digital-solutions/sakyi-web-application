import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

const TableDataSearchBox = () => {
  return (
    <div className='relative w-full max-w-xs'>
      <span className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
        <Search className='h-4 w-4' aria-hidden='true' />
      </span>
      <Input
        type='search'
        placeholder='Search...'
        className='border-border bg-background h-10 w-full rounded-md border pl-10 font-medium'
      />
    </div>
  );
};

export default TableDataSearchBox;

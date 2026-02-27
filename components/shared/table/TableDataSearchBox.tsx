import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

type TableDataSearchBoxProps = {
  /**
   * Current search query.
   */
  value: string;
  /**
   * Called when the debounced search query changes.
   */
  onChange: (value: string) => void;
  /**
   * Optional debounce delay in milliseconds.
   */
  debounceMs?: number;
};

const TableDataSearchBox = ({
  value,
  onChange,
  debounceMs = 300,
}: TableDataSearchBoxProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      onChange(inputValue.trim());
    }, debounceMs);

    return () => window.clearTimeout(handle);
  }, [inputValue, debounceMs, onChange]);

  return (
    <div className='relative w-full max-w-xs'>
      <span className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
        <Search className='h-4 w-4' aria-hidden='true' />
      </span>
      <Input
        type='search'
        placeholder='Search...'
        className='border-border bg-background h-10 w-full rounded-md border pl-10 font-medium'
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
      />
    </div>
  );
};

export default TableDataSearchBox;

import TextField from '@/components/shared/form/TextField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Page-size choices for the table footer; capped at 100 rows per page. */
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

const TableListWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='border-border bg-card max-w-full min-w-0 space-y-5 rounded-md border p-6 shadow'>
      <div>
        <TextField
          type='search'
          placeholder='Search ...'
          className='bg-background h-11! w-full max-w-xs rounded-md text-[13px]!'
        />
      </div>
      <div className='border-border bg-card min-w-0 overflow-hidden rounded-lg border shadow-xs'>
        <div className='min-w-0 overflow-x-auto'>{children}</div>
      </div>

      {/* Static pagination mock (not interactive) */}
      <div
        className='border-border pointer-events-none flex flex-col gap-4 border-t pt-4 select-none sm:flex-row sm:items-center sm:justify-between'
        aria-hidden
      >
        <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
          <div className='flex items-center gap-2.5'>
            <span className='text-foreground text-xs font-medium whitespace-nowrap'>
              Rows per page
            </span>
            <Select value='10'>
              <SelectTrigger
                size='sm'
                className='border-border bg-background h-9 w-17 opacity-100 shadow-none'
                aria-label='Rows per page (demo)'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className='text-muted-foreground text-xs tabular-nums'>
            1–8 of 8
          </span>
        </div>
      </div>
    </div>
  );
};

export default TableListWrapper;

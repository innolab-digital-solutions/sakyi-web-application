'use client';

import {
  ChevronDownIcon,
  Columns3Icon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EnrollmentLifecycleStatus } from '@/domains/enrollment-records/types/admin';
import { ENROLLMENT_LIFECYCLE_STATUSES } from '@/domains/enrollment-records/types/admin';

const STATUS_LABEL: Record<EnrollmentLifecycleStatus, string> = {
  scheduled: 'Scheduled',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export type EnrollmentRecordStatusFilter = 'all' | EnrollmentLifecycleStatus;

export type EnrollmentRecordColumnOption = {
  key: string;
  label: string;
};

type EnrollmentRecordFiltersProps = {
  statusFilter: EnrollmentRecordStatusFilter;
  onClearStatus: () => void;
  onSetStatus: (status: EnrollmentLifecycleStatus) => void;
  columns: readonly EnrollmentRecordColumnOption[];
  visibleColumnKeys: readonly string[];
  onToggleColumn: (columnKey: string) => void;
  onResetColumns: () => void;
};

export default function EnrollmentRecordFilters({
  statusFilter,
  onClearStatus,
  onSetStatus,
  columns,
  visibleColumnKeys,
  onToggleColumn,
  onResetColumns,
}: EnrollmentRecordFiltersProps) {
  const visibleColumnSet = new Set(visibleColumnKeys);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
          >
            <SlidersHorizontalIcon className='size-4 opacity-80' />
            <span>
              Status:{' '}
              {statusFilter === 'all' ? 'All' : STATUS_LABEL[statusFilter]}
            </span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem className='cursor-pointer' onClick={onClearStatus}>
            All statuses
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {ENROLLMENT_LIFECYCLE_STATUSES.map((status) => (
            <DropdownMenuItem
              key={status}
              className='cursor-pointer'
              onClick={() => onSetStatus(status)}
            >
              {STATUS_LABEL[status]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
          >
            <Columns3Icon className='size-4 opacity-80' />
            <span>Columns</span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-56'>
          <DropdownMenuLabel className='text-foreground/80 px-2 py-1 text-[13px] font-semibold tracking-wide'>
            Column Visibility
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                className='cursor-pointer'
                checked={visibleColumnSet.has(column.key)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => onToggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant='destructive'
            className='cursor-pointer font-semibold'
            onClick={onResetColumns}
          >
            <RotateCcwIcon className='size-4' />
            Reset columns
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

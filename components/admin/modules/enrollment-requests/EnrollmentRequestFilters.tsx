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
import type { EnrollmentRequestStatus } from '@/domains/enrollment-requests/types';

type EnrollmentColumnOption = {
  key: string;
  label: string;
};

type EnrollmentRequestFiltersProps = {
  statusFilter: 'all' | EnrollmentRequestStatus;
  statuses: readonly EnrollmentRequestStatus[];
  labels: Record<EnrollmentRequestStatus, string>;
  onClearStatus: () => void;
  onSetStatus: (status: EnrollmentRequestStatus) => void;
  columns: readonly EnrollmentColumnOption[];
  visibleColumnKeys: readonly string[];
  onToggleColumn: (columnKey: string) => void;
  onResetColumns: () => void;
};

export default function EnrollmentRequestFilters({
  statusFilter,
  statuses,
  labels,
  onClearStatus,
  onSetStatus,
  columns,
  visibleColumnKeys,
  onToggleColumn,
  onResetColumns,
}: EnrollmentRequestFiltersProps) {
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
              Status: {statusFilter === 'all' ? 'All' : labels[statusFilter]}
            </span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem className='cursor-pointer' onClick={onClearStatus}>
            All statuses
          </DropdownMenuItem>
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status}
              className='cursor-pointer'
              onClick={() => onSetStatus(status)}
            >
              {labels[status]}
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
          <DropdownMenuLabel className='text-foreground/80 px-2 py-1 text-xs font-semibold tracking-wide'>
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

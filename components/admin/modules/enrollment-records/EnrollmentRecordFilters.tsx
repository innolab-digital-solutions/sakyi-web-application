'use client';

import { ChevronDownIcon, SlidersHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type EnrollmentRecordFiltersProps = {
  statusFilter: EnrollmentRecordStatusFilter;
  onClearStatus: () => void;
  onSetStatus: (status: EnrollmentLifecycleStatus) => void;
};

export default function EnrollmentRecordFilters({
  statusFilter,
  onClearStatus,
  onSetStatus,
}: EnrollmentRecordFiltersProps) {
  return (
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
  );
}

export { STATUS_LABEL as ENROLLMENT_RECORD_STATUS_LABEL };

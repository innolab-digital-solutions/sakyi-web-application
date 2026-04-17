'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EnrollmentRequestStatus } from '@/domains/enrollment-requests/types';

type EnrollmentFiltersProps = {
  statusFilter: 'all' | EnrollmentRequestStatus;
  statuses: readonly EnrollmentRequestStatus[];
  labels: Record<EnrollmentRequestStatus, string>;
  onClearStatus: () => void;
  onSetStatus: (status: EnrollmentRequestStatus) => void;
};

export default function EnrollmentFilters({
  statusFilter,
  statuses,
  labels,
  onClearStatus,
  onSetStatus,
}: EnrollmentFiltersProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='h-10 cursor-pointer'>
          Status: {statusFilter === 'all' ? 'All' : labels[statusFilter]}
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
  );
}

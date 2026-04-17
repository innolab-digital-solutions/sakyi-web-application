'use client';

import { FileSignatureIcon } from 'lucide-react';
import { useMemo } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ENDPOINTS } from '@/config/api/endpoints';
import type {
  EnrollmentContract,
  EnrollmentContractStatus,
} from '@/domains/enrollment-contracts/types';
import { useTable } from '@/lib/table';

const STATUS_LABEL: Record<EnrollmentContractStatus, string> = {
  assigned: 'Assigned',
  signed: 'Signed',
};

const CONTRACT_STATUSES: readonly EnrollmentContractStatus[] = [
  'assigned',
  'signed',
];

function statusBadgeVariant(
  status: EnrollmentContractStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'signed') return 'default';
  if (status === 'assigned') return 'secondary';
  return 'outline';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString();
}

export default function EnrollmentContractListTable() {
  const { rows, controls } = useTable<EnrollmentContract>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );

  const statusFilter = useMemo(() => {
    const value = controls.params.values.status;
    if (value === 'assigned') return 'assigned';
    if (value === 'signed') return 'signed';
    return 'all';
  }, [controls.params.values.status]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load enrollment contracts.';

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search by client name, email, signer, or request id...'
      filters={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-10 cursor-pointer'>
              Status:{' '}
              {statusFilter === 'all' ? 'All' : STATUS_LABEL[statusFilter]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              className='cursor-pointer'
              onClick={() => controls.params.clear(['status'])}
            >
              All statuses
            </DropdownMenuItem>
            {CONTRACT_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                className='cursor-pointer'
                onClick={() => controls.params.set({ status })}
              >
                {STATUS_LABEL[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <Table className='min-w-210 table-fixed'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead className='w-[9%]'>ID</TableHead>
            <TableHead className='w-[18%]'>Client</TableHead>
            <TableHead className='w-[18%]'>Signer</TableHead>
            <TableHead className='w-[15%]'>Enrollment Request</TableHead>
            <TableHead className='w-[12%]'>Terms</TableHead>
            <TableHead className='w-[12%]'>Sent At</TableHead>
            <TableHead className='w-[12%]'>Signed At</TableHead>
            <TableHead className='w-[14%]'>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton &&
            Array.from({ length: 3 }).map((_, row) => (
              <TableRow key={`skeleton-${row}`}>
                {Array.from({ length: 8 }).map((__, col) => (
                  <TableCell key={col} className='py-3'>
                    <Skeleton className='h-8 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!showSkeleton && query.isError && (
            <TableRow>
              <TableCell
                colSpan={8}
                className='text-destructive py-8 text-center text-sm'
              >
                {errorMessage}
              </TableCell>
            </TableRow>
          )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className='py-14'>
                  <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
                    <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
                      <FileSignatureIcon className='size-6' />
                    </div>
                    <p className='text-foreground text-base font-semibold'>
                      No enrollment contracts yet
                    </p>
                    <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                      Contracts assigned to enrollment requests will appear here
                      for tracking sent and signed status.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>#{contract.id}</TableCell>
                <TableCell>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>
                      {contract.client?.name ?? '—'}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {contract.client?.email ?? 'No email'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='text-sm'>
                  {contract.signed_by_name ?? '—'}
                </TableCell>
                <TableCell className='text-sm tabular-nums'>
                  #{contract.enrollment_request_id}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={contract.accepted_terms ? 'default' : 'outline'}
                  >
                    {contract.accepted_terms ? 'Accepted' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className='text-sm tabular-nums'>
                  {formatDate(contract.sent_at)}
                </TableCell>
                <TableCell className='text-sm tabular-nums'>
                  {formatDate(contract.signed_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(contract.status)}>
                    {STATUS_LABEL[contract.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableListShell>
  );
}

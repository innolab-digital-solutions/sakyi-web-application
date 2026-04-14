'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheckIcon } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

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
import {
  updateEnrollmentRequestStatus,
  type UpdateEnrollmentRequestStatusPayload,
} from '@/domains/enrollment-requests/services';
import type {
  EnrollmentRequestResource,
  EnrollmentRequestStatus,
} from '@/domains/enrollment-requests/types';
import { useTable } from '@/lib/table';

const STATUS_LABEL: Record<EnrollmentRequestStatus, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const ENROLLMENT_STATUSES: readonly EnrollmentRequestStatus[] = [
  'pending',
  'contacted',
  'completed',
  'cancelled',
];

const STATUS_TRANSITIONS: Record<
  EnrollmentRequestStatus,
  readonly EnrollmentRequestStatus[]
> = {
  pending: ['contacted', 'cancelled'],
  contacted: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function statusBadgeVariant(
  status: EnrollmentRequestStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'completed') return 'default';
  if (status === 'pending' || status === 'contacted') return 'secondary';
  if (status === 'cancelled') return 'destructive';
  return 'outline';
}

function formatRequestedAt(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString();
}

function getProgramLabel(request: EnrollmentRequestResource): string {
  if (request.program?.title?.trim()) return request.program.title.trim();
  if (request.program?.slug?.trim()) return request.program.slug.trim();
  return '—';
}

function getTransitionLabel(status: EnrollmentRequestStatus): string {
  switch (status) {
    case 'contacted':
      return 'Mark as contacted';
    case 'completed':
      return 'Mark as completed';
    case 'cancelled':
      return 'Mark as cancelled';
    case 'pending':
      return 'Mark as pending';
    default:
      return STATUS_LABEL[status];
  }
}

export default function EnrollmentRequestListTable() {
  const queryClient = useQueryClient();
  const { rows, controls } = useTable<EnrollmentRequestResource>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );

  const statusFilter = useMemo(() => {
    const value = controls.params.values.status;
    if (value === 'pending') return 'pending';
    if (value === 'contacted') return 'contacted';
    if (value === 'completed') return 'completed';
    if (value === 'cancelled') return 'cancelled';
    return 'all';
  }, [controls.params.values.status]);

  const {
    mutate: mutateStatus,
    variables,
    isPending: isUpdatingStatus,
  } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateEnrollmentRequestStatusPayload;
    }) => {
      const response = await updateEnrollmentRequestStatus(id, payload);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to update status.');
      }
    },
    onSuccess: () => {
      toast.success('Enrollment request status updated.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to update status.');
    },
  });

  const updatingId = isUpdatingStatus ? (variables?.id ?? null) : null;
  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load enrollment requests.';

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search by client, email, or phone...'
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
            {ENROLLMENT_STATUSES.map((status) => (
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
      <Table className='min-w-180 table-fixed'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead className='w-[10%]'>ID</TableHead>
            <TableHead className='w-[20%]'>Client</TableHead>
            <TableHead className='w-[20%]'>Program</TableHead>
            <TableHead className='w-[14%]'>Phone</TableHead>
            <TableHead className='w-[16%]'>Requested</TableHead>
            <TableHead className='w-[20%]'>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton &&
            Array.from({ length: 3 }).map((_, row) => (
              <TableRow key={`skeleton-${row}`}>
                {Array.from({ length: 6 }).map((__, col) => (
                  <TableCell key={col} className='py-3'>
                    <Skeleton className='h-8 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!showSkeleton && query.isError && (
            <TableRow>
              <TableCell
                colSpan={6}
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
                <TableCell colSpan={6} className='py-14'>
                  <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
                    <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
                      <ClipboardCheckIcon className='size-6' />
                    </div>
                    <p className='text-foreground text-base font-semibold'>
                      No enrollment requests yet
                    </p>
                    <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                      New client requests to join a program will appear here for
                      admin review.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((request) => (
              <TableRow key={request.id}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>
                      {request.client?.name ?? '—'}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {request.client?.email ?? 'No email'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='text-sm'>
                  {getProgramLabel(request)}
                </TableCell>
                <TableCell className='text-sm'>
                  {request.phone || '—'}
                </TableCell>
                <TableCell className='text-sm tabular-nums'>
                  {formatRequestedAt(request.timestamps.created_at)}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Badge variant={statusBadgeVariant(request.status)}>
                      {STATUS_LABEL[request.status]}
                    </Badge>
                    {STATUS_TRANSITIONS[request.status].length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-8 cursor-pointer'
                            disabled={updatingId === request.id}
                          >
                            Update status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          {STATUS_TRANSITIONS[request.status].map((status) => (
                            <DropdownMenuItem
                              key={status}
                              className='cursor-pointer'
                              onClick={() => {
                                mutateStatus({
                                  id: request.id,
                                  payload: { status },
                                });
                              }}
                            >
                              {getTransitionLabel(status)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-8'
                        disabled
                      >
                        Final status
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableListShell>
  );
}

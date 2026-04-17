'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  PhoneCallIcon,
  TimerResetIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import EnrollmentFilters from '@/components/admin/modules/enrollment-requests/EnrollmentFilters';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import {
  updateEnrollmentRequestStatus,
  type UpdateEnrollmentRequestStatusPayload,
} from '@/domains/enrollment-requests/services';
import type {
  EnrollmentRequestResource,
  EnrollmentRequestStatus,
} from '@/domains/enrollment-requests/types';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

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

const ENROLLMENT_REQUEST_COLUMNS = 9;
const ENROLLMENT_REQUEST_SKELETON_WIDTHS = [
  'w-24',
  'w-40',
  'w-44',
  'w-26',
  'w-28',
  'w-28',
  'w-36',
  'w-24',
  'w-44',
] as const;

const STATUS_TRANSITIONS: Record<
  EnrollmentRequestStatus,
  readonly EnrollmentRequestStatus[]
> = {
  pending: ['contacted', 'cancelled'],
  contacted: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const STATUS_STYLES: Record<
  EnrollmentRequestStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  pending: {
    icon: TimerResetIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  contacted: {
    icon: PhoneCallIcon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  },
  completed: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  cancelled: {
    icon: XCircleIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
};

function formatDateCell(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso;
  }
}

function getRequestReference(request: EnrollmentRequestResource): string {
  const code = request.code?.trim();
  if (code) return code;
  return `#${request.id}`;
}

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

function getProgramLabel(request: EnrollmentRequestResource): string {
  if (request.program?.title?.trim()) return request.program.title.trim();
  if (request.program?.slug?.trim()) return request.program.slug.trim();
  return '—';
}

function getProgramCode(request: EnrollmentRequestResource): string {
  const code = request.program?.code?.trim();
  if (code) return code;
  if (request.program?.id != null) return `ID ${request.program.id}`;
  return '—';
}

function formatRoleLabel(role: string): string {
  return role
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function ProgramThumbnail({
  thumbnailUrl,
}: {
  thumbnailUrl: string | null | undefined;
}) {
  const [useFallback, setUseFallback] = useState(() => !thumbnailUrl?.trim());
  const src = useFallback ? PROGRAM_THUMBNAIL_FALLBACK : thumbnailUrl!.trim();
  const unoptimized = src.startsWith('http://') || src.startsWith('https://');

  return (
    <div className='bg-muted border-border relative size-10 shrink-0 overflow-hidden rounded-md border'>
      <Image
        src={src}
        alt=''
        width={40}
        height={40}
        unoptimized={unoptimized}
        className='size-full object-cover'
        onError={() => setUseFallback(true)}
        aria-hidden
      />
    </div>
  );
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

/**
 * Intake should only start while the request is still actively being worked.
 * In practice that means:
 * - pending: newly submitted and still triageable
 * - contacted: qualified and in active follow-up
 * Finalized states (completed/cancelled) should not create new intake sessions.
 */
function canStartIntake(request: EnrollmentRequestResource): boolean {
  if (!request.client?.id) return false;
  return request.status === 'pending' || request.status === 'contacted';
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
      searchPlaceholder='Search applicant, email, or phone'
      filters={
        <EnrollmentFilters
          statusFilter={statusFilter}
          statuses={ENROLLMENT_STATUSES}
          labels={STATUS_LABEL}
          onClearStatus={() => controls.params.clear(['status'])}
          onSetStatus={(status) => controls.params.set({ status })}
        />
      }
    >
      <Table className='w-full min-w-7xl'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead className='min-w-40'>Reference</TableHead>
            <TableHead className='min-w-48'>Applicant</TableHead>
            <TableHead className='min-w-52'>Requested program</TableHead>
            <TableHead className='min-w-30'>Contact Phone</TableHead>
            <TableHead className='min-w-34'>Received</TableHead>
            <TableHead className='min-w-40'>Handled by</TableHead>
            <TableHead className='min-w-34'>Contacted</TableHead>
            <TableHead className='min-w-26'>Status</TableHead>
            <TableHead className='min-w-52'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton && (
            <TableSkeletonRows
              rowCount={3}
              columnCount={ENROLLMENT_REQUEST_COLUMNS}
              cellWidths={ENROLLMENT_REQUEST_SKELETON_WIDTHS}
            />
          )}

          {!showSkeleton && query.isError && (
            <TableRow>
              <TableCell
                colSpan={ENROLLMENT_REQUEST_COLUMNS}
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
              <TableEmptyStateRow
                colSpan={ENROLLMENT_REQUEST_COLUMNS}
                icon={ClipboardCheckIcon}
                title='No enrollment requests yet'
                description='When clients submit a program inquiry, it will show up here so your team can follow up and start intake when appropriate.'
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((request) => {
              const enrollmentRequestId = request.id;
              const programLabel = getProgramLabel(request);
              const programCode = getProgramCode(request);
              const receivedAt = formatDateCell(request.timestamps.created_at);
              const contactedAt = formatDateCell(request.contacted_at);

              return (
                <TableRow key={request.id}>
                  <TableCell className='align-center min-w-45 whitespace-normal'>
                    <p className='text-foreground text-[13px] font-semibold'>
                      {getRequestReference(request)}
                    </p>
                  </TableCell>
                  <TableCell className='align-center whitespace-normal'>
                    <div className='flex items-start gap-3'>
                      <Avatar
                        size='default'
                        className='mt-0.5 shrink-0'
                        aria-hidden
                      >
                        {request.client?.picture_url?.trim() ? (
                          <AvatarImage
                            src={request.client.picture_url}
                            alt=''
                          />
                        ) : null}
                        <AvatarFallback className='text-xs'>
                          {getInitials(request.client?.name ?? '', 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1 space-y-1'>
                        <p className='text-foreground text-[13px] font-semibold'>
                          {request.client?.name?.trim() ? (
                            request.client.name.trim()
                          ) : (
                            <TableCellEmpty label='Name not provided' />
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                          {request.client?.email ?? 'No email on file'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='align-center min-w-75 whitespace-normal'>
                    <div className='flex items-start gap-3'>
                      <ProgramThumbnail
                        thumbnailUrl={request.program?.thumbnail_url}
                      />
                      <div className='min-w-0 flex-1 space-y-1'>
                        <p className='text-foreground text-[13px] font-semibold'>
                          {programLabel !== '—' ? (
                            programLabel
                          ) : (
                            <TableCellEmpty label='No program linked' />
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                          {programCode !== '—' ? (
                            programCode
                          ) : (
                            <TableCellEmpty label='No program code' />
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center tabular-nums'>
                    {request.phone?.trim() ? (
                      request.phone.trim()
                    ) : (
                      <TableCellEmpty label='No phone' />
                    )}
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center tabular-nums'>
                    {receivedAt ?? <TableCellEmpty label='Not set' />}
                  </TableCell>
                  <TableCell className='align-center min-w-52 whitespace-normal'>
                    {request.handler ? (
                      <div className='flex items-start gap-3'>
                        <Avatar
                          size='default'
                          className='mt-0.5 shrink-0'
                          aria-hidden
                        >
                          {request.handler.picture_url?.trim() ? (
                            <AvatarImage
                              src={request.handler.picture_url}
                              alt=''
                            />
                          ) : null}
                          <AvatarFallback className='text-xs'>
                            {getInitials(request.handler.name ?? '', 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {request.handler.name}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug wrap-break-word'>
                            {request.handler.role?.trim() ? (
                              formatRoleLabel(request.handler.role)
                            ) : (
                              <TableCellEmpty label='No role' />
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <TableCellEmpty label='Not assigned' />
                    )}
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center tabular-nums'>
                    {contactedAt ?? <TableCellEmpty label='Pending' />}
                  </TableCell>
                  <TableCell className='align-center'>
                    {(() => {
                      const statusStyle = STATUS_STYLES[request.status];
                      const StatusIcon = statusStyle.icon;

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                        >
                          <StatusIcon className='size-3.5 shrink-0' />
                          {STATUS_LABEL[request.status]}
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className='align-center whitespace-nowrap'>
                    <div className='flex flex-nowrap items-center justify-start gap-2'>
                      {canStartIntake(request) && (
                        <Button size='sm' className='shrink-0' asChild>
                          <Link
                            href={`${ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.CREATE}?request=${enrollmentRequestId}`}
                          >
                            Intake
                          </Link>
                        </Button>
                      )}
                      {STATUS_TRANSITIONS[request.status].length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='outline'
                              size='sm'
                              className='shrink-0 gap-1.5'
                              disabled={updatingId === request.id}
                            >
                              Status
                              <ChevronDownIcon className='size-3.5 opacity-70' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='min-w-48'>
                            {STATUS_TRANSITIONS[request.status].map(
                              (status) => (
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
                              ),
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <TableCellEmpty
                          label='Finalized'
                          className='whitespace-nowrap'
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableListShell>
  );
}

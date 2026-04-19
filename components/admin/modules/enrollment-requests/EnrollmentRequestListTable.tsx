'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2Icon,
  PhoneCallIcon,
  TimerResetIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import EnrollmentIntakeConfirmation from '@/components/admin/modules/enrollment-requests/EnrollmentIntakeConfirmation';
import EnrollmentRequestFilters from '@/components/admin/modules/enrollment-requests/EnrollmentRequestFilters';
import EnrollmentRequestRowActions from '@/components/admin/modules/enrollment-requests/EnrollmentRequestRowActions';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  createOnboardingIntake,
  getOnboardingTemplateByVersion,
} from '@/domains/intake-assessments/services';
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

type EnrollmentColumnKey =
  | 'reference'
  | 'applicant'
  | 'requestedProgram'
  | 'contactPhone'
  | 'requestedAt'
  | 'handledBy'
  | 'contactedAt'
  | 'status'
  | 'actions';

type EnrollmentColumnDefinition = {
  key: EnrollmentColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

/** Bumped when default visibility changes so prior auto-saved “all columns” does not stick forever. */
const ENROLLMENT_VISIBLE_COLUMNS_STORAGE_KEY =
  'sakyi:admin:enrollment-requests:visible-columns:v2';

/** First-load defaults: triage-first fields; ops can enable assignment/contact columns from Columns. */
const DEFAULT_VISIBLE_COLUMN_KEYS: readonly EnrollmentColumnKey[] = [
  'applicant',
  'requestedProgram',
  'contactPhone',
  'requestedAt',
  'status',
  'actions',
];

const ENROLLMENT_COLUMNS: readonly EnrollmentColumnDefinition[] = [
  {
    key: 'reference',
    label: 'Reference',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'applicant',
    label: 'Applicant',
    headerClassName: '',
    skeletonWidth: 'w-40',
  },
  {
    key: 'requestedProgram',
    label: 'Requested Program',
    headerClassName: '',
    skeletonWidth: 'w-44',
  },
  {
    key: 'contactPhone',
    label: 'Contact Phone',
    headerClassName: '',
    skeletonWidth: 'w-26',
  },
  {
    key: 'requestedAt',
    label: 'Requested At',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'status',
    label: 'Status',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'handledBy',
    label: 'Handled By',
    headerClassName: '',
    skeletonWidth: 'w-36',
  },
  {
    key: 'contactedAt',
    label: 'Contacted At',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
] as const;

const STATUS_STYLES: Record<
  EnrollmentRequestStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    actionTextClass: string;
  }
> = {
  pending: {
    icon: TimerResetIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
    actionTextClass: 'text-amber-700 dark:text-amber-300',
  },
  contacted: {
    icon: PhoneCallIcon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
    actionTextClass: 'text-sky-700 dark:text-sky-300',
  },
  completed: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    actionTextClass: 'text-emerald-700 dark:text-emerald-300',
  },
  cancelled: {
    icon: XCircleIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
    actionTextClass: 'text-rose-700 dark:text-rose-300',
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
  const src = useFallback
    ? PROGRAM_THUMBNAIL_FALLBACK
    : (thumbnailUrl ?? '').trim();
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

export default function EnrollmentRequestListTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [startIntakeRequest, setStartIntakeRequest] =
    useState<EnrollmentRequestResource | null>(null);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    EnrollmentColumnKey[]
  >(() => {
    const fallback = [...DEFAULT_VISIBLE_COLUMN_KEYS];
    if (typeof window === 'undefined') return fallback;

    const raw = window.localStorage.getItem(
      ENROLLMENT_VISIBLE_COLUMNS_STORAGE_KEY,
    );
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;

      const allowed = new Set(ENROLLMENT_COLUMNS.map((column) => column.key));
      const next = parsed.filter(
        (value): value is EnrollmentColumnKey =>
          typeof value === 'string' &&
          allowed.has(value as EnrollmentColumnKey),
      );

      return next.length > 0 ? next : fallback;
    } catch {
      return fallback;
    }
  });
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
      toast.success('Enrollment request marked as contacted successfully.');
 
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to update status.');
    },
  });
  const {
    mutate: startIntake,
    isPending: isStartingIntake,
    variables: startingIntakeRequest,
  } = useMutation({
    mutationFn: async (request: EnrollmentRequestResource) => {
      const templateResponse = await getOnboardingTemplateByVersion(1);
      if (templateResponse.status === 'error') {
        throw new Error(templateResponse.message || 'Could not load template.');
      }

      const createResponse = await createOnboardingIntake({
        enrollment_request_id: request.id,
        onboarding_template_id: templateResponse.data.id,
      });

      if (createResponse.status === 'error') {
        throw new Error(createResponse.message || 'Could not create intake.');
      }

      return createResponse.data.id;
    },
    onSuccess: async (intakeId) => {
      setStartIntakeRequest(null);
      toast.success('Intake assessment created successfully.');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.LIST],
        }),
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.INTAKE_ASSESSMENTS.LIST],
        }),
      ]);
      router.push(
        ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(String(intakeId)),
      );
    },
    onError: (error) => {
      toast.error(error.message ?? 'Could not create intake assessment.');
    },
  });
  const updatingId = isUpdatingStatus ? (variables?.id ?? null) : null;
  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load enrollment requests.';
  const visibleColumns = useMemo(
    () =>
      ENROLLMENT_COLUMNS.filter((column) =>
        visibleColumnKeys.includes(column.key),
      ),
    [visibleColumnKeys],
  );
  const visibleColumnSet = useMemo(
    () => new Set(visibleColumnKeys),
    [visibleColumnKeys],
  );
  const visibleColumnCount = Math.max(1, visibleColumns.length);
  const visibleSkeletonWidths = useMemo(
    () => visibleColumns.map((column) => column.skeletonWidth),
    [visibleColumns],
  );

  useEffect(() => {
    window.localStorage.setItem(
      ENROLLMENT_VISIBLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      const nextColumnKey = ENROLLMENT_COLUMNS.find(
        (column) => column.key === columnKey,
      )?.key;
      if (!nextColumnKey) return current;

      if (current.includes(nextColumnKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== nextColumnKey);
      }

      return ENROLLMENT_COLUMNS.map((column) => column.key).filter(
        (key) => key === nextColumnKey || current.includes(key),
      );
    });
  };

  const resetColumns = () => {
    setVisibleColumnKeys([...DEFAULT_VISIBLE_COLUMN_KEYS]);
  };

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search ...'
      filters={
        <EnrollmentRequestFilters
          statusFilter={statusFilter}
          statuses={ENROLLMENT_STATUSES}
          labels={STATUS_LABEL}
          onClearStatus={() => controls.params.clear(['status'])}
          onSetStatus={(status) => controls.params.set({ status })}
          columns={ENROLLMENT_COLUMNS}
          visibleColumnKeys={visibleColumnKeys}
          onToggleColumn={(columnKey) => toggleColumn(columnKey)}
          onResetColumns={resetColumns}
        />
      }
    >
      <Table className='w-full min-w-7xl'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            {visibleColumns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton && (
            <TableSkeletonRows
              rowCount={3}
              columnCount={visibleColumnCount}
              cellWidths={visibleSkeletonWidths}
            />
          )}

          {!showSkeleton && query.isError && (
            <TableRow>
              <TableCell
                colSpan={visibleColumnCount}
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
                colSpan={visibleColumnCount}
                title='No Enrollment Requests Found'
                description='There are currently no enrollment requests in the table. When prospective clients request program enrollment, their requests will appear here for your review and action.'
           
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((request) => {
              const programLabel = getProgramLabel(request);
              const programCode = getProgramCode(request);
              const requestedAt = formatDateCell(request.timestamps.created_at);
              const contactedAt = formatDateCell(request.contacted_at);
              const showColumn = (columnKey: EnrollmentColumnKey) =>
                visibleColumnSet.has(columnKey);

              return (
                <TableRow key={request.id}>
                  {showColumn('reference') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {getRequestReference(request)}
                      </p>
                    </TableCell>
                  ) : null}
                  {showColumn('applicant') ? (
                    <TableCell>
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
                          <p className='text-muted-foreground text-xs font-medium'>
                            {request.client?.email ?? 'No email on file'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {showColumn('requestedProgram') ? (
                    <TableCell>
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
                          <p className='text-muted-foreground text-xs font-medium'>
                            {programCode !== '—' ? (
                              programCode
                            ) : (
                              <TableCellEmpty label='No program code' />
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {showColumn('contactPhone') ? (
                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {request.phone?.trim() ? (
                        request.phone.trim()
                      ) : (
                        <TableCellEmpty label='No phone' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('requestedAt') ? (
                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {requestedAt ?? <TableCellEmpty label='Not set' />}
                    </TableCell>
                  ) : null}
                  {showColumn('status') ? (
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
                  ) : null}
                  {showColumn('handledBy') ? (
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
                              {getInitials(request.handler.name ?? '', 2) ||
                                '?'}
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
                        <TableCellEmpty label='No handler' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('contactedAt') ? (
                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {contactedAt ?? (
                        <TableCellEmpty label='Not Contact Yet' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('actions') ? (
                    <TableCell>
                      <EnrollmentRequestRowActions
                        request={request}
                        onStartIntake={() => setStartIntakeRequest(request)}
                        onMarkContacted={() => {
                          mutateStatus({
                            id: request.id,
                            payload: { status: 'contacted' },
                          });
                        }}
                        isStartingIntake={
                          isStartingIntake &&
                          startingIntakeRequest?.id === request.id
                        }
                        isUpdatingStatus={updatingId === request.id}
                      />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <EnrollmentIntakeConfirmation
        open={startIntakeRequest != null}
        isSubmitting={isStartingIntake}
        requestReference={
          startIntakeRequest
            ? getRequestReference(startIntakeRequest)
            : undefined
        }
        onOpenChange={(open) => {
          if (!open && !isStartingIntake) setStartIntakeRequest(null);
        }}
        onConfirm={() => {
          if (!startIntakeRequest) return;
          startIntake(startIntakeRequest);
        }}
      />
    </TableListShell>
  );
}

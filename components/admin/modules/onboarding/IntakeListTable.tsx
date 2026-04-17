'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2Icon,
  EyeIcon,
  FileTextIcon,
  PencilIcon,
  SendHorizontal,
  TimerResetIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import IntakeAssessmentFilters from '@/components/admin/modules/onboarding/IntakeAssessmentFilters';
import SendContractConfirmation from '@/components/admin/modules/onboarding/SendContractConfirmation';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { assignEnrollmentRequestContract } from '@/domains/enrollment-requests/services';
import type { OnboardingIntakeData } from '@/domains/intake-assessments/types';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

type IntakeStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

const INTAKE_STATUSES: readonly IntakeStatus[] = [
  'draft',
  'in_progress',
  'completed',
  'cancelled',
] as const;

const STATUS_LABEL: Record<IntakeStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

type IntakeColumnKey =
  | 'reference'
  | 'applicant'
  | 'requestedProgram'
  | 'linkedRequest'
  | 'handledBy'
  | 'status'
  | 'lastUpdated'
  | 'actions';

type IntakeColumnDefinition = {
  key: IntakeColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

const INTAKE_VISIBLE_COLUMNS_STORAGE_KEY =
  'sakyi:admin:intake-assessments:visible-columns';

const INTAKE_COLUMNS: readonly IntakeColumnDefinition[] = [
  {
    key: 'reference',
    label: 'Reference',
    headerClassName: 'min-w-40',
    skeletonWidth: 'w-24',
  },
  {
    key: 'applicant',
    label: 'Applicant',
    headerClassName: 'min-w-48',
    skeletonWidth: 'w-40',
  },
  {
    key: 'requestedProgram',
    label: 'Requested Program',
    headerClassName: 'min-w-56',
    skeletonWidth: 'w-44',
  },
  {
    key: 'linkedRequest',
    label: 'Linked Request',
    headerClassName: 'min-w-36',
    skeletonWidth: 'w-28',
  },
  {
    key: 'handledBy',
    label: 'Handled By',
    headerClassName: 'min-w-44',
    skeletonWidth: 'w-36',
  },
  {
    key: 'status',
    label: 'Status',
    headerClassName: 'min-w-30',
    skeletonWidth: 'w-30',
  },
  {
    key: 'lastUpdated',
    label: 'Last Updated',
    headerClassName: 'min-w-34',
    skeletonWidth: 'w-26',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: 'min-w-52',
    skeletonWidth: 'w-44',
  },
] as const;

/** Aligned with enrollment request status badges for completed/cancelled; draft/in_progress are distinct “workflow” states. */
const STATUS_STYLES: Record<
  IntakeStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  draft: {
    icon: FileTextIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  in_progress: {
    icon: TimerResetIcon,
    className:
      'border-indigo-300/80 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200',
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

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso;
  }
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

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

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

function asIntakeStatus(value: string | undefined): IntakeStatus | null {
  if (value === 'draft') return 'draft';
  if (value === 'in_progress') return 'in_progress';
  if (value === 'completed') return 'completed';
  if (value === 'cancelled') return 'cancelled';
  return null;
}

export default function IntakeListTable() {
  const queryClient = useQueryClient();
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<IntakeColumnKey[]>(
    () => {
      const fallback = INTAKE_COLUMNS.map((column) => column.key);
      if (typeof window === 'undefined') return fallback;

      const raw = window.localStorage.getItem(
        INTAKE_VISIBLE_COLUMNS_STORAGE_KEY,
      );
      if (!raw) return fallback;

      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return fallback;

        const allowed = new Set(INTAKE_COLUMNS.map((column) => column.key));
        const next = parsed.filter(
          (value): value is IntakeColumnKey =>
            typeof value === 'string' && allowed.has(value as IntakeColumnKey),
        );

        return next.length > 0 ? next : fallback;
      } catch {
        return fallback;
      }
    },
  );
  const [assigningEnrollmentRequestId, setAssigningEnrollmentRequestId] =
    useState<number | null>(null);
  const [sendContractDialog, setSendContractDialog] = useState<{
    enrollmentRequestId: number;
    variant: 'first' | 'resend';
    applicantName: string | null;
  } | null>(null);
  const { rows, controls } = useTable<OnboardingIntakeData>(
    ENDPOINTS.ADMIN.MODULES.INTAKE_ASSESSMENTS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );
  const statusFilter = useMemo(() => {
    const value = controls.params.values.status;
    return asIntakeStatus(value) ?? 'all';
  }, [controls.params.values.status]);
  const visibleColumns = useMemo(
    () =>
      INTAKE_COLUMNS.filter((column) => visibleColumnKeys.includes(column.key)),
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

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load intake assessments.';
  const { mutate: mutateAssignContract, isPending: isAssigningContract } =
    useMutation({
      mutationFn: async (enrollmentRequestId: number) => {
        const response =
          await assignEnrollmentRequestContract(enrollmentRequestId);
        if (response.status === 'error') {
          throw new Error(
            response.message ||
              'The contract notification could not be sent. Please try again.',
          );
        }
      },
      onSuccess: () => {
        toast.success(
          'The enrollment contract notification was sent. The applicant will receive it on their mobile device.',
        );
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.INTAKE_ASSESSMENTS.LIST],
        });
      },
      onError: (error) => {
        toast.error(
          error.message ??
            'The contract notification could not be sent. Try again or contact support if the problem continues.',
        );
      },
    });

  const confirmSendContract = () => {
    if (!sendContractDialog) return;
    const enrollmentRequestId = sendContractDialog.enrollmentRequestId;
    if (
      isAssigningContract ||
      assigningEnrollmentRequestId === enrollmentRequestId
    ) {
      return;
    }

    setAssigningEnrollmentRequestId(enrollmentRequestId);
    mutateAssignContract(enrollmentRequestId, {
      onSuccess: () => {
        setSendContractDialog(null);
      },
      onSettled: () => {
        setAssigningEnrollmentRequestId(null);
      },
    });
  };

  useEffect(() => {
    window.localStorage.setItem(
      INTAKE_VISIBLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      const nextColumnKey = INTAKE_COLUMNS.find(
        (column) => column.key === columnKey,
      )?.key;
      if (!nextColumnKey) return current;

      if (current.includes(nextColumnKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== nextColumnKey);
      }

      return INTAKE_COLUMNS.map((column) => column.key).filter(
        (key) => key === nextColumnKey || current.includes(key),
      );
    });
  };

  const resetColumns = () => {
    setVisibleColumnKeys(INTAKE_COLUMNS.map((column) => column.key));
  };

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search applicant, contact, or reference'
      filters={
        <IntakeAssessmentFilters
          statusFilter={statusFilter}
          statuses={INTAKE_STATUSES}
          labels={STATUS_LABEL}
          onClearStatus={() => controls.params.clear(['status'])}
          onSetStatus={(status) => controls.params.set({ status })}
          columns={INTAKE_COLUMNS}
          visibleColumnKeys={visibleColumnKeys}
          onToggleColumn={toggleColumn}
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
                icon={FileTextIcon}
                title='No Intake Assessments Found'
                description='Intake assessments created from approved enrollment requests will appear here for assignment, review, and follow-up.'
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((intake) => {
              const intakeStatus = asIntakeStatus(intake.status);
              const statusStyle = intakeStatus
                ? STATUS_STYLES[intakeStatus]
                : STATUS_STYLES.draft;
              const StatusIcon = statusStyle.icon;
              const updatedAt = formatDate(intake.timestamps.updated_at);
              const createdAt = formatDate(intake.timestamps.created_at);
              const programLabel =
                intake.program?.title?.trim() ||
                intake.program?.slug?.trim() ||
                '—';

              const enrollmentRequestId = intake.enrollment_request?.id ?? null;
              const showColumn = (columnKey: IntakeColumnKey) =>
                visibleColumnSet.has(columnKey);

              return (
              <TableRow key={intake.id}>
                  {showColumn('reference') ? (
                    <TableCell className='align-center min-w-45 whitespace-normal'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {intake.code?.trim()}
                      </p>
                </TableCell>
                  ) : null}

                  {showColumn('applicant') ? (
                    <TableCell className='align-center whitespace-normal'>
                      <div className='flex items-start gap-3'>
                        <Avatar
                          size='default'
                          className='mt-0.5 shrink-0'
                          aria-hidden
                        >
                          {intake.client?.picture_url?.trim() ? (
                            <AvatarImage
                              src={intake.client.picture_url}
                              alt=''
                            />
                          ) : null}
                          <AvatarFallback className='text-xs'>
                            {getInitials(intake.client?.name ?? '', 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {intake.client?.name?.trim() ? (
                              intake.client.name.trim()
                            ) : (
                              <TableCellEmpty label='Name not provided' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                            {intake.client?.email ?? 'No email on file'}
                          </p>
                        </div>
                  </div>
                </TableCell>
                  ) : null}

                  {showColumn('requestedProgram') ? (
                    <TableCell className='align-center min-w-75 whitespace-normal'>
                      <div className='flex items-start gap-3'>
                        <ProgramThumbnail
                          thumbnailUrl={intake.program?.thumbnail_url}
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
                            {intake.program?.code?.trim() ? (
                              intake.program.code.trim()
                            ) : (
                              <TableCellEmpty label='No program code' />
                            )}
                          </p>
                        </div>
                      </div>
                </TableCell>
                  ) : null}

                  {showColumn('linkedRequest') ? (
                    <TableCell className='align-center min-w-45 whitespace-normal'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {intake.enrollment_request?.code?.trim() || (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}

                  {showColumn('handledBy') ? (
                    <TableCell className='align-center min-w-52 whitespace-normal'>
                      {intake.handler ? (
                        <div className='flex items-start gap-3'>
                          <Avatar
                            size='default'
                            className='mt-0.5 shrink-0'
                            aria-hidden
                          >
                            {intake.handler.picture_url?.trim() ? (
                              <AvatarImage
                                src={intake.handler.picture_url}
                                alt=''
                              />
                            ) : null}
                            <AvatarFallback className='text-xs'>
                              {getInitials(intake.handler.name ?? '', 2) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1 space-y-1'>
                            <p className='text-foreground text-[13px] font-semibold'>
                              {intake.handler.name}
                            </p>
                            <p className='text-muted-foreground text-xs leading-snug wrap-break-word'>
                              {intake.handler.role?.trim() ? (
                                formatRoleLabel(intake.handler.role)
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
                  ) : null}

                  {showColumn('status') ? (
                    <TableCell className='align-center'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                      >
                        <StatusIcon className='size-3.5 shrink-0' />
                        {intakeStatus
                          ? STATUS_LABEL[intakeStatus]
                          : intake.status}
                      </span>
                    </TableCell>
                  ) : null}

                  {showColumn('lastUpdated') ? (
                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {updatedAt || createdAt ? (
                        updatedAt || createdAt
                      ) : (
                        <TableCellEmpty label='Not set' />
                      )}
                    </TableCell>
                  ) : null}

                  {showColumn('actions') ? (
                    <TableCell className='align-center whitespace-nowrap'>
                      <div className='flex flex-nowrap items-center justify-start gap-2'>
                        {intake.status !== 'completed' &&
                          intake.status !== 'cancelled' && (
                            <Button
                              className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                              asChild
                            >
                              <Link
                                href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(
                                  String(intake.id),
                                )}
                              >
                                <PencilIcon className='size-3.5' />
                                Continue Interview
                      </Link>
                    </Button>
                          )}

                        {intake.status === 'completed' &&
                          !intake.enrollment_contract?.signed_at && (
                            <Button
                              className='h-10 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                              disabled={
                                enrollmentRequestId == null ||
                                isAssigningContract ||
                                assigningEnrollmentRequestId ===
                                  enrollmentRequestId
                              }
                              onClick={() => {
                                if (enrollmentRequestId != null) {
                                  setSendContractDialog({
                                    enrollmentRequestId,
                                    variant: intake.enrollment_contract?.sent_at
                                      ? 'resend'
                                      : 'first',
                                    applicantName:
                                      intake.client?.name?.trim() ?? null,
                                  });
                                }
                              }}
                            >
                              <SendHorizontal className='size-3.5' />
                              Send Contract
                            </Button>
                          )}

                        <Button
                          variant='outline'
                          size='sm'
                          className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                          asChild
                        >
                          <Link
                            href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                              String(intake.id),
                            )}
                          >
                            <EyeIcon className='size-3.5' />
                            View Details
                          </Link>
                        </Button>
                  </div>
                </TableCell>
                  ) : null}
              </TableRow>
              );
            })}
        </TableBody>
      </Table>

      <SendContractConfirmation
        open={sendContractDialog != null}
        onOpenChange={(open) => {
          if (!open) setSendContractDialog(null);
        }}
        isSubmitting={
          sendContractDialog != null &&
          isAssigningContract &&
          assigningEnrollmentRequestId ===
            sendContractDialog.enrollmentRequestId
        }
        variant={sendContractDialog?.variant ?? 'first'}
        applicantName={sendContractDialog?.applicantName}
        onConfirm={confirmSendContract}
      />
    </TableListShell>
  );
}

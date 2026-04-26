'use client';

import { format, parseISO } from 'date-fns';
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import CarePlanLogFilters from '@/components/admin/modules/care-plan-logs/CarePlanLogFilters';
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
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import type { CarePlanLogSummary } from '@/domains/care-plans/services';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.CARE_PLAN_LOGS.LIST;
const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';
const CARE_PLAN_LOG_VISIBLE_COLUMNS_STORAGE_KEY =
  'sakyi:admin:care-plan-logs:visible-columns:v1';

type CarePlanLogColumnKey =
  | 'client'
  | 'enrollmentReference'
  | 'enrolledProgram'
  | 'Reference'
  | 'status'
  | 'careWindow'
  | 'lastLoggedAt'
  | 'progress'
  | 'recency'
  | 'careCycle'
  | 'lastUpdatedAt'
  | 'actions';

type CarePlanLogColumnDefinition = {
  key: CarePlanLogColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

const DEFAULT_VISIBLE_COLUMN_KEYS: readonly CarePlanLogColumnKey[] = [
  'Reference',
  'client',
  'careWindow',
  'lastLoggedAt',
  'progress',
  'recency',
  'actions',
];

const CARE_PLAN_LOG_COLUMNS: readonly CarePlanLogColumnDefinition[] = [
  {
    key: 'Reference',
    label: 'Reference',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'client',
    label: 'Client',
    headerClassName: '',
    skeletonWidth: 'w-44',
  },
  {
    key: 'enrollmentReference',
    label: 'Enrollment Reference',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'enrolledProgram',
    label: 'Enrolled Program',
    headerClassName: '',
    skeletonWidth: 'w-40',
  },
  {
    key: 'status',
    label: 'Status',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'careWindow',
    label: 'Care Window',
    headerClassName: '',
    skeletonWidth: 'w-40',
  },
  {
    key: 'lastLoggedAt',
    label: 'Last Logged At',
    headerClassName: '',
    skeletonWidth: 'w-36',
  },
  {
    key: 'progress',
    label: 'Progress',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'recency',
    label: 'Recency',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'careCycle',
    label: 'Care Cycle',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'lastUpdatedAt',
    label: 'Last Updated At',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: 'text-end',
    skeletonWidth: 'w-28',
  },
] as const;

function formatDate(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMM-yyyy HH:mm');
  } catch {
    return iso.trim();
  }
}

function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const value = raw.trim();
  if (value.startsWith('http')) return value;
  return `${base.domainEndpoint}${value}`;
}

function resolveProgramThumbnailUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return PROGRAM_THUMBNAIL_FALLBACK;
  const value = raw.trim();
  if (value.startsWith('http')) return value;
  return `${base.domainEndpoint}${value}`;
}

function ProgramThumbnail({
  thumbnailUrl,
}: {
  thumbnailUrl: string | null | undefined;
}) {
  const src = resolveProgramThumbnailUrl(thumbnailUrl);
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
        aria-hidden
      />
    </div>
  );
}

function normalizeStatus(
  value: string | null | undefined,
): 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled' | null {
  const status = (value ?? '').trim().toLowerCase();
  if (
    status === 'draft' ||
    status === 'scheduled' ||
    status === 'active' ||
    status === 'completed' ||
    status === 'cancelled'
  ) {
    return status;
  }
  return null;
}

const STATUS_LABEL = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

const STATUS_STYLES = {
  draft: {
    icon: FileTextIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  scheduled: {
    icon: ClockIcon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  },
  active: {
    icon: ActivityIcon,
    className:
      'border-cyan-300/80 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
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
} as const;

type CarePlanStatus = keyof typeof STATUS_STYLES;

function recencyTone(summary: CarePlanLogSummary): {
  label: string;
  className: string;
} {
  const recent = summary.completion_signal?.is_logging_recent === true;
  const progress = summary.completion_signal?.window_progress_percentage ?? 0;
  if (recent) {
    return {
      label: 'On Track',
      className:
        'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    };
  }
  if (progress >= 60) {
    return {
      label: 'Overdue',
      className:
        'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
    };
  }
  return {
    label: 'Needs Follow-Up',
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  };
}

export default function CarePlanLogListTable() {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    CarePlanLogColumnKey[]
  >(() => {
    const fallback = [...DEFAULT_VISIBLE_COLUMN_KEYS];
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(
      CARE_PLAN_LOG_VISIBLE_COLUMNS_STORAGE_KEY,
    );
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;
      const allowed = new Set(
        CARE_PLAN_LOG_COLUMNS.map((column) => column.key),
      );
      const next = parsed.filter(
        (value): value is CarePlanLogColumnKey =>
          typeof value === 'string' &&
          allowed.has(value as CarePlanLogColumnKey),
      );
      return next.length > 0 ? next : fallback;
    } catch {
      return fallback;
    }
  });

  const { rows, controls } = useTable<CarePlanLogSummary>(LIST_ENDPOINT, {
    params: { sync: true, writeInitialToUrl: true },
  });

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load daily task logs.';

  const visibleColumns = useMemo(
    () =>
      CARE_PLAN_LOG_COLUMNS.filter((column) =>
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
      CARE_PLAN_LOG_VISIBLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      const nextColumnKey = CARE_PLAN_LOG_COLUMNS.find(
        (column) => column.key === columnKey,
      )?.key;
      if (!nextColumnKey) return current;
      if (current.includes(nextColumnKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== nextColumnKey);
      }
      return CARE_PLAN_LOG_COLUMNS.map((column) => column.key).filter(
        (key) => key === nextColumnKey || current.includes(key),
      );
    });
  };

  const resetColumns = () => {
    setVisibleColumnKeys([...DEFAULT_VISIBLE_COLUMN_KEYS]);
  };

  const showColumn = (columnKey: CarePlanLogColumnKey) =>
    visibleColumnSet.has(columnKey);

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search ...'
      filters={
        <CarePlanLogFilters
          columns={CARE_PLAN_LOG_COLUMNS}
          visibleColumnKeys={visibleColumnKeys}
          onToggleColumn={toggleColumn}
          onResetColumns={resetColumns}
        />
      }
    >
      <Table className='min-w-8xl w-full'>
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
          {showSkeleton ? (
            <TableSkeletonRows
              rowCount={12}
              columnCount={visibleColumnCount}
              cellWidths={[...visibleSkeletonWidths]}
            />
          ) : null}

          {!showSkeleton && query.isError ? (
            <TableRow>
              <TableCell
                colSpan={visibleColumnCount}
                className='text-destructive py-8 text-center text-sm'
              >
                {errorMessage}
              </TableCell>
            </TableRow>
          ) : null}

          {!showSkeleton &&
          !query.isError &&
          query.data?.status === 'success' &&
          rows.length === 0 ? (
            <TableEmptyStateRow
              colSpan={visibleColumnCount}
              title='No Daily Task Logs Found'
              description='No daily task logs found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
            />
          ) : null}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((row) => {
              const startDate = formatDate(row.starts_on);
              const endDate = formatDate(row.ends_on);
              const lastLoggedAt = formatDateTime(row.last_logged_at);
              const lastUpdatedAt = formatDateTime(row.timestamps?.updated_at);
              const progress =
                row.completion_signal?.window_progress_percentage;
              const tone = recencyTone(row);
              const status = normalizeStatus(
                row.status,
              ) as CarePlanStatus | null;
              const statusStyle = status ? STATUS_STYLES[status] : null;
              const StatusIcon = statusStyle?.icon;

              const clientName = row.enrollment?.client?.name?.trim();
              const clientCode = row.enrollment?.client?.client_code?.trim();
              const clientEmail = row.enrollment?.client?.email?.trim();
              const pictureSrc = resolveClientPictureUrl(
                row.enrollment?.client?.picture_url,
              );

              const enrollmentCode = row.enrollment?.code?.trim();
              const programTitle = row.enrollment?.program?.title?.trim();
              const programCode = row.enrollment?.program?.code?.trim();
              const programThumbnail = row.enrollment?.program?.thumbnail_url;

              return (
                <TableRow key={row.id}>
                  {showColumn('Reference') ? (
                    <TableCell className='min-w-42'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {row.code?.trim() || `#${row.id}`}
                      </p>
                    </TableCell>
                  ) : null}

                  {showColumn('client') ? (
                    <TableCell className='min-w-48'>
                      <div className='flex items-start gap-3'>
                        <Avatar
                          size='default'
                          className='mt-0.5 shrink-0'
                          aria-hidden
                        >
                          {pictureSrc ? (
                            <AvatarImage src={pictureSrc} alt='' />
                          ) : null}
                          <AvatarFallback className='text-xs'>
                            {getInitials(clientName ?? '', 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {clientName || (
                              <TableCellEmpty label='Unknown client' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug font-medium'>
                            {clientCode || clientEmail || 'No client code'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}

                  {showColumn('enrollmentReference') ? (
                    <TableCell>
                      <span className='text-[13px] font-semibold'>
                        {enrollmentCode || (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </span>
                    </TableCell>
                  ) : null}

                  {showColumn('enrolledProgram') ? (
                    <TableCell className='min-w-74'>
                      <div className='flex items-start gap-3'>
                        <ProgramThumbnail thumbnailUrl={programThumbnail} />
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {programTitle || (
                              <TableCellEmpty label='No program linked' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug font-medium'>
                            {programCode || 'No program code'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}

                  {showColumn('status') ? (
                    <TableCell>
                      {status && statusStyle && StatusIcon ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                        >
                          <StatusIcon className='size-3.5 shrink-0' />
                          {STATUS_LABEL[status]}
                        </span>
                      ) : (
                        <span className='border-border bg-muted/60 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold'>
                          {(row.status ?? 'unknown').trim() || '—'}
                        </span>
                      )}
                    </TableCell>
                  ) : null}

                  {showColumn('careWindow') ? (
                    <TableCell className='min-w-60'>
                      {startDate ?? '—'} <span className='mx-1'>&rarr;</span>{' '}
                      {endDate ?? '—'}
                    </TableCell>
                  ) : null}

                  {showColumn('lastLoggedAt') ? (
                    <TableCell>
                      {lastLoggedAt ? (
                        <span className='text-sm font-medium'>
                          {lastLoggedAt}
                        </span>
                      ) : (
                        <TableCellEmpty label='No logs yet' />
                      )}
                    </TableCell>
                  ) : null}

                  {showColumn('progress') ? (
                    <TableCell>
                      <div className='min-w-28 space-y-1'>
                        <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                          <div
                            className='bg-primary h-full rounded-full'
                            style={{
                              width: `${Math.min(
                                Math.max(progress ?? 0, 0),
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                        <p className='text-muted-foreground text-xs font-semibold'>
                          {progress ?? 0}%
                        </p>
                      </div>
                    </TableCell>
                  ) : null}

                  {showColumn('recency') ? (
                    <TableCell>
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${tone.className}`}
                      >
                        {tone.label}
                      </span>
                    </TableCell>
                  ) : null}

                  {showColumn('careCycle') ? (
                    <TableCell>
                      {row.cycle_number != null ? (
                        <span className='text-[13px] font-semibold'>{`Cycle ${row.cycle_number}`}</span>
                      ) : (
                        <TableCellEmpty label='—' />
                      )}
                    </TableCell>
                  ) : null}

                  {showColumn('lastUpdatedAt') ? (
                    <TableCell>
                      {lastUpdatedAt ? (
                        <span className='text-sm font-medium'>
                          {lastUpdatedAt}
                        </span>
                      ) : (
                        <TableCellEmpty label='No update date' />
                      )}
                    </TableCell>
                  ) : null}

                  {showColumn('actions') ? (
                    <TableCell>
                      <div className='flex justify-end'>
                        <Button
                          asChild
                          variant='outline'
                          className='bg-background hover:bg-muted h-9 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                        >
                          <Link
                            href={ROUTES.ADMIN.MODULES.CARE_PLAN_LOGS.DETAIL(
                              String(row.id),
                            )}
                          >
                            View Logs
                            <ArrowRightIcon className='size-3.5' />
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
    </TableListShell>
  );
}

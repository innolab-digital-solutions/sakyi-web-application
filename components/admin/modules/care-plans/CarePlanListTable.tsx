'use client';

import { format, parseISO } from 'date-fns';
import {
  ActivityIcon,
  CheckCircle2Icon,
  FileTextIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import { type ComponentType, useEffect, useMemo, useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import CarePlanFilters from '@/components/admin/modules/care-plans/CarePlanFilters';
import CarePlanRowActions from '@/components/admin/modules/care-plans/CarePlanRowActions';
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
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import type {
  AdminCarePlan,
  CarePlanStatus,
} from '@/domains/care-plans/types/admin';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.CARE_PLANS.LIST;

type CarePlanColumnKey =
  | 'reference'
  | 'client'
  | 'enrollmentReference'
  | 'enrolledProgram'
  | 'status'
  | 'startsOn'
  | 'endsOn'
  | 'dayCount'
  | 'cycleNumber'
  | 'lastUpdatedAt'
  | 'actions';

type CarePlanColumnDefinition = {
  key: CarePlanColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

const CARE_PLAN_VISIBLE_COLUMNS_STORAGE_KEY =
  'sakyi:admin:care-plans:visible-columns:v2';

const DEFAULT_VISIBLE_COLUMN_KEYS: readonly CarePlanColumnKey[] = [
  'reference',
  'client',
  'enrolledProgram',
  'status',
  'startsOn',
  'endsOn',
  'actions',
];

const CARE_PLAN_COLUMNS: readonly CarePlanColumnDefinition[] = [
  {
    key: 'reference',
    label: 'Reference',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'client',
    label: 'Client',
    headerClassName: '',
    skeletonWidth: 'w-48',
  },
  {
    key: 'enrollmentReference',
    label: 'Enrollment Reference',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'enrolledProgram',
    label: 'Enrolled Program',
    headerClassName: '',
    skeletonWidth: 'w-48',
  },
  {
    key: 'status',
    label: 'Status',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'startsOn',
    label: 'Starts On',
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-28',
  },
  {
    key: 'endsOn',
    label: 'Ends On',
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-28',
  },
  {
    key: 'dayCount',
    label: 'Duration',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'cycleNumber',
    label: 'Care Cycle',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'lastUpdatedAt',
    label: 'Last Updated At',
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-28',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: 'text-end',
    skeletonWidth: 'w-32',
  },
] as const;

const STATUS_LABEL: Record<CarePlanStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const CARE_PLAN_STATUS_STYLES: Record<
  CarePlanStatus,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  draft: {
    icon: FileTextIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  active: {
    icon: ActivityIcon,
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

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

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
  const [useFallback, setUseFallback] = useState(() => !thumbnailUrl?.trim());
  const src = useFallback
    ? PROGRAM_THUMBNAIL_FALLBACK
    : resolveProgramThumbnailUrl(thumbnailUrl);
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

function normalizeStatus(
  value: string | null | undefined,
): CarePlanStatus | null {
  const status = (value ?? '').trim().toLowerCase();
  if (
    status === 'draft' ||
    status === 'active' ||
    status === 'completed' ||
    status === 'cancelled'
  ) {
    return status;
  }
  return null;
}

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function getReference(row: AdminCarePlan): string {
  const code = row.code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

export default function CarePlanListTable() {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    CarePlanColumnKey[]
  >(() => {
    const fallback = [...DEFAULT_VISIBLE_COLUMN_KEYS];
    if (typeof window === 'undefined') return fallback;

    const raw = window.localStorage.getItem(
      CARE_PLAN_VISIBLE_COLUMNS_STORAGE_KEY,
    );
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;

      const allowed = new Set(CARE_PLAN_COLUMNS.map((column) => column.key));
      const next = parsed.filter(
        (value): value is CarePlanColumnKey =>
          typeof value === 'string' && allowed.has(value as CarePlanColumnKey),
      );

      return next.length > 0 ? next : fallback;
    } catch {
      return fallback;
    }
  });

  const { rows, controls } = useTable<AdminCarePlan>(LIST_ENDPOINT, {
    params: {
      sync: true,
      writeInitialToUrl: true,
      extra: {
        mode: 'allowlist',
        allowlist: ['status'],
      },
    },
  });

  const statusFilter = useMemo(() => {
    const value = controls.params.values.status?.trim().toLowerCase();
    if (
      value === 'draft' ||
      value === 'active' ||
      value === 'completed' ||
      value === 'cancelled'
    ) {
      return value;
    }
    return 'all' as const;
  }, [controls.params.values.status]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load care plans.';

  const visibleColumns = useMemo(
    () =>
      CARE_PLAN_COLUMNS.filter((column) =>
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
      CARE_PLAN_VISIBLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      const nextColumnKey = CARE_PLAN_COLUMNS.find(
        (column) => column.key === columnKey,
      )?.key;
      if (!nextColumnKey) return current;

      if (current.includes(nextColumnKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== nextColumnKey);
      }

      return CARE_PLAN_COLUMNS.map((column) => column.key).filter(
        (key) => key === nextColumnKey || current.includes(key),
      );
    });
  };

  const resetColumns = () => {
    setVisibleColumnKeys([...DEFAULT_VISIBLE_COLUMN_KEYS]);
  };

  const showColumn = (columnKey: CarePlanColumnKey) =>
    visibleColumnSet.has(columnKey);

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search ...'
      filters={
        <CarePlanFilters
          statusFilter={statusFilter}
          onClearStatus={() => controls.params.clear(['status'])}
          onSetStatus={(status) => controls.params.set({ status })}
          columns={CARE_PLAN_COLUMNS}
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
          {showSkeleton ? (
            <TableSkeletonRows
              rowCount={15}
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
              title='No Care Plans Found'
              description='No care plans found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
            />
          ) : null}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((row) => {
              const lifecycle = normalizeStatus(row.status);
              const statusStyle = lifecycle
                ? CARE_PLAN_STATUS_STYLES[lifecycle]
                : null;
              const StatusIcon = statusStyle?.icon;
              const dateStart = formatDateCell(row.starts_on);
              const dateEnd = formatDateCell(row.ends_on);
              const updatedAt = formatDateCell(row.timestamps?.updated_at);
              const dayCount = row.counts?.days;
              const clientName = row.enrollment?.client?.name?.trim();
              const clientEmail = row.enrollment?.client?.email?.trim();
              const pictureSrc = resolveClientPictureUrl(
                row.enrollment?.client?.picture_url,
              );
              const enrollmentCode = row.enrollment?.code?.trim();
              const enrollmentProgram = (
                row.enrollment as
                  | {
                      program?: {
                        title?: string | null;
                        code?: string | null;
                        thumbnail_url?: string | null;
                      } | null;
                    }
                  | null
                  | undefined
              )?.program;
              const programTitle = enrollmentProgram?.title?.trim();
              const programCode = enrollmentProgram?.code?.trim();
              const programThumbnail = enrollmentProgram?.thumbnail_url;

              return (
                <TableRow key={row.id}>
                  {showColumn('reference') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {getReference(row)}
                      </p>
                    </TableCell>
                  ) : null}
                  {showColumn('client') ? (
                    <TableCell>
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
                              <TableCellEmpty label='No client linked' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                            {clientEmail || 'No email on file'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {showColumn('enrollmentReference') ? (
                    <TableCell>
                      <span className='text-foreground font-se text-[13px]'>
                        {enrollmentCode || (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </span>
                    </TableCell>
                  ) : null}
                  {showColumn('enrolledProgram') ? (
                    <TableCell>
                      <div className='flex items-start gap-3'>
                        <ProgramThumbnail thumbnailUrl={programThumbnail} />
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {programTitle || (
                              <TableCellEmpty label='No program linked' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                            {programCode || 'No program code'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {showColumn('status') ? (
                    <TableCell>
                      {lifecycle && statusStyle && StatusIcon ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                        >
                          <StatusIcon className='size-3.5 shrink-0' />
                          {STATUS_LABEL[lifecycle]}
                        </span>
                      ) : (
                        <span className='border-border bg-muted/60 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold'>
                          {(row.status ?? 'unknown').trim() || '—'}
                        </span>
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('startsOn') ? (
                    <TableCell>
                      {dateStart ?? <TableCellEmpty label='No start date' />}
                    </TableCell>
                  ) : null}
                  {showColumn('endsOn') ? (
                    <TableCell>
                      {dateEnd ?? <TableCellEmpty label='Open-ended' />}
                    </TableCell>
                  ) : null}
                  {showColumn('dayCount') ? (
                    <TableCell>
                      {typeof dayCount === 'number' ? (
                        <span className='text-[13px] font-semibold'>
                          {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                        </span>
                      ) : (
                        <TableCellEmpty label='—' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('cycleNumber') ? (
                    <TableCell>
                      <span className='text-[13px] font-semibold'>
                        {row.cycle_number != null ? (
                          `Cycle ${row.cycle_number}`
                        ) : (
                          <TableCellEmpty label='—' />
                        )}
                      </span>
                    </TableCell>
                  ) : null}
                  {showColumn('lastUpdatedAt') ? (
                    <TableCell>
                      {updatedAt ?? <TableCellEmpty label='No update date' />}
                    </TableCell>
                  ) : null}
                  {showColumn('actions') ? (
                    <TableCell>
                      <CarePlanRowActions row={row} />
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

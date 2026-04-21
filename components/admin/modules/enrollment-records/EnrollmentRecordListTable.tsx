'use client';

import { format, parseISO } from 'date-fns';
import {
  ActivityIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import { type ComponentType, useEffect, useMemo, useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import EnrollmentRecordFilters from '@/components/admin/modules/enrollment-records/EnrollmentRecordFilters';
import EnrollmentRecordRowActions from '@/components/admin/modules/enrollment-records/EnrollmentRecordRowActions';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import type {
  AdminEnrollment,
  EnrollmentLifecycleStatus,
} from '@/domains/enrollment-records/types/admin';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.LIST;

type EnrollmentRecordColumnKey =
  | 'reference'
  | 'client'
  | 'program'
  | 'assignedMembers'
  | 'status'
  | 'startsAt'
  | 'endsAt'
  | 'lastUpdatedAt'
  | 'intakeReference'
  | 'contract'
  | 'createdAt'
  | 'actions';

type EnrollmentRecordColumnDefinition = {
  key: EnrollmentRecordColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

/** Bumped when default visibility changes. */
const ENROLLMENT_RECORD_VISIBLE_COLUMNS_STORAGE_KEY =
  'sakyi:admin:enrollment-records:visible-columns:v2';

/** Default triage set; staff can surface intake, contract, and created from Columns. */
const DEFAULT_VISIBLE_COLUMN_KEYS: readonly EnrollmentRecordColumnKey[] = [
  'reference',
  'client',
  'program',
  'assignedMembers',
  'status',
  'startsAt',
  'endsAt',
  'actions',
];

const ENROLLMENT_RECORD_COLUMNS: readonly EnrollmentRecordColumnDefinition[] = [
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
    skeletonWidth: 'w-44',
  },
  {
    key: 'program',
    label: 'Program',
    headerClassName: '',
    skeletonWidth: 'w-48',
  },
  {
    key: 'assignedMembers',
    label: 'Assigned Members',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'status',
    label: 'Status',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'startsAt',
    label: 'Starts At',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'endsAt',
    label: 'Ends At',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'lastUpdatedAt',
    label: 'Last Updated At',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'intakeReference',
    label: 'Intake reference',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'contract',
    label: 'Contract',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'createdAt',
    label: 'Created At',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: 'text-end',
    skeletonWidth: 'w-32',
  },
] as const;

const STATUS_LABEL: Record<EnrollmentLifecycleStatus, string> = {
  scheduled: 'Scheduled',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ENROLLMENT_STATUS_STYLES: Record<
  EnrollmentLifecycleStatus,
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  scheduled: {
    icon: ClockIcon,
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

function normalizeEnrollmentStatus(
  raw: string | undefined,
): EnrollmentLifecycleStatus | null {
  const s = (raw ?? '').trim().toLowerCase();
  if (
    s === 'scheduled' ||
    s === 'active' ||
    s === 'completed' ||
    s === 'cancelled'
  ) {
    return s;
  }
  return null;
}

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function resolveMemberPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function resolveProgramThumbnailUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return PROGRAM_THUMBNAIL_FALLBACK;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
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

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function getEnrollmentReference(row: AdminEnrollment): string {
  const code = row.code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

function getProgramLabel(row: AdminEnrollment): string {
  if (row.program?.title?.trim()) return row.program.title.trim();
  if (row.program?.slug?.trim()) return row.program.slug.trim();
  return '—';
}

function getProgramCode(row: AdminEnrollment): string {
  const code = row.program?.code?.trim();
  if (code) return code;
  if (row.program?.id != null) return `ID ${row.program.id}`;
  return '—';
}

export default function EnrollmentRecordListTable() {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<
    EnrollmentRecordColumnKey[]
  >(() => {
    const fallback = [...DEFAULT_VISIBLE_COLUMN_KEYS];
    if (typeof window === 'undefined') return fallback;

    const raw = window.localStorage.getItem(
      ENROLLMENT_RECORD_VISIBLE_COLUMNS_STORAGE_KEY,
    );
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;

      const allowed = new Set(
        ENROLLMENT_RECORD_COLUMNS.map((column) => column.key),
      );
      const next = parsed.filter(
        (value): value is EnrollmentRecordColumnKey =>
          typeof value === 'string' &&
          allowed.has(value as EnrollmentRecordColumnKey),
      );

      return next.length > 0 ? next : fallback;
    } catch {
      return fallback;
    }
  });

  const { rows, controls } = useTable<AdminEnrollment>(LIST_ENDPOINT, {
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
    const v = controls.params.values.status?.trim().toLowerCase();
    if (
      v === 'scheduled' ||
      v === 'active' ||
      v === 'completed' ||
      v === 'cancelled'
    ) {
      return v;
    }
    return 'all' as const;
  }, [controls.params.values.status]);

  const visibleColumns = useMemo(
    () =>
      ENROLLMENT_RECORD_COLUMNS.filter((column) =>
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

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load enrollment records.';

  useEffect(() => {
    window.localStorage.setItem(
      ENROLLMENT_RECORD_VISIBLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      const nextColumnKey = ENROLLMENT_RECORD_COLUMNS.find(
        (column) => column.key === columnKey,
      )?.key;
      if (!nextColumnKey) return current;

      if (current.includes(nextColumnKey)) {
        if (current.length === 1) return current;
        return current.filter((key) => key !== nextColumnKey);
      }

      return ENROLLMENT_RECORD_COLUMNS.map((column) => column.key).filter(
        (key) => key === nextColumnKey || current.includes(key),
      );
    });
  };

  const resetColumns = () => {
    setVisibleColumnKeys([...DEFAULT_VISIBLE_COLUMN_KEYS]);
  };

  const showColumn = (columnKey: EnrollmentRecordColumnKey) =>
    visibleColumnSet.has(columnKey);

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search ...'
      filters={
        <EnrollmentRecordFilters
          statusFilter={statusFilter}
          onClearStatus={() => controls.params.clear(['status'])}
          onSetStatus={(status) => controls.params.set({ status })}
          columns={ENROLLMENT_RECORD_COLUMNS}
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
              cellWidths={[...visibleSkeletonWidths]}
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
                title='No Enrollment Records Found'
                description='No enrollment records found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((row) => {
              const pictureSrc = resolveClientPictureUrl(
                row.client?.picture_url,
              );
              const programLabel = getProgramLabel(row);
              const programCode = getProgramCode(row);
              const lastUpdatedAt = formatDateCell(row.timestamps?.updated_at);
              const createdAt = formatDateCell(row.timestamps?.created_at);
              const startsAt = formatDateCell(row.starts_at);
              const endsAt = formatDateCell(row.ends_at);
              const lifecycle = normalizeEnrollmentStatus(row.status);
              const statusStyle = lifecycle
                ? ENROLLMENT_STATUS_STYLES[lifecycle]
                : null;
              const StatusIcon = statusStyle?.icon;
              const assignedMembers = row.team_members ?? [];
              const visibleAssignedMembers = assignedMembers.slice(0, 3);
              const hiddenAssignedMembers = assignedMembers.slice(3);
              const remainingAssignedMembers =
                assignedMembers.length - visibleAssignedMembers.length;

              return (
                <TableRow key={row.id}>
                  {showColumn('reference') ? (
                    <TableCell className='min-w-44'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {getEnrollmentReference(row)}
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
                            {getInitials(row.client?.name ?? '', 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {row.client?.name?.trim() ? (
                              row.client.name.trim()
                            ) : (
                              <TableCellEmpty label='Name not provided' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                            {row.client?.email?.trim() ?? 'No email on file'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {showColumn('program') ? (
                    <TableCell className='min-w-62'>
                      <div className='flex items-start gap-3'>
                        <ProgramThumbnail
                          thumbnailUrl={row.program?.thumbnail_url}
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
                  ) : null}
                  {showColumn('assignedMembers') ? (
                    <TableCell>
                      {assignedMembers.length > 0 ? (
                        <TooltipProvider delayDuration={100}>
                          <div className='flex items-center'>
                            {visibleAssignedMembers.map((member, index) => {
                              const name =
                                member.user?.name?.trim() || 'Unknown member';
                              const position =
                                member.position?.trim() || 'No position';
                              const picture = resolveMemberPictureUrl(
                                member.user?.picture_url,
                              );
                              return (
                                <Tooltip key={member.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className='ring-background relative inline-flex cursor-default rounded-full ring-2'
                                      style={{
                                        marginLeft: index === 0 ? 0 : -8,
                                      }}
                                    >
                                      <Avatar className='size-8'>
                                        {picture ? (
                                          <AvatarImage
                                            src={picture}
                                            alt={name}
                                            className='object-cover object-center'
                                          />
                                        ) : null}
                                        <AvatarFallback className='text-[10px]'>
                                          {getInitials(name, 2) || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side='top'
                                    surface
                                    className='max-w-64'
                                  >
                                    <p className='text-xs font-semibold'>
                                      {name}
                                    </p>
                                    <p className='text-muted-foreground text-[10px] font-semibold'>
                                      {position}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                            {remainingAssignedMembers > 0 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className='bg-muted text-foreground ring-background inline-flex size-8 items-center justify-center rounded-full text-[11px] font-semibold ring-2'
                                    style={{ marginLeft: -8 }}
                                  >
                                    +{remainingAssignedMembers}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side='top'
                                  surface
                                  className='max-w-64 space-y-1'
                                >
                                  {hiddenAssignedMembers.map((member) => {
                                    const name =
                                      member.user?.name?.trim() ||
                                      'Unknown member';
                                    const position =
                                      member.position?.trim() ||
                                      'No position';
                                    return (
                                      <div key={member.id} className='space-y-0.5'>
                                        <p className='text-xs font-semibold'>
                                          {name}
                                        </p>
                                        <p className='text-muted-foreground text-[10px] font-semibold'>
                                          {position}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                          </div>
                        </TooltipProvider>
                      ) : (
                        <TableCellEmpty label='Not assigned' />
                      )}
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
                  {showColumn('startsAt') ? (
                    <TableCell>
                      {startsAt ?? <TableCellEmpty label='No start date' />}
                    </TableCell>
                  ) : null}
                  {showColumn('endsAt') ? (
                    <TableCell>
                      {endsAt ?? <TableCellEmpty label='No end date' />}
                    </TableCell>
                  ) : null}
                  {showColumn('lastUpdatedAt') ? (
                    <TableCell>
                      {lastUpdatedAt ?? (
                        <TableCellEmpty label='No update date' />
                      )}
                    </TableCell>
                  ) : null}
                  {showColumn('intakeReference') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {row.onboarding_intake?.code?.trim() ? (
                          row.onboarding_intake.code.trim()
                        ) : (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}
                  {showColumn('contract') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {row.enrollment_contract?.code?.trim() ? (
                          row.enrollment_contract.code.trim()
                        ) : (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}
                  {showColumn('createdAt') ? (
                    <TableCell>
                      {createdAt ?? <TableCellEmpty label='—' />}
                    </TableCell>
                  ) : null}
                  {showColumn('actions') ? (
                    <TableCell className='align-center text-end whitespace-nowrap'>
                      <EnrollmentRecordRowActions row={row} />
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

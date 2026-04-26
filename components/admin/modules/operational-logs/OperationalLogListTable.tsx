'use client';

import { format, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import OperationalLogListFilters from '@/components/admin/modules/operational-logs/OperationalLogListFilters';
import OperationalLogRowActions from '@/components/admin/modules/operational-logs/OperationalLogRowActions';
import {
  normalizeOperationalLogStatus,
  OPERATIONAL_LOG_STATUS_STYLES,
  resolveClientPictureUrl,
} from '@/components/admin/modules/operational-logs/reportRunListHelpers';
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
import type { OperationalLogListRow } from '@/domains/care-plans/types/operational-log-list';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.OPERATIONAL_LOGS.LIST;
const VISIBLE_STORAGE_KEY = 'sakyi:admin:operational-logs:visible-columns:v2';

const EXTRA_KEYS = ['status', 'care_plan_id'] as const;

type ColumnKey =
  | 'reference'
  | 'client'
  | 'carePlan'
  | 'period'
  | 'status'
  | 'adherence'
  | 'lastActivity'
  | 'createdBy'
  | 'actions';

type ColumnDef = {
  key: ColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

const COLUMNS: readonly ColumnDef[] = [
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
    key: 'carePlan',
    label: 'Linked Care Plan',
    headerClassName: '',
    skeletonWidth: 'w-36',
  },
  {
    key: 'period',
    label: 'Log Period',
    headerClassName: '',
    skeletonWidth: 'w-44',
  },
  {
    key: 'status',
    label: 'Status',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'adherence',
    label: 'Adherence',
    headerClassName: '',
    skeletonWidth: 'w-24',
  },
  {
    key: 'lastActivity',
    label: 'Last updated',
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-32',
  },
  {
    key: 'createdBy',
    label: 'Created by',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: 'text-end',
    skeletonWidth: 'w-32',
  },
] as const;

const OPERATIONAL_LOG_STATUSES = ['draft', 'in_progress', 'locked'] as const;

const OPERATIONAL_LOG_STATUS_LABELS: Record<
  (typeof OPERATIONAL_LOG_STATUSES)[number],
  string
> = {
  draft: 'Draft',
  in_progress: 'In progress',
  locked: 'Locked',
};

/** Core columns on first load; adherence, last updated, and created by are opt-in. */
const DEFAULT_VISIBLE: readonly ColumnKey[] = [
  'reference',
  'client',
  'carePlan',
  'period',
  'status',
  'actions',
];

function getReference(row: OperationalLogListRow): string {
  const code = row.code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

function formatListDate(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function formatListDateTime(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMM-yyyy HH:mm');
  } catch {
    return iso.trim();
  }
}

function formatPeriodRow(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  const a = formatListDate(start);
  const b = formatListDate(end);
  if (a && b) {
    return (
      <>
        {a}
        <span className='text-muted-foreground mx-1'>&rarr;</span>
        {b}
      </>
    );
  }
  if (a) return a;
  if (b) return b;
  return null;
}

export default function OperationalLogListTable() {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<ColumnKey[]>(
    () => {
      const fallback = [...DEFAULT_VISIBLE];
      if (typeof window === 'undefined') return fallback;
      const raw = window.localStorage.getItem(VISIBLE_STORAGE_KEY);
      if (!raw) return fallback;
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return fallback;
        const allowed = new Set(COLUMNS.map((c) => c.key));
        const next = parsed.filter(
          (k): k is ColumnKey =>
            typeof k === 'string' && allowed.has(k as ColumnKey),
        );
        const deduped = Array.from(new Set(next));
        return deduped.length > 0 ? deduped : fallback;
      } catch {
        return fallback;
      }
    },
  );

  const { rows, controls } = useTable<OperationalLogListRow>(LIST_ENDPOINT, {
    params: {
      sync: true,
      writeInitialToUrl: true,
      extra: {
        mode: 'allowlist',
        allowlist: [...EXTRA_KEYS],
      },
    },
  });

  const statusFilter = useMemo((): 'all' | 'draft' | 'in_progress' | 'locked' => {
    const s = (controls.params.values.status ?? '').trim().toLowerCase();
    if (s === 'draft' || s === 'in_progress' || s === 'locked') return s;
    return 'all';
  }, [controls.params.values.status]);

  useEffect(() => {
    window.localStorage.setItem(
      VISIBLE_STORAGE_KEY,
      JSON.stringify(visibleColumnKeys),
    );
  }, [visibleColumnKeys]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load operational logs.';

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => visibleColumnKeys.includes(c.key)),
    [visibleColumnKeys],
  );
  const visibleSet = useMemo(
    () => new Set(visibleColumnKeys),
    [visibleColumnKeys],
  );
  const colCount = Math.max(1, visibleColumns.length);
  const skeletonWidths = useMemo(
    () => visibleColumns.map((c) => c.skeletonWidth),
    [visibleColumns],
  );
  const show = (k: ColumnKey) => visibleSet.has(k);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((cur) => {
      const k = COLUMNS.find((c) => c.key === columnKey)?.key;
      if (!k) return cur;
      if (cur.includes(k)) {
        if (cur.length === 1) return cur;
        return cur.filter((x) => x !== k);
      }
      return COLUMNS.map((c) => c.key).filter(
        (key) => key === k || cur.includes(key as ColumnKey),
      );
    });
  };

  const resetColumns = () => setVisibleColumnKeys([...DEFAULT_VISIBLE]);

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search ...'
      filters={
        <OperationalLogListFilters
          statusFilter={statusFilter}
          statuses={OPERATIONAL_LOG_STATUSES}
          labels={OPERATIONAL_LOG_STATUS_LABELS}
          onClearStatus={() => controls.params.clear(['status'])}
          onSetStatus={(status) => controls.params.set({ status })}
          columns={COLUMNS}
          visibleColumnKeys={visibleColumnKeys}
          onToggleColumn={toggleColumn}
          onResetColumns={resetColumns}
        />
      }
    >
      <Table className='w-full min-w-7xl'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            {visibleColumns.map((col) => (
              <TableHead key={col.key} className={col.headerClassName}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton ? (
            <TableSkeletonRows
              rowCount={15}
              columnCount={colCount}
              cellWidths={[...skeletonWidths]}
            />
          ) : null}

          {!showSkeleton && query.isError ? (
            <TableRow>
              <TableCell
                colSpan={colCount}
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
              colSpan={colCount}
              title='No operational logs found'
              description="No operational logs found. None may exist yet, or your filters may be hiding results. Adjust your filters or check back later."
            />
          ) : null}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((row) => {
              const client = row.client;
              const carePlan = row.care_plan;
              const pictureSrc = resolveClientPictureUrl(client?.picture_url);
              const clientName = client?.name?.trim();
              const clientEmail = client?.email?.trim();
              const opStatus = normalizeOperationalLogStatus(row.status);
              const opStatusStyle = opStatus
                ? OPERATIONAL_LOG_STATUS_STYLES[opStatus]
                : null;
              const StatusIcon = opStatusStyle?.icon;
              const lastUpdatedAt = formatListDateTime(
                row.timestamps?.updated_at,
              );
              const carePlanCode = carePlan?.code?.trim();
              const periodContent = formatPeriodRow(
                row.period?.starts_on,
                row.period?.ends_on,
              );
              return (
                <TableRow key={row.id}>
                  {show('reference') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {getReference(row)}
                      </p>
                    </TableCell>
                  ) : null}
                  {show('client') ? (
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
                  {show('carePlan') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {carePlanCode || (
                          <TableCellEmpty label='Not linked' />
                        )}
                      </p>
                    </TableCell>
                  ) : null}
                  {show('period') ? (
                    <TableCell>
                      {periodContent ?? <TableCellEmpty label='—' />}
                    </TableCell>
                  ) : null}
                  {show('status') ? (
                    <TableCell>
                      {opStatus && opStatusStyle && StatusIcon ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${opStatusStyle.className}`}
                        >
                          <StatusIcon className='size-3.5 shrink-0' />
                          {opStatusStyle.label}
                        </span>
                      ) : (
                        <span className='border-border bg-muted/60 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap'>
                          {(row.status ?? 'unknown').trim() || '—'}
                        </span>
                      )}
                    </TableCell>
                  ) : null}
                  {show('adherence') ? (
                    <TableCell>
                      {row.adherence_percentage != null ? (
                        <span className='text-[13px] font-semibold tabular-nums'>
                          {Math.round(row.adherence_percentage)}%
                        </span>
                      ) : (
                        <TableCellEmpty label='—' />
                      )}
                    </TableCell>
                  ) : null}
                  {show('lastActivity') ? (
                    <TableCell>
                      {lastUpdatedAt ? (
                        <p className='text-[13px] font-medium tabular-nums'>
                          {lastUpdatedAt}
                        </p>
                      ) : (
                        <TableCellEmpty label='No update date' />
                      )}
                    </TableCell>
                  ) : null}
                  {show('createdBy') ? (
                    <TableCell>
                      <span className='text-foreground text-[13px] font-semibold'>
                        {row.created_by?.name?.trim() || (
                          <TableCellEmpty label='—' />
                        )}
                      </span>
                    </TableCell>
                  ) : null}
                  {show('actions') ? (
                    <TableCell>
                      <OperationalLogRowActions row={row} />
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

'use client';

import { FileTextIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import {
  CLIENT_REPORT_STATUS_STYLES,
  formatDateTimeCell,
  formatPeriodRange,
  normalizeClientReportStatus,
  resolveClientPictureUrl,
  UNKNOWN_STATUS_BADGE_CLASS,
} from '@/components/admin/modules/operational-logs/reportRunListHelpers';
import PeriodReportListFilters from '@/components/admin/modules/period-reports/PeriodReportListFilters';
import PeriodReportRowActions from '@/components/admin/modules/period-reports/PeriodReportRowActions';
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
import type { ClientReportListRow } from '@/domains/care-plans/types/client-report-list';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.PERIOD_REPORTS.LIST;
const VISIBLE_STORAGE_KEY = 'sakyi:admin:period-reports:visible-columns:v2';

const EXTRA_KEYS = ['status', 'care_plan_id'] as const;

type ColumnKey =
  | 'client'
  | 'carePlan'
  | 'report'
  | 'operationalLog'
  | 'period'
  | 'status'
  | 'adherence'
  | 'submittedAt'
  | 'publishedAt'
  | 'actions';

type ColumnDef = {
  key: ColumnKey;
  label: string;
  headerClassName: string;
  skeletonWidth: string;
};

const COLUMNS: readonly ColumnDef[] = [
  {
    key: 'client',
    label: 'Client',
    headerClassName: '',
    skeletonWidth: 'w-48',
  },
  {
    key: 'carePlan',
    label: 'Care Plan',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'report',
    label: 'Client report',
    headerClassName: '',
    skeletonWidth: 'w-32',
  },
  {
    key: 'operationalLog',
    label: 'Op log',
    headerClassName: '',
    skeletonWidth: 'w-28',
  },
  {
    key: 'period',
    label: 'Period',
    headerClassName: '',
    skeletonWidth: 'w-40',
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
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-24',
  },
  {
    key: 'submittedAt',
    label: 'Submitted',
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-36',
  },
  {
    key: 'publishedAt',
    label: 'Published',
    headerClassName: 'tabular-nums',
    skeletonWidth: 'w-36',
  },
  {
    key: 'actions',
    label: 'Actions',
    headerClassName: 'text-end',
    skeletonWidth: 'w-32',
  },
] as const;

const PERIOD_REPORT_STATUSES = ['in_review', 'published', 'archived'] as const;

const PERIOD_REPORT_STATUS_LABELS: Record<
  (typeof PERIOD_REPORT_STATUSES)[number],
  string
> = {
  in_review: 'In review',
  published: 'Published',
  archived: 'Archived',
};

/** Matches the API default list (omitted status = in review + published). */
const PERIOD_REPORT_ALL_STATUSES_MENU_LABEL = 'In review & published (default)';

const DEFAULT_VISIBLE: readonly ColumnKey[] = [
  'client',
  'carePlan',
  'report',
  'period',
  'status',
  'adherence',
  'submittedAt',
  'publishedAt',
  'actions',
];

export default function PeriodReportListTable() {
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

  const { rows, controls } = useTable<ClientReportListRow>(LIST_ENDPOINT, {
    params: {
      sync: true,
      writeInitialToUrl: true,
      extra: {
        mode: 'allowlist',
        allowlist: [...EXTRA_KEYS],
      },
    },
  });

  const statusFilter = useMemo(():
    | 'all'
    | 'in_review'
    | 'published'
    | 'archived' => {
    const s = (controls.params.values.status ?? '').trim().toLowerCase();
    if (s === 'in_review' || s === 'published' || s === 'archived') return s;
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
      : 'Could not load period reports.';

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
      if (k === 'actions') return cur;
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
        <PeriodReportListFilters
          statusFilter={statusFilter}
          statuses={PERIOD_REPORT_STATUSES}
          labels={PERIOD_REPORT_STATUS_LABELS}
          allStatusesMenuLabel={PERIOD_REPORT_ALL_STATUSES_MENU_LABEL}
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
              title='No Period Reports Found'
              description='No period reports found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
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
              const clientCode = client?.client_code?.trim();
              const clientEmail = client?.email?.trim();
              const reportStatus = normalizeClientReportStatus(row.status);
              const style = reportStatus
                ? CLIENT_REPORT_STATUS_STYLES[reportStatus]
                : null;
              const StatusIcon = style?.icon ?? FileTextIcon;
              return (
                <TableRow key={row.id}>
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
                            {clientCode || clientEmail || '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {show('carePlan') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {carePlan?.code?.trim() || <TableCellEmpty label='—' />}
                      </p>
                    </TableCell>
                  ) : null}
                  {show('report') ? (
                    <TableCell>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {row.code?.trim() || `#${row.id}`}
                      </p>
                    </TableCell>
                  ) : null}
                  {show('operationalLog') ? (
                    <TableCell>
                      {row.operational_log ? (
                        <p className='text-foreground font-mono text-[13px] font-semibold'>
                          {row.operational_log.code?.trim() ||
                            `#${row.operational_log.id}`}
                        </p>
                      ) : (
                        <TableCellEmpty label='—' />
                      )}
                    </TableCell>
                  ) : null}
                  {show('period') ? (
                    <TableCell>
                      <p className='text-[13px] font-medium tabular-nums'>
                        {formatPeriodRange(
                          row.period?.starts_on,
                          row.period?.ends_on,
                        )}
                      </p>
                    </TableCell>
                  ) : null}
                  {show('status') ? (
                    <TableCell>
                      {style ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
                            style.className,
                          )}
                        >
                          <StatusIcon className='size-3.5 shrink-0' />
                          {style.label}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            UNKNOWN_STATUS_BADGE_CLASS,
                            'inline-flex',
                          )}
                        >
                          <FileTextIcon className='size-3.5 shrink-0' />
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
                  {show('submittedAt') ? (
                    <TableCell>
                      {formatDateTimeCell(
                        row.timestamps?.submitted_for_review_at,
                      ) ?? <TableCellEmpty label='—' />}
                    </TableCell>
                  ) : null}
                  {show('publishedAt') ? (
                    <TableCell>
                      {row.status === 'published' ? (
                        (formatDateTimeCell(row.timestamps?.published_at) ?? (
                          <TableCellEmpty label='—' />
                        ))
                      ) : (
                        <TableCellEmpty label='—' />
                      )}
                    </TableCell>
                  ) : null}
                  {show('actions') ? (
                    <TableCell>
                      <PeriodReportRowActions row={row} />
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

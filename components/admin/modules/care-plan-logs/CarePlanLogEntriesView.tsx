'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ExternalLinkIcon } from 'lucide-react';

import TableListShell from '@/components/admin/layout/TableListShell';
import TextField from '@/components/shared/form/TextField';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  type CarePlanLogEntry,
  type CarePlanLogSection,
  getCarePlanLogSummary,
} from '@/domains/care-plans/services';
import { useTable } from '@/lib/table';

type Props = {
  carePlanId: number;
};

const ENTRIES_FILTER_KEYS = ['section', 'is_completed', 'date_from', 'date_to'] as const;
const ENTRIES_ENDPOINT = (id: number) =>
  ENDPOINTS.ADMIN.MODULES.CARE_PLAN_LOGS.ENTRIES(String(id));

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

function toTargetActualLabel(
  value: number | string | null | undefined,
  unit: string | null | undefined,
): string {
  if (value == null || String(value).trim() === '') return '—';
  const base = String(value).trim();
  const normalizedUnit = unit?.trim();
  return normalizedUnit ? `${base} ${normalizedUnit}` : base;
}

export default function CarePlanLogEntriesView({ carePlanId }: Props) {
  const summaryQuery = useQuery({
    queryKey: ['care-plan-logs', carePlanId, 'summary'],
    queryFn: async () => {
      const response = await getCarePlanLogSummary(carePlanId);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not load care plan log summary.');
      }
      return response.data;
    },
  });

  const { rows, controls } = useTable<CarePlanLogEntry>(ENTRIES_ENDPOINT(carePlanId), {
    params: {
      sync: true,
      writeInitialToUrl: true,
      extra: {
        mode: 'allowlist',
        allowlist: [...ENTRIES_FILTER_KEYS],
      },
    },
  });

  const sectionFilter = controls.params.values.section as CarePlanLogSection | undefined;
  const completionFilter = controls.params.values.is_completed;
  const dateFrom = controls.params.values.date_from ?? '';
  const dateTo = controls.params.values.date_to ?? '';

  const query = controls.query;
  const showSkeleton = query.isPending && !query.data;
  const entryError =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load care plan log entries.';

  const summary = summaryQuery.data;
  const progress = summary?.completion_signal?.window_progress_percentage ?? 0;
  const isRecent = summary?.completion_signal?.is_logging_recent === true;

  return (
    <div className='space-y-5'>
      <div className='border-border rounded-md border bg-white p-4 shadow-xs'>
        {summaryQuery.isPending ? (
          <p className='text-muted-foreground text-sm'>Loading summary...</p>
        ) : summaryQuery.isError ? (
          <p className='text-destructive text-sm'>
            {summaryQuery.error instanceof Error
              ? summaryQuery.error.message
              : 'Could not load summary.'}
          </p>
        ) : (
          <div className='space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='space-y-1'>
                <p className='text-sm font-semibold'>
                  {summary?.code?.trim() || `#${summary?.id ?? carePlanId}`}
                </p>
                <p className='text-muted-foreground text-xs font-medium'>
                  {summary?.enrollment?.client?.name?.trim() || 'Unknown client'} -{' '}
                  {summary?.enrollment?.program?.title?.trim() || 'No program'}
                </p>
                <p className='text-muted-foreground text-xs font-medium'>
                  Window: {formatDate(summary?.starts_on) ?? '—'} -{' '}
                  {formatDate(summary?.ends_on) ?? '—'}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <span
                  className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    isRecent
                      ? 'border-emerald-300/80 bg-emerald-50 text-emerald-800'
                      : 'border-amber-300/80 bg-amber-50 text-amber-800'
                  }`}
                >
                  {isRecent ? 'Recent logging' : 'No recent logs'}
                </span>
              </div>
            </div>

            <div className='space-y-1.5'>
              <div className='bg-muted h-2.5 w-full overflow-hidden rounded-full'>
                <div className='bg-primary h-full rounded-full' style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
              </div>
              <p className='text-muted-foreground text-xs font-medium'>{progress}% timeline progress</p>
            </div>
          </div>
        )}
      </div>

      <TableListShell
        controls={controls}
        searchPlaceholder='Search title or notes ...'
        filters={
          <div className='flex flex-wrap items-center gap-2'>
            <Select
              value={sectionFilter ?? 'all'}
              onValueChange={(value) =>
                controls.params.set({
                  section: value === 'all' ? null : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className='h-10 w-40'>
                <SelectValue placeholder='Section' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All sections</SelectItem>
                <SelectItem value='nutrition'>Nutrition</SelectItem>
                <SelectItem value='movement'>Movement</SelectItem>
                <SelectItem value='activity'>Activity</SelectItem>
                <SelectItem value='recovery'>Recovery</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={completionFilter?.trim() || 'all'}
              onValueChange={(value) =>
                controls.params.set({
                  is_completed: value === 'all' ? null : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className='h-10 w-40'>
                <SelectValue placeholder='Completion' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All status</SelectItem>
                <SelectItem value='1'>Completed</SelectItem>
                <SelectItem value='0'>Incomplete</SelectItem>
              </SelectContent>
            </Select>

            <TextField
              type='date'
              className='h-10! w-40'
              value={dateFrom}
              onChange={(event) =>
                controls.params.set({
                  date_from: event.target.value || null,
                  page: 1,
                })
              }
            />
            <TextField
              type='date'
              className='h-10! w-40'
              value={dateTo}
              onChange={(event) =>
                controls.params.set({
                  date_to: event.target.value || null,
                  page: 1,
                })
              }
            />

            <Button
              type='button'
              variant='outline'
              className='h-10 rounded-md border-neutral-300 text-[13px]! font-semibold'
              onClick={() => controls.params.clear([...ENTRIES_FILTER_KEYS])}
            >
              Clear filters
            </Button>
          </div>
        }
      >
        <Table className='w-full min-w-8xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Logged At</TableHead>
              <TableHead>Day / Date</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Media</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton ? (
              <TableSkeletonRows
                rowCount={12}
                columnCount={9}
                cellWidths={[
                  'w-36',
                  'w-36',
                  'w-24',
                  'w-48',
                  'w-28',
                  'w-28',
                  'w-24',
                  'w-48',
                  'w-20',
                ]}
              />
            ) : null}

            {!showSkeleton && query.isError ? (
              <TableRow>
                <TableCell colSpan={9} className='text-destructive py-8 text-center text-sm'>
                  {entryError}
                </TableCell>
              </TableRow>
            ) : null}

            {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.length === 0 ? (
              <TableEmptyStateRow
                colSpan={9}
                title='No logs match current filters'
                description='Try adjusting your section, completion, date range, or search filters.'
              />
            ) : null}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((entry) => {
                const media = Array.isArray(entry.media) ? entry.media : [];
                const firstMedia = media[0];
                const targetLabel = toTargetActualLabel(entry.target?.value, entry.target?.unit);
                const actualLabel = toTargetActualLabel(entry.actual?.value, entry.actual?.unit);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDateTime(entry.logged_at) ?? <TableCellEmpty label='—' />}</TableCell>
                    <TableCell>
                      <div className='space-y-0.5'>
                        <p className='text-sm font-semibold'>Day {entry.day_number ?? '—'}</p>
                        <p className='text-muted-foreground text-xs font-medium'>
                          {formatDate(entry.target_date) ?? '—'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='capitalize'>{entry.section ?? '—'}</span>
                    </TableCell>
                    <TableCell>
                      <p className='max-w-60 truncate text-sm font-medium' title={entry.item_title ?? ''}>
                        {entry.item_title?.trim() || <TableCellEmpty label='No task title' />}
                      </p>
                    </TableCell>
                    <TableCell>{targetLabel}</TableCell>
                    <TableCell>{actualLabel}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                          entry.is_completed
                            ? 'border-emerald-300/80 bg-emerald-50 text-emerald-800'
                            : 'border-amber-300/80 bg-amber-50 text-amber-800'
                        }`}
                      >
                        {entry.is_completed ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className='max-w-72 truncate text-sm font-medium' title={entry.notes ?? ''}>
                        {entry.notes?.trim() || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      {entry.media_count && entry.media_count > 0 && firstMedia ? (
                        <Button
                          type='button'
                          asChild
                          variant='outline'
                          className='bg-background hover:bg-muted h-8 rounded-md border-neutral-300 px-2 text-xs font-semibold'
                        >
                          <a href={firstMedia.url} target='_blank' rel='noreferrer'>
                            {entry.media_count} file{entry.media_count > 1 ? 's' : ''}
                            <ExternalLinkIcon className='size-3.5' />
                          </a>
                        </Button>
                      ) : (
                        <TableCellEmpty label='0' />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableListShell>
    </div>
  );
}

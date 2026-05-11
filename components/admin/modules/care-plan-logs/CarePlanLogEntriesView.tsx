'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ExternalLinkIcon, Loader2Icon, RotateCwIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  type CarePlanLogEntry,
  getCarePlanLogSummary,
  listCarePlanLogEntries,
} from '@/domains/care-plans/services';
import { getInitials } from '@/lib/utils/string';

type Props = {
  carePlanId: number;
};

/** Matches other admin detail overview shells (e.g. client profile, enrollment request). */
const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

const METRIC_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const METRIC_TILE_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

const RELOAD_COOLDOWN_SECONDS = 10;

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
    return format(parseISO(iso.trim()), 'dd-MMM-yyyy h:mm a');
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

function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const v = raw.trim();
  if (v.startsWith('http')) return v;
  return `${base.domainEndpoint}${v}`;
}

function CarePlanLogDetailReloadButton({ carePlanId }: { carePlanId: number }) {
  const queryClient = useQueryClient();
  const [isReloading, setIsReloading] = React.useState(false);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = React.useState(0);

  React.useEffect(() => {
    if (cooldownSecondsLeft <= 0) return;
    const timerId = window.setTimeout(() => {
      setCooldownSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timerId);
  }, [cooldownSecondsLeft]);

  const handleReload = async () => {
    if (isReloading || cooldownSecondsLeft > 0) return;
    setIsReloading(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ['care-plan-logs', carePlanId],
        refetchType: 'active',
      });
      toast.success('Daily task log data has been refreshed.');
      setCooldownSecondsLeft(RELOAD_COOLDOWN_SECONDS);
    } catch {
      toast.error('Could not refresh daily task log data.');
    } finally {
      setIsReloading(false);
    }
  };

  const isDisabled = isReloading || cooldownSecondsLeft > 0;

  return (
    <Button
      type='button'
      variant='outline'
      size='default'
      className='bg-background hover:bg-muted h-10 shrink-0 rounded-md border-neutral-200 px-3 text-[13px]! font-semibold text-neutral-700 shadow-none hover:border-neutral-300'
      onClick={() => void handleReload()}
      disabled={isDisabled}
      aria-busy={isReloading}
    >
      {isReloading ? (
        <Loader2Icon className='size-3.5 animate-spin' />
      ) : (
        <RotateCwIcon className='size-3.5' />
      )}
      {cooldownSecondsLeft > 0 ? `Reload (${cooldownSecondsLeft}s)` : 'Reload'}
    </Button>
  );
}

export default function CarePlanLogEntriesView({ carePlanId }: Props) {
  const summaryQuery = useQuery({
    queryKey: ['care-plan-logs', carePlanId, 'summary'],
    queryFn: async () => {
      const response = await getCarePlanLogSummary(carePlanId);
      if (response.status === 'error') {
        throw new Error(
          response.message ?? 'Could not load care plan log summary.',
        );
      }
      return response.data;
    },
  });

  const entriesQuery = useQuery({
    queryKey: ['care-plan-logs', carePlanId, 'entries'],
    queryFn: async () => {
      const response = await listCarePlanLogEntries(carePlanId, {});
      if (response.status === 'error') {
        throw new Error(
          response.message ?? 'Could not load care plan log entries.',
        );
      }
      return response.data ?? [];
    },
  });

  const summary = summaryQuery.data;
  const logProgressRaw =
    summary?.completion_signal?.logging_progress_percentage ?? 0;
  /** Same 0–100 clamp as daily task logs list circular “Log progress”. */
  const logProgressNormalized = Math.min(
    Math.max(logProgressRaw, 0),
    100,
  );
  const client = summary?.enrollment?.client ?? null;
  const program = summary?.enrollment?.program ?? null;
  const enrollmentCode =
    summary?.enrollment?.code?.trim() ||
    (summary?.enrollment?.id != null
      ? `#${summary.enrollment.id}`
      : 'Not linked');
  const clientAvatarSrc = resolveClientPictureUrl(client?.picture_url);
  const clientName = client?.name?.trim() || 'Not assigned';

  const rows = entriesQuery.data ?? [];
  const entriesPending = entriesQuery.isPending && !entriesQuery.data;
  const entriesError =
    entriesQuery.isError && entriesQuery.error instanceof Error
      ? entriesQuery.error.message
      : 'Could not load task log entries.';

  return (
    <div className='grid min-w-0 gap-4 lg:gap-5'>
      <section className={`${CARD_SURFACE} space-y-5`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <h3 className='text-foreground text-sm font-semibold'>Overview</h3>
          <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
            Enrollment context, care plan reference, care window, and log
            completion for this daily task log stream.
          </p>
        </header>

        {summaryQuery.isPending ? (
          <div className='space-y-3'>
            <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-18 rounded-md' />
              ))}
            </div>
            <Skeleton className='h-2.5 w-full rounded-full' />
          </div>
        ) : summaryQuery.isError ? (
          <p className='text-destructive text-sm'>
            {summaryQuery.error instanceof Error
              ? summaryQuery.error.message
              : 'Could not load summary.'}
          </p>
        ) : (
          <div className='space-y-5'>
            <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              <div className={METRIC_TILE_CLASS}>
                <p className={METRIC_TILE_LABEL_CLASS}>Client</p>
                <div className='mt-1 flex min-w-0 items-center gap-2.5'>
                  <Avatar
                    className='border-border/60 bg-background size-9 border'
                    size='default'
                  >
                    {clientAvatarSrc ? (
                      <AvatarImage
                        src={clientAvatarSrc}
                        alt=''
                        className='object-cover'
                      />
                    ) : null}
                    <AvatarFallback className='bg-primary/10 text-primary text-[11px] font-bold'>
                      {getInitials(clientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='text-foreground/90 line-clamp-1 text-[12.5px] font-semibold'>
                      {clientName}
                    </p>
                    {client?.client_code?.trim() ? (
                      <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
                        {client.client_code.trim()}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={METRIC_TILE_CLASS}>
                <p className={METRIC_TILE_LABEL_CLASS}>Program</p>
                <p className='text-foreground/90 line-clamp-2 text-[12.5px] font-semibold'>
                  {program?.title?.trim() || 'Not linked'}
                </p>
                {program?.code?.trim() ? (
                  <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
                    {program.code.trim()}
                  </p>
                ) : null}
              </div>

              <div className={METRIC_TILE_CLASS}>
                <p className={METRIC_TILE_LABEL_CLASS}>Enrollment</p>
                <p className='text-foreground text-[12.5px] font-semibold'>
                  Cycle {summary?.cycle_number ?? '—'}
                </p>
                <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
                  {enrollmentCode}
                </p>
              </div>

              <div className={METRIC_TILE_CLASS}>
                <p className={METRIC_TILE_LABEL_CLASS}>Care plan reference</p>
                <p className='text-foreground text-[12.5px] font-semibold tabular-nums'>
                  {summary?.code?.trim() || `#${summary?.id ?? carePlanId}`}
                </p>
              </div>

              <div className={METRIC_TILE_CLASS}>
                <p className={METRIC_TILE_LABEL_CLASS}>Start on</p>
                <p className='text-foreground text-[12.5px] font-semibold tabular-nums'>
                  {summary?.starts_on?.trim()
                    ? formatDate(summary.starts_on) ?? summary.starts_on
                    : '—'}
                </p>
              </div>

              <div className={METRIC_TILE_CLASS}>
                <p className={METRIC_TILE_LABEL_CLASS}>End on</p>
                <p className='text-foreground text-[12.5px] font-semibold tabular-nums'>
                  {summary?.ends_on?.trim()
                    ? formatDate(summary.ends_on) ?? summary.ends_on
                    : '—'}
                </p>
              </div>
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-baseline justify-between gap-3'>
                <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                  Log progress
                </p>
                <p className='text-foreground shrink-0 text-[12px] font-semibold tabular-nums'>
                  {Math.round(logProgressNormalized)}%
                </p>
              </div>
              <div
                className='bg-muted h-2.5 w-full overflow-hidden rounded-full'
                role='progressbar'
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(logProgressNormalized)}
                aria-valuetext={`${Math.round(logProgressNormalized)}% complete`}
                aria-label='Log progress'
              >
                <div
                  className='bg-primary h-full rounded-full transition-[width]'
                  style={{
                    width: `${logProgressNormalized}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <section className={`${CARD_SURFACE} space-y-5`}>
        <div className='flex flex-col gap-3 border-border border-b pb-5 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0 space-y-1'>
            <h3 className='text-foreground text-sm font-semibold'>
              Task log entries
            </h3>
            <p className='text-muted-foreground max-w-3xl text-[13px] leading-relaxed font-medium'>
              All logged tasks for this care plan window, including targets,
              actuals, notes, and media.
            </p>
          </div>
          <CarePlanLogDetailReloadButton carePlanId={carePlanId} />
        </div>

        <div className='border-border bg-card min-w-0 overflow-hidden rounded-lg border shadow-xs'>
          <div className='min-w-0 overflow-x-auto'>
            <Table className='min-w-8xl w-full'>
              <TableHeader className='bg-muted/50 [&_tr]:border-border'>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead>Logged At</TableHead>
                  <TableHead>Day / Date</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Media</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entriesPending ? (
                  <TableSkeletonRows
                    rowCount={12}
                    columnCount={8}
                    cellWidths={[
                      'w-36',
                      'w-36',
                      'w-24',
                      'w-48',
                      'w-28',
                      'w-28',
                      'w-48',
                      'w-20',
                    ]}
                  />
                ) : null}

                {!entriesPending && entriesQuery.isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className='text-destructive py-8 text-center text-sm'
                    >
                      {entriesError}
                    </TableCell>
                  </TableRow>
                ) : null}

                {!entriesPending &&
                !entriesQuery.isError &&
                rows.length === 0 ? (
                  <TableEmptyStateRow
                    colSpan={8}
                    title='No task log entries'
                    description='There are no daily task log rows for this care plan yet.'
                  />
                ) : null}

                {!entriesPending &&
                  !entriesQuery.isError &&
                  rows.map((entry) => {
                    const media = Array.isArray(entry.media) ? entry.media : [];
                    const firstMedia = media[0];
                    const targetLabel = toTargetActualLabel(
                      entry.target?.value,
                      entry.target?.unit,
                    );
                    const actualLabel = toTargetActualLabel(
                      entry.actual?.value,
                      entry.actual?.unit,
                    );
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {formatDateTime(entry.logged_at) ?? (
                            <TableCellEmpty label='Not logged' />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='space-y-0.5'>
                            <div className='text-sm font-semibold'>
                              {entry.day_number != null ? (
                                `Day ${entry.day_number}`
                              ) : (
                                <TableCellEmpty label='Day not set' />
                              )}
                            </div>
                            <div className='text-muted-foreground text-xs font-medium'>
                              {formatDate(entry.target_date) ?? (
                                <TableCellEmpty label='No date' />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.section ? (
                            <span className='capitalize'>{entry.section}</span>
                          ) : (
                            <TableCellEmpty label='No section' />
                          )}
                        </TableCell>
                        <TableCell>
                          <p
                            className='max-w-60 truncate text-sm font-medium'
                            title={entry.item_title ?? ''}
                          >
                            {entry.item_title?.trim() || (
                              <TableCellEmpty label='No task title' />
                            )}
                          </p>
                        </TableCell>
                        <TableCell>
                          {targetLabel === '—' ? (
                            <TableCellEmpty label='No target' />
                          ) : (
                            targetLabel
                          )}
                        </TableCell>
                        <TableCell>
                          {actualLabel === '—' ? (
                            <TableCellEmpty label='No actual' />
                          ) : (
                            actualLabel
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.notes?.trim() ? (
                            <p
                              className='max-w-72 truncate text-sm font-medium'
                              title={entry.notes ?? ''}
                            >
                              {entry.notes.trim()}
                            </p>
                          ) : (
                            <TableCellEmpty label='No notes' />
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.media_count &&
                          entry.media_count > 0 &&
                          firstMedia ? (
                            <Button
                              type='button'
                              asChild
                              variant='outline'
                              className='bg-background hover:bg-muted h-8 rounded-md border-neutral-300 px-2 text-xs font-semibold'
                            >
                              <a
                                href={firstMedia.url}
                                target='_blank'
                                rel='noreferrer'
                              >
                                {entry.media_count} file
                                {entry.media_count > 1 ? 's' : ''}
                                <ExternalLinkIcon className='size-3.5' />
                              </a>
                            </Button>
                          ) : (
                            <TableCellEmpty label='No files' />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}

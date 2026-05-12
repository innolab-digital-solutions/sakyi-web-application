'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  formatDateTimeCell,
  resolveClientPictureUrl,
} from '@/components/admin/modules/operational-logs/reportRunListHelpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { getPeriodReportById } from '@/domains/care-plans/services';
import type { ReportMetricDailyPoint } from '@/domains/care-plans/types/care-plan-report';
import type {
  PeriodReportDetail,
  PeriodReportHighlight,
} from '@/domains/care-plans/types/period-report-detail';
import { getCarePlanSectionTab } from '@/lib/care-plans/carePlanSectionTabs';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

/** Primary white card shell — matches {@link ClientProfileDetailView}. */
const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

const METRIC_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const METRIC_TILE_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

const METRIC_VALUE_NOT_SET = 'Not set' as const;

const OVERVIEW_EMPTY_DASH = (
  <span className='text-muted-foreground font-semibold'>-</span>
);

function formatMetricDisplayValue(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value)))
    return METRIC_VALUE_NOT_SET;
  const n = Number(value);
  if (Number.isInteger(n)) return String(Math.trunc(n));
  return String(n);
}

function formatOnTargetDaysRatio(
  daysOnTarget: number | null | undefined,
  daysTotal: number | null | undefined,
): string {
  if (daysTotal == null) return METRIC_VALUE_NOT_SET;
  const total = Math.floor(Math.max(0, Number(daysTotal)));
  if (!Number.isFinite(total)) return METRIC_VALUE_NOT_SET;
  const onRaw = daysOnTarget == null ? 0 : Number(daysOnTarget);
  const on = Number.isFinite(onRaw) ? Math.floor(Math.max(0, onRaw)) : 0;
  return `${on}/${total}`;
}

function formatStatusLabel(raw: string | null | undefined): string {
  if (!raw?.trim()) return '—';
  return raw
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso.trim()), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function formatDateOnlyYmd(
  startsOn: string | null | undefined,
  endsOn: string | null | undefined,
): string {
  const a = formatDateCell(startsOn ?? null);
  const b = formatDateCell(endsOn ?? null);
  if (a && b) return `${a} → ${b}`;
  if (a) return a;
  if (b) return b;
  return '—';
}

function normalizeHighlights(
  raw: PeriodReportDetail['highlights'],
): PeriodReportHighlight[] {
  if (!Array.isArray(raw)) return [];
  const out: PeriodReportHighlight[] = [];
  for (const item of raw) {
    if (
      item != null &&
      typeof item === 'object' &&
      'id' in item &&
      'label' in item
    ) {
      out.push(item as PeriodReportHighlight);
    }
  }
  return [...out].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
}

function formatHighlightSource(source: string | null | undefined): string {
  const s = (source ?? '').trim().toLowerCase();
  if (s === 'manual') return 'Manual';
  if (s === 'calculated') return 'Calculated';
  return s ? formatStatusLabel(s) : '—';
}

function readableDailyMetaReason(reason: unknown): string | null {
  if (typeof reason !== 'string' || !reason.trim()) return null;
  return formatStatusLabel(reason.replace(/_/g, ' '));
}

function getSynthesisText(
  meta: Record<string, unknown> | null | undefined,
): string | null {
  if (!meta || typeof meta !== 'object') return null;
  const r = meta.synthesis;
  return typeof r === 'string' && r.trim() ? r.trim() : null;
}

/** Same tile shell as {@link ClientProfileDetailView} `ClientProfileMetricTile`. */
function OverviewMetricTile({
  label,
  value,
  tabularNums = true,
  valueClassName,
  className,
}: {
  label: string;
  value: ReactNode;
  tabularNums?: boolean;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn(METRIC_TILE_CLASS, className)}>
      <p className={METRIC_TILE_LABEL_CLASS}>{label}</p>
      <div
        className={cn(
          'text-foreground/90 text-[12.5px] leading-snug font-semibold wrap-break-word',
          tabularNums && 'tabular-nums',
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

/** Same stat chips as {@link CarePlanReportWorkspace} `MetricSummaryStatCard`. */
function MetricSummaryStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        'bg-muted/50 border-border flex min-h-10 flex-col justify-center gap-0.5',
        'rounded-md border px-2.5 py-1.5 sm:min-h-11 sm:py-2',
      )}
    >
      <p className='text-muted-foreground text-[9px] font-semibold tracking-wide uppercase sm:text-[10px]'>
        {label}
      </p>
      <p className='text-foreground/90 line-clamp-1 text-xs font-semibold tabular-nums sm:text-[12.5px]'>
        {value}
      </p>
    </div>
  );
}

function ReadOnlyDailyPointsTable({
  dailyPoints,
}: {
  dailyPoints: ReportMetricDailyPoint[];
}) {
  return (
    <div
      className={cn(
        'border-border/70 overflow-x-auto rounded-b-md border-t dark:bg-black/5',
        'bg-muted/10',
        'px-2.5 pt-2.5 pb-4 sm:px-3 sm:pt-3 sm:pb-5',
      )}
    >
      <table className='w-full min-w-md text-left text-xs'>
        <thead>
          <tr className='border-border/50 border-b bg-transparent'>
            {(
              [
                { key: 'day', text: 'Day' },
                { key: 'target', text: 'Target' },
                { key: 'actual', text: 'Actual' },
                { key: 'on', text: 'On target' },
                { key: 'notes', text: 'Notes' },
              ] as const
            ).map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-muted-foreground bg-transparent py-2',
                  'align-middle',
                  'text-[10px] font-semibold tracking-wide uppercase',
                  'whitespace-nowrap',
                  col.key === 'day' &&
                    'w-10 min-w-10 px-1.5 text-center sm:px-2',
                  col.key === 'target' && 'px-2 text-left sm:px-2.5',
                  col.key === 'actual' && 'px-2 text-left sm:px-2.5',
                  col.key === 'on' && 'min-w-26 px-2.5 text-left sm:min-w-24',
                  col.key === 'notes' &&
                    'max-w-48 min-w-32 px-2.5 text-left last:pr-3',
                )}
              >
                {col.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...dailyPoints]
            .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
            .map((dp, di) => {
              const note =
                readableDailyMetaReason(
                  dp.meta && typeof dp.meta === 'object'
                    ? dp.meta.reason
                    : null,
                ) ?? '—';
              return (
                <tr
                  key={`${dp.day_number}-${di}`}
                  className='border-border/40 hover:bg-muted/20 border-b align-middle last:border-b-0'
                >
                  <td className='w-10 max-w-10 min-w-10 px-1.5 text-center text-[11px] font-semibold tabular-nums sm:px-2'>
                    {dp.day_number}
                  </td>
                  <td className='text-foreground/90 px-1.5 py-1.5 tabular-nums sm:px-2 sm:py-2'>
                    {formatMetricDisplayValue(dp.target_value)}
                  </td>
                  <td className='text-foreground/90 px-1.5 py-1.5 tabular-nums sm:px-2 sm:py-2'>
                    {formatMetricDisplayValue(dp.actual_value)}
                  </td>
                  <td className='text-foreground/90 w-20 min-w-26 px-2.5 py-1.5 text-left font-medium sm:min-w-24 sm:py-2'>
                    {dp.on_target ? 'Yes' : 'No'}
                  </td>
                  <td className='text-muted-foreground max-w-48 px-2.5 py-1.5 text-[11px] leading-snug font-medium wrap-break-word sm:py-2 sm:pr-3'>
                    {note}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

function PeriodReportOverviewSkeleton() {
  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <Skeleton className='h-5 w-52 rounded-sm' />
          <Skeleton className='mt-2 h-3 max-w-3xl rounded-sm' />
        </header>
        <div className='grid gap-1.5 md:grid-cols-3'>
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={`pr-overview-sk-${idx}`}
              className='bg-muted/50 border-border min-h-18 space-y-2 rounded-md border px-2.5 py-2'
            >
              <Skeleton className='h-3 w-24 rounded-sm' />
              <Skeleton className='h-4 w-32 rounded-sm' />
            </div>
          ))}
        </div>
        <div className='border-border space-y-2 border-t pt-5'>
          <Skeleton className='h-4 w-36 rounded-sm' />
          <Skeleton className='h-24 w-full rounded-md' />
        </div>
      </section>
      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <Skeleton className='h-5 w-40 rounded-sm' />
            <Skeleton className='mt-2 h-3 w-64 rounded-sm' />
          </header>
          <div className='flex gap-3 pt-5'>
            <Skeleton className='size-12 shrink-0 rounded-full' />
            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-4 w-40 rounded-sm' />
              <Skeleton className='h-3 w-52 rounded-sm' />
            </div>
          </div>
        </section>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <Skeleton className='h-5 w-44 rounded-sm' />
            <Skeleton className='mt-2 h-3 w-56 rounded-sm' />
          </header>
          <div className='grid gap-1.5 pt-5'>
            <Skeleton className='h-4 w-full rounded-sm' />
            <Skeleton className='h-4 max-w-56 rounded-sm' />
          </div>
        </section>
      </div>
    </div>
  );
}

export type PeriodReportOverviewViewProps = {
  /** Same `id` as the period reports list row and URL `/admin/period-reports/[id]`. */
  periodReportId: number;
};

export default function PeriodReportOverviewView({
  periodReportId,
}: PeriodReportOverviewViewProps) {
  const {
    data: detail,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-period-report-detail', periodReportId] as const,
    queryFn: async () => {
      const res = await getPeriodReportById(periodReportId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not load period report.');
      }
      if (!res.data) throw new Error('No report data.');
      return res.data;
    },
  });

  const opLog = detail?.operational_log ?? null;
  const reportCode = detail?.code?.trim() || `#${periodReportId}`;

  const highlightsSorted = detail ? normalizeHighlights(detail.highlights) : [];
  const metricsSorted = detail
    ? [...detail.metrics].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
      )
    : [];

  if (isPending) {
    return <PeriodReportOverviewSkeleton />;
  }

  if (isError) {
    return (
      <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-6 text-sm'>
        {error instanceof Error
          ? error.message
          : 'Could not load period report overview.'}
      </div>
    );
  }

  if (!detail) {
    return (
      <section className={CARD_SURFACE}>
        <p className='text-muted-foreground text-sm'>
          No data for this period report.
        </p>
      </section>
    );
  }

  const client = detail.client;
  const clientPic = resolveClientPictureUrl(client?.picture_url);

  return (
    <div className='grid gap-3 lg:grid-cols-3 lg:gap-4'>
      <section className={`${CARD_SURFACE} space-y-5 lg:col-span-2`}>
        <header className='border-border shrink-0 border-b pb-5'>
          <h3 className='text-foreground text-sm font-semibold'>
            Period report
          </h3>
          <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
            Report reference, status, and period context; care plan details are
            on the right. Use highlights and metrics below to decide publish or
            follow-up from the period reports list.
          </p>
          {detail.status === 'in_review' ? (
            <div
              role='note'
              className={cn(
                METRIC_TILE_CLASS,
                'mt-5 min-h-0 justify-start border-sky-200/80 bg-sky-50/80 py-3 dark:border-sky-900 dark:bg-sky-950/30',
              )}
            >
              <p className={METRIC_TILE_LABEL_CLASS}>Review before publish</p>
              <p className='text-foreground/90 text-[13px] leading-relaxed'>
                Confirm metrics, highlights, and narrative are accurate while
                this report remains in review. Use actions on the period reports
                list (for example Publish) once you are satisfied.
              </p>
            </div>
          ) : null}
        </header>

        <div className='space-y-3'>
          <div className='grid gap-1.5 md:grid-cols-3'>
            <OverviewMetricTile
              label='Report reference'
              value={reportCode}
              tabularNums={false}
            />
            <OverviewMetricTile
              label='Report status'
              value={formatStatusLabel(detail.status)}
              tabularNums={false}
            />
            <OverviewMetricTile
              label='Reporting period'
              value={formatDateOnlyYmd(
                detail.period.starts_on,
                detail.period.ends_on,
              )}
            />
            <OverviewMetricTile
              label='Adherence'
              value={
                detail.adherence_percentage != null &&
                Number.isFinite(detail.adherence_percentage)
                  ? `${Math.round(detail.adherence_percentage)}%`
                  : OVERVIEW_EMPTY_DASH
              }
            />
            <OverviewMetricTile
              label='Operational log reference'
              value={
                opLog?.code?.trim()
                  ? opLog.code.trim()
                  : opLog?.id != null
                    ? `#${opLog.id}`
                    : OVERVIEW_EMPTY_DASH
              }
              tabularNums={false}
            />
            <OverviewMetricTile
              label='Generated by'
              value={detail.generated_by?.name?.trim() || OVERVIEW_EMPTY_DASH}
              tabularNums={false}
            />
            <OverviewMetricTile
              label='Submitted for review'
              value={
                formatDateTimeCell(
                  detail.timestamps?.submitted_for_review_at ?? null,
                ) ?? OVERVIEW_EMPTY_DASH
              }
            />
            <OverviewMetricTile
              label='Published'
              value={
                formatDateTimeCell(detail.timestamps?.published_at ?? null) ??
                OVERVIEW_EMPTY_DASH
              }
            />
            <OverviewMetricTile
              label='Last updated'
              value={
                formatDateTimeCell(detail.timestamps?.updated_at ?? null) ??
                OVERVIEW_EMPTY_DASH
              }
            />
          </div>
        </div>

        <div className='border-border space-y-4 border-t pt-5'>
          <div>
            <h3 className='text-foreground text-sm font-semibold'>
              Report highlights
            </h3>
            <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
              Values intended for client visibility and publish checks. Sorted
              by display order from the API.
            </p>
          </div>
          {highlightsSorted.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No highlights were returned for this report.
            </p>
          ) : (
            <div className='grid gap-1.5 sm:grid-cols-2'>
              {highlightsSorted.map((h) => {
                const visibility = h.is_visible_to_client
                  ? 'Visible to client'
                  : 'Internal';
                return (
                  <div key={h.id} className={METRIC_TILE_CLASS}>
                    <p className={METRIC_TILE_LABEL_CLASS}>{h.label.trim()}</p>
                    <p className='text-foreground/90 text-[13px] font-semibold tabular-nums'>
                      {formatMetricDisplayValue(h.value)}{' '}
                      {h.unit?.trim() ? (
                        <span className='text-muted-foreground text-[11px] font-medium'>
                          {h.unit.trim()}
                        </span>
                      ) : null}
                    </p>
                    <div className='text-muted-foreground mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-medium'>
                      <span>{formatHighlightSource(h.source)}</span>
                      <span className='text-muted-foreground/70'>•</span>
                      <span>{visibility}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className='border-border space-y-4 border-t pt-5'>
          <div>
            <h3 className='text-foreground text-sm font-semibold'>Metrics</h3>
            <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed font-medium'>
              Rolled‑up totals and daily breakdowns as stored on this report
              (read-only).
            </p>
          </div>
          {metricsSorted.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No metrics on this period report.
            </p>
          ) : (
            <div className='space-y-6'>
              {metricsSorted.map((metric, mi) => {
                const sectionTab = getCarePlanSectionTab(metric.section);
                const SectionIcon = sectionTab?.icon;
                const unitShown = metric.unit?.trim() || METRIC_VALUE_NOT_SET;
                const synth = getSynthesisText(metric.meta ?? null);

                return (
                  <div
                    key={`${metric.metric_key}-${mi}`}
                    className='border-border min-w-0 space-y-3 rounded-md border bg-white p-3 sm:p-4'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 space-y-1'>
                        <p className='text-foreground/90 min-w-0 text-[12.5px] font-semibold'>
                          {metric.label}
                        </p>
                        {synth ? (
                          <p className='text-muted-foreground text-[12px] leading-relaxed italic'>
                            {synth}
                          </p>
                        ) : null}
                      </div>
                      <span className='border-border bg-background text-foreground inline-flex w-fit max-w-full shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold'>
                        {SectionIcon ? (
                          <SectionIcon
                            aria-hidden
                            className='size-3.5 shrink-0'
                          />
                        ) : null}
                        {sectionTab?.label ?? metric.section.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className='grid w-full min-w-0 grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2'>
                      <MetricSummaryStatCard
                        label='Target'
                        value={formatMetricDisplayValue(metric.target_value)}
                      />
                      <MetricSummaryStatCard
                        label='Actual'
                        value={formatMetricDisplayValue(metric.actual_value)}
                      />
                      <MetricSummaryStatCard label='Unit' value={unitShown} />
                      <MetricSummaryStatCard
                        label='On target days'
                        value={formatOnTargetDaysRatio(
                          metric.days_on_target,
                          metric.days_total,
                        )}
                      />
                    </div>
                    {metric.daily_points?.length ? (
                      <Collapsible
                        className={cn(
                          'group border-border w-full rounded-md border',
                          'dark:bg-card bg-white',
                          'shadow-none',
                          'transition-[background-color] duration-200 ease-out',
                          'data-[state=open]:bg-muted/20',
                          'data-[state=open]:dark:bg-muted/15',
                        )}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            type='button'
                            className={cn(
                              'flex w-full min-w-0 cursor-pointer items-center',
                              'justify-between gap-2 px-3 py-2.5 text-left',
                              'text-foreground/90',
                              'border-0 border-transparent bg-transparent shadow-none',
                              'hover:bg-muted/50',
                              'group-data-[state=open]:hover:bg-muted/15',
                              'group-data-[state=open]:bg-transparent',
                              'focus-visible:ring-ring focus-visible:ring-2',
                              'focus-visible:ring-offset-background focus-visible:ring-offset-2',
                              'focus-visible:outline-hidden',
                              'transition-[background-color] duration-200',
                            )}
                            aria-label={`Daily Breakdown, ${metric.daily_points.length} day${metric.daily_points.length === 1 ? '' : 's'}. Toggle table.`}
                          >
                            <div className='min-w-0 pr-2'>
                              <div className='text-[12.5px] font-semibold tracking-tight'>
                                Daily Breakdown
                              </div>
                              <div className='text-muted-foreground/90 mt-0.5 text-[11px] font-medium tabular-nums'>
                                {metric.daily_points.length} day
                                {metric.daily_points.length === 1 ? '' : 's'}
                              </div>
                            </div>
                            <ChevronDownIcon
                              aria-hidden
                              className='text-muted-foreground/80 size-3.5 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180'
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ReadOnlyDailyPointsTable
                            dailyPoints={metric.daily_points}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className='border-border space-y-4 border-t pt-5'>
          <h3 className='text-foreground text-sm font-semibold'>
            Care team narrative
          </h3>
          {detail.feedback ? (
            <div className='space-y-4'>
              {(
                [
                  {
                    key: 'summary',
                    heading: 'Summary',
                    value: detail.feedback.summary ?? '',
                  },
                  {
                    key: 'focus_next_period',
                    heading: 'Focus for next period',
                    value: detail.feedback.focus_next_period ?? '',
                  },
                  {
                    key: 'notes',
                    heading: 'Internal notes',
                    value: detail.feedback.notes ?? '',
                  },
                ] as const
              ).map((block) => (
                <div key={block.key} className='space-y-2'>
                  <p className={METRIC_TILE_LABEL_CLASS}>{block.heading}</p>
                  <p className='text-foreground/90 text-[13px] leading-relaxed whitespace-pre-wrap'>
                    {(block.value ?? '').trim() ? block.value.trim() : '—'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>
              No narrative block was attached to this report.
            </p>
          )}
        </div>
      </section>

      <div className='flex min-h-0 min-w-0 flex-col gap-3 lg:gap-4'>
        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>Client</h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Person attached to this report. Align with enrollment records
              before publishing.
            </p>
          </header>
          {client ? (
            <div className='flex min-h-0 flex-1 flex-col pt-5'>
              <div className='flex min-w-0 items-start gap-3'>
                <Avatar size='lg' className='mt-0.5 shrink-0'>
                  {clientPic ? (
                    <AvatarImage
                      src={clientPic}
                      alt=''
                      className='object-cover'
                    />
                  ) : null}
                  <AvatarFallback className='text-xs'>
                    {getInitials(client.name ?? '', 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-foreground/90 text-[13px] font-semibold'>
                    {client.name?.trim() || (
                      <TableCellEmpty label='No name on file' />
                    )}
                  </p>
                  <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                    {client.client_code?.trim() ||
                      client.email?.trim() ||
                      'No client code'}
                  </p>
                  <p className='text-muted-foreground text-[11px] font-medium'>
                    {client.email?.trim() ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground pt-5 text-sm'>
              No client attached to this report.
            </p>
          )}
        </section>

        <section className={`${CARD_SURFACE} flex min-h-0 flex-col`}>
          <header className='border-border shrink-0 border-b pb-4'>
            <h3 className='text-foreground text-sm font-semibold'>Care plan</h3>
            <p className='text-muted-foreground mt-1 max-w-3xl text-[13px] leading-relaxed font-medium'>
              Care plan window for this report. Cross-check with the reporting
              period in the main column.
            </p>
          </header>
          <div className='grid gap-1.5 pt-5'>
            {detail.care_plan ? (
              <>
                <OverviewMetricTile
                  label='Care plan reference'
                  value={
                    detail.care_plan.code?.trim()
                      ? detail.care_plan.code.trim()
                      : `#${detail.care_plan.id}`
                  }
                  tabularNums={false}
                />
                <OverviewMetricTile
                  label='Care plan status'
                  value={
                    detail.care_plan.status?.trim()
                      ? formatStatusLabel(detail.care_plan.status)
                      : '—'
                  }
                  tabularNums={false}
                />
                <OverviewMetricTile
                  label='Care plan window'
                  value={formatDateOnlyYmd(
                    detail.care_plan.starts_on,
                    detail.care_plan.ends_on,
                  )}
                />
              </>
            ) : (
              <p className='text-muted-foreground text-sm'>
                No care plan context on file.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

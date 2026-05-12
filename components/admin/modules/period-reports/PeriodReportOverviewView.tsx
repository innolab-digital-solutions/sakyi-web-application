'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  BadgePercentIcon,
  CalendarRangeIcon,
  FileChartColumn,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  buildOperationalLogWorkspaceHref,
  CLIENT_REPORT_STATUS_STYLES,
  formatDateTimeCell,
  normalizeClientReportStatus,
  resolveClientPictureUrl,
  UNKNOWN_STATUS_BADGE_CLASS,
} from '@/components/admin/modules/operational-logs/reportRunListHelpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { getPeriodReportById } from '@/domains/care-plans/services';
import { getInitials } from '@/lib/utils/string';
import { cn } from '@/lib/utils/styles';

const CARD_SURFACE =
  'border-border max-w-full min-w-0 rounded-md border bg-white p-6 shadow-xs';

const METRIC_TILE_CLASS =
  'bg-muted/50 border-border flex min-h-18 flex-col justify-center rounded-md border px-2.5 py-2';

const METRIC_TILE_LABEL_CLASS =
  'text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase';

function MetricTile({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(METRIC_TILE_CLASS, className)}>
      <p className={METRIC_TILE_LABEL_CLASS}>{label}</p>
      <div className='text-foreground/90 text-[12.5px] font-semibold leading-snug'>
        {children}
      </div>
    </div>
  );
}

function formatCareWindow(
  startsOn: string | null | undefined,
  endsOn: string | null | undefined,
): string {
  const a = startsOn?.trim();
  const b = endsOn?.trim();
  if (!a || !b) return '—';
  try {
    const da = parseISO(a);
    const db = parseISO(b);
    if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) {
      return `${a} → ${b}`;
    }
    return `${format(da, 'dd-MMM-yyyy')} → ${format(db, 'dd-MMM-yyyy')}`;
  } catch {
    return `${a} → ${b}`;
  }
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

  const carePlanIdForLinks = detail?.care_plan?.id ?? null;
  const operationalLogWorkspaceHref =
    carePlanIdForLinks != null
      ? buildOperationalLogWorkspaceHref(carePlanIdForLinks)
      : null;
  const carePlanDetailHref =
    carePlanIdForLinks != null
      ? ROUTES.ADMIN.MODULES.CARE_PLANS.DETAIL(String(carePlanIdForLinks))
      : null;

  const opLog = detail?.operational_log ?? null;

  const reportCode = detail?.code?.trim() || `#${periodReportId}`;

  const reportStatusNorm = normalizeClientReportStatus(detail?.status);
  const statusStyle = reportStatusNorm
    ? CLIENT_REPORT_STATUS_STYLES[reportStatusNorm]
    : null;

  const clientName =
    detail?.client?.name?.trim() ||
    detail?.client?.email?.trim() ||
    '—';
  const clientCode = detail?.client?.client_code?.trim();
  const clientAvatarSrc = resolveClientPictureUrl(
    detail?.client?.picture_url,
  );

  const carePlanCode = detail?.care_plan?.code?.trim();
  const carePlanLabel =
    carePlanCode || (detail?.care_plan?.id != null
      ? `Care Plan #${detail.care_plan.id}`
      : '—');

  if (isPending) {
    return (
      <section className={`${CARD_SURFACE} space-y-4`}>
        <div className='bg-muted h-6 max-w-xs animate-pulse rounded-md' />
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={cn(METRIC_TILE_CLASS, 'animate-pulse space-y-2')}
            >
              <div className='bg-muted/80 h-3 w-20 rounded-sm' />
              <div className='bg-muted/80 h-4 w-full max-w-40 rounded-sm' />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={`${CARD_SURFACE}`}>
        <p className='text-destructive text-sm'>
          {error instanceof Error
            ? error.message
            : 'Could not load period report overview.'}
        </p>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className={`${CARD_SURFACE}`}>
        <p className='text-muted-foreground text-sm'>
          No data for this period report.
        </p>
      </section>
    );
  }

  const periodLabel = formatCareWindow(
    detail.period.starts_on,
    detail.period.ends_on,
  );

  return (
    <div className='space-y-5'>
      <section className={`${CARD_SURFACE} space-y-5`}>
        <header className='border-border flex flex-wrap items-start justify-between gap-4 border-b pb-5'>
          <div className='min-w-0 space-y-2'>
            <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
              Period report reference
            </p>
            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-foreground/90 font-mono text-lg font-semibold tabular-nums'>
                {reportCode}
              </p>
              {statusStyle ? (
                <Badge
                  variant='outline'
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-semibold uppercase',
                    statusStyle.className,
                  )}
                >
                  <statusStyle.icon className='size-3' aria-hidden />
                  {statusStyle.label}
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className={`text-[10px] uppercase ${UNKNOWN_STATUS_BADGE_CLASS}`}
                >
                  {(detail.status ?? '').replace(/_/g, ' ') || '—'}
                </Badge>
              )}
            </div>
            <p className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Read-only summary for this period report. Edit metrics and submit
              for review from the operational logs workspace when the log is
              editable.
            </p>
          </div>
          <div className='flex shrink-0 flex-wrap gap-2'>
            {operationalLogWorkspaceHref ? (
              <Button
                type='button'
                className='h-10 gap-1.5 text-[13px]! font-semibold'
                asChild
              >
                <Link href={operationalLogWorkspaceHref}>
                  <FileChartColumn className='size-3.5 shrink-0' aria-hidden />
                  Operational log workspace
                </Link>
              </Button>
            ) : null}
            {carePlanDetailHref ? (
              <Button
                type='button'
                variant='outline'
                className='bg-background hover:bg-muted h-10 shrink-0 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
                asChild
              >
                <Link href={carePlanDetailHref}>Care plan overview</Link>
              </Button>
            ) : null}
          </div>
        </header>

        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          <MetricTile label='Client'>
            <div className='flex min-w-0 items-start gap-2.5'>
              <Avatar
                className='border-border/60 bg-background mt-0.5 size-9 border'
                size='default'
              >
                {clientAvatarSrc ? (
                  <AvatarImage src={clientAvatarSrc} alt='' className='object-cover' />
                ) : null}
                <AvatarFallback className='bg-primary/10 text-primary text-[11px] font-bold'>
                  {getInitials(clientName)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='line-clamp-2 wrap-break-word'>{clientName}</p>
                {clientCode ? (
                  <p className='text-muted-foreground mt-0.5 truncate text-[11px] font-semibold tabular-nums'>
                    {clientCode}
                  </p>
                ) : null}
              </div>
            </div>
          </MetricTile>

          <MetricTile label='Care plan'>
            <p className='line-clamp-2 tabular-nums'>{carePlanLabel}</p>
            {detail.care_plan?.status ? (
              <p className='text-muted-foreground mt-0.5 text-[11px] font-semibold capitalize'>
                {detail.care_plan.status.replace(/_/g, ' ')}
              </p>
            ) : null}
          </MetricTile>

          <MetricTile label='Reporting period'>
            <div className='flex flex-wrap items-center gap-2'>
              <CalendarRangeIcon
                className='text-muted-foreground size-3.5 shrink-0'
                aria-hidden
              />
              <span className='tabular-nums'>{periodLabel}</span>
            </div>
          </MetricTile>

          <MetricTile label='Plan window'>
            <span className='tabular-nums'>
              {formatCareWindow(
                detail.care_plan?.starts_on,
                detail.care_plan?.ends_on,
              )}
            </span>
          </MetricTile>

          <MetricTile label='Adherence'>
            <div className='flex flex-wrap items-center gap-2'>
              <BadgePercentIcon
                className='text-muted-foreground size-3.5 shrink-0'
                aria-hidden
              />
              <span className='tabular-nums'>
                {detail.adherence_percentage != null
                  ? `${Math.round(detail.adherence_percentage)}%`
                  : '—'}
              </span>
            </div>
          </MetricTile>

          <MetricTile label='Operational log'>
            {opLog?.code?.trim() ? (
              <span className='font-mono tabular-nums'>{opLog.code.trim()}</span>
            ) : opLog?.id != null ? (
              <span className='tabular-nums'>#{opLog.id}</span>
            ) : (
              <span className='text-muted-foreground font-semibold'>—</span>
            )}
          </MetricTile>

          <MetricTile label='Generated by'>
            <div className='flex flex-wrap items-center gap-2'>
              <UserIcon className='text-muted-foreground size-3.5 shrink-0' />
              <span>{detail.generated_by?.name?.trim() || '—'}</span>
            </div>
            <div className='text-muted-foreground mt-1 space-y-0.5 text-[11px] font-medium'>
              {(() => {
                const submitted =
                  detail.timestamps?.submitted_for_review_at;
                const published = detail.timestamps?.published_at;
                return (
                  <>
                    {submitted ? (
                      <p>
                        Submitted:{' '}
                        {formatDateTimeCell(submitted) ?? submitted}
                      </p>
                    ) : null}
                    {published ? (
                      <p>
                        Published:{' '}
                        {formatDateTimeCell(published) ?? published}
                      </p>
                    ) : null}
                  </>
                );
              })()}
            </div>
          </MetricTile>
        </div>

        <div className='border-border space-y-3 border-t pt-5'>
          <h3 className='text-foreground text-sm font-semibold'>
            Care team narrative
          </h3>
          {detail.feedback ? (
            <div className='text-muted-foreground space-y-3 text-[13px] leading-relaxed font-medium'>
              <div className='space-y-1'>
                <p className='text-foreground text-[11px] font-bold tracking-wide uppercase'>
                  Summary
                </p>
                <p className='text-foreground/90 min-h-5 font-medium whitespace-pre-wrap'>
                  {(detail.feedback.summary ?? '').trim() ||
                    '—'}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-foreground text-[11px] font-bold tracking-wide uppercase'>
                  Focus for next period
                </p>
                <p className='text-foreground/90 min-h-5 whitespace-pre-wrap'>
                  {(detail.feedback.focus_next_period ?? '').trim() ||
                    '—'}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-foreground text-[11px] font-bold tracking-wide uppercase'>
                  Internal notes
                </p>
                <p className='text-foreground/90 min-h-5 whitespace-pre-wrap'>
                  {(detail.feedback.notes ?? '').trim() || '—'}
                </p>
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>
              No narrative has been recorded for this report yet. Narrative is
              added when generating the period report through the operational
              logs workspace (submit for review), then reflected here once
              available from the API.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

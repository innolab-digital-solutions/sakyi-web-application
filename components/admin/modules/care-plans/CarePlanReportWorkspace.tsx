'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isValid, parse } from 'date-fns';
import { CheckCircle2Icon, FileBarChartIcon, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { base } from '@/config/api/base';
import { ROUTES } from '@/config/routes';
import {
  getCarePlanById,
  getCarePlanReportWorkspace,
  listCarePlanReportRuns,
  postCarePlanReportRun,
  postCarePlanReportRunPublish,
  putCarePlanReportRun,
} from '@/domains/care-plans/services';
import type {
  CarePlanReportEvidenceDay,
  CarePlanReportRunSummary,
  ReportMetricDailyPoint,
  ReportRunFeedback,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';
import { cn } from '@/lib/utils/styles';

const WORKSPACE_QUERY_KEY = 'care-plan-report-workspace' as const;
const RUNS_QUERY_KEY = 'care-plan-report-runs' as const;

function resolveMediaUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const v = raw.trim();
  if (v.startsWith('http')) return v;
  return `${base.domainEndpoint}${v}`;
}

function parseYmdLocal(s: string): Date | null {
  const d = parse(s.trim(), 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : null;
}

function defaultPeriodForPlan(
  startsOn: string | null,
  endsOn: string | null,
): { periodStartsOn: string; periodEndsOn: string } | null {
  if (!startsOn?.trim() || !endsOn?.trim()) return null;
  const start = parseYmdLocal(startsOn);
  const end = parseYmdLocal(endsOn);
  if (!start || !end) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let periodEnd = end.getTime() < today.getTime() ? end : today;
  if (periodEnd.getTime() < start.getTime()) periodEnd = end;
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 6);
  if (periodStart.getTime() < start.getTime()) {
    return {
      periodStartsOn: format(start, 'yyyy-MM-dd'),
      periodEndsOn: format(periodEnd, 'yyyy-MM-dd'),
    };
  }
  return {
    periodStartsOn: format(periodStart, 'yyyy-MM-dd'),
    periodEndsOn: format(periodEnd, 'yyyy-MM-dd'),
  };
}

function cloneMetrics(metrics: ReportRunMetric[]): ReportRunMetric[] {
  return JSON.parse(JSON.stringify(metrics)) as ReportRunMetric[];
}

function emptyFeedback(): ReportRunFeedback {
  return { summary: '', focus_next_period: '', notes: '' };
}

type CarePlanReportWorkspaceProps = {
  carePlanId: number;
  workspaceRoute?: (id: string) => string;
};

export default function CarePlanReportWorkspace({
  carePlanId,
  workspaceRoute = ROUTES.ADMIN.MODULES.CARE_PLANS.REPORT,
}: CarePlanReportWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const runIdFromUrl = searchParams.get('report_run_id');
  const periodStartFromUrl = searchParams.get('period_starts_on');
  const periodEndFromUrl = searchParams.get('period_ends_on');

  const [periodStartInput, setPeriodStartInput] = React.useState(
    () => periodStartFromUrl ?? '',
  );
  const [periodEndInput, setPeriodEndInput] = React.useState(
    () => periodEndFromUrl ?? '',
  );
  const [formMetrics, setFormMetrics] = React.useState<ReportRunMetric[]>([]);
  const [formFeedback, setFormFeedback] = React.useState<ReportRunFeedback>(
    emptyFeedback,
  );
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);
  const defaultingPeriodRef = React.useRef(false);
  const workspaceFormKeyRef = React.useRef<string | null>(null);

  const { data: carePlanResult } = useQuery({
    queryKey: ['admin-care-plan-brief', carePlanId] as const,
    queryFn: async () => {
      const res = await getCarePlanById(carePlanId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not load care plan.');
      }
      return res.data;
    },
  });

  const effectiveWorkspaceParams = React.useMemo(():
    | { reportRunId: number }
    | { periodStartsOn: string; periodEndsOn: string }
    | null => {
    if (runIdFromUrl) {
      const n = Number.parseInt(runIdFromUrl, 10);
      if (Number.isFinite(n)) return { reportRunId: n };
    }
    const start = periodStartFromUrl ?? periodStartInput;
    const end = periodEndFromUrl ?? periodEndInput;
    if (start?.trim() && end?.trim()) {
      return {
        periodStartsOn: start.trim(),
        periodEndsOn: end.trim(),
      };
    }
    return null;
  }, [
    runIdFromUrl,
    periodStartFromUrl,
    periodEndFromUrl,
    periodStartInput,
    periodEndInput,
  ]);

  React.useEffect(() => {
    if (runIdFromUrl) return;
    if (periodStartFromUrl) setPeriodStartInput(periodStartFromUrl);
    if (periodEndFromUrl) setPeriodEndInput(periodEndFromUrl);
  }, [runIdFromUrl, periodStartFromUrl, periodEndFromUrl]);

  const carePlan = carePlanResult;
  const status = (carePlan?.status ?? '').trim().toLowerCase();
  const canUseReports = status === 'active' || status === 'completed';

  React.useEffect(() => {
    if (!carePlan || !canUseReports) return;
    if (
      runIdFromUrl ||
      periodStartFromUrl ||
      periodEndFromUrl ||
      defaultingPeriodRef.current
    ) {
      return;
    }
    const d = defaultPeriodForPlan(
      carePlan.starts_on ?? null,
      carePlan.ends_on ?? null,
    );
    if (!d) return;
    defaultingPeriodRef.current = true;
    setPeriodStartInput(d.periodStartsOn);
    setPeriodEndInput(d.periodEndsOn);
    const next = new URLSearchParams(searchParams.toString());
    next.set('period_starts_on', d.periodStartsOn);
    next.set('period_ends_on', d.periodEndsOn);
    next.delete('report_run_id');
    router.replace(
      `${workspaceRoute(String(carePlanId))}?${next.toString()}`,
      { scroll: false },
    );
  }, [
    carePlan,
    canUseReports,
    runIdFromUrl,
    periodStartFromUrl,
    periodEndFromUrl,
    carePlanId,
    router,
    searchParams,
    workspaceRoute,
  ]);

  const {
    data: workspaceResult,
    isFetching: workspaceFetching,
    isError: workspaceIsError,
    error: workspaceError,
  } = useQuery({
    queryKey: [
      WORKSPACE_QUERY_KEY,
      carePlanId,
      effectiveWorkspaceParams,
    ] as const,
    enabled: Boolean(effectiveWorkspaceParams) && canUseReports,
    queryFn: async () => {
      if (!effectiveWorkspaceParams) {
        throw new Error('No workspace parameters');
      }
      const res =
        'reportRunId' in effectiveWorkspaceParams
          ? await getCarePlanReportWorkspace(carePlanId, {
              reportRunId: effectiveWorkspaceParams.reportRunId,
            })
          : await getCarePlanReportWorkspace(carePlanId, {
              periodStartsOn: effectiveWorkspaceParams.periodStartsOn,
              periodEndsOn: effectiveWorkspaceParams.periodEndsOn,
            });
      if (res.status === 'error') {
        const msg = res.message ?? 'Could not load report workspace.';
        const err = new Error(msg);
        (err as { fieldErrors?: unknown }).fieldErrors = res.errors;
        throw err;
      }
      if (!res.data) throw new Error('No workspace data');
      return res.data;
    },
  });

  const { data: runsResult, refetch: refetchRuns } = useQuery({
    queryKey: [RUNS_QUERY_KEY, carePlanId] as const,
    enabled: canUseReports,
    queryFn: async () => {
      const res = await listCarePlanReportRuns(carePlanId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not load report history.');
      }
      return res.data?.report_runs ?? [];
    },
  });

  const workspace = workspaceResult;
  const reportRuns: CarePlanReportRunSummary[] = runsResult ?? [];

  React.useEffect(() => {
    if (!workspace) return;
    const k = `${workspace.period.starts_on}|${workspace.period.ends_on}|${workspace.report_run?.id ?? 'new'}`;
    if (workspaceFormKeyRef.current === k) return;
    workspaceFormKeyRef.current = k;
    setFormMetrics(
      cloneMetrics(
        workspace.report_run?.metrics?.length
          ? workspace.report_run.metrics
          : workspace.suggested_metrics,
      ),
    );
    setFormFeedback(
      workspace.report_run?.feedback
        ? {
            summary: workspace.report_run.feedback.summary ?? '',
            focus_next_period:
              workspace.report_run.feedback.focus_next_period ?? '',
            notes: workspace.report_run.feedback.notes ?? '',
          }
        : emptyFeedback(),
    );
  }, [workspace]);

  const reportRun = workspace?.report_run ?? null;
  const isDraft = reportRun?.status === 'draft' || !reportRun;
  const isPublished = reportRun?.status === 'published';
  const canEdit = !isPublished && isDraft;
  const activeRunId = reportRun?.id ?? null;

  const updateDailyPoint = React.useCallback(
    (
      metricIndex: number,
      dayIndex: number,
      patch: Partial<ReportMetricDailyPoint>,
    ) => {
      setFormMetrics((prev) => {
        const next = cloneMetrics(prev);
        const m = next[metricIndex];
        if (!m?.daily_points?.[dayIndex]) return prev;
        next[metricIndex] = {
          ...m,
          daily_points: m.daily_points.map((p, i) =>
            i === dayIndex ? { ...p, ...patch } : p,
          ),
        };
        return next;
      });
    },
    [],
  );

  const updateMetricField = React.useCallback(
    (metricIndex: number, field: keyof ReportRunMetric, value: unknown) => {
      setFormMetrics((prev) => {
        const next = cloneMetrics(prev);
        if (!next[metricIndex]) return prev;
        (next[metricIndex] as Record<string, unknown>)[field] = value;
        return next;
      });
    },
    [],
  );

  const applyPeriodToUrl = React.useCallback(() => {
    const s = periodStartInput.trim();
    const e = periodEndInput.trim();
    if (!s || !e) {
      toast.error('Select both start and end dates for the report period.');
      return;
    }
    const next = new URLSearchParams();
    next.set('period_starts_on', s);
    next.set('period_ends_on', e);
    router.push(
      `${workspaceRoute(String(carePlanId))}?${next.toString()}`,
    );
  }, [carePlanId, periodStartInput, periodEndInput, router, workspaceRoute]);

  const onSelectRun = (value: string) => {
    if (value === 'new') {
      const next = new URLSearchParams();
      if (periodStartInput.trim() && periodEndInput.trim()) {
        next.set('period_starts_on', periodStartInput.trim());
        next.set('period_ends_on', periodEndInput.trim());
      }
      router.push(
        `${workspaceRoute(String(carePlanId))}${next.toString() ? `?${next.toString()}` : ''}`,
      );
      return;
    }
    const id = Number.parseInt(value, 10);
    if (!Number.isFinite(id)) return;
    const next = new URLSearchParams();
    next.set('report_run_id', String(id));
    router.push(
      `${workspaceRoute(String(carePlanId))}?${next.toString()}`,
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!workspace) throw new Error('Workspace not ready');
      const period = workspace.period;
      const feedback: ReportRunFeedback = {
        summary: (formFeedback.summary ?? '').trim() || null,
        focus_next_period: (formFeedback.focus_next_period ?? '').trim() || null,
        notes: (formFeedback.notes ?? '').trim() || null,
      };
      if (activeRunId != null) {
        const res = await putCarePlanReportRun(
          carePlanId,
          activeRunId,
          {
            metrics: formMetrics,
            feedback,
          },
        );
        if (res.status === 'error') {
          throw new Error(res.message ?? 'Could not save draft.');
        }
        return { mode: 'update' as const, data: res.data };
      }
      const res = await postCarePlanReportRun(carePlanId, {
        period_starts_on: period.starts_on,
        period_ends_on: period.ends_on,
        metrics: formMetrics,
        feedback: feedback.summary || feedback.focus_next_period || feedback.notes
          ? feedback
          : { summary: null, focus_next_period: null, notes: null },
      });
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not create draft.');
      }
      return { mode: 'create' as const, data: res.data };
    },
    onSuccess: (result) => {
      if (result.mode === 'create' && result.data?.id != null) {
        const next = new URLSearchParams();
        next.set('report_run_id', String(result.data.id));
        router.replace(
          `${workspaceRoute(String(carePlanId))}?${next.toString()}`,
        );
      }
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      void refetchRuns();
      toast.success(
        result.mode === 'create' ? 'Draft report created.' : 'Draft saved.',
      );
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (activeRunId == null) throw new Error('Save a draft first.');
      const res = await postCarePlanReportRunPublish(carePlanId, activeRunId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not publish report.');
      }
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      void refetchRuns();
      toast.success('Report published.');
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  if (carePlan && !canUseReports) {
    return (
      <div className='rounded-md border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100'>
        Period reports are available when the care plan is <strong>active</strong> or <strong>completed</strong>. This plan
        is <span className='font-semibold'>{status || 'not set'}</span>.
        <div className='mt-2'>
          <Button variant='outline' size='sm' asChild>
            <Link
              href={ROUTES.ADMIN.MODULES.CARE_PLANS.WORKSPACE(
                String(carePlanId),
              )}
            >
              Open care plan workspace
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='bg-card sticky top-0 z-10 flex flex-col gap-3 rounded-md border p-4 shadow-sm md:flex-row md:items-end md:justify-between'>
        <div className='min-w-0 space-y-1'>
          <h2 className='text-foreground text-lg font-semibold tracking-tight'>
            {workspace?.client?.name?.trim() || 'Client'} · Care plan{' '}
            {workspace?.care_plan?.code ? (
              <span className='text-muted-foreground font-mono text-base'>
                {workspace.care_plan.code}
              </span>
            ) : (
              `#${carePlanId}`
            )}
          </h2>
          {workspace ? (
            <p className='text-muted-foreground text-sm'>
              Period:{' '}
              <span className='text-foreground font-medium tabular-nums'>
                {workspace.period.starts_on} → {workspace.period.ends_on}
              </span>
            </p>
          ) : null}
        </div>
        <div className='flex flex-wrap items-end gap-2'>
          <div className='grid w-full gap-1.5 sm:grid-cols-2 sm:gap-2'>
            <div>
              <Label className='text-[11px]! font-bold uppercase tracking-wide'>
                Report history
              </Label>
              <Select
                onValueChange={onSelectRun}
                value={
                  runIdFromUrl
                    ? runIdFromUrl
                    : activeRunId
                      ? String(activeRunId)
                      : 'new'
                }
              >
                <SelectTrigger className='h-9 w-full min-w-48 md:w-56'>
                  <SelectValue placeholder='New period…' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='new'>New (suggested metrics)</SelectItem>
                  {reportRuns.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.code ?? `#${r.id}`} — {r.status} (
                      {r.period?.starts_on ?? r.period_starts_on} →{' '}
                      {r.period?.ends_on ?? r.period_ends_on})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <section className='lg:col-span-5'>
          <div className='mb-2 flex items-center justify-between gap-2'>
            <h3 className='text-foreground text-sm font-semibold'>
              Evidence (plan vs. client logs)
            </h3>
            {workspaceFetching ? (
              <Loader2Icon className='text-muted-foreground size-4 animate-spin' />
            ) : null}
          </div>
          <p className='text-muted-foreground mb-3 text-xs'>
            Targets and logged values from the care plan. Thumbnails open in a lightbox; media is read-only.
          </p>
          {workspaceIsError && (
            <p className='text-destructive text-sm'>{(workspaceError as Error)?.message}</p>
          )}
          {workspace && (
            <EvidenceList
              days={workspace.evidence}
              onOpenImage={setLightboxUrl}
            />
          )}
        </section>

        <section className='space-y-6 lg:col-span-7'>
          <div className='space-y-3 rounded-md border p-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Report period
            </h3>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end'>
              <TextField
                label='Period start'
                type='date'
                value={periodStartInput}
                onChange={(e) => setPeriodStartInput(e.target.value)}
                disabled={!!runIdFromUrl}
                id='period-start'
              />
              <TextField
                label='Period end'
                type='date'
                value={periodEndInput}
                onChange={(e) => setPeriodEndInput(e.target.value)}
                disabled={!!runIdFromUrl}
                id='period-end'
              />
              <div className='sm:col-span-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={applyPeriodToUrl}
                  disabled={!!runIdFromUrl}
                >
                  Load this period
                </Button>
                {runIdFromUrl ? (
                  <p className='text-muted-foreground mt-1 text-xs'>
                    Clear report selection to change the date range, or pick &quot;New (suggested metrics)&quot; above.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className='space-y-3 rounded-md border p-4'>
            <div className='flex items-center justify-between gap-2'>
              <h3 className='text-foreground text-sm font-semibold'>
                Metrics worksheet
              </h3>
              {reportRun?.status ? (
                <Badge variant='secondary' className='text-[11px] uppercase'>
                  {reportRun.status}
                </Badge>
              ) : null}
            </div>
            {!formMetrics.length && !workspaceFetching ? (
              <p className='text-muted-foreground text-sm'>
                No suggested metrics for this range. You can still save a draft; add rows via the API or adjust
                when the plan includes nutrition, activity, or recovery targets in range.
              </p>
            ) : null}
            <div className='space-y-6'>
              {formMetrics.map((metric, mi) => (
                <div
                  key={`${metric.metric_key}-${mi}`}
                  className='bg-muted/30 space-y-2 rounded-md border p-3'
                >
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div>
                      <Badge variant='outline' className='text-[10px] uppercase'>
                        {metric.section}
                      </Badge>
                      <p className='text-foreground mt-0.5 text-sm font-medium'>
                        {metric.label}
                      </p>
                      <p className='text-muted-foreground text-[11px]'>
                        {metric.metric_key}
                      </p>
                    </div>
                    <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                      <TextField
                        label='Target'
                        type='number'
                        value={
                          metric.target_value == null
                            ? ''
                            : String(metric.target_value)
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          updateMetricField(
                            mi,
                            'target_value',
                            v === '' ? null : Number(v),
                          );
                        }}
                        disabled={!canEdit}
                        id={`m-${mi}-t`}
                      />
                      <TextField
                        label='Actual'
                        type='number'
                        value={
                          metric.actual_value == null
                            ? ''
                            : String(metric.actual_value)
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          updateMetricField(
                            mi,
                            'actual_value',
                            v === '' ? null : Number(v),
                          );
                        }}
                        disabled={!canEdit}
                        id={`m-${mi}-a`}
                      />
                      <TextField
                        label='Unit'
                        value={metric.unit ?? ''}
                        onChange={(e) =>
                          updateMetricField(mi, 'unit', e.target.value || null)
                        }
                        disabled={!canEdit}
                        id={`m-${mi}-u`}
                      />
                      <TextField
                        label='On target days'
                        value={`${metric.days_on_target}/${metric.days_total}`}
                        readOnly
                        tabIndex={-1}
                        id={`m-${mi}-d`}
                      />
                    </div>
                  </div>
                  <div className='overflow-x-auto rounded border'>
                    <table className='w-full min-w-md text-left text-xs'>
                      <thead>
                        <tr className='bg-muted/50 border-b'>
                          <th className='p-2 font-semibold'>Day</th>
                          <th className='p-2 font-semibold'>Target</th>
                          <th className='p-2 font-semibold'>Actual</th>
                          <th className='p-2 font-semibold'>On target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metric.daily_points.map((dp, di) => (
                          <tr key={di} className='border-b last:border-0'>
                            <td className='p-1.5 tabular-nums'>{dp.day_number}</td>
                            <td className='p-0.5'>
                              <TextField
                                className='h-8'
                                type='number'
                                value={
                                  dp.target_value == null
                                    ? ''
                                    : String(dp.target_value)
                                }
                                onChange={(e) => {
                                  const v = e.target.value;
                                  updateDailyPoint(mi, di, {
                                    target_value:
                                      v === '' ? null : Number(v),
                                  });
                                }}
                                disabled={!canEdit}
                                id={`m-${mi}-d-${di}-t`}
                              />
                            </td>
                            <td className='p-0.5'>
                              <TextField
                                className='h-8'
                                type='number'
                                value={
                                  dp.actual_value == null
                                    ? ''
                                    : String(dp.actual_value)
                                }
                                onChange={(e) => {
                                  const v = e.target.value;
                                  updateDailyPoint(mi, di, {
                                    actual_value:
                                      v === '' ? null : Number(v),
                                  });
                                }}
                                disabled={!canEdit}
                                id={`m-${mi}-d-${di}-a`}
                              />
                            </td>
                            <td className='p-1.5'>
                              <div className='flex items-center justify-center pt-0.5'>
                                <Checkbox
                                  checked={dp.on_target}
                                  onCheckedChange={(c) =>
                                    updateDailyPoint(mi, di, {
                                      on_target: c === true,
                                    })
                                  }
                                  disabled={!canEdit}
                                  aria-label={`On target day ${dp.day_number}`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-3 rounded-md border p-4'>
            <h3 className='text-foreground text-sm font-semibold'>
              Care team narrative
            </h3>
            <TextAreaField
              id='summary'
              label='Summary (required to publish)'
              value={formFeedback.summary ?? ''}
              onChange={(e) =>
                setFormFeedback((f) => ({ ...f, summary: e.target.value }))
              }
              className='min-h-24'
              disabled={!canEdit}
            />
            <TextAreaField
              id='focus'
              label='Focus for next period'
              value={formFeedback.focus_next_period ?? ''}
              onChange={(e) =>
                setFormFeedback((f) => ({
                  ...f,
                  focus_next_period: e.target.value,
                }))
              }
              className='min-h-20'
              disabled={!canEdit}
            />
            <TextAreaField
              id='notes'
              label='Internal notes (optional)'
              value={formFeedback.notes ?? ''}
              onChange={(e) =>
                setFormFeedback((f) => ({ ...f, notes: e.target.value }))
              }
              className='min-h-20'
              disabled={!canEdit}
            />
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              onClick={() => saveMutation.mutate()}
              disabled={!canEdit || saveMutation.isPending || !workspace}
            >
              {saveMutation.isPending ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <FileBarChartIcon className='size-4' />
              )}
              Save draft
            </Button>
            <Button
              type='button'
              variant='default'
              className='gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700'
              onClick={() => publishMutation.mutate()}
              disabled={
                !canEdit || publishMutation.isPending || activeRunId == null
              }
            >
              {publishMutation.isPending ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <CheckCircle2Icon className='size-4' />
              )}
              Publish
            </Button>
            {isPublished ? (
              <p className='text-muted-foreground text-sm'>
                This run is published and cannot be edited here.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Log media</DialogTitle>
          </DialogHeader>
          {lightboxUrl ? (
            <div className='relative aspect-video w-full overflow-hidden rounded-md border'>
              <Image
                src={lightboxUrl}
                alt=''
                fill
                className='object-contain'
                unoptimized
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EvidenceList({
  days,
  onOpenImage,
}: {
  days: CarePlanReportEvidenceDay[];
  onOpenImage: (url: string) => void;
}) {
  if (!days.length) {
    return (
      <p className='text-muted-foreground text-sm'>
        No care-plan days in this period, or the client has not logged items yet.
      </p>
    );
  }
  return (
    <div className='max-h-[min(60vh,720px)] space-y-2 overflow-y-auto pr-1'>
      {days.map((d) => (
        <details
          key={`${d.target_date}-${d.day_index}`}
          className='group bg-card rounded-md border'
        >
          <summary
            className={cn(
              'hover:bg-muted/50 flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-medium',
            )}
          >
            <span>
              Day {d.day_index}{' '}
              <span className='text-muted-foreground font-normal tabular-nums'>
                {d.target_date}
              </span>
            </span>
            <span className='text-muted-foreground text-xs'>
              {d.items.length} line item{d.items.length === 1 ? '' : 's'}
            </span>
          </summary>
          <div className='border-t p-2 space-y-2'>
            {d.items.map((item) => (
              <div
                key={`${d.target_date}-${item.item_id}-${item.section}`}
                className='bg-muted/20 rounded p-2 text-xs'
              >
                <p className='text-foreground font-medium'>{item.title}</p>
                <div className='text-muted-foreground mt-1 space-y-0.5'>
                  <p>
                    <span className='font-medium text-emerald-800 dark:text-emerald-200'>
                      Target:{' '}
                    </span>
                    {item.target
                      ? `${item.target.value ?? '—'} ${item.target.unit ?? ''}`.trim()
                      : '—'}
                  </p>
                  <p>
                    <span className='font-medium text-sky-800 dark:text-sky-200'>
                      Log:{' '}
                    </span>
                    {item.log
                      ? `${item.log.actual_value ?? '—'} ${item.log.unit ?? ''} — ${(item.log.notes ?? '—').toString().slice(0, 200)}${(item.log.notes?.length ?? 0) > 200 ? '…' : ''}`
                      : 'No log yet'}
                  </p>
                </div>
                {item.log?.media && item.log.media.length > 0 ? (
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {item.log.media.map((m, idx) => {
                      const u = resolveMediaUrl(m.url);
                      if (!u) return null;
                      return (
                        <button
                          key={m.id ?? idx}
                          type='button'
                          onClick={() => onOpenImage(u)}
                          className='relative h-12 w-12 overflow-hidden rounded border'
                        >
                          <Image
                            src={u}
                            alt=''
                            fill
                            className='object-cover'
                            unoptimized
                          />
                          <span className='sr-only'>Open image</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

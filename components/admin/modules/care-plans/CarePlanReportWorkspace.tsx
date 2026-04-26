'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  getClientReportsFromListPayload,
  listCarePlanReportRuns,
  postCarePlanOperationalLog,
  postCarePlanReportRunPublish,
  postOperationalLogSubmitForReview,
  putCarePlanOperationalLog,
  putCarePlanReportRun,
} from '@/domains/care-plans/services';
import type {
  CarePlanReportEvidenceDay,
  CarePlanReportRunSummary,
  ReportMetricDailyPoint,
  ReportRunFeedback,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';
import { defaultReportPeriodForCarePlan } from '@/lib/care-plans/defaultReportPeriodRange';
import { cn } from '@/lib/utils/styles';

const WORKSPACE_QUERY_KEY = 'care-plan-report-workspace' as const;
const RUNS_QUERY_KEY = 'care-plan-report-runs' as const;

function resolveMediaUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const v = raw.trim();
  if (v.startsWith('http')) return v;
  return `${base.domainEndpoint}${v}`;
}

function cloneMetrics(metrics: ReportRunMetric[]): ReportRunMetric[] {
  return JSON.parse(JSON.stringify(metrics)) as ReportRunMetric[];
}

function emptyFeedback(): ReportRunFeedback {
  return { summary: '', focus_next_period: '', notes: '' };
}

type CarePlanReportWorkspaceProps = {
  carePlanId: number;
  /**
   * Which admin route this workspace is rendered under. Used for client-side URL
   * updates (cannot pass route builder functions from Server Components).
   */
  workspaceLocation?: 'period-report' | 'operational-logs';
};

function getWorkspacePathForCarePlan(
  carePlanId: number,
  location: 'period-report' | 'operational-logs',
): string {
  const id = String(carePlanId);
  return location === 'operational-logs'
    ? ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.WORKSPACE(id)
    : ROUTES.ADMIN.MODULES.CARE_PLANS.REPORT(id);
}

export default function CarePlanReportWorkspace({
  carePlanId,
  workspaceLocation = 'period-report',
}: CarePlanReportWorkspaceProps) {
  const router = useRouter();
  const workspacePath = React.useMemo(
    () => getWorkspacePathForCarePlan(carePlanId, workspaceLocation),
    [carePlanId, workspaceLocation],
  );
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const runIdFromUrl = searchParams.get('report_run_id');
  const operationalLogIdFromUrl = searchParams.get('operational_log_id');
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
    | { operationalLogId: number }
    | { periodStartsOn: string; periodEndsOn: string }
    | null => {
    if (operationalLogIdFromUrl) {
      const n = Number.parseInt(operationalLogIdFromUrl, 10);
      if (Number.isFinite(n)) return { operationalLogId: n };
    }
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
    operationalLogIdFromUrl,
    runIdFromUrl,
    periodStartFromUrl,
    periodEndFromUrl,
    periodStartInput,
    periodEndInput,
  ]);

  React.useEffect(() => {
    if (runIdFromUrl || operationalLogIdFromUrl) return;
    if (periodStartFromUrl) setPeriodStartInput(periodStartFromUrl);
    if (periodEndFromUrl) setPeriodEndInput(periodEndFromUrl);
  }, [operationalLogIdFromUrl, runIdFromUrl, periodStartFromUrl, periodEndFromUrl]);

  const carePlan = carePlanResult;
  const status = (carePlan?.status ?? '').trim().toLowerCase();
  const canUseReports = status === 'active' || status === 'completed';

  React.useEffect(() => {
    if (!carePlan || !canUseReports) return;
    if (
      runIdFromUrl ||
      operationalLogIdFromUrl ||
      periodStartFromUrl ||
      periodEndFromUrl ||
      defaultingPeriodRef.current
    ) {
      return;
    }
    const d = defaultReportPeriodForCarePlan(
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
    next.delete('operational_log_id');
    router.replace(`${workspacePath}?${next.toString()}`, { scroll: false });
  }, [
    carePlan,
    canUseReports,
    runIdFromUrl,
    operationalLogIdFromUrl,
    periodStartFromUrl,
    periodEndFromUrl,
    carePlanId,
    router,
    searchParams,
    workspacePath,
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
      const res = await (async () => {
        if ('reportRunId' in effectiveWorkspaceParams) {
          return getCarePlanReportWorkspace(carePlanId, {
            reportRunId: effectiveWorkspaceParams.reportRunId,
          });
        }
        if ('operationalLogId' in effectiveWorkspaceParams) {
          return getCarePlanReportWorkspace(carePlanId, {
            operationalLogId: effectiveWorkspaceParams.operationalLogId,
          });
        }
        return getCarePlanReportWorkspace(carePlanId, {
          periodStartsOn: effectiveWorkspaceParams.periodStartsOn,
          periodEndsOn: effectiveWorkspaceParams.periodEndsOn,
        });
      })();
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
      return getClientReportsFromListPayload(res.data);
    },
  });

  const workspace = workspaceResult;
  const reportRuns: CarePlanReportRunSummary[] = runsResult ?? [];

  const periodLocked = Boolean(
    (runIdFromUrl && runIdFromUrl.length > 0) ||
      (operationalLogIdFromUrl && operationalLogIdFromUrl.length > 0),
  );

  React.useEffect(() => {
    if (!workspace) return;
    const cr = workspace.client_report ?? workspace.report_run;
    const op = workspace.operational_log;
    const k = `${workspace.period.starts_on}|${workspace.period.ends_on}|op:${op?.id ?? 'n'}|cr:${cr?.id ?? 'n'}`;
    if (workspaceFormKeyRef.current === k) return;
    workspaceFormKeyRef.current = k;
    const metricsSource = op?.metrics?.length
      ? op.metrics
      : cr?.metrics?.length
        ? cr.metrics
        : workspace.suggested_metrics;
    setFormMetrics(cloneMetrics(metricsSource));
    setFormFeedback(
      cr?.feedback
        ? {
            summary: cr.feedback.summary ?? '',
            focus_next_period: cr.feedback.focus_next_period ?? '',
            notes: cr.feedback.notes ?? '',
          }
        : emptyFeedback(),
    );
  }, [workspace]);

  const operationalLog = workspace?.operational_log ?? null;
  const clientReport = workspace?.client_report ?? workspace?.report_run ?? null;
  const isPublished = clientReport?.status === 'published';
  const isArchived = clientReport?.status === 'archived';
  const canEditMetrics =
    operationalLog != null
      ? (operationalLog.status === 'draft' ||
          operationalLog.status === 'in_progress') &&
        operationalLog.is_editable
      : !clientReport;
  const canEditFeedback =
    clientReport?.status === 'in_review' && clientReport.is_editable !== false;
  const activeRunId = clientReport?.id ?? null;
  const activeOpLogId = operationalLog?.id ?? null;
  const canSubmitForReview =
    operationalLog != null &&
    operationalLog.status === 'in_progress' &&
    !clientReport;

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
    next.delete('report_run_id');
    next.delete('operational_log_id');
    router.push(`${workspacePath}?${next.toString()}`);
  }, [carePlanId, periodStartInput, periodEndInput, router, workspacePath]);

  const onSelectRun = (value: string) => {
    if (value === 'new') {
      const next = new URLSearchParams();
      if (periodStartInput.trim() && periodEndInput.trim()) {
        next.set('period_starts_on', periodStartInput.trim());
        next.set('period_ends_on', periodEndInput.trim());
      }
      next.delete('report_run_id');
      next.delete('operational_log_id');
      router.push(
        `${workspacePath}${next.toString() ? `?${next.toString()}` : ''}`,
      );
      return;
    }
    if (value.startsWith('op-')) {
      const opId = value.slice(3);
      const n = Number.parseInt(opId, 10);
      if (!Number.isFinite(n)) return;
      const next = new URLSearchParams();
      next.set('operational_log_id', String(n));
      next.delete('report_run_id');
      router.push(`${workspacePath}?${next.toString()}`);
      return;
    }
    const id = Number.parseInt(value, 10);
    if (!Number.isFinite(id)) return;
    const next = new URLSearchParams();
    next.set('report_run_id', String(id));
    next.delete('operational_log_id');
    router.push(`${workspacePath}?${next.toString()}`);
  };

  const saveMetricsMutation = useMutation({
    mutationFn: async () => {
      if (!workspace) throw new Error('Workspace not ready');
      const period = workspace.period;
      if (activeOpLogId != null) {
        const res = await putCarePlanOperationalLog(
          carePlanId,
          activeOpLogId,
          { metrics: formMetrics },
        );
        if (res.status === 'error') {
          throw new Error(res.message ?? 'Could not save metrics.');
        }
        return { mode: 'update' as const, data: res.data };
      }
      const res = await postCarePlanOperationalLog(carePlanId, {
        period_starts_on: period.starts_on,
        period_ends_on: period.ends_on,
        metrics: formMetrics,
      });
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not create operational log.');
      }
      return { mode: 'create' as const, data: res.data };
    },
    onSuccess: (result) => {
      if (result.mode === 'create' && result.data?.id != null) {
        const next = new URLSearchParams();
        next.set('operational_log_id', String(result.data.id));
        next.delete('report_run_id');
        router.replace(`${workspacePath}?${next.toString()}`);
      }
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      void refetchRuns();
      toast.success(
        result.mode === 'create'
          ? 'Operational log saved. Continue with metrics, then submit for review.'
          : 'Metrics saved.',
      );
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const saveFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (activeRunId == null) throw new Error('No client report to update.');
      const feedback: ReportRunFeedback = {
        summary: (formFeedback.summary ?? '').trim() || null,
        focus_next_period: (formFeedback.focus_next_period ?? '').trim() || null,
        notes: (formFeedback.notes ?? '').trim() || null,
      };
      const res = await putCarePlanReportRun(carePlanId, activeRunId, {
        feedback,
      });
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not save narrative.');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      void refetchRuns();
      toast.success('Narrative saved.');
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      if (activeOpLogId == null) throw new Error('No operational log to submit.');
      const res = await postOperationalLogSubmitForReview(
        carePlanId,
        activeOpLogId,
      );
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not submit for review.');
      }
      return res.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      void refetchRuns();
      if (data?.id != null) {
        const next = new URLSearchParams();
        next.set('report_run_id', String(data.id));
        next.delete('operational_log_id');
        router.replace(`${workspacePath}?${next.toString()}`);
      }
      toast.success('Submitted for review. You can add the client-facing narrative, then publish.');
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (activeRunId == null) throw new Error('No client report to publish.');
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
                    : clientReport
                      ? String(clientReport.id)
                      : activeOpLogId != null
                        ? `op-${activeOpLogId}`
                        : 'new'
                }
              >
                <SelectTrigger className='h-9 w-full min-w-48 md:w-56'>
                  <SelectValue placeholder='New period…' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='new'>New period (suggested metrics)</SelectItem>
                  {activeOpLogId != null && !clientReport ? (
                    <SelectItem value={`op-${activeOpLogId}`}>
                      Current operational log (in progress)
                    </SelectItem>
                  ) : null}
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
                disabled={periodLocked}
                id='period-start'
              />
              <TextField
                label='Period end'
                type='date'
                value={periodEndInput}
                onChange={(e) => setPeriodEndInput(e.target.value)}
                disabled={periodLocked}
                id='period-end'
              />
              <div className='sm:col-span-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={applyPeriodToUrl}
                  disabled={periodLocked}
                >
                  Load this period
                </Button>
                {periodLocked ? (
                  <p className='text-muted-foreground mt-1 text-xs'>
                    Clear the saved operational log or client report (pick &quot;New&quot; in history) to change dates.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className='space-y-3 rounded-md border p-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <h3 className='text-foreground text-sm font-semibold'>
                Metrics worksheet
              </h3>
              <div className='flex flex-wrap items-center gap-1.5'>
                {operationalLog?.status ? (
                  <Badge variant='outline' className='text-[10px] uppercase'>
                    Op log: {operationalLog.status}
                  </Badge>
                ) : null}
                {clientReport?.status ? (
                  <Badge variant='secondary' className='text-[10px] uppercase'>
                    Client report: {clientReport.status}
                  </Badge>
                ) : null}
              </div>
            </div>
            {!formMetrics.length && !workspaceFetching ? (
              <p className='text-muted-foreground text-sm'>
                No suggested metrics for this range. You can still create an operational log when targets exist in range,
                or adjust the plan to include nutrition, activity, or recovery items in this period.
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
                        disabled={!canEditMetrics}
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
                        disabled={!canEditMetrics}
                        id={`m-${mi}-a`}
                      />
                      <TextField
                        label='Unit'
                        value={metric.unit ?? ''}
                        onChange={(e) =>
                          updateMetricField(mi, 'unit', e.target.value || null)
                        }
                        disabled={!canEditMetrics}
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
                                disabled={!canEditMetrics}
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
                                disabled={!canEditMetrics}
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
                                  disabled={!canEditMetrics}
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
            {!clientReport ? (
              <p className='text-muted-foreground text-sm'>
                Narrative fields unlock after you submit the operational log for review. Save metrics first, then use
                &quot;Submit for review&quot; to create the client report.
              </p>
            ) : null}
            <TextAreaField
              id='summary'
              label='Summary (required to publish)'
              value={formFeedback.summary ?? ''}
              onChange={(e) =>
                setFormFeedback((f) => ({ ...f, summary: e.target.value }))
              }
              className='min-h-24'
              disabled={!canEditFeedback}
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
              disabled={!canEditFeedback}
            />
            <TextAreaField
              id='notes'
              label='Internal notes (optional)'
              value={formFeedback.notes ?? ''}
              onChange={(e) =>
                setFormFeedback((f) => ({ ...f, notes: e.target.value }))
              }
              className='min-h-20'
              disabled={!canEditFeedback}
            />
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              onClick={() => saveMetricsMutation.mutate()}
              disabled={
                !canEditMetrics ||
                saveMetricsMutation.isPending ||
                !workspace
              }
            >
              {saveMetricsMutation.isPending ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <FileBarChartIcon className='size-4' />
              )}
              Save metrics
            </Button>
            {canSubmitForReview ? (
              <Button
                type='button'
                variant='secondary'
                onClick={() => submitForReviewMutation.mutate()}
                disabled={submitForReviewMutation.isPending}
              >
                {submitForReviewMutation.isPending ? (
                  <Loader2Icon className='size-4 animate-spin' />
                ) : null}
                Submit for review
              </Button>
            ) : null}
            <Button
              type='button'
              variant='outline'
              onClick={() => saveFeedbackMutation.mutate()}
              disabled={
                !canEditFeedback ||
                saveFeedbackMutation.isPending ||
                activeRunId == null
              }
            >
              {saveFeedbackMutation.isPending ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : null}
              Save narrative
            </Button>
            <Button
              type='button'
              variant='default'
              className='gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700'
              onClick={() => publishMutation.mutate()}
              disabled={
                clientReport?.status !== 'in_review' ||
                publishMutation.isPending ||
                activeRunId == null
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
                This report is published; the operational log is locked and cannot be edited here.
              </p>
            ) : null}
            {isArchived ? (
              <p className='text-muted-foreground text-sm'>
                This report is archived (read-only in this view).
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

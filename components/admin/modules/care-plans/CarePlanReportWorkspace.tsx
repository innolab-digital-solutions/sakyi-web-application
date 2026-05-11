'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleAlert,
  ClipboardListIcon,
  FileChartColumn,
  FileSymlink,
  ListChecks,
  Loader2Icon,
  NotebookPenIcon,
  Save,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { OperationalLogWorksheetSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import OperationalLogMediaPreviewModal from '@/components/admin/modules/care-plans/OperationalLogMediaPreviewModal';
import ReviewOperationalLogMetricsDialog from '@/components/admin/modules/care-plans/ReviewOperationalLogMetricsDialog';
import SaveCarePlanDataConfirmation from '@/components/admin/modules/care-plans/SaveCarePlanDataConfirmation';
import SubmitOperationalLogForReviewDialog from '@/components/admin/modules/care-plans/SubmitOperationalLogForReviewDialog';
import OperationalLogWorkspaceContextBar from '@/components/admin/modules/operational-logs/OperationalLogWorkspaceContextBar';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import {
  getCarePlanById,
  getCarePlanReportWorkspace,
  getClientReportsFromListPayload,
  listCarePlanReportRuns,
  postCarePlanOperationalLog,
  postCarePlanOperationalLogDraft,
  postCarePlanReportRunPublish,
  postOperationalLogSubmitForReview,
  putCarePlanOperationalLog,
  putCarePlanReportRun,
} from '@/domains/care-plans/services';
import type {
  CarePlanReportEvidenceDay,
  CarePlanReportEvidenceItem,
  CarePlanReportRunSummary,
  ReportMetricDailyPoint,
  ReportRunFeedback,
  ReportRunMetric,
  SubmitForReviewManualHighlightPayload,
} from '@/domains/care-plans/types/care-plan-report';
import { getCarePlanSectionTab } from '@/lib/care-plans/carePlanSectionTabs';
import { defaultReportPeriodForCarePlan } from '@/lib/care-plans/defaultReportPeriodRange';
import { diffReportRunMetrics } from '@/lib/care-plans/diffReportRunMetrics';
import {
  cloneReportRunMetrics,
  rollUpMetricFromDailyPoints,
} from '@/lib/care-plans/operationalLogMetricsRollup';
import { resolveOperationalLogForReportWorkspace } from '@/lib/care-plans/resolveOperationalLogForReportWorkspace';
import { cn } from '@/lib/utils/styles';

const WORKSPACE_QUERY_KEY = 'care-plan-report-workspace' as const;
const RUNS_QUERY_KEY = 'care-plan-report-runs' as const;
const OPERATIONAL_LOG_LIST_QUERY_KEY = [
  'table',
  ENDPOINTS.ADMIN.MODULES.OPERATIONAL_LOGS.LIST,
] as const;

/** Same format as `CarePlanBuilder` day schedule (short weekday + date). */
function formatTargetDateLabel(ymd: string | null | undefined): string {
  if (!ymd?.trim()) return 'Date not set';
  const parsed = parse(ymd.trim(), 'yyyy-MM-dd', new Date());
  if (Number.isNaN(parsed.getTime())) return ymd.trim();
  return format(parsed, 'EEE, dd-MMM-yyyy');
}

function resolveMediaUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const v = raw.trim();
  if (v.startsWith('http')) return v;
  return `${base.domainEndpoint}${v}`;
}

function emptyFeedback(): ReportRunFeedback {
  return { summary: '', focus_next_period: '', notes: '' };
}

function formatSectionLabel(sectionKey: string): string {
  const k = sectionKey.replace(/_/g, ' ').trim() || 'other';
  return k.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/** Shown in metric stat cards when a value is absent (avoids em dash in primary slots). */
const METRIC_VALUE_NOT_SET = 'Not set' as const;

/**
 * Renders "on target" day ratio without stringifying `null` as the literal "null".
 * Missing or invalid on-target count is shown as 0.
 */
function formatOnTargetDaysRatio(
  daysOnTarget: number | null | undefined,
  daysTotal: number | null | undefined,
): string {
  if (daysTotal == null) {
    return METRIC_VALUE_NOT_SET;
  }
  const total = Math.floor(Math.max(0, Number(daysTotal)));
  if (!Number.isFinite(total)) {
    return METRIC_VALUE_NOT_SET;
  }
  const onRaw = daysOnTarget == null ? 0 : Number(daysOnTarget);
  const on = Number.isFinite(onRaw) ? Math.floor(Math.max(0, onRaw)) : 0;
  return `${on}/${total}`;
}

/**
 * Preserves first-seen section order (matches API item ordering within the day).
 */
function groupEvidenceItemsBySection(
  items: CarePlanReportEvidenceItem[],
): [string, CarePlanReportEvidenceItem[]][] {
  const map = new Map<string, CarePlanReportEvidenceItem[]>();
  for (const item of items) {
    const list = map.get(item.section);
    if (list) list.push(item);
    else map.set(item.section, [item]);
  }
  return Array.from(map.entries());
}

function getEvidenceDayTaskLogCounts(items: CarePlanReportEvidenceItem[]): {
  totalTasks: number;
  totalLogs: number;
} {
  return {
    totalTasks: items.length,
    totalLogs: items.filter((i) => i.log != null).length,
  };
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

/**
 * Read-only metric row matching {@link OperationalLogWorkspaceContextBar} label/value
 * hierarchy, sized closer to the daily breakdown trigger than the large header cards.
 */
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
  const [formFeedback, setFormFeedback] =
    React.useState<ReportRunFeedback>(emptyFeedback);
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);
  const [saveCarePlanConfirmOpen, setSaveCarePlanConfirmOpen] =
    React.useState(false);
  const [operationalLogMetricsReviewOpen, setOperationalLogMetricsReviewOpen] =
    React.useState(false);
  const [submitForReviewDialogOpen, setSubmitForReviewDialogOpen] =
    React.useState(false);
  const [submitReviewIncludedMetricKeys, setSubmitReviewIncludedMetricKeys] =
    React.useState<string[]>([]);
  const [submitReviewFeedback, setSubmitReviewFeedback] =
    React.useState<ReportRunFeedback>(emptyFeedback);
  const [submitReviewAverageIntake, setSubmitReviewAverageIntake] =
    React.useState('');
  const [submitReviewAverageBurn, setSubmitReviewAverageBurn] =
    React.useState('');
  const [submitReviewAverageSteps, setSubmitReviewAverageSteps] =
    React.useState('');
  const [
    submitReviewAverageTrainingMinutes,
    setSubmitReviewAverageTrainingMinutes,
  ] = React.useState('');
  const defaultingPeriodRef = React.useRef(false);
  const workspaceFormKeyRef = React.useRef<string | null>(null);
  const formMetricsRef = React.useRef<ReportRunMetric[]>([]);
  const [metricsSnapshotBaseline, setMetricsSnapshotBaseline] = React.useState<
    ReportRunMetric[] | null
  >(null);

  const { data: carePlanResult, isSuccess: carePlanQuerySuccess } = useQuery({
    queryKey: ['admin-care-plan-brief', carePlanId] as const,
    queryFn: async () => {
      const res = await getCarePlanById(carePlanId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not load care plan.');
      }
      return res.data;
    },
  });

  const isOperationalLogsWorkspace = workspaceLocation === 'operational-logs';

  const effectiveWorkspaceParams = React.useMemo(():
    | { carePlanDefault: true }
    | { reportRunId: number }
    | { operationalLogId: number }
    | { periodStartsOn: string; periodEndsOn: string }
    | null => {
    if (isOperationalLogsWorkspace) {
      return { carePlanDefault: true };
    }
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
    isOperationalLogsWorkspace,
    operationalLogIdFromUrl,
    runIdFromUrl,
    periodStartFromUrl,
    periodEndFromUrl,
    periodStartInput,
    periodEndInput,
  ]);

  React.useEffect(() => {
    if (isOperationalLogsWorkspace) return;
    if (runIdFromUrl || operationalLogIdFromUrl) return;
    queueMicrotask(() => {
      if (periodStartFromUrl) setPeriodStartInput(periodStartFromUrl);
      if (periodEndFromUrl) setPeriodEndInput(periodEndFromUrl);
    });
  }, [
    isOperationalLogsWorkspace,
    operationalLogIdFromUrl,
    runIdFromUrl,
    periodStartFromUrl,
    periodEndFromUrl,
  ]);

  const carePlan = carePlanResult;

  /** Period-report workspace waits for care plan so URL defaulting and runs list can use it; operational logs load immediately. */
  const allowReportWorkspaceFetch =
    isOperationalLogsWorkspace || carePlanQuerySuccess;

  React.useEffect(() => {
    if (isOperationalLogsWorkspace) return;
    if (!carePlan) return;
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
    queueMicrotask(() => {
      setPeriodStartInput(d.periodStartsOn);
      setPeriodEndInput(d.periodEndsOn);
      const next = new URLSearchParams(searchParams.toString());
      next.set('period_starts_on', d.periodStartsOn);
      next.set('period_ends_on', d.periodEndsOn);
      next.delete('report_run_id');
      next.delete('operational_log_id');
      next.delete('tab');
      router.replace(`${workspacePath}?${next.toString()}`, { scroll: false });
    });
  }, [
    isOperationalLogsWorkspace,
    carePlan,
    runIdFromUrl,
    operationalLogIdFromUrl,
    periodStartFromUrl,
    periodEndFromUrl,
    carePlanId,
    router,
    searchParams,
    workspacePath,
  ]);

  React.useEffect(() => {
    if (!isOperationalLogsWorkspace) return;
    if (searchParams.toString() === '') return;
    router.replace(workspacePath, { scroll: false });
  }, [isOperationalLogsWorkspace, router, searchParams, workspacePath]);

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
    enabled: Boolean(effectiveWorkspaceParams) && allowReportWorkspaceFetch,
    queryFn: async () => {
      if (!effectiveWorkspaceParams) {
        throw new Error('No workspace parameters');
      }
      const res = await (async () => {
        if ('carePlanDefault' in effectiveWorkspaceParams) {
          return getCarePlanReportWorkspace(carePlanId, {
            carePlanDefault: true,
          });
        }
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
    enabled: carePlanQuerySuccess && workspaceLocation !== 'operational-logs',
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

  const periodLocked = isOperationalLogsWorkspace
    ? false
    : Boolean(
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
    const rolled = cloneReportRunMetrics(metricsSource).map(
      rollUpMetricFromDailyPoints,
    );
    setMetricsSnapshotBaseline(cloneReportRunMetrics(rolled));
    setFormMetrics(rolled);
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

  React.useEffect(() => {
    formMetricsRef.current = formMetrics;
  }, [formMetrics]);

  const clientReport =
    workspace?.client_report ?? workspace?.report_run ?? null;

  const operationalLog = React.useMemo(
    () => resolveOperationalLogForReportWorkspace(workspace, carePlan),
    [workspace, carePlan],
  );

  const isPublished = clientReport?.status === 'published';
  const isArchived = clientReport?.status === 'archived';
  const canEditMetrics =
    operationalLog != null
      ? (operationalLog.status === 'draft' ||
          operationalLog.status === 'in_progress') &&
        operationalLog.is_editable !== false
      : !clientReport;
  const canEditFeedback =
    clientReport?.status === 'in_review' && clientReport.is_editable !== false;
  const activeRunId = clientReport?.id ?? null;
  const activeOpLogId = operationalLog?.id ?? null;
  const canShowSubmitForReview =
    operationalLog != null &&
    operationalLog.status !== 'locked' &&
    operationalLog.is_editable !== false &&
    clientReport?.status !== 'published';
  const canSubmitForReview =
    canShowSubmitForReview && operationalLog?.status === 'in_progress';
  const submitForReviewDisabledReason =
    canShowSubmitForReview && !canSubmitForReview
      ? 'Save operational log metrics first. Generate report is available after the log moves to in progress.'
      : null;
  const hasExistingReport = clientReport != null;
  const submitForReviewLabel = hasExistingReport
    ? 'Regenerate report'
    : 'Generate report';
  const submitReviewMetricOptions = React.useMemo(
    () =>
      (operationalLog?.metrics?.length
        ? operationalLog.metrics
        : formMetrics
      ).map((metric) => ({
        metricKey: metric.metric_key,
        label: metric.label,
        section: metric.section,
      })),
    [operationalLog?.metrics, formMetrics],
  );
  const reportGenerationDefaults =
    workspace?.report_generation_defaults?.average_inputs;

  type ReportAverageInputs = {
    avg_intake?: { value: number | null } | number | null;
    avg_burn?: { value: number | null } | number | null;
    avg_steps?: { value: number | null } | number | null;
    avg_training_time?: { value: number | null } | number | null;
  };

  type ReportHighlight = {
    metric_key?: unknown;
    value?: unknown;
    is_visible_to_client?: unknown;
    source?: unknown;
  };

  type ExistingReportDraftState = {
    included_metric_keys?: unknown;
    average_inputs?: ReportAverageInputs | null;
    highlights?: unknown;
  };

  const existingReportDraftState =
    React.useMemo<ExistingReportDraftState | null>(
      () =>
        clientReport
          ? (clientReport as unknown as ExistingReportDraftState)
          : null,
      [clientReport],
    );

  const reportHighlights = React.useMemo<ReportHighlight[]>(() => {
    const raw = existingReportDraftState?.highlights;
    if (!Array.isArray(raw)) return [];
    return raw as ReportHighlight[];
  }, [existingReportDraftState?.highlights]);

  const formatAverageInputDefault = React.useCallback(
    (value: number | null | undefined) => {
      if (value == null || !Number.isFinite(value)) return '0';
      return String(value);
    },
    [],
  );

  const resolveAverageInputForDialog = React.useCallback(
    (
      key: 'avg_intake' | 'avg_burn' | 'avg_steps' | 'avg_training_time',
      fallbackValue: number | null | undefined,
      currentValue: string,
    ) => {
      const fromHighlights = reportHighlights.find((h) => {
        if (h.metric_key !== key) return false;
        if (h.is_visible_to_client === false) return false;
        return true;
      });
      if (
        fromHighlights &&
        typeof fromHighlights.value === 'number' &&
        Number.isFinite(fromHighlights.value)
      ) {
        return String(fromHighlights.value);
      }

      const fromExisting = existingReportDraftState?.average_inputs?.[key];

      if (typeof fromExisting === 'number' && Number.isFinite(fromExisting)) {
        return String(fromExisting);
      }

      if (
        fromExisting &&
        typeof fromExisting === 'object' &&
        'value' in fromExisting
      ) {
        const value = (fromExisting as { value?: unknown }).value;
        if (typeof value === 'number' && Number.isFinite(value)) {
          return String(value);
        }
      }

      const normalizedCurrent = currentValue.trim();
      if (normalizedCurrent.length > 0) return normalizedCurrent;

      return formatAverageInputDefault(fallbackValue);
    },
    [existingReportDraftState, formatAverageInputDefault, reportHighlights],
  );

  const resolveIncludedMetricKeysForDialog = React.useCallback(() => {
    const allowed = new Set(submitReviewMetricOptions.map((m) => m.metricKey));

    const fromHighlights = reportHighlights
      .filter((h) => h.is_visible_to_client !== false)
      .map((h) => (typeof h.metric_key === 'string' ? h.metric_key.trim() : ''))
      .filter((k) => k.length > 0 && allowed.has(k));
    if (fromHighlights.length > 0) {
      return Array.from(new Set(fromHighlights));
    }

    const raw = existingReportDraftState?.included_metric_keys;
    if (Array.isArray(raw)) {
      const normalized = raw
        .filter((k): k is string => typeof k === 'string')
        .map((k) => k.trim())
        .filter((k) => k.length > 0 && allowed.has(k));
      const deduped = Array.from(new Set(normalized));
      if (deduped.length > 0) return deduped;
    }

    const existingSelection = submitReviewIncludedMetricKeys
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (existingSelection.length > 0) {
      return Array.from(new Set(existingSelection));
    }

    return submitReviewMetricOptions.map((metric) => metric.metricKey);
  }, [
    existingReportDraftState,
    reportHighlights,
    submitReviewIncludedMetricKeys,
    submitReviewMetricOptions,
  ]);

  const operationalLogsSummaryCardsProps = React.useMemo(() => {
    const enrollment = carePlan?.enrollment;
    const program = enrollment?.program;
    const clientFromEnrollment = enrollment?.client;
    return {
      clientName: workspace?.client?.name ?? clientFromEnrollment?.name ?? null,
      clientCode:
        workspace?.client?.client_code ??
        clientFromEnrollment?.client_code ??
        null,
      clientPictureUrl:
        workspace?.client?.picture_url ??
        clientFromEnrollment?.picture_url ??
        null,
      programName: program?.title?.trim() || program?.slug?.trim() || null,
      programCode: program?.code?.trim() || null,
      cycleNumber: carePlan?.cycle_number ?? null,
      carePlanCode:
        carePlan?.code?.trim() || workspace?.care_plan?.code?.trim() || null,
      careWindowStartsOn:
        workspace?.care_plan?.starts_on ?? carePlan?.starts_on ?? null,
      careWindowEndsOn:
        workspace?.care_plan?.ends_on ?? carePlan?.ends_on ?? null,
    };
  }, [carePlan, workspace]);

  const opLogReferenceText = (operationalLog?.code ?? '').trim();

  const operationalMetricsReviewDiff = React.useMemo(
    () => diffReportRunMetrics(metricsSnapshotBaseline, formMetrics),
    [metricsSnapshotBaseline, formMetrics],
  );

  const continueMetricsReviewToSave = React.useCallback(() => {
    setOperationalLogMetricsReviewOpen(false);
    setSaveCarePlanConfirmOpen(true);
  }, []);

  const updateDailyPoint = React.useCallback(
    (
      metricIndex: number,
      dayIndex: number,
      patch: Partial<ReportMetricDailyPoint>,
    ) => {
      setFormMetrics((prev) => {
        const next = cloneReportRunMetrics(prev);
        const m = next[metricIndex];
        if (!m?.daily_points?.[dayIndex]) return prev;
        const withPoints = {
          ...m,
          daily_points: m.daily_points.map((p, i) =>
            i === dayIndex ? { ...p, ...patch } : p,
          ),
        };
        next[metricIndex] = rollUpMetricFromDailyPoints(withPoints);
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
  }, [periodStartInput, periodEndInput, router, workspacePath]);

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
        const res = await putCarePlanOperationalLog(carePlanId, activeOpLogId, {
          metrics: formMetrics,
        });
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
    onSuccess: async (result) => {
      if (
        result.mode === 'create' &&
        result.data?.id != null &&
        !isOperationalLogsWorkspace
      ) {
        const next = new URLSearchParams();
        next.set('operational_log_id', String(result.data.id));
        next.delete('report_run_id');
        router.replace(`${workspacePath}?${next.toString()}`);
      }
      if (isOperationalLogsWorkspace) {
        await queryClient.invalidateQueries({
          queryKey: [...OPERATIONAL_LOG_LIST_QUERY_KEY],
        });
        router.push(ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.LIST);
      }
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      void refetchRuns();
      toast.success(
        result.mode === 'create'
          ? 'Operational log saved. Continue editing, then submit for review when ready.'
          : 'The operational log data has been saved successfully.',
      );
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const { mutate: mutateSaveCarePlan } = saveMetricsMutation;

  const confirmSaveCarePlanData = React.useCallback(() => {
    mutateSaveCarePlan(undefined, {
      onSuccess: () => {
        setSaveCarePlanConfirmOpen(false);
        setMetricsSnapshotBaseline(
          cloneReportRunMetrics(formMetricsRef.current),
        );
      },
    });
  }, [mutateSaveCarePlan]);

  const saveCarePlanCodeForDialog =
    carePlan?.code?.trim() || workspace?.care_plan?.code?.trim() || null;

  const saveFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (activeRunId == null) throw new Error('No client report to update.');
      const feedback: ReportRunFeedback = {
        summary: (formFeedback.summary ?? '').trim() || null,
        focus_next_period:
          (formFeedback.focus_next_period ?? '').trim() || null,
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
      if (activeOpLogId == null)
        throw new Error('No operational log to submit.');
      const manualHighlights: SubmitForReviewManualHighlightPayload[] = [];
      const averageInputPayload: {
        avg_intake?: number;
        avg_burn?: number;
        avg_steps?: number;
        avg_training_time?: number;
      } = {};
      const avgIntakeValue = Number.parseFloat(submitReviewAverageIntake);
      if (Number.isFinite(avgIntakeValue) && avgIntakeValue >= 0) {
        averageInputPayload.avg_intake = avgIntakeValue;
        manualHighlights.push({
          metric_key: 'avg_intake',
          label: 'Average intake',
          value: avgIntakeValue,
          unit: 'Kilocalorie',
          is_visible_to_client: true,
        });
      }
      const avgBurnValue = Number.parseFloat(submitReviewAverageBurn);
      if (Number.isFinite(avgBurnValue) && avgBurnValue >= 0) {
        averageInputPayload.avg_burn = avgBurnValue;
        manualHighlights.push({
          metric_key: 'avg_burn',
          label: 'Average burn',
          value: avgBurnValue,
          unit: 'Kilocalorie',
          is_visible_to_client: true,
        });
      }
      const avgStepsValue = Number.parseFloat(submitReviewAverageSteps);
      if (Number.isFinite(avgStepsValue) && avgStepsValue >= 0) {
        averageInputPayload.avg_steps = avgStepsValue;
        manualHighlights.push({
          metric_key: 'avg_steps',
          label: 'Average steps',
          value: avgStepsValue,
          unit: 'steps',
          is_visible_to_client: true,
        });
      }
      const avgTrainingTimeValue = Number.parseFloat(
        submitReviewAverageTrainingMinutes,
      );
      if (Number.isFinite(avgTrainingTimeValue) && avgTrainingTimeValue >= 0) {
        averageInputPayload.avg_training_time = avgTrainingTimeValue;
        manualHighlights.push({
          metric_key: 'avg_training_time',
          label: 'Average training time',
          value: avgTrainingTimeValue,
          unit: 'minute',
          is_visible_to_client: true,
        });
      }
      const res = await postOperationalLogSubmitForReview(
        carePlanId,
        activeOpLogId,
        {
          feedback: {
            summary: (submitReviewFeedback.summary ?? '').trim(),
            focus_next_period: (
              submitReviewFeedback.focus_next_period ?? ''
            ).trim(),
            notes: (submitReviewFeedback.notes ?? '').trim(),
          },
          average_inputs:
            Object.keys(averageInputPayload).length > 0
              ? averageInputPayload
              : undefined,
          included_metric_keys: submitReviewIncludedMetricKeys,
          manual_highlights: manualHighlights,
        },
      );
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not submit for review.');
      }
      return res.data;
    },
    onSuccess: (data) => {
      setSubmitForReviewDialogOpen(false);
      setFormFeedback({
        summary: data?.feedback?.summary ?? submitReviewFeedback.summary ?? '',
        focus_next_period:
          data?.feedback?.focus_next_period ??
          submitReviewFeedback.focus_next_period ??
          '',
        notes: data?.feedback?.notes ?? submitReviewFeedback.notes ?? '',
      });
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      void refetchRuns();
      if (data?.id != null && !isOperationalLogsWorkspace) {
        const next = new URLSearchParams();
        next.set('report_run_id', String(data.id));
        next.delete('operational_log_id');
        router.replace(`${workspacePath}?${next.toString()}`);
      }
      if (isOperationalLogsWorkspace) {
        router.replace(workspacePath, { scroll: false });
      }
      toast.success('The report has been generated successfully.');
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const openSubmitForReviewDialog = React.useCallback(() => {
    const reportFeedback = clientReport?.feedback;
    setSubmitReviewFeedback({
      summary: reportFeedback?.summary ?? formFeedback.summary ?? '',
      focus_next_period:
        reportFeedback?.focus_next_period ??
        formFeedback.focus_next_period ??
        '',
      notes: reportFeedback?.notes ?? formFeedback.notes ?? '',
    });
    setSubmitReviewIncludedMetricKeys(resolveIncludedMetricKeysForDialog());
    setSubmitReviewAverageIntake(
      resolveAverageInputForDialog(
        'avg_intake',
        reportGenerationDefaults?.avg_intake?.value,
        submitReviewAverageIntake,
      ),
    );
    setSubmitReviewAverageBurn(
      resolveAverageInputForDialog(
        'avg_burn',
        reportGenerationDefaults?.avg_burn?.value,
        submitReviewAverageBurn,
      ),
    );
    setSubmitReviewAverageSteps(
      resolveAverageInputForDialog(
        'avg_steps',
        reportGenerationDefaults?.avg_steps?.value,
        submitReviewAverageSteps,
      ),
    );
    setSubmitReviewAverageTrainingMinutes(
      resolveAverageInputForDialog(
        'avg_training_time',
        reportGenerationDefaults?.avg_training_time?.value,
        submitReviewAverageTrainingMinutes,
      ),
    );
    setSubmitForReviewDialogOpen(true);
  }, [
    clientReport?.feedback,
    formFeedback.focus_next_period,
    formFeedback.notes,
    formFeedback.summary,
    reportGenerationDefaults?.avg_burn?.value,
    reportGenerationDefaults?.avg_intake?.value,
    reportGenerationDefaults?.avg_steps?.value,
    reportGenerationDefaults?.avg_training_time?.value,
    resolveAverageInputForDialog,
    resolveIncludedMetricKeysForDialog,
    submitReviewAverageBurn,
    submitReviewAverageIntake,
    submitReviewAverageSteps,
    submitReviewAverageTrainingMinutes,
  ]);

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

  const createOperationalLogDraftMutation = useMutation({
    mutationFn: async () => {
      const res = await postCarePlanOperationalLogDraft(carePlanId, {});
      if (res.status === 'error') {
        throw new Error(
          res.message ?? 'Could not create operational log draft.',
        );
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEY, carePlanId],
      });
      toast.success('Operational log created. You can add metrics, then save.');
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const renderMetricEditorCard = (metric: ReportRunMetric, mi: number) => {
    const sectionTab = getCarePlanSectionTab(metric.section);
    const SectionIcon = sectionTab?.icon;

    return (
      <div
        className={cn(
          'min-w-0 space-y-3 rounded-md border p-3 sm:p-4',
          isOperationalLogsWorkspace ? 'border-border bg-white' : 'bg-muted/30',
        )}
      >
        <div className='flex items-start justify-between gap-2'>
          <p className='text-foreground/90 min-w-0 text-[12.5px] font-semibold'>
            {metric.label}
          </p>
          <span className='border-border bg-background text-foreground inline-flex w-fit max-w-full shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold'>
            {SectionIcon ? (
              <SectionIcon aria-hidden className='size-3.5 shrink-0' />
            ) : null}
            {sectionTab?.label ?? formatSectionLabel(metric.section)}
          </span>
        </div>
        <div className='grid w-full min-w-0 grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2'>
          <MetricSummaryStatCard
            label='Target'
            value={
              metric.target_value == null
                ? METRIC_VALUE_NOT_SET
                : String(metric.target_value)
            }
          />
          <MetricSummaryStatCard
            label='Actual'
            value={
              metric.actual_value == null
                ? METRIC_VALUE_NOT_SET
                : String(metric.actual_value)
            }
          />
          <MetricSummaryStatCard
            label='Unit'
            value={metric.unit?.trim() || '—'}
          />
          <MetricSummaryStatCard
            label='On target days'
            value={formatOnTargetDaysRatio(
              metric.days_on_target,
              metric.days_total,
            )}
          />
        </div>

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
                          col.key === 'on' &&
                            'min-w-26 px-2.5 text-left last:pr-3 sm:min-w-24',
                        )}
                      >
                        {col.text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metric.daily_points.map((dp, di) => (
                    <tr
                      key={di}
                      className='border-border/40 hover:bg-muted/20 border-b align-middle last:border-b-0'
                    >
                      <td className='w-10 max-w-10 min-w-10 px-1.5 text-center text-[11px] font-semibold tabular-nums sm:px-2'>
                        {dp.day_number}
                      </td>
                      <td className='px-1.5 py-1.5 align-middle sm:px-2 sm:py-2'>
                        <TextField
                          type='number'
                          variant='tableDense'
                          className='w-full min-w-0'
                          min={0}
                          step='any'
                          value={String(dp.target_value ?? 0)}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '') {
                              updateDailyPoint(mi, di, { target_value: 0 });
                              return;
                            }
                            const n = Number(v);
                            if (Number.isNaN(n)) return;
                            updateDailyPoint(mi, di, {
                              target_value: Math.max(0, n),
                            });
                          }}
                          disabled={!canEditMetrics}
                          id={`m-${mi}-d-${di}-t`}
                          aria-label={`${metric.label} day ${dp.day_number} target`}
                        />
                      </td>
                      <td className='px-1.5 py-1.5 align-middle sm:px-2 sm:py-2'>
                        <TextField
                          type='number'
                          variant='tableDense'
                          className='w-full min-w-0'
                          min={0}
                          step='any'
                          value={String(dp.actual_value ?? 0)}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '') {
                              updateDailyPoint(mi, di, { actual_value: 0 });
                              return;
                            }
                            const n = Number(v);
                            if (Number.isNaN(n)) return;
                            updateDailyPoint(mi, di, {
                              actual_value: Math.max(0, n),
                            });
                          }}
                          disabled={!canEditMetrics}
                          id={`m-${mi}-d-${di}-a`}
                          aria-label={`${metric.label} day ${dp.day_number} actual`}
                        />
                      </td>
                      <td className='w-20 px-2 py-1.5 text-center align-middle sm:w-14 sm:py-2'>
                        <div className='flex h-8.75 min-h-8.75 items-center justify-center py-0.5'>
                          <Checkbox
                            variant='tableDense'
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
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {isOperationalLogsWorkspace ? (
        <section className='border-border max-w-full min-w-0 space-y-5 rounded-md border bg-white p-4 shadow-xs sm:p-5 lg:p-6'>
          <div className='space-y-4'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div className='min-w-0 space-y-1.5'>
                <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                  Operational Log Reference
                </p>
                <p className='text-foreground/90 text-[13px] leading-relaxed font-semibold'>
                  {opLogReferenceText || '—'}
                </p>
                {!opLogReferenceText ? (
                  <p className='text-muted-foreground text-[11px] font-medium'>
                    Save the operational log to create a reference
                  </p>
                ) : null}
              </div>
              {canShowSubmitForReview ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='inline-flex'>
                        <Button
                          type='button'
                          className='h-10 gap-1.5 text-[13px]! font-semibold'
                          onClick={openSubmitForReviewDialog}
                          disabled={
                            !canSubmitForReview ||
                            submitForReviewMutation.isPending
                          }
                        >
                          {submitForReviewMutation.isPending ? (
                            <Loader2Icon className='size-4 animate-spin' />
                          ) : hasExistingReport ? (
                            <FileSymlink className='size-4' aria-hidden />
                          ) : (
                            <FileChartColumn className='size-4' aria-hidden />
                          )}
                          {submitForReviewLabel}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {submitForReviewDisabledReason ? (
                      <TooltipContent side='bottom' sideOffset={8} surface>
                        {submitForReviewDisabledReason}
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
            <div className='border-border/70 border-t' />
            <OperationalLogWorkspaceContextBar
              {...operationalLogsSummaryCardsProps}
            />
          </div>

          {workspaceIsError ? (
            <>
              <div className='border-border/70 border-t' />
              <div
                className='border-border bg-card rounded-lg border p-4 shadow-xs sm:p-5'
                role='alert'
              >
                <div className='flex gap-3 sm:gap-4'>
                  <CircleAlert
                    className='mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500'
                    aria-hidden
                  />
                  <div className='min-w-0 flex-1 space-y-3'>
                    <div className='space-y-1'>
                      <p className='text-foreground text-sm font-semibold tracking-tight'>
                        Workspace could not be loaded
                      </p>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        {(workspaceError as Error)?.message ?? 'Unknown error.'}
                      </p>
                    </div>
                    <p className='text-muted-foreground text-[13px] leading-relaxed'>
                      Create an operational log draft for this care plan, then
                      return to this workspace. The report period is set by the
                      API from that log.
                    </p>
                    <Button
                      type='button'
                      className='h-10 text-[13px]! font-semibold'
                      onClick={() => createOperationalLogDraftMutation.mutate()}
                      disabled={createOperationalLogDraftMutation.isPending}
                    >
                      {createOperationalLogDraftMutation.isPending ? (
                        <Loader2Icon className='size-4 animate-spin' />
                      ) : null}
                      Create operational log draft
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : !workspace && workspaceFetching ? (
            <>
              <div className='border-border/70 border-t' />
              <OperationalLogWorksheetSkeleton />
            </>
          ) : workspace ? (
            <>
              <div className='border-border/70 border-t' />
              <div className='space-y-1'>
                <p className='text-foreground text-sm font-semibold'>
                  Evidence & Log Metrics Worksheet
                </p>
                <p className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
                  Review evidence against planned targets on the left, then
                  record operational log metrics on the right. The reporting
                  period is managed server-side by the operational log.
                </p>
              </div>
              <div className='grid min-h-0 grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-6'>
                <div className='min-h-0 min-w-0 space-y-3 lg:col-span-1'>
                  <EvidenceList
                    days={workspace.evidence}
                    onOpenImage={setLightboxUrl}
                  />
                </div>

                <div className='min-w-0 space-y-4 lg:col-span-2'>
                  {!formMetrics.length && !workspaceFetching ? (
                    <p className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
                      No suggested metrics for this range. You can still create
                      an operational log when targets exist in range, or adjust
                      the plan to include nutrition, activity, or recovery items
                      in this period.
                    </p>
                  ) : null}
                  <div className='space-y-6'>
                    {formMetrics.map((metric, mi) => (
                      <React.Fragment key={`${metric.metric_key}-${mi}`}>
                        {renderMetricEditorCard(metric, mi)}
                      </React.Fragment>
                    ))}
                  </div>
                  {operationalLog && !canEditMetrics ? (
                    <p className='text-muted-foreground text-xs leading-relaxed'>
                      Metrics are read-only when this operational log is not in{' '}
                      <span className='text-foreground font-medium'>draft</span>{' '}
                      or{' '}
                      <span className='text-foreground font-medium'>
                        in progress
                      </span>
                      , or when the log is marked as not editable on the server
                      (for example after submit or publish).
                    </p>
                  ) : null}
                </div>
              </div>
              {canEditMetrics ? (
                <div className='border-border/70 flex w-full max-w-full flex-wrap items-center justify-between gap-2 border-t pt-5'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Button
                      type='button'
                      className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
                      variant='outline'
                      onClick={() => setOperationalLogMetricsReviewOpen(true)}
                      disabled={
                        !formMetrics.length ||
                        saveMetricsMutation.isPending ||
                        !workspace
                      }
                      title='See what changed in the metrics worksheet (vs. last open or last save) before you save'
                    >
                      <ListChecks className='size-4' aria-hidden />
                      Review changes
                    </Button>
                  </div>
                  <div className='flex flex-wrap items-center justify-end gap-2'>
                    <Button
                      type='button'
                      className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
                      variant='outline'
                      onClick={() =>
                        router.push(ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.LIST)
                      }
                      disabled={saveMetricsMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='button'
                      className='h-10 gap-1.5 text-[13px]! font-semibold'
                      onClick={() => setSaveCarePlanConfirmOpen(true)}
                      disabled={saveMetricsMutation.isPending || !workspace}
                      title={!workspace ? 'Workspace not loaded' : undefined}
                    >
                      {saveMetricsMutation.isPending ? (
                        <Loader2Icon className='size-4 animate-spin' />
                      ) : (
                        <Save className='size-4' aria-hidden />
                      )}
                      Save operational log
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      ) : (
        <div className='bg-card sticky top-0 z-10 flex flex-col gap-3 rounded-md border p-4 shadow-sm'>
          <div className='flex w-full flex-col gap-3 md:flex-row md:items-end md:justify-between'>
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
                  <Label className='text-[11px]! font-bold tracking-wide uppercase'>
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
                      <SelectItem value='new'>
                        New period (suggested metrics)
                      </SelectItem>
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
        </div>
      )}

      {!isOperationalLogsWorkspace && (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          <section className='min-h-0 lg:col-span-5'>
            {workspaceIsError && (
              <p className='text-destructive text-sm'>
                {(workspaceError as Error)?.message}
              </p>
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
                      Clear the saved operational log or client report (pick
                      &quot;New&quot; in history) to change dates.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className='space-y-3 rounded-md border p-4'>
              {operationalLog?.status || clientReport?.status ? (
                <div className='flex flex-wrap items-center justify-end gap-1.5'>
                  {operationalLog?.status ? (
                    <Badge variant='outline' className='text-[10px] uppercase'>
                      Op log: {operationalLog.status}
                    </Badge>
                  ) : null}
                  {clientReport?.status ? (
                    <Badge
                      variant='secondary'
                      className='text-[10px] uppercase'
                    >
                      Client report: {clientReport.status}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
              {!formMetrics.length && !workspaceFetching ? (
                <p className='text-muted-foreground text-sm'>
                  No suggested metrics for this range. You can still create an
                  operational log when targets exist in range, or adjust the
                  plan to include nutrition, activity, or recovery items in this
                  period.
                </p>
              ) : null}
              <div className='space-y-6'>
                {formMetrics.map((metric, mi) => (
                  <React.Fragment key={`${metric.metric_key}-${mi}`}>
                    {renderMetricEditorCard(metric, mi)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className='space-y-3 rounded-md border p-4'>
              <h3 className='text-foreground text-sm font-semibold'>
                Care team narrative
              </h3>
              {!clientReport ? (
                <p className='text-muted-foreground text-sm'>
                  Narrative fields unlock after you submit the operational log
                  for review. Save the operational log first, then use
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

            <div className='flex w-full flex-col gap-2'>
              <div
                className={cn(
                  'flex w-full flex-wrap items-center gap-2',
                  canEditMetrics ? 'justify-between' : 'justify-end',
                )}
              >
                {canEditMetrics ? (
                  <div className='flex flex-wrap items-center gap-2'>
                    <Button
                      type='button'
                      className='gap-1.5'
                      variant='outline'
                      onClick={() => setOperationalLogMetricsReviewOpen(true)}
                      disabled={
                        !formMetrics.length ||
                        saveMetricsMutation.isPending ||
                        !workspace
                      }
                      title='See what changed in the metrics worksheet (vs. last open or last save) before you save'
                    >
                      <ListChecks className='size-4' aria-hidden />
                      Review changes
                    </Button>
                  </div>
                ) : null}
                <div className='flex flex-wrap items-center gap-2'>
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
                  {canEditMetrics ? (
                    <Button
                      type='button'
                      onClick={() => setSaveCarePlanConfirmOpen(true)}
                      disabled={saveMetricsMutation.isPending || !workspace}
                      className='gap-1.5'
                    >
                      {saveMetricsMutation.isPending ? (
                        <Loader2Icon className='size-4 animate-spin' />
                      ) : (
                        <Save className='size-4' aria-hidden />
                      )}
                      Save operational log
                    </Button>
                  ) : null}
                </div>
              </div>
              {isPublished ? (
                <p className='text-muted-foreground text-sm'>
                  This report is published; the operational log is locked and
                  cannot be edited here.
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
      )}

      <ReviewOperationalLogMetricsDialog
        open={operationalLogMetricsReviewOpen}
        onOpenChange={setOperationalLogMetricsReviewOpen}
        period={workspace?.period ?? null}
        diff={operationalMetricsReviewDiff}
        onContinueToSave={continueMetricsReviewToSave}
      />
      <SaveCarePlanDataConfirmation
        open={saveCarePlanConfirmOpen}
        isSubmitting={saveMetricsMutation.isPending}
        carePlanCode={saveCarePlanCodeForDialog}
        onOpenChange={setSaveCarePlanConfirmOpen}
        onConfirm={confirmSaveCarePlanData}
      />
      <SubmitOperationalLogForReviewDialog
        key={
          submitForReviewDialogOpen
            ? 'submit-review-open'
            : 'submit-review-closed'
        }
        open={submitForReviewDialogOpen}
        isSubmitting={submitForReviewMutation.isPending}
        hasExistingReport={hasExistingReport}
        metricOptions={submitReviewMetricOptions}
        includedMetricKeys={submitReviewIncludedMetricKeys}
        feedback={submitReviewFeedback}
        avgIntake={submitReviewAverageIntake}
        avgBurn={submitReviewAverageBurn}
        avgSteps={submitReviewAverageSteps}
        avgTrainingTime={submitReviewAverageTrainingMinutes}
        onOpenChange={setSubmitForReviewDialogOpen}
        onIncludedMetricKeysChange={setSubmitReviewIncludedMetricKeys}
        onFeedbackChange={setSubmitReviewFeedback}
        onAvgIntakeChange={setSubmitReviewAverageIntake}
        onAvgBurnChange={setSubmitReviewAverageBurn}
        onAvgStepsChange={setSubmitReviewAverageSteps}
        onAvgTrainingTimeChange={setSubmitReviewAverageTrainingMinutes}
        onSubmit={() => submitForReviewMutation.mutate()}
      />

      <OperationalLogMediaPreviewModal
        imageUrl={lightboxUrl}
        onOpenChange={(open) => {
          if (!open) setLightboxUrl(null);
        }}
      />
    </div>
  );
}

function EvidenceLineItemCard({
  item,
  onOpenImage,
}: {
  item: CarePlanReportEvidenceItem;
  onOpenImage: (url: string) => void;
}) {
  const targetDisplay = item.target
    ? `${item.target.value ?? '—'} ${item.target.unit ?? ''}`.trim()
    : '—';
  const log = item.log;
  const hasLog = log != null;
  const logValueDisplay = hasLog
    ? `${log.actual_value ?? '—'} ${log.unit ?? ''}`.trim()
    : 'No log yet';
  const noteText = hasLog
    ? (() => {
        const raw = log.notes;
        if (raw == null) return '—';
        const s = String(raw).trim();
        return s.length > 0 ? s : '—';
      })()
    : null;
  const media = log?.media?.length ? log.media : null;

  return (
    <div className='border-border dark:bg-card space-y-2 rounded-md border bg-white px-3 pt-3 pb-4 sm:px-3.5 sm:pt-3.5 sm:pb-5'>
      <p className='text-foreground/90 text-[12.5px] leading-tight font-semibold tracking-tight'>
        {item.title}
      </p>

      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
        <div className='bg-muted/15 border-border space-y-1 rounded-md border px-2.5 py-2'>
          <p className='text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400'>
            Target
          </p>
          <p className='text-foreground/90 text-[11px] leading-snug font-medium'>
            {targetDisplay}
          </p>
        </div>
        <div className='bg-muted/15 border-border space-y-1 rounded-md border px-2.5 py-2'>
          <p className='text-[10px] font-semibold tracking-wide text-sky-700 uppercase dark:text-sky-400'>
            Log
          </p>
          <p className='text-foreground/90 text-[11px] leading-snug font-medium'>
            {logValueDisplay}
          </p>
        </div>
      </div>

      {hasLog ? (
        <div className='bg-muted/15 border-border w-full min-w-0 space-y-1 rounded-md border px-2.5 py-2 sm:px-3 sm:py-2.5'>
          <p className='text-[10px] font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-400'>
            Log note
          </p>
          <p className='text-foreground/90 text-[11px] leading-relaxed font-medium wrap-break-word whitespace-pre-wrap'>
            {noteText}
          </p>
        </div>
      ) : null}

      {media && media.length > 0 ? (
        <div className='bg-muted/15 border-border space-y-2 rounded-md border px-2.5 py-2 sm:px-3 sm:py-2.5'>
          <p className='text-[10px] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-400'>
            Log media
          </p>
          <div className='flex flex-wrap gap-2'>
            {media.map((m, idx) => {
              const u = resolveMediaUrl(m.url);
              if (!u) return null;
              return (
                <button
                  key={m.id ?? idx}
                  type='button'
                  onClick={() => onOpenImage(u)}
                  className='border-border dark:bg-background relative h-12 w-12 overflow-hidden rounded-md border bg-white'
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
        </div>
      ) : null}
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
        No care-plan days in this period, or the client has not logged items
        yet.
      </p>
    );
  }
  return (
    <ul className='flex flex-col gap-2.5'>
      {days.map((d) => {
        const sectionGroups = groupEvidenceItemsBySection(d.items);
        const { totalTasks, totalLogs } = getEvidenceDayTaskLogCounts(d.items);
        return (
          <li
            key={`${d.target_date}-${d.day_index}`}
            className='relative isolate z-0'
          >
            <Collapsible
              className={cn(
                'group border-border w-full overflow-hidden rounded-md border',
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
                  aria-label={`Day ${d.day_index}, ${formatTargetDateLabel(d.target_date)}. ${totalTasks} tasks, ${totalLogs} logs. Toggle details.`}
                >
                  <div className='min-w-0 pr-2'>
                    <div className='text-[12.5px] font-semibold tracking-tight'>
                      Day {d.day_index}
                    </div>
                    <div className='text-muted-foreground/90 mt-0.5 text-[11px] font-medium tabular-nums'>
                      {formatTargetDateLabel(d.target_date)}
                    </div>
                  </div>
                  <div
                    className='flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2'
                    aria-hidden
                  >
                    <span className='border-border bg-muted/35 flex h-6 max-w-full items-center gap-1 rounded-md border border-solid px-2 text-[10px] leading-none font-medium'>
                      <ClipboardListIcon
                        className='text-foreground/65 size-3 shrink-0'
                        aria-hidden
                      />
                      <span className='text-foreground/80 text-[10px] font-semibold max-[360px]:sr-only'>
                        Tasks
                      </span>
                      <span className='text-foreground text-[11px] font-semibold tabular-nums'>
                        {totalTasks}
                      </span>
                    </span>
                    <span className='border-border bg-muted/35 flex h-6 max-w-full items-center gap-1 rounded-md border border-solid px-2 text-[10px] leading-none font-medium'>
                      <NotebookPenIcon
                        className='text-foreground/65 size-3 shrink-0'
                        aria-hidden
                      />
                      <span className='text-foreground/80 text-[10px] font-semibold max-[360px]:sr-only'>
                        Logs
                      </span>
                      <span className='text-foreground text-[11px] font-semibold tabular-nums'>
                        {totalLogs}
                      </span>
                    </span>
                    <ChevronDownIcon
                      aria-hidden
                      className='text-muted-foreground/80 size-3.5 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180'
                    />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent
                className={cn(
                  'min-h-0 overscroll-y-contain',
                  'max-h-[min(70dvh,30rem)]! overflow-x-hidden! overflow-y-auto!',
                  'sm:max-h-[min(75vh,36rem)]!',
                )}
              >
                <div className='border-border/70 bg-muted/10 space-y-3 rounded-b-md border-t px-2.5 pt-2.5 pb-4 sm:px-3 sm:pt-3 sm:pb-5 dark:bg-black/5'>
                  {sectionGroups.map(([sectionKey, items]) => (
                    <div
                      key={`${d.target_date}-${sectionKey}`}
                      className='space-y-2'
                    >
                      <div className='flex items-baseline justify-between gap-2 pb-0.5'>
                        <span className='text-foreground/90 text-[10px] font-bold tracking-wide uppercase'>
                          {formatSectionLabel(sectionKey)}
                        </span>
                        <span className='text-foreground/85 text-[10px] font-semibold tabular-nums sm:text-[11px]'>
                          {items.length} Task{items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className='space-y-2.5'>
                        {items.map((item) => (
                          <EvidenceLineItemCard
                            key={`${d.target_date}-${item.item_id}-${item.section}`}
                            item={item}
                            onOpenImage={onOpenImage}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </li>
        );
      })}
    </ul>
  );
}

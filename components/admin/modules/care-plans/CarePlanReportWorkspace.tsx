'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import {
  BookTextIcon,
  ChevronDownIcon,
  CircleAlert,
  ClipboardListIcon,
  ExpandIcon,
  FileChartColumn,
  FileSymlink,
  ImagesIcon,
  ListChecks,
  Loader2Icon,
  MoonIcon,
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
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  getCarePlanBuilderById,
  getCarePlanById,
  getCarePlanReportWorkspace,
  postCarePlanOperationalLog,
  postCarePlanOperationalLogDraft,
  postOperationalLogSubmitForReview,
  putCarePlanOperationalLog,
  putNutritionActualCalories,
} from '@/domains/care-plans/services';
import type {
  CarePlanReportDayJournal,
  CarePlanReportDayPhoto,
  CarePlanReportEvidenceDay,
  CarePlanReportEvidenceItem,
  CarePlanReportWorkspace,
  ReportMetricDailyPoint,
  ReportRunFeedback,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';
import {
  applyNutritionActualCaloriesToFormMetrics,
  applyNutritionActualCaloriesToWorkspace,
  isEditableNutritionKcalEvidenceItem,
  MEALS_TOTAL_KCAL_METRIC_KEY,
  resolveCarePlanDayId,
} from '@/lib/care-plans/applyNutritionActualCaloriesResponse';
import { getCarePlanSectionTab } from '@/lib/care-plans/carePlanSectionTabs';
import { buildAverageInputsAndManualHighlights } from '@/lib/care-plans/clientReportNarrativePayload';
import { diffReportRunMetrics } from '@/lib/care-plans/diffReportRunMetrics';
import {
  cloneReportRunMetrics,
  rollUpMetricFromDailyPoints,
} from '@/lib/care-plans/operationalLogMetricsRollup';
import { resolveReportAverageInputForDialog } from '@/lib/care-plans/reportGenerationAverageInputs';
import {
  canConfirmClientReportAuthoring,
  canEditReportWorkspaceMetrics,
  canShowSubmitOperationalLogForReview,
  isPublishedClientReportStatus,
} from '@/lib/care-plans/reportWorkspaceEditGating';
import { resolveOperationalLogForReportWorkspace } from '@/lib/care-plans/resolveOperationalLogForReportWorkspace';
import {
  getSleepQualityDisplay,
  isSleepEvidenceItem,
  resolveSleepQualityFromLog,
} from '@/lib/care-plans/sleepQuality';
import {
  adminCarePlanBriefQueryKey,
  carePlanReportWorkspaceQueryKey,
  invalidateReportWorkspaceCaches,
  syncOperationalLogSnapshotInReportCaches,
} from '@/lib/care-plans/syncOperationalLogSnapshotInReportCaches';
import { cn } from '@/lib/utils/styles';

const OPERATIONAL_LOG_LIST_QUERY_KEY = [
  'table',
  ENDPOINTS.ADMIN.MODULES.OPERATIONAL_LOGS.LIST,
] as const;

function carePlanBuilderQueryKey(carePlanId: number) {
  return ['care-plan', carePlanId, 'builder'] as const;
}

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
  const tab = getCarePlanSectionTab(sectionKey);
  if (tab) return tab.label;
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
};

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
}: CarePlanReportWorkspaceProps) {
  const router = useRouter();
  const workspacePath = ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.WORKSPACE(
    String(carePlanId),
  );
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [formMetrics, setFormMetrics] = React.useState<ReportRunMetric[]>([]);
  const [formFeedback, setFormFeedback] =
    React.useState<ReportRunFeedback>(emptyFeedback);
  const [lightboxMedia, setLightboxMedia] = React.useState<{
    url: string;
    contextLabel: string;
  } | null>(null);
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
  const workspaceFormKeyRef = React.useRef<string | null>(null);
  const formMetricsRef = React.useRef<ReportRunMetric[]>([]);
  /**
   * Bumped after workspace mutations so the form rehydrates from the refetched
   * server payload even when period / operational-log / report ids are unchanged.
   */
  const [workspaceHydrateNonce, setWorkspaceHydrateNonce] = React.useState(0);
  const [metricsSnapshotBaseline, setMetricsSnapshotBaseline] = React.useState<
    ReportRunMetric[] | null
  >(null);

  const { data: carePlanResult } = useQuery({
    queryKey: adminCarePlanBriefQueryKey(carePlanId),
    queryFn: async () => {
      const res = await getCarePlanById(carePlanId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not load care plan.');
      }
      return res.data;
    },
  });

  const carePlan = carePlanResult;

  const { data: carePlanBuilder } = useQuery({
    queryKey: carePlanBuilderQueryKey(carePlanId),
    queryFn: async () => {
      const res = await getCarePlanBuilderById(carePlanId);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not load care plan days.');
      }
      return res.data;
    },
  });

  const builderDays = React.useMemo(
    () => carePlanBuilder?.days ?? [],
    [carePlanBuilder?.days],
  );

  const resolveEvidenceDayId = React.useCallback(
    (targetDate: string, dayNumber: number) =>
      resolveCarePlanDayId(builderDays, targetDate, dayNumber),
    [builderDays],
  );

  React.useEffect(() => {
    if (searchParams.toString() === '') return;
    router.replace(workspacePath, { scroll: false });
  }, [router, searchParams, workspacePath]);

  const {
    data: workspaceResult,
    isFetching: workspaceFetching,
    isError: workspaceIsError,
    error: workspaceError,
  } = useQuery({
    queryKey: carePlanReportWorkspaceQueryKey(carePlanId),
    queryFn: async () => {
      const res = await getCarePlanReportWorkspace(carePlanId, {
        carePlanDefault: true,
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

  const workspace = workspaceResult;

  React.useEffect(() => {
    if (!workspace) return;
    const cr = workspace.client_report ?? workspace.report_run;
    const op = workspace.operational_log;
    const k = `${workspace.period.starts_on}|${workspace.period.ends_on}|op:${op?.id ?? 'n'}|cr:${cr?.id ?? 'n'}|h:${workspaceHydrateNonce}`;
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
  }, [workspace, workspaceHydrateNonce]);

  React.useEffect(() => {
    formMetricsRef.current = formMetrics;
  }, [formMetrics]);

  const clientReport =
    workspace?.client_report ?? workspace?.report_run ?? null;

  const operationalLog = React.useMemo(
    () => resolveOperationalLogForReportWorkspace(workspace, carePlan),
    [workspace, carePlan],
  );

  const canEditMetrics = canEditReportWorkspaceMetrics({
    operationalLog,
    clientReport,
  });
  /** Same gating as metrics worksheet; locked/published logs stay correctable. */
  const canEditNutritionActuals = canEditMetrics;
  const isLivePublishedReport = isPublishedClientReportStatus(
    clientReport?.status,
  );
  const activeOpLogId = operationalLog?.id ?? null;
  const canShowSubmitForReview = canShowSubmitOperationalLogForReview({
    operationalLog,
    clientReport,
  });
  const canSubmitForReview = canConfirmClientReportAuthoring({
    operationalLog,
    clientReport,
  });
  const submitForReviewDisabledReason =
    canShowSubmitForReview && !canSubmitForReview
      ? 'Save operational log metrics first. Generate report is available after the log moves to in progress.'
      : null;
  const hasExistingReport = clientReport != null;
  const submitForReviewLabel = isLivePublishedReport
    ? 'Update client report'
    : hasExistingReport
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

  const resolveAverageInputForDialog = React.useCallback(
    (
      key: 'avg_intake' | 'avg_burn' | 'avg_steps' | 'avg_training_time',
      generationDefault: unknown,
      currentValue: string,
      overrides?: {
        highlights?: typeof reportHighlights;
        existingAverageInputs?: Record<string, unknown> | null;
      },
    ) =>
      resolveReportAverageInputForDialog({
        metricKey: key,
        highlights: overrides?.highlights ?? reportHighlights,
        existingAverageInputs:
          overrides?.existingAverageInputs ??
          ((existingReportDraftState?.average_inputs ?? null) as Record<
            string,
            unknown
          > | null),
        generationDefault,
        currentValue,
      }),
    [existingReportDraftState?.average_inputs, reportHighlights],
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

  const [nutritionActualSavingKey, setNutritionActualSavingKey] =
    React.useState<string | null>(null);

  const nutritionActualCaloriesMutation = useMutation({
    mutationFn: async (vars: {
      dayId: number;
      itemId: number;
      dayIndex: number;
      targetDate: string;
      actualValue: number | null;
      savingKey: string;
    }) => {
      const res = await putNutritionActualCalories(
        carePlanId,
        vars.dayId,
        vars.itemId,
        { actual_value: vars.actualValue },
      );
      if (res.status === 'error') {
        throw new Error(
          res.message ?? 'Could not update nutrition actual calories.',
        );
      }
      if (!res.data) {
        throw new Error('No data returned when updating nutrition calories.');
      }
      return { data: res.data, vars };
    },
    onMutate: (vars) => {
      setNutritionActualSavingKey(vars.savingKey);
    },
    onSuccess: ({ data, vars }) => {
      const locate = {
        targetDate: vars.targetDate,
        dayIndex: vars.dayIndex,
        itemId: vars.itemId,
      };
      queryClient.setQueryData<CarePlanReportWorkspace | undefined>(
        carePlanReportWorkspaceQueryKey(carePlanId),
        (old) => {
          if (!old) return old;
          return applyNutritionActualCaloriesToWorkspace(old, locate, data);
        },
      );
      // Prefer server `meals_total_kcal` (in_progress); fall back to `day_rollup`
      // so draft logs still update All Nutrition Meals without a full reload.
      setFormMetrics((prev) =>
        applyNutritionActualCaloriesToFormMetrics(prev, data, {
          dayIndexFallback: vars.dayIndex,
        }),
      );
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
    onSettled: () => {
      setNutritionActualSavingKey(null);
    },
  });

  const { mutate: mutateNutritionActualCalories } =
    nutritionActualCaloriesMutation;

  const commitNutritionActual = React.useCallback(
    (args: {
      dayIndex: number;
      dayNumber: number;
      targetDate: string;
      itemId: number;
      actualValue: number | null;
    }) => {
      const dayId = resolveEvidenceDayId(args.targetDate, args.dayNumber);
      if (dayId == null) {
        toast.error(
          'Could not resolve this care-plan day. Reload the workspace and try again.',
        );
        return;
      }
      const savingKey = `${args.targetDate}:${args.itemId}`;
      mutateNutritionActualCalories({
        dayId,
        itemId: args.itemId,
        dayIndex: args.dayIndex,
        targetDate: args.targetDate,
        actualValue: args.actualValue,
        savingKey,
      });
    },
    [mutateNutritionActualCalories, resolveEvidenceDayId],
  );

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
      await queryClient.invalidateQueries({
        queryKey: [...OPERATIONAL_LOG_LIST_QUERY_KEY],
      });
      // Refetch workspace + care-plan brief from the server first…
      await invalidateReportWorkspaceCaches(queryClient, carePlanId);
      // …then overlay the save response so status/metrics cannot lag behind a
      // stale brief (resolveOperationalLog prefers the brief for gating).
      if (result.data) {
        syncOperationalLogSnapshotInReportCaches(
          queryClient,
          carePlanId,
          result.data,
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ['care-plan-logs', carePlanId],
        refetchType: 'active',
      });
      await queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.PERIOD_REPORTS.LIST],
      });
      // Force worksheet rehydrate from the refreshed cache (same op/report ids).
      setWorkspaceHydrateNonce((n) => n + 1);
      toast.success(
        result.mode === 'create'
          ? 'Operational log saved. Continue editing, then submit for review when ready.'
          : isLivePublishedReport
            ? 'The operational log was saved. The live client report now shows these numbers.'
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

  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      if (activeOpLogId == null)
        throw new Error('No operational log to submit.');
      const { averageInputs, manualHighlights } =
        buildAverageInputsAndManualHighlights({
          avgIntake: submitReviewAverageIntake,
          avgBurn: submitReviewAverageBurn,
          avgSteps: submitReviewAverageSteps,
          avgTrainingTime: submitReviewAverageTrainingMinutes,
        });
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
            Object.keys(averageInputs).length > 0 ? averageInputs : undefined,
          included_metric_keys: submitReviewIncludedMetricKeys,
          manual_highlights: manualHighlights,
        },
      );
      if (res.status === 'error') {
        throw new Error(
          res.message ??
            (isLivePublishedReport
              ? 'Could not update the client report.'
              : 'Could not submit for review.'),
        );
      }
      return res.data;
    },
    onSuccess: async (data) => {
      setSubmitForReviewDialogOpen(false);
      setFormFeedback({
        summary: data?.feedback?.summary ?? submitReviewFeedback.summary ?? '',
        focus_next_period:
          data?.feedback?.focus_next_period ??
          submitReviewFeedback.focus_next_period ??
          '',
        notes: data?.feedback?.notes ?? submitReviewFeedback.notes ?? '',
      });
      await invalidateReportWorkspaceCaches(queryClient, carePlanId);
      await queryClient.invalidateQueries({
        queryKey: ['care-plan-logs', carePlanId],
        refetchType: 'active',
      });
      await queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.PERIOD_REPORTS.LIST],
      });
      setWorkspaceHydrateNonce((n) => n + 1);
      router.replace(workspacePath, { scroll: false });
      toast.success(
        isLivePublishedReport
          ? 'The live client report was updated. The client keeps the same report.'
          : 'The report has been generated successfully.',
      );
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const [isOpeningSubmitForReviewDialog, setIsOpeningSubmitForReviewDialog] =
    React.useState(false);

  const openSubmitForReviewDialog = React.useCallback(async () => {
    setIsOpeningSubmitForReviewDialog(true);
    try {
      // Fresh defaults are computed server-side after metrics save; refetch so
      // Generate report does not open with a stale pre-save workspace cache.
      await queryClient.refetchQueries({
        queryKey: carePlanReportWorkspaceQueryKey(carePlanId),
        type: 'active',
      });
      const fresh = queryClient.getQueryData<CarePlanReportWorkspace>(
        carePlanReportWorkspaceQueryKey(carePlanId),
      );
      const freshClientReport =
        fresh?.client_report ?? fresh?.report_run ?? null;
      const freshDefaults =
        fresh?.report_generation_defaults?.average_inputs ?? null;
      const freshDraft = freshClientReport
        ? (freshClientReport as unknown as ExistingReportDraftState)
        : null;
      const freshHighlights = Array.isArray(freshDraft?.highlights)
        ? (freshDraft.highlights as ReportHighlight[])
        : [];
      const freshExistingAverages =
        (freshDraft?.average_inputs as Record<string, unknown> | null) ?? null;

      const reportFeedback = freshClientReport?.feedback;
      setSubmitReviewFeedback({
        summary: reportFeedback?.summary ?? formFeedback.summary ?? '',
        focus_next_period:
          reportFeedback?.focus_next_period ??
          formFeedback.focus_next_period ??
          '',
        notes: reportFeedback?.notes ?? formFeedback.notes ?? '',
      });
      setSubmitReviewIncludedMetricKeys(resolveIncludedMetricKeysForDialog());

      const averageOverrides = {
        highlights: freshHighlights,
        existingAverageInputs: freshExistingAverages,
      };
      // Pass empty currentValue so leftover local drafts cannot mask defaults.
      setSubmitReviewAverageIntake(
        resolveAverageInputForDialog(
          'avg_intake',
          freshDefaults?.avg_intake,
          '',
          averageOverrides,
        ),
      );
      setSubmitReviewAverageBurn(
        resolveAverageInputForDialog(
          'avg_burn',
          freshDefaults?.avg_burn,
          '',
          averageOverrides,
        ),
      );
      setSubmitReviewAverageSteps(
        resolveAverageInputForDialog(
          'avg_steps',
          freshDefaults?.avg_steps,
          '',
          averageOverrides,
        ),
      );
      setSubmitReviewAverageTrainingMinutes(
        resolveAverageInputForDialog(
          'avg_training_time',
          freshDefaults?.avg_training_time,
          '',
          averageOverrides,
        ),
      );
      setSubmitForReviewDialogOpen(true);
    } finally {
      setIsOpeningSubmitForReviewDialog(false);
    }
  }, [
    carePlanId,
    formFeedback.focus_next_period,
    formFeedback.notes,
    formFeedback.summary,
    queryClient,
    resolveAverageInputForDialog,
    resolveIncludedMetricKeysForDialog,
  ]);

  const createOperationalLogDraftMutation = useMutation({
    mutationFn: async () => {
      const res = await postCarePlanOperationalLogDraft(carePlanId, {});
      if (res.status === 'error') {
        throw new Error(
          res.message ?? 'Could not create operational log draft.',
        );
      }
    },
    onSuccess: async () => {
      await invalidateReportWorkspaceCaches(queryClient, carePlanId);
      await queryClient.invalidateQueries({
        queryKey: ['care-plan-logs', carePlanId],
        refetchType: 'active',
      });
      setWorkspaceHydrateNonce((n) => n + 1);
      toast.success('Operational log created. You can add metrics, then save.');
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const renderMetricEditorCard = (metric: ReportRunMetric, mi: number) => {
    const sectionTab = getCarePlanSectionTab(metric.section);
    const SectionIcon = sectionTab?.icon;
    /** Day actuals for All Nutrition Meals come from evidence meal edits only. */
    const canEditDailyBreakdown =
      canEditMetrics && metric.metric_key !== MEALS_TOTAL_KCAL_METRIC_KEY;

    return (
      <div className='border-border min-w-0 space-y-3 rounded-md border bg-white p-3 sm:p-4'>
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
                          disabled={!canEditDailyBreakdown}
                          id={`m-${mi}-d-${di}-t`}
                          aria-label={`${metric.label} day ${dp.day_number} target`}
                          title={
                            metric.metric_key === MEALS_TOTAL_KCAL_METRIC_KEY
                              ? 'Edit meal calories in evidence; this day total updates automatically'
                              : undefined
                          }
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
                          disabled={!canEditDailyBreakdown}
                          id={`m-${mi}-d-${di}-a`}
                          aria-label={`${metric.label} day ${dp.day_number} actual`}
                          title={
                            metric.metric_key === MEALS_TOTAL_KCAL_METRIC_KEY
                              ? 'Edit meal calories in evidence; this day total updates automatically'
                              : undefined
                          }
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
                            disabled={!canEditDailyBreakdown}
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
                        onClick={() => {
                          void openSubmitForReviewDialog();
                        }}
                        disabled={
                          !canSubmitForReview ||
                          submitForReviewMutation.isPending ||
                          isOpeningSubmitForReviewDialog
                        }
                      >
                        {submitForReviewMutation.isPending ||
                        isOpeningSubmitForReviewDialog ? (
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
          {isLivePublishedReport && canEditMetrics ? (
            <div
              role='note'
              className='rounded-md border border-sky-200/80 bg-sky-50/80 px-3 py-2.5 dark:border-sky-900 dark:bg-sky-950/30'
            >
              <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                Live client report
              </p>
              <p className='text-foreground/90 mt-1 text-[13px] leading-relaxed'>
                This report is live on the client app. Saving will update the
                numbers the client already sees. It will not create a new
                report.
              </p>
            </div>
          ) : null}
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
                Review evidence against planned targets on the left, then record
                operational log metrics on the right. The reporting period is
                managed server-side by the operational log.
              </p>
            </div>
            <div className='grid min-h-0 grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-6'>
              <div className='min-h-0 min-w-0 space-y-3 lg:col-span-1'>
                <EvidenceList
                  days={workspace.evidence}
                  canEditNutritionActuals={canEditNutritionActuals}
                  nutritionActualSavingKey={nutritionActualSavingKey}
                  resolveDayId={resolveEvidenceDayId}
                  onCommitNutritionActual={commitNutritionActual}
                  onOpenImage={(url, contextLabel) =>
                    setLightboxMedia({ url, contextLabel })
                  }
                />
              </div>

              <div className='min-w-0 space-y-4 lg:col-span-2'>
                {!formMetrics.length && !workspaceFetching ? (
                  <p className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
                    No suggested metrics for this range. You can still create an
                    operational log when targets exist in range, or adjust the
                    plan to include nutrition, activity, or recovery items in
                    this period.
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
                    Metrics are read-only for archived reports, or when the
                    server marks this operational log as not editable.
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
        isPublishedCorrection={isLivePublishedReport}
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
        isPublishedCorrection={isLivePublishedReport}
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
        imageUrl={lightboxMedia?.url ?? null}
        contextLabel={lightboxMedia?.contextLabel ?? null}
        onOpenChange={(open) => {
          if (!open) setLightboxMedia(null);
        }}
      />
    </div>
  );
}

function formatClientNoteUpdatedAt(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  try {
    return format(new Date(raw), 'MMM d, yyyy · h:mm a');
  } catch {
    return null;
  }
}

function formatLogActualDraft(
  value: number | string | null | undefined,
): string {
  if (value == null) return '';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  const s = String(value).trim();
  return s;
}

function EvidenceLineItemCard({
  item,
  dayIndex,
  dayNumber,
  targetDate,
  canEditNutritionActuals,
  isSavingNutritionActual,
  dayIdResolved,
  onCommitNutritionActual,
  onOpenImage,
}: {
  item: CarePlanReportEvidenceItem;
  dayIndex: number;
  dayNumber: number;
  targetDate: string;
  canEditNutritionActuals: boolean;
  isSavingNutritionActual: boolean;
  dayIdResolved: boolean;
  onCommitNutritionActual: (args: {
    dayIndex: number;
    dayNumber: number;
    targetDate: string;
    itemId: number;
    actualValue: number | null;
  }) => void;
  onOpenImage: (url: string, contextLabel: string) => void;
}) {
  const targetDisplay = item.target
    ? `${item.target.value ?? '—'} ${item.target.unit ?? ''}`.trim()
    : '—';
  const log = item.log;
  const hasLog = log != null;
  const canEditThisLog =
    canEditNutritionActuals &&
    isEditableNutritionKcalEvidenceItem(item) &&
    dayIdResolved;
  const serverActualDraft = formatLogActualDraft(log?.actual_value);
  const [actualDraft, setActualDraft] = React.useState(serverActualDraft);
  const [draftSyncKey, setDraftSyncKey] = React.useState(
    () => `${item.item_id}|${targetDate}|${serverActualDraft}`,
  );
  const nextDraftSyncKey = `${item.item_id}|${targetDate}|${serverActualDraft}`;
  // Sync local draft when the server value (or item identity) changes — during
  // render, not in an effect, so we avoid cascading effect-driven setState.
  if (nextDraftSyncKey !== draftSyncKey) {
    setDraftSyncKey(nextDraftSyncKey);
    setActualDraft(serverActualDraft);
  }

  const commitActualDraft = React.useCallback(() => {
    if (!canEditThisLog || isSavingNutritionActual) return;
    const trimmed = actualDraft.trim();
    let nextValue: number | null;
    if (trimmed === '') {
      nextValue = null;
    } else {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n < 0) {
        setActualDraft(serverActualDraft);
        toast.error(
          'Actual calories must be a number greater than or equal to 0.',
        );
        return;
      }
      nextValue = n;
    }
    const prevNormalized =
      serverActualDraft === '' ? null : Number(serverActualDraft);
    const prevComparable =
      prevNormalized != null && Number.isFinite(prevNormalized)
        ? prevNormalized
        : null;
    if (nextValue === prevComparable) return;
    onCommitNutritionActual({
      dayIndex,
      dayNumber,
      targetDate,
      itemId: item.item_id,
      actualValue: nextValue,
    });
  }, [
    actualDraft,
    canEditThisLog,
    dayIndex,
    dayNumber,
    isSavingNutritionActual,
    item.item_id,
    onCommitNutritionActual,
    serverActualDraft,
    targetDate,
  ]);

  const logValueDisplay = hasLog
    ? `${log.actual_value ?? '—'} ${log.unit ?? ''}`.trim()
    : 'No log yet';
  const logNoteText = hasLog ? String(log.notes ?? '').trim() : '';
  const hasLogNote = logNoteText.length > 0;
  const media = log?.media?.length ? log.media : null;
  const clientNoteBody = String(item.client_note?.body ?? '').trim();
  const hasClientNote = clientNoteBody.length > 0;
  const clientNoteUpdatedAt = hasClientNote
    ? formatClientNoteUpdatedAt(item.client_note?.updated_at)
    : null;
  const sleepQuality = isSleepEvidenceItem(item)
    ? resolveSleepQualityFromLog(log)
    : null;
  const sleepQualityDisplay = sleepQuality
    ? getSleepQualityDisplay(sleepQuality)
    : null;

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
          {canEditThisLog ? (
            <div className='flex items-center gap-1.5'>
              <TextField
                type='number'
                variant='tableDense'
                className='w-full min-w-0'
                min={0}
                step='any'
                value={actualDraft}
                onChange={(e) => setActualDraft(e.target.value)}
                onBlur={commitActualDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                disabled={isSavingNutritionActual}
                id={`nutrition-actual-${targetDate}-${item.item_id}`}
                aria-label={`${item.title} actual calories`}
                placeholder='kcal'
              />
              <span className='text-muted-foreground shrink-0 text-[10px] font-semibold tracking-wide uppercase'>
                kcal
              </span>
            </div>
          ) : (
            <p className='text-foreground/90 text-[11px] leading-snug font-medium'>
              {logValueDisplay}
            </p>
          )}
        </div>
      </div>

      {sleepQualityDisplay ? (
        <div className='w-full min-w-0 space-y-1 rounded-md border border-indigo-200/80 bg-indigo-50/70 px-2.5 py-2 sm:px-3 sm:py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/30'>
          <div className='flex items-center gap-1.5'>
            <MoonIcon
              className='size-3 shrink-0 text-indigo-700 dark:text-indigo-300'
              aria-hidden
            />
            <p className='text-[10px] font-semibold tracking-wide text-indigo-800 uppercase dark:text-indigo-300'>
              Sleep quality
            </p>
          </div>
          <p className='text-foreground/90 text-[11px] leading-snug font-semibold'>
            {sleepQualityDisplay.shortLabel}
          </p>
          <p className='text-foreground/80 text-[11px] leading-relaxed font-medium wrap-break-word'>
            {sleepQualityDisplay.description}
          </p>
        </div>
      ) : null}

      {hasClientNote ? (
        <div className='w-full min-w-0 space-y-1 rounded-md border border-orange-200/80 bg-orange-50/70 px-2.5 py-2 sm:px-3 sm:py-2.5 dark:border-orange-900/50 dark:bg-orange-950/30'>
          <div className='flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5'>
            <p className='text-[10px] font-semibold tracking-wide text-orange-800 uppercase dark:text-orange-300'>
              Client note
            </p>
            {clientNoteUpdatedAt ? (
              <p className='text-muted-foreground text-[10px] font-medium'>
                {clientNoteUpdatedAt}
              </p>
            ) : null}
          </div>
          <p className='text-foreground/90 text-[11px] leading-relaxed font-medium wrap-break-word whitespace-pre-wrap'>
            {clientNoteBody}
          </p>
        </div>
      ) : null}

      {hasLogNote ? (
        <div className='bg-muted/15 border-border w-full min-w-0 space-y-1 rounded-md border px-2.5 py-2 sm:px-3 sm:py-2.5'>
          <p className='text-[10px] font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-400'>
            Log note
          </p>
          <p className='text-foreground/90 text-[11px] leading-relaxed font-medium wrap-break-word whitespace-pre-wrap'>
            {logNoteText}
          </p>
        </div>
      ) : null}

      {media && media.length > 0 ? (
        <div className='bg-muted/15 border-border space-y-2 rounded-md border px-2.5 py-2 sm:px-3 sm:py-2.5'>
          <p className='text-[10px] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-400'>
            Log media
          </p>
          <div className='flex flex-wrap gap-2.5'>
            {media.map((m, idx) => {
              const u = resolveMediaUrl(m.url);
              if (!u) return null;
              return (
                <button
                  key={m.id ?? idx}
                  type='button'
                  onClick={() => onOpenImage(u, item.title)}
                  className={cn(
                    'group border-border dark:bg-background relative overflow-hidden',
                    'h-16 w-16 rounded-md border bg-white sm:h-18 sm:w-18',
                    'ring-offset-background focus-visible:ring-ring',
                    'hover:ring-primary/40 transition-shadow hover:shadow-md',
                    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                  )}
                >
                  <Image
                    src={u}
                    alt=''
                    fill
                    className='object-cover transition-transform duration-200 group-hover:scale-105'
                    unoptimized
                  />
                  <span
                    className={cn(
                      'absolute inset-0 flex items-center justify-center',
                      'bg-black/0 transition-colors group-hover:bg-black/35',
                    )}
                    aria-hidden
                  >
                    <ExpandIcon className='size-4 text-white opacity-0 drop-shadow-sm transition-opacity group-hover:opacity-100' />
                  </span>
                  <span className='sr-only'>
                    View full-size evidence for {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DayPhotosGallery({
  photos,
  dayLabel,
  onOpenImage,
}: {
  photos: CarePlanReportDayPhoto[];
  dayLabel: string;
  onOpenImage: (url: string, contextLabel: string) => void;
}) {
  return (
    <div className='border-border dark:bg-card space-y-3 rounded-lg border bg-white p-3 sm:p-3.5'>
      <div className='flex items-center gap-2'>
        <span className='bg-muted text-foreground/70 flex size-6 shrink-0 items-center justify-center rounded-md'>
          <ImagesIcon className='size-3.5' aria-hidden />
        </span>
        <p className='text-foreground/90 text-[11px] font-semibold tracking-wide uppercase'>
          Day photo
        </p>
      </div>
      <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
        {photos.map((photo) => {
          const u = resolveMediaUrl(photo.url);
          if (!u) return null;
          return (
            <button
              key={photo.id}
              type='button'
              onClick={() => onOpenImage(u, dayLabel)}
              className={cn(
                'group border-border dark:bg-background relative aspect-square overflow-hidden rounded-md border bg-white',
                'ring-offset-background focus-visible:ring-ring',
                'hover:ring-primary/40 transition-all hover:shadow-md hover:ring-1',
                'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
              )}
            >
              <Image
                src={u}
                alt=''
                fill
                sizes='(min-width: 640px) 25vw, 33vw'
                className='object-cover transition-transform duration-200 group-hover:scale-105'
                unoptimized
              />
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'bg-black/0 transition-colors group-hover:bg-black/35',
                )}
                aria-hidden
              >
                <ExpandIcon className='size-4 text-white opacity-0 drop-shadow-sm transition-opacity group-hover:opacity-100' />
              </span>
              <span className='sr-only'>
                View full-size photo for {dayLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Day-level gratitude journal (read-only). Same card chrome as day photos —
 * never nested under Recovery or Sleep task evidence.
 */
function DayJournalCard({ journal }: { journal: CarePlanReportDayJournal }) {
  const body = String(journal.body ?? '').trim();
  if (!body) return null;
  const updatedAt = formatClientNoteUpdatedAt(journal.updated_at);

  return (
    <div className='border-border dark:bg-card space-y-3 rounded-lg border bg-white p-3 sm:p-3.5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='bg-muted text-foreground/70 flex size-6 shrink-0 items-center justify-center rounded-md'>
            <BookTextIcon className='size-3.5' aria-hidden />
          </span>
          <p className='text-foreground/90 text-[11px] font-semibold tracking-wide uppercase'>
            Journal
          </p>
        </div>
        {updatedAt ? (
          <p className='text-muted-foreground shrink-0 text-[10px] font-medium tabular-nums'>
            {updatedAt}
          </p>
        ) : null}
      </div>

      <div className='space-y-1.5'>
        <p className='text-muted-foreground text-[11px] leading-snug font-medium'>
          What&apos;s your biggest gratitude today?
        </p>
        <p className='text-foreground text-[12.5px] leading-relaxed font-semibold wrap-break-word whitespace-pre-wrap'>
          {body}
        </p>
      </div>
    </div>
  );
}

function EvidenceList({
  days,
  canEditNutritionActuals,
  nutritionActualSavingKey,
  resolveDayId,
  onCommitNutritionActual,
  onOpenImage,
}: {
  days: CarePlanReportEvidenceDay[];
  canEditNutritionActuals: boolean;
  nutritionActualSavingKey: string | null;
  resolveDayId: (targetDate: string, dayNumber: number) => number | null;
  onCommitNutritionActual: (args: {
    dayIndex: number;
    dayNumber: number;
    targetDate: string;
    itemId: number;
    actualValue: number | null;
  }) => void;
  onOpenImage: (url: string, contextLabel: string) => void;
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
        const dayPhotos = d.photos?.length ? d.photos : null;
        const dayJournalBody = String(d.journal?.body ?? '').trim();
        const dayJournal =
          d.journal != null && dayJournalBody.length > 0 ? d.journal : null;
        const dayLabel = `Day ${d.day_index} — ${formatTargetDateLabel(d.target_date)}`;
        const dayIdResolved = resolveDayId(d.target_date, d.day_number) != null;
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
                  {dayPhotos ? (
                    <DayPhotosGallery
                      photos={dayPhotos}
                      dayLabel={dayLabel}
                      onOpenImage={onOpenImage}
                    />
                  ) : null}
                  {dayJournal ? <DayJournalCard journal={dayJournal} /> : null}
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
                        {items.map((item) => {
                          const savingKey = `${d.target_date}:${item.item_id}`;
                          return (
                            <EvidenceLineItemCard
                              key={`${d.target_date}-${item.item_id}-${item.section}`}
                              item={item}
                              dayIndex={d.day_index}
                              dayNumber={d.day_number}
                              targetDate={d.target_date}
                              canEditNutritionActuals={canEditNutritionActuals}
                              isSavingNutritionActual={
                                nutritionActualSavingKey === savingKey
                              }
                              dayIdResolved={dayIdResolved}
                              onCommitNutritionActual={onCommitNutritionActual}
                              onOpenImage={onOpenImage}
                            />
                          );
                        })}
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

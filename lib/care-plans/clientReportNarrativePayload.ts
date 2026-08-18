import type {
  SubmitForReviewManualHighlightPayload,
  UpdateCarePlanReportHighlightPayload,
} from '@/domains/care-plans/types/care-plan-report';

export const AVERAGE_HIGHLIGHT_METRIC_KEYS = [
  'avg_intake',
  'avg_burn',
  'avg_steps',
  'avg_training_time',
] as const;

type AverageHighlightMetricKey = (typeof AVERAGE_HIGHLIGHT_METRIC_KEYS)[number];

const AVERAGE_HIGHLIGHT_SPECS: ReadonlyArray<{
  metric_key: AverageHighlightMetricKey;
  label: string;
  unit: string;
}> = [
  {
    metric_key: 'avg_intake',
    label: 'Average intake',
    unit: 'Kilocalorie',
  },
  {
    metric_key: 'avg_burn',
    label: 'Average burn',
    unit: 'Kilocalorie',
  },
  {
    metric_key: 'avg_steps',
    label: 'Average steps',
    unit: 'steps',
  },
  {
    metric_key: 'avg_training_time',
    label: 'Average training time',
    unit: 'minute',
  },
];

export type AverageInputPayload = {
  avg_intake?: number;
  avg_burn?: number;
  avg_steps?: number;
  avg_training_time?: number;
};

export type ExistingClientReportHighlight = {
  metric_key?: unknown;
  label?: unknown;
  value?: unknown;
  unit?: unknown;
  source?: unknown;
  is_visible_to_client?: unknown;
  display_order?: unknown;
};

function parseNonNegativeNumber(raw: string): number | null {
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

/**
 * Builds submit-for-review average_inputs + client-visible average highlights
 * from the generate-report dialog fields.
 */
export function buildAverageInputsAndManualHighlights(args: {
  avgIntake: string;
  avgBurn: string;
  avgSteps: string;
  avgTrainingTime: string;
}): {
  averageInputs: AverageInputPayload;
  manualHighlights: SubmitForReviewManualHighlightPayload[];
} {
  const values: Record<AverageHighlightMetricKey, string> = {
    avg_intake: args.avgIntake,
    avg_burn: args.avgBurn,
    avg_steps: args.avgSteps,
    avg_training_time: args.avgTrainingTime,
  };

  const averageInputs: AverageInputPayload = {};
  const manualHighlights: SubmitForReviewManualHighlightPayload[] = [];

  for (const spec of AVERAGE_HIGHLIGHT_SPECS) {
    const parsed = parseNonNegativeNumber(values[spec.metric_key]);
    if (parsed == null) continue;
    averageInputs[spec.metric_key] = parsed;
    manualHighlights.push({
      metric_key: spec.metric_key,
      label: spec.label,
      value: parsed,
      unit: spec.unit,
      is_visible_to_client: true,
    });
  }

  return { averageInputs, manualHighlights };
}

export type WorksheetMetricSource = {
  metric_key: string;
  label: string;
  actual_value?: number | null;
  target_value?: number | null;
  unit?: string | null;
  unit_name?: string | null;
};

function isAverageHighlightKey(key: string): boolean {
  return (AVERAGE_HIGHLIGHT_METRIC_KEYS as readonly string[]).includes(key);
}

function finiteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function highlightValueFromMetric(metric: WorksheetMetricSource): number {
  return (
    finiteNumber(metric.actual_value) ??
    finiteNumber(metric.target_value) ??
    0
  );
}

/**
 * Full highlight list for PUT after publish. Step-2 included operational
 * metrics are always mapped (from existing highlights or the worksheet).
 * Average cards come from the dialog, not from leftover existing rows.
 */
export function buildPublishedReportHighlights(args: {
  existingHighlights: ExistingClientReportHighlight[];
  includedMetricKeys: string[];
  worksheetMetrics: WorksheetMetricSource[];
  manualHighlights: SubmitForReviewManualHighlightPayload[];
}): UpdateCarePlanReportHighlightPayload[] {
  const includedKeys = args.includedMetricKeys
    .map((key) => key.trim())
    .filter((key) => key !== '' && !isAverageHighlightKey(key));

  const existingByKey = new Map<string, ExistingClientReportHighlight>();
  for (const highlight of args.existingHighlights) {
    const metricKey =
      typeof highlight.metric_key === 'string' ? highlight.metric_key.trim() : '';
    if (!metricKey || isAverageHighlightKey(metricKey)) continue;
    existingByKey.set(metricKey, highlight);
  }

  const worksheetByKey = new Map<string, WorksheetMetricSource>();
  for (const metric of args.worksheetMetrics) {
    const metricKey = metric.metric_key.trim();
    if (!metricKey) continue;
    worksheetByKey.set(metricKey, metric);
  }

  const next: UpdateCarePlanReportHighlightPayload[] = [];

  for (const metricKey of includedKeys) {
    if (next.some((h) => h.metric_key === metricKey)) continue;

    const existing = existingByKey.get(metricKey);
    const worksheet = worksheetByKey.get(metricKey);
    const existingValue = existing ? finiteNumber(existing.value) : null;
    const value =
      existingValue ??
      (worksheet ? highlightValueFromMetric(worksheet) : null);
    if (value == null) continue;

    next.push({
      metric_key: metricKey,
      label:
        (typeof existing?.label === 'string' && existing.label.trim()
          ? existing.label.trim()
          : worksheet?.label.trim()) || metricKey,
      value,
      unit:
        (typeof existing?.unit === 'string' && existing.unit.trim()
          ? existing.unit.trim()
          : worksheet?.unit_name?.trim() || worksheet?.unit?.trim()) || null,
      source:
        typeof existing?.source === 'string' && existing.source.trim()
          ? existing.source.trim()
          : 'log',
      is_visible_to_client: existing
        ? existing.is_visible_to_client !== false
        : true,
      display_order: next.length,
    });
  }

  for (const highlight of args.manualHighlights) {
    next.push({
      metric_key: highlight.metric_key,
      label: highlight.label,
      value: highlight.value,
      unit: highlight.unit,
      source: 'manual',
      is_visible_to_client: highlight.is_visible_to_client,
      display_order: next.length,
    });
  }

  return next;
}

export function hasClientVisibleHighlight(
  highlights: ReadonlyArray<{ is_visible_to_client?: boolean }>,
): boolean {
  return highlights.some((highlight) => highlight.is_visible_to_client !== false);
}

import type {
  CarePlanLogEvidence,
  CarePlanReportEvidenceDay,
  CarePlanReportWorkspace,
  NutritionActualCaloriesMealsTotalKcal,
  NutritionActualCaloriesResult,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';

import {
  cloneReportRunMetrics,
  rollUpMetricFromDailyPoints,
} from './operationalLogMetricsRollup';

export const MEALS_TOTAL_KCAL_METRIC_KEY = 'meals_total_kcal' as const;

export type NutritionEvidenceLocateParams = {
  /** Prefer matching evidence day by calendar date. */
  targetDate: string;
  /** Period / evidence day index (1-based); used as fallback and for metrics. */
  dayIndex: number;
  itemId: number;
};

/**
 * Resolves `care_plan_days.id` for the actual-calories PUT from evidence
 * `target_date` (preferred) or `day_number`.
 *
 * @param days - Builder days with ids
 * @param targetDate - Evidence day `target_date`
 * @param dayNumber - Evidence day `day_number` (plan day label)
 */
export function resolveCarePlanDayId(
  days: ReadonlyArray<{
    id: number;
    day_number: number;
    target_date: string | null;
  }>,
  targetDate: string,
  dayNumber: number,
): number | null {
  const byDate = targetDate.trim();
  if (byDate) {
    const match = days.find((d) => (d.target_date ?? '').trim() === byDate);
    if (match) return match.id;
  }
  const byNumber = days.find((d) => d.day_number === dayNumber);
  return byNumber?.id ?? null;
}

/**
 * Whether an evidence item should show an editable nutrition actual (kcal) input.
 */
export function isEditableNutritionKcalEvidenceItem(item: {
  section: string;
  target?: { unit?: string | null } | null;
}): boolean {
  if (item.section !== 'nutrition') return false;
  const unit = (item.target?.unit ?? '').trim().toLowerCase();
  return unit === 'kcal';
}

/**
 * Patches a single evidence item's `log` from the actual-calories API response.
 * Returns the original array reference when the day/item cannot be found.
 *
 * @param evidence - Workspace evidence days
 * @param locate - Day/item coordinates from the UI
 * @param log - Updated log payload from the API
 */
export function patchEvidenceItemLog(
  evidence: CarePlanReportEvidenceDay[],
  locate: NutritionEvidenceLocateParams,
  log: CarePlanLogEvidence,
): CarePlanReportEvidenceDay[] {
  const dayIdx = evidence.findIndex((d) => {
    if (locate.targetDate && d.target_date === locate.targetDate) return true;
    return d.day_index === locate.dayIndex;
  });
  if (dayIdx < 0) return evidence;

  const day = evidence[dayIdx];
  const itemIdx = day.items.findIndex((i) => i.item_id === locate.itemId);
  if (itemIdx < 0) return evidence;

  const nextItems = day.items.map((item, i) =>
    i === itemIdx ? { ...item, log } : item,
  );
  const nextDays = evidence.map((d, i) =>
    i === dayIdx ? { ...d, items: nextItems } : d,
  );
  return nextDays;
}

/**
 * Applies `meals_total_kcal` day point + period totals onto the metrics worksheet.
 * Leaves metrics unchanged when rollup is null or the metric row is missing.
 *
 * @param metrics - Current form metrics
 * @param mealsTotal - Rollup from the actual-calories API (or null)
 */
export function applyMealsTotalKcalToFormMetrics(
  metrics: ReportRunMetric[],
  mealsTotal: NutritionActualCaloriesMealsTotalKcal | null,
): ReportRunMetric[] {
  if (mealsTotal == null) return metrics;

  const metricKey = mealsTotal.metric_key || MEALS_TOTAL_KCAL_METRIC_KEY;
  const mi = metrics.findIndex((m) => m.metric_key === metricKey);
  if (mi < 0) return metrics;

  const next = cloneReportRunMetrics(metrics);
  const metric = next[mi];
  const periodDayNumber = mealsTotal.daily_point.day_number;
  const pointIdx = metric.daily_points.findIndex(
    (p) => p.day_number === periodDayNumber,
  );
  if (pointIdx < 0) return metrics;

  const dp = mealsTotal.daily_point;
  metric.daily_points[pointIdx] = {
    ...metric.daily_points[pointIdx],
    day_number: dp.day_number,
    target_value: dp.target_value,
    actual_value: dp.actual_value,
    on_target: dp.on_target,
  };

  if (mealsTotal.target_value !== undefined) {
    metric.target_value = mealsTotal.target_value;
  }
  if (mealsTotal.actual_value !== undefined) {
    metric.actual_value = mealsTotal.actual_value;
  }
  if (typeof mealsTotal.days_on_target === 'number') {
    metric.days_on_target = mealsTotal.days_on_target;
  }
  if (typeof mealsTotal.days_total === 'number') {
    metric.days_total = mealsTotal.days_total;
  }

  next[mi] = rollUpMetricFromDailyPoints(metric);
  return next;
}

/**
 * Patches report-workspace evidence from an actual-calories success payload.
 *
 * @param workspace - Current workspace cache value
 * @param locate - Day/item coordinates
 * @param result - API `data` payload
 */
export function applyNutritionActualCaloriesToWorkspace(
  workspace: CarePlanReportWorkspace,
  locate: NutritionEvidenceLocateParams,
  result: NutritionActualCaloriesResult,
): CarePlanReportWorkspace {
  return {
    ...workspace,
    evidence: patchEvidenceItemLog(workspace.evidence, locate, result.log),
  };
}

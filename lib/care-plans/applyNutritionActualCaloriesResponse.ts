import type {
  CarePlanLogEvidence,
  CarePlanReportEvidenceDay,
  CarePlanReportWorkspace,
  NutritionActualCaloriesDayRollup,
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
 * Patches All Nutrition Meals from `day_rollup` when the API omits
 * `meals_total_kcal` (common for draft operational logs that still show
 * suggested metrics in the worksheet).
 *
 * @param metrics - Current form metrics
 * @param dayRollup - Per-day rollup from the actual-calories API
 * @param dayIndexFallback - Evidence `day_index` (1-based) if day_number miss
 */
export function applyDayRollupToMealsTotalFormMetrics(
  metrics: ReportRunMetric[],
  dayRollup: NutritionActualCaloriesDayRollup,
  dayIndexFallback?: number,
): ReportRunMetric[] {
  const mi = metrics.findIndex(
    (m) => m.metric_key === MEALS_TOTAL_KCAL_METRIC_KEY,
  );
  if (mi < 0) return metrics;

  const next = cloneReportRunMetrics(metrics);
  const metric = next[mi];
  let pointIdx = metric.daily_points.findIndex(
    (p) => p.day_number === dayRollup.day_number,
  );
  if (pointIdx < 0 && dayIndexFallback != null) {
    pointIdx = metric.daily_points.findIndex(
      (p) => p.day_number === dayIndexFallback,
    );
  }
  if (pointIdx < 0 && dayIndexFallback != null) {
    const byIndex = dayIndexFallback - 1;
    if (byIndex >= 0 && byIndex < metric.daily_points.length) {
      pointIdx = byIndex;
    }
  }
  if (pointIdx < 0) return metrics;

  metric.daily_points[pointIdx] = {
    ...metric.daily_points[pointIdx],
    target_value: dayRollup.target_value,
    actual_value: dayRollup.actual_value,
    on_target: dayRollup.on_target,
  };
  next[mi] = rollUpMetricFromDailyPoints(metric);
  return next;
}

/**
 * Updates All Nutrition Meals worksheet metrics from an actual-calories response.
 * Prefers full `meals_total_kcal` when present; otherwise applies `day_rollup`
 * so draft status still updates live without a full workspace reload.
 */
export function applyNutritionActualCaloriesToFormMetrics(
  metrics: ReportRunMetric[],
  result: Pick<
    NutritionActualCaloriesResult,
    'meals_total_kcal' | 'day_rollup'
  >,
  options?: { dayIndexFallback?: number },
): ReportRunMetric[] {
  if (result.meals_total_kcal != null) {
    return applyMealsTotalKcalToFormMetrics(metrics, result.meals_total_kcal);
  }
  return applyDayRollupToMealsTotalFormMetrics(
    metrics,
    result.day_rollup,
    options?.dayIndexFallback,
  );
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

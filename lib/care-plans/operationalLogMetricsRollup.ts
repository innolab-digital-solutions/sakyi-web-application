import type {
  ReportMetricDailyPoint,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';

/**
 * Deep clone metrics for form state and baseline snapshots.
 */
export function cloneReportRunMetrics(
  metrics: ReportRunMetric[],
): ReportRunMetric[] {
  return JSON.parse(JSON.stringify(metrics)) as ReportRunMetric[];
}

/**
 * Coerces a daily numeric cell to a finite number for summing.
 * Non-finite / nullish values become 0 so stringy API payloads cannot
 * concatenate into broken totals (e.g. `"30" + "30"` → `"03030"`).
 */
function dailyNumericOrZero(value: number | null | undefined): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Sums a daily numeric field across the grid.
 * All-null / empty → `null` so the preview card can show "Not set".
 */
function sumDailyNumericField(
  points: ReportMetricDailyPoint[],
  field: 'target_value' | 'actual_value',
): number | null {
  if (!points.length) return null;
  if (points.every((p) => p[field] == null)) return null;
  return points.reduce((sum, p) => sum + dailyNumericOrZero(p[field]), 0);
}

/**
 * Derives the period target total from the daily grid so the Target preview
 * card and PUT payload match what the user enters per day.
 *
 * Always sums per-day targets (null days count as 0). Identical daily values
 * (e.g. 30 + 30) correctly total 60 — they are not collapsed to a single day.
 *
 * All-null targets → `null`. Empty grid → `null`.
 */
export function rollupPeriodTargetFromDailies(
  points: ReportMetricDailyPoint[],
): number | null {
  return sumDailyNumericField(points, 'target_value');
}

/**
 * Derives the period actual total from the daily grid so the Actual preview
 * card and PUT payload match what the user enters per day.
 *
 * Always sums per-day actuals (null days count as 0), including when every day
 * uses the same value (e.g. 30 + 30 → 60).
 *
 * All-null actuals → `null`. Empty grid → `null`.
 */
export function rollupPeriodActualFromDailies(
  points: ReportMetricDailyPoint[],
): number | null {
  return sumDailyNumericField(points, 'actual_value');
}

/**
 * Merges rolled-up period target / actual / on-target days onto a metric.
 * Target and actual both sum the daily grid the same way (null days count as 0
 * for the sum; all-null fields stay `null`).
 */
export function rollUpMetricFromDailyPoints(
  m: ReportRunMetric,
): ReportRunMetric {
  const p = m.daily_points;
  if (!p.length) {
    return m;
  }
  return {
    ...m,
    days_total: p.length,
    days_on_target: p.filter((d) => d.on_target).length,
    actual_value: rollupPeriodActualFromDailies(p),
    target_value: rollupPeriodTargetFromDailies(p),
  };
}

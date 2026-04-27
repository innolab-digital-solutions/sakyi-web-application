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
 * Derives period-level summary numbers from the daily grid so the stat cards
 * and PUT payload match what the user edits in the table (operational-logs
 * worksheet).
 *
 * - Target: if every day has the same target, that value; otherwise sum of
 *   (per-day target or 0). All-null targets → `null`.
 * - Actual: sum of per-day actuals.
 * - On-target / days total: from row checkboxes and row count.
 */
export function rollupPeriodTargetFromDailies(
  points: ReportMetricDailyPoint[],
): number | null {
  if (!points.length) return null;
  const t = points.map((p) => p.target_value);
  if (t.every((v) => v == null)) return null;
  if (t.every((v) => v != null && v === t[0])) return t[0] as number;
  return points.reduce((s, p) => s + (p.target_value ?? 0), 0);
}

/**
 * Merges rolled-up target / actual / on-target days onto a metric.
 */
export function rollUpMetricFromDailyPoints(m: ReportRunMetric): ReportRunMetric {
  const p = m.daily_points;
  if (!p.length) {
    return m;
  }
  return {
    ...m,
    days_total: p.length,
    days_on_target: p.filter((d) => d.on_target).length,
    actual_value: p.reduce((s, d) => s + (d.actual_value ?? 0), 0),
    target_value: rollupPeriodTargetFromDailies(p),
  };
}

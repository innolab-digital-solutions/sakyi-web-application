import type {
  ReportMetricDailyPoint,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';

/**
 * A single before/after line for a metric or a daily cell.
 */
export type ReportMetricValueChange = {
  /** Human-readable, e.g. "Day 3 · target" or "Unit" */
  pathLabel: string;
  before: string;
  after: string;
};

export type ReportRunMetricRowDiff = {
  /** For stable React keys and tests; not shown in the review UI. */
  metricKey: string;
  /** Care plan section key, e.g. `nutrition` — display label comes from the UI. */
  section: string;
  label: string;
  /** `true` if metric_key at this index no longer lines up. */
  keyMismatch: boolean;
  changes: ReportMetricValueChange[];
};

export type ReportRunMetricsDiff = {
  /** When metric row counts differ, save still works but the list is unusual. */
  structurallyDifferentLength: boolean;
  metrics: ReportRunMetricRowDiff[];
  totalFieldChanges: number;
};

function formatNumberField(v: number | null | undefined): string {
  if (v == null) return 'Not set';
  if (!Number.isFinite(Number(v))) return 'Not set';
  return String(v);
}

function formatOnTargetField(v: boolean | undefined): string {
  return v === true ? 'Yes' : 'No';
}

function mapByDayNumber(
  points: ReportMetricDailyPoint[] | undefined,
): Map<number, ReportMetricDailyPoint> {
  const m = new Map<number, ReportMetricDailyPoint>();
  for (const p of points ?? []) {
    m.set(p.day_number, p);
  }
  return m;
}

function valuesEqual(
  field: 'target_value' | 'actual_value' | 'on_target',
  a: ReportMetricDailyPoint | undefined,
  b: ReportMetricDailyPoint | undefined,
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (field === 'on_target') {
    return a.on_target === b.on_target;
  }
  const x = a[field];
  const y = b[field];
  if (x == null && y == null) return true;
  if (x == null || y == null) return false;
  return Number(x) === Number(y);
}

function fieldLabel(
  dayNumber: number,
  field: 'target_value' | 'actual_value' | 'on_target',
): string {
  if (field === 'target_value') return `Day ${dayNumber} · target`;
  if (field === 'actual_value') return `Day ${dayNumber} · actual`;
  return `Day ${dayNumber} · on target`;
}

/**
 * Returns all cell-level and unit-level changes between two metric snapshots
 * (typically: baseline from load / last save vs current `formMetrics`).
 */
export function diffReportRunMetrics(
  baseline: ReportRunMetric[] | null | undefined,
  current: ReportRunMetric[] | null | undefined,
): ReportRunMetricsDiff {
  const b = baseline ?? [];
  const c = current ?? [];
  const structurallyDifferentLength = b.length !== c.length;
  const maxI = Math.max(b.length, c.length);
  const out: ReportRunMetricRowDiff[] = [];
  let totalFieldChanges = 0;

  for (let i = 0; i < maxI; i++) {
    const bm = b[i];
    const cm = c[i];
    if (!cm && !bm) continue;

    const label = (cm?.label ?? bm?.label ?? 'Metric')?.toString() || 'Metric';
    const keyMismatch = Boolean(bm && cm && bm.metric_key !== cm.metric_key);
    const metricKey = (cm?.metric_key ?? bm?.metric_key ?? `index-${i}`) as
      | string
      | number;

    const changes: ReportMetricValueChange[] = [];

    if (!bm && cm) {
      const dayCount = cm.daily_points?.length ?? 0;
      changes.push({
        pathLabel: 'Metric',
        before: '—',
        after:
          dayCount > 0
            ? `Added (${dayCount} day${dayCount === 1 ? '' : 's'} in grid)`
            : 'Added (new row, no day rows yet)',
      });
      totalFieldChanges += 1;
      out.push({
        metricKey: String(metricKey),
        section: String(cm.section ?? 'other'),
        label,
        keyMismatch: false,
        changes,
      });
      continue;
    }

    if (bm && !cm) {
      changes.push({
        pathLabel: 'Metric',
        before: 'Present',
        after: 'Removed',
      });
      totalFieldChanges += 1;
      out.push({
        metricKey: String(bm.metric_key),
        section: String(bm.section ?? 'other'),
        label: bm.label,
        keyMismatch: false,
        changes,
      });
      continue;
    }

    if (!bm || !cm) continue;

    const uBefore = (bm.unit ?? '').trim();
    const uAfter = (cm.unit ?? '').trim();
    if (uBefore !== uAfter) {
      changes.push({
        pathLabel: 'Unit',
        before: uBefore || '—',
        after: uAfter || '—',
      });
      totalFieldChanges += 1;
    }

    const bMap = mapByDayNumber(bm.daily_points);
    const cMap = mapByDayNumber(cm.daily_points);
    const daySet = new Set<number>([...bMap.keys(), ...cMap.keys()]);
    const days = [...daySet].sort((x, y) => x - y);

    for (const day of days) {
      const dpB = bMap.get(day);
      const dpC = cMap.get(day);
      for (const field of [
        'target_value',
        'actual_value',
        'on_target',
      ] as const) {
        if (valuesEqual(field, dpB, dpC)) continue;
        if (!dpB && dpC) {
          const after =
            field === 'on_target'
              ? formatOnTargetField(dpC.on_target)
              : formatNumberField(dpC[field] as number | null);
          changes.push({
            pathLabel: fieldLabel(day, field),
            before: '—',
            after,
          });
          totalFieldChanges += 1;
          continue;
        }
        if (dpB && !dpC) {
          const before =
            field === 'on_target'
              ? formatOnTargetField(dpB.on_target)
              : formatNumberField(dpB[field] as number | null);
          changes.push({
            pathLabel: fieldLabel(day, field),
            before,
            after: '—',
          });
          totalFieldChanges += 1;
          continue;
        }
        if (dpB && dpC) {
          const before =
            field === 'on_target'
              ? formatOnTargetField(dpB.on_target)
              : formatNumberField(dpB[field] as number | null);
          const after =
            field === 'on_target'
              ? formatOnTargetField(dpC.on_target)
              : formatNumberField(dpC[field] as number | null);
          if (before === after) continue;
          changes.push({
            pathLabel: fieldLabel(day, field),
            before,
            after,
          });
          totalFieldChanges += 1;
        }
      }
    }

    if (keyMismatch) {
      changes.push({
        pathLabel: 'Row alignment',
        before: 'This row was a different metric',
        after: 'Another metric now — confirm this row in the sheet',
      });
      totalFieldChanges += 1;
    }

    if (changes.length) {
      out.push({
        metricKey: String(cm.metric_key),
        section: String(cm.section ?? 'other'),
        label: cm.label,
        keyMismatch,
        changes,
      });
    }
  }

  return { structurallyDifferentLength, metrics: out, totalFieldChanges };
}

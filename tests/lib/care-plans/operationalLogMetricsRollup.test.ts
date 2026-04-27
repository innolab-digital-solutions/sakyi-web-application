import { describe, expect, it } from 'vitest';

import type { ReportRunMetric } from '@/domains/care-plans/types/care-plan-report';
import {
  cloneReportRunMetrics,
  rollUpMetricFromDailyPoints,
  rollupPeriodTargetFromDailies,
} from '@/lib/care-plans/operationalLogMetricsRollup';

const base: ReportRunMetric = {
  section: 'movement',
  metric_key: 'k',
  label: 'L',
  target_value: null,
  actual_value: null,
  unit: 'u',
  days_on_target: 0,
  days_total: 0,
  display_order: 0,
  daily_points: [
    { day_number: 1, target_value: 10, actual_value: 5, on_target: true },
    { day_number: 2, target_value: 10, actual_value: 0, on_target: false },
  ],
};

describe('operationalLogMetricsRollup', () => {
  it('cloneReportRunMetrics deep-clones (mutations do not leak)', () => {
    const a = cloneReportRunMetrics([base]);
    a[0].label = 'Changed';
    expect(base.label).toBe('L');
  });

  it('rollupPeriodTargetFromDailies returns shared value when all days match', () => {
    expect(rollupPeriodTargetFromDailies(base.daily_points)).toBe(10);
  });

  it('rollUpMetricFromDailyPoints sets period fields from the grid', () => {
    const r = rollUpMetricFromDailyPoints(base);
    expect(r.days_total).toBe(2);
    expect(r.days_on_target).toBe(1);
    expect(r.actual_value).toBe(5);
    expect(r.target_value).toBe(10);
  });

  it('leaves_metric_unchanged_when_no_daily_points', () => {
    const m: ReportRunMetric = { ...base, daily_points: [] };
    const r = rollUpMetricFromDailyPoints(m);
    expect(r).toBe(m);
  });
});

import { describe, expect, it } from 'vitest';

import type { ReportRunMetric } from '@/domains/care-plans/types/care-plan-report';
import { diffReportRunMetrics } from '@/lib/care-plans/diffReportRunMetrics';

function makeMetric(
  overrides: Partial<ReportRunMetric> &
    Pick<ReportRunMetric, 'metric_key' | 'label'>,
): ReportRunMetric {
  const { metric_key, label, ...rest } = overrides;
  return {
    section: 'movement',
    metric_key,
    label,
    target_value: rest.target_value ?? null,
    actual_value: rest.actual_value ?? null,
    unit: rest.unit ?? 'steps',
    days_on_target: rest.days_on_target ?? 0,
    days_total: rest.days_total ?? 0,
    display_order: rest.display_order ?? 0,
    meta: rest.meta ?? null,
    daily_points: rest.daily_points ?? [],
    ...rest,
  };
}

describe('diffReportRunMetrics', () => {
  it('returns no changes when snapshots are identical', () => {
    const m = makeMetric({
      metric_key: 'steps',
      label: 'Steps',
      daily_points: [
        {
          day_number: 1,
          target_value: 100,
          actual_value: 50,
          on_target: true,
        },
      ],
    });
    const result = diffReportRunMetrics([m], [JSON.parse(JSON.stringify(m))]);
    expect(result.totalFieldChanges).toBe(0);
    expect(result.metrics).toHaveLength(0);
    expect(result.structurallyDifferentLength).toBe(false);
  });

  it('detects daily target value change', () => {
    const before = makeMetric({
      metric_key: 'm1',
      label: 'M1',
      daily_points: [
        { day_number: 1, target_value: 10, actual_value: 5, on_target: false },
      ],
    });
    const after = JSON.parse(JSON.stringify(before)) as ReportRunMetric;
    after.daily_points[0].target_value = 20;

    const result = diffReportRunMetrics([before], [after]);
    expect(result.totalFieldChanges).toBe(1);
    expect(result.metrics[0]?.section).toBe('movement');
    expect(
      result.metrics[0]?.changes.some((c) => c.pathLabel.includes('target')),
    ).toBe(true);
    expect(result.metrics[0]?.changes[0]?.before).toBe('10');
    expect(result.metrics[0]?.changes[0]?.after).toBe('20');
  });

  it('detects on_target toggle', () => {
    const before = makeMetric({
      metric_key: 'm1',
      label: 'M1',
      daily_points: [
        { day_number: 1, target_value: 1, actual_value: 1, on_target: false },
      ],
    });
    const after = JSON.parse(JSON.stringify(before)) as ReportRunMetric;
    after.daily_points[0].on_target = true;

    const result = diffReportRunMetrics([before], [after]);
    expect(result.totalFieldChanges).toBe(1);
    expect(result.metrics[0]?.changes[0]?.pathLabel).toContain('on target');
    expect(result.metrics[0]?.changes[0]?.before).toBe('No');
    expect(result.metrics[0]?.changes[0]?.after).toBe('Yes');
  });

  it('flags structurally different row counts', () => {
    const a = makeMetric({
      metric_key: 'a',
      label: 'A',
      daily_points: [],
    });
    const result = diffReportRunMetrics([a], [a, a]);
    expect(result.structurallyDifferentLength).toBe(true);
  });

  it('treats null baseline as empty', () => {
    const current = makeMetric({
      metric_key: 'x',
      label: 'X',
      daily_points: [
        { day_number: 1, target_value: 1, actual_value: 0, on_target: false },
      ],
    });
    const result = diffReportRunMetrics(null, [current]);
    expect(result.metrics.length).toBeGreaterThan(0);
    expect(result.totalFieldChanges).toBeGreaterThan(0);
  });

  it('detects unit change on metric', () => {
    const before = makeMetric({
      metric_key: 'm1',
      label: 'M1',
      unit: 'kcal',
      daily_points: [
        { day_number: 1, target_value: 1, actual_value: 1, on_target: true },
      ],
    });
    const after = JSON.parse(JSON.stringify(before)) as ReportRunMetric;
    after.unit = 'steps';

    const result = diffReportRunMetrics([before], [after]);
    expect(result.metrics[0]?.changes.some((c) => c.pathLabel === 'Unit')).toBe(
      true,
    );
  });
});

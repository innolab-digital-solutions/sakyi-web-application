import { describe, expect, it } from 'vitest';

import type { ReportRunMetric } from '@/domains/care-plans/types/care-plan-report';
import {
  cloneReportRunMetrics,
  rollUpMetricFromDailyPoints,
  rollupPeriodActualFromDailies,
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

  describe('rollupPeriodTargetFromDailies', () => {
    it('sums_identical_daily_targets_into_the_period_total', () => {
      expect(rollupPeriodTargetFromDailies(base.daily_points)).toBe(20);
    });

    it('sums_different_daily_targets_into_the_period_total', () => {
      expect(
        rollupPeriodTargetFromDailies([
          {
            day_number: 1,
            target_value: 30,
            actual_value: 0,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: 40,
            actual_value: 0,
            on_target: false,
          },
        ]),
      ).toBe(70);
    });

    it('returns_null_when_every_daily_target_is_null', () => {
      expect(
        rollupPeriodTargetFromDailies([
          {
            day_number: 1,
            target_value: null,
            actual_value: 1,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: null,
            actual_value: 2,
            on_target: false,
          },
        ]),
      ).toBeNull();
    });

    it('returns_null_for_an_empty_daily_grid', () => {
      expect(rollupPeriodTargetFromDailies([])).toBeNull();
    });

    it('treats_null_day_targets_as_zero_when_other_days_have_values', () => {
      expect(
        rollupPeriodTargetFromDailies([
          {
            day_number: 1,
            target_value: 30,
            actual_value: 0,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: null,
            actual_value: 0,
            on_target: false,
          },
        ]),
      ).toBe(30);
    });

    it('returns_the_single_day_target_when_only_one_day_exists', () => {
      expect(
        rollupPeriodTargetFromDailies([
          {
            day_number: 1,
            target_value: 30,
            actual_value: 0,
            on_target: false,
          },
        ]),
      ).toBe(30);
    });
  });

  describe('rollupPeriodActualFromDailies', () => {
    it('sums_identical_daily_actuals_into_the_period_total', () => {
      expect(
        rollupPeriodActualFromDailies([
          {
            day_number: 1,
            target_value: 0,
            actual_value: 30,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: 0,
            actual_value: 30,
            on_target: false,
          },
        ]),
      ).toBe(60);
    });

    it('sums_different_daily_actuals_into_the_period_total', () => {
      expect(
        rollupPeriodActualFromDailies([
          {
            day_number: 1,
            target_value: 0,
            actual_value: 10,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: 0,
            actual_value: 20,
            on_target: false,
          },
        ]),
      ).toBe(30);
    });

    it('returns_null_when_every_daily_actual_is_null', () => {
      expect(
        rollupPeriodActualFromDailies([
          {
            day_number: 1,
            target_value: 1,
            actual_value: null,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: 2,
            actual_value: null,
            on_target: false,
          },
        ]),
      ).toBeNull();
    });

    it('returns_null_for_an_empty_daily_grid', () => {
      expect(rollupPeriodActualFromDailies([])).toBeNull();
    });

    it('treats_null_day_actuals_as_zero_when_other_days_have_values', () => {
      expect(
        rollupPeriodActualFromDailies([
          {
            day_number: 1,
            target_value: 0,
            actual_value: 30,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: 0,
            actual_value: null,
            on_target: false,
          },
        ]),
      ).toBe(30);
    });

    it('sums_numeric_string_actuals_without_string_concatenation', () => {
      expect(
        rollupPeriodActualFromDailies([
          {
            day_number: 1,
            target_value: 0,
            // API payloads can occasionally serialize numbers as strings.
            actual_value: '30' as unknown as number,
            on_target: false,
          },
          {
            day_number: 2,
            target_value: 0,
            actual_value: '30' as unknown as number,
            on_target: false,
          },
        ]),
      ).toBe(60);
    });
  });

  it('rollUpMetricFromDailyPoints_sets_period_fields_from_the_grid', () => {
    const r = rollUpMetricFromDailyPoints(base);
    expect(r.days_total).toBe(2);
    expect(r.days_on_target).toBe(1);
    expect(r.actual_value).toBe(5);
    expect(r.target_value).toBe(20);
  });

  it('rollUpMetricFromDailyPoints_sums_matching_day_targets_and_actuals_like_the_preview_cards', () => {
    const r = rollUpMetricFromDailyPoints({
      ...base,
      daily_points: [
        { day_number: 1, target_value: 30, actual_value: 30, on_target: true },
        { day_number: 2, target_value: 30, actual_value: 30, on_target: false },
      ],
    });
    expect(r.target_value).toBe(60);
    expect(r.actual_value).toBe(60);
  });

  it('leaves_metric_unchanged_when_no_daily_points', () => {
    const m: ReportRunMetric = { ...base, daily_points: [] };
    const r = rollUpMetricFromDailyPoints(m);
    expect(r).toBe(m);
  });
});

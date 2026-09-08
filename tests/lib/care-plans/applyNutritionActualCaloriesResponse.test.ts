import { describe, expect, it } from 'vitest';

import type {
  CarePlanReportEvidenceDay,
  CarePlanReportWorkspace,
  NutritionActualCaloriesResult,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';
import {
  applyDayRollupToMealsTotalFormMetrics,
  applyMealsTotalKcalToFormMetrics,
  applyNutritionActualCaloriesToFormMetrics,
  applyNutritionActualCaloriesToWorkspace,
  isEditableNutritionKcalEvidenceItem,
  MEALS_TOTAL_KCAL_METRIC_KEY,
  patchEvidenceItemLog,
  resolveCarePlanDayId,
} from '@/lib/care-plans/applyNutritionActualCaloriesResponse';

function metric(
  partial: Partial<ReportRunMetric> & Pick<ReportRunMetric, 'metric_key'>,
): ReportRunMetric {
  return {
    label: partial.metric_key,
    section: 'nutrition',
    unit: 'kcal',
    target_value: null,
    actual_value: null,
    days_on_target: 0,
    days_total: 0,
    display_order: 0,
    daily_points: [],
    ...partial,
  };
}

const evidenceDay: CarePlanReportEvidenceDay = {
  day_index: 1,
  day_number: 1,
  target_date: '2026-11-01',
  photos: null,
  journal: null,
  items: [
    {
      section: 'nutrition',
      morph: 'nutrition',
      item_id: 65,
      title: 'Breakfast',
      guidance: null,
      target: { value: 400, unit: 'kcal', unit_id: 10 },
      log: {
        id: 12,
        actual_value: null,
        unit: null,
        is_completed: false,
        notes: null,
        media: [],
      },
    },
    {
      section: 'activity',
      morph: 'activity',
      item_id: 99,
      title: 'Walk',
      guidance: null,
      target: { value: 30, unit: 'min', unit_id: 1 },
      log: null,
    },
  ],
};

const baseWorkspace: CarePlanReportWorkspace = {
  care_plan: {
    id: 10,
    code: 'CP',
    status: 'active',
    starts_on: '2026-11-01',
    ends_on: '2026-11-07',
  },
  client: {
    id: 1,
    name: 'C',
    client_code: 'C1',
    email: null,
    picture_url: null,
  },
  period: { starts_on: '2026-11-01', ends_on: '2026-11-07' },
  evidence: [evidenceDay],
  suggested_metrics: [],
  operational_log: null,
  client_report: null,
  report_run: null,
};

const successResult: NutritionActualCaloriesResult = {
  log: {
    id: 12,
    actual_value: 450,
    unit: 'kcal',
    is_completed: false,
    notes: null,
    meta: { actual_source: 'admin' },
    media: [],
  },
  day_rollup: {
    day_number: 1,
    target_value: 1000,
    actual_value: 450,
    on_target: false,
  },
  meals_total_kcal: {
    metric_key: MEALS_TOTAL_KCAL_METRIC_KEY,
    label: 'All Nutrition Meals',
    target_value: 1000,
    actual_value: 450,
    days_on_target: 0,
    days_total: 1,
    daily_point: {
      day_number: 1,
      target_value: 1000,
      actual_value: 450,
      on_target: false,
    },
  },
};

describe('isEditableNutritionKcalEvidenceItem', () => {
  it('returns true for nutrition items with kcal target unit', () => {
    expect(
      isEditableNutritionKcalEvidenceItem({
        section: 'nutrition',
        target: { unit: 'kcal' },
      }),
    ).toBe(true);
    expect(
      isEditableNutritionKcalEvidenceItem({
        section: 'nutrition',
        target: { unit: 'Kcal' },
      }),
    ).toBe(true);
  });

  it('returns false for non-nutrition or non-kcal units', () => {
    expect(
      isEditableNutritionKcalEvidenceItem({
        section: 'activity',
        target: { unit: 'kcal' },
      }),
    ).toBe(false);
    expect(
      isEditableNutritionKcalEvidenceItem({
        section: 'nutrition',
        target: { unit: 'g' },
      }),
    ).toBe(false);
    expect(
      isEditableNutritionKcalEvidenceItem({
        section: 'nutrition',
        target: null,
      }),
    ).toBe(false);
  });
});

describe('resolveCarePlanDayId', () => {
  const days = [
    { id: 101, day_number: 1, target_date: '2026-11-01' },
    { id: 102, day_number: 2, target_date: '2026-11-02' },
  ];

  it('prefers target_date match', () => {
    expect(resolveCarePlanDayId(days, '2026-11-02', 1)).toBe(102);
  });

  it('falls back to day_number when date is missing', () => {
    expect(resolveCarePlanDayId(days, '', 1)).toBe(101);
  });

  it('returns null when neither matches', () => {
    expect(resolveCarePlanDayId(days, '2099-01-01', 99)).toBeNull();
  });
});

describe('patchEvidenceItemLog', () => {
  it('updates the matching nutrition item log', () => {
    const next = patchEvidenceItemLog(
      [evidenceDay],
      { targetDate: '2026-11-01', dayIndex: 1, itemId: 65 },
      successResult.log,
    );
    expect(next[0].items[0].log?.actual_value).toBe(450);
    expect(next[0].items[0].log?.unit).toBe('kcal');
  });

  it('returns the original array when day or item is missing', () => {
    const input = [evidenceDay];
    expect(
      patchEvidenceItemLog(
        input,
        { targetDate: '2099-01-01', dayIndex: 99, itemId: 65 },
        successResult.log,
      ),
    ).toBe(input);

    expect(
      patchEvidenceItemLog(
        input,
        { targetDate: '2026-11-01', dayIndex: 1, itemId: 404 },
        successResult.log,
      ),
    ).toBe(input);
  });
});

describe('applyMealsTotalKcalToFormMetrics', () => {
  const metrics: ReportRunMetric[] = [
    metric({
      metric_key: MEALS_TOTAL_KCAL_METRIC_KEY,
      label: 'All Nutrition Meals',
      target_value: 1000,
      actual_value: 0,
      days_on_target: 0,
      days_total: 1,
      daily_points: [
        {
          day_number: 1,
          target_value: 1000,
          actual_value: 0,
          on_target: false,
        },
      ],
    }),
  ];

  it('patches the matching daily point and rolls up actuals', () => {
    const next = applyMealsTotalKcalToFormMetrics(
      metrics,
      successResult.meals_total_kcal,
    );
    expect(next[0].daily_points[0].actual_value).toBe(450);
    expect(next[0].actual_value).toBe(450);
    expect(next).not.toBe(metrics);
  });

  it('leaves metrics unchanged when meals_total_kcal is null', () => {
    expect(applyMealsTotalKcalToFormMetrics(metrics, null)).toBe(metrics);
  });

  it('leaves metrics unchanged when metric or day point is missing', () => {
    expect(
      applyMealsTotalKcalToFormMetrics(
        [metric({ metric_key: 'other', daily_points: [] })],
        successResult.meals_total_kcal,
      ),
    ).toEqual([metric({ metric_key: 'other', daily_points: [] })]);

    const noDay = [
      metric({
        metric_key: MEALS_TOTAL_KCAL_METRIC_KEY,
        daily_points: [
          {
            day_number: 9,
            target_value: 1,
            actual_value: 1,
            on_target: true,
          },
        ],
      }),
    ];
    expect(
      applyMealsTotalKcalToFormMetrics(noDay, successResult.meals_total_kcal),
    ).toBe(noDay);
  });

  it('supports clearing day actual via null daily_point.actual_value', () => {
    const cleared = applyMealsTotalKcalToFormMetrics(metrics, {
      ...successResult.meals_total_kcal!,
      actual_value: 0,
      daily_point: {
        day_number: 1,
        target_value: 1000,
        actual_value: null,
        on_target: false,
      },
    });
    expect(cleared[0].daily_points[0].actual_value).toBeNull();
    // Period actual mirrors the daily grid: all-null days → null ("Not set"), not 0.
    expect(cleared[0].actual_value).toBeNull();
  });
});

describe('applyDayRollupToMealsTotalFormMetrics', () => {
  const twoDayMetrics: ReportRunMetric[] = [
    metric({
      metric_key: MEALS_TOTAL_KCAL_METRIC_KEY,
      label: 'All Nutrition Meals',
      target_value: 2000,
      actual_value: 0,
      days_on_target: 0,
      days_total: 2,
      daily_points: [
        {
          day_number: 1,
          target_value: 1000,
          actual_value: 0,
          on_target: false,
        },
        {
          day_number: 2,
          target_value: 1000,
          actual_value: 0,
          on_target: false,
        },
      ],
    }),
  ];

  it('updates the matching day actual and rolls up period totals', () => {
    const next = applyDayRollupToMealsTotalFormMetrics(
      twoDayMetrics,
      successResult.day_rollup,
    );
    expect(next[0].daily_points[0].actual_value).toBe(450);
    expect(next[0].daily_points[1].actual_value).toBe(0);
    expect(next[0].actual_value).toBe(450);
    expect(next[0].days_on_target).toBe(0);
    expect(next[0].days_total).toBe(2);
  });

  it('uses dayIndexFallback when day_number does not match', () => {
    const next = applyDayRollupToMealsTotalFormMetrics(
      twoDayMetrics,
      {
        day_number: 99,
        target_value: 1000,
        actual_value: 320,
        on_target: false,
      },
      2,
    );
    expect(next[0].daily_points[1].actual_value).toBe(320);
    expect(next[0].actual_value).toBe(320);
  });

  it('leaves metrics unchanged when the meals metric is missing', () => {
    const other = [metric({ metric_key: 'steps', daily_points: [] })];
    expect(
      applyDayRollupToMealsTotalFormMetrics(other, successResult.day_rollup),
    ).toBe(other);
  });
});

describe('applyNutritionActualCaloriesToFormMetrics', () => {
  const metrics: ReportRunMetric[] = [
    metric({
      metric_key: MEALS_TOTAL_KCAL_METRIC_KEY,
      label: 'All Nutrition Meals',
      target_value: 1000,
      actual_value: 0,
      days_on_target: 0,
      days_total: 1,
      daily_points: [
        {
          day_number: 1,
          target_value: 1000,
          actual_value: 0,
          on_target: false,
        },
      ],
    }),
  ];

  it('prefers meals_total_kcal when present', () => {
    const next = applyNutritionActualCaloriesToFormMetrics(
      metrics,
      successResult,
    );
    expect(next[0].daily_points[0].actual_value).toBe(450);
  });

  it('falls back to day_rollup when meals_total_kcal is null (draft)', () => {
    const next = applyNutritionActualCaloriesToFormMetrics(metrics, {
      ...successResult,
      meals_total_kcal: null,
    });
    expect(next[0].daily_points[0].actual_value).toBe(450);
    expect(next[0].actual_value).toBe(450);
  });
});

describe('applyNutritionActualCaloriesToWorkspace', () => {
  it('patches evidence log from the API result', () => {
    const next = applyNutritionActualCaloriesToWorkspace(
      baseWorkspace,
      { targetDate: '2026-11-01', dayIndex: 1, itemId: 65 },
      successResult,
    );
    expect(next.evidence[0].items[0].log?.actual_value).toBe(450);
    expect(next).not.toBe(baseWorkspace);
  });

  it('still patches evidence when meals_total_kcal is null', () => {
    const next = applyNutritionActualCaloriesToWorkspace(
      baseWorkspace,
      { targetDate: '2026-11-01', dayIndex: 1, itemId: 65 },
      { ...successResult, meals_total_kcal: null },
    );
    expect(next.evidence[0].items[0].log?.actual_value).toBe(450);
  });
});

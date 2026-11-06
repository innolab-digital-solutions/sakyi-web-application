import { describe, expect, it } from 'vitest';

import {
  buildAverageInputsAndManualHighlights,
  buildPublishedReportHighlights,
  hasClientVisibleHighlight,
} from '@/lib/care-plans/clientReportNarrativePayload';

describe('buildAverageInputsAndManualHighlights', () => {
  it('builds average inputs and visible highlights from valid dialog values', () => {
    const result = buildAverageInputsAndManualHighlights({
      avgIntake: '1750',
      avgBurn: '400',
      avgSteps: '8000',
      avgTrainingTime: '45',
    });

    expect(result.averageInputs).toEqual({
      avg_intake: 1750,
      avg_burn: 400,
      avg_steps: 8000,
      avg_training_time: 45,
    });
    expect(result.manualHighlights).toHaveLength(4);
    expect(result.manualHighlights.every((h) => h.is_visible_to_client)).toBe(
      true,
    );
  });

  it('skips empty, negative, and non-numeric values', () => {
    const result = buildAverageInputsAndManualHighlights({
      avgIntake: '',
      avgBurn: '-1',
      avgSteps: 'abc',
      avgTrainingTime: '30',
    });

    expect(result.averageInputs).toEqual({ avg_training_time: 30 });
    expect(result.manualHighlights).toEqual([
      {
        metric_key: 'avg_training_time',
        label: 'Average training time',
        value: 30,
        unit: 'minute',
        is_visible_to_client: true,
      },
    ]);
  });
});

describe('buildPublishedReportHighlights', () => {
  const existing = [
    {
      metric_key: 'meals_total_kcal',
      label: 'All Nutrition Meals',
      value: 1900,
      unit: 'Kilocalorie',
      source: 'log',
      is_visible_to_client: true,
      display_order: 0,
    },
    {
      metric_key: 'avg_intake',
      label: 'Average intake',
      value: 1600,
      unit: 'Kilocalorie',
      source: 'manual',
      is_visible_to_client: true,
      display_order: 1,
    },
    {
      metric_key: 'steps_total',
      label: 'Steps',
      value: 9000,
      unit: 'steps',
      source: 'log',
      is_visible_to_client: false,
      display_order: 2,
    },
  ];

  const worksheetMetrics = [
    {
      metric_key: 'meals_total_kcal',
      label: 'All Nutrition Meals',
      actual_value: 1900,
      target_value: 2100,
      unit: 'kcal',
      unit_name: 'Kilocalorie',
    },
    {
      metric_key: 'hydration_liters',
      label: 'Hydration',
      actual_value: 2.4,
      target_value: 3,
      unit: 'L',
      unit_name: 'Liter',
    },
    {
      metric_key: 'steps_total',
      label: 'Steps',
      actual_value: 9000,
      target_value: 10000,
      unit: 'steps',
    },
  ];

  it('keeps included operational highlights and replaces average cards', () => {
    const next = buildPublishedReportHighlights({
      existingHighlights: existing,
      includedMetricKeys: ['meals_total_kcal'],
      worksheetMetrics,
      manualHighlights: [
        {
          metric_key: 'avg_intake',
          label: 'Average intake',
          value: 1750,
          unit: 'Kilocalorie',
          is_visible_to_client: true,
        },
      ],
    });

    expect(next.map((h) => h.metric_key)).toEqual([
      'meals_total_kcal',
      'avg_intake',
    ]);
    expect(next[1]?.value).toBe(1750);
    expect(hasClientVisibleHighlight(next)).toBe(true);
  });

  it('maps newly selected step-2 metrics from the worksheet when they are not already highlights', () => {
    const next = buildPublishedReportHighlights({
      existingHighlights: [],
      includedMetricKeys: ['hydration_liters', 'meals_total_kcal'],
      worksheetMetrics,
      manualHighlights: [
        {
          metric_key: 'avg_steps',
          label: 'Average steps',
          value: 8000,
          unit: 'steps',
          is_visible_to_client: true,
        },
      ],
    });

    expect(next.map((h) => h.metric_key)).toEqual([
      'hydration_liters',
      'meals_total_kcal',
      'avg_steps',
    ]);
    expect(next[0]).toMatchObject({
      label: 'Hydration',
      value: 2.4,
      unit: 'Liter',
      is_visible_to_client: true,
    });
  });

  it('drops operational highlights that were unchecked', () => {
    const next = buildPublishedReportHighlights({
      existingHighlights: existing,
      includedMetricKeys: [],
      worksheetMetrics,
      manualHighlights: [],
    });
    expect(next).toEqual([]);
    expect(hasClientVisibleHighlight(next)).toBe(false);
  });
});

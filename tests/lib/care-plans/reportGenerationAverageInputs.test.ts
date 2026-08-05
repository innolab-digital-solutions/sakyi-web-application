import { describe, expect, it } from 'vitest';

import {
  formatAverageInputDisplay,
  readAverageInputValue,
  resolveReportAverageInputForDialog,
} from '@/lib/care-plans/reportGenerationAverageInputs';

describe('readAverageInputValue', () => {
  it('reads a bare finite number', () => {
    expect(readAverageInputValue(1800)).toBe(1800);
  });

  it('reads nested { value } shapes from generation defaults', () => {
    expect(readAverageInputValue({ value: 1200, unit: 'kcal' })).toBe(1200);
  });

  it('returns null for missing or invalid values', () => {
    expect(readAverageInputValue(null)).toBeNull();
    expect(readAverageInputValue(undefined)).toBeNull();
    expect(readAverageInputValue({ value: null })).toBeNull();
    expect(readAverageInputValue(Number.NaN)).toBeNull();
    expect(readAverageInputValue('1800')).toBeNull();
  });
});

describe('formatAverageInputDisplay', () => {
  it('stringifies finite numbers and falls back to 0', () => {
    expect(formatAverageInputDisplay(42)).toBe('42');
    expect(formatAverageInputDisplay(null)).toBe('0');
    expect(formatAverageInputDisplay(undefined)).toBe('0');
  });
});

describe('resolveReportAverageInputForDialog', () => {
  it('prefers a visible highlight over generation defaults', () => {
    expect(
      resolveReportAverageInputForDialog({
        metricKey: 'avg_intake',
        highlights: [
          {
            metric_key: 'avg_intake',
            value: 999,
            is_visible_to_client: true,
          },
        ],
        existingAverageInputs: null,
        generationDefault: { value: 1500 },
        currentValue: '1',
      }),
    ).toBe('999');
  });

  it('uses workspace generation defaults before stale local draft values', () => {
    expect(
      resolveReportAverageInputForDialog({
        metricKey: 'avg_burn',
        highlights: [],
        existingAverageInputs: null,
        generationDefault: { value: 2100, unit: 'kcal' },
        currentValue: '0',
      }),
    ).toBe('2100');
  });

  it('uses existing report average_inputs when present', () => {
    expect(
      resolveReportAverageInputForDialog({
        metricKey: 'avg_steps',
        highlights: [],
        existingAverageInputs: { avg_steps: 8000 },
        generationDefault: { value: 1000 },
        currentValue: '',
      }),
    ).toBe('8000');
  });

  it('falls back to local draft only when no server value exists', () => {
    expect(
      resolveReportAverageInputForDialog({
        metricKey: 'avg_training_time',
        highlights: [],
        existingAverageInputs: null,
        generationDefault: null,
        currentValue: '45',
      }),
    ).toBe('45');
  });

  it('returns 0 when nothing is available', () => {
    expect(
      resolveReportAverageInputForDialog({
        metricKey: 'avg_intake',
        highlights: [],
        existingAverageInputs: null,
        generationDefault: { value: null },
        currentValue: '',
      }),
    ).toBe('0');
  });
});

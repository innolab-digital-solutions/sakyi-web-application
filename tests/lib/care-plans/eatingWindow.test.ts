import { describe, expect, it } from 'vitest';

import type { CarePlanLogEvidence } from '@/domains/care-plans/types/care-plan-report';
import {
  eatingWindowForSavePayload,
  formatClockTimeLabel,
  formatLoggedEatenAtLabel,
  formatPlannedEatingWindowLabel,
  isNutritionEvidenceItem,
  isValidEatingWindowInput,
  normalizeEatingWindowHHmm,
  resolveEatenAtFromLog,
} from '@/lib/care-plans/eatingWindow';

function log(
  partial: Partial<CarePlanLogEvidence> & Pick<CarePlanLogEvidence, 'id'>,
): CarePlanLogEvidence {
  return {
    actual_value: null,
    unit: null,
    notes: null,
    ...partial,
  };
}

describe('eatingWindow', () => {
  describe('normalizeEatingWindowHHmm', () => {
    it('normalizes_valid_hh_mm_values', () => {
      expect(normalizeEatingWindowHHmm('11:00')).toBe('11:00');
      expect(normalizeEatingWindowHHmm(' 13:20 ')).toBe('13:20');
      expect(normalizeEatingWindowHHmm('00:00')).toBe('00:00');
      expect(normalizeEatingWindowHHmm('23:59')).toBe('23:59');
    });

    it('strips_seconds_from_hh_mm_ss', () => {
      expect(normalizeEatingWindowHHmm('11:00:00')).toBe('11:00');
      expect(normalizeEatingWindowHHmm('13:20:45')).toBe('13:20');
    });

    it('returns_empty_string_for_missing_or_invalid_values', () => {
      expect(normalizeEatingWindowHHmm(null)).toBe('');
      expect(normalizeEatingWindowHHmm(undefined)).toBe('');
      expect(normalizeEatingWindowHHmm('')).toBe('');
      expect(normalizeEatingWindowHHmm('11 AM')).toBe('');
      expect(normalizeEatingWindowHHmm('25:00')).toBe('');
      expect(normalizeEatingWindowHHmm('11:60')).toBe('');
    });
  });

  describe('isValidEatingWindowInput', () => {
    it('allows_empty_or_valid_hh_mm', () => {
      expect(isValidEatingWindowInput(null)).toBe(true);
      expect(isValidEatingWindowInput('')).toBe(true);
      expect(isValidEatingWindowInput('11:00')).toBe(true);
    });

    it('rejects_invalid_clock_strings', () => {
      expect(isValidEatingWindowInput('11 AM')).toBe(false);
      expect(isValidEatingWindowInput('99:99')).toBe(false);
    });
  });

  describe('eatingWindowForSavePayload', () => {
    it('sends_hh_mm_or_null_to_clear', () => {
      expect(eatingWindowForSavePayload('11:00')).toBe('11:00');
      expect(eatingWindowForSavePayload('')).toBeNull();
      expect(eatingWindowForSavePayload(null)).toBeNull();
      expect(eatingWindowForSavePayload('bad')).toBeNull();
    });
  });

  describe('formatClockTimeLabel', () => {
    it('formats_24h_time_for_admin_display', () => {
      expect(formatClockTimeLabel('11:00')).toBe('11:00 AM');
      expect(formatClockTimeLabel('13:00')).toBe('1:00 PM');
      expect(formatClockTimeLabel('13:20')).toBe('1:20 PM');
    });

    it('returns_null_when_time_is_missing', () => {
      expect(formatClockTimeLabel(null)).toBeNull();
      expect(formatClockTimeLabel('')).toBeNull();
    });
  });

  describe('display labels', () => {
    it('builds_planned_and_logged_copy', () => {
      expect(formatPlannedEatingWindowLabel('13:00')).toBe('Eat at 1:00 PM');
      expect(formatLoggedEatenAtLabel('13:20')).toBe('Logged at 1:20 PM');
      expect(formatPlannedEatingWindowLabel(null)).toBeNull();
    });
  });

  describe('resolveEatenAtFromLog', () => {
    it('prefers_first_class_eaten_at_over_meta', () => {
      expect(
        resolveEatenAtFromLog(
          log({
            id: 1,
            eaten_at: '13:20',
            meta: { eaten_at: '11:00' },
          }),
        ),
      ).toBe('13:20');
    });

    it('falls_back_to_meta_when_top_level_is_absent', () => {
      expect(
        resolveEatenAtFromLog(
          log({
            id: 2,
            meta: { eaten_at: '08:15' },
          }),
        ),
      ).toBe('08:15');
    });

    it('returns_null_when_not_logged', () => {
      expect(resolveEatenAtFromLog(null)).toBeNull();
      expect(resolveEatenAtFromLog(log({ id: 3 }))).toBeNull();
    });
  });

  describe('isNutritionEvidenceItem', () => {
    it('matches_nutrition_section_or_morph', () => {
      expect(
        isNutritionEvidenceItem({ section: 'nutrition', morph: 'x' }),
      ).toBe(true);
      expect(
        isNutritionEvidenceItem({ section: 'sleep', morph: 'nutrition' }),
      ).toBe(true);
      expect(
        isNutritionEvidenceItem({ section: 'sleep', morph: 'sleep' }),
      ).toBe(false);
    });
  });
});

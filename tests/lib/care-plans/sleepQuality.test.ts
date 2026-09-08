import { describe, expect, it } from 'vitest';

import type { CarePlanLogEvidence } from '@/domains/care-plans/types/care-plan-report';
import {
  getSleepQualityDisplay,
  isSleepEvidenceItem,
  isSleepQuality,
  resolveSleepQualityFromLog,
} from '@/lib/care-plans/sleepQuality';

function log(
  partial: Partial<CarePlanLogEvidence> & Pick<CarePlanLogEvidence, 'id'>,
): CarePlanLogEvidence {
  return {
    actual_value: null,
    unit: 'h',
    notes: null,
    ...partial,
  };
}

describe('sleepQuality', () => {
  describe('isSleepQuality', () => {
    it('accepts_known_enum_values', () => {
      expect(isSleepQuality('very_good')).toBe(true);
      expect(isSleepQuality('good')).toBe(true);
      expect(isSleepQuality('poor')).toBe(true);
      expect(isSleepQuality('very_poor')).toBe(true);
    });

    it('rejects_unknown_or_empty_values', () => {
      expect(isSleepQuality(null)).toBe(false);
      expect(isSleepQuality(undefined)).toBe(false);
      expect(isSleepQuality('')).toBe(false);
      expect(isSleepQuality('ok')).toBe(false);
      expect(isSleepQuality(1)).toBe(false);
    });
  });

  describe('resolveSleepQualityFromLog', () => {
    it('returns_null_when_log_is_missing', () => {
      expect(resolveSleepQualityFromLog(null)).toBeNull();
      expect(resolveSleepQualityFromLog(undefined)).toBeNull();
    });

    it('prefers_log_sleep_quality_over_meta', () => {
      expect(
        resolveSleepQualityFromLog(
          log({
            id: 1,
            sleep_quality: 'good',
            meta: { sleep_quality: 'poor' },
          }),
        ),
      ).toBe('good');
    });

    it('falls_back_to_meta_when_top_level_quality_is_absent', () => {
      expect(
        resolveSleepQualityFromLog(
          log({
            id: 2,
            meta: { sleep_quality: 'very_poor' },
          }),
        ),
      ).toBe('very_poor');
    });

    it('returns_null_for_unrecognized_quality_without_inventing_a_default', () => {
      expect(
        resolveSleepQualityFromLog(
          log({
            id: 3,
            sleep_quality: 'awesome' as CarePlanLogEvidence['sleep_quality'],
            meta: { sleep_quality: 'also_bad' },
          }),
        ),
      ).toBeNull();
    });
  });

  describe('isSleepEvidenceItem', () => {
    it('matches_sleep_section_or_morph', () => {
      expect(isSleepEvidenceItem({ section: 'sleep', morph: 'x' })).toBe(true);
      expect(isSleepEvidenceItem({ section: 'recovery', morph: 'sleep' })).toBe(
        true,
      );
      expect(
        isSleepEvidenceItem({ section: 'recovery', morph: 'recovery' }),
      ).toBe(false);
    });
  });

  describe('getSleepQualityDisplay', () => {
    it('returns_admin_english_short_label_and_description', () => {
      const display = getSleepQualityDisplay('good');
      expect(display.shortLabel).toBe('Good');
      expect(display.description).toContain('mostly rested');
    });
  });
});

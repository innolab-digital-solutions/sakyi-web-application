import { describe, expect, it } from 'vitest';

import {
  CARE_PLAN_SECTION_TABS,
  getCarePlanSectionTab,
} from '@/lib/care-plans/carePlanSectionTabs';

describe('carePlanSectionTabs', () => {
  describe('happy path', () => {
    it('includes walking with a Walking label after recovery', () => {
      const keys = CARE_PLAN_SECTION_TABS.map((tab) => tab.key);
      expect(keys).toContain('walking');
      expect(keys.indexOf('walking')).toBeGreaterThan(keys.indexOf('recovery'));

      const walking = getCarePlanSectionTab('walking');
      expect(walking?.label).toBe('Walking');
      expect(walking?.key).toBe('walking');
    });

    it('places Motiphysio immediately after Exercise with its own label', () => {
      const keys = CARE_PLAN_SECTION_TABS.map((tab) => tab.key);
      expect(keys.indexOf('motiphysio')).toBe(keys.indexOf('movement') + 1);

      const motiphysio = getCarePlanSectionTab('motiphysio');
      expect(motiphysio?.label).toBe('Motiphysio');
      expect(motiphysio?.key).toBe('motiphysio');
    });
  });

  describe('failure / unknown keys', () => {
    it('returns undefined for an unknown section key', () => {
      expect(getCarePlanSectionTab('unknown_section')).toBeUndefined();
      expect(getCarePlanSectionTab('')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('exposes every CarePlanSectionKey exactly once', () => {
      const keys = CARE_PLAN_SECTION_TABS.map((tab) => tab.key);
      expect(new Set(keys).size).toBe(keys.length);
      expect(keys).toEqual([
        'nutrition',
        'movement',
        'motiphysio',
        'activity',
        'hydration',
        'sleep',
        'recovery',
        'walking',
      ]);
    });
  });
});

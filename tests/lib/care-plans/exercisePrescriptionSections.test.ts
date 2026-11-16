import { describe, expect, it } from 'vitest';

import { isExercisePrescriptionSection } from '@/lib/care-plans/exercisePrescriptionSections';

describe('isExercisePrescriptionSection', () => {
  describe('happy path', () => {
    it('returns true for movement and motiphysio', () => {
      expect(isExercisePrescriptionSection('movement')).toBe(true);
      expect(isExercisePrescriptionSection('motiphysio')).toBe(true);
    });
  });

  describe('failure / non-prescription sections', () => {
    it('returns false for measured-target and nutrition sections', () => {
      expect(isExercisePrescriptionSection('nutrition')).toBe(false);
      expect(isExercisePrescriptionSection('activity')).toBe(false);
      expect(isExercisePrescriptionSection('hydration')).toBe(false);
      expect(isExercisePrescriptionSection('sleep')).toBe(false);
      expect(isExercisePrescriptionSection('recovery')).toBe(false);
      expect(isExercisePrescriptionSection('walking')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns false for null, undefined, empty, and unknown keys', () => {
      expect(isExercisePrescriptionSection(null)).toBe(false);
      expect(isExercisePrescriptionSection(undefined)).toBe(false);
      expect(isExercisePrescriptionSection('')).toBe(false);
      expect(isExercisePrescriptionSection('moti_physio')).toBe(false);
    });
  });
});

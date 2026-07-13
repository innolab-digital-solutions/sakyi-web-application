import { describe, expect, it } from 'vitest';

import { formatSecondsReadable } from '@/lib/care-plans/movementPrescription';

describe('formatSecondsReadable', () => {
  describe('happy path', () => {
    it('shows seconds only when under a minute', () => {
      expect(formatSecondsReadable(45)).toBe('45 sec');
    });

    it('shows whole minutes without a seconds part', () => {
      expect(formatSecondsReadable(60)).toBe('1 min');
      expect(formatSecondsReadable(120)).toBe('2 min');
    });

    it('combines minutes and seconds', () => {
      expect(formatSecondsReadable(90)).toBe('1 min 30 sec');
    });

    it('shows hours for large values', () => {
      expect(formatSecondsReadable(3600)).toBe('1 hr');
      expect(formatSecondsReadable(3661)).toBe('1 hr 1 min 1 sec');
      expect(formatSecondsReadable(7200)).toBe('2 hr');
    });

    it('accepts numeric strings the way inputs provide them', () => {
      expect(formatSecondsReadable('90')).toBe('1 min 30 sec');
      expect(formatSecondsReadable('  90  ')).toBe('1 min 30 sec');
    });
  });

  describe('boundary conditions', () => {
    it('returns null for zero', () => {
      expect(formatSecondsReadable(0)).toBeNull();
      expect(formatSecondsReadable('0')).toBeNull();
    });

    it('floors fractional seconds instead of rounding up', () => {
      expect(formatSecondsReadable(90.7)).toBe('1 min 30 sec');
      expect(formatSecondsReadable(59.9)).toBe('59 sec');
    });

    it('drops zero-valued parts', () => {
      expect(formatSecondsReadable(3660)).toBe('1 hr 1 min');
      expect(formatSecondsReadable(3601)).toBe('1 hr 1 sec');
    });
  });

  describe('invalid / empty input', () => {
    it('returns null for negative values', () => {
      expect(formatSecondsReadable(-5)).toBeNull();
      expect(formatSecondsReadable('-30')).toBeNull();
    });

    it('returns null for empty or whitespace strings', () => {
      expect(formatSecondsReadable('')).toBeNull();
      expect(formatSecondsReadable('   ')).toBeNull();
    });

    it('returns null for non-numeric strings', () => {
      expect(formatSecondsReadable('abc')).toBeNull();
    });

    it('returns null for nullish values', () => {
      expect(formatSecondsReadable(null)).toBeNull();
      expect(formatSecondsReadable(undefined)).toBeNull();
    });

    it('returns null for non-finite numbers', () => {
      expect(formatSecondsReadable(Number.NaN)).toBeNull();
      expect(formatSecondsReadable(Number.POSITIVE_INFINITY)).toBeNull();
    });
  });
});

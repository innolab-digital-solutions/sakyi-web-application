import { describe, expect, it } from 'vitest';

import type { CarePlanMovementExercisePrescription } from '@/domains/movement-prescriptions/types';
import {
  alignExercisesToRequestedOrder,
  buildMovementExerciseSavePayload,
} from '@/lib/care-plans/movementPrescription';

describe('buildMovementExerciseSavePayload', () => {
  describe('happy path', () => {
    it('includes the exercise link id when present so updates keep array order', () => {
      const payload = buildMovementExerciseSavePayload(
        {
          id: 501,
          movement_exercise_id: '101',
          sets: '3',
          reps: '10',
          rest_seconds: '60',
          duration_seconds: '',
          intensity: '',
          equipment_weight: '',
          equipment_weight_unit_id: '',
        },
        'sets_reps',
      );

      expect(payload.id).toBe(501);
      expect(payload.movement_exercise_id).toBe(101);
      expect(payload.sets).toBe(3);
      expect(payload.reps).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('omits id when the exercise row is new', () => {
      const payload = buildMovementExerciseSavePayload(
        {
          movement_exercise_id: '101',
          sets: '3',
          reps: '10',
          rest_seconds: '',
          duration_seconds: '',
          intensity: '',
          equipment_weight: '',
          equipment_weight_unit_id: '',
        },
        'sets_reps',
      );

      expect(payload).not.toHaveProperty('id');
      expect(payload.movement_exercise_id).toBe(101);
    });
  });
});

describe('alignExercisesToRequestedOrder', () => {
  describe('happy path', () => {
    it('reorders response rows to match the submitted exercises array', () => {
      const requested: CarePlanMovementExercisePrescription[] = [
        { movement_exercise_id: 101, sets: 3 },
        { movement_exercise_id: 102, sets: 3 },
        { movement_exercise_id: 103, sets: 3 },
      ];
      const response: CarePlanMovementExercisePrescription[] = [
        { id: 503, movement_exercise_id: 103, sets: 3 },
        { id: 501, movement_exercise_id: 101, sets: 3 },
        { id: 502, movement_exercise_id: 102, sets: 3 },
      ];

      const aligned = alignExercisesToRequestedOrder(response, requested);

      expect(aligned.map((row) => row.movement_exercise_id)).toEqual([
        101, 102, 103,
      ]);
      expect(aligned.map((row) => row.id)).toEqual([501, 502, 503]);
    });

    it('prefers matching by link-row id when reordering existing exercises', () => {
      const requested: CarePlanMovementExercisePrescription[] = [
        { id: 503, movement_exercise_id: 103 },
        { id: 501, movement_exercise_id: 101 },
        { id: 502, movement_exercise_id: 102 },
      ];
      const response: CarePlanMovementExercisePrescription[] = [
        { id: 501, movement_exercise_id: 101 },
        { id: 502, movement_exercise_id: 102 },
        { id: 503, movement_exercise_id: 103 },
      ];

      const aligned = alignExercisesToRequestedOrder(response, requested);

      expect(aligned.map((row) => row.id)).toEqual([503, 501, 502]);
    });
  });

  describe('failure / empty inputs', () => {
    it('returns an empty array when the response has no exercises', () => {
      expect(
        alignExercisesToRequestedOrder([], [{ movement_exercise_id: 1 }]),
      ).toEqual([]);
      expect(
        alignExercisesToRequestedOrder(null, [{ movement_exercise_id: 1 }]),
      ).toEqual([]);
    });

    it('returns the response unchanged when nothing was requested', () => {
      const response: CarePlanMovementExercisePrescription[] = [
        { id: 1, movement_exercise_id: 10 },
      ];
      expect(alignExercisesToRequestedOrder(response, [])).toEqual(response);
      expect(alignExercisesToRequestedOrder(response, null)).toEqual(response);
    });
  });

  describe('edge cases', () => {
    it('appends unmatched response rows after the requested order', () => {
      const aligned = alignExercisesToRequestedOrder(
        [
          { id: 1, movement_exercise_id: 10 },
          { id: 2, movement_exercise_id: 20 },
          { id: 3, movement_exercise_id: 30 },
        ],
        [{ movement_exercise_id: 20 }],
      );

      expect(aligned.map((row) => row.movement_exercise_id)).toEqual([
        20, 10, 30,
      ]);
    });
  });
});

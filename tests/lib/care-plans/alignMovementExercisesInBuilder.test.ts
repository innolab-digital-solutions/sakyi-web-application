import { describe, expect, it } from 'vitest';

import type { AdminCarePlanBuilder } from '@/domains/care-plans/types/admin';
import { alignMovementExercisesInBuilder } from '@/lib/care-plans/alignMovementExercisesInBuilder';

function buildBuilder(
  movementExercises: Array<{
    id: number;
    movement_exercise_id: number;
  }>,
): AdminCarePlanBuilder {
  return {
    id: 1,
    code: null,
    enrollment_id: null,
    cycle_number: null,
    status: 'draft',
    starts_on: null,
    ends_on: null,
    days: [
      {
        id: 12,
        day_number: 1,
        target_date: '2026-05-01',
        general_notes: null,
        daily_motivation: null,
        sections: {
          nutrition: [],
          movement: [
            {
              id: 99,
              title: 'Strength block',
              exercises: movementExercises,
            },
          ],
          activity: [],
          hydration: [],
          sleep: [],
          recovery: [],
          walking: [],
        },
      },
    ],
  } as AdminCarePlanBuilder;
}

describe('alignMovementExercisesInBuilder', () => {
  describe('happy path', () => {
    it('rewrites movement exercises on the saved day to the submitted order', () => {
      const builder = buildBuilder([
        { id: 503, movement_exercise_id: 103 },
        { id: 501, movement_exercise_id: 101 },
        { id: 502, movement_exercise_id: 102 },
      ]);

      const aligned = alignMovementExercisesInBuilder(builder, 12, [
        {
          id: 99,
          title: 'Strength block',
          exercises: [
            { movement_exercise_id: 101 },
            { movement_exercise_id: 102 },
            { movement_exercise_id: 103 },
          ],
        },
      ]);

      expect(
        aligned.days[0]?.sections.movement[0]?.exercises?.map(
          (row) => row.movement_exercise_id,
        ),
      ).toEqual([101, 102, 103]);
    });
  });

  describe('failure paths', () => {
    it('leaves the builder unchanged when the day id is not found', () => {
      const builder = buildBuilder([{ id: 1, movement_exercise_id: 10 }]);
      const aligned = alignMovementExercisesInBuilder(builder, 999, [
        { exercises: [{ movement_exercise_id: 10 }] },
      ]);
      expect(aligned).toBe(builder);
    });
  });

  describe('edge cases', () => {
    it('does not mutate other days or non-movement sections', () => {
      const builder = buildBuilder([
        { id: 2, movement_exercise_id: 20 },
        { id: 1, movement_exercise_id: 10 },
      ]);
      builder.days.push({
        id: 13,
        day_number: 2,
        target_date: '2026-05-02',
        general_notes: null,
        daily_motivation: null,
        sections: {
          nutrition: [],
          movement: [
            {
              id: 100,
              title: 'Other day',
              exercises: [{ id: 9, movement_exercise_id: 90 }],
            },
          ],
          activity: [],
          hydration: [],
          sleep: [],
          recovery: [],
          walking: [],
        },
      });

      const aligned = alignMovementExercisesInBuilder(builder, 12, [
        {
          id: 99,
          exercises: [
            { movement_exercise_id: 10 },
            { movement_exercise_id: 20 },
          ],
        },
      ]);

      expect(
        aligned.days[0]?.sections.movement[0]?.exercises?.map(
          (row) => row.movement_exercise_id,
        ),
      ).toEqual([10, 20]);
      expect(
        aligned.days[1]?.sections.movement[0]?.exercises?.map(
          (row) => row.movement_exercise_id,
        ),
      ).toEqual([90]);
      expect(aligned.days[0]?.sections.walking).toEqual([]);
    });
  });
});

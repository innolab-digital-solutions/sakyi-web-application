import { describe, expect, it } from 'vitest';

import {
  isMovementPrescriptionMeaningful,
  resetPrescriptionOnExerciseChange,
} from '@/lib/care-plans/movementPrescription';

describe('isMovementPrescriptionMeaningful', () => {
  it('returns_false_for_empty_exercise_row_with_only_default_mass_unit', () => {
    const placeholder = resetPrescriptionOnExerciseChange('', '12');
    expect(placeholder.equipment_weight_unit_id).toBe('12');
    expect(isMovementPrescriptionMeaningful(placeholder)).toBe(false);
  });

  it('returns_true_when_an_exercise_is_selected', () => {
    expect(
      isMovementPrescriptionMeaningful(
        resetPrescriptionOnExerciseChange('55', '12'),
      ),
    ).toBe(true);
  });

  it('returns_true_when_prescription_fields_are_started_without_exercise_id', () => {
    expect(
      isMovementPrescriptionMeaningful({
        ...resetPrescriptionOnExerciseChange('', '12'),
        sets: '3',
      }),
    ).toBe(true);
  });

  it('returns_false_for_fully_empty_prescription', () => {
    expect(
      isMovementPrescriptionMeaningful(
        resetPrescriptionOnExerciseChange('', null),
      ),
    ).toBe(false);
  });
});

import type {
  CarePlanMovementExercisePrescription,
  PrescriptionFieldHints,
  PrescriptionFieldKey,
  PrescriptionFieldLabels,
  PrescriptionFieldPlaceholders,
  PrescriptionProfile,
} from '@/domains/movement-prescriptions/types';

export type MovementExercisePrescriptionInput = {
  id?: string | number;
  movement_exercise_id: string;
  sets: string;
  reps: string;
  rest_seconds: string;
  duration_seconds: string;
  intensity: string;
  equipment_weight: string;
  equipment_weight_unit_id: string;
  summary?: string | null;
  duration_preview?: string | null;
  rest_preview?: string | null;
};

export type MovementExercisePrescriptionSource = {
  id?: string | number | null;
  movement_exercise_id?: string | number | null;
  sets?: string | number | null;
  reps?: string | number | null;
  rest_seconds?: string | number | null;
  duration_seconds?: string | number | null;
  intensity?: string | null;
  equipment_weight?: string | number | null;
  equipment_weight_unit_id?: string | number | null;
  equipment_weight_unit?: { id?: string | number | null } | null;
  summary?: string | null;
  duration_preview?: string | null;
  rest_preview?: string | null;
};

const FALLBACK_FIELD_PLACEHOLDERS: Partial<
  Record<PrescriptionFieldKey, string>
> = {
  sets: 'e.g. 3',
  reps: 'e.g. 12',
  rest_seconds: 'e.g. 60',
  duration_seconds: 'e.g. 1800',
  equipment_weight: 'e.g. 60',
};

const DEFAULT_FIELD_LABELS: Record<
  PrescriptionProfile,
  PrescriptionFieldLabels
> = {
  sets_reps: {
    sets: 'Sets',
    reps: 'Reps',
    rest_seconds: 'Rest (seconds)',
  },
  sets_reps_load: {
    sets: 'Sets',
    reps: 'Reps',
    rest_seconds: 'Rest (seconds)',
    equipment_weight: 'Weight',
    equipment_weight_unit_id: 'Weight unit',
  },
  sets_duration: {
    sets: 'Sets',
    duration_seconds: 'Hold / work (seconds)',
    rest_seconds: 'Rest (seconds)',
  },
  cardio_steady: {
    duration_seconds: 'Duration (seconds)',
    intensity: 'Intensity',
  },
  cardio_interval: {
    sets: 'Rounds',
    duration_seconds: 'Work interval (seconds)',
    rest_seconds: 'Rest (seconds)',
    intensity: 'Intensity',
  },
};

const FIELD_VISIBILITY: Record<
  PrescriptionProfile,
  Record<PrescriptionFieldKey, boolean>
> = {
  sets_reps: {
    sets: true,
    reps: true,
    rest_seconds: true,
    duration_seconds: false,
    intensity: false,
    equipment_weight: false,
    equipment_weight_unit_id: false,
  },
  sets_reps_load: {
    sets: true,
    reps: true,
    rest_seconds: true,
    duration_seconds: false,
    intensity: false,
    equipment_weight: true,
    equipment_weight_unit_id: true,
  },
  sets_duration: {
    sets: true,
    reps: false,
    rest_seconds: true,
    duration_seconds: true,
    intensity: false,
    equipment_weight: false,
    equipment_weight_unit_id: false,
  },
  cardio_steady: {
    sets: false,
    reps: false,
    rest_seconds: false,
    duration_seconds: true,
    intensity: true,
    equipment_weight: false,
    equipment_weight_unit_id: false,
  },
  cardio_interval: {
    sets: true,
    reps: false,
    rest_seconds: true,
    duration_seconds: true,
    intensity: true,
    equipment_weight: false,
    equipment_weight_unit_id: false,
  },
};

export function isPrescriptionProfile(
  value: string | null | undefined,
): value is PrescriptionProfile {
  return (
    value === 'sets_reps' ||
    value === 'sets_reps_load' ||
    value === 'sets_duration' ||
    value === 'cardio_steady' ||
    value === 'cardio_interval'
  );
}

export function normalizePrescriptionValue(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

export function createEmptyMovementExercisePrescription(): MovementExercisePrescriptionInput {
  return {
    movement_exercise_id: '',
    sets: '',
    reps: '',
    rest_seconds: '',
    duration_seconds: '',
    intensity: '',
    equipment_weight: '',
    equipment_weight_unit_id: '',
  };
}

export function resetPrescriptionOnExerciseChange(
  movementExerciseId: string,
  defaultMassUnitId?: string | null,
): MovementExercisePrescriptionInput {
  return {
    ...createEmptyMovementExercisePrescription(),
    movement_exercise_id: movementExerciseId,
    equipment_weight_unit_id: defaultMassUnitId ?? '',
  };
}

export function normalizeMovementExercisePrescription(
  exercise: MovementExercisePrescriptionSource | undefined,
): MovementExercisePrescriptionInput {
  const unitId =
    exercise?.equipment_weight_unit_id ??
    exercise?.equipment_weight_unit?.id ??
    null;

  return {
    id: exercise?.id ?? undefined,
    movement_exercise_id: normalizePrescriptionValue(
      exercise?.movement_exercise_id,
    ),
    sets: normalizePrescriptionValue(exercise?.sets),
    reps: normalizePrescriptionValue(exercise?.reps),
    rest_seconds: normalizePrescriptionValue(exercise?.rest_seconds),
    duration_seconds: normalizePrescriptionValue(exercise?.duration_seconds),
    intensity: normalizePrescriptionValue(exercise?.intensity),
    equipment_weight: normalizePrescriptionValue(exercise?.equipment_weight),
    equipment_weight_unit_id: normalizePrescriptionValue(unitId),
    summary: exercise?.summary ?? null,
    duration_preview: exercise?.duration_preview ?? null,
    rest_preview: exercise?.rest_preview ?? null,
  };
}

export function formatDurationPreview(
  seconds: number | null | undefined,
): string | null {
  if (seconds == null || seconds <= 0 || Number.isNaN(seconds)) return null;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes} min` : `${minutes} min ${remainder}s`;
}

/**
 * Converts a raw seconds value into a friendly, spelled-out breakdown for
 * display next to seconds inputs (e.g. `90` → "1 min 30 sec", `3661` →
 * "1 hr 1 min 1 sec"). Purely presentational — never used for saved data.
 *
 * @param value - The raw input value (string or number) entered by the user.
 * @returns A readable string, or `null` when there is nothing meaningful to show.
 */
export function formatSecondsReadable(
  value: string | number | null | undefined,
): string | null {
  if (value == null) return null;

  const trimmed = typeof value === 'string' ? value.trim() : value;
  if (trimmed === '') return null;

  const totalSeconds = Number(trimmed);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return null;

  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0) parts.push(`${seconds} sec`);

  return parts.length > 0 ? parts.join(' ') : null;
}

export function getPrescriptionFieldPlaceholder(
  field: PrescriptionFieldKey,
  customPlaceholders?: PrescriptionFieldPlaceholders | null,
): string | undefined {
  if (customPlaceholders?.[field]?.trim()) {
    return customPlaceholders[field]!.trim();
  }
  return FALLBACK_FIELD_PLACEHOLDERS[field];
}

export function getPrescriptionFieldHint(
  field: PrescriptionFieldKey,
  customHints?: PrescriptionFieldHints | null,
): string | undefined {
  const hint = customHints?.[field]?.trim();
  return hint || undefined;
}

export function isMovementPrescriptionMeaningful(
  exercise: MovementExercisePrescriptionInput,
): boolean {
  return Boolean(
    exercise.movement_exercise_id ||
    exercise.sets ||
    exercise.reps ||
    exercise.rest_seconds ||
    exercise.duration_seconds ||
    exercise.intensity ||
    exercise.equipment_weight ||
    exercise.equipment_weight_unit_id,
  );
}

export function isPrescriptionFieldVisible(
  profile: PrescriptionProfile | null | undefined,
  field: PrescriptionFieldKey,
): boolean {
  if (!profile) return false;
  return FIELD_VISIBILITY[profile][field];
}

export function getPrescriptionFieldLabel(
  profile: PrescriptionProfile | null | undefined,
  field: PrescriptionFieldKey,
  customLabels?: PrescriptionFieldLabels | null,
): string {
  if (customLabels?.[field]?.trim()) return customLabels[field]!.trim();
  if (profile && DEFAULT_FIELD_LABELS[profile][field]?.trim()) {
    return DEFAULT_FIELD_LABELS[profile][field]!.trim();
  }

  switch (field) {
    case 'sets':
      return 'Sets';
    case 'reps':
      return 'Reps';
    case 'rest_seconds':
      return 'Rest (seconds)';
    case 'duration_seconds':
      return 'Duration (seconds)';
    case 'intensity':
      return 'Intensity';
    case 'equipment_weight':
      return 'Weight';
    case 'equipment_weight_unit_id':
      return 'Weight Unit';
    default:
      return field;
  }
}

export function toNullableInteger(value: string): number | null {
  const normalized = normalizePrescriptionValue(value);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function toNullableNumber(value: string): number | null {
  const normalized = normalizePrescriptionValue(value);
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildMovementExerciseSavePayload(
  exercise: MovementExercisePrescriptionInput,
  profile: PrescriptionProfile | null | undefined,
): CarePlanMovementExercisePrescription {
  const payload: CarePlanMovementExercisePrescription = {
    movement_exercise_id: toNullableInteger(exercise.movement_exercise_id),
  };

  if (!profile) return payload;

  return {
    ...payload,
    sets: isPrescriptionFieldVisible(profile, 'sets')
      ? toNullableInteger(exercise.sets)
      : null,
    reps: isPrescriptionFieldVisible(profile, 'reps')
      ? toNullableInteger(exercise.reps)
      : null,
    rest_seconds: isPrescriptionFieldVisible(profile, 'rest_seconds')
      ? toNullableInteger(exercise.rest_seconds)
      : null,
    duration_seconds: isPrescriptionFieldVisible(profile, 'duration_seconds')
      ? toNullableInteger(exercise.duration_seconds)
      : null,
    intensity: isPrescriptionFieldVisible(profile, 'intensity')
      ? exercise.intensity.trim() || null
      : null,
    equipment_weight: isPrescriptionFieldVisible(profile, 'equipment_weight')
      ? toNullableNumber(exercise.equipment_weight)
      : null,
    equipment_weight_unit_id: isPrescriptionFieldVisible(
      profile,
      'equipment_weight_unit_id',
    )
      ? toNullableInteger(exercise.equipment_weight_unit_id)
      : null,
  };
}

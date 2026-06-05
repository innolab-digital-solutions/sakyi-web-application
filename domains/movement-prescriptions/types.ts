export const PRESCRIPTION_PROFILES = [
  'sets_reps',
  'sets_reps_load',
  'sets_duration',
  'cardio_steady',
  'cardio_interval',
] as const;

export type PrescriptionProfile = (typeof PRESCRIPTION_PROFILES)[number];

export const PRESCRIPTION_PROFILE_LABELS: Record<PrescriptionProfile, string> =
  {
    sets_reps: 'Sets & reps',
    sets_reps_load: 'Sets, reps & load',
    sets_duration: 'Sets & duration',
    cardio_steady: 'Steady-state cardio',
    cardio_interval: 'Interval cardio',
  };

export const PRESCRIPTION_INTENSITIES = [
  'very_light',
  'light',
  'moderate',
  'hard',
  'maximum',
] as const;

export type PrescriptionIntensity = (typeof PRESCRIPTION_INTENSITIES)[number];

export type PrescriptionFieldKey =
  | 'sets'
  | 'reps'
  | 'rest_seconds'
  | 'duration_seconds'
  | 'intensity'
  | 'equipment_weight'
  | 'equipment_weight_unit_id';

export type PrescriptionFieldLabels = Partial<
  Record<PrescriptionFieldKey, string>
>;

export type PrescriptionFieldPlaceholders = Partial<
  Record<PrescriptionFieldKey, string>
>;

export type PrescriptionFieldHints = Partial<Record<PrescriptionFieldKey, string>>;

export type PrescriptionDurationInputMode = 'seconds_only';

export type MovementPrescriptionProfileLookup = {
  value: PrescriptionProfile;
  name: string;
  label: string;
  field_labels: PrescriptionFieldLabels;
  duration_input_mode?: PrescriptionDurationInputMode;
  field_placeholders?: PrescriptionFieldPlaceholders;
  field_hints?: PrescriptionFieldHints;
};

export type MovementPrescriptionIntensityLookup = {
  value: PrescriptionIntensity;
  label: string;
  reference_range: string;
};

export type MovementExerciseLookup = {
  id: number;
  name: string;
  description: string | null;
  difficulty: string | null;
  prescription_profile: PrescriptionProfile | null;
  prescription_duration_input_mode?: PrescriptionDurationInputMode | null;
  prescription_field_labels: PrescriptionFieldLabels | null;
  prescription_field_placeholders?: PrescriptionFieldPlaceholders | null;
  prescription_field_hints?: PrescriptionFieldHints | null;
  category: {
    id: number;
    name: string;
  } | null;
  media?: unknown[];
  equipments?: Array<{ id: number; name: string }>;
};

export type CarePlanMovementExercisePrescription = {
  id?: number | string;
  movement_exercise_id: number | string | null;
  sets?: number | string | null;
  reps?: number | string | null;
  rest_seconds?: number | string | null;
  duration_seconds?: number | string | null;
  intensity?: PrescriptionIntensity | string | null;
  equipment_weight?: number | string | null;
  equipment_weight_unit_id?: number | string | null;
  equipment_weight_unit?: {
    id: number;
    name: string;
    abbreviation: string;
    type?: string | null;
  } | null;
  summary?: string | null;
  duration_preview?: string | null;
  rest_preview?: string | null;
};

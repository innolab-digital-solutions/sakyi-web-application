import type {
  PrescriptionDurationInputMode,
  PrescriptionFieldHints,
  PrescriptionFieldLabels,
  PrescriptionFieldPlaceholders,
  PrescriptionProfile,
} from '@/domains/movement-prescriptions/types';

export type MovementDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MediaType = 'url' | 'image' | 'video' | 'audio';

export type MovementExerciseMedia = {
  id: number;
  type: MediaType;
  url: string;
};

export type MovementExercise = {
  id: number;
  name: string;
  description: string | null;
  difficulty: MovementDifficulty;
  prescription_profile: PrescriptionProfile;
  prescription_duration_input_mode?: PrescriptionDurationInputMode | null;
  prescription_field_labels?: PrescriptionFieldLabels | null;
  prescription_field_placeholders?: PrescriptionFieldPlaceholders | null;
  prescription_field_hints?: PrescriptionFieldHints | null;
  is_active: boolean;
  movement_category: { id: number; name: string } | null;
  media: MovementExerciseMedia[];
  gif: string | null;
  equipments: { id: number; name: string }[];
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  timestamps: {
    created_at: string;
    updated_at: string;
  };
};

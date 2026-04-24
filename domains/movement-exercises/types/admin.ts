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
  is_active: boolean;
  movement_category: { id: number; name: string } | null;
  media: MovementExerciseMedia[];
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

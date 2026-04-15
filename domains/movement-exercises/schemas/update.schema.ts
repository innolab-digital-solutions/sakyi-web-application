import { z } from 'zod';

import { MovementExerciseBodySchema } from './base.schema';

export const MovementExerciseUpdateSchema =
  MovementExerciseBodySchema.partial();

export type MovementExerciseUpdateInput = z.infer<
  typeof MovementExerciseUpdateSchema
>;

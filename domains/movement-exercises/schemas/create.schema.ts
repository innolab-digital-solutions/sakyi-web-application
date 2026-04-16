import { z } from 'zod';

import { MovementExerciseBodySchema } from './base.schema';

export const MovementExerciseCreateSchema = MovementExerciseBodySchema.extend({
  is_active: z.boolean(),
}).required({ is_active: true });

export type MovementExerciseCreateInput = z.infer<
  typeof MovementExerciseCreateSchema
>;

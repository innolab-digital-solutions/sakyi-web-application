import { z } from 'zod';

import { MovementExerciseBodySchema } from './base.schema';
import { OptionalMovementExerciseGifSchema } from './gif.schema';

export const MovementExerciseCreateSchema = MovementExerciseBodySchema.extend({
  is_active: z.boolean(),
  gif: OptionalMovementExerciseGifSchema,
}).required({ is_active: true });

export type MovementExerciseCreateInput = z.infer<
  typeof MovementExerciseCreateSchema
>;

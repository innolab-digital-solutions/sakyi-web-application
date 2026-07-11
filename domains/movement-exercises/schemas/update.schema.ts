import { z } from 'zod';

import { MovementExerciseBodySchema } from './base.schema';
import { OptionalMovementExerciseGifSchema } from './gif.schema';

export const MovementExerciseUpdateSchema =
  MovementExerciseBodySchema.partial().extend({
    gif: OptionalMovementExerciseGifSchema,
  });

export type MovementExerciseUpdateInput = z.infer<
  typeof MovementExerciseUpdateSchema
>;

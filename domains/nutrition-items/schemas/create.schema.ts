import { z } from 'zod';

import { NutritionItemBodySchema } from './base.schema';

/**
 * Admin create payload. Defaults new items to active unless specified.
 */
export const NutritionItemCreateSchema = NutritionItemBodySchema.extend({
  is_active: z.boolean(),
}).required({ is_active: true });

export type NutritionItemCreateInput = z.infer<
  typeof NutritionItemCreateSchema
>;

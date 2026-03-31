import { z } from 'zod';

import { NutritionCategoryBodySchema } from './base.schema';

/**
 * Admin create payload. Defaults new categories to active unless specified.
 */
export const NutritionCategoryCreateSchema = NutritionCategoryBodySchema.extend(
  {
    is_active: z.boolean(),
  },
).required({ is_active: true });

export type NutritionCategoryCreateInput = z.infer<
  typeof NutritionCategoryCreateSchema
>;

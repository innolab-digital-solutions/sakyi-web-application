import { z } from 'zod';

import { NutritionCategoryBodySchema } from './base.schema';

/**
 * Admin update payload. All fields are optional for partial updates.
 */
export const NutritionCategoryUpdateSchema =
  NutritionCategoryBodySchema.partial();

export type NutritionCategoryUpdateInput = z.infer<
  typeof NutritionCategoryUpdateSchema
>;

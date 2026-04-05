import { z } from 'zod';

import { NutritionItemBodySchema } from './base.schema';

/**
 * Admin update payload. All fields are optional for partial updates.
 */
export const NutritionItemUpdateSchema = NutritionItemBodySchema.partial();

export type NutritionItemUpdateInput = z.infer<
  typeof NutritionItemUpdateSchema
>;

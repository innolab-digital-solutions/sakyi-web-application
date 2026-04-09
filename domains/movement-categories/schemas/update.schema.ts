import { z } from 'zod';

import { MovementCategoryBodySchema } from './base.schema';

/**
 * Admin update payload. All fields are optional for partial updates.
 */
export const MovementCategoryUpdateSchema =
  MovementCategoryBodySchema.partial();

export type MovementCategoryUpdateInput = z.infer<
  typeof MovementCategoryUpdateSchema
>;

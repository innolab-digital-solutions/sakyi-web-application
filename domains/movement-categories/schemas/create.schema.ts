import { z } from 'zod';

import { MovementCategoryBodySchema } from './base.schema';

/**
 * Admin create payload. Defaults new categories to active unless specified.
 */
export const MovementCategoryCreateSchema = MovementCategoryBodySchema.extend({
  is_active: z.boolean(),
}).required({ is_active: true });

export type MovementCategoryCreateInput = z.infer<
  typeof MovementCategoryCreateSchema
>;

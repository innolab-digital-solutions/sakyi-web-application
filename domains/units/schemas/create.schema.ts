import { z } from 'zod';

import { UnitBodySchema, unitTypeSchema } from './base.schema';

/**
 * Admin create payload. Defaults new units to active unless specified.
 */
export const UnitCreateSchema = UnitBodySchema.extend({
  type: unitTypeSchema,
  is_active: z.boolean(),
}).required({ is_active: true });

export type UnitCreateInput = z.infer<typeof UnitCreateSchema>;

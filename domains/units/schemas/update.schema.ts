import { z } from 'zod';

import { UnitBodySchema } from './base.schema';

/**
 * Admin update payload. All fields are optional for partial updates.
 */
export const UnitUpdateSchema = UnitBodySchema.partial();

export type UnitUpdateInput = z.infer<typeof UnitUpdateSchema>;

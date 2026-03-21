import { z } from 'zod';

import { ProgramBodySchema } from './base.schema';

/**
 * Admin update payload (PATCH-style): all body fields optional.
 */
export const ProgramUpdateSchema = ProgramBodySchema.partial();

export type ProgramUpdateInput = z.infer<typeof ProgramUpdateSchema>;

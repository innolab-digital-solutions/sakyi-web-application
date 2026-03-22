import { z } from 'zod';

import { STATUS } from '../constants';
import { ProgramBodySchema, programStatusSchema } from './base.schema';

/**
 * Admin create payload. Defaults new programs to draft unless specified.
 */
export const ProgramCreateSchema = ProgramBodySchema.extend({
  status: programStatusSchema.optional().default(STATUS.DRAFT),
});

export type ProgramCreateInput = z.infer<typeof ProgramCreateSchema>;

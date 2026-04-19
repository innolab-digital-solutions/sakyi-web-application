import { z } from 'zod';

import { STATUS } from '../constants';
import { ProgramBodySchema } from './base.schema';

const programCreateStatusSchema = z.enum([STATUS.DRAFT, STATUS.PUBLISHED]);

/**
 * Admin create payload. Defaults new programs to draft unless specified.
 * Hidden/archived are not valid on create — they apply after publish.
 */
export const ProgramCreateSchema = ProgramBodySchema.extend({
  status: programCreateStatusSchema.optional().default(STATUS.DRAFT),
});

export type ProgramCreateInput = z.infer<typeof ProgramCreateSchema>;

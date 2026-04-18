import { z } from 'zod';

import { TeamBodySchema } from './base.schema';

export const TeamUpdateSchema = TeamBodySchema;

export type TeamUpdateInput = z.infer<typeof TeamUpdateSchema>;

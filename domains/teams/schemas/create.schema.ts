import { z } from 'zod';

import { TeamBodySchema } from './base.schema';

export const TeamCreateSchema = TeamBodySchema.extend({
  enrollment_id: z
    .number({ error: 'Enrollment ID is required.' })
    .int()
    .positive('Enrollment ID must be a positive integer.'),
});

export type TeamCreateInput = z.infer<typeof TeamCreateSchema>;

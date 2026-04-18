import { z } from 'zod';

import { MovementEquipmentBodySchema } from './base.schema';

/**
 * Admin create payload. Defaults new equipment to active unless specified.
 */
export const MovementEquipmentCreateSchema = MovementEquipmentBodySchema.extend(
  {
    is_active: z.boolean(),
  },
).required({ is_active: true });

export type MovementEquipmentCreateInput = z.infer<
  typeof MovementEquipmentCreateSchema
>;

import { z } from 'zod';

import { MovementEquipmentBodySchema } from './base.schema';

/**
 * Admin update payload. All fields are optional for partial updates.
 */
export const MovementEquipmentUpdateSchema =
  MovementEquipmentBodySchema.partial();

export type MovementEquipmentUpdateInput = z.infer<
  typeof MovementEquipmentUpdateSchema
>;

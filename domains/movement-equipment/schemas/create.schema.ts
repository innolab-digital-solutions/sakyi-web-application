import { z } from 'zod';

import { MovementEquipmentBodySchema } from './base.schema';

/**
 * Admin create payload. `is_active` defaults to true per {@link MovementEquipmentBodySchema}.
 */
export const MovementEquipmentCreateSchema = MovementEquipmentBodySchema;

export type MovementEquipmentCreateInput = z.infer<
  typeof MovementEquipmentCreateSchema
>;

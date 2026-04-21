import { z } from 'zod';

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, timestamps).
 */
export const MovementEquipmentBodySchema = z.object({
  name: z
    .string()
    .min(1, 'The name field is required.')
    .max(255, 'The name field must not be greater than 255 characters.'),
  is_active: z.boolean().default(true),
});

export type MovementEquipmentBodyInput = z.infer<
  typeof MovementEquipmentBodySchema
>;

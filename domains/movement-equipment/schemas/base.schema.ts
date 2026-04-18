import { z } from 'zod';

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, timestamps).
 */
export const MovementEquipmentBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  is_active: z.boolean().default(true),
});

export type MovementEquipmentBodyInput = z.infer<
  typeof MovementEquipmentBodySchema
>;

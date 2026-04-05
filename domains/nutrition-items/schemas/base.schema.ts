import { z } from 'zod';

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, `slug`, timestamps).
 */
export const NutritionItemBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters.')
    .nullish(),
  nutrition_category_id: z
    .number({ error: 'Category is required.' })
    .int()
    .positive('Category is required.'),
  default_unit_id: z.number().int().positive().nullish(),
  is_active: z.boolean().default(true),
});

export type NutritionItemBodyInput = z.infer<typeof NutritionItemBodySchema>;

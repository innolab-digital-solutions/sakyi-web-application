import { z } from 'zod';

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, `slug`, timestamps).
 */
export const NutritionItemBodySchema = z.object({
  name: z
    .string()
    .min(1, 'The name field is required.')
    .max(255, 'The name field must not be greater than 255 characters.'),
  description: z
    .string()
    .max(
      5000,
      'The description field must not be greater than 5000 characters.',
    )
    .nullish(),
  nutrition_category_id: z
    .number({ error: 'The category field is required.' })
    .int()
    .positive('The category field is required.'),
  default_unit_id: z.number().int().positive().nullish(),
  estimated_calories: z
    .number({ error: 'Estimated calories must be a number.' })
    .min(0, 'Estimated calories must be at least 0.')
    .max(999999.99, 'Estimated calories must not be greater than 999999.99.')
    .nullish(),
  is_active: z.boolean().default(true),
});

export type NutritionItemBodyInput = z.infer<typeof NutritionItemBodySchema>;

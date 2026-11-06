import { z } from 'zod';

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, `slug`, timestamps).
 */
export const NutritionCategoryBodySchema = z.object({
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
  parent_id: z.number().int().positive().nullish(),
  is_active: z.boolean().default(true),
});

export type NutritionCategoryBodyInput = z.infer<
  typeof NutritionCategoryBodySchema
>;

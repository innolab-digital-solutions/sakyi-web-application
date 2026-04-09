import { z } from 'zod';

/**
 * Translation entry for a single locale.
 */
export const BlogCategoryTranslationSchema = z.object({
  locale: z.enum(['en', 'my']),
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(150, 'Name must be at most 150 characters.'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters.')
    .nullish(),
});

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, `slug`, timestamps).
 */
export const BlogCategoryBodySchema = z.object({
  is_active: z.boolean().default(true),
  translations: z
    .array(BlogCategoryTranslationSchema)
    .min(1, 'At least one translation is required.'),
});

export type BlogCategoryBodyInput = z.infer<typeof BlogCategoryBodySchema>;

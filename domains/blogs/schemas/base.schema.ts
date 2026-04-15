import { z } from 'zod';

export const BlogPostTranslationSchema = z.object({
  locale: z.enum(['en', 'my']),
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(255, 'Title must be at most 255 characters.'),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be at most 500 characters.')
    .nullish(),
  content: z.string().min(1, 'Content is required.'),
});

/**
 * Shared editable fields for admin create/update payloads.
 */
export const BlogPostBodySchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
  blog_category_id: z
    .number({ error: 'Category is required.' })
    .int()
    .positive('Category is required.'),
  thumbnail_url: z.string().max(2048).nullish(),
  translations: z
    .array(BlogPostTranslationSchema)
    .min(1, 'At least one translation is required.'),
});

export type BlogPostBodyInput = z.infer<typeof BlogPostBodySchema>;
export type BlogPostTranslationInput = z.infer<
  typeof BlogPostTranslationSchema
>;

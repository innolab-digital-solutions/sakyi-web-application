import { z } from 'zod';

export const BlogPostTranslationSchema = z.object({
  locale: z.enum(['en', 'my']),
  title: z
    .string()
    .min(1, 'The title field is required.')
    .max(255, 'The title field must not be greater than 255 characters.'),
  excerpt: z
    .string()
    .max(500, 'The excerpt field must not be greater than 500 characters.')
    .nullish(),
  content: z.string().min(1, 'The content field is required.'),
});

/**
 * Shared editable fields for admin create/update payloads.
 */
export const BlogPostBodySchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
  blog_category_id: z
    .number({ error: 'The category field is required.' })
    .int()
    .positive('The category field is required.'),
  thumbnail_url: z.string().max(2048).nullish(),
  translations: z
    .array(BlogPostTranslationSchema)
    .min(1, 'The translations field is required.'),
});

export type BlogPostBodyInput = z.infer<typeof BlogPostBodySchema>;
export type BlogPostTranslationInput = z.infer<
  typeof BlogPostTranslationSchema
>;

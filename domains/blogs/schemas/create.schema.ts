import { z } from 'zod';

import { BlogPostBodySchema } from './base.schema';

export const BlogPostCreateSchema = BlogPostBodySchema.extend({
  status: z.enum(['draft', 'published', 'archived']),
  thumbnail: z
    .instanceof(typeof window !== 'undefined' ? File : Object)
    .refine((f) => f instanceof File, 'Thumbnail is required.'),
}).required({ status: true, thumbnail: true });

export type BlogPostCreateInput = z.infer<typeof BlogPostCreateSchema>;

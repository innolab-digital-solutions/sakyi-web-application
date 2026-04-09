import { z } from 'zod';

import { BlogPostBodySchema } from './base.schema';

export const BlogPostCreateSchema = BlogPostBodySchema.extend({
  status: z.enum(['draft', 'published', 'archived']),
  thumbnail: z.instanceof(
    typeof window !== 'undefined' ? File : Object,
    { message: 'Thumbnail is required.' },
  ),
}).required({ status: true, thumbnail: true });

export type BlogPostCreateInput = z.infer<typeof BlogPostCreateSchema>;

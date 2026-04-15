import { z } from 'zod';

import { BlogPostBodySchema } from './base.schema';

export const BlogPostUpdateSchema = BlogPostBodySchema.partial();

export type BlogPostUpdateInput = z.infer<typeof BlogPostUpdateSchema>;

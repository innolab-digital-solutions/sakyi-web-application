import { z } from 'zod';

import { BlogCategoryBodySchema } from './base.schema';

/**
 * Admin update payload. All fields are optional for partial updates.
 */
export const BlogCategoryUpdateSchema = BlogCategoryBodySchema.partial();

export type BlogCategoryUpdateInput = z.infer<typeof BlogCategoryUpdateSchema>;

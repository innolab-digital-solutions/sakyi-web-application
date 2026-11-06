import { z } from 'zod';

import { BlogCategoryBodySchema } from './base.schema';

/**
 * Admin create payload. `is_active` defaults to true per {@link BlogCategoryBodySchema}.
 */
export const BlogCategoryCreateSchema = BlogCategoryBodySchema;

export type BlogCategoryCreateInput = z.infer<typeof BlogCategoryCreateSchema>;

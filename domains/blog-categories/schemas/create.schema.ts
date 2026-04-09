import { z } from 'zod';

import { BlogCategoryBodySchema } from './base.schema';

/**
 * Admin create payload. is_active is required on creation.
 */
export const BlogCategoryCreateSchema = BlogCategoryBodySchema.extend({
  is_active: z.boolean(),
}).required({ is_active: true });

export type BlogCategoryCreateInput = z.infer<typeof BlogCategoryCreateSchema>;

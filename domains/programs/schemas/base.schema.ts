import { z } from 'zod';

import { STATUS } from '../constants';

/**
 * Allowed program lifecycle values (aligned with {@link STATUS}).
 */
export const programStatusSchema = z.enum([
  STATUS.DRAFT,
  STATUS.PUBLISHED,
  STATUS.ARCHIVED,
  STATUS.HIDDEN,
]);

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, timestamps, nested read-only relations).
 */
export const ProgramBodySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(255, 'Title must be at most 255 characters.'),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .max(255, 'Slug must be at most 255 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers, and single hyphens between segments.',
    ),
  tagline: z.string().max(500).optional().or(z.literal('')),
  excerpt: z.string().max(20_000).optional().or(z.literal('')),
  about: z.string().max(200_000).optional().or(z.literal('')),
  features: z.array(z.string()).default([]),
  ideals: z.array(z.string()).default([]),
  expectations: z.array(z.string()).default([]),
  structures: z.array(z.string()).default([]),
  thumbnail_url: z.string().max(2048).optional().or(z.literal('')),
  duration: z.string().max(500).optional().or(z.literal('')),
  price: z.object({
    amount: z.number().nonnegative('Amount must be zero or greater.'),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter ISO code.')
      .toUpperCase(),
  }),
  status: programStatusSchema,
});

export type ProgramBodyInput = z.infer<typeof ProgramBodySchema>;

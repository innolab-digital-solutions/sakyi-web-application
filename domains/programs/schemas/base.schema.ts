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
 * Per-locale translation entry for a program.
 * Translatable fields: title, tagline, excerpt, about, and the four list fields.
 */
export const ProgramTranslationSchema = z.object({
  locale: z.enum(['en', 'my']),
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(255, 'Title must be at most 255 characters.'),
  tagline: z.string().max(500, 'Tagline must be at most 500 characters.').nullish(),
  excerpt: z.string().max(20_000, 'Excerpt must be at most 20,000 characters.').nullish(),
  about: z.string().max(200_000, 'About must be at most 200,000 characters.').nullish(),
  features: z.array(z.string()).default([]),
  ideals: z.array(z.string()).default([]),
  expectations: z.array(z.string()).default([]),
  structures: z.array(z.string()).default([]),
});

export type ProgramTranslationInput = z.infer<typeof ProgramTranslationSchema>;

/**
 * Shared editable fields for admin create/update payloads.
 * Non-translatable fields live at the top level; translatable content lives
 * inside the `translations` array (one entry per supported locale).
 */
export const ProgramBodySchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .max(255, 'Slug must be at most 255 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers, and single hyphens between segments.',
    ),
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
  translations: z
    .array(ProgramTranslationSchema)
    .min(1, 'At least one translation (English) is required.'),
});

export type ProgramBodyInput = z.infer<typeof ProgramBodySchema>;

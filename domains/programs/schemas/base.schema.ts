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
const programStructureItemSchema = z.object({
  period: z.string(),
  title: z.string(),
  description: z.string(),
});

export const ProgramTranslationSchema = z.object({
  locale: z.enum(['en', 'my']),
  title: z
    .string()
    .min(1, 'The title field is required.')
    .max(255, 'The title field must not be greater than 255 characters.'),
  tagline: z
    .string()
    .max(500, 'The tagline field must not be greater than 500 characters.')
    .nullish(),
  excerpt: z
    .string()
    .max(
      20_000,
      'The excerpt field must not be greater than 20,000 characters.',
    )
    .nullish(),
  about: z
    .string()
    .max(
      200_000,
      'The about field must not be greater than 200,000 characters.',
    )
    .nullish(),
  features: z.array(z.string()).default([]),
  ideals: z.array(z.string()).default([]),
  expectations: z.array(z.string()).default([]),
  structures: z.array(programStructureItemSchema).default([]),
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
    .min(1, 'The slug field is required.')
    .max(255, 'The slug field must not be greater than 255 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers, and single hyphens between segments.',
    ),
  thumbnail_url: z.string().max(2048).optional().or(z.literal('')),
  duration: z.string().max(500).optional().or(z.literal('')),
  /** Flat number on write; API may still return amount+currency on read. */
  price: z.number().nonnegative('Price must be zero or greater.').optional(),
  status: programStatusSchema,
  translations: z
    .array(ProgramTranslationSchema)
    .min(1, 'The translations field is required.'),
});

export type ProgramBodyInput = z.infer<typeof ProgramBodySchema>;

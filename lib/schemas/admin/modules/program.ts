import { z } from 'zod';

/**
 * Allowed locales for program translations.
 *
 * Matches the backend `Locale` enum, limited to:
 * - `en`: English
 * - `my`: Myanmar
 */
export const ProgramLocaleSchema = z.enum(['en', 'my']);

/**
 * Schema for a single program translation entry.
 *
 * Mirrors the Laravel validation rules:
 * - `locale`: required, must be a supported locale
 * - `tagline`: required string, max 255 characters
 * - `title`: required string, max 255 characters
 * - `excerpt`: required string
 * - `about`: required string
 * - `features`, `ideals`, `expectations`, `structures`:
 *   required arrays with at least one non-empty string
 */
export const ProgramTranslationSchema = z.object({
  locale: ProgramLocaleSchema,
  tagline: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  excerpt: z.string().min(1),
  about: z.string().min(1),
  features: z.array(z.string().min(1)).min(1),
  ideals: z.array(z.string().min(1)).min(1),
  expectations: z.array(z.string().min(1)).min(1),
  structures: z.array(z.string().min(1)).min(1),
});

/**
 * Schema for creating a program (admin).
 *
 * Mirrors the Laravel create form request rules, except:
 * - Database existence checks (e.g. Rule::exists) are not enforced here.
 * - File MIME type and size for `thumbnail` are approximated with runtime checks.
 */
export const ProgramCreateSchema = z.object({
  goal_ids: z.array(z.number().int()).min(1),

  // `thumbnail` => required image file (png, jpg, jpeg), max 5 MB
  thumbnail: z
    .instanceof(File)
    .refine(
      (file) => ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type),
      'The thumbnail must be a file of type: png, jpg, jpeg.',
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'The thumbnail must not be greater than 5120 kilobytes.',
    ),

  duration: z.string().min(1).max(10),
  price: z.number().int().min(0),

  // Backend uses Rule::enum(ProgramStatus::class); enforce as non-empty string here.
  status: z.string().min(1),

  // nullable|date => field is optional; if present can be null or a non-empty string (date format validated server-side)
  published_at: z.union([z.string().min(1), z.null()]).optional(),
  archived_at: z.union([z.string().min(1), z.null()]).optional(),

  translations: z.array(ProgramTranslationSchema).min(1),
});

/**
 * Schema for updating a program (admin).
 *
 * Mirrors the Laravel update form request rules:
 * - All top-level fields are optional (`sometimes`).
 * - When `translations` is present, each translation entry and its nested fields
 *   are required, matching the `required_with:translations` behavior.
 */
export const ProgramUpdateSchema = z.object({
  goal_ids: z.array(z.number().int()).min(1).optional(),

  thumbnail: z
    .instanceof(File)
    .refine(
      (file) => ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type),
      'The thumbnail must be a file of type: png, jpg, jpeg.',
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'The thumbnail must not be greater than 5120 kilobytes.',
    )
    .optional(),

  duration: z.string().min(1).max(10).optional(),
  price: z.number().int().min(0).optional(),
  status: z.string().min(1).optional(),

  published_at: z.union([z.string().min(1), z.null()]).optional(),
  archived_at: z.union([z.string().min(1), z.null()]).optional(),

  translations: z.array(ProgramTranslationSchema).min(1).optional(),
});

export type ProgramLocale = z.infer<typeof ProgramLocaleSchema>;
export type ProgramTranslation = z.infer<typeof ProgramTranslationSchema>;
export type ProgramCreateSchemaType = z.infer<typeof ProgramCreateSchema>;
export type ProgramUpdateSchemaType = z.infer<typeof ProgramUpdateSchema>;

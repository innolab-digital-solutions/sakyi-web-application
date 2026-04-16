import { z } from 'zod';

export const MediaItemSchema = z.object({
  type: z.enum(['url', 'image', 'video', 'audio'], {
    error: 'Invalid media type.',
  }),
  url: z
    .string()
    .min(1, 'URL is required.')
    .max(500, 'URL must be at most 500 characters.')
    .url('Must be a valid URL.'),
});

export const MovementExerciseBodySchema = z.object({
  movement_category_id: z
    .number({ error: 'Category is required.' })
    .int()
    .positive('Category is required.'),
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters.')
    .nullish(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    error: 'Difficulty is required.',
  }),
  is_active: z.boolean(),
  media: z.array(MediaItemSchema).nullish(),
  equipment_ids: z.array(z.number().int().positive()).nullish(),
});

export type MovementExerciseBodyInput = z.infer<
  typeof MovementExerciseBodySchema
>;
export type MediaItemInput = z.infer<typeof MediaItemSchema>;

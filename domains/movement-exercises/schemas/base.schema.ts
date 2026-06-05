import { z } from 'zod';

import { PRESCRIPTION_PROFILES } from '@/domains/movement-prescriptions/types';

export const MediaItemSchema = z.object({
  type: z.enum(['url', 'image', 'video', 'audio'], {
    error: 'Invalid media type.',
  }),
  url: z
    .string()
    .min(1, 'The URL field is required.')
    .max(500, 'The URL field must not be greater than 500 characters.')
    .url('The URL field must be a valid URL.'),
});

export const MovementExerciseBodySchema = z.object({
  movement_category_id: z
    .number({ error: 'The category field is required.' })
    .int()
    .positive('The category field is required.'),
  name: z
    .string()
    .min(1, 'The name field is required.')
    .max(255, 'The name field must not be greater than 255 characters.'),
  description: z
    .string()
    .max(
      5000,
      'The description field must not be greater than 5000 characters.',
    )
    .nullish(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    error: 'The difficulty field is required.',
  }),
  prescription_profile: z.enum(PRESCRIPTION_PROFILES, {
    error: 'The prescription profile field is required.',
  }),
  is_active: z.boolean(),
  media: z.array(MediaItemSchema).nullish(),
  equipment_ids: z.array(z.number().int().positive()).nullish(),
});

export type MovementExerciseBodyInput = z.infer<
  typeof MovementExerciseBodySchema
>;
export type MediaItemInput = z.infer<typeof MediaItemSchema>;

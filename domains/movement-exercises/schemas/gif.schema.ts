import { z } from 'zod';

/**
 * Optional GIF upload for admin movement exercise create/update multipart payloads (`gif` key).
 */
export const OptionalMovementExerciseGifSchema = z
  .instanceof(typeof window !== 'undefined' ? File : Object, {
    message: 'Please choose a valid GIF file.',
  })
  .optional();

import { z } from 'zod';

/**
 * Optional profile image for admin user create/update multipart payloads (`picture` key).
 * Mirrors {@link BlogPostCreateSchema}’s `thumbnail` pattern; validated only in the browser.
 */
export const OptionalUserPictureSchema = z
  .instanceof(typeof window !== 'undefined' ? File : Object, {
    message: 'Please choose a valid image file.',
  })
  .optional();

import { z } from 'zod';

/**
 * Marketing contact form payload aligned with `MARKETING_ENDPOINTS.CONTACT`.
 */
export const ContactMessageSchema = z.object({
  name: z
    .string()
    .min(1, 'The name field is required.')
    .max(255, 'The name must not be greater than 255 characters.')
    .trim(),
  email: z
    .string()
    .min(1, 'The email address field is required.')
    .max(255, 'The email address must not be greater than 255 characters.')
    .trim()
    .toLowerCase()
    .pipe(
      z.email({ message: 'The email address must be a valid email address.' }),
    ),
  phone: z
    .string()
    .min(1, 'The phone field is required.')
    .max(50, 'The phone must not be greater than 50 characters.')
    .trim(),
  subject: z
    .string()
    .min(1, 'The subject field is required.')
    .max(255, 'The subject must not be greater than 255 characters.')
    .trim(),
  message: z
    .string()
    .min(1, 'The message field is required.')
    .max(5000, 'The message must not be greater than 5000 characters.')
    .trim(),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;

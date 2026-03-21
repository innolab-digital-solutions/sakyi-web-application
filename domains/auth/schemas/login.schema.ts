import { z } from 'zod';

/**
 * Schema for validating admin login requests.
 *
 * This Zod object schema enforces shape and constraints for login payloads:
 * - Email: Required string, trimmed and lowercased, maximum 255 characters, and must be a valid email address.
 * - Password: Required string with a minimum length of 8 characters that must
 *   contain at least one lowercase letter, one uppercase letter, one number,
 *   and one symbol.
 *
 * This schema is used throughout the admin authentication flow to validate
 * incoming login form data at both front-end and back-end boundaries.
 *
 * @type {z.ZodObject<{email: z.ZodString, password: z.ZodString}>}
 * @see LoginSchemaType for the inferred TypeScript type.
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'The email address field is required.')
    .max(255, 'The email address must not be greater than 255 characters.')
    .trim()
    .toLowerCase()
    .pipe(
      z.email({ message: 'The email address must be a valid email address.' }),
    ),
  password: z
    .string()
    .min(1, 'The password field is required.')
    .min(8, 'The password must be at least 8 characters.')
    .regex(/[a-z]/, 'The password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'The password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'The password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'The password must contain at least one symbol.'),
});

/**
 * Type representing the input shape of the LoginSchema.
 *
 * Use this type to enforce strong typing on functions, parameters, and state
 * that relate to admin login data.
 */
export type LoginSchemaType = z.infer<typeof LoginSchema>;

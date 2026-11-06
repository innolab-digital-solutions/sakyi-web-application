import { z } from 'zod';

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

export type LoginSchemaType = z.infer<typeof LoginSchema>;

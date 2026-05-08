import { z } from 'zod';

import { LoginSchema } from './login.schema';

/**
 * Client validation for the password-reset form. Payload matches Laravel’s
 * `Password::reset` / Fortify expectations: `token`, `email`, `password`, `password_confirmation`.
 */
export const ResetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(
        1,
        'This password reset link is invalid or has expired. Request a new link from the sign-in page.',
      ),
    email: LoginSchema.shape.email,
    password: LoginSchema.shape.password,
    password_confirmation: z
      .string()
      .min(1, 'The password confirmation field is required.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  });

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

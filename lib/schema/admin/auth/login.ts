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
  password: z.string().min(1, 'The password field is required.'),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
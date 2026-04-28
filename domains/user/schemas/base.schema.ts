import { z } from 'zod';

export const UserBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'The name field is required.' })
    .max(255, {
      message: 'The name field must not be greater than 255 characters.',
    }),
  email: z.email({
    message: 'The email address field must be a valid email address.',
  }),
  is_admin: z.boolean().default(false),
});

export type UserBodyInput = z.infer<typeof UserBodySchema>;

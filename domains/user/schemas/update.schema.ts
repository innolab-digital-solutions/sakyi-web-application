import { z } from 'zod';

import { UserBodySchema } from './base.schema';

export const UserUpdateSchema = UserBodySchema.partial()
  .extend({
    password: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' })
        .max(255, { message: 'Password must be at most 255 characters.' })
        .optional(),
    ),
    password_confirmation: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.string().optional(),
    ),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.password_confirmation)
        return false;
      return true;
    },
    { message: 'Passwords do not match.', path: ['password_confirmation'] },
  );

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

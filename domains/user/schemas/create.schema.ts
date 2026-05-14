import { z } from 'zod';

import { UserBodySchema } from './base.schema';
import { OptionalUserPictureSchema } from './picture.schema';

export const UserCreateSchema = UserBodySchema.extend({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .max(255, { message: 'Password must be at most 255 characters.' }),
  password_confirmation: z
    .string()
    .min(1, { message: 'Please confirm your password.' }),
  picture: OptionalUserPictureSchema,
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match.',
  path: ['password_confirmation'],
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;

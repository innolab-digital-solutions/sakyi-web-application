import { z } from 'zod';

export const UserBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(255, { message: 'Name must be at most 255 characters.' }),
  email: z.email({ message: 'Please enter a valid email address.' }),
  is_admin: z.boolean().default(false),
  status: z
    .enum(['pending', 'active', 'suspended', 'archived'])
    .default('pending'),
});

export type UserBodyInput = z.infer<typeof UserBodySchema>;

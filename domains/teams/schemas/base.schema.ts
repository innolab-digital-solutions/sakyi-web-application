import { z } from 'zod';

export const TeamBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(150, 'Name must be at most 150 characters.'),
});

export const TEAM_ROLE_VALUES = [
  'doctor',
  'admin',
  'support',
  'super_admin',
] as const;

export type TeamRoleName = (typeof TEAM_ROLE_VALUES)[number];

export const TeamMemberAssignSchema = z.object({
  name: z.string().min(1, 'Member name is required.'),
  role_name: z.enum(TEAM_ROLE_VALUES, { error: 'Role is required.' }),
  position: z
    .string()
    .min(1, 'Position is required.')
    .max(50, 'Position must be at most 50 characters.'),
});

export type TeamBodyInput = z.infer<typeof TeamBodySchema>;
export type TeamMemberAssignInput = z.infer<typeof TeamMemberAssignSchema>;

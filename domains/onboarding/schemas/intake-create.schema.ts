import { z } from 'zod';

const positiveIdString = z
  .string()
  .trim()
  .min(1, 'This field is required.')
  .regex(/^\d+$/, 'Invalid identifier.')
  .refine((value) => Number.parseInt(value, 10) > 0, 'Invalid identifier.');

export const OnboardingIntakeCreateSchema = z.object({
  enrollment_request_id: positiveIdString,
  onboarding_template_id: positiveIdString,
  notes: z.string().max(2000, 'Notes must be 2000 characters or less.'),
});

export type OnboardingIntakeCreateSchemaType = z.infer<
  typeof OnboardingIntakeCreateSchema
>;

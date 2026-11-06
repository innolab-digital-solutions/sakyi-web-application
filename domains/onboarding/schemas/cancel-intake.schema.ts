import { z } from 'zod';

export const OnboardingCancelIntakeSchema = z.object({
  cancellation_note: z
    .string()
    .trim()
    .min(1, 'Please enter a cancellation note.')
    .max(2000, 'Cancellation note must be 2000 characters or less.'),
});

export type OnboardingCancelIntakeSchemaType = z.infer<
  typeof OnboardingCancelIntakeSchema
>;

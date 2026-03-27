import { z } from 'zod';

export const OnboardingCancelIntakeSchema = z.object({
  cancellation_note: z
    .string()
    .max(1000, 'Cancellation note must be 1000 characters or less.'),
});

export type OnboardingCancelIntakeSchemaType = z.infer<
  typeof OnboardingCancelIntakeSchema
>;

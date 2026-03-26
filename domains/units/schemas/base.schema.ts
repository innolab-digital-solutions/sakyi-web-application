import { z } from 'zod';

import { UNIT_TYPE } from '../constants';

/**
 * Allowed unit type values (aligned with {@link UNIT_TYPE}).
 */
export const unitTypeSchema = z.enum(
  [
    UNIT_TYPE.VOLUME,
    UNIT_TYPE.MASS,
    UNIT_TYPE.COUNT,
    UNIT_TYPE.LENGTH,
    UNIT_TYPE.TIME,
    UNIT_TYPE.ENERGY,
  ],
  {
    error: 'Please select a valid unit type.',
  },
);

/**
 * Shared editable fields for admin create/update payloads.
 * Excludes server-owned fields (`id`, `slug`, timestamps).
 */
export const UnitBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  abbreviation: z
    .string()
    .min(1, 'Abbreviation is required.')
    .max(10, 'Abbreviation must be at most 10 characters.'),
  type: unitTypeSchema,
  is_active: z.boolean().default(true),
});

export type UnitBodyInput = z.infer<typeof UnitBodySchema>;

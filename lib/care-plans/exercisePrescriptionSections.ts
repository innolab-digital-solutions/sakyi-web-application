import type { CarePlanSectionKey } from '@/domains/care-plans/types/admin';

/**
 * Sections that use nested movement-library exercise prescriptions
 * (Exercise / Motiphysio). Measured-target sections are excluded.
 */
export function isExercisePrescriptionSection(
  section: CarePlanSectionKey | string | null | undefined,
): section is 'movement' | 'motiphysio' {
  return section === 'movement' || section === 'motiphysio';
}

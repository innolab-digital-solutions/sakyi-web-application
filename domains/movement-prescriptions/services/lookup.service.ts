import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  MovementExerciseLookup,
  MovementPrescriptionIntensityLookup,
  MovementPrescriptionProfileLookup,
} from '../types';

export async function getMovementExercisesLookup(): Promise<
  ApiResponse<MovementExerciseLookup[]>
> {
  return http.get<MovementExerciseLookup[]>(
    LOOKUP_ENDPOINTS.MOVEMENT_EXERCISES,
  );
}

export async function getMovementPrescriptionProfilesLookup(): Promise<
  ApiResponse<MovementPrescriptionProfileLookup[]>
> {
  return http.get<MovementPrescriptionProfileLookup[]>(
    LOOKUP_ENDPOINTS.MOVEMENT_PRESCRIPTION_PROFILES,
  );
}

export async function getMovementPrescriptionIntensitiesLookup(): Promise<
  ApiResponse<MovementPrescriptionIntensityLookup[]>
> {
  return http.get<MovementPrescriptionIntensityLookup[]>(
    LOOKUP_ENDPOINTS.MOVEMENT_PRESCRIPTION_INTENSITIES,
  );
}

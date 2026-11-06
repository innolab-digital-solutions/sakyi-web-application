import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  MovementExerciseCreateInput,
  MovementExerciseUpdateInput,
} from '../schemas';
import type { MovementExercise } from '../types';

export async function getMovementExerciseById(
  id: number,
): Promise<ApiResponse<MovementExercise>> {
  return http.get<MovementExercise>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.DETAIL(String(id)),
  );
}

export async function createMovementExercise(
  payload: MovementExerciseCreateInput,
): Promise<ApiResponse<MovementExercise>> {
  return http.post<MovementExercise>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.CREATE,
    payload,
    { throwOnError: false },
  );
}

export async function updateMovementExercise(
  id: number,
  payload: MovementExerciseUpdateInput,
): Promise<ApiResponse<MovementExercise>> {
  return http.patch<MovementExercise>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.DETAIL(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteMovementExercise(
  id: number,
): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.DETAIL(String(id)),
    { throwOnError: false },
  );
}

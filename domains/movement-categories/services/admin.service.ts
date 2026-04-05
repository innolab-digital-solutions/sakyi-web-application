import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  MovementCategoryCreateInput,
  MovementCategoryUpdateInput,
} from '../schemas';
import type { MovementCategory } from '../types';

/**
 * Fetches a single movement category for admin edit/detail views.
 */
export async function getMovementCategoryById(
  id: number,
): Promise<ApiResponse<MovementCategory>> {
  return http.get<MovementCategory>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.DETAIL(String(id)),
  );
}

export async function getMovementCategories(): Promise<
  ApiResponse<MovementCategory[]>
> {
  return http.get<MovementCategory[]>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST,
  );
}

export async function createMovementCategory(
  payload: MovementCategoryCreateInput,
): Promise<ApiResponse<MovementCategory>> {
  return http.post<MovementCategory>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.CREATE,
    payload,
    { throwOnError: false },
  );
}

export async function updateMovementCategory(
  id: number,
  payload: MovementCategoryUpdateInput,
): Promise<ApiResponse<MovementCategory>> {
  return http.patch<MovementCategory>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.DETAIL(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteMovementCategory(
  id: number,
): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.DETAIL(String(id)),
    { throwOnError: false },
  );
}

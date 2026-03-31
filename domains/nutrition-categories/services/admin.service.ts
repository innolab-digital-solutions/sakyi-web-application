import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  NutritionCategoryCreateInput,
  NutritionCategoryUpdateInput,
} from '../schemas';
import type { NutritionCategory } from '../types';

/**
 * Fetches a single nutrition category for admin edit/detail views.
 */
export async function getNutritionCategoryById(
  id: number,
): Promise<ApiResponse<NutritionCategory>> {
  return http.get<NutritionCategory>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.DETAIL(String(id)),
  );
}

export async function getNutritionCategories(): Promise<
  ApiResponse<NutritionCategory[]>
> {
  return http.get<NutritionCategory[]>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST,
  );
}

export async function createNutritionCategory(
  payload: NutritionCategoryCreateInput,
): Promise<ApiResponse<NutritionCategory>> {
  return http.post<NutritionCategory>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.CREATE,
    payload,
    { throwOnError: false },
  );
}

export async function updateNutritionCategory(
  id: number,
  payload: NutritionCategoryUpdateInput,
): Promise<ApiResponse<NutritionCategory>> {
  return http.patch<NutritionCategory>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.DETAIL(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteNutritionCategory(
  id: number,
): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.DETAIL(String(id)),
    { throwOnError: false },
  );
}

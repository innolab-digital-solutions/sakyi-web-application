import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  NutritionItemCreateInput,
  NutritionItemUpdateInput,
} from '../schemas';
import type { NutritionItem } from '../types';

/**
 * Fetches a single nutrition item for admin edit/detail views.
 */
export async function getNutritionItemById(
  id: number,
): Promise<ApiResponse<NutritionItem>> {
  return http.get<NutritionItem>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.DETAIL(String(id)),
  );
}

export async function getNutritionItems(): Promise<
  ApiResponse<NutritionItem[]>
> {
  return http.get<NutritionItem[]>(ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.LIST);
}

export async function createNutritionItem(
  payload: NutritionItemCreateInput,
): Promise<ApiResponse<NutritionItem>> {
  return http.post<NutritionItem>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.CREATE,
    payload,
    { throwOnError: false },
  );
}

export async function updateNutritionItem(
  id: number,
  payload: NutritionItemUpdateInput,
): Promise<ApiResponse<NutritionItem>> {
  return http.patch<NutritionItem>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.DETAIL(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteNutritionItem(
  id: number,
): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.DETAIL(String(id)),
    { throwOnError: false },
  );
}

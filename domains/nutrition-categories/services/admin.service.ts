import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';
import { fetchTablePage } from '@/lib/table/fetch';
import { normalizeTableResponse } from '@/lib/table/normalize';
import type { TableListPayload } from '@/lib/table/types';

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

/** React Query key for {@link getNutritionCategoriesForParentPicker} results. */
export const nutritionCategoryParentPickerQueryKey = [
  'nutrition-categories',
  'parent-picker',
] as const;

/**
 * Loads categories (one large page) for forms that need `parent` on each row.
 * Used to offer only **root** categories as parent options (no nested parents).
 */
export async function getNutritionCategoriesForParentPicker(): Promise<
  NutritionCategory[]
> {
  const response = await fetchTablePage<TableListPayload<NutritionCategory>>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST,
    { page: 1, per_page: 500 },
  );
  if (response.status !== 'success') return [];
  const { rows } = normalizeTableResponse(response);
  return rows;
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

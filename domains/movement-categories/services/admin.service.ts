import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';
import { fetchTablePage } from '@/lib/table/fetch';
import { normalizeTableResponse } from '@/lib/table/normalize';
import type { TableListPayload } from '@/lib/table/types';

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
    { throwOnError: false },
  );
}

export async function getMovementCategories(): Promise<
  ApiResponse<MovementCategory[]>
> {
  return http.get<MovementCategory[]>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST,
    { throwOnError: false },
  );
}

/** React Query key for {@link getMovementCategoriesForParentPicker} results. */
export const movementCategoryParentPickerQueryKey = [
  'movement-categories',
  'parent-picker',
] as const;

/**
 * Loads categories (one large page) for forms that need `parent` on each row.
 * Used to offer only **root** categories as parent options (no nested parents).
 */
export async function getMovementCategoriesForParentPicker(): Promise<
  MovementCategory[]
> {
  const response = await fetchTablePage<TableListPayload<MovementCategory>>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST,
    { page: 1, per_page: 500 },
  );
  if (response.status !== 'success') return [];
  const { rows } = normalizeTableResponse(response);
  return rows;
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

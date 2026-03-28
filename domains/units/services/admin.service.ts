import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { UnitCreateInput, UnitUpdateInput } from '../schemas';
import type { Unit } from '../types/admin';

/**
 * Fetches a single unit for admin edit/detail views.
 */
export async function getUnitById(id: number): Promise<ApiResponse<Unit>> {
  return http.get<Unit>(ENDPOINTS.ADMIN.MODULES.UNITS.DETAIL(String(id)));
}

export async function getUnits(): Promise<ApiResponse<Unit[]>> {
  return http.get<Unit[]>(ENDPOINTS.ADMIN.MODULES.UNITS.LIST);
}

export async function createUnit(
  payload: UnitCreateInput,
): Promise<ApiResponse<Unit>> {
  return http.post<Unit>(ENDPOINTS.ADMIN.MODULES.UNITS.CREATE, payload, {
    throwOnError: false,
  });
}

export async function updateUnit(
  id: number,
  payload: UnitUpdateInput,
): Promise<ApiResponse<Unit>> {
  return http.patch<Unit>(
    ENDPOINTS.ADMIN.MODULES.UNITS.DETAIL(String(id)),
    payload,
    {
      throwOnError: false,
    },
  );
}

export async function deleteUnit(id: number): Promise<ApiResponse<void>> {
  return http.delete<void>(ENDPOINTS.ADMIN.MODULES.UNITS.DETAIL(String(id)), {
    throwOnError: false,
  });
}

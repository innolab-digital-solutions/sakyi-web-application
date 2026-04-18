import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  MovementEquipmentCreateInput,
  MovementEquipmentUpdateInput,
} from '../schemas';
import type { MovementEquipment } from '../types';

/**
 * Fetches a single movement equipment item for admin edit/detail views.
 */
export async function getMovementEquipmentById(
  id: number,
): Promise<ApiResponse<MovementEquipment>> {
  return http.get<MovementEquipment>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.DETAIL(String(id)),
    { throwOnError: false },
  );
}

export async function getMovementEquipment(): Promise<
  ApiResponse<MovementEquipment[]>
> {
  return http.get<MovementEquipment[]>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST,
    { throwOnError: false },
  );
}

export async function createMovementEquipment(
  payload: MovementEquipmentCreateInput,
): Promise<ApiResponse<MovementEquipment>> {
  return http.post<MovementEquipment>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.CREATE,
    payload,
    { throwOnError: false },
  );
}

export async function updateMovementEquipment(
  id: number,
  payload: MovementEquipmentUpdateInput,
): Promise<ApiResponse<MovementEquipment>> {
  return http.patch<MovementEquipment>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.DETAIL(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteMovementEquipment(
  id: number,
): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.DETAIL(String(id)),
    { throwOnError: false },
  );
}

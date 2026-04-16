import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

export type MovementEquipmentLookup = {
  id: number;
  name: string;
};

export async function getMovementEquipmentLookup(): Promise<
  ApiResponse<MovementEquipmentLookup[]>
> {
  return http.get<MovementEquipmentLookup[]>(
    LOOKUP_ENDPOINTS.MOVEMENT_EQUIPMENT,
  );
}

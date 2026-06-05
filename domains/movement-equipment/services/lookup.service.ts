import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

export type MovementEquipmentLookup = {
  id: number;
  name: string;
  equipment_type: string | null;
  training_section: string | null;
};

/**
 * Fetches a minimal list of movement equipment for use in dropdowns and comboboxes.
 */
export async function getMovementEquipmentLookup(): Promise<
  ApiResponse<MovementEquipmentLookup[]>
> {
  return http.get<MovementEquipmentLookup[]>(
    LOOKUP_ENDPOINTS.MOVEMENT_EQUIPMENT,
  );
}

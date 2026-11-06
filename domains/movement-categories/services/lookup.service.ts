import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

export type MovementCategoryLookup = {
  id: number;
  name: string;
};

/**
 * Fetches a minimal list of movement categories for use in dropdowns and comboboxes.
 */
export async function getMovementCategoriesLookup(): Promise<
  ApiResponse<MovementCategoryLookup[]>
> {
  return http.get<MovementCategoryLookup[]>(
    LOOKUP_ENDPOINTS.MOVEMENT_CATEGORIES,
  );
}

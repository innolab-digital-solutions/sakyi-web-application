import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

/**
 * Lightweight nutrition library item shape returned by the lookup endpoint.
 *
 * Used to populate the multi-select of selectable nutrition items when linking
 * library items to a care plan nutrition task. `category` and `default_unit`
 * are nullable because they are optional on the underlying library item.
 */
export type NutritionItemLookup = {
  id: number;
  name: string;
  description: string | null;
  category: {
    id: number;
    name: string;
  } | null;
  default_unit: {
    id: number;
    name: string;
    abbreviation: string;
    type: string | null;
  } | null;
};

/**
 * Fetches the active nutrition library items for the care plan picker.
 *
 * Returns only active items, ordered by name ascending. The `id` of each entry
 * is what must be sent back as `nutrition_item_id` when saving links.
 */
export async function getNutritionItemsLookup(): Promise<
  ApiResponse<NutritionItemLookup[]>
> {
  return http.get<NutritionItemLookup[]>(LOOKUP_ENDPOINTS.NUTRITION_ITEMS);
}

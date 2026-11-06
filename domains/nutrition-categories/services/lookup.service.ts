import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

export type NutritionCategoryLookup = {
  id: number;
  name: string;
  slug: string;
};

export async function getNutritionCategoriesLookup(): Promise<
  ApiResponse<NutritionCategoryLookup[]>
> {
  return http.get<NutritionCategoryLookup[]>(
    LOOKUP_ENDPOINTS.NUTRITION_CATEGORIES,
  );
}

import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

export type BlogCategoryLookup = {
  id: number;
  name: string;
  slug: string;
};

export async function getBlogCategoriesLookup(): Promise<
  ApiResponse<BlogCategoryLookup[]>
> {
  return http.get<BlogCategoryLookup[]>(LOOKUP_ENDPOINTS.BLOG_CATEGORIES);
}

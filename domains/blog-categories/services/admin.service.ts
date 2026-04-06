import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  BlogCategoryCreateInput,
  BlogCategoryUpdateInput,
} from '../schemas';
import type { BlogCategory } from '../types';

/**
 * Fetches a single blog category for admin edit/detail views.
 */
export async function getBlogCategoryById(
  id: number,
): Promise<ApiResponse<BlogCategory>> {
  return http.get<BlogCategory>(
    ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.DETAIL(String(id)),
  );
}

export async function getBlogCategories(): Promise<
  ApiResponse<BlogCategory[]>
> {
  return http.get<BlogCategory[]>(ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.LIST);
}

export async function createBlogCategory(
  payload: BlogCategoryCreateInput,
): Promise<ApiResponse<BlogCategory>> {
  return http.post<BlogCategory>(
    ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.CREATE,
    payload,
    { throwOnError: false },
  );
}

export async function updateBlogCategory(
  id: number,
  payload: BlogCategoryUpdateInput,
): Promise<ApiResponse<BlogCategory>> {
  return http.patch<BlogCategory>(
    ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.DETAIL(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteBlogCategory(
  id: number,
): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.DETAIL(String(id)),
    { throwOnError: false },
  );
}

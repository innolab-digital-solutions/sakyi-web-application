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
 *
 * Pass `locale` to match list/detail localized fields (`en` | `my`); omit for API default (English).
 */
export async function getBlogCategoryById(
  id: number,
  options?: { locale?: 'en' | 'my' },
): Promise<ApiResponse<BlogCategory>> {
  const qs =
    options?.locale != null
      ? `?locale=${encodeURIComponent(options.locale)}`
      : '';
  return http.get<BlogCategory>(
    `${ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.DETAIL(String(id))}${qs}`,
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

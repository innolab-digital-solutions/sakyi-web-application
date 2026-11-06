import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { BlogPostCreateInput, BlogPostUpdateInput } from '../schemas';
import type { AdminBlogPost } from '../types';

/**
 * Fetches a single blog post for admin edit/detail.
 * Pass `locale` for localized `title`, `slug`, `excerpt`, and `content` (`en` | `my`).
 */
export async function getAdminBlogPostById(
  id: number,
  options?: { locale?: 'en' | 'my' },
): Promise<ApiResponse<AdminBlogPost>> {
  const qs =
    options?.locale != null
      ? `?locale=${encodeURIComponent(options.locale)}`
      : '';
  return http.get<AdminBlogPost>(
    `${ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(String(id))}${qs}`,
  );
}

export async function getAdminBlogPosts(): Promise<
  ApiResponse<AdminBlogPost[]>
> {
  return http.get<AdminBlogPost[]>(ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.LIST);
}

export async function createBlogPost(
  payload: BlogPostCreateInput,
): Promise<ApiResponse<AdminBlogPost>> {
  return http.post<AdminBlogPost>(
    ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.CREATE,
    payload,
    { throwOnError: false },
  );
}

export async function updateBlogPost(
  id: number,
  payload: BlogPostUpdateInput,
): Promise<ApiResponse<AdminBlogPost>> {
  return http.patch<AdminBlogPost>(
    ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteBlogPost(id: number): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(String(id)),
    { throwOnError: false },
  );
}

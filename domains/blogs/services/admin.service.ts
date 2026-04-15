import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { BlogPostCreateInput, BlogPostUpdateInput } from '../schemas';
import type { AdminBlogPost } from '../types';

export async function getAdminBlogPostById(
  id: number,
): Promise<ApiResponse<AdminBlogPost>> {
  return http.get<AdminBlogPost>(
    ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(String(id)),
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

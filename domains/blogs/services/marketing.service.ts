import { ENDPOINTS } from '@/config/api/endpoints';
import type { SupportedLanguage } from '@/config/languages';
import { http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

import type { BlogCategory, BlogPost } from '../types/marketing';

export const getBlogPosts = async (
  language: SupportedLanguage,
  page: number = 1,
  category?: string,
): Promise<ApiResponse<BlogPost[]>> => {
  const params = new URLSearchParams({
    locale: language,
    paginate: 'true',
    page: page.toString(),
    ...(category ? { category } : {}),
  });

  return http.get<BlogPost[]>(
    ENDPOINTS.MARKETING.BLOGS.LIST + `?${params.toString()}`,
  );
};

export const getBlogCategories = async (
  language: SupportedLanguage,
): Promise<ApiResponse<BlogCategory[]>> => {
  return http.get<BlogCategory[]>(
    ENDPOINTS.MARKETING.BLOGS.CATEGORIES + `?locale=${language}`,
  );
};

export const getBlogPostBySlug = async (
  slug: string,
  language: SupportedLanguage,
): Promise<ApiResponse<BlogPost>> => {
  return http.get<BlogPost>(
    ENDPOINTS.MARKETING.BLOGS.DETAIL(slug) + `?locale=${language}`,
  );
};

import { ENDPOINTS } from '@/config/api/endpoints';
import type { SupportedLanguage } from '@/config/languages';
import { ApiResponse, http } from '@/lib/api/client';

import type { BlogPost } from '../types';

export const getBlogPosts = async (
  language: SupportedLanguage,
  page: number = 1,
  category?: string,
): Promise<ApiResponse<BlogPost[]>> => {
  const params = new URLSearchParams({
    locale: language,
    page: page.toString(),
    ...(category ? { category } : {}),
  });

  return http.get<BlogPost[]>(
    ENDPOINTS.MARKETING.BLOGS + `?${params.toString()}`,
  );
};

export const getBlogPostBySlug = async (
  slug: string,
  language: SupportedLanguage,
): Promise<ApiResponse<BlogPost>> => {
  return http.get<BlogPost>(
    ENDPOINTS.MARKETING.BLOGS + `/${slug}?locale=${language}`,
  );
};

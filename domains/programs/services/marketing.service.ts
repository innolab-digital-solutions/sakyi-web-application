import { ENDPOINTS } from '@/config/api/endpoints';
import type { SupportedLanguage } from '@/config/languages';
import { ApiResponse, http } from '@/lib/api/client';

import type { Program } from '../types';

export const getPrograms = async (
  language: SupportedLanguage,
  limit: number,
): Promise<ApiResponse<Program[]>> => {
  return http.get<Program[]>(
    ENDPOINTS.MARKETING.PROGRAMS + `?limit=${limit}&locale=${language}`,
  );
};

export const getProgramBySlug = async (
  slug: string,
  language: SupportedLanguage,
): Promise<ApiResponse<Program>> => {
  return http.get<Program>(
    ENDPOINTS.MARKETING.PROGRAMS + `/${slug}?locale=${language}`,
  );
};

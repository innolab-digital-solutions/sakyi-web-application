import { ENDPOINTS } from '@/config/api/endpoints';
import type { SupportedLanguage } from '@/config/languages';
import { type ApiResponse,http } from '@/lib/api/client';

import {
  mapMarketingProgramListResponse,
  mapMarketingProgramResponse,
} from '../transformers';
import type { Program } from '../types/marketing';

export const getPrograms = async (
  language: SupportedLanguage,
  limit: number,
): Promise<ApiResponse<Program[]>> => {
  const response = await http.get<unknown>(
    ENDPOINTS.MARKETING.PROGRAMS + `?limit=${limit}&locale=${language}`,
  );

  if (response.status !== 'success') {
    return response as ApiResponse<Program[]>;
  }

  return {
    ...response,
    data: mapMarketingProgramListResponse(response.data),
  };
};

export const getProgramBySlug = async (
  slug: string,
  language: SupportedLanguage,
): Promise<ApiResponse<Program>> => {
  const response = await http.get<unknown>(
    ENDPOINTS.MARKETING.PROGRAMS + `/${slug}?locale=${language}`,
  );

  if (response.status !== 'success') {
    return response as ApiResponse<Program>;
  }

  return {
    ...response,
    data: mapMarketingProgramResponse(response.data),
  };
};

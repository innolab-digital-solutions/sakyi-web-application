import { ENDPOINTS } from '@/config/api/endpoints';
import { ApiResponse, http } from '@/lib/api/client';

import type { Program } from '../types';

export const getPrograms = async (): Promise<ApiResponse<Program[]>> => {
  return http.get<Program[]>(ENDPOINTS.MARKETING.PROGRAMS);
};

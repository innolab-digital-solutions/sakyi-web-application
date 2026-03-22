import { ENDPOINTS } from '@/config/api/endpoints';
import type { User, UserResponse } from '@/domains/user/types';
import { http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

export const authService = {
  me: async (): Promise<UserResponse> => {
    return http.get<User>(ENDPOINTS.ADMIN.AUTH.ME, { throwOnError: false });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return http.post<void>(ENDPOINTS.ADMIN.AUTH.LOGOUT, undefined, {
      throwOnError: false,
    });
  },
};

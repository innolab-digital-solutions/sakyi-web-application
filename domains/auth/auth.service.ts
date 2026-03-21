import { ENDPOINTS } from '@/config/api/endpoints';
import type { User, UserResponse } from '@/domains/user/types';
import { http } from '@/lib/api/client';

export const authService = {
  me: async (): Promise<UserResponse> => {
    return http.get<User>(ENDPOINTS.ADMIN.AUTH.ME, { throwOnError: false });
  },

  logout: async (): Promise<void> => {
    await http.post<void>(ENDPOINTS.ADMIN.AUTH.LOGOUT, undefined, {
      throwOnError: false,
    });
  },
};

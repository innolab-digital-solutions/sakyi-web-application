import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';
import type { User } from '@/domains/user/types';

import type { UserCreateInput, UserUpdateInput } from '../schemas';

export async function getAdminUserById(id: number): Promise<ApiResponse<User>> {
  return http.get<User>(ENDPOINTS.ADMIN.MODULES.USERS.DETAIL(String(id)));
}

export async function createUser(
  payload: UserCreateInput,
): Promise<ApiResponse<User>> {
  return http.post<User>(ENDPOINTS.ADMIN.MODULES.USERS.CREATE, payload, {
    throwOnError: false,
  });
}

export async function updateUser(
  id: number,
  payload: UserUpdateInput,
): Promise<ApiResponse<User>> {
  return http.patch<User>(
    ENDPOINTS.ADMIN.MODULES.USERS.UPDATE(String(id)),
    payload,
    { throwOnError: false },
  );
}

export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  return http.delete<void>(ENDPOINTS.ADMIN.MODULES.USERS.DELETE(String(id)), {
    throwOnError: false,
  });
}

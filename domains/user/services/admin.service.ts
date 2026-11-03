import { ENDPOINTS } from '@/config/api/endpoints';
import type { User } from '@/domains/user/types';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

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

/**
 * Soft-deletes a user account (`DELETE /users/{id}`).
 * Linked enrollments / care history are kept; the account can be restored.
 */
export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  return http.delete<void>(ENDPOINTS.ADMIN.MODULES.USERS.DELETE(String(id)), {
    throwOnError: false,
  });
}

/**
 * Restores a soft-deleted user (`POST /users/{id}/restore`).
 */
export async function restoreUser(id: number): Promise<ApiResponse<User>> {
  return http.post<User>(
    ENDPOINTS.ADMIN.MODULES.USERS.RESTORE(String(id)),
    {},
    { throwOnError: false },
  );
}

/**
 * Permanently deletes a soft-deleted user (`DELETE /users/{id}/force`).
 * Related enrollments, care plans, and other linked records are removed too.
 */
export async function forceDeleteUser(id: number): Promise<ApiResponse<void>> {
  return http.delete<void>(
    ENDPOINTS.ADMIN.MODULES.USERS.FORCE_DELETE(String(id)),
    { throwOnError: false },
  );
}

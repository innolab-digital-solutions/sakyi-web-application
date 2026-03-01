import ENDPOINTS from '@/config/endpoints';
import { http } from '@/lib/api/client';
import type { User } from '@/types/admin/user';
import type { ApiResponse } from '@/types/api';

/**
 * Application-layer auth use cases. Uses the HTTP client and endpoint config
 * so that presentation (AuthContext) does not depend on infrastructure directly.
 */

/**
 * Verifies the current session against the admin auth ME endpoint.
 *
 * @returns The API response with user data on success or error payload on failure.
 */
export async function checkSession(): Promise<ApiResponse<User>> {
  return http.get<User>(ENDPOINTS.ADMIN.AUTH.ME, { throwOnError: false });
}

/**
 * Logs out the current user via the admin logout endpoint.
 *
 * Caller is responsible for clearing local state and redirecting (e.g. in AuthContext).
 */
export async function logout(): Promise<void> {
  await http.post<unknown>(ENDPOINTS.ADMIN.AUTH.LOGOUT, undefined, {
    throwOnError: false,
  });
}

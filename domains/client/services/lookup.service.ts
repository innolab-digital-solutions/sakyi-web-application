import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { Client } from '../types/lookup';

/**
 * Loads the admin client directory used for pickers (e.g. onboarding intake `user_id`).
 *
 * @returns API envelope with {@link Client} rows from `GET /lookup/clients`.
 */
export async function getLookupClients(): Promise<ApiResponse<Client[]>> {
  return http.get<Client[]>(ENDPOINTS.LOOKUP.CLIENTS);
}

import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { ClientProfile } from '../types/admin';

export async function getClientProfileById(
  id: number,
): Promise<ApiResponse<ClientProfile>> {
  return http.get<ClientProfile>(
    ENDPOINTS.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(String(id)),
  );
}

export type UploadClientProfileMediaPayload = {
  files: File[];
};

export async function uploadClientProfileMedia(
  id: number,
  payload: UploadClientProfileMediaPayload,
): Promise<ApiResponse<ClientProfile>> {
  const body = new FormData();
  for (const file of payload.files) {
    body.append('files[]', file);
  }

  return http.post<ClientProfile>(
    ENDPOINTS.ADMIN.MODULES.CLIENT_PROFILES.MEDIA_UPLOAD(String(id)),
    body,
  );
}

import { ENDPOINTS } from '@/config/api/endpoints';
import type { BackendNotification } from '@/domains/notifications/types';
import { client, http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

type NotificationListEnvelope = {
  data?: BackendNotification[];
};

type NotificationListResponse =
  | BackendNotification[]
  | NotificationListEnvelope;

/**
 * Notification resource calls for the admin dashboard.
 */
export const adminNotificationService = {
  list: async (): Promise<ApiResponse<NotificationListResponse>> => {
    const params = new URLSearchParams({ per_page: '20' });
    return http.get<NotificationListResponse>(
      `${ENDPOINTS.ADMIN.MODULES.NOTIFICATIONS.LIST}?${params.toString()}`,
      { throwOnError: false },
    );
  },

  markAsRead: async (id: string): Promise<ApiResponse<unknown>> => {
    return http.patch<unknown>(
      ENDPOINTS.ADMIN.MODULES.NOTIFICATIONS.MARK_AS_READ(id),
      undefined,
      { throwOnError: false },
    );
  },

  markAllAsRead: async (): Promise<ApiResponse<unknown>> => {
    return http.patch<unknown>(
      ENDPOINTS.ADMIN.MODULES.NOTIFICATIONS.MARK_ALL_AS_READ,
      undefined,
      { throwOnError: false },
    );
  },

  deleteSelected: async (
    notificationIds: string[],
  ): Promise<ApiResponse<unknown>> => {
    return client<unknown>(
      ENDPOINTS.ADMIN.MODULES.NOTIFICATIONS.DELETE_SELECTED,
      {
        method: 'DELETE',
        body: {
          notification_ids: notificationIds,
        },
        throwOnError: false,
      },
    );
  },
};

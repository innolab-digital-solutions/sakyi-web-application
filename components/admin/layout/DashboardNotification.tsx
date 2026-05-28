'use client';

import { Bell } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { NotificationsDrawer } from '@/components/admin/layout/notifications/NotificationsDrawer';
import type {
  Notification,
  NotificationCategory,
} from '@/components/admin/layout/notifications/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { adminNotificationService } from '@/domains/notifications/services/admin.service';
import type { BackendNotification } from '@/domains/notifications/types';
import { createEchoClient } from '@/lib/realtime/echo';

const NOTIFICATION_CATEGORY_MAP: Record<string, NotificationCategory> = {
  'enrollment.request.submitted': 'enrollment',
  'enrollment.request.updated': 'enrollment',
  'client.created': 'client',
  'program.updated': 'program',
  'doctor.instruction.created': 'doctor-instruction',
  'onboarding.intake.submitted': 'intake',
  'admin.care_plan.operational_log.missing': 'system',
  'admin.care_plan.report.publish_overdue': 'system',
  'admin.care_plan.report.in_review_stale': 'system',
  'admin.care_plan.client_logging_streak': 'system',
  system: 'system',
  reminder: 'reminder',
};

const SYSTEM_NOTIFICATION_IMAGE = '/images/logo-3d.png';
const SYSTEM_NOTIFICATION_TYPES = new Set<string>([
  'admin.care_plan.operational_log.missing',
  'admin.care_plan.report.publish_overdue',
  'admin.care_plan.report.in_review_stale',
  'admin.care_plan.client_logging_streak',
]);

/**
 * Safely resolves sender picture URL from notification meta payload.
 */
const extractNotificationPictureUrl = (
  meta: Record<string, unknown> | undefined,
): string | null => {
  if (!meta) return null;

  const direct = meta.picture_url;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const client = meta.client;
  if (
    client &&
    typeof client === 'object' &&
    'picture_url' in client &&
    typeof client.picture_url === 'string' &&
    client.picture_url.trim()
  ) {
    return client.picture_url.trim();
  }

  const user = meta.user;
  if (
    user &&
    typeof user === 'object' &&
    'picture_url' in user &&
    typeof user.picture_url === 'string' &&
    user.picture_url.trim()
  ) {
    return user.picture_url.trim();
  }

  return null;
};

/**
 * Safely resolves client name from notification meta payload.
 */
const extractNotificationClientName = (
  meta: Record<string, unknown> | undefined,
): string | null => {
  if (!meta) return null;

  const direct = meta.client_name;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const client = meta.client;
  if (
    client &&
    typeof client === 'object' &&
    'name' in client &&
    typeof client.name === 'string' &&
    client.name.trim()
  ) {
    return client.name.trim();
  }

  return null;
};

const normalizeNotification = (
  notification: BackendNotification,
): Notification => {
  const normalizedType = notification.data?.type ?? 'default';
  const category = NOTIFICATION_CATEGORY_MAP[normalizedType] ?? 'default';
  const clientName = extractNotificationClientName(notification.data?.meta);
  const pictureUrl = SYSTEM_NOTIFICATION_TYPES.has(normalizedType)
    ? SYSTEM_NOTIFICATION_IMAGE
    : extractNotificationPictureUrl(notification.data?.meta);

  return {
    id: notification.id,
    category,
    type: normalizedType,
    title: notification.data?.title ?? 'Notification',
    message: notification.data?.message ?? 'You have a new update.',
    createdAt: new Date(notification.created_at),
    read: notification.read_at !== null,
    href: notification.data?.action_url,
    pictureUrl,
    clientName,
  };
};

/**
 * Reverb payloads can vary by backend/framework version.
 * Normalize to the API notification shape used by the drawer.
 */
const normalizeRealtimePayload = (
  incoming: unknown,
): BackendNotification | null => {
  if (!incoming || typeof incoming !== 'object') return null;

  const raw = incoming as Record<string, unknown>;
  const nested =
    raw.notification && typeof raw.notification === 'object'
      ? (raw.notification as Record<string, unknown>)
      : raw;

  const id = nested.id;
  if (typeof id !== 'string' || !id.trim()) return null;

  const rawData =
    nested.data && typeof nested.data === 'object'
      ? (nested.data as Record<string, unknown>)
      : null;
  const fallbackData = {
    type:
      typeof nested.type === 'string' && nested.type.trim()
        ? nested.type.trim()
        : undefined,
    title:
      typeof nested.title === 'string' && nested.title.trim()
        ? nested.title.trim()
        : undefined,
    message:
      typeof nested.message === 'string' && nested.message.trim()
        ? nested.message.trim()
        : undefined,
    action_url:
      typeof nested.action_url === 'string' && nested.action_url.trim()
        ? nested.action_url.trim()
        : undefined,
    meta:
      nested.meta && typeof nested.meta === 'object'
        ? (nested.meta as Record<string, unknown>)
        : undefined,
  };

  const data = rawData ?? fallbackData;
  const createdAt =
    typeof nested.created_at === 'string' && nested.created_at.trim()
      ? nested.created_at
      : new Date().toISOString();
  const readAt =
    typeof nested.read_at === 'string' && nested.read_at.trim()
      ? nested.read_at
      : null;
  const type =
    typeof nested.type === 'string' && nested.type.trim()
      ? nested.type
      : 'BroadcastNotificationCreated';

  return {
    id,
    type,
    created_at: createdAt,
    read_at: readAt,
    data,
  };
};

const extractNotifications = (
  payload: BackendNotification[] | { data?: BackendNotification[] },
) => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
};

const DashboardNotification = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSelectMode, setNotificationSelectMode] = useState(false);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<
    string[]
  >([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, hasInitialized } = useAuth();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    const response = await adminNotificationService.list();
    if (response.status === 'error') {
      setIsLoading(false);
      return;
    }

    const list = extractNotifications(response.data).map(normalizeNotification);
    setNotifications(list);
    setSelectedNotificationIds((current) =>
      current.filter((id) => list.some((n) => n.id === id)),
    );
    setIsLoading(false);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    await adminNotificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
    await adminNotificationService.markAllAsRead();
  }, []);

  const updateSelected = useCallback((id: string, selected: boolean) => {
    setSelectedNotificationIds((current) => {
      if (selected) {
        if (current.includes(id)) return current;
        return [...current, id];
      }
      return current.filter((value) => value !== id);
    });
  }, []);

  const deleteSelected = useCallback(async () => {
    if (selectedNotificationIds.length === 0) return;

    setIsDeletingSelected(true);
    const idsToDelete = [...selectedNotificationIds];
    const previous = notifications;

    setNotifications((current) =>
      current.filter((notification) => !idsToDelete.includes(notification.id)),
    );
    setSelectedNotificationIds([]);

    const response = await adminNotificationService.deleteSelected(idsToDelete);
    if (response.status === 'error') {
      setNotifications(previous);
      setSelectedNotificationIds(idsToDelete);
      toast.error(
        response.message || 'Failed to delete selected notifications.',
      );
    } else {
      setNotificationSelectMode(false);
      toast.success('Selected notifications have been deleted.');
    }
    setIsDeletingSelected(false);
  }, [notifications, selectedNotificationIds]);

  const handleSelectModeChange = useCallback((enabled: boolean) => {
    setNotificationSelectMode(enabled);
    if (!enabled) {
      setSelectedNotificationIds([]);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized || !user?.id) return;
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasInitialized, loadNotifications, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const shouldDebug = process.env.NEXT_PUBLIC_REVERB_DEBUG === 'true';
    let isCancelled = false;
    let cleanup: (() => void) | undefined;

    const bootstrapEcho = async () => {
      const echo = await createEchoClient();
      if (isCancelled) {
        echo.disconnect();
        return;
      }

      const channelName = `App.Models.User.${user.id}`;
      const channel = echo.private(channelName);
      const connector = (
        echo as unknown as { connector?: { pusher?: unknown } }
      ).connector;
      const pusher = connector?.pusher as
        | {
            connection?: {
              bind: (
                event: string,
                callback: (...args: unknown[]) => void,
              ) => void;
              unbind: (
                event: string,
                callback: (...args: unknown[]) => void,
              ) => void;
            };
          }
        | undefined;

      const handleConnected = () => {
        if (shouldDebug) console.info('[notifications] Reverb connected');
        void loadNotifications();
      };
      const handleDisconnected = () => {
        if (shouldDebug) console.warn('[notifications] Reverb disconnected');
      };
      const handleStateChange = (states: unknown) => {
        if (shouldDebug) console.info('[notifications] Reverb state', states);
      };
      const handleConnectionError = (error: unknown) => {
        console.warn('[notifications] Reverb connection error', error);
      };

      channel.notification((incoming: unknown) => {
        if (shouldDebug) {
          console.info(
            '[notifications] Realtime notification received',
            incoming,
          );
        }

        const normalizedRealtimeNotification = normalizeRealtimePayload(incoming);
        if (!normalizedRealtimeNotification) {
          if (shouldDebug) {
            console.warn(
              '[notifications] Ignored malformed realtime payload',
              incoming,
            );
          }
          void loadNotifications();
          return;
        }

        setNotifications((current) => {
          const mapped = normalizeNotification(normalizedRealtimeNotification);
          const next = [
            mapped,
            ...current.filter((item) => item.id !== mapped.id),
          ];
          return next;
        });
      });

      channel.subscribed(() => {
        if (shouldDebug) {
          console.info(
            `[notifications] Subscribed to private channel ${channelName}`,
          );
        }
      });

      channel.error((error: unknown) => {
        console.error(
          '[notifications] Private channel subscription error',
          error,
        );
      });

      pusher?.connection?.bind('connected', handleConnected);
      pusher?.connection?.bind('disconnected', handleDisconnected);
      pusher?.connection?.bind('state_change', handleStateChange);
      pusher?.connection?.bind('error', handleConnectionError);

      cleanup = () => {
        pusher?.connection?.unbind('connected', handleConnected);
        pusher?.connection?.unbind('disconnected', handleDisconnected);
        pusher?.connection?.unbind('state_change', handleStateChange);
        pusher?.connection?.unbind('error', handleConnectionError);
        echo.leave(`private-${channelName}`);
        echo.disconnect();
      };
    };

    void bootstrapEcho();

    return () => {
      isCancelled = true;
      cleanup?.();
    };
  }, [loadNotifications, user?.id]);

  useEffect(() => {
    const handleFocus = () => {
      void loadNotifications();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadNotifications]);

  return (
    <div>
      <Button
        variant='ghost'
        size='icon'
        className='hover:text-foreground relative cursor-pointer rounded-full bg-gray-100 hover:bg-gray-50'
        onClick={() => {
          void loadNotifications();
          setNotificationsOpen(true);
        }}
        aria-label='Open notifications'
      >
        <Bell className='h-5 w-5' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0c96c4] text-[8px] font-bold text-white'>
            {unreadCount}
          </span>
        )}
      </Button>

      <NotificationsDrawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        selectMode={notificationSelectMode}
        onSelectModeChange={handleSelectModeChange}
        selectedIds={selectedNotificationIds}
        onSelectChange={updateSelected}
        onDeleteSelected={deleteSelected}
        isDeletingSelected={isDeletingSelected}
      />
    </div>
  );
};

export default DashboardNotification;

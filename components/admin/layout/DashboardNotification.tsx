'use client';

import { Bell } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  system: 'system',
  reminder: 'reminder',
};

const normalizeNotification = (
  notification: BackendNotification,
): Notification => {
  const category =
    NOTIFICATION_CATEGORY_MAP[notification.data?.type ?? ''] ?? 'default';

  return {
    id: notification.id,
    category,
    title: notification.data?.title ?? 'Notification',
    message: notification.data?.message ?? 'You have a new update.',
    createdAt: new Date(notification.created_at),
    read: notification.read_at !== null,
    href: notification.data?.action_url,
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
        console.error('[notifications] Reverb connection error', error);
      };

      channel.notification((incoming: BackendNotification) => {
        if (shouldDebug) {
          console.info(
            '[notifications] Realtime notification received',
            incoming,
          );
        }
        setNotifications((current) => {
          const mapped = normalizeNotification(incoming);
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
        onClick={() => setNotificationsOpen(true)}
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
      />
    </div>
  );
};

export default DashboardNotification;

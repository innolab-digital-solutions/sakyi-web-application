'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCard } from './NotificationCard';
import { MOCK_NOTIFICATIONS } from './mock-notifications';
import { NOTIFICATION_TAB_FILTERS, type NotificationTabFilter } from './types';

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Drawer panel that slides in from the right with notification cards.
 * Tabs filter by type: All, System, Activity.
 * Styled to align with the health and wellness admin dashboard.
 */
export function NotificationsDrawer({
  open,
  onOpenChange,
}: NotificationsDrawerProps) {
  const [activeTab, setActiveTab] = useState<NotificationTabFilter>('all');

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return MOCK_NOTIFICATIONS;
    if (activeTab === 'system')
      return MOCK_NOTIFICATIONS.filter((n) => n.type === 'system');
    return MOCK_NOTIFICATIONS.filter((n) => n.type !== 'system');
  }, [activeTab]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="border-border/80 bg-background flex w-full flex-col border-l p-0 sm:max-w-md"
        showCloseButton={true}
      >
        <SheetHeader className="border-border/80 bg-muted/30 border-b px-5 py-4">
          <div className="flex items-center justify-between gap-3 pr-8">
            <SheetTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#0c96c4]/10 text-[#0c96c4]">
                <Bell className="size-5" />
              </span>
              Notifications
              {unreadCount > 0 && (
                <span className="text-primary-foreground rounded-full bg-[#0c96c4] px-2 py-0.5 text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground shrink-0 gap-1.5 text-xs"
              >
                <CheckCheck className="size-3.5" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Tabs: All, System, Activity */}
          <div
            className="border-border/80 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-5 -mb-px flex gap-0.5 overflow-x-auto border-b px-4 pb-0"
            role="tablist"
            aria-label="Notification type"
          >
            {NOTIFICATION_TAB_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={activeTab === value}
                onClick={() => setActiveTab(value)}
                className={cn(
                  'text-muted-foreground hover:text-foreground shrink-0 border-b-2 border-transparent px-3 py-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#0c96c4]/30 focus-visible:ring-offset-1 focus-visible:outline-none',
                  activeTab === value &&
                    'border-[#0c96c4] text-[#0c96c4] hover:text-[#0c96c4]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2 p-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center text-sm">
                <Bell className="text-muted-foreground/50 mb-3 size-10" />
                <p className="font-medium">
                  {activeTab === 'all'
                    ? 'No notifications yet'
                    : `No ${activeTab} notifications`}
                </p>
                <p className="mt-1 text-xs">
                  {activeTab === 'all'
                    ? 'Updates about enrollments, clients, and programs will appear here.'
                    : 'Try switching to another tab.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

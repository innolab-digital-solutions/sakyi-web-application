'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { NotificationCard } from './NotificationCard';
import type { Notification } from './types';

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

/**
 * Drawer panel that slides in from the right with live notifications.
 */
export function NotificationsDrawer({
  open,
  onOpenChange,
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsDrawerProps) {
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='border-border/80 bg-background flex w-full flex-col border-l p-0 sm:max-w-md'
        showCloseButton={true}
      >
        <SheetHeader className='border-border/80 bg-muted/30 border-b px-5 py-4'>
          <div className='flex items-center justify-between gap-3 pr-8'>
            <SheetTitle className='text-foreground flex items-center gap-2 text-lg font-semibold'>
              <span className='flex size-9 items-center justify-center rounded-lg bg-[#0c96c4]/10 text-[#0c96c4]'>
                <Bell className='size-5' />
              </span>
              Notifications
              {unreadCount > 0 && (
                <span className='text-primary-foreground rounded-full bg-[#0c96c4] px-2 py-0.5 text-xs font-medium'>
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                className='text-muted-foreground hover:text-foreground shrink-0 gap-1.5 text-xs'
                onClick={onMarkAllAsRead}
              >
                <CheckCheck className='size-3.5' />
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-2 p-4'>
            {isLoading ? (
              <div className='text-muted-foreground py-12 text-center text-sm'>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-12 text-center text-sm'>
                <Bell className='text-muted-foreground/50 mb-3 size-10' />
                <p className='font-medium'>No notifications yet</p>
                <p className='mt-1 text-xs'>
                  Updates about enrollments, clients, and programs will appear
                  here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onOpen={(item) => {
                    if (!item.read) onMarkAsRead(item.id);
                    onOpenChange(false);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

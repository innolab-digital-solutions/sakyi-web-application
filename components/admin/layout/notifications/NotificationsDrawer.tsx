'use client';

import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/styles';

import { NotificationCard } from './NotificationCard';
import type { Notification } from './types';

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  selectMode: boolean;
  onSelectModeChange: (enabled: boolean) => void;
  selectedIds: string[];
  onSelectChange: (notificationId: string, selected: boolean) => void;
  onDeleteSelected: () => void;
  isDeletingSelected: boolean;
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
  selectMode,
  onSelectModeChange,
  selectedIds,
  onSelectChange,
  onDeleteSelected,
  isDeletingSelected,
}: NotificationsDrawerProps) {
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );
  const orderedNotifications = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      }),
    [notifications],
  );
  const selectedCount = selectedIds.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='border-border/80 bg-white flex w-full flex-col gap-0 border-l p-0 sm:max-w-md'
      >
        <SheetHeader className='border-border/80 bg-background border-b px-5 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <span className='bg-primary relative flex size-8 shrink-0 items-center justify-center rounded-md text-white'>
                <Bell className='size-4' />
                {unreadCount > 0 && (
                  <span className='bg-primary-foreground text-primary absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold shadow-sm border border-primary-foreground'>
                    {unreadCount}
                  </span>
                )}
              </span>
              <div className='min-w-0 space-y-1'>
                <SheetTitle className='text-foreground/90 text-[15.5px] font-bold capitalize'>
                  Notifications
                </SheetTitle>
                {/* <SheetDescription className='text-muted-foreground text-xs leading-relaxed font-medium'>
                  Review recent operational updates and clear items after you
                  have acknowledged them.
                </SheetDescription> */}
              </div>
            </div>
            <div className='flex items-center gap-1.5' />
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>
          <div
            className={cn(
              'px-4',
              selectMode
                ? 'flex flex-col gap-2 py-2'
                : 'flex flex-col pt-0 pb-2',
            )}
          >
            {isLoading ? (
              <div className='space-y-2 py-4'>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={`notification-skeleton-${idx}`}
                    className='border-border bg-background space-y-2 rounded-md border p-3'
                  >
                    <div className='flex items-center gap-2'>
                      <Skeleton className='size-8 rounded-full' />
                      <div className='flex-1 space-y-1'>
                        <Skeleton className='h-3 w-2/3 rounded-sm' />
                        <Skeleton className='h-3 w-1/2 rounded-sm' />
                      </div>
                    </div>
                    <Skeleton className='h-3 w-full rounded-sm' />
                  </div>
                ))}
              </div>
            ) : orderedNotifications.length === 0 ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-12 text-center text-sm'>
                <Bell className='text-muted-foreground/50 mb-3 size-10' />
                <p className='font-medium'>No notifications yet</p>
                <p className='mt-1 text-xs'>
                  Updates about enrollments, clients, and programs will appear
                  here.
                </p>
              </div>
            ) : (
              orderedNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  selectMode={selectMode}
                  selected={selectedIds.includes(notification.id)}
                  onSelectChange={(item, selected) =>
                    onSelectChange(item.id, selected)
                  }
                  onOpen={(item) => {
                    if (selectMode) return;
                    if (!item.read) onMarkAsRead(item.id);
                    onOpenChange(false);
                  }}
                />
              ))
            )}
          </div>
        </div>

        <div className='border-border/80 bg-white shrink-0 border-t px-4 py-3'>
          <div className='grid grid-cols-2 gap-2'>
            {selectMode ? (
              <Button
                variant='outline'
                className='text-foreground bg-background hover:bg-muted h-10 w-full shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold normal-case'
                onClick={() => onSelectModeChange(false)}
                disabled={isDeletingSelected}
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant='outline'
                className='text-foreground bg-background hover:bg-muted h-10 w-full shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold normal-case'
                onClick={onMarkAllAsRead}
                disabled={isDeletingSelected || unreadCount === 0}
              >
                <CheckCheck className='size-3.5' />
                Mark all as read
              </Button>
            )}

            <Button
              variant={selectMode ? 'destructive' : 'outline'}
              className={
                selectMode
                  ? 'h-10 w-full shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold normal-case'
                  : 'text-foreground bg-background hover:bg-muted h-10 w-full shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold normal-case'
              }
              onClick={() => {
                if (!selectMode) {
                  onSelectModeChange(true);
                  return;
                }
                onDeleteSelected();
              }}
              disabled={
                isDeletingSelected || (selectMode && selectedCount === 0)
              }
            >
              <Trash2 className='size-3.5' />
              {!selectMode
                ? 'Select notifications'
                : isDeletingSelected
                  ? 'Deleting...'
                  : `Delete selected (${selectedCount})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

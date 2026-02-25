'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

import { MOCK_NOTIFICATIONS } from '@/components/admin/notifications/mock-notifications';
import { NotificationsDrawer } from '@/components/admin/notifications/NotificationsDrawer';
import { Button } from '@/components/ui/button';

const unreadCount = () => MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

const DashboardNotification = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
        {unreadCount() > 0 && (
          <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0c96c4] text-[8px] font-bold text-white'>
            {unreadCount()}
          </span>
        )}
      </Button>

      <NotificationsDrawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
};

export default DashboardNotification;

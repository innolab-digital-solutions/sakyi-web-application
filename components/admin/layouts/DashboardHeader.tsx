'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { PATHS } from '@/config/paths';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationsDrawer } from '@/components/admin/notifications/NotificationsDrawer';
import { MOCK_NOTIFICATIONS } from '@/components/admin/notifications/mock-notifications';

const unreadCount = () => MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

const DashboardHeader = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="border-border/80 bg-background sticky top-0 z-50 w-full border-b">
      <div className="flex h-16 items-center justify-between px-5">
        {/* Sidebar section with trigger and potential breadcrumb */}
        <div className="flex h-5 items-center">
          {/* Sidebar open/close trigger button */}
          <SidebarTrigger
            variant="outline"
            className="hover:border-border hover:text-foreground h-9 w-9 cursor-pointer hover:bg-gray-100"
          />

          <Separator orientation="vertical" className="mx-3 hidden sm:block" />

          {/* Placeholder for dynamic breadcrumb navigation (shown on sm and up) */}
          <div className="hidden sm:block">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    Control Panel
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={PATHS.ADMIN.DASHBOARD}
                      className="text-foreground hover:text-accent! font-medium"
                    >
                      Dashboard
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Notification Side Drawer */}
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-foreground relative cursor-pointer rounded-full bg-gray-100 hover:bg-gray-50"
              onClick={() => setNotificationsOpen(true)}
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0c96c4] text-[8px] font-bold text-white">
                  {unreadCount()}
                </span>
              )}
            </Button>

            <NotificationsDrawer
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            />
          </div>

          {/* User Name and Profile Picture */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end gap-x-1">
              <h3 className="text-foreground text-sm font-semibold">
                Aung Thu Zaw
              </h3>
              <p className="text--foreground text-xs font-medium">
                Super Admin
              </p>
            </div>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

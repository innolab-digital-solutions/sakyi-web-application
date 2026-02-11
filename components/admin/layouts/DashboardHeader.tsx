import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DashboardHeader = () => {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 border-border/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-5">
        {/* Sidebar section with trigger and potential breadcrumb */}
        <div className="flex h-5 items-center">
          {/* Sidebar open/close trigger button */}
          <SidebarTrigger
            variant="outline"
            className="hover:border-primary! h-9 w-9"
          />

          <Separator orientation="vertical" className="mx-3 hidden sm:block" />

          {/* Placeholder for dynamic breadcrumb navigation (shown on sm and up) */}
          <div className="hidden sm:block">{/* <DynamicBreadcrumb /> */}</div>
        </div>

        {/* Right section: notifications and user avatar/info */}
        <div className="flex items-center gap-4">
          {/* Notification bell button */}
          <div>
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          {/* User avatar and details */}
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-foreground text-sm font-semibold">
                Aung Thu Zaw
              </p>
              <span className="text-primary text-xs font-medium">
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

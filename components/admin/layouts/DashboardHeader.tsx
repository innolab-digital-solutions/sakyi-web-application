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

const DashboardHeader = () => {
  return (
    <header className="border-border/80 bg-background sticky top-0 z-50 w-full border-b">
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

        <div className="flex items-center gap-4">
          {/* Notification bell button */}
          <div>
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

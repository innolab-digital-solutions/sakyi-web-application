import Link from 'next/link';

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

const DashboardHeader = () => {
  return (
    <header className="border-border bg-background sticky top-0 z-50 w-full border-b px-2.5">
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
          {/* User Name and Profile Picture */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end gap-x-1">
              <h3 className="text-foreground text-sm font-semibold">
                Aung Thu Zaw
              </h3>
              <p className="text-muted-foreground text-xs font-medium">
                Super Admin
              </p>
            </div>
            <Avatar className="size-9 rounded-lg">
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

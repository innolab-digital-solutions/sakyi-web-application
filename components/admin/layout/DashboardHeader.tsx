'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils/string';

const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <header className='border-border bg-background sticky top-0 z-10 w-full border-b px-2.5'>
      <div className='flex h-16 items-center justify-between px-5'>
        {/* Left section: Sidebar trigger and breadcrumbs */}
        <div className='flex h-5 items-center'>
          {/* Button to open sidebar */}
          <SidebarTrigger
            variant='outline'
            className='hover:border-border hover:text-foreground h-9 w-9 cursor-pointer hover:bg-gray-100'
          />

          {/* Vertical separator (hidden on small screens) */}
          <Separator orientation='vertical' className='mx-3 hidden sm:block' />

          {/* Breadcrumb nav (hidden on small screens) */}
          <div className='hidden sm:block'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className='text-foreground font-medium'>
                    Control Panel
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={ROUTES.ADMIN.MODULES.OVERVIEW}
                      className='text-foreground hover:text-accent! font-medium'
                    >
                      Overview
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Right section: User info and avatar */}
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-2'>
            {/* User name and role */}
            <div className='flex flex-col items-end gap-x-1'>
              <h3 className='text-foreground text-sm font-semibold'>
                {user?.name ?? 'Anonymous'}
              </h3>
              {user?.role && (
                <p className='text-muted-foreground text-xs font-medium'>
                  {user.role}
                </p>
              )}
            </div>
            {/* User avatar */}
            <Avatar className='size-9 rounded-lg'>
              {user?.picture && <AvatarImage src={user.picture} />}
              <AvatarFallback>
                {getInitials(user?.name ?? 'Anonymous', 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

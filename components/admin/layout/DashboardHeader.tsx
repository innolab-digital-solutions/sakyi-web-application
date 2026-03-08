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
import PATHS from '@/config/paths';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/admin/user';

const DashboardHeader = () => {
  const { user } = useAuth();

  const displayName = user?.name ?? 'User';
  const role = user?.role;
  const displayRole =
    role == null
      ? 'Admin'
      : typeof role === 'string'
        ? role
        : ((role as UserRole).name ?? 'Admin');
  const initials = displayName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <header className='border-border bg-background sticky top-0 z-10 w-full border-b px-2.5'>
      <div className='flex h-16 items-center justify-between px-5'>
        <div className='flex h-5 items-center'>
          <SidebarTrigger
            variant='outline'
            className='hover:border-border hover:text-foreground h-9 w-9 cursor-pointer hover:bg-gray-100'
          />

          <Separator orientation='vertical' className='mx-3 hidden sm:block' />

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
                      href={PATHS.ADMIN.DASHBOARD}
                      className='text-foreground hover:text-accent! font-medium'
                    >
                      Dashboard
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-2'>
            <div className='flex flex-col items-end gap-x-1'>
              <h3 className='text-foreground text-sm font-semibold'>
                {displayName}
              </h3>
              <p className='text-muted-foreground text-xs font-medium'>
                {displayRole}
              </p>
            </div>
            <Avatar className='size-9 rounded-lg'>
              {user?.picture && <AvatarImage src={user.picture} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

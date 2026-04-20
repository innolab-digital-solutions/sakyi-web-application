'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils/string';

import DashboardNotification from './DashboardNotification';

const DashboardHeader = () => {
  const { user } = useAuth();

  const roleName =
    typeof user?.role === 'object' && user?.role !== null
      ? user.role.name
      : String(user?.role ?? '');

  return (
    <header className='border-border bg-background sticky top-0 z-10 w-full shrink-0 border-b px-2.5'>
      <div className='flex h-16 items-center justify-between px-5'>
        <div className='flex h-5 items-center'>
          <SidebarTrigger className='hover:text-foreground h-9 w-9 cursor-pointer border border-gray-300 hover:bg-gray-100' />

          <Separator orientation='vertical' className='mx-3 hidden sm:block' />

          <div className='hidden sm:block'></div>
        </div>

        <div className='flex items-center gap-8'>
          <DashboardNotification />

          <div className='flex items-center gap-2'>
            <div className='flex flex-col items-end gap-x-1'>
              <h3 className='text-foreground text-sm font-semibold'>
                {user?.name ?? 'Anonymous'}
              </h3>

              {roleName && (
                <p className='text-muted-foreground text-xs font-medium'>
                  {roleName}
                </p>
              )}
            </div>

            <Avatar className='size-9 rounded-lg'>
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

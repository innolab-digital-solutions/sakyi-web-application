'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { NAVIGATION } from '@/config/navigation';

import LogoutConfirmationDialog from './LogoutConfirmationDialog';

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className='z-50!'>
      {/* Sidebar header: Logo and title */}
      <SidebarHeader className='py-3.5'>
        <div className='flex items-center gap-3 px-2'>
          <div>
            <Image
              src='/images/logo-white.png'
              alt='sakyi-logo'
              className='object-contain'
              width={28}
              height={28}
            />
          </div>
          <div className='flex flex-col space-y-0.5'>
            <h3 className='text-sm font-semibold'>SaKyi Health & Wellness</h3>
            <p className='text-[11px] font-medium'>
              Administrative Control Panel
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar main navigation */}
      <SidebarContent className='scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent py-3.5'>
        <SidebarGroup>
          <SidebarMenu>
            {NAVIGATION.ADMIN.map((item, index) => {
              const hasSubitems = item.subitems && item.subitems.length > 0;

              const isItemActive = pathname === item.path;
              const isAnySubActive = hasSubitems
                ? item.subitems!.some((subitem) => pathname === subitem.path)
                : false;
              const isActive = isItemActive || isAnySubActive;

              const Icon = item.icon;

              // If item has subitems, render collapsible group
              if (hasSubitems) {
                return (
                  <SidebarMenuItem key={`${item.name}-${item.path}-${index}`}>
                    <Collapsible
                      defaultOpen={isActive}
                      className='group/collapsible'
                    >
                      <CollapsibleTrigger asChild className='cursor-pointer!'>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.name}
                          className='data-[active=true]:text-sidebar-primary-foreground hover:text-sidebar-primary-foreground px-3 py-5 hover:bg-white/15 data-[active=true]:bg-white/25'
                        >
                          {Icon ? <Icon className='mr-1 h-4 w-4' /> : null}
                          <span className='text-[12.5px] font-semibold'>
                            {item.name}
                          </span>
                          <ChevronDown className='ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180' />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className='ml-4.5'>
                          {/* Subitems for this menu item */}
                          {item.subitems!.map((subitem, subIndex) => {
                            const isSubActive = pathname === subitem.path;

                            return (
                              <SidebarMenuSubItem
                                key={`${item.name}-${subitem.name}-${subitem.path}-${subIndex}`}
                              >
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                  className='data-[active=true]:text-sidebar-primary-foreground hover:text-sidebar-primary-foreground px-3 py-5 hover:bg-white/15 data-[active=true]:bg-white/25'
                                >
                                  <Link href={subitem.path}>
                                    <span className='text-[12.5px] font-semibold'>
                                      {subitem.name}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                );
              }

              // Regular single link menu item
              return (
                <SidebarMenuItem key={`${item.name}-${item.path}-${index}`}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className='data-[active=true]:text-sidebar-primary-foreground hover:text-sidebar-primary-foreground px-3 py-5 hover:bg-white/15 data-[active=true]:bg-white/25'
                  >
                    <Link href={item.path}>
                      {Icon ? <Icon className='mr-1 h-4 w-4' /> : null}
                      <span className='text-[12.5px] font-semibold'>
                        {item.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar footer: Logout (opens confirmation dialog) */}
      <SidebarFooter className='py-3.25'>
        <LogoutConfirmationDialog />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;

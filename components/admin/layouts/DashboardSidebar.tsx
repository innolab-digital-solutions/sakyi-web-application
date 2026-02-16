'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { DASHBOARD_NAVIGATION } from '@/config/navigations';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-border/80 border-r">
      {/* Sidebar header with logo and title */}
      <SidebarHeader className="border-border/80 bg-background border-b py-3.25">
        <div className="flex items-center gap-3 px-2">
          <div className="border-border/50 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm border shadow-sm">
            <Image
              src="/images/logo.png"
              alt="sakyi-logo"
              className="object-contain"
              width={18}
              height={18}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold tracking-tight">
              SaKyi Health & Wellness
            </h3>
            <p className="text-muted-foreground text-xs font-medium">
              Platform-Wide Control Panel
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar navigation content */}
      <SidebarContent className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent bg-background">
        <SidebarGroup>
          <SidebarMenu>
            {DASHBOARD_NAVIGATION.map((item, index) => {
              // Determine if this navigation item has subitems
              const hasSubitems = item.subitems && item.subitems.length > 0;

              // Check if the main item or any of its subitems is currently active
              const isItemActive = pathname === item.path;
              const isAnySubActive = hasSubitems
                ? item.subitems!.some((subitem) => pathname === subitem.path)
                : false;
              const isActive = isItemActive || isAnySubActive;

              const Icon = item.icon;

              // Render navigation item with collapsible subitems (submenu)
              if (hasSubitems) {
                return (
                  <SidebarMenuItem key={`${item.name}-${item.path}-${index}`}>
                    <Collapsible
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild className="cursor-pointer!">
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.name}
                          className="px-3 py-5 text-neutral-700"
                        >
                          {Icon ? <Icon className="mr-1 h-4 w-4" /> : null}
                          <span className="text-[12.5px] font-semibold">
                            {item.name}
                          </span>
                          <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {/* Render all submenu items */}
                          {item.subitems!.map((subitem, subIndex) => {
                            // Check if this subitem is active
                            const isSubActive = pathname === subitem.path;

                            return (
                              <SidebarMenuSubItem
                                key={`${item.name}-${subitem.name}-${subitem.path}-${subIndex}`}
                              >
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                  className="px-3 py-5 text-neutral-700"
                                >
                                  <Link href={subitem.path}>
                                    <span className="text-[12.5px] font-semibold">
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

              // Render a single navigation item (no subitems)
              return (
                <SidebarMenuItem key={`${item.name}-${item.path}-${index}`}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className="px-3 py-5 text-neutral-700"
                  >
                    <Link href={item.path}>
                      {Icon ? <Icon className="mr-1 h-4 w-4" /> : null}
                      <span className="text-[12.5px] font-semibold">
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

      {/* Sidebar footer with user information and logout button */}
      <SidebarFooter className="border-border/80 bg-background border-t py-3.25">
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-semibold tracking-tight">
                Aung Thu Zaw
              </h3>
              <p className="text-primary text-xs font-medium">Super Admin</p>
            </div>
          </div>
          <Button variant="destructive" size="icon" className="cursor-pointer!">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;

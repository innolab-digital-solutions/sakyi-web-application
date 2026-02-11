'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { DASHBOARD_NAVIGATION } from '@/config/navigations';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-border/80 border-r">
      {/* Sidebar header with logo and title */}
      <SidebarHeader className="border-border/80 border-b bg-white py-3.25">
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
      <SidebarContent className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent bg-white">
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
                          className="px-3 py-5"
                        >
                          {Icon ? <Icon className="h-4 w-4" /> : null}
                          <span className="text-[12.8px] font-medium">
                            {item.name}
                          </span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
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
                                  className="px-3 py-5"
                                >
                                  <Link href={subitem.path}>
                                    <span className="text-[12.8px] font-medium">
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
                    className="hover:bg-accent! hover:text-accent-foreground! px-3 py-5"
                  >
                    <Link href={item.path}>
                      {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                      <span className="text-[12.8px] font-medium">
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
    </Sidebar>
  );
};

export default DashboardSidebar;

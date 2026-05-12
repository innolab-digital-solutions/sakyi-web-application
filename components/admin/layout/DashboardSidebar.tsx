'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

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
import {
  ADMIN_NAVIGATION,
  createSuperAdminBackendObservabilityNav,
} from '@/config/navigation/admin';
import type { NavItem, NavSubItem } from '@/config/navigation/types';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminUser } from '@/domains/user/roles';

import LogoutConfirmationDialog from './LogoutConfirmationDialog';

const EXTERNAL_HREF_RE = /^https?:\/\//i;

const normalizeNavPath = (value: string): string => {
  if (!value) return '';
  if (value === '/') return '/';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

function AdminNavHref({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const isOutbound = external === true || EXTERNAL_HREF_RE.test(href);

  if (isOutbound) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
    </Link>
  );
}

const isNavPathActive = (pathname: string, navPath: string): boolean => {
  if (!navPath || navPath === '#' || EXTERNAL_HREF_RE.test(navPath)) {
    return false;
  }

  const current = normalizeNavPath(pathname);
  const target = normalizeNavPath(navPath);

  if (current === target) {
    return true;
  }

  return current.startsWith(`${target}/`);
};

type NavItemWithSubitems = NavItem & {
  subitems: NavSubItem[];
};

function AdminNavCollapsibleSection({
  item,
  pathname,
}: {
  item: NavItemWithSubitems;
  pathname: string;
}) {
  const isItemActive = isNavPathActive(pathname, item.path);
  const isAnySubActive = item.subitems.some((subitem) =>
    isNavPathActive(pathname, subitem.path),
  );
  const isActive = isItemActive || isAnySubActive;

  const [open, setOpen] = useState(isActive);
  const prevIsActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    const prev = prevIsActiveRef.current;
    if (prev === null) {
      prevIsActiveRef.current = isActive;
      return;
    }
    prevIsActiveRef.current = isActive;
    if (isActive && !prev) {
      startTransition(() => setOpen(true));
    }
    if (!isActive && prev) {
      startTransition(() => setOpen(false));
    }
  }, [isActive]);

  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className='data-[state=open]:[&_.nav-collapsible-chevron]:rotate-180'
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            type='button'
            isActive={isActive}
            title={item.name}
            className='data-[active=true]:text-sidebar-primary-foreground! hover:text-sidebar-primary-foreground! px-3 py-5 hover:bg-white/15! data-[active=true]:bg-white/15!'
          >
            {Icon ? <Icon className='mr-1 h-4 w-4' /> : null}
            <span className='text-[12.5px] font-semibold'>{item.name}</span>
            <ChevronDown className='nav-collapsible-chevron ml-auto size-4 shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className='ml-4.5'>
            {item.subitems.map((subitem, subIndex) => {
              const isSubActive = isNavPathActive(pathname, subitem.path);

              return (
                <SidebarMenuSubItem
                  key={`${item.name}-${subitem.name}-${subitem.path}-${subIndex}`}
                >
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={`hover:text-sidebar-primary-foreground! px-3 py-5 hover:bg-white/15! ${
                      isSubActive
                        ? 'text-sidebar-primary-foreground! bg-white/15!'
                        : ''
                    }`}
                  >
                    <AdminNavHref
                      href={subitem.path}
                      external={subitem.external}
                    >
                      <span className='text-[12.5px] font-semibold'>
                        {subitem.name}
                      </span>
                    </AdminNavHref>
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

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const adminNavItems = useMemo(() => {
    const items = [...ADMIN_NAVIGATION];
    if (isSuperAdminUser(user)) {
      items.push(createSuperAdminBackendObservabilityNav());
    }
    return items;
  }, [user]);

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
            {adminNavItems.map((item, index) => {
              const hasSubitems = item.subitems && item.subitems.length > 0;

              const isItemActive = isNavPathActive(pathname, item.path);
              const isAnySubActive = hasSubitems
                ? item.subitems!.some((subitem) =>
                    isNavPathActive(pathname, subitem.path),
                  )
                : false;
              const isActive = isItemActive || isAnySubActive;

              const Icon = item.icon;

              if (hasSubitems) {
                return (
                  <AdminNavCollapsibleSection
                    key={`${item.name}-${item.path}-${index}`}
                    item={item as NavItemWithSubitems}
                    pathname={pathname}
                  />
                );
              }

              return (
                <SidebarMenuItem key={`${item.name}-${item.path}-${index}`}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className='data-[active=true]:text-sidebar-primary-foreground! hover:text-sidebar-primary-foreground! px-3 py-5 hover:bg-white/15! data-[active=true]:bg-white/15!'
                  >
                    <AdminNavHref href={item.path}>
                      {Icon ? <Icon className='mr-1 h-4 w-4' /> : null}
                      <span className='text-[12.5px] font-semibold'>
                        {item.name}
                      </span>
                    </AdminNavHref>
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

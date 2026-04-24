'use client';

import {
  ChevronDownIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Status } from '@/domains/user/types';

export type UserStatusFilter = 'all' | Status;
export type UserRoleFilter = 'all' | 'admin' | 'client' | 'prospect';

const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pending',
  active: 'Active',
};

const ROLE_OPTIONS: { value: UserRoleFilter; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'client', label: 'Client' },
  { value: 'prospect', label: 'Prospect' },
];

type Props = {
  status: UserStatusFilter;
  onStatusChange: (status: UserStatusFilter) => void;
  role: UserRoleFilter;
  onRoleChange: (role: UserRoleFilter) => void;
};

export default function UserFilters({
  status,
  onStatusChange,
  role,
  onRoleChange,
}: Props) {
  const statusLabel =
    status === 'all' ? 'All' : STATUS_LABELS[status as Status];
  const roleLabel =
    role === 'all'
      ? 'All'
      : (ROLE_OPTIONS.find((o) => o.value === role)?.label ?? 'All');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
          >
            <SlidersHorizontalIcon className='size-4 opacity-80' />
            <span>Status: {statusLabel}</span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => onStatusChange('all')}
          >
            All statuses
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
            <DropdownMenuItem
              key={s}
              className='cursor-pointer'
              onClick={() => onStatusChange(s)}
            >
              {STATUS_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='bg-background hover:bg-muted/70 data-[state=open]:bg-muted/80 hover:text-foreground h-11 cursor-pointer rounded-md border-neutral-200 px-3 text-[13px] font-medium'
          >
            <UsersIcon className='size-4 opacity-80' />
            <span>Role: {roleLabel}</span>
            <ChevronDownIcon className='size-3.5 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {ROLE_OPTIONS.map((option, index) => (
            <div key={option.value}>
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() => onRoleChange(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
              {index === 0 ? <DropdownMenuSeparator /> : null}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

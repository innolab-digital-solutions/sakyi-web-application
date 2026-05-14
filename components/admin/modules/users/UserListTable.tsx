'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2Icon,
  ClockIcon,
  ShieldCheckIcon,
  SquarePenIcon,
  Trash2Icon,
  UserCheck2Icon,
  UserRoundIcon,
  UserSearchIcon,
} from 'lucide-react';
import { type ComponentType, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import RemoveUserConfirmation from '@/components/admin/modules/users/RemoveUserConfirmation';
import UserFilters, {
  type UserStatusFilter,
} from '@/components/admin/modules/users/UserFilters';
import UserRemovalBlockedAlert from '@/components/admin/modules/users/UserRemovalBlockedAlert';
import UserSheet from '@/components/admin/modules/users/UserSheet';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { ENDPOINTS } from '@/config/api/endpoints';
import { deleteUser } from '@/domains/user/services';
import type { Status, User } from '@/domains/user/types';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const SUPER_ADMIN_BADGE: {
  icon: ComponentType<{ className?: string }>;
  className: string;
} = {
  icon: ShieldCheckIcon,
  className:
    'border-amber-400/85 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-50',
};

const ROLE_BADGE_STYLES: Record<
  User['role'],
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  Admin: {
    icon: UserCheck2Icon,
    className:
      'border-blue-300/80 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  },
  Client: {
    icon: UserRoundIcon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  Prospect: {
    icon: UserSearchIcon,
    className:
      'border-violet-300/80 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
  },
  super_admin: SUPER_ADMIN_BADGE,
  'Super Admin': SUPER_ADMIN_BADGE,
};

const COLUMN_COUNT = 7;

const SKELETON_WIDTHS = [
  'w-56',
  'w-28',
  'w-28',
  'w-28',
  'w-28',
  'w-28',
  'w-36',
] as const;

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Pending',
  active: 'Active',
};

const STATUS_STYLES: Record<
  Status,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  pending: {
    icon: ClockIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  active: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
};

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function isEmailSignInEnabled(user: User): boolean {
  const raw = String(user.sign_in_options?.email_password ?? '')
    .trim()
    .toLowerCase();

  // Backends can evolve enum wording (e.g. "set" -> "enabled").
  // Treat only explicit negative markers as disabled to prevent false negatives.
  const disabledMarkers = new Set([
    '',
    'not_set',
    'not configured',
    'not_configured',
    'disabled',
    'false',
    '0',
    'none',
  ]);

  return !disabledMarkers.has(raw);
}

function isGoogleSignInConnected(user: User): boolean {
  const raw = String(user.sign_in_options?.google ?? '')
    .trim()
    .toLowerCase();

  const disconnectedMarkers = new Set([
    '',
    'not_connected',
    'not connected',
    'disconnected',
    'disabled',
    'false',
    '0',
    'none',
  ]);

  return !disconnectedMarkers.has(raw);
}

function statusFilterFromParams(raw: string | undefined): UserStatusFilter {
  const valid: Status[] = ['pending', 'active'];
  return valid.includes(raw as Status) ? (raw as Status) : 'all';
}

export default function UserListTable() {
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [blockedDeleteTarget, setBlockedDeleteTarget] = useState<User | null>(
    null,
  );

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteUser(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove user.');
      }
    },
    onSuccess: () => {
      toast.success('The user account has been removed successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.USERS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove user.');
    },
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await confirmDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // onError already toasts
    }
  };

  const handleDeleteClick = (user: User) => {
    if (user.actions.deletable) {
      setDeleteTarget(user);
      return;
    }
    setBlockedDeleteTarget(user);
  };

  const { rows, controls } = useTable<User>(
    ENDPOINTS.ADMIN.MODULES.USERS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
        extra: {
          mode: 'allowlist',
          allowlist: ['status', 'role'],
        },
      },
    },
  );

  const statusFilter = useMemo(
    () => statusFilterFromParams(controls.params.values.status),
    [controls.params.values.status],
  );

  const roleFilter = useMemo(() => {
    const v = controls.params.values.role;
    if (v === 'admin') return 'admin' as const;
    if (v === 'client') return 'client' as const;
    if (v === 'prospect') return 'prospect' as const;
    return 'all' as const;
  }, [controls.params.values.role]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load users.';

  return (
    <>
      <TableListShell
        controls={controls}
        searchPlaceholder='Search ...'
        filters={
          <UserFilters
            status={statusFilter}
            onStatusChange={(next) => {
              if (next === 'all') {
                controls.params.clear(['status']);
                return;
              }
              controls.params.set({ status: next as string });
            }}
            role={roleFilter}
            onRoleChange={(next) => {
              if (next === 'all') {
                controls.params.clear(['role']);
                return;
              }
              controls.params.set({ role: next });
            }}
          />
        }
      >
        <Table className='w-full min-w-4xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Sign-In</TableHead>
              <TableHead>Google Sign-In</TableHead>
              <TableHead>Last Login At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton && (
              <TableSkeletonRows
                rowCount={15}
                columnCount={COLUMN_COUNT}
                cellWidths={[...SKELETON_WIDTHS]}
              />
            )}

            {!showSkeleton && query.isError && (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className='text-destructive py-8 text-center text-sm'
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.length === 0 && (
                <TableEmptyStateRow
                  colSpan={COLUMN_COUNT}
                  title='No User Accounts Found'
                  description='No user accounts found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((user) => {
                const createdAt = formatDateCell(user.last_login_at);
                const statusStyle = STATUS_STYLES[user.status];
                const StatusIcon = statusStyle.icon;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className='flex items-start gap-3'>
                        <Avatar
                          size='default'
                          className='mt-0.5 shrink-0'
                          aria-hidden
                        >
                          <AvatarFallback className='text-xs'>
                            {getInitials(user.name ?? '', 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-foreground text-[13px] font-semibold'>
                            {user.name?.trim() ? (
                              user.name.trim()
                            ) : (
                              <TableCellEmpty label='Name not set' />
                            )}
                          </p>
                          <p className='text-muted-foreground text-xs font-medium'>
                            {user.email?.trim() || '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className='min-w-40'>
                      {(() => {
                        const badgeStyle = ROLE_BADGE_STYLES[user.role];
                        const RoleIcon = badgeStyle.icon;

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${badgeStyle.className}`}
                          >
                            <RoleIcon className='size-3.5 shrink-0' />
                            {user.role}
                          </span>
                        );
                      })()}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                      >
                        <StatusIcon className='size-3.5 shrink-0' />
                        {STATUS_LABEL[user.status]}
                      </span>
                    </TableCell>

                    <TableCell>
                      {isEmailSignInEnabled(user)
                        ? 'Enabled'
                        : 'Not configured'}
                    </TableCell>

                    <TableCell>
                      {isGoogleSignInConnected(user)
                        ? 'Connected'
                        : 'Not connected'}
                    </TableCell>

                    <TableCell className='min-w-32'>
                      {createdAt ?? <TableCellEmpty label='No activity' />}
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-nowrap items-center justify-start gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-foreground bg-background hover:bg-muted h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                          onClick={() => setEditUser(user)}
                        >
                          <SquarePenIcon className='size-3.5' />
                          Edit
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-9 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Trash2Icon className='size-3.5' />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableListShell>

      {editUser && (
        <UserSheet
          mode='edit'
          user={editUser}
          open={!!editUser}
          onOpenChange={(o) => {
            if (!o) setEditUser(null);
          }}
        />
      )}

      <RemoveUserConfirmation
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        userName={deleteTarget?.name}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
      <UserRemovalBlockedAlert
        open={!!blockedDeleteTarget}
        onOpenChange={(o) => {
          if (!o) setBlockedDeleteTarget(null);
        }}
        userName={blockedDeleteTarget?.name}
        reason={blockedDeleteTarget?.actions.delete_block_reason ?? undefined}
      />
    </>
  );
}

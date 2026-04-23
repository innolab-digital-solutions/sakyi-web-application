'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  ArchiveIcon,
  CheckCircle2Icon,
  ClockIcon,
  PauseCircleIcon,
  PencilIcon,
  Trash2Icon,
  UserCogIcon,
} from 'lucide-react';
import { type ComponentType, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import RemoveUserConfirmation from '@/components/admin/modules/users/RemoveUserConfirmation';
import UserFilters, {
  type UserStatusFilter,
} from '@/components/admin/modules/users/UserFilters';
import UserSheet from '@/components/admin/modules/users/UserSheet';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
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

const ROLE_STYLES: Record<string, string> = {
  super_admin:
    'border-violet-300/80 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
  admin:
    'border-blue-300/80 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  support:
    'border-teal-300/80 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200',
};

const DEFAULT_ROLE_STYLE =
  'border-slate-300/80 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300';

const COLUMN_COUNT = 5;

const SKELETON_WIDTHS = ['w-56', 'w-28', 'w-28', 'w-28', 'w-36'] as const;

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Suspended',
  archived: 'Archived',
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
  suspended: {
    icon: PauseCircleIcon,
    className:
      'border-orange-300/80 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200',
  },
  archived: {
    icon: ArchiveIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
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

function statusFilterFromParams(raw: string | undefined): UserStatusFilter {
  const valid: Status[] = ['pending', 'active', 'suspended', 'archived'];
  return valid.includes(raw as Status) ? (raw as Status) : 'all';
}

export default function UserListTable() {
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

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
        searchPlaceholder='Search name or email'
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
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton && (
              <TableSkeletonRows
                rowCount={5}
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
                  icon={UserCogIcon}
                  title='No User Accounts Yet'
                  description='User accounts you create will appear here. Use Add User in the header to add staff, coaches, or clients with their roles and status.'
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
                    <TableCell className='align-center whitespace-normal'>
                      <div className='flex min-w-0 flex-col gap-0.5'>
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
                    </TableCell>

                    <TableCell className='align-center'>
                      {(() => {
                        const roleKey = user.role?.name?.trim() ?? 'client';
                        const roleLabel = roleKey.replace(/_/g, ' ');
                        const roleStyle =
                          ROLE_STYLES[roleKey] ?? DEFAULT_ROLE_STYLE;
                        return (
                          <span
                            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${roleStyle}`}
                          >
                            {roleLabel}
                          </span>
                        );
                      })()}
                    </TableCell>

                    <TableCell className='align-center'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                      >
                        <StatusIcon className='size-3.5 shrink-0' />
                        {STATUS_LABEL[user.status]}
                      </span>
                    </TableCell>

                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {createdAt ?? <TableCellEmpty label='Never logged in' />}
                    </TableCell>

                    <TableCell className='align-center whitespace-nowrap'>
                      <div className='flex flex-nowrap items-center justify-start gap-2'>
                        <Button
                          type='button'
                          className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                          onClick={() => setEditUser(user)}
                        >
                          <PencilIcon className='size-3.5' />
                          Edit
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-10 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                          onClick={() => setDeleteTarget(user)}
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
    </>
  );
}

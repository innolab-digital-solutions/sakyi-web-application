'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import DeleteAlertDialog from '@/components/shared/dialogs/DeleteAlertDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { deleteTeam } from '@/domains/teams/services';
import type { Team } from '@/domains/teams/types';
import { useTable } from '@/lib/table';

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  active:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
  scheduled:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50',
  completed:
    'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-950/30 dark:text-neutral-400 dark:border-neutral-800/50',
  cancelled:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50',
};

function enrollmentStatusColor(status: string | undefined): string {
  if (!status) return ENROLLMENT_STATUS_COLORS['scheduled'];
  return (
    ENROLLMENT_STATUS_COLORS[status.toLowerCase()] ??
    'bg-muted text-muted-foreground border-border'
  );
}

export default function TeamListTable() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteTeam(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete team.');
      }
    },
    onSuccess: (_data, deletedId) => {
      toast.success('Team deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.TEAMS.LIST],
      });
      queryClient.removeQueries({
        queryKey: [
          ENDPOINTS.ADMIN.MODULES.TEAMS.DETAIL(String(deletedId)),
          deletedId,
        ],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete team.');
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

  const { rows, controls } = useTable<Team>(ENDPOINTS.ADMIN.MODULES.TEAMS.LIST);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load teams.';

  return (
    <>
      <TableListShell controls={controls}>
        <Table className='min-w-120 table-fixed'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='w-[30%]'>Team Name</TableHead>
              <TableHead className='w-[20%]'>Enrollment Code</TableHead>
              <TableHead className='w-[18%]'>Enrollment Status</TableHead>
              <TableHead className='w-[17%]'>Members</TableHead>
              <TableHead className='w-[10%]'>Created</TableHead>
              <TableHead className='w-[5%] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 5 }).map((_, row) => (
                <TableRow key={`skeleton-${row}`}>
                  {Array.from({ length: 6 }).map((_, col) => (
                    <TableCell key={col} className='py-3'>
                      <Skeleton className='h-8 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!showSkeleton && query.isError && (
              <TableRow>
                <TableCell
                  colSpan={6}
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
                <TableRow>
                  <TableCell colSpan={6} className='py-14'>
                    <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
                      <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
                        <UsersIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No teams yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Create a team and assign staff members to enrollments.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((team) => (
                <TableRow key={team.id} className='border-border/80'>
                  <TableCell className='min-w-0 py-2.5 align-middle'>
                    <p className='text-foreground truncate text-sm font-medium'>
                      {team.name}
                    </p>
                  </TableCell>

                  <TableCell className='py-2.5 align-middle'>
                    {team.enrollment ? (
                      <span className='font-mono text-sm'>
                        {team.enrollment.code}
                      </span>
                    ) : (
                      <span className='text-muted-foreground/50 text-sm'>
                        —
                      </span>
                    )}
                  </TableCell>

                  <TableCell className='py-2.5 align-middle'>
                    {team.enrollment ? (
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${enrollmentStatusColor(team.enrollment.status)}`}
                      >
                        {team.enrollment.status}
                      </span>
                    ) : (
                      <span className='text-muted-foreground/50 text-sm'>
                        —
                      </span>
                    )}
                  </TableCell>

                  <TableCell className='py-2.5 align-middle'>
                    <span className='text-foreground inline-flex items-center gap-1.5 text-sm'>
                      <UsersIcon className='text-muted-foreground size-3.5' />
                      {team.members_count ?? 0}
                    </span>
                  </TableCell>

                  <TableCell className='py-2.5 align-middle'>
                    <span className='text-muted-foreground text-xs'>
                      {new Date(
                        team.timestamps.created_at,
                      ).toLocaleDateString()}
                    </span>
                  </TableCell>

                  <TableCell className='py-2.5 pr-2 text-right align-middle'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-8 cursor-pointer'
                        >
                          <MoreHorizontalIcon className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild className='cursor-pointer'>
                          <Link
                            href={ROUTES.ADMIN.MODULES.TEAMS.EDIT(
                              String(team.id),
                            )}
                            className='flex items-center gap-2'
                          >
                            <PencilIcon className='size-3.5' />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                          onClick={() => setDeleteTarget(team)}
                        >
                          <Trash2Icon className='size-3.5' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableListShell>

      <DeleteAlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title='Delete Team'
        description={
          <>
            Are you sure you want to delete{' '}
            <span className='text-foreground font-medium'>
              {deleteTarget?.name}
            </span>
            ? All member assignments will be removed. This action cannot be
            undone.
          </>
        }
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

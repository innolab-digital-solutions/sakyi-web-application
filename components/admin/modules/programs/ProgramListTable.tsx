'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  CalendarIcon,
  ClipboardListIcon,
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
import { STATUS } from '@/domains/programs/constants';
import { deleteProgram } from '@/domains/programs/services';
import type { AdminProgram as Program } from '@/domains/programs/types';
import { useTable } from '@/lib/table';

function ProgramStatusIndicator({ status }: { status: Program['status'] }) {
  let dotClass: string;
  let textClass: string;
  let label: string;

  switch (status) {
    case STATUS.PUBLISHED:
      dotClass = 'bg-emerald-500';
      textClass = 'text-emerald-600 dark:text-emerald-400';
      label = 'Published';
      break;
    case STATUS.DRAFT:
      dotClass = 'bg-muted-foreground/40';
      textClass = 'text-muted-foreground';
      label = 'Draft';
      break;
    case STATUS.HIDDEN:
      dotClass = 'bg-amber-400';
      textClass = 'text-amber-600 dark:text-amber-400';
      label = 'Hidden';
      break;
    case STATUS.ARCHIVED:
      dotClass = 'bg-muted-foreground/40';
      textClass = 'text-muted-foreground';
      label = 'Archived';
      break;
    default:
      dotClass = 'bg-muted-foreground/40';
      textClass = 'text-muted-foreground';
      label = status;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${textClass}`}
    >
      <span className={`size-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function formatCreatedAt(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    try {
      return format(new Date(iso), 'MMM d, yyyy');
    } catch {
      return iso;
    }
  }
}

/** Track column: duration (wellness "track" length), else goal names, else em dash. */
function getTrackLabel(program: Program): string {
  const duration = program.duration?.trim();
  if (duration) return duration;

  const goals = program.goals;
  if (goals?.length) {
    return goals
      .slice(0, 2)
      .map((g) => g.name)
      .join(', ');
  }

  return '—';
}

function formatEnrollmentCount(count: number | undefined): string {
  if (count == null || Number.isNaN(count)) return '—';
  return count.toLocaleString();
}

export default function ProgramListTable() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteProgram(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete program.');
      }
    },
    onSuccess: () => {
      toast.success('Program deleted.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete program.');
    },
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await confirmDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // onError already toasts; swallow so unhandled rejection is avoided
    }
  };

  const { rows, controls } = useTable<Program>(
    ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load programs.';

  return (
    <>
      <TableListShell controls={controls}>
        <Table className='min-w-180 table-fixed'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='w-[28%]'>Program</TableHead>
              <TableHead className='w-[12%]'>Status</TableHead>
              <TableHead className='w-[18%]'>Track</TableHead>
              <TableHead className='w-[14%]'>Created</TableHead>
              <TableHead className='w-[12%] text-right'>Enrolled</TableHead>
              <TableHead className='w-[16%] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 3 }).map((_, row) => (
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
                        <ClipboardListIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No programs available yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Program entries will appear here once wellness plans are
                        configured for your organization.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((program) => (
                <TableRow key={program.id} className='border-border/80'>
                  <TableCell className='min-w-0 align-top'>
                    <div className='min-w-0 pr-2'>
                      <p className='text-foreground/90 truncate text-sm font-semibold'>
                        {program.title?.trim() || (
                          <span className='text-muted-foreground font-normal italic'>
                            {program.slug ?? '(no title)'}
                          </span>
                        )}
                      </p>
                      {program.tagline?.trim() ? (
                        <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug'>
                          {program.tagline.trim()}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProgramStatusIndicator status={program.status} />
                  </TableCell>
                  <TableCell className='min-w-0'>
                    <p
                      className='truncate text-sm'
                      title={getTrackLabel(program)}
                    >
                      {getTrackLabel(program)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className='text-muted-foreground inline-flex items-center gap-1 text-xs'>
                      <CalendarIcon className='size-3 shrink-0 opacity-70' />
                      <span className='tabular-nums'>
                        {formatCreatedAt(program.timestamps.created_at)}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    <span className='text-muted-foreground inline-flex items-center justify-end gap-1 text-sm'>
                      <UsersIcon className='size-3 shrink-0 opacity-70' />
                      {formatEnrollmentCount(program.enrolled_count)}
                    </span>
                  </TableCell>
                  <TableCell className='pr-2 text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <MoreHorizontalIcon className='size-4' />
                          <span className='sr-only'>Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link
                            href={ROUTES.ADMIN.MODULES.PROGRAMS.EDIT(
                              String(program.id),
                            )}
                            className='flex cursor-pointer items-center gap-2'
                          >
                            <PencilIcon className='size-3.5' />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                          onClick={() => setDeleteTarget(program)}
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
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title='Delete program?'
        description={
          deleteTarget ? (
            <>
              This will permanently delete <strong>{deleteTarget.title}</strong>
              . This action cannot be undone.
            </>
          ) : (
            'This action cannot be undone.'
          )
        }
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

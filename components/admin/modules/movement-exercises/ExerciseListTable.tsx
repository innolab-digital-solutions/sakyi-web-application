'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DumbbellIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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
import { deleteMovementExercise } from '@/domains/movement-exercises/services';
import type { MovementExercise } from '@/domains/movement-exercises/types';
import { useTable } from '@/lib/table';

import ExerciseFilters from './ExerciseFilters';

const DIFFICULTY_COLORS = {
  beginner:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
  intermediate:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50',
  advanced:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50',
} as const;

export default function ExerciseListTable() {
  const queryClient = useQueryClient();
  const [deleteExercise, setDeleteExercise] = useState<MovementExercise | null>(
    null,
  );

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteMovementExercise(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete exercise.');
      }
    },
    onSuccess: (_data, deletedId) => {
      toast.success('Exercise deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST],
      });

      queryClient.removeQueries({
        queryKey: [
          ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.DETAIL(String(deletedId)),
          deletedId,
        ],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete exercise.');
    },
  });

  const handleDelete = async () => {
    if (!deleteExercise) return;
    try {
      await confirmDelete(deleteExercise.id);
      setDeleteExercise(null);
    } catch {
      // onError already toasts
    }
  };

  const { rows, controls } = useTable<MovementExercise>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
        extra: {
          mode: 'allowlist',
          allowlist: ['difficulty', 'movement_category_id', 'is_active'],
          resetPageOnChange: true,
        },
      },
    },
  );

  const statusFilter = useMemo(() => {
    const v = controls.params.values.is_active;
    if (v === '1') return 'active' as const;
    if (v === '0') return 'inactive' as const;
    return 'all' as const;
  }, [controls.params.values.is_active]);

  const difficultyFilter = useMemo(() => {
    const v = controls.params.values.difficulty;
    if (v === 'beginner' || v === 'intermediate' || v === 'advanced') return v;
    return 'all' as const;
  }, [controls.params.values.difficulty]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load exercises.';

  return (
    <>
      <TableListShell
        controls={controls}
        filters={
          <ExerciseFilters
            status={statusFilter}
            difficulty={difficultyFilter}
            onStatusChange={(next) => {
              if (next === 'all') {
                controls.params.clear(['is_active']);
                return;
              }
              controls.params.set({ is_active: next === 'active' ? '1' : '0' });
            }}
            onDifficultyChange={(next) => {
              if (next === 'all') {
                controls.params.clear(['difficulty']);
                return;
              }
              controls.params.set({ difficulty: next });
            }}
          />
        }
      >
        <Table className='min-w-120 table-fixed'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='w-[24%]'>Name</TableHead>
              <TableHead className='w-[18%]'>Category</TableHead>
              <TableHead className='w-[14%]'>Difficulty</TableHead>
              <TableHead className='w-[30%]'>Equipment</TableHead>
              <TableHead className='w-[9%]'>Status</TableHead>
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
                        <DumbbellIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No exercises yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Add exercises to build out your movement library.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((exercise) => (
                <TableRow key={exercise.id} className='border-border/80'>
                  <TableCell className='min-w-0 py-2.5 align-middle'>
                    <p className='text-foreground truncate text-sm font-medium'>
                      {exercise.name}
                    </p>
                    {exercise.media.length > 0 && (
                      <p className='text-muted-foreground mt-0.5 text-xs'>
                        {exercise.media.length} media file
                        {exercise.media.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    {exercise.movement_category ? (
                      <span className='text-sm'>
                        {exercise.movement_category.name}
                      </span>
                    ) : (
                      <span className='text-muted-foreground/50 text-sm'>
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_COLORS[exercise.difficulty]}`}
                    >
                      {exercise.difficulty}
                    </span>
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    {exercise.equipments.length === 0 ? (
                      <span className='text-muted-foreground/50 text-xs'>
                        —
                      </span>
                    ) : (
                      <div className='flex flex-wrap items-center gap-1'>
                        {exercise.equipments.slice(0, 3).map((eq) => (
                          <span
                            key={eq.id}
                            className='bg-muted text-foreground border-border inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium'
                          >
                            {eq.name}
                          </span>
                        ))}
                        {exercise.equipments.length > 3 && (
                          <span className='text-muted-foreground text-xs'>
                            +{exercise.equipments.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${exercise.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${exercise.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
                      />
                      {exercise.is_active ? 'Active' : 'Inactive'}
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
                            href={ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.EDIT(
                              String(exercise.id),
                            )}
                            className='flex items-center gap-2'
                          >
                            <PencilIcon className='size-3.5' />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                          onClick={() => setDeleteExercise(exercise)}
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
        open={!!deleteExercise}
        onOpenChange={(o) => {
          if (!o) setDeleteExercise(null);
        }}
        title='Delete Exercise'
        description={
          <>
            Are you sure you want to delete{' '}
            <span className='text-foreground font-medium'>
              {deleteExercise?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

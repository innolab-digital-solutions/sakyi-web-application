'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2Icon,
  DumbbellIcon,
  FlameIcon,
  GaugeIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import ExerciseFilters from '@/components/admin/modules/movement-exercises/ExerciseFilters';
import ExerciseSheet from '@/components/admin/modules/movement-exercises/ExerciseSheet';
import RemoveExerciseConfirmation from '@/components/admin/modules/movement-exercises/RemoveExerciseConfirmation';
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
import { deleteMovementExercise } from '@/domains/movement-exercises/services';
import type {
  MovementDifficulty,
  MovementExercise,
} from '@/domains/movement-exercises/types';
import { useTable } from '@/lib/table';

const COLUMN_COUNT = 5;

const SKELETON_WIDTHS = ['w-56', 'w-28', 'w-24', 'w-40', 'w-44'] as const;

/** Aligned with intake / enrollment request status badge chrome (icon + border + semantic colors). */
const DIFFICULTY_LABEL: Record<MovementDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const DIFFICULTY_STYLES: Record<
  MovementDifficulty,
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  beginner: {
    icon: CheckCircle2Icon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  },
  intermediate: {
    icon: GaugeIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  advanced: {
    icon: FlameIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
};

function asMovementDifficulty(
  value: string | undefined,
): MovementDifficulty | null {
  if (
    value === 'beginner' ||
    value === 'intermediate' ||
    value === 'advanced'
  ) {
    return value;
  }
  return null;
}

export default function ExerciseListTable() {
  const queryClient = useQueryClient();
  const [editExercise, setEditExercise] = useState<MovementExercise | null>(
    null,
  );
  const [deleteExercise, setDeleteExercise] = useState<MovementExercise | null>(
    null,
  );

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteMovementExercise(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove exercise.');
      }
    },
    onSuccess: (_data, deletedId) => {
      toast.success('The exercise was removed from the movement library.');
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
      toast.error(error.message ?? 'Failed to remove exercise.');
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
          allowlist: ['difficulty'],
          resetPageOnChange: true,
        },
      },
    },
  );

  const difficultyParam = controls.params.values.difficulty;

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
        searchPlaceholder='Search exercise or category'
        filters={
          <ExerciseFilters
            difficultyFilter={difficultyParam}
            onClearDifficulty={() => controls.params.clear(['difficulty'])}
            onSetDifficulty={(difficulty) =>
              controls.params.set({ difficulty })
            }
          />
        }
      >
        <Table className='w-full min-w-5xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Exercise</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Equipment</TableHead>
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
                  icon={DumbbellIcon}
                  title='No Exercises Yet'
                  description='Exercises you add will appear here for the movement library. Use Add in the header to define movements with category, difficulty, equipment, and optional media.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className='align-center whitespace-normal'>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {exercise.name?.trim() ? (
                          exercise.name.trim()
                        ) : (
                          <TableCellEmpty label='Name not set' />
                        )}
                      </p>
                      <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed font-medium wrap-break-word'>
                        {exercise.description?.trim()
                          ? exercise.description.trim()
                          : '-'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className='text-foreground/80 align-center'>
                    {exercise.movement_category?.name?.trim() ? (
                      <span>{exercise.movement_category.name.trim()}</span>
                    ) : (
                      <TableCellEmpty label='No category' />
                    )}
                  </TableCell>

                  <TableCell className='align-center'>
                    {(() => {
                      const difficulty =
                        asMovementDifficulty(exercise.difficulty) ?? 'beginner';
                      const style = DIFFICULTY_STYLES[difficulty];
                      const DifficultyIcon = style.icon;

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${style.className}`}
                        >
                          <DifficultyIcon className='size-3.5 shrink-0' />
                          {DIFFICULTY_LABEL[difficulty]}
                        </span>
                      );
                    })()}
                  </TableCell>

                  <TableCell className='text-foreground/80 align-center whitespace-normal'>
                    {exercise.equipments.length === 0 ? (
                      <TableCellEmpty label='No equipment' />
                    ) : (
                      <span className='wrap-break-word'>
                        {exercise.equipments
                          .map((eq) => eq.name.trim())
                          .join(', ')}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className='align-center whitespace-nowrap'>
                    <div className='flex flex-nowrap items-center justify-start gap-2'>
                      <Button
                        type='button'
                        className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                        onClick={() => setEditExercise(exercise)}
                      >
                        <PencilIcon className='size-3.5' />
                        Edit
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-10 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                        onClick={() => setDeleteExercise(exercise)}
                      >
                        <Trash2Icon className='size-3.5' />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableListShell>

      {editExercise && (
        <ExerciseSheet
          mode='edit'
          exercise={editExercise}
          open={!!editExercise}
          onOpenChange={(o) => {
            if (!o) setEditExercise(null);
          }}
        />
      )}

      <RemoveExerciseConfirmation
        open={!!deleteExercise}
        onOpenChange={(o) => {
          if (!o) setDeleteExercise(null);
        }}
        exerciseName={deleteExercise?.name}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

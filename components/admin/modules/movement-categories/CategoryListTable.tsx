'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import MovementCategoryRemovalBlockedAlert from '@/components/admin/modules/movement-categories/MovementCategoryRemovalBlockedAlert';
import MovementCategorySheet from '@/components/admin/modules/movement-categories/CategorySheet';
import RemoveMovementCategoryConfirmation from '@/components/admin/modules/movement-categories/RemoveMovementCategoryConfirmation';
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
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import {
  deleteMovementCategory,
  movementCategoryParentPickerQueryKey,
} from '@/domains/movement-categories/services';
import type { MovementCategory } from '@/domains/movement-categories/types';
import { useTable } from '@/lib/table';

const COLUMN_COUNT = 3;

const SKELETON_WIDTHS = ['w-72', 'w-32', 'w-44'] as const;

export default function MovementCategoryListTable() {
  const queryClient = useQueryClient();
  const [editCategory, setEditCategory] = useState<MovementCategory | null>(
    null,
  );
  const [deleteCategory, setDeleteCategory] = useState<MovementCategory | null>(
    null,
  );
  const [blockedDeleteCategory, setBlockedDeleteCategory] =
    useState<MovementCategory | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteMovementCategory(id);
      if (response.status === 'error') {
        throw new Error(
          response.message || 'Failed to remove movement category.',
        );
      }
    },
    onSuccess: () => {
      toast.success('The movement category has been removed successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_CATEGORIES],
      });
      queryClient.invalidateQueries({
        queryKey: movementCategoryParentPickerQueryKey,
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove movement category.');
    },
  });

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      await confirmDelete(deleteCategory.id);
      setDeleteCategory(null);
    } catch {
      // onError already toasts
    }
  };

  const handleDeleteClick = (category: MovementCategory) => {
    if (category.actions.deletable) {
      setDeleteCategory(category);
      return;
    }
    setBlockedDeleteCategory(category);
  };

  const { rows, controls } = useTable<MovementCategory>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_CATEGORIES.LIST,
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
      : 'Could not load movement categories.';

  return (
    <>
      <TableListShell controls={controls} searchPlaceholder='Search ...'>
        <Table className='w-full min-w-3xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Category</TableHead>
              <TableHead>Parent</TableHead>
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
                  title='No Movement Categories Found'
                  description='No movement categories found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className='align-center whitespace-normal'>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {category.name?.trim() ? (
                          category.name.trim()
                        ) : (
                          <TableCellEmpty label='Name not set' />
                        )}
                      </p>
                      <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed font-medium wrap-break-word'>
                        {category.description?.trim()
                          ? category.description.trim()
                          : '-'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className='text-foreground/80 align-center'>
                    {category.parent?.name?.trim() ? (
                      <span className='text-[13px]'>
                        {category.parent.name.trim()}
                      </span>
                    ) : (
                      <TableCellEmpty label='Root Category' />
                    )}
                  </TableCell>

                  <TableCell className='align-center whitespace-nowrap'>
                    <div className='flex flex-nowrap items-center justify-start gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-foreground bg-background hover:bg-muted h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                        onClick={() => setEditCategory(category)}
                      >
                        <SquarePenIcon className='size-3.5' />
                        Edit
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-9 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                        onClick={() => handleDeleteClick(category)}
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

      {editCategory && (
        <MovementCategorySheet
          mode='edit'
          category={editCategory}
          open={!!editCategory}
          onOpenChange={(o) => {
            if (!o) setEditCategory(null);
          }}
        />
      )}

      <RemoveMovementCategoryConfirmation
        open={!!deleteCategory}
        onOpenChange={(o) => {
          if (!o) setDeleteCategory(null);
        }}
        categoryName={deleteCategory?.name}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
      <MovementCategoryRemovalBlockedAlert
        open={!!blockedDeleteCategory}
        onOpenChange={(o) => {
          if (!o) setBlockedDeleteCategory(null);
        }}
        categoryName={blockedDeleteCategory?.name}
        reason={blockedDeleteCategory?.actions.delete_block_reason ?? undefined}
      />
    </>
  );
}

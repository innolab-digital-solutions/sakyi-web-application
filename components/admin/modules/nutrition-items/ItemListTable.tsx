'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import NutritionItemRemovalBlockedAlert from '@/components/admin/modules/nutrition-items/NutritionItemRemovalBlockedAlert';
import NutritionItemSheet from '@/components/admin/modules/nutrition-items/ItemSheet';
import RemoveFoodItemConfirmation from '@/components/admin/modules/nutrition-items/RemoveFoodItemConfirmation';
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
import { deleteNutritionItem } from '@/domains/nutrition-items/services';
import type { NutritionItem } from '@/domains/nutrition-items/types';
import { useTable } from '@/lib/table';

const COLUMN_COUNT = 4;

const SKELETON_WIDTHS = ['w-48', 'w-32', 'w-36', 'w-44'] as const;

export default function NutritionItemListTable() {
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<NutritionItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<NutritionItem | null>(null);
  const [blockedDeleteItem, setBlockedDeleteItem] =
    useState<NutritionItem | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteNutritionItem(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove food item.');
      }
    },
    onSuccess: () => {
      toast.success('The food item has been removed successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove food item.');
    },
  });

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await confirmDelete(deleteItem.id);
      setDeleteItem(null);
    } catch {
      // onError already toasts
    }
  };

  const handleDeleteClick = (nutritionItem: NutritionItem) => {
    if (nutritionItem.actions.deletable) {
      setDeleteItem(nutritionItem);
      return;
    }
    setBlockedDeleteItem(nutritionItem);
  };

  const { rows, controls } = useTable<NutritionItem>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.LIST,
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
      : 'Could not load food items.';

  return (
    <>
      <TableListShell controls={controls} searchPlaceholder='Search ...'>
        <Table className='w-full min-w-4xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Measurement</TableHead>
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
                  title='No Food Items Found'
                  description='No food items found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((nutritionItem) => (
                <TableRow key={nutritionItem.id}>
                  <TableCell className='align-center whitespace-normal'>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {nutritionItem.name?.trim() ? (
                          nutritionItem.name.trim()
                        ) : (
                          <TableCellEmpty label='Name not set' />
                        )}
                      </p>
                      <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed font-medium wrap-break-word'>
                        {nutritionItem.description?.trim()
                          ? nutritionItem.description.trim()
                          : '-'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className='text-foreground/80 align-center'>
                    {nutritionItem.nutrition_category?.name?.trim() ? (
                      <span className='text-[13px]'>
                        {nutritionItem.nutrition_category.name.trim()}
                      </span>
                    ) : (
                      <TableCellEmpty label='No category' />
                    )}
                  </TableCell>

                  <TableCell className='text-foreground/80 align-center'>
                    {nutritionItem.default_unit ? (
                      <span className='text-[13px]'>
                        {nutritionItem.default_unit.name.trim()}{' '}
                        <span className='text-muted-foreground text-xs'>
                          ({nutritionItem.default_unit.abbreviation})
                        </span>
                      </span>
                    ) : (
                      <TableCellEmpty label='No measurement' />
                    )}
                  </TableCell>

                  <TableCell className='align-center whitespace-nowrap'>
                    <div className='flex flex-nowrap items-center justify-start gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-foreground bg-background hover:bg-muted h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                        onClick={() => setEditItem(nutritionItem)}
                      >
                        <SquarePenIcon className='size-3.5' />
                        Edit
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-9 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                        onClick={() => handleDeleteClick(nutritionItem)}
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

      {editItem && (
        <NutritionItemSheet
          mode='edit'
          item={editItem}
          open={!!editItem}
          onOpenChange={(o) => {
            if (!o) setEditItem(null);
          }}
        />
      )}

      <RemoveFoodItemConfirmation
        open={!!deleteItem}
        onOpenChange={(o) => {
          if (!o) setDeleteItem(null);
        }}
        itemName={deleteItem?.name}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
      <NutritionItemRemovalBlockedAlert
        open={!!blockedDeleteItem}
        onOpenChange={(o) => {
          if (!o) setBlockedDeleteItem(null);
        }}
        itemName={blockedDeleteItem?.name}
        reason={blockedDeleteItem?.actions.delete_block_reason ?? undefined}
      />
    </>
  );
}

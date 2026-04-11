'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontalIcon,
  PencilIcon,
  SaladIcon,
  Trash2Icon,
} from 'lucide-react';
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
import { deleteNutritionItem } from '@/domains/nutrition-items/services';
import type { NutritionItem } from '@/domains/nutrition-items/types';
import { useTable } from '@/lib/table';

import NutritionItemFilters from './ItemFilters';
import NutritionItemSheet from './ItemSheet';

export default function NutritionItemListTable() {
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<NutritionItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<NutritionItem | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteNutritionItem(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete item.');
      }
    },
    onSuccess: () => {
      toast.success('Item deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.NUTRITION_ITEMS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete item.');
    },
  });

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await confirmDelete(deleteItem.id);
      setDeleteItem(null);
    } catch {
      // onError already toasts; swallow rejection so the click handler does not surface an unhandled promise
    }
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

  const statusFilter = useMemo(() => {
    const v = controls.params.values.is_active;
    if (v === '1') return 'active' as const;
    if (v === '0') return 'inactive' as const;
    return 'all' as const;
  }, [controls.params.values.is_active]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load items.';

  return (
    <>
      <TableListShell
        controls={controls}
        filters={
          <NutritionItemFilters
            status={statusFilter}
            onStatusChange={(next) => {
              if (next === 'all') {
                controls.params.clear(['is_active']);
                return;
              }
              controls.params.set({
                is_active: next === 'active' ? '1' : '0',
              });
            }}
          />
        }
      >
        <Table className='min-w-120 table-fixed'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='w-[25%]'>Name</TableHead>
              <TableHead className='w-[20%]'>Category</TableHead>
              <TableHead className='w-[20%]'>Default Unit</TableHead>
              <TableHead className='w-[15%]'>Status</TableHead>
              <TableHead className='w-[20%] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 3 }).map((_, row) => (
                <TableRow key={`skeleton-${row}`}>
                  {Array.from({ length: 5 }).map((_, col) => (
                    <TableCell key={col} className='py-3'>
                      <Skeleton className='h-8 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!showSkeleton && query.isError && (
              <TableRow>
                <TableCell
                  colSpan={5}
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
                  <TableCell colSpan={5} className='py-14'>
                    <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
                      <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
                        <SaladIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No nutrition items yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Items will appear here once you start building out the
                        nutrition library.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((nutritionItem) => (
                <TableRow key={nutritionItem.id} className='border-border/80'>
                  <TableCell className='min-w-0 py-2.5 align-top'>
                    <div className='min-w-0 pr-2'>
                      <p className='text-foreground truncate text-sm font-medium'>
                        {nutritionItem.name}
                      </p>
                      {nutritionItem.description && (
                        <p className='text-muted-foreground mt-0.5 line-clamp-1 text-xs'>
                          {nutritionItem.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    {nutritionItem.nutrition_category ? (
                      <span className='text-sm'>
                        {nutritionItem.nutrition_category.name}
                      </span>
                    ) : (
                      <span className='text-muted-foreground text-sm'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    {nutritionItem.default_unit ? (
                      <span className='text-sm'>
                        {nutritionItem.default_unit.name}{' '}
                        <span className='text-muted-foreground text-xs'>
                          ({nutritionItem.default_unit.abbreviation})
                        </span>
                      </span>
                    ) : (
                      <span className='text-muted-foreground text-sm'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${nutritionItem.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${nutritionItem.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
                      />
                      {nutritionItem.is_active ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem
                          className='flex cursor-pointer items-center gap-2'
                          onClick={() => setEditItem(nutritionItem)}
                        >
                          <PencilIcon className='size-3.5' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                          onClick={() => setDeleteItem(nutritionItem)}
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

      <DeleteAlertDialog
        open={!!deleteItem}
        onOpenChange={(o) => {
          if (!o) setDeleteItem(null);
        }}
        title='Delete Item'
        description={
          <>
            Are you sure you want to delete{' '}
            <span className='text-foreground font-medium'>
              {deleteItem?.name}
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

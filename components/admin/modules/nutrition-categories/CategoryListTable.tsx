'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutListIcon,
  MoreHorizontalIcon,
  PencilIcon,
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
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { deleteNutritionCategory } from '@/domains/nutrition-categories/services';
import type { NutritionCategory } from '@/domains/nutrition-categories/types';
import { useTable } from '@/lib/table';

import NutritionCategoryFilters from './CategoryFilters';
import NutritionCategorySheet from './CategorySheet';

export default function NutritionCategoryListTable() {
  const queryClient = useQueryClient();
  const [editCategory, setEditCategory] = useState<NutritionCategory | null>(
    null,
  );
  const [deleteCategory, setDeleteCategory] =
    useState<NutritionCategory | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteNutritionCategory(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete category.');
      }
    },
    onSuccess: () => {
      toast.success('Category deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: ['lookup', LOOKUP_ENDPOINTS.NUTRITION_CATEGORIES],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete category.');
    },
  });

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      await confirmDelete(deleteCategory.id);
      setDeleteCategory(null);
    } catch {
      // onError already toasts; swallow rejection so the click handler does not surface an unhandled promise
    }
  };

  const { rows, controls } = useTable<NutritionCategory>(
    ENDPOINTS.ADMIN.MODULES.NUTRITION_CATEGORIES.LIST,
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
      : 'Could not load categories.';

  return (
    <>
      <TableListShell
        controls={controls}
        filters={
          <NutritionCategoryFilters
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
              <TableHead className='w-[20%]'>Name</TableHead>
              <TableHead className='w-[35%]'>Description</TableHead>
              <TableHead className='w-[20%]'>Parent</TableHead>
              <TableHead className='w-[12%]'>Status</TableHead>
              <TableHead className='w-[13%] text-right'>Actions</TableHead>
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
                        <LayoutListIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No nutrition categories yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Categories will appear here once you start organizing
                        nutrition items and supplements.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((category) => (
                <TableRow key={category.id} className='border-border/80'>
                  <TableCell className='min-w-0 py-2.5 align-middle'>
                    <p className='text-foreground truncate text-sm font-medium'>
                      {category.name}
                    </p>
                  </TableCell>
                  <TableCell className='min-w-0 py-2.5 align-middle'>
                    {category.description ? (
                      <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
                        {category.description}
                      </p>
                    ) : (
                      <span className='text-muted-foreground/50 text-xs'>
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    {category.parent ? (
                      <span className='text-sm'>{category.parent.name}</span>
                    ) : (
                      <span className='text-muted-foreground text-sm'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${category.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${category.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
                      />
                      {category.is_active ? 'Active' : 'Inactive'}
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
                          onClick={() => setEditCategory(category)}
                        >
                          <PencilIcon className='size-3.5' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                          onClick={() => setDeleteCategory(category)}
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

      {editCategory && (
        <NutritionCategorySheet
          mode='edit'
          category={editCategory}
          open={!!editCategory}
          onOpenChange={(o) => {
            if (!o) setEditCategory(null);
          }}
        />
      )}

      <DeleteAlertDialog
        open={!!deleteCategory}
        onOpenChange={(o) => {
          if (!o) setDeleteCategory(null);
        }}
        title='Delete Category'
        description={
          <>
            Are you sure you want to delete{' '}
            <span className='text-foreground font-medium'>
              {deleteCategory?.name}
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

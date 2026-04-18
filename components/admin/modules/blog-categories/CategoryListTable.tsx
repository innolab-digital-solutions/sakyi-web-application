'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotebookPenIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import BlogCategoryFilters, {
  type BlogCategoryListLocale,
} from '@/components/admin/modules/blog-categories/CategoryFilters';
import BlogCategorySheet from '@/components/admin/modules/blog-categories/CategorySheet';
import RemoveBlogCategoryConfirmation from '@/components/admin/modules/blog-categories/RemoveBlogCategoryConfirmation';
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
import { deleteBlogCategory } from '@/domains/blog-categories/services';
import type { BlogCategory } from '@/domains/blog-categories/types';
import { useTable } from '@/lib/table';

const BLOG_CATEGORY_LIST_ENDPOINT =
  ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.LIST;

const COLUMN_COUNT = 2;

const SKELETON_WIDTHS = ['w-72', 'w-44'] as const;

function listLocaleFromParams(raw: string | undefined): BlogCategoryListLocale {
  return raw === 'my' ? 'my' : 'en';
}

export default function BlogCategoryListTable() {
  const queryClient = useQueryClient();
  const [editCategory, setEditCategory] = useState<BlogCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<BlogCategory | null>(
    null,
  );

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteBlogCategory(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove category.');
      }
    },
    onSuccess: () => {
      toast.success('The blog category was removed from your library.');
      queryClient.invalidateQueries({
        queryKey: ['table', BLOG_CATEGORY_LIST_ENDPOINT],
      });
      queryClient.invalidateQueries({
        queryKey: ['lookup', LOOKUP_ENDPOINTS.BLOG_CATEGORIES],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove category.');
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

  const { rows, controls } = useTable<BlogCategory>(
    BLOG_CATEGORY_LIST_ENDPOINT,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
        initial: { locale: 'en' },
        extra: {
          mode: 'allowlist',
          allowlist: ['locale'],
        },
      },
    },
  );

  const listLocale = listLocaleFromParams(controls.params.values.locale);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load blog categories.';

  return (
    <>
      <TableListShell
        controls={controls}
        searchPlaceholder='Search category name or description'
        filters={
          <BlogCategoryFilters
            locale={listLocale}
            onLocaleChange={(next) => {
              controls.params.set({ locale: next });
            }}
          />
        }
      >
        <Table className='w-full min-w-3xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton && (
              <TableSkeletonRows
                rowCount={3}
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
                  icon={NotebookPenIcon}
                  title='No blog categories yet'
                  description='Add categories to group posts for readers and editors. Each category has English and Myanmar names in the form.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((category) => (
                <TableRow key={category.id} className='border-border'>
                  <TableCell className='align-center whitespace-normal'>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {category.name?.trim() ? (
                          category.name.trim()
                        ) : (
                          <TableCellEmpty
                            label={`No ${listLocale === 'en' ? 'English' : 'Myanmar'} name`}
                          />
                        )}
                      </p>
                      <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed font-medium wrap-break-word'>
                        {category.description?.trim()
                          ? category.description.trim()
                          : '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className='align-center whitespace-nowrap'>
                    <div className='flex flex-nowrap items-center justify-start gap-2'>
                      <Button
                        type='button'
                        className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                        onClick={() => setEditCategory(category)}
                      >
                        <PencilIcon className='size-3.5' />
                        Edit
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-10 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                        onClick={() => setDeleteCategory(category)}
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
        <BlogCategorySheet
          mode='edit'
          category={editCategory}
          open={!!editCategory}
          onOpenChange={(o) => {
            if (!o) setEditCategory(null);
          }}
        />
      )}

      <RemoveBlogCategoryConfirmation
        open={!!deleteCategory}
        onOpenChange={(o) => {
          if (!o) setDeleteCategory(null);
        }}
        categoryName={deleteCategory?.name}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

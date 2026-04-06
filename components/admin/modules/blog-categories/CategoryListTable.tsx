'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontalIcon,
  NotebookPenIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import DeleteAlertDialog from '@/components/shared/dialogs/DeleteAlertDialog';
import { Badge } from '@/components/ui/badge';
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
import { deleteBlogCategory } from '@/domains/blog-categories/services';
import type { BlogCategory } from '@/domains/blog-categories/types';
import { useTable } from '@/lib/table';

import BlogCategoryFilters from './CategoryFilters';
import BlogCategorySheet from './CategorySheet';

function getTranslationName(
  category: BlogCategory,
  locale: 'en' | 'my',
): string {
  return category.translations.find((t) => t.locale === locale)?.name ?? '—';
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
        throw new Error(response.message || 'Failed to delete category.');
      }
    },
    onSuccess: () => {
      toast.success('Category deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.LIST],
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

  const { rows, controls } = useTable<BlogCategory>(
    ENDPOINTS.ADMIN.MODULES.BLOG_CATEGORIES.LIST,
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
        searchPlaceholder='Search categories…'
        filters={
          <BlogCategoryFilters
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
              <TableHead className='w-[30%]'>Name (EN)</TableHead>
              <TableHead className='w-[30%]'>Name (MY)</TableHead>
              <TableHead className='w-[20%]'>Status</TableHead>
              <TableHead className='w-[20%] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 3 }).map((_, row) => (
                <TableRow key={`skeleton-${row}`}>
                  {Array.from({ length: 4 }).map((_, col) => (
                    <TableCell key={col} className='py-3'>
                      <Skeleton className='h-8 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!showSkeleton && query.isError && (
              <TableRow>
                <TableCell
                  colSpan={4}
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
                  <TableCell colSpan={4} className='py-14'>
                    <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
                      <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
                        <NotebookPenIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No blog categories yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Categories will appear here once you start organising
                        your blog content.
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
                      {getTranslationName(category, 'en')}
                    </p>
                  </TableCell>
                  <TableCell className='min-w-0 py-2.5 align-middle'>
                    <p className='text-foreground truncate text-sm'>
                      {getTranslationName(category, 'my')}
                    </p>
                  </TableCell>
                  <TableCell className='py-2.5 align-middle'>
                    <Badge
                      variant={category.is_active ? 'default' : 'secondary'}
                      className='font-normal'
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
        <BlogCategorySheet
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
              {deleteCategory ? getTranslationName(deleteCategory, 'en') : ''}
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

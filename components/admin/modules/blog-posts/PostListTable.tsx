'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useOptimistic, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
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
import { deleteBlogPost, updateBlogPost } from '@/domains/blogs/services';
import type { AdminBlogPost, BlogPostStatus } from '@/domains/blogs/types';
import { useTable } from '@/lib/table';

import BlogPostFilters from './PostFilters';

const STATUS_OPTIONS: { value: BlogPostStatus; label: string; dot: string }[] =
  [
    { value: 'draft', label: 'Draft', dot: 'bg-muted-foreground' },
    { value: 'published', label: 'Published', dot: 'bg-emerald-500' },
    { value: 'archived', label: 'Archived', dot: 'bg-amber-500' },
  ];

type StatusSelectProps = {
  post: AdminBlogPost;
};

function StatusSelect({ post }: StatusSelectProps) {
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(post.status);

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: async (status: BlogPostStatus) => {
      const response = await updateBlogPost(post.id, { status });
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to update status.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.LIST],
      });
      toast.success('Status updated.');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to update status.');
    },
  });

  const current = STATUS_OPTIONS.find((o) => o.value === optimisticStatus);

  return (
    <Select
      value={optimisticStatus}
      disabled={isPending}
      onValueChange={(val) => {
        const next = val as BlogPostStatus;
        startTransition(() => setOptimisticStatus(next));
        changeStatus(next);
      }}
    >
      <SelectTrigger
        size='sm'
        className='border-border/60 bg-background h-7 w-fit cursor-pointer gap-1.5 rounded-full px-2.5 text-xs font-medium shadow-none disabled:cursor-not-allowed'
      >
        {isPending ? (
          <Spinner className='size-3' />
        ) : (
          <span className={`size-1.5 rounded-full ${current?.dot}`} />
        )}
        <span className={isPending ? 'text-muted-foreground' : ''}>
          {current?.label}
        </span>
      </SelectTrigger>
      <SelectContent position='popper' align='start'>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className='text-xs'>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function BlogPostListTable() {
  const queryClient = useQueryClient();
  const [deletePost, setDeletePost] = useState<AdminBlogPost | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteBlogPost(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete post.');
      }
    },
    onSuccess: () => {
      toast.success('Post deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete post.');
    },
  });

  const handleDelete = async () => {
    if (!deletePost) return;
    try {
      await confirmDelete(deletePost.id);
      setDeletePost(null);
    } catch {
      // onError already toasts
    }
  };

  const { rows, controls } = useTable<AdminBlogPost>(
    ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );

  const statusFilter = useMemo(() => {
    const v = controls.params.values.status;
    if (v === 'draft') return 'draft' as const;
    if (v === 'published') return 'published' as const;
    if (v === 'archived') return 'archived' as const;
    return 'all' as const;
  }, [controls.params.values.status]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load posts.';

  return (
    <>
      <TableListShell
        controls={controls}
        filters={
          <BlogPostFilters
            status={statusFilter}
            onStatusChange={(next) => {
              if (next === 'all') {
                controls.params.clear(['status']);
                return;
              }
              controls.params.set({ status: next });
            }}
          />
        }
      >
        <Table className='min-w-120 table-fixed'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='w-[65%]'>Title</TableHead>
              <TableHead className='w-[25%]'>Status</TableHead>
              <TableHead className='w-[10%] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 3 }).map((_, row) => (
                <TableRow key={`skeleton-${row}`}>
                  {Array.from({ length: 3 }).map((_, col) => (
                    <TableCell key={col} className='py-3'>
                      <Skeleton className='h-8 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!showSkeleton && query.isError && (
              <TableRow>
                <TableCell
                  colSpan={3}
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
                  <TableCell colSpan={3} className='py-14'>
                    <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
                      <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
                        <FileTextIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No blog posts yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Posts will appear here once you start creating content.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((post) => {
                const enTitle =
                  post.translations.find((t) => t.locale === 'en')?.title ??
                  post.translations[0]?.title ??
                  '—';
                const myTitle = post.translations.find(
                  (t) => t.locale === 'my',
                )?.title;

                return (
                  <TableRow key={post.id} className='border-border/80'>
                    <TableCell className='min-w-0 py-2.5 align-middle'>
                      <p className='text-foreground truncate text-sm font-medium'>
                        {enTitle}
                      </p>
                      {myTitle && (
                        <p className='text-muted-foreground mt-0.5 truncate text-xs'>
                          {myTitle}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className='py-2 align-middle'>
                      <StatusSelect post={post} />
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
                            asChild
                            className='flex cursor-pointer items-center gap-2'
                          >
                            <Link
                              href={ROUTES.ADMIN.MODULES.BLOG_POSTS.EDIT(
                                String(post.id),
                              )}
                            >
                              <PencilIcon className='size-3.5' />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                            onClick={() => setDeletePost(post)}
                          >
                            <Trash2Icon className='size-3.5' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableListShell>

      <DeleteAlertDialog
        open={!!deletePost}
        onOpenChange={(o) => {
          if (!o) setDeletePost(null);
        }}
        title='Delete Post'
        description={
          <>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </>
        }
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

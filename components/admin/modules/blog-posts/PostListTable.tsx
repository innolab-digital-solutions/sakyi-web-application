'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  ArchiveIcon,
  CheckCircle2Icon,
  FilePenLineIcon,
  SquarePenIcon,
  Trash2Icon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ComponentType, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import PublishedMarketingTitleLink from '@/components/admin/shared/PublishedMarketingTitleLink';
import BlogPostRemovalBlockedAlert from '@/components/admin/modules/blog-posts/BlogPostRemovalBlockedAlert';
import BlogPostFilters, {
  type BlogPostListLocale,
} from '@/components/admin/modules/blog-posts/PostFilters';
import RemoveBlogPostConfirmation from '@/components/admin/modules/blog-posts/RemoveBlogPostConfirmation';
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
import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import { MARKETING_ROUTES, ROUTES } from '@/config/routes';
import { deleteBlogPost } from '@/domains/blogs/services';
import type { AdminBlogPost, BlogPostStatus } from '@/domains/blogs/types';
import { useTable } from '@/lib/table';
import { resolveMarketingSiteUrl } from '@/lib/utils/url';

const BLOG_POST_LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.LIST;

const FALLBACK_THUMBNAIL = '/images/logo-gray.png';

function resolvePostThumbnailUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return FALLBACK_THUMBNAIL;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

/** Same 40×40 shell and Next `Image` behavior as enrollment `ProgramThumbnail`. */
function BlogPostThumbnail({
  thumbnailUrl,
}: {
  thumbnailUrl: string | null | undefined;
}) {
  const [useFallback, setUseFallback] = useState(() => !thumbnailUrl?.trim());
  const resolved = resolvePostThumbnailUrl(thumbnailUrl);
  const src = useFallback ? FALLBACK_THUMBNAIL : resolved;
  const unoptimized = src.startsWith('http://') || src.startsWith('https://');

  return (
    <div className='bg-muted border-border relative size-10 shrink-0 overflow-hidden rounded-md border'>
      <Image
        src={src}
        alt=''
        width={40}
        height={40}
        unoptimized={unoptimized}
        className='size-full object-cover'
        onError={() => setUseFallback(true)}
        aria-hidden
      />
    </div>
  );
}

const COLUMN_COUNT = 6;

const SKELETON_WIDTHS = [
  'w-56',
  'w-28',
  'w-28',
  'w-28',
  'w-24',
  'w-36',
] as const;

const STATUS_LABEL: Record<BlogPostStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const BLOG_POST_STATUS_STYLES: Record<
  BlogPostStatus,
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  draft: {
    icon: FilePenLineIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  published: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  archived: {
    icon: ArchiveIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
};

function listLocaleFromParams(raw: string | undefined): BlogPostListLocale {
  return raw === 'my' ? 'my' : 'en';
}

/** Same date pattern as enrollment list (`dd-MMMM-yyyy`). */
function resolvePublishedBlogPostMarketingUrl(
  post: AdminBlogPost,
): string | null {
  if (post.status !== 'published') return null;
  const slug = post.slug?.trim();
  if (!slug) return null;
  return resolveMarketingSiteUrl(MARKETING_ROUTES.BLOG_POST(slug));
}

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

export default function BlogPostListTable() {
  const queryClient = useQueryClient();
  const [deletePost, setDeletePost] = useState<AdminBlogPost | null>(null);
  const [blockedDeletePost, setBlockedDeletePost] =
    useState<AdminBlogPost | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteBlogPost(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove post.');
      }
    },
    onSuccess: () => {
      toast.success('The blog post has been removed successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', BLOG_POST_LIST_ENDPOINT],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove post.');
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

  const handleDeleteClick = (post: AdminBlogPost) => {
    if (post.actions.deletable) {
      setDeletePost(post);
      return;
    }

    setBlockedDeletePost(post);
  };

  const { rows, controls } = useTable<AdminBlogPost>(BLOG_POST_LIST_ENDPOINT, {
    params: {
      sync: true,
      writeInitialToUrl: true,
      initial: { locale: 'en' },
      extra: {
        mode: 'allowlist',
        allowlist: ['status', 'locale'],
      },
    },
  });

  const listLocale = listLocaleFromParams(controls.params.values.locale);

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
      : 'Could not load blog posts.';

  return (
    <>
      <TableListShell
        controls={controls}
        searchPlaceholder='Search ...'
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
            locale={listLocale}
            onLocaleChange={(next) => {
              controls.params.set({ locale: next });
            }}
          />
        }
      >
        <Table className='w-full min-w-5xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Post</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Status</TableHead>
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
                  title='No Blog Post Found'
                  description='No blog posts found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((post) => {
                const publishedAt = formatDateCell(
                  post.timestamps?.published_at,
                );

                const statusStyle = BLOG_POST_STATUS_STYLES[post.status];
                const StatusIcon = statusStyle.icon;
                const titleLabel = post.title?.trim() || '—';
                const marketingUrl = resolvePublishedBlogPostMarketingUrl(post);

                return (
                  <TableRow key={post.id}>
                    <TableCell className='align-center min-w-96 whitespace-normal'>
                      <div className='flex items-start gap-3'>
                        <BlogPostThumbnail thumbnailUrl={post.thumbnail} />
                        <div className='min-w-0 flex-1 space-y-1'>
                          {marketingUrl ? (
                            <PublishedMarketingTitleLink
                              title={titleLabel}
                              href={marketingUrl}
                            />
                          ) : (
                            <p className='text-foreground line-clamp-1 text-[13px] font-semibold wrap-break-word'>
                              {titleLabel}
                            </p>
                          )}
                          <p className='text-muted-foreground line-clamp-1 text-xs leading-snug font-medium wrap-break-word'>
                            {post.excerpt?.trim() || post.slug || '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='align-center min-w-48 whitespace-normal'>
                      {post.blog_category?.name?.trim() ? (
                        <p className='text-foreground/80 wrap-break-word'>
                          {post.blog_category.name.trim()}
                        </p>
                      ) : (
                        <TableCellEmpty label='Uncategorized' />
                      )}
                    </TableCell>
                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {publishedAt ?? <TableCellEmpty label='Not published' />}
                    </TableCell>

                    <TableCell className='align-center'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                      >
                        <StatusIcon className='size-3.5 shrink-0' />
                        {STATUS_LABEL[post.status]}
                      </span>
                    </TableCell>
                    <TableCell className='align-center whitespace-nowrap'>
                      <div className='flex flex-nowrap items-center justify-start gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-foreground bg-background hover:bg-muted h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                          asChild
                        >
                          <Link
                            href={ROUTES.ADMIN.MODULES.BLOG_POSTS.EDIT(
                              String(post.id),
                            )}
                          >
                            <SquarePenIcon className='size-3.5' />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-9 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                          onClick={() => handleDeleteClick(post)}
                        >
                          <Trash2Icon className='size-3.5' />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableListShell>

      <RemoveBlogPostConfirmation
        open={!!deletePost}
        onOpenChange={(o) => {
          if (!o) setDeletePost(null);
        }}
        postTitle={deletePost?.title}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
      <BlogPostRemovalBlockedAlert
        open={!!blockedDeletePost}
        onOpenChange={(o) => {
          if (!o) setBlockedDeletePost(null);
        }}
        postTitle={blockedDeletePost?.title}
        reason={blockedDeletePost?.actions.delete_block_reason ?? undefined}
      />
    </>
  );
}

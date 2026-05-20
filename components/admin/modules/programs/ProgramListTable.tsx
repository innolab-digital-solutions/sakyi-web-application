'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  ArchiveIcon,
  CheckCircle2Icon,
  EyeOffIcon,
  FilePenLineIcon,
  SquarePenIcon,
  Trash2Icon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type ComponentType, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import ProgramFilters, {
  type ProgramListLocale,
  type ProgramTableStatusFilter,
} from '@/components/admin/modules/programs/ProgramFilters';
import ProgramRemovalBlockedAlert from '@/components/admin/modules/programs/ProgramRemovalBlockedAlert';
import RemoveProgramConfirmation from '@/components/admin/modules/programs/RemoveProgramConfirmation';
import PublishedMarketingTitleLink from '@/components/admin/shared/PublishedMarketingTitleLink';
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
import { STATUS } from '@/domains/programs/constants';
import { deleteProgram } from '@/domains/programs/services';
import type { Program } from '@/domains/programs/types/admin';
import { useTable } from '@/lib/table';
import { resolveMarketingSiteUrl } from '@/lib/utils/url';

const FALLBACK_THUMBNAIL = '/images/logo-gray.png';

function resolveProgramThumbnailUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return FALLBACK_THUMBNAIL;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

/** Same 40×40 shell and Next `Image` behavior as enrollment `ProgramThumbnail`. */
function ProgramThumbnail({
  thumbnailUrl,
}: {
  thumbnailUrl: string | null | undefined;
}) {
  const [useFallback, setUseFallback] = useState(() => !thumbnailUrl?.trim());
  const resolved = resolveProgramThumbnailUrl(thumbnailUrl);
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

const COLUMN_COUNT = 8;

const SKELETON_WIDTHS = [
  'w-20',
  'w-56',
  'w-32',
  'w-24',
  'w-28',
  'w-28',
  'w-20',
  'w-36',
] as const;

const STATUS_LABEL: Record<Program['status'], string> = {
  [STATUS.DRAFT]: 'Draft',
  [STATUS.PUBLISHED]: 'Published',
  [STATUS.ARCHIVED]: 'Archived',
  [STATUS.HIDDEN]: 'Hidden',
};

const PROGRAM_STATUS_STYLES: Record<
  Program['status'],
  {
    icon: ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  [STATUS.DRAFT]: {
    icon: FilePenLineIcon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  [STATUS.PUBLISHED]: {
    icon: CheckCircle2Icon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  [STATUS.ARCHIVED]: {
    icon: ArchiveIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
  [STATUS.HIDDEN]: {
    icon: EyeOffIcon,
    className:
      'border-neutral-300/80 bg-neutral-50 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950/40 dark:text-neutral-200',
  },
};

/** Same date pattern as enrollment and blog post lists (`dd-MMMM-yyyy`). */
function resolvePublishedProgramMarketingUrl(program: Program): string | null {
  if (program.status !== STATUS.PUBLISHED) return null;
  const slug = program.slug?.trim();
  if (!slug) return null;
  return resolveMarketingSiteUrl(MARKETING_ROUTES.PROGRAM(slug));
}

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function formatProgramPrice(program: Program): string {
  const amount =
    typeof program.price === 'number' ? program.price : program.price?.amount;
  const currency =
    typeof program.price === 'number'
      ? 'MMK'
      : (program.price?.currency ?? 'MMK').trim() || 'MMK';
  if (amount == null || Number.isNaN(amount)) return '—';
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(amount)} ${currency.toUpperCase()}`;
}

function stripHtmlToPlain(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Duration, else goal names (short), else em dash — matches `Program` admin shape. */
function getTrackLabel(program: Program): string {
  const duration = program.duration?.trim();
  if (duration) return duration;

  const goals = program.goals;
  if (goals?.length) {
    return goals
      .slice(0, 2)
      .map((g) => g.name)
      .join(', ');
  }

  return '—';
}

function getProgramTitle(program: Program): string {
  if (program.title?.trim()) return program.title.trim();
  if (program.code?.trim()) return program.code.trim();
  if (program.slug?.trim()) return program.slug.trim();
  return '—';
}

function getProgramSubtitle(program: Program): string {
  if (program.tagline?.trim()) return program.tagline.trim();
  const plain = stripHtmlToPlain(program.excerpt ?? '');
  if (plain) return plain;
  if (program.code?.trim() && program.title?.trim()) return program.code.trim();
  return '—';
}

function listLocaleFromParams(raw: string | undefined): ProgramListLocale {
  return raw === 'my' ? 'my' : 'en';
}

export default function ProgramListTable() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [blockedDeleteTarget, setBlockedDeleteTarget] =
    useState<Program | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteProgram(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete program.');
      }
    },
    onSuccess: () => {
      toast.success('The program has been removed successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete program.');
    },
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await confirmDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // onError already toasts; swallow so unhandled rejection is avoided
    }
  };

  const handleDeleteClick = (program: Program) => {
    if (program.actions.deletable) {
      setDeleteTarget(program);
      return;
    }
    setBlockedDeleteTarget(program);
  };

  const { rows, controls } = useTable<Program>(
    ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
        initial: { locale: 'en' },
        extra: {
          mode: 'allowlist',
          allowlist: ['status', 'locale'],
        },
      },
    },
  );

  const listLocale = listLocaleFromParams(controls.params.values.locale);

  const statusFilter = useMemo(():
    | ProgramTableStatusFilter
    | typeof STATUS.ARCHIVED => {
    const v = controls.params.values.status;
    if (v === STATUS.DRAFT) return STATUS.DRAFT;
    if (v === STATUS.PUBLISHED) return STATUS.PUBLISHED;
    if (v === STATUS.HIDDEN) return STATUS.HIDDEN;
    if (v === STATUS.ARCHIVED) return STATUS.ARCHIVED;
    return 'all';
  }, [controls.params.values.status]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load programs.';

  return (
    <>
      <TableListShell
        controls={controls}
        searchPlaceholder='Search ...'
        filters={
          <ProgramFilters
            status={statusFilter}
            onStatusChange={(next: ProgramTableStatusFilter) => {
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
              <TableHead>Reference</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled</TableHead>
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
                  title='No Care Programs Found'
                  description='No care programs found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((program) => {
                const publishedAt = formatDateCell(
                  program.timestamps.published_at,
                );
                const statusStyle = PROGRAM_STATUS_STYLES[program.status];
                const StatusIcon = statusStyle.icon;
                const priceLabel = formatProgramPrice(program);
                const programTitle = getProgramTitle(program);
                const marketingUrl =
                  resolvePublishedProgramMarketingUrl(program);
                return (
                  <TableRow key={program.id}>
                    <TableCell className='min-w-42'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {program.code.trim()}
                      </p>
                    </TableCell>

                    <TableCell className='min-w-72'>
                      <div className='flex items-start gap-3'>
                        <ProgramThumbnail
                          thumbnailUrl={program.thumbnail_url}
                        />
                        <div className='min-w-0 flex-1 space-y-1'>
                          {marketingUrl ? (
                            <PublishedMarketingTitleLink
                              title={programTitle}
                              href={marketingUrl}
                            />
                          ) : (
                            <p className='text-foreground line-clamp-1 text-[13px] font-semibold wrap-break-word'>
                              {programTitle}
                            </p>
                          )}
                          <p className='text-muted-foreground line-clamp-1 text-xs leading-snug font-medium wrap-break-word'>
                            {getProgramSubtitle(program)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p
                        className='line-clamp-2 text-[13px] wrap-break-word'
                        title={getTrackLabel(program)}
                      >
                        {getTrackLabel(program)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {priceLabel === '—' ? (
                        <TableCellEmpty label='Not set' />
                      ) : (
                        priceLabel
                      )}
                    </TableCell>
                    <TableCell className='min-w-40'>
                      {publishedAt ?? <TableCellEmpty label='Not published' />}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyle.className}`}
                      >
                        <StatusIcon className='size-3.5 shrink-0' />
                        {STATUS_LABEL[program.status]}
                      </span>
                    </TableCell>

                    <TableCell className='min-w-36'>
                      {program.enrolled_count != null &&
                      !Number.isNaN(program.enrolled_count) ? (
                        program.enrolled_count.toLocaleString()
                      ) : (
                        <TableCellEmpty label='Not available' />
                      )}
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-nowrap items-center justify-start gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-foreground bg-background hover:bg-muted h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                          asChild
                        >
                          <Link
                            href={ROUTES.ADMIN.MODULES.PROGRAMS.EDIT(
                              String(program.id),
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
                          onClick={() => handleDeleteClick(program)}
                        >
                          <Trash2Icon className='size-3.5' />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableListShell>

      <RemoveProgramConfirmation
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        programName={
          deleteTarget?.title?.trim() ||
          deleteTarget?.code ||
          (deleteTarget ? `program #${deleteTarget.id}` : undefined)
        }
        onConfirm={handleDelete}
        isRemoving={isDeleting}
      />
      <ProgramRemovalBlockedAlert
        open={blockedDeleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setBlockedDeleteTarget(null);
        }}
        programName={
          blockedDeleteTarget?.title?.trim() ||
          blockedDeleteTarget?.code ||
          (blockedDeleteTarget
            ? `program #${blockedDeleteTarget.id}`
            : undefined)
        }
        reason={blockedDeleteTarget?.actions.delete_block_reason ?? undefined}
      />
    </>
  );
}

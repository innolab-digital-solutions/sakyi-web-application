'use client';

import { format, parseISO } from 'date-fns';
import { ClipboardListIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import TableListShell from '@/components/admin/layout/TableListShell';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { ROUTES } from '@/config/routes';
import type { AdminEnrollment } from '@/domains/enrollment-records/types/admin';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.LIST;

const COLUMN_COUNT = 8;

const SKELETON_WIDTHS = [
  'w-24',
  'w-44',
  'w-48',
  'w-24',
  'w-28',
  'w-28',
  'w-28',
  'w-20',
] as const;

const PROGRAM_THUMBNAIL_FALLBACK = '/images/logo-gray.png';

function resolveClientPictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function resolveProgramThumbnailUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return PROGRAM_THUMBNAIL_FALLBACK;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function ProgramThumbnail({
  thumbnailUrl,
}: {
  thumbnailUrl: string | null | undefined;
}) {
  const [useFallback, setUseFallback] = useState(() => !thumbnailUrl?.trim());
  const src = useFallback
    ? PROGRAM_THUMBNAIL_FALLBACK
    : resolveProgramThumbnailUrl(thumbnailUrl);
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

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

function formatStatusLabel(raw: string): string {
  return raw
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function getEnrollmentReference(row: AdminEnrollment): string {
  const code = row.code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

function getProgramLabel(row: AdminEnrollment): string {
  if (row.program?.title?.trim()) return row.program.title.trim();
  if (row.program?.slug?.trim()) return row.program.slug.trim();
  return '—';
}

function getProgramCode(row: AdminEnrollment): string {
  const code = row.program?.code?.trim();
  if (code) return code;
  if (row.program?.id != null) return `ID ${row.program.id}`;
  return '—';
}

export default function EnrollmentRecordListTable() {
  const { rows, controls } = useTable<AdminEnrollment>(LIST_ENDPOINT, {
    params: {
      sync: true,
      writeInitialToUrl: true,
    },
  });

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load enrollment records.';

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search reference, client, program, or contract code'
    >
      <Table className='w-full min-w-7xl'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead>Reference</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='tabular-nums'>Starts</TableHead>
            <TableHead className='tabular-nums'>Ends</TableHead>
            <TableHead className='tabular-nums'>Updated</TableHead>
            <TableHead className='text-end'>Actions</TableHead>
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
                icon={ClipboardListIcon}
                title='No enrollment records'
                description='Active and historical program enrollments appear here once clients complete intake and contracts.'
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((row) => {
              const pictureSrc = resolveClientPictureUrl(
                row.client?.picture_url,
              );
              const programLabel = getProgramLabel(row);
              const programCode = getProgramCode(row);
              const updatedAt = formatDateCell(row.timestamps?.updated_at);
              const startsAt = formatDateCell(row.starts_at);
              const endsAt = formatDateCell(row.ends_at);

              return (
                <TableRow key={row.id}>
                  <TableCell className='align-center min-w-36 whitespace-normal'>
                    <p className='text-foreground text-[13px] font-semibold'>
                      {getEnrollmentReference(row)}
                    </p>
                  </TableCell>
                  <TableCell className='align-center whitespace-normal'>
                    <div className='flex items-start gap-3'>
                      <Avatar
                        size='default'
                        className='mt-0.5 shrink-0'
                        aria-hidden
                      >
                        {pictureSrc ? (
                          <AvatarImage src={pictureSrc} alt='' />
                        ) : null}
                        <AvatarFallback className='text-xs'>
                          {getInitials(row.client?.name ?? '', 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1 space-y-1'>
                        <p className='text-foreground text-[13px] font-semibold'>
                          {row.client?.name?.trim() ? (
                            row.client.name.trim()
                          ) : (
                            <TableCellEmpty label='Name not provided' />
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                          {row.client?.email?.trim() ?? 'No email on file'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='align-center min-w-72 whitespace-normal'>
                    <div className='flex items-start gap-3'>
                      <ProgramThumbnail
                        thumbnailUrl={row.program?.thumbnail_url}
                      />
                      <div className='min-w-0 flex-1 space-y-1'>
                        <p className='text-foreground text-[13px] font-semibold'>
                          {programLabel !== '—' ? (
                            programLabel
                          ) : (
                            <TableCellEmpty label='No program linked' />
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                          {programCode !== '—' ? (
                            programCode
                          ) : (
                            <TableCellEmpty label='No program code' />
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='align-center'>
                    <span className='border-border bg-muted/60 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold'>
                      {formatStatusLabel(row.status || 'unknown')}
                    </span>
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center text-[13px] tabular-nums'>
                    {startsAt ?? <TableCellEmpty label='—' />}
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center text-[13px] tabular-nums'>
                    {endsAt ?? <TableCellEmpty label='—' />}
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center text-[13px] tabular-nums'>
                    {updatedAt ?? <TableCellEmpty label='—' />}
                  </TableCell>
                  <TableCell className='align-center text-end'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-9 rounded-md text-[13px] font-semibold'
                      asChild
                    >
                      <Link
                        href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                          String(row.id),
                        )}
                      >
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableListShell>
  );
}

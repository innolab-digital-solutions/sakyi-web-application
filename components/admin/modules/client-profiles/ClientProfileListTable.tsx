'use client';

import { format, parseISO } from 'date-fns';
import { UserRoundIcon } from 'lucide-react';
import Link from 'next/link';

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
import type { ClientProfile } from '@/domains/client-profiles/types/admin';
import { useTable } from '@/lib/table';
import { getInitials } from '@/lib/utils/string';

const LIST_ENDPOINT = ENDPOINTS.ADMIN.MODULES.CLIENT_PROFILES.LIST;

const COLUMN_COUNT = 5;

const SKELETON_WIDTHS = ['w-48', 'w-28', 'w-20', 'w-28', 'w-24'] as const;

function resolveProfilePictureUrl(
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (t.startsWith('http')) return t;
  return `${base.domainEndpoint}${t}`;
}

function formatDateCell(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  try {
    return format(parseISO(iso), 'dd-MMMM-yyyy');
  } catch {
    return iso.trim();
  }
}

export default function ClientProfileListTable() {
  const { rows, controls } = useTable<ClientProfile>(LIST_ENDPOINT, {
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
      : 'Could not load client profiles.';

  return (
    <TableListShell
      controls={controls}
      searchPlaceholder='Search name, email, or client code'
    >
      <Table className='w-full min-w-5xl'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead>Client</TableHead>
            <TableHead>Client code</TableHead>
            <TableHead className='tabular-nums'>Enrollments</TableHead>
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
                icon={UserRoundIcon}
                title='No client profiles yet'
                description='Clients who complete onboarding and enrollment will appear here with their account details and enrollment counts.'
              />
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((row) => {
              const pictureSrc = resolveProfilePictureUrl(
                row.profile?.picture_url,
              );
              const updatedAt = formatDateCell(row.timestamps?.updated_at);

              return (
                <TableRow key={row.id}>
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
                          {getInitials(row.name ?? '', 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1 space-y-1'>
                        <p className='text-foreground text-[13px] font-semibold'>
                          {row.name?.trim() ? (
                            row.name.trim()
                          ) : (
                            <TableCellEmpty label='Name not provided' />
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs leading-snug font-medium wrap-break-word'>
                          {row.email?.trim() ?? 'No email on file'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center'>
                    {row.client_code?.trim() ? (
                      <span className='text-[13px] font-semibold'>
                        {row.client_code.trim()}
                      </span>
                    ) : (
                      <TableCellEmpty label='No code' />
                    )}
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center tabular-nums'>
                    {row.enrollments_count ?? 0}
                  </TableCell>
                  <TableCell className='text-foreground/80 align-center tabular-nums'>
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
                        href={ROUTES.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(
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

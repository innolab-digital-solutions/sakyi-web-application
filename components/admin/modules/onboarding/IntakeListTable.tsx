'use client';

import { format, parseISO } from 'date-fns';
import { EyeIcon, PencilIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';

import TableListWrapper from '@/components/admin/layout/TableListWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ROUTES } from '@/config/routes';
import type { OnboardingIntakeData } from '@/domains/onboarding/types/admin';
import { useTable } from '@/lib/table';

const STATUS_LABEL: Record<OnboardingIntakeData['status'], string> = {
  draft: 'Draft',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function getStatusBadgeVariant(
  status: OnboardingIntakeData['status'],
): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'completed') return 'default';
  if (status === 'draft' || status === 'in_progress') return 'secondary';
  if (status === 'cancelled') return 'destructive';
  return 'outline';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

export default function IntakeListTable() {
  const { rows, controls } = useTable<OnboardingIntakeData>(
    ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.LIST,
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
      : 'Could not load onboarding intakes.';

  return (
    <TableListWrapper
      controls={controls}
      searchPlaceholder='Search by notes...'
    >
      <div className='mb-4 flex justify-end'>
        <Button asChild>
          <Link href={ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.CREATE}>
            <PlusIcon className='size-4' />
            Start intake
          </Link>
        </Button>
      </div>
      <Table className='min-w-180 table-fixed'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead className='w-[12%]'>ID</TableHead>
            <TableHead className='w-[18%]'>Status</TableHead>
            <TableHead className='w-[22%]'>Client</TableHead>
            <TableHead className='w-[18%]'>Template</TableHead>
            <TableHead className='w-[15%]'>Updated</TableHead>
            <TableHead className='w-[15%] text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton &&
            Array.from({ length: 3 }).map((_, row) => (
              <TableRow key={`skeleton-${row}`}>
                {Array.from({ length: 6 }).map((__, col) => (
                  <TableCell key={col} className='py-3'>
                    <Skeleton className='h-8 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!showSkeleton && query.isError && (
            <TableRow>
              <TableCell
                colSpan={6}
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
                <TableCell
                  colSpan={6}
                  className='text-muted-foreground py-10 text-center text-sm'
                >
                  No intakes yet.
                </TableCell>
              </TableRow>
            )}

          {!showSkeleton &&
            !query.isError &&
            query.data?.status === 'success' &&
            rows.map((intake) => (
              <TableRow key={intake.id}>
                <TableCell>#{intake.id}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(intake.status)}>
                    {STATUS_LABEL[intake.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>
                      {intake.user?.name ?? '—'}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {intake.user?.email ?? 'No email'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='text-sm'>
                  {intake.template?.title ?? '—'}
                </TableCell>
                <TableCell className='text-sm'>
                  {formatDate(intake.timestamps.updated_at)}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-1'>
                    <Button variant='ghost' size='sm' asChild>
                      <Link
                        href={ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.DETAIL(
                          String(intake.id),
                        )}
                      >
                        <EyeIcon className='size-3.5' />
                        View
                      </Link>
                    </Button>
                    {intake.status !== 'completed' &&
                      intake.status !== 'cancelled' && (
                        <Button variant='ghost' size='sm' asChild>
                          <Link
                            href={ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.INTERVIEW(
                              String(intake.id),
                            )}
                          >
                            <PencilIcon className='size-3.5' />
                            Continue
                          </Link>
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableListWrapper>
  );
}

import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AdminDetailCardSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import PeriodReportOverviewView from '@/components/admin/modules/period-reports/PeriodReportOverviewView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Period report overview | SaKyi Admin',
  description:
    'Review reference, status, metrics, highlights, adherence, narrative, and operational context to decide publishing and follow-up.',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PeriodReportOverviewPage({ params }: Props) {
  const { id: idParam } = await params;
  const periodReportId = Number.parseInt(idParam, 10);
  const valid = Number.isFinite(periodReportId) && periodReportId > 0;

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Period report overview'
        description='Review reference, lifecycle, reporting window, care plan linkage, adherence, highlights, metrics, and narrative—then publish or manage from the actions on the period reports list.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link
              href={ROUTES.ADMIN.MODULES.PERIOD_REPORTS.LIST}
              aria-label='Back to period reports list'
            >
              <ArrowLeftIcon className='size-3.5' aria-hidden />
              Back to Period Reports
            </Link>
          </Button>
        }
      />

      {!valid ? (
        <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-4 text-sm'>
          Invalid period report identifier.
        </div>
      ) : (
        <Suspense fallback={<AdminDetailCardSkeleton />}>
          <PeriodReportOverviewView periodReportId={periodReportId} />
        </Suspense>
      )}
    </div>
  );
}

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
    'Review reference, lifecycle status, period window, adherence, narrative preview, and open the operational logs workspace when you need to edit metrics.',
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
        description='Confirm who this report is for, its care-plan context and reporting window, adherence snapshot, narrative preview, and operational-log linkage. Edit metrics and submit for review from the operational logs workspace when the log is editable.'
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

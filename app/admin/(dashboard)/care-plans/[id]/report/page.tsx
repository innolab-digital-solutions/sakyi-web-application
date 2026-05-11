import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AdminWorkspaceSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanReportWorkspace from '@/components/admin/modules/care-plans/CarePlanReportWorkspace';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Period report workspace | SaKyi Admin',
  description:
    'Turn daily care-plan logs into a period report: reconcile metrics, add narrative, and publish when the care team is ready for the client-facing view.',
};

type CarePlanReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarePlanReportPage({
  params,
}: CarePlanReportPageProps) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Period report workspace'
        description='Summarize the reporting period from logged activity—compare targets to actuals, refine rolled-up metrics, record care-team commentary, then publish when accurate. Drafts remain until you publish.'
        actions={
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              asChild
              className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            >
              <Link
                href={ROUTES.ADMIN.MODULES.CARE_PLANS.DETAIL(String(id))}
                aria-label='Back to care plan detail'
              >
                <ArrowLeftIcon className='size-3.5' />
                Care plan detail
              </Link>
            </Button>
            <Button
              variant='outline'
              asChild
              className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            >
              <Link
                href={ROUTES.ADMIN.MODULES.CARE_PLANS.LIST}
                aria-label='Back to all care plans'
              >
                All care plans
              </Link>
            </Button>
          </div>
        }
      />
      <Suspense fallback={<AdminWorkspaceSkeleton />}>
        {Number.isFinite(numericId) ? (
          <CarePlanReportWorkspace carePlanId={numericId} />
        ) : (
          <div className='text-destructive rounded-md border p-4 text-sm'>
            Invalid care plan id.
          </div>
        )}
      </Suspense>
    </div>
  );
}

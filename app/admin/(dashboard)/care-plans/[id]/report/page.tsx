import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanReportWorkspace from '@/components/admin/modules/care-plans/CarePlanReportWorkspace';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Period Report | SaKyi Admin',
  description:
    'Author period reports from client care-plan logs: review evidence, edit suggested metrics, add narrative, and publish for the client app.',
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
        description='Build a report from the client’s daily logs: compare targets to actuals, adjust rolled-up metrics, add care-team narrative, then publish. Drafts are saved until you publish.'
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
      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading report workspace…
          </div>
        }
      >
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

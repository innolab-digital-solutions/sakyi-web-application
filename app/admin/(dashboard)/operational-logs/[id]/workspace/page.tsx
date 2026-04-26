import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanReportWorkspace from '@/components/admin/modules/care-plans/CarePlanReportWorkspace';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Operational Logs Workspace | SaKyi Admin',
  description:
    'Review client logging evidence, author operational log outputs, and publish finalized care updates for an active or completed care plan.',
};

type OperationalLogsWorkspacePageProps = {
  params: Promise<{ id: string }>;
};

export default async function OperationalLogsWorkspacePage({
  params,
}: OperationalLogsWorkspacePageProps) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Operational logs workspace'
        description='Use client daily log evidence to prepare operational summaries, adjust computed metrics, add care-team narrative, and publish the finalized output.'
        actions={
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              asChild
              className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            >
              <Link
                href={ROUTES.ADMIN.MODULES.CARE_PLAN_LOGS.LIST}
                aria-label='Back to daily task logs'
              >
                <ArrowLeftIcon className='size-3.5' />
                Daily task logs
              </Link>
            </Button>
            <Button
              variant='outline'
              asChild
              className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            >
              <Link
                href={ROUTES.ADMIN.MODULES.CARE_PLANS.DETAIL(String(id))}
                aria-label='Back to care plan detail'
              >
                Care plan detail
              </Link>
            </Button>
          </div>
        }
      />
      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading operational logs workspace…
          </div>
        }
      >
        {Number.isFinite(numericId) ? (
          <CarePlanReportWorkspace
            carePlanId={numericId}
            workspaceLocation='operational-logs'
          />
        ) : (
          <div className='text-destructive rounded-md border p-4 text-sm'>
            Invalid care plan id.
          </div>
        )}
      </Suspense>
    </div>
  );
}

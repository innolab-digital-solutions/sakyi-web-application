import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { OperationalLogsWorkspaceFullSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanReportWorkspace from '@/components/admin/modules/care-plans/CarePlanReportWorkspace';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Operational Logs Workspace | SaKyi Admin',
  description:
    'Review evidence vs plan targets, edit the operational log metrics for this care plan, then submit for review when ready.',
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
        description='Review daily evidence against care-plan targets, record and validate operational-log metrics, then submit the log for review once values are complete and accurate.'
        actions={
          <Button
            variant='outline'
            asChild
            className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link
              href={ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.LIST}
              aria-label='Back to operational logs list'
            >
              <ArrowLeftIcon className='size-3.5' />
              Back To Operational Logs
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<OperationalLogsWorkspaceFullSkeleton />}>
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

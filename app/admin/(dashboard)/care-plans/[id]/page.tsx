import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanBuilder from '@/components/admin/modules/care-plans/CarePlanBuilder';

export const metadata: Metadata = {
  title: 'Care Plan Detail | SaKyi Admin',
  description: 'Care plan detail view for admin users.',
};

type CarePlanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarePlanDetailPage({
  params,
}: CarePlanDetailPageProps) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Care Plan Detail'
        description={`Read-focused detail view for care plan #${id}, including day sections and validation context.`}
      />
      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading care plan details…
          </div>
        }
      >
        {Number.isFinite(numericId) ? (
          <CarePlanBuilder carePlanId={numericId} mode='detail' />
        ) : (
          <div className='text-destructive rounded-md border p-4 text-sm'>
            Invalid care plan id.
          </div>
        )}
      </Suspense>
    </div>
  );
}

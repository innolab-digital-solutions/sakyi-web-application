import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminWorkspaceSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanBuilder from '@/components/admin/modules/care-plans/CarePlanBuilder';

export const metadata: Metadata = {
  title: 'Care Plan Detail | SaKyi Admin',
  description:
    'Review a single care plan in read-only mode, including day structure and validation context, so you can confirm plan quality before making updates.',
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
        description={`Review care plan #${id} in read-only mode, including day sections and validation context, to confirm structure and quality before editing.`}
      />
      <Suspense fallback={<AdminWorkspaceSkeleton />}>
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

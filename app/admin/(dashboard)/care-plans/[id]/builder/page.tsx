import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanBuilder from '@/components/admin/modules/care-plans/CarePlanBuilder';

export const metadata: Metadata = {
  title: 'Care Plan Builder | SaKyi Admin',
  description: 'Care plan builder workspace for admin users.',
};

type CarePlanBuilderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarePlanBuilderPage({
  params,
}: CarePlanBuilderPageProps) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Care Plan Builder'
        description={`Manage care plan #${id} through basics, day generation, day sections, validation, and activation.`}
      />
      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading care plan builder…
          </div>
        }
      >
        {Number.isFinite(numericId) ? (
          <CarePlanBuilder carePlanId={numericId} mode='edit' />
        ) : (
          <div className='text-destructive rounded-md border p-4 text-sm'>
            Invalid care plan id.
          </div>
        )}
      </Suspense>
    </div>
  );
}

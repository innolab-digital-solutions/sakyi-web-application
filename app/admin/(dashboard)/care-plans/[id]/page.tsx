import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { CarePlanBuilderSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanBuilder from '@/components/admin/modules/care-plans/CarePlanBuilder';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Care plan overview | SaKyi Admin',
  description:
    'Review plan reference, lifecycle status, day structure, and validation context in read-only mode before editing in the workspace or progressing operational reporting.',
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
        title='Care plan overview'
        description='Review reference, status, day-level content, and validation summaries in read-only form. Use this pass to confirm structure and clinical fit with the linked enrollment before editing in the workspace or handing off to reporting.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link
              href={ROUTES.ADMIN.MODULES.CARE_PLANS.LIST}
              aria-label='Back to care plans list'
            >
              <ArrowLeftIcon className='size-3.5' />
              Back to Care Plans
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<CarePlanBuilderSkeleton />}>
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

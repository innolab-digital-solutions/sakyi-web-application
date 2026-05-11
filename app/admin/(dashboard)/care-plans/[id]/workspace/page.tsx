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
  title: 'Care plan workspace | SaKyi Admin',
  description:
    'Edit day structure, sections, and validation for a single care plan, keep enrollment context in view, and move the plan toward activation and operational reporting.',
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
        title='Care plan workspace'
        description='Author and adjust this plan end to end—generate days, fill sections, resolve validation, and confirm activation readiness while the linked enrollment and program stay visible for context.'
        actions={
          <Button
            variant='outline'
            asChild
            className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.CARE_PLANS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to Care Plans
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<CarePlanBuilderSkeleton />}>
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

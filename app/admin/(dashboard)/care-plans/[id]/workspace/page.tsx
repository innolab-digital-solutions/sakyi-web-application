import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanBuilder from '@/components/admin/modules/care-plans/CarePlanBuilder';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Care Plan Workspace | SaKyi Admin',
  description:
    'Configure and manage a care plan in one guided workspace, from day generation to section planning, validation checks, and activation readiness.',
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
        title='Care Plan Workspace'
        description='Manage and customize every aspect of a care plan, including day generation, section tasks, scheduling, and validation before activation.'
        actions={
          <Button
            variant='outline'
            asChild
            className='bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.CARE_PLANS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to care plans
            </Link>
          </Button>
        }
      />
      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading care plan workspace…
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

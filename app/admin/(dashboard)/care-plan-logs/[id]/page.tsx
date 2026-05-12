import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanLogEntriesView from '@/components/admin/modules/care-plan-logs/CarePlanLogEntriesView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Daily task log overview | SaKyi Admin',
  description:
    'Confirm care plan reference, enrollment and program context, care window, and log progress; review every logged task with targets, actuals, notes, and media for operational follow-up.',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CarePlanLogDetailPage({ params }: Props) {
  const { id } = await params;
  const carePlanId = Number.parseInt(id, 10);
  if (Number.isNaN(carePlanId)) {
    throw new Error('Invalid care plan log id.');
  }

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Daily task log overview'
        description='Confirm reference, enrollment and program fit, the care window, and log progress at a glance; then review every recorded task with targets, actuals, notes, and supporting files linked to this care plan.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link
              href={ROUTES.ADMIN.MODULES.CARE_PLAN_LOGS.LIST}
              aria-label='Back to daily task logs list'
            >
              <ArrowLeftIcon className='size-3.5' />
              Back to Daily Task Logs
            </Link>
          </Button>
        }
      />

      <CarePlanLogEntriesView carePlanId={carePlanId} />
    </div>
  );
}

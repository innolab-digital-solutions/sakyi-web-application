import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import CarePlanLogEntriesView from '@/components/admin/modules/care-plan-logs/CarePlanLogEntriesView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Daily Task Log Detail | SaKyi Admin',
  description:
    'Review one care plan log stream with detailed task entries, section filters, completion state, date range, notes, and media context.',
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
        title='Daily Task Log Detail'
        description='Review raw daily task entries for this care plan, including target vs actual values, completion state, and media evidence.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.CARE_PLAN_LOGS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to daily task logs
            </Link>
          </Button>
        }
      />

      <CarePlanLogEntriesView carePlanId={carePlanId} />
    </div>
  );
}

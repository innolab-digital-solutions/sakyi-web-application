import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import CreateEnrollmentFromContractView from '@/components/admin/modules/enrollment-contracts/CreateEnrollmentFromContractView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Create enrollment | SaKyi Admin',
  description:
    'Create a program enrollment from a signed contract: schedule, notes, and care team roles.',
};

type EnrollPageProps = {
  params: Promise<{ contractId: string }>;
};

export default async function EnrollmentContractEnrollPage({
  params,
}: EnrollPageProps) {
  const { contractId: raw } = await params;
  const contractId = Number.parseInt(raw, 10);

  if (Number.isNaN(contractId)) {
    throw new Error('Invalid contract id.');
  }

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Create enrollment'
        description='Assign start and end dates, optional notes, and at least one care team member with a role. Submitting creates the enrollment record linked to this signed contract.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to contracts
            </Link>
          </Button>
        }
      />

      <CreateEnrollmentFromContractView contractId={contractId} />
    </div>
  );
}

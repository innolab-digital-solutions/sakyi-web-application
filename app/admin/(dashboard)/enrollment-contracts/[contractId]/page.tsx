import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentContractDetailView from '@/components/admin/modules/enrollment-contracts/EnrollmentContractDetailView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Contract & E-Signature Overview | SaKyi Admin',
  description:
    'Review e-signature status and timestamps, confirm the applicant tied to this contract, jump to intake and enrollment request records, and create or open the program enrollment when eligible.',
};

type EnrollmentContractDetailPageProps = {
  params: Promise<{ contractId: string }>;
};

export default async function EnrollmentContractDetailPage({
  params,
}: EnrollmentContractDetailPageProps) {
  const { contractId: raw } = await params;
  const contractId = Number.parseInt(raw, 10);

  if (Number.isNaN(contractId)) {
    throw new Error('Invalid contract id.');
  }

  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Contract & E-Signature Overview'
        description='See signers, review timeline events, confirm applicant, access intake and request records, and manage program enrollment after signing.'
        actions={
          <Button
            asChild
            variant='outline'
            className='bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link
              href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.LIST}
              aria-label='Back to enrollment contracts list'
            >
              <ArrowLeftIcon className='size-3.5' />
              Back to contracts
            </Link>
          </Button>
        }
      />

      <EnrollmentContractDetailView contractId={contractId} />
    </div>
  );
}

import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentContractDetailView from '@/components/admin/modules/enrollment-contracts/EnrollmentContractDetailView';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Enrollment contract | SaKyi Admin',
  description:
    'Review one enrollment contract with applicant details, e-signature progress, related intake and request records, and clear options for enrollment follow-up.',
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
        title='Enrollment contract'
        description='Get complete context for this e-signature case, including ownership, signature timeline, linked intake and request records, and enrollment actions.'
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

      <EnrollmentContractDetailView contractId={contractId} />
    </div>
  );
}

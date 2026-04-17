import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentContractListTable from '@/components/admin/modules/enrollment-contracts/EnrollmentContractListTable';

export const metadata: Metadata = {
  title: 'Contracts & E-Signatures | SaKyi Admin',
  description:
    'Review post-intake enrollment contracts: confirm notifications and e-signatures, and track status with linked intakes and enrollment requests.',
};

export default function EnrollmentContractsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Contracts & E-Signatures'
        description='Review enrollment contracts after intake, confirm notification and signature status, and cross-check each case with linked intakes and enrollment requests.'
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground text-sm'>Loading...</div>
        }
      >
        <EnrollmentContractListTable />
      </Suspense>
    </div>
  );
}

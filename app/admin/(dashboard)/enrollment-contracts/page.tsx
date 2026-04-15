import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentContractListTable from '@/components/admin/modules/enrollment-contracts/EnrollmentContractListTable';

export const metadata: Metadata = {
  title: 'Enrollment Contracts | SaKyi Admin',
  description:
    'Track enrollment contract lifecycle including assignment, signature status, and signed metadata.',
};

export default function EnrollmentContractsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Enrollment contracts'
        description='Review contract assignment and e-signature completion across enrollment requests.'
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

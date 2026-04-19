import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentContractListTable from '@/components/admin/modules/enrollment-contracts/EnrollmentContractListTable';

export const metadata: Metadata = {
  title: 'Contracts & E-Signatures | SaKyi Admin',
  description:
    'Browse and manage all enrollment contracts and e-signature requests. Track signature status, notifications, and match each contract to its related intake and enrollment request.',
};

export default function EnrollmentContractsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Contracts & E-Signatures'
        description='Browse and manage all enrollment contracts and e-signature requests. Track signature status, notifications, and match each contract to its related intake and enrollment request.'
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

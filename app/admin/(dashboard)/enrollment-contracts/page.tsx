import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentContractListTable from '@/components/admin/modules/enrollment-contracts/EnrollmentContractListTable';

export const metadata: Metadata = {
  title: 'Contracts & E-Signatures | SaKyi Admin',
  description:
    'Browse and manage enrollment contracts and e-signature requests, with visibility into signature progress, notification activity, and related intake or enrollment records.',
};

export default function EnrollmentContractsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Contracts & E-Signatures'
        description='Browse and manage enrollment contracts and e-signature requests, with visibility into signature progress, notification activity, and related intake or enrollment records.'
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

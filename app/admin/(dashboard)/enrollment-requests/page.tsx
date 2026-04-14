import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRequestListTable from '@/components/admin/modules/enrollment-requests/EnrollmentRequestListTable';

export const metadata: Metadata = {
  title: 'Enrollment Requests | SaKyi Admin',
  description: 'Admin queue for managing incoming client enrollment requests.',
};

export default function EnrollmentRequestsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Enrollment requests'
        description='Review incoming client program requests and update request status based on your follow-up action.'
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground text-sm'>Loading...</div>
        }
      >
        <EnrollmentRequestListTable />
      </Suspense>
    </div>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import EnrollmentRequestListTable from '@/components/admin/modules/enrollment-requests/EnrollmentRequestListTable';

export const metadata: Metadata = {
  title: 'Enrollment Requests | SaKyi Admin',
  description:
    'Triage inbound enrollment requests from clients: search and filter by status, open a request for full context, record first contact, and start intake when someone is ready to move into enrollment.',
};

export default function EnrollmentRequestsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Enrollment Requests'
        description='Triage inbound enrollment requests from clients: search and filter by status, open a request for full context, record first contact, and start intake when someone is ready to move into enrollment.'
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
